import { constants, createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, resolve, sep } from "node:path";
import { query, withTransaction } from "./db.ts";
import type { DatabaseClient } from "./db.ts";
import { ManualPublicationPackageError } from "./manual-publication-package-errors.ts";
import { assertUuid } from "./validation/library-validation.ts";
import { validateRenderAttemptOutputRelativePath } from "./validation/render-attempt-validation.ts";
import {
  validateManualPublicationPackageChannel,
  validateManualPublicationPackageChannelInput,
  validateManualPublicationPackageInput,
  validateManualPublicationPackageStatus,
  validateManualPublicationPackageUpdateInput
} from "./validation/manual-publication-package-validation.ts";

export type ManualPublicationPackageRow = {
  id: string;
  handoff_id: string;
  promotion_id: string;
  render_attempt_id: string;
  render_attempt_review_id: string;
  render_manifest_id: string;
  video_draft_job_id: string;
  content_item_id: string;
  package_status: string;
  approved_output_relative_path_snapshot: string;
  approved_size_bytes_snapshot: number | null;
  approved_sha256_snapshot: string | null;
  package_title: string | null;
  caption_text: string | null;
  hashtags_text: string | null;
  call_to_action: string | null;
  manual_publish_note: string | null;
  created_by_name: string | null;
  ready_at: string | null;
  published_manually_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ManualPublicationPackageChannelRow = {
  id: string;
  package_id: string;
  content_item_id: string;
  channel: string;
  channel_status: string;
  publication_format: string;
  planned_publish_at: string | null;
  manual_published_at: string | null;
  manual_publish_url: string | null;
  manual_publish_note: string | null;
  created_at: string;
  updated_at: string;
};

export type ManualPublicationPackageListRow = ManualPublicationPackageRow & {
  content_code: string;
  content_title: string;
  campaign_code: string;
  campaign_name: string;
  channels: ManualPublicationPackageChannelRow[];
};

export type ManualPublicationPackageEligibility = {
  ok: boolean;
  blocking_reasons: string[];
  approved_output_relative_path: string | null;
  approved_exists: boolean;
  approved_size_bytes: number | null;
  approved_sha256: string | null;
  sha256_matches: boolean | null;
};

export type ManualPublicationPackageContext = {
  package: ManualPublicationPackageRow;
  channels: ManualPublicationPackageChannelRow[];
  content: {
    content_code: string;
    content_title: string;
    campaign_code: string;
    campaign_name: string;
  };
};

export type ManualPublicationPackageCreateContext = {
  handoff: {
    id: string;
    handoff_status: string;
    promotion_id: string;
    render_attempt_id: string;
    render_attempt_review_id: string;
    render_manifest_id: string;
    video_draft_job_id: string;
    content_item_id: string;
    approved_output_relative_path_snapshot: string;
    approved_size_bytes_snapshot: number | null;
    approved_sha256_snapshot: string | null;
  };
  promotion: {
    id: string;
    promotion_status: string;
    approved_output_relative_path: string | null;
    approved_size_bytes: number | null;
    approved_sha256: string | null;
  };
  content: {
    content_code: string;
    content_title: string;
    campaign_code: string;
    campaign_name: string;
  };
  existingPackage: ManualPublicationPackageRow | null;
  eligibility: ManualPublicationPackageEligibility;
};

export type ManualPublicationPackageFilters = {
  package_status?: string | null;
  channel?: string | null;
  q?: string | null;
  content_item_id?: string | null;
  limit?: number | null;
};

const packageSelect = `
  SELECT id,
         handoff_id,
         promotion_id,
         render_attempt_id,
         render_attempt_review_id,
         render_manifest_id,
         video_draft_job_id,
         content_item_id,
         package_status,
         approved_output_relative_path_snapshot,
         approved_size_bytes_snapshot,
         approved_sha256_snapshot,
         package_title,
         caption_text,
         hashtags_text,
         call_to_action,
         manual_publish_note,
         created_by_name,
         ready_at,
         published_manually_at,
         created_at,
         updated_at
  FROM manual_publication_packages
`;

const channelSelect = `
  SELECT id,
         package_id,
         content_item_id,
         channel,
         channel_status,
         publication_format,
         planned_publish_at,
         manual_published_at,
         manual_publish_url,
         manual_publish_note,
         created_at,
         updated_at
  FROM manual_publication_package_channels
`;

function storageRoot(): string {
  return resolve(process.env.APP_STORAGE_DIR || join(process.cwd(), "storage"));
}

function resolveInside(root: string, relativePath: string): string {
  const absoluteRoot = resolve(root);
  const absolutePath = resolve(absoluteRoot, relativePath);
  if (absolutePath !== absoluteRoot && !absolutePath.startsWith(`${absoluteRoot}${sep}`)) {
    throw new ManualPublicationPackageError("unsafe_storage_path", "Path manual publication package keluar dari root storage yang diizinkan.", 400);
  }
  return absolutePath;
}

function mapPackage(row: ManualPublicationPackageRow): ManualPublicationPackageRow {
  return {
    ...row,
    approved_size_bytes_snapshot: row.approved_size_bytes_snapshot === null ? null : Number(row.approved_size_bytes_snapshot)
  };
}

function mapChannel(row: ManualPublicationPackageChannelRow): ManualPublicationPackageChannelRow {
  return row;
}

function mapListRow(row: ManualPublicationPackageListRow): ManualPublicationPackageListRow {
  const channels = Array.isArray(row.channels) ? row.channels : [];
  return {
    ...mapPackage(row),
    content_code: row.content_code,
    content_title: row.content_title,
    campaign_code: row.campaign_code,
    campaign_name: row.campaign_name,
    channels: channels.map(mapChannel)
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

async function listChannelsForPackage(packageId: string, client?: DatabaseClient): Promise<ManualPublicationPackageChannelRow[]> {
  const result = client
    ? await client.query<ManualPublicationPackageChannelRow>(`${channelSelect} WHERE package_id = $1 ORDER BY channel`, [packageId])
    : { rows: await query<ManualPublicationPackageChannelRow>(`${channelSelect} WHERE package_id = $1 ORDER BY channel`, [packageId]) };
  return result.rows.map(mapChannel);
}

async function getPackageByIdInternal(packageId: string, client?: DatabaseClient): Promise<ManualPublicationPackageRow> {
  const result = client
    ? await client.query<ManualPublicationPackageRow>(`${packageSelect} WHERE id = $1`, [packageId])
    : { rows: await query<ManualPublicationPackageRow>(`${packageSelect} WHERE id = $1`, [packageId]) };
  if (!result.rows[0]) {
    throw new ManualPublicationPackageError("manual_publication_package_not_found", "Manual publication package tidak ditemukan.", 404);
  }
  return mapPackage(result.rows[0]);
}

async function getPackageByHandoffIdInternal(handoffId: string, client?: DatabaseClient): Promise<ManualPublicationPackageRow | null> {
  const result = client
    ? await client.query<ManualPublicationPackageRow>(`${packageSelect} WHERE handoff_id = $1`, [handoffId])
    : { rows: await query<ManualPublicationPackageRow>(`${packageSelect} WHERE handoff_id = $1`, [handoffId]) };
  return result.rows[0] ? mapPackage(result.rows[0]) : null;
}

async function getCreateContextByHandoffId(handoffId: string): Promise<Omit<ManualPublicationPackageCreateContext, "eligibility">> {
  const rows = await query<{
    handoff_id: string;
    handoff_status: string;
    handoff_promotion_id: string;
    handoff_render_attempt_id: string;
    handoff_render_attempt_review_id: string;
    handoff_render_manifest_id: string;
    handoff_video_draft_job_id: string;
    handoff_content_item_id: string;
    handoff_approved_output_relative_path_snapshot: string;
    handoff_approved_size_bytes_snapshot: number | null;
    handoff_approved_sha256_snapshot: string | null;
    promotion_id: string;
    promotion_status: string;
    approved_output_relative_path: string | null;
    approved_size_bytes: number | null;
    approved_sha256: string | null;
    content_code: string;
    content_title: string;
    campaign_code: string;
    campaign_name: string;
  }>(
    `SELECT handoff.id AS handoff_id,
            handoff.handoff_status,
            handoff.promotion_id AS handoff_promotion_id,
            handoff.render_attempt_id AS handoff_render_attempt_id,
            handoff.render_attempt_review_id AS handoff_render_attempt_review_id,
            handoff.render_manifest_id AS handoff_render_manifest_id,
            handoff.video_draft_job_id AS handoff_video_draft_job_id,
            handoff.content_item_id AS handoff_content_item_id,
            handoff.approved_output_relative_path_snapshot AS handoff_approved_output_relative_path_snapshot,
            handoff.approved_size_bytes_snapshot AS handoff_approved_size_bytes_snapshot,
            handoff.approved_sha256_snapshot AS handoff_approved_sha256_snapshot,
            promotion.id AS promotion_id,
            promotion.promotion_status,
            promotion.approved_output_relative_path,
            promotion.approved_size_bytes,
            promotion.approved_sha256,
            item.content_code,
            item.title AS content_title,
            campaign.code AS campaign_code,
            campaign.name AS campaign_name
     FROM video_approved_handoff_records handoff
     JOIN video_render_approved_promotions promotion ON promotion.id = handoff.promotion_id
     JOIN content_items item ON item.id = handoff.content_item_id
     JOIN campaigns campaign ON campaign.id = item.campaign_id
     WHERE handoff.id = $1`,
    [handoffId]
  );
  const row = rows[0];
  if (!row) {
    throw new ManualPublicationPackageError("manual_publication_handoff_not_found", "Handoff approved video tidak ditemukan.", 404);
  }
  return {
    handoff: {
      id: row.handoff_id,
      handoff_status: row.handoff_status,
      promotion_id: row.handoff_promotion_id,
      render_attempt_id: row.handoff_render_attempt_id,
      render_attempt_review_id: row.handoff_render_attempt_review_id,
      render_manifest_id: row.handoff_render_manifest_id,
      video_draft_job_id: row.handoff_video_draft_job_id,
      content_item_id: row.handoff_content_item_id,
      approved_output_relative_path_snapshot: row.handoff_approved_output_relative_path_snapshot,
      approved_size_bytes_snapshot: row.handoff_approved_size_bytes_snapshot === null ? null : Number(row.handoff_approved_size_bytes_snapshot),
      approved_sha256_snapshot: row.handoff_approved_sha256_snapshot
    },
    promotion: {
      id: row.promotion_id,
      promotion_status: row.promotion_status,
      approved_output_relative_path: row.approved_output_relative_path,
      approved_size_bytes: row.approved_size_bytes === null ? null : Number(row.approved_size_bytes),
      approved_sha256: row.approved_sha256
    },
    content: {
      content_code: row.content_code,
      content_title: row.content_title,
      campaign_code: row.campaign_code,
      campaign_name: row.campaign_name
    },
    existingPackage: await getPackageByHandoffIdInternal(handoffId)
  };
}

async function getHandoffIdByPromotionId(promotionId: string): Promise<string> {
  assertUuid(promotionId);
  const rows = await query<{ id: string }>(
    `SELECT id FROM video_approved_handoff_records WHERE promotion_id = $1`,
    [promotionId]
  );
  if (!rows[0]) {
    throw new ManualPublicationPackageError("manual_publication_handoff_not_found", "Handoff approved video untuk promotion ini tidak ditemukan.", 404);
  }
  return rows[0].id;
}

export async function validateManualPublicationPackageEligibility(handoffId: string): Promise<ManualPublicationPackageEligibility> {
  assertUuid(handoffId);
  const context = await getCreateContextByHandoffId(handoffId);
  const reasons: string[] = [];
  let approvedExists = false;
  let approvedSize: number | null = null;
  let approvedSha256: string | null = null;
  let shaMatches: boolean | null = null;

  if (context.handoff.handoff_status !== "ready_for_manual_publish") {
    reasons.push("Handoff harus ready_for_manual_publish sebelum dibuat package publikasi manual.");
  }
  if (context.promotion.promotion_status !== "succeeded") {
    reasons.push("Promotion harus succeeded sebelum dibuat package publikasi manual.");
  }
  if (context.existingPackage) {
    reasons.push("Manual publication package untuk handoff ini sudah ada.");
  }
  const relativePath = context.handoff.approved_output_relative_path_snapshot || context.promotion.approved_output_relative_path;
  if (!relativePath) {
    reasons.push("Approved output belum tersedia.");
  } else {
    try {
      const safePath = validateRenderAttemptOutputRelativePath(relativePath);
      const approvedSmokeRoot = join(storageRoot(), "approved-videos", "smoke");
      const approvedAbsolutePath = resolveInside(join(storageRoot(), "approved-videos"), safePath);
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
      const expectedSha = context.handoff.approved_sha256_snapshot || context.promotion.approved_sha256;
      shaMatches = expectedSha ? approvedSha256 === expectedSha : null;
      if (expectedSha && !shaMatches) {
        reasons.push("SHA-256 approved output tidak cocok dengan DB.");
      }
    } catch (error) {
      if (error instanceof ManualPublicationPackageError) throw error;
      reasons.push("Approved output fisik tidak ditemukan di approved smoke.");
    }
  }
  const expectedSize = context.handoff.approved_size_bytes_snapshot || context.promotion.approved_size_bytes;
  if (expectedSize === null || expectedSize <= 0) {
    reasons.push("Metadata approved output harus non-empty.");
  }

  return {
    ok: reasons.length === 0,
    blocking_reasons: reasons,
    approved_output_relative_path: relativePath,
    approved_exists: approvedExists,
    approved_size_bytes: approvedSize,
    approved_sha256: approvedSha256,
    sha256_matches: shaMatches
  };
}

export async function getManualPublicationPackageCreateContext(handoffId: string): Promise<ManualPublicationPackageCreateContext> {
  assertUuid(handoffId);
  const context = await getCreateContextByHandoffId(handoffId);
  const eligibility = await validateManualPublicationPackageEligibility(handoffId).catch((error) => ({
    ok: false,
    blocking_reasons: [error instanceof Error ? error.message : "Handoff belum eligible untuk package publikasi manual."],
    approved_output_relative_path: context.handoff.approved_output_relative_path_snapshot,
    approved_exists: false,
    approved_size_bytes: null,
    approved_sha256: null,
    sha256_matches: null
  }));
  return { ...context, eligibility };
}

export async function getManualPublicationPackageCreateContextForPromotion(promotionId: string): Promise<ManualPublicationPackageCreateContext> {
  return getManualPublicationPackageCreateContext(await getHandoffIdByPromotionId(promotionId));
}

export async function createManualPublicationPackageFromHandoff(handoffId: string, input: unknown): Promise<ManualPublicationPackageContext> {
  assertUuid(handoffId);
  const value = validateManualPublicationPackageInput(input);
  const eligibility = await validateManualPublicationPackageEligibility(handoffId);
  if (!eligibility.ok || !eligibility.approved_output_relative_path) {
    throw new ManualPublicationPackageError("manual_publication_package_not_eligible", eligibility.blocking_reasons.join(" "), 400);
  }

  const packageId = await withTransaction(async (client) => {
    const context = await getCreateContextByHandoffId(handoffId);
    if (context.existingPackage) {
      throw new ManualPublicationPackageError("manual_publication_package_duplicate", "Manual publication package untuk handoff ini sudah ada.", 409);
    }
    const inserted = await client.query<{ id: string }>(
      `INSERT INTO manual_publication_packages (
         handoff_id,
         promotion_id,
         render_attempt_id,
         render_attempt_review_id,
         render_manifest_id,
         video_draft_job_id,
         content_item_id,
         approved_output_relative_path_snapshot,
         approved_size_bytes_snapshot,
         approved_sha256_snapshot,
         package_title,
         caption_text,
         hashtags_text,
         call_to_action,
         manual_publish_note,
         created_by_name
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING id`,
      [
        context.handoff.id,
        context.handoff.promotion_id,
        context.handoff.render_attempt_id,
        context.handoff.render_attempt_review_id,
        context.handoff.render_manifest_id,
        context.handoff.video_draft_job_id,
        context.handoff.content_item_id,
        eligibility.approved_output_relative_path,
        eligibility.approved_size_bytes,
        eligibility.approved_sha256,
        value.package_title,
        value.caption_text,
        value.hashtags_text,
        value.call_to_action,
        value.manual_publish_note,
        value.created_by_name
      ]
    );
    for (const channel of value.selected_channels) {
      await client.query(
        `INSERT INTO manual_publication_package_channels (
           package_id,
           content_item_id,
           channel,
           publication_format,
           planned_publish_at
         )
         VALUES ($1, $2, $3, $4, $5)`,
        [
          inserted.rows[0].id,
          context.handoff.content_item_id,
          channel,
          value.channel_formats[channel],
          value.planned_publish_at[channel]
        ]
      );
    }
    return inserted.rows[0].id;
  });

  return getManualPublicationPackageContext(packageId);
}

export async function createManualPublicationPackageFromPromotion(promotionId: string, input: unknown): Promise<ManualPublicationPackageContext> {
  return createManualPublicationPackageFromHandoff(await getHandoffIdByPromotionId(promotionId), input);
}

export async function getManualPublicationPackage(packageId: string): Promise<ManualPublicationPackageRow> {
  assertUuid(packageId);
  return getPackageByIdInternal(packageId);
}

export async function getManualPublicationPackageByHandoffId(handoffId: string): Promise<ManualPublicationPackageRow | null> {
  assertUuid(handoffId);
  return getPackageByHandoffIdInternal(handoffId);
}

export async function getManualPublicationPackageContext(packageId: string): Promise<ManualPublicationPackageContext> {
  assertUuid(packageId);
  const rows = await query<ManualPublicationPackageListRow>(
    `SELECT package.*,
            item.content_code,
            item.title AS content_title,
            campaign.code AS campaign_code,
            campaign.name AS campaign_name,
            COALESCE(json_agg(json_build_object(
              'id', channel.id,
              'package_id', channel.package_id,
              'content_item_id', channel.content_item_id,
              'channel', channel.channel,
              'channel_status', channel.channel_status,
              'publication_format', channel.publication_format,
              'planned_publish_at', channel.planned_publish_at,
              'manual_published_at', channel.manual_published_at,
              'manual_publish_url', channel.manual_publish_url,
              'manual_publish_note', channel.manual_publish_note,
              'created_at', channel.created_at,
              'updated_at', channel.updated_at
            ) ORDER BY channel.channel) FILTER (WHERE channel.id IS NOT NULL), '[]') AS channels
     FROM manual_publication_packages package
     JOIN content_items item ON item.id = package.content_item_id
     JOIN campaigns campaign ON campaign.id = item.campaign_id
     LEFT JOIN manual_publication_package_channels channel ON channel.package_id = package.id
     WHERE package.id = $1
     GROUP BY package.id, item.content_code, item.title, campaign.code, campaign.name`,
    [packageId]
  );
  const row = rows[0];
  if (!row) {
    throw new ManualPublicationPackageError("manual_publication_package_not_found", "Manual publication package tidak ditemukan.", 404);
  }
  const mapped = mapListRow(row);
  return {
    package: mapped,
    channels: mapped.channels,
    content: {
      content_code: mapped.content_code,
      content_title: mapped.content_title,
      campaign_code: mapped.campaign_code,
      campaign_name: mapped.campaign_name
    }
  };
}

export async function listManualPublicationPackages(filters: ManualPublicationPackageFilters = {}): Promise<ManualPublicationPackageListRow[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (filters.package_status) {
    params.push(validateManualPublicationPackageStatus(filters.package_status));
    conditions.push(`package.package_status = $${params.length}`);
  }
  if (filters.channel) {
    params.push(validateManualPublicationPackageChannel(filters.channel));
    conditions.push(`EXISTS (
      SELECT 1 FROM manual_publication_package_channels filter_channel
      WHERE filter_channel.package_id = package.id AND filter_channel.channel = $${params.length}
    )`);
  }
  if (filters.content_item_id) {
    assertUuid(filters.content_item_id);
    params.push(filters.content_item_id);
    conditions.push(`package.content_item_id = $${params.length}`);
  }
  if (filters.q) {
    params.push(`%${filters.q.trim()}%`);
    conditions.push(`(item.content_code ILIKE $${params.length} OR item.title ILIKE $${params.length})`);
  }
  const limit = Math.min(Math.max(Number(filters.limit || 50), 1), 100);
  params.push(limit);
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await query<ManualPublicationPackageListRow>(
    `SELECT package.*,
            item.content_code,
            item.title AS content_title,
            campaign.code AS campaign_code,
            campaign.name AS campaign_name,
            COALESCE(json_agg(json_build_object(
              'id', channel.id,
              'package_id', channel.package_id,
              'content_item_id', channel.content_item_id,
              'channel', channel.channel,
              'channel_status', channel.channel_status,
              'publication_format', channel.publication_format,
              'planned_publish_at', channel.planned_publish_at,
              'manual_published_at', channel.manual_published_at,
              'manual_publish_url', channel.manual_publish_url,
              'manual_publish_note', channel.manual_publish_note,
              'created_at', channel.created_at,
              'updated_at', channel.updated_at
            ) ORDER BY channel.channel) FILTER (WHERE channel.id IS NOT NULL), '[]') AS channels
     FROM manual_publication_packages package
     JOIN content_items item ON item.id = package.content_item_id
     JOIN campaigns campaign ON campaign.id = item.campaign_id
     LEFT JOIN manual_publication_package_channels channel ON channel.package_id = package.id
     ${where}
     GROUP BY package.id, item.content_code, item.title, campaign.code, campaign.name
     ORDER BY package.created_at DESC, package.id DESC
     LIMIT $${params.length}`,
    params
  );
  return rows.map(mapListRow);
}

export async function updateManualPublicationPackage(packageId: string, input: unknown): Promise<ManualPublicationPackageContext> {
  assertUuid(packageId);
  const value = validateManualPublicationPackageUpdateInput(input);
  await query(
    `UPDATE manual_publication_packages
     SET package_title = $2,
         caption_text = $3,
         hashtags_text = $4,
         call_to_action = $5,
         manual_publish_note = $6,
         created_by_name = $7,
         updated_at = now()
     WHERE id = $1`,
    [
      packageId,
      value.package_title,
      value.caption_text,
      value.hashtags_text,
      value.call_to_action,
      value.manual_publish_note,
      value.created_by_name
    ]
  );
  return getManualPublicationPackageContext(packageId);
}

export async function setManualPublicationPackageStatus(packageId: string, status: string, input: unknown = {}): Promise<ManualPublicationPackageContext> {
  assertUuid(packageId);
  const packageStatus = validateManualPublicationPackageStatus(status);
  const value = validateManualPublicationPackageUpdateInput(input);
  await query(
    `UPDATE manual_publication_packages
     SET package_status = $2,
         package_title = COALESCE($3, package_title),
         caption_text = COALESCE($4, caption_text),
         hashtags_text = COALESCE($5, hashtags_text),
         call_to_action = COALESCE($6, call_to_action),
         manual_publish_note = COALESCE($7, manual_publish_note),
         created_by_name = COALESCE($8, created_by_name),
         ready_at = CASE WHEN $2 = 'ready_manual_publish' THEN now() ELSE ready_at END,
         published_manually_at = CASE WHEN $2 = 'published_manually' THEN now() ELSE published_manually_at END,
         updated_at = now()
     WHERE id = $1`,
    [
      packageId,
      packageStatus,
      value.package_title,
      value.caption_text,
      value.hashtags_text,
      value.call_to_action,
      value.manual_publish_note,
      value.created_by_name
    ]
  );
  return getManualPublicationPackageContext(packageId);
}

export function markManualPublicationPackageReady(packageId: string, input: unknown = {}): Promise<ManualPublicationPackageContext> {
  return setManualPublicationPackageStatus(packageId, "ready_manual_publish", input);
}

export function markManualPublicationPackageHold(packageId: string, input: unknown = {}): Promise<ManualPublicationPackageContext> {
  return setManualPublicationPackageStatus(packageId, "hold", input);
}

export function markManualPublicationPackageNeedsRevision(packageId: string, input: unknown = {}): Promise<ManualPublicationPackageContext> {
  return setManualPublicationPackageStatus(packageId, "needs_revision", input);
}

export function markManualPublicationPackagePublishedManually(packageId: string, input: unknown = {}): Promise<ManualPublicationPackageContext> {
  return setManualPublicationPackageStatus(packageId, "published_manually", input);
}

export function archiveManualPublicationPackage(packageId: string, input: unknown = {}): Promise<ManualPublicationPackageContext> {
  return setManualPublicationPackageStatus(packageId, "archived", input);
}

export async function updateManualPublicationPackageChannel(packageId: string, channelValue: string, input: unknown): Promise<ManualPublicationPackageContext> {
  assertUuid(packageId);
  const channel = validateManualPublicationPackageChannel(channelValue);
  const value = validateManualPublicationPackageChannelInput(input);
  const result = await query<{ id: string }>(
    `UPDATE manual_publication_package_channels
     SET channel_status = $3,
         publication_format = $4,
         planned_publish_at = $5,
         manual_published_at = CASE WHEN $3 = 'published_manually' THEN COALESCE($6, now()) ELSE $6 END,
         manual_publish_url = $7,
         manual_publish_note = $8,
         updated_at = now()
     WHERE package_id = $1 AND channel = $2
     RETURNING id`,
    [
      packageId,
      channel,
      value.channel_status,
      value.publication_format,
      value.planned_publish_at,
      value.manual_published_at,
      value.manual_publish_url,
      value.manual_publish_note
    ]
  );
  if (!result[0]) {
    throw new ManualPublicationPackageError("manual_publication_channel_not_found", "Channel package manual publication tidak ditemukan.", 404);
  }
  return getManualPublicationPackageContext(packageId);
}
