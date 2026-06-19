import { CampaignError } from "../campaign-errors.ts";
import { assertUuid } from "./library-validation.ts";

export type CampaignInput = {
  code?: string;
  name?: string;
  start_date?: string;
  end_date?: string;
  target_audience?: string;
  primary_product_id?: string | null;
  status?: string;
  notes?: string | null;
};

export const campaignStatuses = ["draft", "active", "paused", "completed", "archived"] as const;

const campaignCodePattern = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNullableText(value: unknown): string | null {
  const text = normalizeText(value);
  return text === "" ? null : text;
}

function validateDate(value: unknown, code: "invalid_start_date" | "invalid_end_date", label: string): string {
  const text = normalizeText(value);
  if (!text || !/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new CampaignError(code, `${label} wajib menggunakan format tanggal yang valid.`, 400);
  }

  const date = new Date(`${text}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text) {
    throw new CampaignError(code, `${label} wajib menggunakan format tanggal yang valid.`, 400);
  }

  return text;
}

export function validateCampaignInput(input: CampaignInput): Required<CampaignInput> {
  const code = normalizeText(input.code).toUpperCase();
  const name = normalizeText(input.name);
  const startDate = validateDate(input.start_date, "invalid_start_date", "Tanggal mulai");
  const endDate = validateDate(input.end_date, "invalid_end_date", "Tanggal selesai");
  const targetAudience = normalizeText(input.target_audience);
  const primaryProductId = normalizeNullableText(input.primary_product_id);
  const status = normalizeText(input.status || "draft");
  const notes = normalizeNullableText(input.notes);

  if (!code || code.length > 80 || !campaignCodePattern.test(code)) {
    throw new CampaignError("invalid_campaign_code", "Kode campaign wajib berisi huruf besar, angka, dan tanda hubung yang valid.", 400);
  }

  if (!name || name.length > 160) {
    throw new CampaignError("invalid_campaign_name", "Nama campaign wajib diisi dan maksimal 160 karakter.", 400);
  }

  if (endDate < startDate) {
    throw new CampaignError("invalid_campaign_period", "Tanggal selesai tidak boleh sebelum tanggal mulai.", 400);
  }

  if (!targetAudience || targetAudience.length > 500) {
    throw new CampaignError("invalid_target_audience", "Target audiens wajib diisi dan maksimal 500 karakter.", 400);
  }

  if (primaryProductId) {
    assertUuid(primaryProductId);
  }

  if (!campaignStatuses.includes(status as any)) {
    throw new CampaignError("invalid_campaign_status", "Status campaign tidak valid.", 400);
  }

  if (notes && notes.length > 3000) {
    throw new CampaignError("invalid_notes", "Catatan maksimal 3000 karakter.", 400);
  }

  return {
    code,
    name,
    start_date: startDate,
    end_date: endDate,
    target_audience: targetAudience,
    primary_product_id: primaryProductId,
    status,
    notes
  };
}
