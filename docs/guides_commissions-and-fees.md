> ## Documentation Index
> Fetch the complete documentation index at: https://docs.myfundedperpetuals.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Commissions and Fees

> Check trading commissions by asset class, calculate entry and exit costs, and understand hourly swap fees.

## What are commissions?

Commissions are the execution fees charged when an order fills. You pay a fee
when opening or increasing a position and another fee when reducing or closing
it. The fee is charged on the amount that fills.

The fee is calculated from **fill notional**, which is the filled asset quantity
multiplied by its execution price. It is based on the full value traded, not
just the margin used to support the position.

## Commission rates

Maker and taker fills use the same rate within each asset class. The market's
asset category determines the rate, regardless of its source venue.

| Asset class | Commission per fill | Fee on a \$10,000 fill |
| - | - | - |
| Crypto | 0.03% | \$3.00 |
| Forex | 0.0025% | \$0.25 |
| Stocks, commodities, and indices | 0.005% | \$0.50 |

A maker fill comes from a passive limit order. A taker fill executes against
the opposing side of the market, such as a market order or a limit order that
crosses the spread. Choosing a limit order does not reduce the commission rate.

## Calculate entry and exit costs

**Commission = fill notional × commission percentage ÷ 100.**

For example, opening a crypto position with \$10,000 of fill notional costs
\$3.00 in commission. Closing it with \$10,000 of fill notional costs another
\$3.00, for **\$6.00 total commission**.

At the same \$10,000 entry and exit notionals, the total is \$0.50 for forex or
\$1.00 for stocks, commodities, and indices. If the exit price or quantity
differs, calculate the exit fee from that exit's actual notional.

Changing leverage does not change the commission on an otherwise identical
fill. Increasing the position's notional increases the fee. Commissions reduce
your account balance and therefore the headroom available under your loss rules.

## Hourly swap fees

Swap fees are holding costs in addition to execution commissions. An open
position pays its asset class's daily rate divided into 24 equal hourly
amounts. Both long and short positions pay this charge.

| Asset class | Daily swap rate | Charge frequency |
| - | - | - |
| Crypto | 0.03% | Every hour |
| Forex | 0.005% | Every hour |
| Stocks, commodities, and indices | 0.015% | Every hour |

Each hourly charge uses the position size held at the hourly boundary and the
applicable mark price. Later size changes do not change that charge, and a
position pays at most one swap fee for the same hourly boundary.
For example, a crypto position worth \$10,000 at an hourly charge incurs \$0.125
(\$10,000 × 0.03% ÷ 24). If that notional remains unchanged for 24 charges, the
total swap fee is \$3.00.

A position closed before the next hourly charge does not pay that charge.
Closing after the boundary still pays the charge for the size held at that
boundary. When the charge is ready, it is applied before your order settles
without waiting for the scheduled hourly processing window. If the charge data
is still incomplete, the order remains pending until it can be settled safely.
During a scheduled TradFi market closure, the latest valid closing mark values
the hourly charge. Crypto uses a fresh mark because it trades continuously.

Venue funding rates do not change your balance or replace the fixed swap fee.

## Other trading costs and rules

The examples above cover commissions and swap fees. Execution prices can also
be affected by the spread and slippage. Read the
[Trading Guide](/guides/trading-guide) for order execution and slippage details,
and [Breaches and Next Steps](/guides/challenge-lifecycle/breaches-and-next-steps)
for liquidation and close-out consequences.

Read [Challenges and Rules](/guides/challenges-and-rules#daily-loss-reset-time)
for the daily loss reset time, or [Payouts](/guides/challenge-lifecycle/payouts)
for payout windows and the store-credit option.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.