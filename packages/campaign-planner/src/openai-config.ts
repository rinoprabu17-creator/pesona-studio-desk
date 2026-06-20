import { existsSync, readFileSync } from "node:fs";

export const defaultPromptVersion = "campaign-planner-v1";
export const fakeModelName = "fake-campaign-planner-v1";
export const supportedCampaignPlannerProviders = ["fake", "openai"] as const;

export type CampaignPlannerProviderName = (typeof supportedCampaignPlannerProviders)[number];

export type CampaignPlannerRuntimeConfig = {
  provider: CampaignPlannerProviderName;
  openaiEnabled: boolean;
  promptVersion: string;
  openaiModel: string | null;
  openaiTimeoutMs: number;
  openaiMaxOutputTokens: number;
};

export type OpenAISecretConfig = {
  apiKey: string;
  source: "file" | "env";
};

function integerEnv(name: string, fallback: number, options: { min: number; max: number }): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < options.min || parsed > options.max) {
    throw new Error(`invalid_${name.toLowerCase()}`);
  }
  return parsed;
}

function booleanEnv(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  if (raw === "true") return true;
  if (raw === "false") return false;
  throw new Error(`invalid_${name.toLowerCase()}`);
}

export function loadCampaignPlannerRuntimeConfig(overrides: Partial<CampaignPlannerRuntimeConfig> = {}): CampaignPlannerRuntimeConfig {
  const provider = overrides.provider ?? (process.env.CAMPAIGN_PLANNER_PROVIDER || "fake");
  if (provider !== "fake" && provider !== "openai") {
    throw new Error("campaign_planner_provider_unavailable");
  }

  const promptVersion = overrides.promptVersion ?? process.env.CAMPAIGN_PLANNER_PROMPT_VERSION ?? defaultPromptVersion;
  if (!promptVersion.trim()) {
    throw new Error("invalid_campaign_planner_prompt_version");
  }

  const openaiEnabled = overrides.openaiEnabled ?? booleanEnv("CAMPAIGN_PLANNER_OPENAI_ENABLED", false);
  const openaiModel = overrides.openaiModel ?? (process.env.OPENAI_MODEL || null);
  const openaiTimeoutMs = overrides.openaiTimeoutMs ?? integerEnv("OPENAI_TIMEOUT_MS", 120000, { min: 10000, max: 600000 });
  const openaiMaxOutputTokens = overrides.openaiMaxOutputTokens ?? integerEnv("OPENAI_MAX_OUTPUT_TOKENS", 5000, { min: 512, max: 20000 });

  if (provider === "openai" && (!openaiEnabled || !openaiModel?.trim())) {
    throw new Error("campaign_planner_provider_unavailable");
  }

  return {
    provider,
    openaiEnabled,
    promptVersion,
    openaiModel: openaiModel?.trim() || null,
    openaiTimeoutMs,
    openaiMaxOutputTokens
  };
}

export function resolveOpenAISecret(): OpenAISecretConfig {
  const filePath = process.env.OPENAI_API_KEY_FILE;
  if (filePath) {
    if (!existsSync(filePath)) {
      throw new Error("campaign_planner_provider_unavailable");
    }
    const apiKey = readFileSync(filePath, "utf8").trim();
    if (!apiKey) {
      throw new Error("campaign_planner_provider_unavailable");
    }
    return { apiKey, source: "file" };
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("campaign_planner_provider_unavailable");
  }
  return { apiKey, source: "env" };
}
