import { getContentItem } from "../content-item-service.ts";
import type { ContentItemRow } from "../content-item-service.ts";
import type { ContentPublicationRow } from "../content-publication-service.ts";
import { listPublicationsByContentItem } from "../content-publication-service.ts";
import {
  channelFormatMatrix,
  publicationChannels,
  publicationFormats,
  publicationTransitions
} from "../validation/content-publication-validation.ts";
import type { ContentPublicationInput } from "../validation/content-publication-validation.ts";
import { escapeHtml, renderLayout, renderMessage, renderReadOnlyTable } from "./layout.ts";

export const channelLabels: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  whatsapp_status: "WhatsApp Status"
};

export const publicationFormatLabels: Record<string, string> = {
  reel: "Reel",
  short_video: "Short Video",
  feed_video: "Feed Video",
  feed_image: "Feed Image",
  carousel: "Carousel",
  status_video: "Status Video",
  status_image: "Status Image",
  standard_video: "Standard Video"
};

export const publicationStatusLabels: Record<string, string> = {
  planned: "Direncanakan",
  scheduled: "Dijadwalkan",
  publishing: "Sedang Dipublikasikan",
  posted: "Terposting",
  failed: "Gagal",
  cancelled: "Dibatalkan"
};

const actionLabels: Record<string, string> = {
  scheduled: "Jadwalkan",
  publishing: "Mulai Publikasi",
  posted: "Tandai Terposting",
  failed: "Tandai Gagal",
  cancelled: "Batalkan",
  planned: "Aktifkan Kembali"
};

function jakartaFormatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat("id-ID", { ...options, timeZone: "Asia/Jakarta" });
}

export function formatJakarta(value: unknown): string {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return jakartaFormatter({ dateStyle: "medium", timeStyle: "short" }).format(date);
}

function toDatetimeLocalJakarta(value: unknown): string {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

function emptyToNull(value: string | undefined): string | null {
  return value ? value : null;
}

function matrixHint(): string {
  return `
    <div class="notice">
      <strong>Matrix channel dan format</strong><br>
      Instagram: Reel, Feed Video, Feed Image, Carousel<br>
      Facebook: Reel, Feed Video, Feed Image, Carousel<br>
      TikTok: Short Video<br>
      YouTube: Short Video, Standard Video<br>
      WhatsApp Status: Status Video, Status Image<br>
      <span class="hint">Standard Video YouTube disiapkan untuk kebutuhan masa depan; MVP saat ini berfokus pada YouTube Shorts.</span>
    </div>
  `;
}

function channelOptions(selected: string | null | undefined): string {
  return publicationChannels
    .map((channel) => `<option value="${escapeHtml(channel)}" ${channel === selected ? "selected" : ""}>${escapeHtml(channelLabels[channel])}</option>`)
    .join("");
}

function formatOptions(selected: string | null | undefined): string {
  return publicationFormats
    .map((format) => `<option value="${escapeHtml(format)}" ${format === selected ? "selected" : ""}>${escapeHtml(publicationFormatLabels[format])}</option>`)
    .join("");
}

function productPublicationActionForm(publication: ContentPublicationRow, nextStatus: string): string {
  const needsSchedule = nextStatus === "scheduled";
  const needsPostedAt = nextStatus === "posted";
  const needsFailure = nextStatus === "failed";
  return `
    <form class="inline-form" method="post" action="/content-publications/${escapeHtml(publication.id)}/status">
      <input type="hidden" name="publication_status" value="${escapeHtml(nextStatus)}">
      ${needsSchedule ? `<input type="datetime-local" name="planned_publish_at" value="${escapeHtml(toDatetimeLocalJakarta(publication.planned_publish_at))}" aria-label="Jadwal posting">` : ""}
      ${needsPostedAt ? `<input type="datetime-local" name="published_at" aria-label="Published at"><input name="published_url" placeholder="Published URL opsional" aria-label="Published URL">` : ""}
      ${needsFailure ? `<input name="failure_reason" placeholder="Alasan gagal" aria-label="Failure reason">` : ""}
      <button type="submit">${escapeHtml(actionLabels[nextStatus] || publicationStatusLabels[nextStatus] || nextStatus)}</button>
    </form>
  `;
}

export function renderPublicationActions(publication: ContentPublicationRow): string {
  const next = publicationTransitions[publication.publication_status] || [];
  if (!next.length) {
    return `<span class="muted">Tidak ada aksi</span>`;
  }
  return `<div class="button-row">${next.map((status) => productPublicationActionForm(publication, status)).join("")}</div>`;
}

export async function renderContentItemPublicationsSection(item: ContentItemRow): Promise<string> {
  const publications = await listPublicationsByContentItem(item.id);
  const actions = `<div class="button-row"><a class="button" href="/content-items/${escapeHtml(item.id)}/publications/new">Tambah Publikasi</a></div>`;
  const table = renderReadOnlyTable(
    ["Channel", "Format", "Status", "Jadwal", "Platform Title", "Published URL", "Failure Reason", "Aksi"],
    publications.map((publication) => [
      escapeHtml(channelLabels[publication.channel] || publication.channel),
      escapeHtml(publicationFormatLabels[publication.publication_format] || publication.publication_format),
      escapeHtml(publicationStatusLabels[publication.publication_status] || publication.publication_status),
      escapeHtml(formatJakarta(publication.planned_publish_at)),
      escapeHtml(publication.platform_title || "-"),
      publication.published_url ? `<a href="${escapeHtml(publication.published_url)}">${escapeHtml(publication.published_url)}</a>` : "-",
      escapeHtml(publication.failure_reason || "-"),
      `<div class="button-row">
        <a class="button button-secondary" href="/content-publications/${escapeHtml(publication.id)}">Detail</a>
        <a class="button" href="/content-publications/${escapeHtml(publication.id)}/edit">Edit</a>
        ${renderPublicationActions(publication)}
      </div>`
    ])
  );

  const empty = publications.length ? "" : `<p class="hint">Belum ada rencana publikasi untuk konten ini.</p>`;
  return `<section><h2>Publikasi Channel</h2>${actions}${empty}${table}</section>`;
}

export async function renderPublicationFormPage(options: {
  mode: "create" | "edit";
  action: string;
  contentItem?: ContentItemRow;
  publication?: ContentPublicationRow;
  values?: ContentPublicationInput;
  errorMessage?: string;
}): Promise<string> {
  const contentItem = options.contentItem || (options.publication ? await getContentItem(options.publication.content_item_id) : undefined);
  const values = options.values || options.publication || {};
  const title = options.mode === "create" ? "Tambah Publikasi" : "Edit Publikasi";
  const error = options.errorMessage ? `<div class="notice error">${escapeHtml(options.errorMessage)}</div>` : "";
  const identity = options.publication
    ? `<div class="notice">
        Content: ${escapeHtml(options.publication.content_code)} - ${escapeHtml(options.publication.content_title)}<br>
        Channel: ${escapeHtml(channelLabels[options.publication.channel] || options.publication.channel)}<br>
        Format: ${escapeHtml(publicationFormatLabels[options.publication.publication_format] || options.publication.publication_format)}<br>
        Status: ${escapeHtml(publicationStatusLabels[options.publication.publication_status] || options.publication.publication_status)}
      </div>`
    : `<div class="notice">Content: ${escapeHtml(contentItem?.content_code || "")} - ${escapeHtml(contentItem?.title || "")}</div>`;

  const createFields = options.mode === "create"
    ? `<div class="form-grid">
        <label>Channel
          <select name="channel" required>${channelOptions(values.channel)}</select>
        </label>
        <label>Format
          <select name="publication_format" required>${formatOptions(values.publication_format)}</select>
        </label>
      </div>`
    : "";

  const postedUrl = options.publication?.publication_status === "posted"
    ? `<label>Published URL
        <input name="published_url" value="${escapeHtml(values.published_url || "")}" maxlength="2048">
      </label>`
    : "";

  const form = `
    ${error}
    ${identity}
    ${matrixHint()}
    <form method="post" action="${escapeHtml(options.action)}">
      ${createFields}
      <div class="form-grid" style="margin-top: 14px;">
        <label>Jadwal Posting
          <input name="planned_publish_at" type="datetime-local" value="${escapeHtml(toDatetimeLocalJakarta(values.planned_publish_at))}">
        </label>
        <label>Platform Title
          <input name="platform_title" value="${escapeHtml(values.platform_title || "")}" maxlength="200">
        </label>
        ${postedUrl}
      </div>
      <label style="margin-top: 14px;">Platform Caption
        <textarea name="platform_caption" maxlength="10000">${escapeHtml(values.platform_caption || "")}</textarea>
      </label>
      <div class="button-row" style="margin-top: 14px;">
        <button type="submit">${options.mode === "create" ? "Tambah Publikasi" : "Simpan Publikasi"}</button>
        <a class="button button-secondary" href="${contentItem ? `/content-items/${escapeHtml(contentItem.id)}` : "/content-items"}">Kembali</a>
      </div>
    </form>
  `;

  return renderLayout(
    "/content-items",
    title,
    "Content Publications",
    "Kelola rencana distribusi per channel dan format. Manual Content Calendar besar belum tersedia.",
    form
  );
}

export function renderPublicationDetailPage(publication: ContentPublicationRow, url: URL): string {
  const rows = [
    ["Content Code", escapeHtml(publication.content_code)],
    ["Content Title", escapeHtml(publication.content_title)],
    ["Channel", escapeHtml(channelLabels[publication.channel] || publication.channel)],
    ["Format", escapeHtml(publicationFormatLabels[publication.publication_format] || publication.publication_format)],
    ["Status", escapeHtml(publicationStatusLabels[publication.publication_status] || publication.publication_status)],
    ["Jadwal Asia/Jakarta", escapeHtml(formatJakarta(publication.planned_publish_at))],
    ["Platform Title", escapeHtml(publication.platform_title || "-")],
    ["Platform Caption", escapeHtml(publication.platform_caption || "-")],
    ["Published URL", publication.published_url ? `<a href="${escapeHtml(publication.published_url)}">${escapeHtml(publication.published_url)}</a>` : "-"],
    ["Published At", escapeHtml(formatJakarta(publication.published_at))],
    ["Failure Reason", escapeHtml(publication.failure_reason || "-")]
  ];

  const body = `
    ${renderMessage(url)}
    <div class="button-row">
      <a class="button" href="/content-publications/${escapeHtml(publication.id)}/edit">Edit Publikasi</a>
      <a class="button button-secondary" href="/content-items/${escapeHtml(publication.content_item_id)}">Kembali ke Konten</a>
    </div>
    ${renderReadOnlyTable(["Field", "Nilai"], rows)}
    <section><h2>Aksi Status Publikasi</h2>${renderPublicationActions(publication)}</section>
  `;

  return renderLayout(
    "/content-items",
    `${channelLabels[publication.channel] || publication.channel} ${publicationFormatLabels[publication.publication_format] || publication.publication_format}`,
    "Detail Publikasi",
    "Detail rencana publikasi satu channel dan format.",
    body
  );
}

export function renderPublicationNotFoundPage(message = "Publikasi tidak ditemukan."): string {
  return renderLayout(
    "/content-items",
    "Publikasi Tidak Ditemukan",
    "Error",
    "Publikasi tidak dapat ditampilkan.",
    `<div class="notice error">${escapeHtml(message)}</div><div class="button-row"><a class="button button-secondary" href="/content-items">Kembali</a></div>`
  );
}

export function valuesFromPublicationForm(body: Record<string, string>): ContentPublicationInput {
  return {
    channel: body.channel,
    publication_format: body.publication_format,
    planned_publish_at: emptyToNull(body.planned_publish_at),
    platform_title: emptyToNull(body.platform_title),
    platform_caption: emptyToNull(body.platform_caption),
    published_url: emptyToNull(body.published_url)
  };
}

export function statusValuesFromForm(body: Record<string, string>): ContentPublicationInput {
  return {
    publication_status: body.publication_status,
    planned_publish_at: emptyToNull(body.planned_publish_at),
    published_at: emptyToNull(body.published_at),
    published_url: emptyToNull(body.published_url),
    failure_reason: emptyToNull(body.failure_reason)
  };
}
