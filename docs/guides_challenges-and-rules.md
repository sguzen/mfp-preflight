> ## Documentation Index
> Fetch the complete documentation index at: https://docs.myfundedperpetuals.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Challenges and Rules

> Understand evaluation stages, profit targets, loss and drawdown rules, account states, funded progression, and payout-specific requirements.

Every sold challenge is a 1-Step evaluation. Select, Prime, and Signature use
one profit target, a 3% daily loss limit, and static maximum drawdown. There is
no minimum trading-day count or evaluation time limit. All percentages use
starting balance, never current equity.

## Evaluation rules

| Plan | Profit target | Daily loss limit | Static maximum drawdown |
| - | - | - | - |
| 1-Step Select | 9% | 3% | 3% |
| 1-Step Prime | 12% | 3% | 5% |
| 1-Step Signature | 10% | 3% | 6% |

The profit target and loss rules use account equity, including
open-position profit or loss. Daily loss is measured from start-of-day equity
at midnight America/New\_York, including daylight saving time, with a dollar
allowance of 3% of starting balance.

### Select prize accounts

\$1K and \$2.5K Select accounts are prizes from giveaways and promotions. They
cannot be bought. They follow the 1-Step Select rules above. On a \$2.5K
account, for example, the profit target is \$2,725 and the drawdown floor is
\$2,425. Funded payouts on these accounts use a 90/10 split and are paid
entirely as store credit. See
[Payouts](/guides/challenge-lifecycle/payouts#minimum-and-profit-split) for
their minimum request.

## Daily loss reset time

The daily loss limit resets at **12:00 a.m. (midnight) New York time**
(`America/New_York`) every day. This is **04:00 UTC during Eastern Daylight
Time (EDT)** and **05:00 UTC during Eastern Standard Time (EST)**. The reset
follows New York's daylight saving changes, so it is not a fixed UTC time.

The new trading day's equity, including open-position profit or loss, becomes
the daily-loss reference. The dollar loss allowance remains a percentage of
starting balance. A daily reset does not reopen a failed account or reset the
maximum loss limit.

## Static drawdown and the withdrawal lock

The initial MLL floor is starting balance minus the static drawdown allowance.
It does not follow intraday or end-of-day highs. On the first withdrawal from
the funded account, the floor locks permanently to starting balance. It never
moves again, including after later withdrawals.

Before this lock, reaching a loss floor breaches the account. After the lock,
equity exactly at the MLL floor is allowed; falling below it breaches. The
daily-loss floor remains inclusive. The dashboard shows both loss floors.
A withdrawal never restores the original buffer.

Loss-limit monitoring continues while the account is active, including after
trades settle or hourly swap fees are charged. A confirmed loss-limit breach
changes the account to Failed and stops further trading.

New Stop Loss orders follow the market's chart source: Last Price for Binance,
Bybit and Hyperliquid. This does not change the price references used for
loss-limit or liquidation checks. Existing orders
keep their original trigger policy until canceled and replaced.

A detected Stop Loss crossing remains valid if the price moves back before
execution. The exit still needs a fresh execution price, so placing a stop does
not guarantee a fill before a loss-limit breach. See
[Take Profit and Stop Loss orders](/guides/trading-guide#add-take-profit-and-stop-loss-orders).

## Account states

Competition trading uses a separate market exposure allowance from your
purchased challenges. Matching competition accounts share a capped allowance
for each market, product, and size. Competition positions do not consume your
purchased-account allowance. See [Asset Exposure Limits](/guides/asset-exposure-limits)
for the calculation and rejection behavior.

| State | Meaning |
| - | - |
| Active | The account can trade, subject to its rules and any temporary locks. |
| Passed | The evaluation reached its passing conditions. Trading stops on the completed evaluation while the next stage is prepared. |
| Failed | A rule breach or authorized account decision ended the account. |
| Funded | The platform issued a funded-stage account after the required review, identity, and agreement flow. |
| Closed or archived | The account remains in history but is no longer active. |

## After an evaluation passes

The account switcher's **Active** filter keeps your passed evaluation visible
until its funded account is issued. The evaluation still shows **Passed** and
cannot take new orders. Once the funded account is issued, use the **Passed**
filter or clear the filters to find the completed evaluation.

Follow the action shown on the dashboard. Depending on the account and current
workflow, you may need to complete identity verification, review and sign the
customer agreement, or wait for a funding review before the funded account is
available in the account switcher.

## Maximum funded allocation

You can hold **up to \$300K in total funded allocation**, with a maximum of
**\$100K per model type**. Prime, Select, and Signature are separate model
types. Original account sizes add together within each model, even when you
use several smaller accounts. A passed account that would exceed
either limit enters **Funding Review** after identity verification and agreement
completion instead of receiving automatic funding.

For example, \$100K in Prime, \$100K in Select, and \$100K in Signature totals \$300K.
Another \$100K Prime account requires Funding Review.
See [Becoming Funded](/guides/challenge-lifecycle/becoming-funded).

## Funded accounts and payouts

The dashboard's Constraints panel shows Payout Rules only for funded accounts.
Evaluation and other non-funded accounts show their applicable trading rules
without the Payout Rules section.

A funded account can submit one payout request per Eastern calendar day. The
minimum is \$100 before the profit split (\$80 to the trader on 80/20, or \$90 on
90/10). A rejected request restores the allowance, and submitted requests
cannot be cancelled. Each account has its own allowance, even when one trader holds
several accounts.

Payout requests require a flat account and temporarily lock trading while the
request is pending. Read [Payouts](/guides/challenge-lifecycle/payouts) for the
window, gross deduction, and permanent MLL lock.

Read the [Challenge Lifecycle](/guides/challenge-lifecycle) for the steps from
purchase through evaluation, funding, and payouts.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.