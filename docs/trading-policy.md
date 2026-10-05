> ## Documentation Index
> Fetch the complete documentation index at: https://docs.myfundedperpetuals.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Account trading policy

> Inspect effective rules, restrictions, and account locks before submitting API orders.

## Inspect policy before trading

Call `GET /v1/accounts/{account_id}/trading-policy` using a read or trade credential.
Only owned, non-archived accounts in the credential's live or sandbox environment
and account allowlist are visible. Other account IDs return `404`.

The response's `data` contains a timestamped, advisory snapshot:

| Field | Meaning |
| - | - |
| `manual_trading_blocked` | The account is inactive, a payout is pending, or copying locks manual instructions, including reductions. |
| `opening_exposure_restricted` | An account-wide condition prevents opening or increasing exposure. A false value does not guarantee an order will pass. |
| `restriction` | The user's reduce-only restriction, public reason, and flag time, or null. |
| `trading_halt` | Platform-wide opening halt and halted market categories. Category halts must be checked against the chosen market. |
| `competition` | Competition window or elimination restriction and symbol/coin allowlist, or null. An empty allowlist allows all markets. |
| `copy_scope_blocked` | An enabled group led by this account has a member outside the credential's ownership, live/sandbox, archive, or account-allowlist boundary. |
| `copy_follower_locked` | An enabled copy group or outstanding lead-stop cleanup locks manual trading. |
| `copy_stop` | Stop reason and stop, cleanup-completion, and acknowledgment timestamps. Unset timestamps are null. |
| `account_rules` | Effective rule IDs and parameters, resolved from defaults, global policy, current plan and evaluation step, and supported account overrides. |
| `limits` | Current platform configuration, including cooldown, trade windows, position and resting-order limits, minimum notional and risk parameters. `execution_delay_min_ms` and `execution_delay_max_ms` are always `0`. |
| `unlimited_trade_count_threshold` | Trade-window values at or above this threshold disable that count window; they are not a remaining allowance. |
| `slippage_tolerance_bps` | Minimum and maximum accepted slippage tolerance. |
| `maximum_total_notional_usd` | Configured total exposure ceiling for the account model and size, or null when absent. |
| `fee_exempt` | Whether this account has the platform's fee exemption. |

The `limits` object uses snake\_case keys such as `max_open_positions`,
`max_position_value_usd`, `max_resting_orders`, `min_order_notional_usd`,
`order_cooldown_ms`, and `trades_per_minute`.

Trade windows count every order that fills or triggers. A reduce-only order,
such as a take profit or stop loss, is never rejected by a full trade window
when it triggers, so your exits still execute; it still counts toward the
window for your next orders.

Current plan rules replace retired account snapshots for daily loss, drawdown,
consistency, and profit target. Minimum-trading-day account overrides are retired.
Use returned values instead of copying plan numbers into your integration.
A zero percentage disables that rule. The `evaluation-inactivity` (30 days)
and `funded-inactivity` (7 days) windows are universal product rules pinned in
code; they are reported for every account except rule-less competition
products and cannot be changed by plan or account.

## Market exposure caps

Competition accounts use a separate per-user allowance from other accounts.
Matching competition accounts share their own cap for each market, product,
and size. Both allowances use the configured cap independently, and competition
orders remain subject to exposure rejection. This applies equally to API and
website orders.

A market's exposure cap limits combined open notional (long plus short) across
accounts of the same challenge model and account size. The server includes
existing exposure and rejects a fill that would exceed the configured cap.
Closing or reducing positions remains allowed.

An existing position keeps its enrolled exposure group through additions,
reductions, and reversals, even if challenge offerings change. A new position
after fully closing uses the current product grouping. This applies equally to
API and website orders; see [Asset Exposure Limits](/guides/asset-exposure-limits).

Exposure-cap enforcement defaults to enabled for newly added markets. A
numerical cap must still be configured; enabling the switch alone does not set
a dollar limit. Check the [current market caps](https://myfundedperpetuals.com/exposure-caps)
for the applicable limits.

## Treat preflight as advisory

Fetch policy when selecting an account and refresh after a relevant rejection or
configuration change. Do not poll this endpoint once per second: it consumes the
shared [REST read budget](/errors-and-rate-limits).

A true `copy_scope_blocked` means the credential cannot cover the configured
copy group as a whole. Use a credential authorized for every member in the same
environment, or change the group through the website. A false value does not
cover stale working copied orders left by earlier configurations: modification
and cancellation check those affected accounts again at execution.

The snapshot does not reserve margin, position slots, order slots, trade-window
allowances, or market liquidity. It does not evaluate a proposed order or fetch
fresh prices. Check market metadata and an appropriate quote for market-specific
constraints. Placement and settlement remain authoritative for current balances,
rate-window usage, cooldown, market hours, competition markets, and all other
order-dependent rules. Account evaluation rules can also depend on stage and
fresh equity. The saved slippage-protection maximum is enforced server-side and included here.
Other saved interface preferences, such as display defaults, are not an order policy.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.