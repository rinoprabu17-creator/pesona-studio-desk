import { ManualPublishChecklistError } from "../manual-publish-checklist-errors.ts";
import {
  addManualPublishEvidence,
  initializeManualPublishChecklist,
  setManualPublishChecklistItemStatusForPackage
} from "../manual-publish-checklist-service.ts";
import { readFormBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { redirect, sendHtml } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";
import { renderManualPublishChecklistPage } from "../views/manual-publish-checklist-pages.ts";
import { renderNotFoundPage } from "./library-page-routes.ts";

function isNotFoundLike(error: unknown): boolean {
  return error instanceof ManualPublishChecklistError && (error.statusCode === 400 || error.statusCode === 404);
}

async function redirectAction(response: ResponseLike, packageId: string, action: () => Promise<unknown>, success: string): Promise<void> {
  try {
    await action();
    redirect(response, `/publication-packages/${encodeURIComponent(packageId)}/checklist?success=${encodeURIComponent(success)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Manual publish checklist gagal.";
    redirect(response, `/publication-packages/${encodeURIComponent(packageId)}/checklist?error=${encodeURIComponent(message)}`);
  }
}

export async function handleManualPublishChecklistPagePost(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  const initializeMatch = pathname.match(/^\/publication-packages\/([^/]+)\/checklist\/initialize$/);
  if (initializeMatch && request.method === "POST") {
    await redirectAction(response, initializeMatch[1], () => initializeManualPublishChecklist(initializeMatch[1]), "Checklist default diinisialisasi.");
    return true;
  }

  const checklistUpdateMatch = pathname.match(/^\/publication-packages\/([^/]+)\/checklist\/([^/]+)\/update$/);
  if (checklistUpdateMatch && request.method === "POST") {
    const body = await readFormBody(request);
    await redirectAction(
      response,
      checklistUpdateMatch[1],
      () => setManualPublishChecklistItemStatusForPackage(checklistUpdateMatch[1], checklistUpdateMatch[2], body),
      "Checklist diperbarui."
    );
    return true;
  }

  const evidenceAddMatch = pathname.match(/^\/publication-packages\/([^/]+)\/evidence\/([^/]+)\/add$/);
  if (evidenceAddMatch && request.method === "POST") {
    const body = await readFormBody(request);
    await redirectAction(response, evidenceAddMatch[1], () => addManualPublishEvidence(evidenceAddMatch[1], evidenceAddMatch[2], body), "Evidence ditambahkan.");
    return true;
  }

  return false;
}

export async function handleManualPublishChecklistPageGet(response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  const checklistMatch = pathname.match(/^\/publication-packages\/([^/]+)\/checklist$/);
  if (checklistMatch) {
    try {
      sendHtml(response, await renderManualPublishChecklistPage(checklistMatch[1], url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Manual publish checklist tidak ditemukan.";
      sendHtml(response, renderNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  return false;
}
