import { channels } from "../../../../packages/campaign-planner/src/index.ts";
import type { CampaignRow } from "../campaign-service.ts";
import type { CampaignPlanRunSummary } from "../campaign-plan-run-service.ts";
import { escapeHtml, renderLayout, renderReadOnlyTable } from "./layout.ts";

const channelLabels: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  whatsapp_status: "WhatsApp Status"
};

const statusLabels: Record<string, string> = {
  queued: "Menunggu",
  generating: "Sedang Generate",
  validation_failed: "Validasi Gagal",
  ready_for_review: "Siap Direview",
  failed: "Gagal",
  cancelled: "Dibatalkan",
  approved: "Disetujui",
  importing: "Import",
  imported: "Terimport",
  rejected: "Ditolak"
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

function defaultPostingTime(channel: string): string {
  return {
    instagram: "09:00",
    facebook: "09:15",
    tiktok: "19:00",
    youtube: "19:15",
    whatsapp_status: "07:00"
  }[channel] || "";
}

export function renderCampaignPlanRunListSection(campaignId: string, runs: CampaignPlanRunSummary[]): string {
  const action = `<div class="button-row"><a class="button" href="/campaigns/${escapeHtml(campaignId)}/plan-runs/new">Generate Rencana Konten</a></div>`;
  if (!runs.length) {
    return `
      <section>
        <h2>Rencana Konten AI</h2>
        ${action}
        <p class="hint">Belum ada generation run untuk campaign ini.</p>
      </section>
    `;
  }

  return `
    <section>
      <h2>Rencana Konten AI</h2>
      ${action}
      ${renderReadOnlyTable(
        ["Dibuat", "Jumlah", "Provider", "Status", "Aksi"],
        runs.slice(0, 10).map((run) => [
          escapeHtml(formatDateTime(run.created_at)),
          String(run.requested_content_count),
          escapeHtml(run.provider),
          escapeHtml(statusLabels[run.status] || run.status),
          `<a class="button button-secondary" href="/campaign-plan-runs/${escapeHtml(run.id)}">Detail</a>`
        ])
      )}
    </section>
  `;
}

export function renderGenerateCampaignPlanPage(options: {
  campaign: CampaignRow;
  action: string;
  values?: Record<string, any>;
  errorMessage?: string;
}): string {
  const values = options.values || {};
  const selected = new Set<string>(Array.isArray(values.selected_channels) && values.selected_channels.length ? values.selected_channels : channels);
  const times = values.default_posting_times || {};
  const channelInputs = channels.map((channel) => `
    <label>
      <input type="checkbox" name="channel_${escapeHtml(channel)}" value="${escapeHtml(channel)}" ${selected.has(channel) ? "checked" : ""}>
      ${escapeHtml(channelLabels[channel])}
      <input name="posting_time_${escapeHtml(channel)}" value="${escapeHtml(times[channel] || defaultPostingTime(channel))}" maxlength="5" placeholder="HH:mm" style="max-width: 90px; margin-left: 8px;">
    </label>
  `).join("");
  const error = options.errorMessage ? `<div class="notice error">${escapeHtml(options.errorMessage)}</div>` : "";

  return renderLayout(
    "/campaigns",
    "Generate Rencana Konten",
    "Campaign Planner",
    "Buat generation run dengan Fake Provider untuk pengujian sistem.",
    `
      ${error}
      <div class="notice">Saat ini menggunakan Fake Provider untuk pengujian sistem. Belum menggunakan OpenAI.</div>
      ${renderReadOnlyTable([
        "Field",
        "Nilai"
      ], [
        ["Campaign", `${escapeHtml(options.campaign.code)} - ${escapeHtml(options.campaign.name)}`],
        ["Periode", `${escapeHtml(String(options.campaign.start_date).slice(0, 10))} s/d ${escapeHtml(String(options.campaign.end_date).slice(0, 10))}`],
        ["Target Audiens", escapeHtml(options.campaign.target_audience)]
      ])}
      <form method="post" action="${escapeHtml(options.action)}">
        <label>Jumlah Konten
          <input type="number" name="requested_content_count" min="1" max="30" value="${escapeHtml(String(values.requested_content_count || 30))}" required>
        </label>
        <fieldset style="margin-top: 14px;">
          <legend>Channel dan Jam Posting Default</legend>
          <div class="form-grid">${channelInputs}</div>
        </fieldset>
        <label style="margin-top: 14px;">Brief Tambahan
          <textarea name="owner_brief" maxlength="2000" rows="5">${escapeHtml(values.owner_brief || "")}</textarea>
        </label>
        <div class="button-row" style="margin-top: 14px;">
          <button type="submit">Generate Draft</button>
          <a class="button button-secondary" href="/campaigns/${escapeHtml(options.campaign.id)}">Kembali</a>
        </div>
      </form>
    `
  );
}

export function renderCampaignPlanRunDetailPage(run: any, url: URL): string {
  const success = url.searchParams.get("success");
  const successHtml = success ? `<div class="notice success">${escapeHtml(success)}</div>` : "";
  const retryButton = ["validation_failed", "failed"].includes(run.status)
    ? `<form method="post" action="/campaign-plan-runs/${escapeHtml(run.id)}/retry"><button type="submit">Retry</button></form>`
    : "";
  const cancelButton = ["queued", "generating", "validation_failed", "failed"].includes(run.status)
    ? `<form method="post" action="/campaign-plan-runs/${escapeHtml(run.id)}/cancel"><button type="submit">Cancel</button></form>`
    : "";
  const readyNote = run.status === "ready_for_review"
    ? `<div class="notice success">Draft selesai dibuat dan siap direview.</div>`
    : "";
  const approvedNote = run.status === "approved"
    ? `<div class="notice success">Rencana telah disetujui dan menunggu proses import.</div>`
    : "";
  const rejectedNote = run.status === "rejected"
    ? `<div class="notice error">Rencana telah ditolak.</div>`
    : "";
  const reviewButton = run.status === "ready_for_review"
    ? `<a class="button" href="/campaign-plan-runs/${escapeHtml(run.id)}/review">Review Draft Konten</a>`
    : "";
  const error = run.error ? `<div class="notice error">${escapeHtml(run.error.code)}: ${escapeHtml(run.error.message)}</div>` : "";

  const batchTable = renderReadOnlyTable(
    ["Batch", "Sequence", "Status", "Attempt", "Error"],
    run.batches.map((batch: any) => [
      String(batch.batch_number),
      `${batch.sequence_start}-${batch.sequence_end}`,
      escapeHtml(statusLabels[batch.status] || batch.status),
      String(batch.attempt_count),
      escapeHtml(batch.error_code || "-")
    ])
  );

  return renderLayout(
    "/campaigns",
    "Campaign Plan Run",
    "Generation Run",
    "Status generation run Campaign Planner.",
    `
      ${successHtml}${readyNote}${approvedNote}${rejectedNote}${error}
      <div class="button-row">
        <a class="button button-secondary" href="/campaigns/${escapeHtml(run.campaign.id)}">Kembali ke Campaign</a>
        ${reviewButton}
        ${retryButton}${cancelButton}
      </div>
      ${renderReadOnlyTable(["Field", "Nilai"], [
        ["Campaign", `${escapeHtml(run.campaign.code)} - ${escapeHtml(run.campaign.name)}`],
        ["Run ID", escapeHtml(run.id)],
        ["Status", escapeHtml(statusLabels[run.status] || run.status)],
        ["Provider / Model", `${escapeHtml(run.provider)} / ${escapeHtml(run.model)}`],
        ["Jumlah Konten", String(run.requested_content_count)],
        ["Channel", escapeHtml(run.selected_channels.map((channel: string) => channelLabels[channel] || channel).join(", "))],
        ["Dibuat", escapeHtml(formatDateTime(run.created_at))],
        ["Mulai", escapeHtml(formatDateTime(run.started_at))],
        ["Selesai", escapeHtml(formatDateTime(run.completed_at))],
        ["Progress Batch", `${run.batch_progress.completed}/${run.batch_progress.total} completed`],
        ["Draft", `${run.draft_counts.items} item / ${run.draft_counts.publications} publication`],
        ["Validation", run.validation_summary ? escapeHtml(JSON.stringify(run.validation_summary)) : "-"]
      ])}
      <h2>Batch Progress</h2>
      ${batchTable}
    `
  );
}
