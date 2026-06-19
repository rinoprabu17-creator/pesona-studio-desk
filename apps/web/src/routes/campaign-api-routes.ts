import { createCampaign, getCampaign, listCampaigns, updateCampaign } from "../campaign-service.ts";
import { readJsonBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { sendSuccess } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";

export async function handleCampaignApiRoute(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  if (pathname === "/api/campaigns" && request.method === "GET") {
    sendSuccess(response, await listCampaigns());
    return true;
  }

  if (pathname === "/api/campaigns" && request.method === "POST") {
    sendSuccess(response, await createCampaign(await readJsonBody(request)), 201);
    return true;
  }

  const campaignMatch = pathname.match(/^\/api\/campaigns\/([^/]+)$/);
  if (campaignMatch && request.method === "GET") {
    sendSuccess(response, await getCampaign(campaignMatch[1]));
    return true;
  }

  if (campaignMatch && request.method === "POST") {
    sendSuccess(response, await updateCampaign(campaignMatch[1], await readJsonBody(request)));
    return true;
  }

  return false;
}
