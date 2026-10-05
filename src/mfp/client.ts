// Minimal typed REST client for the MyFundedPerps v1 API.
// Server-side only: the key must never reach a browser.

export class MfpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public requestId?: string,
    public retryAfterSec?: number,
  ) {
    super(`${status} ${code}: ${message}`);
  }
}

export interface MfpClientOptions {
  apiKey: string;
  baseUrl?: string;
  /** Retries on 429/503 honoring Retry-After. */
  maxRetries?: number;
  fetchImpl?: typeof fetch;
}

const LIVE = "https://developers.myfundedperpetuals.com";
const SANDBOX = "https://sandbox.myfundedperpetuals.com";

export class MfpClient {
  readonly baseUrl: string;
  private readonly key: string;
  private readonly maxRetries: number;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: MfpClientOptions) {
    if (!opts.apiKey) throw new Error("MFP API key missing");
    this.key = opts.apiKey;
    // Test keys only authenticate on the sandbox host; pick it automatically.
    this.baseUrl = (opts.baseUrl ?? (opts.apiKey.startsWith("fp_test_") ? SANDBOX : LIVE)).replace(/\/+$/, "");
    this.maxRetries = opts.maxRetries ?? 2;
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  static fromEnv(env: NodeJS.ProcessEnv = process.env): MfpClient {
    return new MfpClient({ apiKey: env.MFP_API_KEY ?? "", baseUrl: env.MFP_BASE_URL || undefined });
  }

  get environment(): "sandbox" | "live" {
    return this.baseUrl.includes("sandbox") ? "sandbox" : "live";
  }

  private async get<T>(path: string, query?: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(this.baseUrl + path);
    for (const [k, v] of Object.entries(query ?? {})) if (v !== undefined) url.searchParams.set(k, String(v));
    for (let attempt = 0; ; attempt++) {
      const res = await this.fetchImpl(url, { headers: { Authorization: `Bearer ${this.key}`, Accept: "application/json" } });
      if (res.ok) return (await res.json()) as T;
      const retryAfter = Number(res.headers.get("retry-after")) || undefined;
      let body: any = {};
      try {
        body = await res.json();
      } catch {
        /* non-JSON error */
      }
      const err = new MfpError(res.status, body?.error?.code ?? "http_error", body?.error?.message ?? res.statusText, body?.error?.request_id ?? res.headers.get("x-request-id") ?? undefined, retryAfter);
      if ((res.status === 429 || res.status === 503) && attempt < this.maxRetries) {
        await new Promise((r) => setTimeout(r, Math.min(10, retryAfter ?? 1) * 1000));
        continue;
      }
      throw err;
    }
  }

  listAccounts() {
    return this.get<{ data: any[] }>("/v1/accounts").then((r) => r.data);
  }
  getAccount(id: string) {
    return this.get<{ data: any }>(`/v1/accounts/${encodeURIComponent(id)}`).then((r) => r.data);
  }
  getTradingPolicy(id: string) {
    return this.get<{ data: any }>(`/v1/accounts/${encodeURIComponent(id)}/trading-policy`).then((r) => r.data);
  }
  listMarkets() {
    return this.get<{ data: any[] }>("/v1/markets").then((r) => r.data);
  }
  getMarket(marketId: string) {
    return this.get<{ data: any }>(`/v1/markets/${encodeURIComponent(marketId)}`).then((r) => r.data);
  }
  getQuote(marketId: string, side?: "buy" | "sell", size?: number) {
    return this.get<{ data: any }>(`/v1/markets/${encodeURIComponent(marketId)}/quote`, { side, size }).then((r) => r.data);
  }
  listPositions(accountId: string) {
    return this.get<{ data: any[] }>("/v1/positions", { account_id: accountId }).then((r) => r.data);
  }
  listOrders(accountId: string, cursor?: string) {
    return this.get<{ data: any[]; has_more: boolean; next_cursor?: string }>("/v1/orders", { account_id: accountId, cursor });
  }
}
