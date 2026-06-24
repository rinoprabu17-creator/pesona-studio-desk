import { constants, createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, resolve, sep } from "node:path";
import { query, withTransaction } from "./db.ts";
import type { DatabaseClient } from "./db.ts";
import { ApprovedVideoHandoffError } from "./approved-video-handoff-errors.ts";
import { assertUuid } from "./validation/library-validation.ts";
import { validateRenderAttemptOutputRelativePath } from "./validation/render-attempt-validation.ts";
import {
  validateApprovedVideoHandoffInput,
  validateApprovedVideoHandoffStatus
} from "./validation/approved-video-handoff-validation.ts";

export type ApprovedVideoHandoffRecordRow = {
  id: string;
  promotion_id: string;
  render_attempt_id: string;
  render_attempt_review_id: string;
  render_manifest_id: string;
  video_draft_job_id: string;
  content_item_id: string;
  handoff_status: string;
  approved_output_relative_path_snapshot: string;
  approved_size_bytes_snapshot: number | null;
  approved_sha256_snapshot: string | null;
  handoff_by_name: string | null;
  handoff_note: string | null;
  handoff_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ApprovedVideoLibraryRow = {
  promotion_id: string;
  promotion_status: string;
  promotion_completed_at: string | null;
  approved_output_relative_path: string | null;
  approved_size_bytes: number | null;
  approved_sha256: string | null;
  render_attempt_id: string;
  render_attempt_status: string;
  render_attempt_review_id: string;
  review_status: string;
  render_manifest_id: string;
  manifest_status: string;
  video_draft_job_id: string;
  job_status: string;
  content_item_id: string;
  content_code: string;
  content_title: string;
  planned_content_date: string;
  campaign_id: string;
  campaign_code: string;
  campaign_name: string;
  handoff_id: string | null;
  handoff_status: string | null;
  handoff_at: string | null;
};

export type ApprovedVideoHandoffEligibility = {
  ok: boolean;
  blocking_reasons: string[];
  approved_output_relative_path: string | null;
  approved_exists: boolean;
  approved_size_bytes: number | null;
  approved_sha256: string | null;
  sha256_matches: boolean | null;
};

export type ApprovedVideoHandoffContext = {
  libraryItem: ApprovedVideoLibraryRow;
  handoff: ApprovedVideoHandoffRecordRow | null;
  eligibility: ApprovedVideoHandoffEligibility;
};

export type ApprovedVideoLibraryFilters = {
  handoff_status?: string | null;
  campaign_id?: string | null;
  content_item_id?: string | null;
  q?: string | null;
  promotion_status?: string | null;
  limit?: number | null;
};

const handoffSelect = `
  SELECT id,
         promotion_id,
         render_attempt_id,
         render_attempt_review_id,
         render_manifest_id,
         video_draft_job_id,
         content_item_id,
         handoff_status,
         approved_output_relative_path_snapshot,
         approved_size_bytes_snapshot,
         approved_sha256_snapshot,
         handoff_by_name,
         handoff_note,
         handoff_at,
         created_at,
         updated_at
  FROM video_approved_handoff_records
`;

function storageRoot(): string {
  return resolve(process.env.APP_STORAGE_DIR || join(process.cwd(), "storage"));
}

function resolveInside(root: string, relativePath: string): string {
  const absoluteRoot = resolve(root);
  const absolutePath = resolve(absoluteRoot, relativePath);
  if (absolutePath !== absoluteRoot && !absolutePath.startsWith(`${absoluteRoot}${sep}`)) {
    throw new ApprovedVideoHandoffError("unsafe_storage_path", "Path handoff keluar dari root storage yang diizinkan.", 400);
  }
  return absolutePath;
}

function mapHandoff(row: ApprovedVideoHandoffRecordRow): ApprovedVideoHandoffRecordRow {
  return {
    ...row,
    approved_size_bytes_snapshot: row.approved_size_bytes_snapshot === null ? null : Number(row.approved_size_bytes_snapshot)
  };
}

function mapLibrary(row: ApprovedVideoLibraryRow): ApprovedVideoLibraryRow {
  return {
    ...row,
    approved_size_bytes: row.approved_size_bytes === null ? null : Number(row.approved_size_bytes)
  };
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

function librarySelect(): string {
  return `SELECT promotion.id AS promotion_id,
                 promotion.promotion_status,
                 promotion.completed_at AS promotion_completed_at,
                 promotion.approved_output_relative_path,
                 promotion.approved_size_bytes,
                 promotion.approved_sha256,
                 attempt.id AS render_attempt_id,
                 attempt.attempt_status AS render_attempt_status,
                 review.id AS render_attempt_review_id,
                 review.review_status,
                 manifest.id AS render_manifest_id,
                 manifest.manifest_status,
                 job.id AS video_draft_job_id,
                 job.job_status,
                 item.id AS content_item_id,
                 item.content_code,
                 item.title AS content_title,
                 item.planned_content_date,
                 campaign.id AS campaign_id,
                 campaign.code AS campaign_code,
                 campaign.name AS campaign_name,
                 handoff.id AS handoff_id,
                 handoff.handoff_status,
                 handoff.handoff_at
          FROM video_render_approved_promotions promotion
          JOIN video_render_attempts attempt ON attempt.id = promotion.render_attempt_id
          JOIN video_render_attempt_reviews review ON review.id = promotion.render_attempt_review_id
          JOIN video_render_manifests manifest ON manifest.id = promotion.render_manifest_id
          JOIN video_draft_jobs job ON job.id = promotion.video_draft_job_id
          JOIN content_items item ON item.id = promotion.content_item_id
          JOIN campaigns campaign ON campaign.id = item.campaign_id
          LEFT JOIN video_approved_handoff_records handoff ON handoff.promotion_id = promotion.id`;
}

export async function listApprovedVideoLibrary(filters: ApprovedVideoLibraryFilters = {}): Promise<ApprovedVideoLibraryRow[]> {
  const conditions = ["promotion.promotion_status = $1"];
  const params: unknown[] = [filters.promotion_status || "succeeded"];
  if (filters.handoff_status) {
    params.push(filters.handoff_status);
    conditions.push(`COALESCE(handoff.handoff_status, 'pending_handoff') = $${params.length}`);
  }
  if (filters.campaign_id) {
    assertUuid(filters.campaign_id);
    params.push(filters.campaign_id);
    conditions.push(`campaign.id = $${params.length}`);
  }
  if (filters.content_item_id) {
    assertUuid(filters.content_item_id);
    params.push(filters.content_item_id);
    conditions.push(`item.id = $${params.length}`);
  }
  if (filters.q) {
    params.push(`%${filters.q.trim()}%`);
    conditions.push(`(item.content_code ILIKE $${params.length} OR item.title ILIKE $${params.length})`);
  }
  const limit = Math.min(Math.max(Number(filters.limit || 50), 1), 100);
  params.push(limit);
  const rows = await query<ApprovedVideoLibraryRow>(
    `${librarySelect()}
     WHERE ${conditions.join(" AND ")}
     ORDER BY promotion.completed_at DESC NULLS LAST, promotion.created_at DESC, promotion.id DESC
     LIMIT $${params.length}`,
    params
  );
  return rows.map(mapLibrary);
}

async function getLibraryItemByPromotionId(promotionId: string, client?: DatabaseClient): Promise<ApprovedVideoLibraryRow> {
  const sql = `${librarySelect()} WHERE promotion.id = $1`;
  const result = client
    ? await client.query<ApprovedVideoLibraryRow>(sql, [promotionId])
    : { rows: await query<ApprovedVideoLibraryRow>(sql, [promotionId]) };
  if (!result.rows[0]) {
    throw new ApprovedVideoHandoffError("approved_video_not_found", "Approved video promotion tidak ditemukan.", 404);
  }
  return mapLibrary(result.rows[0]);
}

function assertSucceededPromotion(item: ApprovedVideoLibraryRow): void {
  if (item.promotion_status !== "succeeded") {
    throw new ApprovedVideoHandoffError("approved_video_not_succeeded", "Promotion harus succeeded sebelum masuk approved video handoff.", 400);
  }
}

export async function getHandoffByPromotionId(promotionId: string): Promise<ApprovedVideoHandoffRecordRow | null> {
  assertUuid(promotionId);
  assertSucceededPromotion(await getLibraryItemByPromotionId(promotionId));
  const rows = await query<ApprovedVideoHandoffRecordRow>(`${handoffSelect} WHERE promotion_id = $1`, [promotionId]);
  return rows[0] ? mapHandoff(rows[0]) : null;
}

async function getHandoffByPromotionIdInternal(promotionId: string, client?: DatabaseClient): Promise<ApprovedVideoHandoffRecordRow | null> {
  const result = client
    ? await client.query<ApprovedVideoHandoffRecordRow>(`${handoffSelect} WHERE promotion_id = $1`, [promotionId])
    : { rows: await query<ApprovedVideoHandoffRecordRow>(`${handoffSelect} WHERE promotion_id = $1`, [promotionId]) };
  return result.rows[0] ? mapHandoff(result.rows[0]) : null;
}

export async function validateApprovedVideoHandoffEligibility(promotionId: string): Promise<ApprovedVideoHandoffEligibility> {
  assertUuid(promotionId);
  const item = await getLibraryItemByPromotionId(promotionId);
  const reasons: string[] = [];
  let approvedExists = false;
  let approvedSize: number | null = null;
  let approvedSha256: string | null = null;
  let shaMatches: boolean | null = null;

  if (item.promotion_status !== "succeeded") {
    reasons.push("Hanya promotion succeeded yang bisa di-handoff.");
  }
  if (!item.approved_output_relative_path) {
    reasons.push("Approved output belum tersedia.");
  } else {
    try {
      const relativePath = validateRenderAttemptOutputRelativePath(item.approved_output_relative_path);
      const approvedSmokeRoot = join(storageRoot(), "approved-videos", "smoke");
      const approvedAbsolutePath = resolveInside(join(storageRoot(), "approved-videos"), relativePath);
      if (!approvedAbsolutePath.startsWith(`${approvedSmokeRoot}${sep}`)) {
        reasons.push("Approved output harus berada di folder approved smoke.");
      }
      await access(approvedAbsolutePath, constants.F_OK);
      const approvedStat = await stat(approvedAbsolutePath);
      approvedExists = true;
      approvedSize = approvedStat.size;
      if (!approvedStat.isFile()) {
        reasons.push("Approved output bukan file reguler.");
      }
      if (approvedStat.size <= 0) {
        reasons.push("Approved output kosong.");
      }
      approvedSha256 = await fileSha256(approvedAbsolutePath);
      shaMatches = item.approved_sha256 ? approvedSha256 === item.approved_sha256 : null;
      if (item.approved_sha256 && !shaMatches) {
        reasons.push("SHA-256 approved output tidak cocok dengan DB promotion.");
      }
    } catch (error) {
      if (error instanceof ApprovedVideoHandoffError) throw error;
      reasons.push("Approved output fisik tidak ditemukan di approved smoke.");
    }
  }
  if (item.approved_size_bytes === null || item.approved_size_bytes <= 0) {
    reasons.push("Metadata approved output harus non-empty.");
  }

  return {
    ok: reasons.length === 0,
    blocking_reasons: reasons,
    approved_output_relative_path: item.approved_output_relative_path,
    approved_exists: approvedExists,
    approved_size_bytes: approvedSize,
    approved_sha256: approvedSha256,
    sha256_matches: shaMatches
  };
}

export async function getApprovedVideoHandoffContext(promotionId: string): Promise<ApprovedVideoHandoffContext> {
  assertUuid(promotionId);
  const libraryItem = await getLibraryItemByPromotionId(promotionId);
  assertSucceededPromotion(libraryItem);
  const handoff = await getHandoffByPromotionIdInternal(promotionId);
  const eligibility = await validateApprovedVideoHandoffEligibility(promotionId).catch((error) => ({
    ok: false,
    blocking_reasons: [error instanceof Error ? error.message : "Approved video belum eligible untuk handoff."],
    approved_output_relative_path: libraryItem.approved_output_relative_path,
    approved_exists: false,
    approved_size_bytes: null,
    approved_sha256: null,
    sha256_matches: null
  }));
  return { libraryItem, handoff, eligibility };
}

export async function getApprovedVideoHandoffContextForContentItem(
  contentItemId: string,
  jobId: string,
  manifestId: string,
  attemptId: string,
  promotionId: string
): Promise<ApprovedVideoHandoffContext> {
  assertUuid(contentItemId);
  assertUuid(jobId);
  assertUuid(manifestId);
  assertUuid(attemptId);
  assertUuid(promotionId);
  const context = await getApprovedVideoHandoffContext(promotionId);
  if (
    context.libraryItem.content_item_id !== contentItemId ||
    context.libraryItem.video_draft_job_id !== jobId ||
    context.libraryItem.render_manifest_id !== manifestId ||
    context.libraryItem.render_attempt_id !== attemptId
  ) {
    throw new ApprovedVideoHandoffError("approved_video_handoff_mismatch", "Approved video tidak dimiliki konten, job, manifest, dan attempt ini.", 404);
  }
  return context;
}

export async function setApprovedVideoHandoffStatus(promotionId: string, status: string, input: unknown = {}): Promise<ApprovedVideoHandoffRecordRow> {
  assertUuid(promotionId);
  const handoffStatus = validateApprovedVideoHandoffStatus(status);
  const value = validateApprovedVideoHandoffInput(input);
  const eligibility = await validateApprovedVideoHandoffEligibility(promotionId);
  if (!eligibility.ok || !eligibility.approved_output_relative_path) {
    throw new ApprovedVideoHandoffError("approved_video_not_handoffable", eligibility.blocking_reasons.join(" "), 400);
  }

  const handoffId = await withTransaction(async (client) => {
    const item = await getLibraryItemByPromotionId(promotionId, client);
    if (item.promotion_status !== "succeeded") {
      throw new ApprovedVideoHandoffError("approved_video_not_succeeded", "Promotion harus succeeded sebelum handoff.", 400);
    }
    const existing = await getHandoffByPromotionIdInternal(promotionId, client);
    const sql = existing
      ? `UPDATE video_approved_handoff_records
         SET handoff_status = $2,
             approved_output_relative_path_snapshot = $3,
             approved_size_bytes_snapshot = $4,
             approved_sha256_snapshot = $5,
             handoff_by_name = $6,
             handoff_note = $7,
             handoff_at = now(),
             updated_at = now()
         WHERE id = $1
         RETURNING id`
      : `INSERT INTO video_approved_handoff_records (
           promotion_id,
           render_attempt_id,
           render_attempt_review_id,
           render_manifest_id,
           video_draft_job_id,
           content_item_id,
           handoff_status,
           approved_output_relative_path_snapshot,
           approved_size_bytes_snapshot,
           approved_sha256_snapshot,
           handoff_by_name,
           handoff_note,
           handoff_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now())
         RETURNING id`;
    const params = existing
      ? [
          existing.id,
          handoffStatus,
          eligibility.approved_output_relative_path,
          eligibility.approved_size_bytes,
          eligibility.approved_sha256,
          value.handoff_by_name,
          value.handoff_note
        ]
      : [
          item.promotion_id,
          item.render_attempt_id,
          item.render_attempt_review_id,
          item.render_manifest_id,
          item.video_draft_job_id,
          item.content_item_id,
          handoffStatus,
          eligibility.approved_output_relative_path,
          eligibility.approved_size_bytes,
          eligibility.approved_sha256,
          value.handoff_by_name,
          value.handoff_note
        ];
    const result = await client.query<{ id: string }>(sql, params);
    return result.rows[0].id;
  });

  const rows = await query<ApprovedVideoHandoffRecordRow>(`${handoffSelect} WHERE id = $1`, [handoffId]);
  return mapHandoff(rows[0]);
}

export function markApprovedVideoReadyForManualPublish(promotionId: string, input: unknown = {}): Promise<ApprovedVideoHandoffRecordRow> {
  return setApprovedVideoHandoffStatus(promotionId, "ready_for_manual_publish", input);
}

export function markApprovedVideoHold(promotionId: string, input: unknown = {}): Promise<ApprovedVideoHandoffRecordRow> {
  return setApprovedVideoHandoffStatus(promotionId, "hold", input);
}

export function markApprovedVideoNeedsRevision(promotionId: string, input: unknown = {}): Promise<ApprovedVideoHandoffRecordRow> {
  return setApprovedVideoHandoffStatus(promotionId, "needs_revision", input);
}

export function archiveApprovedVideoHandoff(promotionId: string, input: unknown = {}): Promise<ApprovedVideoHandoffRecordRow> {
  return setApprovedVideoHandoffStatus(promotionId, "archived", input);
}
