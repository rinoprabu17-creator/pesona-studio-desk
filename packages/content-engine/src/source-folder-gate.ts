import { z } from "zod";

const SAFE_SOURCE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample";
const SENSITIVE_PATH_TOKENS = [
  "storage",
  "google drive",
  "gdrive",
  "drive",
  "backups",
  "dumps",
  "secrets",
  "env",
  "credentials",
  "production",
  "render",
  "upload",
  "publish",
  "ssd"
];

const ApprovalModeSchema = z.enum(["owner_approved_fixture_dry_run", "pending_owner_approval", "metadata_only_manual_review"]);
const GateStatusSchema = z.enum(["blocked", "manual_review_required", "owner_approved_dry_run"]);

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

export const SourceFolderGateCaseSchema = z.object({
  case_id: z.string().min(1),
  requested_source_id: z.string().min(1),
  requested_source_root: z.string().min(1),
  requested_source_label: z.string().min(1),
  approval_mode: ApprovalModeSchema,
  dry_run: z.boolean(),
  read_only: z.boolean(),
  owner_approved: z.boolean(),
  approval_record_found: z.boolean(),
  provider: z.literal("fake_content_engine"),
  requested_actions: RequestedActionsSchema,
  notes: z.string().min(1)
}).strict();

export const SourceFolderGateFixtureSchema = z.object({
  fixture_version: z.literal("source-folder-gate-smoke-v1"),
  mode: z.literal("config_only_source_folder_gate"),
  cases: z.array(SourceFolderGateCaseSchema).min(5)
}).strict();

export const SourceFolderGateOutputSchema = z.object({
  gate_id: z.string().min(1),
  requested_source_id: z.string().min(1),
  requested_source_root: z.string().min(1),
  requested_source_label: z.string().min(1),
  approval_mode: ApprovalModeSchema,
  dry_run: z.boolean(),
  read_only: z.boolean(),
  owner_approved: z.boolean(),
  approval_record_found: z.boolean(),
  source_root_allowlisted: z.boolean(),
  source_root_safe: z.boolean(),
  scan_allowed: z.literal(false),
  file_open_allowed: z.literal(false),
  decode_allowed: z.literal(false),
  render_allowed: z.literal(false),
  upload_allowed: z.literal(false),
  publish_allowed: z.literal(false),
  gate_status: GateStatusSchema,
  passed_checks: z.array(z.string().min(1)),
  failed_checks: z.array(z.string().min(1)),
  blocking_reasons: z.array(z.string().min(1)),
  manual_review_notes: z.array(z.string().min(1)),
  next_safe_actions: z.array(z.string().min(1)),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type SourceFolderGateCase = z.infer<typeof SourceFolderGateCaseSchema>;
export type SourceFolderGateFixture = z.infer<typeof SourceFolderGateFixtureSchema>;
export type SourceFolderGateOutput = z.infer<typeof SourceFolderGateOutputSchema>;

export type SourceFolderGateBatchResult = {
  provider: "fake_content_engine";
  fixture: SourceFolderGateFixture;
  gates: SourceFolderGateOutput[];
  ownerApprovedDryRunCount: number;
  manualReviewRequiredCount: number;
  blockedCount: number;
  ownerApprovedCount: number;
  approvalRecordFoundCount: number;
  allowlistedSourceCount: number;
  unsafeSourceCount: number;
  scanAllowedCount: number;
  fileOpenAllowedCount: number;
  decodeAllowedCount: number;
  renderAllowedCount: number;
  uploadAllowedCount: number;
  publishAllowedCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function getOwnerApprovedSourceFolderSafeFixtureRoot(): string {
  return SAFE_SOURCE_ROOT;
}

export function parseSourceFolderGateFixture(input: unknown): SourceFolderGateFixture {
  return SourceFolderGateFixtureSchema.parse(input);
}

export function evaluateSourceFolderGateFixture(fixture: SourceFolderGateFixture): SourceFolderGateBatchResult {
  const gates = fixture.cases.map(evaluateSourceFolderGateCase);
  return {
    provider: "fake_content_engine",
    fixture,
    gates,
    ownerApprovedDryRunCount: gates.filter((gate) => gate.gate_status === "owner_approved_dry_run").length,
    manualReviewRequiredCount: gates.filter((gate) => gate.gate_status === "manual_review_required").length,
    blockedCount: gates.filter((gate) => gate.gate_status === "blocked").length,
    ownerApprovedCount: gates.filter((gate) => gate.owner_approved).length,
    approvalRecordFoundCount: gates.filter((gate) => gate.approval_record_found).length,
    allowlistedSourceCount: gates.filter((gate) => gate.source_root_allowlisted).length,
    unsafeSourceCount: gates.filter((gate) => !gate.source_root_safe).length,
    scanAllowedCount: gates.filter((gate) => gate.scan_allowed).length,
    fileOpenAllowedCount: gates.filter((gate) => gate.file_open_allowed).length,
    decodeAllowedCount: gates.filter((gate) => gate.decode_allowed).length,
    renderAllowedCount: gates.filter((gate) => gate.render_allowed).length,
    uploadAllowedCount: gates.filter((gate) => gate.upload_allowed).length,
    publishAllowedCount: gates.filter((gate) => gate.publish_allowed).length,
    publicReadyCount: gates.filter((gate) => gate.public_ready).length,
    publishTrack: "blocked"
  };
}

export function evaluateSourceFolderGateCase(gateCase: SourceFolderGateCase): SourceFolderGateOutput {
  const passedChecks: string[] = [];
  const failedChecks: string[] = [];
  const blockingReasons: string[] = [];
  const manualReviewNotes: string[] = [];
  const sourceRoot = normalizeSourceRoot(gateCase.requested_source_root);
  const sourceRootAllowlisted = sourceRoot === SAFE_SOURCE_ROOT;
  const sourceSafetyFailures = validateSourceRootSafety(sourceRoot, gateCase.approval_mode);
  const sourceRootSafe = sourceSafetyFailures.length === 0;

  if (gateCase.provider === "fake_content_engine") passedChecks.push("fake_provider_required");
  if (gateCase.dry_run) passedChecks.push("dry_run_true");
  else addFailure("dry_run_false", "Source folder gate requires dry_run true.", failedChecks, blockingReasons);

  if (gateCase.read_only) passedChecks.push("read_only_true");
  else addFailure("read_only_false", "Source folder gate requires read_only true.", failedChecks, blockingReasons);

  if (gateCase.owner_approved) passedChecks.push("owner_approved_true");
  else manualReviewNotes.push("Owner approval is missing; keep this source blocked from intake.");

  if (gateCase.approval_record_found) passedChecks.push("approval_record_found");
  else manualReviewNotes.push("Approval record is missing; source needs owner review before any dry-run.");

  if (sourceRootAllowlisted) passedChecks.push("source_root_allowlisted");
  else manualReviewNotes.push("Source root is not the Phase 2J.8 safe fixture allowlist.");

  if (sourceRootSafe) passedChecks.push("source_root_safe");
  for (const failure of sourceSafetyFailures) addFailure(failure.check, failure.reason, failedChecks, blockingReasons);

  addRequestedActionResults(gateCase, failedChecks, blockingReasons);

  if (gateCase.owner_approved && gateCase.approval_record_found && sourceRootAllowlisted && sourceRootSafe) {
    passedChecks.push("owner_approved_fixture_config_only");
  }

  const gateStatus = determineGateStatus({
    gateCase,
    sourceRootAllowlisted,
    sourceRootSafe,
    failedChecks,
    manualReviewNotes
  });

  return SourceFolderGateOutputSchema.parse({
    gate_id: gateCase.case_id,
    requested_source_id: gateCase.requested_source_id,
    requested_source_root: gateCase.requested_source_root,
    requested_source_label: gateCase.requested_source_label,
    approval_mode: gateCase.approval_mode,
    dry_run: gateCase.dry_run,
    read_only: gateCase.read_only,
    owner_approved: gateCase.owner_approved,
    approval_record_found: gateCase.approval_record_found,
    source_root_allowlisted: sourceRootAllowlisted,
    source_root_safe: sourceRootSafe,
    scan_allowed: false,
    file_open_allowed: false,
    decode_allowed: false,
    render_allowed: false,
    upload_allowed: false,
    publish_allowed: false,
    gate_status: gateStatus,
    passed_checks: passedChecks,
    failed_checks: failedChecks,
    blocking_reasons: blockingReasons,
    manual_review_notes: manualReviewNotes,
    next_safe_actions: nextSafeActions(gateStatus),
    public_ready: false,
    publish_track: "blocked"
  });
}

function addRequestedActionResults(
  gateCase: SourceFolderGateCase,
  failedChecks: string[],
  blockingReasons: string[]
): void {
  const blockedRequests: Array<[keyof z.infer<typeof RequestedActionsSchema>, string]> = [
    ["scan_requested", "scan request is blocked in Phase 2J.10"],
    ["file_open_requested", "file open request is blocked"],
    ["decode_requested", "media decode request is blocked"],
    ["render_requested", "render request is blocked"],
    ["upload_requested", "upload request is blocked"],
    ["publish_requested", "publish request is blocked"],
    ["publish_package_requested", "publish package request is blocked"],
    ["storage_mutation_requested", "storage mutation request is blocked"],
    ["env_secret_requested", "env/secret request is blocked"],
    ["server_command_requested", "server command request is blocked"],
    ["docker_command_requested", "Docker command request is blocked"]
  ];
  for (const [key, reason] of blockedRequests) {
    if (gateCase.requested_actions[key]) addFailure(key, reason, failedChecks, blockingReasons);
  }
}

function determineGateStatus(input: {
  gateCase: SourceFolderGateCase;
  sourceRootAllowlisted: boolean;
  sourceRootSafe: boolean;
  failedChecks: string[];
  manualReviewNotes: string[];
}): z.infer<typeof GateStatusSchema> {
  if (input.failedChecks.length > 0) return "blocked";
  if (
    input.gateCase.owner_approved &&
    input.gateCase.approval_record_found &&
    input.gateCase.dry_run &&
    input.gateCase.read_only &&
    input.sourceRootAllowlisted &&
    input.sourceRootSafe
  ) {
    return "owner_approved_dry_run";
  }
  return "manual_review_required";
}

function validateSourceRootSafety(
  sourceRoot: string,
  approvalMode: z.infer<typeof ApprovalModeSchema>
): Array<{ check: string; reason: string }> {
  const failures: Array<{ check: string; reason: string }> = [];
  const lowerRoot = sourceRoot.toLowerCase();
  const isManualReviewOnly = approvalMode === "metadata_only_manual_review";

  if ((sourceRoot.startsWith("/") || /^[a-z]:/i.test(sourceRoot)) && !isManualReviewOnly) {
    failures.push({ check: "absolute_path_blocked", reason: "Absolute paths are blocked unless represented as metadata-only manual review cases." });
  }
  if (sourceRoot.split(/[\\/]/).includes("..")) {
    failures.push({ check: "parent_traversal_blocked", reason: "Parent traversal is blocked." });
  }
  for (const token of SENSITIVE_PATH_TOKENS) {
    if (lowerRoot.includes(token)) {
      failures.push({ check: `sensitive_path_token_${normalizeCheckToken(token)}`, reason: `Sensitive path token is blocked: ${token}.` });
    }
  }
  if (sourceRoot !== SAFE_SOURCE_ROOT && !isManualReviewOnly) {
    failures.push({ check: "source_not_allowlisted", reason: "Only the Phase 2J.8 safe repo fixture source is allowlisted in this phase." });
  }
  return dedupeFailures(failures);
}

function addFailure(
  check: string,
  reason: string,
  failedChecks: string[],
  blockingReasons: string[]
): void {
  failedChecks.push(check);
  blockingReasons.push(reason);
}

function nextSafeActions(status: z.infer<typeof GateStatusSchema>): string[] {
  if (status === "owner_approved_dry_run") {
    return [
      "Keep the source at config-only owner-approved dry-run status.",
      "Do not scan, open, decode, render, upload, publish, or mutate storage.",
      "Use a later owner-approved phase before any real source folder listing."
    ];
  }
  if (status === "manual_review_required") {
    return [
      "Collect explicit owner approval and approval record details.",
      "Keep real-looking paths as metadata strings only.",
      "Do not access source folders until a later approved read-only phase."
    ];
  }
  return [
    "Keep this source blocked.",
    "Remove unsafe paths or blocked action requests.",
    "Return to the Phase 2J.8 safe fixture path for config-only dry-run."
  ];
}

function normalizeSourceRoot(value: string): string {
  return value.trim().replaceAll("\\", "/").replace(/\/+$/g, "");
}

function normalizeCheckToken(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function dedupeFailures(
  failures: Array<{ check: string; reason: string }>
): Array<{ check: string; reason: string }> {
  const seen = new Set<string>();
  return failures.filter((failure) => {
    const key = `${failure.check}:${failure.reason}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
