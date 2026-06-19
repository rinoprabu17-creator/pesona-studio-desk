import {
  createContentItem,
  getContentItem,
  listContentItems,
  updateContentItem,
  updateContentItemProductionStatus
} from "../content-item-service.ts";
import { readJsonBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { sendSuccess } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";

export async function handleContentItemApiRoute(request: RequestLike, response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname === "/api/content-items" && request.method === "GET") {
    sendSuccess(
      response,
      await listContentItems({
        campaign_id: url.searchParams.get("campaign_id"),
        production_status: url.searchParams.get("production_status")
      })
    );
    return true;
  }

  if (pathname === "/api/content-items" && request.method === "POST") {
    sendSuccess(response, await createContentItem(await readJsonBody(request)), 201);
    return true;
  }

  const statusMatch = pathname.match(/^\/api\/content-items\/([^/]+)\/production-status$/);
  if (statusMatch && request.method === "POST") {
    const body = await readJsonBody(request);
    sendSuccess(response, await updateContentItemProductionStatus(statusMatch[1], body.production_status));
    return true;
  }

  const contentItemMatch = pathname.match(/^\/api\/content-items\/([^/]+)$/);
  if (contentItemMatch && request.method === "GET") {
    sendSuccess(response, await getContentItem(contentItemMatch[1]));
    return true;
  }

  if (contentItemMatch && request.method === "POST") {
    sendSuccess(response, await updateContentItem(contentItemMatch[1], await readJsonBody(request)));
    return true;
  }

  return false;
}
