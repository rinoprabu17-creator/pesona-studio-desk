import {
  manualPublicationPackageChannels,
  manualPublicationPackageChannelStatuses,
  manualPublicationPackageFormats,
  manualPublicationPackageStatuses
} from "../validation/manual-publication-package-validation.ts";
import {
  getManualPublicationPackageContext,
  getManualPublicationPackageCreateContextForPromotion,
  listManualPublicationPackages
} from "../manual-publication-package-service.ts";
import { getManualPublicationPackageCompletionSummary } from "../manual-publish-checklist-service.ts";
import type {
  ManualPublicationPackageChannelRow,
  ManualPublicationPackageListRow
} from "../manual-publication-package-service.ts";
import { escapeHtml, renderEmptyState, renderLayout, renderMessage, renderReadOnlyTable } from "./layout.ts";

const packageStatusLabels: Record<string, string> = {
  draft_package: "Draft Package",
  ready_manual_publish: "Ready Manual Publish",
  published_manually: "Published Manually",
  hold: "Hold",
  needs_revision: "Perlu Revisi",
  archived: "Diarsipkan"
};

const channelStatusLabels: Record<string, string> = {
  draft_channel: "Draft Channel",
  ready_manual_publish: "Ready Manual Publish",
  published_manually: "Published Manually",
  skipped: "Skipped",
  hold: "Hold",
  archived: "Diarsipkan"
};

const channelLabels: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube"
};

function optionList(values: readonly string[], selected: string | null, labels: Record<string, string>, includeAll = false): string {
  return [
    includeAll ? `<option value="" ${!selected ? "selected" : ""}>Semua</option>` : "",
    ...values.map((value) => `<option value="${escapeHtml(value)}" ${selected === value ? "selected" : ""}>${escapeHtml(labels[value] || value)}</option>`)
  ].join("");
}

function renderChannels(channels: ManualPublicationPackageChannelRow[]): string {
  return channels.map((channel) => `${escapeHtml(channelLabels[channel.channel] || channel.channel)}: ${escapeHtml(channelStatusLabels[channel.channel_status] || channel.channel_status)}`).join("<br>");
}

function renderPackageList(items: ManualPublicationPackageListRow[]): string {
  return renderReadOnlyTable(
    ["Konten", "Approved Output", "Status", "Channels", "Dibuat", "Aksi"],
    items.map((item) => [
      `<strong>${escapeHtml(item.content_code)}</strong><br>${escapeHtml(item.content_title)}<br>${escapeHtml(item.campaign_code)}`,
      escapeHtml(item.approved_output_relative_path_snapshot),
      escapeHtml(packageStatusLabels[item.package_status] || item.package_status),
      renderChannels(item.channels),
      escapeHtml(item.created_at || "-"),
      `<a href="/publication-packages/${escapeHtml(item.id)}">Detail</a>`
    ])
  );
}

export async function renderManualPublicationPackageListPage(url: URL): Promise<string> {
  const filters = {
    package_status: url.searchParams.get("package_status"),
    channel: url.searchParams.get("channel"),
    q: url.searchParams.get("q")
  };
  const items = await listManualPublicationPackages(filters);
  const content = `
    ${renderMessage(url)}
    <div class="notice">Manual publication package ini DB-only. Tidak uploadd, tidak scheduler, tidak publisher, tidak OpenAI, tidak social API, tidak mutasi file video, tidak membuat content_publications, dan tidak memutasi content_publications.</div>
    <section>
      <form method="get" action="/publication-packages">
        <div class="form-grid">
          <label>Status Package
            <select name="package_status">${optionList(manualPublicationPackageStatuses, filters.package_status, packageStatusLabels, true)}</select>
          </label>
          <label>Channel
            <select name="channel">${optionList(manualPublicationPackageChannels, filters.channel, channelLabels, true)}</select>
          </label>
          <label>Cari Konten
            <input type="text" name="q" value="${escapeHtml(filters.q || "")}" />
          </label>
        </div>
        <div class="button-row" style="margin-top: 14px;">
          <button type="submit">Filter</button>
          <a class="button button-secondary" href="/publication-packages">Reset</a>
        </div>
      </form>
    </section>
    <section>
      <h2>Publication Packages</h2>
      ${items.length ? renderPackageList(items) : renderEmptyState(
        "Belum ada publication package",
        "Package akan tersedia setelah approved video ditandai ready for manual publish.",
        [
          { href: "/approved-videos", label: "Approved Videos" },
          { href: "/manual-publish-report", label: "Manual Publish Report", secondary: true }
        ]
      )}
    </section>
  `;

  return renderLayout(
    "/publication-packages",
    "Publication Packages",
    "Publication Packages",
    "DB-only package untuk proses posting manual.",
    content
  );
}

function channelCheckboxes(): string {
  return manualPublicationPackageChannels.map((channel) => `<label>
    <input type="checkbox" name="channel_${escapeHtml(channel)}" value="1" ${channel === "instagram" ? "checked" : ""} />
    ${escapeHtml(channelLabels[channel])}
    <select name="format_${escapeHtml(channel)}">
      ${optionList(manualPublicationPackageFormats, "standard_video", {}, false)}
    </select>
  </label>`).join("");
}

export async function renderManualPublicationPackageCreatePage(promotionId: string, url: URL): Promise<string> {
  const context = await getManualPublicationPackageCreateContextForPromotion(promotionId);
  const summary = renderReadOnlyTable(
    ["Field", "Nilai"],
    [
      ["Content", `${escapeHtml(context.content.content_code)} - ${escapeHtml(context.content.content_title)}`],
      ["Campaign", `${escapeHtml(context.content.campaign_code)} - ${escapeHtml(context.content.campaign_name)}`],
      ["Handoff", `${escapeHtml(context.handoff.id)} (${escapeHtml(context.handoff.handoff_status)})`],
      ["Promotion", `${escapeHtml(context.promotion.id)} (${escapeHtml(context.promotion.promotion_status)})`],
      ["Approved Output", escapeHtml(context.handoff.approved_output_relative_path_snapshot)],
      ["File Exists", context.eligibility.approved_exists ? `<span class="badge badge-ok">Ada</span>` : `<span class="badge">Tidak Ada</span>`],
      ["File Size", context.eligibility.approved_size_bytes === null ? "-" : `${escapeHtml(context.eligibility.approved_size_bytes)} bytes`],
      ["SHA Match", context.eligibility.sha256_matches === null ? "-" : context.eligibility.sha256_matches ? `<span class="badge badge-ok">Match</span>` : `<span class="badge">Mismatch</span>`],
      ["Existing Package", context.existingPackage ? escapeHtml(context.existingPackage.id) : "-"],
      ["Eligibility", context.eligibility.ok ? `<span class="badge badge-ok">Eligible</span>` : `<span class="badge">Blocked</span>`],
      ["Blocking Reasons", context.eligibility.blocking_reasons.length ? escapeHtml(context.eligibility.blocking_reasons.join(" ")) : "-"]
    ]
  );
  const form = context.eligibility.ok ? `<form method="post" action="/approved-videos/${escapeHtml(promotionId)}/publication-package/create">
    <div class="form-grid">
      <label>Judul Package<input type="text" name="package_title" maxlength="200" /></label>
      <label>Nama Pembuat<input type="text" name="created_by_name" maxlength="120" /></label>
    </div>
    <label>Caption<textarea name="caption_text" maxlength="2200" rows="5"></textarea></label>
    <label>Hashtag<textarea name="hashtags_text" maxlength="1000" rows="3"></textarea></label>
    <label>CTA<textarea name="call_to_action" maxlength="500" rows="2"></textarea></label>
    <label>Catatan Manual<textarea name="manual_publish_note" maxlength="2000" rows="3"></textarea></label>
    <section>
      <h2>Channel</h2>
      <div class="form-grid">${channelCheckboxes()}</div>
    </section>
    <button type="submit">Create Manual Package</button>
  </form>` : `<p class="hint">Package belum bisa dibuat: ${escapeHtml(context.eligibility.blocking_reasons.join(" "))}</p>`;
  const content = `
    ${renderMessage(url)}
    <div class="notice">DB-only package. Tidak uploadd, tidak scheduler, tidak publisher, tidak OpenAI, tidak social API, tidak mutasi file video, tidak membuat content_publications, dan tidak memutasi content_publications.</div>
    ${summary}
    ${form}
  `;
  return renderLayout(
    "/publication-packages",
    "Create Publication Package",
    "Create Publication Package",
    "Buat package posting manual dari handoff approved video.",
    content
  );
}

function statusForms(packageId: string): string {
  const actions = [
    ["ready", "Ready Manual Publish"],
    ["hold", "Hold"],
    ["needs-revision", "Needs Revision"],
    ["published-manually", "Published Manually"],
    ["archive", "Archive"]
  ];
  return actions.map(([action, label]) => `<form class="inline-form" method="post" action="/publication-packages/${escapeHtml(packageId)}/status/${escapeHtml(action)}">
    <button type="submit">${escapeHtml(label)}</button>
  </form>`).join("");
}

function channelUpdateForms(packageId: string, channels: ManualPublicationPackageChannelRow[]): string {
  return channels.map((channel) => `<form method="post" action="/publication-packages/${escapeHtml(packageId)}/channels/${escapeHtml(channel.channel)}/update">
    <h2>${escapeHtml(channelLabels[channel.channel] || channel.channel)}</h2>
    <div class="form-grid">
      <label>Status
        <select name="channel_status">${optionList(manualPublicationPackageChannelStatuses, channel.channel_status, channelStatusLabels)}</select>
      </label>
      <label>Format
        <select name="publication_format">${optionList(manualPublicationPackageFormats, channel.publication_format, {})}</select>
      </label>
      <label>Planned Publish<input type="datetime-local" name="planned_publish_at" /></label>
      <label>Manual URL<input type="url" name="manual_publish_url" value="${escapeHtml(channel.manual_publish_url || "")}" /></label>
    </div>
    <label>Catatan Channel<textarea name="manual_publish_note" maxlength="2000" rows="2">${escapeHtml(channel.manual_publish_note || "")}</textarea></label>
    <button type="submit">Update ${escapeHtml(channelLabels[channel.channel] || channel.channel)}</button>
  </form>`).join("");
}

export async function renderManualPublicationPackageDetailPage(packageId: string, url: URL): Promise<string> {
  const context = await getManualPublicationPackageContext(packageId);
  const completion = await getManualPublicationPackageCompletionSummary(packageId);
  const pkg = context.package;
  const summary = renderReadOnlyTable(
    ["Field", "Nilai"],
    [
      ["Content", `${escapeHtml(context.content.content_code)} - ${escapeHtml(context.content.content_title)}`],
      ["Campaign", `${escapeHtml(context.content.campaign_code)} - ${escapeHtml(context.content.campaign_name)}`],
      ["Package", `${escapeHtml(pkg.id)} (${escapeHtml(packageStatusLabels[pkg.package_status] || pkg.package_status)})`],
      ["Handoff", escapeHtml(pkg.handoff_id)],
      ["Promotion", escapeHtml(pkg.promotion_id)],
      ["Approved Output", escapeHtml(pkg.approved_output_relative_path_snapshot)],
      ["Size", pkg.approved_size_bytes_snapshot === null ? "-" : `${escapeHtml(pkg.approved_size_bytes_snapshot)} bytes`],
      ["SHA", escapeHtml(pkg.approved_sha256_snapshot || "-")],
      ["Ready At", escapeHtml(pkg.ready_at || "-")],
      ["Published Manually At", escapeHtml(pkg.published_manually_at || "-")]
    ]
  );
  const updateForm = `<form method="post" action="/publication-packages/${escapeHtml(pkg.id)}/update">
    <div class="form-grid">
      <label>Judul Package<input type="text" name="package_title" maxlength="200" value="${escapeHtml(pkg.package_title || "")}" /></label>
      <label>Nama Pembuat<input type="text" name="created_by_name" maxlength="120" value="${escapeHtml(pkg.created_by_name || "")}" /></label>
    </div>
    <label>Caption<textarea name="caption_text" maxlength="2200" rows="5">${escapeHtml(pkg.caption_text || "")}</textarea></label>
    <label>Hashtag<textarea name="hashtags_text" maxlength="1000" rows="3">${escapeHtml(pkg.hashtags_text || "")}</textarea></label>
    <label>CTA<textarea name="call_to_action" maxlength="500" rows="2">${escapeHtml(pkg.call_to_action || "")}</textarea></label>
    <label>Catatan Manual<textarea name="manual_publish_note" maxlength="2000" rows="3">${escapeHtml(pkg.manual_publish_note || "")}</textarea></label>
    <button type="submit">Update Package</button>
  </form>`;
  const channels = renderReadOnlyTable(
    ["Channel", "Status", "Format", "Planned", "Manual URL", "Catatan"],
    context.channels.map((channel) => [
      escapeHtml(channelLabels[channel.channel] || channel.channel),
      escapeHtml(channelStatusLabels[channel.channel_status] || channel.channel_status),
      escapeHtml(channel.publication_format),
      escapeHtml(channel.planned_publish_at || "-"),
      escapeHtml(channel.manual_publish_url || "-"),
      escapeHtml(channel.manual_publish_note || "-")
    ])
  );
  const content = `
    ${renderMessage(url)}
    <div class="notice">published_manually hanya catatan manual. Tidak ada API call. Tidak uploadd, tidak scheduler, tidak publisher, tidak OpenAI, tidak social API, tidak mutasi file video, tidak membuat content_publications, dan tidak memutasi content_publications.</div>
    ${summary}
    <section>
      <h2>Manual Publish Checklist</h2>
      <p class="hint">Checklist ${escapeHtml(completion.checklist_done)} / ${escapeHtml(completion.checklist_total)} done. Evidence ${escapeHtml(completion.evidence_count)}. Manual URL channels: ${completion.channels_with_manual_url.length ? escapeHtml(completion.channels_with_manual_url.join(", ")) : "-"}.</p>
      <div class="button-row">
        <a class="button" href="/publication-packages/${escapeHtml(pkg.id)}/checklist">Open Checklist & Evidence</a>
        <a class="button button-secondary" href="/manual-publish-report/packages/${escapeHtml(pkg.id)}">Open Report Detail</a>
        <a class="button button-secondary" href="/publication-packages/${escapeHtml(pkg.id)}/closeout">Open Closeout</a>
      </div>
    </section>
    <section><h2>Status Package</h2><div class="button-row">${statusForms(pkg.id)}</div></section>
    <section><h2>Manual Copy</h2>${updateForm}</section>
    <section><h2>Channels</h2>${channels}</section>
    <section>${channelUpdateForms(pkg.id, context.channels)}</section>
  `;
  return renderLayout(
    "/publication-packages",
    `Publication Package - ${context.content.content_code}`,
    "Publication Package Detail",
    "Detail package posting manual DB-only.",
    content
  );
}
