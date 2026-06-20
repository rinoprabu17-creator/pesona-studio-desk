import {
  buildCampaignPlanStrategy,
  CampaignPlannerInputSchema,
  OpenAICampaignPlannerProvider,
  loadCampaignPlannerRuntimeConfig,
  timezone,
  validateCampaignPlanDraft,
  consolidateCampaignPlan
} from "../packages/campaign-planner/src/index.ts";

if (process.env.OPENAI_LIVE_SMOKE !== "1") {
  console.log("[smoke] OPENAI_LIVE_SMOKE=1 tidak diset. Tidak ada API call.");
  console.log("[smoke] Siapkan OPENAI_MODEL dan OPENAI_API_KEY_FILE atau OPENAI_API_KEY untuk menjalankan smoke manual.");
  process.exit(0);
}

const config = loadCampaignPlannerRuntimeConfig();
if (config.provider !== "openai" || !config.openaiModel) {
  throw new Error("OpenAI smoke membutuhkan CAMPAIGN_PLANNER_PROVIDER=openai dan OPENAI_MODEL.");
}

const input = CampaignPlannerInputSchema.parse({
  campaign: {
    id: "00000000-0000-4000-8000-000000000001",
    code: "SMOKE-OPENAI",
    name: "Smoke OpenAI",
    start_date: "2026-07-01",
    end_date: "2026-07-05",
    target_audience: "TU Sekolah",
    primary_product_code: null
  },
  requested_content_count: 5,
  selected_channels: ["instagram", "youtube"],
  owner_brief: "Smoke test manual. Jangan cetak brief penuh.",
  default_posting_times: { instagram: "09:00", youtube: "19:15" },
  products: [{ code: "sampul_raport", name: "Sampul Raport", active: true }],
  colors: [{ code: "biru", name: "Biru", hex_preview: "#1d4ed8", active: true }],
  school_level_defaults: [{ school_level: "sd", color_code: "biru", active: true }],
  offers: [
    {
      code: "mockup_awal_gratis",
      title: "Mockup Awal Gratis",
      public_phrase: "Mockup awal gratis",
      condition_text: "Preview awal",
      risk_note: "Tidak ada revisi mockup",
      active: true
    }
  ],
  pain_points: [],
  timezone
});

const strategy = buildCampaignPlanStrategy(input).slice(0, 5);
const provider = new OpenAICampaignPlannerProvider({
  model: config.openaiModel,
  promptVersion: config.promptVersion,
  maxOutputTokens: config.openaiMaxOutputTokens,
  timeoutMs: config.openaiTimeoutMs
});

const started = Date.now();
const result = await provider.generateBatch({
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
  owner_brief: input.owner_brief
});
const consolidated = consolidateCampaignPlan(input, strategy, [result]);
const validation = consolidated.draft ? validateCampaignPlanDraft(input, consolidated.draft) : null;

console.log(JSON.stringify({
  provider: result.provider_name,
  model: result.model_name,
  response_id: result.response_id,
  item_count: result.items.length,
  usage: result.usage,
  latency_ms: Date.now() - started,
  validation_pass: Boolean(validation && validation.errors.length === 0)
}, null, 2));
