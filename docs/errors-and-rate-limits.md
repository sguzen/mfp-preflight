> ## Documentation Index
> Fetch the complete documentation index at: https://docs.myfundedperpetuals.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Errors and Rate Limits

> Handle API errors, trading rejections, and request budgets.

Errors use a stable envelope:

```json theme={null}
{
  "error": {
    "code": "rate_limited",
    "message": "Rate limit exceeded. Try again in 4 seconds.",
    "request_id": "b4ad5d8b-6e2c-4e44-915f-ff81956849e8"
  }
}
```

Keep `request_id` when contacting support; every response also carries the
same value in an `X-Request-Id` header. Trading-rule rejections may also
include `order_id`, `client_order_id`, `rule_id`, and structured `details`.

Validation failures (`400`) can include per-field `details`. Each entry names
the wire field that failed, using `body` for problems with the payload as a
whole. Other request errors may report only a code and message:

```json theme={null}
{
  "error": {
    "code": "invalid_order",
    "message": "One or more request fields are invalid.",
    "request_id": "b4ad5d8b-6e2c-4e44-915f-ff81956849e8",
    "details": [
      { "field": "size", "issue": "must be a number greater than zero" },
      { "field": "levrage", "issue": "is not a recognized field" }
    ]
  }
}
```

| Status | Meaning |
| - | - |
| `400` | The request shape, identifier, cursor, or idempotency key is invalid. |
| `401` | The API key is missing, invalid, revoked, or presented on the wrong host. |
| `403` | The key's access level does not allow this, or sandbox access has lapsed. |
| `404` | The requested account, market, order, or endpoint is unavailable to this key. |
| `405` | The endpoint does not support the requested HTTP method. |
| `409` | An idempotency key or client order ID conflicts, or a mutable snapshot is stale. |
| `413` | The JSON body exceeds 16 KiB. |
| `414` | The request URL is too long. |
| `415` | An order request is not sent as `application/json`. |
| `422` | The paper-trading engine rejected the order under a trading rule. |
| `429` | A rate budget is exhausted. Respect `Retry-After`. |
| `500` | An unexpected server failure. Retry, and report the `request_id` if it persists. |
| `503` | The API service or a fresh execution quote is temporarily unavailable. |

Two environment-specific responses are worth handling explicitly. A `401` with
a message naming the other host means the key and hostname belong to different
environments; see [Sandbox and test keys](/sandbox). A `403` with the error
code `sandbox_access_expired` means the account's sandbox window lapsed; a new
challenge purchase restores it.

## Trader Lockout

A voluntary [Trader Lockout](/settings/trading#trader-lockout) applies to API
keys, bots, and copied trades as well as the trading terminal. Order attempts
on a locked account return `422` with code `account_trader_lockout_active` and
`details.expiresAt`, the unlock time as Unix milliseconds. Stop submitting
orders until that time; neither the API nor Support can remove the lock early.

Activation preserves existing positions, working orders, and accepted schedules.
Their execution, including stop-loss and take-profit exits, continues normally.
The lock rejects new orders, modifications, cancellations, and manually submitted
close orders until expiry. Positions remain exposed to losses and normal
liquidation rules. Trading becomes available automatically at expiry.

## Request budgets

Each API host allows about 300 requests per minute from one source IP address.
The live and sandbox hosts count separately, and each Cloudflare location
counts on its own, so treat the figure as approximate. A request over the limit
returns `429` with a `Retry-After` header before it reaches the API. If the
limit cannot be checked, the request is refused with `503` and a `Retry-After`
header rather than let through; retry it after the delay.

The limit is per address, not per API key. Several keys or bots sharing one
address share its allowance. Do not build a continuous terminal by polling
account, position, order, and quote endpoints every second. See
[API capabilities](/api-capabilities) and the endpoint reference when choosing
how to reconcile state.

Orders also pass your account's trading rules, which may limit how many trades
you can place per minute, hour, or day. A rejected order returns `422` with the
rule that applied. A reduce-only order, such as a take profit or stop loss, is
never rejected by these limits when it triggers, but it still counts toward
them.

Account-wide cancel and close operations also share separate global budgets:

* Empty operation snapshots: 60/minute, burst 12.
* Planned work: 600 units/minute, burst 600. Each cancellation target reserves
  one unit; each close target reserves two.
* Advancing work: 600 units/minute, burst 50. A cancel slice consumes one unit
  per target (up to five); a close slice consumes two units.

Completed bulk-operation replays skip those bulk budgets but still count
toward the per-address request limit. A capacity rejection returns `429`; wait for
`Retry-After` and resume with the same idempotency key.

Use exponential backoff with jitter for `429`, `500`, and `503`. Reuse the same
idempotency key when retrying a create or close request after an ambiguous
network or server failure.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.