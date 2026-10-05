// Domain types for the preflight engine. All prices in quote currency (USD),
// sizes in base units, timestamps in Unix ms. Engine code is pure: no I/O.

export type AssetClass = "crypto" | "fx" | "tradfi";
export type OrderSide = "buy" | "sell";
export type Scenario = "clean" | "typical" | "stress";
export const SCENARIOS: Scenario[] = ["clean", "typical", "stress"];

export interface MarketInfo {
  marketId: string;
  provider: string;
  symbol: string;
  coin: string;
  sizeDecimals: number;
  maxLeverage: number;
  tradingEnabled: boolean;
  reduceOnly: boolean;
  assetClass: AssetClass;
  /** Major index/commodity slippage schedule (NAS100, SP500, GOLD, SILVER, CL, BRENTOIL). */
  majorTradfi: boolean;
}

export interface MarketStats {
  markPrice: number | null;
  openInterestUsd: number | null;
}

/** Adverse overshoot past a stop trigger before the fill, in basis points. */
export interface GapModel {
  typicalBps: number;
  stressBps: number;
  /** Where the numbers came from, shown to the user. */
  source: string;
  sampleSize: number;
}

export interface QuoteInfo {
  bid: number | null;
  ask: number | null;
  mid: number | null;
  estimatedFillPrice?: number;
  estimatedFee?: number;
  feeBps?: number;
  fillable?: boolean;
  unfillableReason?: string;
}

export interface AccountState {
  id: string;
  stage: "evaluation" | "funded";
  status: "active" | "passed" | "failed" | "closed";
  startingBalance: number;
  balance: number;
  equity: number | null;
  availableBalance: number;
  grossExposure: number | null;
  dailyLossFloor: number | null;
  maxDrawdownFloor: number | null;
  dailyLossRoom: number | null;
  maxDrawdownRoom: number | null;
  remainingProfit: number | null;
  marksComplete: boolean;
  missingMarkets: string[];
}

export interface PolicyState {
  manualTradingBlocked: boolean;
  openingExposureRestricted: boolean;
  payoutPending: boolean;
  copyFollowerLocked: boolean;
  feeExempt: boolean;
  reduceOnlyRestriction: string | null;
  platformHalt: boolean;
  haltedCategories: string[];
  competitionAllowlist: string[] | null;
  maxOpenPositions: number | null;
  maxPositionValueUsd: number | null;
  minOrderNotionalUsd: number | null;
  maintenanceMarginRatioBps: number;
  liquidationFeeBps: number;
  maximumTotalNotionalUsd: number | null;
  /** Server-enforced max slippage for market orders by provider, bps. */
  marketSlippageMaxBps: Record<string, number>;
}

export interface ExistingPosition {
  id: string;
  market: MarketInfo;
  side: "long" | "short";
  size: number;
  entryPrice: number;
  markPrice: number;
  /** Trigger of the working reduce-only stop covering this position, if any. */
  stopPrice: number | null;
  /** Fraction of the position the stop covers (0..1). */
  stopCoverage: number;
  gap: GapModel;
  openInterestUsd: number | null;
}

/** A resting entry (non-reduce-only) that would add exposure if it fills. */
export interface WorkingEntry {
  id: string;
  market: MarketInfo;
  side: OrderSide;
  size: number;
  limitPrice: number;
  stopPrice: number | null;
  gap: GapModel;
  openInterestUsd: number | null;
}

export interface TradeIntent {
  market: MarketInfo;
  side: OrderSide;
  entryType: "market" | "limit";
  /** Required for limit entries. */
  limitPrice?: number;
  stopPrice: number;
  /** Either size or riskUsd. If both, size wins. */
  size?: number;
  riskUsd?: number;
  leverage: number;
  marginMode: "cross" | "isolated";
  holdHours: number;
  /** Fraction of the binding room to keep untouched in the stress case. Default 0.1. */
  safetyBuffer?: number;
}

export interface PreflightInput {
  now: number;
  account: AccountState;
  policy: PolicyState;
  trade: TradeIntent;
  quote: QuoteInfo;
  stats: MarketStats;
  gap: GapModel;
  positions: ExistingPosition[];
  workingEntries: WorkingEntry[];
}

export type GateSeverity = "block" | "warn";
export interface Gate {
  id: string;
  severity: GateSeverity;
  message: string;
}

export interface LossBreakdown {
  entryPrice: number;
  exitPrice: number;
  priceLoss: number;
  entryFee: number;
  exitFee: number;
  swap: number;
  total: number;
}

export interface ScenarioResult {
  scenario: Scenario;
  trade: LossBreakdown;
  existingLoss: number;
  workingEntriesLoss: number;
  totalLoss: number;
  dailyRoomAfter: number | null;
  drawdownRoomAfter: number | null;
  breaches: boolean;
  breachedFloor: "daily" | "drawdown" | null;
}

export interface SizeSolution {
  maxSafeSize: number;
  maxSafeNotional: number;
  bindingConstraint: string;
  riskAtMaxSafe: number;
}

export type Verdict = "GO" | "CAUTION" | "NO-GO";

export interface PreflightResult {
  verdict: Verdict;
  headline: string;
  size: number;
  notional: number;
  marginRequired: number;
  slippageCapBps: number;
  feeRateBps: number;
  liquidationPrice: number | null;
  scenarios: Record<Scenario, ScenarioResult>;
  gates: Gate[];
  maxSafe: SizeSolution;
  /** How many more clean stop-outs of this exact trade fit in today's room. */
  stopOutsLeftToday: number | null;
  dailyResetAt: number;
  msToDailyReset: number;
  holdCrossesReset: boolean;
  unprotectedPositions: string[];
  gap: GapModel;
  assumptions: string[];
}
