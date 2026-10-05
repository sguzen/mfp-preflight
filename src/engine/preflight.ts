// Preflight: will this trade, if stopped out, breach the account?
// Pure function of a snapshot. See README for the model and its limits.

import { commissionBps, floorToDecimals, slippageCapBps, swapCost } from "./costs";
import { nextDailyReset } from "./time";
import type {
  ExistingPosition,
  Gate,
  GapModel,
  LossBreakdown,
  MarketInfo,
  PreflightInput,
  PreflightResult,
  Scenario,
  ScenarioResult,
  SizeSolution,
  TradeIntent,
  Verdict,
  WorkingEntry,
} from "./types";
import { SCENARIOS } from "./types";

const BPS = 10_000;

/** Stress-only shock applied to positions with no stop, as a fraction of notional. */
export const UNPROTECTED_SHOCK = { crypto: 0.02, tradfi: 0.01, fx: 0.005 } as const;

function overshoot(s: Scenario, gap: GapModel): number {
  return s === "clean" ? 0 : s === "typical" ? gap.typicalBps : gap.stressBps;
}

/** Fill price of a triggered market stop under a scenario. */
export function stopFill(stop: number, closingLong: boolean, scenario: Scenario, gap: GapModel, capBps: number): number {
  if (scenario === "clean") return stop;
  const adverse = (overshoot(scenario, gap) + capBps) / BPS;
  return closingLong ? stop * (1 - adverse) : stop * (1 + adverse);
}

function feeBps(market: MarketInfo, feeExempt: boolean, quoted?: number) {
  if (feeExempt) return 0;
  return quoted ?? commissionBps(market.assetClass);
}

/** Expected entry price for the intent at a given size. */
export function entryPrice(trade: TradeIntent, input: Pick<PreflightInput, "quote" | "stats">, capBps: number): number {
  if (trade.entryType === "limit") {
    if (!(trade.limitPrice! > 0)) throw new Error("limit entry needs limitPrice");
    return trade.limitPrice!;
  }
  const q = input.quote;
  if (q.estimatedFillPrice && q.estimatedFillPrice > 0) return q.estimatedFillPrice;
  // Platform rule: buy fills at min(ask, mark*(1+cap)) and never below mark.
  const mark = input.stats.markPrice ?? q.mid ?? NaN;
  const isBuy = trade.side === "buy";
  const top = isBuy ? q.ask : q.bid;
  if (!Number.isFinite(mark)) {
    if (top) return top;
    throw new Error("no price available for market entry");
  }
  const capped = isBuy ? mark * (1 + capBps / BPS) : mark * (1 - capBps / BPS);
  if (top == null) return capped;
  return isBuy ? Math.max(mark, Math.min(top, capped)) : Math.min(mark, Math.max(top, capped));
}

export function tradeLoss(input: PreflightInput, size: number, scenario: Scenario): LossBreakdown {
  const { trade, policy, stats } = input;
  const isLong = trade.side === "buy";
  const refPrice = trade.entryType === "limit" ? trade.limitPrice! : stats.markPrice ?? input.quote.mid ?? trade.stopPrice;
  const cap = slippageCapBps(trade.market, refPrice * size, stats.openInterestUsd);
  const e = entryPrice(trade, input, cap);
  const x = stopFill(trade.stopPrice, isLong, scenario, input.gap, cap);
  const priceLoss = (isLong ? e - x : x - e) * size;
  const entryFeeBps = trade.entryType === "market" ? feeBps(trade.market, policy.feeExempt, input.quote.feeBps) : feeBps(trade.market, policy.feeExempt);
  const exitFeeBps = feeBps(trade.market, policy.feeExempt);
  const entryFee = (e * size * entryFeeBps) / BPS;
  const exitFee = (x * size * exitFeeBps) / BPS;
  const swap = swapCost(Math.max(e, x) * size, trade.market.assetClass, trade.holdHours, policy.feeExempt);
  return { entryPrice: e, exitPrice: x, priceLoss, entryFee, exitFee, swap, total: priceLoss + entryFee + exitFee + swap };
}

/** Additional loss (beyond current marked equity) if an open position's stop is hit. */
export function positionLoss(p: ExistingPosition, scenario: Scenario, holdHours: number, feeExempt: boolean): number {
  const isLong = p.side === "long";
  const notional = p.markPrice * p.size;
  const fee = feeBps(p.market, feeExempt);
  let loss = swapCost(notional, p.market.assetClass, holdHours, feeExempt);
  const covered = p.stopPrice != null ? Math.min(1, Math.max(0, p.stopCoverage)) : 0;
  if (covered > 0 && p.stopPrice != null) {
    const cap = slippageCapBps(p.market, p.stopPrice * p.size * covered, p.openInterestUsd);
    const x = stopFill(p.stopPrice, isLong, scenario, p.gap, cap);
    const moveLoss = (isLong ? p.markPrice - x : x - p.markPrice) * p.size * covered;
    loss += Math.max(0, moveLoss) + (x * p.size * covered * fee) / BPS;
  }
  const uncovered = 1 - covered;
  if (uncovered > 0 && scenario === "stress") {
    loss += notional * uncovered * UNPROTECTED_SHOCK[p.market.assetClass];
    loss += (notional * uncovered * fee) / BPS;
  }
  return loss;
}

/** Loss if a resting entry fills and is then stopped (or shocked, if it has no stop). */
export function workingEntryLoss(w: WorkingEntry, scenario: Scenario, holdHours: number, feeExempt: boolean): number {
  const isLong = w.side === "buy";
  const notional = w.limitPrice * w.size;
  const fee = feeBps(w.market, feeExempt);
  let loss = (notional * fee) / BPS + swapCost(notional, w.market.assetClass, holdHours, feeExempt);
  if (w.stopPrice != null) {
    const cap = slippageCapBps(w.market, w.stopPrice * w.size, w.openInterestUsd);
    const x = stopFill(w.stopPrice, isLong, scenario, w.gap, cap);
    loss += Math.max(0, (isLong ? w.limitPrice - x : x - w.limitPrice) * w.size) + (x * w.size * fee) / BPS;
  } else if (scenario === "stress") {
    loss += notional * UNPROTECTED_SHOCK[w.market.assetClass];
  }
  return loss;
}

function rooms(input: PreflightInput) {
  const a = input.account;
  const eq = a.equity ?? a.balance;
  const daily = a.dailyLossRoom ?? (a.dailyLossFloor != null ? eq - a.dailyLossFloor : null);
  const dd = a.maxDrawdownRoom ?? (a.maxDrawdownFloor != null ? eq - a.maxDrawdownFloor : null);
  return { daily, dd };
}

function evaluateScenario(input: PreflightInput, size: number, s: Scenario): ScenarioResult {
  const t = tradeLoss(input, size, s);
  const fx = input.policy.feeExempt;
  const h = input.trade.holdHours;
  const existingLoss = input.positions.reduce((acc, p) => acc + positionLoss(p, s, h, fx), 0);
  const workingEntriesLoss = input.workingEntries.reduce((acc, w) => acc + workingEntryLoss(w, s, h, fx), 0);
  const totalLoss = t.total + existingLoss + workingEntriesLoss;
  const { daily, dd } = rooms(input);
  const dailyAfter = daily == null ? null : daily - totalLoss;
  const ddAfter = dd == null ? null : dd - totalLoss;
  // Floors are inclusive: equity reaching the floor is a breach.
  const dailyBreach = dailyAfter != null && dailyAfter <= 0;
  const ddBreach = ddAfter != null && ddAfter <= 0;
  return {
    scenario: s,
    trade: t,
    existingLoss,
    workingEntriesLoss,
    totalLoss,
    dailyRoomAfter: dailyAfter,
    drawdownRoomAfter: ddAfter,
    breaches: dailyBreach || ddBreach,
    breachedFloor: dailyBreach && ddBreach ? (dailyAfter! <= ddAfter! ? "daily" : "drawdown") : dailyBreach ? "daily" : ddBreach ? "drawdown" : null,
  };
}

/** Upper bounds on size from platform limits (not risk). */
function sizeCaps(input: PreflightInput, price: number): { size: number; reason: string }[] {
  const { policy, account, trade, positions } = input;
  const caps: { size: number; reason: string }[] = [];
  const sameMarket = positions.filter((p) => p.market.marketId === trade.market.marketId);
  const sameMarketNotional = sameMarket.reduce((a, p) => a + p.markPrice * p.size, 0);
  if (policy.maxPositionValueUsd != null && policy.maxPositionValueUsd > 0) {
    caps.push({ size: Math.max(0, policy.maxPositionValueUsd - sameMarketNotional) / price, reason: "max position value" });
  }
  if (policy.maximumTotalNotionalUsd != null) {
    const gross = account.grossExposure ?? positions.reduce((a, p) => a + p.markPrice * p.size, 0);
    caps.push({ size: Math.max(0, policy.maximumTotalNotionalUsd - gross) / price, reason: "account total notional cap" });
  }
  // Margin: notional / leverage + entry fee must fit available balance.
  const fee = feeBps(trade.market, policy.feeExempt) / BPS;
  const perUnitMargin = price / trade.leverage + price * fee;
  caps.push({ size: account.availableBalance / perUnitMargin, reason: "available margin" });
  return caps;
}

export function solveMaxSafe(input: PreflightInput, safetyBuffer: number): SizeSolution {
  const { trade } = input;
  const { daily, dd } = rooms(input);
  const ref = trade.entryType === "limit" ? trade.limitPrice! : input.stats.markPrice ?? input.quote.mid ?? trade.stopPrice;
  const caps = sizeCaps(input, ref);
  const platformCap = caps.reduce((m, c) => (c.size < m.size ? c : m), { size: Infinity, reason: "none" });

  const roomList = [
    { room: daily, name: "daily loss room" },
    { room: dd, name: "max drawdown room" },
  ].filter((r) => r.room != null) as { room: number; name: string }[];
  if (roomList.length === 0) return { maxSafeSize: 0, maxSafeNotional: 0, bindingConstraint: "risk snapshot unavailable", riskAtMaxSafe: 0 };

  const fits = (s: number) => {
    const r = evaluateScenario(input, s, "stress");
    return roomList.every(({ room }) => r.totalLoss <= room * (1 - safetyBuffer));
  };

  if (!fits(0)) {
    return { maxSafeSize: 0, maxSafeNotional: 0, bindingConstraint: "existing exposure already uses the safe room", riskAtMaxSafe: 0 };
  }
  // Binary search; loss is monotonic in size.
  let lo = 0;
  let hi = Number.isFinite(platformCap.size) ? platformCap.size : 1;
  if (!Number.isFinite(platformCap.size)) while (fits(hi) && hi < 1e12) hi *= 2;
  let riskBound = !fits(hi);
  if (!riskBound) lo = hi;
  else {
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) lo = mid;
      else hi = mid;
    }
  }
  const size = floorToDecimals(lo, trade.market.sizeDecimals);
  let binding: string;
  if (riskBound) {
    const r = evaluateScenario(input, hi, "stress");
    const worst = roomList.reduce((w, x) => (x.room - r.totalLoss < w.room - r.totalLoss ? x : w));
    binding = `stress loss vs ${worst.name}`;
  } else binding = platformCap.reason;
  return {
    maxSafeSize: size,
    maxSafeNotional: size * ref,
    bindingConstraint: binding,
    riskAtMaxSafe: size > 0 ? tradeLoss(input, size, "stress").total : 0,
  };
}

function resolveSize(input: PreflightInput, safetyBuffer: number, maxSafe: SizeSolution): number {
  const t = input.trade;
  if (t.size != null && t.size > 0) return floorToDecimals(t.size, t.market.sizeDecimals);
  if (t.riskUsd != null && t.riskUsd > 0) {
    // Size so the *typical* stop-out costs riskUsd, fees and gap included.
    let lo = 0;
    let hi = 1;
    while (tradeLoss(input, hi, "typical").total < t.riskUsd && hi < 1e12) hi *= 2;
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2;
      if (tradeLoss(input, mid, "typical").total <= t.riskUsd) lo = mid;
      else hi = mid;
    }
    return floorToDecimals(lo, t.market.sizeDecimals);
  }
  void safetyBuffer;
  return maxSafe.maxSafeSize;
}

export function liquidationPrice(input: PreflightInput, size: number, entry: number): number | null {
  const { trade, policy, account, positions } = input;
  const mmr = policy.maintenanceMarginRatioBps / BPS;
  const isLong = trade.side === "buy";
  if (size <= 0) return null;
  if (trade.marginMode === "isolated") {
    const l = trade.leverage;
    return isLong ? entry * (1 - 1 / l + mmr) : entry * (1 + 1 / l - mmr);
  }
  // Cross: price at which account equity falls to total maintenance margin,
  // holding other positions at their marks.
  const eq = account.equity ?? account.balance;
  const mm = positions.reduce((a, p) => a + p.markPrice * p.size * mmr, 0) + entry * size * mmr;
  const cushion = eq - mm;
  if (cushion <= 0) return entry;
  const px = isLong ? entry - cushion / size : entry + cushion / size;
  return px > 0 ? px : null;
}

function gates(input: PreflightInput, size: number, entry: number, liq: number | null, stressExit: number): Gate[] {
  const g: Gate[] = [];
  const { account, policy, trade, positions, quote, stats } = input;
  const block = (id: string, message: string) => g.push({ id, severity: "block", message });
  const warn = (id: string, message: string) => g.push({ id, severity: "warn", message });
  const isLong = trade.side === "buy";
  const notional = entry * size;

  if (account.status !== "active") block("account-status", `Account is ${account.status}; it cannot take new orders.`);
  if (policy.manualTradingBlocked) block("manual-blocked", "Manual trading is blocked on this account (inactive, payout pending, or copy lock).");
  if (policy.payoutPending) block("payout-pending", "A payout request is pending; trading is locked until it settles.");
  if (policy.copyFollowerLocked) block("copy-locked", "This account follows a copy group; manual orders are locked.");
  if (policy.openingExposureRestricted) block("opening-restricted", "The account cannot open or increase exposure right now.");
  if (policy.reduceOnlyRestriction) block("reduce-only", `Account is reduce-only: ${policy.reduceOnlyRestriction}`);
  if (policy.platformHalt) block("platform-halt", "Platform-wide opening halt is active.");
  if (policy.haltedCategories.length) {
    const cats = policy.haltedCategories.map((c) => c.toLowerCase());
    if (cats.includes(trade.market.assetClass) || cats.some((c) => trade.market.assetClass === "tradfi" && /stock|commod|ind/.test(c))) {
      block("category-halt", `Market category halted: ${policy.haltedCategories.join(", ")}.`);
    }
  }
  if (policy.competitionAllowlist && policy.competitionAllowlist.length > 0) {
    const ok = policy.competitionAllowlist.some((s) => s === trade.market.coin || s === trade.market.symbol || s === trade.market.marketId);
    if (!ok) block("competition-allowlist", "Market is not on this competition account's allowlist.");
  }
  if (!trade.market.tradingEnabled) block("market-disabled", "Trading is disabled on this market.");
  if (trade.market.reduceOnly) block("market-reduce-only", "This market is reduce-only.");
  if (trade.leverage > trade.market.maxLeverage) block("leverage", `Leverage ${trade.leverage}x exceeds the market max of ${trade.market.maxLeverage}x.`);

  // Stop sanity.
  const refPx = stats.markPrice ?? quote.mid ?? entry;
  if (isLong ? trade.stopPrice >= entry : trade.stopPrice <= entry) block("stop-side", `Stop ${trade.stopPrice} is on the wrong side of entry ${round(entry)} for a ${isLong ? "long" : "short"}.`);
  else if (trade.entryType === "market" && (isLong ? trade.stopPrice >= refPx : trade.stopPrice <= refPx)) block("stop-through-market", "Stop is already through the current price; it would trigger immediately.");

  if (size <= 0) block("size-zero", "Resolved size is zero (no safe size, or risk budget smaller than one size increment).");
  else {
    if (policy.minOrderNotionalUsd && notional < policy.minOrderNotionalUsd) block("min-notional", `Notional $${round(notional)} is below the $${policy.minOrderNotionalUsd} minimum.`);
    const sameMarket = positions.filter((p) => p.market.marketId === trade.market.marketId).reduce((a, p) => a + p.markPrice * p.size, 0);
    if (policy.maxPositionValueUsd && sameMarket + notional > policy.maxPositionValueUsd) block("max-position-value", `Position value would be $${round(sameMarket + notional)}, above the $${policy.maxPositionValueUsd} max.`);
    if (policy.maximumTotalNotionalUsd != null) {
      const gross = account.grossExposure ?? positions.reduce((a, p) => a + p.markPrice * p.size, 0);
      if (gross + notional > policy.maximumTotalNotionalUsd) block("total-notional", `Total exposure would be $${round(gross + notional)}, above the account cap of $${policy.maximumTotalNotionalUsd}.`);
    }
    const opensNew = !positions.some((p) => p.market.marketId === trade.market.marketId);
    if (opensNew && policy.maxOpenPositions && positions.length >= policy.maxOpenPositions) block("max-open-positions", `Already at the ${policy.maxOpenPositions} open-position limit.`);
    const margin = notional / trade.leverage;
    if (margin > account.availableBalance) block("margin", `Needs $${round(margin)} margin; only $${round(account.availableBalance)} available.`);
    if (quote.fillable === false) block("unfillable", `Quote says this size cannot fill (${quote.unfillableReason ?? "unknown"}).`);
  }

  if (liq != null && size > 0) {
    if (isLong ? liq >= trade.stopPrice : liq <= trade.stopPrice) block("liquidation-before-stop", `Estimated liquidation at ${round(liq)} comes before your stop at ${trade.stopPrice}. Lower leverage or tighten the stop.`);
    else if (isLong ? liq >= stressExit : liq <= stressExit) warn("liquidation-near-stop", `In the stress case the stop fills past the estimated liquidation price ${round(liq)}.`);
  }

  if (!account.marksComplete) warn("marks-incomplete", `Account marks are incomplete (${account.missingMarkets.join(", ") || "unknown markets"}); room figures may be stale.`);
  if (account.dailyLossRoom == null && account.maxDrawdownRoom == null) block("no-risk-snapshot", "The account returned no loss-room figures; cannot evaluate breach risk.");
  for (const p of positions) {
    if (p.stopPrice == null || p.stopCoverage < 1) warn("unprotected-position", `${p.market.symbol} ${p.side} ${p.size} has ${p.stopPrice == null ? "no stop" : `a stop on only ${Math.round(p.stopCoverage * 100)}%`}; stress case applies a ${UNPROTECTED_SHOCK[p.market.assetClass] * 100}% shock to the uncovered part.`);
  }
  if (input.gap.sampleSize === 0) warn("no-gap-history", "No candle history for this market; using a conservative default stop-gap.");
  return g;
}

export function preflight(input: PreflightInput): PreflightResult {
  const buffer = input.trade.safetyBuffer ?? 0.1;
  const maxSafe = solveMaxSafe(input, buffer);
  const size = resolveSize(input, buffer, maxSafe);
  const scenarios = Object.fromEntries(SCENARIOS.map((s) => [s, evaluateScenario(input, size, s)])) as Record<Scenario, ScenarioResult>;
  const entry = scenarios.clean.trade.entryPrice;
  const notional = entry * size;
  const liq = liquidationPrice(input, size, entry);
  const gateList = gates(input, size, entry, liq, scenarios.stress.trade.exitPrice);

  const { daily, dd } = rooms(input);
  const minRoom = Math.min(daily ?? Infinity, dd ?? Infinity);
  const stressLeft = Math.min(scenarios.stress.dailyRoomAfter ?? Infinity, scenarios.stress.drawdownRoomAfter ?? Infinity);

  let verdict: Verdict = "GO";
  let headline: string;
  const blocks = gateList.filter((x) => x.severity === "block");
  if (blocks.length) {
    verdict = "NO-GO";
    headline = blocks[0].message;
  } else if (scenarios.clean.breaches || scenarios.typical.breaches) {
    verdict = "NO-GO";
    const s = scenarios.clean.breaches ? scenarios.clean : scenarios.typical;
    headline = `A ${s.scenario === "clean" ? "clean" : "normal"} stop-out costs $${round(s.totalLoss)} and breaches the ${s.breachedFloor} floor.`;
  } else if (scenarios.stress.breaches) {
    verdict = "CAUTION";
    headline = `Survives a normal stop-out, but a fast-market stop fill ($${round(scenarios.stress.totalLoss)}) breaches the ${scenarios.stress.breachedFloor} floor.`;
  } else if (Number.isFinite(minRoom) && stressLeft < minRoom * buffer) {
    verdict = "CAUTION";
    headline = `Stress stop-out leaves only $${round(stressLeft)} above the floor (under your ${Math.round(buffer * 100)}% buffer).`;
  } else if (gateList.some((x) => x.severity === "warn")) {
    verdict = "CAUTION";
    headline = gateList.find((x) => x.severity === "warn")!.message;
  } else {
    headline = `Worst case leaves $${round(stressLeft)} above the nearest floor.`;
  }

  const cleanLoss = scenarios.clean.trade.total;
  const dailyAvail = daily == null ? null : daily - scenarios.clean.existingLoss - scenarios.clean.workingEntriesLoss;
  const stopOutsLeftToday = dailyAvail == null || cleanLoss <= 0 ? null : Math.max(0, Math.floor((dailyAvail - 1e-9) / cleanLoss));

  const reset = nextDailyReset(input.now);
  const refForCap = input.trade.entryType === "limit" ? input.trade.limitPrice! : input.stats.markPrice ?? input.quote.mid ?? entry;
  return {
    verdict,
    headline,
    size,
    notional,
    marginRequired: notional / input.trade.leverage,
    slippageCapBps: slippageCapBps(input.trade.market, refForCap * size, input.stats.openInterestUsd),
    feeRateBps: feeBps(input.trade.market, input.policy.feeExempt),
    liquidationPrice: liq,
    scenarios,
    gates: gateList,
    maxSafe,
    stopOutsLeftToday,
    dailyResetAt: reset,
    msToDailyReset: reset - input.now,
    holdCrossesReset: input.now + input.trade.holdHours * 3_600_000 > reset,
    unprotectedPositions: input.positions.filter((p) => p.stopPrice == null || p.stopCoverage < 1).map((p) => p.id),
    gap: input.gap,
    assumptions: [
      "All open stops are assumed to hit together (worst case, no diversification).",
      "Resting entry orders are assumed to fill, then stop out.",
      "Stops fill past the trigger by the gap model plus the platform's max-slippage cap; the clean case fills exactly at the stop.",
      "Swap assumes the worst-case count of hourly charges for the planned hold.",
      "Floors are inclusive: equity touching a floor counts as a breach.",
      "Daily room is today's; if the hold crosses the NY-midnight reset, the drawdown floor is the one that still binds.",
    ],
  };
}

function round(x: number) {
  return Math.round(x * 100) / 100;
}
