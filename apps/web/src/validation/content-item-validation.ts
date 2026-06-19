import { ContentItemError } from "../content-item-errors.ts";
import { assertUuid, schoolLevels } from "./library-validation.ts";

export type ContentItemInput = {
  campaign_id?: string | null;
  title?: string;
  planned_content_date?: string;
  product_id?: string | null;
  school_level?: string | null;
  color_id?: string | null;
  audience_segment?: string;
  target_audience?: string;
  content_pillar?: string;
  primary_offer_id?: string | null;
  primary_pain_point_id?: string | null;
  hook?: string;
  angle?: string;
  cta_text?: string;
  cta_keyword?: string | null;
  notes?: string | null;
  production_status?: string;
  sequence_number?: unknown;
  content_code?: unknown;
};

export const audienceSegments = ["end_user_school", "agent_marketer", "mixed"] as const;
export const contentPillars = [
  "mockup_magnet",
  "desain_gratis",
  "trust_process",
  "pain_point",
  "product_proof",
  "offer",
  "agent",
  "education"
] as const;
export const productionStatuses = [
  "planned",
  "script_ready",
  "waiting_footage",
  "footage_received",
  "rendering",
  "draft_ready",
  "needs_revision",
  "approved",
  "failed",
  "archived"
] as const;

export const productionTransitions: Record<string, string[]> = {
  planned: ["script_ready", "failed", "archived"],
  script_ready: ["waiting_footage", "failed", "archived"],
  waiting_footage: ["footage_received", "failed", "archived"],
  footage_received: ["rendering", "failed", "archived"],
  rendering: ["draft_ready", "failed", "archived"],
  draft_ready: ["approved", "needs_revision", "failed", "archived"],
  needs_revision: ["rendering", "failed", "archived"],
  approved: ["archived"],
  failed: ["archived"],
  archived: []
};

const ctaKeywordPattern = /^[A-Z0-9]+(?:[-_][A-Z0-9]+)*$/;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNullableText(value: unknown): string | null {
  const text = normalizeText(value);
  return text === "" ? null : text;
}

function validateDate(value: unknown): string {
  const text = normalizeText(value);
  if (!text || !/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new ContentItemError("invalid_planned_content_date", "Tanggal rencana konten wajib valid.", 400);
  }

  const date = new Date(`${text}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text) {
    throw new ContentItemError("invalid_planned_content_date", "Tanggal rencana konten wajib valid.", 400);
  }

  return text;
}

function validateNullableUuid(value: unknown): string | null {
  const id = normalizeNullableText(value);
  if (id) {
    assertUuid(id);
  }
  return id;
}

export function validateContentItemInput(input: ContentItemInput, options: { requireCampaign: boolean }) {
  if (input.sequence_number !== undefined || input.content_code !== undefined) {
    throw new ContentItemError("immutable_content_identity", "Identitas konten tidak boleh diubah.", 400);
  }

  const campaignId = validateNullableUuid(input.campaign_id);
  if (options.requireCampaign && !campaignId) {
    throw new ContentItemError("campaign_not_found", "Campaign wajib dipilih.", 404);
  }

  const title = normalizeText(input.title);
  if (!title || title.length > 200) {
    throw new ContentItemError("invalid_title", "Judul konten wajib diisi dan maksimal 200 karakter.", 400);
  }

  const plannedContentDate = validateDate(input.planned_content_date);
  const productId = validateNullableUuid(input.product_id);
  const schoolLevel = normalizeNullableText(input.school_level);
  if (schoolLevel && !schoolLevels.includes(schoolLevel as any)) {
    throw new ContentItemError("invalid_school_level", "Jenjang sekolah tidak valid.", 400);
  }

  const colorId = validateNullableUuid(input.color_id);
  const audienceSegment = normalizeText(input.audience_segment);
  if (!audienceSegments.includes(audienceSegment as any)) {
    throw new ContentItemError("invalid_audience_segment", "Audience segment tidak valid.", 400);
  }

  const targetAudience = normalizeText(input.target_audience);
  if (!targetAudience || targetAudience.length > 500) {
    throw new ContentItemError("invalid_target_audience", "Target audiens wajib diisi dan maksimal 500 karakter.", 400);
  }

  const contentPillar = normalizeText(input.content_pillar);
  if (!contentPillars.includes(contentPillar as any)) {
    throw new ContentItemError("invalid_content_pillar", "Content pillar tidak valid.", 400);
  }

  const primaryOfferId = validateNullableUuid(input.primary_offer_id);
  const primaryPainPointId = validateNullableUuid(input.primary_pain_point_id);

  const hook = normalizeText(input.hook);
  if (!hook || hook.length > 1000) {
    throw new ContentItemError("invalid_hook", "Hook wajib diisi dan maksimal 1000 karakter.", 400);
  }

  const angle = normalizeText(input.angle);
  if (!angle || angle.length > 2000) {
    throw new ContentItemError("invalid_angle", "Angle wajib diisi dan maksimal 2000 karakter.", 400);
  }

  const ctaText = normalizeText(input.cta_text);
  if (!ctaText || ctaText.length > 1000) {
    throw new ContentItemError("invalid_cta_text", "CTA text wajib diisi dan maksimal 1000 karakter.", 400);
  }

  const ctaKeyword = normalizeNullableText(input.cta_keyword)?.toUpperCase() || null;
  if (ctaKeyword && (ctaKeyword.length > 40 || !ctaKeywordPattern.test(ctaKeyword))) {
    throw new ContentItemError("invalid_cta_keyword", "CTA keyword hanya boleh huruf, angka, underscore, dan tanda hubung.", 400);
  }

  const notes = normalizeNullableText(input.notes);
  if (notes && notes.length > 5000) {
    throw new ContentItemError("invalid_notes", "Catatan maksimal 5000 karakter.", 400);
  }

  return {
    campaign_id: campaignId,
    title,
    planned_content_date: plannedContentDate,
    product_id: productId,
    school_level: schoolLevel,
    color_id: colorId,
    audience_segment: audienceSegment,
    target_audience: targetAudience,
    content_pillar: contentPillar,
    primary_offer_id: primaryOfferId,
    primary_pain_point_id: primaryPainPointId,
    hook,
    angle,
    cta_text: ctaText,
    cta_keyword: ctaKeyword,
    notes
  };
}

export function validateProductionStatus(value: unknown): string {
  const status = normalizeText(value);
  if (!productionStatuses.includes(status as any)) {
    throw new ContentItemError("invalid_production_status", "Production status tidak valid.", 400);
  }
  return status;
}
