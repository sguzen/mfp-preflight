import type { AccountState, ExistingPosition, GapModel, MarketInfo, PolicyState, PreflightInput, TradeIntent } from "../src/engine/types";

export const BTC: MarketInfo = {
  marketId: "binance|BTCUSDT",
  provider: "binance",
  symbol: "BTC",
  coin: "BTCUSDT",
  sizeDecimals: 3,
  maxLeverage: 10,
  tradingEnabled: true,
  reduceOnly: false,
  assetClass: "crypto",
  majorTradfi: false,
};

export const NAS: MarketInfo = {
  marketId: "hyperliquid|xyz:XYZ100",
  provider: "hyperliquid",
  symbol: "XYZ100",
  coin: "xyz:XYZ100",
  sizeDecimals: 4,
  maxLeverage: 20,
  tradingEnabled: true,
  reduceOnly: false,
  assetClass: "tradfi",
  majorTradfi: true,
};

export const GAP: GapModel = { typicalBps: 2, stressBps: 20, source: "fixture", sampleSize: 1000 };

// $100k 1-Step Signature-like account: 3% daily ($3,000), 6% static DD ($6,000).
// Down $1,000 today, so daily room $2,000 and drawdown room $5,000.
export function account(over: Partial<AccountState> = {}): AccountState {
  return {
    id: "acc_1",
    stage: "evaluation",
    status: "active",
    startingBalance: 100_000,
    balance: 99_000,
    equity: 99_000,
    availableBalance: 99_000,
    grossExposure: 0,
    dailyLossFloor: 97_000,
    maxDrawdownFloor: 94_000,
    dailyLossRoom: 2_000,
    maxDrawdownRoom: 5_000,
    remainingProfit: 11_000,
    marksComplete: true,
    missingMarkets: [],
    ...over,
  };
}

export function policy(over: Partial<PolicyState> = {}): PolicyState {
  return {
    manualTradingBlocked: false,
    openingExposureRestricted: false,
    payoutPending: false,
    copyFollowerLocked: false,
    feeExempt: false,
    reduceOnlyRestriction: null,
    platformHalt: false,
    haltedCategories: [],
    competitionAllowlist: null,
    maxOpenPositions: 10,
    maxPositionValueUsd: 1_000_000,
    minOrderNotionalUsd: 10,
    maintenanceMarginRatioBps: 50,
    liquidationFeeBps: 50,
    maximumTotalNotionalUsd: null,
    marketSlippageMaxBps: {},
    ...over,
  };
}

export function trade(over: Partial<TradeIntent> = {}): TradeIntent {
  return {
    market: BTC,
    side: "buy",
    entryType: "limit",
    limitPrice: 100_000,
    stopPrice: 99_000,
    size: 1,
    leverage: 5,
    marginMode: "cross",
    holdHours: 2,
    ...over,
  };
}

export function input(over: Partial<PreflightInput> = {}): PreflightInput {
  return {
    now: Date.parse("2026-10-05T05:58:00Z"),
    account: account(),
    policy: policy(),
    trade: trade(),
    quote: { bid: 99_999.9, ask: 100_000.1, mid: 100_000 },
    stats: { markPrice: 100_000, openInterestUsd: 8e9 },
    gap: GAP,
    positions: [],
    workingEntries: [],
    ...over,
  };
}

export function position(over: Partial<ExistingPosition> = {}): ExistingPosition {
  return {
    id: "pos_1",
    market: BTC,
    side: "long",
    size: 0.5,
    entryPrice: 100_000,
    markPrice: 100_000,
    stopPrice: 99_500,
    stopCoverage: 1,
    gap: GAP,
    openInterestUsd: 8e9,
    ...over,
  };
}
