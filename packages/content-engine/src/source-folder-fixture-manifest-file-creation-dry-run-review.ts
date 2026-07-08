import { z } from "zod";
import {
  parseSourceFolderFixtureManifestFileCreationGateFixture,
  reviewSourceFolderFixtureManifestFileCreationGateFixture,
  type FixtureManifestFileCreationItem,
  type SourceFolderFixtureManifestFileCreationGateFixture,
  type SourceFolderFixtureManifestFileCreationGateOutput
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

const FIXTURE_MANIFEST_FILE_CREATION_DRY_RUN_REVIEW_ID =
  "phase-2j25-source-folder-fixture-manifest-file-creation-dry-run-review";
const SAFE_FIXTURE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample/";

const FixtureManifestFileCreationDryRunActionSchema = z.enum([
  "metadata_write_requested",
  "metadata_import_requested",
  "manifest_write_requested",
  "manifest_import_requested",
  "manifest_export_requested",
  "fixture_manifest_write_requested",
  "fixture_manifest_file_create_requested",
  "fixture_manifest_file_creation_gate_execute_requested",
  "draft_manifest_file_create_requested",
  "production_manifest_write_requested",
  "render_requested",
  "upload_requested",
  "publish_requested",
  "publish_package_requested"
]);

const FixtureManifestFileCreationPlanStatusSchema = z.enum([
  "file_creation_plan_ok",
  "needs_owner_review",
  "incomplete_file_creation_plan",
  "blocked_file_creation_plan"
]);

export const SourceFolderFixtureManifestFileCreationDryRunPlanRecordSchema = z.object({
  write_plan_item_id: z.string().min(1),
  target_fixture_manifest_path: z.string().min(1).nullable().optional(),
  manual_review_required: z.boolean().default(false),
  requested_actions: z.array(FixtureManifestFileCreationDryRunActionSchema).default([])
}).strict();

export const SourceFolderFixtureManifestFileCreationDryRunReviewFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-fixture-manifest-file-creation-dry-run-review-smoke-v1"),
  mode: z.literal("controlled_fixture_manifest_file_creation_dry_run_review"),
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
  file_creation_plan_records: z.array(SourceFolderFixtureManifestFileCreationDryRunPlanRecordSchema).min(1),
  notes: z.string().min(1)
}).strict();

export const FixtureManifestFileCreationPlanItemSchema = z.object({
  file_creation_plan_item_id: z.string().min(1),
  write_plan_item_id: z.string().min(1),
  manifest_item_id: z.string().min(1),
  suggested_footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  source_file_creation_gate_status: z.enum([
    "eligible_for_fixture_manifest_file_creation_dry_run",
    "needs_owner_review",
    "incomplete_file_creation_gate",
    "blocked_file_creation_gate"
  ]),
  product_family: z.string().min(1).nullable(),
  visual_type: z.string().min(1).nullable(),
  process_stage: z.string().min(1).nullable(),
  orientation: z.enum(["vertical", "horizontal", "square", "unknown"]).nullable(),
  school_level: z.string().min(1).nullable(),
  color_variant: z.string().min(1).nullable(),
  content_tags: z.array(z.string().min(1)),
  risk_flags: z.array(z.string().min(1)),
  target_fixture_manifest_path: z.string().min(1).nullable(),
  file_creation_plan_status: FixtureManifestFileCreationPlanStatusSchema,
  missing_required_fields: z.array(z.string().min(1)),
  blocking_reasons: z.array(z.string().min(1)),
  review_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const InMemoryFixtureManifestPreviewSchema = z.object({
  preview_only: z.literal(true),
  persisted: z.literal(false),
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
    target_fixture_manifest_path: z.string().min(1).nullable()
  }).strict())
}).strict();

export const SourceFolderFixtureManifestFileCreationDryRunReviewOutputSchema = z.object({
  fixture_manifest_file_creation_dry_run_review_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  source_root: z.string().min(1),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  source_file_creation_gate_status: z.enum(["file_creation_gate_reviewable", "file_creation_gate_denied"]),
  reviewed_file_creation_gate_items: z.number().int().min(0),
  file_creation_plan_items: z.number().int().min(0),
  file_creation_plan_ok: z.number().int().min(0),
  needs_owner_review: z.number().int().min(0),
  incomplete_file_creation_plan: z.number().int().min(0),
  blocked_file_creation_plan: z.number().int().min(0),
  duplicate_id_count: z.number().int().min(0),
  missing_required_field_count: z.number().int().min(0),
  file_creation_plan_item_reviews: z.array(FixtureManifestFileCreationPlanItemSchema),
  blocked_reason_summary: z.record(z.string(), z.number().int().min(0)),
  denied_action_summary: z.record(z.string(), z.number().int().min(0)),
  recommended_owner_actions: z.array(z.string().min(1)),
  next_safe_actions: z.array(z.string().min(1)),
  target_fixture_manifest_path: z.string().min(1).nullable(),
  in_memory_manifest_preview: InMemoryFixtureManifestPreviewSchema,
  metadata_write_allowed: z.literal(false),
  manifest_write_allowed: z.literal(false),
  fixture_manifest_write_allowed: z.boolean(),
  fixture_manifest_file_creation_gate_allowed: z.boolean(),
  fixture_manifest_file_creation_dry_run_allowed: z.boolean(),
  fixture_manifest_file_created: z.literal(false),
  fixture_manifest_write_performed: z.literal(false),
  fixture_manifest_file_creation_performed: z.literal(false),
  production_manifest_write_allowed: z.literal(false),
  manifest_export_allowed: z.literal(false),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderFixtureManifestFileCreationDryRunPlanRecord = z.infer<
  typeof SourceFolderFixtureManifestFileCreationDryRunPlanRecordSchema
>;
export type SourceFolderFixtureManifestFileCreationDryRunReviewFixture = z.infer<
  typeof SourceFolderFixtureManifestFileCreationDryRunReviewFixtureSchema
>;
export type FixtureManifestFileCreationPlanItem = z.infer<typeof FixtureManifestFileCreationPlanItemSchema>;
export type SourceFolderFixtureManifestFileCreationDryRunReviewOutput = z.infer<
  typeof SourceFolderFixtureManifestFileCreationDryRunReviewOutputSchema
>;

export type SourceFolderFixtureManifestFileCreationDryRunReviewBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderFixtureManifestFileCreationDryRunReviewFixture;
  reviews: SourceFolderFixtureManifestFileCreationDryRunReviewOutput[];
  reviewedFileCreationGateItems: number;
  fileCreationPlanItems: number;
  fileCreationPlanOkCount: number;
  needsOwnerReviewCount: number;
  incompleteFileCreationPlanCount: number;
  blockedFileCreationPlanCount: number;
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
  fixtureManifestFileCreatedCount: number;
  fixtureManifestWritePerformedCount: number;
  fixtureManifestFileCreationPerformedCount: number;
  productionManifestWriteAllowedCount: number;
  manifestExportAllowedCount: number;
  recommendedOwnerActionsCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function parseSourceFolderFixtureManifestFileCreationDryRunReviewFixture(
  input: unknown
): SourceFolderFixtureManifestFileCreationDryRunReviewFixture {
  return SourceFolderFixtureManifestFileCreationDryRunReviewFixtureSchema.parse(input);
}

export function reviewSourceFolderFixtureManifestFileCreationDryRunReviewFixture(input: {
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
}): SourceFolderFixtureManifestFileCreationDryRunReviewBatchResult {
  const fileCreationGateResult = reviewSourceFolderFixtureManifestFileCreationGateFixture({
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
  const reviews = fileCreationGateResult.gates.map((gate) =>
    reviewFixtureManifestFileCreationDryRunPlan(gate, input.fileCreationDryRunReviewFixture.file_creation_plan_records)
  );

  return {
    provider: "fake_content_engine",
    fixture: input.fileCreationDryRunReviewFixture,
    reviews,
    reviewedFileCreationGateItems: sum(reviews.map((review) => review.reviewed_file_creation_gate_items)),
    fileCreationPlanItems: sum(reviews.map((review) => review.file_creation_plan_items)),
    fileCreationPlanOkCount: sum(reviews.map((review) => review.file_creation_plan_ok)),
    needsOwnerReviewCount: sum(reviews.map((review) => review.needs_owner_review)),
    incompleteFileCreationPlanCount: sum(reviews.map((review) => review.incomplete_file_creation_plan)),
    blockedFileCreationPlanCount: sum(reviews.map((review) => review.blocked_file_creation_plan)),
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
    fixtureManifestFileCreationGateAllowed: reviews.some(
      (review) => review.fixture_manifest_file_creation_gate_allowed
    ),
    fixtureManifestFileCreationDryRunAllowedCount: reviews.filter(
      (review) => review.fixture_manifest_file_creation_dry_run_allowed
    ).length,
    fixtureManifestFileCreationDryRunAllowed: reviews.some(
      (review) => review.fixture_manifest_file_creation_dry_run_allowed
    ),
    fixtureManifestFileCreatedCount: reviews.filter((review) => review.fixture_manifest_file_created).length,
    fixtureManifestWritePerformedCount: reviews.filter((review) => review.fixture_manifest_write_performed).length,
    fixtureManifestFileCreationPerformedCount: reviews.filter(
      (review) => review.fixture_manifest_file_creation_performed
    ).length,
    productionManifestWriteAllowedCount: reviews.filter((review) => review.production_manifest_write_allowed).length,
    manifestExportAllowedCount: reviews.filter((review) => review.manifest_export_allowed).length,
    recommendedOwnerActionsCount: sum(reviews.map((review) => review.recommended_owner_actions.length)),
    publicReadyCount: reviews.filter((review) => review.public_ready).length,
    publishTrack: "blocked"
  };
}

export function parseAndReviewSourceFolderFixtureManifestFileCreationDryRunReviewFixture(input: {
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
}): SourceFolderFixtureManifestFileCreationDryRunReviewBatchResult {
  return reviewSourceFolderFixtureManifestFileCreationDryRunReviewFixture({
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

export function reviewFixtureManifestFileCreationDryRunPlan(
  fileCreationGate: SourceFolderFixtureManifestFileCreationGateOutput,
  planRecords: SourceFolderFixtureManifestFileCreationDryRunPlanRecord[]
): SourceFolderFixtureManifestFileCreationDryRunReviewOutput {
  const sourceStatus = fileCreationGate.fixture_manifest_file_creation_dry_run_allowed
    ? "file_creation_gate_reviewable"
    : "file_creation_gate_denied";
  const duplicateIds = duplicateSuggestedFootageIds(fileCreationGate.file_creation_gate_items);
  const planItems = sourceStatus === "file_creation_gate_reviewable"
    ? fileCreationGate.file_creation_gate_items.map((item) =>
        fileCreationPlanItemForGate(
          item,
          planRecords.find((record) => record.write_plan_item_id === item.write_plan_item_id),
          duplicateIds
        )
      )
    : [];
  const okItems = planItems.filter((item) => item.file_creation_plan_status === "file_creation_plan_ok");

  return SourceFolderFixtureManifestFileCreationDryRunReviewOutputSchema.parse({
    fixture_manifest_file_creation_dry_run_review_id:
      `${FIXTURE_MANIFEST_FILE_CREATION_DRY_RUN_REVIEW_ID}-${fileCreationGate.source_id}`,
    source_id: fileCreationGate.source_id,
    source_label: fileCreationGate.source_label,
    source_root: fileCreationGate.source_root,
    dry_run: fileCreationGate.dry_run,
    read_only: fileCreationGate.read_only,
    source_file_creation_gate_status: sourceStatus,
    reviewed_file_creation_gate_items: sourceStatus === "file_creation_gate_reviewable"
      ? fileCreationGate.file_creation_gate_items.length
      : 0,
    file_creation_plan_items: planItems.length,
    file_creation_plan_ok: countPlanStatus(planItems, "file_creation_plan_ok"),
    needs_owner_review: countPlanStatus(planItems, "needs_owner_review"),
    incomplete_file_creation_plan: countPlanStatus(planItems, "incomplete_file_creation_plan"),
    blocked_file_creation_plan: countPlanStatus(planItems, "blocked_file_creation_plan"),
    duplicate_id_count: duplicateIds.size,
    missing_required_field_count: sum(planItems.map((item) => item.missing_required_fields.length)),
    file_creation_plan_item_reviews: planItems,
    blocked_reason_summary: summarizeValues(planItems.flatMap((item) => item.blocking_reasons)),
    denied_action_summary: summarizeDeniedActions(planItems, planRecords),
    recommended_owner_actions: recommendedOwnerActions(sourceStatus, planItems, duplicateIds.size),
    next_safe_actions: nextSafeActions(sourceStatus, okItems.length),
    target_fixture_manifest_path: okItems[0]?.target_fixture_manifest_path ?? fileCreationGate.target_fixture_manifest_path,
    in_memory_manifest_preview: {
      preview_only: true,
      persisted: false,
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
        target_fixture_manifest_path: item.target_fixture_manifest_path
      }))
    },
    metadata_write_allowed: false,
    manifest_write_allowed: false,
    fixture_manifest_write_allowed: fileCreationGate.fixture_manifest_write_allowed,
    fixture_manifest_file_creation_gate_allowed: fileCreationGate.fixture_manifest_file_creation_gate_allowed,
    fixture_manifest_file_creation_dry_run_allowed: fileCreationGate.fixture_manifest_file_creation_dry_run_allowed,
    fixture_manifest_file_created: false,
    fixture_manifest_write_performed: false,
    fixture_manifest_file_creation_performed: false,
    production_manifest_write_allowed: false,
    manifest_export_allowed: false,
    public_ready: false,
    publish_track: "blocked"
  });
}

function fileCreationPlanItemForGate(
  item: FixtureManifestFileCreationItem,
  record: SourceFolderFixtureManifestFileCreationDryRunPlanRecord | undefined,
  duplicateIds: Set<string>
): FixtureManifestFileCreationPlanItem {
  const planRecord = record ?? {
    write_plan_item_id: item.write_plan_item_id,
    target_fixture_manifest_path: item.target_fixture_manifest_path,
    manual_review_required: false,
    requested_actions: []
  };
  const targetFixtureManifestPath = planRecord.target_fixture_manifest_path ?? item.target_fixture_manifest_path;
  const missingRequiredFields = missingRequiredFieldsFor(item, targetFixtureManifestPath);
  const blockingReasons = blockingReasonsFor(item, planRecord, targetFixtureManifestPath, duplicateIds, missingRequiredFields);
  const status = fileCreationPlanStatusFor(item, planRecord, missingRequiredFields, blockingReasons);

  return FixtureManifestFileCreationPlanItemSchema.parse({
    file_creation_plan_item_id: `${item.write_plan_item_id}-file-creation-plan`,
    write_plan_item_id: item.write_plan_item_id,
    manifest_item_id: item.manifest_item_id,
    suggested_footage_id: item.suggested_footage_id,
    filename: item.filename,
    relative_path: item.relative_path,
    source_file_creation_gate_status: item.file_creation_gate_status,
    product_family: item.product_family,
    visual_type: item.visual_type,
    process_stage: item.process_stage,
    orientation: item.orientation,
    school_level: item.school_level,
    color_variant: item.color_variant,
    content_tags: item.content_tags,
    risk_flags: item.risk_flags,
    target_fixture_manifest_path: targetFixtureManifestPath,
    file_creation_plan_status: status,
    missing_required_fields: missingRequiredFields,
    blocking_reasons: blockingReasons,
    review_notes: [
      `Source file creation gate status: ${item.file_creation_gate_status}.`,
      `Fixture manifest file creation plan status: ${status}.`,
      "This is an in-memory review plan only; no fixture manifest file is created, written, exported, imported, saved, or persisted."
    ],
    recommended_action: recommendedAction(status)
  });
}

function missingRequiredFieldsFor(item: FixtureManifestFileCreationItem, targetFixtureManifestPath: string | null): string[] {
  const missing: string[] = [];
  if (!item.product_family) missing.push("product_family");
  if (!item.visual_type) missing.push("visual_type");
  if (!item.process_stage) missing.push("process_stage");
  if (!item.orientation) missing.push("orientation");
  if (!item.filename) missing.push("filename");
  if (!item.relative_path) missing.push("relative_path");
  if (!targetFixtureManifestPath) missing.push("target_fixture_manifest_path");
  return missing;
}

function blockingReasonsFor(
  item: FixtureManifestFileCreationItem,
  record: SourceFolderFixtureManifestFileCreationDryRunPlanRecord,
  targetFixtureManifestPath: string | null,
  duplicateIds: Set<string>,
  missingRequiredFields: string[]
): string[] {
  const reasons: string[] = [];
  if (item.file_creation_gate_status === "blocked_file_creation_gate") reasons.push("source_file_creation_gate_blocked_cannot_be_upgraded");
  if (item.file_creation_gate_status === "incomplete_file_creation_gate") reasons.push("source_file_creation_gate_incomplete_cannot_be_upgraded");
  if (duplicateIds.has(item.suggested_footage_id)) reasons.push("duplicate_suggested_footage_id_blocked");
  for (const reason of item.blocking_reasons) reasons.push(`file_creation_gate_${reason}`);
  for (const riskFlag of item.risk_flags) {
    if (["privacy_review_needed", "placeholder", "unrelated_content", "suspicious", "non_media", "unsafe_entry"].includes(riskFlag)) {
      reasons.push(`risk_flag_${riskFlag}`);
    }
  }
  for (const action of record.requested_actions) reasons.push(`denied_action_${action}`);
  if (item.relative_path.includes("..")) reasons.push("unsafe_relative_path_blocked");
  if (targetFixtureManifestPath && containsBlockedPathToken(targetFixtureManifestPath)) {
    reasons.push("target_fixture_manifest_path_blocked_metadata_only");
  }
  if (targetFixtureManifestPath && !targetFixtureManifestPath.startsWith("packages/content-engine/fixtures/")) {
    reasons.push("target_fixture_manifest_path_not_safe_repo_fixture");
  }
  if (missingRequiredFields.includes("target_fixture_manifest_path")) reasons.push("target_fixture_manifest_path_missing");
  if (missingRequiredFields.length > 0) reasons.push("required_manifest_fields_missing");
  return reasons;
}

function fileCreationPlanStatusFor(
  item: FixtureManifestFileCreationItem,
  record: SourceFolderFixtureManifestFileCreationDryRunPlanRecord,
  missingRequiredFields: string[],
  blockingReasons: string[]
): z.infer<typeof FixtureManifestFileCreationPlanStatusSchema> {
  if (item.file_creation_gate_status === "incomplete_file_creation_gate" || missingRequiredFields.length > 0) {
    return "incomplete_file_creation_plan";
  }
  if (blockingReasons.length > 0) return "blocked_file_creation_plan";
  if (item.file_creation_gate_status === "needs_owner_review" || record.manual_review_required) return "needs_owner_review";
  if (item.file_creation_gate_status !== "eligible_for_fixture_manifest_file_creation_dry_run") {
    return "blocked_file_creation_plan";
  }
  return "file_creation_plan_ok";
}

function duplicateSuggestedFootageIds(items: FixtureManifestFileCreationItem[]): Set<string> {
  const duplicateIds = new Set<string>();
  for (const item of items) {
    if (item.blocking_reasons.includes("duplicate_suggested_footage_id_blocked")) {
      duplicateIds.add(item.suggested_footage_id);
    }
  }
  return duplicateIds;
}

function containsBlockedPathToken(pathValue: string): boolean {
  const lower = pathValue.toLowerCase();
  return ["ssd", "google drive", "gdrive", "storage", "production", "backup", "upload", "render", "publish"].some((token) =>
    lower.includes(token)
  );
}

function summarizeDeniedActions(
  items: FixtureManifestFileCreationPlanItem[],
  records: SourceFolderFixtureManifestFileCreationDryRunPlanRecord[]
): Record<string, number> {
  const itemIds = new Set(items.map((item) => item.write_plan_item_id));
  return summarizeValues(records.filter((record) => itemIds.has(record.write_plan_item_id)).flatMap((record) => record.requested_actions));
}

function recommendedOwnerActions(
  sourceStatus: "file_creation_gate_reviewable" | "file_creation_gate_denied",
  items: FixtureManifestFileCreationPlanItem[],
  duplicateIdCount: number
): string[] {
  if (sourceStatus !== "file_creation_gate_reviewable") {
    return ["Keep denied file creation gate cases blocked; do not create file creation plan items."];
  }
  const actions = [
    "Review file_creation_plan_ok rows before any later fixture-manifest file creation dry-run review.",
    "Do not create, write, export, import, save, or persist any manifest in Phase 2J.25."
  ];
  if (items.some((item) => item.file_creation_plan_status === "needs_owner_review")) {
    actions.push("Collect owner/manual confirmation before a later fixture-manifest file creation dry-run review.");
  }
  if (items.some((item) => item.file_creation_plan_status === "incomplete_file_creation_plan")) {
    actions.push("Complete required metadata and safe target path strings before any later file creation review.");
  }
  if (items.some((item) => item.file_creation_plan_status === "blocked_file_creation_plan") || duplicateIdCount > 0) {
    actions.push("Keep duplicate IDs, blocked upstream rows, risky flags, unsafe paths, and denied write/import/export/render/upload/publish requests blocked.");
  }
  return actions;
}

function nextSafeActions(
  sourceStatus: "file_creation_gate_reviewable" | "file_creation_gate_denied",
  okCount: number
): string[] {
  if (sourceStatus !== "file_creation_gate_reviewable") {
    return [
      "Return to Phase 2J.24 fixture manifest file creation gate before file creation dry-run review.",
      "Do not create, export, import, write, save, or persist any manifest."
    ];
  }
  if (okCount > 0) {
    return [
      "Treat file_creation_plan_ok rows as in-memory fixture-manifest file creation dry-run review output only.",
      "Keep fixture_manifest_file_creation_dry_run_allowed as inherited future eligibility only.",
      "Do not write production manifests, fixture manifest files, draft manifest files, or real metadata stores."
    ];
  }
  return [
    "Keep all rows in review until the owner confirms a safe in-memory file creation plan.",
    "Do not create, export, import, write, save, or persist any manifest."
  ];
}

function recommendedAction(status: z.infer<typeof FixtureManifestFileCreationPlanStatusSchema>): string {
  if (status === "file_creation_plan_ok") {
    return "Keep as in-memory fixture-manifest file creation dry-run review only; do not create a fixture manifest file.";
  }
  if (status === "needs_owner_review") return "Collect owner/manual confirmation before a later dry-run review.";
  if (status === "incomplete_file_creation_plan") return "Complete required metadata or safe target path strings before continuing.";
  return "Keep blocked and remove duplicate IDs, risky flags, denied actions, unsafe target paths, or blocked upstream rows.";
}

function countPlanStatus(
  items: FixtureManifestFileCreationPlanItem[],
  status: z.infer<typeof FixtureManifestFileCreationPlanStatusSchema>
): number {
  return items.filter((item) => item.file_creation_plan_status === status).length;
}

function summarizeValues(values: string[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const value of values) summary[value] = (summary[value] || 0) + 1;
  return summary;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
