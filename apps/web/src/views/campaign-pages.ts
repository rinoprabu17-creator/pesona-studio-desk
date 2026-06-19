import { campaignStatuses } from "../validation/campaign-validation.ts";
import type { CampaignInput } from "../validation/campaign-validation.ts";
import { listCampaigns } from "../campaign-service.ts";
import type { CampaignRow } from "../campaign-service.ts";
import { listProducts } from "../library-service.ts";
import { escapeHtml, renderBadge, renderLayout, renderMessage, renderReadOnlyTable } from "./layout.ts";

const statusLabels: Record<string, string> = {
  draft: "Draft",
  active: "Aktif",
  paused: "Dijeda",
  completed: "Selesai",
  archived: "Diarsipkan"
};

function formatDate(value: unknown): string {
  return String(value || "").slice(0, 10);
}

function productLabel(campaign: CampaignRow): string {
  return campaign.primary_product_name || "Campuran / Semua Produk";
}

function campaignToInput(campaign: CampaignRow): CampaignInput {
  return {
    code: campaign.code,
    name: campaign.name,
    start_date: formatDate(campaign.start_date),
    end_date: formatDate(campaign.end_date),
    target_audience: campaign.target_audience,
    primary_product_id: campaign.primary_product_id || "",
    status: campaign.status,
    notes: campaign.notes || ""
  };
}

export async function renderCampaignListPage(url: URL): Promise<string> {
  const campaigns = await listCampaigns();
  const table = renderReadOnlyTable(
    ["Kode", "Nama", "Periode", "Target Audiens", "Produk Utama", "Status", "Aksi"],
    campaigns.map((campaign) => [
      `<strong>${escapeHtml(campaign.code)}</strong>`,
      escapeHtml(campaign.name),
      `${escapeHtml(formatDate(campaign.start_date))} s/d ${escapeHtml(formatDate(campaign.end_date))}`,
      escapeHtml(campaign.target_audience),
      escapeHtml(productLabel(campaign)),
      renderBadge(campaign.status === "active") + ` <span class="muted">${escapeHtml(statusLabels[campaign.status] || campaign.status)}</span>`,
      `<div class="button-row">
        <a class="button button-secondary" href="/campaigns/${escapeHtml(campaign.id)}">Detail</a>
        <a class="button" href="/campaigns/${escapeHtml(campaign.id)}/edit">Edit</a>
      </div>`
    ])
  );

  const actions = `<div class="button-row"><a class="button" href="/campaigns/new">Buat Campaign</a></div>`;
  return renderLayout(
    "/campaigns",
    "Campaign",
    "Phase 1B.1",
    "Kelola data campaign dasar. Content item dan publikasi belum dibuat pada tahap ini.",
    `${renderMessage(url)}${actions}${table}`
  );
}

async function productOptions(selectedProductId: string | null | undefined): Promise<string> {
  const products = (await listProducts()).filter((product: any) => product.active);
  return [
    `<option value="" ${!selectedProductId ? "selected" : ""}>Campuran / Semua Produk</option>`,
    ...products.map(
      (product: any) =>
        `<option value="${escapeHtml(product.id)}" ${product.id === selectedProductId ? "selected" : ""}>${escapeHtml(product.name)}</option>`
    )
  ].join("");
}

function statusOptions(selectedStatus: string | undefined): string {
  const selected = selectedStatus || "draft";
  return campaignStatuses
    .map((status) => `<option value="${status}" ${status === selected ? "selected" : ""}>${escapeHtml(statusLabels[status])}</option>`)
    .join("");
}

export async function renderCampaignFormPage(options: {
  mode: "create" | "edit";
  action: string;
  values?: CampaignInput;
  errorMessage?: string;
}): Promise<string> {
  const values = options.values || { status: "draft" };
  const title = options.mode === "create" ? "Buat Campaign" : "Edit Campaign";
  const buttonLabel = options.mode === "create" ? "Buat Campaign" : "Simpan Campaign";
  const error = options.errorMessage ? `<div class="notice error">${escapeHtml(options.errorMessage)}</div>` : "";

  const form = `
    ${error}
    <form method="post" action="${escapeHtml(options.action)}">
      <div class="form-grid">
        <label>Kode Campaign
          <input name="code" value="${escapeHtml(values.code || "")}" maxlength="80" required placeholder="RAPORT-30D-2026-01">
        </label>
        <label>Nama Campaign
          <input name="name" value="${escapeHtml(values.name || "")}" maxlength="160" required>
        </label>
        <label>Tanggal Mulai
          <input name="start_date" type="date" value="${escapeHtml(values.start_date || "")}" required>
        </label>
        <label>Tanggal Selesai
          <input name="end_date" type="date" value="${escapeHtml(values.end_date || "")}" required>
        </label>
      </div>
      <div class="form-grid" style="margin-top: 14px;">
        <label>Produk Utama
          <select name="primary_product_id">${await productOptions(values.primary_product_id || "")}</select>
        </label>
        <label>Status
          <select name="status">${statusOptions(values.status)}</select>
        </label>
        <label style="grid-column: span 2;">Target Audiens
          <input name="target_audience" value="${escapeHtml(values.target_audience || "")}" maxlength="500" required>
        </label>
      </div>
      <label style="margin-top: 14px;">Catatan
        <input name="notes" value="${escapeHtml(values.notes || "")}" maxlength="3000">
      </label>
      <div class="button-row" style="margin-top: 14px;">
        <button type="submit">${escapeHtml(buttonLabel)}</button>
        <a class="button button-secondary" href="/campaigns">Kembali</a>
      </div>
    </form>
  `;

  return renderLayout(
    "/campaigns",
    title,
    "Campaign Management",
    "Isi data dasar campaign. Content item belum dibuat pada tahap ini.",
    form
  );
}

export function renderCampaignDetailPage(campaign: CampaignRow): string {
  const table = renderReadOnlyTable(
    ["Field", "Nilai"],
    [
      ["Kode", escapeHtml(campaign.code)],
      ["Nama", escapeHtml(campaign.name)],
      ["Tanggal Mulai", escapeHtml(formatDate(campaign.start_date))],
      ["Tanggal Selesai", escapeHtml(formatDate(campaign.end_date))],
      ["Target Audiens", escapeHtml(campaign.target_audience)],
      ["Produk Utama", escapeHtml(productLabel(campaign))],
      ["Status", escapeHtml(statusLabels[campaign.status] || campaign.status)],
      ["Catatan", escapeHtml(campaign.notes || "-")]
    ]
  );

  const actions = `
    <div class="button-row">
      <a class="button" href="/campaigns/${escapeHtml(campaign.id)}/edit">Edit Campaign</a>
      <a class="button button-secondary" href="/campaigns">Kembali</a>
    </div>
    <p class="hint">Konten campaign akan dikelola pada tahap Manual Content Calendar.</p>
  `;

  return renderLayout(
    "/campaigns",
    campaign.name,
    "Detail Campaign",
    "Detail data campaign dasar.",
    `${actions}${table}`
  );
}

export function renderCampaignNotFoundPage(message = "Campaign tidak ditemukan."): string {
  return renderLayout(
    "/campaigns",
    "Campaign Tidak Ditemukan",
    "Error",
    "Campaign tidak dapat ditampilkan.",
    `<div class="notice error">${escapeHtml(message)}</div><div class="button-row"><a class="button button-secondary" href="/campaigns">Kembali</a></div>`
  );
}

export function valuesFromForm(body: Record<string, string>): CampaignInput {
  return {
    code: body.code,
    name: body.name,
    start_date: body.start_date,
    end_date: body.end_date,
    target_audience: body.target_audience,
    primary_product_id: body.primary_product_id || null,
    status: body.status,
    notes: body.notes || null
  };
}

export function valuesFromCampaign(campaign: CampaignRow): CampaignInput {
  return campaignToInput(campaign);
}
