import { z } from "zod";
import {
  parseSourceFolderFixtureManifestFileCreationDryRunExecutionGateFixture,
  reviewSourceFolderFixtureManifestFileCreationDryRunExecutionGateFixture,
  type FixtureManifestFileCreationDryRunExecutionGateItem,
  type SourceFolderFixtureManifestFileCreationDryRunExecutionGateFixture,
  type SourceFolderFixtureManifestFileCreationDryRunExecutionGateOutput
} from "./source-folder-fixture-manifest-file-creation-dry-run-execution-gate.ts";
import {
  parseSourceFolderFixtureManifestFileCreationDryRunApprovalGateFixture,
  type SourceFolderFixtureManifestFileCreationDryRunApprovalGateFixture
} from "./source-folder-fixture-manifest-file-creation-dry-run-approval-gate.ts";
import {
  parseSourceFolderFixtureManifestFileCreationDryRunReviewFixture,
  type SourceFolderFixtureManifestFileCreationDryRunReviewFixture
} from "./source-folder-fixture-manifest-file-creation-dry-run-review.ts";
import {
  parseSourceFolderFixtureManifestFileCreationGateFixture,
  type SourceFolderFixtureManifestFileCreationGateFixture
} from "./source-folder-fixture-manifest-file-creation-gate.ts";
import {
  parseSourceFolderFixtureManifestWriteDryRunApprovalGateFixture,
  type SourceFolderFixtureManifestWriteDryRunApprovalGateFixture
} from "./source-folder-fixture-manifest-write-dry-run-approval-gate.ts";
import {
  parseSourceFolderFixtureManifestWriteDryRunReviewFixture,
  type SourceFolderFixtureManifestWriteDryRunReviewFixture
} from "./source-folder-fixture-manifest-write-dry-run-review.ts";
import {
  parseSourceFolderFixtureManifestWriteGateFixture,
  type SourceFolderFixtureManifestWriteGateFixture
} from "./source-folder-fixture-manifest-write-gate.ts";
import {
  parseSourceFolderDraftManifestCreationDryRunApprovalGateFixture,
  type SourceFolderDraftManifestCreationDryRunApprovalGateFixture
} from "./source-folder-draft-manifest-creation-dry-run-approval-gate.ts";
import {
  parseSourceFolderDraftManifestCreationDryRunReviewFixture,
  type SourceFolderDraftManifestCreationDryRunReviewFixture
} from "./source-folder-draft-manifest-creation-dry-run-review.ts";
import {
  parseSourceFolderDraftManifestCreationDryRunGateFixture,
  type SourceFolderDraftManifestCreationDryRunGateFixture
} from "./source-folder-draft-manifest-creation-dry-run-gate.ts";
import {
  parseSourceFolderDraftManifestApprovalGateFixture,
  type SourceFolderDraftManifestApprovalGateFixture
} from "./source-folder-draft-manifest-approval-gate.ts";
import {
  parseSourceFolderDraftManifestReviewFixture,
  type SourceFolderDraftManifestReviewFixture
} from "./source-folder-draft-manifest-review.ts";
import {
  parseSourceFolderMetadataEnrichmentApprovalGateFixture,
  type SourceFolderMetadataEnrichmentApprovalGateFixture
} from "./source-folder-metadata-enrichment-approval-gate.ts";
import {
  parseSourceFolderMetadataEnrichmentReviewFixture,
  type SourceFolderMetadataEnrichmentReviewFixture
} from "./source-folder-metadata-enrichment-review.ts";
import {
  parseSourceFolderListingReviewFixture,
  type SourceFolderListingReviewFixture
} from "./source-folder-listing-review.ts";
import {
  parseSourceFolderListingApprovalGateFixture,
  type SourceFolderListingApprovalGateFixture
} from "./source-folder-listing-approval-gate.ts";

const EXECUTION_REVIEW_ID =
  "phase-2j28-source-folder-fixture-manifest-file-creation-dry-run-execution-review";
const SAFE_FIXTURE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample/";

const ExecutionReviewActionSchema = z.enum([
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
  "draft_manifest_file_create_requested",
  "production_manifest_write_requested",
  "render_requested",
  "upload_requested",
  "publish_requested",
  "publish_package_requested"
]);

const ExecutionReviewStatusSchema = z.enum([
  "execution_review_ok",
  "needs_owner_review",
  "incomplete_execution_review",
  "blocked_execution_review"
]);

export const SourceFolderFixtureManifestFileCreationDryRunExecutionReviewRecordSchema = z.object({
  file_creation_plan_item_id: z.string().min(1),
  manual_review_required: z.boolean().default(false),
  requested_actions: z.array(ExecutionReviewActionSchema).default([])
}).strict();

export const SourceFolderFixtureManifestFileCreationDryRunExecutionReviewFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-fixture-manifest-file-creation-dry-run-execution-review-smoke-v1"),
  mode: z.literal("controlled_fixture_manifest_file_creation_dry_run_execution_review"),
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
  execution_review_records: z.array(SourceFolderFixtureManifestFileCreationDryRunExecutionReviewRecordSchema).min(1),
  notes: z.string().min(1)
}).strict();

export const FixtureManifestFileCreationDryRunExecutionReviewItemSchema = z.object({
  execution_review_item_id: z.string().min(1),
  file_creation_plan_item_id: z.string().min(1),
  write_plan_item_id: z.string().min(1),
  manifest_item_id: z.string().min(1),
  suggested_footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  source_execution_gate_status: z.string().min(1),
  product_family: z.string().min(1).nullable(),
  visual_type: z.string().min(1).nullable(),
  process_stage: z.string().min(1).nullable(),
  orientation: z.enum(["vertical", "horizontal", "square", "unknown"]).nullable(),
  school_level: z.string().min(1).nullable(),
  color_variant: z.string().min(1).nullable(),
  content_tags: z.array(z.string().min(1)),
  risk_flags: z.array(z.string().min(1)),
  target_fixture_manifest_path: z.string().min(1).nullable(),
  execution_review_status: ExecutionReviewStatusSchema,
  missing_required_fields: z.array(z.string().min(1)),
  blocking_reasons: z.array(z.string().min(1)),
  review_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const InMemoryFixtureManifestExecutionPreviewSchema = z.object({
  preview_only: z.literal(true),
  persisted: z.literal(false),
  execution_performed: z.literal(false),
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
    execution_review_status: z.literal("execution_review_ok")
  }).strict())
}).strict();

export const SourceFolderFixtureManifestFileCreationDryRunExecutionReviewOutputSchema = z.object({
  fixture_manifest_file_creation_dry_run_execution_review_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  source_root: z.string().min(1),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  source_execution_gate_status: z.enum([
    "eligible_for_fixture_manifest_file_creation_dry_run_execution_review",
    "not_eligible_for_fixture_manifest_file_creation_dry_run_execution_review"
  ]),
  reviewed_execution_gate_items: z.number().int().min(0),
  execution_review_items: z.number().int().min(0),
  execution_review_ok: z.number().int().min(0),
  needs_owner_review: z.number().int().min(0),
  incomplete_execution_review: z.number().int().min(0),
  blocked_execution_review: z.number().int().min(0),
  duplicate_id_count: z.number().int().min(0),
  missing_required_field_count: z.number().int().min(0),
  blocked_reason_summary: z.record(z.string(), z.number().int().min(0)),
  denied_action_summary: z.record(z.string(), z.number().int().min(0)),
  recommended_owner_actions: z.array(z.string().min(1)),
  next_safe_actions: z.array(z.string().min(1)),
  target_fixture_manifest_path: z.string().min(1).nullable(),
  in_memory_execution_preview: InMemoryFixtureManifestExecutionPreviewSchema,
  execution_review_item_reviews: z.array(FixtureManifestFileCreationDryRunExecutionReviewItemSchema),
  metadata_write_allowed: z.literal(false),
  manifest_write_allowed: z.literal(false),
  fixture_manifest_write_allowed: z.boolean(),
  fixture_manifest_file_creation_gate_allowed: z.boolean(),
  fixture_manifest_file_creation_dry_run_allowed: z.boolean(),
  fixture_manifest_file_creation_execution_gate_allowed: z.boolean(),
  fixture_manifest_file_creation_dry_run_execution_review_allowed: z.boolean(),
  fixture_manifest_file_created: z.literal(false),
  fixture_manifest_write_performed: z.literal(false),
  fixture_manifest_file_creation_performed: z.literal(false),
  fixture_manifest_file_creation_execution_performed: z.literal(false),
  fixture_manifest_execution_review_persisted: z.literal(false),
  production_manifest_write_allowed: z.literal(false),
  manifest_export_allowed: z.literal(false),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderFixtureManifestFileCreationDryRunExecutionReviewRecord = z.infer<
  typeof SourceFolderFixtureManifestFileCreationDryRunExecutionReviewRecordSchema
>;
export type SourceFolderFixtureManifestFileCreationDryRunExecutionReviewFixture = z.infer<
  typeof SourceFolderFixtureManifestFileCreationDryRunExecutionReviewFixtureSchema
>;
export type FixtureManifestFileCreationDryRunExecutionReviewItem = z.infer<
  typeof FixtureManifestFileCreationDryRunExecutionReviewItemSchema
>;
export type SourceFolderFixtureManifestFileCreationDryRunExecutionReviewOutput = z.infer<
  typeof SourceFolderFixtureManifestFileCreationDryRunExecutionReviewOutputSchema
>;

export type SourceFolderFixtureManifestFileCreationDryRunExecutionReviewBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderFixtureManifestFileCreationDryRunExecutionReviewFixture;
  reviews: SourceFolderFixtureManifestFileCreationDryRunExecutionReviewOutput[];
  reviewedExecutionGateItems: number;
  executionReviewItems: number;
  executionReviewOkCount: number;
  needsOwnerReviewCount: number;
  incompleteExecutionReviewCount: number;
  blockedExecutionReviewCount: number;
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
  fixtureManifestFileCreatedCount: number;
  fixtureManifestWritePerformedCount: number;
  fixtureManifestFileCreationPerformedCount: number;
  fixtureManifestFileCreationExecutionPerformedCount: number;
  fixtureManifestExecutionReviewPersistedCount: number;
  productionManifestWriteAllowedCount: number;
  manifestExportAllowedCount: number;
  recommendedOwnerActionsCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function parseSourceFolderFixtureManifestFileCreationDryRunExecutionReviewFixture(
  input: unknown
): SourceFolderFixtureManifestFileCreationDryRunExecutionReviewFixture {
  return SourceFolderFixtureManifestFileCreationDryRunExecutionReviewFixtureSchema.parse(input);
}

export function reviewSourceFolderFixtureManifestFileCreationDryRunExecutionReviewFixture(input: {
  executionReviewFixture: SourceFolderFixtureManifestFileCreationDryRunExecutionReviewFixture;
  executionGateFixture: SourceFolderFixtureManifestFileCreationDryRunExecutionGateFixture;
  approvalGateFixture: SourceFolderFixtureManifestFileCreationDryRunApprovalGateFixture;
  fileCreationDryRunReviewFixture: SourceFolderFixtureManifestFileCreationDryRunReviewFixture;
  fileCreationGateFixture: SourceFolderFixtureManifestFileCreationGateFixture;
  fileCreationApprovalGateFixture: SourceFolderFixtureManifestWriteDryRunApprovalGateFixture;
  writeDryRunReviewFixture: SourceFolderFixtureManifestWriteDryRunReviewFixture;
  writeGateFixture: SourceFolderFixtureManifestWriteGateFixture;
  creationApprovalGateFixture: SourceFolderDraftManifestCreationDryRunApprovalGateFixture;
  creationReviewFixture: SourceFolderDraftManifestCreationDryRunReviewFixture;
  creationGateFixture: SourceFolderDraftManifestCreationDryRunGateFixture;
  draftManifestApprovalGateFixture: SourceFolderDraftManifestApprovalGateFixture;
  draftManifestReviewFixture: SourceFolderDraftManifestReviewFixture;
  metadataEnrichmentApprovalGateFixture: SourceFolderMetadataEnrichmentApprovalGateFixture;
  enrichmentFixture: SourceFolderMetadataEnrichmentReviewFixture;
  listingReviewFixture: SourceFolderListingReviewFixture;
  listingGateFixture: SourceFolderListingApprovalGateFixture;
}): SourceFolderFixtureManifestFileCreationDryRunExecutionReviewBatchResult {
  const executionGateResult = reviewSourceFolderFixtureManifestFileCreationDryRunExecutionGateFixture({
    executionGateFixture: input.executionGateFixture,
    approvalGateFixture: input.approvalGateFixture,
    fileCreationDryRunReviewFixture: input.fileCreationDryRunReviewFixture,
    fileCreationGateFixture: input.fileCreationGateFixture,
    fileCreationApprovalGateFixture: input.fileCreationApprovalGateFixture,
    writeDryRunReviewFixture: input.writeDryRunReviewFixture,
    writeGateFixture: input.writeGateFixture,
    creationApprovalGateFixture: input.creationApprovalGateFixture,
    creationReviewFixture: input.creationReviewFixture,
    creationGateFixture: input.creationGateFixture,
    draftManifestApprovalGateFixture: input.draftManifestApprovalGateFixture,
    draftManifestReviewFixture: input.draftManifestReviewFixture,
    metadataEnrichmentApprovalGateFixture: input.metadataEnrichmentApprovalGateFixture,
    enrichmentFixture: input.enrichmentFixture,
    listingReviewFixture: input.listingReviewFixture,
    listingGateFixture: input.listingGateFixture
  });
  const reviews = executionGateResult.gates.map((gate) =>
    reviewExecutionGateForExecutionReview(gate, input.executionReviewFixture.execution_review_records)
  );

  return {
    provider: "fake_content_engine",
    fixture: input.executionReviewFixture,
    reviews,
    reviewedExecutionGateItems: sum(reviews.map((review) => review.reviewed_execution_gate_items)),
    executionReviewItems: sum(reviews.map((review) => review.execution_review_items)),
    executionReviewOkCount: sum(reviews.map((review) => review.execution_review_ok)),
    needsOwnerReviewCount: sum(reviews.map((review) => review.needs_owner_review)),
    incompleteExecutionReviewCount: sum(reviews.map((review) => review.incomplete_execution_review)),
    blockedExecutionReviewCount: sum(reviews.map((review) => review.blocked_execution_review)),
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
    productionManifestWriteAllowedCount: reviews.filter((review) => review.production_manifest_write_allowed).length,
    manifestExportAllowedCount: reviews.filter((review) => review.manifest_export_allowed).length,
    recommendedOwnerActionsCount: sum(reviews.map((review) => review.recommended_owner_actions.length)),
    publicReadyCount: reviews.filter((review) => review.public_ready).length,
    publishTrack: "blocked"
  };
}

export function parseAndReviewSourceFolderFixtureManifestFileCreationDryRunExecutionReviewFixture(input: {
  executionReviewFixtureInput: unknown;
  executionGateFixtureInput: unknown;
  approvalGateFixtureInput: unknown;
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
}): SourceFolderFixtureManifestFileCreationDryRunExecutionReviewBatchResult {
  return reviewSourceFolderFixtureManifestFileCreationDryRunExecutionReviewFixture({
    executionReviewFixture: parseSourceFolderFixtureManifestFileCreationDryRunExecutionReviewFixture(
      input.executionReviewFixtureInput
    ),
    executionGateFixture: parseSourceFolderFixtureManifestFileCreationDryRunExecutionGateFixture(
      input.executionGateFixtureInput
    ),
    approvalGateFixture: parseSourceFolderFixtureManifestFileCreationDryRunApprovalGateFixture(
      input.approvalGateFixtureInput
    ),
    fileCreationDryRunReviewFixture: parseSourceFolderFixtureManifestFileCreationDryRunReviewFixture(
      input.fileCreationDryRunReviewFixtureInput
    ),
    fileCreationGateFixture: parseSourceFolderFixtureManifestFileCreationGateFixture(
      input.fileCreationGateFixtureInput
    ),
    fileCreationApprovalGateFixture: parseSourceFolderFixtureManifestWriteDryRunApprovalGateFixture(
      input.fileCreationApprovalGateFixtureInput
    ),
    writeDryRunReviewFixture: parseSourceFolderFixtureManifestWriteDryRunReviewFixture(
      input.writeDryRunReviewFixtureInput
    ),
    writeGateFixture: parseSourceFolderFixtureManifestWriteGateFixture(input.writeGateFixtureInput),
    creationApprovalGateFixture: parseSourceFolderDraftManifestCreationDryRunApprovalGateFixture(
      input.creationApprovalGateFixtureInput
    ),
    creationReviewFixture: parseSourceFolderDraftManifestCreationDryRunReviewFixture(input.creationReviewFixtureInput),
    creationGateFixture: parseSourceFolderDraftManifestCreationDryRunGateFixture(input.creationGateFixtureInput),
    draftManifestApprovalGateFixture: parseSourceFolderDraftManifestApprovalGateFixture(
      input.draftManifestApprovalGateFixtureInput
    ),
    draftManifestReviewFixture: parseSourceFolderDraftManifestReviewFixture(input.draftManifestReviewFixtureInput),
    metadataEnrichmentApprovalGateFixture: parseSourceFolderMetadataEnrichmentApprovalGateFixture(
      input.metadataEnrichmentApprovalGateFixtureInput
    ),
    enrichmentFixture: parseSourceFolderMetadataEnrichmentReviewFixture(input.enrichmentFixtureInput),
    listingReviewFixture: parseSourceFolderListingReviewFixture(input.listingReviewFixtureInput),
    listingGateFixture: parseSourceFolderListingApprovalGateFixture(input.listingGateFixtureInput)
  });
}

function reviewExecutionGateForExecutionReview(
  executionGate: SourceFolderFixtureManifestFileCreationDryRunExecutionGateOutput,
  records: SourceFolderFixtureManifestFileCreationDryRunExecutionReviewRecord[]
): SourceFolderFixtureManifestFileCreationDryRunExecutionReviewOutput {
  const sourceEligible =
    executionGate.eligible_for_fixture_manifest_file_creation_dry_run_execution_review > 0;
  const duplicateIds = new Set(
    executionGate.duplicate_id_findings.map((finding) => finding.replace("duplicate_suggested_footage_id:", ""))
  );
  const reviewItems = executionGate.execution_gate_items.map((item) =>
    executionReviewItemForGate(
      item,
      records.find((record) => record.file_creation_plan_item_id === item.file_creation_plan_item_id),
      duplicateIds,
      executionGate
    )
  );

  return SourceFolderFixtureManifestFileCreationDryRunExecutionReviewOutputSchema.parse({
    fixture_manifest_file_creation_dry_run_execution_review_id: `${EXECUTION_REVIEW_ID}-${executionGate.source_id}`,
    source_id: executionGate.source_id,
    source_label: executionGate.source_label,
    source_root: executionGate.source_root,
    dry_run: executionGate.dry_run,
    read_only: executionGate.read_only,
    source_execution_gate_status: sourceEligible
      ? "eligible_for_fixture_manifest_file_creation_dry_run_execution_review"
      : "not_eligible_for_fixture_manifest_file_creation_dry_run_execution_review",
    reviewed_execution_gate_items: reviewItems.length,
    execution_review_items: reviewItems.length,
    execution_review_ok: countExecutionReviewStatus(reviewItems, "execution_review_ok"),
    needs_owner_review: countExecutionReviewStatus(reviewItems, "needs_owner_review"),
    incomplete_execution_review: countExecutionReviewStatus(reviewItems, "incomplete_execution_review"),
    blocked_execution_review: countExecutionReviewStatus(reviewItems, "blocked_execution_review"),
    duplicate_id_count: duplicateIds.size,
    missing_required_field_count: sum(reviewItems.map((item) => item.missing_required_fields.length)),
    blocked_reason_summary: summarizeValues(reviewItems.flatMap((item) => item.blocking_reasons)),
    denied_action_summary: summarizeDeniedActions(reviewItems, records),
    recommended_owner_actions: recommendedOwnerActions(reviewItems, sourceEligible),
    next_safe_actions: nextSafeActions(reviewItems),
    target_fixture_manifest_path:
      reviewItems.find((item) => item.execution_review_status === "execution_review_ok")?.target_fixture_manifest_path ??
      executionGate.target_fixture_manifest_path,
    in_memory_execution_preview: inMemoryExecutionPreview(reviewItems),
    execution_review_item_reviews: reviewItems,
    metadata_write_allowed: false,
    manifest_write_allowed: false,
    fixture_manifest_write_allowed: executionGate.fixture_manifest_write_allowed,
    fixture_manifest_file_creation_gate_allowed: executionGate.fixture_manifest_file_creation_gate_allowed,
    fixture_manifest_file_creation_dry_run_allowed: executionGate.fixture_manifest_file_creation_dry_run_allowed,
    fixture_manifest_file_creation_execution_gate_allowed:
      executionGate.fixture_manifest_file_creation_execution_gate_allowed,
    fixture_manifest_file_creation_dry_run_execution_review_allowed:
      executionGate.fixture_manifest_file_creation_dry_run_execution_review_allowed,
    fixture_manifest_file_created: false,
    fixture_manifest_write_performed: false,
    fixture_manifest_file_creation_performed: false,
    fixture_manifest_file_creation_execution_performed: false,
    fixture_manifest_execution_review_persisted: false,
    production_manifest_write_allowed: false,
    manifest_export_allowed: false,
    public_ready: false,
    publish_track: "blocked"
  });
}

function executionReviewItemForGate(
  item: FixtureManifestFileCreationDryRunExecutionGateItem,
  record: SourceFolderFixtureManifestFileCreationDryRunExecutionReviewRecord | undefined,
  duplicateIds: Set<string>,
  executionGate: SourceFolderFixtureManifestFileCreationDryRunExecutionGateOutput
): FixtureManifestFileCreationDryRunExecutionReviewItem {
  const reviewRecord = record ?? defaultExecutionReviewRecord(item.file_creation_plan_item_id);
  const missingRequiredFields = missingRequiredFieldsFor(item);
  const blockingReasons = blockingReasonsFor(item, reviewRecord, duplicateIds, executionGate);
  const status = executionReviewStatusFor(item, reviewRecord, missingRequiredFields, blockingReasons);

  return FixtureManifestFileCreationDryRunExecutionReviewItemSchema.parse({
    execution_review_item_id: `${item.file_creation_plan_item_id}-execution-review`,
    file_creation_plan_item_id: item.file_creation_plan_item_id,
    write_plan_item_id: item.write_plan_item_id,
    manifest_item_id: item.manifest_item_id,
    suggested_footage_id: item.suggested_footage_id,
    filename: item.filename,
    relative_path: item.relative_path,
    source_execution_gate_status: item.execution_gate_status,
    product_family: item.product_family,
    visual_type: item.visual_type,
    process_stage: item.process_stage,
    orientation: item.orientation,
    school_level: item.school_level,
    color_variant: item.color_variant,
    content_tags: item.content_tags,
    risk_flags: item.risk_flags,
    target_fixture_manifest_path: item.target_fixture_manifest_path,
    execution_review_status: status,
    missing_required_fields: missingRequiredFields,
    blocking_reasons: blockingReasons,
    review_notes: [
      `Source execution gate status: ${item.execution_gate_status}.`,
      `Fixture manifest file creation dry-run execution review status: ${status}.`,
      "Phase 2J.28 builds only an in-memory execution preview for review; no fixture manifest file is created, written, exported, imported, saved, persisted, or executed."
    ],
    recommended_action: recommendedAction(status)
  });
}

function defaultExecutionReviewRecord(
  fileCreationPlanItemId: string
): SourceFolderFixtureManifestFileCreationDryRunExecutionReviewRecord {
  return {
    file_creation_plan_item_id: fileCreationPlanItemId,
    manual_review_required: false,
    requested_actions: []
  };
}

function missingRequiredFieldsFor(item: FixtureManifestFileCreationDryRunExecutionGateItem): string[] {
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
  item: FixtureManifestFileCreationDryRunExecutionGateItem,
  record: SourceFolderFixtureManifestFileCreationDryRunExecutionReviewRecord,
  duplicateIds: Set<string>,
  executionGate: SourceFolderFixtureManifestFileCreationDryRunExecutionGateOutput
): string[] {
  const reasons: string[] = [];
  if (executionGate.source_root !== SAFE_FIXTURE_ROOT) reasons.push("source_root_not_safe_fixture");
  if (!executionGate.dry_run) reasons.push("dry_run_false_blocked");
  if (!executionGate.read_only) reasons.push("read_only_false_blocked");
  if (item.execution_gate_status === "blocked_execution_gate") {
    reasons.push("source_execution_gate_blocked_cannot_be_upgraded");
  }
  if (item.execution_gate_status === "incomplete_execution_gate") {
    reasons.push("source_execution_gate_incomplete_cannot_be_upgraded");
  }
  if (duplicateIds.has(item.suggested_footage_id)) reasons.push("duplicate_suggested_footage_id_blocked");
  for (const reason of item.blocking_reasons) reasons.push(`source_execution_gate_${reason}`);
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

function executionReviewStatusFor(
  item: FixtureManifestFileCreationDryRunExecutionGateItem,
  record: SourceFolderFixtureManifestFileCreationDryRunExecutionReviewRecord,
  missingRequiredFields: string[],
  blockingReasons: string[]
): z.infer<typeof ExecutionReviewStatusSchema> {
  if (item.execution_gate_status === "incomplete_execution_gate") return "incomplete_execution_review";
  if (missingRequiredFields.length > 0) return "incomplete_execution_review";
  if (blockingReasons.length > 0) return "blocked_execution_review";
  if (item.execution_gate_status === "needs_owner_review" || record.manual_review_required) {
    return "needs_owner_review";
  }
  if (item.execution_gate_status !== "eligible_for_fixture_manifest_file_creation_dry_run_execution_review") {
    return "blocked_execution_review";
  }
  return "execution_review_ok";
}

function inMemoryExecutionPreview(
  items: FixtureManifestFileCreationDryRunExecutionReviewItem[]
): z.infer<typeof InMemoryFixtureManifestExecutionPreviewSchema> {
  const okItems = items.filter((item) => item.execution_review_status === "execution_review_ok");
  return InMemoryFixtureManifestExecutionPreviewSchema.parse({
    preview_only: true,
    persisted: false,
    execution_performed: false,
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
      execution_review_status: "execution_review_ok"
    }))
  });
}

function recommendedOwnerActions(
  items: FixtureManifestFileCreationDryRunExecutionReviewItem[],
  sourceEligible: boolean
): string[] {
  const actions = [
    "Review execution_review_ok rows as in-memory dry-run execution review only.",
    "Do not persist execution review output or create, write, export, import, save, or execute any manifest in Phase 2J.28."
  ];
  if (!sourceEligible) {
    actions.push("Keep non-eligible Phase 2J.27 cases blocked until upstream execution-gate eligibility is explicit.");
  }
  if (items.some((item) => item.execution_review_status === "needs_owner_review")) {
    actions.push("Collect owner/manual confirmation before any later dry-run execution approval phase.");
  }
  if (items.some((item) => item.execution_review_status === "incomplete_execution_review")) {
    actions.push("Complete required metadata and safe fixture target path strings before any later review step.");
  }
  if (items.some((item) => item.execution_review_status === "blocked_execution_review")) {
    actions.push("Keep duplicate IDs, blocked upstream gates, risky flags, unsafe paths, and denied actions blocked.");
  }
  return actions;
}

function nextSafeActions(items: FixtureManifestFileCreationDryRunExecutionReviewItem[]): string[] {
  if (items.some((item) => item.execution_review_status === "execution_review_ok")) {
    return [
      "Treat execution_review_ok rows as in-memory review evidence only.",
      "Keep all manifest creation, write, import, export, render, upload, and publish behavior disabled.",
      "Proceed only to a later owner approval phase that reviews this in-memory result."
    ];
  }
  return [
    "Return to Phase 2J.27 execution gate data before any later approval phase.",
    "Do not create, export, import, write, save, persist, or execute any manifest."
  ];
}

function recommendedAction(status: z.infer<typeof ExecutionReviewStatusSchema>): string {
  if (status === "execution_review_ok") {
    return "Keep as in-memory dry-run execution review evidence only; do not create or write a fixture manifest now.";
  }
  if (status === "needs_owner_review") return "Collect owner/manual confirmation before any later approval phase.";
  if (status === "incomplete_execution_review") return "Complete required metadata and safe fixture target path strings.";
  return "Keep blocked and remove duplicate IDs, risky flags, denied actions, unsafe target paths, or blocked upstream gates.";
}

function summarizeDeniedActions(
  items: FixtureManifestFileCreationDryRunExecutionReviewItem[],
  records: SourceFolderFixtureManifestFileCreationDryRunExecutionReviewRecord[]
): Record<string, number> {
  const itemIds = new Set(items.map((item) => item.file_creation_plan_item_id));
  return summarizeValues(records.filter((record) => itemIds.has(record.file_creation_plan_item_id)).flatMap((record) => record.requested_actions));
}

function containsBlockedPathToken(pathValue: string): boolean {
  const lower = pathValue.toLowerCase();
  return ["ssd", "google drive", "gdrive", "storage", "production", "backup", "upload", "render", "publish"].some((token) =>
    lower.includes(token)
  );
}

function countExecutionReviewStatus(
  items: FixtureManifestFileCreationDryRunExecutionReviewItem[],
  status: z.infer<typeof ExecutionReviewStatusSchema>
): number {
  return items.filter((item) => item.execution_review_status === status).length;
}

function summarizeValues(values: string[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const value of values) summary[value] = (summary[value] || 0) + 1;
  return summary;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
