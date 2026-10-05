> ## Documentation Index
> Fetch the complete documentation index at: https://docs.myfundedperpetuals.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API capabilities

> Compare the public REST API and MCP tools with the trading website.

<Warning>
  The developer API is in beta. Breaking changes may be introduced at any time.
</Warning>

## Trading coverage

The public API can place and manage trades on existing challenge accounts.
It uses the website's paper execution engine and server-side trading rules.
It does not expose every website feature.

| Capability | Public API support |
| - | - |
| Account selection | List non-archived accounts accessible to the credential and read an account's risk snapshot. |
| Market discovery | List execution markets, inspect a market's availability, and request a current quote with an optional size estimate. |
| Standard orders | Market, limit, chase, stop-market, stop-limit, take-market, take-limit, take-profit, and external conditional orders. |
| Limit instructions | IOC, FOK, and GTD; omit time in force for GTC. |
| Entry protection | Attached TP/SL on market and non-reduce-only limit entries. |
| Order lifecycle | Read working orders and paginated history; modify supported working orders, cancel, and update attached exits. |
| Position lifecycle | Read open and closed positions; close fully or partially using market, limit, or external conditional orders. |
| Protective exits | Batch TP/SL placement, modification, cancellation, and OCO pairing, including price-capped exits. |
| Margin | Supply leverage and margin mode when placing orders; add or remove extra isolated margin by setting its target total. |
| Execution strategies | Create, inspect, and cancel TWAP, VWAP, and scaled ladders. Use the documented status filters when listing strategy parents. |
| Account-wide actions | Resumable cancel-all ordinary orders and close-all positions. Strategy parents require separate cancellation. |
| Reconciliation | Order IDs, caller-assigned IDs for ordinary and close orders, paginated fills, and partial-fill lineage. |

See [Trading with the API](/trading-with-api) for behavior and examples and the
[REST reference](/api-reference) for request and response fields.

## Features that require the website

The public REST contract has no endpoints for these website capabilities:

* Signup and onboarding, challenge purchases, identity verification, agreements,
  payout requests, and billing or purchase-history management.
* API-key creation and management or sandbox-account creation and reset.
* Saved trading preferences, watchlists, and notifications.
* Journal notes and tags, performance dashboards, and account equity-history charts.

Existing copy-trading configurations still apply when an API request trades a
lead account. Configure and inspect those groups on the website before running
an automated strategy. Followers remain subject to the same manual-trading
restrictions as in the terminal.

Browser-internal connections are not an API-key subscription contract.
REST reads return snapshots; use bounded reconciliation and respect the
[shared request budgets](/errors-and-rate-limits#request-budgets).

## MCP, CLI, and SDK coverage

The REST methods in the [MCP server](/mcp-server), [CLI](/cli), and SDKs are
derived from the REST specification. They do not add website capabilities
missing from REST. The SDKs also provide [price streaming](/market-streaming#sdk-price-streams)
through the dedicated public market WebSocket feed.
MCP exposes the REST read and trading operations as tools. The REST
specification also contains two CLI authentication endpoints that MCP does not
expose as tools. Consult the endpoint reference for the currently available
fields and filters.

Live MCP access uses browser OAuth. Direct REST calls use an API key, while
CLI login can create a browser-approved session. Sandbox MCP calls accept a
test API key. See [Authentication](/authentication) and [Sandbox](/sandbox).

### MyFundedPerps SDK names

The SDKs use the MyFundedPerps brand across package names and imports:

| Language | Package or module | Client |
| - | - | - |
| TypeScript | `@myfundedperps/sdk` | `MyFundedPerps` |
| Python | `myfundedperps` | `MyFundedPerps` |
| Go | `github.com/MyFundedPerps/myfundedperps/sdk/go` | `myfundedperps.NewClient` |
| Rust | `myfundedperps` | `myfundedperps::Client` |
| Java | `com.myfundedperps:sdk` | `com.myfundedperps.sdk.MyFundedPerps` |
| PHP | `myfundedperps/sdk` | `MyFundedPerps\Sdk\MyFundedPerps` |

Install the [TypeScript SDK from npm](https://www.npmjs.com/package/@myfundedperps/sdk):

```sh theme={null}
npm install @myfundedperps/sdk
```

The package includes ESM JavaScript and TypeScript declarations for Node.js 22+,
Bun, and modern browsers. Import `MyFundedPerps` for REST requests or
`PriceStream` for public price ticks. See [SDK price streams](/market-streaming#sdk-price-streams)
for a streaming example. The other SDKs are maintained in the project repository.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.