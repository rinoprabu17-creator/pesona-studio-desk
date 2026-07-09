import { z } from "zod";
import {
  parseAndReviewSourceFolderFixtureManifestFileCreationDryRunExecutionGateReviewApprovalGateFixture,
  type FixtureManifestFileCreationDryRunExecutionGateReviewApprovalItem,
  type SourceFolderFixtureManifestFileCreationDryRunExecutionGateReviewApprovalGateOutput
} from "./source-folder-fixture-manifest-file-creation-dry-run-execution-gate-review-approval-gate.ts";

const EXECUTION_GATE_APPROVAL_REVIEW_ID =
  "phase-2j32-source-folder-fixture-manifest-file-creation-dry-run-execution-gate-approval-review";
const SAFE_FIXTURE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample/";

const ExecutionGateApprovalReviewActionSchema = z.enum([
  "metadata_write_requested",
  "metadata_import_requested",
  "manifest_write_requested",
  "manifest_import_requested",
  "manifest_export_requested",
  "fixture_manifest_write_requested",
  "fixture_manifest_file_create_requested",
  "fixture_manifest_file_creation_gate_execute_requested",
  "fixture_manifest_file_creation_execution_gate_execute_requested",
  "fixture_manifest_file_creation_execution_requested",
  "fixture_manifest_execution_review_persist_requested",
  "fixture_manifest_execution_gate_review_persist_requested",
  "fixture_manifest_execution_gate_review_approval_persist_requested",
  "fixture_manifest_execution_gate_approval_review_persist_requested",
  "draft_manifest_file_create_requested",
  "production_manifest_write_requested",
  "render_requested",
  "upload_requested",
  "publish_requested",
  "publish_package_requested"
]);

const ExecutionGateApprovalReviewStatusSchema = z.enum([
  "execution_gate_approval_review_ok",
  "needs_owner_review",
  "incomplete_execution_gate_approval_review",
  "blocked_execution_gate_approval_review"
]);

export const SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewRecordSchema = z.object({
  execution_gate_review_item_id: z.string().min(1),
  manual_review_required: z.boolean().default(false),
  requested_actions: z.array(ExecutionGateApprovalReviewActionSchema).default([])
}).strict();

export const SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-fixture-manifest-file-creation-dry-run-execution-gate-approval-review-smoke-v1"),
  mode: z.literal("controlled_fixture_manifest_file_creation_dry_run_execution_gate_approval_review"),
  source_execution_gate_review_approval_gate_fixture: z.string().min(1),
  source_execution_gate_review_fixture: z.string().min(1),
  source_execution_review_approval_gate_fixture: z.string().min(1),
  source_execution_review_fixture: z.string().min(1),
  source_execution_gate_fixture: z.string().min(1),
  source_file_creation_dry_run_approval_gate_fixture: z.string().min(1),
  source_file_creation_dry_run_review_fixture: z.string().min(1),
  source_file_creation_gate_fixture: z.string().min(1),
  source_file_creation_approval_gate_fixture: z.string().min(1),
  source_write_dry_run_review_fixture: z.string().min(1),
  source_write_gate_fixture: z.string().min(1),
  source_creation_approval_gate_fixture: z.string().min(1),
  source_creation_review_fixture: z.string().min(1),
  source_creation_gate_fixture: z.string().min(1),
  source_draft_manifest_approval_gate_fixture: z.string().min(1),
  source_draft_manifest_review_fixture: z.string().min(1),
  source_metadata_enrichment_approval_gate_fixture: z.string().min(1),
  source_metadata_enrichment_fixture: z.string().min(1),
  source_listing_review_fixture: z.string().min(1),
  source_listing_gate_fixture: z.string().min(1),
  execution_gate_approval_review_records: z.array(
    SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewRecordSchema
  ).min(1),
  notes: z.string().min(1)
}).strict();

export const FixtureManifestFileCreationDryRunExecutionGateApprovalReviewItemSchema = z.object({
  execution_gate_approval_review_item_id: z.string().min(1),
  execution_gate_review_item_id: z.string().min(1),
  execution_review_item_id: z.string().min(1),
  file_creation_plan_item_id: z.string().min(1),
  write_plan_item_id: z.string().min(1),
  manifest_item_id: z.string().min(1),
  suggested_footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  source_execution_gate_review_approval_status: z.string().min(1),
  product_family: z.string().min(1).nullable(),
  visual_type: z.string().min(1).nullable(),
  process_stage: z.string().min(1).nullable(),
  orientation: z.enum(["vertical", "horizontal", "square", "unknown"]).nullable(),
  school_level: z.string().min(1).nullable(),
  color_variant: z.string().min(1).nullable(),
  content_tags: z.array(z.string().min(1)),
  risk_flags: z.array(z.string().min(1)),
  target_fixture_manifest_path: z.string().min(1).nullable(),
  execution_gate_approval_review_status: ExecutionGateApprovalReviewStatusSchema,
  missing_required_fields: z.array(z.string().min(1)),
  blocking_reasons: z.array(z.string().min(1)),
  review_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const InMemoryFixtureManifestExecutionGateApprovalReviewPreviewSchema = z.object({
  preview_only: z.literal(true),
  persisted: z.literal(false),
  execution_performed: z.literal(false),
  gate_executed: z.literal(false),
  target_fixture_manifest_path: z.string().min(1).nullable(),
  item_count: z.number().int().min(0),
  rows: z.array(z.object({
    suggested_footage_id: z.string().min(1),
    filename: z.string().min(1),
    relative_path: z.string().min(1),
    product_family: z.string().min(1).nullable(),
    visual_type: z.string().min(1).nullable(),
    process_stage: z.string().min(1).nullable(),
    orientation: z.enum(["vertical", "horizontal", "square", "unknown"]).nullable(),
    target_fixture_manifest_path: z.string().min(1).nullable(),
    execution_gate_approval_review_status: z.literal("execution_gate_approval_review_ok")
  }).strict())
}).strict();

export const SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewOutputSchema = z.object({
  fixture_manifest_file_creation_dry_run_execution_gate_approval_review_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  source_root: z.string().min(1),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  source_execution_gate_review_approval_status: z.enum([
    "approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review",
    "not_approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review"
  ]),
  reviewed_execution_gate_review_approval_items: z.number().int().min(0),
  execution_gate_approval_review_items: z.number().int().min(0),
  execution_gate_approval_review_ok: z.number().int().min(0),
  needs_owner_review: z.number().int().min(0),
  incomplete_execution_gate_approval_review: z.number().int().min(0),
  blocked_execution_gate_approval_review: z.number().int().min(0),
  duplicate_id_count: z.number().int().min(0),
  missing_required_field_count: z.number().int().min(0),
  blocked_reason_summary: z.record(z.string(), z.number().int().min(0)),
  denied_action_summary: z.record(z.string(), z.number().int().min(0)),
  recommended_owner_actions: z.array(z.string().min(1)),
  next_safe_actions: z.array(z.string().min(1)),
  target_fixture_manifest_path: z.string().min(1).nullable(),
  in_memory_execution_gate_approval_review_preview: InMemoryFixtureManifestExecutionGateApprovalReviewPreviewSchema,
  execution_gate_approval_review_item_reviews: z.array(FixtureManifestFileCreationDryRunExecutionGateApprovalReviewItemSchema),
  metadata_write_allowed: z.literal(false),
  manifest_write_allowed: z.literal(false),
  fixture_manifest_write_allowed: z.boolean(),
  fixture_manifest_file_creation_gate_allowed: z.boolean(),
  fixture_manifest_file_creation_dry_run_allowed: z.boolean(),
  fixture_manifest_file_creation_execution_gate_allowed: z.boolean(),
  fixture_manifest_file_creation_dry_run_execution_review_allowed: z.boolean(),
  fixture_manifest_file_creation_dry_run_execution_gate_allowed: z.boolean(),
  fixture_manifest_file_creation_dry_run_execution_gate_review_allowed: z.boolean(),
  fixture_manifest_file_creation_dry_run_execution_gate_approval_review_allowed: z.boolean(),
  fixture_manifest_file_created: z.literal(false),
  fixture_manifest_write_performed: z.literal(false),
  fixture_manifest_file_creation_performed: z.literal(false),
  fixture_manifest_file_creation_execution_performed: z.literal(false),
  fixture_manifest_execution_review_persisted: z.literal(false),
  fixture_manifest_execution_gate_review_persisted: z.literal(false),
  fixture_manifest_execution_gate_review_approval_persisted: z.literal(false),
  fixture_manifest_execution_gate_approval_review_persisted: z.literal(false),
  production_manifest_write_allowed: z.literal(false),
  manifest_export_allowed: z.literal(false),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewRecord = z.infer<
  typeof SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewRecordSchema
>;
export type SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewFixture = z.infer<
  typeof SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewFixtureSchema
>;
export type FixtureManifestFileCreationDryRunExecutionGateApprovalReviewItem = z.infer<
  typeof FixtureManifestFileCreationDryRunExecutionGateApprovalReviewItemSchema
>;
export type SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewOutput = z.infer<
  typeof SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewOutputSchema
>;

export type SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewFixture;
  reviews: SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewOutput[];
  reviewedExecutionGateReviewApprovalItems: number;
  executionGateApprovalReviewItems: number;
  executionGateApprovalReviewOkCount: number;
  needsOwnerReviewCount: number;
  incompleteExecutionGateApprovalReviewCount: number;
  blockedExecutionGateApprovalReviewCount: number;
  duplicateIdCount: number;
  missingRequiredFieldCount: number;
  blockedReasonsCount: number;
  deniedActionCount: number;
  metadataWriteAllowedCount: number;
  manifestWriteAllowedCount: number;
  fixtureManifestWriteAllowedCount: number;
  fixtureManifestWriteAllowed: boolean;
  fixtureManifestFileCreationGateAllowedCount: number;
  fixtureManifestFileCreationGateAllowed: boolean;
  fixtureManifestFileCreationDryRunAllowedCount: number;
  fixtureManifestFileCreationDryRunAllowed: boolean;
  fixtureManifestFileCreationExecutionGateAllowedCount: number;
  fixtureManifestFileCreationExecutionGateAllowed: boolean;
  fixtureManifestFileCreationDryRunExecutionReviewAllowedCount: number;
  fixtureManifestFileCreationDryRunExecutionReviewAllowed: boolean;
  fixtureManifestFileCreationDryRunExecutionGateAllowedCount: number;
  fixtureManifestFileCreationDryRunExecutionGateAllowed: boolean;
  fixtureManifestFileCreationDryRunExecutionGateReviewAllowedCount: number;
  fixtureManifestFileCreationDryRunExecutionGateReviewAllowed: boolean;
  fixtureManifestFileCreationDryRunExecutionGateApprovalReviewAllowedCount: number;
  fixtureManifestFileCreationDryRunExecutionGateApprovalReviewAllowed: boolean;
  fixtureManifestFileCreatedCount: number;
  fixtureManifestWritePerformedCount: number;
  fixtureManifestFileCreationPerformedCount: number;
  fixtureManifestFileCreationExecutionPerformedCount: number;
  fixtureManifestExecutionReviewPersistedCount: number;
  fixtureManifestExecutionGateReviewPersistedCount: number;
  fixtureManifestExecutionGateReviewApprovalPersistedCount: number;
  fixtureManifestExecutionGateApprovalReviewPersistedCount: number;
  inMemoryExecutionGateApprovalReviewPreviewCount: number;
  inMemoryExecutionGateApprovalReviewPreviewPersistedCount: number;
  productionManifestWriteAllowedCount: number;
  manifestExportAllowedCount: number;
  recommendedOwnerActionsCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function parseSourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewFixture(
  input: unknown
): SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewFixture {
  return SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewFixtureSchema.parse(input);
}

export function parseAndReviewSourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewFixture(input: {
  executionGateApprovalReviewFixtureInput: unknown;
  executionGateReviewApprovalGateFixtureInput: unknown;
  executionGateReviewFixtureInput: unknown;
  executionReviewApprovalGateFixtureInput: unknown;
  executionReviewFixtureInput: unknown;
  executionGateFixtureInput: unknown;
  fileCreationDryRunApprovalGateFixtureInput: unknown;
  fileCreationDryRunReviewFixtureInput: unknown;
  fileCreationGateFixtureInput: unknown;
  fileCreationApprovalGateFixtureInput: unknown;
  writeDryRunReviewFixtureInput: unknown;
  writeGateFixtureInput: unknown;
  creationApprovalGateFixtureInput: unknown;
  creationReviewFixtureInput: unknown;
  creationGateFixtureInput: unknown;
  draftManifestApprovalGateFixtureInput: unknown;
  draftManifestReviewFixtureInput: unknown;
  metadataEnrichmentApprovalGateFixtureInput: unknown;
  enrichmentFixtureInput: unknown;
  listingReviewFixtureInput: unknown;
  listingGateFixtureInput: unknown;
}): SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewBatchResult {
  const fixture = parseSourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewFixture(
    input.executionGateApprovalReviewFixtureInput
  );
  const approvalGateResult =
    parseAndReviewSourceFolderFixtureManifestFileCreationDryRunExecutionGateReviewApprovalGateFixture({
      approvalGateFixtureInput: input.executionGateReviewApprovalGateFixtureInput,
      executionGateReviewFixtureInput: input.executionGateReviewFixtureInput,
      executionReviewApprovalGateFixtureInput: input.executionReviewApprovalGateFixtureInput,
      executionReviewFixtureInput: input.executionReviewFixtureInput,
      executionGateFixtureInput: input.executionGateFixtureInput,
      fileCreationDryRunApprovalGateFixtureInput: input.fileCreationDryRunApprovalGateFixtureInput,
      fileCreationDryRunReviewFixtureInput: input.fileCreationDryRunReviewFixtureInput,
      fileCreationGateFixtureInput: input.fileCreationGateFixtureInput,
      fileCreationApprovalGateFixtureInput: input.fileCreationApprovalGateFixtureInput,
      writeDryRunReviewFixtureInput: input.writeDryRunReviewFixtureInput,
      writeGateFixtureInput: input.writeGateFixtureInput,
      creationApprovalGateFixtureInput: input.creationApprovalGateFixtureInput,
      creationReviewFixtureInput: input.creationReviewFixtureInput,
      creationGateFixtureInput: input.creationGateFixtureInput,
      draftManifestApprovalGateFixtureInput: input.draftManifestApprovalGateFixtureInput,
      draftManifestReviewFixtureInput: input.draftManifestReviewFixtureInput,
      metadataEnrichmentApprovalGateFixtureInput: input.metadataEnrichmentApprovalGateFixtureInput,
      enrichmentFixtureInput: input.enrichmentFixtureInput,
      listingReviewFixtureInput: input.listingReviewFixtureInput,
      listingGateFixtureInput: input.listingGateFixtureInput
    });
  const reviews = approvalGateResult.gates.map((gate) =>
    reviewExecutionGateReviewApprovalGateForExecutionGateApprovalReview(
      gate,
      fixture.execution_gate_approval_review_records
    )
  );

  return {
    provider: "fake_content_engine",
    fixture,
    reviews,
    reviewedExecutionGateReviewApprovalItems: sum(reviews.map((review) => review.reviewed_execution_gate_review_approval_items)),
    executionGateApprovalReviewItems: sum(reviews.map((review) => review.execution_gate_approval_review_items)),
    executionGateApprovalReviewOkCount: sum(reviews.map((review) => review.execution_gate_approval_review_ok)),
    needsOwnerReviewCount: sum(reviews.map((review) => review.needs_owner_review)),
    incompleteExecutionGateApprovalReviewCount: sum(reviews.map((review) => review.incomplete_execution_gate_approval_review)),
    blockedExecutionGateApprovalReviewCount: sum(reviews.map((review) => review.blocked_execution_gate_approval_review)),
    duplicateIdCount: sum(reviews.map((review) => review.duplicate_id_count)),
    missingRequiredFieldCount: sum(reviews.map((review) => review.missing_required_field_count)),
    blockedReasonsCount: sum(reviews.flatMap((review) => Object.values(review.blocked_reason_summary))),
    deniedActionCount: sum(reviews.flatMap((review) => Object.values(review.denied_action_summary))),
    metadataWriteAllowedCount: reviews.filter((review) => review.metadata_write_allowed).length,
    manifestWriteAllowedCount: reviews.filter((review) => review.manifest_write_allowed).length,
    fixtureManifestWriteAllowedCount: reviews.filter((review) => review.fixture_manifest_write_allowed).length,
    fixtureManifestWriteAllowed: reviews.some((review) => review.fixture_manifest_write_allowed),
    fixtureManifestFileCreationGateAllowedCount: reviews.filter(
      (review) => review.fixture_manifest_file_creation_gate_allowed
    ).length,
    fixtureManifestFileCreationGateAllowed: reviews.some((review) => review.fixture_manifest_file_creation_gate_allowed),
    fixtureManifestFileCreationDryRunAllowedCount: reviews.filter(
      (review) => review.fixture_manifest_file_creation_dry_run_allowed
    ).length,
    fixtureManifestFileCreationDryRunAllowed: reviews.some(
      (review) => review.fixture_manifest_file_creation_dry_run_allowed
    ),
    fixtureManifestFileCreationExecutionGateAllowedCount: reviews.filter(
      (review) => review.fixture_manifest_file_creation_execution_gate_allowed
    ).length,
    fixtureManifestFileCreationExecutionGateAllowed: reviews.some(
      (review) => review.fixture_manifest_file_creation_execution_gate_allowed
    ),
    fixtureManifestFileCreationDryRunExecutionReviewAllowedCount: reviews.filter(
      (review) => review.fixture_manifest_file_creation_dry_run_execution_review_allowed
    ).length,
    fixtureManifestFileCreationDryRunExecutionReviewAllowed: reviews.some(
      (review) => review.fixture_manifest_file_creation_dry_run_execution_review_allowed
    ),
    fixtureManifestFileCreationDryRunExecutionGateAllowedCount: reviews.filter(
      (review) => review.fixture_manifest_file_creation_dry_run_execution_gate_allowed
    ).length,
    fixtureManifestFileCreationDryRunExecutionGateAllowed: reviews.some(
      (review) => review.fixture_manifest_file_creation_dry_run_execution_gate_allowed
    ),
    fixtureManifestFileCreationDryRunExecutionGateReviewAllowedCount: reviews.filter(
      (review) => review.fixture_manifest_file_creation_dry_run_execution_gate_review_allowed
    ).length,
    fixtureManifestFileCreationDryRunExecutionGateReviewAllowed: reviews.some(
      (review) => review.fixture_manifest_file_creation_dry_run_execution_gate_review_allowed
    ),
    fixtureManifestFileCreationDryRunExecutionGateApprovalReviewAllowedCount: reviews.filter(
      (review) => review.fixture_manifest_file_creation_dry_run_execution_gate_approval_review_allowed
    ).length,
    fixtureManifestFileCreationDryRunExecutionGateApprovalReviewAllowed: reviews.some(
      (review) => review.fixture_manifest_file_creation_dry_run_execution_gate_approval_review_allowed
    ),
    fixtureManifestFileCreatedCount: reviews.filter((review) => review.fixture_manifest_file_created).length,
    fixtureManifestWritePerformedCount: reviews.filter((review) => review.fixture_manifest_write_performed).length,
    fixtureManifestFileCreationPerformedCount: reviews.filter(
      (review) => review.fixture_manifest_file_creation_performed
    ).length,
    fixtureManifestFileCreationExecutionPerformedCount: reviews.filter(
      (review) => review.fixture_manifest_file_creation_execution_performed
    ).length,
    fixtureManifestExecutionReviewPersistedCount: reviews.filter(
      (review) => review.fixture_manifest_execution_review_persisted
    ).length,
    fixtureManifestExecutionGateReviewPersistedCount: reviews.filter(
      (review) => review.fixture_manifest_execution_gate_review_persisted
    ).length,
    fixtureManifestExecutionGateReviewApprovalPersistedCount: reviews.filter(
      (review) => review.fixture_manifest_execution_gate_review_approval_persisted
    ).length,
    fixtureManifestExecutionGateApprovalReviewPersistedCount: reviews.filter(
      (review) => review.fixture_manifest_execution_gate_approval_review_persisted
    ).length,
    inMemoryExecutionGateApprovalReviewPreviewCount: reviews.length,
    inMemoryExecutionGateApprovalReviewPreviewPersistedCount: reviews.filter(
      (review) => review.in_memory_execution_gate_approval_review_preview.persisted
    ).length,
    productionManifestWriteAllowedCount: reviews.filter((review) => review.production_manifest_write_allowed).length,
    manifestExportAllowedCount: reviews.filter((review) => review.manifest_export_allowed).length,
    recommendedOwnerActionsCount: sum(reviews.map((review) => review.recommended_owner_actions.length)),
    publicReadyCount: reviews.filter((review) => review.public_ready).length,
    publishTrack: "blocked"
  };
}

export function reviewExecutionGateReviewApprovalGateForExecutionGateApprovalReview(
  approvalGate: SourceFolderFixtureManifestFileCreationDryRunExecutionGateReviewApprovalGateOutput,
  records: SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewRecord[]
): SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewOutput {
  const sourceApproved =
    approvalGate.approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review > 0;
  const duplicateIds = new Set(
    approvalGate.duplicate_id_findings.map((finding) => finding.replace("duplicate_suggested_footage_id:", ""))
  );
  const reviewItems = approvalGate.approval_items.map((item) =>
    executionGateApprovalReviewItemForApproval(
      item,
      records.find((record) => record.execution_gate_review_item_id === item.execution_gate_review_item_id),
      duplicateIds,
      approvalGate
    )
  );

  return SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewOutputSchema.parse({
    fixture_manifest_file_creation_dry_run_execution_gate_approval_review_id:
      `${EXECUTION_GATE_APPROVAL_REVIEW_ID}-${approvalGate.source_id}`,
    source_id: approvalGate.source_id,
    source_label: approvalGate.source_label,
    source_root: approvalGate.source_root,
    dry_run: approvalGate.dry_run,
    read_only: approvalGate.read_only,
    source_execution_gate_review_approval_status: sourceApproved
      ? "approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review"
      : "not_approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review",
    reviewed_execution_gate_review_approval_items: reviewItems.length,
    execution_gate_approval_review_items: reviewItems.length,
    execution_gate_approval_review_ok: countExecutionGateApprovalReviewStatus(reviewItems, "execution_gate_approval_review_ok"),
    needs_owner_review: countExecutionGateApprovalReviewStatus(reviewItems, "needs_owner_review"),
    incomplete_execution_gate_approval_review: countExecutionGateApprovalReviewStatus(
      reviewItems,
      "incomplete_execution_gate_approval_review"
    ),
    blocked_execution_gate_approval_review: countExecutionGateApprovalReviewStatus(
      reviewItems,
      "blocked_execution_gate_approval_review"
    ),
    duplicate_id_count: duplicateIds.size,
    missing_required_field_count: sum(reviewItems.map((item) => item.missing_required_fields.length)),
    blocked_reason_summary: summarizeValues(reviewItems.flatMap((item) => item.blocking_reasons)),
    denied_action_summary: summarizeDeniedActions(reviewItems, records),
    recommended_owner_actions: recommendedOwnerActions(reviewItems, sourceApproved),
    next_safe_actions: nextSafeActions(reviewItems),
    target_fixture_manifest_path:
      reviewItems.find((item) => item.execution_gate_approval_review_status === "execution_gate_approval_review_ok")?.target_fixture_manifest_path ??
      approvalGate.target_fixture_manifest_path,
    in_memory_execution_gate_approval_review_preview: inMemoryExecutionGateApprovalReviewPreview(reviewItems),
    execution_gate_approval_review_item_reviews: reviewItems,
    metadata_write_allowed: false,
    manifest_write_allowed: false,
    fixture_manifest_write_allowed: approvalGate.fixture_manifest_write_allowed,
    fixture_manifest_file_creation_gate_allowed: approvalGate.fixture_manifest_file_creation_gate_allowed,
    fixture_manifest_file_creation_dry_run_allowed: approvalGate.fixture_manifest_file_creation_dry_run_allowed,
    fixture_manifest_file_creation_execution_gate_allowed:
      approvalGate.fixture_manifest_file_creation_execution_gate_allowed,
    fixture_manifest_file_creation_dry_run_execution_review_allowed:
      approvalGate.fixture_manifest_file_creation_dry_run_execution_review_allowed,
    fixture_manifest_file_creation_dry_run_execution_gate_allowed:
      approvalGate.fixture_manifest_file_creation_dry_run_execution_gate_allowed,
    fixture_manifest_file_creation_dry_run_execution_gate_review_allowed:
      approvalGate.fixture_manifest_file_creation_dry_run_execution_gate_review_allowed,
    fixture_manifest_file_creation_dry_run_execution_gate_approval_review_allowed:
      countExecutionGateApprovalReviewStatus(reviewItems, "execution_gate_approval_review_ok") > 0,
    fixture_manifest_file_created: false,
    fixture_manifest_write_performed: false,
    fixture_manifest_file_creation_performed: false,
    fixture_manifest_file_creation_execution_performed: false,
    fixture_manifest_execution_review_persisted: false,
    fixture_manifest_execution_gate_review_persisted: false,
    fixture_manifest_execution_gate_review_approval_persisted: false,
    fixture_manifest_execution_gate_approval_review_persisted: false,
    production_manifest_write_allowed: false,
    manifest_export_allowed: false,
    public_ready: false,
    publish_track: "blocked"
  });
}

function executionGateApprovalReviewItemForApproval(
  item: FixtureManifestFileCreationDryRunExecutionGateReviewApprovalItem,
  record: SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewRecord | undefined,
  duplicateIds: Set<string>,
  approvalGate: SourceFolderFixtureManifestFileCreationDryRunExecutionGateReviewApprovalGateOutput
): FixtureManifestFileCreationDryRunExecutionGateApprovalReviewItem {
  const reviewRecord = record ?? defaultExecutionGateApprovalReviewRecord(item.execution_gate_review_item_id);
  const missingRequiredFields = missingRequiredFieldsFor(item);
  const blockingReasons = blockingReasonsFor(item, reviewRecord, duplicateIds, approvalGate);
  const status = executionGateApprovalReviewStatusFor(item, reviewRecord, missingRequiredFields, blockingReasons);

  return FixtureManifestFileCreationDryRunExecutionGateApprovalReviewItemSchema.parse({
    execution_gate_approval_review_item_id: `${item.execution_gate_review_item_id}-execution-gate-approval-review`,
    execution_gate_review_item_id: item.execution_gate_review_item_id,
    execution_review_item_id: item.execution_review_item_id,
    file_creation_plan_item_id: item.file_creation_plan_item_id,
    write_plan_item_id: item.write_plan_item_id,
    manifest_item_id: item.manifest_item_id,
    suggested_footage_id: item.suggested_footage_id,
    filename: item.filename,
    relative_path: item.relative_path,
    source_execution_gate_review_approval_status: item.approval_status,
    product_family: item.product_family,
    visual_type: item.visual_type,
    process_stage: item.process_stage,
    orientation: item.orientation,
    school_level: item.school_level,
    color_variant: item.color_variant,
    content_tags: item.content_tags,
    risk_flags: item.risk_flags,
    target_fixture_manifest_path: item.target_fixture_manifest_path,
    execution_gate_approval_review_status: status,
    missing_required_fields: missingRequiredFields,
    blocking_reasons: blockingReasons,
    review_notes: [
      `Source execution gate review approval status: ${item.approval_status}.`,
      `Fixture manifest file creation dry-run execution gate approval review status: ${status}.`,
      "Phase 2J.32 builds only an in-memory execution gate approval review preview; no fixture manifest file is created, written, exported, imported, saved, persisted, or executed."
    ],
    recommended_action: recommendedAction(status)
  });
}

function defaultExecutionGateApprovalReviewRecord(
  executionGateReviewItemId: string
): SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewRecord {
  return {
    execution_gate_review_item_id: executionGateReviewItemId,
    manual_review_required: false,
    requested_actions: []
  };
}

function missingRequiredFieldsFor(item: FixtureManifestFileCreationDryRunExecutionGateReviewApprovalItem): string[] {
  const missing: string[] = [];
  if (!item.product_family) missing.push("product_family");
  if (!item.visual_type) missing.push("visual_type");
  if (!item.process_stage) missing.push("process_stage");
  if (!item.orientation) missing.push("orientation");
  if (!item.filename) missing.push("filename");
  if (!item.relative_path) missing.push("relative_path");
  if (!item.target_fixture_manifest_path) missing.push("target_fixture_manifest_path");
  return missing;
}

function blockingReasonsFor(
  item: FixtureManifestFileCreationDryRunExecutionGateReviewApprovalItem,
  record: SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewRecord,
  duplicateIds: Set<string>,
  approvalGate: SourceFolderFixtureManifestFileCreationDryRunExecutionGateReviewApprovalGateOutput
): string[] {
  const reasons: string[] = [];
  if (approvalGate.source_root !== SAFE_FIXTURE_ROOT) reasons.push("source_root_not_safe_fixture");
  if (!approvalGate.dry_run) reasons.push("dry_run_false_blocked");
  if (!approvalGate.read_only) reasons.push("read_only_false_blocked");
  if (item.approval_status === "blocked_approval") reasons.push("source_execution_gate_review_approval_blocked_cannot_be_upgraded");
  if (item.approval_status === "incomplete_approval") reasons.push("source_execution_gate_review_approval_incomplete_cannot_be_upgraded");
  if (duplicateIds.has(item.suggested_footage_id)) reasons.push("duplicate_suggested_footage_id_blocked");
  for (const reason of item.blocking_reasons) reasons.push(`source_execution_gate_review_approval_${reason}`);
  for (const riskFlag of item.risk_flags) {
    if (["privacy_review_needed", "placeholder", "unrelated_content", "suspicious", "non_media", "unsafe_entry"].includes(riskFlag)) {
      reasons.push(`risk_flag_${riskFlag}`);
    }
  }
  for (const action of record.requested_actions) reasons.push(`denied_action_${action}`);
  if (item.relative_path.includes("..")) reasons.push("unsafe_relative_path_blocked");
  if (!item.relative_path.startsWith(SAFE_FIXTURE_ROOT)) reasons.push("relative_path_not_safe_fixture");
  if (item.target_fixture_manifest_path && containsBlockedPathToken(item.target_fixture_manifest_path)) {
    reasons.push("target_fixture_manifest_path_blocked_metadata_only");
  }
  if (item.target_fixture_manifest_path && !item.target_fixture_manifest_path.startsWith("packages/content-engine/fixtures/")) {
    reasons.push("target_fixture_manifest_path_not_safe_repo_fixture");
  }
  return reasons;
}

function executionGateApprovalReviewStatusFor(
  item: FixtureManifestFileCreationDryRunExecutionGateReviewApprovalItem,
  record: SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewRecord,
  missingRequiredFields: string[],
  blockingReasons: string[]
): z.infer<typeof ExecutionGateApprovalReviewStatusSchema> {
  if (item.approval_status === "incomplete_approval") return "incomplete_execution_gate_approval_review";
  if (missingRequiredFields.length > 0) return "incomplete_execution_gate_approval_review";
  if (blockingReasons.length > 0) return "blocked_execution_gate_approval_review";
  if (item.approval_status === "needs_owner_review" || record.manual_review_required) return "needs_owner_review";
  if (item.approval_status !== "approved_for_future_fixture_manifest_file_creation_dry_run_execution_gate_approval_review") {
    return "blocked_execution_gate_approval_review";
  }
  return "execution_gate_approval_review_ok";
}

function inMemoryExecutionGateApprovalReviewPreview(
  items: FixtureManifestFileCreationDryRunExecutionGateApprovalReviewItem[]
): z.infer<typeof InMemoryFixtureManifestExecutionGateApprovalReviewPreviewSchema> {
  const okItems = items.filter((item) => item.execution_gate_approval_review_status === "execution_gate_approval_review_ok");
  return InMemoryFixtureManifestExecutionGateApprovalReviewPreviewSchema.parse({
    preview_only: true,
    persisted: false,
    execution_performed: false,
    gate_executed: false,
    target_fixture_manifest_path: okItems[0]?.target_fixture_manifest_path ?? null,
    item_count: okItems.length,
    rows: okItems.map((item) => ({
      suggested_footage_id: item.suggested_footage_id,
      filename: item.filename,
      relative_path: item.relative_path,
      product_family: item.product_family,
      visual_type: item.visual_type,
      process_stage: item.process_stage,
      orientation: item.orientation,
      target_fixture_manifest_path: item.target_fixture_manifest_path,
      execution_gate_approval_review_status: "execution_gate_approval_review_ok"
    }))
  });
}

function recommendedOwnerActions(
  items: FixtureManifestFileCreationDryRunExecutionGateApprovalReviewItem[],
  sourceApproved: boolean
): string[] {
  const actions = [
    "Review execution_gate_approval_review_ok rows as in-memory dry-run execution gate approval review only.",
    "Do not persist execution gate approval review output or create, write, export, import, save, or execute any manifest in Phase 2J.32."
  ];
  if (!sourceApproved) {
    actions.push("Keep non-approved Phase 2J.31 cases blocked until upstream approval-review eligibility is explicit.");
  }
  if (items.some((item) => item.execution_gate_approval_review_status === "needs_owner_review")) {
    actions.push("Collect owner/manual confirmation before any later execution phase.");
  }
  if (items.some((item) => item.execution_gate_approval_review_status === "incomplete_execution_gate_approval_review")) {
    actions.push("Complete required metadata and safe fixture target path strings before any later execution step.");
  }
  if (items.some((item) => item.execution_gate_approval_review_status === "blocked_execution_gate_approval_review")) {
    actions.push("Keep duplicate IDs, blocked upstream approvals, risky flags, unsafe paths, and denied actions blocked.");
  }
  return actions;
}

function nextSafeActions(items: FixtureManifestFileCreationDryRunExecutionGateApprovalReviewItem[]): string[] {
  if (items.some((item) => item.execution_gate_approval_review_status === "execution_gate_approval_review_ok")) {
    return [
      "Treat execution_gate_approval_review_ok rows as in-memory review evidence only.",
      "Keep all manifest creation, write, import, export, render, upload, and publish behavior disabled.",
      "Proceed only to a later owner approval phase that reviews this in-memory result."
    ];
  }
  return [
    "Return to Phase 2J.31 execution gate review approval gate data before any later execution phase.",
    "Do not create, export, import, write, save, persist, or execute any manifest."
  ];
}

function recommendedAction(status: z.infer<typeof ExecutionGateApprovalReviewStatusSchema>): string {
  if (status === "execution_gate_approval_review_ok") {
    return "Keep as in-memory dry-run execution gate approval review evidence only; do not create or write a fixture manifest now.";
  }
  if (status === "needs_owner_review") return "Collect owner/manual confirmation before any later execution phase.";
  if (status === "incomplete_execution_gate_approval_review") {
    return "Complete required metadata and safe fixture target path strings.";
  }
  return "Keep blocked and remove duplicate IDs, risky flags, denied actions, unsafe target paths, or blocked upstream approvals.";
}

function summarizeDeniedActions(
  items: FixtureManifestFileCreationDryRunExecutionGateApprovalReviewItem[],
  records: SourceFolderFixtureManifestFileCreationDryRunExecutionGateApprovalReviewRecord[]
): Record<string, number> {
  const itemIds = new Set(items.map((item) => item.execution_gate_review_item_id));
  return summarizeValues(records.filter((record) => itemIds.has(record.execution_gate_review_item_id)).flatMap((record) => record.requested_actions));
}

function containsBlockedPathToken(pathValue: string): boolean {
  const lower = pathValue.toLowerCase();
  return ["ssd", "google drive", "gdrive", "storage", "production", "backup", "upload", "render", "publish"].some((token) =>
    lower.includes(token)
  );
}

function countExecutionGateApprovalReviewStatus(
  items: FixtureManifestFileCreationDryRunExecutionGateApprovalReviewItem[],
  status: z.infer<typeof ExecutionGateApprovalReviewStatusSchema>
): number {
  return items.filter((item) => item.execution_gate_approval_review_status === status).length;
}

function summarizeValues(values: string[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const value of values) summary[value] = (summary[value] || 0) + 1;
  return summary;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
