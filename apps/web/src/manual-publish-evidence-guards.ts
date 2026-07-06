export type ManualPublishEvidenceGuardInput = {
  evidence_type?: string | null;
  evidence_value?: string | null;
  evidence_note?: string | null;
  recorded_by_name?: string | null;
};

function blank(value: string | null | undefined): boolean {
  return !String(value || "").trim();
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
