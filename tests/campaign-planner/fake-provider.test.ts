import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCampaignPlanStrategy,
  CampaignPlannerProviderError,
  FakeCampaignPlannerProvider
} from "../../packages/campaign-planner/src/index.ts";
import { validPlannerInput } from "../fixtures/campaign-planner/input.ts";

function batchInput(mode = "valid" as const) {
  const input = validPlannerInput({ requested_content_count: 3 });
  return {
    provider: new FakeCampaignPlannerProvider({ mode }),
    request: {
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
      strategy_slots: buildCampaignPlanStrategy(input),
      owner_brief: input.owner_brief
    }
  };
}

test("fake valid provider menghasilkan output deterministic dan tanpa network", async () => {
  const originalFetch = globalThis.fetch;
  (globalThis as any).fetch = () => {
    throw new Error("network forbidden");
  };
  try {
    const { provider, request } = batchInput();
    const first = await provider.generateBatch(request);
    const second = await provider.generateBatch(request);
    assert.deepEqual(first, second);
    assert.equal(first.items.length, 3);
    assert.equal(first.provider_name, "fake_campaign_planner");
  } finally {
    (globalThis as any).fetch = originalFetch;
  }
});

test("fixture refusal timeout malformed menghasilkan typed error aman", async () => {
  for (const mode of ["refusal", "timeout", "malformed"] as const) {
    const { provider, request } = batchInput(mode);
    const ownerBrief = "brief rahasia owner";
    await assert.rejects(
      () => provider.generateBatch({ ...request, owner_brief: ownerBrief }),
      (error) => {
        assert.ok(error instanceof CampaignPlannerProviderError);
        assert.equal(error.message.includes(ownerBrief), false);
        assert.equal(error.message.includes(["OPENAI", "API", "KEY"].join("_")), false);
        assert.equal(error.message.includes("DATABASE_URL"), false);
        assert.equal(/\n\s*at\s/.test(error.message), false);
        return true;
      }
    );
  }
});

test("partial output menghasilkan validation result aman", async () => {
  const { provider, request } = batchInput("partial_output");
  const result = await provider.generateBatch(request);
  assert.equal(result.items.length, request.strategy_slots.length - 1);
  assert.equal(result.provider_name, "fake_campaign_planner");
});
