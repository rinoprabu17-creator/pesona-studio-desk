import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCampaignPlanStrategy,
  consolidateCampaignPlan,
  FakeCampaignPlannerProvider
} from "../../packages/campaign-planner/src/index.ts";
import { validPlannerInput } from "../fixtures/campaign-planner/input.ts";

async function generate(mode: ConstructorParameters<typeof FakeCampaignPlannerProvider>[0]["mode"] = "valid", count = 5) {
  const input = validPlannerInput({ requested_content_count: count });
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
  return { input, strategy, result };
}

test("consolidation valid merge mempertahankan strategy identity dan caption null", async () => {
  const { input, strategy, result } = await generate("valid", 5);
  const consolidated = consolidateCampaignPlan(input, strategy, [result]);
  assert.equal(consolidated.summary.valid, true);
  assert.equal(consolidated.errors.length, 0);
  assert.ok(consolidated.draft);
  assert.equal(consolidated.draft.items[0].planned_content_date, strategy[0].planned_content_date);
  assert.equal(consolidated.draft.items[0].content_pillar, strategy[0].content_pillar);
  assert.ok(consolidated.draft.items.every((item) => item.publications.every((publication) => publication.platform_caption === null)));
  assert.ok(consolidated.draft.items[0].publications.find((publication) => publication.channel === "youtube")?.platform_title);
  assert.equal(consolidated.draft.items[0].publications.find((publication) => publication.channel === "instagram")?.platform_title, null);
});

test("missing duplicate unknown sequence ditolak", async () => {
  const { input, strategy, result } = await generate("valid", 5);
  assert.ok(consolidateCampaignPlan(input, strategy, [{ ...result, items: result.items.slice(1) }]).errors.some((error) => error.code === "missing_provider_sequence"));
  assert.ok(consolidateCampaignPlan(input, strategy, [{ ...result, items: [result.items[0], result.items[0], ...result.items.slice(1)] }]).errors.some((error) => error.code === "duplicate_provider_sequence"));
  assert.ok(consolidateCampaignPlan(input, strategy, [{ ...result, items: [{ ...result.items[0], draft_sequence: 999 }, ...result.items] }]).errors.some((error) => error.code === "unknown_draft_sequence"));
});

test("provider tidak dapat mengubah strategy identity", async () => {
  const { input, strategy, result } = await generate("valid", 3);
  (result.items[0] as any).planned_content_date = "2030-01-01";
  (result.items[0] as any).content_pillar = "offer";
  const consolidated = consolidateCampaignPlan(input, strategy, [result]);
  assert.equal(consolidated.summary.valid, false);
  assert.ok(consolidated.errors.some((error) => error.code === "provider_schema_invalid"));
});

test("partial output ditolak", async () => {
  const { input, strategy, result } = await generate("partial_output", 5);
  const consolidated = consolidateCampaignPlan(input, strategy, [result]);
  assert.ok(consolidated.errors.some((error) => error.code === "missing_provider_sequence"));
});

test("field asing provider untuk publication identity ditolak", async () => {
  const { input, strategy, result } = await generate("valid", 3);
  Object.assign(result.items[0] as any, {
    product_code: "sampul_ijazah",
    audience_segment: "mixed",
    primary_offer_code: "desain_final_gratis",
    primary_pain_point_code: "slow_response",
    channel: "instagram",
    publication_format: "carousel",
    planned_publish_at: "2030-01-01T09:00:00+07:00",
    platform_caption: "caption asing"
  });
  const consolidated = consolidateCampaignPlan(input, strategy, [result]);
  assert.equal(consolidated.summary.valid, false);
  assert.ok(consolidated.errors.some((error) => error.code === "provider_schema_invalid"));
  assert.equal(consolidated.draft, null);
});

test("youtube title conditional", async () => {
  const inputWithYoutube = validPlannerInput({ requested_content_count: 1, selected_channels: ["youtube"] });
  const strategyWithYoutube = buildCampaignPlanStrategy(inputWithYoutube);
  const provider = new FakeCampaignPlannerProvider({ mode: "missing_youtube_title" });
  const resultWithMissingTitle = await provider.generateBatch({
    run_id: null,
    batch_index: 1,
    campaign: inputWithYoutube.campaign,
    knowledge: {
      products: inputWithYoutube.products,
      colors: inputWithYoutube.colors,
      school_level_defaults: inputWithYoutube.school_level_defaults,
      offers: inputWithYoutube.offers,
      pain_points: inputWithYoutube.pain_points
    },
    strategy_slots: strategyWithYoutube,
    owner_brief: null
  });
  assert.ok(consolidateCampaignPlan(inputWithYoutube, strategyWithYoutube, [resultWithMissingTitle]).errors.some((error) => error.code === "youtube_title_required"));

  const inputWithoutYoutube = validPlannerInput({ requested_content_count: 1, selected_channels: ["instagram"] });
  const strategyWithoutYoutube = buildCampaignPlanStrategy(inputWithoutYoutube);
  const resultWithoutYoutube = await new FakeCampaignPlannerProvider().generateBatch({
    run_id: null,
    batch_index: 1,
    campaign: inputWithoutYoutube.campaign,
    knowledge: {
      products: inputWithoutYoutube.products,
      colors: inputWithoutYoutube.colors,
      school_level_defaults: inputWithoutYoutube.school_level_defaults,
      offers: inputWithoutYoutube.offers,
      pain_points: inputWithoutYoutube.pain_points
    },
    strategy_slots: strategyWithoutYoutube,
    owner_brief: null
  });
  resultWithoutYoutube.items[0].youtube_title = "Judul YouTube yang tidak boleh dipakai";
  const valid = consolidateCampaignPlan(inputWithoutYoutube, strategyWithoutYoutube, [resultWithoutYoutube]);
  assert.equal(valid.summary.valid, true);
  assert.equal(valid.draft?.items[0].publications[0].platform_title, null);
  assert.ok(valid.draft?.items[0].publications.every((publication) => publication.platform_caption === null));
});
