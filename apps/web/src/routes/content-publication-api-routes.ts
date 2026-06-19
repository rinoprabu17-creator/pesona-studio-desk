import {
  createContentPublication,
  getContentPublication,
  listPublicationsByContentItem,
  updateContentPublication,
  updateContentPublicationStatus
} from "../content-publication-service.ts";
import { readJsonBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { sendSuccess } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";

export async function handleContentPublicationApiRoute(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  const listMatch = pathname.match(/^\/api\/content-items\/([^/]+)\/publications$/);
  if (listMatch && request.method === "GET") {
    sendSuccess(response, await listPublicationsByContentItem(listMatch[1]));
    return true;
  }

  if (listMatch && request.method === "POST") {
    sendSuccess(response, await createContentPublication(listMatch[1], await readJsonBody(request)), 201);
    return true;
  }

  const statusMatch = pathname.match(/^\/api\/content-publications\/([^/]+)\/status$/);
  if (statusMatch && request.method === "POST") {
    sendSuccess(response, await updateContentPublicationStatus(statusMatch[1], await readJsonBody(request)));
    return true;
  }

  const publicationMatch = pathname.match(/^\/api\/content-publications\/([^/]+)$/);
  if (publicationMatch && request.method === "GET") {
    sendSuccess(response, await getContentPublication(publicationMatch[1]));
    return true;
  }

  if (publicationMatch && request.method === "POST") {
    sendSuccess(response, await updateContentPublication(publicationMatch[1], await readJsonBody(request)));
    return true;
  }

  return false;
}
