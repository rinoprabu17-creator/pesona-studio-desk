import { hostname } from "node:os";

export type CampaignPlannerWorkerConfig = {
  provider: string;
  pollMs: number;
  leaseSeconds: number;
  maxAttempts: number;
  batchSize: number;
  workerId: string;
  fakeMode: string;
  heartbeatIntervalMs: number;
  providerFactory?: (mode: string) => {
    providerName: string;
    generateBatch(input: any): Promise<any>;
  };
  finalizeFailAfterDraftItems?: number | null;
};

export function workerId(): string {
  return `${hostname()}-${process.pid}`;
}

const fakeModes = new Set([
  "valid",
  "invalid_enum",
  "invalid_date_reference",
  "duplicate_hook",
  "missing_youtube_title",
  "forbidden_claim",
  "refusal",
  "timeout",
  "malformed",
  "partial_output"
]);

function integerEnv(name: string, fallback: number, options: { min?: number; max?: number } = {}): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const parsed = Number(raw);
  const min = options.min ?? 1;
  if (!Number.isInteger(parsed) || parsed < min || (options.max !== undefined && parsed > options.max)) {
    throw new Error(`invalid_${name.toLowerCase()}`);
  }
  return parsed;
}

export function loadWorkerConfig(overrides: Partial<CampaignPlannerWorkerConfig> = {}): CampaignPlannerWorkerConfig {
  const provider = overrides.provider ?? process.env.CAMPAIGN_PLANNER_PROVIDER ?? "fake";
  if (provider !== "fake") {
    throw new Error("campaign_planner_provider_unavailable");
  }

  const fakeMode = overrides.fakeMode ?? process.env.CAMPAIGN_PLANNER_FAKE_MODE ?? "valid";
  if (!fakeModes.has(fakeMode)) {
    throw new Error("invalid_campaign_planner_fake_mode");
  }

  const leaseSeconds = overrides.leaseSeconds ?? integerEnv("CAMPAIGN_PLANNER_LEASE_SECONDS", 60);
  const heartbeatIntervalMs = overrides.heartbeatIntervalMs ?? Math.max(100, Math.floor((leaseSeconds * 1000) / 3));

  return {
    provider,
    pollMs: overrides.pollMs ?? integerEnv("CAMPAIGN_PLANNER_POLL_MS", 2000),
    leaseSeconds,
    maxAttempts: overrides.maxAttempts ?? integerEnv("CAMPAIGN_PLANNER_MAX_ATTEMPTS", 3),
    batchSize: overrides.batchSize ?? integerEnv("CAMPAIGN_PLANNER_BATCH_SIZE", 5, { min: 1, max: 10 }),
    workerId: overrides.workerId ?? workerId(),
    fakeMode,
    heartbeatIntervalMs,
    providerFactory: overrides.providerFactory,
    finalizeFailAfterDraftItems: overrides.finalizeFailAfterDraftItems ?? null
  };
}
