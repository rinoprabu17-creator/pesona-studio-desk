import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { checkDatabase } from "./db.ts";
import { getPathname, getRequestUrl } from "./http/request.ts";
import type { RequestLike } from "./http/request.ts";
import { handleApiError, sendError, sendHtml, sendJson } from "./http/response.ts";
import type { ResponseLike } from "./http/response.ts";
import { handleCampaignApiRoute } from "./routes/campaign-api-routes.ts";
import { handleCampaignPageGet, handleCampaignPagePost } from "./routes/campaign-page-routes.ts";
import { handleContentItemApiRoute } from "./routes/content-item-api-routes.ts";
import { handleContentItemPageGet, handleContentItemPagePost } from "./routes/content-item-page-routes.ts";
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
        (await handleContentItemApiRoute(request, response, pathname, url));
      if (!handled) {
        sendError(response, 404, "not_found", "Endpoint tidak ditemukan.");
      }
      return;
    }

    if (request.method === "POST") {
      const handled =
        (await handleLibraryPagePost(request, response, pathname)) ||
        (await handleCampaignPagePost(request, response, pathname)) ||
        (await handleContentItemPagePost(request, response, pathname));
      if (!handled) {
        sendHtml(response, renderNotFoundPage(), 404);
      }
      return;
    }

    const handled =
      (await handleLibraryPageGet(response, pathname, url)) ||
      (await handleCampaignPageGet(response, pathname, url)) ||
      (await handleContentItemPageGet(response, pathname, url));
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
