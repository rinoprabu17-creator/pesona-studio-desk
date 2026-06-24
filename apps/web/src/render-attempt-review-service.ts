import { constants } from "node:fs";
import { access, stat } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { query, withTransaction } from "./db.ts";
import type { DatabaseClient } from "./db.ts";
import { RenderAttemptReviewError } from "./render-attempt-review-errors.ts";
import { assertUuid } from "./validation/library-validation.ts";
import { validateRenderAttemptOutputRelativePath } from "./validation/render-attempt-validation.ts";
import { validateRenderAttemptReviewInput } from "./validation/render-attempt-review-validation.ts";

export type RenderAttemptReviewRow = {
  id: string;
  render_attempt_id: string;
  render_manifest_id: string;
  video_draft_job_id: string;
  content_item_id: string;
  review_status: string;
  review_note: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RenderAttemptReviewAttemptSnapshot = {
  id: string;
  render_manifest_id: string;
  preflight_run_id: string;
  video_draft_job_id: string;
  content_item_id: string;
  attempt_status: string;
  output_relative_path: string | null;
  output_size_bytes: number | null;
  ffmpeg_exit_code: number | null;
  error_message: string | null;
  created_at: string;
  manifest_status: string;
  content_code: string;
  content_title: string;
  job_status: string;
};

export type RenderAttemptReviewEligibility = {
  ok: boolean;
  blocking_reasons: string[];
  output_relative_path: string | null;
  output_exists: boolean;
  output_size_bytes: number | null;
};

export type RenderAttemptReviewContext = {
  attempt: RenderAttemptReviewAttemptSnapshot;
  review: RenderAttemptReviewRow | null;
  eligibility: RenderAttemptReviewEligibility;
};

const reviewSelect = `
  SELECT id,
         render_attempt_id,
         render_manifest_id,
         video_draft_job_id,
         content_item_id,
         review_status,
         review_note,
         reviewed_by_name,
         reviewed_at,
         created_at,
         updated_at
  FROM video_render_attempt_reviews
`;

function storageRoot(): string {
  return resolve(process.env.APP_STORAGE_DIR || join(process.cwd(), "storage"));
}

function resolveInside(root: string, relativePath: string): string {
  const absoluteRoot = resolve(root);
  const absolutePath = resolve(absoluteRoot, relativePath);
  if (absolutePath !== absoluteRoot && !absolutePath.startsWith(`${absoluteRoot}${sep}`)) {
    throw new RenderAttemptReviewError("unsafe_storage_path", "Path review keluar dari root storage yang diizinkan.", 400);
  }
  return absolutePath;
}

function mapAttempt(row: RenderAttemptReviewAttemptSnapshot): RenderAttemptReviewAttemptSnapshot {
  return {
    ...row,
    output_size_bytes: row.output_size_bytes === null ? null : Number(row.output_size_bytes),
    ffmpeg_exit_code: row.ffmpeg_exit_code === null ? null : Number(row.ffmpeg_exit_code)
  };
}

async function getAttemptSnapshot(attemptId: string, client?: DatabaseClient): Promise<RenderAttemptReviewAttemptSnapshot> {
  const sql = `SELECT attempt.id,
                      attempt.render_manifest_id,
                      attempt.preflight_run_id,
                      attempt.video_draft_job_id,
                      attempt.content_item_id,
                      attempt.attempt_status,
                      attempt.output_relative_path,
                      attempt.output_size_bytes,
                      attempt.ffmpeg_exit_code,
                      attempt.error_message,
                      attempt.created_at,
                      manifest.manifest_status,
                      item.content_code,
                      item.title AS content_title,
                      job.job_status
               FROM video_render_attempts attempt
               JOIN video_render_manifests manifest ON manifest.id = attempt.render_manifest_id
               JOIN video_draft_jobs job ON job.id = attempt.video_draft_job_id
               JOIN content_items item ON item.id = attempt.content_item_id
               WHERE attempt.id = $1
                 AND manifest.video_draft_job_id = attempt.video_draft_job_id
                 AND manifest.content_item_id = attempt.content_item_id
                 AND job.content_item_id = attempt.content_item_id`;
  const result = client
    ? await client.query<RenderAttemptReviewAttemptSnapshot>(sql, [attemptId])
    : { rows: await query<RenderAttemptReviewAttemptSnapshot>(sql, [attemptId]) };
  if (!result.rows[0]) {
    throw new RenderAttemptReviewError("render_attempt_not_found", "Render attempt tidak ditemukan atau relasi tidak konsisten.", 404);
  }
  return mapAttempt(result.rows[0]);
}

async function getReviewByAttemptId(attemptId: string, client?: DatabaseClient): Promise<RenderAttemptReviewRow | null> {
  const sql = `${reviewSelect} WHERE render_attempt_id = $1`;
  const result = client ? await client.query<RenderAttemptReviewRow>(sql, [attemptId]) : { rows: await query<RenderAttemptReviewRow>(sql, [attemptId]) };
  return result.rows[0] || null;
}

export async function getRenderAttemptReviewByAttemptId(attemptId: string): Promise<RenderAttemptReviewRow | null> {
  assertUuid(attemptId);
  await getAttemptSnapshot(attemptId);
  return getReviewByAttemptId(attemptId);
}

export async function listRenderAttemptReviewsForManifest(manifestId: string): Promise<RenderAttemptReviewRow[]> {
  assertUuid(manifestId);
  return query<RenderAttemptReviewRow>(
    `${reviewSelect}
     WHERE render_manifest_id = $1
     ORDER BY created_at DESC, id DESC`,
    [manifestId]
  );
}

export async function validateRenderAttemptReviewEligibility(attemptId: string): Promise<RenderAttemptReviewEligibility> {
  assertUuid(attemptId);
  const attempt = await getAttemptSnapshot(attemptId);
  const reasons: string[] = [];
  let outputExists = false;
  let outputSize: number | null = null;

  if (attempt.attempt_status !== "succeeded") {
    reasons.push("Hanya render attempt succeeded yang bisa direview.");
  }
  if (!attempt.output_relative_path) {
    reasons.push("Output render belum tersedia.");
  } else {
    try {
      const outputRelativePath = validateRenderAttemptOutputRelativePath(attempt.output_relative_path);
      const draftSmokeRoot = join(storageRoot(), "draft-videos", "smoke");
      const outputAbsolutePath = resolveInside(join(storageRoot(), "draft-videos"), outputRelativePath);
      if (!outputAbsolutePath.startsWith(`${draftSmokeRoot}${sep}`)) {
        reasons.push("Output review harus berada di folder draft smoke.");
      }
      await access(outputAbsolutePath, constants.F_OK);
      const outputStat = await stat(outputAbsolutePath);
      outputExists = true;
      outputSize = outputStat.size;
      if (!outputStat.isFile()) {
        reasons.push("Output render bukan file reguler.");
      }
      if (outputStat.size <= 0) {
        reasons.push("Output render kosong.");
      }
    } catch (error) {
      if (error instanceof RenderAttemptReviewError) throw error;
      reasons.push("Output render fisik tidak ditemukan di draft smoke.");
    }
  }
  if (attempt.output_size_bytes === null || attempt.output_size_bytes <= 0) {
    reasons.push("Metadata output render harus non-empty.");
  }

  return {
    ok: reasons.length === 0,
    blocking_reasons: reasons,
    output_relative_path: attempt.output_relative_path,
    output_exists: outputExists,
    output_size_bytes: outputSize
  };
}

export async function getRenderAttemptReviewContext(attemptId: string): Promise<RenderAttemptReviewContext> {
  assertUuid(attemptId);
  const attempt = await getAttemptSnapshot(attemptId);
  const review = await getReviewByAttemptId(attemptId);
  const eligibility = await validateRenderAttemptReviewEligibility(attemptId).catch((error) => ({
    ok: false,
    blocking_reasons: [error instanceof Error ? error.message : "Review tidak eligible."],
    output_relative_path: attempt.output_relative_path,
    output_exists: false,
    output_size_bytes: null
  }));
  return { attempt, review, eligibility };
}

export async function getRenderAttemptReviewContextForContentItem(
  contentItemId: string,
  jobId: string,
  manifestId: string,
  attemptId: string
): Promise<RenderAttemptReviewContext> {
  assertUuid(contentItemId);
  assertUuid(jobId);
  assertUuid(manifestId);
  assertUuid(attemptId);
  const context = await getRenderAttemptReviewContext(attemptId);
  if (
    context.attempt.content_item_id !== contentItemId ||
    context.attempt.video_draft_job_id !== jobId ||
    context.attempt.render_manifest_id !== manifestId
  ) {
    throw new RenderAttemptReviewError("render_attempt_review_mismatch", "Render attempt tidak dimiliki konten, job, dan manifest ini.", 404);
  }
  return context;
}

async function writeTerminalReview(attemptId: string, status: "approved" | "rejected", input: unknown): Promise<RenderAttemptReviewRow> {
  assertUuid(attemptId);
  const value = validateRenderAttemptReviewInput(input);
  const eligibility = await validateRenderAttemptReviewEligibility(attemptId);
  if (!eligibility.ok) {
    throw new RenderAttemptReviewError("render_attempt_not_reviewable", eligibility.blocking_reasons.join(" "), 400);
  }

  const reviewId = await withTransaction(async (client) => {
    const attempt = await getAttemptSnapshot(attemptId, client);
    const existing = await getReviewByAttemptId(attemptId, client);
    if (existing && existing.review_status !== "pending_review") {
      throw new RenderAttemptReviewError("render_attempt_review_terminal", "Review render sudah terminal dan tidak dapat diubah pada fase ini.", 409);
    }
    const sql = existing
      ? `UPDATE video_render_attempt_reviews
         SET review_status = $2,
             review_note = $3,
             reviewed_by_name = $4,
             reviewed_at = now(),
             updated_at = now()
         WHERE id = $1
         RETURNING id`
      : `INSERT INTO video_render_attempt_reviews (
           render_attempt_id,
           render_manifest_id,
           video_draft_job_id,
           content_item_id,
           review_status,
           review_note,
           reviewed_by_name,
           reviewed_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, now())
         RETURNING id`;
    const params = existing
      ? [existing.id, status, value.review_note, value.reviewed_by_name]
      : [
          attempt.id,
          attempt.render_manifest_id,
          attempt.video_draft_job_id,
          attempt.content_item_id,
          status,
          value.review_note,
          value.reviewed_by_name
        ];
    const result = await client.query<{ id: string }>(sql, params);
    return result.rows[0].id;
  });

  const rows = await query<RenderAttemptReviewRow>(`${reviewSelect} WHERE id = $1`, [reviewId]);
  return rows[0];
}

export function approveRenderAttempt(attemptId: string, input: unknown = {}): Promise<RenderAttemptReviewRow> {
  return writeTerminalReview(attemptId, "approved", input);
}

export function rejectRenderAttempt(attemptId: string, input: unknown = {}): Promise<RenderAttemptReviewRow> {
  return writeTerminalReview(attemptId, "rejected", input);
}
