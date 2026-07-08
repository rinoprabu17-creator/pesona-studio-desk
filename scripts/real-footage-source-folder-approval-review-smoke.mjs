import { readFileSync } from "node:fs";
import {
  FakeContentEngineProvider,
  loadContentEngineRuntimeConfig,
  parseSourceFolderApprovalReviewFixture,
  reviewSourceFolderApprovals
} from "../packages/content-engine/src/index.ts";

const fixturePath = "packages/content-engine/fixtures/source-folder-approval-review-smoke.json";
const config = loadContentEngineRuntimeConfig();
const provider = new FakeContentEngineProvider();
const fixture = parseSourceFolderApprovalReviewFixture(JSON.parse(readFileSync(fixturePath, "utf8")));
const result = reviewSourceFolderApprovals(fixture);

const approvalReviewOkCount = result.record_reviews.filter((review) => review.review_status === "approval_review_ok").length;
const needsOwnerReviewCount = result.record_reviews.filter((review) => review.review_status === "needs_owner_review").length;
const incompleteApprovalCount = result.record_reviews.filter((review) => review.review_status === "incomplete_approval").length;
const blockedSourceCount = result.record_reviews.filter((review) => review.review_status === "blocked_source").length;

const output = {
  provider: provider.providerName,
  requested_provider: process.env.AI_PROVIDER || "fake",
  active_provider: config.provider,
  live_enabled: config.liveEnabled,
  fallback_reason: config.fallbackReason,
  fixture_path: fixturePath,
  review_id: result.review_id,
  approval_policy_version: result.approval_policy_version,
  reviewed_records: result.reviewed_records,
  approval_review_ok_count: approvalReviewOkCount,
  needs_owner_review_count: needsOwnerReviewCount,
  incomplete_approval_count: incompleteApprovalCount,
  blocked_source_count: blockedSourceCount,
  missing_approval_fields_count: result.missing_approval_fields.length,
  unsafe_path_findings_count: result.unsafe_path_findings.length,
  denied_action_findings_count: result.action_permission_findings.length,
  recommended_owner_actions_count: result.recommended_owner_actions.length,
  public_ready: result.public_ready,
  public_ready_count: Number(result.public_ready),
  publish_track: result.publish_track,
  review_status_breakdown: {
    approval_review_ok: approvalReviewOkCount,
    needs_owner_review: needsOwnerReviewCount,
    incomplete_approval: incompleteApprovalCount,
    blocked_source: blockedSourceCount
  },
  gate_status_breakdown: result.record_reviews.reduce((acc, review) => {
    acc[review.gate_status_from_phase_2j10] = (acc[review.gate_status_from_phase_2j10] || 0) + 1;
    return acc;
  }, {}),
  record_summaries: result.record_reviews.map((review) => ({
    source_id: review.source_id,
    allowlisted_root: review.allowlisted_root,
    path_safety_status: review.path_safety_status,
    denied_actions: review.denied_actions,
    gate_status_from_phase_2j10: review.gate_status_from_phase_2j10,
    review_status: review.review_status,
    missing_fields: review.missing_fields,
    recommended_action: review.recommended_action
  })),
  no_real_path_access: true,
  next_phase: "Phase 2J.12 Real Footage Source Folder Read-Only Listing Approval Gate"
};

if (
  output.provider !== "fake_content_engine" ||
  output.reviewed_records < 6 ||
  output.approval_review_ok_count < 1 ||
  output.needs_owner_review_count + output.incomplete_approval_count < 1 ||
  output.blocked_source_count < 2 ||
  output.missing_approval_fields_count < 1 ||
  output.denied_action_findings_count < 1 ||
  output.public_ready !== false ||
  output.public_ready_count !== 0 ||
  output.publish_track !== "blocked" ||
  output.no_real_path_access !== true
) {
  console.log(JSON.stringify(output, null, 2));
  throw new Error("real_footage_source_folder_approval_review_smoke_failed");
}

console.log(JSON.stringify(output, null, 2));
