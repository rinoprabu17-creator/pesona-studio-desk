import { z } from "zod";
import { evaluateSourceFolderGateCase } from "./source-folder-gate.ts";
import { reviewSourceFolderApprovalRecord } from "./source-folder-approval-review.ts";
import { getReadOnlyIntakeSafeFixtureRoot, runReadOnlyIntakeDryRun } from "./read-only-intake.ts";

const LISTING_GATE_ID = "phase-2j12-source-folder-listing-approval-gate";

const RequestedActionsSchema = z.object({
  scan_requested: z.boolean(),
  file_open_requested: z.boolean(),
  decode_requested: z.boolean(),
  render_requested: z.boolean(),
  upload_requested: z.boolean(),
  publish_requested: z.boolean(),
  publish_package_requested: z.boolean(),
  storage_mutation_requested: z.boolean(),
  env_secret_requested: z.boolean(),
  server_command_requested: z.boolean(),
  docker_command_requested: z.boolean()
}).strict();

const ApprovalModeSchema = z.enum(["owner_approved_fixture_dry_run", "pending_owner_approval", "metadata_only_manual_review"]);

export const SourceFolderListingApprovalGateCaseSchema = z.object({
  case_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  requested_source_root: z.string().min(1),
  approval_mode: ApprovalModeSchema,
  approval_record_found: z.boolean(),
  owner_approved: z.boolean(),
  approved_by: z.string().trim().min(1).nullable(),
  approved_at: z.string().trim().min(1).nullable(),
  approval_scope: z.string().trim().min(1).nullable(),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  provider: z.literal("fake_content_engine"),
  requested_actions: RequestedActionsSchema,
  notes: z.string().min(1)
}).strict();

export const SourceFolderListingApprovalGateFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-listing-approval-gate-smoke-v1"),
  mode: z.literal("controlled_fixture_listing_approval_gate"),
  cases: z.array(SourceFolderListingApprovalGateCaseSchema).min(5)
}).strict();

export const SourceFolderListingSummarySchema = z.object({
  source_mode: z.enum(["safe_repo_fixture", "not_listed"]),
  candidate_manifest_rows: z.number().int().min(0),
  validation_error_count: z.number().int().min(0),
  extension_breakdown: z.record(z.string(), z.number().int().min(0)),
  orientation_hint_breakdown: z.record(z.string(), z.number().int().min(0)),
  listed_fixture_only: z.boolean()
}).strict();

export const SourceFolderListingApprovalGateOutputSchema = z.object({
  listing_gate_id: z.string().min(1),
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  requested_source_root: z.string().min(1),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  approval_review_status: z.enum(["approval_review_ok", "needs_owner_review", "incomplete_approval", "blocked_source"]),
  source_gate_status: z.enum(["blocked", "manual_review_required", "owner_approved_dry_run"]),
  listing_allowed: z.boolean(),
  listing_performed: z.boolean(),
  allowlisted_root: z.boolean(),
  scanned_entries: z.number().int().min(0),
  accepted_candidates: z.number().int().min(0),
  rejected_entries: z.number().int().min(0),
  skipped_entries: z.number().int().min(0),
  listing_summary: SourceFolderListingSummarySchema,
  denied_listing_reasons: z.array(z.string().min(1)),
  safety_warnings: z.array(z.string().min(1)),
  next_safe_actions: z.array(z.string().min(1)),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderListingApprovalGateCase = z.infer<typeof SourceFolderListingApprovalGateCaseSchema>;
export type SourceFolderListingApprovalGateFixture = z.infer<typeof SourceFolderListingApprovalGateFixtureSchema>;
export type SourceFolderListingApprovalGateOutput = z.infer<typeof SourceFolderListingApprovalGateOutputSchema>;

export type SourceFolderListingApprovalGateBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderListingApprovalGateFixture;
  gates: SourceFolderListingApprovalGateOutput[];
  listingAllowedCount: number;
  listingPerformedCount: number;
  deniedListingCount: number;
  approvalReviewOkCount: number;
  sourceGateOwnerApprovedDryRunCount: number;
  scannedEntries: number;
  acceptedCandidates: number;
  rejectedEntries: number;
  skippedEntries: number;
  deniedListingReasonsCount: number;
  safetyWarningsCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function parseSourceFolderListingApprovalGateFixture(input: unknown): SourceFolderListingApprovalGateFixture {
  return SourceFolderListingApprovalGateFixtureSchema.parse(input);
}

export function evaluateSourceFolderListingApprovalGateFixture(
  fixture: SourceFolderListingApprovalGateFixture
): SourceFolderListingApprovalGateBatchResult {
  const gates = fixture.cases.map(evaluateSourceFolderListingApprovalGateCase);
  return {
    provider: "fake_content_engine",
    fixture,
    gates,
    listingAllowedCount: gates.filter((gate) => gate.listing_allowed).length,
    listingPerformedCount: gates.filter((gate) => gate.listing_performed).length,
    deniedListingCount: gates.filter((gate) => !gate.listing_allowed).length,
    approvalReviewOkCount: gates.filter((gate) => gate.approval_review_status === "approval_review_ok").length,
    sourceGateOwnerApprovedDryRunCount: gates.filter((gate) => gate.source_gate_status === "owner_approved_dry_run").length,
    scannedEntries: sum(gates.map((gate) => gate.scanned_entries)),
    acceptedCandidates: sum(gates.map((gate) => gate.accepted_candidates)),
    rejectedEntries: sum(gates.map((gate) => gate.rejected_entries)),
    skippedEntries: sum(gates.map((gate) => gate.skipped_entries)),
    deniedListingReasonsCount: sum(gates.map((gate) => gate.denied_listing_reasons.length)),
    safetyWarningsCount: sum(gates.map((gate) => gate.safety_warnings.length)),
    publicReadyCount: gates.filter((gate) => gate.public_ready).length,
    publishTrack: "blocked"
  };
}

export function evaluateSourceFolderListingApprovalGateCase(
  gateCase: SourceFolderListingApprovalGateCase
): SourceFolderListingApprovalGateOutput {
  const safeRoot = getReadOnlyIntakeSafeFixtureRoot();
  const normalizedSourceRoot = normalizeSourceRoot(gateCase.requested_source_root);
  const sourceGate = evaluateSourceFolderGateCase({
    case_id: `listing-gate-${gateCase.case_id}`,
    requested_source_id: gateCase.source_id,
    requested_source_root: gateCase.requested_source_root,
    requested_source_label: gateCase.source_label,
    approval_mode: gateCase.approval_mode,
    dry_run: gateCase.dry_run,
    read_only: gateCase.read_only,
    owner_approved: gateCase.owner_approved,
    approval_record_found: gateCase.approval_record_found,
    provider: gateCase.provider,
    requested_actions: gateCase.requested_actions,
    notes: gateCase.notes
  });
  const approvalReview = reviewSourceFolderApprovalRecord({
    source_id: gateCase.source_id,
    source_label: gateCase.source_label,
    requested_source_root: gateCase.requested_source_root,
    approval_mode: gateCase.approval_mode,
    approval_record_found: gateCase.approval_record_found,
    owner_approved: gateCase.owner_approved,
    approved_by: gateCase.approved_by,
    approved_at: gateCase.approved_at,
    approval_scope: gateCase.approval_scope,
    dry_run: gateCase.dry_run,
    read_only: gateCase.read_only,
    provider: gateCase.provider,
    requested_actions: gateCase.requested_actions,
    notes: gateCase.notes
  });
  const allowlistedRoot = normalizedSourceRoot === safeRoot;
  const deniedReasons = deniedListingReasons({
    gateCase,
    sourceGateStatus: sourceGate.gate_status,
    approvalReviewStatus: approvalReview.review_status,
    allowlistedRoot,
    normalizedSourceRoot,
    safeRoot
  });
  const listingAllowed = deniedReasons.length === 0;
  const intake = listingAllowed ? runReadOnlyIntakeDryRun({ sourceRoot: safeRoot }) : null;
  const safetyWarnings = [
    "Listing is dry-run/read-only and public readiness remains blocked.",
    "Only the approved safe repo fixture may be listed.",
    ...(intake?.safety_warnings ?? ["No filesystem listing/stat was performed for this denied source."])
  ];

  return SourceFolderListingApprovalGateOutputSchema.parse({
    listing_gate_id: `${LISTING_GATE_ID}-${gateCase.case_id}`,
    source_id: gateCase.source_id,
    source_label: gateCase.source_label,
    requested_source_root: gateCase.requested_source_root,
    dry_run: gateCase.dry_run,
    read_only: gateCase.read_only,
    approval_review_status: approvalReview.review_status,
    source_gate_status: sourceGate.gate_status,
    listing_allowed: listingAllowed,
    listing_performed: Boolean(intake),
    allowlisted_root: allowlistedRoot,
    scanned_entries: intake?.scanned_entries ?? 0,
    accepted_candidates: intake?.accepted_media_candidates ?? 0,
    rejected_entries: intake?.rejected_entries ?? 0,
    skipped_entries: intake?.skipped_entries ?? 0,
    listing_summary: {
      source_mode: intake?.source_mode ?? "not_listed",
      candidate_manifest_rows: intake?.candidate_manifest_rows.length ?? 0,
      validation_error_count: intake?.validation_errors.length ?? 0,
      extension_breakdown: intake?.extension_breakdown ?? {},
      orientation_hint_breakdown: intake?.orientation_hint_breakdown ?? {},
      listed_fixture_only: Boolean(intake) && intake.source_root === safeRoot
    },
    denied_listing_reasons: deniedReasons,
    safety_warnings: dedupeStrings(safetyWarnings),
    next_safe_actions: nextSafeActions(listingAllowed),
    public_ready: false,
    publish_track: "blocked"
  });
}

function deniedListingReasons(input: {
  gateCase: SourceFolderListingApprovalGateCase;
  sourceGateStatus: "blocked" | "manual_review_required" | "owner_approved_dry_run";
  approvalReviewStatus: "approval_review_ok" | "needs_owner_review" | "incomplete_approval" | "blocked_source";
  allowlistedRoot: boolean;
  normalizedSourceRoot: string;
  safeRoot: string;
}): string[] {
  const reasons: string[] = [];
  if (!input.gateCase.dry_run) reasons.push("dry_run must be true before listing.");
  if (!input.gateCase.read_only) reasons.push("read_only must be true before listing.");
  if (input.sourceGateStatus !== "owner_approved_dry_run") {
    reasons.push(`Phase 2J.10 source gate is ${input.sourceGateStatus}; listing denied.`);
  }
  if (input.approvalReviewStatus !== "approval_review_ok") {
    reasons.push(`Phase 2J.11 approval review is ${input.approvalReviewStatus}; listing denied.`);
  }
  if (!input.allowlistedRoot) {
    reasons.push(`Source root is not the safe fixture allowlist: ${input.safeRoot}.`);
  }
  if (input.normalizedSourceRoot !== input.safeRoot) {
    reasons.push("Only the Phase 2J.8 safe repo fixture path may be listed in Phase 2J.12.");
  }
  for (const action of requestedActions(input.gateCase.requested_actions)) {
    reasons.push(`Requested action is denied before listing: ${action}.`);
  }
  return dedupeStrings(reasons);
}

function requestedActions(actions: z.infer<typeof RequestedActionsSchema>): string[] {
  return Object.entries(actions)
    .filter(([, requested]) => requested)
    .map(([action]) => action);
}

function nextSafeActions(listingAllowed: boolean): string[] {
  if (listingAllowed) {
    return [
      "Keep listing limited to the safe repo fixture path.",
      "Do not open file contents, decode media, render, upload, publish, or mutate storage.",
      "Require a later owner-approved phase before any real source folder listing."
    ];
  }
  return [
    "Do not perform filesystem listing/stat for this denied source.",
    "Fix owner approval, source gate, approval review, allowlist, or requested action issues before retry.",
    "Keep real-looking paths as metadata strings only."
  ];
}

function normalizeSourceRoot(value: string): string {
  return value.trim().replaceAll("\\", "/").replace(/\/+$/g, "");
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values)];
}
