import { lstatSync, readdirSync } from "node:fs";
import { basename, extname, relative, resolve, sep } from "node:path";
import { z } from "zod";
import { evaluateIntakeDryRunGateCase, type IntakeDryRunGateOutput } from "./intake-dry-run-gate.ts";

const SAFE_FIXTURE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample";
const MEDIA_EXTENSIONS = new Set([".mp4", ".mov", ".jpg", ".jpeg"]);
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
  "publish"
];

export const ReadOnlyIntakeCandidateRowSchema = z.object({
  footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  extension: z.string().min(1),
  product_family_guess: z.string().min(1),
  process_stage_guess: z.string().min(1),
  orientation_hint: z.enum(["vertical", "horizontal", "square", "unknown"]),
  risk_flags_guess: z.array(z.string().min(1)),
  usable_guess: z.boolean(),
  duration_sec: z.null(),
  notes: z.string().min(1)
}).strict();

export const ReadOnlyIntakeResultSchema = z.object({
  intake_id: z.string().min(1),
  source_mode: z.literal("safe_repo_fixture"),
  source_root: z.string().min(1),
  dry_run: z.literal(true),
  read_only: z.literal(true),
  allowlisted_root: z.boolean(),
  scanned_entries: z.number().int().min(0),
  accepted_media_candidates: z.number().int().min(0),
  rejected_entries: z.number().int().min(0),
  skipped_entries: z.number().int().min(0),
  extension_breakdown: z.record(z.string(), z.number().int().min(0)),
  orientation_hint_breakdown: z.record(z.string(), z.number().int().min(0)),
  candidate_manifest_rows: z.array(ReadOnlyIntakeCandidateRowSchema),
  validation_errors: z.array(z.string().min(1)),
  safety_warnings: z.array(z.string().min(1)),
  gate_status: z.enum(["blocked", "dry_run_allowed", "manual_review_required"]),
  public_ready: z.literal(false),
  publish_track: z.literal("blocked")
}).strict();

export type ReadOnlyIntakeCandidateRow = z.infer<typeof ReadOnlyIntakeCandidateRowSchema>;
export type ReadOnlyIntakeResult = z.infer<typeof ReadOnlyIntakeResultSchema>;

export function runReadOnlyIntakeDryRun(input: {
  sourceRoot: string;
  projectRoot?: string;
}): ReadOnlyIntakeResult {
  const projectRoot = input.projectRoot ? resolve(input.projectRoot) : process.cwd();
  const sourceRoot = normalizeRelativePath(input.sourceRoot);
  const validationErrors = validateSourceRoot(sourceRoot);
  const allowlistedRoot = sourceRoot === SAFE_FIXTURE_ROOT && validationErrors.length === 0;
  const gate = evaluateGate({ sourceRoot, allowlistedRoot });
  const safetyWarnings = [
    "Controlled fixture directory listing/stat only; no media file content is opened.",
    "Candidate metadata is derived from filenames only.",
    "Duration is unknown because no media decoding occurs."
  ];

  if (!allowlistedRoot || gate.gate_status !== "dry_run_allowed") {
    return ReadOnlyIntakeResultSchema.parse({
      intake_id: "phase-2j8-read-only-intake-dry-run",
      source_mode: "safe_repo_fixture",
      source_root: sourceRoot,
      dry_run: true,
      read_only: true,
      allowlisted_root: allowlistedRoot,
      scanned_entries: 0,
      accepted_media_candidates: 0,
      rejected_entries: 0,
      skipped_entries: 0,
      extension_breakdown: {},
      orientation_hint_breakdown: {},
      candidate_manifest_rows: [],
      validation_errors: validationErrors.length > 0 ? validationErrors : gate.blocking_reasons,
      safety_warnings: safetyWarnings,
      gate_status: gate.gate_status,
      public_ready: false,
      publish_track: "blocked"
    });
  }

  const absoluteRoot = resolve(projectRoot, sourceRoot);
  const entries = readdirSync(absoluteRoot, { withFileTypes: true });
  const candidates: ReadOnlyIntakeCandidateRow[] = [];
  const extensionBreakdown: Record<string, number> = {};
  const orientationBreakdown: Record<string, number> = {};
  let rejectedEntries = 0;
  let skippedEntries = 0;

  for (const entry of entries) {
    const entryPath = resolve(absoluteRoot, entry.name);
    const relativePath = normalizeRelativePath(relative(projectRoot, entryPath));
    const stat = lstatSync(entryPath);
    const extension = extname(entry.name).toLowerCase() || "no_extension";
    extensionBreakdown[extension] = (extensionBreakdown[extension] || 0) + 1;

    if (stat.isSymbolicLink() || entry.isDirectory()) {
      skippedEntries += 1;
      continue;
    }

    if (!MEDIA_EXTENSIONS.has(extension)) {
      rejectedEntries += 1;
      continue;
    }

    const row = buildCandidateRow(entry.name, relativePath, extension);
    orientationBreakdown[row.orientation_hint] = (orientationBreakdown[row.orientation_hint] || 0) + 1;
    candidates.push(row);
  }

  return ReadOnlyIntakeResultSchema.parse({
    intake_id: "phase-2j8-read-only-intake-dry-run",
    source_mode: "safe_repo_fixture",
    source_root: sourceRoot,
    dry_run: true,
    read_only: true,
    allowlisted_root: true,
    scanned_entries: entries.length,
    accepted_media_candidates: candidates.length,
    rejected_entries: rejectedEntries,
    skipped_entries: skippedEntries,
    extension_breakdown: extensionBreakdown,
    orientation_hint_breakdown: orientationBreakdown,
    candidate_manifest_rows: candidates,
    validation_errors: validationErrors,
    safety_warnings: safetyWarnings,
    gate_status: gate.gate_status,
    public_ready: false,
    publish_track: "blocked"
  });
}

export function getReadOnlyIntakeSafeFixtureRoot(): string {
  return SAFE_FIXTURE_ROOT;
}

function evaluateGate(input: {
  sourceRoot: string;
  allowlistedRoot: boolean;
}): IntakeDryRunGateOutput {
  return evaluateIntakeDryRunGateCase({
    case_id: "phase-2j8-read-only-intake-gate",
    source_mode: input.allowlistedRoot ? "metadata_fixture" : "future_real_footage_config",
    source_fixture: input.sourceRoot,
    dry_run: true,
    provider: "fake_content_engine",
    requested_actions: {
      media_scan_requested: false,
      media_open_requested: false,
      file_walk_requested: false,
      file_stat_requested: false,
      render_requested: false,
      upload_requested: false,
      publish_requested: false,
      publish_package_requested: false,
      storage_mutation_requested: false,
      env_secret_requested: false,
      server_command_requested: false,
      docker_command_requested: false
    },
    metadata_path_strings: [input.sourceRoot],
    notes: "Read-only intake dry-run gate. Directory listing/stat may occur only for the safe repo fixture path."
  });
}

function validateSourceRoot(sourceRoot: string): string[] {
  const errors: string[] = [];
  const lowerRoot = sourceRoot.toLowerCase();
  if (sourceRoot.startsWith("/") || /^[a-z]:/i.test(sourceRoot)) errors.push("absolute paths are blocked by default");
  if (sourceRoot.split(/[\\/]/).includes("..")) errors.push("parent traversal is blocked");
  for (const token of SENSITIVE_PATH_TOKENS) {
    if (lowerRoot.includes(token)) errors.push(`sensitive path token blocked: ${token}`);
  }
  if (sourceRoot !== SAFE_FIXTURE_ROOT) errors.push("source root is not the Phase 2J.8 safe repo fixture allowlist");
  return Array.from(new Set(errors));
}

function buildCandidateRow(filename: string, relativePath: string, extension: string): ReadOnlyIntakeCandidateRow {
  const token = normalizeToken(basename(filename, extension));
  const riskFlags = riskFlagsFromToken(token);
  return ReadOnlyIntakeCandidateRowSchema.parse({
    footage_id: token,
    filename,
    relative_path: relativePath,
    extension,
    product_family_guess: productFamilyFromToken(token),
    process_stage_guess: processStageFromToken(token),
    orientation_hint: orientationFromToken(token),
    risk_flags_guess: riskFlags,
    usable_guess: riskFlags.length === 0,
    duration_sec: null,
    notes: "Filename-only dry-run candidate. No media content was opened or decoded."
  });
}

function productFamilyFromToken(token: string): string {
  if (token.includes("map_ijazah")) return "map_ijazah";
  if (token.startsWith("sr_") || token.includes("sampul_raport")) return "sampul_raport";
  return "unknown";
}

function processStageFromToken(token: string): string {
  if (token.includes("product_closeup")) return "product_closeup";
  if (token.includes("foil") || token.includes("poly")) return "foil_emboss_poly";
  if (token.includes("packing") || token.includes("qc")) return "packing_qc";
  if (token.includes("delivery")) return "delivery_ready";
  if (token.includes("mockup") || token.includes("desain_gratis")) return "mockup_preview";
  if (token.includes("cover_assembly")) return "cover_assembly";
  if (token.includes("penamaan")) return "penamaan_process";
  return "unknown";
}

function orientationFromToken(token: string): "vertical" | "horizontal" | "square" | "unknown" {
  if (token.includes("vertical")) return "vertical";
  if (token.includes("horizontal")) return "horizontal";
  if (token.includes("square")) return "square";
  return "unknown";
}

function riskFlagsFromToken(token: string): string[] {
  const flags: string[] = [];
  if (token.includes("privacy")) flags.push("privacy_review_needed");
  if (token.includes("blurry")) flags.push("blurry");
  if (token.includes("placeholder")) flags.push("placeholder");
  if (token.includes("unrelated")) flags.push("unrelated_content");
  return flags;
}

function normalizeRelativePath(value: string): string {
  return value.replaceAll("\\", "/").split(sep).join("/");
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
