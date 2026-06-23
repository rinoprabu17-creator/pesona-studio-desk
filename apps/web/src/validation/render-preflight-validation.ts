import { RenderPreflightError } from "../render-preflight-errors.ts";

export const renderPreflightRunStatuses = ["completed", "archived"] as const;
export const renderPreflightResults = ["ready", "blocked"] as const;
export const renderPreflightCheckLevels = ["info", "warning", "blocking"] as const;
export const renderPreflightCheckStatuses = ["pass", "fail"] as const;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateRenderPreflightRunStatus(value: unknown): string {
  const status = normalizeText(value) || "completed";
  if (!renderPreflightRunStatuses.includes(status as any)) {
    throw new RenderPreflightError("invalid_preflight_run_status", "Status preflight run tidak valid.", 400);
  }
  return status;
}

export function validateRenderPreflightResult(value: unknown): string {
  const result = normalizeText(value) || "blocked";
  if (!renderPreflightResults.includes(result as any)) {
    throw new RenderPreflightError("invalid_preflight_result", "Hasil preflight tidak valid.", 400);
  }
  return result;
}
