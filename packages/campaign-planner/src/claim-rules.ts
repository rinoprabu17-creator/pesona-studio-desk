import type { CampaignPlanDraft, ValidationIssue } from "./types.ts";

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function customerFacingText(item: CampaignPlanDraft["items"][number]): string {
  return normalize(
    [
      item.title,
      item.hook,
      item.angle,
      item.cta_text,
      ...item.publications.map((publication) => publication.platform_title || "")
    ].join(" ")
  );
}

function issue(code: string, message: string, path: string, details?: ValidationIssue["details"]): ValidationIssue {
  return details ? { code, message, path, details } : { code, message, path };
}

function dedupeIssues(issues: ValidationIssue[]): ValidationIssue[] {
  const seen = new Set<string>();
  return issues.filter((item) => {
    const key = `${item.code}:${item.path || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function hasAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function hasMockupPreviewContext(text: string): boolean {
  return hasAny(text, [/preview awal/, /mockup awal/, /sebelum penawaran/]);
}

function hasMockupNoRevisionContext(text: string): boolean {
  return hasAny(text, [
    /tanpa revisi mockup/,
    /tanpa janji revisi mockup/,
    /tidak (memiliki|ada) revisi mockup/,
    /bukan revisi mockup/,
    /tidak menjanjikan revisi mockup/,
    /mockup awal tanpa revisi/,
    /preview awal tanpa revisi/,
    /mockup tidak (memiliki|ada) revisi/
  ]);
}

function hasMockupRevisionPromise(text: string): boolean {
  return Boolean(findMockupRevisionMatch([{ field: null, value: text }]));
}

type ClaimField = {
  field: string | null;
  value: string;
};

const mockupRevisionPatterns: Array<{ ruleCode: string; pattern: RegExp; matchedPattern: string }> = [
  { ruleCode: "mockup_revision_promise", pattern: /mockup bisa direvisi/, matchedPattern: "mockup bisa direvisi" },
  { ruleCode: "mockup_revision_promise", pattern: /mockup dapat direvisi/, matchedPattern: "mockup dapat direvisi" },
  { ruleCode: "mockup_revision_promise", pattern: /mockup.*bisa.*revisi/, matchedPattern: "mockup.*bisa.*revisi" },
  { ruleCode: "mockup_revision_promise", pattern: /mockup.*revisi sepuasnya/, matchedPattern: "mockup.*revisi sepuasnya" },
  { ruleCode: "mockup_revision_promise", pattern: /mockup.*sepuasnya/, matchedPattern: "mockup.*sepuasnya" },
  { ruleCode: "mockup_revision_promise", pattern: /mockup.*berkali-kali/, matchedPattern: "mockup.*berkali-kali" },
  { ruleCode: "mockup_revision_promise", pattern: /mockup.*sampai cocok/, matchedPattern: "mockup.*sampai cocok" },
  { ruleCode: "mockup_revision_promise", pattern: /revisi sampai cocok/, matchedPattern: "revisi sampai cocok" }
];

const contextualMockupRevisionPatterns: Array<{ ruleCode: string; pattern: RegExp; matchedPattern: string }> = [
  { ruleCode: "mockup_revision_promise", pattern: /revisi mockup/, matchedPattern: "revisi mockup" },
  { ruleCode: "mockup_revision_promise", pattern: /mockup.*revisi/, matchedPattern: "mockup.*revisi" }
];

function findMockupRevisionMatch(fields: ClaimField[]): {
  field: string | null;
  matchedPattern: string;
  sanitizedExcerpt: string;
} | null {
  for (const field of fields) {
    const text = normalize(field.value);
    if (!/mockup/.test(text)) continue;
    for (const candidate of mockupRevisionPatterns) {
      const match = candidate.pattern.exec(text);
      if (match) {
        return {
          field: field.field,
          matchedPattern: candidate.matchedPattern,
          sanitizedExcerpt: safeExcerpt(text, match.index, match[0].length)
        };
      }
    }
    for (const candidate of contextualMockupRevisionPatterns) {
      const match = candidate.pattern.exec(text);
      if (match && !hasMockupNoRevisionContext(text)) {
        return {
          field: field.field,
          matchedPattern: candidate.matchedPattern,
          sanitizedExcerpt: safeExcerpt(text, match.index, match[0].length)
        };
      }
    }
  }
  return null;
}

function safeExcerpt(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + length + 40);
  return text
    .slice(start, end)
    .replace(/sk-[a-z0-9_-]+/gi, "[api-key]")
    .replace(/bearer\s+[a-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/postgresql:\/\/\S+/gi, "[database-url]")
    .replace(/[a-z_]*(api_key|database_url)=\S+/gi, "[secret-env]")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

function claimFields(item: CampaignPlanDraft["items"][number]): ClaimField[] {
  return [
    { field: "title", value: item.title },
    { field: "hook", value: item.hook },
    { field: "angle", value: item.angle },
    { field: "cta_text", value: item.cta_text },
    ...item.publications
      .filter((publication) => publication.platform_title)
      .map((publication) => ({
        field: publication.channel === "youtube" ? "youtube_title" : "platform_title",
        value: publication.platform_title || ""
      }))
  ];
}

function hasOfferAgreementContext(text: string): boolean {
  return hasAny(text, [/cocok penawaran/, /cocok harga/, /setelah.*penawaran/, /setelah.*harga/]);
}

function hasDesignApprovalContext(text: string): boolean {
  return hasAny(text, [/desain ok/, /desain disetujui/]);
}

function hasFinalDesignRevisionContext(text: string): boolean {
  return hasAny(text, [/revisi desain final/, /desain final.*revisi/, /revisi.*desain ok/]);
}

function hasDpBeforeDesignClaim(text: string): boolean {
  return hasAny(text, [
    /bayar dp terlebih dahulu/,
    /transfer dp.*mulai melihat desain/,
    /dp sebelum desain (ok|disetujui)/,
    /dp.*desain menyusul/
  ]);
}

function hasHundredCopiesContext(text: string): boolean {
  return hasAny(text, [/di atas 100/, />\s*100/, /lebih dari 100/]);
}

function hasAppointmentContext(text: string): boolean {
  return hasAny(text, [/sesuai janji/, /appointment/, /janji temu/, /disepakati/]);
}

export function validateClaims(draft: CampaignPlanDraft): { errors: ValidationIssue[]; warnings: ValidationIssue[] } {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  draft.items.forEach((item, index) => {
    const path = `items.${index}`;
    const text = customerFacingText(item);
    const mockupRevisionMatch = findMockupRevisionMatch(claimFields(item));
    const internalReasonMatch = findMockupRevisionMatch([{ field: "planning_reason", value: item.planning_reason }]);

    if (mockupRevisionMatch) {
      errors.push(issue("mockup_revision_promise", "Mockup awal tidak boleh dijanjikan dapat direvisi.", `${path}.${mockupRevisionMatch.field || "text"}`, {
        draft_sequence: item.draft_sequence,
        field: mockupRevisionMatch.field,
        rule_code: "mockup_revision_promise",
        matched_pattern: mockupRevisionMatch.matchedPattern,
        sanitized_excerpt: mockupRevisionMatch.sanitizedExcerpt
      }));
    }

    if (internalReasonMatch) {
      warnings.push(issue("internal_reason_claim_language", "Planning reason memuat bahasa klaim internal yang perlu dicek.", `${path}.planning_reason`, {
        draft_sequence: item.draft_sequence,
        field: "planning_reason",
        rule_code: "mockup_revision_promise",
        matched_pattern: internalReasonMatch.matchedPattern,
        sanitized_excerpt: internalReasonMatch.sanitizedExcerpt
      }));
    }

    if (/mockup/.test(text) && !hasMockupPreviewContext(text)) {
      warnings.push(issue("mockup_context_missing", "Mockup sebaiknya dijelaskan sebagai preview awal.", path));
    }

    if (/desain gratis/.test(text) && !hasOfferAgreementContext(text)) {
      errors.push(issue("desain_gratis_condition_missing", "Desain gratis wajib memakai konteks setelah cocok penawaran atau harga.", path));
    }

    if (/\bdp\b/.test(text) && hasDpBeforeDesignClaim(text)) {
      errors.push(issue("dp_before_design_approved", "DP tidak boleh diminta sebelum Desain OK atau desain disetujui.", path));
    }

    if (/\bdp\b/.test(text) && !hasDesignApprovalContext(text)) {
      errors.push(issue("dp_condition_missing", "DP harus dikaitkan dengan setelah Desain OK atau desain disetujui.", path));
    }

    if (/gratis ongkir/.test(text) && !/kota medan/.test(text)) {
      errors.push(issue("gratis_ongkir_condition_missing", "Gratis ongkir wajib menyebut Kota Medan.", path));
    }

    if (/gratis klise/.test(text)) {
      if (!hasHundredCopiesContext(text) || !/desain ok/.test(text)) {
        errors.push(issue("gratis_klise_condition_missing", "Gratis klise wajib menyebut di atas 100 eksemplar dan setelah Desain OK.", path));
      }
    }

    if (/garansi/.test(text)) {
      if (!/cacat produksi/.test(text)) {
        errors.push(issue("garansi_scope_missing", "Garansi hanya boleh diklaim untuk cacat produksi.", path));
      }
      if (hasAny(text, [/kesalahan data/, /salah data/, /salah nama/]) && !hasAny(text, [/bukan kesalahan data/, /tidak berlaku untuk kesalahan data/, /data.*disetujui/])) {
        errors.push(issue("garansi_data_error_claim", "Garansi tidak boleh menjamin kesalahan data yang sudah disetujui.", path));
      }
    }

    if (hasAny(text, [/anti[- ]?pudar selamanya/, /tidak akan pernah pudar/, /tidak pernah pudar/])) {
      errors.push(issue("foil_permanent_claim", "Foil tidak boleh diklaim anti pudar selamanya.", path));
    }

    if (hasAny(text, [/24 jam/, /selalu instant/, /selalu instan/, /respon instant/, /respons instant/])) {
      errors.push(issue("response_time_forbidden", "Tidak boleh menjanjikan respons 24 jam atau selalu instant.", path));
    }

    if (/video call/.test(text) && !hasAppointmentContext(text)) {
      warnings.push(issue("video_call_appointment_missing", "Video call workshop sebaiknya dibatasi sesuai janji atau appointment.", path));
    }

    if (item.primary_offer_code === "mockup_awal_gratis" && !hasMockupPreviewContext(text)) {
      errors.push(issue("mockup_offer_context_missing", "Offer mockup awal gratis wajib diposisikan sebagai preview atau mockup awal.", path));
    }

    if (item.primary_offer_code === "desain_final_gratis" && !hasOfferAgreementContext(text)) {
      errors.push(issue("desain_gratis_condition_missing", "Offer desain final gratis wajib menyebut setelah cocok penawaran atau harga.", path));
    }

    if (item.primary_offer_code === "revisi_final_sampai_desain_ok" && !hasFinalDesignRevisionContext(text)) {
      errors.push(issue("revisi_final_context_missing", "Offer revisi wajib jelas sebagai revisi desain final sampai Desain OK.", path));
    }

    if (item.primary_offer_code === "dp_setelah_desain_ok" && !hasDesignApprovalContext(text)) {
      errors.push(issue("dp_condition_missing", "Offer DP wajib menyebut setelah Desain OK atau desain disetujui.", path));
    }

    if (item.primary_offer_code === "gratis_ongkir_medan" && !/kota medan/.test(text)) {
      errors.push(issue("gratis_ongkir_condition_missing", "Offer gratis ongkir wajib menyebut Kota Medan.", path));
    }

    if (item.primary_offer_code === "gratis_klise_100_eksemplar" && (!hasHundredCopiesContext(text) || !hasDesignApprovalContext(text))) {
      errors.push(issue("gratis_klise_condition_missing", "Offer gratis klise wajib menyebut di atas 100 eksemplar dan setelah Desain OK.", path));
    }

    if (item.primary_offer_code === "garansi_ganti_baru_cacat_produksi" && !/cacat produksi/.test(text)) {
      errors.push(issue("garansi_scope_missing", "Offer garansi wajib dibatasi untuk cacat produksi.", path));
    }

    if (item.primary_offer_code === "video_call_workshop_luar_daerah" && !hasAppointmentContext(text)) {
      warnings.push(issue("video_call_appointment_missing", "Offer video call workshop sebaiknya dibatasi sesuai janji atau appointment.", path));
    }
  });

  return { errors: dedupeIssues(errors), warnings: dedupeIssues(warnings) };
}
