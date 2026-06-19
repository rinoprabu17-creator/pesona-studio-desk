import { query, withTransaction } from "./db.ts";
import type { DatabaseClient } from "./db.ts";
import { ContentItemError } from "./content-item-errors.ts";
import { ContentPublicationError } from "./content-publication-errors.ts";
import { assertUuid } from "./validation/library-validation.ts";
import {
  assertChannelFormat,
  publicationTransitions,
  validateCreatePublicationInput,
  validateStatusActionInput,
  validateUpdatePublicationInput
} from "./validation/content-publication-validation.ts";
import type { ContentPublicationInput } from "./validation/content-publication-validation.ts";

export type ContentPublicationRow = {
  id: string;
  content_item_id: string;
  content_code: string;
  content_title: string;
  production_status: string;
  channel: string;
  publication_format: string;
  planned_publish_at: string | null;
  publication_status: string;
  platform_title: string | null;
  platform_caption: string | null;
  published_url: string | null;
  published_at: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
};

type PublicationForUpdate = {
  id: string;
  content_item_id: string;
  content_code: string;
  content_title: string;
  production_status: string;
  channel: string;
  publication_format: string;
  planned_publish_at: string | null;
  publication_status: string;
  platform_title: string | null;
  platform_caption: string | null;
  published_url: string | null;
  published_at: string | null;
  failure_reason: string | null;
};

const publicationSelect = `
  SELECT cp.id,
         cp.content_item_id,
         ci.content_code,
         ci.title AS content_title,
         ci.production_status,
         cp.channel,
         cp.publication_format,
         cp.planned_publish_at,
         cp.publication_status,
         cp.platform_title,
         cp.platform_caption,
         cp.published_url,
         cp.published_at,
         cp.failure_reason,
         cp.created_at,
         cp.updated_at
  FROM content_publications cp
  JOIN content_items ci ON ci.id = cp.content_item_id
`;

function formatTimestamp(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

function mapPublicationRow(row: ContentPublicationRow): ContentPublicationRow {
  return {
    ...row,
    planned_publish_at: formatTimestamp(row.planned_publish_at),
    published_at: formatTimestamp(row.published_at)
  };
}

async function clientRows<T>(client: DatabaseClient, text: string, params: unknown[] = []): Promise<T[]> {
  const result = await client.query(text, params);
  return result.rows as T[];
}

async function assertContentItemExists(contentItemId: string): Promise<void> {
  const rows = await query<{ id: string }>(`SELECT id FROM content_items WHERE id = $1`, [contentItemId]);
  if (!rows[0]) {
    throw new ContentItemError("content_item_not_found", "Content item tidak ditemukan.", 404);
  }
}

function handleWriteError(error: any): never {
  if (error?.code === "23505") {
    throw new ContentPublicationError("duplicate_content_publication", "Publikasi untuk channel dan format ini sudah ada.", 409);
  }
  if (error?.constraint === "content_publications_channel_format_check") {
    throw new ContentPublicationError("invalid_channel_format", "Kombinasi channel dan format tidak valid.", 400);
  }
  throw error;
}

function assertParentApproved(row: PublicationForUpdate): void {
  if (row.production_status !== "approved") {
    throw new ContentPublicationError("content_not_approved", "Konten harus disetujui sebelum publikasi dijadwalkan.", 409);
  }
}

function assertHasSchedule(value: string | null): void {
  if (!value) {
    throw new ContentPublicationError("planned_publish_at_required", "Jadwal posting wajib diisi.", 400);
  }
}

function assertYoutubeTitle(row: PublicationForUpdate, title: string | null): void {
  if (row.channel === "youtube" && !title) {
    throw new ContentPublicationError("youtube_title_required", "Publication YouTube wajib memiliki platform title.", 400);
  }
}

export async function listPublicationsByContentItem(contentItemId: string): Promise<ContentPublicationRow[]> {
  assertUuid(contentItemId);
  await assertContentItemExists(contentItemId);
  const rows = await query<ContentPublicationRow>(
    `${publicationSelect}
     WHERE cp.content_item_id = $1
     ORDER BY cp.channel, cp.publication_format`,
    [contentItemId]
  );
  return rows.map(mapPublicationRow);
}

export async function getContentPublication(id: string): Promise<ContentPublicationRow> {
  assertUuid(id);
  const rows = await query<ContentPublicationRow>(`${publicationSelect} WHERE cp.id = $1`, [id]);
  if (!rows[0]) {
    throw new ContentPublicationError("content_publication_not_found", "Publikasi tidak ditemukan.", 404);
  }
  return mapPublicationRow(rows[0]);
}

export async function createContentPublication(contentItemId: string, input: ContentPublicationInput): Promise<ContentPublicationRow> {
  const value = validateCreatePublicationInput(contentItemId, input);
  await assertContentItemExists(contentItemId);

  try {
    const rows = await query<{ id: string }>(
      `INSERT INTO content_publications (
         content_item_id, channel, publication_format, planned_publish_at, platform_title, platform_caption
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        value.content_item_id,
        value.channel,
        value.publication_format,
        value.planned_publish_at,
        value.platform_title,
        value.platform_caption
      ]
    );
    return getContentPublication(rows[0].id);
  } catch (error: any) {
    handleWriteError(error);
  }
}

export async function updateContentPublication(id: string, input: ContentPublicationInput): Promise<ContentPublicationRow> {
  assertUuid(id);
  const current = await getContentPublication(id);
  const value = validateUpdatePublicationInput(input, current.publication_status);
  const nextSchedule = value.planned_publish_at;
  const nextTitle = value.platform_title;

  if (["scheduled", "publishing", "posted"].includes(current.publication_status)) {
    assertHasSchedule(nextSchedule);
    if (current.channel === "youtube" && !nextTitle) {
      throw new ContentPublicationError("youtube_title_required", "Publication YouTube wajib memiliki platform title.", 400);
    }
  }

  const rows = await query<{ id: string }>(
    `UPDATE content_publications
     SET planned_publish_at = $2,
         platform_title = $3,
         platform_caption = $4,
         published_url = CASE WHEN publication_status = 'posted' THEN $5 ELSE published_url END,
         updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [id, value.planned_publish_at, value.platform_title, value.platform_caption, value.published_url]
  );

  if (!rows[0]) {
    throw new ContentPublicationError("content_publication_not_found", "Publikasi tidak ditemukan.", 404);
  }
  return getContentPublication(id);
}

export async function updateContentPublicationStatus(id: string, input: ContentPublicationInput): Promise<ContentPublicationRow> {
  assertUuid(id);
  const value = validateStatusActionInput(input);

  try {
    const updatedId = await withTransaction(async (client) => {
      const rows = await clientRows<PublicationForUpdate>(
        client,
        `${publicationSelect}
         WHERE cp.id = $1
         FOR UPDATE OF cp`,
        [id]
      );
      const current = rows[0];
      if (!current) {
        throw new ContentPublicationError("content_publication_not_found", "Publikasi tidak ditemukan.", 404);
      }

      assertChannelFormat(current.channel, current.publication_format);
      const next = value.publication_status;
      const allowed = publicationTransitions[current.publication_status] || [];
      if (!allowed.includes(next)) {
        throw new ContentPublicationError("invalid_publication_transition", "Perubahan publication status tidak valid.", 409);
      }

      let plannedPublishAt = value.planned_publish_at ?? formatTimestamp(current.planned_publish_at);
      let platformTitle = value.platform_title ?? current.platform_title;
      let publishedAt = formatTimestamp(current.published_at);
      let publishedUrl = current.published_url;
      let failureReason = current.failure_reason;

      if (next === "scheduled") {
        assertParentApproved(current);
        assertHasSchedule(plannedPublishAt);
        assertYoutubeTitle(current, platformTitle);
        failureReason = null;
        publishedAt = null;
      }

      if (next === "publishing") {
        assertParentApproved(current);
        assertHasSchedule(plannedPublishAt);
        assertYoutubeTitle(current, platformTitle);
      }

      if (next === "posted") {
        if (!value.published_at) {
          throw new ContentPublicationError("published_at_required", "Published at wajib diisi.", 400);
        }
        publishedAt = value.published_at;
        publishedUrl = value.published_url;
        failureReason = null;
        assertHasSchedule(plannedPublishAt);
        assertYoutubeTitle(current, platformTitle);
      }

      if (next === "failed") {
        if (!value.failure_reason) {
          throw new ContentPublicationError("failure_reason_required", "Failure reason wajib diisi.", 400);
        }
        failureReason = value.failure_reason;
      }

      if (next === "planned") {
        if (current.published_at) {
          throw new ContentPublicationError("invalid_publication_transition", "Publication yang pernah terposting tidak dapat diaktifkan ulang.", 409);
        }
        failureReason = null;
        publishedAt = null;
      }

      const updated = await clientRows<{ id: string }>(
        client,
        `UPDATE content_publications
         SET publication_status = $2,
             planned_publish_at = $3,
             platform_title = $4,
             published_url = $5,
             published_at = $6,
             failure_reason = $7,
             updated_at = now()
         WHERE id = $1
         RETURNING id`,
        [id, next, plannedPublishAt, platformTitle, publishedUrl, publishedAt, failureReason]
      );
      return updated[0].id;
    });

    return getContentPublication(updatedId);
  } catch (error: any) {
    handleWriteError(error);
  }
}
