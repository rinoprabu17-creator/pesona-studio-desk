import { query } from "./db.ts";
import { getManualPublishReportSummary } from "./manual-publish-report-service.ts";
import { validateOperationalReadinessFilters } from "./validation/operational-readiness-validation.ts";
import type { OperationalReadinessFilters } from "./validation/operational-readiness-validation.ts";

type CountRow = {
  count: number | string;
};

type WarningRow = {
  package_id: string;
  content_item_id: string;
  content_code: string;
  content_title: string;
  package_status: string;
  report_status: string | null;
  warning_type: string;
  warning_label: string;
  detail: string;
};

export type OperationalReadinessSummary = {
  total_campaigns: number;
  total_content_items: number;
  total_footage_assets: number;
  total_approved_footage: number;
  content_items_with_selected_footage: number;
  content_items_with_script_plan: number;
  video_draft_jobs: number;
  render_manifests: number;
  render_preflight_runs: number;
  render_attempts: number;
  approved_promotions: number;
  handoff_records: number;
  manual_publication_packages: number;
  manual_publication_package_channels: number;
  checklist_items: number;
  evidence_logs: number;
  closeouts: number;
  content_publications: number;
};

export type OperationalReadinessPipeline = {
  content_items_total: number;
  with_footage_selection: number;
  with_script_plan: number;
  with_video_draft_job: number;
  with_render_manifest: number;
  with_succeeded_render_attempt: number;
  with_approved_promotion: number;
  with_ready_handoff: number;
  with_publication_package: number;
  with_checklist_initialized: number;
  with_manual_url_evidence: number;
  with_ready_evidence_complete_report: number;
  with_closeout: number;
};

export type OperationalReadinessManualPublish = {
  packages_total: number;
  packages_no_checklist: number;
  packages_checklist_incomplete: number;
  packages_missing_manual_url: number;
  packages_ready_evidence_complete: number;
  closeouts_total: number;
  blocked_closeout_candidates: number;
};

export type OperationalReadinessWarning = WarningRow;

export type OperationalReadinessDashboard = {
  filters: OperationalReadinessFilters;
  safety_notice: string[];
  summary: OperationalReadinessSummary;
  pipeline: OperationalReadinessPipeline;
  manual_publish: OperationalReadinessManualPublish;
  warnings: OperationalReadinessWarning[];
  links: { label: string; href: string }[];
};

const safetyNotice = [
  "Dashboard ini read-only dari database.",
  "Tidak ada upload, scheduler, publisher, OpenAI, social API, atau mutasi file.",
  "Tidak membuat atau mengubah content_publications.",
  "Tidak membaca, menyalin, memindah, menghapus, atau mengedit file MP4."
];

const links = [
  { label: "Approved Videos", href: "/approved-videos" },
  { label: "Publication Packages", href: "/publication-packages" },
  { label: "Manual Publish Report", href: "/manual-publish-report" },
  { label: "Manual Closeouts", href: "/manual-publish-closeouts" },
  { label: "Content Calendar", href: "/content-calendar" },
  { label: "Footage", href: "/footage-assets" },
  { label: "Content Items", href: "/content-items" }
];

function toNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value || 0);
}

async function count(sql: string): Promise<number> {
  const rows = await query<CountRow>(sql);
  return toNumber(rows[0]?.count);
}

export async function getOperationalReadinessSummary(): Promise<OperationalReadinessSummary> {
  const [
    totalCampaigns,
    totalContentItems,
    totalFootageAssets,
    totalApprovedFootage,
    contentItemsWithSelectedFootage,
    contentItemsWithScriptPlan,
    videoDraftJobs,
    renderManifests,
    renderPreflightRuns,
    renderAttempts,
    approvedPromotions,
    handoffRecords,
    manualPublicationPackages,
    manualPublicationPackageChannels,
    checklistItems,
    evidenceLogs,
    closeouts,
    contentPublications
  ] = await Promise.all([
    count(`SELECT count(*)::int AS count FROM campaigns`),
    count(`SELECT count(*)::int AS count FROM content_items`),
    count(`SELECT count(*)::int AS count FROM footage_assets`),
    count(`SELECT count(*)::int AS count FROM footage_assets WHERE status = 'approved'`),
    count(`SELECT count(DISTINCT content_item_id)::int AS count FROM content_item_footage_selections`),
    count(`SELECT count(DISTINCT content_item_id)::int AS count FROM content_item_script_plans`),
    count(`SELECT count(*)::int AS count FROM video_draft_jobs`),
    count(`SELECT count(*)::int AS count FROM video_render_manifests`),
    count(`SELECT count(*)::int AS count FROM video_render_preflight_runs`),
    count(`SELECT count(*)::int AS count FROM video_render_attempts`),
    count(`SELECT count(*)::int AS count FROM video_render_approved_promotions WHERE promotion_status = 'succeeded'`),
    count(`SELECT count(*)::int AS count FROM video_approved_handoff_records`),
    count(`SELECT count(*)::int AS count FROM manual_publication_packages`),
    count(`SELECT count(*)::int AS count FROM manual_publication_package_channels`),
    count(`SELECT count(*)::int AS count FROM manual_publish_checklist_items`),
    count(`SELECT count(*)::int AS count FROM manual_publish_evidence_logs`),
    count(`SELECT count(*)::int AS count FROM manual_publish_closeouts`),
    count(`SELECT count(*)::int AS count FROM content_publications`)
  ]);

  return {
    total_campaigns: totalCampaigns,
    total_content_items: totalContentItems,
    total_footage_assets: totalFootageAssets,
    total_approved_footage: totalApprovedFootage,
    content_items_with_selected_footage: contentItemsWithSelectedFootage,
    content_items_with_script_plan: contentItemsWithScriptPlan,
    video_draft_jobs: videoDraftJobs,
    render_manifests: renderManifests,
    render_preflight_runs: renderPreflightRuns,
    render_attempts: renderAttempts,
    approved_promotions: approvedPromotions,
    handoff_records: handoffRecords,
    manual_publication_packages: manualPublicationPackages,
    manual_publication_package_channels: manualPublicationPackageChannels,
    checklist_items: checklistItems,
    evidence_logs: evidenceLogs,
    closeouts,
    content_publications: contentPublications
  };
}

export async function getOperationalReadinessPipeline(): Promise<OperationalReadinessPipeline> {
  const rows = await query<Record<keyof OperationalReadinessPipeline, number | string>>(`
    SELECT
      count(item.id)::int AS content_items_total,
      count(item.id) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM content_item_footage_selections selection
          WHERE selection.content_item_id = item.id
        )
      )::int AS with_footage_selection,
      count(item.id) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM content_item_script_plans script_plan
          WHERE script_plan.content_item_id = item.id
        )
      )::int AS with_script_plan,
      count(item.id) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM video_draft_jobs draft_job
          WHERE draft_job.content_item_id = item.id
        )
      )::int AS with_video_draft_job,
      count(item.id) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM video_render_manifests manifest
          WHERE manifest.content_item_id = item.id
        )
      )::int AS with_render_manifest,
      count(item.id) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM video_render_attempts attempt
          WHERE attempt.content_item_id = item.id
            AND attempt.attempt_status = 'succeeded'
        )
      )::int AS with_succeeded_render_attempt,
      count(item.id) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM video_render_approved_promotions promotion
          WHERE promotion.content_item_id = item.id
            AND promotion.promotion_status = 'succeeded'
        )
      )::int AS with_approved_promotion,
      count(item.id) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM video_approved_handoff_records handoff
          WHERE handoff.content_item_id = item.id
            AND handoff.handoff_status = 'ready_for_manual_publish'
        )
      )::int AS with_ready_handoff,
      count(item.id) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM manual_publication_packages package
          WHERE package.content_item_id = item.id
        )
      )::int AS with_publication_package,
      count(item.id) FILTER (
        WHERE EXISTS (
          SELECT 1
          FROM manual_publication_packages package
          JOIN manual_publication_package_channels channel ON channel.package_id = package.id
          WHERE package.content_item_id = item.id
            AND EXISTS (
              SELECT 1 FROM manual_publish_checklist_items checklist
              WHERE checklist.package_channel_id = channel.id
            )
        )
      )::int AS with_checklist_initialized,
      count(item.id) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM manual_publish_evidence_logs evidence
          WHERE evidence.content_item_id = item.id
            AND evidence.evidence_type = 'manual_post_url'
            AND coalesce(evidence.evidence_value, '') <> ''
        )
      )::int AS with_manual_url_evidence,
      count(item.id) FILTER (
        WHERE EXISTS (
          SELECT 1
          FROM manual_publication_packages package
          WHERE package.content_item_id = item.id
            AND EXISTS (
              SELECT 1 FROM manual_publication_package_channels channel
              WHERE channel.package_id = package.id
            )
            AND NOT EXISTS (
              SELECT 1
              FROM manual_publication_package_channels channel
              WHERE channel.package_id = package.id
                AND NOT EXISTS (
                  SELECT 1 FROM manual_publish_checklist_items checklist
                  WHERE checklist.package_channel_id = channel.id
                )
            )
            AND NOT EXISTS (
              SELECT 1
              FROM manual_publication_package_channels channel
              WHERE channel.package_id = package.id
                AND EXISTS (
                  SELECT 1 FROM manual_publish_checklist_items checklist
                  WHERE checklist.package_channel_id = channel.id
                    AND checklist.is_done = false
                )
            )
            AND NOT EXISTS (
              SELECT 1
              FROM manual_publication_package_channels channel
              WHERE channel.package_id = package.id
                AND NOT EXISTS (
                  SELECT 1 FROM manual_publish_evidence_logs evidence
                  WHERE evidence.package_channel_id = channel.id
                    AND evidence.evidence_type = 'manual_post_url'
                    AND coalesce(evidence.evidence_value, '') <> ''
                )
            )
        )
      )::int AS with_ready_evidence_complete_report,
      count(item.id) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM manual_publish_closeouts closeout
          WHERE closeout.content_item_id = item.id
        )
      )::int AS with_closeout
    FROM content_items item
  `);
  const row = rows[0];
  return {
    content_items_total: toNumber(row?.content_items_total),
    with_footage_selection: toNumber(row?.with_footage_selection),
    with_script_plan: toNumber(row?.with_script_plan),
    with_video_draft_job: toNumber(row?.with_video_draft_job),
    with_render_manifest: toNumber(row?.with_render_manifest),
    with_succeeded_render_attempt: toNumber(row?.with_succeeded_render_attempt),
    with_approved_promotion: toNumber(row?.with_approved_promotion),
    with_ready_handoff: toNumber(row?.with_ready_handoff),
    with_publication_package: toNumber(row?.with_publication_package),
    with_checklist_initialized: toNumber(row?.with_checklist_initialized),
    with_manual_url_evidence: toNumber(row?.with_manual_url_evidence),
    with_ready_evidence_complete_report: toNumber(row?.with_ready_evidence_complete_report),
    with_closeout: toNumber(row?.with_closeout)
  };
}

async function getWarnings(limit: number): Promise<OperationalReadinessWarning[]> {
  return query<WarningRow>(
    `
      WITH package_report AS (
        SELECT
          package.id AS package_id,
          package.content_item_id,
          item.content_code,
          item.title AS content_title,
          package.package_status,
          CASE
            WHEN EXISTS (
              SELECT 1 FROM manual_publication_package_channels channel
              WHERE channel.package_id = package.id
                AND NOT EXISTS (
                  SELECT 1 FROM manual_publish_checklist_items checklist
                  WHERE checklist.package_channel_id = channel.id
                )
            ) THEN 'no_checklist'
            WHEN EXISTS (
              SELECT 1 FROM manual_publish_checklist_items checklist
              WHERE checklist.package_id = package.id
                AND checklist.is_done = false
            ) THEN 'checklist_incomplete'
            WHEN EXISTS (
              SELECT 1 FROM manual_publication_package_channels channel
              WHERE channel.package_id = package.id
                AND NOT EXISTS (
                  SELECT 1 FROM manual_publish_evidence_logs evidence
                  WHERE evidence.package_channel_id = channel.id
                    AND evidence.evidence_type = 'manual_post_url'
                    AND coalesce(evidence.evidence_value, '') <> ''
                )
            ) THEN 'missing_manual_url'
            ELSE 'ready_evidence_complete'
          END AS report_status
        FROM manual_publication_packages package
        JOIN content_items item ON item.id = package.content_item_id
      )
      SELECT package_id,
             content_item_id,
             content_code,
             content_title,
             package_status,
             report_status,
             report_status AS warning_type,
             CASE report_status
               WHEN 'no_checklist' THEN 'Package belum punya checklist'
               WHEN 'checklist_incomplete' THEN 'Checklist belum lengkap'
               WHEN 'missing_manual_url' THEN 'Manual URL belum lengkap'
               ELSE 'Ready evidence complete belum closeout'
             END AS warning_label,
             CASE report_status
               WHEN 'ready_evidence_complete' THEN 'Package siap closeout tetapi belum memiliki closeout certificate.'
               ELSE 'Lengkapi langkah manual publish sebelum closeout.'
             END AS detail
      FROM package_report report
      WHERE report_status IN ('no_checklist', 'checklist_incomplete', 'missing_manual_url')
         OR (
           report_status = 'ready_evidence_complete'
           AND NOT EXISTS (
             SELECT 1 FROM manual_publish_closeouts closeout
             WHERE closeout.package_id = report.package_id
           )
         )
      ORDER BY content_code, package_id
      LIMIT $1
    `,
    [limit]
  );
}

export async function getOperationalReadinessDashboard(
  input: Parameters<typeof validateOperationalReadinessFilters>[0] = {}
): Promise<OperationalReadinessDashboard> {
  const filters = validateOperationalReadinessFilters(input);
  const [summary, pipeline, reportSummary, closeouts, warnings] = await Promise.all([
    getOperationalReadinessSummary(),
    getOperationalReadinessPipeline(),
    getManualPublishReportSummary({ limit: String(filters.limit) }),
    count(`SELECT count(*)::int AS count FROM manual_publish_closeouts`),
    getWarnings(filters.limit)
  ]);

  return {
    filters,
    safety_notice: safetyNotice,
    summary,
    pipeline,
    manual_publish: {
      packages_total: reportSummary.total_packages,
      packages_no_checklist: reportSummary.no_checklist,
      packages_checklist_incomplete: reportSummary.checklist_incomplete,
      packages_missing_manual_url: reportSummary.missing_manual_url,
      packages_ready_evidence_complete: reportSummary.ready_evidence_complete,
      closeouts_total: closeouts,
      blocked_closeout_candidates: warnings.filter((warning) => warning.warning_type === "ready_evidence_complete").length
    },
    warnings,
    links
  };
}
