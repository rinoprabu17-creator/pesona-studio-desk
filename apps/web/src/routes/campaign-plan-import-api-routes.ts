import { importApprovedCampaignPlanRun } from "../campaign-plan-import-service.ts";
import type { RequestLike } from "../http/request.ts";
import { sendSuccess } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";

export async function handleCampaignPlanImportApiRoute(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  const importMatch = pathname.match(/^\/api\/campaign-plan-runs\/([^/]+)\/import$/);
  if (importMatch && request.method === "POST") {
    sendSuccess(response, await importApprovedCampaignPlanRun(importMatch[1]));
    return true;
  }

  return false;
}
