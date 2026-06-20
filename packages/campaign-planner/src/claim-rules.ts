import type { CampaignPlanDraft, ValidationIssue } from "./types.ts";

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function combinedText(item: CampaignPlanDraft["items"][number]): string {
  return normalize(
    [
      item.title,
      item.hook,
      item.angle,
      item.cta_text,
      item.planning_reason,
      ...item.publications.map((publication) => publication.platform_title || "")
    ].join(" ")
  );
}

function issue(code: string, message: string, path: string): ValidationIssue {
  return { code, message, path };
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
  return hasAny(text, [/tanpa revisi mockup/, /tidak (memiliki|ada) revisi mockup/, /mockup tidak (memiliki|ada) revisi/]);
}

function hasMockupRevisionPromise(text: string): boolean {
  if (!/mockup/.test(text)) return false;
  const unsafe = hasAny(text, [/mockup bisa direvisi/, /mockup.*bisa.*revisi/, /mockup.*revisi sepuasnya/, /mockup.*sepuasnya/, /mockup.*berkali-kali/, /mockup.*sampai cocok/, /revisi sampai cocok/]);
  if (unsafe) return true;
  return hasAny(text, [/revisi mockup/, /mockup.*revisi/]) && !hasMockupNoRevisionContext(text);
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
    const text = combinedText(item);

    if (hasMockupRevisionPromise(text)) {
      errors.push(issue("mockup_revision_promise", "Mockup awal tidak boleh dijanjikan dapat direvisi.", path));
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
