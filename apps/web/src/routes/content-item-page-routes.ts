import { CampaignError } from "../campaign-errors.ts";
import { ContentItemError } from "../content-item-errors.ts";
import {
  createContentItem,
  getContentItem,
  updateContentItem,
  updateContentItemProductionStatus
} from "../content-item-service.ts";
import { readFormBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { redirect, sendHtml } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";
import { LibraryError } from "../library-errors.ts";
import {
  renderContentItemDetailPage,
  renderContentItemFormPage,
  renderContentItemListPage,
  renderContentItemNotFoundPage,
  valuesFromContentItem,
  valuesFromForm
} from "../views/content-item-pages.ts";

function statusCodeFor(error: unknown): number {
  if (
    error instanceof ContentItemError ||
    error instanceof CampaignError ||
    error instanceof LibraryError
  ) {
    return error.statusCode;
  }
  return 500;
}

function isNotFoundLike(error: unknown): boolean {
  if (
    error instanceof ContentItemError ||
    error instanceof CampaignError ||
    error instanceof LibraryError
  ) {
    return error.statusCode === 400 || error.statusCode === 404;
  }
  return false;
}

export async function handleContentItemPagePost(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  if (pathname === "/content-items/create" && request.method === "POST") {
    const body = await readFormBody(request);
    const values = valuesFromForm(body);
    try {
      const item = await createContentItem(values);
      redirect(response, `/content-items/${item.id}?success=Konten berhasil dibuat.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Konten gagal dibuat.";
      sendHtml(
        response,
        await renderContentItemFormPage({
          mode: "create",
          action: "/content-items/create",
          values,
          errorMessage: message
        }),
        statusCodeFor(error)
      );
    }
    return true;
  }

  const updateMatch = pathname.match(/^\/content-items\/([^/]+)\/update$/);
  if (updateMatch && request.method === "POST") {
    const body = await readFormBody(request);
    const values = valuesFromForm(body);
    try {
      const item = await updateContentItem(updateMatch[1], values);
      redirect(response, `/content-items/${item.id}?success=Konten berhasil disimpan.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Konten gagal disimpan.";
      let item;
      try {
        item = await getContentItem(updateMatch[1]);
      } catch {
        item = undefined;
      }
      sendHtml(
        response,
        await renderContentItemFormPage({
          mode: "edit",
          action: `/content-items/${encodeURIComponent(updateMatch[1])}/update`,
          values,
          item,
          errorMessage: message
        }),
        statusCodeFor(error)
      );
    }
    return true;
  }

  const statusMatch = pathname.match(/^\/content-items\/([^/]+)\/production-status$/);
  if (statusMatch && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      const item = await updateContentItemProductionStatus(statusMatch[1], body.production_status);
      redirect(response, `/content-items/${item.id}?success=Production status berhasil diubah.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Production status gagal diubah.";
      redirect(response, `/content-items/${encodeURIComponent(statusMatch[1])}?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  return false;
}

export async function handleContentItemPageGet(response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname === "/content-items") {
    sendHtml(response, await renderContentItemListPage(url));
    return true;
  }

  if (pathname === "/content-items/new") {
    sendHtml(
      response,
      await renderContentItemFormPage({
        mode: "create",
        action: "/content-items/create",
        campaignIdFromQuery: url.searchParams.get("campaign_id")
      })
    );
    return true;
  }

  const editMatch = pathname.match(/^\/content-items\/([^/]+)\/edit$/);
  if (editMatch) {
    try {
      const item = await getContentItem(editMatch[1]);
      sendHtml(
        response,
        await renderContentItemFormPage({
          mode: "edit",
          action: `/content-items/${encodeURIComponent(item.id)}/update`,
          values: valuesFromContentItem(item),
          item
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Konten tidak ditemukan.";
      sendHtml(response, renderContentItemNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  const detailMatch = pathname.match(/^\/content-items\/([^/]+)$/);
  if (detailMatch) {
    try {
      const item = await getContentItem(detailMatch[1]);
      sendHtml(response, await renderContentItemDetailPage(item, url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Konten tidak ditemukan.";
      sendHtml(response, renderContentItemNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  return false;
}
