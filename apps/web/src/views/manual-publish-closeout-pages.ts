import {
  getManualPublishCloseoutDetail,
  getManualPublishCloseoutEligibility,
  listManualPublishCloseouts
} from "../manual-publish-closeout-service.ts";
import type { ManualPublishCloseoutDetail, ManualPublishCloseoutEligibility } from "../manual-publish-closeout-service.ts";
import { getManualPublishReportPackageDetail } from "../manual-publish-report-service.ts";
import { escapeHtml, renderLayout, renderMessage, renderReadOnlyTable } from "./layout.ts";

function safetyNotice(): string {
  return `<div class="notice">Closeout adalah sertifikat DB-only. Tidak publish, tidak upload, tidak scheduler, tidak publisher, tidak OpenAI, tidak social API, tidak membuat content_publications, dan tidak mutasi file video.</div>`;
}

function eligibilityTable(eligibility: ManualPublishCloseoutEligibility): string {
  return renderReadOnlyTable(
    ["Field", "Value"],
    [
      ["Eligible", eligibility.ok ? "Ya" : "Belum"],
      ["Report Status", escapeHtml(eligibility.report_status)],
      ["Checklist", `${escapeHtml(eligibility.checklist_done)} / ${escapeHtml(eligibility.checklist_total)}`],
      ["Selected Channels", escapeHtml(eligibility.selected_channel_count)],
      ["Manual URL Channels", escapeHtml(eligibility.manual_url_channel_count)],
      ["Channels With URL", escapeHtml(eligibility.channels_with_manual_url.join(", ") || "-")],
      ["Missing Manual URL", escapeHtml(eligibility.missing_manual_url_channels.join(", ") || "-")],
      ["Existing Closeout", escapeHtml(eligibility.existing_closeout_id || "-")],
      ["Blocking Reasons", escapeHtml(eligibility.blocking_reasons.join(" ") || "-")]
    ]
  );
}

function closeoutRows(rows: ManualPublishCloseoutDetail[]): unknown[][] {
  return rows.map((row) => [
    `<a href="/manual-publish-closeouts/${escapeHtml(row.id)}">${escapeHtml(row.id)}</a>`,
    `<strong>${escapeHtml(row.content_code)}</strong><br><span class="muted">${escapeHtml(row.content_title)}</span>`,
    escapeHtml(row.closeout_status),
    escapeHtml(row.report_status_snapshot),
    `${escapeHtml(row.checklist_done_snapshot)} / ${escapeHtml(row.checklist_total_snapshot)}`,
    escapeHtml(row.manual_url_channel_count_snapshot),
    escapeHtml(row.closed_by_name || "-"),
    escapeHtml(row.closed_at)
  ]);
}

export async function renderManualPublishCloseoutListPage(url: URL): Promise<string> {
  const rows = await listManualPublishCloseouts({
    package_id: url.searchParams.get("package_id"),
    content_item_id: url.searchParams.get("content_item_id"),
    closeout_status: url.searchParams.get("closeout_status"),
    limit: Number(url.searchParams.get("limit") || 50)
  });
  const table = renderReadOnlyTable(
    ["Closeout", "Content", "Status", "Report", "Checklist", "Manual URL", "Closed By", "Closed At"],
    closeoutRows(rows)
  );
  return renderLayout(
    "/manual-publish-closeouts",
    "Manual Publish Closeouts",
    "Manual Publish",
    "Daftar sertifikat closeout manual publish DB-only.",
    `${renderMessage(url)}${safetyNotice()}<section><h2>Closeouts</h2>${table}</section>`
  );
}

export async function renderManualPublishCloseoutDetailPage(closeoutId: string, url: URL): Promise<string> {
  const row = await getManualPublishCloseoutDetail(closeoutId);
  const table = renderReadOnlyTable(
    ["Field", "Value"],
    [
      ["Closeout ID", escapeHtml(row.id)],
      ["Package ID", escapeHtml(row.package_id)],
      ["Content", `${escapeHtml(row.content_code)} - ${escapeHtml(row.content_title)}`],
      ["Campaign", `${escapeHtml(row.campaign_code)} - ${escapeHtml(row.campaign_name)}`],
      ["Status", escapeHtml(row.closeout_status)],
      ["Report Snapshot", escapeHtml(row.report_status_snapshot)],
      ["Package Status Snapshot", escapeHtml(row.package_status_snapshot)],
      ["Selected Channels", escapeHtml(row.selected_channel_count_snapshot)],
      ["Checklist", `${escapeHtml(row.checklist_done_snapshot)} / ${escapeHtml(row.checklist_total_snapshot)}`],
      ["Evidence Count", escapeHtml(row.evidence_count_snapshot)],
      ["Manual URL Channels", escapeHtml(row.channels_with_manual_url_snapshot || "-")],
      ["Missing Manual URL Channels", escapeHtml(row.missing_manual_url_channels_snapshot || "-")],
      ["Closed By", escapeHtml(row.closed_by_name || "-")],
      ["Note", escapeHtml(row.closeout_note || "-")],
      ["Closed At", escapeHtml(row.closed_at)]
    ]
  );
  return renderLayout(
    "/manual-publish-closeouts",
    "Manual Publish Closeout Detail",
    "Manual Publish",
    "Detail sertifikat closeout manual publish DB-only.",
    `${renderMessage(url)}${safetyNotice()}<div class="button-row"><a class="button secondary" href="/manual-publish-closeouts">Back to Closeouts</a><a class="button secondary" href="/publication-packages/${escapeHtml(row.package_id)}">Package Detail</a></div>${table}`
  );
}

export async function renderManualPublishCloseoutPackagePage(packageId: string, url: URL): Promise<string> {
  const [report, eligibility] = await Promise.all([
    getManualPublishReportPackageDetail(packageId),
    getManualPublishCloseoutEligibility(packageId)
  ]);
  const form = eligibility.ok && !eligibility.existing_closeout_id
    ? `<form method="post" action="/publication-packages/${escapeHtml(packageId)}/closeout/create">
        <div class="form-grid">
          <label>Nama Closeout<input type="text" name="closed_by_name" maxlength="120" /></label>
        </div>
        <label>Catatan Closeout<textarea name="closeout_note" maxlength="2000" rows="3"></textarea></label>
        <button type="submit">Create Closeout</button>
      </form>`
    : `<p class="hint">Closeout belum bisa dibuat: ${escapeHtml(eligibility.blocking_reasons.join(" ") || "Closeout sudah ada.")}</p>`;
  const summary = renderReadOnlyTable(
    ["Field", "Value"],
    [
      ["Package ID", escapeHtml(report.package_id)],
      ["Content", `${escapeHtml(report.content_code)} - ${escapeHtml(report.content_title)}`],
      ["Package Status", escapeHtml(report.package_status)],
      ["Report Status", escapeHtml(report.report_status)],
      ["Checklist", `${escapeHtml(report.checklist_done)} / ${escapeHtml(report.checklist_total)}`],
      ["Evidence Count", escapeHtml(report.evidence_count)],
      ["Selected Channels", escapeHtml(report.selected_channel_count)]
    ]
  );
  return renderLayout(
    "/manual-publish-closeouts",
    "Manual Publish Closeout",
    "Manual Publish",
    "Closeout hanya bisa dibuat saat semua checklist selesai dan semua channel punya manual URL evidence.",
    `${renderMessage(url)}${safetyNotice()}<div class="button-row"><a class="button secondary" href="/manual-publish-report/packages/${escapeHtml(packageId)}">Report Detail</a><a class="button secondary" href="/publication-packages/${escapeHtml(packageId)}/checklist">Checklist</a></div><section><h2>Package Summary</h2>${summary}</section><section><h2>Eligibility</h2>${eligibilityTable(eligibility)}</section><section><h2>Create Closeout</h2>${form}</section>`
  );
}
