> ## Documentation Index
> Fetch the complete documentation index at: https://docs.myfundedperpetuals.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Asset Exposure Limits

> Find current market leverage and exposure caps, and understand how per-user open notional limits affect your orders.

## Find Current Market Limits

Open [Market Exposure Caps](https://myfundedperpetuals.com/exposure-caps)
for the current list of tradable markets, their categories, maximum leverage,
and exposure caps. Search by market name or symbol to find an asset.

The table uses the platform's market configuration. Check that page for
current values when planning a trade; this guide explains the rules without
copying limits that can change.

## How Exposure Is Calculated

A market exposure cap limits the combined open notional across your own
accounts of the same challenge product and account size trading that market.
Your matching accounts share one allowance. Other users have separate
allowances, even when their accounts have the same product and size.

Competition accounts have a separate allowance from your other accounts.
Your competition accounts with the same product and size share that competition
allowance for each market. Each allowance uses the configured cap for that
product, size, and market: competition exposure does not reduce the capacity
available to your purchased accounts, and purchased-account exposure does not
reduce competition capacity. Competition orders are still rejected if they
would exceed their own allowance.

Exposure uses the full position value, not just the margin used. Long and
short exposure add together rather than offsetting each other. For example,
\$100,000 of long exposure and \$50,000 of short exposure contribute \$150,000
toward your combined cap. These amounts illustrate the calculation, not a
market's configured limit.

An order that would increase combined exposure beyond the applicable cap is
rejected without resizing. The exposure cap does not block reducing or closing
a position and does not force positions to close. Capacity freed by a reduction
becomes available at the next exposure refresh, approximately 10 seconds later.
Exposure is valued at the incoming fill’s execution price.

The separate hourly opening-notional budget for each account and market remains
unchanged.

On the order ticket, the percentage size slider tops out at the smaller of the
size your available margin supports and your remaining exposure capacity for
that market. The estimate uses the current order price; the engine checks the
actual fill.

A position keeps the same exposure group while it remains open,
including when you add, reduce, or reverse its size. Retiring a challenge
product does not move existing exposure into another group. After you fully
close the position, a new position uses the current product grouping.

## Read the Cap Table

* **Max Leverage** is the market's maximum leverage. Your account's rules can
  impose a lower limit.
* **Exposure Cap** is the configured per-user notional ceiling, not the
  remaining capacity available for your next order.
* A range with an asterisk means the cap varies by challenge product and
  account size. The range shows the smallest and largest configured caps;
  each value applies separately to each user’s matching accounts.
* **No Cap** means market exposure enforcement is disabled. Available margin,
  account rules, and other order checks still apply.

For your account's configured **Maximum Position Size**, sign in, select an
account, and hover over the market's leverage badge. Read the
[Trading Guide](/guides/trading-guide#size-the-order) for how that ceiling
differs from your remaining buying power.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.