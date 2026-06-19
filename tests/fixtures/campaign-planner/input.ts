import type { CampaignPlannerInput } from "../../../packages/campaign-planner/src/index.ts";

export function validPlannerInput(overrides: Partial<CampaignPlannerInput> = {}): CampaignPlannerInput {
  const input: CampaignPlannerInput = {
    campaign: {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      code: "AUDIT-PLAN",
      name: "Audit Planner",
      start_date: "2026-07-01",
      end_date: "2026-07-30",
      target_audience: "Sekolah dan agen daerah",
      primary_product_code: null
    },
    requested_content_count: 30,
    selected_channels: ["instagram", "facebook", "tiktok", "youtube", "whatsapp_status"],
    owner_brief: null,
    default_posting_times: {
      instagram: "09:00",
      facebook: "09:15",
      tiktok: "19:00",
      youtube: "19:15",
      whatsapp_status: "07:00"
    },
    products: [
      { code: "sampul_raport", name: "Sampul Raport", active: true },
      { code: "sampul_ijazah", name: "Sampul Ijazah", active: true }
    ],
    colors: [
      { code: "maroon", name: "Maroon", active: true, hex_preview: "#6E1F1F" },
      { code: "navy", name: "Navy", active: true, hex_preview: "#0C2340" },
      { code: "hitam", name: "Hitam", active: true, hex_preview: "#111111" },
      { code: "hijau_tua", name: "Hijau Tua", active: true, hex_preview: "#123D2A" }
    ],
    school_level_defaults: [
      { school_level: "sd", color_code: "maroon", active: true },
      { school_level: "smp", color_code: "navy", active: true },
      { school_level: "sma", color_code: "hitam", active: true },
      { school_level: "mi", color_code: "hijau_tua", active: true },
      { school_level: "mts", color_code: "hijau_tua", active: true },
      { school_level: "ma", color_code: "hijau_tua", active: true }
    ],
    offers: [
      {
        code: "mockup_awal_gratis",
        title: "Mockup Awal Gratis",
        public_phrase: "Mockup awal gratis tanpa revisi mockup.",
        condition_text: "Untuk preview awal sebelum penawaran. Mockup awal tidak direvisi.",
        risk_note: "Jangan sebut sebagai desain final produksi.",
        active: true
      },
      {
        code: "desain_final_gratis",
        title: "Desain Final Gratis",
        public_phrase: "Desain final gratis setelah cocok penawaran.",
        condition_text: "Berlaku setelah customer cocok harga dan data cukup untuk desain final.",
        risk_note: "Jangan tulis desain final gratis untuk semua orang tanpa syarat.",
        active: true
      },
      {
        code: "revisi_final_sampai_desain_ok",
        title: "Revisi Desain Final",
        public_phrase: "Revisi desain final sampai Desain OK.",
        condition_text: "Berlaku untuk desain final setelah customer cocok penawaran.",
        risk_note: "Jangan disamakan dengan revisi mockup.",
        active: true
      },
      {
        code: "dp_setelah_desain_ok",
        title: "DP Setelah Desain OK",
        public_phrase: "DP setelah Desain OK.",
        condition_text: "Pembayaran DP dilakukan setelah desain disetujui.",
        risk_note: "Jangan minta DP sebelum desain disetujui.",
        active: true
      },
      {
        code: "gratis_ongkir_medan",
        title: "Gratis Ongkir Medan",
        public_phrase: "Gratis ongkir Kota Medan.",
        condition_text: "Berlaku untuk pengiriman di Kota Medan.",
        risk_note: "Jangan klaim gratis ongkir seluruh Indonesia.",
        active: true
      },
      {
        code: "gratis_klise_100_eksemplar",
        title: "Gratis Klise",
        public_phrase: "Gratis klise setelah Desain OK untuk pesanan di atas 100 eksemplar.",
        condition_text: "Berlaku setelah Desain OK dan kuantitas di atas 100 eksemplar.",
        risk_note: "Jangan hilangkan syarat kuantitas.",
        active: true
      },
      {
        code: "garansi_ganti_baru_cacat_produksi",
        title: "Garansi Ganti Baru",
        public_phrase: "Garansi ganti baru untuk produk cacat produksi.",
        condition_text: "Berlaku untuk cacat produksi, bukan kesalahan data yang sudah disetujui.",
        risk_note: "Bedakan dari kesalahan penulisan setelah desain disetujui.",
        active: true
      },
      {
        code: "video_call_workshop_luar_daerah",
        title: "Video Call Workshop",
        public_phrase: "Video call workshop untuk calon pembeli luar daerah sesuai janji.",
        condition_text: "Berdasarkan appointment atau jam kerja yang disepakati.",
        risk_note: "Jangan klaim standby 24 jam.",
        active: true
      }
    ],
    pain_points: [
      { code: "pesanan_tidak_tepat_waktu", title: "Pesanan tidak selesai tepat waktu", active: true },
      { code: "slow_response", title: "Sales atau customer service slow response", active: true },
      { code: "foil_emas_mudah_pudar", title: "Foil emas mudah pudar", active: true },
      { code: "ragu_vendor_luar_daerah", title: "Calon pembeli luar daerah ragu terhadap vendor", active: true },
      { code: "kekhawatiran_produk_cacat", title: "Kekhawatiran produk cacat", active: true },
      { code: "data_sekolah_salah_cetak", title: "Kekhawatiran nama sekolah atau data tercetak salah", active: true }
    ],
    timezone: "Asia/Jakarta"
  };

  return { ...input, ...overrides };
}
