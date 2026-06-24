import { ApprovedVideoHandoffError } from "../approved-video-handoff-errors.ts";

export const approvedVideoHandoffStatuses = ["pending_handoff", "ready_for_manual_publish", "hold", "needs_revision", "archived"] as const;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export type ApprovedVideoHandoffInput = {
  handoff_note: string | null;
  handoff_by_name: string | null;
};

export function validateApprovedVideoHandoffStatus(value: unknown): string {
  const status = normalizeText(value) || "pending_handoff";
  if (!approvedVideoHandoffStatuses.includes(status as any)) {
    throw new ApprovedVideoHandoffError("invalid_handoff_status", "Status handoff approved video tidak valid.", 400);
  }
  return status;
}

export function validateApprovedVideoHandoffInput(input: unknown): ApprovedVideoHandoffInput {
  const value = typeof input === "object" && input !== null && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const handoffNote = normalizeText(value.handoff_note);
  const handoffByName = normalizeText(value.handoff_by_name);
  if (handoffNote.length > 2000) {
    throw new ApprovedVideoHandoffError("invalid_handoff_note", "Catatan handoff maksimal 2000 karakter.", 400);
  }
  if (handoffByName.length > 120) {
    throw new ApprovedVideoHandoffError("invalid_handoff_name", "Nama handoff maksimal 120 karakter.", 400);
  }
  return {
    handoff_note: handoffNote || null,
    handoff_by_name: handoffByName || null
  };
}
