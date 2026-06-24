import {
  getManualPublishReportBoard,
  getManualPublishReportPackageDetail
} from "../manual-publish-report-service.ts";
import type { ManualPublishReportPackage, ManualPublishReportPackageChannel } from "../manual-publish-report-service.ts";
import { escapeHtml, renderLayout, renderMessage, renderReadOnlyTable } from "./layout.ts";

function statusBadge(status: string): string {
  const className = status === "ready_evidence_complete" ? "badge badge-ok" : status === "no_checklist" ? "badge" : "badge badge-warning";
  return `<span class="${className}">${escapeHtml(status)}</span>`;
}

function renderFilters(url: URL): string {
  return `<form method="get" action="/manual-publish-report">
    <div class="form-grid">
      <label>Search
        <input name="q" value="${escapeHtml(url.searchParams.get("q") || "")}" placeholder="Kode konten, judul, campaign">
      </label>
      <label>Status Package
        <input name="package_status" value="${escapeHtml(url.searchParams.get("package_status") || "")}" placeholder="ready_manual_publish">
      </label>
      <label>Channel
        <select name="channel">
          <option value="">Semua</option>
          ${["instagram", "facebook", "tiktok", "youtube"].map((channel) => `<option value="${channel}"${url.searchParams.get("channel") === channel ? " selected" : ""}>${channel}</option>`).join("")}
        </select>
      </label>
      <label>Status Report
        <select name="report_status">
          <option value="">Semua</option>
          ${["no_checklist", "checklist_incomplete", "missing_manual_url", "ready_evidence_complete"].map((status) => `<option value="${status}"${url.searchParams.get("report_status") === status ? " selected" : ""}>${status}</option>`).join("")}
        </select>
      </label>
    </div>
    <div class="button-row">
      <button type="submit">Filter</button>
      <a class="button secondary" href="/manual-publish-report">Reset</a>
      <a class="button secondary" href="/api/manual-publish-report/export.csv?${escapeHtml(url.searchParams.toString())}">Export CSV</a>
    </div>
  </form>`;
}

function summaryCards(summary: Awaited<ReturnType<typeof getManualPublishReportBoard>>["summary"]): string {
  const rows = [
    ["Total", summary.total_packages],
    ["No Checklist", summary.no_checklist],
    ["Checklist Incomplete", summary.checklist_incomplete],
    ["Missing Manual URL", summary.missing_manual_url],
    ["Ready Evidence Complete", summary.ready_evidence_complete]
  ];
  return `<div class="stat-grid">${rows.map(([label, value]) => `<div class="stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div>`;
}

function packageRows(packages: ManualPublishReportPackage[]): unknown[][] {
  return packages.map((pkg) => [
    `<strong>${escapeHtml(pkg.content_code)}</strong><br><span class="muted">${escapeHtml(pkg.content_title)}</span>`,
    escapeHtml(pkg.package_status),
    statusBadge(pkg.report_status),
    `${escapeHtml(pkg.checklist_done)}/${escapeHtml(pkg.checklist_total)}`,
    escapeHtml(pkg.evidence_count),
    escapeHtml(pkg.channels_with_manual_url.join(", ") || "-"),
    escapeHtml(pkg.missing_manual_url_channels.join(", ") || "-"),
    `<a href="/manual-publish-report/packages/${escapeHtml(pkg.package_id)}">Detail</a> · <a href="/publication-packages/${escapeHtml(pkg.package_id)}">Package</a> · <a href="/publication-packages/${escapeHtml(pkg.package_id)}/checklist">Checklist</a> · <a href="/publication-packages/${escapeHtml(pkg.package_id)}/closeout">Closeout</a>`
  ]);
}

function channelRows(channels: ManualPublishReportPackageChannel[]): unknown[][] {
  return channels.map((channel) => [
    escapeHtml(channel.channel),
    escapeHtml(channel.channel_status),
    escapeHtml(channel.publication_format),
    statusBadge(channel.channel_report_status),
    `${escapeHtml(channel.checklist_done)}/${escapeHtml(channel.checklist_total)}`,
    escapeHtml(channel.checklist_pending),
    escapeHtml(channel.checklist_blocked),
    escapeHtml(channel.checklist_skipped),
    escapeHtml(channel.evidence_count),
    channel.has_manual_post_url ? "Ada" : "Belum ada",
    escapeHtml(channel.latest_manual_post_url || "-"),
    escapeHtml(channel.missing_checklist_keys.join(", ") || "-")
  ]);
}

function safetyNotice(): string {
  return `<div class="notice">Report ini read-only. CSV dibuat sebagai response saja. Tidak upload, tidak scheduler, tidak publisher, tidak OpenAI, tidak social API, dan tidak mutasi file video.</div>`;
}

export async function renderManualPublishReportListPage(url: URL): Promise<string> {
  const board = await getManualPublishReportBoard({
    q: url.searchParams.get("q"),
    package_status: url.searchParams.get("package_status"),
    channel: url.searchParams.get("channel"),
    report_status: url.searchParams.get("report_status"),
    limit: url.searchParams.get("limit")
  });
  const table = renderReadOnlyTable(
    ["Konten", "Package", "Report", "Checklist", "Evidence", "Manual URL", "Missing URL", "Aksi"],
    packageRows(board.packages)
  );
  return renderLayout(
    "/manual-publish-report",
    "Manual Publish Report",
    "Manual Publish",
    "Board laporan read-only untuk melihat kelengkapan checklist dan evidence manual publish.",
    `${renderMessage(url)}${safetyNotice()}${renderFilters(url)}${summaryCards(board.summary)}<section><h2>Package Report</h2>${table}</section>`
  );
}

export async function renderManualPublishReportDetailPage(packageId: string, url: URL): Promise<string> {
  const pkg = await getManualPublishReportPackageDetail(packageId);
  const summary = renderReadOnlyTable(
    ["Field", "Value"],
    [
      ["Package ID", escapeHtml(pkg.package_id)],
      ["Content", `${escapeHtml(pkg.content_code)} - ${escapeHtml(pkg.content_title)}`],
      ["Campaign", `${escapeHtml(pkg.campaign_code)} - ${escapeHtml(pkg.campaign_name)}`],
      ["Package Status", escapeHtml(pkg.package_status)],
      ["Report Status", statusBadge(pkg.report_status)],
      ["Approved Output", escapeHtml(pkg.approved_output_relative_path_snapshot)],
      ["Checklist", `${escapeHtml(pkg.checklist_done)}/${escapeHtml(pkg.checklist_total)}`],
      ["Evidence Count", escapeHtml(pkg.evidence_count)],
      ["Missing Manual URL Channels", escapeHtml(pkg.missing_manual_url_channels.join(", ") || "-")]
    ]
  );
  const channels = renderReadOnlyTable(
    ["Channel", "Status", "Format", "Report", "Checklist", "Pending", "Blocked", "Skipped", "Evidence", "Manual URL", "Latest URL", "Missing Keys"],
    channelRows(pkg.channels)
  );
  return renderLayout(
    "/manual-publish-report",
    "Manual Publish Report Detail",
    "Manual Publish",
    "Detail read-only checklist dan evidence per channel.",
    `${renderMessage(url)}${safetyNotice()}<div class="button-row"><a class="button secondary" href="/manual-publish-report">Back to Report</a><a class="button secondary" href="/publication-packages/${escapeHtml(pkg.package_id)}">Package Detail</a><a class="button secondary" href="/publication-packages/${escapeHtml(pkg.package_id)}/checklist">Checklist</a><a class="button secondary" href="/publication-packages/${escapeHtml(pkg.package_id)}/closeout">Closeout</a></div><section><h2>Package Summary</h2>${summary}</section><section><h2>Channel Report</h2>${channels}</section>`
  );
}
