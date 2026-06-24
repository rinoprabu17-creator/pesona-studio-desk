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
  videoDraftJobStatuses,
  videoDraftRenderModes,
  videoDraftTargetFormats
} from "../validation/video-draft-job-validation.ts";
import type { VideoDraftJobRow, VideoDraftReadiness } from "../video-draft-job-service.ts";
import { getVideoDraftJobForContentItem } from "../video-draft-job-service.ts";
import type { RenderManifestItemRow, RenderManifestRow } from "../render-manifest-service.ts";
import { getRenderManifestContextForContentItem } from "../render-manifest-service.ts";
import type { RenderPreflightCheckRow, RenderPreflightRunRow } from "../render-preflight-service.ts";
import { getRenderPreflightContextForContentItem } from "../render-preflight-service.ts";
import type { RenderAttemptRow } from "../render-attempt-service.ts";
import { getControlledRenderContextForContentItem } from "../render-attempt-service.ts";
import {
  renderManifestModes,
  renderManifestStatuses,
  renderManifestTargetFormats
} from "../validation/render-manifest-validation.ts";
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

export const videoDraftJobStatusLabels: Record<string, string> = {
  draft_requested: "Draft Requested",
  planning_ready: "Planning Ready",
  blocked: "Blocked",
  cancelled: "Cancelled",
  archived: "Archived"
};

export const videoDraftTargetFormatLabels: Record<string, string> = {
  vertical_9_16: "Vertical 9:16",
  square_1_1: "Square 1:1",
  horizontal_16_9: "Horizontal 16:9",
  other: "Lainnya"
};

export const videoDraftRenderModeLabels: Record<string, string> = {
  disabled_metadata_only: "Disabled - metadata only"
};

export const renderManifestStatusLabels: Record<string, string> = {
  draft: "Draft",
  reviewed: "Reviewed",
  approved: "Approved",
  blocked: "Blocked",
  archived: "Archived"
};

export const renderManifestModeLabels: Record<string, string> = {
  metadata_only: "Metadata only"
};

export const renderPreflightResultLabels: Record<string, string> = {
  ready: "Ready",
  blocked: "Blocked"
};

export const renderPreflightLevelLabels: Record<string, string> = {
  blocking: "Blocking",
  warning: "Warning",
  info: "Info"
};

export const renderPreflightStatusLabels: Record<string, string> = {
  pass: "Pass",
  fail: "Fail"
};

export const renderAttemptStatusLabels: Record<string, string> = {
  requested: "Requested",
  running: "Running",
  succeeded: "Succeeded",
  failed: "Failed",
  blocked: "Blocked",
  archived: "Archived"
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

function videoDraftStatusOptions(selected = "draft_requested"): string {
  return videoDraftJobStatuses
    .map((status) => `<option value="${escapeHtml(status)}" ${status === selected ? "selected" : ""}>${escapeHtml(videoDraftJobStatusLabels[status] || status)}</option>`)
    .join("");
}

function videoDraftTargetFormatOptions(selected = "vertical_9_16"): string {
  return videoDraftTargetFormats
    .map((format) => `<option value="${escapeHtml(format)}" ${format === selected ? "selected" : ""}>${escapeHtml(videoDraftTargetFormatLabels[format] || format)}</option>`)
    .join("");
}

function videoDraftRenderModeOptions(selected = "disabled_metadata_only"): string {
  return videoDraftRenderModes
    .map((mode) => `<option value="${escapeHtml(mode)}" ${mode === selected ? "selected" : ""}>${escapeHtml(videoDraftRenderModeLabels[mode] || mode)}</option>`)
    .join("");
}

function renderManifestStatusOptions(selected = "draft"): string {
  return renderManifestStatuses
    .map((status) => `<option value="${escapeHtml(status)}" ${status === selected ? "selected" : ""}>${escapeHtml(renderManifestStatusLabels[status] || status)}</option>`)
    .join("");
}

function renderManifestModeOptions(selected = "metadata_only"): string {
  return renderManifestModes
    .map((mode) => `<option value="${escapeHtml(mode)}" ${mode === selected ? "selected" : ""}>${escapeHtml(renderManifestModeLabels[mode] || mode)}</option>`)
    .join("");
}

function renderManifestTargetFormatOptions(selected = "vertical_9_16"): string {
  return renderManifestTargetFormats
    .map((format) => `<option value="${escapeHtml(format)}" ${format === selected ? "selected" : ""}>${escapeHtml(videoDraftTargetFormatLabels[format] || format)}</option>`)
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
    <div class="notice">Workflow ini hanya memilih footage untuk planning konten. Tidak ada file footage yang dipindah, diedit, dihapus, diunggah, atau dibuat menjadi video.</div>
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
    <div class="notice">Planning ini manual/rule-based untuk script dan shot order. Tidak ada generasi AI, pembuatan video, perubahan file, unggah, auto-posting, penerbitan otomatis, atau penjadwalan otomatis.</div>
    ${summary}
    ${renderScriptPlanForm(item, plan)}
    ${renderSelectedFootageContext(selections)}
    ${renderShotPlanStepsTable(item, plan, selections, steps)}
    ${renderAddShotPlanStepForm(item, selections, steps)}
    <div class="button-row" style="margin-top: 14px;">
      <a class="button" href="/content-items/${escapeHtml(item.id)}/video-draft">Video Draft Job</a>
    </div>
  `;

  return renderLayout(
    "/content-items",
    `Script/Shot Plan - ${item.content_code}`,
    "Script / Shot Planning",
    "Susun script draft dan urutan shot berdasarkan footage terpilih sebelum workflow video.",
    content
  );
}

function renderVideoDraftReadiness(readiness: VideoDraftReadiness): string {
  const warnings = readiness.readiness_warnings.length
    ? `<ul>${readiness.readiness_warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>`
    : `<p class="hint">Tidak ada warning readiness.</p>`;

  return `<section>
    <h2>Readiness Metadata</h2>
    ${renderReadOnlyTable(
      ["Field", "Nilai"],
      [
        ["Script plan tersedia", readiness.has_script_plan ? "Ya" : "Tidak"],
        ["Jumlah shot step", escapeHtml(readiness.shot_step_count)],
        ["Jumlah footage terpilih", escapeHtml(readiness.selected_footage_count)],
        ["Shot step dengan footage terpilih", escapeHtml(readiness.steps_with_selected_footage_count)],
        ["Siap untuk future render", readiness.is_ready_for_future_render ? "Ya" : "Belum"]
      ]
    )}
    <h3>Warning</h3>
    ${warnings}
  </section>`;
}

function renderVideoDraftJobFields(job?: VideoDraftJobRow | null): string {
  return `
    <div class="form-grid">
      <label>Status Job
        <select name="job_status">${videoDraftStatusOptions(job?.job_status || "draft_requested")}</select>
      </label>
      <label>Target Format
        <select name="target_format">${videoDraftTargetFormatOptions(job?.target_format || "vertical_9_16")}</select>
      </label>
      <label>Mode
        <select name="render_mode">${videoDraftRenderModeOptions(job?.render_mode || "disabled_metadata_only")}</select>
      </label>
      <label>Target Durasi Detik
        <input name="duration_target_seconds" type="number" min="5" max="180" step="1" value="${escapeHtml(job?.duration_target_seconds ?? "")}">
      </label>
    </div>
    <label style="margin-top: 14px;">Label Output Rencana
      <input name="planned_output_label" maxlength="300" value="${escapeHtml(job?.planned_output_label || "")}" placeholder="contoh: Reels Sampul Raport SD - Draft 1">
    </label>
    <label style="margin-top: 14px;">Catatan Request
      <textarea name="request_notes" maxlength="2000">${escapeHtml(job?.request_notes || "")}</textarea>
    </label>
    <label style="margin-top: 14px;">Blocking Reason
      <textarea name="blocking_reason" maxlength="2000">${escapeHtml(job?.blocking_reason || "")}</textarea>
    </label>
    <label style="margin-top: 14px;">Review Notes
      <textarea name="review_notes" maxlength="2000">${escapeHtml(job?.review_notes || "")}</textarea>
    </label>
  `;
}

function renderVideoDraftJobSection(item: ContentItemRow, job: VideoDraftJobRow | null, readiness: VideoDraftReadiness): string {
  if (!readiness.has_script_plan) {
    return `<section>
      <h2>Video Draft Job</h2>
      <div class="notice error">Script/Shot Plan belum tersedia. Buat Script/Shot Plan terlebih dahulu sebelum membuat request metadata video draft.</div>
      <div class="button-row">
        <a class="button" href="/content-items/${escapeHtml(item.id)}/script-plan">Buat Script/Shot Plan</a>
      </div>
    </section>`;
  }

  if (!job) {
    return `<section>
      <h2>Buat Video Draft Job</h2>
      <form method="post" action="/content-items/${escapeHtml(item.id)}/video-draft/request">
        ${readiness.script_plan_id ? `<input type="hidden" name="script_plan_id" value="${escapeHtml(readiness.script_plan_id)}">` : ""}
        ${renderVideoDraftJobFields(null)}
        <div class="button-row" style="margin-top: 14px;">
          <button type="submit">Buat Metadata Job</button>
          <a class="button button-secondary" href="/content-items/${escapeHtml(item.id)}">Kembali Detail</a>
        </div>
      </form>
    </section>`;
  }

  return `<section>
    <h2>Video Draft Job</h2>
    ${renderReadOnlyTable(
      ["Field", "Nilai"],
      [
        ["Job ID", escapeHtml(job.id)],
        ["Script Plan", escapeHtml(job.script_plan_id)],
        ["Status script plan", escapeHtml(scriptPlanStatusLabels[job.script_plan_status] || job.script_plan_status)],
        ["Format script plan", escapeHtml(scriptPlanVideoFormatLabels[job.script_video_format] || job.script_video_format)]
      ]
    )}
    <form method="post" action="/content-items/${escapeHtml(item.id)}/video-draft/${escapeHtml(job.id)}/update">
      <input type="hidden" name="script_plan_id" value="${escapeHtml(job.script_plan_id)}">
      ${renderVideoDraftJobFields(job)}
      <div class="button-row" style="margin-top: 14px;">
        <button type="submit">Simpan Metadata Job</button>
      </div>
    </form>
    <form class="inline-form" method="post" action="/content-items/${escapeHtml(item.id)}/video-draft/${escapeHtml(job.id)}/cancel">
      <button class="button-danger" type="submit">Cancel Job</button>
    </form>
    <div class="button-row" style="margin-top: 14px;">
      <a class="button" href="/content-items/${escapeHtml(item.id)}/video-draft/${escapeHtml(job.id)}/manifest">Render Manifest</a>
    </div>
  </section>`;
}

export async function renderContentItemVideoDraftPage(item: ContentItemRow, url: URL): Promise<string> {
  const { readiness, job } = await getVideoDraftJobForContentItem(item.id);
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
    <div class="notice">Video draft job ini hanya tracker metadata request. Tidak ada pembuatan video, tidak menjalankan alat render lokal, tidak membuat file video, tidak ada generasi AI, tidak ada unggah, posting otomatis, atau penjadwalan otomatis.</div>
    ${summary}
    ${renderVideoDraftReadiness(readiness)}
    ${renderVideoDraftJobSection(item, job, readiness)}
    <div class="button-row" style="margin-top: 14px;">
      <a class="button button-secondary" href="/content-items/${escapeHtml(item.id)}/script-plan">Script/Shot Plan</a>
      <a class="button button-secondary" href="/content-items/${escapeHtml(item.id)}">Detail Konten</a>
    </div>
  `;

  return renderLayout(
    "/content-items",
    `Video Draft Job - ${item.content_code}`,
    "Video Draft Job",
    "Metadata-only request tracker untuk future video draft. Fase ini belum membuat file video.",
    content
  );
}

function renderManifestCreateSection(item: ContentItemRow, job: NonNullable<Awaited<ReturnType<typeof getRenderManifestContextForContentItem>>["job"]>): string {
  return `<section>
    <h2>Buat Render Manifest DB-only</h2>
    <form method="post" action="/content-items/${escapeHtml(item.id)}/video-draft/${escapeHtml(job.id)}/manifest/create">
      <div class="form-grid">
        <label>Status Manifest
          <select name="manifest_status">${renderManifestStatusOptions("draft")}</select>
        </label>
        <label>Mode
          <select name="manifest_mode">${renderManifestModeOptions("metadata_only")}</select>
        </label>
        <label>Target Format
          <select name="target_format">${renderManifestTargetFormatOptions(job.target_format)}</select>
        </label>
      </div>
      <label style="margin-top: 14px;">Catatan
        <textarea name="notes" maxlength="2000" placeholder="Catatan inspeksi manifest sebelum future render."></textarea>
      </label>
      <div class="button-row" style="margin-top: 14px;">
        <button type="submit">Buat Manifest DB-only</button>
      </div>
    </form>
  </section>`;
}

function renderManifestSummary(item: ContentItemRow, jobId: string, manifest: RenderManifestRow): string {
  return `<section>
    <h2>Render Manifest</h2>
    ${renderReadOnlyTable(
      ["Field", "Nilai"],
      [
        ["Manifest ID", escapeHtml(manifest.id)],
        ["Status", escapeHtml(renderManifestStatusLabels[manifest.manifest_status] || manifest.manifest_status)],
        ["Mode", escapeHtml(renderManifestModeLabels[manifest.manifest_mode] || manifest.manifest_mode)],
        ["Target Format", escapeHtml(videoDraftTargetFormatLabels[manifest.target_format] || manifest.target_format)],
        ["Item Count", escapeHtml(manifest.item_count)],
        ["Estimasi Durasi", manifest.estimated_duration_seconds === null ? "-" : `${escapeHtml(manifest.estimated_duration_seconds)} detik`],
        ["Item dengan footage", escapeHtml(manifest.selected_footage_count)],
        ["Step tanpa footage", escapeHtml(manifest.missing_footage_step_count)],
        ["Warning", escapeHtml(manifest.manifest_warnings || "-")]
      ]
    )}
    <form method="post" action="/content-items/${escapeHtml(item.id)}/video-draft/${escapeHtml(jobId)}/manifest/${escapeHtml(manifest.id)}/update">
      <div class="form-grid">
        <label>Status Manifest
          <select name="manifest_status">${renderManifestStatusOptions(manifest.manifest_status)}</select>
        </label>
        <label>Mode
          <select name="manifest_mode">${renderManifestModeOptions(manifest.manifest_mode)}</select>
        </label>
        <label>Target Format
          <select name="target_format">${renderManifestTargetFormatOptions(manifest.target_format)}</select>
        </label>
      </div>
      <label style="margin-top: 14px;">Warning Manifest
        <textarea name="manifest_warnings" maxlength="4000">${escapeHtml(manifest.manifest_warnings || "")}</textarea>
      </label>
      <label style="margin-top: 14px;">Catatan
        <textarea name="notes" maxlength="2000">${escapeHtml(manifest.notes || "")}</textarea>
      </label>
      <div class="button-row" style="margin-top: 14px;">
        <button type="submit">Simpan Manifest</button>
      </div>
    </form>
  </section>`;
}

function renderManifestItems(items: RenderManifestItemRow[]): string {
  return `<section>
    <h2>Manifest Items</h2>
    ${renderReadOnlyTable(
      ["Urutan", "Tipe", "Footage Snapshot", "Visual", "Narasi/Overlay", "Durasi", "Warning"],
      items.map((item) => [
        escapeHtml(item.sequence_number),
        escapeHtml(shotPlanStepTypeLabels[item.step_type] || item.step_type),
        item.source_relative_path_snapshot
          ? `<strong>${escapeHtml(item.source_filename_snapshot || "-")}</strong><br><span class="muted">${escapeHtml(item.source_relative_path_snapshot)} | ${escapeHtml(item.source_file_extension_snapshot || "-")} | ${escapeHtml(item.source_size_bytes_snapshot ?? "-")} bytes</span>`
          : `<span class="muted">Tanpa footage snapshot</span>`,
        escapeHtml(item.visual_note || "-"),
        `${escapeHtml(item.narration_text || "-")}<br><span class="muted">${escapeHtml(item.overlay_text || "-")}</span>`,
        item.duration_seconds === null ? "-" : `${escapeHtml(item.duration_seconds)} detik`,
        escapeHtml(item.item_warnings || "-")
      ])
    )}
  </section>`;
}

export async function renderContentItemRenderManifestPage(item: ContentItemRow, jobId: string, url: URL): Promise<string> {
  const { job, manifest, items } = await getRenderManifestContextForContentItem(item.id, jobId);
  if (!job) {
    return renderContentItemNotFoundPage("Video draft job tidak ditemukan.");
  }

  const summary = renderReadOnlyTable(
    ["Field", "Nilai"],
    [
      ["Content Code", `<strong>${escapeHtml(item.content_code)}</strong>`],
      ["Judul", escapeHtml(item.title)],
      ["Video Draft Job", escapeHtml(job.id)],
      ["Job Status", escapeHtml(videoDraftJobStatusLabels[job.job_status] || job.job_status)],
      ["Render Mode", escapeHtml(videoDraftRenderModeLabels[job.render_mode] || job.render_mode)],
      ["Target Format", escapeHtml(videoDraftTargetFormatLabels[job.target_format] || job.target_format)],
      ["Label Output Rencana", escapeHtml(job.planned_output_label || "-")]
    ]
  );

  const content = `
    ${renderMessage(url)}
    <div class="notice">Render manifest ini DB-only untuk inspeksi owner. Tidak ada pembuatan video, tidak menjalankan alat render lokal, tidak membuat file JSON/video, tidak menulis ke storage, tidak ada generasi AI, tidak ada unggah, posting otomatis, atau penjadwalan otomatis.</div>
    ${summary}
    ${manifest ? renderManifestSummary(item, job.id, manifest) : renderManifestCreateSection(item, job)}
    ${manifest ? renderManifestItems(items) : ""}
    <div class="button-row" style="margin-top: 14px;">
      ${manifest ? `<a class="button" href="/content-items/${escapeHtml(item.id)}/video-draft/${escapeHtml(job.id)}/manifest/${escapeHtml(manifest.id)}/preflight">Render Preflight</a>` : ""}
      <a class="button button-secondary" href="/content-items/${escapeHtml(item.id)}/video-draft">Video Draft Job</a>
      <a class="button button-secondary" href="/content-items/${escapeHtml(item.id)}">Detail Konten</a>
    </div>
  `;

  return renderLayout(
    "/content-items",
    `Render Manifest - ${item.content_code}`,
    "Render Manifest",
    "Snapshot DB-only untuk rencana future render. Fase ini tidak membuat file atau menjalankan render.",
    content
  );
}

function renderPreflightRunSummary(run: RenderPreflightRunRow | null): string {
  if (!run) {
    return `<section><h2>Preflight Run Terakhir</h2><p class="hint">Belum ada render preflight run untuk manifest ini.</p></section>`;
  }
  return `<section>
    <h2>Preflight Run Terakhir</h2>
    ${renderReadOnlyTable(
      ["Field", "Nilai"],
      [
        ["Run ID", escapeHtml(run.id)],
        ["Status Run", escapeHtml(run.run_status)],
        ["Hasil", escapeHtml(renderPreflightResultLabels[run.preflight_result] || run.preflight_result)],
        ["Check Count", escapeHtml(run.check_count)],
        ["Blocking", escapeHtml(run.blocking_check_count)],
        ["Warning", escapeHtml(run.warning_check_count)],
        ["Summary", escapeHtml(run.summary || "-")]
      ]
    )}
  </section>`;
}

function renderPreflightRunList(runs: RenderPreflightRunRow[]): string {
  return `<section>
    <h2>Riwayat Preflight</h2>
    ${runs.length === 0
      ? `<p class="hint">Belum ada riwayat preflight.</p>`
      : renderReadOnlyTable(
          ["Run", "Hasil", "Blocking", "Warning", "Dibuat"],
          runs.slice(0, 10).map((run) => [
            escapeHtml(run.id),
            escapeHtml(renderPreflightResultLabels[run.preflight_result] || run.preflight_result),
            escapeHtml(run.blocking_check_count),
            escapeHtml(run.warning_check_count),
            escapeHtml(run.created_at)
          ])
        )}
  </section>`;
}

function renderPreflightChecks(checks: RenderPreflightCheckRow[]): string {
  return `<section>
    <h2>Check Terakhir</h2>
    ${checks.length === 0
      ? `<p class="hint">Belum ada check. Jalankan preflight untuk membuat hasil DB-only.</p>`
      : renderReadOnlyTable(
          ["Level", "Status", "Code", "Item", "Pesan"],
          checks.map((check) => [
            escapeHtml(renderPreflightLevelLabels[check.check_level] || check.check_level),
            escapeHtml(renderPreflightStatusLabels[check.check_status] || check.check_status),
            escapeHtml(check.check_code),
            escapeHtml(check.render_manifest_item_id || "-"),
            escapeHtml(check.message)
          ])
        )}
  </section>`;
}

export async function renderContentItemRenderPreflightPage(item: ContentItemRow, jobId: string, manifestId: string, url: URL): Promise<string> {
  const { manifest, latestRun, latestChecks, runs } = await getRenderPreflightContextForContentItem(item.id, jobId, manifestId);
  const summary = renderReadOnlyTable(
    ["Field", "Nilai"],
    [
      ["Content Code", `<strong>${escapeHtml(item.content_code)}</strong>`],
      ["Judul", escapeHtml(item.title)],
      ["Video Draft Job", escapeHtml(manifest.video_draft_job_id)],
      ["Job Status", escapeHtml(videoDraftJobStatusLabels[manifest.job_status] || manifest.job_status)],
      ["Render Mode", escapeHtml(videoDraftRenderModeLabels[manifest.render_mode] || manifest.render_mode)],
      ["Manifest", escapeHtml(manifest.id)],
      ["Manifest Status", escapeHtml(renderManifestStatusLabels[manifest.manifest_status] || manifest.manifest_status)],
      ["Manifest Mode", escapeHtml(renderManifestModeLabels[manifest.manifest_mode] || manifest.manifest_mode)],
      ["Item Count", escapeHtml(manifest.item_count)],
      ["Step tanpa footage", escapeHtml(manifest.missing_footage_step_count)]
    ]
  );

  const content = `
    ${renderMessage(url)}
    <div class="notice">Render preflight ini DB-only untuk inspeksi kesiapan. Tidak ada pembuatan video, tidak menjalankan alat render lokal, tidak membuat file JSON/video, tidak menulis ke storage, tidak ada generasi AI, tidak ada unggah, posting otomatis, atau penjadwalan otomatis.</div>
    ${summary}
    <section>
      <h2>Jalankan Preflight DB-only</h2>
      <p class="hint">Preflight membaca manifest dan item snapshot, lalu menyimpan hasil check ke database. Tidak ada file yang dibuat atau diubah.</p>
      <form method="post" action="/content-items/${escapeHtml(item.id)}/video-draft/${escapeHtml(jobId)}/manifest/${escapeHtml(manifest.id)}/preflight/run" style="margin-top: 14px;">
        <button type="submit">Run Preflight DB-only</button>
      </form>
    </section>
    ${renderPreflightRunSummary(latestRun)}
    ${renderPreflightChecks(latestChecks)}
    ${renderPreflightRunList(runs)}
    <div class="button-row" style="margin-top: 14px;">
      ${latestRun?.preflight_result === "ready" ? `<a class="button" href="/content-items/${escapeHtml(item.id)}/video-draft/${escapeHtml(jobId)}/manifest/${escapeHtml(manifest.id)}/render-attempts">Controlled Smoke Render</a>` : ""}
      <a class="button button-secondary" href="/content-items/${escapeHtml(item.id)}/video-draft/${escapeHtml(jobId)}/manifest">Render Manifest</a>
      <a class="button button-secondary" href="/content-items/${escapeHtml(item.id)}">Detail Konten</a>
    </div>
  `;

  return renderLayout(
    "/content-items",
    `Render Preflight - ${item.content_code}`,
    "Render Preflight",
    "DB-only readiness check untuk render manifest. Fase ini belum mengeksekusi render.",
    content
  );
}

function renderRenderAttemptEligibility(title: string, eligibility: Awaited<ReturnType<typeof getControlledRenderContextForContentItem>>["eligibility"]): string {
  return `<section>
    <h2>${escapeHtml(title)}</h2>
    ${renderReadOnlyTable(
      ["Field", "Nilai"],
      [
        ["Status", eligibility.ok ? `<span class="badge badge-ok">Eligible</span>` : `<span class="badge">Blocked</span>`],
        ["Source", escapeHtml(eligibility.source_relative_path || "-")],
        ["Output Preview", escapeHtml(eligibility.output_relative_path_preview || "-")],
        ["Blocking Reasons", eligibility.blocking_reasons.length ? escapeHtml(eligibility.blocking_reasons.join(" ")) : "-"]
      ]
    )}
  </section>`;
}

function renderRenderAttemptList(attempts: RenderAttemptRow[]): string {
  return `<section>
    <h2>Render Attempts</h2>
    ${attempts.length === 0
      ? `<p class="hint">Belum ada controlled smoke render attempt.</p>`
      : renderReadOnlyTable(
          ["Attempt", "Status", "Output", "Size", "Exit", "Error", "Dibuat"],
          attempts.map((attempt) => [
            escapeHtml(attempt.id),
            escapeHtml(renderAttemptStatusLabels[attempt.attempt_status] || attempt.attempt_status),
            escapeHtml(attempt.output_relative_path || "-"),
            attempt.output_size_bytes === null ? "-" : `${escapeHtml(attempt.output_size_bytes)} bytes`,
            attempt.ffmpeg_exit_code === null ? "-" : escapeHtml(attempt.ffmpeg_exit_code),
            escapeHtml(attempt.error_message || "-"),
            escapeHtml(attempt.created_at)
          ])
        )}
  </section>`;
}

export async function renderContentItemRenderAttemptsPage(item: ContentItemRow, jobId: string, manifestId: string, url: URL): Promise<string> {
  const { manifest, latestPreflight, eligibility, multiShotEligibility, attempts } = await getControlledRenderContextForContentItem(item.id, jobId, manifestId);
  const summary = renderReadOnlyTable(
    ["Field", "Nilai"],
    [
      ["Content Code", `<strong>${escapeHtml(item.content_code)}</strong>`],
      ["Judul", escapeHtml(item.title)],
      ["Video Draft Job", escapeHtml(manifest.video_draft_job_id)],
      ["Job Status", escapeHtml(videoDraftJobStatusLabels[manifest.job_status] || manifest.job_status)],
      ["Render Mode", escapeHtml(videoDraftRenderModeLabels[manifest.render_mode] || manifest.render_mode)],
      ["Manifest", escapeHtml(manifest.id)],
      ["Manifest Status", escapeHtml(renderManifestStatusLabels[manifest.manifest_status] || manifest.manifest_status)],
      ["Manifest Mode", escapeHtml(renderManifestModeLabels[manifest.manifest_mode] || manifest.manifest_mode)],
      ["Latest Preflight", latestPreflight ? `${escapeHtml(renderPreflightResultLabels[latestPreflight.preflight_result] || latestPreflight.preflight_result)} (${escapeHtml(latestPreflight.id)})` : "-"]
    ]
  );

  const content = `
    ${renderMessage(url)}
    <div class="notice">Controlled smoke render ini manual-only dan local-only. Output hanya boleh ke storage/draft-videos/smoke, tidak membuat approved video, tidak unggah, tidak ada penjadwalan, tidak ada penerbitan, tidak ada AI eksternal, dan tidak ada worker daemon.</div>
    ${summary}
    ${renderRenderAttemptEligibility("Single-Shot Eligibility", eligibility)}
    ${renderRenderAttemptEligibility("Multi-Shot Eligibility", multiShotEligibility)}
    <section>
      <h2>Run Manual Smoke</h2>
      <p class="hint">Aksi ini membaca source dari storage footage dan menulis maksimal satu file MP4 smoke draft jika semua guard lolos. Source footage tidak diubah.</p>
      <form method="post" action="/content-items/${escapeHtml(item.id)}/video-draft/${escapeHtml(jobId)}/manifest/${escapeHtml(manifest.id)}/render-attempts/run-smoke" style="margin-top: 14px;">
        <button type="submit">Run Controlled Smoke Render</button>
      </form>
      <form method="post" action="/content-items/${escapeHtml(item.id)}/video-draft/${escapeHtml(jobId)}/manifest/${escapeHtml(manifest.id)}/render-attempts/run-multishot-smoke" style="margin-top: 10px;">
        <button type="submit">Run Multi-Shot Smoke Render</button>
      </form>
    </section>
    ${renderRenderAttemptList(attempts)}
    <div class="button-row" style="margin-top: 14px;">
      <a class="button button-secondary" href="/content-items/${escapeHtml(item.id)}/video-draft/${escapeHtml(jobId)}/manifest/${escapeHtml(manifest.id)}/preflight">Render Preflight</a>
      <a class="button button-secondary" href="/content-items/${escapeHtml(item.id)}">Detail Konten</a>
    </div>
  `;

  return renderLayout(
    "/content-items",
    `Controlled Smoke Render - ${item.content_code}`,
    "Controlled Smoke Render",
    "Manual local-only prototype untuk membuat satu draft smoke MP4 dari manifest yang ready.",
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
      <a class="button" href="/content-items/${escapeHtml(item.id)}/video-draft">Video Draft Job</a>
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
