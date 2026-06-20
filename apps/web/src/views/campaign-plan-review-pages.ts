import { schoolLevels } from "../../../../packages/campaign-planner/src/index.ts";
import { escapeHtml, renderLayout, renderReadOnlyTable, schoolLevelLabels } from "./layout.ts";

const channelLabels: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  whatsapp_status: "WhatsApp Status"
};

const runStatusLabels: Record<string, string> = {
  ready_for_review: "Siap Direview",
  approved: "Disetujui",
  rejected: "Ditolak",
  queued: "Menunggu",
  generating: "Sedang Generate",
  validation_failed: "Validasi Gagal",
  failed: "Gagal",
  cancelled: "Dibatalkan",
  importing: "Import",
  imported: "Terimport"
};

const itemStatusLabels: Record<string, string> = {
  pending_review: "Menunggu Review",
  approved: "Disetujui",
  rejected: "Ditolak"
};

function formatDate(value: unknown): string {
  if (!value) return "-";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "full" }).format(date);
}

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

function issueList(title: string, issues: any[], className: string): string {
  if (!issues?.length) return "";
  return `
    <div class="notice ${className}">
      <strong>${escapeHtml(title)}</strong>
      <ul>${issues.map((issue) => `<li>${escapeHtml(issue.code)}: ${escapeHtml(issue.message)}</li>`).join("")}</ul>
    </div>
  `;
}

function summaryCards(summary: any): string {
  const cards = [
    ["Total", summary.total_items],
    ["Pending", summary.pending_review],
    ["Approved", summary.approved],
    ["Rejected", summary.rejected],
    ["Warning", summary.items_with_warnings],
    ["Error", summary.items_with_errors]
  ];
  return `
    <div style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;">
      ${cards.map(([label, value]) => `
        <div style="border:1px solid var(--line);border-radius:8px;padding:12px;background:var(--surface-soft);">
          <div class="muted" style="font-size:12px;font-weight:800;">${escapeHtml(label)}</div>
          <div style="font-size:24px;font-weight:900;">${escapeHtml(value)}</div>
        </div>
      `).join("")}
    </div>
  `;
}

function publicationTable(publications: any[]): string {
  return renderReadOnlyTable(
    ["Channel", "Format", "Jam Publish", "Platform Title", "Platform Caption"],
    publications.map((publication) => [
      escapeHtml(channelLabels[publication.channel] || publication.channel),
      escapeHtml(publication.publication_format),
      escapeHtml(formatDateTime(publication.planned_publish_at)),
      escapeHtml(publication.platform_title || ""),
      escapeHtml(publication.platform_caption || "")
    ])
  );
}

function draftCard(item: any, readOnly: boolean): string {
  const actions = readOnly ? "" : `
    <div class="button-row">
      <a class="button button-secondary" href="/campaign-plan-draft-items/${escapeHtml(item.id)}/edit">Edit</a>
      <form class="inline-form" method="post" action="/campaign-plan-draft-items/${escapeHtml(item.id)}/approve">
        <input type="hidden" name="expected_revision_number" value="${escapeHtml(item.revision_number)}">
        <button type="submit">Approve</button>
      </form>
      <form class="inline-form" method="post" action="/campaign-plan-draft-items/${escapeHtml(item.id)}/reject">
        <input type="hidden" name="expected_revision_number" value="${escapeHtml(item.revision_number)}">
        <button class="button-danger" type="submit">Reject</button>
      </form>
    </div>
  `;

  return `
    <article id="item-${escapeHtml(item.id)}" style="border:1px solid var(--line);border-radius:8px;padding:16px;display:grid;gap:14px;">
      <div class="button-row" style="justify-content:space-between;">
        <div>
          <strong>#${escapeHtml(item.draft_sequence)} ${escapeHtml(item.title)}</strong>
          <div class="muted">${escapeHtml(formatDate(item.planned_content_date))}</div>
        </div>
        <span class="badge">${escapeHtml(itemStatusLabels[item.review_status] || item.review_status)} · Rev ${escapeHtml(item.revision_number)}</span>
      </div>
      ${renderReadOnlyTable(["Field", "Nilai"], [
        ["Produk", escapeHtml(item.product_code || "-")],
        ["School Level", escapeHtml(item.school_level ? schoolLevelLabels[item.school_level] || item.school_level : "-")],
        ["Warna", escapeHtml(item.color_code || "-")],
        ["Audience Segment", escapeHtml(item.audience_segment)],
        ["Target Audience", escapeHtml(item.target_audience)],
        ["Pillar", escapeHtml(item.content_pillar)],
        ["Offer Utama", escapeHtml(item.primary_offer_code || "-")],
        ["Pain Point Utama", escapeHtml(item.primary_pain_point_code || "-")],
        ["Hook", escapeHtml(item.hook)],
        ["Angle", escapeHtml(item.angle)],
        ["CTA Text", escapeHtml(item.cta_text)],
        ["CTA Keyword", escapeHtml(item.cta_keyword || "-")],
        ["Planning Reason", escapeHtml(item.planning_reason)],
        ["Owner Notes", escapeHtml(item.owner_notes || "-")]
      ])}
      ${issueList("Error", item.validation_errors || [], "error")}
      ${issueList("Peringatan", item.validation_warnings || [], "success")}
      <div>
        <h2>Publication</h2>
        ${publicationTable(item.publications || [])}
      </div>
      ${actions}
    </article>
  `;
}

export function renderCampaignPlanReviewPage(run: any, url: URL): string {
  const success = url.searchParams.get("success");
  const error = url.searchParams.get("error");
  const message = [
    success ? `<div class="notice success">${escapeHtml(success)}</div>` : "",
    error ? `<div class="notice error">${escapeHtml(error)}</div>` : "",
    run.status === "approved" ? `<div class="notice success">Rencana telah disetujui dan menunggu proses import.</div>` : "",
    run.status === "rejected" ? `<div class="notice error">Rencana telah ditolak.</div>` : ""
  ].join("");
  const readOnly = run.status !== "ready_for_review";
  const grouped = new Map<string, any[]>();
  for (const item of run.items) {
    grouped.set(item.planned_content_date, [...(grouped.get(item.planned_content_date) || []), item]);
  }
  const actionButtons = readOnly ? "" : `
    <form class="inline-form" method="post" action="/campaign-plan-runs/${escapeHtml(run.id)}/approve-all">
      <button type="submit">Setujui Semua yang Siap</button>
    </form>
    <form class="inline-form" method="post" action="/campaign-plan-runs/${escapeHtml(run.id)}/approve">
      <button type="submit">Setujui Rencana</button>
    </form>
    <form class="inline-form" method="post" action="/campaign-plan-runs/${escapeHtml(run.id)}/reject">
      <button class="button-danger" type="submit">Tolak Rencana</button>
    </form>
  `;

  return renderLayout(
    "/campaigns",
    "Review Draft Konten",
    "Campaign Planner",
    "Review draft staging sebelum import Phase 2A.4.",
    `
      ${message}
      <div class="button-row">
        ${actionButtons}
        <a class="button button-secondary" href="/campaign-plan-runs/${escapeHtml(run.id)}">Kembali ke Run Status</a>
      </div>
      ${renderReadOnlyTable(["Field", "Nilai"], [
        ["Campaign", `${escapeHtml(run.campaign.code)} - ${escapeHtml(run.campaign.name)}`],
        ["Run ID", escapeHtml(run.id)],
        ["Provider / Model", `${escapeHtml(run.provider)} / ${escapeHtml(run.model)}`],
        ["Requested Count", String(run.requested_content_count)],
        ["Selected Channels", escapeHtml(run.selected_channels.map((channel: string) => channelLabels[channel] || channel).join(", "))],
        ["Run Status", escapeHtml(runStatusLabels[run.status] || run.status)],
        ["Validation Summary", run.validation_summary ? escapeHtml(JSON.stringify(run.validation_summary)) : "-"],
        ["Progress Review", `${escapeHtml(run.summary.progress_percent)}%`]
      ])}
      ${summaryCards(run.summary)}
      ${Array.from(grouped.entries()).map(([date, items]) => `
        <section style="display:grid;gap:12px;">
          <h2>${escapeHtml(formatDate(date))}</h2>
          ${items.map((item) => draftCard(item, readOnly)).join("")}
        </section>
      `).join("")}
    `
  );
}

function fieldValue(values: Record<string, any> | undefined, item: any, key: string): string {
  return escapeHtml(values && Object.prototype.hasOwnProperty.call(values, key) ? values[key] ?? "" : item[key] ?? "");
}

export function renderCampaignPlanDraftEditPage(options: {
  item: any;
  action: string;
  values?: Record<string, any>;
  errorMessage?: string;
}): string {
  const item = options.item;
  const values = options.values;
  const youtube = item.publications.find((publication: any) => publication.channel === "youtube");
  const schoolOptions = [`<option value="">-</option>`, ...schoolLevels.map((level) => {
    const selected = (values?.school_level ?? item.school_level ?? "") === level ? "selected" : "";
    return `<option value="${escapeHtml(level)}" ${selected}>${escapeHtml(schoolLevelLabels[level] || level)}</option>`;
  })].join("");
  const error = options.errorMessage ? `<div class="notice error">${escapeHtml(options.errorMessage)}</div>` : "";

  return renderLayout(
    "/campaigns",
    "Edit Draft Konten",
    "Campaign Planner",
    "Perubahan pada isi draft akan mengembalikan status item menjadi Pending Review.",
    `
      ${error}
      ${renderReadOnlyTable(["Strategy", "Nilai"], [
        ["Campaign", `${escapeHtml(item.campaign.code)} - ${escapeHtml(item.campaign.name)}`],
        ["Draft Sequence", String(item.draft_sequence)],
        ["Planned Date", escapeHtml(formatDate(item.planned_content_date))],
        ["Product", escapeHtml(item.product_code || "-")],
        ["Audience Segment", escapeHtml(item.audience_segment)],
        ["Pillar", escapeHtml(item.content_pillar)],
        ["Offer", escapeHtml(item.primary_offer_code || "-")],
        ["Pain Point", escapeHtml(item.primary_pain_point_code || "-")],
        ["Publication", escapeHtml(item.publications.map((publication: any) => `${channelLabels[publication.channel] || publication.channel}/${publication.publication_format}/${formatDateTime(publication.planned_publish_at)}`).join(", "))]
      ])}
      <form method="post" action="${escapeHtml(options.action)}">
        <input type="hidden" name="expected_revision_number" value="${escapeHtml(item.revision_number)}">
        <div class="form-grid">
          <label>Title
            <input name="title" maxlength="200" value="${fieldValue(values, item, "title")}" required>
          </label>
          <label>School Level
            <select name="school_level">${schoolOptions}</select>
          </label>
          <label>Color
            <input name="color_code" value="${fieldValue(values, item, "color_code")}">
          </label>
          <label>CTA Keyword
            <input name="cta_keyword" maxlength="40" value="${fieldValue(values, item, "cta_keyword")}">
          </label>
        </div>
        <label style="margin-top:14px;">Target Audience
          <textarea name="target_audience" maxlength="500" required>${fieldValue(values, item, "target_audience")}</textarea>
        </label>
        <label>Hook
          <textarea name="hook" maxlength="1000" required>${fieldValue(values, item, "hook")}</textarea>
        </label>
        <label>Angle
          <textarea name="angle" maxlength="2000" required>${fieldValue(values, item, "angle")}</textarea>
        </label>
        <label>CTA Text
          <textarea name="cta_text" maxlength="1000" required>${fieldValue(values, item, "cta_text")}</textarea>
        </label>
        <label>Planning Reason
          <textarea name="planning_reason" maxlength="2000" required>${fieldValue(values, item, "planning_reason")}</textarea>
        </label>
        ${youtube ? `
          <label>YouTube Platform Title
            <input name="youtube_platform_title" maxlength="200" value="${escapeHtml(values?.youtube_platform_title ?? youtube.platform_title ?? "")}" required>
          </label>
        ` : ""}
        <label>Owner Notes
          <textarea name="owner_notes" maxlength="3000">${fieldValue(values, item, "owner_notes")}</textarea>
        </label>
        <div class="button-row" style="margin-top:14px;">
          <button type="submit">Simpan Draft</button>
          <a class="button button-secondary" href="/campaign-plan-runs/${escapeHtml(item.run_id)}/review#item-${escapeHtml(item.id)}">Kembali</a>
        </div>
      </form>
    `
  );
}
