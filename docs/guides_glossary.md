> ## Documentation Index
> Fetch the complete documentation index at: https://docs.myfundedperpetuals.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Glossary

> Definitions for perpetual futures, challenge rules, trading controls, copy trading, and MyFundedPerps account states.

## Trading

**Asset unit**\
Quantity expressed in units of the market's underlying asset rather than USD.

**Cross margin**\
A margin mode where eligible account collateral supports cross-margin positions
together.

**Fill**\
The executed portion of an order. A fill has a quantity and execution price and
changes the simulated account position or realized result.

**Isolated margin**\
A margin mode where margin is managed for an individual position.

**Leverage**\
The ratio between position notional and assigned margin. More leverage magnifies
the effect of price movement relative to margin.

**Limit order**\
An order that rests at its limit price and fills its full size at that price once
the market reaches it. A limit placed at or through the current market fills
right away as a market order, never worse than its limit.

**Mark price**\
The platform's current reference price used for account valuation and relevant
risk checks. The book midpoint is a separate value: the average of the best
bid and best ask.

**Market order**\
An instruction that executes immediately at top-of-book with maximum adverse
slippage capped against the mark by a size-based tier. Book prices inside the
cap are preserved; the fill is never better than the mark.

**Notional value**\
The position or order quantity multiplied by price, before leverage converts it
to a margin requirement.

**Perpetual future**\
A derivatives contract without a fixed expiry date. MyFundedPerps simulates
trading these markets; it does not place exchange orders for the trader.

**Slippage**\
The difference between a reference or expected price and the final average
execution price.

**Stop Loss / Take Profit (SL / TP)**\
Exit instructions triggered when a configured price condition is reached.

## Challenges and accounts

**Challenge account**\
A simulated account governed by a purchased or granted challenge plan.

**Consistency rule**\
A plan-specific limit on how concentrated qualifying profit may be in a small
number of days or results.

**Equity**\
Account value including the effect of open positions at current marks.

**Evaluation**\
The stage in which a trader works toward the plan's target while respecting its
rules.

**Funded account**\
The post-evaluation simulated account issued after the required review,
identity, and agreement flow.

**Maximum daily loss**\
A plan rule limiting account loss relative to its daily reference.

**Maximum drawdown**\
The largest permitted decline under the account's configured static or trailing
policy.

**Profit target**\
The gain required to pass an evaluation step.

**Trailing end-of-day drawdown**\
A drawdown policy whose reference can move upward after a higher end-of-day
equity mark and does not move back down.

## Copy trading and billing

**Follower**\
An account that receives eligible orders from a copy-trading lead and applies
its own independent risk checks.

**Lead**\
The account whose eligible trading instructions drive a copy-trading group.

**Multiplier**\
A follower-specific adjustment applied after copy size is normalized for the
lead and follower starting balances.

**Profit split**\
The purchased plan percentage used to divide eligible funded-account profit
under the applicable payout terms.

**Purchase status**\
The current state of a challenge order: paid, pending, failed, or refunded.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.