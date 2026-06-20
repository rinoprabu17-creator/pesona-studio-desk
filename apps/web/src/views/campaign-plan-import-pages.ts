import { escapeHtml, renderLayout, renderReadOnlyTable } from "./layout.ts";
import type { CampaignPlanImportResult } from "../campaign-plan-import-service.ts";

const statusLabels: Record<string, string> = {
  queued: "Menunggu",
  generating: "Sedang Generate",
  validation_failed: "Validasi Gagal",
  ready_for_review: "Siap Direview",
  approved: "Disetujui",
  importing: "Import",
  imported: "Terimport",
  failed: "Gagal",
  rejected: "Ditolak",
  cancelled: "Dibatalkan"
};

function formatDateTime(value: unknown): string {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function importedContentLinks(result: CampaignPlanImportResult): string {
  if (!result.content_items.length) return `<p class="hint">Belum ada konten hasil import.</p>`;
  return renderReadOnlyTable(
    ["Draft", "Content Code", "Judul", "Owner Notes", "Aksi"],
    result.content_items.map((item) => [
      `#${escapeHtml(item.draft_sequence)}`,
      `<strong>${escapeHtml(item.content_code)}</strong>`,
      escapeHtml(item.title),
      escapeHtml(item.notes || "-"),
      `<a class="button button-secondary" href="/content-items/${escapeHtml(item.content_item_id)}">Buka Konten</a>`
    ])
  );
}

export function renderCampaignPlanImportPage(result: CampaignPlanImportResult, url: URL, errorMessage?: string): string {
  const success = url.searchParams.get("success");
  const successHtml = success ? `<div class="notice success">${escapeHtml(success)}</div>` : "";
  const errorHtml = errorMessage ? `<div class="notice error">${escapeHtml(errorMessage)}</div>` : "";
  const isApproved = result.status === "approved";
  const isImported = result.status === "imported";
  const importButton = isApproved
    ? `<form method="post" action="/campaign-plan-runs/${escapeHtml(result.run_id)}/import">
        <button type="submit">Import ke Kalender Konten</button>
      </form>`
    : "";
  const statusNotice = isImported
    ? `<div class="notice success">Rencana telah berhasil diimpor.</div>`
    : !isApproved
      ? `<div class="notice">Run belum berada pada status Disetujui. Import belum tersedia.</div>`
      : "";
  const importedLinks = isImported
    ? `
      <section>
        <h2>Hasil Import</h2>
        <div class="button-row">
          <a class="button" href="/content-calendar">Buka Kalender Konten</a>
          <a class="button button-secondary" href="/campaigns/${escapeHtml(result.campaign.id)}">Buka Campaign</a>
        </div>
        ${importedContentLinks(result)}
      </section>
    `
    : "";

  return renderLayout(
    "/campaigns",
    "Import Rencana Konten",
    "Campaign Planner",
    "Konfirmasi import draft approved ke Kalender Konten manual.",
    `
      ${successHtml}${errorHtml}${statusNotice}
      <div class="button-row">
        ${importButton}
        <a class="button button-secondary" href="/campaign-plan-runs/${escapeHtml(result.run_id)}/review">Kembali ke Review</a>
      </div>
      ${renderReadOnlyTable(["Field", "Nilai"], [
        ["Campaign", `${escapeHtml(result.campaign.code)} - ${escapeHtml(result.campaign.name)}`],
        ["Run ID", escapeHtml(result.run_id)],
        ["Run Status", escapeHtml(statusLabels[result.status] || result.status)],
        ["Approved At", escapeHtml(formatDateTime(result.approved_at))],
        ["Imported At", escapeHtml(formatDateTime(result.imported_at))],
        ["Approved Draft", String(result.summary.approved_draft_items)],
        ["Rejected Draft", String(result.summary.rejected_draft_items)],
        ["Publication dari Draft Approved", String(result.summary.publications_created)]
      ])}
      <div class="notice">Hanya draft berstatus Disetujui yang akan diimpor.</div>
      <div class="notice">Draft Ditolak tidak akan masuk Kalender Konten.</div>
      <div class="notice">Import berjalan all-or-nothing.</div>
      ${importedLinks}
    `
  );
}
