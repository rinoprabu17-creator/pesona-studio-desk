import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCampaignPlanStrategy,
  consolidateCampaignPlan,
  FakeCampaignPlannerProvider,
  validateCampaignPlanDraft
} from "../../packages/campaign-planner/src/index.ts";
import { validPlannerInput } from "../fixtures/campaign-planner/input.ts";
import { readFileSync } from "node:fs";

async function draftFor(mode: ConstructorParameters<typeof FakeCampaignPlannerProvider>[0]["mode"] = "valid") {
  const input = validPlannerInput({ requested_content_count: 5 });
  const strategy = buildCampaignPlanStrategy(input);
  const provider = new FakeCampaignPlannerProvider({ mode });
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
  return { input, strategy, result, consolidated: consolidateCampaignPlan(input, strategy, [result]) };
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const item of Object.values(value)) {
      deepFreeze(item as unknown);
    }
  }
  return value;
}

test("invalid reference ditolak", async () => {
  const { input, consolidated } = await draftFor("valid");
  const draft = structuredClone(consolidated.draft!);
  draft.items[0].color_code = "warna_baru";
  const validation = validateCampaignPlanDraft(input, draft);
  assert.ok(validation.errors.some((error) => error.code === "invalid_color_reference"));
});

test("missing YouTube title ditolak", async () => {
  const { consolidated } = await draftFor("missing_youtube_title");
  assert.ok(consolidated.errors.some((error) => error.code === "youtube_title_required"));
});

test("duplicate title atau hook ditolak", async () => {
  const { consolidated } = await draftFor("duplicate_hook");
  assert.ok(consolidated.errors.some((error) => error.code === "duplicate_hook"));
});

test("duplicate normalization mendeteksi case dan whitespace", async () => {
  const { input, consolidated } = await draftFor("valid");
  const draft = structuredClone(consolidated.draft!);
  draft.items[1].title = ` \t${draft.items[0].title.toUpperCase()}\n `;
  draft.items[1].hook = ` \n${draft.items[0].hook.toUpperCase().replaceAll(" ", "   ")}\t `;
  const validation = validateCampaignPlanDraft(input, draft);
  assert.ok(validation.errors.some((error) => error.code === "duplicate_title"));
  assert.ok(validation.errors.some((error) => error.code === "duplicate_hook"));
});

test("warning tidak selalu memblokir draft object", async () => {
  const { consolidated } = await draftFor("valid");
  const draft = structuredClone(consolidated.draft!);
  for (const item of draft.items) {
    item.cta_text = "Chat admin untuk konsultasi kebutuhan sampul sekolah.";
  }
  const validation = validateCampaignPlanDraft((await draftFor("valid")).input, draft);
  assert.equal(validation.errors.length, 0);
  assert.ok(validation.warnings.length > 0);
  assert.equal(
    new Set(validation.warnings.map((warning) => `${warning.code}:${warning.path || ""}`)).size,
    validation.warnings.length
  );
});

test("planner functions tidak memutasi input", async () => {
  const input = deepFreeze(validPlannerInput({ requested_content_count: 5 }));
  const beforeInput = structuredClone(input);
  const strategy = deepFreeze(buildCampaignPlanStrategy(input));
  assert.deepEqual(input, beforeInput);

  const provider = new FakeCampaignPlannerProvider();
  const request = deepFreeze({
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
  const beforeRequest = structuredClone(request);
  const result = deepFreeze(await provider.generateBatch(request));
  assert.deepEqual(request, beforeRequest);

  const beforeStrategy = structuredClone(strategy);
  const beforeResult = structuredClone(result);
  const consolidated = consolidateCampaignPlan(input, strategy, [result]);
  assert.deepEqual(strategy, beforeStrategy);
  assert.deepEqual(result, beforeResult);
  assert.ok(consolidated.draft);

  const draft = deepFreeze(structuredClone(consolidated.draft));
  const beforeDraft = structuredClone(draft);
  validateCampaignPlanDraft(input, draft);
  assert.deepEqual(draft, beforeDraft);
});

test("no operational database write dan no OpenAI dependency import", () => {
  const source = [
    "packages/campaign-planner/src/constants.ts",
    "packages/campaign-planner/src/types.ts",
    "packages/campaign-planner/src/schema.ts",
    "packages/campaign-planner/src/strategy.ts",
    "packages/campaign-planner/src/provider.ts",
    "packages/campaign-planner/src/fake-provider.ts",
    "packages/campaign-planner/src/consolidate.ts",
    "packages/campaign-planner/src/validation.ts",
    "packages/campaign-planner/src/claim-rules.ts"
  ].map((path) => readFileSync(path, "utf8")).join("\n");
  assert.equal(source.includes("content_items"), false);
  assert.equal(source.includes("content_publications"), false);
  assert.equal(source.includes("db.ts"), false);
  assert.equal(source.includes("from \"pg\""), false);
  assert.equal(source.includes("DATABASE_URL"), false);
  assert.equal(/\b(INSERT|UPDATE|DELETE)\b/i.test(source), false);
  assert.equal(/\bfetch\s*\(/.test(source), false);
  assert.equal(source.includes("routes/"), false);
  assert.equal(source.includes("worker"), false);
  assert.equal(source.includes("from \"openai\""), false);
  assert.equal(source.includes("@openai/agents"), false);
  assert.equal(source.includes(["OPENAI", "API", "KEY"].join("_")), false);
});
