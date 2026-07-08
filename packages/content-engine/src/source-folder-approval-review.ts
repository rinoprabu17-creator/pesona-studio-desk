import { z } from "zod";
import { evaluateSourceFolderGateCase } from "./source-folder-gate.ts";

const APPROVAL_POLICY_VERSION = "source-folder-approval-review-v1";

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
const ReviewStatusSchema = z.enum(["approval_review_ok", "needs_owner_review", "blocked_source", "incomplete_approval"]);
const PathSafetyStatusSchema = z.enum(["allowlisted_safe_fixture", "manual_review_path", "unsafe_or_blocked"]);

export const SourceFolderApprovalRecordSchema = z.object({
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

export const SourceFolderApprovalReviewFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-approval-review-smoke-v1"),
  mode: z.literal("config_only_source_folder_approval_review"),
  records: z.array(SourceFolderApprovalRecordSchema).min(6)
}).strict();

export const SourceFolderApprovalRecordReviewSchema = z.object({
  source_id: z.string().min(1),
  source_label: z.string().min(1),
  requested_source_root: z.string().min(1),
  approval_record_found: z.boolean(),
  owner_approved: z.boolean(),
  approved_by: z.string().nullable(),
  approved_at: z.string().nullable(),
  approval_scope: z.string().nullable(),
  dry_run: z.boolean(),
  read_only: z.boolean(),
  allowlisted_root: z.boolean(),
  path_safety_status: PathSafetyStatusSchema,
  requested_actions: RequestedActionsSchema,
  denied_actions: z.array(z.string().min(1)),
  gate_status_from_phase_2j10: z.enum(["blocked", "manual_review_required", "owner_approved_dry_run"]),
  review_status: ReviewStatusSchema,
  missing_fields: z.array(z.string().min(1)),
  risk_notes: z.array(z.string().min(1)),
  recommended_action: z.string().min(1)
}).strict();

export const SourceFolderApprovalReviewResultSchema = z.object({
  review_id: z.string().min(1),
  approval_policy_version: z.literal(APPROVAL_POLICY_VERSION),
  reviewed_records: z.number().int().min(0),
  approved_records: z.number().int().min(0),
  manual_review_records: z.number().int().min(0),
  blocked_records: z.number().int().min(0),
  record_reviews: z.array(SourceFolderApprovalRecordReviewSchema),
  policy_findings: z.array(z.string().min(1)),
  missing_approval_fields: z.array(z.string().min(1)),
  unsafe_path_findings: z.array(z.string().min(1)),
  action_permission_findings: z.array(z.string().min(1)),
  recommended_owner_actions: z.array(z.string().min(1)),
  next_safe_actions: z.array(z.string().min(1)),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderApprovalRecord = z.infer<typeof SourceFolderApprovalRecordSchema>;
export type SourceFolderApprovalReviewFixture = z.infer<typeof SourceFolderApprovalReviewFixtureSchema>;
export type SourceFolderApprovalRecordReview = z.infer<typeof SourceFolderApprovalRecordReviewSchema>;
export type SourceFolderApprovalReviewResult = z.infer<typeof SourceFolderApprovalReviewResultSchema>;

export function parseSourceFolderApprovalReviewFixture(input: unknown): SourceFolderApprovalReviewFixture {
  return SourceFolderApprovalReviewFixtureSchema.parse(input);
}

export function reviewSourceFolderApprovals(fixture: SourceFolderApprovalReviewFixture): SourceFolderApprovalReviewResult {
  const recordReviews = fixture.records.map(reviewSourceFolderApprovalRecord);
  const missingApprovalFields = collectFindings(recordReviews, "missing_fields");
  const unsafePathFindings = recordReviews.flatMap((review) =>
    review.path_safety_status === "unsafe_or_blocked"
      ? [`${review.source_id}: gate ${review.gate_status_from_phase_2j10} for ${review.requested_source_root}`]
      : []
  );
  const actionPermissionFindings = recordReviews.flatMap((review) =>
    review.denied_actions.map((action) => `${review.source_id}: denied ${action}`)
  );
  const policyFindings = [
    `approval_policy_version:${APPROVAL_POLICY_VERSION}`,
    "public_ready:false",
    "publish_track:blocked",
    "phase_2j10_gate_cannot_be_upgraded"
  ];

  return SourceFolderApprovalReviewResultSchema.parse({
    review_id: "phase-2j11-source-folder-approval-review",
    approval_policy_version: APPROVAL_POLICY_VERSION,
    reviewed_records: recordReviews.length,
    approved_records: recordReviews.filter((review) => review.review_status === "approval_review_ok").length,
    manual_review_records: recordReviews.filter((review) =>
      review.review_status === "needs_owner_review" || review.review_status === "incomplete_approval"
    ).length,
    blocked_records: recordReviews.filter((review) => review.review_status === "blocked_source").length,
    record_reviews: recordReviews,
    policy_findings: policyFindings,
    missing_approval_fields: missingApprovalFields,
    unsafe_path_findings: unsafePathFindings,
    action_permission_findings: actionPermissionFindings,
    recommended_owner_actions: recommendedOwnerActions(recordReviews),
    next_safe_actions: [
      "Keep this review config-only.",
      "Do not scan, stat, walk, open, decode, render, upload, publish, or mutate real storage.",
      "Use a later owner-approved phase before any real source folder listing."
    ],
    public_ready: false,
    publish_track: "blocked"
  });
}

export function reviewSourceFolderApprovalRecord(record: SourceFolderApprovalRecord): SourceFolderApprovalRecordReview {
  const gate = evaluateSourceFolderGateCase({
    case_id: `approval-review-${record.source_id}`,
    requested_source_id: record.source_id,
    requested_source_root: record.requested_source_root,
    requested_source_label: record.source_label,
    approval_mode: record.approval_mode,
    dry_run: record.dry_run,
    read_only: record.read_only,
    owner_approved: record.owner_approved,
    approval_record_found: record.approval_record_found,
    provider: record.provider,
    requested_actions: record.requested_actions,
    notes: record.notes
  });
  const missingFields = missingApprovalFields(record);
  const deniedActions = deniedRequestedActions(record.requested_actions);
  const pathSafetyStatus = determinePathSafetyStatus(gate.source_root_allowlisted, gate.source_root_safe, gate.gate_status);
  const riskNotes = [
    ...gate.blocking_reasons,
    ...gate.manual_review_notes,
    ...missingFields.map((field) => `Missing approval field: ${field}.`),
    ...deniedActions.map((action) => `Requested action denied by approval review: ${action}.`)
  ];
  const reviewStatus = determineReviewStatus({
    gateStatus: gate.gate_status,
    missingFields,
    ownerApproved: record.owner_approved,
    approvalRecordFound: record.approval_record_found,
    deniedActions
  });

  return SourceFolderApprovalRecordReviewSchema.parse({
    source_id: record.source_id,
    source_label: record.source_label,
    requested_source_root: record.requested_source_root,
    approval_record_found: record.approval_record_found,
    owner_approved: record.owner_approved,
    approved_by: record.approved_by,
    approved_at: record.approved_at,
    approval_scope: record.approval_scope,
    dry_run: record.dry_run,
    read_only: record.read_only,
    allowlisted_root: gate.source_root_allowlisted,
    path_safety_status: pathSafetyStatus,
    requested_actions: record.requested_actions,
    denied_actions: deniedActions,
    gate_status_from_phase_2j10: gate.gate_status,
    review_status: reviewStatus,
    missing_fields: missingFields,
    risk_notes: dedupeStrings(riskNotes),
    recommended_action: recommendedAction(reviewStatus)
  });
}

function determineReviewStatus(input: {
  gateStatus: "blocked" | "manual_review_required" | "owner_approved_dry_run";
  missingFields: string[];
  ownerApproved: boolean;
  approvalRecordFound: boolean;
  deniedActions: string[];
}): z.infer<typeof ReviewStatusSchema> {
  if (input.gateStatus === "blocked" || input.deniedActions.length > 0) return "blocked_source";
  if (input.missingFields.length > 0) return "incomplete_approval";
  if (!input.ownerApproved || !input.approvalRecordFound || input.gateStatus === "manual_review_required") return "needs_owner_review";
  return "approval_review_ok";
}

function determinePathSafetyStatus(
  allowlistedRoot: boolean,
  sourceRootSafe: boolean,
  gateStatus: "blocked" | "manual_review_required" | "owner_approved_dry_run"
): z.infer<typeof PathSafetyStatusSchema> {
  if (allowlistedRoot && sourceRootSafe) return "allowlisted_safe_fixture";
  if (gateStatus === "manual_review_required") return "manual_review_path";
  return "unsafe_or_blocked";
}

function missingApprovalFields(record: SourceFolderApprovalRecord): string[] {
  const missing: string[] = [];
  if (!record.approval_record_found) missing.push("approval_record_found");
  if (!record.owner_approved) missing.push("owner_approved");
  if (!record.approved_by) missing.push("approved_by");
  if (!record.approved_at) missing.push("approved_at");
  if (!record.approval_scope) missing.push("approval_scope");
  if (!record.dry_run) missing.push("dry_run");
  if (!record.read_only) missing.push("read_only");
  return missing;
}

function deniedRequestedActions(actions: z.infer<typeof RequestedActionsSchema>): string[] {
  return Object.entries(actions)
    .filter(([, requested]) => requested)
    .map(([action]) => action);
}

function collectFindings(recordReviews: SourceFolderApprovalRecordReview[], key: "missing_fields"): string[] {
  return recordReviews.flatMap((review) => review[key].map((field) => `${review.source_id}: ${field}`));
}

function recommendedOwnerActions(recordReviews: SourceFolderApprovalRecordReview[]): string[] {
  const actions = [
    "Approve only the safe repo fixture source for config-only dry-run.",
    "Keep real-looking SSD, Google Drive, storage, backup, render, upload, and publish paths as metadata strings only.",
    "Do not approve render, upload, publish, decode, file-open, scan, stat, walk, server, Docker, env, or storage mutation actions in this phase."
  ];
  if (recordReviews.some((review) => review.review_status === "incomplete_approval")) {
    actions.push("Complete missing approved_by, approved_at, approval_scope, owner approval, dry-run, and read-only fields before any later review.");
  }
  if (recordReviews.some((review) => review.review_status === "blocked_source")) {
    actions.push("Replace blocked source paths or denied action requests before resubmitting for owner review.");
  }
  return actions;
}

function recommendedAction(status: z.infer<typeof ReviewStatusSchema>): string {
  if (status === "approval_review_ok") return "Keep as config-only approved dry-run; do not access any real folder.";
  if (status === "needs_owner_review") return "Collect explicit owner approval and approval record before any future intake.";
  if (status === "incomplete_approval") return "Complete approval metadata before considering this source again.";
  return "Keep blocked; remove unsafe path or forbidden action requests.";
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values)];
}
