import {
  addManualPublishEvidence,
  getManualPublicationPackageCompletionSummary,
  getManualPublishChecklistContext,
  initializeManualPublishChecklist,
  listManualPublishEvidence,
  setManualPublishChecklistItemStatusForPackage
} from "../manual-publish-checklist-service.ts";
import { readJsonBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { sendSuccess } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";

export async function handleManualPublishChecklistApiRoute(request: RequestLike, response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  const checklistMatch = pathname.match(/^\/api\/publication-packages\/([^/]+)\/checklist$/);
  if (checklistMatch && request.method === "GET") {
    sendSuccess(response, await getManualPublishChecklistContext(checklistMatch[1]));
    return true;
  }

  const initializeMatch = pathname.match(/^\/api\/publication-packages\/([^/]+)\/checklist\/initialize$/);
  if (initializeMatch && request.method === "POST") {
    sendSuccess(response, await initializeManualPublishChecklist(initializeMatch[1]), 201);
    return true;
  }

  const checklistUpdateMatch = pathname.match(/^\/api\/publication-packages\/([^/]+)\/checklist\/([^/]+)\/update$/);
  if (checklistUpdateMatch && request.method === "POST") {
    sendSuccess(response, await setManualPublishChecklistItemStatusForPackage(checklistUpdateMatch[1], checklistUpdateMatch[2], await readJsonBody(request)));
    return true;
  }

  const evidenceAddMatch = pathname.match(/^\/api\/publication-packages\/([^/]+)\/evidence\/([^/]+)\/add$/);
  if (evidenceAddMatch && request.method === "POST") {
    sendSuccess(response, await addManualPublishEvidence(evidenceAddMatch[1], evidenceAddMatch[2], await readJsonBody(request)), 201);
    return true;
  }

  const evidenceListMatch = pathname.match(/^\/api\/publication-packages\/([^/]+)\/evidence$/);
  if (evidenceListMatch && request.method === "GET") {
    sendSuccess(response, await listManualPublishEvidence(evidenceListMatch[1], { channel: url.searchParams.get("channel") }));
    return true;
  }

  const summaryMatch = pathname.match(/^\/api\/publication-packages\/([^/]+)\/completion-summary$/);
  if (summaryMatch && request.method === "GET") {
    sendSuccess(response, await getManualPublicationPackageCompletionSummary(summaryMatch[1]));
    return true;
  }

  return false;
}
