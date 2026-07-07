import { fileURLToPath } from "node:url";
import { dirname, relative, resolve } from "node:path";
import {
  FakeContentEngineProvider,
  buildSmokeInputFromFootageRows,
  loadContentEngineRuntimeConfig,
  loadDraftPlanQualityFixture,
  loadExpandedFootageBatch,
  tuneDraftPlanQuality
} from "../packages/content-engine/src/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(__dirname, "../packages/content-engine/fixtures/real-footage-expanded-batch-smoke.json");
const qualityFixturePath = resolve(__dirname, "../packages/content-engine/fixtures/draft-plan-quality-tuning-smoke.json");
const expanded = loadExpandedFootageBatch(fixturePath);
const qualityFixture = loadDraftPlanQualityFixture(qualityFixturePath);
const config = loadContentEngineRuntimeConfig();
const provider = new FakeContentEngineProvider();
const smokeInput = buildSmokeInputFromFootageRows(expanded.usablePipelineRows);
const result = await provider.generateSmoke(smokeInput);
const qualityResult = tuneDraftPlanQuality(qualityFixture, expanded.pipelineRows);
const productFamilyCount = Object.keys(expanded.summary.product_family_breakdown).length;
const processStageCount = Object.keys(expanded.summary.process_stage_breakdown).length;

const output = {
  provider: result.provider_name,
  model: result.model_name,
  requested_provider: process.env.AI_PROVIDER || "fake",
  active_provider: config.provider,
  live_enabled: config.liveEnabled,
  fallback_reason: config.fallbackReason,
  fixture_path: relative(process.cwd(), fixturePath),
  total_rows: expanded.summary.total_rows,
  usable_rows: expanded.summary.usable_rows,
  blocked_rows: expanded.summary.blocked_rows,
  missing_required_fields: expanded.summary.missing_required_fields,
  product_family_breakdown: expanded.summary.product_family_breakdown,
  process_stage_breakdown: expanded.summary.process_stage_breakdown,
  visual_type_breakdown: expanded.summary.visual_type_breakdown,
  orientation_breakdown: expanded.summary.orientation_breakdown,
  channel_fit_breakdown: expanded.summary.channel_fit_breakdown,
  school_level_breakdown: expanded.summary.school_level_breakdown,
  color_variant_breakdown: expanded.summary.color_variant_breakdown,
  risk_flag_breakdown: expanded.summary.risk_flag_breakdown,
  average_quality_score: expanded.summary.average_quality_score,
  low_quality_count: expanded.summary.low_quality_count,
  coverage_gap_count: expanded.summary.metadata_coverage_gaps.length,
  metadata_coverage_gaps: expanded.summary.metadata_coverage_gaps,
  metadata_rows_produced: result.footage_metadata.length,
  selections_produced: result.footage_selection.length,
  draft_plan_scenes_produced: result.video_draft_plan.scenes.length,
  quality_review_items_produced: qualityResult.qualityReviews.length,
  quality_readiness_breakdown: qualityResult.readinessLevelBreakdown,
  public_ready_count: Number(result.review.public_ready) + qualityResult.publicReadyCount,
  publish_track: "blocked",
  next_phase: "Phase 2J.6 Real Footage Metadata Coverage Review"
};

if (
  output.provider !== "fake_content_engine" ||
  output.total_rows < 30 ||
  output.usable_rows < 20 ||
  output.blocked_rows < 3 ||
  productFamilyCount < 2 ||
  processStageCount < 5 ||
  (output.orientation_breakdown.vertical || 0) < 20 ||
  output.selections_produced < 3 ||
  output.public_ready_count !== 0 ||
  output.publish_track !== "blocked"
) {
  console.log(JSON.stringify(output, null, 2));
  throw new Error("real_footage_expanded_batch_smoke_failed");
}

console.log(JSON.stringify(output, null, 2));
