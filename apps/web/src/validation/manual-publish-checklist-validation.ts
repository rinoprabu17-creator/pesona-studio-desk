import { ManualPublishChecklistError } from "../manual-publish-checklist-errors.ts";
import { manualPublicationPackageChannels } from "./manual-publication-package-validation.ts";
import type { ManualPublicationPackageChannel } from "./manual-publication-package-validation.ts";

export const manualPublishChecklistKeys = [
  "video_file_confirmed",
  "caption_ready",
  "hashtags_ready",
  "cta_ready",
  "account_login_ready",
  "manual_post_created",
  "manual_url_recorded",
  "final_visual_check"
] as const;

export const manualPublishChecklistStatuses = ["pending", "done", "skipped", "blocked"] as const;
export const manualPublishEvidenceTypes = ["manual_post_url", "screenshot_reference", "admin_note", "issue_note", "confirmation_note"] as const;

export type ManualPublishChecklistKey = typeof manualPublishChecklistKeys[number];
export type ManualPublishChecklistStatus = typeof manualPublishChecklistStatuses[number];
export type ManualPublishEvidenceType = typeof manualPublishEvidenceTypes[number];

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown, maxLength: number, label: string): string | null {
  const text = normalizeText(value);
  if (!text) return null;
  if (text.length > maxLength) {
    throw new ManualPublishChecklistError("manual_publish_checklist_validation_failed", `${label} maksimal ${maxLength} karakter.`, 400);
  }
  return text;
}

export function validateManualPublishChecklistStatus(value: unknown): ManualPublishChecklistStatus {
  const status = normalizeText(value) || "pending";
  if (!manualPublishChecklistStatuses.includes(status as ManualPublishChecklistStatus)) {
    throw new ManualPublishChecklistError("manual_publish_checklist_validation_failed", "Status checklist manual publish tidak valid.", 400);
  }
  return status as ManualPublishChecklistStatus;
}

export function validateManualPublishEvidenceType(value: unknown): ManualPublishEvidenceType {
  const evidenceType = normalizeText(value);
  if (!manualPublishEvidenceTypes.includes(evidenceType as ManualPublishEvidenceType)) {
    throw new ManualPublishChecklistError("manual_publish_checklist_validation_failed", "Tipe evidence manual publish tidak valid.", 400);
  }
  return evidenceType as ManualPublishEvidenceType;
}

export function validateManualPublishChannel(value: unknown): ManualPublicationPackageChannel {
  const channel = normalizeText(value);
  if (!manualPublicationPackageChannels.includes(channel as ManualPublicationPackageChannel)) {
    throw new ManualPublishChecklistError("manual_publish_checklist_validation_failed", "Channel manual publish tidak valid.", 400);
  }
  return channel as ManualPublicationPackageChannel;
}

export function validateManualPublishChecklistItemInput(input: unknown): {
  checklist_status: ManualPublishChecklistStatus;
  is_done: boolean;
  checked_by_name: string | null;
  checklist_note: string | null;
} {
  const value = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const status = validateManualPublishChecklistStatus(value.checklist_status);
  return {
    checklist_status: status,
    is_done: status === "done",
    checked_by_name: optionalText(value.checked_by_name, 120, "Nama checker"),
    checklist_note: optionalText(value.checklist_note, 2000, "Catatan checklist")
  };
}

export function validateManualPublishEvidenceInput(input: unknown): {
  evidence_type: ManualPublishEvidenceType;
  evidence_value: string | null;
  evidence_note: string | null;
  recorded_by_name: string | null;
} {
  const value = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const evidenceType = validateManualPublishEvidenceType(value.evidence_type);
  const evidenceValue = optionalText(value.evidence_value, 2000, "Nilai evidence");
  if (evidenceType === "manual_post_url") {
    if (!evidenceValue) {
      throw new ManualPublishChecklistError("manual_publish_checklist_validation_failed", "Manual post URL wajib diisi.", 400);
    }
    let parsed: URL;
    try {
      parsed = new URL(evidenceValue);
    } catch {
      throw new ManualPublishChecklistError("manual_publish_checklist_validation_failed", "Manual post URL harus valid.", 400);
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new ManualPublishChecklistError("manual_publish_checklist_validation_failed", "Manual post URL harus http atau https.", 400);
    }
  }
  return {
    evidence_type: evidenceType,
    evidence_value: evidenceValue,
    evidence_note: optionalText(value.evidence_note, 2000, "Catatan evidence"),
    recorded_by_name: optionalText(value.recorded_by_name, 120, "Nama pencatat")
  };
}
