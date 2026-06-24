import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { checkDatabase } from "./db.ts";
import { getPathname, getRequestUrl } from "./http/request.ts";
import type { RequestLike } from "./http/request.ts";
import { handleApiError, sendError, sendHtml, sendJson } from "./http/response.ts";
import type { ResponseLike } from "./http/response.ts";
import { handleCampaignApiRoute } from "./routes/campaign-api-routes.ts";
import { handleCampaignPlanImportApiRoute } from "./routes/campaign-plan-import-api-routes.ts";
import { handleCampaignPlanImportPageGet, handleCampaignPlanImportPagePost } from "./routes/campaign-plan-import-page-routes.ts";
import { handleCampaignPlanReviewApiRoute } from "./routes/campaign-plan-review-api-routes.ts";
import { handleCampaignPlanReviewPageGet, handleCampaignPlanReviewPagePost } from "./routes/campaign-plan-review-page-routes.ts";
import { handleCampaignPlanRunApiRoute } from "./routes/campaign-plan-run-api-routes.ts";
import { handleCampaignPlanRunPageGet, handleCampaignPlanRunPagePost } from "./routes/campaign-plan-run-page-routes.ts";
import { handleCampaignPageGet, handleCampaignPagePost } from "./routes/campaign-page-routes.ts";
import { handleApprovedVideoApiRoute } from "./routes/approved-video-api-routes.ts";
import { handleApprovedVideoPageGet, handleApprovedVideoPagePost } from "./routes/approved-video-page-routes.ts";
import { handleManualPublicationPackageApiRoute } from "./routes/manual-publication-package-api-routes.ts";
import { handleManualPublicationPackagePageGet, handleManualPublicationPackagePagePost } from "./routes/manual-publication-package-page-routes.ts";
import { handleManualPublishChecklistApiRoute } from "./routes/manual-publish-checklist-api-routes.ts";
import { handleManualPublishChecklistPageGet, handleManualPublishChecklistPagePost } from "./routes/manual-publish-checklist-page-routes.ts";
import { handleManualPublishReportApiRoute } from "./routes/manual-publish-report-api-routes.ts";
import { handleManualPublishReportPageGet } from "./routes/manual-publish-report-page-routes.ts";
import { handleContentCalendarApiRoute } from "./routes/content-calendar-api-routes.ts";
import { handleContentCalendarPageGet } from "./routes/content-calendar-page-routes.ts";
import { handleContentItemApiRoute } from "./routes/content-item-api-routes.ts";
import { handleContentItemPageGet, handleContentItemPagePost } from "./routes/content-item-page-routes.ts";
import { handleContentPublicationApiRoute } from "./routes/content-publication-api-routes.ts";
import { handleContentPublicationPageGet, handleContentPublicationPagePost } from "./routes/content-publication-page-routes.ts";
import { handleFootageAssetApiRoute } from "./routes/footage-asset-api-routes.ts";
import { handleFootageAssetPageGet, handleFootageAssetPagePost } from "./routes/footage-asset-page-routes.ts";
import { handleLibraryApiRoute } from "./routes/library-api-routes.ts";
import { handleLibraryPageGet, handleLibraryPagePost, renderNotFoundPage } from "./routes/library-page-routes.ts";
import { escapeHtml, renderLayout } from "./views/layout.ts";

const appName = process.env.APP_NAME || "Pesona Studio Desk";
const port = Number(process.env.APP_PORT || process.env.PORT || "3000");
const storageDir = process.env.APP_STORAGE_DIR || join(process.cwd(), "storage");

function isApiPath(pathname: string): boolean {
  return pathname === "/health" || pathname.startsWith("/api/");
}

const server = createServer(async (request: RequestLike, response: ResponseLike) => {
  const url = getRequestUrl(request);
  const pathname = getPathname(url);

  try {
    if (pathname === "/health") {
      sendJson(response, 200, {
        ok: true,
        data: {
          status: "ok",
          app: appName,
          storageReady: existsSync(storageDir),
          databaseReady: await checkDatabase()
        }
      });
      return;
    }

    if (pathname.startsWith("/api/")) {
      const handled =
        (await handleLibraryApiRoute(request, response, pathname)) ||
        (await handleCampaignApiRoute(request, response, pathname)) ||
        (await handleCampaignPlanImportApiRoute(request, response, pathname)) ||
        (await handleCampaignPlanReviewApiRoute(request, response, pathname)) ||
        (await handleCampaignPlanRunApiRoute(request, response, pathname)) ||
        (await handleManualPublishReportApiRoute(request, response, pathname, url)) ||
        (await handleManualPublishChecklistApiRoute(request, response, pathname, url)) ||
        (await handleManualPublicationPackageApiRoute(request, response, pathname, url)) ||
        (await handleApprovedVideoApiRoute(request, response, pathname, url)) ||
        (await handleContentCalendarApiRoute(request, response, pathname, url)) ||
        (await handleContentItemApiRoute(request, response, pathname, url)) ||
        (await handleContentPublicationApiRoute(request, response, pathname)) ||
        (await handleFootageAssetApiRoute(request, response, pathname, url));
      if (!handled) {
        sendError(response, 404, "not_found", "Endpoint tidak ditemukan.");
      }
      return;
    }

    if (request.method === "POST") {
      const handled =
        (await handleLibraryPagePost(request, response, pathname)) ||
        (await handleCampaignPagePost(request, response, pathname)) ||
        (await handleCampaignPlanImportPagePost(request, response, pathname)) ||
        (await handleCampaignPlanReviewPagePost(request, response, pathname)) ||
        (await handleCampaignPlanRunPagePost(request, response, pathname)) ||
        (await handleManualPublishChecklistPagePost(request, response, pathname)) ||
        (await handleManualPublicationPackagePagePost(request, response, pathname)) ||
        (await handleApprovedVideoPagePost(request, response, pathname)) ||
        (await handleContentItemPagePost(request, response, pathname)) ||
        (await handleContentPublicationPagePost(request, response, pathname)) ||
        (await handleFootageAssetPagePost(request, response, pathname));
      if (!handled) {
        sendHtml(response, renderNotFoundPage(), 404);
      }
      return;
    }

    const handled =
      (await handleLibraryPageGet(response, pathname, url)) ||
      (await handleCampaignPageGet(response, pathname, url)) ||
      (await handleCampaignPlanImportPageGet(response, pathname, url)) ||
      (await handleCampaignPlanReviewPageGet(response, pathname, url)) ||
      (await handleCampaignPlanRunPageGet(response, pathname, url)) ||
      (await handleManualPublishReportPageGet(response, pathname, url)) ||
      (await handleManualPublishChecklistPageGet(response, pathname, url)) ||
      (await handleManualPublicationPackagePageGet(response, pathname, url)) ||
      (await handleApprovedVideoPageGet(response, pathname, url)) ||
      (await handleContentCalendarPageGet(response, pathname, url)) ||
      (await handleContentItemPageGet(response, pathname, url)) ||
      (await handleContentPublicationPageGet(response, pathname, url)) ||
      (await handleFootageAssetPageGet(response, pathname, url));
    if (!handled) {
      sendHtml(response, renderNotFoundPage(), 404);
    }
  } catch (error) {
    if (isApiPath(pathname)) {
      handleApiError(response, error);
      return;
    }

    const message = error instanceof Error ? error.message : "Terjadi error pada server.";
    sendHtml(
      response,
      renderLayout(
        "/products",
        "Error",
        "Server error",
        "Halaman gagal dimuat.",
        `<div class="notice error">${escapeHtml(message)}</div>`
      ),
      500
    );
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(
    JSON.stringify({
      level: "info",
      service: "web-app",
      message: "Pesona Studio Desk web started",
      port,
      storageDir
    })
  );
});
