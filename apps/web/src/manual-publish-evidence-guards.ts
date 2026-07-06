export type ManualPublishEvidenceGuardInput = {
  evidence_type?: string | null;
  evidence_value?: string | null;
  evidence_note?: string | null;
  recorded_by_name?: string | null;
};

export type ManualPublishEvidenceFormState = {
  canSubmit: boolean;
  missingEvidenceType: boolean;
  missingRecordedByName: boolean;
  missingEvidenceBody: boolean;
  message: string | null;
};

function blank(value: string | null | undefined): boolean {
  return !String(value || "").trim();
}

export function getManualPublishEvidenceFormState(input: ManualPublishEvidenceGuardInput): ManualPublishEvidenceFormState {
  const missingEvidenceType = blank(input.evidence_type);
  const missingRecordedByName = blank(input.recorded_by_name);
  const missingEvidenceBody = blank(input.evidence_value) && blank(input.evidence_note);
  const missing = [
    missingEvidenceType ? "Evidence Type wajib diisi" : "",
    missingRecordedByName ? "Recorded By wajib diisi" : "",
    missingEvidenceBody ? "Evidence Value atau Evidence Note wajib diisi" : ""
  ].filter(Boolean);
  return {
    canSubmit: missing.length === 0,
    missingEvidenceType,
    missingRecordedByName,
    missingEvidenceBody,
    message: missing.length ? `${missing.join(". ")}. Blank evidence is not valid publish proof.` : null
  };
}

export function isBlankEvidenceLogAnomaly(log: ManualPublishEvidenceGuardInput): boolean {
  return blank(log.evidence_value) && blank(log.evidence_note) && blank(log.recorded_by_name);
}

export function isValidManualPublishEvidenceLog(log: ManualPublishEvidenceGuardInput): boolean {
  return Boolean(String(log.evidence_type || "").trim())
    && Boolean(String(log.recorded_by_name || "").trim())
    && (!blank(log.evidence_value) || !blank(log.evidence_note));
}

export function isValidPublishProofEvidenceLog(log: ManualPublishEvidenceGuardInput): boolean {
  return isValidManualPublishEvidenceLog(log)
    && log.evidence_type === "manual_post_url"
    && Boolean(String(log.evidence_value || "").trim());
}
