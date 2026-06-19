import { ProviderBatchResultSchema } from "./schema.ts";
import { CampaignPlannerProviderError } from "./provider.ts";
import type { CampaignPlannerProvider, CampaignPlannerProviderBatchInput } from "./provider.ts";
import type { ProviderBatchItemOutput, ProviderBatchResult } from "./types.ts";

export type FakeCampaignPlannerMode =
  | "valid"
  | "invalid_enum"
  | "invalid_date_reference"
  | "duplicate_hook"
  | "missing_youtube_title"
  | "forbidden_claim"
  | "refusal"
  | "timeout"
  | "malformed"
  | "partial_output";

export class FakeCampaignPlannerProvider implements CampaignPlannerProvider {
  providerName = "fake_campaign_planner";
  mode: FakeCampaignPlannerMode;

  constructor(options: { mode?: FakeCampaignPlannerMode } = {}) {
    this.mode = options.mode || "valid";
  }

  async generateBatch(input: CampaignPlannerProviderBatchInput): Promise<ProviderBatchResult> {
    if (this.mode === "refusal") {
      throw new CampaignPlannerProviderError("provider_refusal", "Provider menolak membuat draft.", { retryable: false });
    }
    if (this.mode === "timeout") {
      throw new CampaignPlannerProviderError("provider_timeout", "Provider timeout.", { retryable: true });
    }
    if (this.mode === "malformed") {
      throw new CampaignPlannerProviderError("provider_malformed_output", "Provider menghasilkan output tidak valid.", { retryable: true });
    }

    let items = input.strategy_slots.map((slot): ProviderBatchItemOutput => {
      const hasYoutube = slot.publications.some((publication) => publication.channel === "youtube");
      const offerText = creativeTextForOffer(slot.primary_offer_code);
      return {
        draft_sequence: slot.draft_sequence,
        title: `Draft ${slot.draft_sequence} ${slot.content_pillar}`,
        school_level: slot.draft_sequence % 3 === 0 ? "smp" : "sd",
        color_code: input.knowledge.colors[slot.draft_sequence % Math.max(input.knowledge.colors.length, 1)]?.code || null,
        target_audience: slot.audience_segment === "agent_marketer" ? "Agen Daerah" : "TU Sekolah",
        hook: `Hook konten ${slot.draft_sequence} untuk ${slot.content_pillar}`,
        angle: `Angle aman untuk ${slot.content_pillar}. ${offerText.angle}`,
        cta_text: "Chat admin untuk minta mockup awal gratis sebagai preview awal.",
        cta_keyword: "MOCKUP",
        planning_reason: `Slot ${slot.draft_sequence} mengikuti strategi ${slot.content_pillar}. ${offerText.reason}`,
        youtube_title: hasYoutube ? `YouTube Shorts ${slot.draft_sequence}` : null
      };
    });

    if (this.mode === "partial_output") {
      items = items.slice(0, Math.max(0, items.length - 1));
    }
    if (this.mode === "invalid_enum" && items[0]) {
      (items[0] as any).school_level = "kuliah";
    }
    if (this.mode === "invalid_date_reference" && items[0]) {
      items[0] = { ...items[0], draft_sequence: input.strategy_slots[input.strategy_slots.length - 1].draft_sequence + 1000 };
    }
    if (this.mode === "duplicate_hook" && items.length >= 2) {
      items[1] = { ...items[1], hook: items[0].hook };
    }
    if (this.mode === "missing_youtube_title" && items[0]) {
      items[0] = { ...items[0], youtube_title: null };
    }
    if (this.mode === "forbidden_claim" && items[0]) {
      items[0] = {
        ...items[0],
        title: "Mockup bisa revisi sampai cocok",
        hook: "Gratis ongkir seluruh Indonesia dan respons 24 jam.",
        angle: "Foil emas anti pudar selamanya.",
        cta_text: "Minta garansi semua kesalahan data."
      };
    }

    const result = {
      provider_name: this.providerName,
      model_name: `fake-${this.mode}`,
      response_id: `fake-response-${input.batch_index}`,
      usage: null,
      items
    };

    return ProviderBatchResultSchema.parse(result);
  }
}

function creativeTextForOffer(offerCode: string | null): { angle: string; reason: string } {
  switch (offerCode) {
    case "mockup_awal_gratis":
      return {
        angle: "Mockup awal dijelaskan sebagai preview awal sebelum penawaran.",
        reason: "Batasannya tetap sebagai preview awal."
      };
    case "desain_final_gratis":
      return {
        angle: "Desain final gratis disampaikan setelah cocok penawaran dan cocok harga.",
        reason: "Kondisi desain gratis tetap mengikuti persetujuan penawaran."
      };
    case "revisi_final_sampai_desain_ok":
      return {
        angle: "Revisi desain final dilakukan sampai Desain OK.",
        reason: "Revisi dibatasi pada desain final, bukan revisi mockup."
      };
    case "dp_setelah_desain_ok":
      return {
        angle: "DP dilakukan setelah Desain OK atau desain disetujui.",
        reason: "Urutan bisnis tetap desain disetujui lalu DP."
      };
    case "gratis_ongkir_medan":
      return {
        angle: "Gratis ongkir berlaku untuk Kota Medan.",
        reason: "Klaim ongkir dibatasi ke Kota Medan."
      };
    case "gratis_klise_100_eksemplar":
      return {
        angle: "Gratis klise berlaku di atas 100 eksemplar setelah Desain OK.",
        reason: "Syarat kuantitas dan Desain OK disebutkan."
      };
    case "garansi_ganti_baru_cacat_produksi":
      return {
        angle: "Garansi ganti baru hanya untuk cacat produksi.",
        reason: "Tidak menjamin kesalahan data yang sudah disetujui."
      };
    case "video_call_workshop_luar_daerah":
      return {
        angle: "Video call workshop tersedia sesuai janji untuk calon pembeli luar daerah.",
        reason: "Konteks appointment disebutkan."
      };
    default:
      return {
        angle: "Menggunakan referensi produk, offer, dan pain point aktif.",
        reason: "Tidak membuat klaim baru di luar knowledge base."
      };
  }
}
