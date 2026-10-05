# mfp-preflight: context for Claude Code

Entry for the MyFundedPerps Builders program (batch closes **Oct 10, 2026**). Owner: SiS.
The plan is preflight first (web app, then browser extension), then a live volume profile/footprint, then a pass-probability calculator.

## Rules
- The API key lives only in `.env` (gitignored) and is read server-side. Never log it, never send it to the browser or the WS.
- Market data WS (`wss://api-stream.myfundedperpetuals.com/v1/market-data`) is public and needs no key.
- Engine (`src/engine`) is pure: no I/O. Every cost constant lives in `costs.ts`, transcribed from MFP docs.
- Every engine change needs a hand-computed test in `test/engine.test.ts`.
- API is beta: the spec is pinned in `docs/openapi.yaml`, and the relevant docs pages are saved in `docs/`.

## Key facts from MFP docs
- 1-Step plans: daily loss 3% of the starting balance, measured from start-of-day equity at NY midnight. Max drawdown is static (Select 3%, Prime 5%, Signature 6%). Floors are inclusive.
- Read the rule values from the API (`risk.requirements`, `account_rules`); don't hardcode them.
- Stops trigger on last trade price and fill at a fresh price with a mark-based slippage cap. The fill isn't guaranteed before a breach.
- Market fill: buy = min(ask, mark*(1+cap)) and ≥ mark; sell is mirrored.
- Rate limit is about 300 requests/min per IP. Don't poll trading-policy every second.
- NAS100 is `hyperliquid|xyz:XYZ100`; gold is `hyperliquid|xyz:GOLD`. The public market list has `category` null, so classify via `costs.classifyMarket`.

## Next tasks
1. `src/mfp/snapshot.ts`: build `PreflightInput` from the API (account, policy, positions, working orders → stops and coverage, quote at side and size, gap from WS `candles.history` 1s with a 1m fallback, OI and mark from the `marketStats` stream).
2. `src/server.ts` (Hono): `GET /api/accounts`, `GET /api/markets`, `POST /api/check`, and serve the UI.
3. Web UI: ticket on the left; verdict, scenario table, max safe size and gates on the right.
4. Verify against a sandbox account: the numbers must match the dashboard floors.
