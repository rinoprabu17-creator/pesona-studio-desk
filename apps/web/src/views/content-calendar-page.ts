import type { ContentCalendarData, ContentCalendarItem, ContentCalendarPublication } from "../content-calendar-service.ts";
import { productionStatuses } from "../validation/content-item-validation.ts";
import { publicationChannels, publicationStatuses } from "../validation/content-publication-validation.ts";
import { contentPillarLabels, productionStatusLabels } from "./content-item-pages.ts";
import { channelLabels, publicationFormatLabels, publicationStatusLabels } from "./content-publication-pages.ts";
import { escapeHtml, renderLayout } from "./layout.ts";

function monthLabel(month: string): string {
  const date = new Date(`${month}-01T00:00:00.000Z`);
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

function dateLabel(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeZone: "UTC" }).format(date);
}

function addMonths(month: string, delta: number): string {
  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7)) - 1;
  return new Date(Date.UTC(year, monthIndex + delta, 1)).toISOString().slice(0, 7);
}

function buildCalendarUrl(current: URL, month: string | null): string {
  const params = new URLSearchParams();
  params.set("month", month || current.searchParams.get("month") || "");
  for (const key of ["campaign_id", "channel", "production_status", "publication_status"]) {
    const value = current.searchParams.get(key);
    if (value) {
      params.set(key, value);
    }
  }
  return `/content-calendar?${params.toString()}`;
}

function selectOption(value: string, label: string, selected: string | null | undefined): string {
  return `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`;
}

function enumOptions(values: readonly string[], labels: Record<string, string>, selected: string | null, emptyLabel: string): string {
  return [
    `<option value="" ${!selected ? "selected" : ""}>${escapeHtml(emptyLabel)}</option>`,
    ...values.map((value) => selectOption(value, labels[value] || value, selected))
  ].join("");
}

function renderFilters(data: ContentCalendarData, url: URL): string {
  const filters = data.filters;
  return `
    <form method="get" action="/content-calendar">
      <div class="form-grid">
        <label>Bulan
          <input type="month" name="month" value="${escapeHtml(data.month)}" required>
        </label>
        <label>Campaign
          <select name="campaign_id">
            <option value="" ${!filters.campaign_id ? "selected" : ""}>Semua campaign</option>
            ${data.campaign_options.map((campaign) => selectOption(campaign.id, `${campaign.code} - ${campaign.name}`, filters.campaign_id)).join("")}
          </select>
        </label>
        <label>Channel
          <select name="channel">${enumOptions(publicationChannels, channelLabels, filters.channel, "Semua channel")}</select>
        </label>
        <label>Status Produksi
          <select name="production_status">${enumOptions(productionStatuses, productionStatusLabels, filters.production_status, "Semua status produksi")}</select>
        </label>
        <label>Status Publikasi
          <select name="publication_status">${enumOptions(publicationStatuses, publicationStatusLabels, filters.publication_status, "Semua status publikasi")}</select>
        </label>
      </div>
      <div class="button-row" style="margin-top: 14px;">
        <a class="button button-secondary" href="${escapeHtml(buildCalendarUrl(url, addMonths(data.month, -1)))}">Bulan Sebelumnya</a>
        <a class="button button-secondary" href="${escapeHtml(buildCalendarUrl(url, addMonths(data.month, 1)))}">Bulan Berikutnya</a>
        <button type="submit">Terapkan</button>
        <a class="button button-secondary" href="/content-calendar?month=${escapeHtml(data.month)}">Reset</a>
      </div>
    </form>
  `;
}

function productLabel(item: ContentCalendarItem): string {
  return item.product?.name || "Campuran / Semua Produk";
}

function renderPublication(publication: ContentCalendarPublication): string {
  const schedule = publication.planned_publish_at_jakarta || "Belum dijadwalkan";
  const publishedUrl = publication.published_url
    ? `<div><span class="muted">Published URL:</span> <a href="${escapeHtml(publication.published_url)}">${escapeHtml(publication.published_url)}</a></div>`
    : "";
  const failure = publication.failure_reason
    ? `<div><span class="muted">Failure reason:</span> ${escapeHtml(publication.failure_reason)}</div>`
    : "";
  return `
    <li class="calendar-publication">
      <div><strong>${escapeHtml(channelLabels[publication.channel] || publication.channel)}</strong> / ${escapeHtml(publicationFormatLabels[publication.publication_format] || publication.publication_format)}</div>
      <div>Status: ${escapeHtml(publicationStatusLabels[publication.publication_status] || publication.publication_status)}</div>
      <div>Jadwal: ${escapeHtml(schedule)}</div>
      ${publication.platform_title ? `<div>Platform title: ${escapeHtml(publication.platform_title)}</div>` : ""}
      ${publishedUrl}
      ${failure}
      <div class="button-row">
        <a class="button button-secondary" href="/content-publications/${escapeHtml(publication.id)}">Detail</a>
        <a class="button" href="/content-publications/${escapeHtml(publication.id)}/edit">Edit</a>
      </div>
    </li>
  `;
}

function renderContentItem(item: ContentCalendarItem): string {
  const publications = item.publications.length
    ? `<ul class="calendar-publications">${item.publications.map(renderPublication).join("")}</ul>`
    : `<p class="hint">Belum ada rencana publikasi.</p>`;

  return `
    <article class="calendar-card">
      <div class="calendar-card-head">
        <div>
          <strong>${escapeHtml(item.content_code)}</strong>
          <h2>${escapeHtml(item.title)}</h2>
        </div>
        <span class="badge">${escapeHtml(productionStatusLabels[item.production_status] || item.production_status)}</span>
      </div>
      <div class="calendar-meta">
        <div><span class="muted">Campaign:</span> ${escapeHtml(item.campaign.code)} - ${escapeHtml(item.campaign.name)}</div>
        <div><span class="muted">Produk:</span> ${escapeHtml(productLabel(item))}</div>
        <div><span class="muted">Pillar:</span> ${escapeHtml(contentPillarLabels[item.content_pillar] || item.content_pillar)}</div>
        <div><span class="muted">CTA:</span> ${escapeHtml(item.cta_text)}</div>
        ${item.cta_keyword ? `<div><span class="muted">CTA keyword:</span> ${escapeHtml(item.cta_keyword)}</div>` : ""}
      </div>
      <div class="button-row">
        <a class="button button-secondary" href="/content-items/${escapeHtml(item.id)}">Detail Konten</a>
        <a class="button" href="/content-items/${escapeHtml(item.id)}/edit">Edit Konten</a>
        <a class="button" href="/content-items/${escapeHtml(item.id)}/publications/new">Tambah Publikasi</a>
      </div>
      ${publications}
    </article>
  `;
}

function renderAgenda(data: ContentCalendarData): string {
  if (!data.campaign_options.length) {
    return `<div class="notice error">Buat campaign terlebih dahulu untuk mulai menyusun kalender konten.</div><div class="button-row"><a class="button" href="/campaigns/new">Buat Campaign</a></div>`;
  }

  if (!data.days.length) {
    return `<div class="notice">Belum ada konten yang sesuai dengan bulan dan filter ini.</div>`;
  }

  return data.days
    .map((day) => `
      <section class="calendar-day">
        <h2>${escapeHtml(dateLabel(day.date))}</h2>
        <div class="calendar-items">${day.content_items.map(renderContentItem).join("")}</div>
      </section>
    `)
    .join("");
}

function renderCalendarStyles(): string {
  return `
    <style>
      .summary-row { display: flex; flex-wrap: wrap; gap: 10px; }
      .summary-pill { background: #eef3f1; border: 1px solid #dbe3df; border-radius: 8px; font-weight: 800; padding: 10px 12px; }
      .calendar-day { border-top: 1px solid #dbe3df; padding-top: 18px; }
      .calendar-items { display: grid; gap: 14px; }
      .calendar-card { border: 1px solid #dbe3df; border-radius: 8px; display: grid; gap: 12px; padding: 16px; }
      .calendar-card-head { align-items: start; display: flex; gap: 12px; justify-content: space-between; }
      .calendar-card h2 { font-size: 17px; margin: 4px 0 0; }
      .calendar-meta { display: grid; gap: 6px; font-size: 14px; line-height: 1.45; }
      .calendar-publications { display: grid; gap: 10px; list-style: none; margin: 0; padding: 0; }
      .calendar-publication { background: #f8faf9; border: 1px solid #dbe3df; border-radius: 8px; display: grid; gap: 5px; padding: 12px; }
    </style>
  `;
}

export function renderContentCalendarPage(data: ContentCalendarData | null, url: URL, errorMessage?: string): string {
  const error = errorMessage ? `<div class="notice error">${escapeHtml(errorMessage)}</div>` : "";
  const body = data
    ? `
      ${renderCalendarStyles()}
      ${error}
      ${renderFilters(data, url)}
      <div class="summary-row">
        <div class="summary-pill">Konten: ${escapeHtml(data.counts.content_items)}</div>
        <div class="summary-pill">Publication: ${escapeHtml(data.counts.publications)}</div>
        <div class="summary-pill">Bulan: ${escapeHtml(monthLabel(data.month))}</div>
        <div class="summary-pill">Timezone: ${escapeHtml(data.timezone)}</div>
      </div>
      ${renderAgenda(data)}
    `
    : `${renderCalendarStyles()}${error}<div class="button-row"><a class="button button-secondary" href="/content-calendar">Kembali ke Kalender</a></div>`;

  return renderLayout(
    "/content-calendar",
    "Kalender Konten",
    "Manual Content Calendar",
    "Tampilan operasional content-first berdasarkan tanggal rencana konten dengan publikasi channel nested.",
    body
  );
}
