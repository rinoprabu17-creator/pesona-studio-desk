import { getOperationalReadinessDashboard } from "../operational-readiness-service.ts";
import type { OperationalReadinessDashboard } from "../operational-readiness-service.ts";
import { escapeHtml, renderEmptyState, renderLayout, renderMessage, renderReadOnlyTable } from "./layout.ts";

function labelFromKey(key: string): string {
  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statGrid(stats: Record<string, number>): string {
  const items = Object.entries(stats)
    .map(
      ([key, value]) => `
        <div class="stat">
          <span>${escapeHtml(labelFromKey(key))}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>`
    )
    .join("");
  return `<div class="stat-grid">${items}</div>`;
}

function renderSafetyNotice(notices: string[]): string {
  return `
    <section>
      <h2>Safety Notice</h2>
      <div class="notice warning">
        ${notices.map((notice) => `<p>${escapeHtml(notice)}</p>`).join("")}
      </div>
    </section>
  `;
}

function renderSummary(dashboard: OperationalReadinessDashboard): string {
  return `
    <section>
      <h2>System Readiness Summary</h2>
      ${statGrid(dashboard.summary)}
    </section>
  `;
}

function renderPipeline(dashboard: OperationalReadinessDashboard): string {
  return `
    <section>
      <h2>Pipeline Readiness Funnel</h2>
      ${renderReadOnlyTable(
        ["Tahap", "Jumlah"],
        Object.entries(dashboard.pipeline).map(([key, value]) => [escapeHtml(labelFromKey(key)), escapeHtml(value)])
      )}
    </section>
  `;
}

function renderManualPublish(dashboard: OperationalReadinessDashboard): string {
  return `
    <section>
      <h2>Manual Publish Readiness</h2>
      ${renderReadOnlyTable(
        ["Metric", "Jumlah"],
        Object.entries(dashboard.manual_publish).map(([key, value]) => [escapeHtml(labelFromKey(key)), escapeHtml(value)])
      )}
    </section>
  `;
}

function renderWarnings(dashboard: OperationalReadinessDashboard): string {
  const warningsContent = dashboard.warnings.length
    ? renderReadOnlyTable(
        ["Content", "Status Package", "Warning", "Detail"],
        dashboard.warnings.map((warning) => [
          `<a href="/content-items/${encodeURIComponent(warning.content_item_id)}">${escapeHtml(warning.content_code)}</a><br><span class="muted">${escapeHtml(warning.content_title)}</span>`,
          escapeHtml(warning.package_status),
          escapeHtml(warning.warning_label),
          escapeHtml(warning.detail)
        ])
      )
    : renderEmptyState(
        "Tidak ada warning operasional",
        "Pipeline tidak memiliki warning manual publish pada filter dashboard saat ini.",
        [
          { href: "/manual-publish-report", label: "Manual Publish Report" },
          { href: "/publication-packages", label: "Publication Packages", secondary: true }
        ]
      );
  return `
    <section>
      <h2>Health Warnings</h2>
      ${warningsContent}
      <p class="muted">Closeouts total: ${escapeHtml(dashboard.summary.closeouts)}. Content publications existing rows: ${escapeHtml(dashboard.summary.content_publications)} untuk visibility saja.</p>
    </section>
  `;
}

function renderLinks(dashboard: OperationalReadinessDashboard): string {
  return `
    <section>
      <h2>Next Action Links</h2>
      <div class="button-row">
        ${dashboard.links.map((link) => `<a class="button button-secondary" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}
      </div>
    </section>
  `;
}

export async function renderOperationalReadinessPage(url: URL): Promise<string> {
  const dashboard = await getOperationalReadinessDashboard({
    limit: url.searchParams.get("limit")
  });
  const content = [
    renderMessage(url),
    renderSafetyNotice(dashboard.safety_notice),
    renderSummary(dashboard),
    renderPipeline(dashboard),
    renderManualPublish(dashboard),
    renderWarnings(dashboard),
    renderLinks(dashboard)
  ].join("");

  return renderLayout(
    "/operational-readiness",
    "Operational Readiness",
    "Dashboard read-only",
    "Ringkasan kesehatan pipeline Pesona Studio Desk dari konten, footage, draft video, approved video, manual publish, report, sampai closeout.",
    content
  );
}
