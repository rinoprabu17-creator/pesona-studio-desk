import { ManualPublishCloseoutError } from "../manual-publish-closeout-errors.ts";
import { createManualPublishCloseout } from "../manual-publish-closeout-service.ts";
import { readFormBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { redirect, sendHtml } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";
import {
  renderManualPublishCloseoutDetailPage,
  renderManualPublishCloseoutListPage,
  renderManualPublishCloseoutPackagePage
} from "../views/manual-publish-closeout-pages.ts";
import { renderNotFoundPage } from "./library-page-routes.ts";

function isNotFoundLike(error: unknown): boolean {
  return error instanceof ManualPublishCloseoutError && (error.statusCode === 400 || error.statusCode === 404);
}

export async function handleManualPublishCloseoutPagePost(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  const createMatch = pathname.match(/^\/publication-packages\/([^/]+)\/closeout\/create$/);
  if (createMatch && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      const closeout = await createManualPublishCloseout(createMatch[1], body);
      redirect(response, `/manual-publish-closeouts/${encodeURIComponent(closeout.id)}?success=${encodeURIComponent("Closeout dibuat.")}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Closeout gagal dibuat.";
      redirect(response, `/publication-packages/${encodeURIComponent(createMatch[1])}/closeout?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  return false;
}

export async function handleManualPublishCloseoutPageGet(response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname === "/manual-publish-closeouts") {
    sendHtml(response, await renderManualPublishCloseoutListPage(url));
    return true;
  }

  const packageMatch = pathname.match(/^\/publication-packages\/([^/]+)\/closeout$/);
  if (packageMatch) {
    try {
      sendHtml(response, await renderManualPublishCloseoutPackagePage(packageMatch[1], url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Closeout manual publish tidak ditemukan.";
      sendHtml(response, renderNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  const detailMatch = pathname.match(/^\/manual-publish-closeouts\/([^/]+)$/);
  if (detailMatch) {
    try {
      sendHtml(response, await renderManualPublishCloseoutDetailPage(detailMatch[1], url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Closeout manual publish tidak ditemukan.";
      sendHtml(response, renderNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  return false;
}
