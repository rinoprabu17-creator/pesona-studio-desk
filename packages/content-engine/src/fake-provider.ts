import { ContentEngineSmokeResultSchema } from "./schema.ts";
import { listEnabledContentEngineAgents } from "./registry.ts";
import type {
  ContentEngineChannel,
  ContentEngineSmokeInput,
  ContentEngineSmokeResult,
  FootageMetadata,
  FootageSelection,
  ShotListItem
} from "./types.ts";
import type { ContentEngineProvider } from "./provider.ts";

export class FakeContentEngineProvider implements ContentEngineProvider {
  providerName = "fake_content_engine";
  modelName = "fake-content-engine-v1";

  async generateSmoke(input: ContentEngineSmokeInput): Promise<ContentEngineSmokeResult> {
    const channels = input.campaign.channels;
    const calendar = Array.from({ length: 7 }, (_, index) => {
      const day = index + 1;
      const pillars = ["proof_product", "mockup_magnet", "process_trust", "school_admin_tip"];
      return {
        day,
        content_pillar: pillars[index % pillars.length],
        topic: `${input.campaign.product} untuk sekolah - ide hari ${day}`,
        hook: hookForDay(day, input.campaign.product),
        recommended_channels: rotateChannels(channels, index)
      };
    });

    const angles = [
      {
        angle: "Preview sampul sekolah sebelum masuk penawaran",
        hook: "Sekolah bisa lihat gambaran sampulnya dulu sebelum lanjut order.",
        emotional_driver: "Mengurangi rasa ragu sebelum bicara harga.",
        objection: "Takut desain tidak cocok dengan identitas sekolah.",
        proof_point: "Tampilkan close-up bahan, finishing, dan contoh nama sekolah."
      },
      {
        angle: "Alur rapi dari mockup awal ke desain final",
        hook: "Biar tim sekolah tidak bolak-balik jelaskan kebutuhan dari nol.",
        emotional_driver: "Membuat proses terasa mudah dan terarah.",
        objection: "Takut proses order membingungkan.",
        proof_point: "Jelaskan tahap mockup awal, penawaran, desain final, lalu produksi."
      },
      {
        angle: "Detail finishing untuk raport dan ijazah",
        hook: "Detail kecil di sampul sering menentukan kesan pertama.",
        emotional_driver: "Membantu sekolah terlihat rapi dan profesional.",
        objection: "Takut hasil terlihat biasa saja.",
        proof_point: "Gunakan footage tekstur, sudut emboss/foil, dan stack produk."
      }
    ];

    const scenes = [
      {
        scene: 1,
        seconds: "0-3",
        visual: "Close-up sampul sekolah dengan gerakan pelan.",
        overlay_text: "Butuh sampul raport atau ijazah?",
        voice_over: "Sekolah bisa mulai dari mockup awal gratis."
      },
      {
        scene: 2,
        seconds: "3-8",
        visual: "Tunjukkan detail bahan, warna, dan finishing.",
        overlay_text: "Lihat detail sebelum lanjut penawaran",
        voice_over: "Tim bisa melihat gambaran warna, nama sekolah, dan layout awal."
      },
      {
        scene: 3,
        seconds: "8-14",
        visual: "Stack produk dan admin menyiapkan preview.",
        overlay_text: `Ketik ${input.campaign.cta}`,
        voice_over: `Chat admin dan ketik ${input.campaign.cta} untuk mulai konsultasi.`
      }
    ];

    const shotList: ShotListItem[] = [
      {
        shot_id: "shot_01_closeup_cover",
        needed_visual: "Close-up cover sampul dengan nama sekolah terlihat rapi.",
        shot_type: "close_up",
        estimated_seconds: 3
      },
      {
        shot_id: "shot_02_detail_finish",
        needed_visual: "Detail finishing, bahan, warna, atau tekstur sampul.",
        shot_type: "detail",
        estimated_seconds: 5
      },
      {
        shot_id: "shot_03_stack_admin",
        needed_visual: "Stack produk atau proses admin menyiapkan preview.",
        shot_type: "process",
        estimated_seconds: 6
      }
    ];

    const caption = {
      caption: `${input.campaign.product} untuk sekolah bisa dimulai dari mockup awal gratis. Kirim nama sekolah dan kebutuhan sampul, tim kami bantu arahkan sebelum masuk penawaran. Ketik ${input.campaign.cta} untuk mulai.`,
      hashtags: ["#SampulRaport", "#SampulIjazah", "#DesainGratis", "#SekolahIndonesia", "#PesonaGama"],
      cta: `Ketik ${input.campaign.cta} untuk minta mockup awal gratis.`,
      platform_variants: platformVariants(channels, input.campaign.cta)
    };

    const footageMetadata = input.footage.map((footage, index): FootageMetadata => ({
      path: footage.path,
      product: index % 2 === 0 ? input.campaign.product : "Sampul Raport / Map Ijazah",
      shot_type: inferShotType(footage.owner_note, index),
      angle: footage.orientation === "vertical" ? "vertical handheld" : "stable detail",
      color: footage.owner_note.toLowerCase().includes("maroon") ? "maroon" : null,
      school_level: schoolLevelFromNote(footage.owner_note),
      quality: footage.duration_seconds >= 4 ? "usable" : "needs_review",
      use_case: ["short_form_video", index === 0 ? "opening_hook" : "supporting_broll"],
      tags: ["real_footage", input.campaign.product.toLowerCase().replace(/\s+/g, "_"), inferShotType(footage.owner_note, index)]
    }));

    const footageSelection = shotList.map((shot, index): FootageSelection => {
      const selected = footageMetadata[index] || footageMetadata[0] || null;
      const fallbacks = footageMetadata
        .filter((item) => item.path !== selected?.path)
        .slice(0, 2)
        .map((item) => item.path);
      return {
        shot_id: shot.shot_id,
        selected_clip: selected?.path || null,
        reason: selected ? `Selected because owner note and tags fit ${shot.shot_type}.` : "No matching clip available.",
        fallback_clips: fallbacks,
        missing_footage_note: selected ? null : `Need real footage for ${shot.needed_visual}.`
      };
    });

    const videoDraftPlan = {
      title: `${input.campaign.code} ${input.campaign.product} real footage draft plan`,
      format: "vertical_short" as const,
      estimated_duration_seconds: 14,
      scenes: scenes.map((scene, index) => ({
        scene: scene.scene,
        clip_path: footageSelection[index]?.selected_clip || null,
        overlay_text: scene.overlay_text,
        duration_seconds: shotList[index]?.estimated_seconds || 3
      })),
      render_notes: [
        "Use real footage only; do not use the prior 4-second placeholder smoke MP4.",
        "Keep post-production plan as proposal only; no render is created in Phase 2J.1.",
        "Maintain manual review before any public-ready decision."
      ]
    };

    const review = {
      public_ready: false,
      issues: [
        "Needs actual real-footage batch verification before public readiness.",
        "Needs human review of final caption, visual clarity, and selected clips."
      ],
      suggested_revisions: [
        "Run Phase 2J.2 real footage intake and metadata batch smoke.",
        "Replace any placeholder/smoke footage with owner-approved real product footage."
      ],
      caption_cta_fit: "pass" as const,
      product_clarity: "needs_revision" as const
    };

    return ContentEngineSmokeResultSchema.parse({
      provider_name: this.providerName,
      model_name: this.modelName,
      registry: listEnabledContentEngineAgents(),
      calendar,
      angles,
      script: {
        estimated_duration_seconds: 14,
        scenes,
        shot_list: shotList
      },
      caption,
      footage_metadata: footageMetadata,
      footage_selection: footageSelection,
      video_draft_plan: videoDraftPlan,
      review
    });
  }
}

function hookForDay(day: number, product: string): string {
  const hooks = [
    `Mau lihat ${product} sekolah sebelum masuk penawaran?`,
    "Nama sekolah terlihat lebih rapi saat layout sampulnya jelas.",
    "Jangan tunggu mendekati pembagian raport baru mulai cek sampul.",
    "Finishing sampul yang rapi bisa bikin dokumen sekolah terlihat lebih siap."
  ];
  return hooks[(day - 1) % hooks.length];
}

function rotateChannels(channels: ContentEngineChannel[], index: number): ContentEngineChannel[] {
  if (channels.length <= 1) return channels;
  const first = channels[index % channels.length];
  const second = channels[(index + 1) % channels.length];
  return first === second ? [first] : [first, second];
}

function platformVariants(channels: ContentEngineChannel[], cta: string): Record<ContentEngineChannel, string> {
  const defaults: Record<ContentEngineChannel, string> = {
    facebook: `Tulis ${cta} di komentar atau chat admin untuk mulai mockup awal.`,
    instagram: `DM ${cta} untuk minta arahan mockup awal sekolah.`,
    tiktok: `Ketik ${cta} kalau mau lihat contoh sampul sekolahmu.`,
    youtube: `Komentar ${cta} untuk minta info mockup awal.`
  };
  return channels.reduce((accumulator, channel) => {
    accumulator[channel] = defaults[channel];
    return accumulator;
  }, {} as Record<ContentEngineChannel, string>);
}

function inferShotType(note: string, index: number): string {
  const value = note.toLowerCase();
  if (value.includes("close")) return "close_up";
  if (value.includes("finish") || value.includes("foil") || value.includes("detail")) return "detail";
  if (value.includes("stack") || value.includes("admin") || value.includes("proses")) return "process";
  return index === 0 ? "close_up" : "broll";
}

function schoolLevelFromNote(note: string): string | null {
  const value = note.toLowerCase();
  for (const level of ["sd", "smp", "sma", "mi", "mts", "ma"]) {
    if (value.includes(level)) return level;
  }
  return null;
}
