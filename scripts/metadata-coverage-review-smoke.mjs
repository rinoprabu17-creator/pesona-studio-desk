import { fileURLToPath } from "node:url";
import { dirname, relative, resolve } from "node:path";
import {
  FakeContentEngineProvider,
  loadContentEngineRuntimeConfig,
  loadExpandedFootageBatch,
  reviewMetadataCoverage
} from "../packages/content-engine/src/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(__dirname, "../packages/content-engine/fixtures/real-footage-expanded-batch-smoke.json");
const fixtureRelativePath = relative(process.cwd(), fixturePath);
const expanded = loadExpandedFootageBatch(fixturePath);
const config = loadContentEngineRuntimeConfig();
const provider = new FakeContentEngineProvider();
const review = reviewMetadataCoverage(expanded, fixtureRelativePath);

const output = {
  provider: provider.providerName,
  requested_provider: process.env.AI_PROVIDER || "fake",
  active_provider: config.provider,
  live_enabled: config.liveEnabled,
  fallback_reason: config.fallbackReason,
  fixture_path: fixtureRelativePath,
  total_rows: review.total_rows,
  usable_rows: review.usable_rows,
  blocked_rows: review.blocked_rows,
  coverage_score: review.coverage_score,
  coverage_level: review.coverage_level,
  product_families_covered: Object.values(review.product_family_coverage).filter((item) => item.usable_count > 0).length,
  raw_process_stages_available: Object.keys(expanded.summary.process_stage_breakdown).length,
  raw_process_stage_breakdown: expanded.summary.process_stage_breakdown,
  required_process_categories_covered: Object.values(review.process_stage_coverage).filter((item) => item.usable_count > 0).length,
  required_process_categories_total: Object.keys(review.process_stage_coverage).length,
  channels_covered: Object.values(review.channel_coverage).filter((item) => item.usable_count > 0).length,
  estimated_unique_short_video_ideas: review.content_calendar_support.estimated_unique_short_video_ideas,
  estimated_usable_30_day_slots: review.content_calendar_support.estimated_usable_30_day_slots,
  weak_spot_count: review.weak_spots.length,
  weak_spots: review.weak_spots,
  recommended_capture_count: review.recommended_footage_to_capture.length,
  recommended_footage_to_capture: review.recommended_footage_to_capture,
  strongest_content_pillars: review.content_calendar_support.strongest_content_pillars,
  weakest_content_pillars: review.content_calendar_support.weakest_content_pillars,
  public_ready: review.public_ready,
  public_ready_count: Number(review.public_ready),
  publish_track: review.publish_track,
  next_phase: "Phase 2J.7 Real Footage Intake Dry-Run Gate"
};

if (
  output.provider !== "fake_content_engine" ||
  output.total_rows < 30 ||
  output.usable_rows < 20 ||
  output.blocked_rows < 3 ||
  output.coverage_score <= 0 ||
  output.coverage_level === "weak" ||
  output.estimated_unique_short_video_ideas < 10 ||
  output.weak_spot_count < 0 ||
  output.recommended_capture_count < 0 ||
  output.public_ready !== false ||
  output.publish_track !== "blocked"
) {
  console.log(JSON.stringify(output, null, 2));
  throw new Error("metadata_coverage_review_smoke_failed");
}

console.log(JSON.stringify(output, null, 2));
