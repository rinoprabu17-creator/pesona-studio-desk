import type { CampaignRow } from "../campaign-service.ts";
import { listCampaigns } from "../campaign-service.ts";
import type { ContentItemRow } from "../content-item-service.ts";
import { listContentItems } from "../content-item-service.ts";
import type { ContentItemFootageSelectionRow } from "../content-item-footage-service.ts";
import { listContentItemFootageSelections } from "../content-item-footage-service.ts";
import type { ContentItemScriptPlanRow, ShotPlanStepRow } from "../content-item-script-plan-service.ts";
import {
  getOrCreateContentItemScriptPlan,
  listShotPlanSteps
} from "../content-item-script-plan-service.ts";
import type { FootageAssetRow } from "../footage-asset-service.ts";
import { listFootageAssets } from "../footage-asset-service.ts";
import { listColors, listOffers, listPainPoints, listProducts, listSchoolLevelColorDefaults } from "../library-service.ts";
import { renderContentItemPublicationsSection } from "./content-publication-pages.ts";
import { contentItemFootageRoles } from "../validation/content-item-footage-validation.ts";
import {
  scriptPlanStatuses,
  scriptPlanVideoFormats,
  shotPlanStepTypes
} from "../validation/content-item-script-plan-validation.ts";
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

export const contentItemFootageRoleLabels: Record<string, string> = {
  opening: "Opening",
  product: "Produk",
  process: "Proses",
  packing: "Packing",
  delivery: "Delivery",
  testimonial: "Testimonial",
  closing: "Closing",
  b_roll: "B-roll",
  other: "Lainnya"
};

export const scriptPlanStatusLabels: Record<string, string> = {
  draft: "Draft",
  reviewed: "Reviewed",
  approved: "Approved",
  archived: "Archived"
};

export const scriptPlanVideoFormatLabels: Record<string, string> = {
  short_video: "Short Video",
  reels: "Reels",
  tiktok: "TikTok",
  youtube_short: "YouTube Short",
  story: "Story",
  other: "Lainnya"
};

export const shotPlanStepTypeLabels: Record<string, string> = {
  hook: "Hook",
  scene: "Scene",
  product: "Produk",
  process: "Proses",
  packing: "Packing",
  delivery: "Delivery",
  testimonial: "Testimonial",
  b_roll: "B-roll",
  cta: "CTA",
  closing: "Closing",
  other: "Lainnya"
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

function footageAssetOptionLabel(asset: FootageAssetRow): string {
  const parts = [
    asset.relative_path,
    asset.product_name || "Tanpa produk",
    asset.theme || "Tanpa tema",
    asset.shot_type,
    asset.status,
    `${asset.size_bytes} bytes`
  ];
  return parts.join(" | ");
}

function footageSelectOptions(assets: FootageAssetRow[]): string {
  if (!assets.length) {
    return `<option value="">Belum ada footage reviewed/approved</option>`;
  }
  return [
    `<option value="">Pilih footage</option>`,
    ...assets.map((asset) => `<option value="${escapeHtml(asset.id)}">${escapeHtml(footageAssetOptionLabel(asset))}</option>`)
  ].join("");
}

function roleOptions(selected = "other"): string {
  return contentItemFootageRoles
    .map((role) => `<option value="${escapeHtml(role)}" ${role === selected ? "selected" : ""}>${escapeHtml(contentItemFootageRoleLabels[role] || role)}</option>`)
    .join("");
}

function scriptPlanStatusOptions(selected = "draft"): string {
  return scriptPlanStatuses
    .map((status) => `<option value="${escapeHtml(status)}" ${status === selected ? "selected" : ""}>${escapeHtml(scriptPlanStatusLabels[status] || status)}</option>`)
    .join("");
}

function videoFormatOptions(selected = "short_video"): string {
  return scriptPlanVideoFormats
    .map((format) => `<option value="${escapeHtml(format)}" ${format === selected ? "selected" : ""}>${escapeHtml(scriptPlanVideoFormatLabels[format] || format)}</option>`)
    .join("");
}

function shotStepTypeOptions(selected = "scene"): string {
  return shotPlanStepTypes
    .map((stepType) => `<option value="${escapeHtml(stepType)}" ${stepType === selected ? "selected" : ""}>${escapeHtml(shotPlanStepTypeLabels[stepType] || stepType)}</option>`)
    .join("");
}

function selectedFootageOptions(selections: ContentItemFootageSelectionRow[], selected: string | null = null): string {
  return [
    `<option value="" ${!selected ? "selected" : ""}>Tanpa footage terpilih</option>`,
    ...selections.map((selection) => {
      const label = `#${selection.sequence_number} ${selection.filename} | ${contentItemFootageRoleLabels[selection.role] || selection.role} | ${selection.relative_path}`;
      return `<option value="${escapeHtml(selection.id)}" ${selection.id === selected ? "selected" : ""}>${escapeHtml(label)}</option>`;
    })
  ].join("");
}

function renderScriptPlanForm(item: ContentItemRow, plan: ContentItemScriptPlanRow): string {
  return `
    <section>
      <h2>Script Plan</h2>
      <form method="post" action="/content-items/${escapeHtml(item.id)}/script-plan/save">
        <div class="form-grid">
          <label>Status Plan
            <select name="plan_status">${scriptPlanStatusOptions(plan.plan_status)}</select>
          </label>
          <label>Format Video
            <select name="video_format">${videoFormatOptions(plan.video_format)}</select>
          </label>
        </div>
        <label style="margin-top: 14px;">Hook Text
          <textarea name="hook_text" maxlength="500">${escapeHtml(plan.hook_text || "")}</textarea>
        </label>
        <label style="margin-top: 14px;">Main Message
          <textarea name="main_message" maxlength="2000">${escapeHtml(plan.main_message || "")}</textarea>
        </label>
        <label style="margin-top: 14px;">CTA Text
          <textarea name="cta_text" maxlength="500">${escapeHtml(plan.cta_text || "")}</textarea>
        </label>
        <label style="margin-top: 14px;">Catatan
          <textarea name="notes" maxlength="2000">${escapeHtml(plan.notes || "")}</textarea>
        </label>
        <div class="button-row" style="margin-top: 14px;">
          <button type="submit">Simpan Script Plan</button>
        </div>
      </form>
    </section>
  `;
}

function renderSelectedFootageContext(selections: ContentItemFootageSelectionRow[]): string {
  return `<section>
    <h2>Footage Terpilih Sebagai Konteks</h2>
    ${renderReadOnlyTable(
      ["Urutan", "Footage", "Role", "Status", "Catatan"],
      selections.map((selection) => [
        escapeHtml(selection.sequence_number),
        `<strong>${escapeHtml(selection.filename)}</strong><br><span class="muted">${escapeHtml(selection.relative_path)}</span>`,
        escapeHtml(contentItemFootageRoleLabels[selection.role] || selection.role),
        escapeHtml(selection.footage_status),
        escapeHtml(selection.usage_note || "-")
      ])
    )}
  </section>`;
}

function renderShotPlanStepsTable(item: ContentItemRow, plan: ContentItemScriptPlanRow, selections: ContentItemFootageSelectionRow[], steps: ShotPlanStepRow[]): string {
  const rows = steps.map((step) => [
    `<form method="post" action="/content-items/${escapeHtml(item.id)}/script-plan/steps/${escapeHtml(step.id)}/update">
      <input name="sequence_number" type="number" min="1" step="1" value="${escapeHtml(step.sequence_number)}" required style="width: 86px;">
    `,
    `<select name="step_type">${shotStepTypeOptions(step.step_type)}</select>`,
    `<select name="content_item_footage_selection_id">${selectedFootageOptions(selections, step.content_item_footage_selection_id)}</select>
     <p class="hint">${step.footage_relative_path ? escapeHtml(step.footage_relative_path) : "Tidak memakai footage terpilih."}</p>`,
    `<textarea name="visual_note" maxlength="1000">${escapeHtml(step.visual_note || "")}</textarea>`,
    `<textarea name="narration_text" maxlength="2000">${escapeHtml(step.narration_text || "")}</textarea>`,
    `<textarea name="overlay_text" maxlength="500">${escapeHtml(step.overlay_text || "")}</textarea>
     <label>Durasi
       <input name="duration_seconds" type="number" min="1" max="120" step="1" value="${escapeHtml(step.duration_seconds ?? "")}">
     </label>`,
    `<div class="button-row">
        <button type="submit">Simpan</button>
      </form>
      <form class="inline-form" method="post" action="/content-items/${escapeHtml(item.id)}/script-plan/steps/${escapeHtml(step.id)}/remove">
        <button class="button-danger" type="submit">Hapus Step</button>
      </form>
    </div>`
  ]);
  return `<section>
    <h2>Shot Plan Steps</h2>
    ${renderReadOnlyTable(["Urutan", "Tipe", "Footage", "Visual", "Narasi", "Overlay/Durasi", "Aksi"], rows)}
  </section>`;
}

function renderAddShotPlanStepForm(item: ContentItemRow, selections: ContentItemFootageSelectionRow[], steps: ShotPlanStepRow[]): string {
  const nextSequence = steps.reduce((max, step) => Math.max(max, step.sequence_number), 0) + 1;
  return `<section>
    <h2>Tambah Shot Plan Step</h2>
    <form method="post" action="/content-items/${escapeHtml(item.id)}/script-plan/steps/add">
      <div class="form-grid">
        <label>Urutan
          <input name="sequence_number" type="number" min="1" step="1" value="${escapeHtml(nextSequence)}" required>
        </label>
        <label>Tipe Step
          <select name="step_type">${shotStepTypeOptions("scene")}</select>
        </label>
        <label>Footage Terpilih Opsional
          <select name="content_item_footage_selection_id">${selectedFootageOptions(selections)}</select>
        </label>
        <label>Durasi Detik
          <input name="duration_seconds" type="number" min="1" max="120" step="1">
        </label>
      </div>
      <label style="margin-top: 14px;">Visual Note
        <textarea name="visual_note" maxlength="1000"></textarea>
      </label>
      <label style="margin-top: 14px;">Narration Text
        <textarea name="narration_text" maxlength="2000"></textarea>
      </label>
      <label style="margin-top: 14px;">Overlay Text
        <textarea name="overlay_text" maxlength="500"></textarea>
      </label>
      <div class="button-row" style="margin-top: 14px;">
        <button type="submit">Tambah Step</button>
        <a class="button button-secondary" href="/content-items/${escapeHtml(item.id)}">Kembali Detail</a>
      </div>
    </form>
  </section>`;
}

function renderSelectedFootageTable(item: ContentItemRow, selections: ContentItemFootageSelectionRow[]): string {
  const rows = selections.map((selection) => [
    `<form method="post" action="/content-items/${escapeHtml(item.id)}/footage/${escapeHtml(selection.id)}/update">
      <input name="sequence_number" type="number" min="1" step="1" value="${escapeHtml(selection.sequence_number)}" required style="width: 86px;">
    `,
    `<strong>${escapeHtml(selection.filename)}</strong><br><span class="muted">${escapeHtml(selection.relative_path)}</span>`,
    `${escapeHtml(selection.product_name || "Tanpa produk")}<br><span class="muted">${escapeHtml(selection.theme || "Tanpa tema")}</span>`,
    `<select name="role">${roleOptions(selection.role)}</select>`,
    `<textarea name="usage_note" maxlength="1000">${escapeHtml(selection.usage_note || "")}</textarea>`,
    `<div class="button-row">
        <button type="submit">Simpan</button>
      </form>
      <form class="inline-form" method="post" action="/content-items/${escapeHtml(item.id)}/footage/${escapeHtml(selection.id)}/remove">
        <button class="button-danger" type="submit">Lepas</button>
      </form>
    </div>`
  ]);
  return renderReadOnlyTable(["Urutan", "Footage", "Konteks", "Role", "Catatan Pakai", "Aksi"], rows);
}

export async function renderContentItemFootagePage(item: ContentItemRow, url: URL): Promise<string> {
  const [selections, reviewed, approved] = await Promise.all([
    listContentItemFootageSelections(item.id),
    listFootageAssets({ status: "reviewed" }),
    listFootageAssets({ status: "approved" })
  ]);
  const selectable = [...reviewed, ...approved].sort((a, b) => a.relative_path.localeCompare(b.relative_path));
  const nextSequence = selections.reduce((max, selection) => Math.max(max, selection.sequence_number), 0) + 1;

  const summary = renderReadOnlyTable(
    ["Field", "Nilai"],
    [
      ["Content Code", `<strong>${escapeHtml(item.content_code)}</strong>`],
      ["Judul", escapeHtml(item.title)],
      ["Campaign", `${escapeHtml(item.campaign_code)} - ${escapeHtml(item.campaign_name)}`],
      ["Tanggal", escapeHtml(formatDate(item.planned_content_date))],
      ["Produk", escapeHtml(productLabel(item))],
      ["Status", escapeHtml(productionStatusLabels[item.production_status] || item.production_status)]
    ]
  );

  const addForm = `
    <section>
      <h2>Tambah Footage Pilihan</h2>
      <form method="post" action="/content-items/${escapeHtml(item.id)}/footage/add">
        <div class="form-grid">
          <label>Footage Reviewed/Approved
            <select name="footage_asset_id" required>${footageSelectOptions(selectable)}</select>
          </label>
          <label>Urutan
            <input name="sequence_number" type="number" min="1" step="1" value="${escapeHtml(nextSequence)}" required>
          </label>
          <label>Role
            <select name="role">${roleOptions("other")}</select>
          </label>
        </div>
        <label style="margin-top: 14px;">Catatan Pakai
          <textarea name="usage_note" maxlength="1000" placeholder="contoh: close-up opening untuk hook"></textarea>
        </label>
        <div class="button-row" style="margin-top: 14px;">
          <button type="submit">Pilih Footage</button>
          <a class="button button-secondary" href="/content-items/${escapeHtml(item.id)}">Kembali Detail</a>
        </div>
      </form>
    </section>
  `;

  const content = `
    ${renderMessage(url)}
    <div class="notice">Workflow ini hanya memilih footage untuk planning konten. Tidak ada file footage yang dipindah, diedit, dihapus, diupload, atau dirender menjadi video.</div>
    ${summary}
    <section>
      <h2>Footage Terpilih</h2>
      ${renderSelectedFootageTable(item, selections)}
    </section>
    ${addForm}
  `;

  return renderLayout(
    "/content-items",
    `Footage Konten - ${item.content_code}`,
    "Content Footage Selection",
    "Pilih footage reviewed/approved untuk rencana konten sebelum script dan video workflow.",
    content
  );
}

export async function renderContentItemScriptPlanPage(item: ContentItemRow, url: URL): Promise<string> {
  const plan = await getOrCreateContentItemScriptPlan(item.id);
  const [selections, steps] = await Promise.all([
    listContentItemFootageSelections(item.id),
    listShotPlanSteps(plan.id)
  ]);

  const summary = renderReadOnlyTable(
    ["Field", "Nilai"],
    [
      ["Content Code", `<strong>${escapeHtml(item.content_code)}</strong>`],
      ["Judul", escapeHtml(item.title)],
      ["Campaign", `${escapeHtml(item.campaign_code)} - ${escapeHtml(item.campaign_name)}`],
      ["Tanggal", escapeHtml(formatDate(item.planned_content_date))],
      ["Produk", escapeHtml(productLabel(item))],
      ["Status", escapeHtml(productionStatusLabels[item.production_status] || item.production_status)]
    ]
  );

  const content = `
    ${renderMessage(url)}
    <div class="notice">Planning ini manual/rule-based untuk script dan shot order. Tidak ada AI generation, video render, file modification, upload, auto-posting, penerbitan otomatis, atau penjadwalan otomatis.</div>
    ${summary}
    ${renderScriptPlanForm(item, plan)}
    ${renderSelectedFootageContext(selections)}
    ${renderShotPlanStepsTable(item, plan, selections, steps)}
    ${renderAddShotPlanStepForm(item, selections, steps)}
  `;

  return renderLayout(
    "/content-items",
    `Script/Shot Plan - ${item.content_code}`,
    "Script / Shot Planning",
    "Susun script draft dan urutan shot berdasarkan footage terpilih sebelum workflow video.",
    content
  );
}

export async function renderContentItemDetailPage(item: ContentItemRow, url: URL): Promise<string> {
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
      <a class="button" href="/content-items/${escapeHtml(item.id)}/footage">Pilih Footage</a>
      <a class="button" href="/content-items/${escapeHtml(item.id)}/script-plan">Script/Shot Plan</a>
      <a class="button button-secondary" href="/content-items">Kembali</a>
    </div>
    <p class="hint">Publikasi channel akan dikelola pada tahap berikutnya.</p>
  `;

  return renderLayout(
    "/content-items",
    item.title,
    "Detail Konten",
    "Detail ide/karya utama konten dan status produksi.",
    `${actions}${renderReadOnlyTable(["Field", "Nilai"], [...rows, ...relationDetailRows(item)])}<section><h2>Aksi Production Status</h2>${statusActions(item)}</section>${await renderContentItemPublicationsSection(item)}`
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
