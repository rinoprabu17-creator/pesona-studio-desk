import { ManualPublishCloseoutError } from "../manual-publish-closeout-errors.ts";

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function limitText(value: unknown, maxLength: number, label: string): string | null {
  const text = normalizeText(value);
  if (!text) {
    return null;
  }
  if (text.length > maxLength) {
    throw new ManualPublishCloseoutError("invalid_manual_publish_closeout_input", `${label} maksimal ${maxLength} karakter.`, 400);
  }
  return text;
}

export type ManualPublishCloseoutInput = {
  closed_by_name: string | null;
  closeout_note: string | null;
};

export function validateManualPublishCloseoutInput(input: unknown): ManualPublishCloseoutInput {
  const value = input && typeof input === "object" ? input as Record<string, unknown> : {};
  return {
    closed_by_name: limitText(value.closed_by_name, 120, "Nama closeout"),
    closeout_note: limitText(value.closeout_note, 2000, "Catatan closeout")
  };
}
