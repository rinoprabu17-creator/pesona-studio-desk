import { ContentItemScriptPlanError } from "../content-item-script-plan-errors.ts";
import { assertUuid } from "./library-validation.ts";

export type ContentItemScriptPlanInput = {
  plan_status?: unknown;
  video_format?: unknown;
  hook_text?: unknown;
  main_message?: unknown;
  cta_text?: unknown;
  notes?: unknown;
};

export type ShotPlanStepInput = {
  content_item_footage_selection_id?: unknown;
  sequence_number?: unknown;
  step_type?: unknown;
  visual_note?: unknown;
  narration_text?: unknown;
  overlay_text?: unknown;
  duration_seconds?: unknown;
};

export const scriptPlanStatuses = ["draft", "reviewed", "approved", "archived"] as const;
export const scriptPlanVideoFormats = ["short_video", "reels", "tiktok", "youtube_short", "story", "other"] as const;
export const shotPlanStepTypes = [
  "hook",
  "scene",
  "product",
  "process",
  "packing",
  "delivery",
  "testimonial",
  "b_roll",
  "cta",
  "closing",
  "other"
] as const;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNullableText(value: unknown, max: number, code: string, message: string): string | null {
  const text = normalizeText(value);
  if (!text) return null;
  if (text.length > max) {
    throw new ContentItemScriptPlanError(code, message, 400);
  }
  return text;
}

function normalizeNullableUuid(value: unknown): string | null {
  const text = normalizeText(value);
  if (!text) return null;
  assertUuid(text);
  return text;
}

function validatePositiveSequence(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new ContentItemScriptPlanError("invalid_sequence_number", "Urutan shot plan wajib angka positif.", 400);
  }
  return parsed;
}

function validateNullableDuration(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 120) {
    throw new ContentItemScriptPlanError("invalid_duration_seconds", "Durasi shot harus kosong atau 1 sampai 120 detik.", 400);
  }
  return parsed;
}

export function validateScriptPlanStatus(value: unknown): string {
  const status = normalizeText(value) || "draft";
  if (!scriptPlanStatuses.includes(status as any)) {
    throw new ContentItemScriptPlanError("invalid_plan_status", "Status script plan tidak valid.", 400);
  }
  return status;
}

export function validateScriptPlanVideoFormat(value: unknown): string {
  const format = normalizeText(value) || "short_video";
  if (!scriptPlanVideoFormats.includes(format as any)) {
    throw new ContentItemScriptPlanError("invalid_video_format", "Format video script plan tidak valid.", 400);
  }
  return format;
}

export function validateShotPlanStepType(value: unknown): string {
  const stepType = normalizeText(value) || "scene";
  if (!shotPlanStepTypes.includes(stepType as any)) {
    throw new ContentItemScriptPlanError("invalid_step_type", "Tipe shot plan tidak valid.", 400);
  }
  return stepType;
}

export function validateScriptPlanInput(input: ContentItemScriptPlanInput) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ContentItemScriptPlanError("invalid_script_plan", "Script plan wajib berisi metadata planning.", 400);
  }

  return {
    plan_status: validateScriptPlanStatus(input.plan_status),
    video_format: validateScriptPlanVideoFormat(input.video_format),
    hook_text: normalizeNullableText(input.hook_text, 500, "invalid_hook_text", "Hook script plan maksimal 500 karakter."),
    main_message: normalizeNullableText(input.main_message, 2000, "invalid_main_message", "Main message maksimal 2000 karakter."),
    cta_text: normalizeNullableText(input.cta_text, 500, "invalid_cta_text", "CTA script plan maksimal 500 karakter."),
    notes: normalizeNullableText(input.notes, 2000, "invalid_script_plan_notes", "Catatan script plan maksimal 2000 karakter.")
  };
}

export function validateShotPlanStepInput(input: ShotPlanStepInput) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ContentItemScriptPlanError("invalid_shot_plan_step", "Shot plan step wajib berisi metadata planning.", 400);
  }

  return {
    content_item_footage_selection_id: normalizeNullableUuid(input.content_item_footage_selection_id),
    sequence_number: validatePositiveSequence(input.sequence_number),
    step_type: validateShotPlanStepType(input.step_type),
    visual_note: normalizeNullableText(input.visual_note, 1000, "invalid_visual_note", "Visual note maksimal 1000 karakter."),
    narration_text: normalizeNullableText(input.narration_text, 2000, "invalid_narration_text", "Narasi maksimal 2000 karakter."),
    overlay_text: normalizeNullableText(input.overlay_text, 500, "invalid_overlay_text", "Overlay text maksimal 500 karakter."),
    duration_seconds: validateNullableDuration(input.duration_seconds)
  };
}
