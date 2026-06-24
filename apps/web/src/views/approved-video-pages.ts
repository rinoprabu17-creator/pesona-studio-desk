import {
  approvedVideoHandoffStatuses
} from "../validation/approved-video-handoff-validation.ts";
import {
  getApprovedVideoHandoffContext,
  listApprovedVideoLibrary
} from "../approved-video-handoff-service.ts";
import type { ApprovedVideoLibraryRow } from "../approved-video-handoff-service.ts";
import { escapeHtml, renderLayout, renderMessage, renderReadOnlyTable } from "./layout.ts";

export const approvedVideoHandoffStatusLabels: Record<string, string> = {
  pending_handoff: "Menunggu Handoff",
  ready_for_manual_publish: "Ready for Manual Publish",
  hold: "Hold",
  needs_revision: "Perlu Revisi",
  archived: "Diarsipkan"
};

function formatDate(value: unknown): string {
  return String(value || "").slice(0, 10);
}

function handoffStatusOptions(selected: string | null): string {
  return [
    `<option value="" ${!selected ? "selected" : ""}>Semua status</option>`,
    ...approvedVideoHandoffStatuses.map((status) => `<option value="${escapeHtml(status)}" ${selected === status ? "selected" : ""}>${escapeHtml(approvedVideoHandoffStatusLabels[status] || status)}</option>`)
  ].join("");
}

function renderApprovedVideoList(items: ApprovedVideoLibraryRow[]): string {
  return renderReadOnlyTable(
    ["Konten", "Campaign", "Approved Output", "Size", "Promotion", "Handoff", "Selesai", "Aksi"],
    items.map((item) => [
      `<strong>${escapeHtml(item.content_code)}</strong><br>${escapeHtml(item.content_title)}<br><span class="muted">${escapeHtml(formatDate(item.planned_content_date))}</span>`,
      `${escapeHtml(item.campaign_code)}<br>${escapeHtml(item.campaign_name)}`,
      escapeHtml(item.approved_output_relative_path || "-"),
      item.approved_size_bytes === null ? "-" : `${escapeHtml(item.approved_size_bytes)} bytes`,
      escapeHtml(item.promotion_status),
      escapeHtml(approvedVideoHandoffStatusLabels[item.handoff_status || "pending_handoff"] || item.handoff_status || "pending_handoff"),
      escapeHtml(item.promotion_completed_at || "-"),
      `<a href="/approved-videos/${escapeHtml(item.promotion_id)}">Detail</a>`
    ])
  );
}

export async function renderApprovedVideoLibraryPage(url: URL): Promise<string> {
  const filters = {
    handoff_status: url.searchParams.get("handoff_status"),
    q: url.searchParams.get("q"),
    campaign_id: url.searchParams.get("campaign_id"),
    content_item_id: url.searchParams.get("content_item_id")
  };
  const items = await listApprovedVideoLibrary(filters);
  const filterForm = `<section>
    <form method="get" action="/approved-videos">
      <div class="form-grid">
        <label>Status Handoff
          <select name="handoff_status">${handoffStatusOptions(filters.handoff_status)}</select>
        </label>
        <label>Cari Kode/Judul Konten
          <input type="text" name="q" value="${escapeHtml(filters.q || "")}" placeholder="kode atau judul" />
        </label>
      </div>
      <div class="button-row" style="margin-top: 14px;">
        <button type="submit">Filter</button>
        <a class="button button-secondary" href="/approved-videos">Reset</a>
      </div>
    </form>
  </section>`;
  const content = `
    ${renderMessage(url)}
    <div class="notice">Approved Video Library ini DB-only handoff board. Tidak upload, tidak scheduler, tidak publisher, tidak OpenAI, tidak worker daemon, dan tidak mutasi file video.</div>
    ${filterForm}
    <section>
      <h2>Approved Videos</h2>
      ${items.length ? renderApprovedVideoList(items) : `<p class="hint">Belum ada succeeded approved promotion untuk filter ini.</p>`}
    </section>
  `;

  return renderLayout(
    "/approved-videos",
    "Approved Video Library",
    "Approved Video Library",
    "Board DB-only untuk handoff video approved ke proses manual publish.",
    content
  );
}

export async function renderApprovedVideoDetailPage(promotionId: string, url: URL): Promise<string> {
  const { libraryItem, handoff, eligibility } = await getApprovedVideoHandoffContext(promotionId);
  const summary = renderReadOnlyTable(
    ["Field", "Nilai"],
    [
      ["Content Code", `<strong>${escapeHtml(libraryItem.content_code)}</strong>`],
      ["Judul", escapeHtml(libraryItem.content_title)],
      ["Campaign", `${escapeHtml(libraryItem.campaign_code)} - ${escapeHtml(libraryItem.campaign_name)}`],
      ["Video Draft Job", `${escapeHtml(libraryItem.video_draft_job_id)} (${escapeHtml(libraryItem.job_status)})`],
      ["Render Manifest", `${escapeHtml(libraryItem.render_manifest_id)} (${escapeHtml(libraryItem.manifest_status)})`],
      ["Render Attempt", `${escapeHtml(libraryItem.render_attempt_id)} (${escapeHtml(libraryItem.render_attempt_status)})`],
      ["Review", `${escapeHtml(libraryItem.render_attempt_review_id)} (${escapeHtml(libraryItem.review_status)})`],
      ["Promotion", `${escapeHtml(libraryItem.promotion_id)} (${escapeHtml(libraryItem.promotion_status)})`],
      ["Approved Output", escapeHtml(libraryItem.approved_output_relative_path || "-")],
      ["Promotion Size", libraryItem.approved_size_bytes === null ? "-" : `${escapeHtml(libraryItem.approved_size_bytes)} bytes`],
      ["File Exists", eligibility.approved_exists ? `<span class="badge badge-ok">Ada</span>` : `<span class="badge">Tidak Ada</span>`],
      ["File Size", eligibility.approved_size_bytes === null ? "-" : `${escapeHtml(eligibility.approved_size_bytes)} bytes`],
      ["SHA Match", eligibility.sha256_matches === null ? "-" : eligibility.sha256_matches ? `<span class="badge badge-ok">Match</span>` : `<span class="badge">Mismatch</span>`],
      ["Current Handoff", escapeHtml(approvedVideoHandoffStatusLabels[handoff?.handoff_status || "pending_handoff"] || handoff?.handoff_status || "pending_handoff")],
      ["Handoff Row", escapeHtml(handoff?.id || "-")],
      ["Handoff By", escapeHtml(handoff?.handoff_by_name || "-")],
      ["Handoff At", escapeHtml(handoff?.handoff_at || "-")],
      ["Handoff Note", escapeHtml(handoff?.handoff_note || "-")],
      ["Eligibility", eligibility.ok ? `<span class="badge badge-ok">Eligible</span>` : `<span class="badge">Blocked</span>`],
      ["Blocking Reasons", eligibility.blocking_reasons.length ? escapeHtml(eligibility.blocking_reasons.join(" ")) : "-"]
    ]
  );
  const form = (action: string, label: string) => `<form method="post" action="/approved-videos/${escapeHtml(libraryItem.promotion_id)}/handoff/${escapeHtml(action)}" style="margin-top: 12px;">
    <label>Nama Admin</label>
    <input type="text" name="handoff_by_name" maxlength="120" placeholder="Nama admin" />
    <label>Catatan</label>
    <textarea name="handoff_note" maxlength="2000" rows="3"></textarea>
    <button type="submit">${escapeHtml(label)}</button>
  </form>`;
  const actions = `<section>
    <h2>Manual Handoff</h2>
    ${eligibility.ok
      ? `${form("ready", "Mark Ready for Manual Publish")}
         ${form("hold", "Hold")}
         ${form("needs-revision", "Needs Revision")}
         ${form("archive", "Archive")}`
      : `<p class="hint">Handoff belum eligible: ${escapeHtml(eligibility.blocking_reasons.join(" "))}</p>`}
  </section>`;
  const content = `
    ${renderMessage(url)}
    <div class="notice">Handoff ini DB-only. Tidak upload, tidak scheduler, tidak publisher, tidak OpenAI, tidak worker daemon, dan tidak mutasi file video.</div>
    ${summary}
    ${actions}
    <div class="button-row" style="margin-top: 14px;">
      <a class="button button-secondary" href="/approved-videos">Approved Video Library</a>
    </div>
  `;

  return renderLayout(
    "/approved-videos",
    `Approved Video - ${libraryItem.content_code}`,
    "Approved Video Detail",
    "Detail handoff DB-only untuk promoted approved video.",
    content
  );
}
