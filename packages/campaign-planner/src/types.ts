import type { z } from "zod";
import type {
  CampaignPlanDraftSchema,
  CampaignPlannerInputSchema,
  CampaignPlanStrategySlotSchema,
  ProviderBatchItemOutputSchema,
  ProviderBatchResultSchema,
  ValidationIssueSchema,
  ValidationSummarySchema
} from "./schema.ts";

export type PlannerChannel = z.infer<typeof CampaignPlannerInputSchema>["selected_channels"][number];
export type CampaignPlannerInput = z.infer<typeof CampaignPlannerInputSchema>;
export type CampaignPlanStrategySlot = z.infer<typeof CampaignPlanStrategySlotSchema>;
export type ProviderBatchItemOutput = z.infer<typeof ProviderBatchItemOutputSchema>;
export type ProviderBatchResult = z.infer<typeof ProviderBatchResultSchema>;
export type CampaignPlanDraft = z.infer<typeof CampaignPlanDraftSchema>;
export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;
export type ValidationSummary = z.infer<typeof ValidationSummarySchema>;

export type PlannerValidationResult = {
  draft: CampaignPlanDraft | null;
  summary: ValidationSummary;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
};

export type ProviderUsage = {
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens?: number | null;
} | null;
