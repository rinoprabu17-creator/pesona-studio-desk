import { CampaignPlanReviewError } from "../campaign-plan-review-errors.ts";
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
import { readFormBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { redirect, sendHtml } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";
import {
  valuesFromDraftDecisionForm,
  valuesFromDraftEditForm
} from "../validation/campaign-plan-review-validation.ts";
import {
  renderCampaignPlanDraftEditPage,
  renderCampaignPlanReviewPage
} from "../views/campaign-plan-review-pages.ts";
import { renderCampaignNotFoundPage } from "../views/campaign-pages.ts";

function statusCodeFor(error: unknown): number {
  if (error instanceof CampaignPlanReviewError) return error.statusCode;
  if (error instanceof Error && "statusCode" in error && typeof (error as any).statusCode === "number") {
    return (error as any).statusCode;
  }
  return 500;
}

export async function handleCampaignPlanReviewPageGet(response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  const reviewMatch = pathname.match(/^\/campaign-plan-runs\/([^/]+)\/review$/);
  if (reviewMatch) {
    try {
      sendHtml(response, renderCampaignPlanReviewPage(await getCampaignPlanRunReview(reviewMatch[1]), url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Review run tidak ditemukan.";
      sendHtml(response, renderCampaignNotFoundPage(message), statusCodeFor(error));
    }
    return true;
  }

  const editMatch = pathname.match(/^\/campaign-plan-draft-items\/([^/]+)\/edit$/);
  if (editMatch) {
    try {
      const item = await getCampaignPlanDraftItem(editMatch[1]);
      sendHtml(response, renderCampaignPlanDraftEditPage({
        item,
        action: `/campaign-plan-draft-items/${encodeURIComponent(item.id)}/edit`
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Draft item tidak ditemukan.";
      sendHtml(response, renderCampaignNotFoundPage(message), statusCodeFor(error));
    }
    return true;
  }

  return false;
}

export async function handleCampaignPlanReviewPagePost(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  const editMatch = pathname.match(/^\/campaign-plan-draft-items\/([^/]+)\/edit$/);
  if (editMatch && request.method === "POST") {
    const body = await readFormBody(request);
    const values = valuesFromDraftEditForm(body);
    try {
      const review = await editCampaignPlanDraftItem(editMatch[1], values);
      redirect(response, `/campaign-plan-runs/${encodeURIComponent(review.id)}/review?success=${encodeURIComponent("Draft disimpan.")}#item-${encodeURIComponent(editMatch[1])}`);
    } catch (error) {
      try {
        const item = await getCampaignPlanDraftItem(editMatch[1]);
        sendHtml(
          response,
          renderCampaignPlanDraftEditPage({
            item,
            action: `/campaign-plan-draft-items/${encodeURIComponent(editMatch[1])}/edit`,
            values,
            errorMessage: error instanceof Error ? error.message : "Draft gagal disimpan."
          }),
          statusCodeFor(error)
        );
      } catch {
        redirect(response, `/campaigns?error=${encodeURIComponent(error instanceof Error ? error.message : "Draft gagal disimpan.")}`);
      }
    }
    return true;
  }

  const approveItemMatch = pathname.match(/^\/campaign-plan-draft-items\/([^/]+)\/approve$/);
  if (approveItemMatch && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      const review = await approveCampaignPlanDraftItem(approveItemMatch[1], valuesFromDraftDecisionForm(body));
      redirect(response, `/campaign-plan-runs/${encodeURIComponent(review.id)}/review?success=${encodeURIComponent("Draft disetujui.")}#item-${encodeURIComponent(approveItemMatch[1])}`);
    } catch (error) {
      const item = await getCampaignPlanDraftItem(approveItemMatch[1]).catch(() => null);
      const runId = item?.run_id || "";
      redirect(response, `/campaign-plan-runs/${encodeURIComponent(runId)}/review?error=${encodeURIComponent(error instanceof Error ? error.message : "Draft gagal disetujui.")}`);
    }
    return true;
  }

  const rejectItemMatch = pathname.match(/^\/campaign-plan-draft-items\/([^/]+)\/reject$/);
  if (rejectItemMatch && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      const review = await rejectCampaignPlanDraftItem(rejectItemMatch[1], valuesFromDraftDecisionForm(body));
      redirect(response, `/campaign-plan-runs/${encodeURIComponent(review.id)}/review?success=${encodeURIComponent("Draft ditolak.")}#item-${encodeURIComponent(rejectItemMatch[1])}`);
    } catch (error) {
      const item = await getCampaignPlanDraftItem(rejectItemMatch[1]).catch(() => null);
      const runId = item?.run_id || "";
      redirect(response, `/campaign-plan-runs/${encodeURIComponent(runId)}/review?error=${encodeURIComponent(error instanceof Error ? error.message : "Draft gagal ditolak.")}`);
    }
    return true;
  }

  const approveAllMatch = pathname.match(/^\/campaign-plan-runs\/([^/]+)\/approve-all$/);
  if (approveAllMatch && request.method === "POST") {
    try {
      const summary = await approveAllReadyDraftItems(approveAllMatch[1]);
      redirect(response, `/campaign-plan-runs/${encodeURIComponent(approveAllMatch[1])}/review?success=${encodeURIComponent(`Approve all selesai: ${summary.approved_count} approved, ${summary.blocked_count} blocked.`)}`);
    } catch (error) {
      redirect(response, `/campaign-plan-runs/${encodeURIComponent(approveAllMatch[1])}/review?error=${encodeURIComponent(error instanceof Error ? error.message : "Approve all gagal.")}`);
    }
    return true;
  }

  const approveRunMatch = pathname.match(/^\/campaign-plan-runs\/([^/]+)\/approve$/);
  if (approveRunMatch && request.method === "POST") {
    try {
      await approveCampaignPlanRun(approveRunMatch[1]);
      redirect(response, `/campaign-plan-runs/${encodeURIComponent(approveRunMatch[1])}/review?success=${encodeURIComponent("Rencana telah disetujui dan siap diimpor pada Phase 2A.4.")}`);
    } catch (error) {
      redirect(response, `/campaign-plan-runs/${encodeURIComponent(approveRunMatch[1])}/review?error=${encodeURIComponent(error instanceof Error ? error.message : "Rencana gagal disetujui.")}`);
    }
    return true;
  }

  const rejectRunMatch = pathname.match(/^\/campaign-plan-runs\/([^/]+)\/reject$/);
  if (rejectRunMatch && request.method === "POST") {
    try {
      await rejectCampaignPlanRun(rejectRunMatch[1]);
      redirect(response, `/campaign-plan-runs/${encodeURIComponent(rejectRunMatch[1])}/review?success=${encodeURIComponent("Rencana telah ditolak.")}`);
    } catch (error) {
      redirect(response, `/campaign-plan-runs/${encodeURIComponent(rejectRunMatch[1])}/review?error=${encodeURIComponent(error instanceof Error ? error.message : "Rencana gagal ditolak.")}`);
    }
    return true;
  }

  return false;
}
