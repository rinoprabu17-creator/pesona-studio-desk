import { RenderManifestError } from "../render-manifest-errors.ts";

export type RenderManifestInput = {
  manifest_status?: unknown;
  manifest_mode?: unknown;
  target_format?: unknown;
  manifest_warnings?: unknown;
  notes?: unknown;
};

export const renderManifestStatuses = ["draft", "reviewed", "approved", "blocked", "archived"] as const;
export const renderManifestModes = ["metadata_only"] as const;
export const renderManifestTargetFormats = ["vertical_9_16", "square_1_1", "horizontal_16_9", "other"] as const;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNullableText(value: unknown, max: number, code: string, message: string): string | null {
  const text = normalizeText(value);
  if (!text) return null;
  if (text.length > max) {
    throw new RenderManifestError(code, message, 400);
  }
  return text;
}

export function validateRenderManifestStatus(value: unknown): string {
  const status = normalizeText(value) || "draft";
  if (!renderManifestStatuses.includes(status as any)) {
    throw new RenderManifestError("invalid_manifest_status", "Status render manifest tidak valid.", 400);
  }
  return status;
}

export function validateRenderManifestMode(value: unknown): string {
  const mode = normalizeText(value) || "metadata_only";
  if (!renderManifestModes.includes(mode as any)) {
    throw new RenderManifestError("invalid_manifest_mode", "Manifest mode hanya boleh metadata_only pada fase ini.", 400);
  }
  return mode;
}

export function validateRenderManifestTargetFormat(value: unknown): string {
  const format = normalizeText(value) || "vertical_9_16";
  if (!renderManifestTargetFormats.includes(format as any)) {
    throw new RenderManifestError("invalid_target_format", "Target format render manifest tidak valid.", 400);
  }
  return format;
}

export function validateRenderManifestInput(input: RenderManifestInput = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new RenderManifestError("invalid_render_manifest", "Render manifest wajib berisi metadata.", 400);
  }

  return {
    manifest_status: validateRenderManifestStatus(input.manifest_status),
    manifest_mode: validateRenderManifestMode(input.manifest_mode),
    target_format: validateRenderManifestTargetFormat(input.target_format),
    manifest_warnings: normalizeNullableText(input.manifest_warnings, 4000, "invalid_manifest_warnings", "Warning manifest maksimal 4000 karakter."),
    notes: normalizeNullableText(input.notes, 2000, "invalid_manifest_notes", "Catatan manifest maksimal 2000 karakter.")
  };
}
