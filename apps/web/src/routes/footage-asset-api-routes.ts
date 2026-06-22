import {
  createFootageAsset,
  getFootageAsset,
  listFootageAssets,
  updateFootageAsset
} from "../footage-asset-service.ts";
import { readJsonBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { sendSuccess } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";

export async function handleFootageAssetApiRoute(request: RequestLike, response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname === "/api/footage-assets" && request.method === "GET") {
    sendSuccess(
      response,
      await listFootageAssets({
        status: url.searchParams.get("status"),
        product_code: url.searchParams.get("product_code"),
        theme: url.searchParams.get("theme"),
        shot_type: url.searchParams.get("shot_type")
      })
    );
    return true;
  }

  if (pathname === "/api/footage-assets" && request.method === "POST") {
    sendSuccess(response, await createFootageAsset(await readJsonBody(request)), 201);
    return true;
  }

  const footageMatch = pathname.match(/^\/api\/footage-assets\/([^/]+)$/);
  if (footageMatch && request.method === "GET") {
    sendSuccess(response, await getFootageAsset(footageMatch[1]));
    return true;
  }

  if (footageMatch && request.method === "POST") {
    sendSuccess(response, await updateFootageAsset(footageMatch[1], await readJsonBody(request)));
    return true;
  }

  return false;
}
