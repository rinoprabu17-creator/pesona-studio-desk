import type { FootageAssetRow } from "../footage-asset-service.ts";
import { listFootageAssets } from "../footage-asset-service.ts";
import { listProducts } from "../library-service.ts";
import {
  footageSchoolLevels,
  footageShotTypes,
  footageStatuses
} from "../validation/footage-asset-validation.ts";
import type { FootageAssetInput } from "../validation/footage-asset-validation.ts";
import { escapeHtml, renderLayout, renderMessage, renderReadOnlyTable } from "./layout.ts";

export const footageStatusLabels: Record<string, string> = {
  new: "Baru",
  reviewed: "Direview",
  approved: "Disetujui",
  rejected: "Ditolak",
  archived: "Diarsipkan"
};

export const footageSchoolLevelLabels: Record<string, string> = {
  sd: "SD",
  smp: "SMP",
  sma: "SMA",
  mi: "MI",
  mts: "MTs",
  ma: "MA",
  umum: "Umum"
};

export const footageShotTypeLabels: Record<string, string> = {
  product: "Produk",
  process: "Proses",
  packing: "Packing",
  delivery: "Delivery",
  workshop: "Workshop",
  testimonial: "Testimonial",
  other: "Lainnya"
};

function emptyToNull(value: string | undefined): string | null {
  return value ? value : null;
}

function enumOptions(values: readonly string[], labels: Record<string, string>, selected: string | null | undefined, includeEmpty = "Pilih"): string {
  return [
    `<option value="" ${!selected ? "selected" : ""}>${escapeHtml(includeEmpty)}</option>`,
    ...values.map((value) => `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(labels[value] || value)}</option>`)
  ].join("");
}

async function productOptions(selected: string | null | undefined, includeEmpty = "Tanpa produk spesifik"): Promise<string> {
  const products = await listProducts();
  return [
    `<option value="" ${!selected ? "selected" : ""}>${escapeHtml(includeEmpty)}</option>`,
    ...(products as any[])
      .filter((product) => product.active || product.id === selected)
      .map((product) => `<option value="${escapeHtml(product.id)}" ${product.id === selected ? "selected" : ""}>${escapeHtml(product.name)}${product.active ? "" : " (nonaktif)"}</option>`)
  ].join("");
}

export function valuesFromForm(body: Record<string, string>): FootageAssetInput {
  return {
    relative_path: body.relative_path,
    size_bytes: body.size_bytes,
    status: body.status,
    product_id: emptyToNull(body.product_id),
    school_level: emptyToNull(body.school_level),
    theme: emptyToNull(body.theme),
    shot_type: body.shot_type,
    quality_score: body.quality_score,
    notes: emptyToNull(body.notes)
  };
}

export function valuesFromFootageAsset(footage: FootageAssetRow): FootageAssetInput {
  return {
    relative_path: footage.relative_path,
    size_bytes: footage.size_bytes,
    status: footage.status,
    product_id: footage.product_id,
    school_level: footage.school_level,
    theme: footage.theme,
    shot_type: footage.shot_type,
    quality_score: footage.quality_score,
    notes: footage.notes
  };
}

function productLabel(footage: FootageAssetRow): string {
  return footage.product_name || "Tanpa produk";
}

function qualityLabel(score: number | null): string {
  return score === null ? "-" : `${score}/5`;
}

export async function renderFootageAssetListPage(url: URL): Promise<string> {
  const status = url.searchParams.get("status") || "";
  const productCode = url.searchParams.get("product_code") || "";
  const theme = url.searchParams.get("theme") || "";
  const shotType = url.searchParams.get("shot_type") || "";
  const [items, products] = await Promise.all([
    listFootageAssets({ status, product_code: productCode, theme, shot_type: shotType }),
    listProducts()
  ]);

  const filter = `
    <form method="get" action="/footage-assets">
      <div class="form-grid">
        <label>Status
          <select name="status">
            <option value="">Semua status</option>
            ${footageStatuses.map((item) => `<option value="${escapeHtml(item)}" ${item === status ? "selected" : ""}>${escapeHtml(footageStatusLabels[item])}</option>`).join("")}
          </select>
        </label>
        <label>Produk
          <select name="product_code">
            <option value="">Semua produk</option>
            ${(products as any[]).map((product) => `<option value="${escapeHtml(product.code)}" ${product.code === productCode ? "selected" : ""}>${escapeHtml(product.name)}</option>`).join("")}
          </select>
        </label>
        <label>Tema
          <input name="theme" value="${escapeHtml(theme)}" maxlength="160" placeholder="contoh: raport maroon">
        </label>
        <label>Shot Type
          <select name="shot_type">
            <option value="">Semua shot</option>
            ${footageShotTypes.map((item) => `<option value="${escapeHtml(item)}" ${item === shotType ? "selected" : ""}>${escapeHtml(footageShotTypeLabels[item])}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="button-row" style="margin-top: 14px;">
        <button type="submit">Filter</button>
        <a class="button button-secondary" href="/footage-assets">Reset</a>
        <a class="button" href="/footage-assets/new">Catat Footage</a>
      </div>
    </form>
  `;

  const table = renderReadOnlyTable(
    ["Path", "Produk", "Jenjang", "Tema", "Shot", "Status", "Quality", "Aksi"],
    items.map((item) => [
      `<strong>${escapeHtml(item.filename)}</strong><br><span class="muted">${escapeHtml(item.relative_path)}</span>`,
      escapeHtml(productLabel(item)),
      escapeHtml(item.school_level ? footageSchoolLevelLabels[item.school_level] || item.school_level : "-"),
      escapeHtml(item.theme || "-"),
      escapeHtml(footageShotTypeLabels[item.shot_type] || item.shot_type),
      escapeHtml(footageStatusLabels[item.status] || item.status),
      escapeHtml(qualityLabel(item.quality_score)),
      `<div class="button-row">
        <a class="button button-secondary" href="/footage-assets/${escapeHtml(item.id)}">Detail</a>
        <a class="button" href="/footage-assets/${escapeHtml(item.id)}/edit">Edit</a>
      </div>`
    ])
  );

  return renderLayout(
    "/footage-assets",
    "Footage",
    "Local Footage Catalog",
    "Catat metadata footage yang sudah tersimpan di storage/footage. Fase ini tidak upload, scan otomatis, atau mengubah file footage.",
    `${renderMessage(url)}${filter}${table}`
  );
}

export async function renderFootageAssetFormPage(optionsInput: {
  mode: "create" | "edit";
  action: string;
  values?: FootageAssetInput;
  footage?: FootageAssetRow;
  errorMessage?: string;
}): Promise<string> {
  const values = optionsInput.values || {
    status: "new",
    shot_type: "other"
  };
  const title = optionsInput.mode === "create" ? "Catat Footage" : "Edit Footage";
  const buttonLabel = optionsInput.mode === "create" ? "Catat Footage" : "Simpan Footage";
  const error = optionsInput.errorMessage ? `<div class="notice error">${escapeHtml(optionsInput.errorMessage)}</div>` : "";
  const derived = optionsInput.footage
    ? `<div class="notice">
        Filename: <strong>${escapeHtml(optionsInput.footage.filename)}</strong><br>
        Ekstensi: ${escapeHtml(optionsInput.footage.file_extension)}
      </div>`
    : "";

  const form = `
    ${error}
    ${derived}
    <form method="post" action="${escapeHtml(optionsInput.action)}">
      <div class="form-grid">
        <label>Relative Path
          <input name="relative_path" value="${escapeHtml(values.relative_path || "")}" maxlength="500" required placeholder="batch-01/sampul-raport-001.mp4">
        </label>
        <label>Ukuran File (bytes)
          <input name="size_bytes" type="number" min="0" step="1" value="${escapeHtml(values.size_bytes ?? "")}" required>
        </label>
        <label>Status
          <select name="status" required>${enumOptions(footageStatuses, footageStatusLabels, values.status || "new")}</select>
        </label>
        <label>Produk
          <select name="product_id">${await productOptions(values.product_id)}</select>
        </label>
      </div>
      <p class="hint">Relative path selalu dihitung dari folder <strong>storage/footage</strong>. Jangan isi absolute path, <code>..</code>, atau prefix <code>storage/footage</code>.</p>
      <div class="form-grid" style="margin-top: 14px;">
        <label>Jenjang
          <select name="school_level">${enumOptions(footageSchoolLevels, footageSchoolLevelLabels, values.school_level, "Tanpa jenjang")}</select>
        </label>
        <label>Tema / Topik
          <input name="theme" value="${escapeHtml(values.theme || "")}" maxlength="160" placeholder="contoh: emboss raport">
        </label>
        <label>Shot Type
          <select name="shot_type" required>${enumOptions(footageShotTypes, footageShotTypeLabels, values.shot_type || "other")}</select>
        </label>
        <label>Quality Score
          <input name="quality_score" type="number" min="1" max="5" step="1" value="${escapeHtml(values.quality_score ?? "")}" placeholder="1-5">
        </label>
      </div>
      <label style="margin-top: 14px;">Catatan
        <textarea name="notes" maxlength="2000">${escapeHtml(values.notes || "")}</textarea>
      </label>
      <div class="button-row" style="margin-top: 14px;">
        <button type="submit">${escapeHtml(buttonLabel)}</button>
        <a class="button button-secondary" href="/footage-assets">Kembali</a>
      </div>
    </form>
  `;

  return renderLayout(
    "/footage-assets",
    title,
    "Local Footage Catalog",
    "Metadata-only. Sistem tidak membaca, memindahkan, atau mengubah file footage pada fase ini.",
    form
  );
}

export function renderFootageAssetDetailPage(footage: FootageAssetRow, url: URL): string {
  const rows = [
    ["Relative Path", escapeHtml(footage.relative_path)],
    ["Filename", escapeHtml(footage.filename)],
    ["Ekstensi", escapeHtml(footage.file_extension)],
    ["Ukuran File", escapeHtml(`${footage.size_bytes} bytes`)],
    ["Status", escapeHtml(footageStatusLabels[footage.status] || footage.status)],
    ["Produk", escapeHtml(productLabel(footage))],
    ["Jenjang", escapeHtml(footage.school_level ? footageSchoolLevelLabels[footage.school_level] || footage.school_level : "-")],
    ["Tema", escapeHtml(footage.theme || "-")],
    ["Shot Type", escapeHtml(footageShotTypeLabels[footage.shot_type] || footage.shot_type)],
    ["Quality Score", escapeHtml(qualityLabel(footage.quality_score))],
    ["Catatan", escapeHtml(footage.notes || "-")]
  ];

  return renderLayout(
    "/footage-assets",
    "Detail Footage",
    "Local Footage Catalog",
    "Detail metadata footage lokal. File fisik tetap berada di storage/footage.",
    `${renderMessage(url)}
     ${renderReadOnlyTable(["Field", "Nilai"], rows)}
     <div class="button-row">
       <a class="button" href="/footage-assets/${escapeHtml(footage.id)}/edit">Edit</a>
       <a class="button button-secondary" href="/footage-assets">Kembali</a>
     </div>`
  );
}

export function renderFootageAssetNotFoundPage(message = "Footage tidak ditemukan."): string {
  return renderLayout(
    "/footage-assets",
    "Footage Tidak Ditemukan",
    "Local Footage Catalog",
    "Data footage tidak tersedia.",
    `<div class="notice error">${escapeHtml(message)}</div><div class="button-row"><a class="button" href="/footage-assets">Kembali</a></div>`
  );
}
