import {
  ContentEngineSmokeInputSchema,
  FakeContentEngineProvider,
  loadContentEngineRuntimeConfig
} from "../packages/content-engine/src/index.ts";

const config = loadContentEngineRuntimeConfig();
const provider = new FakeContentEngineProvider();

const input = ContentEngineSmokeInputSchema.parse({
  campaign: {
    code: "PILOT-DESAIN-GRATIS-REAL-FOOTAGE-01",
    product: "Sampul Raport",
    theme: "Desain Gratis untuk sekolah yang ingin lihat mockup awal sebelum penawaran",
    month: "2026-07",
    audience: ["SD", "SMP", "SMA", "MI", "MTs", "MA"],
    offer: "Desain Gratis setelah cocok penawaran",
    cta: "MOCKUP",
    channels: ["facebook", "instagram", "tiktok", "youtube"]
  },
  footage: [
    {
      path: "storage/footage/real-batch/sample-closeup-sampul-raport-sd.mp4",
      owner_note: "Close-up sampul raport SD warna maroon, real product footage.",
      duration_seconds: 8,
      orientation: "vertical"
    },
    {
      path: "storage/footage/real-batch/sample-detail-finishing-foil.mp4",
      owner_note: "Detail finishing foil dan tekstur bahan sampul.",
      duration_seconds: 6,
      orientation: "vertical"
    },
    {
      path: "storage/footage/real-batch/sample-stack-admin-process.mp4",
      owner_note: "Stack produk dan proses admin menyiapkan preview mockup.",
      duration_seconds: 7,
      orientation: "vertical"
    }
  ]
});

const result = await provider.generateSmoke(input);
const output = {
  provider: result.provider_name,
  model: result.model_name,
  requested_provider: process.env.AI_PROVIDER || "fake",
  active_provider: config.provider,
  live_enabled: config.liveEnabled,
  fallback_reason: config.fallbackReason,
  agent_count: result.registry.length,
  calendar_days: result.calendar.length,
  angle_count: result.angles.length,
  script_scene_count: result.script.scenes.length,
  footage_metadata_count: result.footage_metadata.length,
  footage_selection_count: result.footage_selection.length,
  draft_plan_scene_count: result.video_draft_plan.scenes.length,
  public_ready: result.review.public_ready,
  blocked_publish_track: true,
  next_phase: "Phase 2J.2 Real Footage Intake & Metadata Batch Smoke"
};

console.log(JSON.stringify(output, null, 2));
