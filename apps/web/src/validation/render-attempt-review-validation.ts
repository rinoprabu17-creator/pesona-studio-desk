import { RenderAttemptReviewError } from "../render-attempt-review-errors.ts";

export const renderAttemptReviewStatuses = ["pending_review", "approved", "rejected", "archived"] as const;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export type RenderAttemptReviewInput = {
  review_note: string | null;
  reviewed_by_name: string | null;
};

export function validateRenderAttemptReviewStatus(value: unknown): string {
  const status = normalizeText(value) || "pending_review";
  if (!renderAttemptReviewStatuses.includes(status as any)) {
    throw new RenderAttemptReviewError("invalid_review_status", "Status review render tidak valid.", 400);
  }
  return status;
}

export function validateRenderAttemptReviewInput(input: unknown): RenderAttemptReviewInput {
  const value = typeof input === "object" && input !== null && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const reviewNote = normalizeText(value.review_note);
  const reviewedByName = normalizeText(value.reviewed_by_name);
  if (reviewNote.length > 2000) {
    throw new RenderAttemptReviewError("invalid_review_note", "Catatan review maksimal 2000 karakter.", 400);
  }
  if (reviewedByName.length > 120) {
    throw new RenderAttemptReviewError("invalid_reviewer_name", "Nama reviewer maksimal 120 karakter.", 400);
  }
  return {
    review_note: reviewNote || null,
    reviewed_by_name: reviewedByName || null
  };
}
