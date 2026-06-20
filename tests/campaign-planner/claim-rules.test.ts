import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCampaignPlanStrategy,
  consolidateCampaignPlan,
  FakeCampaignPlannerProvider,
  validateCampaignPlanDraft,
  validateClaims
} from "../../packages/campaign-planner/src/index.ts";
import { validPlannerInput } from "../fixtures/campaign-planner/input.ts";

function draftWithOffer(primaryOfferCode: string | null, text: string) {
  return {
    plan_summary: "x",
    requested_content_count: 1,
    items: [{
      draft_sequence: 1,
      planned_content_date: "2026-07-01",
      title: text,
      product_code: null,
      school_level: null,
      color_code: null,
      audience_segment: "mixed",
      target_audience: "Kepala Sekolah",
      content_pillar: "offer",
      primary_offer_code: primaryOfferCode,
      primary_pain_point_code: null,
      hook: text,
      angle: text,
      cta_text: text,
      cta_keyword: null,
      planning_reason: text,
      publications: [{
        channel: "instagram",
        publication_format: "reel",
        planned_publish_at: null,
        platform_title: null,
        platform_caption: null
      }]
    }]
  } as any;
}

function draftWithMockupField(field: "title" | "hook" | "angle" | "cta_text" | "planning_reason", text: string) {
  const safe = "Mockup awal sebagai preview awal.";
  const draft = draftWithOffer("mockup_awal_gratis", safe);
  draft.items[0][field] = text;
  return draft;
}

function draftWithYoutubeTitle(text: string) {
  const draft = draftWithOffer("mockup_awal_gratis", "Mockup awal sebagai preview awal.");
  draft.items[0].publications[0].channel = "youtube";
  draft.items[0].publications[0].publication_format = "short_video";
  draft.items[0].publications[0].platform_title = text;
  return draft;
}

test("forbidden claim ditolak", async () => {
  const input = validPlannerInput({ requested_content_count: 3 });
  const strategy = buildCampaignPlanStrategy(input);
  const result = await new FakeCampaignPlannerProvider({ mode: "forbidden_claim" }).generateBatch({
    run_id: null,
    batch_index: 1,
    campaign: input.campaign,
    knowledge: {
      products: input.products,
      colors: input.colors,
      school_level_defaults: input.school_level_defaults,
      offers: input.offers,
      pain_points: input.pain_points
    },
    strategy_slots: strategy,
    owner_brief: null
  });
  const consolidated = consolidateCampaignPlan(input, strategy, [result]);
  assert.ok(consolidated.errors.some((error) => error.code === "mockup_revision_promise"));
  assert.ok(consolidated.errors.some((error) => error.code === "gratis_ongkir_condition_missing"));
  assert.ok(consolidated.errors.some((error) => error.code === "foil_permanent_claim"));
});

test("required offer condition yang hilang ditolak", async () => {
  const input = validPlannerInput({ requested_content_count: 1 });
  const strategy = buildCampaignPlanStrategy(input);
  const result = await new FakeCampaignPlannerProvider().generateBatch({
    run_id: null,
    batch_index: 1,
    campaign: input.campaign,
    knowledge: {
      products: input.products,
      colors: input.colors,
      school_level_defaults: input.school_level_defaults,
      offers: input.offers,
      pain_points: input.pain_points
    },
    strategy_slots: strategy,
    owner_brief: null
  });
  result.items[0].title = "Desain Gratis";
  result.items[0].hook = "Dapatkan desain gratis untuk semua pemesan.";
  const consolidated = consolidateCampaignPlan(input, strategy, [result]);
  assert.ok(consolidated.errors.some((error) => error.code === "desain_gratis_condition_missing"));
});

test("mockup revision diagnostic menunjuk field dan excerpt aman", () => {
  const hookResult = validateClaims(draftWithMockupField("hook", "Mockup bisa direvisi setelah sekolah kirim data."));
  const hookError = hookResult.errors.find((error) => error.code === "mockup_revision_promise");
  assert.ok(hookError);
  assert.equal(hookError.path, "items.0.hook");
  assert.equal(hookError.details?.draft_sequence, 1);
  assert.equal(hookError.details?.field, "hook");
  assert.equal(hookError.details?.rule_code, "mockup_revision_promise");
  assert.equal(hookError.details?.matched_pattern, "mockup bisa direvisi");
  assert.ok(hookError.details?.sanitized_excerpt?.includes("mockup bisa direvisi"));
  assert.ok((hookError.details?.sanitized_excerpt || "").length <= 120);

  const angleResult = validateClaims(draftWithMockupField("angle", "Admin bantu mockup sampai cocok untuk semua sekolah."));
  const angleError = angleResult.errors.find((error) => error.code === "mockup_revision_promise");
  assert.ok(angleError);
  assert.equal(angleError.path, "items.0.angle");
  assert.equal(angleError.details?.field, "angle");
  assert.equal(angleError.details?.matched_pattern, "mockup.*sampai cocok");

  const safeResult = validateClaims(draftWithMockupField("hook", "Mockup awal sebagai preview awal, tanpa revisi mockup."));
  assert.equal(safeResult.errors.some((error) => error.code === "mockup_revision_promise"), false);

  const internalResult = validateClaims(draftWithMockupField("planning_reason", "Output memakai bahasa revisi mockup sebagai catatan internal."));
  assert.equal(internalResult.errors.some((error) => error.code === "mockup_revision_promise"), false);
  const internalWarning = internalResult.warnings.find((warning) => warning.code === "internal_reason_claim_language");
  assert.ok(internalWarning);
  assert.equal(internalWarning.path, "items.0.planning_reason");
  assert.equal(internalWarning.details?.field, "planning_reason");
  assert.equal(internalWarning.details?.matched_pattern, "revisi mockup");

  for (const text of [
    "Tanpa menyebut revisi mockup, hanya preview awal.",
    "Preview awal dengan bahasa aman tanpa janji revisi mockup.",
    "Mockup awal tanpa revisi untuk memberi gambaran awal.",
    "Tidak ada revisi mockup karena hanya preview awal.",
    "Bukan revisi mockup, hanya contoh tampilan awal.",
    "Tidak menjanjikan revisi mockup pada preview awal.",
    "Preview awal tanpa revisi untuk memberi gambaran awal."
  ]) {
    const result = validateClaims(draftWithMockupField("planning_reason", text));
    assert.equal(
      result.errors.some((error) => error.code === "mockup_revision_promise"),
      false,
      `${text} harus aman`
    );
  }

  for (const [field, text] of [
    ["hook", "Revisi mockup untuk sekolah sampai cocok."],
    ["angle", "Mockup bisa direvisi setelah sekolah kirim data."],
    ["cta_text", "Chat admin untuk mockup sampai cocok."]
  ] as const) {
    const result = validateClaims(draftWithMockupField(field, text));
    const error = result.errors.find((item) => item.code === "mockup_revision_promise");
    assert.ok(error, `${field} harus hard error`);
    assert.equal(error.details?.field, field);
  }

  const youtubeResult = validateClaims(draftWithYoutubeTitle("Mockup bisa direvisi sampai cocok"));
  const youtubeError = youtubeResult.errors.find((error) => error.code === "mockup_revision_promise");
  assert.ok(youtubeError);
  assert.equal(youtubeError.details?.field, "youtube_title");

  for (const text of [
    "Mockup bisa direvisi setelah sekolah kirim data.",
    "Mockup dapat direvisi setelah sekolah kirim data.",
    "Revisi mockup sepuasnya sampai cocok.",
    "Mockup dapat disesuaikan sampai cocok.",
    "Mockup bisa diubah sampai cocok.",
    "Mockup berkali-kali untuk sekolah.",
    "Mockup sepuasnya sebelum order."
  ]) {
    const result = validateClaims(draftWithMockupField("hook", text));
    assert.ok(
      result.errors.some((error) => error.code === "mockup_revision_promise"),
      `${text} harus ditolak`
    );
  }

  const rawLong = `Mockup bisa direvisi ${"x".repeat(300)} OPENAI_API_KEY=secret sk-testkey`;
  const diagnosticResult = validateClaims(draftWithMockupField("hook", rawLong));
  const diagnosticError = diagnosticResult.errors.find((error) => error.code === "mockup_revision_promise");
  const diagnosticText = JSON.stringify(diagnosticError?.details);
  assert.equal(diagnosticText.includes("sk-testkey"), false);
  assert.equal(diagnosticText.includes("OPENAI_API_KEY=secret"), false);
  assert.ok((diagnosticError?.details?.sanitized_excerpt || "").length <= 120);
});

test("planning_reason claim issue tidak membuat validation invalid", async () => {
  const input = validPlannerInput({ requested_content_count: 1 });
  const strategy = buildCampaignPlanStrategy(input);
  const result = await new FakeCampaignPlannerProvider().generateBatch({
    run_id: null,
    batch_index: 1,
    campaign: input.campaign,
    knowledge: {
      products: input.products,
      colors: input.colors,
      school_level_defaults: input.school_level_defaults,
      offers: input.offers,
      pain_points: input.pain_points
    },
    strategy_slots: strategy,
    owner_brief: null
  });
  const consolidated = consolidateCampaignPlan(input, strategy, [result]);
  assert.ok(consolidated.draft);
  consolidated.draft.items[0].planning_reason = "Catatan internal menyebut revisi mockup, bukan materi konten customer.";

  const validation = validateCampaignPlanDraft(input, consolidated.draft);
  assert.equal(validation.errors.some((error) => error.code === "mockup_revision_promise"), false);
  assert.ok(validation.warnings.some((warning) => warning.code === "internal_reason_claim_language"));
});

test("DP sebelum Desain OK ditolak dan DP setelah approval valid", () => {
  for (const text of [
    "Bayar DP terlebih dahulu, desain menyusul.",
    "Transfer DP untuk mulai melihat desain.",
    "DP sebelum desain disetujui."
  ]) {
    const result = validateClaims(draftWithOffer("dp_setelah_desain_ok", text));
    assert.ok(result.errors.some((error) => error.code === "dp_before_design_approved" || error.code === "dp_condition_missing"));
  }

  for (const text of [
    "DP dilakukan setelah Desain OK.",
    "Setelah desain disetujui, barulah pembayaran DP dilakukan."
  ]) {
    const result = validateClaims(draftWithOffer("dp_setelah_desain_ok", text));
    assert.ok(!result.errors.some((error) => error.code.startsWith("dp_")));
  }
});

test("offer reference memvalidasi condition masing-masing", () => {
  const cases = [
    {
      code: "mockup_awal_gratis",
      invalid: "Mockup gratis untuk sampul sekolah.",
      valid: "Mockup awal gratis sebagai preview awal sebelum penawaran.",
      error: "mockup_offer_context_missing"
    },
    {
      code: "desain_final_gratis",
      invalid: "Desain gratis untuk semua pemesan.",
      valid: "Desain gratis setelah cocok penawaran dan cocok harga.",
      error: "desain_gratis_condition_missing"
    },
    {
      code: "revisi_final_sampai_desain_ok",
      invalid: "Revisi sampai cocok.",
      valid: "Revisi desain final dilakukan sampai Desain OK.",
      error: "revisi_final_context_missing"
    },
    {
      code: "dp_setelah_desain_ok",
      invalid: "DP untuk mulai proses.",
      valid: "DP setelah Desain OK.",
      error: "dp_condition_missing"
    },
    {
      code: "gratis_ongkir_medan",
      invalid: "Gratis ongkir untuk pembeli.",
      valid: "Gratis ongkir Kota Medan.",
      error: "gratis_ongkir_condition_missing"
    },
    {
      code: "gratis_klise_100_eksemplar",
      invalid: "Gratis klise untuk pesanan sekolah.",
      valid: "Gratis klise di atas 100 eksemplar setelah Desain OK.",
      error: "gratis_klise_condition_missing"
    },
    {
      code: "garansi_ganti_baru_cacat_produksi",
      invalid: "Garansi ganti baru untuk semua kesalahan data.",
      valid: "Garansi ganti baru hanya untuk cacat produksi.",
      error: "garansi_scope_missing"
    }
  ];

  for (const item of cases) {
    const invalid = validateClaims(draftWithOffer(item.code, item.invalid));
    assert.ok(invalid.errors.some((error) => error.code === item.error), item.code);
    const valid = validateClaims(draftWithOffer(item.code, item.valid));
    assert.ok(!valid.errors.some((error) => error.code === item.error), item.code);
  }
});

test("video call tanpa appointment menjadi warning", () => {
  const draft = draftWithOffer("video_call_workshop_luar_daerah", "Bisa video call workshop.");
  assert.ok(validateClaims(draft).warnings.some((warning) => warning.code === "video_call_appointment_missing"));
  assert.equal(validateClaims(draft).warnings.filter((warning) => warning.code === "video_call_appointment_missing").length, 1);
  assert.equal(validateClaims(draftWithOffer("video_call_workshop_luar_daerah", "Video call workshop sesuai janji untuk pembeli luar daerah.")).warnings.length, 0);
});
