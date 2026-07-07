import { fileURLToPath } from "node:url";
import { dirname, relative, resolve } from "node:path";
import {
  loadDraftPlanQualityFixture,
  loadFootageIntakeManifest,
  tuneDraftPlanQuality
} from "../packages/content-engine/src/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const intakeFixturePath = resolve(__dirname, "../packages/content-engine/fixtures/real-footage-intake-smoke.json");
const qualityFixturePath = resolve(__dirname, "../packages/content-engine/fixtures/draft-plan-quality-tuning-smoke.json");
const intake = loadFootageIntakeManifest(intakeFixturePath);
const fixture = loadDraftPlanQualityFixture(qualityFixturePath);
const result = tuneDraftPlanQuality(fixture, intake.manifest.rows);

const output = {
  provider: result.provider,
  fixture_path: relative(process.cwd(), qualityFixturePath),
  planned_content_items: fixture.planned_content.length,
  quality_review_items: result.qualityReviews.length,
  readiness_level_breakdown: result.readinessLevelBreakdown,
  max_readiness_score: result.maxReadinessScore,
  blocked_count: result.blockedCount,
  needs_footage_count: result.needsFootageCount,
  improvement_actions_count: result.improvementActionsCount,
  missing_footage_priority_count: result.missingFootagePriorityCount,
  public_ready_count: result.publicReadyCount,
  publish_track: result.publishTrack,
  quality_items: result.qualityReviews.map((review) => ({
    content_id: review.content_id,
    readiness_level: review.readiness_level,
    readiness_score: review.readiness_score,
    blocking_reasons: review.blocking_reasons.length,
    improvement_actions: review.improvement_actions.length,
    missing_footage_priority: review.missing_footage_priority.length,
    public_ready: review.public_ready,
    publish_track: review.publish_track
  }))
};

if (
  output.provider !== "fake_content_engine" ||
  output.planned_content_items < 4 ||
  output.quality_review_items < 4 ||
  (output.readiness_level_breakdown.draft_plan_ok < 1 && output.max_readiness_score < 85) ||
  output.needs_footage_count < 1 ||
  output.blocked_count < 1 ||
  output.improvement_actions_count < 3 ||
  output.missing_footage_priority_count < 1 ||
  output.public_ready_count !== 0 ||
  output.publish_track !== "blocked"
) {
  console.log(JSON.stringify(output, null, 2));
  throw new Error("draft_plan_quality_tuning_smoke_failed");
}

console.log(JSON.stringify(output, null, 2));
