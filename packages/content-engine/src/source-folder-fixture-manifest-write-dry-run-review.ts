import { z } from "zod";
import {
  parseSourceFolderFixtureManifestWriteGateFixture,
  reviewSourceFolderFixtureManifestWriteGateFixture,
  type FixtureManifestWriteGateItem,
  type SourceFolderFixtureManifestWriteGateFixture,
  type SourceFolderFixtureManifestWriteGateOutput
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

const FIXTURE_MANIFEST_WRITE_DRY_RUN_REVIEW_ID = "phase-2j22-source-folder-fixture-manifest-write-dry-run-review";
const SAFE_FIXTURE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample/";
const SAFE_TARGET_FIXTURE_MANIFEST_PATH =
  "packages/content-engine/fixtures/generated/phase-2j22-fixture-manifest-preview.json";

const FixtureManifestWriteDryRunReviewActionSchema = z.enum([
  "metadata_write_requested",
  "metadata_import_requested",
  "manifest_write_requested",
  "manifest_import_requested",
  "manifest_export_requested",
  "fixture_manifest_write_requested",
  "fixture_manifest_file_create_requested",
  "draft_manifest_file_create_requested",
  "production_manifest_write_requested",
  "render_requested",
  "upload_requested",
  "publish_requested",
  "publish_package_requested"
]);

const WritePlanStatusSchema = z.enum([
  "write_plan_ok",
  "needs_owner_review",
  "incomplete_write_plan",
  "blocked_write_plan"
]);

export const SourceFolderFixtureManifestWriteDryRunReviewPlanRecordSchema = z.object({
  manifest_item_id: z.string().min(1),
  target_fixture_manifest_path: z.string().min(1).nullable(),
  owner_review_required: z.boolean().default(false),
  requested_actions: z.array(FixtureManifestWriteDryRunReviewActionSchema).default([])
}).strict();

export const SourceFolderFixtureManifestWriteDryRunReviewFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-fixture-manifest-write-dry-run-review-smoke-v1"),
  mode: z.literal("controlled_fixture_manifest_write_dry_run_review"),
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
  write_plan_records: z.array(SourceFolderFixtureManifestWriteDryRunReviewPlanRecordSchema).min(1),
  notes: z.string().min(1)
}).strict();

export const FixtureManifestWritePlanItemSchema = z.object({
  write_plan_item_id: z.string().min(1),
  manifest_item_id: z.string().min(1),
  suggested_footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  source_write_gate_status: z.enum([
    "eligible_for_fixture_manifest_write_dry_run",
    "needs_owner_review",
    "incomplete_write_gate",
    "blocked_write_gate"
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
  write_plan_status: WritePlanStatusSchema,
  missing_required_fields: z.array(z.string().min(1)),
  blocking_reasons: z.array(z.string().min(1)),
  review_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const SourceFolderFixtureManifestWriteDryRunReviewOutputSchema = z.object({
  fixture_manifest_write_dry_run_review_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  source_root: z.string().min(1),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  source_write_gate_status: z.enum(["write_gate_reviewable", "write_gate_denied"]),
  reviewed_write_gate_items: z.number().int().min(0),
  write_plan_items: z.array(FixtureManifestWritePlanItemSchema),
  write_plan_ok: z.number().int().min(0),
  needs_owner_review: z.number().int().min(0),
  incomplete_write_plan: z.number().int().min(0),
  blocked_write_plan: z.number().int().min(0),
  duplicate_id_count: z.number().int().min(0),
  missing_required_field_count: z.number().int().min(0),
  blocked_reason_summary: z.record(z.string(), z.number().int().min(0)),
  denied_action_summary: z.record(z.string(), z.number().int().min(0)),
  recommended_owner_actions: z.array(z.string().min(1)),
  next_safe_actions: z.array(z.string().min(1)),
  metadata_write_allowed: z.literal(false),
  manifest_write_allowed: z.literal(false),
  fixture_manifest_write_allowed: z.boolean(),
  fixture_manifest_file_created: z.literal(false),
  fixture_manifest_write_performed: z.literal(false),
  production_manifest_write_allowed: z.literal(false),
  manifest_export_allowed: z.literal(false),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderFixtureManifestWriteDryRunReviewPlanRecord = z.infer<
  typeof SourceFolderFixtureManifestWriteDryRunReviewPlanRecordSchema
>;
export type SourceFolderFixtureManifestWriteDryRunReviewFixture = z.infer<
  typeof SourceFolderFixtureManifestWriteDryRunReviewFixtureSchema
>;
export type FixtureManifestWritePlanItem = z.infer<typeof FixtureManifestWritePlanItemSchema>;
export type SourceFolderFixtureManifestWriteDryRunReviewOutput = z.infer<
  typeof SourceFolderFixtureManifestWriteDryRunReviewOutputSchema
>;

export type SourceFolderFixtureManifestWriteDryRunReviewBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderFixtureManifestWriteDryRunReviewFixture;
  reviews: SourceFolderFixtureManifestWriteDryRunReviewOutput[];
  reviewedWriteGateItems: number;
  writePlanItems: number;
  writePlanOkCount: number;
  needsOwnerReviewCount: number;
  incompleteWritePlanCount: number;
  blockedWritePlanCount: number;
  duplicateIdCount: number;
  missingRequiredFieldCount: number;
  blockedReasonsCount: number;
  deniedActionCount: number;
  metadataWriteAllowedCount: number;
  manifestWriteAllowedCount: number;
  fixtureManifestWriteAllowedCount: number;
  fixtureManifestWriteAllowed: boolean;
  fixtureManifestFileCreatedCount: number;
  fixtureManifestWritePerformedCount: number;
  productionManifestWriteAllowedCount: number;
  manifestExportAllowedCount: number;
  recommendedOwnerActionsCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function parseSourceFolderFixtureManifestWriteDryRunReviewFixture(
  input: unknown
): SourceFolderFixtureManifestWriteDryRunReviewFixture {
  return SourceFolderFixtureManifestWriteDryRunReviewFixtureSchema.parse(input);
}

export function reviewSourceFolderFixtureManifestWriteDryRunReviewFixture(input: {
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
}): SourceFolderFixtureManifestWriteDryRunReviewBatchResult {
  const writeGateResult = reviewSourceFolderFixtureManifestWriteGateFixture({
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
  const reviews = writeGateResult.gates.map((gate) =>
    reviewFixtureManifestWriteGateForDryRunPlan(gate, input.writeDryRunReviewFixture.write_plan_records)
  );

  return {
    provider: "fake_content_engine",
    fixture: input.writeDryRunReviewFixture,
    reviews,
    reviewedWriteGateItems: sum(reviews.map((review) => review.reviewed_write_gate_items)),
    writePlanItems: sum(reviews.map((review) => review.write_plan_items.length)),
    writePlanOkCount: sum(reviews.map((review) => review.write_plan_ok)),
    needsOwnerReviewCount: sum(reviews.map((review) => review.needs_owner_review)),
    incompleteWritePlanCount: sum(reviews.map((review) => review.incomplete_write_plan)),
    blockedWritePlanCount: sum(reviews.map((review) => review.blocked_write_plan)),
    duplicateIdCount: sum(reviews.map((review) => review.duplicate_id_count)),
    missingRequiredFieldCount: sum(reviews.map((review) => review.missing_required_field_count)),
    blockedReasonsCount: sum(reviews.flatMap((review) => Object.values(review.blocked_reason_summary))),
    deniedActionCount: sum(reviews.flatMap((review) => Object.values(review.denied_action_summary))),
    metadataWriteAllowedCount: reviews.filter((review) => review.metadata_write_allowed).length,
    manifestWriteAllowedCount: reviews.filter((review) => review.manifest_write_allowed).length,
    fixtureManifestWriteAllowedCount: reviews.filter((review) => review.fixture_manifest_write_allowed).length,
    fixtureManifestWriteAllowed: reviews.some((review) => review.fixture_manifest_write_allowed),
    fixtureManifestFileCreatedCount: reviews.filter((review) => review.fixture_manifest_file_created).length,
    fixtureManifestWritePerformedCount: reviews.filter((review) => review.fixture_manifest_write_performed).length,
    productionManifestWriteAllowedCount: reviews.filter((review) => review.production_manifest_write_allowed).length,
    manifestExportAllowedCount: reviews.filter((review) => review.manifest_export_allowed).length,
    recommendedOwnerActionsCount: sum(reviews.map((review) => review.recommended_owner_actions.length)),
    publicReadyCount: reviews.filter((review) => review.public_ready).length,
    publishTrack: "blocked"
  };
}

export function parseAndReviewSourceFolderFixtureManifestWriteDryRunReviewFixture(input: {
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
}): SourceFolderFixtureManifestWriteDryRunReviewBatchResult {
  return reviewSourceFolderFixtureManifestWriteDryRunReviewFixture({
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

export function reviewFixtureManifestWriteGateForDryRunPlan(
  writeGate: SourceFolderFixtureManifestWriteGateOutput,
  planRecords: SourceFolderFixtureManifestWriteDryRunReviewPlanRecord[]
): SourceFolderFixtureManifestWriteDryRunReviewOutput {
  const sourceStatus = writeGate.fixture_manifest_write_allowed ? "write_gate_reviewable" : "write_gate_denied";
  const duplicateIds = duplicateSuggestedFootageIdsFromFindings(writeGate.duplicate_id_findings);
  const planItems = sourceStatus === "write_gate_reviewable"
    ? writePlanItemsForGateItems(writeGate.write_gate_items, planRecords, duplicateIds)
    : [];

  return SourceFolderFixtureManifestWriteDryRunReviewOutputSchema.parse({
    fixture_manifest_write_dry_run_review_id: `${FIXTURE_MANIFEST_WRITE_DRY_RUN_REVIEW_ID}-${writeGate.source_id}`,
    source_id: writeGate.source_id,
    source_label: writeGate.source_label,
    source_root: writeGate.source_root,
    dry_run: writeGate.dry_run,
    read_only: writeGate.read_only,
    source_write_gate_status: sourceStatus,
    reviewed_write_gate_items: sourceStatus === "write_gate_reviewable" ? writeGate.write_gate_items.length : 0,
    write_plan_items: planItems,
    write_plan_ok: countWritePlanStatus(planItems, "write_plan_ok"),
    needs_owner_review: countWritePlanStatus(planItems, "needs_owner_review"),
    incomplete_write_plan: countWritePlanStatus(planItems, "incomplete_write_plan"),
    blocked_write_plan: countWritePlanStatus(planItems, "blocked_write_plan"),
    duplicate_id_count: writeGate.duplicate_id_findings.length,
    missing_required_field_count: sum(planItems.map((item) => item.missing_required_fields.length)),
    blocked_reason_summary: summarizeValues(planItems.flatMap((item) => item.blocking_reasons)),
    denied_action_summary: summarizeDeniedActions(planItems, planRecords),
    recommended_owner_actions: recommendedOwnerActions(sourceStatus, planItems, writeGate.duplicate_id_findings),
    next_safe_actions: nextSafeActions(sourceStatus, countWritePlanStatus(planItems, "write_plan_ok")),
    metadata_write_allowed: false,
    manifest_write_allowed: false,
    fixture_manifest_write_allowed: writeGate.fixture_manifest_write_allowed,
    fixture_manifest_file_created: false,
    fixture_manifest_write_performed: false,
    production_manifest_write_allowed: false,
    manifest_export_allowed: false,
    public_ready: false,
    publish_track: "blocked"
  });
}

function writePlanItemsForGateItems(
  gateItems: FixtureManifestWriteGateItem[],
  records: SourceFolderFixtureManifestWriteDryRunReviewPlanRecord[],
  duplicateIds: Set<string>
): FixtureManifestWritePlanItem[] {
  const items: FixtureManifestWritePlanItem[] = [];
  for (const gateItem of gateItems) {
    const matchingRecords = records.filter((record) => record.manifest_item_id === gateItem.manifest_item_id);
    const selectedRecords = matchingRecords.length > 0 ? matchingRecords : [defaultWritePlanRecord(gateItem.manifest_item_id)];
    for (const record of selectedRecords) items.push(writePlanItemForGateItem(gateItem, record, duplicateIds));
  }
  return items;
}

function defaultWritePlanRecord(manifestItemId: string): SourceFolderFixtureManifestWriteDryRunReviewPlanRecord {
  return {
    manifest_item_id: manifestItemId,
    target_fixture_manifest_path: SAFE_TARGET_FIXTURE_MANIFEST_PATH,
    owner_review_required: false,
    requested_actions: []
  };
}

function writePlanItemForGateItem(
  gateItem: FixtureManifestWriteGateItem,
  record: SourceFolderFixtureManifestWriteDryRunReviewPlanRecord,
  duplicateIds: Set<string>
): FixtureManifestWritePlanItem {
  const missingRequired = missingRequiredFieldsFor(gateItem, record);
  const blockingReasons = blockingReasonsFor(gateItem, record, duplicateIds);
  const status = writePlanStatusFor(gateItem, record, missingRequired, blockingReasons);

  return FixtureManifestWritePlanItemSchema.parse({
    write_plan_item_id: `${gateItem.manifest_item_id}-write-plan-${status}`,
    manifest_item_id: gateItem.manifest_item_id,
    suggested_footage_id: gateItem.suggested_footage_id,
    filename: gateItem.filename,
    relative_path: gateItem.relative_path,
    source_write_gate_status: gateItem.write_gate_status,
    product_family: gateItem.product_family,
    visual_type: gateItem.visual_type,
    process_stage: gateItem.process_stage,
    orientation: gateItem.orientation,
    school_level: gateItem.school_level,
    color_variant: gateItem.color_variant,
    content_tags: gateItem.content_tags,
    risk_flags: gateItem.risk_flags,
    target_fixture_manifest_path: record.target_fixture_manifest_path,
    write_plan_status: status,
    missing_required_fields: missingRequired,
    blocking_reasons: blockingReasons,
    review_notes: [
      `Source write gate status: ${gateItem.write_gate_status}.`,
      `Fixture manifest write dry-run review status: ${status}.`,
      "This is an in-memory write-plan review only; no fixture manifest file is created or written."
    ],
    recommended_action: recommendedAction(status)
  });
}

function missingRequiredFieldsFor(
  item: FixtureManifestWriteGateItem,
  record: SourceFolderFixtureManifestWriteDryRunReviewPlanRecord
): string[] {
  const missing: string[] = [];
  for (const field of [
    ["product_family", item.product_family],
    ["visual_type", item.visual_type],
    ["process_stage", item.process_stage],
    ["orientation", item.orientation],
    ["filename", item.filename],
    ["relative_path", item.relative_path],
    ["target_fixture_manifest_path", record.target_fixture_manifest_path]
  ] as const) {
    if (!field[1]) missing.push(field[0]);
  }
  if (record.target_fixture_manifest_path && !isSafeTargetFixtureManifestPath(record.target_fixture_manifest_path)) {
    missing.push("target_fixture_manifest_path_safe_repo_fixture_string");
  }
  return missing;
}

function blockingReasonsFor(
  item: FixtureManifestWriteGateItem,
  record: SourceFolderFixtureManifestWriteDryRunReviewPlanRecord,
  duplicateIds: Set<string>
): string[] {
  const reasons: string[] = [];
  if (item.write_gate_status !== "eligible_for_fixture_manifest_write_dry_run") {
    reasons.push(`source_write_gate_${item.write_gate_status}_cannot_be_upgraded`);
  }
  if (duplicateIds.has(item.suggested_footage_id)) reasons.push("duplicate_suggested_footage_id_blocked");
  for (const reason of item.blocking_reasons) reasons.push(`write_gate_${reason}`);
  for (const riskFlag of item.risk_flags) {
    if (["privacy_review_needed", "placeholder", "unrelated_content", "suspicious", "non_media", "unsafe_entry"].includes(riskFlag)) {
      reasons.push(`risk_flag_${riskFlag}`);
    }
  }
  for (const action of record.requested_actions) reasons.push(`denied_action_${action}`);
  if (item.relative_path.includes("..")) reasons.push("unsafe_relative_path_blocked");
  if (record.target_fixture_manifest_path && containsBlockedPathToken(record.target_fixture_manifest_path)) {
    reasons.push("target_fixture_manifest_path_blocked_metadata_only");
  }
  return reasons;
}

function writePlanStatusFor(
  item: FixtureManifestWriteGateItem,
  record: SourceFolderFixtureManifestWriteDryRunReviewPlanRecord,
  missingRequiredFields: string[],
  blockingReasons: string[]
): z.infer<typeof WritePlanStatusSchema> {
  if (blockingReasons.length > 0) return "blocked_write_plan";
  if (missingRequiredFields.length > 0) return "incomplete_write_plan";
  if (item.write_gate_status !== "eligible_for_fixture_manifest_write_dry_run") return "blocked_write_plan";
  if (record.owner_review_required) return "needs_owner_review";
  return "write_plan_ok";
}

function isSafeTargetFixtureManifestPath(pathValue: string): boolean {
  return (
    pathValue.startsWith("packages/content-engine/fixtures/") &&
    pathValue.endsWith(".json") &&
    !pathValue.includes("..") &&
    !pathValue.startsWith("/") &&
    !containsBlockedPathToken(pathValue)
  );
}

function containsBlockedPathToken(pathValue: string): boolean {
  const lower = pathValue.toLowerCase();
  return ["ssd", "google drive", "gdrive", "storage", "production", "backup", "upload", "render", "publish"].some((token) =>
    lower.includes(token)
  );
}

function duplicateSuggestedFootageIdsFromFindings(findings: string[]): Set<string> {
  const ids = new Set<string>();
  for (const finding of findings) {
    const [, id] = finding.split(":");
    if (id) ids.add(id);
  }
  return ids;
}

function summarizeDeniedActions(
  items: FixtureManifestWritePlanItem[],
  records: SourceFolderFixtureManifestWriteDryRunReviewPlanRecord[]
): Record<string, number> {
  const itemIds = new Set(items.map((item) => item.manifest_item_id));
  return summarizeValues(records.filter((record) => itemIds.has(record.manifest_item_id)).flatMap((record) => record.requested_actions));
}

function recommendedOwnerActions(
  sourceStatus: "write_gate_reviewable" | "write_gate_denied",
  items: FixtureManifestWritePlanItem[],
  duplicateFindings: string[]
): string[] {
  if (sourceStatus !== "write_gate_reviewable") {
    return ["Keep denied fixture manifest write gate cases blocked; do not build write plans."];
  }
  const actions = [
    "Review write_plan_ok rows before any later fixture manifest write dry-run phase.",
    "Do not create, write, export, import, save, or persist any manifest in Phase 2J.22."
  ];
  if (items.some((item) => item.write_plan_status === "needs_owner_review")) {
    actions.push("Confirm owner/manual review notes before a later fixture manifest write dry-run phase.");
  }
  if (items.some((item) => item.write_plan_status === "incomplete_write_plan")) {
    actions.push("Complete required metadata and safe target path strings before any later dry-run phase.");
  }
  if (items.some((item) => item.write_plan_status === "blocked_write_plan") || duplicateFindings.length > 0) {
    actions.push("Keep duplicate IDs, blocked upstream rows, risky flags, unsafe paths, and denied write/import/export/render/upload/publish requests blocked.");
  }
  return actions;
}

function nextSafeActions(sourceStatus: "write_gate_reviewable" | "write_gate_denied", okCount: number): string[] {
  if (sourceStatus !== "write_gate_reviewable") {
    return [
      "Return to Phase 2J.21 fixture manifest write gate before write dry-run review.",
      "Do not create, export, import, write, save, or persist any manifest."
    ];
  }
  if (okCount > 0) {
    return [
      "Treat write_plan_ok as in-memory review output only.",
      "Keep fixture_manifest_write_allowed as future dry-run eligibility only.",
      "Do not write production manifests, fixture manifest files, draft manifest files, or real metadata stores."
    ];
  }
  return [
    "Keep all rows in review until owner approval, required metadata, and safe target path strings are complete.",
    "Do not create, export, import, write, save, or persist any manifest."
  ];
}

function recommendedAction(status: z.infer<typeof WritePlanStatusSchema>): string {
  if (status === "write_plan_ok") {
    return "Keep as in-memory write-plan review output only; do not create a fixture manifest now.";
  }
  if (status === "needs_owner_review") return "Complete owner/manual confirmation before any later dry-run phase.";
  if (status === "incomplete_write_plan") return "Complete required metadata and safe target path strings.";
  return "Keep blocked and remove duplicate IDs, risky flags, denied actions, unsafe target paths, or blocked upstream rows.";
}

function countWritePlanStatus(
  items: FixtureManifestWritePlanItem[],
  status: z.infer<typeof WritePlanStatusSchema>
): number {
  return items.filter((item) => item.write_plan_status === status).length;
}

function summarizeValues(values: string[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const value of values) summary[value] = (summary[value] || 0) + 1;
  return summary;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
