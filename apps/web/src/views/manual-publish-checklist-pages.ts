import {
  manualPublishChecklistStatuses,
  manualPublishEvidenceTypes
} from "../validation/manual-publish-checklist-validation.ts";
import {
  getManualPublishChecklistContext
} from "../manual-publish-checklist-service.ts";
import { getManualPublishEvidenceFormState, isBlankEvidenceLogAnomaly } from "../manual-publish-evidence-guards.ts";
import type {
  ManualPublishChecklistItemRow,
  ManualPublishEvidenceLogRow,
  ManualPublishPackageChannelContext
} from "../manual-publish-checklist-service.ts";
import { escapeHtml, renderLayout, renderMessage, renderReadOnlyTable } from "./layout.ts";

const channelLabels: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube"
};

function optionList(values: readonly string[], selected: string | null): string {
  return values.map((value) => `<option value="${escapeHtml(value)}" ${selected === value ? "selected" : ""}>${escapeHtml(value)}</option>`).join("");
}

function checklistTable(packageId: string, channel: ManualPublishPackageChannelContext, items: ManualPublishChecklistItemRow[]): string {
  return `<section>
    <h2>${escapeHtml(channelLabels[channel.channel] || channel.channel)}</h2>
    ${renderReadOnlyTable(
      ["Checklist", "Status", "Done", "Catatan", "Aksi"],
      items.map((item) => [
        escapeHtml(item.checklist_label),
        escapeHtml(item.checklist_status),
        item.is_done ? "Ya" : "Tidak",
        escapeHtml(item.checklist_note || "-"),
        `<form method="post" action="/publication-packages/${escapeHtml(packageId)}/checklist/${escapeHtml(item.id)}/update">
          <div class="form-grid">
            <label>Status
              <select name="checklist_status">${optionList(manualPublishChecklistStatuses, item.checklist_status)}</select>
            </label>
            <label>Nama Checker<input type="text" name="checked_by_name" maxlength="120" value="${escapeHtml(item.checked_by_name || "")}" /></label>
          </div>
          <label>Catatan<textarea name="checklist_note" maxlength="2000" rows="2">${escapeHtml(item.checklist_note || "")}</textarea></label>
          <button type="submit">Update Checklist</button>
        </form>`
      ])
    )}
  </section>`;
}

function evidenceTable(logs: ManualPublishEvidenceLogRow[]): string {
  return renderReadOnlyTable(
    ["Channel", "Type", "Value", "Note", "Recorded By", "Recorded At", "Warning"],
    logs.map((log) => [
      escapeHtml(channelLabels[log.channel] || log.channel),
      escapeHtml(log.evidence_type),
      escapeHtml(log.evidence_value || "-"),
      escapeHtml(log.evidence_note || "-"),
      escapeHtml(log.recorded_by_name || "-"),
      escapeHtml(log.recorded_at || "-"),
      isBlankEvidenceLogAnomaly(log)
        ? `<span class="badge badge-warning">Blank evidence log anomaly - DB-only record, not valid publish proof</span><br><span class="hint">This row remains visible as historical DB data and is not valid publish proof.</span>`
        : "-"
    ])
  );
}

function evidenceForms(packageId: string, channels: ManualPublishPackageChannelContext[]): string {
  const initialState = getManualPublishEvidenceFormState({
    evidence_type: "",
    recorded_by_name: "",
    evidence_value: "",
    evidence_note: ""
  });
  return channels.map((channel) => `<form method="post" data-evidence-form="true" action="/publication-packages/${escapeHtml(packageId)}/evidence/${escapeHtml(channel.channel)}/add">
    <h2>Add Evidence - ${escapeHtml(channelLabels[channel.channel] || channel.channel)}</h2>
    <div class="form-grid">
      <label>Evidence Type
        <select name="evidence_type" required aria-describedby="evidence-helper-${escapeHtml(channel.channel)}">
          <option value="">Pilih tipe evidence</option>
          ${optionList(manualPublishEvidenceTypes, null)}
        </select>
      </label>
      <label>Recorded By<input type="text" name="recorded_by_name" maxlength="120" required aria-describedby="evidence-helper-${escapeHtml(channel.channel)}" /></label>
    </div>
    <label>Evidence Value<textarea name="evidence_value" maxlength="2000" rows="2"></textarea></label>
    <label>Evidence Note<textarea name="evidence_note" maxlength="2000" rows="2"></textarea></label>
    <p class="hint" id="evidence-helper-${escapeHtml(channel.channel)}">Evidence Value or Evidence Note is required. Blank evidence is not valid publish proof.</p>
    <p class="hint" data-evidence-form-message="true">${escapeHtml(initialState.message || "")}</p>
    <button type="submit" data-evidence-submit="true" disabled>Add Evidence</button>
  </form>`).join("");
}

function evidenceFormScript(): string {
  return `<script>
    (() => {
      const blank = (value) => !String(value || "").trim();
      const updateEvidenceState = (form) => {
        const evidenceType = form.elements.namedItem("evidence_type")?.value || "";
        const recordedByName = form.elements.namedItem("recorded_by_name")?.value || "";
        const evidenceValue = form.elements.namedItem("evidence_value")?.value || "";
        const evidenceNote = form.elements.namedItem("evidence_note")?.value || "";
        const missingEvidenceType = blank(evidenceType);
        const missingRecordedByName = blank(recordedByName);
        const missingEvidenceBody = blank(evidenceValue) && blank(evidenceNote);
        const canSubmit = !missingEvidenceType && !missingRecordedByName && !missingEvidenceBody;
        const button = form.querySelector("[data-evidence-submit]");
        const message = form.querySelector("[data-evidence-form-message]");
        if (button) button.disabled = !canSubmit;
        if (message) {
          const parts = [
            missingEvidenceType ? "Evidence Type wajib diisi" : "",
            missingRecordedByName ? "Recorded By wajib diisi" : "",
            missingEvidenceBody ? "Evidence Value atau Evidence Note wajib diisi" : ""
          ].filter(Boolean);
          message.textContent = parts.length ? parts.join(". ") + ". Blank evidence is not valid publish proof." : "Form siap dikirim. Server-side validation tetap menjadi otoritas final.";
        }
      };
      document.querySelectorAll("[data-evidence-form]").forEach((form) => {
        form.addEventListener("input", () => updateEvidenceState(form));
        form.addEventListener("change", () => updateEvidenceState(form));
        updateEvidenceState(form);
      });
    })();
  </script>`;
}

export async function renderManualPublishChecklistPage(packageId: string, url: URL): Promise<string> {
  const context = await getManualPublishChecklistContext(packageId);
  const summary = renderReadOnlyTable(
    ["Field", "Nilai"],
    [
      ["Package", `${escapeHtml(context.package.id)} (${escapeHtml(context.package.package_status)})`],
      ["Content", `${escapeHtml(context.package.content_code)} - ${escapeHtml(context.package.content_title)}`],
      ["Campaign", `${escapeHtml(context.package.campaign_code)} - ${escapeHtml(context.package.campaign_name)}`],
      ["Approved Output", escapeHtml(context.package.approved_output_relative_path_snapshot)],
      ["Checklist", `${escapeHtml(context.summary.checklist_done)} / ${escapeHtml(context.summary.checklist_total)} done`],
      ["Evidence Count", escapeHtml(context.summary.evidence_count)],
      ["Manual URL Channels", context.summary.channels_with_manual_url.length ? escapeHtml(context.summary.channels_with_manual_url.join(", ")) : "-"]
    ]
  );
  const checklistSections = context.channels.map((channel) => checklistTable(
    context.package.id,
    channel,
    context.checklistItems.filter((item) => item.channel === channel.channel)
  )).join("");
  const content = `
    ${renderMessage(url)}
    <div class="notice">Checklist dan evidence ini DB-only. Evidence reference adalah teks saja. Tidak upload, tidak scheduler, tidak publisher, tidak OpenAI, tidak social API, dan tidak mutasi file video.</div>
    ${summary}
    <form method="post" action="/publication-packages/${escapeHtml(context.package.id)}/checklist/initialize">
      <button type="submit">Initialize Default Checklist</button>
    </form>
    ${checklistSections || `<p class="hint">Checklist belum diinisialisasi.</p>`}
    <section><h2>Evidence Logs</h2>${context.evidenceLogs.length ? evidenceTable(context.evidenceLogs) : `<p class="hint">Belum ada evidence log.</p>`}</section>
    <section>${evidenceForms(context.package.id, context.channels)}</section>
    <div class="button-row"><a class="button button-secondary" href="/publication-packages/${escapeHtml(context.package.id)}">Package Detail</a></div>
    ${evidenceFormScript()}
  `;
  return renderLayout(
    "/publication-packages",
    `Checklist - ${context.package.content_code}`,
    "Manual Publish Checklist",
    "Checklist dan evidence log DB-only untuk posting manual.",
    content
  );
}
