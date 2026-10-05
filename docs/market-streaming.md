> ## Documentation Index
> Fetch the complete documentation index at: https://docs.myfundedperpetuals.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Market data streaming

> Subscribe to live prices, order books, trades, and candles over the public WebSocket API.

## Connect

Open `wss://api-stream.myfundedperpetuals.com/v1/market-data`. Market data is
public: no API key, cookie, or authentication frame is required. Use this dedicated endpoint for developer integrations. Never send your trading API key to this
socket. Live and sandbox trading use the same market feed.

Send one JSON object per WebSocket text frame. Compression is optional.
Multiplex your subscriptions on one connection. This stream carries market
observations; submit orders through the [REST API](/api-reference).
Market prices do not guarantee the price or size of a simulated fill.

```javascript theme={null}
const socket = new WebSocket(
  "wss://api-stream.myfundedperpetuals.com/v1/market-data",
);
const subscriptions = new Map();
socket.onopen = () =>
  socket.send(
    JSON.stringify({
      op: "sub",
      id: 1,
      channel: "ticks",
      payload: { symbols: ["BTCUSDT"], providers: ["binance"] },
    }),
  );
socket.onmessage = ({ data }) => {
  const frame = JSON.parse(data);
  if (frame.op === "sub_ok") subscriptions.set(frame.sub, frame.id);
  if (frame.op === "events") {
    for (const event of frame.events)
      console.log(subscriptions.get(frame.sub), event);
  }
  if (frame.op === "sub_err" || frame.op === "err") console.error(frame.error);
};
// Stop subscription 1 when finished:
// socket.send(JSON.stringify({ op: "unsub", id: 1 }));
// Close the socket when no longer needed:
// socket.close();
```

This minimal example shows framing. Add the reconnection and recovery handling
below before using it in a long-running client.

## SDK price streams

All six MyFundedPerps SDKs provide a `PriceStream` client for the `ticks`
channel. The TypeScript SDK is available on npm; the other SDKs are maintained
in the project repository. Python streaming uses the optional
`streaming` extra; PHP requires Composer dependencies. TypeScript uses native
WebSocket support in browsers, Bun, or Node 22+.

Each session subscribes to 1–32 exact symbols on one connection. Prices remain
decimal strings. Specify providers to avoid mixing prices from different venues.
No API key is accepted or sent by these streaming clients.

<Tabs>
  <Tab title="TypeScript">
    ```sh theme={null}
    npm install @myfundedperps/sdk
    ```

    ```ts theme={null}
    import { PriceStream } from "@myfundedperps/sdk";

    const stream = new PriceStream({
      symbols: ["BTCUSDT", "ETHUSDT"],
      providers: ["binance"],
    });
    try {
      for await (const event of stream) {
        if (event.type === "tick") {
          console.log(event.symbol, event.kind, event.price);
        }
      }
    } finally {
      stream.close();
    }
    ```
  </Tab>

  <Tab title="Python">
    ```python theme={null}
    from myfundedperps import PriceStream

    with PriceStream(["BTCUSDT", "ETHUSDT"], providers=["binance"]) as stream:
        for event in stream:
            if event["type"] == "tick":
                print(event["symbol"], event["kind"], event["price"])
    ```
  </Tab>

  <Tab title="Go">
    ```go theme={null}
    import (
        "context"
        "fmt"

        "github.com/MyFundedPerps/myfundedperps/sdk/go"
    )

    func readPrices(ctx context.Context) error {
        stream, err := myfundedperps.DialPriceStream(ctx, myfundedperps.PriceStreamConfig{
            Symbols:   []string{"BTCUSDT", "ETHUSDT"},
            Providers: []string{"binance"},
        })
        if err != nil {
            return err
        }
        defer stream.Close()
        for {
            event, err := stream.Next()
            if err != nil {
                return err
            }
            if event.Tick != nil {
                fmt.Println(event.Tick.Symbol, event.Tick.Kind, event.Tick.Price)
            }
        }
    }
    ```
  </Tab>

  <Tab title="Rust">
    ```rust theme={null}
    use myfundedperps::{PriceStream, PriceStreamError, PriceStreamEvent};

    fn main() -> Result<(), PriceStreamError> {
        let stream = PriceStream::connect(
            &["BTCUSDT", "ETHUSDT"], Some(&["binance"]),
        )?;
        for event in stream {
            if let PriceStreamEvent::Tick(tick) = event? {
                println!("{} {:?} {}", tick.symbol, tick.kind, tick.price);
            }
        }
        Ok(())
    } // Dropping the stream closes the connection.
    ```
  </Tab>

  <Tab title="Java">
    ```java theme={null}
    import com.myfundedperps.sdk.PriceStream;
    import com.myfundedperps.sdk.PriceStreamEvent;
    import java.util.List;

    try (PriceStream stream = PriceStream.connect(
        List.of("BTCUSDT", "ETHUSDT"), List.of("binance"))) {
      PriceStreamEvent event;
      while ((event = stream.next()) != null) {
        if (event.tick != null) {
          System.out.println(event.tick.symbol + " " + event.tick.kind + " " + event.tick.price);
        }
      }
    }
    ```
  </Tab>

  <Tab title="PHP">
    ```php theme={null}
    require 'vendor/autoload.php';

    use MyFundedPerps\Sdk\PriceStream;

    $stream = new PriceStream(['BTCUSDT', 'ETHUSDT'], ['binance']);
    try {
        foreach ($stream as $event) {
            if ($event->tick !== null) {
                echo $event->tick->symbol . ' ' . $event->tick->kind . ' ' . $event->tick->price . PHP_EOL;
            }
        }
    } finally {
        $stream->close();
    }
    ```
  </Tab>
</Tabs>

The examples print ticks. Applications should also handle lifecycle notices:

| Notice | Meaning |
| - | - |
| `subscribed` | The server accepted the filter. `snapshotBoundary` says whether to expect a snapshot boundary. |
| `snapshot_end` | The initial retained snapshot is complete. |
| `draining` | Establish a replacement session and wait for its snapshot, then close the old session. The old session remains readable. |

Rust names these variants `Subscribed`, `SnapshotEnd`, and `Draining`.
Snapshot events can repeat observations; do not assume exactly-once delivery.
`mark`, `mid`, and `last` ticks are distinct price observations.

The SDKs expose session failures rather than reconnecting automatically.
Transport failures and server-end frames produce a stream error with
`retryable = true`. Use a bounded retry policy with exponential backoff and
jitter. Subscription rejections preserve the server's error details and are
not marked retryable. Fix rejected filters before retrying. Continue to check
tick timestamps for market freshness even while the socket is connected.

Keep one reader per session. Always close the stream when finished.
TypeScript accepts an `AbortSignal`; Go follows the dial context; Python and
Java allow another thread to close a blocked reader; Rust provides a
`close_handle()`; PHP accepts an `Amp\Cancellation`.

Receive buffering is bounded. Pull transports apply backpressure; TypeScript
and Java fail with `slow_consumer` if more than 16 complete messages await the
reader. Messages over 1 MiB fail the session. No client silently truncates a
batch or rounds a decimal price. Other market channels remain available
through the wire protocol below; the SDK wrapper currently covers price ticks.

## Market identity and filters

Use the exact `coin` and `provider` returned for your selected market by
`GET /v1/markets` or `GET /v1/markets/{market_id}` in the [REST API](/api-reference).
Pass `coin` in the subscription's `symbols` array. REST's `symbol` is a display
label: for Binance BTC, `symbol` is `BTC` and `coin` is `BTCUSDT`, so subscribe
to `symbols: ["BTCUSDT"]` with `providers: ["binance"]`. Provider values
are `hyperliquid`, `binance`, `bybit`, `lighter`, `fpx`, and `synthetic`.
FX uses `hyperliquid` for both EUR/USD and USD/JPY (`xyz:EUR` and
`xyz:JPY`). The historical `fpx` and `lighter` identities are retired and no
longer publish market data.

Every market subscription requires `symbols` with 1 to 32 exact symbols.
`providers` is optional, but specify it to avoid mixing venue prices.
Omitting it uses the compatibility provider set, so explicitly name new
providers. `status` accepts only `providers` and needs no symbols.

| Channel | Payload fields | Event type |
| - | - | - |
| `ticks` | `symbols`, optional `providers` | `tick` |
| `books` | `symbols`, optional `providers` | `book` |
| `trades` | `symbols`, optional `providers` | `trade` |
| `candles` | `symbols`, optional `providers`, `intervals`, `historyLimit` | `candle` |
| `marketStats` | `symbols`, optional `providers` | `marketStats` |
| `status` | Optional `providers` | `providerStatus` |

For candles, request explicit intervals such as `intervals: ["1m"]`.
Accepted interval names are `1s`, `1m`, `3m`, `5m`, `15m`, `30m`, `1h`,
`2h`, `4h`, `8h`, `12h`, `1d`, `3d`, `1w`, and `1M`. Availability depends
on the provider. `historyLimit: 0` skips retained candle replay; a positive
value limits it. Omitting it replays the retained backlog. Use
`candles.history` for a specific historical window.

## Frames and subscription lifecycle

Allocate positive integer IDs, unique among active requests and subscriptions
on a connection. Keep them within JavaScript's safe integer range. Do not
reuse an ID until its prior operation finishes. Treat the server's `sub`
string as opaque: equivalent filters share it, and event frames use it instead
of your request ID.

| Server frame | Meaning |
| - | - |
| `{"op":"sub_ok","id":1,"sub":"...","snapshotBoundary":true}` | Subscription accepted; record the ID-to-`sub` mapping. |
| `{"op":"events","sub":"...","events":[...]}` | Retained snapshot events followed by live events, possibly batched. |
| `{"op":"snapshot_end","id":1}` | Initial replay finished when `snapshotBoundary` was advertised. It does not mean history is complete. |
| `{"op":"sub_err","id":1,"error":{...}}` | Subscription rejected. Surface its `reason`; fix invalid filters or reduce subscriptions before retrying. |
| `{"op":"end","id":1}` | Server ended the subscription. Re-establish it if still needed. |
| `{"op":"draining"}` | Server is replacing this connection; establish a replacement and resubscribe. |
| `{"op":"res","id":2,"result":...}` | One-shot request completed. |
| `{"op":"err","id":2,"error":{...}}` | One-shot request failed. |

Send `{"op":"unsub","id":1}` to cancel a subscription or in-flight
request. Cancellation is idempotent. Ignore unknown server operations for
forward compatibility.

## Event fields

Prices and quantities in ticks, trades, candles, and books are decimal
**strings**. Use decimal arithmetic when calculating with them. Market
statistics use JSON numbers or null. Numeric `time`, `openTime`, and
`closeTime` fields are Unix milliseconds; `receivedAt` is a timestamp string.

| Event | Fields |
| - | - |
| `tick` | `provider`, `symbol`, `kind` (`mark`, `mid`, or `last`), `price`, `time`, `receivedAt` |
| `book` | `provider`, `symbol`, `time`, `bids`, `asks`, `receivedAt`; each level has `px`, `sz`, and nullable order count `n` |
| `trade` | `provider`, `symbol`, `tradeId`, `side` (`buy` or `sell`, the aggressor), `price`, `size`, `time`, `receivedAt` |
| `candle` | `provider`, `symbol`, `interval`, `openTime`, `closeTime`, `open`, `high`, `low`, `close`, `volume`, nullable `quoteVolume` and `trades`, `isFinal`, `receivedAt` |
| `marketStats` | `provider`, `symbol`, `time`, `receivedAt`, plus optional statistics described below |
| `providerStatus` | `provider`, `state` (`idle`, `connecting`, `connected`, `closed`, or `error`), nullable `reason`, `receivedAt` |

Books are complete snapshots, with bids descending and asks ascending. Replace
your previous book; do not apply them as deltas. Candles replace the existing
bar identified by provider, symbol, interval, and `openTime`. Trade IDs are
unique within a provider and symbol; deduplicate retained replay accordingly.
Tick kinds represent different price observations, so do not overwrite a mark
with a midpoint without an explicit pricing policy.

Market statistics are patches. Omitted fields preserve the previous value;
null explicitly clears it. Fields include `markPx`, `change24hPct`,
`fundingHourly`, `fundingRate`, `fundingIntervalHours`, `nextFundingTime`,
`openInterestUsd`, and `dayNtlVlm`. Optional `fundingSnapshot` contains an atomic
funding observation: decimal strings `fundingRate` and `fundingPrice`, numeric
`fundingIntervalHours`, `nextFundingTime`, and `observedAt`, and
`fundingPriceKind` (`mark` or `oracle`). It may also be null.

## Historical candles and heartbeat

```json theme={null}
{
  "op": "req",
  "id": 2,
  "method": "candles.history",
  "payload": {
    "provider": "binance",
    "symbol": "BTCUSDT",
    "interval": "1m",
    "limit": 100
  }
}
```

`result` is an array of candle events. Optional `startTime` and `endTime`
select a millisecond window; `priceKind` is `trade` (default) or `mark`.
History is bounded by provider availability and retention; an empty or short
result is possible. A `HistoryFetchFailed` error includes `provider` and
`message`; `source: "transport"` can be retried with backoff. Provider failures
may require a different window or interval.

Send `{"op":"req","id":3,"method":"ping"}` for an application heartbeat.
The response result is the stream server's current Unix time in milliseconds.
Measure round-trip latency using your own monotonic clock. Servers also send
WebSocket protocol pings every 30 seconds; your WebSocket library must process
and answer these. Connections with no inbound frames or pongs for 75 seconds
are closed. Browser WebSocket implementations answer protocol pings for you.

`status.get` is also available as a one-shot request with no payload. Prefer
a `status` subscription for continuous monitoring instead of polling it.

## Recovery and limits

There is no durable replay cursor or exactly-once guarantee. On disconnect,
clear connection-local IDs and mappings, reconnect with exponential backoff
and jitter, and re-establish subscriptions. Restore books and prices from the
new snapshot, backfill missing candles with `candles.history`, and reconcile
account trading state through the trading API. A market trade tape cannot be
used as your account fill ledger. A slow client can lose superseded state or
be disconnected; always monitor freshness.

On `draining`, connect a replacement, subscribe, wait for its initial snapshot
boundaries, and then close the old socket. Deduplicate overlapping events.
If the replacement fails, keep reading the old socket until it ends and retry
with backoff. Avoid unlimited reconnect loops on permanent filter errors.

| Bound | Behavior when exceeded |
| - | - |
| 256 active subscriptions per connection | New subscription rejected. |
| 32 symbols and 6 providers per subscription | Invalid filter rejected. |
| 64 distinct provider/symbol leases across candle, book, and trade subscriptions per connection | New subscription rejected. |
| 16 concurrent requests, including at most 4 history requests per connection | Excess request returns an error; heartbeat pings are excluded. |
| 512 active connections per source address | Upgrade rejected with HTTP 429. |
| 2,048 connection admissions per minute per source, with a 2,048 burst | Excess upgrades return HTTP 429. |
| Shared process connection, memory, and upstream budgets | Upgrade may return HTTP 503 or subscription/request may be rejected. Retry transient capacity failures with backoff. |

These budgets belong to the developer stream and are separate from the website feed.
The service also limits simultaneous history work and one-shot status requests;
prefer a `status` subscription and back off when capacity is exhausted. Keep one multiplexed socket per
client, unsubscribe unused views, cache closed candles, and avoid polling REST
quotes for every price update. Market streaming adds no REST quota usage.

Account balances, positions, orders, and fills are available through REST.
Private account streaming is not available.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.