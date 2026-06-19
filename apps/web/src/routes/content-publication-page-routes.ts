import { ContentItemError } from "../content-item-errors.ts";
import { getContentItem } from "../content-item-service.ts";
import { ContentPublicationError } from "../content-publication-errors.ts";
import {
  createContentPublication,
  getContentPublication,
  updateContentPublication,
  updateContentPublicationStatus
} from "../content-publication-service.ts";
import { readFormBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { redirect, sendHtml } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";
import { LibraryError } from "../library-errors.ts";
import {
  renderPublicationDetailPage,
  renderPublicationFormPage,
  renderPublicationNotFoundPage,
  statusValuesFromForm,
  valuesFromPublicationForm
} from "../views/content-publication-pages.ts";

function statusCodeFor(error: unknown): number {
  if (
    error instanceof ContentPublicationError ||
    error instanceof ContentItemError ||
    error instanceof LibraryError
  ) {
    return error.statusCode;
  }
  return 500;
}

function isNotFoundLike(error: unknown): boolean {
  return (
    error instanceof ContentPublicationError ||
    error instanceof ContentItemError ||
    error instanceof LibraryError
  );
}

export async function handleContentPublicationPagePost(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  const createMatch = pathname.match(/^\/content-items\/([^/]+)\/publications\/create$/);
  if (createMatch && request.method === "POST") {
    const body = await readFormBody(request);
    const values = valuesFromPublicationForm(body);
    try {
      const publication = await createContentPublication(createMatch[1], values);
      redirect(response, `/content-publications/${publication.id}?success=Publikasi berhasil dibuat.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Publikasi gagal dibuat.";
      let contentItem;
      try {
        contentItem = await getContentItem(createMatch[1]);
      } catch {
        contentItem = undefined;
      }
      sendHtml(
        response,
        await renderPublicationFormPage({
          mode: "create",
          action: `/content-items/${encodeURIComponent(createMatch[1])}/publications/create`,
          contentItem,
          values,
          errorMessage: message
        }),
        statusCodeFor(error)
      );
    }
    return true;
  }

  const updateMatch = pathname.match(/^\/content-publications\/([^/]+)\/update$/);
  if (updateMatch && request.method === "POST") {
    const body = await readFormBody(request);
    const values = valuesFromPublicationForm(body);
    try {
      const publication = await updateContentPublication(updateMatch[1], values);
      redirect(response, `/content-publications/${publication.id}?success=Publikasi berhasil disimpan.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Publikasi gagal disimpan.";
      let publication;
      try {
        publication = await getContentPublication(updateMatch[1]);
      } catch {
        publication = undefined;
      }
      sendHtml(
        response,
        await renderPublicationFormPage({
          mode: "edit",
          action: `/content-publications/${encodeURIComponent(updateMatch[1])}/update`,
          publication,
          values,
          errorMessage: message
        }),
        statusCodeFor(error)
      );
    }
    return true;
  }

  const statusMatch = pathname.match(/^\/content-publications\/([^/]+)\/status$/);
  if (statusMatch && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      const publication = await updateContentPublicationStatus(statusMatch[1], statusValuesFromForm(body));
      redirect(response, `/content-publications/${publication.id}?success=Status publikasi berhasil diubah.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Status publikasi gagal diubah.";
      redirect(response, `/content-publications/${encodeURIComponent(statusMatch[1])}?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  return false;
}

export async function handleContentPublicationPageGet(response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  const newMatch = pathname.match(/^\/content-items\/([^/]+)\/publications\/new$/);
  if (newMatch) {
    try {
      const contentItem = await getContentItem(newMatch[1]);
      sendHtml(
        response,
        await renderPublicationFormPage({
          mode: "create",
          action: `/content-items/${encodeURIComponent(contentItem.id)}/publications/create`,
          contentItem
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Content item tidak ditemukan.";
      sendHtml(response, renderPublicationNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  const editMatch = pathname.match(/^\/content-publications\/([^/]+)\/edit$/);
  if (editMatch) {
    try {
      const publication = await getContentPublication(editMatch[1]);
      sendHtml(
        response,
        await renderPublicationFormPage({
          mode: "edit",
          action: `/content-publications/${encodeURIComponent(publication.id)}/update`,
          publication
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Publikasi tidak ditemukan.";
      sendHtml(response, renderPublicationNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  const detailMatch = pathname.match(/^\/content-publications\/([^/]+)$/);
  if (detailMatch) {
    try {
      const publication = await getContentPublication(detailMatch[1]);
      sendHtml(response, renderPublicationDetailPage(publication, url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Publikasi tidak ditemukan.";
      sendHtml(response, renderPublicationNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  return false;
}
