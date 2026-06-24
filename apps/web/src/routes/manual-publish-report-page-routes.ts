import { ManualPublishReportError } from "../manual-publish-report-errors.ts";
import type { ResponseLike } from "../http/response.ts";
import { sendHtml } from "../http/response.ts";
import {
  renderManualPublishReportDetailPage,
  renderManualPublishReportListPage
} from "../views/manual-publish-report-pages.ts";
import { renderNotFoundPage } from "./library-page-routes.ts";

function isNotFoundLike(error: unknown): boolean {
  return error instanceof ManualPublishReportError && (error.statusCode === 400 || error.statusCode === 404);
}

export async function handleManualPublishReportPageGet(response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname === "/manual-publish-report") {
    sendHtml(response, await renderManualPublishReportListPage(url));
    return true;
  }

  const detailMatch = pathname.match(/^\/manual-publish-report\/packages\/([^/]+)$/);
  if (detailMatch) {
    try {
      sendHtml(response, await renderManualPublishReportDetailPage(detailMatch[1], url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Manual publish report tidak ditemukan.";
      sendHtml(response, renderNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  return false;
}
