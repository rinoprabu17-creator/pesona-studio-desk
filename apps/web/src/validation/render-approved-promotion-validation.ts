import { RenderApprovedPromotionError } from "../render-approved-promotion-errors.ts";

export const renderApprovedPromotionStatuses = ["requested", "running", "succeeded", "failed", "blocked", "archived"] as const;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export type RenderApprovedPromotionInput = {
  promotion_note: string | null;
  promoted_by_name: string | null;
};

export function validateRenderApprovedPromotionStatus(value: unknown): string {
  const status = normalizeText(value) || "requested";
  if (!renderApprovedPromotionStatuses.includes(status as any)) {
    throw new RenderApprovedPromotionError("invalid_promotion_status", "Status promosi render tidak valid.", 400);
  }
  return status;
}

export function validateRenderApprovedPromotionInput(input: unknown): RenderApprovedPromotionInput {
  const value = typeof input === "object" && input !== null && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const promotionNote = normalizeText(value.promotion_note);
  const promotedByName = normalizeText(value.promoted_by_name);
  if (promotionNote.length > 2000) {
    throw new RenderApprovedPromotionError("invalid_promotion_note", "Catatan promosi maksimal 2000 karakter.", 400);
  }
  if (promotedByName.length > 120) {
    throw new RenderApprovedPromotionError("invalid_promoter_name", "Nama promoter maksimal 120 karakter.", 400);
  }
  return {
    promotion_note: promotionNote || null,
    promoted_by_name: promotedByName || null
  };
}
