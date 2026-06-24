import { ApprovedVideoHandoffError } from "../approved-video-handoff-errors.ts";
import {
  archiveApprovedVideoHandoff,
  markApprovedVideoHold,
  markApprovedVideoNeedsRevision,
  markApprovedVideoReadyForManualPublish
} from "../approved-video-handoff-service.ts";
import { readFormBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { redirect, sendHtml } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";
import {
  renderApprovedVideoDetailPage,
  renderApprovedVideoLibraryPage
} from "../views/approved-video-pages.ts";
import { renderNotFoundPage } from "./library-page-routes.ts";

function isNotFoundLike(error: unknown): boolean {
  return error instanceof ApprovedVideoHandoffError && (error.statusCode === 400 || error.statusCode === 404);
}

async function handleHandoffAction(
  request: RequestLike,
  response: ResponseLike,
  promotionId: string,
  action: (promotionId: string, input: unknown) => Promise<unknown>,
  success: string
): Promise<void> {
  const body = await readFormBody(request);
  try {
    await action(promotionId, body);
    redirect(response, `/approved-videos/${encodeURIComponent(promotionId)}?success=${encodeURIComponent(success)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Handoff approved video gagal.";
    redirect(response, `/approved-videos/${encodeURIComponent(promotionId)}?error=${encodeURIComponent(message)}`);
  }
}

export async function handleApprovedVideoPagePost(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  const readyMatch = pathname.match(/^\/approved-videos\/([^/]+)\/handoff\/ready$/);
  if (readyMatch && request.method === "POST") {
    await handleHandoffAction(request, response, readyMatch[1], markApprovedVideoReadyForManualPublish, "Approved video siap untuk manual publish.");
    return true;
  }

  const holdMatch = pathname.match(/^\/approved-videos\/([^/]+)\/handoff\/hold$/);
  if (holdMatch && request.method === "POST") {
    await handleHandoffAction(request, response, holdMatch[1], markApprovedVideoHold, "Approved video ditahan.");
    return true;
  }

  const needsRevisionMatch = pathname.match(/^\/approved-videos\/([^/]+)\/handoff\/needs-revision$/);
  if (needsRevisionMatch && request.method === "POST") {
    await handleHandoffAction(request, response, needsRevisionMatch[1], markApprovedVideoNeedsRevision, "Approved video ditandai perlu revisi.");
    return true;
  }

  const archiveMatch = pathname.match(/^\/approved-videos\/([^/]+)\/handoff\/archive$/);
  if (archiveMatch && request.method === "POST") {
    await handleHandoffAction(request, response, archiveMatch[1], archiveApprovedVideoHandoff, "Approved video diarsipkan.");
    return true;
  }

  return false;
}

export async function handleApprovedVideoPageGet(response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname === "/approved-videos") {
    sendHtml(response, await renderApprovedVideoLibraryPage(url));
    return true;
  }

  const detailMatch = pathname.match(/^\/approved-videos\/([^/]+)$/);
  if (detailMatch) {
    try {
      sendHtml(response, await renderApprovedVideoDetailPage(detailMatch[1], url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Approved video tidak ditemukan.";
      sendHtml(response, renderNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  return false;
}
