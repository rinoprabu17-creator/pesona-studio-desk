import { spawn } from "node:child_process";
import { constants } from "node:fs";
import { access, mkdir, stat } from "node:fs/promises";
import { basename, join, resolve, sep } from "node:path";
import { query, withTransaction } from "./db.ts";
import type { DatabaseClient } from "./db.ts";
import { RenderAttemptError } from "./render-attempt-errors.ts";
import { assertUuid } from "./validation/library-validation.ts";
import { validateRenderAttemptOutputRelativePath } from "./validation/render-attempt-validation.ts";

export type RenderAttemptRow = {
  id: string;
  render_manifest_id: string;
  preflight_run_id: string;
  video_draft_job_id: string;
  content_item_id: string;
  attempt_status: string;
  attempt_mode: string;
  output_relative_path: string | null;
  output_size_bytes: number | null;
  ffmpeg_exit_code: number | null;
  ffmpeg_command_preview: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ControlledRenderContext = {
  manifest: RenderAttemptManifestSnapshot;
  latestPreflight: RenderAttemptPreflightSnapshot | null;
  eligibleItem: RenderAttemptItemSnapshot | null;
  eligibility: ControlledRenderEligibility;
  attempts: RenderAttemptRow[];
};

export type ControlledRenderEligibility = {
  ok: boolean;
  blocking_reasons: string[];
  source_relative_path: string | null;
  output_relative_path_preview: string | null;
};

export type FfmpegRunResult = {
  exitCode: number | null;
  errorMessage: string | null;
};

export type FfmpegRunner = (args: string[]) => Promise<FfmpegRunResult>;

export type ControlledRenderOptions = {
  storageRoot?: string;
  now?: Date;
  output_relative_path?: string;
  ffmpegRunner?: FfmpegRunner;
};

type RenderAttemptManifestSnapshot = {
  id: string;
  video_draft_job_id: string;
  content_item_id: string;
  script_plan_id: string;
  manifest_status: string;
  manifest_mode: string;
  target_format: string;
  content_code: string;
  content_title: string;
  job_status: string;
  render_mode: string;
};

type RenderAttemptPreflightSnapshot = {
  id: string;
  render_manifest_id: string;
  preflight_result: string;
  run_status: string;
  created_at: string;
};

type RenderAttemptItemSnapshot = {
  id: string;
  manifest_id: string;
  sequence_number: number;
  source_relative_path_snapshot: string | null;
  source_filename_snapshot: string | null;
};

const attemptSelect = `
  SELECT id,
         render_manifest_id,
         preflight_run_id,
         video_draft_job_id,
         content_item_id,
         attempt_status,
         attempt_mode,
         output_relative_path,
         output_size_bytes,
         ffmpeg_exit_code,
         ffmpeg_command_preview,
         error_message,
         started_at,
         completed_at,
         created_at,
         updated_at
  FROM video_render_attempts
`;

function mapAttempt(row: RenderAttemptRow): RenderAttemptRow {
  return {
    ...row,
    output_size_bytes: row.output_size_bytes === null ? null : Number(row.output_size_bytes),
    ffmpeg_exit_code: row.ffmpeg_exit_code === null ? null : Number(row.ffmpeg_exit_code)
  };
}

function storageRoot(options?: ControlledRenderOptions): string {
  return resolve(options?.storageRoot || process.env.APP_STORAGE_DIR || join(process.cwd(), "storage"));
}

export function isSafeRenderSourceRelativePath(value: string | null): boolean {
  if (!value) return false;
  return !value.startsWith("/") && !value.includes("\\") && !/(^|\/)\.\.($|\/)/.test(value);
}

function resolveInside(root: string, relativePath: string): string {
  const absoluteRoot = resolve(root);
  const absolutePath = resolve(absoluteRoot, relativePath);
  if (absolutePath !== absoluteRoot && !absolutePath.startsWith(`${absoluteRoot}${sep}`)) {
    throw new RenderAttemptError("unsafe_storage_path", "Path render keluar dari root storage yang diizinkan.", 400);
  }
  return absolutePath;
}

function truncateMessage(value: string | null | undefined, max = 2000): string | null {
  if (!value) return null;
  return value.length > max ? value.slice(0, max) : value;
}

function targetScaleFilter(targetFormat: string): string {
  if (targetFormat === "square_1_1") {
    return "scale=720:720:force_original_aspect_ratio=decrease,pad=720:720:(ow-iw)/2:(oh-ih)/2";
  }
  if (targetFormat === "horizontal_16_9") {
    return "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2";
  }
  return "scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2";
}

export function buildSafeFfmpegArgs(sourceAbsolutePath: string, outputAbsolutePath: string, options: { target_format?: string } = {}): string[] {
  return [
    "-hide_banner",
    "-loglevel",
    "error",
    "-n",
    "-i",
    sourceAbsolutePath,
    "-t",
    "10",
    "-vf",
    targetScaleFilter(options.target_format || "vertical_9_16"),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-an",
    outputAbsolutePath
  ];
}

function defaultFfmpegRunner(args: string[]): Promise<FfmpegRunResult> {
  return new Promise((resolveRun) => {
    const child = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
    let errorText = "";
    child.stderr.on("data", (chunk) => {
      errorText += String(chunk);
    });
    child.on("error", (error) => {
      resolveRun({ exitCode: null, errorMessage: error.message });
    });
    child.on("close", (code) => {
      resolveRun({ exitCode: code, errorMessage: code === 0 ? null : truncateMessage(errorText || `FFmpeg exit ${code}`) });
    });
  });
}

async function getManifestSnapshot(manifestId: string, client?: DatabaseClient): Promise<RenderAttemptManifestSnapshot> {
  const sql = `SELECT manifest.id,
                      manifest.video_draft_job_id,
                      manifest.content_item_id,
                      manifest.script_plan_id,
                      manifest.manifest_status,
                      manifest.manifest_mode,
                      manifest.target_format,
                      item.content_code,
                      item.title AS content_title,
                      job.job_status,
                      job.render_mode
               FROM video_render_manifests manifest
               JOIN video_draft_jobs job ON job.id = manifest.video_draft_job_id
               JOIN content_items item ON item.id = manifest.content_item_id
               JOIN content_item_script_plans plan ON plan.id = manifest.script_plan_id
               WHERE manifest.id = $1
                 AND job.content_item_id = manifest.content_item_id
                 AND job.script_plan_id = manifest.script_plan_id
                 AND plan.content_item_id = manifest.content_item_id`;
  const result = client
    ? await client.query<RenderAttemptManifestSnapshot>(sql, [manifestId])
    : { rows: await query<RenderAttemptManifestSnapshot>(sql, [manifestId]) };
  if (!result.rows[0]) {
    throw new RenderAttemptError("render_manifest_not_found", "Render manifest tidak ditemukan atau relasi tidak konsisten.", 404);
  }
  return result.rows[0];
}

async function getLatestPreflight(manifestId: string, client?: DatabaseClient): Promise<RenderAttemptPreflightSnapshot | null> {
  const sql = `SELECT id, render_manifest_id, preflight_result, run_status, created_at
               FROM video_render_preflight_runs
               WHERE render_manifest_id = $1
               ORDER BY created_at DESC, id DESC
               LIMIT 1`;
  const result = client
    ? await client.query<RenderAttemptPreflightSnapshot>(sql, [manifestId])
    : { rows: await query<RenderAttemptPreflightSnapshot>(sql, [manifestId]) };
  return result.rows[0] || null;
}

async function listAttemptItems(manifestId: string, client?: DatabaseClient): Promise<RenderAttemptItemSnapshot[]> {
  const sql = `SELECT id,
                      manifest_id,
                      sequence_number,
                      source_relative_path_snapshot,
                      source_filename_snapshot
               FROM video_render_manifest_items
               WHERE manifest_id = $1
               ORDER BY sequence_number ASC, created_at ASC`;
  const result = client
    ? await client.query<RenderAttemptItemSnapshot>(sql, [manifestId])
    : { rows: await query<RenderAttemptItemSnapshot>(sql, [manifestId]) };
  return result.rows.map((item) => ({ ...item, sequence_number: Number(item.sequence_number) }));
}

async function listAttempts(manifestId: string, client?: DatabaseClient): Promise<RenderAttemptRow[]> {
  const sql = `${attemptSelect}
               WHERE render_manifest_id = $1
               ORDER BY created_at DESC, id DESC`;
  const result = client
    ? await client.query<RenderAttemptRow>(sql, [manifestId])
    : { rows: await query<RenderAttemptRow>(sql, [manifestId]) };
  return result.rows.map(mapAttempt);
}

function makeOutputRelativePath(manifest: RenderAttemptManifestSnapshot, now: Date): string {
  const safeCode = manifest.content_code.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "content";
  const stamp = now.toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  return `smoke/${safeCode}-${manifest.id.slice(0, 8)}-${stamp}.mp4`;
}

async function outputExists(outputAbsolutePath: string): Promise<boolean> {
  try {
    await access(outputAbsolutePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function insertBlockedAttempt(
  manifest: RenderAttemptManifestSnapshot,
  preflight: RenderAttemptPreflightSnapshot,
  message: string,
  client?: DatabaseClient
): Promise<string> {
  const sql = `INSERT INTO video_render_attempts (
                 render_manifest_id,
                 preflight_run_id,
                 video_draft_job_id,
                 content_item_id,
                 attempt_status,
                 attempt_mode,
                 error_message,
                 completed_at
               )
               VALUES ($1, $2, $3, $4, 'blocked', 'manual_smoke', $5, now())
               RETURNING id`;
  const params = [manifest.id, preflight.id, manifest.video_draft_job_id, manifest.content_item_id, truncateMessage(message)];
  const result = client ? await client.query<{ id: string }>(sql, params) : { rows: await query<{ id: string }>(sql, params) };
  return result.rows[0].id;
}

export async function getRenderAttemptById(attemptId: string): Promise<RenderAttemptRow> {
  assertUuid(attemptId);
  const rows = await query<RenderAttemptRow>(
    `${attemptSelect}
     WHERE id = $1`,
    [attemptId]
  );
  if (!rows[0]) {
    throw new RenderAttemptError("render_attempt_not_found", "Render attempt tidak ditemukan.", 404);
  }
  return mapAttempt(rows[0]);
}

export async function listRenderAttemptsForManifest(manifestId: string): Promise<RenderAttemptRow[]> {
  assertUuid(manifestId);
  await getManifestSnapshot(manifestId);
  return listAttempts(manifestId);
}

export async function validateControlledRenderEligibility(
  manifestId: string,
  options: ControlledRenderOptions = {}
): Promise<ControlledRenderEligibility> {
  assertUuid(manifestId);
  const root = storageRoot(options);
  const footageRoot = join(root, "footage");
  const draftSmokeRoot = join(root, "draft-videos", "smoke");
  const manifest = await getManifestSnapshot(manifestId);
  const latestPreflight = await getLatestPreflight(manifestId);
  const items = await listAttemptItems(manifestId);
  const now = options.now || new Date();
  const outputRelativePath = validateRenderAttemptOutputRelativePath(options.output_relative_path || makeOutputRelativePath(manifest, now));
  const outputAbsolutePath = resolveInside(join(root, "draft-videos"), outputRelativePath);
  const reasons: string[] = [];

  if (!["reviewed", "approved"].includes(manifest.manifest_status)) {
    reasons.push("Render manifest harus reviewed atau approved.");
  }
  if (manifest.manifest_mode !== "metadata_only") {
    reasons.push("Render manifest harus metadata_only.");
  }
  if (!latestPreflight) {
    reasons.push("Render preflight ready belum tersedia.");
  } else if (latestPreflight.preflight_result !== "ready" || latestPreflight.run_status !== "completed") {
    reasons.push("Preflight terakhir belum ready.");
  }
  if (manifest.job_status === "cancelled" || manifest.job_status === "archived") {
    reasons.push("Video draft job dibatalkan atau diarsipkan.");
  }

  const eligibleItem = items.find((item) => isSafeRenderSourceRelativePath(item.source_relative_path_snapshot));
  if (!eligibleItem?.source_relative_path_snapshot) {
    reasons.push("Tidak ada manifest item dengan source footage snapshot yang aman.");
  } else {
    const sourceAbsolutePath = resolveInside(footageRoot, eligibleItem.source_relative_path_snapshot);
    try {
      const sourceStat = await stat(sourceAbsolutePath);
      if (!sourceStat.isFile()) {
        reasons.push("Source footage bukan file reguler.");
      }
    } catch {
      reasons.push("Source footage fisik tidak ditemukan di storage footage.");
    }
  }

  if (!outputAbsolutePath.startsWith(`${draftSmokeRoot}${sep}`) && outputAbsolutePath !== draftSmokeRoot) {
    reasons.push("Output render harus berada di folder draft smoke.");
  }
  if (await outputExists(outputAbsolutePath)) {
    reasons.push("Output render sudah ada; tidak boleh overwrite.");
  }

  return {
    ok: reasons.length === 0,
    blocking_reasons: reasons,
    source_relative_path: eligibleItem?.source_relative_path_snapshot || null,
    output_relative_path_preview: outputRelativePath
  };
}

export async function getControlledRenderContextForManifest(
  manifestId: string,
  options: ControlledRenderOptions = {}
): Promise<ControlledRenderContext> {
  assertUuid(manifestId);
  const manifest = await getManifestSnapshot(manifestId);
  const latestPreflight = await getLatestPreflight(manifestId);
  const items = await listAttemptItems(manifestId);
  const attempts = await listAttempts(manifestId);
  const eligibility = await validateControlledRenderEligibility(manifestId, options).catch((error) => ({
    ok: false,
    blocking_reasons: [error instanceof Error ? error.message : "Render tidak eligible."],
    source_relative_path: null,
    output_relative_path_preview: null
  }));
  const eligibleItem = items.find((item) => item.source_relative_path_snapshot === eligibility.source_relative_path) || null;
  return { manifest, latestPreflight, eligibleItem, eligibility, attempts };
}

export async function getControlledRenderContextForContentItem(
  contentItemId: string,
  jobId: string,
  manifestId: string,
  options: ControlledRenderOptions = {}
): Promise<ControlledRenderContext> {
  assertUuid(contentItemId);
  assertUuid(jobId);
  assertUuid(manifestId);
  const context = await getControlledRenderContextForManifest(manifestId, options);
  if (context.manifest.content_item_id !== contentItemId || context.manifest.video_draft_job_id !== jobId) {
    throw new RenderAttemptError("render_attempt_mismatch", "Render attempt tidak dimiliki konten dan video draft job ini.", 404);
  }
  return context;
}

export async function runControlledSmokeRenderForManifest(
  manifestId: string,
  options: ControlledRenderOptions = {}
): Promise<RenderAttemptRow> {
  assertUuid(manifestId);
  const root = storageRoot(options);
  const footageRoot = join(root, "footage");
  const draftRoot = join(root, "draft-videos");
  const draftSmokeRoot = join(draftRoot, "smoke");
  const ffmpegRunner = options.ffmpegRunner || defaultFfmpegRunner;
  const now = options.now || new Date();

  const setup = await withTransaction(async (client) => {
    const manifest = await getManifestSnapshot(manifestId, client);
    const latestPreflight = await getLatestPreflight(manifestId, client);
    if (!latestPreflight) {
      throw new RenderAttemptError("ready_preflight_required", "Render preflight ready wajib ada sebelum manual smoke render.", 400);
    }
    const items = await listAttemptItems(manifestId, client);
    const outputRelativePath = validateRenderAttemptOutputRelativePath(options.output_relative_path || makeOutputRelativePath(manifest, now));
    const eligibleItem = items.find((item) => isSafeRenderSourceRelativePath(item.source_relative_path_snapshot));
    const reasons: string[] = [];

    if (latestPreflight.preflight_result !== "ready" || latestPreflight.run_status !== "completed") {
      reasons.push("Preflight terakhir belum ready.");
    }
    if (!["reviewed", "approved"].includes(manifest.manifest_status)) {
      reasons.push("Render manifest harus reviewed atau approved.");
    }
    if (manifest.job_status === "cancelled" || manifest.job_status === "archived") {
      reasons.push("Video draft job dibatalkan atau diarsipkan.");
    }
    if (!eligibleItem?.source_relative_path_snapshot) {
      reasons.push("Tidak ada source footage snapshot yang aman.");
    }

    if (reasons.length > 0) {
      const blockedId = await insertBlockedAttempt(manifest, latestPreflight, reasons.join(" "), client);
      return { blockedId };
    }

    return { manifest, latestPreflight, eligibleItem: eligibleItem!, outputRelativePath };
  });

  if ("blockedId" in setup) {
    return getRenderAttemptById(setup.blockedId);
  }

  const sourceAbsolutePath = resolveInside(footageRoot, setup.eligibleItem.source_relative_path_snapshot!);
  const outputAbsolutePath = resolveInside(draftRoot, setup.outputRelativePath);
  const commandPreview = [
    "ffmpeg",
    "-i",
    `storage/footage/${setup.eligibleItem.source_relative_path_snapshot}`,
    "-t",
    "10",
    "storage/draft-videos/" + setup.outputRelativePath
  ].join(" ");

  try {
    const sourceStat = await stat(sourceAbsolutePath);
    if (!sourceStat.isFile()) {
      const blockedId = await insertBlockedAttempt(setup.manifest, setup.latestPreflight, "Source footage bukan file reguler.");
      return getRenderAttemptById(blockedId);
    }
  } catch {
    const blockedId = await insertBlockedAttempt(setup.manifest, setup.latestPreflight, "Source footage fisik tidak ditemukan di storage footage.");
    return getRenderAttemptById(blockedId);
  }

  if (await outputExists(outputAbsolutePath)) {
    const blockedId = await insertBlockedAttempt(setup.manifest, setup.latestPreflight, "Output render sudah ada; tidak boleh overwrite.");
    return getRenderAttemptById(blockedId);
  }

  await mkdir(draftSmokeRoot, { recursive: true });

  const attemptId = await withTransaction(async (client) => {
    const created = await client.query<{ id: string }>(
      `INSERT INTO video_render_attempts (
         render_manifest_id,
         preflight_run_id,
         video_draft_job_id,
         content_item_id,
         attempt_status,
         attempt_mode,
         output_relative_path,
         ffmpeg_command_preview,
         started_at
       )
       VALUES ($1, $2, $3, $4, 'running', 'manual_smoke', $5, $6, now())
       RETURNING id`,
      [
        setup.manifest.id,
        setup.latestPreflight.id,
        setup.manifest.video_draft_job_id,
        setup.manifest.content_item_id,
        setup.outputRelativePath,
        commandPreview
      ]
    );
    return created.rows[0].id;
  });

  const args = buildSafeFfmpegArgs(sourceAbsolutePath, outputAbsolutePath, { target_format: setup.manifest.target_format });
  const result = await ffmpegRunner(args);
  if (result.exitCode !== 0) {
    const rows = await query<{ id: string }>(
      `UPDATE video_render_attempts
       SET attempt_status = 'failed',
           ffmpeg_exit_code = $2,
           error_message = $3,
           completed_at = now(),
           updated_at = now()
       WHERE id = $1
       RETURNING id`,
      [attemptId, result.exitCode, truncateMessage(result.errorMessage || "FFmpeg gagal.")]
    );
    return getRenderAttemptById(rows[0].id);
  }

  const outputStat = await stat(outputAbsolutePath);
  const rows = await query<{ id: string }>(
    `UPDATE video_render_attempts
     SET attempt_status = 'succeeded',
         output_size_bytes = $2,
         ffmpeg_exit_code = 0,
         completed_at = now(),
         updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [attemptId, outputStat.size]
  );
  return getRenderAttemptById(rows[0].id);
}
