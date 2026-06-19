import {
  activateColor,
  createColor,
  deactivateColor,
  getColor,
  listColors,
  listOffers,
  listPainPoints,
  listProducts,
  listSchoolLevelColorDefaults,
  updateColor,
  upsertSchoolLevelColorDefault
} from "../library-service.ts";
import { readJsonBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { sendSuccess } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";

export async function handleLibraryApiRoute(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  if (pathname === "/api/products" && request.method === "GET") {
    sendSuccess(response, await listProducts());
    return true;
  }

  if (pathname === "/api/offers" && request.method === "GET") {
    sendSuccess(response, await listOffers());
    return true;
  }

  if (pathname === "/api/pain-points" && request.method === "GET") {
    sendSuccess(response, await listPainPoints());
    return true;
  }

  if (pathname === "/api/colors" && request.method === "GET") {
    sendSuccess(response, await listColors());
    return true;
  }

  if (pathname === "/api/colors" && request.method === "POST") {
    sendSuccess(response, await createColor(await readJsonBody(request)), 201);
    return true;
  }

  const colorMatch = pathname.match(/^\/api\/colors\/([^/]+)(?:\/(activate|deactivate))?$/);
  if (colorMatch) {
    const [, id, action] = colorMatch;
    if (request.method === "GET" && !action) {
      sendSuccess(response, await getColor(id));
      return true;
    }
    if (request.method === "POST" && !action) {
      sendSuccess(response, await updateColor(id, await readJsonBody(request)));
      return true;
    }
    if (request.method === "POST" && action === "activate") {
      sendSuccess(response, await activateColor(id));
      return true;
    }
    if (request.method === "POST" && action === "deactivate") {
      sendSuccess(response, await deactivateColor(id));
      return true;
    }
  }

  if (pathname === "/api/school-level-color-defaults" && request.method === "GET") {
    sendSuccess(response, await listSchoolLevelColorDefaults());
    return true;
  }

  const defaultMatch = pathname.match(/^\/api\/school-level-color-defaults\/([^/]+)$/);
  if (defaultMatch && request.method === "POST") {
    const body = await readJsonBody(request);
    sendSuccess(response, await upsertSchoolLevelColorDefault(defaultMatch[1], String(body.color_id || "")));
    return true;
  }

  return false;
}
