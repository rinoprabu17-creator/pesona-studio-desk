import test from "node:test";
import assert from "node:assert/strict";
import {
  CampaignPlanDraftItemSchema,
  CampaignPlanDraftSchema,
  CampaignPlanStrategySlotSchema,
  CampaignPlannerInputSchema,
  FinalPublicationSchema,
  ProviderBatchItemOutputSchema,
  ProviderBatchResultSchema,
  StrategyPublicationSchema
} from "../../packages/campaign-planner/src/index.ts";
import { validPlannerInput } from "../fixtures/campaign-planner/input.ts";

test("input valid diterima", () => {
  assert.equal(CampaignPlannerInputSchema.safeParse(validPlannerInput()).success, true);
});

test("content count di luar 1-30 ditolak", () => {
  assert.equal(CampaignPlannerInputSchema.safeParse(validPlannerInput({ requested_content_count: 0 })).success, false);
  assert.equal(CampaignPlannerInputSchema.safeParse(validPlannerInput({ requested_content_count: 31 })).success, false);
});

test("selected channel kosong ditolak", () => {
  assert.equal(CampaignPlannerInputSchema.safeParse(validPlannerInput({ selected_channels: [] })).success, false);
});

test("selected channel duplikat ditolak", () => {
  assert.equal(CampaignPlannerInputSchema.safeParse(validPlannerInput({
    selected_channels: ["instagram", "instagram", "youtube"]
  })).success, false);
});

test("owner brief dibatasi dan untrusted", () => {
  assert.equal(CampaignPlannerInputSchema.safeParse(validPlannerInput({ owner_brief: "x".repeat(2001) })).success, false);
});

test("posting time valid diterima dan invalid ditolak", () => {
  for (const time of ["00:00", "07:00", "09:30", "23:59"]) {
    assert.equal(CampaignPlannerInputSchema.safeParse(validPlannerInput({
      default_posting_times: { instagram: time }
    })).success, true);
  }

  for (const time of ["24:00", "09:60", "9:00", "09:30:00", "teks bebas"]) {
    assert.equal(CampaignPlannerInputSchema.safeParse(validPlannerInput({
      default_posting_times: { instagram: time }
    })).success, false);
  }

  assert.equal(CampaignPlannerInputSchema.safeParse(validPlannerInput({
    default_posting_times: { instagram: "09:00", linkedin: "09:00" } as any
  })).success, false);
});

test("campaign period invalid ditolak", () => {
  assert.equal(CampaignPlannerInputSchema.safeParse(validPlannerInput({
    campaign: { ...validPlannerInput().campaign, start_date: "2026-02-31" }
  })).success, false);
  assert.equal(CampaignPlannerInputSchema.safeParse(validPlannerInput({
    campaign: { ...validPlannerInput().campaign, end_date: "2026-02-31" }
  })).success, false);
  assert.equal(CampaignPlannerInputSchema.safeParse(validPlannerInput({
    campaign: { ...validPlannerInput().campaign, start_date: "2026-07-30", end_date: "2026-07-01" }
  })).success, false);
});

test("snapshot duplicate code dan primary product invalid ditolak", () => {
  const input = validPlannerInput();
  assert.equal(CampaignPlannerInputSchema.safeParse(validPlannerInput({
    products: [input.products[0], input.products[0]]
  })).success, false);
  assert.equal(CampaignPlannerInputSchema.safeParse(validPlannerInput({
    colors: [input.colors[0], input.colors[0]]
  })).success, false);
  assert.equal(CampaignPlannerInputSchema.safeParse(validPlannerInput({
    offers: [input.offers[0], input.offers[0]]
  })).success, false);
  assert.equal(CampaignPlannerInputSchema.safeParse(validPlannerInput({
    pain_points: [input.pain_points[0], input.pain_points[0]]
  })).success, false);
  assert.equal(CampaignPlannerInputSchema.safeParse(validPlannerInput({
    campaign: { ...input.campaign, primary_product_code: "tidak_ada" }
  })).success, false);
});

test("schema penting strict terhadap field asing", () => {
  const input = validPlannerInput() as any;
  assert.equal(CampaignPlannerInputSchema.safeParse({ ...input, unexpected: true }).success, false);

  const strategyPublication = { channel: "instagram", publication_format: "reel", planned_publish_at: null };
  assert.equal(StrategyPublicationSchema.safeParse({ ...strategyPublication, platform_caption: "x" }).success, false);

  const strategySlot = {
    draft_sequence: 1,
    planned_content_date: "2026-07-01",
    product_code: null,
    audience_segment: "end_user_school",
    content_pillar: "mockup_magnet",
    primary_offer_code: null,
    primary_pain_point_code: null,
    publications: [strategyPublication]
  };
  assert.equal(CampaignPlanStrategySlotSchema.safeParse({ ...strategySlot, hook: "asing" }).success, false);

  const providerItem = {
    draft_sequence: 1,
    title: "Title",
    school_level: null,
    color_code: null,
    target_audience: "TU",
    hook: "Hook",
    angle: "Angle",
    cta_text: "CTA",
    cta_keyword: null,
    planning_reason: "Reason",
    youtube_title: null
  };
  assert.equal(ProviderBatchItemOutputSchema.safeParse({ ...providerItem, planned_content_date: "2026-07-01" }).success, false);
  assert.equal(ProviderBatchResultSchema.safeParse({
    provider_name: "fake",
    model_name: "fake",
    response_id: null,
    usage: null,
    items: [providerItem],
    extra: true
  }).success, false);

  const finalPublication = { ...strategyPublication, platform_title: null, platform_caption: null };
  assert.equal(FinalPublicationSchema.safeParse({ ...finalPublication, planned_content_date: "2026-07-01" }).success, false);

  const finalItem = {
    ...strategySlot,
    title: "Title",
    school_level: null,
    color_code: null,
    target_audience: "TU",
    hook: "Hook",
    angle: "Angle",
    cta_text: "CTA",
    cta_keyword: null,
    planning_reason: "Reason",
    publications: [finalPublication]
  };
  assert.equal(CampaignPlanDraftItemSchema.safeParse({ ...finalItem, channel: "instagram" }).success, false);
  assert.equal(CampaignPlanDraftSchema.safeParse({
    plan_summary: "Summary",
    requested_content_count: 1,
    items: [finalItem],
    unexpected: true
  }).success, false);
});
