# mfp-preflight

**Know before you click.** A pre-trade breach check for [MyFundedPerps](https://myfundedperpetuals.com) accounts.

Give it a trade (market, side, entry, stop, size or $ risk, leverage, hold time). It reads your live account through the MFP API and answers three questions:

1. **Does a stop-out breach either floor?** This is computed with the real costs: entry and exit commission, hourly swap, the platform's max-slippage cap, and a stop-gap estimated from the market's own recent candles. MFP stops trigger on last price but fill at a fresh price, so the fill can land past your stop.
2. **What else is already at risk?** All open positions are assumed to hit their stops together. Resting entries are assumed to fill and then stop out. Unprotected positions are flagged.
3. **What's the biggest size that's still safe?** The solver finds the largest size where the stress-case stop-out plus existing exposure leaves a buffer above both floors. It also respects margin, max position value and the account notional cap.

The output is **GO / CAUTION / NO-GO**, with the reason, a loss breakdown per scenario, the max safe size, the stop-outs left today, and a countdown to the NY-midnight daily reset.

## Why not the built-in calculator?

MFP's Drawdown Breach calculator is static. You type in a balance and it doesn't read your account, existing positions, fees, swap, slippage tiers, or stop gaps. Preflight uses the live `daily_loss_room` / `max_drawdown_room` from the API and models how the engine actually fills.

## Model

| Scenario | Stop fill |
| - | - |
| clean | exactly at the stop, which is what the platform's TP/SL estimate shows |
| typical | stop ± (median 1s range + slippage cap) |
| stress | stop ± (p99 3s range + slippage cap) |

- **Slippage cap.** This is the published schedule by asset class, notional, and open interest. OI comes from the `marketStats` stream. When OI is unknown, the most conservative band is used, as the platform does.
- **Fees.** Crypto 3 bps per fill, FX 0.25 bps, indices/commodities/stocks 0.5 bps. Swap is the daily rate divided by 24 per hourly boundary, using the worst-case count.
- **Floors are inclusive.** Touching a floor is a breach.
- **Verdict.** Any hard gate or a clean/typical breach gives **NO-GO**. A stress breach, a buffer below 10%, or warnings give **CAUTION**.
- **Hard gates.** Account status, payout or copy locks, reduce-only, halts, competition allowlist, leverage, min notional, max position value, total notional cap, max open positions, margin, unfillable quote, stop on the wrong side, and **isolated liquidation before the stop**.

## Setup

```bash
npm install
cp .env.example .env      # then put your key in .env
npm run smoke             # verifies the key, prints each account's live room
npm test
```

Use a **sandbox test key** (`fp_test_…`, Read Only is enough). Create it at Settings → API Keys → Test (Sandbox). Test keys are routed to `sandbox.myfundedperpetuals.com` automatically. The key is only read server-side and is never sent to the browser or the market-data socket.

## Status

- [x] Risk engine and unit tests (`src/engine`)
- [x] REST client (`src/mfp/client.ts`) and smoke script
- [ ] Snapshot builder: API → engine input, with WS candles for the gap model and `marketStats` for OI and mark
- [ ] HTTP server with a JSON `POST /api/check`
- [ ] Web UI
- [ ] Browser extension (inside the MFP terminal)
- [ ] MCP tool wrapper

## Disclaimer

Estimates only. Placement and settlement on MFP are authoritative. A stop is not a guaranteed fill, and this tool can't make it one. Not affiliated with MyFundedPerps.
