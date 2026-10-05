> ## Documentation Index
> Fetch the complete documentation index at: https://docs.myfundedperpetuals.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Trading Guide

> Understand simulated order execution, sizing, margin, leverage, Take Profit and Stop Loss, and the safeguards around each trade.

MyFundedPerps uses real market data and venue order books to simulate
orders and fills. The server validates account rules, available collateral,
market constraints, and execution protection before applying a fill to your
simulated account.

## Forex markets

The forex markets are EUR/USD and USD/JPY, both on Hyperliquid. Both use
the venue's perpetual order book and price history, with trading
available around the clock subject to venue availability and fresh market data.
There is no weekend price substitute or switch to another venue outside
traditional forex hours. Check the order ticket for each market's current
leverage and size requirements.

Forex previously traded on Lighter. Open forex positions were carried over to
the Hyperliquid markets with their entry price, size, leverage, and history
unchanged, and they now follow the Hyperliquid market's prices and rules.

## Browse markets

The [Markets page](https://myfundedperpetuals.com/markets) shows cached prices
and statistics so browsing does not wait for every data source. Prices refresh
every 30 seconds while the tab is visible; polling pauses in hidden tabs.
A recent listing and its other statistics are reused for ten minutes; an older
cached listing can appear while a replacement loads. Overview cards and
historical charts load independently from the market list.

Open Filters to narrow the list by asset class (Stocks, Crypto, Indices,
Commodities, FX) and other criteria. Selected filters stay in the page URL so
a refined view can be shared or refreshed.

Open a market to see current trading data. Orders use current execution checks,
not the cached prices on the Markets page.

## Save markets to your watchlist

Star a market on Markets or in the Trade symbol picker to add it to your
watchlist. Both views and the bottom-bar Watchlist use the same saved list,
with a shared limit of 25 markets. Removing a star in either view frees a
slot everywhere. Crypto and traditional instruments that share a ticker are
separate markets.

Open Configure Watchlist from the bottom-bar Watchlist to remove markets or
drag them into your preferred order. Your watchlist is saved to your profile
and follows you across trading accounts.

On the trading terminal, use the source menu on the scrolling market ticker to
show Trending markets, the standard Tickers list, Top Volume, or your Watchlist.
Watchlist markets appear in your saved order, including markets from different
venues. The ticker source you choose is remembered in this browser. When your
watchlist is empty, the ticker prompts you to add markets.

## Chart preferences and templates

The chart's timeframe menu offers minute timeframes from 1 to 45 minutes, hour
timeframes from 1 to 12 hours, and daily and weekly candles. The exact list
depends on the market. Timeframes such as 45 minutes, 2 hours, and 6 hours are
combined from shorter candles, so they start at midnight UTC and reach as far
back in history as the shorter candles they combine. Star a timeframe in the
menu to add it to the chart header. The chart opens on the timeframe you used
last.

The candle countdown follows server time while the price connection is
available, so an incorrect device clock does not add extra time to the current
candle. Quiet Hyperliquid markets can wait for the next trade before showing
a new candle.

Charts automatically reload their history when the live candle feed resumes
after an interruption that may have skipped candles. Returning to the page,
tapping the chart, or a quiet market does not trigger a reload by itself.
Live candles keep updating until the reload starts and pause only while it
runs; drawings and chart settings stay in place. If the price connection
drops, the chart shows the connection status, such as **Reconnecting**, until
prices resume. If recovery repeatedly fails, the chart shows a loading error
instead of silently continuing with a gap. A price jump by itself does not
trigger a reload.

Your chart preferences and templates stay saved when you switch markets.
Chart customization such as colors, chart style, and scale settings follows
you to every market, while drawings stay on the market where you drew them.
To build your own indicators, see [Custom Scripts](/guides/custom-scripts).
When another tab or device has synchronized a template change, your next
template edit uses that updated collection. If two tabs save conflicting
changes at the same time, the app rejects the older change to protect the
newer saved version.

To change a drawing's settings, such as the levels, colors, and labels of a
Fibonacci retracement, right-click the drawing and choose **Settings…** at the
top of the menu, or double-click one of its lines. When the chart is tall
enough, the toolbar that appears after you select a drawing also shows a
settings icon.

## Trade on a phone

On a phone, the trade page uses a single header row: the menu, the market
picker, the current mark price with its 24h change, and your notifications.
The page fills the screen, including the space Safari frees when you hide its
toolbar.

* Tap the mark price to open **Market Details**. It shows mark price, 24h
  change, open interest, and 24h volume, and opens **Trading Data**,
  **Market Info**, and **Market Depth**. While one of those views is open, the
  tabs above it take you back to **Chart**.
* The chart's drawing tools start collapsed. Tap the arrow at the chart's left
  edge to show them.
* Tap **Focus Chart** (the full-screen icon in the header) to give the chart
  the whole screen. The header and bottom tabs hide, leaving one bar under the
  chart with your open position for the market, **Buy / Long**, **Sell /
  Short**, and **Exit Focus**, which restores the full layout. Focus applies
  only to the price chart and is remembered on that device.

## Net PnL percentage

Position Net PnL % on the trading terminal, dashboard, and position PnL cards
is calculated as **Net PnL ÷ position margin × 100** for every market,
including forex. For example, a \$25 net profit on \$250 of margin is a 10%
return.

Open positions include unrealized PnL, realized PnL from earlier reductions,
paid fees, swap fees, and, by default, the estimated fee to close the remaining position.
Their percentage uses the current reserved margin plus the margin committed
to earlier closed portions. Fully closed positions use the accumulated margin
of all closed portions. Older positions without that history use the final
remaining size's entry margin as a fallback.

## Estimated close fees in Net PnL

Use **Include Estimated Close Fees** in the Positions header on the
[trading terminal](https://myfundedperpetuals.com/trade). You can
also find it under **PnL Display** in [Settings > Trading](/settings/trading).
The switch is on by default. Turn it off to view open-position Net PnL
without deducting the estimated fee to close the remaining position.
Paid fees, realized PnL from reductions, and swap fees still count.

The setting updates open-position totals, row values and percentages,
breakeven prices, and chart position PnL labels together. Your choice is saved
to your user settings and synced across devices, browsers, the dashboard, and
the trading terminal when you are signed in.
It changes displayed values only: execution fees, close-order estimates,
account equity, challenge rules, and closed trade history are unchanged.

## Choose an order type

| Order | What it does | Main tradeoff |
| - | - | - |
| Market | Fills the full size using the execution model described below. | Adverse slippage is capped by the market's published tier. |
| Limit | Rests at your price and fills in full there once the market reaches it. A limit placed through the market fills right away as a market order. | Controls price but may remain unfilled if the market never reaches the limit. |
| Stop / Take Profit | Watches a trigger and submits the configured exit behavior when reached. | A trigger is not a guaranteed fill price; execution still uses current market conditions. |
| Scheduled or advanced order | Breaks or manages an instruction using the controls shown in the order ticket. | Each generated order still passes the ordinary account and execution checks. |

Check the order ticket for the order types available on the selected market.

Select **Reduce Only** to cap an order at closing or shrinking an existing
position in the opposite direction. It is offered on every order type except
Take Market: a reduce-only take exit belongs on the position's Take Profit
instead. When an account restriction requires it, the option is locked on and
oversized requests are capped at the open position size.

### How limit orders fill

A limit order always fills its whole size. It never fills partially and does not
depend on how much size is showing at its price. What price it fills at depends
on whether the order rests first.

* A buy limit is reached when the best ask is at or below the limit price. A
  sell limit is reached when the best bid is at or above it.
* A limit placed at or through the current market does not rest. It fills right
  away as a standard market order: the whole size at the best ask for a buy or
  the best bid for a sell, under the same mark-based slippage cap as any market
  order, and never worse than your limit price. The order ticket asks you to
  confirm this before submitting.
* A limit resting in Open Orders fills at exactly its limit price once the
  market has reached that price on two order book checks in a row. It never
  fills at a better price than the limit. If the market moves back off the
  price between those checks, the order keeps waiting and the count starts
  over.
* A Limit take profit or stop loss follows the same rule after it triggers: it
  rests at its price and fills in full at that price once the market reaches
  it, so it can remain unfilled. If the market has already passed the limit
  when it triggers, it fills right away as a market order instead.

## How market orders fill

Market orders, including triggered stop and take-profit market exits, fill
their whole size at the best ask for buys or the best bid for sells, with
maximum adverse slippage capped against the current mark reference. Each
published tier is a **worst-case bound, not a fixed fill offset**. If the book
offers a price inside the cap, your order receives that price. A fill is never
better than the mark itself: buys fill at or above the mark and sells at or
below it, even when the book momentarily sits through the mark.

For buys, the fill is the lower of the best ask and mark × (1 + tier / 10,000),
and at least the mark. For sells, it is the higher of the best bid and
mark × (1 - tier / 10,000), and at most the mark. For example, with a mark of
\$100 and a 1 bps cap, a best ask of \$100.005 fills at \$100.005; a best ask of
\$100.02 fills at the \$100.01 cap; a best ask of \$99.99 fills at the \$100 mark.

Forex markets use the same rules with the forex slippage tier as the cap. The
tier is selected from order notional at the mark. FX limits retain their
price protection: a resting limit needs both the real opposing book price and
the mark to reach its limit, and marketable limits use market-style pricing,
never worse than their limit.

Other instruments retain their maximum adverse slippage caps. Larger notional
and lower open interest may widen those caps; a better opposing book price
within the cap is preserved.

The pricing schedule, in basis points of the reference price (fixed per-side spread for FX, maximum adverse slippage for other markets):

**Major indices and commodities** (NAS100, SP500, GOLD, SILVER, CL, BRENTOIL)

| Order notional | Maximum slippage |
| - | - |
| Up to \$100,000 | 0.25 bps |
| Up to \$200,000 | 0.5 bps |
| Up to \$1,000,000 | 0.75 bps |
| Above \$1,000,000 | 1.00 bps |

**Forex**

| Order notional | Maximum slippage |
| - | - |
| Up to \$100,000 | 0.05 bps |
| Up to \$200,000 | 0.08 bps |
| Up to \$1,000,000 | 0.12 bps |
| Above \$1,000,000 | 0.15 bps |

**All other instruments**, by the instrument's current open interest at order
time:

| Open interest | Up to \$100,000 | Up to \$500,000 | Above \$500,000 |
| - | - | - | - |
| Above \$500M | 0.8 bps | 1.2 bps | 2.0 bps |
| \$100M to \$500M | 1.2 bps | 1.8 bps | 3.0 bps |
| \$25M to \$100M | 2.0 bps | 3.0 bps | 5.0 bps |
| \$10M to \$25M | 3.5 bps | 6.0 bps | 9.0 bps |
| Below \$10M | 6.0 bps | 10.0 bps | 16.0 bps |

When an instrument's open interest cannot be observed, the most conservative
band sets the cap; book prices inside the cap are still preserved. Resting
limit orders fill at exactly the limit price once both the opposing top of
book and the mark reference reach it. A limit placed through the market fills as a market order under this same
schedule, never worse than its limit.

## Understand trading fees

Commissions apply to each fill's notional when you enter or exit a position.
Maker and taker fills use the same rate within each asset class. Open positions
also incur an hourly swap fee.

Read [Commissions and Fees](/guides/commissions-and-fees) for the rate tables,
entry and exit examples, and how hourly holding costs are calculated.

## Size the order

You can start order tickets in USD or asset units. Forex markets can also use
standard lots, where one lot represents 100,000 base-currency units. The size
slider range changes the shortcuts shown in the ticket; it does not prevent you
from typing another otherwise-valid size.

For USD sizing, **Estimated Size** shows the corresponding asset quantity and
symbol, rounded to the market's supported size increment. **Margin Required**
appears for every sizing unit and shows the estimated additional margin needed
for the order, excluding the separately listed fees. It shows zero when the
order only releases margin, and is highlighted when it exceeds your available
balance. These estimates update with the ticket and are checked again at execution.

Each market remembers the size you last entered on its ticket, in the unit
you entered it, so switching to another market and back, or reloading the
page, keeps it. The size is saved in this browser only. Reduce-only sizes are
not saved. With **Clear Size After Order** on, an accepted order also clears
the saved size for that market.

The percentage slider's maximum reflects the smaller of the size your
available margin can support and the remaining per-user market exposure
capacity for that asset, so a full-slider order stays inside both limits.

Oil, Gold, Silver, NAS100, and SP500 can also use whole mini or micro
futures-equivalent contracts. The platform back-solves a perpetual position
with the same dollar-per-point exposure as the selected CME/COMEX contract.
This changes order sizing only; it does not create or settle an
exchange-traded futures contract.

| Market | Mini contract | Mini exposure | Micro contract | Micro exposure |
| - | - | - | - | - |
| NAS100 | NQ | \$20 per point | MNQ | \$2 per point |
| SP500 | ES | \$50 per point | MES | \$5 per point |
| Gold | QO | \$50 per point | MGC | \$10 per point |
| Silver | QI | \$2,500 per point | SIL | \$1,000 per point |
| WTI Crude Oil | QM | \$500 per point | MCL | \$100 per point |

Mini and micro modes use the market's maximum leverage to calculate required
margin. The resulting platform position rounds down to the market's supported
size increment. The contract slider uses whole numbers; its saved range changes
the visible shortcuts, while direct entry can use a larger whole-contract
amount. Markets without a maintained mapping show only USD and asset units.

Review both size and leverage before submitting. Higher leverage reduces the
margin assigned to the same notional position but leaves less room for adverse
movement before liquidation or a challenge-rule breach.

Hover over a market's leverage badge, such as **10×**, to see **Maximum
Leverage** and **Maximum Position Size** for your selected account. The position
size is shown in USD and uses the lowest applicable per-position, account-wide,
and per-user market exposure ceiling for that asset, account model, and account
size. The same tooltip appears in the trade header, market picker, Markets
table, and search results. Sign in and select an account to see its limit.

This is a configured ceiling, not your remaining buying power. Available
margin, your other positions, and exposure in your own matching accounts using the market
limit can reduce how much you can open. Orders still pass the trading engine's
checks when placed and filled.

Read [Asset Exposure Limits](/guides/asset-exposure-limits) for how per-user
market caps work and a link to the current market-by-market limits.

## Choose a margin mode

| Mode | Meaning |
| - | - |
| Isolated | Margin is managed for the individual position. The selected mode is stored on that position. |
| Cross | Eligible account collateral supports cross-margin positions together. Losses can consume more of the account's shared balance. |

Changing the default affects newly opened positions. It does not rewrite the
margin mode of an existing position.

## Add Take Profit and Stop Loss Orders

Chart TP/SL gain and loss estimates include entry and estimated exit trading
fees, including while a triggered exit is waiting to fill. They are estimates
at the trigger price: market movement and the spread can change the final loss.

Take Profit and Stop Loss instructions help define exits before an order is
submitted. You can show their estimated gain or loss in percent or USD, and
save a TP/SL preset that fills the same gain and loss on every market (see
[Trading settings](/settings/trading)). Review
the trigger, direction, quantity, and whether the exit uses market or limit
behavior where the ticket offers that choice.

For a new order, you can enter either a trigger price or an estimated gain or
loss. The last field you edit controls the target. If you enter a USD amount or
percentage, the draft trigger price updates with the estimated entry price,
size, leverage, and fees until you submit. If you enter or drag the trigger
price, that price stays fixed and the gain or loss estimate updates instead.
Once submitted, the order uses its saved trigger price. The selected amount is
an estimate, not a guaranteed final profit or loss.

New Take Profit, Stop Loss, and other conditional orders use the market's
standard chart source:

| Venue | Trigger source |
| - | - |
| Binance, Bybit, Hyperliquid (including forex) | Last traded price |

For Last Price triggers, one actual trade touching your level is enough,
including a small trade. The platform does not wait for the candle to close
or for the mark price to reach the same level. Liquidation and account loss
monitoring use their separate price references.

Protective market Stop Loss and Take Profit orders can execute using a fresh
market quote available when the trigger is processed, without waiting for
an additional price update. If that quote is too old or predates the trigger,
execution waits for a newer quote. The trigger price is still not a guaranteed
fill price, and fast moves or temporary data delays can affect the result.
Limit exits continue to require their limit-price conditions.

Orders placed before this update keep their original trigger policy. Editing
a trigger price or size does not switch that policy. To use the new policy,
cancel the old conditional order and place a replacement. Attached TP/SL also
keeps the policy of its entry order if that entry fills after the update.

### Adding to a position with attached TP/SL

When you add to a position you already hold and attach a Take Profit or Stop
Loss to the new order, the attached exit covers your full resulting position,
not only the added size. Your existing exits in the same group (stop losses
for a stop loss, take profits for a take profit) overlap that coverage, so the
order ticket asks you to confirm before it submits. The review lists each
existing exit that will be canceled and the new exit that replaces it. If you
confirm, the replacement happens in the same transaction as the fill; for a
limit order, that is when the order fills. If you decline, nothing is
submitted and your existing exits stay in place.

For example, adding 0.115 BTC to a 0.115 BTC long with a take profit at
\$88,000 and confirming a new take profit at \$89,000 replaces the old take
profit with one covering the resulting 0.230 BTC position when the entry
fills. The same confirmation applies to stop losses and short positions.

Without confirmation the platform never cancels a protective order on your
behalf. An exit that is executing at that moment is never replaced, so the
order can still be rejected until that exit settles.

When you add to a position without attaching a new Take Profit or Stop Loss,
your existing exits grow with the position so they keep covering the same
share of it. You can turn this off with
[Resize TP/SL With Position](/settings/trading).

Once the server detects your trigger price on the market's price feed, a move
back across that level does not cancel the trigger. Execution uses a fresh
market book and still applies the order's execution protections. Editing the
order resets its trigger, so an earlier crossing cannot fire the edited order.

<Warning>
  A Stop Loss reduces risk but cannot guarantee a particular fill price. Fast
  markets, gaps, available liquidity, and the configured exit type still affect
  execution.
</Warning>

## Use execution protection

The Trading settings include:

* **Max Market Slippage**, a server-enforced limit for ordinary market orders
  and individual position closes;
* separate **Non-Forex** and **Forex leverage caps** for the order ticket;
* **Warn Without Stop Loss** for orders that can increase exposure;
* **Resize TP/SL With Position** to keep existing exits sized to a position
  you add to;
* confirmation controls for new orders and TP/SL chart drags;
* account-synced keyboard execution for placing orders, managing focused
  positions, canceling focused orders, and the reviewed Cancel All and Close
  All actions.

Read the complete [Trading settings reference](/settings/trading) to configure
these defaults.

## Customize the terminal layout

On desktop widths the trading terminal is rearrangeable. The chart stays in
the center with the activity tabs below it; the order book and order ticket
can move between the zones around them.

The **Layout** button (the layout icon in the market stats bar) opens the
terminal layout menu:

* **Colour Scheme**: start with Graphite, Midnight, or Aubergine, then choose
  **Customize Colours** to adjust each terminal background, surface, text,
  accent, border, input, and chart colour individually. Drag the swatch
  picker, or type or paste a hex value such as `#c084fc` into the field beside
  it (the `#` is optional, and three-digit shorthand like `#abc` works too).
  The terminal palette does not change the theme used by the rest of the
  app. Each preview shows
  the chart, data rows, and order ticket in your current light or dark mode.
  The chart has its own quiet canvas, order tickets use a raised surface,
  and inputs are recessed. The Layout menu and its colour, save, and import
  dialogs follow the terminal palette. Buy/Sell and gain/loss colours keep
  their trading meanings.
* **Pro**: the complete terminal with the chart, order book, order ticket,
  and activity tabs. This is the default.
* **Simple**: a leaner terminal that keeps the order book hidden until you
  need it.
* **Saved Layouts**: your own named arrangements. Use **Save Current Layout**
  to name the arrangement on screen; select a saved layout to reapply it, or
  delete it from the same menu. You can save up to 8 layouts.
* **Edit Current Layout**: enter edit mode to rearrange panels. Panel
  dragging is disabled outside edit mode so chart and order entry
  interactions remain unchanged.
* **Copy Layout Code** and **Import Layout Code**: export your arrangement as
  a shareable code string, or paste another trader's code to replicate their
  exact layout.
* **Reset to Default**: restore the platform default arrangement and panel
  sizes in one click.

Choose **Edit Current Layout** to enter edit mode. The edit toolbar takes the
place of the market stats bar while you edit, so the terminal stays where it
is. In edit mode, drag any panel by its handle onto a highlighted zone: an
existing column, or a strip at the edge where a new column will appear.
Hovering a zone outlines where the panel will land and names the zone. You
can also use the panel's **Move To** menu. Each panel header also has a hide
button. Panels glide into their new places, and rearranging never reloads the
main chart. The edit toolbar keeps the arrangement with **Done**, restores
the layout you selected before editing with **Reset**, or names the
arrangement with **Save as Layout**.

### Widgets

The **Widgets** row in the edit toolbar lists every panel that is not on
screen; scroll it sideways when it holds more widgets than fit. Drag a widget
chip onto a highlighted zone, or open its **Place in** menu and pick a zone,
and it joins the terminal there. Hiding a placed widget returns it to the
row. Widgets you can place:

* **Market Chart**: a compact chart with its own market picker and timeframe
  chips, so you can watch one market while trading another. While it is
  placed, the bottom-bar **Chart** button shows "Docked in the terminal"
  instead of opening a floating window; the widget and the floating window
  share the same market and timeframe. Click the docked chart to trade its
  market: the order ticket and order book switch to it, both show a
  "Following chart" strip with the market name, and the chart gets a
  highlighted border. Click the main chart, or open a different market, to
  return the ticket to the market in the address bar. The address bar, stats
  bar, and main chart never change with focus.
* **Advanced Chart**: a second full chart like the main one, with its own
  market picker plus the same indicators, drawing tools, saved layouts,
  and position and order lines for the market it shows. It
  starts on the market in the address bar until you pick another. Unlike
  Market Chart it never moves the order ticket or order book: they stay on
  the market in the address bar no matter which market this chart displays.
* **Watchlist** and **Top Volume**: the same lists as the bottom-bar windows,
  kept in view.
* **Calculator**: the trading calculator with its own market picker. It starts
  on the market you are trading and then keeps whatever market you choose.
* **Account Stats**: the active account's live metrics.
* **Market Map**: the markets page heat map, with tiles sized by open interest
  and coloured by 24h change. Click a tile to trade that market.
* **Open Interest & Volume**: the market-wide open interest and 24h volume
  figures with their trend charts, stacked vertically in narrow panels.
* **Market Movers**: the top gainers and losers across the listed markets.
  The header chips switch between 1h, 24h, and 7d change, and the dropdown
  narrows the list to one asset class. Your picks are remembered per browser.
* **Market Sentiment**: the Fear & Greed index, altcoin season score, average
  RSI, and total market cap from the markets overview.

Widgets can sit in either rail or, except for the calculator and account
stats, beside the chart. Several panels in one zone stack vertically with a
draggable divider between them. Hidden widgets never load market data.
Widgets are part of your saved layouts and shared layout codes, and a code
that names a widget your app does not recognize simply leaves it out.

Layout choices and saved layouts, including their colour scheme, are stored on
your account and follow you across devices. Shared layout codes include the
colour scheme too. Panel sizes (column widths and chart height) are remembered
per browser. Phone and narrow-window layouts keep the standard responsive
arrangement while using the selected terminal colour scheme.

Panels have no minimum size. Drag any divider to make a column, the chart, or
the activity table as narrow or as short as you like; content inside scrolls or
clips instead of pushing the divider back. Dragging the order book below its
collapsed strip snaps it closed, and the strip's expand button restores it. The
activity table keeps its tab strip visible so you can always drag the chart
back down, and **Reset to Default** restores the standard sizes. Floating
windows such as the calculator, mini chart, and account stats can likewise be
shrunk down to just their title bar.

To share only your colours, open **Customize Colours** and choose **Copy Code**.
The colour code contains the editor's current colours, including unsaved changes.
You can also select the code and copy it manually. The same palette produces the
same code, and codes do not expire.

To try a shared palette, paste its complete code into **Import Colour Code** and
choose **Preview Colours** (or press Enter). The editor previews the imported
colours without changing your panel arrangement. Choose **Save Colours** to keep
them, or close the editor to discard the preview. Invalid codes leave your colours
unchanged. Colour codes preserve the sender's exact colours even if you use a
different light or dark theme; **Reset to Preset** restores the imported palette's
base preset for your current theme.

The colour editor warns when a text and background combination may be hard to
read. **Reset to Preset** removes every individual override while keeping the
selected built-in scheme. Chart canvas, grid, and text overrides become the
TradingView defaults, while colours changed directly in TradingView remain
unchanged.

<Note>
  Hiding the order ticket removes the order entry form until you show it again
  from customize mode or apply another arrangement.
</Note>

## Automatic closure after an evaluation pass

When the server confirms that your evaluation equity reaches its profit
target and the other pass requirements are clear, the account automatically
passes and closes its open positions. Open profit and loss count toward
equity, so you do not need to close trades yourself to realize the target.
Closing fees or slippage can leave the final balance slightly below target
without changing the passed result. See
[Evaluation Progress](/guides/challenge-lifecycle/evaluation-progress).

## Understand rejections

An order can be rejected when it would violate account rules, collateral or
position limits, current market availability, execution protection, a pending
payout lock, or copy-follower restrictions. Read the message attached to the
rejected order, confirm the active account, then change only the condition that
caused the rejection.

Do not repeatedly resubmit an unchanged order. If the reason remains unclear,
use [Troubleshooting and FAQ](/guides/troubleshooting-and-faq).

## Today's fill statistics

The dashboard counts fills on the day they settle, even if you placed the order
on an earlier day. Today's fees, realized PnL, traded volume, and fill win rate
use the same fills. The day runs from midnight to midnight in America/New\_York,
including daylight saving changes. Unfilled orders and historical fills with no
recorded settlement time are excluded from these daily statistics.

## Today's P\&L

Today's P\&L measures the change in equity since midnight in America/New\_York.
It includes changes in unrealized profit or loss, trading fees, and swap fees,
so it can differ from the profit on trades closed today.

If you closed all positions before today's reset and have had no activity
since, today's P\&L is \$0.00. Yesterday's gain or loss is already included in
your balance. A page left open checks the current day once per minute without
requiring a refresh. If you have open positions and today's starting equity
is not yet available, the daily P\&L value and its share action remain
unavailable until that value arrives.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.