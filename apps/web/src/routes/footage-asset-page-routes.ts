import { FootageAssetError } from "../footage-asset-errors.ts";
import {
  batchUpdateFootageAssets,
  createFootageAsset,
  getFootageAsset,
  updateFootageAsset
} from "../footage-asset-service.ts";
import { importFootageScan } from "../footage-scan-service.ts";
import { readFormBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { redirect, sendHtml } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";
import { LibraryError } from "../library-errors.ts";
import {
  renderFootageAssetDetailPage,
  renderFootageAssetFormPage,
  renderFootageAssetListPage,
  renderFootageAssetNotFoundPage,
  renderFootageAssetReviewPage,
  renderFootageAssetScanPage,
  valuesFromBatchReviewForm,
  valuesFromFootageAsset,
  valuesFromForm
} from "../views/footage-asset-pages.ts";

function statusCodeFor(error: unknown): number {
  if (error instanceof FootageAssetError || error instanceof LibraryError) return error.statusCode;
  return 500;
}

function isNotFoundLike(error: unknown): boolean {
  if (error instanceof FootageAssetError || error instanceof LibraryError) {
    return error.statusCode === 400 || error.statusCode === 404;
  }
  return false;
}

export async function handleFootageAssetPagePost(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  if (pathname === "/footage-assets/batch-update" && request.method === "POST") {
    const body = await readFormBody(request);
    const values = valuesFromBatchReviewForm(body);
    try {
      const result = await batchUpdateFootageAssets(values);
      redirect(response, `/footage-assets/review?success=${encodeURIComponent(`${result.updated_count} metadata footage berhasil diupdate.`)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Batch update metadata footage gagal.";
      sendHtml(response, await renderFootageAssetReviewPage(new URL("http://localhost/footage-assets/review"), message), statusCodeFor(error));
    }
    return true;
  }

  if (pathname === "/footage-assets/scan/import" && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      const result = await importFootageScan({ shot_type: body.shot_type });
      redirect(
        response,
        `/footage-assets/scan?success=${encodeURIComponent(`${result.created.length} metadata footage berhasil dibuat. ${result.skipped_existing.length} sudah tercatat.`)}`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Import metadata footage gagal.";
      sendHtml(response, await renderFootageAssetScanPage(new URL("http://localhost/footage-assets/scan"), message), statusCodeFor(error));
    }
    return true;
  }

  if (pathname === "/footage-assets/create" && request.method === "POST") {
    const body = await readFormBody(request);
    const values = valuesFromForm(body);
    try {
      const footage = await createFootageAsset(values);
      redirect(response, `/footage-assets/${footage.id}?success=Footage berhasil dicatat.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Footage gagal dicatat.";
      sendHtml(
        response,
        await renderFootageAssetFormPage({
          mode: "create",
          action: "/footage-assets/create",
          values,
          errorMessage: message
        }),
        statusCodeFor(error)
      );
    }
    return true;
  }

  const updateMatch = pathname.match(/^\/footage-assets\/([^/]+)\/update$/);
  if (updateMatch && request.method === "POST") {
    const body = await readFormBody(request);
    const values = valuesFromForm(body);
    try {
      const footage = await updateFootageAsset(updateMatch[1], values);
      redirect(response, `/footage-assets/${footage.id}?success=Footage berhasil disimpan.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Footage gagal disimpan.";
      let footage;
      try {
        footage = await getFootageAsset(updateMatch[1]);
      } catch {
        footage = undefined;
      }
      sendHtml(
        response,
        await renderFootageAssetFormPage({
          mode: "edit",
          action: `/footage-assets/${encodeURIComponent(updateMatch[1])}/update`,
          values,
          footage,
          errorMessage: message
        }),
        statusCodeFor(error)
      );
    }
    return true;
  }

  return false;
}

export async function handleFootageAssetPageGet(response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname === "/footage-assets") {
    sendHtml(response, await renderFootageAssetListPage(url));
    return true;
  }

  if (pathname === "/footage-assets/scan") {
    sendHtml(response, await renderFootageAssetScanPage(url));
    return true;
  }

  if (pathname === "/footage-assets/review") {
    sendHtml(response, await renderFootageAssetReviewPage(url));
    return true;
  }

  if (pathname === "/footage-assets/new") {
    sendHtml(response, await renderFootageAssetFormPage({ mode: "create", action: "/footage-assets/create" }));
    return true;
  }

  const editMatch = pathname.match(/^\/footage-assets\/([^/]+)\/edit$/);
  if (editMatch) {
    try {
      const footage = await getFootageAsset(editMatch[1]);
      sendHtml(
        response,
        await renderFootageAssetFormPage({
          mode: "edit",
          action: `/footage-assets/${encodeURIComponent(footage.id)}/update`,
          values: valuesFromFootageAsset(footage),
          footage
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Footage tidak ditemukan.";
      sendHtml(response, renderFootageAssetNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  const detailMatch = pathname.match(/^\/footage-assets\/([^/]+)$/);
  if (detailMatch) {
    try {
      const footage = await getFootageAsset(detailMatch[1]);
      sendHtml(response, renderFootageAssetDetailPage(footage, url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Footage tidak ditemukan.";
      sendHtml(response, renderFootageAssetNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  return false;
}
