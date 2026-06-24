import {
  archiveApprovedVideoHandoff,
  getApprovedVideoHandoffContext,
  listApprovedVideoLibrary,
  markApprovedVideoHold,
  markApprovedVideoNeedsRevision,
  markApprovedVideoReadyForManualPublish
} from "../approved-video-handoff-service.ts";
import { readJsonBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { sendSuccess } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";

export async function handleApprovedVideoApiRoute(request: RequestLike, response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname === "/api/approved-videos" && request.method === "GET") {
    sendSuccess(response, await listApprovedVideoLibrary({
      handoff_status: url.searchParams.get("handoff_status"),
      campaign_id: url.searchParams.get("campaign_id"),
      content_item_id: url.searchParams.get("content_item_id"),
      q: url.searchParams.get("q")
    }));
    return true;
  }

  const readyMatch = pathname.match(/^\/api\/approved-videos\/([^/]+)\/handoff\/ready$/);
  if (readyMatch && request.method === "POST") {
    sendSuccess(response, await markApprovedVideoReadyForManualPublish(readyMatch[1], await readJsonBody(request)), 201);
    return true;
  }

  const holdMatch = pathname.match(/^\/api\/approved-videos\/([^/]+)\/handoff\/hold$/);
  if (holdMatch && request.method === "POST") {
    sendSuccess(response, await markApprovedVideoHold(holdMatch[1], await readJsonBody(request)), 201);
    return true;
  }

  const needsRevisionMatch = pathname.match(/^\/api\/approved-videos\/([^/]+)\/handoff\/needs-revision$/);
  if (needsRevisionMatch && request.method === "POST") {
    sendSuccess(response, await markApprovedVideoNeedsRevision(needsRevisionMatch[1], await readJsonBody(request)), 201);
    return true;
  }

  const archiveMatch = pathname.match(/^\/api\/approved-videos\/([^/]+)\/handoff\/archive$/);
  if (archiveMatch && request.method === "POST") {
    sendSuccess(response, await archiveApprovedVideoHandoff(archiveMatch[1], await readJsonBody(request)), 201);
    return true;
  }

  const detailMatch = pathname.match(/^\/api\/approved-videos\/([^/]+)$/);
  if (detailMatch && request.method === "GET") {
    sendSuccess(response, await getApprovedVideoHandoffContext(detailMatch[1]));
    return true;
  }

  return false;
}
