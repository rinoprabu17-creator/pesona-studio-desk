import { VideoDraftJobError } from "../video-draft-job-errors.ts";
import { assertUuid } from "./library-validation.ts";

export type VideoDraftJobInput = {
  script_plan_id?: unknown;
  job_status?: unknown;
  target_format?: unknown;
  render_mode?: unknown;
  duration_target_seconds?: unknown;
  planned_output_label?: unknown;
  request_notes?: unknown;
  blocking_reason?: unknown;
  review_notes?: unknown;
};

export const videoDraftJobStatuses = ["draft_requested", "planning_ready", "blocked", "cancelled", "archived"] as const;
export const videoDraftTargetFormats = ["vertical_9_16", "square_1_1", "horizontal_16_9", "other"] as const;
export const videoDraftRenderModes = ["disabled_metadata_only"] as const;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNullableText(value: unknown, max: number, code: string, message: string): string | null {
  const text = normalizeText(value);
  if (!text) return null;
  if (text.length > max) {
    throw new VideoDraftJobError(code, message, 400);
  }
  return text;
}

function normalizeNullableUuid(value: unknown): string | null {
  const text = normalizeText(value);
  if (!text) return null;
  assertUuid(text);
  return text;
}

function validateNullableDuration(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 5 || parsed > 180) {
    throw new VideoDraftJobError("invalid_duration_target_seconds", "Target durasi wajib kosong atau 5 sampai 180 detik.", 400);
  }
  return parsed;
}

export function validateVideoDraftJobStatus(value: unknown): string {
  const status = normalizeText(value) || "draft_requested";
  if (!videoDraftJobStatuses.includes(status as any)) {
    throw new VideoDraftJobError("invalid_job_status", "Status video draft job tidak valid.", 400);
  }
  return status;
}

export function validateVideoDraftTargetFormat(value: unknown): string {
  const format = normalizeText(value) || "vertical_9_16";
  if (!videoDraftTargetFormats.includes(format as any)) {
    throw new VideoDraftJobError("invalid_target_format", "Target format video draft tidak valid.", 400);
  }
  return format;
}

export function validateVideoDraftRenderMode(value: unknown): string {
  const mode = normalizeText(value) || "disabled_metadata_only";
  if (!videoDraftRenderModes.includes(mode as any)) {
    throw new VideoDraftJobError("invalid_render_mode", "Render mode hanya boleh disabled_metadata_only pada fase ini.", 400);
  }
  return mode;
}

export function validateVideoDraftJobInput(input: VideoDraftJobInput) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new VideoDraftJobError("invalid_video_draft_job", "Video draft job wajib berisi metadata request.", 400);
  }

  return {
    script_plan_id: normalizeNullableUuid(input.script_plan_id),
    job_status: validateVideoDraftJobStatus(input.job_status),
    target_format: validateVideoDraftTargetFormat(input.target_format),
    render_mode: validateVideoDraftRenderMode(input.render_mode),
    duration_target_seconds: validateNullableDuration(input.duration_target_seconds),
    planned_output_label: normalizeNullableText(input.planned_output_label, 300, "invalid_planned_output_label", "Label output rencana maksimal 300 karakter."),
    request_notes: normalizeNullableText(input.request_notes, 2000, "invalid_request_notes", "Catatan request maksimal 2000 karakter."),
    blocking_reason: normalizeNullableText(input.blocking_reason, 2000, "invalid_blocking_reason", "Blocking reason maksimal 2000 karakter."),
    review_notes: normalizeNullableText(input.review_notes, 2000, "invalid_review_notes", "Review notes maksimal 2000 karakter.")
  };
}
