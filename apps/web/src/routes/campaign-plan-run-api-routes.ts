import {
  cancelCampaignPlanRun,
  createCampaignPlanRun,
  getCampaignPlanRun,
  listCampaignPlanRuns,
  retryCampaignPlanRun
} from "../campaign-plan-run-service.ts";
import { readJsonBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { sendSuccess } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";

export async function handleCampaignPlanRunApiRoute(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  const campaignRunsMatch = pathname.match(/^\/api\/campaigns\/([^/]+)\/plan-runs$/);
  if (campaignRunsMatch && request.method === "POST") {
    sendSuccess(response, await createCampaignPlanRun(campaignRunsMatch[1], await readJsonBody(request)), 201);
    return true;
  }

  if (campaignRunsMatch && request.method === "GET") {
    sendSuccess(response, await listCampaignPlanRuns(campaignRunsMatch[1]));
    return true;
  }

  const retryMatch = pathname.match(/^\/api\/campaign-plan-runs\/([^/]+)\/retry$/);
  if (retryMatch && request.method === "POST") {
    sendSuccess(response, await retryCampaignPlanRun(retryMatch[1]));
    return true;
  }

  const cancelMatch = pathname.match(/^\/api\/campaign-plan-runs\/([^/]+)\/cancel$/);
  if (cancelMatch && request.method === "POST") {
    sendSuccess(response, await cancelCampaignPlanRun(cancelMatch[1]));
    return true;
  }

  const runMatch = pathname.match(/^\/api\/campaign-plan-runs\/([^/]+)$/);
  if (runMatch && request.method === "GET") {
    sendSuccess(response, await getCampaignPlanRun(runMatch[1]));
    return true;
  }

  return false;
}
