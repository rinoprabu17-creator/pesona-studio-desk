import { fileURLToPath } from "node:url";
import { dirname, relative, resolve } from "node:path";
import {
  loadFootageIntakeManifest,
  loadScriptDraftReviewFixture,
  reviewScriptDraftPlans
} from "../packages/content-engine/src/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const intakeFixturePath = resolve(__dirname, "../packages/content-engine/fixtures/real-footage-intake-smoke.json");
const reviewFixturePath = resolve(__dirname, "../packages/content-engine/fixtures/script-draft-review-smoke.json");
const intake = loadFootageIntakeManifest(intakeFixturePath);
const reviewFixture = loadScriptDraftReviewFixture(reviewFixturePath);
const result = reviewScriptDraftPlans(reviewFixture.planned_content, intake.manifest.rows);

const output = {
  provider: result.provider,
  source_fixture_path: relative(process.cwd(), reviewFixturePath),
  footage_fixture_path: relative(process.cwd(), intakeFixturePath),
  planned_content_items: reviewFixture.planned_content.length,
  review_items_produced: result.reviews.length,
  selected_footage_count: result.selectedFootageCount,
  missing_footage_notes_count: result.missingFootageNotesCount,
  blocked_low_readiness_count: result.blockedLowReadinessCount,
  max_readiness_score: result.maxReadinessScore,
  public_ready_count: result.publicReadyCount,
  publish_track: result.publishTrack,
  review_items: result.reviews.map((review) => ({
    content_id: review.content_id,
    readiness_score: review.readiness_score,
    selected_footage_ids: review.selected_footage_ids,
    missing_footage_notes: review.missing_footage_notes.length,
    risk_notes: review.risk_notes.length,
    public_ready: review.public_ready,
    publish_track: review.publish_track
  }))
};

if (
  output.provider !== "fake_content_engine" ||
  output.planned_content_items < 3 ||
  output.review_items_produced < 3 ||
  output.missing_footage_notes_count < 1 ||
  output.blocked_low_readiness_count < 1 ||
  output.public_ready_count !== 0 ||
  output.publish_track !== "blocked"
) {
  console.log(JSON.stringify(output, null, 2));
  throw new Error("script_draft_review_smoke_failed");
}

console.log(JSON.stringify(output, null, 2));
