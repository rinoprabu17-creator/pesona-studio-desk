import { posix as path } from "node:path";
import { RenderAttemptError } from "../render-attempt-errors.ts";

export const renderAttemptStatuses = ["requested", "running", "succeeded", "failed", "blocked", "archived"] as const;
export const renderAttemptModes = ["manual_smoke"] as const;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateRenderAttemptStatus(value: unknown): string {
  const status = normalizeText(value) || "requested";
  if (!renderAttemptStatuses.includes(status as any)) {
    throw new RenderAttemptError("invalid_render_attempt_status", "Status render attempt tidak valid.", 400);
  }
  return status;
}

export function validateRenderAttemptMode(value: unknown): string {
  const mode = normalizeText(value) || "manual_smoke";
  if (!renderAttemptModes.includes(mode as any)) {
    throw new RenderAttemptError("invalid_render_attempt_mode", "Mode render attempt hanya boleh manual_smoke.", 400);
  }
  return mode;
}

export function validateRenderAttemptOutputRelativePath(value: unknown): string {
  const raw = normalizeText(value);
  if (!raw || raw.length > 500) {
    throw new RenderAttemptError("invalid_render_output_path", "Output render wajib path relatif smoke/*.mp4.", 400);
  }
  if (!raw.startsWith("smoke/") || raw.includes("\\") || path.isAbsolute(raw)) {
    throw new RenderAttemptError("unsafe_render_output_path", "Output render hanya boleh berada di smoke/ dan memakai slash.", 400);
  }
  const normalized = path.normalize(raw);
  if (normalized !== raw || normalized.includes("..") || !normalized.toLowerCase().endsWith(".mp4")) {
    throw new RenderAttemptError("unsafe_render_output_path", "Output render harus path smoke/*.mp4 tanpa traversal.", 400);
  }
  return normalized;
}
