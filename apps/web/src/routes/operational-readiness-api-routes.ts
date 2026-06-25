import {
  getOperationalReadinessDashboard,
  getOperationalReadinessPipeline,
  getOperationalReadinessSummary
} from "../operational-readiness-service.ts";
import type { RequestLike } from "../http/request.ts";
import { sendSuccess } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";

function filtersFromUrl(url: URL): Record<string, string | null> {
  return {
    limit: url.searchParams.get("limit")
  };
}

export async function handleOperationalReadinessApiRoute(
  request: RequestLike,
  response: ResponseLike,
  pathname: string,
  url: URL
): Promise<boolean> {
  if (pathname === "/api/operational-readiness" && request.method === "GET") {
    sendSuccess(response, await getOperationalReadinessDashboard(filtersFromUrl(url)));
    return true;
  }

  if (pathname === "/api/operational-readiness/summary" && request.method === "GET") {
    sendSuccess(response, await getOperationalReadinessSummary());
    return true;
  }

  if (pathname === "/api/operational-readiness/pipeline" && request.method === "GET") {
    sendSuccess(response, await getOperationalReadinessPipeline());
    return true;
  }

  return false;
}
