import { ctaKeywordPattern, schoolLevels } from "../../../../packages/campaign-planner/src/index.ts";
import { CampaignPlanReviewError } from "../campaign-plan-review-errors.ts";

export type DraftItemEditInput = {
  expected_revision_number: number;
  title?: string;
  school_level?: string | null;
  color_code?: string | null;
  target_audience?: string;
  hook?: string;
  angle?: string;
  cta_text?: string;
  cta_keyword?: string | null;
  planning_reason?: string;
  owner_notes?: string | null;
  youtube_platform_title?: string | null;
};

export type DraftItemDecisionInput = {
  expected_revision_number: number;
  owner_notes?: string | null;
};

const schoolLevelSet = new Set<string>(schoolLevels);
const immutableItemFields = new Set([
  "run_id",
  "draft_sequence",
  "planned_content_date",
  "product_code",
  "audience_segment",
  "content_pillar",
  "primary_offer_code",
  "primary_pain_point_code"
]);
const immutablePublicationFields = new Set([
  "draft_item_id",
  "channel",
  "publication_format",
  "planned_publish_at",
  "platform_caption"
]);

function hasOwn(input: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(input, key);
}

export function assertNoImmutableCampaignPlanStrategy(input: Record<string, unknown>): void {
  for (const key of Object.keys(input)) {
    if (immutableItemFields.has(key) || immutablePublicationFields.has(key)) {
      throw new CampaignPlanReviewError("immutable_campaign_plan_strategy", "Field strategy tidak boleh diubah pada review draft.", 400);
    }
  }

  if (Array.isArray(input.publications)) {
    for (const publication of input.publications) {
      if (!publication || typeof publication !== "object") continue;
      for (const key of Object.keys(publication as Record<string, unknown>)) {
        if (immutablePublicationFields.has(key)) {
          throw new CampaignPlanReviewError("immutable_campaign_plan_strategy", "Field publication strategy tidak boleh diubah.", 400);
        }
      }
    }
  }
}

function parseExpectedRevision(input: Record<string, unknown>): number {
  const raw = input.expected_revision_number;
  const revision = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isInteger(revision) || revision < 0) {
    throw new CampaignPlanReviewError("stale_draft_revision", "Expected revision number wajib berupa angka valid.", 409);
  }
  return revision;
}

function nullableTrimmed(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function requiredText(input: Record<string, unknown>, key: string, code: string, maxLength: number): string | undefined {
  if (!hasOwn(input, key)) return undefined;
  const value = String(input[key] ?? "").trim();
  if (!value || value.length > maxLength) {
    throw new CampaignPlanReviewError(code, `Field ${key} tidak valid.`, 400);
  }
  return value;
}

function nullableLimited(input: Record<string, unknown>, key: string, code: string, maxLength: number): string | null | undefined {
  if (!hasOwn(input, key)) return undefined;
  const value = nullableTrimmed(input[key]);
  if (value && value.length > maxLength) {
    throw new CampaignPlanReviewError(code, `Field ${key} terlalu panjang.`, 400);
  }
  return value;
}

export function validateDraftItemEditInput(input: Record<string, unknown>): DraftItemEditInput {
  assertNoImmutableCampaignPlanStrategy(input);
  const values: DraftItemEditInput = {
    expected_revision_number: parseExpectedRevision(input)
  };

  values.title = requiredText(input, "title", "invalid_draft_title", 200);
  if (hasOwn(input, "school_level")) {
    const schoolLevel = nullableTrimmed(input.school_level);
    if (schoolLevel && !schoolLevelSet.has(schoolLevel)) {
      throw new CampaignPlanReviewError("invalid_draft_school_level", "School level tidak valid.", 400);
    }
    values.school_level = schoolLevel;
  }
  values.color_code = nullableLimited(input, "color_code", "invalid_draft_color", 100);
  values.target_audience = requiredText(input, "target_audience", "invalid_draft_target_audience", 500);
  values.hook = requiredText(input, "hook", "invalid_draft_hook", 1000);
  values.angle = requiredText(input, "angle", "invalid_draft_angle", 2000);
  values.cta_text = requiredText(input, "cta_text", "invalid_draft_cta_text", 1000);
  if (hasOwn(input, "cta_keyword")) {
    const keyword = nullableTrimmed(input.cta_keyword)?.toUpperCase() || null;
    if (keyword && (keyword.length > 40 || !ctaKeywordPattern.test(keyword))) {
      throw new CampaignPlanReviewError("invalid_draft_cta_keyword", "CTA keyword harus uppercase dan memakai format valid.", 400);
    }
    values.cta_keyword = keyword;
  }
  values.planning_reason = requiredText(input, "planning_reason", "invalid_draft_planning_reason", 2000);
  values.owner_notes = nullableLimited(input, "owner_notes", "invalid_owner_notes", 3000);
  if (hasOwn(input, "youtube_platform_title")) {
    const title = String(input.youtube_platform_title ?? "").trim();
    if (!title || title.length > 200) {
      throw new CampaignPlanReviewError("youtube_title_required", "YouTube platform title wajib diisi maksimal 200 karakter.", 400);
    }
    values.youtube_platform_title = title;
  }

  return values;
}

export function validateDraftItemDecisionInput(input: Record<string, unknown>): DraftItemDecisionInput {
  assertNoImmutableCampaignPlanStrategy(input);
  return {
    expected_revision_number: parseExpectedRevision(input),
    owner_notes: nullableLimited(input, "owner_notes", "invalid_owner_notes", 3000)
  };
}

export function valuesFromDraftEditForm(body: Record<string, string>): Record<string, unknown> {
  return {
    expected_revision_number: body.expected_revision_number,
    title: body.title,
    school_level: body.school_level || null,
    color_code: body.color_code || null,
    target_audience: body.target_audience,
    hook: body.hook,
    angle: body.angle,
    cta_text: body.cta_text,
    cta_keyword: body.cta_keyword || null,
    planning_reason: body.planning_reason,
    youtube_platform_title: body.youtube_platform_title,
    owner_notes: body.owner_notes || null
  };
}

export function valuesFromDraftDecisionForm(body: Record<string, string>): Record<string, unknown> {
  return {
    expected_revision_number: body.expected_revision_number,
    owner_notes: body.owner_notes || null
  };
}
