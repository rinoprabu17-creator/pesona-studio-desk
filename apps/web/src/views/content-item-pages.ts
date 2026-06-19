import type { CampaignRow } from "../campaign-service.ts";
import { listCampaigns } from "../campaign-service.ts";
import type { ContentItemRow } from "../content-item-service.ts";
import { listContentItems } from "../content-item-service.ts";
import { listColors, listOffers, listPainPoints, listProducts, listSchoolLevelColorDefaults } from "../library-service.ts";
import {
  audienceSegments,
  contentPillars,
  productionStatuses,
  productionTransitions
} from "../validation/content-item-validation.ts";
import type { ContentItemInput } from "../validation/content-item-validation.ts";
import { escapeHtml, renderLayout, renderMessage, renderReadOnlyTable, renderSwatch, schoolLevelLabels } from "./layout.ts";

export const audienceSegmentLabels: Record<string, string> = {
  end_user_school: "Sekolah / End User",
  agent_marketer: "Agen / Marketer",
  mixed: "Campuran"
};

export const contentPillarLabels: Record<string, string> = {
  mockup_magnet: "Mockup Magnet",
  desain_gratis: "Desain Gratis",
  trust_process: "Trust Process",
  pain_point: "Pain Point",
  product_proof: "Product Proof",
  offer: "Offer",
  agent: "Agent",
  education: "Education"
};

export const productionStatusLabels: Record<string, string> = {
  planned: "Direncanakan",
  script_ready: "Script Siap",
  waiting_footage: "Menunggu Footage",
  footage_received: "Footage Masuk",
  rendering: "Sedang Dirender",
  draft_ready: "Draft Siap Review",
  needs_revision: "Perlu Revisi",
  approved: "Disetujui",
  failed: "Gagal",
  archived: "Diarsipkan"
};

function formatDate(value: unknown): string {
  return String(value || "").slice(0, 10);
}

function productLabel(item: Pick<ContentItemRow, "product_name">): string {
  return item.product_name || "Campuran / Semua Produk";
}

function emptyToNull(value: string | undefined): string | null {
  return value ? value : null;
}

function options(items: Array<{ value: string; label: string; active?: boolean }>, selected: string | null | undefined, includeEmpty: string): string {
  return [
    `<option value="" ${!selected ? "selected" : ""}>${escapeHtml(includeEmpty)}</option>`,
    ...items.map((item) => {
      const label = item.active === false ? `${item.label} (nonaktif)` : item.label;
      return `<option value="${escapeHtml(item.value)}" ${item.value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`;
    })
  ].join("");
}

function enumOptions(values: readonly string[], labels: Record<string, string>, selected: string | null | undefined, includeEmpty = "Pilih"): string {
  return [
    `<option value="" ${!selected ? "selected" : ""}>${escapeHtml(includeEmpty)}</option>`,
    ...values.map((value) => `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(labels[value] || value)}</option>`)
  ].join("");
}

async function campaignOptions(selected: string | null | undefined): Promise<string> {
  const campaigns = await listCampaigns();
  return campaigns
    .map((campaign) => `<option value="${escapeHtml(campaign.id)}" ${campaign.id === selected ? "selected" : ""}>${escapeHtml(campaign.code)} - ${escapeHtml(campaign.name)}</option>`)
    .join("");
}

async function relationOptions(selected: {
  product_id?: string | null;
  color_id?: string | null;
  primary_offer_id?: string | null;
  primary_pain_point_id?: string | null;
}) {
  const [products, colors, offers, painPoints] = await Promise.all([
    listProducts(),
    listColors(),
    listOffers(),
    listPainPoints()
  ]);

  return {
    products: options(
      (products as any[])
        .filter((product) => product.active || product.id === selected.product_id)
        .map((product) => ({ value: product.id, label: product.name, active: product.active })),
      selected.product_id,
      "Campuran / Semua Produk"
    ),
    colors: options(
      (colors as any[])
        .filter((color) => color.active || color.id === selected.color_id)
        .map((color) => ({ value: color.id, label: color.name, active: color.active })),
      selected.color_id,
      "Tanpa warna"
    ),
    offers: options(
      (offers as any[])
        .filter((offer) => offer.active || offer.id === selected.primary_offer_id)
        .map((offer) => ({ value: offer.id, label: offer.title, active: offer.active })),
      selected.primary_offer_id,
      "Tanpa offer utama"
    ),
    painPoints: options(
      (painPoints as any[])
        .filter((painPoint) => painPoint.active || painPoint.id === selected.primary_pain_point_id)
        .map((painPoint) => ({ value: painPoint.id, label: painPoint.title, active: painPoint.active })),
      selected.primary_pain_point_id,
      "Tanpa pain point utama"
    )
  };
}

async function recommendationHint(): Promise<string> {
  const defaults = await listSchoolLevelColorDefaults();
  if (!defaults.length) {
    return `<p class="hint">Rekomendasi warna belum tersedia. Admin tetap bisa memilih warna manual.</p>`;
  }

  const labels = defaults
    .map((item: any) => `${schoolLevelLabels[item.school_level] || item.school_level}: ${item.color_name}`)
    .join(", ");
  return `<p class="hint">Petunjuk warna jenjang: ${escapeHtml(labels)}. Rekomendasi ini tidak otomatis disimpan dan bisa dioverride admin.</p>`;
}

export async function renderContentItemListPage(url: URL): Promise<string> {
  const campaignId = url.searchParams.get("campaign_id") || "";
  const productionStatus = url.searchParams.get("production_status") || "";
  const [items, campaigns] = await Promise.all([
    listContentItems({ campaign_id: campaignId, production_status: productionStatus }),
    listCampaigns()
  ]);

  const filter = `
    <form method="get" action="/content-items">
      <div class="form-grid">
        <label>Campaign
          <select name="campaign_id">
            <option value="">Semua campaign</option>
            ${campaigns.map((campaign) => `<option value="${escapeHtml(campaign.id)}" ${campaign.id === campaignId ? "selected" : ""}>${escapeHtml(campaign.code)} - ${escapeHtml(campaign.name)}</option>`).join("")}
          </select>
        </label>
        <label>Production Status
          <select name="production_status">
            <option value="">Semua status</option>
            ${productionStatuses.map((status) => `<option value="${escapeHtml(status)}" ${status === productionStatus ? "selected" : ""}>${escapeHtml(productionStatusLabels[status])}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="button-row" style="margin-top: 14px;">
        <button type="submit">Filter</button>
        <a class="button button-secondary" href="/content-items">Reset</a>
        <a class="button" href="/content-items/new">Buat Konten</a>
      </div>
    </form>
  `;

  const table = renderReadOnlyTable(
    ["Kode", "Judul", "Campaign", "Tanggal", "Produk", "Audience", "Pillar", "Status", "Aksi"],
    items.map((item) => [
      `<strong>${escapeHtml(item.content_code)}</strong>`,
      escapeHtml(item.title),
      `${escapeHtml(item.campaign_code)}<br><span class="muted">${escapeHtml(item.campaign_name)}</span>`,
      escapeHtml(formatDate(item.planned_content_date)),
      escapeHtml(productLabel(item)),
      escapeHtml(audienceSegmentLabels[item.audience_segment] || item.audience_segment),
      escapeHtml(contentPillarLabels[item.content_pillar] || item.content_pillar),
      escapeHtml(productionStatusLabels[item.production_status] || item.production_status),
      `<div class="button-row">
        <a class="button button-secondary" href="/content-items/${escapeHtml(item.id)}">Detail</a>
        <a class="button" href="/content-items/${escapeHtml(item.id)}/edit">Edit</a>
      </div>`
    ])
  );

  return renderLayout(
    "/content-items",
    "Konten",
    "Content Item Management",
    "Kelola ide dan karya utama konten. Publikasi channel belum tersedia pada tahap ini.",
    `${renderMessage(url)}${filter}${table}`
  );
}

export async function renderContentItemFormPage(optionsInput: {
  mode: "create" | "edit";
  action: string;
  values?: ContentItemInput;
  item?: ContentItemRow;
  errorMessage?: string;
  campaignIdFromQuery?: string | null;
}): Promise<string> {
  const campaigns = await listCampaigns();
  if (optionsInput.mode === "create" && campaigns.length === 0) {
    return renderLayout(
      "/content-items",
      "Buat Konten",
      "Content Item Management",
      "Konten harus berada dalam satu campaign.",
      `<div class="notice error">Buat campaign terlebih dahulu sebelum membuat konten.</div><div class="button-row"><a class="button" href="/campaigns/new">Buat Campaign</a></div>`
    );
  }

  const values = optionsInput.values || {
    campaign_id: optionsInput.campaignIdFromQuery || campaigns[0]?.id,
    audience_segment: "end_user_school",
    content_pillar: "mockup_magnet"
  };
  const relation = await relationOptions(values);
  const title = optionsInput.mode === "create" ? "Buat Konten" : "Edit Konten";
  const buttonLabel = optionsInput.mode === "create" ? "Buat Konten" : "Simpan Konten";
  const error = optionsInput.errorMessage ? `<div class="notice error">${escapeHtml(optionsInput.errorMessage)}</div>` : "";
  const identity = optionsInput.item
    ? `<div class="notice">
        Campaign: ${escapeHtml(optionsInput.item.campaign_code)} - ${escapeHtml(optionsInput.item.campaign_name)}<br>
        Sequence: ${escapeHtml(optionsInput.item.sequence_number)}<br>
        Content code: <strong>${escapeHtml(optionsInput.item.content_code)}</strong>
      </div>`
    : "";

  const campaignField = optionsInput.mode === "edit" && optionsInput.item
    ? `<input type="hidden" name="campaign_id" value="${escapeHtml(optionsInput.item.campaign_id)}">`
    : `<label>Campaign
        <select name="campaign_id" required>${await campaignOptions(values.campaign_id)}</select>
      </label>`;

  const form = `
    ${error}
    ${identity}
    <form method="post" action="${escapeHtml(optionsInput.action)}">
      <div class="form-grid">
        ${campaignField}
        <label>Judul Konten
          <input name="title" value="${escapeHtml(values.title || "")}" maxlength="200" required>
        </label>
        <label>Tanggal Rencana Konten
          <input name="planned_content_date" type="date" value="${escapeHtml(values.planned_content_date || "")}" required>
        </label>
        <label>Produk
          <select name="product_id">${relation.products}</select>
        </label>
      </div>
      <div class="form-grid" style="margin-top: 14px;">
        <label>Jenjang Sekolah
          <select name="school_level">${enumOptions(Object.keys(schoolLevelLabels), schoolLevelLabels, values.school_level, "Tanpa jenjang")}</select>
        </label>
        <label>Warna
          <select name="color_id">${relation.colors}</select>
        </label>
        <label>Audience Segment
          <select name="audience_segment" required>${enumOptions(audienceSegments, audienceSegmentLabels, values.audience_segment)}</select>
        </label>
        <label>Content Pillar
          <select name="content_pillar" required>${enumOptions(contentPillars, contentPillarLabels, values.content_pillar)}</select>
        </label>
      </div>
      <div style="margin-top: 10px;">${await recommendationHint()}</div>
      <div class="form-grid" style="margin-top: 14px;">
        <label>Offer Utama
          <select name="primary_offer_id">${relation.offers}</select>
        </label>
        <label>Pain Point Utama
          <select name="primary_pain_point_id">${relation.painPoints}</select>
        </label>
        <label>CTA Keyword
          <input name="cta_keyword" value="${escapeHtml(values.cta_keyword || "")}" maxlength="40" placeholder="MOCKUP">
        </label>
        <label>Target Audiens
          <input name="target_audience" value="${escapeHtml(values.target_audience || "")}" maxlength="500" required>
        </label>
      </div>
      <label style="margin-top: 14px;">Hook
        <textarea name="hook" maxlength="1000" required>${escapeHtml(values.hook || "")}</textarea>
      </label>
      <label style="margin-top: 14px;">Angle
        <textarea name="angle" maxlength="2000" required>${escapeHtml(values.angle || "")}</textarea>
      </label>
      <label style="margin-top: 14px;">CTA Text
        <textarea name="cta_text" maxlength="1000" required>${escapeHtml(values.cta_text || "")}</textarea>
      </label>
      <label style="margin-top: 14px;">Catatan
        <textarea name="notes" maxlength="5000">${escapeHtml(values.notes || "")}</textarea>
      </label>
      <div class="button-row" style="margin-top: 14px;">
        <button type="submit">${escapeHtml(buttonLabel)}</button>
        <a class="button button-secondary" href="/content-items">Kembali</a>
      </div>
    </form>
  `;

  return renderLayout(
    "/content-items",
    title,
    "Content Item Management",
    "Sequence, content code, dan production status diatur sistem.",
    form
  );
}

function relationDetailRows(item: ContentItemRow): unknown[][] {
  const rows: unknown[][] = [];
  if (item.primary_offer_id) {
    rows.push(["Offer Title", escapeHtml(item.offer_title || "-")]);
    rows.push(["Offer Public Phrase", escapeHtml(item.offer_public_phrase || "-")]);
    rows.push(["Offer Condition", escapeHtml(item.offer_condition_text || "-")]);
    rows.push(["Offer Risk Note", escapeHtml(item.offer_risk_note || "-")]);
  }
  if (item.primary_pain_point_id) {
    rows.push(["Pain Point Title", escapeHtml(item.pain_point_title || "-")]);
    rows.push(["Buyer Fear", escapeHtml(item.pain_point_buyer_fear || "-")]);
    rows.push(["Content Angle", escapeHtml(item.pain_point_content_angle || "-")]);
    rows.push(["Safe Claim", escapeHtml(item.pain_point_safe_claim || "-")]);
    rows.push(["Avoid Claim", escapeHtml(item.pain_point_avoid_claim || "-")]);
  }
  return rows;
}

function statusActions(item: ContentItemRow): string {
  const next = productionTransitions[item.production_status] || [];
  if (!next.length) {
    return `<p class="hint">Tidak ada aksi status berikutnya.</p>`;
  }

  return `<div class="button-row">
    ${next.map((status) => `
      <form class="inline-form" method="post" action="/content-items/${escapeHtml(item.id)}/production-status">
        <input type="hidden" name="production_status" value="${escapeHtml(status)}">
        <button type="submit">${escapeHtml(productionStatusLabels[status] || status)}</button>
      </form>
    `).join("")}
  </div>`;
}

export function renderContentItemDetailPage(item: ContentItemRow, url: URL): string {
  const rows = [
    ["Content Code", `<strong>${escapeHtml(item.content_code)}</strong>`],
    ["Sequence", escapeHtml(item.sequence_number)],
    ["Campaign", `${escapeHtml(item.campaign_code)} - ${escapeHtml(item.campaign_name)}`],
    ["Tanggal Rencana Konten", escapeHtml(formatDate(item.planned_content_date))],
    ["Produk", escapeHtml(productLabel(item))],
    ["Jenjang Sekolah", escapeHtml(item.school_level ? schoolLevelLabels[item.school_level] || item.school_level : "-")],
    ["Warna", item.color_id ? `${renderSwatch(item.color_hex_preview)} ${escapeHtml(item.color_name || "-")}` : "-"],
    ["Audience Segment", escapeHtml(audienceSegmentLabels[item.audience_segment] || item.audience_segment)],
    ["Target Audiens", escapeHtml(item.target_audience)],
    ["Content Pillar", escapeHtml(contentPillarLabels[item.content_pillar] || item.content_pillar)],
    ["Hook", escapeHtml(item.hook)],
    ["Angle", escapeHtml(item.angle)],
    ["CTA Text", escapeHtml(item.cta_text)],
    ["CTA Keyword", escapeHtml(item.cta_keyword || "-")],
    ["Production Status", escapeHtml(productionStatusLabels[item.production_status] || item.production_status)],
    ["Catatan", escapeHtml(item.notes || "-")]
  ];

  const actions = `
    ${renderMessage(url)}
    <div class="button-row">
      <a class="button" href="/content-items/${escapeHtml(item.id)}/edit">Edit Konten</a>
      <a class="button button-secondary" href="/content-items">Kembali</a>
    </div>
    <p class="hint">Publikasi channel akan dikelola pada tahap berikutnya.</p>
  `;

  return renderLayout(
    "/content-items",
    item.title,
    "Detail Konten",
    "Detail ide/karya utama konten dan status produksi.",
    `${actions}${renderReadOnlyTable(["Field", "Nilai"], [...rows, ...relationDetailRows(item)])}<section><h2>Aksi Production Status</h2>${statusActions(item)}</section>`
  );
}

export function renderContentItemNotFoundPage(message = "Content item tidak ditemukan."): string {
  return renderLayout(
    "/content-items",
    "Konten Tidak Ditemukan",
    "Error",
    "Konten tidak dapat ditampilkan.",
    `<div class="notice error">${escapeHtml(message)}</div><div class="button-row"><a class="button button-secondary" href="/content-items">Kembali</a></div>`
  );
}

export async function renderCampaignContentItemsSection(campaign: CampaignRow): Promise<string> {
  const items = await listContentItems({ campaign_id: campaign.id });
  const actions = `<div class="button-row"><a class="button" href="/content-items/new?campaign_id=${escapeHtml(campaign.id)}">Tambah Konten</a></div>`;
  const table = renderReadOnlyTable(
    ["Kode", "Judul", "Tanggal", "Status", "Aksi"],
    items.map((item) => [
      `<strong>${escapeHtml(item.content_code)}</strong>`,
      escapeHtml(item.title),
      escapeHtml(formatDate(item.planned_content_date)),
      escapeHtml(productionStatusLabels[item.production_status] || item.production_status),
      `<div class="button-row"><a class="button button-secondary" href="/content-items/${escapeHtml(item.id)}">Detail</a></div>`
    ])
  );

  return `<section><h2>Konten Campaign</h2>${actions}${table}</section>`;
}

export function valuesFromForm(body: Record<string, string>): ContentItemInput {
  return {
    campaign_id: emptyToNull(body.campaign_id),
    title: body.title,
    planned_content_date: body.planned_content_date,
    product_id: emptyToNull(body.product_id),
    school_level: emptyToNull(body.school_level),
    color_id: emptyToNull(body.color_id),
    audience_segment: body.audience_segment,
    target_audience: body.target_audience,
    content_pillar: body.content_pillar,
    primary_offer_id: emptyToNull(body.primary_offer_id),
    primary_pain_point_id: emptyToNull(body.primary_pain_point_id),
    hook: body.hook,
    angle: body.angle,
    cta_text: body.cta_text,
    cta_keyword: emptyToNull(body.cta_keyword),
    notes: emptyToNull(body.notes)
  };
}

export function valuesFromContentItem(item: ContentItemRow): ContentItemInput {
  return {
    campaign_id: item.campaign_id,
    title: item.title,
    planned_content_date: item.planned_content_date,
    product_id: item.product_id,
    school_level: item.school_level,
    color_id: item.color_id,
    audience_segment: item.audience_segment,
    target_audience: item.target_audience,
    content_pillar: item.content_pillar,
    primary_offer_id: item.primary_offer_id,
    primary_pain_point_id: item.primary_pain_point_id,
    hook: item.hook,
    angle: item.angle,
    cta_text: item.cta_text,
    cta_keyword: item.cta_keyword,
    notes: item.notes
  };
}
