import test from "node:test";
import assert from "node:assert/strict";
import {
  allocatePillars,
  buildCampaignPlanStrategy,
  channelFormatMatrix,
  splitStrategyIntoBatches
} from "../../packages/campaign-planner/src/index.ts";
import { validPlannerInput } from "../fixtures/campaign-planner/input.ts";

test("default 30-pillar distribution persis", () => {
  assert.deepEqual(allocatePillars(30), {
    mockup_magnet: 7,
    desain_gratis: 5,
    trust_process: 4,
    pain_point: 5,
    product_proof: 3,
    offer: 3,
    agent: 2,
    education: 1
  });
});

test("proportional allocation untuk count lain totalnya tepat", () => {
  for (const count of [1, 2, 7, 13, 29, 30]) {
    const allocation = allocatePillars(count);
    assert.equal(Object.values(allocation).reduce((total, value) => total + value, 0), count);
    assert.ok(Object.values(allocation).every((value) => value >= 0));
    assert.deepEqual(allocation, allocatePillars(count));
  }
});

test("date distribution dalam campaign period dan deterministic", () => {
  const input = validPlannerInput({ requested_content_count: 10 });
  const first = buildCampaignPlanStrategy(input);
  const second = buildCampaignPlanStrategy(input);
  assert.deepEqual(first, second);
  assert.equal(first[0].planned_content_date, "2026-07-01");
  assert.equal(first.at(-1)?.planned_content_date, "2026-07-30");
  assert.ok(first.every((slot) => slot.planned_content_date >= "2026-07-01" && slot.planned_content_date <= "2026-07-30"));
});

test("five-channel publication skeleton dan posting time benar", () => {
  const slots = buildCampaignPlanStrategy(validPlannerInput({ requested_content_count: 1 }));
  const publications = slots[0].publications;
  assert.deepEqual(publications.map((item) => item.channel), ["instagram", "facebook", "tiktok", "youtube", "whatsapp_status"]);
  assert.deepEqual(publications.map((item) => item.publication_format), ["reel", "reel", "short_video", "short_video", "status_video"]);
  assert.equal(publications[0].planned_publish_at, "2026-07-01T09:00:00+07:00");
});

test("default posting time channel tidak dipilih tidak membuat publication tambahan", () => {
  const slots = buildCampaignPlanStrategy(validPlannerInput({
    requested_content_count: 1,
    selected_channels: ["instagram"],
    default_posting_times: {
      instagram: "09:30",
      youtube: "19:15"
    }
  }));
  assert.deepEqual(slots[0].publications.map((item) => item.channel), ["instagram"]);
  assert.equal(slots[0].publications[0].planned_publish_at, "2026-07-01T09:30:00+07:00");
});

test("campaign satu hari menghasilkan seluruh slot pada tanggal yang sama", () => {
  const input = validPlannerInput({
    campaign: { ...validPlannerInput().campaign, start_date: "2026-07-01", end_date: "2026-07-01" },
    requested_content_count: 30
  });
  const first = buildCampaignPlanStrategy(input);
  const second = buildCampaignPlanStrategy(input);
  assert.deepEqual(first, second);
  assert.equal(first.length, 30);
  assert.ok(first.every((slot) => slot.planned_content_date === "2026-07-01"));
  assert.deepEqual(first.map((slot) => slot.draft_sequence), Array.from({ length: 30 }, (_, index) => index + 1));
});

test("date distribution mendukung leap day lintas bulan dan lintas tahun", () => {
  for (const campaign of [
    { start_date: "2028-02-29", end_date: "2028-02-29" },
    { start_date: "2026-01-31", end_date: "2026-02-02" },
    { start_date: "2026-12-30", end_date: "2027-01-02" }
  ]) {
    const slots = buildCampaignPlanStrategy(validPlannerInput({
      campaign: { ...validPlannerInput().campaign, ...campaign },
      requested_content_count: 2
    }));
    assert.equal(slots.length, 2);
    assert.ok(slots.every((slot) => slot.planned_content_date >= campaign.start_date && slot.planned_content_date <= campaign.end_date));
  }
});

test("snapshot kosong aman dan reference nullable tetap null", () => {
  const slots = buildCampaignPlanStrategy(validPlannerInput({
    requested_content_count: 3,
    products: [],
    offers: [],
    pain_points: []
  }));
  assert.ok(slots.every((slot) => slot.product_code === null));
  assert.ok(slots.every((slot) => slot.primary_offer_code === null));
  assert.ok(slots.every((slot) => slot.primary_pain_point_code === null));
});

test("satu active product digunakan tanpa membuat code baru", () => {
  const slots = buildCampaignPlanStrategy(validPlannerInput({
    requested_content_count: 3,
    products: [{ code: "sampul_raport", name: "Sampul Raport", active: true }]
  }));
  assert.ok(slots.every((slot) => slot.product_code === "sampul_raport"));
});

test("format matrix benar", () => {
  assert.ok(channelFormatMatrix.instagram.includes("reel"));
  assert.ok(!channelFormatMatrix.tiktok.includes("reel"));
  assert.ok(channelFormatMatrix.youtube.includes("short_video"));
});

test("batching 30 item dengan size 5 menghasilkan 6 batch", () => {
  const slots = buildCampaignPlanStrategy(validPlannerInput());
  const batches = splitStrategyIntoBatches(slots, 5);
  assert.equal(batches.length, 6);
  assert.equal(batches.flat().length, 30);
  assert.deepEqual(batches.flat().map((slot) => slot.draft_sequence), Array.from({ length: 30 }, (_, index) => index + 1));
});

test("batch boundary valid dan invalid", () => {
  for (const count of [1, 9, 10, 11, 30]) {
    const slots = buildCampaignPlanStrategy(validPlannerInput({ requested_content_count: count }));
    for (const size of [1, 5, 10]) {
      const flat = splitStrategyIntoBatches(slots, size).flat();
      assert.equal(flat.length, count);
      assert.deepEqual(flat.map((slot) => slot.draft_sequence), Array.from({ length: count }, (_, index) => index + 1));
      assert.equal(new Set(flat.map((slot) => slot.draft_sequence)).size, count);
    }
  }

  const slots = buildCampaignPlanStrategy(validPlannerInput({ requested_content_count: 3 }));
  assert.throws(() => splitStrategyIntoBatches(slots, 0), /1-10/);
  assert.throws(() => splitStrategyIntoBatches(slots, 11), /1-10/);
  assert.throws(() => splitStrategyIntoBatches(slots, 1.5), /1-10/);
});
