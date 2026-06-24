import { query } from "./db.ts";
import { ManualPublishReportError } from "./manual-publish-report-errors.ts";
import { manualPublishChecklistKeys } from "./validation/manual-publish-checklist-validation.ts";
import {
  assertManualPublishReportPackageId,
  validateManualPublishReportFilters
} from "./validation/manual-publish-report-validation.ts";
import type { ManualPublishReportFilters, ManualPublishReportStatus } from "./validation/manual-publish-report-validation.ts";

type PackageBaseRow = {
  package_id: string;
  package_status: string;
  content_item_id: string;
  content_code: string;
  content_title: string;
  campaign_code: string;
  campaign_name: string;
  approved_output_relative_path_snapshot: string;
  created_at: string;
  updated_at: string;
};

type PackageChannelRow = {
  package_channel_id: string;
  package_id: string;
  channel: string;
  channel_status: string;
  publication_format: string;
};

type ChecklistAggregateRow = {
  package_id: string;
  package_channel_id: string;
  checklist_total: number;
  checklist_done: number;
  checklist_pending: number;
  checklist_skipped: number;
  checklist_blocked: number;
  present_keys: string[];
};

type EvidenceAggregateRow = {
  package_id: string;
  package_channel_id: string;
  evidence_count: number;
  has_manual_post_url: boolean;
  latest_manual_post_url: string | null;
  latest_evidence_at: string | null;
};

export type ManualPublishReportPackageChannel = {
  package_channel_id: string;
  package_id: string;
  channel: string;
  channel_status: string;
  publication_format: string;
  checklist_total: number;
  checklist_done: number;
  checklist_pending: number;
  checklist_blocked: number;
  checklist_skipped: number;
  evidence_count: number;
  has_manual_post_url: boolean;
  latest_manual_post_url: string | null;
  latest_evidence_at: string | null;
  missing_checklist_keys: string[];
  channel_report_status: ManualPublishReportStatus;
};

export type ManualPublishReportPackage = PackageBaseRow & {
  selected_channel_count: number;
  checklist_total: number;
  checklist_done: number;
  checklist_pending: number;
  checklist_skipped: number;
  checklist_blocked: number;
  evidence_count: number;
  manual_url_channel_count: number;
  channels_with_manual_url: string[];
  missing_manual_url_channels: string[];
  checklist_initialized: boolean;
  checklist_complete: boolean;
  manual_url_complete: boolean;
  report_status: ManualPublishReportStatus;
  channels: ManualPublishReportPackageChannel[];
};

export type ManualPublishReportSummary = {
  total_packages: number;
  no_checklist: number;
  checklist_incomplete: number;
  missing_manual_url: number;
  ready_evidence_complete: number;
};

export type ManualPublishReportBoard = {
  filters: ManualPublishReportFilters;
  summary: ManualPublishReportSummary;
  packages: ManualPublishReportPackage[];
};

const packageSql = `
  SELECT package.id AS package_id,
         package.package_status,
         package.content_item_id,
         item.content_code,
         item.title AS content_title,
         campaign.code AS campaign_code,
         campaign.name AS campaign_name,
         package.approved_output_relative_path_snapshot,
         package.created_at,
         package.updated_at
  FROM manual_publication_packages package
  JOIN content_items item ON item.id = package.content_item_id
  JOIN campaigns campaign ON campaign.id = item.campaign_id
  ORDER BY package.created_at DESC, package.id
`;

const channelSql = `
  SELECT id AS package_channel_id,
         package_id,
         channel,
         channel_status,
         publication_format
  FROM manual_publication_package_channels
  ORDER BY package_id, channel
`;

const checklistSql = `
  SELECT package_id,
         package_channel_id,
         count(*)::int AS checklist_total,
         count(*) FILTER (WHERE is_done)::int AS checklist_done,
         count(*) FILTER (WHERE checklist_status = 'pending')::int AS checklist_pending,
         count(*) FILTER (WHERE checklist_status = 'skipped')::int AS checklist_skipped,
         count(*) FILTER (WHERE checklist_status = 'blocked')::int AS checklist_blocked,
         array_agg(checklist_key ORDER BY checklist_key) AS present_keys
  FROM manual_publish_checklist_items
  GROUP BY package_id, package_channel_id
`;

const evidenceSql = `
  SELECT package_id,
         package_channel_id,
         count(*)::int AS evidence_count,
         bool_or(evidence_type = 'manual_post_url' AND coalesce(evidence_value, '') <> '') AS has_manual_post_url,
         (array_agg(evidence_value ORDER BY recorded_at DESC, created_at DESC)
           FILTER (WHERE evidence_type = 'manual_post_url' AND coalesce(evidence_value, '') <> ''))[1] AS latest_manual_post_url,
         max(recorded_at) AS latest_evidence_at
  FROM manual_publish_evidence_logs
  GROUP BY package_id, package_channel_id
`;

function toNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value || 0);
}

function channelStatus(total: number, done: number, hasManualPostUrl: boolean): ManualPublishReportStatus {
  if (total === 0) {
    return "no_checklist";
  }
  if (done < total) {
    return "checklist_incomplete";
  }
  if (!hasManualPostUrl) {
    return "missing_manual_url";
  }
  return "ready_evidence_complete";
}

function packageStatus(channels: ManualPublishReportPackageChannel[]): ManualPublishReportStatus {
  if (channels.some((row) => row.channel_report_status === "no_checklist")) {
    return "no_checklist";
  }
  if (channels.some((row) => row.channel_report_status === "checklist_incomplete")) {
    return "checklist_incomplete";
  }
  if (channels.some((row) => row.channel_report_status === "missing_manual_url")) {
    return "missing_manual_url";
  }
  return "ready_evidence_complete";
}

function mapChecklistRows(rows: ChecklistAggregateRow[]): Map<string, ChecklistAggregateRow> {
  const result = new Map<string, ChecklistAggregateRow>();
  for (const row of rows) {
    result.set(row.package_channel_id, {
      ...row,
      checklist_total: toNumber(row.checklist_total),
      checklist_done: toNumber(row.checklist_done),
      checklist_pending: toNumber(row.checklist_pending),
      checklist_skipped: toNumber(row.checklist_skipped),
      checklist_blocked: toNumber(row.checklist_blocked),
      present_keys: Array.isArray(row.present_keys) ? row.present_keys : []
    });
  }
  return result;
}

function mapEvidenceRows(rows: EvidenceAggregateRow[]): Map<string, EvidenceAggregateRow> {
  const result = new Map<string, EvidenceAggregateRow>();
  for (const row of rows) {
    result.set(row.package_channel_id, {
      ...row,
      evidence_count: toNumber(row.evidence_count),
      has_manual_post_url: Boolean(row.has_manual_post_url),
      latest_evidence_at: row.latest_evidence_at
    });
  }
  return result;
}

async function loadReportPackages(): Promise<ManualPublishReportPackage[]> {
  const [packages, channels, checklistRows, evidenceRows] = await Promise.all([
    query<PackageBaseRow>(packageSql),
    query<PackageChannelRow>(channelSql),
    query<ChecklistAggregateRow>(checklistSql),
    query<EvidenceAggregateRow>(evidenceSql)
  ]);
  const checklistByChannel = mapChecklistRows(checklistRows);
  const evidenceByChannel = mapEvidenceRows(evidenceRows);
  const channelsByPackage = new Map<string, PackageChannelRow[]>();
  for (const channel of channels) {
    const current = channelsByPackage.get(channel.package_id) || [];
    current.push(channel);
    channelsByPackage.set(channel.package_id, current);
  }
  return packages.map((pkg) => {
    const packageChannels = (channelsByPackage.get(pkg.package_id) || []).map((channel) => {
      const checklist = checklistByChannel.get(channel.package_channel_id);
      const evidence = evidenceByChannel.get(channel.package_channel_id);
      const presentKeys = checklist?.present_keys || [];
      const missingKeys = manualPublishChecklistKeys.filter((key) => !presentKeys.includes(key));
      const checklistTotal = checklist?.checklist_total || 0;
      const checklistDone = checklist?.checklist_done || 0;
      const hasManualPostUrl = Boolean(evidence?.has_manual_post_url);
      return {
        ...channel,
        checklist_total: checklistTotal,
        checklist_done: checklistDone,
        checklist_pending: checklist?.checklist_pending || 0,
        checklist_blocked: checklist?.checklist_blocked || 0,
        checklist_skipped: checklist?.checklist_skipped || 0,
        evidence_count: evidence?.evidence_count || 0,
        has_manual_post_url: hasManualPostUrl,
        latest_manual_post_url: evidence?.latest_manual_post_url || null,
        latest_evidence_at: evidence?.latest_evidence_at || null,
        missing_checklist_keys: missingKeys,
        channel_report_status: channelStatus(checklistTotal, checklistDone, hasManualPostUrl)
      };
    });
    const reportStatus = packageStatus(packageChannels);
    const channelsWithManualUrl = packageChannels.filter((row) => row.has_manual_post_url).map((row) => row.channel).sort();
    const missingManualUrlChannels = packageChannels.filter((row) => !row.has_manual_post_url).map((row) => row.channel).sort();
    const checklistTotal = packageChannels.reduce((sum, row) => sum + row.checklist_total, 0);
    const checklistDone = packageChannels.reduce((sum, row) => sum + row.checklist_done, 0);
    return {
      ...pkg,
      selected_channel_count: packageChannels.length,
      checklist_total: checklistTotal,
      checklist_done: checklistDone,
      checklist_pending: packageChannels.reduce((sum, row) => sum + row.checklist_pending, 0),
      checklist_skipped: packageChannels.reduce((sum, row) => sum + row.checklist_skipped, 0),
      checklist_blocked: packageChannels.reduce((sum, row) => sum + row.checklist_blocked, 0),
      evidence_count: packageChannels.reduce((sum, row) => sum + row.evidence_count, 0),
      manual_url_channel_count: channelsWithManualUrl.length,
      channels_with_manual_url: channelsWithManualUrl,
      missing_manual_url_channels: missingManualUrlChannels,
      checklist_initialized: checklistTotal > 0 && packageChannels.every((row) => row.checklist_total > 0),
      checklist_complete: checklistTotal > 0 && checklistDone === checklistTotal,
      manual_url_complete: packageChannels.length > 0 && missingManualUrlChannels.length === 0,
      report_status: reportStatus,
      channels: packageChannels
    };
  });
}

function matchesFilters(pkg: ManualPublishReportPackage, filters: ManualPublishReportFilters): boolean {
  if (filters.package_status && pkg.package_status !== filters.package_status) {
    return false;
  }
  if (filters.channel && !pkg.channels.some((row) => row.channel === filters.channel)) {
    return false;
  }
  if (filters.report_status && pkg.report_status !== filters.report_status) {
    return false;
  }
  if (filters.channel_report_status && !pkg.channels.some((row) => row.channel_report_status === filters.channel_report_status)) {
    return false;
  }
  if (filters.missing_manual_url !== null && filters.missing_manual_url !== undefined) {
    const missing = pkg.missing_manual_url_channels.length > 0;
    if (missing !== filters.missing_manual_url) {
      return false;
    }
  }
  if (filters.checklist_initialized !== null && filters.checklist_initialized !== undefined && pkg.checklist_initialized !== filters.checklist_initialized) {
    return false;
  }
  if (filters.q) {
    const needle = filters.q.toLowerCase();
    const haystack = [pkg.content_code, pkg.content_title, pkg.campaign_code, pkg.campaign_name].join(" ").toLowerCase();
    if (!haystack.includes(needle)) {
      return false;
    }
  }
  return true;
}

function summarize(packages: ManualPublishReportPackage[]): ManualPublishReportSummary {
  return {
    total_packages: packages.length,
    no_checklist: packages.filter((row) => row.report_status === "no_checklist").length,
    checklist_incomplete: packages.filter((row) => row.report_status === "checklist_incomplete").length,
    missing_manual_url: packages.filter((row) => row.report_status === "missing_manual_url").length,
    ready_evidence_complete: packages.filter((row) => row.report_status === "ready_evidence_complete").length
  };
}

function normalizeFilters(input: Parameters<typeof validateManualPublishReportFilters>[0]): ManualPublishReportFilters {
  return validateManualPublishReportFilters(input);
}

export async function getManualPublishReportBoard(input: Parameters<typeof validateManualPublishReportFilters>[0] = {}): Promise<ManualPublishReportBoard> {
  const filters = normalizeFilters(input);
  const allPackages = await loadReportPackages();
  const filtered = allPackages.filter((pkg) => matchesFilters(pkg, filters));
  return {
    filters,
    summary: summarize(filtered),
    packages: filtered.slice(0, filters.limit)
  };
}

export async function getManualPublishReportSummary(input: Parameters<typeof validateManualPublishReportFilters>[0] = {}): Promise<ManualPublishReportSummary> {
  return (await getManualPublishReportBoard(input)).summary;
}

export async function getManualPublishReportPackageDetail(packageId: string): Promise<ManualPublishReportPackage> {
  assertManualPublishReportPackageId(packageId);
  const pkg = (await loadReportPackages()).find((row) => row.package_id === packageId);
  if (!pkg) {
    throw new ManualPublishReportError("manual_publish_report_package_not_found", "Package manual publish tidak ditemukan.", 404);
  }
  return pkg;
}

function csvValue(value: unknown): string {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export async function exportManualPublishReportCsv(input: Parameters<typeof validateManualPublishReportFilters>[0] = {}): Promise<string> {
  const board = await getManualPublishReportBoard(input);
  const headers = [
    "package_id",
    "content_code",
    "content_title",
    "campaign_code",
    "package_status",
    "report_status",
    "selected_channel_count",
    "checklist_done",
    "checklist_total",
    "evidence_count",
    "manual_url_channel_count",
    "channels_with_manual_url",
    "missing_manual_url_channels"
  ];
  const lines = [headers.join(",")];
  for (const pkg of board.packages) {
    lines.push([
      pkg.package_id,
      pkg.content_code,
      pkg.content_title,
      pkg.campaign_code,
      pkg.package_status,
      pkg.report_status,
      pkg.selected_channel_count,
      pkg.checklist_done,
      pkg.checklist_total,
      pkg.evidence_count,
      pkg.manual_url_channel_count,
      pkg.channels_with_manual_url,
      pkg.missing_manual_url_channels
    ].map(csvValue).join(","));
  }
  return `${lines.join("\n")}\n`;
}
