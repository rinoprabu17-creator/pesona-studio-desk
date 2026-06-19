import { CampaignError } from "../campaign-errors.ts";
import { CampaignPlanRunError } from "../campaign-plan-run-errors.ts";
import { getCampaign } from "../campaign-service.ts";
import {
  cancelCampaignPlanRun,
  createCampaignPlanRun,
  getCampaignPlanRun,
  retryCampaignPlanRun
} from "../campaign-plan-run-service.ts";
import { readFormBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { redirect, sendHtml } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";
import { LibraryError } from "../library-errors.ts";
import { valuesFromPlanRunForm } from "../validation/campaign-plan-run-validation.ts";
import {
  renderCampaignPlanRunDetailPage,
  renderGenerateCampaignPlanPage
} from "../views/campaign-plan-run-pages.ts";
import { renderCampaignNotFoundPage } from "../views/campaign-pages.ts";

function statusCodeFor(error: unknown): number {
  if (
    error instanceof CampaignPlanRunError ||
    error instanceof CampaignError ||
    error instanceof LibraryError
  ) {
    return error.statusCode;
  }
  return 500;
}

export async function handleCampaignPlanRunPagePost(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  const createMatch = pathname.match(/^\/campaigns\/([^/]+)\/plan-runs\/create$/);
  if (createMatch && request.method === "POST") {
    const body = await readFormBody(request);
    const values = valuesFromPlanRunForm(body);
    try {
      const run = await createCampaignPlanRun(createMatch[1], values);
      redirect(response, `/campaign-plan-runs/${run.id}?success=Generation run dibuat.`);
    } catch (error) {
      const campaign = await getCampaign(createMatch[1]);
      const message = error instanceof Error ? error.message : "Generation run gagal dibuat.";
      sendHtml(
        response,
        renderGenerateCampaignPlanPage({
          campaign,
          action: `/campaigns/${encodeURIComponent(createMatch[1])}/plan-runs/create`,
          values,
          errorMessage: message
        }),
        statusCodeFor(error)
      );
    }
    return true;
  }

  const retryMatch = pathname.match(/^\/campaign-plan-runs\/([^/]+)\/retry$/);
  if (retryMatch && request.method === "POST") {
    try {
      const run = await retryCampaignPlanRun(retryMatch[1]);
      redirect(response, `/campaign-plan-runs/${run.id}?success=Generation run diretry.`);
    } catch (error) {
      redirect(response, `/campaign-plan-runs/${encodeURIComponent(retryMatch[1])}?error=${encodeURIComponent(error instanceof Error ? error.message : "Retry gagal.")}`);
    }
    return true;
  }

  const cancelMatch = pathname.match(/^\/campaign-plan-runs\/([^/]+)\/cancel$/);
  if (cancelMatch && request.method === "POST") {
    try {
      const run = await cancelCampaignPlanRun(cancelMatch[1]);
      redirect(response, `/campaign-plan-runs/${run.id}?success=Generation run dibatalkan.`);
    } catch (error) {
      redirect(response, `/campaign-plan-runs/${encodeURIComponent(cancelMatch[1])}?error=${encodeURIComponent(error instanceof Error ? error.message : "Cancel gagal.")}`);
    }
    return true;
  }

  return false;
}

export async function handleCampaignPlanRunPageGet(response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  const newMatch = pathname.match(/^\/campaigns\/([^/]+)\/plan-runs\/new$/);
  if (newMatch) {
    try {
      const campaign = await getCampaign(newMatch[1]);
      sendHtml(
        response,
        renderGenerateCampaignPlanPage({
          campaign,
          action: `/campaigns/${encodeURIComponent(campaign.id)}/plan-runs/create`
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Campaign tidak ditemukan.";
      sendHtml(response, renderCampaignNotFoundPage(message), statusCodeFor(error));
    }
    return true;
  }

  const detailMatch = pathname.match(/^\/campaign-plan-runs\/([^/]+)$/);
  if (detailMatch) {
    try {
      const run = await getCampaignPlanRun(detailMatch[1]);
      sendHtml(response, renderCampaignPlanRunDetailPage(run, url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation run tidak ditemukan.";
      sendHtml(response, renderCampaignNotFoundPage(message), statusCodeFor(error));
    }
    return true;
  }

  return false;
}
