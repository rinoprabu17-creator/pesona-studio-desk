import {
  getColor,
  listColors,
  listOffers,
  listPainPoints,
  listProducts,
  listSchoolLevelColorDefaults
} from "../library-service.ts";
import { schoolLevels } from "../validation/library-validation.ts";
import {
  escapeHtml,
  renderBadge,
  renderLayout,
  renderMessage,
  renderReadOnlyTable,
  renderSwatch,
  schoolLevelLabels
} from "./layout.ts";

export async function renderProductsPage(url: URL): Promise<string> {
  const products = await listProducts();
  const table = renderReadOnlyTable(
    ["Kode", "Produk", "Status"],
    products.map((product: any) => [
      escapeHtml(product.code),
      escapeHtml(product.name),
      renderBadge(Boolean(product.active))
    ])
  );
  return renderLayout(
    "/products",
    "Product Library",
    "Library read-only",
    "Produk aktif MVP hanya Sampul Raport dan Sampul Ijazah.",
    `${renderMessage(url)}${table}`
  );
}

export async function renderOffersPage(url: URL): Promise<string> {
  const offers = await listOffers();
  const table = renderReadOnlyTable(
    ["Offer", "Public Phrase", "Syarat", "Risk Note", "Status"],
    offers.map((offer: any) => [
      `<strong>${escapeHtml(offer.title)}</strong><br><span class="muted">${escapeHtml(offer.code)}</span>`,
      escapeHtml(offer.public_phrase),
      escapeHtml(offer.condition_text || "-"),
      escapeHtml(offer.risk_note || "-"),
      renderBadge(Boolean(offer.active))
    ])
  );
  return renderLayout(
    "/offers",
    "Offer Library",
    "Library read-only",
    "Offer disimpan dari campaign knowledge base dan tidak diedit dari UI Phase 1A.",
    `${renderMessage(url)}${table}`
  );
}

export async function renderPainPointsPage(url: URL): Promise<string> {
  const painPoints = await listPainPoints();
  const table = renderReadOnlyTable(
    ["Pain Point", "Buyer Fear", "Content Angle", "Safe Claim", "Avoid Claim", "Status"],
    painPoints.map((painPoint: any) => [
      `<strong>${escapeHtml(painPoint.title)}</strong><br><span class="muted">${escapeHtml(painPoint.code)}</span>`,
      escapeHtml(painPoint.buyer_fear || "-"),
      escapeHtml(painPoint.content_angle || "-"),
      escapeHtml(painPoint.safe_claim || "-"),
      escapeHtml(painPoint.avoid_claim || "-"),
      renderBadge(Boolean(painPoint.active))
    ])
  );
  return renderLayout(
    "/pain-points",
    "Pain Point Library",
    "Library read-only",
    "Pain point dipakai sebagai dasar angle konten pada fase berikutnya.",
    `${renderMessage(url)}${table}`
  );
}

function renderColorForm(action: string, color: any | null, buttonLabel: string): string {
  return `
    <form method="post" action="${action}">
      <div class="form-grid">
        <label>Kode
          <input name="code" value="${escapeHtml(color?.code || "")}" ${color ? "readonly" : ""} placeholder="contoh: merah_bata">
        </label>
        <label>Nama
          <input name="name" value="${escapeHtml(color?.name || "")}" required>
        </label>
        <label>Hex Preview
          <input name="hex_preview" value="${escapeHtml(color?.hex_preview || "")}" placeholder="#RRGGBB">
        </label>
        <label>Urutan
          <input name="sort_order" type="number" value="${escapeHtml(color?.sort_order ?? 0)}">
        </label>
      </div>
      <div class="button-row" style="margin-top: 12px;">
        <button type="submit">${escapeHtml(buttonLabel)}</button>
      </div>
    </form>
  `;
}

export async function renderColorsPage(url: URL): Promise<string> {
  const colors = await listColors();
  const editId = url.searchParams.get("edit");
  const editingColor = editId ? await getColor(editId) : null;
  const table = renderReadOnlyTable(
    ["Preview", "Kode", "Nama", "Hex", "Status", "Aksi"],
    colors.map((color: any) => [
      renderSwatch(color.hex_preview),
      escapeHtml(color.code),
      escapeHtml(color.name),
      escapeHtml(color.hex_preview || "-"),
      renderBadge(Boolean(color.active)),
      `<div class="button-row">
        <a class="button button-secondary" href="/colors?edit=${escapeHtml(color.id)}">Edit</a>
        <form class="inline-form" method="post" action="/colors/${escapeHtml(color.id)}/${color.active ? "deactivate" : "activate"}">
          <button class="${color.active ? "button-danger" : ""}" type="submit">${color.active ? "Nonaktifkan" : "Aktifkan"}</button>
        </form>
      </div>`
    ])
  );

  const form = `
    <section>
      <h2>${editingColor ? "Edit Warna" : "Tambah Warna"}</h2>
      ${renderColorForm(editingColor ? `/colors/${escapeHtml((editingColor as any).id)}/update` : "/colors/create", editingColor, editingColor ? "Simpan Warna" : "Tambah Warna")}
    </section>
  `;

  return renderLayout(
    "/colors",
    "Color Library",
    "Library editable",
    "Admin bisa menambah, mengedit, mengaktifkan, dan menonaktifkan warna. Seed tidak menimpa perubahan warna yang sudah ada.",
    `${renderMessage(url)}${form}${table}`
  );
}

export async function renderSchoolLevelDefaultsPage(url: URL): Promise<string> {
  const defaults = await listSchoolLevelColorDefaults();
  const activeColors = await listColors({ activeOnly: true });
  const options = activeColors
    .map((color: any) => `<option value="${escapeHtml(color.id)}">${escapeHtml(color.name)} (${escapeHtml(color.code)})</option>`)
    .join("");
  const rows = defaults.map((defaultRow: any) => [
    escapeHtml(schoolLevelLabels[defaultRow.school_level] || defaultRow.school_level),
    `${renderSwatch(defaultRow.color_hex_preview)} ${escapeHtml(defaultRow.color_name)} <span class="muted">(${escapeHtml(defaultRow.color_code)})</span>`,
    renderBadge(Boolean(defaultRow.active)),
    `<form method="post" action="/school-level-color-defaults/${escapeHtml(defaultRow.school_level)}" class="button-row">
      <select name="color_id">${activeColors
        .map((color: any) => `<option value="${escapeHtml(color.id)}" ${color.id === defaultRow.color_id ? "selected" : ""}>${escapeHtml(color.name)}</option>`)
        .join("")}</select>
      <button type="submit">Simpan</button>
    </form>`
  ]);

  const createMissing = `
    <section>
      <h2>Atur Rekomendasi Jenjang</h2>
      <p class="hint">Rekomendasi warna ini hanya default awal dan dapat dioverride nanti pada content item atau mockup. SMK valid sebagai jenjang, tetapi belum diberi default seed.</p>
      <form method="post" action="/school-level-color-defaults/set" class="button-row" style="margin-top: 12px;">
        <select name="school_level">
          ${schoolLevels.map((level) => `<option value="${level}">${escapeHtml(schoolLevelLabels[level])}</option>`).join("")}
        </select>
        <select name="color_id">${options}</select>
        <button type="submit">Simpan Rekomendasi</button>
      </form>
    </section>
  `;

  return renderLayout(
    "/school-level-color-defaults",
    "Rekomendasi Warna Jenjang",
    "Library editable",
    "Admin bisa mengubah rekomendasi warna per jenjang tanpa mengubah kode.",
    `${renderMessage(url)}${createMissing}${renderReadOnlyTable(["Jenjang", "Warna", "Status", "Edit"], rows)}`
  );
}
