import {
  buildCampaignPlanStrategy,
  CampaignPlannerInputSchema,
  CampaignPlannerProviderError,
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
let result;
try {
  result = await provider.generateBatch({
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
} catch (error) {
  if (error instanceof CampaignPlannerProviderError) {
    const output = {
      provider: "openai",
      model: config.openaiModel,
      latency_ms: Date.now() - started,
      provider_error: {
        code: error.code,
        message: safeMessage(error.message),
        retryable: error.retryable
      }
    };
    if (error.code === "invalid_structured_output" && process.env.SMOKE_SHOW_VALIDATION === "1") {
      output.provider_error.structured_output_issues = summarizeStructuredOutputIssues(
        error.details?.structured_output_issues
      );
    }
    console.log(JSON.stringify(output, null, 2));
    process.exit(1);
  }
  throw error;
}
const consolidated = consolidateCampaignPlan(input, strategy, [result]);
const validation = consolidated.draft ? validateCampaignPlanDraft(input, consolidated.draft) : null;
const validationPass = Boolean(validation && validation.errors.length === 0);

const output = {
  provider: result.provider_name,
  model: result.model_name,
  response_id: result.response_id,
  item_count: result.items.length,
  usage: result.usage,
  latency_ms: Date.now() - started,
  validation_pass: validationPass
};

if (!validationPass && process.env.SMOKE_SHOW_VALIDATION === "1") {
  output.validation_errors = summarizeIssues(consolidated.errors);
  output.validation_warnings = summarizeIssues(consolidated.warnings);
}

console.log(JSON.stringify(output, null, 2));

function summarizeIssues(issues) {
  return issues.map((issue) => {
    const details = issue.details || {};
    return {
      code: issue.code,
      draft_sequence: typeof details.draft_sequence === "number" ? details.draft_sequence : draftSequenceFromPath(issue.path),
      field: typeof details.field === "string" ? safeDiagnosticText(details.field, 80) : fieldFromPath(issue.path),
      matched_pattern: details.matched_pattern ? safeDiagnosticText(details.matched_pattern, 120) : null,
      sanitized_excerpt: details.sanitized_excerpt ? safeDiagnosticText(details.sanitized_excerpt, 120) : null,
      message: safeMessage(issue.message)
    };
  });
}

function summarizeStructuredOutputIssues(issues) {
  if (!Array.isArray(issues)) return [];
  return issues.slice(0, 20).map((issue) => ({
    path: safeDiagnosticText(issue?.path, 120),
    code: safeDiagnosticText(issue?.code, 80),
    message: safeMessage(issue?.message)
  }));
}

function draftSequenceFromPath(path) {
  if (!path) return null;
  const itemMatch = path.match(/^items\.(\d+)(?:\.|$)/);
  if (itemMatch) return Number(itemMatch[1]) + 1;
  const sequenceMatch = path.match(/^draft_sequence\.(\d+)$/);
  if (sequenceMatch) return Number(sequenceMatch[1]);
  return null;
}

function fieldFromPath(path) {
  if (!path) return null;
  const segments = path.split(".").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last || /^\d+$/.test(last)) return null;
  if (last === "items" || last === "draft_sequence") return null;
  return last;
}

function safeMessage(message) {
  return safeDiagnosticText(message, 160);
}

function safeDiagnosticText(value, maxLength) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/sk-[A-Za-z0-9_-]+/g, "[api-key]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/postgresql:\/\/\S+/gi, "[database-url]")
    .replace(/OPENAI_API_KEY=\S+/gi, "OPENAI_API_KEY=[redacted]")
    .replace(/DATABASE_URL=\S+/gi, "DATABASE_URL=[redacted]")
    .slice(0, maxLength);
}
