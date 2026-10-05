// npm run smoke — verifies the key in .env and prints each account's live room.
// Never prints the key.
import { MfpClient, MfpError } from "../src/mfp/client";

try {
  process.loadEnvFile?.(".env");
} catch {
  /* no .env: fall back to the real environment */
}

const client = MfpClient.fromEnv();
const usd = (x: number | null | undefined) => (x == null ? "n/a" : `$${x.toLocaleString("en-US", { maximumFractionDigits: 2 })}`);

try {
  console.log(`Environment: ${client.environment} (${client.baseUrl})`);
  const accounts = await client.listAccounts();
  if (!accounts.length) console.log("Key works, but no accounts are visible to it.");
  for (const a of accounts) {
    const full = await client.getAccount(a.id);
    const policy = await client.getTradingPolicy(a.id);
    const r = full.risk ?? {};
    console.log(`\n${full.name} #${full.account_number}  [${full.stage}/${full.status}]  id=${full.id}`);
    console.log(`  equity ${usd(r.equity)}  start ${usd(full.starting_balance)}  available ${usd(r.available_balance)}`);
    console.log(`  daily room ${usd(r.daily_loss_room)} (floor ${usd(r.daily_loss_floor)})  drawdown room ${usd(r.max_drawdown_room)} (floor ${usd(r.max_drawdown_floor)})`);
    console.log(`  rules ${JSON.stringify(r.requirements ?? {})}`);
    console.log(`  policy: blocked=${policy.manual_trading_blocked} opening_restricted=${policy.opening_exposure_restricted} mmr=${policy.limits?.maintenance_margin_ratio_bps}bps max_pos=${usd(policy.limits?.max_position_value_usd)}`);
  }
} catch (e) {
  if (e instanceof MfpError) console.error(`API error ${e.status} ${e.code}: ${e.message}${e.requestId ? ` (request ${e.requestId})` : ""}`);
  else console.error(e);
  process.exit(1);
}
