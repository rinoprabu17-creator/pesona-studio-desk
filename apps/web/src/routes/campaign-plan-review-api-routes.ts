import {
  approveAllReadyDraftItems,
  approveCampaignPlanDraftItem,
  approveCampaignPlanRun,
  editCampaignPlanDraftItem,
  getCampaignPlanDraftItem,
  getCampaignPlanRunReview,
  rejectCampaignPlanDraftItem,
  rejectCampaignPlanRun
} from "../campaign-plan-review-service.ts";
import { readJsonBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { sendSuccess } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";

export async function handleCampaignPlanReviewApiRoute(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  const runReviewMatch = pathname.match(/^\/api\/campaign-plan-runs\/([^/]+)\/review$/);
  if (runReviewMatch && request.method === "GET") {
    sendSuccess(response, await getCampaignPlanRunReview(runReviewMatch[1]));
    return true;
  }

  const approveAllMatch = pathname.match(/^\/api\/campaign-plan-runs\/([^/]+)\/approve-all$/);
  if (approveAllMatch && request.method === "POST") {
    sendSuccess(response, await approveAllReadyDraftItems(approveAllMatch[1]));
    return true;
  }

  const approveRunMatch = pathname.match(/^\/api\/campaign-plan-runs\/([^/]+)\/approve$/);
  if (approveRunMatch && request.method === "POST") {
    sendSuccess(response, await approveCampaignPlanRun(approveRunMatch[1]));
    return true;
  }

  const rejectRunMatch = pathname.match(/^\/api\/campaign-plan-runs\/([^/]+)\/reject$/);
  if (rejectRunMatch && request.method === "POST") {
    sendSuccess(response, await rejectCampaignPlanRun(rejectRunMatch[1]));
    return true;
  }

  const approveItemMatch = pathname.match(/^\/api\/campaign-plan-draft-items\/([^/]+)\/approve$/);
  if (approveItemMatch && request.method === "POST") {
    sendSuccess(response, await approveCampaignPlanDraftItem(approveItemMatch[1], await readJsonBody(request)));
    return true;
  }

  const rejectItemMatch = pathname.match(/^\/api\/campaign-plan-draft-items\/([^/]+)\/reject$/);
  if (rejectItemMatch && request.method === "POST") {
    sendSuccess(response, await rejectCampaignPlanDraftItem(rejectItemMatch[1], await readJsonBody(request)));
    return true;
  }

  const itemMatch = pathname.match(/^\/api\/campaign-plan-draft-items\/([^/]+)$/);
  if (itemMatch && request.method === "GET") {
    sendSuccess(response, await getCampaignPlanDraftItem(itemMatch[1]));
    return true;
  }

  if (itemMatch && request.method === "POST") {
    sendSuccess(response, await editCampaignPlanDraftItem(itemMatch[1], await readJsonBody(request)));
    return true;
  }

  return false;
}
