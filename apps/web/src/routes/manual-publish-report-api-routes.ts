import {
  exportManualPublishReportCsv,
  getManualPublishReportBoard,
  getManualPublishReportPackageDetail,
  getManualPublishReportSummary
} from "../manual-publish-report-service.ts";
import type { RequestLike } from "../http/request.ts";
import { sendSuccess } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";

function filtersFromUrl(url: URL): Record<string, string | null> {
  return {
    q: url.searchParams.get("q"),
    package_status: url.searchParams.get("package_status"),
    channel: url.searchParams.get("channel"),
    report_status: url.searchParams.get("report_status"),
    channel_report_status: url.searchParams.get("channel_report_status"),
    missing_manual_url: url.searchParams.get("missing_manual_url"),
    checklist_initialized: url.searchParams.get("checklist_initialized"),
    limit: url.searchParams.get("limit")
  };
}

export async function handleManualPublishReportApiRoute(request: RequestLike, response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname === "/api/manual-publish-report" && request.method === "GET") {
    sendSuccess(response, await getManualPublishReportBoard(filtersFromUrl(url)));
    return true;
  }

  if (pathname === "/api/manual-publish-report/summary" && request.method === "GET") {
    sendSuccess(response, await getManualPublishReportSummary(filtersFromUrl(url)));
    return true;
  }

  if (pathname === "/api/manual-publish-report/export.csv" && request.method === "GET") {
    response.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Disposition": "attachment; filename=\"manual-publish-report.csv\""
    });
    response.end(await exportManualPublishReportCsv(filtersFromUrl(url)));
    return true;
  }

  const detailMatch = pathname.match(/^\/api\/manual-publish-report\/packages\/([^/]+)$/);
  if (detailMatch && request.method === "GET") {
    sendSuccess(response, await getManualPublishReportPackageDetail(detailMatch[1]));
    return true;
  }

  return false;
}
