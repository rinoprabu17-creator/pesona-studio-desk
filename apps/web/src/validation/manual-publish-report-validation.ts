import { assertUuid } from "./library-validation.ts";
import { validateManualPublicationPackageChannel, validateManualPublicationPackageStatus } from "./manual-publication-package-validation.ts";
import { ManualPublishReportError } from "../manual-publish-report-errors.ts";

export const manualPublishReportStatuses = ["no_checklist", "checklist_incomplete", "missing_manual_url", "ready_evidence_complete"] as const;

export type ManualPublishReportStatus = (typeof manualPublishReportStatuses)[number];

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateManualPublishReportStatus(value: unknown): ManualPublishReportStatus | null {
  const status = normalizeText(value);
  if (!status) {
    return null;
  }
  if (!manualPublishReportStatuses.includes(status as ManualPublishReportStatus)) {
    throw new ManualPublishReportError("invalid_manual_publish_report_status", "Status report manual publish tidak valid.", 400);
  }
  return status as ManualPublishReportStatus;
}

export type ManualPublishReportFilters = {
  q?: string | null;
  package_status?: string | null;
  channel?: string | null;
  report_status?: ManualPublishReportStatus | null;
  channel_report_status?: ManualPublishReportStatus | null;
  missing_manual_url?: boolean | null;
  checklist_initialized?: boolean | null;
  limit: number;
};

function parseBoolean(value: unknown): boolean | null {
  const text = normalizeText(value).toLowerCase();
  if (!text) {
    return null;
  }
  if (["true", "1", "yes", "y"].includes(text)) {
    return true;
  }
  if (["false", "0", "no", "n"].includes(text)) {
    return false;
  }
  throw new ManualPublishReportError("invalid_manual_publish_report_boolean", "Filter boolean report manual publish tidak valid.", 400);
}

export function validateManualPublishReportFilters(input: {
  q?: unknown;
  package_status?: unknown;
  channel?: unknown;
  report_status?: unknown;
  channel_report_status?: unknown;
  missing_manual_url?: unknown;
  checklist_initialized?: unknown;
  limit?: unknown;
}): ManualPublishReportFilters {
  const limitRaw = Number(input.limit || 50);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(Math.trunc(limitRaw), 200)) : 50;
  const packageStatus = normalizeText(input.package_status);
  const channel = normalizeText(input.channel);
  return {
    q: normalizeText(input.q) || null,
    package_status: packageStatus ? validateManualPublicationPackageStatus(packageStatus) : null,
    channel: channel ? validateManualPublicationPackageChannel(channel) : null,
    report_status: validateManualPublishReportStatus(input.report_status),
    channel_report_status: validateManualPublishReportStatus(input.channel_report_status),
    missing_manual_url: parseBoolean(input.missing_manual_url),
    checklist_initialized: parseBoolean(input.checklist_initialized),
    limit
  };
}

export function assertManualPublishReportPackageId(packageId: string): void {
  assertUuid(packageId);
}
