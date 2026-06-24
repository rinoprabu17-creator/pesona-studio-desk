import { constants, createReadStream } from "node:fs";
import { access, copyFile, mkdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { basename, join, parse, resolve, sep } from "node:path";
import { query, withTransaction } from "./db.ts";
import type { DatabaseClient } from "./db.ts";
import { RenderApprovedPromotionError } from "./render-approved-promotion-errors.ts";
import { assertUuid } from "./validation/library-validation.ts";
import { validateRenderAttemptOutputRelativePath } from "./validation/render-attempt-validation.ts";
import { validateRenderApprovedPromotionInput } from "./validation/render-approved-promotion-validation.ts";

export type RenderApprovedPromotionRow = {
  id: string;
  render_attempt_review_id: string;
  render_attempt_id: string;
  render_manifest_id: string;
  video_draft_job_id: string;
  content_item_id: string;
  promotion_status: string;
  promotion_mode: string;
  source_output_relative_path: string;
  approved_output_relative_path: string | null;
  source_size_bytes: number | null;
  approved_size_bytes: number | null;
  source_sha256: string | null;
  approved_sha256: string | null;
  promoted_by_name: string | null;
  promotion_note: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RenderApprovedPromotionAttemptSnapshot = {
  id: string;
  render_manifest_id: string;
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

export type RenderApprovedPromotionReviewSnapshot = {
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

export type RenderApprovedPromotionEligibility = {
  ok: boolean;
  blocking_reasons: string[];
  source_output_relative_path: string | null;
  approved_output_relative_path_preview: string | null;
  source_exists: boolean;
  source_size_bytes: number | null;
  existing_promotion_status: string | null;
};

export type RenderApprovedPromotionContext = {
  attempt: RenderApprovedPromotionAttemptSnapshot;
  review: RenderApprovedPromotionReviewSnapshot | null;
  promotion: RenderApprovedPromotionRow | null;
  eligibility: RenderApprovedPromotionEligibility;
};

const promotionSelect = `
  SELECT id,
         render_attempt_review_id,
         render_attempt_id,
         render_manifest_id,
         video_draft_job_id,
         content_item_id,
         promotion_status,
         promotion_mode,
         source_output_relative_path,
         approved_output_relative_path,
         source_size_bytes,
         approved_size_bytes,
         source_sha256,
         approved_sha256,
         promoted_by_name,
         promotion_note,
         error_message,
         started_at,
         completed_at,
         created_at,
         updated_at
  FROM video_render_approved_promotions
`;

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
    throw new RenderApprovedPromotionError("unsafe_storage_path", "Path promosi keluar dari root storage yang diizinkan.", 400);
  }
  return absolutePath;
}

function mapAttempt(row: RenderApprovedPromotionAttemptSnapshot): RenderApprovedPromotionAttemptSnapshot {
  return {
    ...row,
    output_size_bytes: row.output_size_bytes === null ? null : Number(row.output_size_bytes),
    ffmpeg_exit_code: row.ffmpeg_exit_code === null ? null : Number(row.ffmpeg_exit_code)
  };
}

function mapPromotion(row: RenderApprovedPromotionRow): RenderApprovedPromotionRow {
  return {
    ...row,
    source_size_bytes: row.source_size_bytes === null ? null : Number(row.source_size_bytes),
    approved_size_bytes: row.approved_size_bytes === null ? null : Number(row.approved_size_bytes)
  };
}

async function getAttemptSnapshot(attemptId: string, client?: DatabaseClient): Promise<RenderApprovedPromotionAttemptSnapshot> {
  const sql = `SELECT attempt.id,
                      attempt.render_manifest_id,
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
    ? await client.query<RenderApprovedPromotionAttemptSnapshot>(sql, [attemptId])
    : { rows: await query<RenderApprovedPromotionAttemptSnapshot>(sql, [attemptId]) };
  if (!result.rows[0]) {
    throw new RenderApprovedPromotionError("render_attempt_not_found", "Render attempt tidak ditemukan atau relasi tidak konsisten.", 404);
  }
  return mapAttempt(result.rows[0]);
}

async function getReviewByAttemptId(attemptId: string, client?: DatabaseClient): Promise<RenderApprovedPromotionReviewSnapshot | null> {
  const sql = `${reviewSelect} WHERE render_attempt_id = $1`;
  const result = client
    ? await client.query<RenderApprovedPromotionReviewSnapshot>(sql, [attemptId])
    : { rows: await query<RenderApprovedPromotionReviewSnapshot>(sql, [attemptId]) };
  return result.rows[0] || null;
}

async function getPromotionByAttemptId(attemptId: string, client?: DatabaseClient): Promise<RenderApprovedPromotionRow | null> {
  const sql = `${promotionSelect} WHERE render_attempt_id = $1`;
  const result = client
    ? await client.query<RenderApprovedPromotionRow>(sql, [attemptId])
    : { rows: await query<RenderApprovedPromotionRow>(sql, [attemptId]) };
  return result.rows[0] ? mapPromotion(result.rows[0]) : null;
}

function makeApprovedOutputRelativePath(attempt: RenderApprovedPromotionAttemptSnapshot, sourceRelativePath: string, now: Date): string {
  const sourceBase = parse(basename(sourceRelativePath)).name;
  const safeBase = sourceBase.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "draft";
  const safeCode = attempt.content_code.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "content";
  const stamp = now.toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  return `smoke/${safeCode}-${safeBase}-${attempt.id.slice(0, 8)}-approved-${stamp}.mp4`;
}

async function fileSha256(path: string): Promise<string> {
  const hash = createHash("sha256");
  await new Promise<void>((resolvePromise, reject) => {
    const stream = createReadStream(path);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolvePromise);
  });
  return hash.digest("hex");
}

export async function getRenderApprovedPromotionByAttemptId(attemptId: string): Promise<RenderApprovedPromotionRow | null> {
  assertUuid(attemptId);
  await getAttemptSnapshot(attemptId);
  return getPromotionByAttemptId(attemptId);
}

export async function listRenderApprovedPromotionsForManifest(manifestId: string): Promise<RenderApprovedPromotionRow[]> {
  assertUuid(manifestId);
  const rows = await query<RenderApprovedPromotionRow>(
    `${promotionSelect}
     WHERE render_manifest_id = $1
     ORDER BY created_at DESC, id DESC`,
    [manifestId]
  );
  return rows.map(mapPromotion);
}

export async function validateRenderApprovedPromotionEligibility(attemptId: string): Promise<RenderApprovedPromotionEligibility> {
  assertUuid(attemptId);
  const attempt = await getAttemptSnapshot(attemptId);
  const review = await getReviewByAttemptId(attemptId);
  const promotion = await getPromotionByAttemptId(attemptId);
  const reasons: string[] = [];
  let sourceExists = false;
  let sourceSize: number | null = null;
  let sourceRelativePath: string | null = null;
  let approvedPreview: string | null = null;

  if (!review) {
    reasons.push("Review render belum ada.");
  } else if (review.review_status !== "approved") {
    reasons.push("Hanya review approved yang bisa dipromosikan.");
  }
  if (promotion) {
    reasons.push("Render attempt ini sudah memiliki promotion row.");
  }
  if (attempt.attempt_status !== "succeeded") {
    reasons.push("Hanya render attempt succeeded yang bisa dipromosikan.");
  }
  if (!attempt.output_relative_path) {
    reasons.push("Output draft render belum tersedia.");
  } else {
    try {
      sourceRelativePath = validateRenderAttemptOutputRelativePath(attempt.output_relative_path);
      const draftSmokeRoot = join(storageRoot(), "draft-videos", "smoke");
      const sourceAbsolutePath = resolveInside(join(storageRoot(), "draft-videos"), sourceRelativePath);
      if (!sourceAbsolutePath.startsWith(`${draftSmokeRoot}${sep}`)) {
        reasons.push("Source draft harus berada di folder draft smoke.");
      }
      await access(sourceAbsolutePath, constants.F_OK);
      const sourceStat = await stat(sourceAbsolutePath);
      sourceExists = true;
      sourceSize = sourceStat.size;
      if (!sourceStat.isFile()) {
        reasons.push("Source draft bukan file reguler.");
      }
      if (sourceStat.size <= 0) {
        reasons.push("Source draft kosong.");
      }
      approvedPreview = validateRenderAttemptOutputRelativePath(makeApprovedOutputRelativePath(attempt, sourceRelativePath, new Date()));
      const approvedSmokeRoot = join(storageRoot(), "approved-videos", "smoke");
      const approvedAbsolutePath = resolveInside(join(storageRoot(), "approved-videos"), approvedPreview);
      if (!approvedAbsolutePath.startsWith(`${approvedSmokeRoot}${sep}`)) {
        reasons.push("Destination approved harus berada di folder approved smoke.");
      }
      if (approvedAbsolutePath === sourceAbsolutePath) {
        reasons.push("Destination approved tidak boleh sama dengan source draft.");
      }
      try {
        await access(approvedAbsolutePath, constants.F_OK);
        reasons.push("Destination approved sudah ada.");
      } catch {
        // Destination must not exist.
      }
    } catch (error) {
      if (error instanceof RenderApprovedPromotionError) throw error;
      reasons.push("Source draft fisik tidak ditemukan di draft smoke.");
    }
  }
  if (attempt.output_size_bytes === null || attempt.output_size_bytes <= 0) {
    reasons.push("Metadata output draft harus non-empty.");
  }

  return {
    ok: reasons.length === 0,
    blocking_reasons: reasons,
    source_output_relative_path: sourceRelativePath,
    approved_output_relative_path_preview: approvedPreview,
    source_exists: sourceExists,
    source_size_bytes: sourceSize,
    existing_promotion_status: promotion?.promotion_status || null
  };
}

export async function getRenderApprovedPromotionContext(attemptId: string): Promise<RenderApprovedPromotionContext> {
  assertUuid(attemptId);
  const attempt = await getAttemptSnapshot(attemptId);
  const review = await getReviewByAttemptId(attemptId);
  const promotion = await getPromotionByAttemptId(attemptId);
  const eligibility = await validateRenderApprovedPromotionEligibility(attemptId).catch((error) => ({
    ok: false,
    blocking_reasons: [error instanceof Error ? error.message : "Promosi tidak eligible."],
    source_output_relative_path: attempt.output_relative_path,
    approved_output_relative_path_preview: null,
    source_exists: false,
    source_size_bytes: null,
    existing_promotion_status: promotion?.promotion_status || null
  }));
  return { attempt, review, promotion, eligibility };
}

export async function getRenderApprovedPromotionContextForContentItem(
  contentItemId: string,
  jobId: string,
  manifestId: string,
  attemptId: string
): Promise<RenderApprovedPromotionContext> {
  assertUuid(contentItemId);
  assertUuid(jobId);
  assertUuid(manifestId);
  assertUuid(attemptId);
  const context = await getRenderApprovedPromotionContext(attemptId);
  if (
    context.attempt.content_item_id !== contentItemId ||
    context.attempt.video_draft_job_id !== jobId ||
    context.attempt.render_manifest_id !== manifestId
  ) {
    throw new RenderApprovedPromotionError("render_approved_promotion_mismatch", "Render attempt tidak dimiliki konten, job, dan manifest ini.", 404);
  }
  return context;
}

export async function promoteApprovedRenderAttempt(attemptId: string, input: unknown = {}): Promise<RenderApprovedPromotionRow> {
  assertUuid(attemptId);
  const value = validateRenderApprovedPromotionInput(input);
  const eligibility = await validateRenderApprovedPromotionEligibility(attemptId);
  if (!eligibility.ok || !eligibility.source_output_relative_path || !eligibility.approved_output_relative_path_preview) {
    throw new RenderApprovedPromotionError("render_not_promotable", eligibility.blocking_reasons.join(" "), 400);
  }

  const promotionId = await withTransaction(async (client) => {
    const attempt = await getAttemptSnapshot(attemptId, client);
    const review = await getReviewByAttemptId(attemptId, client);
    if (!review || review.review_status !== "approved") {
      throw new RenderApprovedPromotionError("render_review_not_approved", "Review approved wajib ada sebelum promosi.", 400);
    }
    const existing = await getPromotionByAttemptId(attemptId, client);
    if (existing) {
      throw new RenderApprovedPromotionError("render_promotion_duplicate", "Render attempt ini sudah memiliki promotion row.", 409);
    }
    const result = await client.query<{ id: string }>(
      `INSERT INTO video_render_approved_promotions (
         render_attempt_review_id,
         render_attempt_id,
         render_manifest_id,
         video_draft_job_id,
         content_item_id,
         promotion_status,
         promotion_mode,
         source_output_relative_path,
         approved_output_relative_path,
         source_size_bytes,
         promoted_by_name,
         promotion_note,
         started_at
       )
       VALUES ($1, $2, $3, $4, $5, 'running', 'manual_copy', $6, $7, $8, $9, $10, now())
       RETURNING id`,
      [
        review.id,
        attempt.id,
        attempt.render_manifest_id,
        attempt.video_draft_job_id,
        attempt.content_item_id,
        eligibility.source_output_relative_path,
        eligibility.approved_output_relative_path_preview,
        eligibility.source_size_bytes,
        value.promoted_by_name,
        value.promotion_note
      ]
    );
    return result.rows[0].id;
  });

  const sourceAbsolutePath = resolveInside(join(storageRoot(), "draft-videos"), eligibility.source_output_relative_path);
  const approvedAbsolutePath = resolveInside(join(storageRoot(), "approved-videos"), eligibility.approved_output_relative_path_preview);

  try {
    await mkdir(join(storageRoot(), "approved-videos", "smoke"), { recursive: true });
    await copyFile(sourceAbsolutePath, approvedAbsolutePath, constants.COPYFILE_EXCL);
    const sourceStat = await stat(sourceAbsolutePath);
    const approvedStat = await stat(approvedAbsolutePath);
    if (!approvedStat.isFile() || approvedStat.size <= 0) {
      throw new RenderApprovedPromotionError("approved_output_invalid", "Approved output hasil promosi kosong atau bukan file reguler.", 500);
    }
    const [sourceSha256, approvedSha256] = await Promise.all([
      fileSha256(sourceAbsolutePath),
      fileSha256(approvedAbsolutePath)
    ]);
    await query(
      `UPDATE video_render_approved_promotions
       SET promotion_status = 'succeeded',
           source_size_bytes = $2,
           approved_size_bytes = $3,
           source_sha256 = $4,
           approved_sha256 = $5,
           completed_at = now(),
           updated_at = now()
       WHERE id = $1`,
      [promotionId, sourceStat.size, approvedStat.size, sourceSha256, approvedSha256]
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Promosi approved gagal.";
    await query(
      `UPDATE video_render_approved_promotions
       SET promotion_status = 'failed',
           error_message = $2,
           completed_at = now(),
           updated_at = now()
       WHERE id = $1`,
      [promotionId, message.slice(0, 1000)]
    );
    throw error;
  }

  const rows = await query<RenderApprovedPromotionRow>(`${promotionSelect} WHERE id = $1`, [promotionId]);
  return mapPromotion(rows[0]);
}
