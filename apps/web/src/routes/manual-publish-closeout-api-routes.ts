import {
  createManualPublishCloseout,
  getManualPublishCloseoutDetail,
  getManualPublishCloseoutEligibility,
  listManualPublishCloseouts
} from "../manual-publish-closeout-service.ts";
import { readJsonBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { sendSuccess } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";

export async function handleManualPublishCloseoutApiRoute(request: RequestLike, response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname === "/api/manual-publish-closeouts" && request.method === "GET") {
    sendSuccess(response, await listManualPublishCloseouts({
      package_id: url.searchParams.get("package_id"),
      content_item_id: url.searchParams.get("content_item_id"),
      closeout_status: url.searchParams.get("closeout_status"),
      limit: Number(url.searchParams.get("limit") || 50)
    }));
    return true;
  }

  const detailMatch = pathname.match(/^\/api\/manual-publish-closeouts\/([^/]+)$/);
  if (detailMatch && request.method === "GET") {
    sendSuccess(response, await getManualPublishCloseoutDetail(detailMatch[1]));
    return true;
  }

  const eligibilityMatch = pathname.match(/^\/api\/publication-packages\/([^/]+)\/closeout\/eligibility$/);
  if (eligibilityMatch && request.method === "GET") {
    sendSuccess(response, await getManualPublishCloseoutEligibility(eligibilityMatch[1]));
    return true;
  }

  const createMatch = pathname.match(/^\/api\/publication-packages\/([^/]+)\/closeout\/create$/);
  if (createMatch && request.method === "POST") {
    sendSuccess(response, await createManualPublishCloseout(createMatch[1], await readJsonBody(request)), 201);
    return true;
  }

  return false;
}
