import { CampaignPlanDraftSchema, ProviderBatchResultSchema } from "./schema.ts";
import { validateCampaignPlanDraft } from "./validation.ts";
import type {
  CampaignPlannerInput,
  CampaignPlanDraft,
  CampaignPlanStrategySlot,
  PlannerValidationResult,
  ProviderBatchResult,
  ProviderBatchItemOutput,
  ValidationIssue
} from "./types.ts";

function issue(code: string, message: string, path: string | null): ValidationIssue {
  return { code, message, path };
}

function successResult(draft: CampaignPlanDraft, errors: ValidationIssue[], warnings: ValidationIssue[]): PlannerValidationResult {
  return {
    draft,
    errors,
    warnings,
    summary: {
      valid: errors.length === 0,
      error_count: errors.length,
      warning_count: warnings.length
    }
  };
}

function failureResult(errors: ValidationIssue[], warnings: ValidationIssue[] = []): PlannerValidationResult {
  return {
    draft: null,
    errors,
    warnings,
    summary: {
      valid: false,
      error_count: errors.length,
      warning_count: warnings.length
    }
  };
}

export function consolidateCampaignPlan(
  input: CampaignPlannerInput,
  strategySlots: CampaignPlanStrategySlot[],
  providerResults: ProviderBatchResult[]
): PlannerValidationResult {
  const parseErrors: ValidationIssue[] = [];
  const outputs = new Map<number, ProviderBatchItemOutput>();
  const expectedSequences = new Set(strategySlots.map((slot) => slot.draft_sequence));

  for (const [batchIndex, result] of providerResults.entries()) {
    const parsed = ProviderBatchResultSchema.safeParse(result);
    if (!parsed.success) {
      parseErrors.push(...parsed.error.issues.map((item) => issue("provider_schema_invalid", item.message, `provider_results.${batchIndex}.${item.path.join(".")}`)));
      continue;
    }
    for (const item of parsed.data.items) {
      if (!expectedSequences.has(item.draft_sequence)) {
        parseErrors.push(issue("unknown_draft_sequence", "Provider mengembalikan draft_sequence yang tidak diminta.", `draft_sequence.${item.draft_sequence}`));
        continue;
      }
      if (outputs.has(item.draft_sequence)) {
        parseErrors.push(issue("duplicate_provider_sequence", "Provider mengembalikan draft_sequence duplikat.", `draft_sequence.${item.draft_sequence}`));
        continue;
      }
      outputs.set(item.draft_sequence, item);
    }
  }

  for (const slot of strategySlots) {
    if (!outputs.has(slot.draft_sequence)) {
      parseErrors.push(issue("missing_provider_sequence", "Provider tidak mengembalikan item untuk strategy slot.", `draft_sequence.${slot.draft_sequence}`));
    }
  }

  if (parseErrors.length) {
    return failureResult(parseErrors);
  }

  const draft: CampaignPlanDraft = {
    plan_summary: `Draft rencana ${input.requested_content_count} konten untuk campaign ${input.campaign.code}.`,
    requested_content_count: input.requested_content_count,
    items: strategySlots.map((slot) => {
      const creative = outputs.get(slot.draft_sequence)!;
      return {
        draft_sequence: slot.draft_sequence,
        planned_content_date: slot.planned_content_date,
        title: creative.title,
        product_code: slot.product_code,
        school_level: creative.school_level,
        color_code: creative.color_code,
        audience_segment: slot.audience_segment,
        target_audience: creative.target_audience,
        content_pillar: slot.content_pillar,
        primary_offer_code: slot.primary_offer_code,
        primary_pain_point_code: slot.primary_pain_point_code,
        hook: creative.hook,
        angle: creative.angle,
        cta_text: creative.cta_text,
        cta_keyword: creative.cta_keyword,
        planning_reason: creative.planning_reason,
        publications: slot.publications.map((publication) => ({
          channel: publication.channel,
          publication_format: publication.publication_format,
          planned_publish_at: publication.planned_publish_at,
          platform_title: publication.channel === "youtube" ? creative.youtube_title : null,
          platform_caption: null
        }))
      };
    })
  };

  const parsedDraft = CampaignPlanDraftSchema.safeParse(draft);
  if (!parsedDraft.success) {
    return failureResult(parsedDraft.error.issues.map((item) => issue("final_schema_invalid", item.message, item.path.join("."))));
  }

  const validation = validateCampaignPlanDraft(input, parsedDraft.data);
  return successResult(parsedDraft.data, validation.errors, validation.warnings);
}
