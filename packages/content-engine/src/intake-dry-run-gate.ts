import { z } from "zod";

const SourceModeSchema = z.enum(["metadata_fixture", "real_media_folder_request", "render_publish_request", "future_real_footage_config"]);
const GateStatusSchema = z.enum(["blocked", "dry_run_allowed", "manual_review_required"]);

const RequestedActionsSchema = z.object({
  media_scan_requested: z.boolean(),
  media_open_requested: z.boolean(),
  file_walk_requested: z.boolean(),
  file_stat_requested: z.boolean(),
  render_requested: z.boolean(),
  upload_requested: z.boolean(),
  publish_requested: z.boolean(),
  publish_package_requested: z.boolean(),
  storage_mutation_requested: z.boolean(),
  env_secret_requested: z.boolean(),
  server_command_requested: z.boolean(),
  docker_command_requested: z.boolean()
}).strict();

export const IntakeDryRunGateCaseSchema = z.object({
  case_id: z.string().min(1),
  source_mode: SourceModeSchema,
  source_fixture: z.string().min(1),
  dry_run: z.boolean(),
  provider: z.literal("fake_content_engine"),
  requested_actions: RequestedActionsSchema,
  metadata_path_strings: z.array(z.string().min(1)),
  notes: z.string().min(1)
}).strict();

export const IntakeDryRunGateFixtureSchema = z.object({
  fixture_version: z.literal("real-footage-intake-dry-run-gate-smoke-v1"),
  mode: z.literal("gate_only_metadata_fixture"),
  cases: z.array(IntakeDryRunGateCaseSchema).min(4)
}).strict();

export const IntakeDryRunGateOutputSchema = z.object({
  gate_id: z.string().min(1),
  source_mode: SourceModeSchema,
  source_fixture: z.string().min(1),
  dry_run: z.boolean(),
  media_scan_allowed: z.literal(false),
  media_open_allowed: z.literal(false),
  render_allowed: z.literal(false),
  upload_allowed: z.literal(false),
  publish_allowed: z.literal(false),
  gate_status: GateStatusSchema,
  gate_score: z.number().int().min(0).max(100),
  passed_checks: z.array(z.string().min(1)),
  failed_checks: z.array(z.string().min(1)),
  blocking_reasons: z.array(z.string().min(1)),
  manual_review_notes: z.array(z.string().min(1)),
  next_safe_actions: z.array(z.string().min(1)),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type IntakeDryRunGateCase = z.infer<typeof IntakeDryRunGateCaseSchema>;
export type IntakeDryRunGateFixture = z.infer<typeof IntakeDryRunGateFixtureSchema>;
export type IntakeDryRunGateOutput = z.infer<typeof IntakeDryRunGateOutputSchema>;

export type IntakeDryRunGateBatchResult = {
  provider: "fake_content_engine";
  fixture: IntakeDryRunGateFixture;
  gates: IntakeDryRunGateOutput[];
  dryRunAllowedCount: number;
  blockedCount: number;
  manualReviewRequiredCount: number;
  failedCheckCount: number;
  blockingReasonCount: number;
  mediaScanAllowedCount: number;
  mediaOpenAllowedCount: number;
  renderAllowedCount: number;
  uploadAllowedCount: number;
  publishAllowedCount: number;
  publicReadyCount: number;
  publishTrack: "blocked";
};

export function parseIntakeDryRunGateFixture(input: unknown): IntakeDryRunGateFixture {
  return IntakeDryRunGateFixtureSchema.parse(input);
}

export function evaluateIntakeDryRunGateFixture(fixture: IntakeDryRunGateFixture): IntakeDryRunGateBatchResult {
  const gates = fixture.cases.map(evaluateIntakeDryRunGateCase);
  return {
    provider: "fake_content_engine",
    fixture,
    gates,
    dryRunAllowedCount: gates.filter((gate) => gate.gate_status === "dry_run_allowed").length,
    blockedCount: gates.filter((gate) => gate.gate_status === "blocked").length,
    manualReviewRequiredCount: gates.filter((gate) => gate.gate_status === "manual_review_required").length,
    failedCheckCount: gates.reduce((sum, gate) => sum + gate.failed_checks.length, 0),
    blockingReasonCount: gates.reduce((sum, gate) => sum + gate.blocking_reasons.length, 0),
    mediaScanAllowedCount: gates.filter((gate) => gate.media_scan_allowed).length,
    mediaOpenAllowedCount: gates.filter((gate) => gate.media_open_allowed).length,
    renderAllowedCount: gates.filter((gate) => gate.render_allowed).length,
    uploadAllowedCount: gates.filter((gate) => gate.upload_allowed).length,
    publishAllowedCount: gates.filter((gate) => gate.publish_allowed).length,
    publicReadyCount: gates.filter((gate) => gate.public_ready).length,
    publishTrack: "blocked"
  };
}

export function evaluateIntakeDryRunGateCase(gateCase: IntakeDryRunGateCase): IntakeDryRunGateOutput {
  const passedChecks: string[] = [];
  const failedChecks: string[] = [];
  const blockingReasons: string[] = [];
  const manualReviewNotes: string[] = [];

  if (gateCase.provider === "fake_content_engine") passedChecks.push("fake_provider_required");
  if (gateCase.dry_run) passedChecks.push("dry_run_true");
  else {
    failedChecks.push("dry_run_false");
    blockingReasons.push("Intake gate requires dry_run true.");
  }

  addRequestedActionResults(gateCase, failedChecks, blockingReasons);

  if (gateCase.source_mode === "metadata_fixture") {
    passedChecks.push("metadata_fixture_source");
  }

  if (gateCase.source_mode === "future_real_footage_config") {
    passedChecks.push("future_config_is_metadata_only");
    manualReviewNotes.push("Future real-footage intake config is represented as metadata strings only and needs owner review before any file access.");
  }

  if (gateCase.source_mode === "real_media_folder_request") {
    failedChecks.push("real_media_folder_request");
    blockingReasons.push("Real media folder scan requests are blocked in Phase 2J.7.");
  }

  if (gateCase.source_mode === "render_publish_request") {
    failedChecks.push("render_publish_request");
    blockingReasons.push("Render/upload/publish requests are blocked in Phase 2J.7.");
  }

  const gateStatus = determineGateStatus(gateCase, failedChecks, manualReviewNotes);
  const gateScore = scoreGate(gateStatus, failedChecks.length, passedChecks.length);

  return IntakeDryRunGateOutputSchema.parse({
    gate_id: gateCase.case_id,
    source_mode: gateCase.source_mode,
    source_fixture: gateCase.source_fixture,
    dry_run: gateCase.dry_run,
    media_scan_allowed: false,
    media_open_allowed: false,
    render_allowed: false,
    upload_allowed: false,
    publish_allowed: false,
    gate_status: gateStatus,
    gate_score: gateScore,
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
  gateCase: IntakeDryRunGateCase,
  failedChecks: string[],
  blockingReasons: string[]
): void {
  const blockedRequests: Array<[keyof z.infer<typeof RequestedActionsSchema>, string]> = [
    ["media_scan_requested", "media scan request is blocked"],
    ["media_open_requested", "media open request is blocked"],
    ["file_walk_requested", "file walk request is blocked"],
    ["file_stat_requested", "file stat request is blocked"],
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
    if (gateCase.requested_actions[key]) {
      failedChecks.push(key);
      blockingReasons.push(reason);
    }
  }
}

function determineGateStatus(
  gateCase: IntakeDryRunGateCase,
  failedChecks: string[],
  manualReviewNotes: string[]
): z.infer<typeof GateStatusSchema> {
  if (failedChecks.length > 0) return "blocked";
  if (gateCase.source_mode === "future_real_footage_config" || manualReviewNotes.length > 0) return "manual_review_required";
  return "dry_run_allowed";
}

function scoreGate(status: z.infer<typeof GateStatusSchema>, failedCount: number, passedCount: number): number {
  if (status === "blocked") return Math.max(0, 40 - failedCount * 8);
  if (status === "manual_review_required") return Math.max(50, Math.min(75, 60 + passedCount * 3));
  return 90;
}

function nextSafeActions(status: z.infer<typeof GateStatusSchema>): string[] {
  if (status === "dry_run_allowed") {
    return [
      "Run metadata-only intake planning smoke.",
      "Keep media folder scans disabled.",
      "Prepare owner review notes before any real-media access."
    ];
  }
  if (status === "manual_review_required") {
    return [
      "Owner must approve exact future source folders and read-only handling before any real-media intake.",
      "Keep all path values as metadata strings until the next gate.",
      "Do not run scan, open, render, upload, publish, server, or Docker commands."
    ];
  }
  return [
    "Keep the request blocked.",
    "Remove scan/open/render/upload/publish/server/Docker/storage mutation requests.",
    "Return to metadata-only fixture mode."
  ];
}
