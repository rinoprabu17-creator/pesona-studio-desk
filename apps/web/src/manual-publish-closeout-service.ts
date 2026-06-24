import { query } from "./db.ts";
import { ManualPublishCloseoutError } from "./manual-publish-closeout-errors.ts";
import { getManualPublishReportPackageDetail } from "./manual-publish-report-service.ts";
import type { ManualPublishReportPackage } from "./manual-publish-report-service.ts";
import { assertUuid } from "./validation/library-validation.ts";
import { validateManualPublishCloseoutInput } from "./validation/manual-publish-closeout-validation.ts";

export type ManualPublishCloseoutRow = {
  id: string;
  package_id: string;
  content_item_id: string;
  closeout_status: string;
  report_status_snapshot: string;
  package_status_snapshot: string;
  selected_channel_count_snapshot: number;
  checklist_total_snapshot: number;
  checklist_done_snapshot: number;
  evidence_count_snapshot: number;
  manual_url_channel_count_snapshot: number;
  channels_with_manual_url_snapshot: string;
  missing_manual_url_channels_snapshot: string;
  closed_by_name: string | null;
  closeout_note: string | null;
  closed_at: string;
  created_at: string;
  updated_at: string;
};

export type ManualPublishCloseoutEligibility = {
  ok: boolean;
  blocking_reasons: string[];
  package_id: string;
  report_status: string;
  checklist_done: number;
  checklist_total: number;
  selected_channel_count: number;
  manual_url_channel_count: number;
  channels_with_manual_url: string[];
  missing_manual_url_channels: string[];
  existing_closeout_id: string | null;
};

export type ManualPublishCloseoutDetail = ManualPublishCloseoutRow & {
  content_code: string;
  content_title: string;
  campaign_code: string;
  campaign_name: string;
};

export type ManualPublishCloseoutListFilters = {
  package_id?: string | null;
  content_item_id?: string | null;
  closeout_status?: string | null;
  limit?: number | null;
};

const closeoutSelect = `
  SELECT id,
         package_id,
         content_item_id,
         closeout_status,
         report_status_snapshot,
         package_status_snapshot,
         selected_channel_count_snapshot,
         checklist_total_snapshot,
         checklist_done_snapshot,
         evidence_count_snapshot,
         manual_url_channel_count_snapshot,
         channels_with_manual_url_snapshot,
         missing_manual_url_channels_snapshot,
         closed_by_name,
         closeout_note,
         closed_at,
         created_at,
         updated_at
  FROM manual_publish_closeouts
`;

function mapCloseout(row: ManualPublishCloseoutRow): ManualPublishCloseoutRow {
  return {
    ...row,
    selected_channel_count_snapshot: Number(row.selected_channel_count_snapshot),
    checklist_total_snapshot: Number(row.checklist_total_snapshot),
    checklist_done_snapshot: Number(row.checklist_done_snapshot),
    evidence_count_snapshot: Number(row.evidence_count_snapshot),
    manual_url_channel_count_snapshot: Number(row.manual_url_channel_count_snapshot)
  };
}

function blockingReasons(report: ManualPublishReportPackage, existingCloseoutId: string | null): string[] {
  const reasons: string[] = [];
  if (existingCloseoutId) {
    reasons.push("Closeout sudah ada untuk package ini.");
  }
  if (report.report_status !== "ready_evidence_complete") {
    reasons.push(`Report status belum ready_evidence_complete: ${report.report_status}.`);
  }
  if (!report.checklist_initialized) {
    reasons.push("Checklist belum diinisialisasi untuk semua channel.");
  }
  if (!report.checklist_complete) {
    reasons.push(`Checklist belum lengkap: ${report.checklist_done}/${report.checklist_total}.`);
  }
  if (!report.manual_url_complete) {
    reasons.push(`Manual URL belum lengkap untuk channel: ${report.missing_manual_url_channels.join(", ") || "-"}.`);
  }
  if (report.selected_channel_count <= 0) {
    reasons.push("Package belum memiliki selected channel.");
  }
  return reasons;
}

export async function getManualPublishCloseoutByPackageId(packageId: string): Promise<ManualPublishCloseoutRow | null> {
  assertUuid(packageId);
  const rows = await query<ManualPublishCloseoutRow>(`${closeoutSelect} WHERE package_id = $1`, [packageId]);
  return rows[0] ? mapCloseout(rows[0]) : null;
}

export async function getManualPublishCloseoutEligibility(packageId: string): Promise<ManualPublishCloseoutEligibility> {
  assertUuid(packageId);
  const report = await getManualPublishReportPackageDetail(packageId);
  const existing = await getManualPublishCloseoutByPackageId(packageId);
  const reasons = blockingReasons(report, existing?.id || null);
  return {
    ok: reasons.length === 0,
    blocking_reasons: reasons,
    package_id: packageId,
    report_status: report.report_status,
    checklist_done: report.checklist_done,
    checklist_total: report.checklist_total,
    selected_channel_count: report.selected_channel_count,
    manual_url_channel_count: report.manual_url_channel_count,
    channels_with_manual_url: report.channels_with_manual_url,
    missing_manual_url_channels: report.missing_manual_url_channels,
    existing_closeout_id: existing?.id || null
  };
}

export async function createManualPublishCloseout(packageId: string, input: unknown = {}): Promise<ManualPublishCloseoutRow> {
  assertUuid(packageId);
  const value = validateManualPublishCloseoutInput(input);
  const report = await getManualPublishReportPackageDetail(packageId);
  const existing = await getManualPublishCloseoutByPackageId(packageId);
  if (existing) {
    throw new ManualPublishCloseoutError("manual_publish_closeout_duplicate", "Closeout sudah ada untuk package ini.", 409);
  }
  const reasons = blockingReasons(report, null);
  if (reasons.length > 0) {
    throw new ManualPublishCloseoutError("manual_publish_closeout_not_ready", reasons.join(" "), 400);
  }
  const rows = await query<ManualPublishCloseoutRow>(
    `INSERT INTO manual_publish_closeouts (
       package_id,
       content_item_id,
       report_status_snapshot,
       package_status_snapshot,
       selected_channel_count_snapshot,
       checklist_total_snapshot,
       checklist_done_snapshot,
       evidence_count_snapshot,
       manual_url_channel_count_snapshot,
       channels_with_manual_url_snapshot,
       missing_manual_url_channels_snapshot,
       closed_by_name,
       closeout_note
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING id,
               package_id,
               content_item_id,
               closeout_status,
               report_status_snapshot,
               package_status_snapshot,
               selected_channel_count_snapshot,
               checklist_total_snapshot,
               checklist_done_snapshot,
               evidence_count_snapshot,
               manual_url_channel_count_snapshot,
               channels_with_manual_url_snapshot,
               missing_manual_url_channels_snapshot,
               closed_by_name,
               closeout_note,
               closed_at,
               created_at,
               updated_at`,
    [
      report.package_id,
      report.content_item_id,
      report.report_status,
      report.package_status,
      report.selected_channel_count,
      report.checklist_total,
      report.checklist_done,
      report.evidence_count,
      report.manual_url_channel_count,
      report.channels_with_manual_url.join(","),
      report.missing_manual_url_channels.join(","),
      value.closed_by_name,
      value.closeout_note
    ]
  );
  return mapCloseout(rows[0]);
}

export async function getManualPublishCloseoutDetail(closeoutId: string): Promise<ManualPublishCloseoutDetail> {
  assertUuid(closeoutId);
  const rows = await query<ManualPublishCloseoutDetail>(
    `SELECT closeout.id,
            closeout.package_id,
            closeout.content_item_id,
            closeout.closeout_status,
            closeout.report_status_snapshot,
            closeout.package_status_snapshot,
            closeout.selected_channel_count_snapshot,
            closeout.checklist_total_snapshot,
            closeout.checklist_done_snapshot,
            closeout.evidence_count_snapshot,
            closeout.manual_url_channel_count_snapshot,
            closeout.channels_with_manual_url_snapshot,
            closeout.missing_manual_url_channels_snapshot,
            closeout.closed_by_name,
            closeout.closeout_note,
            closeout.closed_at,
            closeout.created_at,
            closeout.updated_at,
            item.content_code,
            item.title AS content_title,
            campaign.code AS campaign_code,
            campaign.name AS campaign_name
     FROM manual_publish_closeouts closeout
     JOIN content_items item ON item.id = closeout.content_item_id
     JOIN campaigns campaign ON campaign.id = item.campaign_id
     WHERE closeout.id = $1`,
    [closeoutId]
  );
  if (!rows[0]) {
    throw new ManualPublishCloseoutError("manual_publish_closeout_not_found", "Closeout manual publish tidak ditemukan.", 404);
  }
  return { ...mapCloseout(rows[0]), content_code: rows[0].content_code, content_title: rows[0].content_title, campaign_code: rows[0].campaign_code, campaign_name: rows[0].campaign_name };
}

export async function listManualPublishCloseouts(filters: ManualPublishCloseoutListFilters = {}): Promise<ManualPublishCloseoutDetail[]> {
  const limitRaw = Number(filters.limit || 50);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(Math.trunc(limitRaw), 200)) : 50;
  const params: unknown[] = [];
  const conditions: string[] = [];
  if (filters.package_id) {
    assertUuid(filters.package_id);
    params.push(filters.package_id);
    conditions.push(`closeout.package_id = $${params.length}`);
  }
  if (filters.content_item_id) {
    assertUuid(filters.content_item_id);
    params.push(filters.content_item_id);
    conditions.push(`closeout.content_item_id = $${params.length}`);
  }
  if (filters.closeout_status) {
    if (filters.closeout_status !== "closed") {
      throw new ManualPublishCloseoutError("invalid_manual_publish_closeout_status", "Status closeout manual publish tidak valid.", 400);
    }
    params.push(filters.closeout_status);
    conditions.push(`closeout.closeout_status = $${params.length}`);
  }
  params.push(limit);
  const rows = await query<ManualPublishCloseoutDetail>(
    `SELECT closeout.id,
            closeout.package_id,
            closeout.content_item_id,
            closeout.closeout_status,
            closeout.report_status_snapshot,
            closeout.package_status_snapshot,
            closeout.selected_channel_count_snapshot,
            closeout.checklist_total_snapshot,
            closeout.checklist_done_snapshot,
            closeout.evidence_count_snapshot,
            closeout.manual_url_channel_count_snapshot,
            closeout.channels_with_manual_url_snapshot,
            closeout.missing_manual_url_channels_snapshot,
            closeout.closed_by_name,
            closeout.closeout_note,
            closeout.closed_at,
            closeout.created_at,
            closeout.updated_at,
            item.content_code,
            item.title AS content_title,
            campaign.code AS campaign_code,
            campaign.name AS campaign_name
     FROM manual_publish_closeouts closeout
     JOIN content_items item ON item.id = closeout.content_item_id
     JOIN campaigns campaign ON campaign.id = item.campaign_id
     ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
     ORDER BY closeout.closed_at DESC, closeout.id
     LIMIT $${params.length}`,
    params
  );
  return rows.map((row) => ({ ...mapCloseout(row), content_code: row.content_code, content_title: row.content_title, campaign_code: row.campaign_code, campaign_name: row.campaign_name }));
}
