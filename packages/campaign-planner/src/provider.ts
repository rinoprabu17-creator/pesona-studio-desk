import type { CampaignPlannerInput, CampaignPlanStrategySlot, ProviderBatchResult } from "./types.ts";

export type CampaignPlannerProviderBatchInput = {
  run_id: string | null;
  batch_index: number;
  campaign: CampaignPlannerInput["campaign"];
  knowledge: Pick<CampaignPlannerInput, "products" | "colors" | "school_level_defaults" | "offers" | "pain_points">;
  strategy_slots: CampaignPlanStrategySlot[];
  owner_brief: string | null;
};

export class CampaignPlannerProviderError extends Error {
  code: string;
  retryable: boolean;
  details: Record<string, unknown> | null;

  constructor(code: string, message: string, options: { retryable?: boolean; details?: Record<string, unknown> } = {}) {
    super(message);
    this.name = "CampaignPlannerProviderError";
    this.code = code;
    this.retryable = Boolean(options.retryable);
    this.details = options.details || null;
  }
}

export interface CampaignPlannerProvider {
  providerName: string;
  generateBatch(input: CampaignPlannerProviderBatchInput): Promise<ProviderBatchResult>;
}
