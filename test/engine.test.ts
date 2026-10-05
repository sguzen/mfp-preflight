import { describe, expect, it } from "vitest";
import { classifyMarket, slippageCapBps, swapCost } from "../src/engine/costs";
import { gapFromMinuteBars, gapFromSecondBars, quantile, type Bar } from "../src/engine/gap";
import { positionLoss, preflight, tradeLoss } from "../src/engine/preflight";
import { nextDailyReset } from "../src/engine/time";
import { BTC, GAP, NAS, account, input, policy, position, trade } from "./fixtures";

describe("costs", () => {
  it("classifies venues", () => {
    expect(classifyMarket("binance", "BTCUSDT")).toEqual({ assetClass: "crypto", majorTradfi: false });
    expect(classifyMarket("hyperliquid", "xyz:XYZ100")).toEqual({ assetClass: "tradfi", majorTradfi: true });
    expect(classifyMarket("hyperliquid", "xyz:GOLD")).toEqual({ assetClass: "tradfi", majorTradfi: true });
    expect(classifyMarket("hyperliquid", "xyz:AAPL")).toEqual({ assetClass: "tradfi", majorTradfi: false });
    expect(classifyMarket("hyperliquid", "xyz:EUR")).toEqual({ assetClass: "fx", majorTradfi: false });
    expect(classifyMarket("hyperliquid", "CASHCAT")).toEqual({ assetClass: "crypto", majorTradfi: false });
  });

  it("matches the published slippage schedule", () => {
    expect(slippageCapBps(BTC, 50_000, 8e9)).toBe(0.8);
    expect(slippageCapBps(BTC, 300_000, 8e9)).toBe(1.2);
    expect(slippageCapBps(BTC, 600_000, 8e9)).toBe(2.0);
    expect(slippageCapBps(BTC, 50_000, 50e6)).toBe(2.0);
    expect(slippageCapBps(BTC, 50_000, null)).toBe(6.0); // unknown OI -> most conservative
    expect(slippageCapBps(NAS, 150_000, null)).toBe(0.5);
    expect(slippageCapBps({ assetClass: "fx", majorTradfi: false }, 2e6, null)).toBe(0.15);
  });

  it("charges swap per hourly boundary (docs example: $10k crypto, 24 charges = $3)", () => {
    expect(swapCost(10_000, "crypto", 24)).toBeCloseTo(3, 10);
    expect(swapCost(10_000, "crypto", 0.1)).toBeCloseTo(0.125, 10); // can pay one charge immediately
    expect(swapCost(10_000, "crypto", 0)).toBe(0);
    expect(swapCost(10_000, "crypto", 24, true)).toBe(0);
  });
});

describe("trade loss", () => {
  it("clean stop-out: price loss + both fees + swap", () => {
    const l = tradeLoss(input(), 1, "clean");
    expect(l.exitPrice).toBe(99_000);
    expect(l.priceLoss).toBeCloseTo(1000, 6);
    expect(l.entryFee).toBeCloseTo(30, 6);
    expect(l.exitFee).toBeCloseTo(29.7, 6);
    expect(l.swap).toBeCloseTo(2.5, 6);
    expect(l.total).toBeCloseTo(1062.2, 6);
  });

  it("typical and stress add gap + slippage cap past the stop", () => {
    expect(tradeLoss(input(), 1, "typical").exitPrice).toBeCloseTo(98_972.28, 6);
    expect(tradeLoss(input(), 1, "typical").total).toBeCloseTo(1089.911684, 5);
    expect(tradeLoss(input(), 1, "stress").exitPrice).toBeCloseTo(98_794.08, 6);
    expect(tradeLoss(input(), 1, "stress").total).toBeCloseTo(1268.058224, 5);
  });

  it("shorts lose when the stop fills higher", () => {
    const i = input({ trade: trade({ side: "sell", limitPrice: 100_000, stopPrice: 101_000 }) });
    const l = tradeLoss(i, 1, "typical");
    expect(l.exitPrice).toBeCloseTo(101_000 * 1.00028, 6);
    expect(l.priceLoss).toBeCloseTo(101_000 * 1.00028 - 100_000, 6);
  });

  it("market entry uses the depth-walked quote fill", () => {
    const i = input({ trade: trade({ entryType: "market", limitPrice: undefined }), quote: { bid: 99_990, ask: 100_010, mid: 100_000, estimatedFillPrice: 100_015, feeBps: 3 } });
    expect(tradeLoss(i, 1, "clean").entryPrice).toBe(100_015);
  });

  it("market entry without a sized quote follows the mark-cap rule", () => {
    // ask 100_020 is beyond mark*(1+0.8bps)=100_008 -> capped
    const i = input({ trade: trade({ entryType: "market", limitPrice: undefined }), quote: { bid: 99_990, ask: 100_020, mid: 100_005 } });
    expect(tradeLoss(i, 1, "clean").entryPrice).toBeCloseTo(100_008, 6);
  });
});

describe("existing exposure", () => {
  it("costs the move from mark to stop plus exit fee and swap", () => {
    expect(positionLoss(position(), "clean", 2, false)).toBeCloseTo(266.175, 6);
  });
  it("unprotected positions only count in stress, as a shock", () => {
    const p = position({ stopPrice: null, stopCoverage: 0 });
    expect(positionLoss(p, "clean", 2, false)).toBeCloseTo(1.25, 6); // swap only
    expect(positionLoss(p, "stress", 2, false)).toBeCloseTo(1.25 + 50_000 * 0.02 + 15, 6);
  });
});

describe("preflight verdicts", () => {
  it("GO when the stress stop-out leaves more than the buffer", () => {
    const r = preflight(input());
    expect(r.verdict).toBe("GO");
    expect(r.scenarios.stress.dailyRoomAfter).toBeCloseTo(2000 - 1268.058224, 5);
    expect(r.stopOutsLeftToday).toBe(1);
  });

  it("NO-GO when a clean stop-out breaches the daily floor", () => {
    const r = preflight(input({ trade: trade({ size: 2 }) }));
    expect(r.verdict).toBe("NO-GO");
    expect(r.scenarios.clean.breachedFloor).toBe("daily");
  });

  it("CAUTION when only the stress case breaches", () => {
    // Room 1,200: clean 1,062 and typical 1,090 survive, stress 1,268 breaches.
    const r = preflight(input({ account: account({ dailyLossRoom: 1_200, dailyLossFloor: 97_800 }) }));
    expect(r.verdict).toBe("CAUTION");
    expect(r.scenarios.stress.breaches).toBe(true);
    expect(r.scenarios.typical.breaches).toBe(false);
  });

  it("touching the floor exactly is a breach", () => {
    const l = tradeLoss(input(), 1, "clean").total;
    const r = preflight(input({ account: account({ dailyLossRoom: l }) }));
    expect(r.scenarios.clean.breaches).toBe(true);
  });

  it("counts existing stops against the same room", () => {
    const r = preflight(input({ positions: [position()] }));
    expect(r.scenarios.clean.existingLoss).toBeCloseTo(266.175, 6);
    expect(r.scenarios.clean.totalLoss).toBeCloseTo(1062.2 + 266.175, 5);
  });

  it("blocks a stop on the wrong side", () => {
    const r = preflight(input({ trade: trade({ stopPrice: 100_500 }) }));
    expect(r.verdict).toBe("NO-GO");
    expect(r.gates.map((g) => g.id)).toContain("stop-side");
  });

  it("blocks isolated leverage that liquidates before the stop", () => {
    const r = preflight(input({ trade: trade({ marginMode: "isolated", leverage: 10, stopPrice: 90_000, size: 0.01 }) }));
    expect(r.liquidationPrice).toBeCloseTo(90_500, 6);
    expect(r.gates.map((g) => g.id)).toContain("liquidation-before-stop");
  });

  it("blocks account and policy locks", () => {
    expect(preflight(input({ policy: policy({ payoutPending: true }) })).verdict).toBe("NO-GO");
    expect(preflight(input({ policy: policy({ reduceOnlyRestriction: "risk review" }) })).verdict).toBe("NO-GO");
    expect(preflight(input({ account: account({ status: "failed" }) })).verdict).toBe("NO-GO");
    expect(preflight(input({ trade: trade({ leverage: 20 }) })).verdict).toBe("NO-GO");
  });
});

describe("sizing", () => {
  it("max safe size keeps the stress loss within room x (1 - buffer)", () => {
    const r = preflight(input());
    // Daily room 2,000 * 0.9 = 1,800; stress per BTC above $100k notional = 1,272.017...
    expect(r.maxSafe.maxSafeSize).toBe(1.415);
    expect(r.maxSafe.bindingConstraint).toBe("stress loss vs daily loss room");
    expect(tradeLoss(input(), 1.415, "stress").total).toBeLessThanOrEqual(1800);
    expect(tradeLoss(input(), 1.416, "stress").total).toBeGreaterThan(1800);
  });

  it("max safe size respects margin when it binds first", () => {
    const r = preflight(input({ account: account({ availableBalance: 10_000 }), trade: trade({ leverage: 1 }) }));
    expect(r.maxSafe.bindingConstraint).toBe("available margin");
    expect(r.maxSafe.maxSafeSize).toBeLessThan(0.1);
  });

  it("risk-based sizing targets the typical stop-out cost", () => {
    const r = preflight(input({ trade: trade({ size: undefined, riskUsd: 500 }) }));
    expect(r.scenarios.typical.trade.total).toBeLessThanOrEqual(500);
    expect(tradeLoss(input(), r.size + 0.001, "typical").total).toBeGreaterThan(500);
  });

  it("no size and no risk -> uses max safe size", () => {
    const r = preflight(input({ trade: trade({ size: undefined }) }));
    expect(r.size).toBe(r.maxSafe.maxSafeSize);
  });
});

describe("daily reset (America/New_York midnight)", () => {
  it("during EDT resets at 04:00 UTC", () => {
    expect(new Date(nextDailyReset(Date.parse("2026-10-05T05:58:00Z"))).toISOString()).toBe("2026-10-06T04:00:00.000Z");
    expect(new Date(nextDailyReset(Date.parse("2026-10-06T03:59:59Z"))).toISOString()).toBe("2026-10-06T04:00:00.000Z");
  });
  it("across the November DST change", () => {
    expect(new Date(nextDailyReset(Date.parse("2026-10-31T16:00:00Z"))).toISOString()).toBe("2026-11-01T04:00:00.000Z");
    expect(new Date(nextDailyReset(Date.parse("2026-11-01T17:00:00Z"))).toISOString()).toBe("2026-11-02T05:00:00.000Z");
  });
  it("across the March DST change", () => {
    expect(new Date(nextDailyReset(Date.parse("2027-03-14T12:00:00Z"))).toISOString()).toBe("2027-03-15T04:00:00.000Z");
  });
});

describe("gap model", () => {
  const bars: Bar[] = Array.from({ length: 300 }, (_, i) => ({
    openTime: i * 1000,
    open: 100,
    high: 100 + (i % 10 === 0 ? 0.1 : 0.01),
    low: 100,
    close: 100,
    volume: 1,
  }));
  it("typical = median 1s range, stress = p99 window range", () => {
    const g = gapFromSecondBars(bars)!;
    expect(g.typicalBps).toBeCloseTo(1, 6); // 0.01/100 = 1bp
    expect(g.stressBps).toBeCloseTo(10, 6); // windows containing a 0.1 spike
  });
  it("minute fallback scales by sqrt(time)", () => {
    const m = gapFromMinuteBars(bars)!;
    expect(m.typicalBps).toBeCloseTo(Math.round((1 / Math.sqrt(60)) * 100) / 100, 6);
  });
  it("quantile interpolates", () => {
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
  });
  it("fixture gap is used as given", () => {
    expect(GAP.stressBps).toBe(20);
  });
});
