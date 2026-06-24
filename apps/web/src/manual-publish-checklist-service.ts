import { query, withTransaction } from "./db.ts";
import type { DatabaseClient } from "./db.ts";
import { ManualPublishChecklistError } from "./manual-publish-checklist-errors.ts";
import { assertUuid } from "./validation/library-validation.ts";
import {
  manualPublishChecklistKeys,
  validateManualPublishChannel,
  validateManualPublishChecklistItemInput,
  validateManualPublishEvidenceInput
} from "./validation/manual-publish-checklist-validation.ts";

export type ManualPublishChecklistItemRow = {
  id: string;
  package_id: string;
  package_channel_id: string;
  content_item_id: string;
  channel: string;
  checklist_key: string;
  checklist_label: string;
  checklist_status: string;
  is_done: boolean;
  checked_by_name: string | null;
  checked_at: string | null;
  checklist_note: string | null;
  created_at: string;
  updated_at: string;
};

export type ManualPublishEvidenceLogRow = {
  id: string;
  package_id: string;
  package_channel_id: string;
  content_item_id: string;
  channel: string;
  evidence_type: string;
  evidence_value: string | null;
  evidence_note: string | null;
  recorded_by_name: string | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
};

export type ManualPublishPackageChannelContext = {
  package_channel_id: string;
  package_id: string;
  content_item_id: string;
  channel: string;
  channel_status: string;
  publication_format: string;
};

export type ManualPublishPackageContext = {
  package: {
    id: string;
    package_status: string;
    approved_output_relative_path_snapshot: string;
    content_item_id: string;
    content_code: string;
    content_title: string;
    campaign_code: string;
    campaign_name: string;
  };
  channels: ManualPublishPackageChannelContext[];
  checklistItems: ManualPublishChecklistItemRow[];
  evidenceLogs: ManualPublishEvidenceLogRow[];
  summary: ManualPublicationPackageCompletionSummary;
};

export type ManualPublicationPackageCompletionSummary = {
  package_id: string;
  package_status: string;
  selected_channel_count: number;
  checklist_total: number;
  checklist_done: number;
  checklist_pending: number;
  evidence_count: number;
  manual_url_channel_count: number;
  channels_with_manual_url: string[];
};

const checklistLabels: Record<string, string> = {
  video_file_confirmed: "Video file confirmed",
  caption_ready: "Caption ready",
  hashtags_ready: "Hashtags ready",
  cta_ready: "CTA ready",
  account_login_ready: "Account login ready",
  manual_post_created: "Manual post created",
  manual_url_recorded: "Manual URL recorded",
  final_visual_check: "Final visual check"
};

const checklistSelect = `
  SELECT id,
         package_id,
         package_channel_id,
         content_item_id,
         channel,
         checklist_key,
         checklist_label,
         checklist_status,
         is_done,
         checked_by_name,
         checked_at,
         checklist_note,
         created_at,
         updated_at
  FROM manual_publish_checklist_items
`;

const evidenceSelect = `
  SELECT id,
         package_id,
         package_channel_id,
         content_item_id,
         channel,
         evidence_type,
         evidence_value,
         evidence_note,
         recorded_by_name,
         recorded_at,
         created_at,
         updated_at
  FROM manual_publish_evidence_logs
`;

function mapChecklist(row: ManualPublishChecklistItemRow): ManualPublishChecklistItemRow {
  return { ...row, is_done: Boolean(row.is_done) };
}

function mapEvidence(row: ManualPublishEvidenceLogRow): ManualPublishEvidenceLogRow {
  return row;
}

async function getPackageBase(packageId: string, client?: DatabaseClient): Promise<ManualPublishPackageContext["package"]> {
  const sql = `SELECT package.id,
                      package.package_status,
                      package.approved_output_relative_path_snapshot,
                      package.content_item_id,
                      item.content_code,
                      item.title AS content_title,
                      campaign.code AS campaign_code,
                      campaign.name AS campaign_name
               FROM manual_publication_packages package
               JOIN content_items item ON item.id = package.content_item_id
               JOIN campaigns campaign ON campaign.id = item.campaign_id
               WHERE package.id = $1`;
  const result = client
    ? await client.query<ManualPublishPackageContext["package"]>(sql, [packageId])
    : { rows: await query<ManualPublishPackageContext["package"]>(sql, [packageId]) };
  if (!result.rows[0]) {
    throw new ManualPublishChecklistError("manual_publish_package_not_found", "Manual publication package tidak ditemukan.", 404);
  }
  return result.rows[0];
}

async function listPackageChannels(packageId: string, client?: DatabaseClient): Promise<ManualPublishPackageChannelContext[]> {
  const sql = `SELECT id AS package_channel_id,
                      package_id,
                      content_item_id,
                      channel,
                      channel_status,
                      publication_format
               FROM manual_publication_package_channels
               WHERE package_id = $1
               ORDER BY channel`;
  const result = client
    ? await client.query<ManualPublishPackageChannelContext>(sql, [packageId])
    : { rows: await query<ManualPublishPackageChannelContext>(sql, [packageId]) };
  return result.rows;
}

async function listChecklist(packageId: string, client?: DatabaseClient): Promise<ManualPublishChecklistItemRow[]> {
  const result = client
    ? await client.query<ManualPublishChecklistItemRow>(`${checklistSelect} WHERE package_id = $1 ORDER BY channel, checklist_key`, [packageId])
    : { rows: await query<ManualPublishChecklistItemRow>(`${checklistSelect} WHERE package_id = $1 ORDER BY channel, checklist_key`, [packageId]) };
  return result.rows.map(mapChecklist);
}

async function listEvidenceInternal(packageId: string, channel: string | null = null, client?: DatabaseClient): Promise<ManualPublishEvidenceLogRow[]> {
  const params: unknown[] = [packageId];
  const conditions = ["package_id = $1"];
  if (channel) {
    params.push(validateManualPublishChannel(channel));
    conditions.push(`channel = $${params.length}`);
  }
  const sql = `${evidenceSelect} WHERE ${conditions.join(" AND ")} ORDER BY recorded_at DESC, created_at DESC`;
  const result = client
    ? await client.query<ManualPublishEvidenceLogRow>(sql, params)
    : { rows: await query<ManualPublishEvidenceLogRow>(sql, params) };
  return result.rows.map(mapEvidence);
}

export async function getManualPublicationPackageCompletionSummary(packageId: string): Promise<ManualPublicationPackageCompletionSummary> {
  assertUuid(packageId);
  const pkg = await getPackageBase(packageId);
  const channels = await listPackageChannels(packageId);
  const checklistItems = await listChecklist(packageId);
  const evidenceLogs = await listEvidenceInternal(packageId);
  const channelsWithManualUrl = Array.from(new Set(
    evidenceLogs
      .filter((row) => row.evidence_type === "manual_post_url" && row.evidence_value)
      .map((row) => row.channel)
  )).sort();
  return {
    package_id: packageId,
    package_status: pkg.package_status,
    selected_channel_count: channels.length,
    checklist_total: checklistItems.length,
    checklist_done: checklistItems.filter((row) => row.is_done).length,
    checklist_pending: checklistItems.filter((row) => row.checklist_status === "pending").length,
    evidence_count: evidenceLogs.length,
    manual_url_channel_count: channelsWithManualUrl.length,
    channels_with_manual_url: channelsWithManualUrl
  };
}

export async function getManualPublishChecklistContext(packageId: string): Promise<ManualPublishPackageContext> {
  assertUuid(packageId);
  const pkg = await getPackageBase(packageId);
  const channels = await listPackageChannels(packageId);
  const checklistItems = await listChecklist(packageId);
  const evidenceLogs = await listEvidenceInternal(packageId);
  const summary = await getManualPublicationPackageCompletionSummary(packageId);
  return { package: pkg, channels, checklistItems, evidenceLogs, summary };
}

export async function getManualPublishChecklistContextForChannel(packageId: string, channelValue: string): Promise<ManualPublishPackageContext> {
  const channel = validateManualPublishChannel(channelValue);
  const context = await getManualPublishChecklistContext(packageId);
  if (!context.channels.some((row) => row.channel === channel)) {
    throw new ManualPublishChecklistError("manual_publish_channel_not_found", "Channel package manual publication tidak ditemukan.", 404);
  }
  return {
    ...context,
    channels: context.channels.filter((row) => row.channel === channel),
    checklistItems: context.checklistItems.filter((row) => row.channel === channel),
    evidenceLogs: context.evidenceLogs.filter((row) => row.channel === channel)
  };
}

export async function initializeManualPublishChecklist(packageId: string): Promise<ManualPublishPackageContext> {
  assertUuid(packageId);
  await withTransaction(async (client) => {
    await getPackageBase(packageId, client);
    const channels = await listPackageChannels(packageId, client);
    for (const channel of channels) {
      for (const checklistKey of manualPublishChecklistKeys) {
        await client.query(
          `INSERT INTO manual_publish_checklist_items (
             package_id,
             package_channel_id,
             content_item_id,
             channel,
             checklist_key,
             checklist_label
           )
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (package_channel_id, checklist_key) DO NOTHING`,
          [
            channel.package_id,
            channel.package_channel_id,
            channel.content_item_id,
            channel.channel,
            checklistKey,
            checklistLabels[checklistKey]
          ]
        );
      }
    }
  });
  return getManualPublishChecklistContext(packageId);
}

async function getChecklistItemById(itemId: string, client?: DatabaseClient): Promise<ManualPublishChecklistItemRow> {
  const result = client
    ? await client.query<ManualPublishChecklistItemRow>(`${checklistSelect} WHERE id = $1`, [itemId])
    : { rows: await query<ManualPublishChecklistItemRow>(`${checklistSelect} WHERE id = $1`, [itemId]) };
  if (!result.rows[0]) {
    throw new ManualPublishChecklistError("manual_publish_checklist_item_not_found", "Item checklist manual publish tidak ditemukan.", 404);
  }
  return mapChecklist(result.rows[0]);
}

export async function setManualPublishChecklistItemStatus(itemId: string, input: unknown): Promise<ManualPublishChecklistItemRow> {
  assertUuid(itemId);
  const value = validateManualPublishChecklistItemInput(input);
  const item = await getChecklistItemById(itemId);
  const rows = await query<ManualPublishChecklistItemRow>(
    `UPDATE manual_publish_checklist_items
     SET checklist_status = $2,
         is_done = $3,
         checked_by_name = $4,
         checked_at = CASE WHEN $2 = 'done' THEN now() ELSE checked_at END,
         checklist_note = $5,
         updated_at = now()
     WHERE id = $1
     RETURNING id,
               package_id,
               package_channel_id,
               content_item_id,
               channel,
               checklist_key,
               checklist_label,
               checklist_status,
               is_done,
               checked_by_name,
               checked_at,
               checklist_note,
               created_at,
               updated_at`,
    [item.id, value.checklist_status, value.is_done, value.checked_by_name, value.checklist_note]
  );
  return mapChecklist(rows[0]);
}

export async function setManualPublishChecklistItemStatusForPackage(
  packageId: string,
  itemId: string,
  input: unknown
): Promise<ManualPublishChecklistItemRow> {
  assertUuid(packageId);
  assertUuid(itemId);
  const item = await getChecklistItemById(itemId);
  if (item.package_id !== packageId) {
    throw new ManualPublishChecklistError("manual_publish_checklist_item_package_mismatch", "Item checklist tidak sesuai dengan package.", 404);
  }
  return setManualPublishChecklistItemStatus(itemId, input);
}

function getChannelOrThrow(channels: ManualPublishPackageChannelContext[], channel: string): ManualPublishPackageChannelContext {
  const found = channels.find((row) => row.channel === channel);
  if (!found) {
    throw new ManualPublishChecklistError("manual_publish_channel_not_found", "Channel package manual publication tidak ditemukan.", 404);
  }
  return found;
}

export async function addManualPublishEvidence(packageId: string, channelValue: string, input: unknown): Promise<ManualPublishEvidenceLogRow> {
  assertUuid(packageId);
  const channel = validateManualPublishChannel(channelValue);
  const value = validateManualPublishEvidenceInput(input);
  await getPackageBase(packageId);
  const packageChannel = getChannelOrThrow(await listPackageChannels(packageId), channel);
  const rows = await query<ManualPublishEvidenceLogRow>(
    `INSERT INTO manual_publish_evidence_logs (
       package_id,
       package_channel_id,
       content_item_id,
       channel,
       evidence_type,
       evidence_value,
       evidence_note,
       recorded_by_name
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id,
               package_id,
               package_channel_id,
               content_item_id,
               channel,
               evidence_type,
               evidence_value,
               evidence_note,
               recorded_by_name,
               recorded_at,
               created_at,
               updated_at`,
    [
      packageChannel.package_id,
      packageChannel.package_channel_id,
      packageChannel.content_item_id,
      packageChannel.channel,
      value.evidence_type,
      value.evidence_value,
      value.evidence_note,
      value.recorded_by_name
    ]
  );
  return mapEvidence(rows[0]);
}

export async function listManualPublishEvidence(packageId: string, filters: { channel?: string | null } = {}): Promise<ManualPublishEvidenceLogRow[]> {
  assertUuid(packageId);
  await getPackageBase(packageId);
  return listEvidenceInternal(packageId, filters.channel || null);
}
