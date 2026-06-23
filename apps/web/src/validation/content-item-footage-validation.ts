import { ContentItemFootageError } from "../content-item-footage-errors.ts";
import { assertUuid } from "./library-validation.ts";

export type ContentItemFootageSelectionInput = {
  footage_asset_id?: unknown;
  sequence_number?: unknown;
  role?: unknown;
  usage_note?: unknown;
};

export type ContentItemFootageSelectionUpdateInput = {
  sequence_number?: unknown;
  role?: unknown;
  usage_note?: unknown;
};

export const contentItemFootageRoles = [
  "opening",
  "product",
  "process",
  "packing",
  "delivery",
  "testimonial",
  "closing",
  "b_roll",
  "other"
] as const;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNullableText(value: unknown, max: number): string | null {
  const text = normalizeText(value);
  if (!text) return null;
  if (text.length > max) {
    throw new ContentItemFootageError("invalid_usage_note", `Catatan penggunaan footage maksimal ${max} karakter.`, 400);
  }
  return text;
}

function validatePositiveSequence(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new ContentItemFootageError("invalid_sequence_number", "Urutan footage wajib angka positif.", 400);
  }
  return parsed;
}

export function validateContentItemFootageRole(value: unknown): string {
  const role = normalizeText(value) || "other";
  if (!contentItemFootageRoles.includes(role as any)) {
    throw new ContentItemFootageError("invalid_footage_role", "Role footage konten tidak valid.", 400);
  }
  return role;
}

export function validateContentItemFootageSelectionInput(input: ContentItemFootageSelectionInput) {
  const footageAssetId = normalizeText(input.footage_asset_id);
  if (!footageAssetId) {
    throw new ContentItemFootageError("footage_asset_required", "Footage wajib dipilih.", 400);
  }
  assertUuid(footageAssetId);

  return {
    footage_asset_id: footageAssetId,
    sequence_number: validatePositiveSequence(input.sequence_number),
    role: validateContentItemFootageRole(input.role),
    usage_note: normalizeNullableText(input.usage_note, 1000)
  };
}

export function validateContentItemFootageSelectionUpdateInput(input: ContentItemFootageSelectionUpdateInput) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ContentItemFootageError("invalid_selection_update", "Update footage selection wajib berisi metadata yang diizinkan.", 400);
  }

  const updates: Record<string, unknown> = {};
  if ("sequence_number" in input) updates.sequence_number = validatePositiveSequence(input.sequence_number);
  if ("role" in input) updates.role = validateContentItemFootageRole(input.role);
  if ("usage_note" in input) updates.usage_note = normalizeNullableText(input.usage_note, 1000);

  for (const key of Object.keys(input)) {
    if (!["sequence_number", "role", "usage_note"].includes(key)) {
      throw new ContentItemFootageError("invalid_selection_update_field", `Field footage selection tidak diizinkan: ${key}.`, 400);
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ContentItemFootageError("empty_selection_update", "Pilih minimal satu metadata selection untuk diupdate.", 400);
  }

  return updates;
}
