import { CampaignError } from "../campaign-errors.ts";
import { ContentItemError } from "../content-item-errors.ts";
import {
  createContentItem,
  getContentItem,
  updateContentItem,
  updateContentItemProductionStatus
} from "../content-item-service.ts";
import {
  addContentItemFootageSelection,
  removeContentItemFootageSelectionForContentItem,
  updateContentItemFootageSelectionForContentItem
} from "../content-item-footage-service.ts";
import {
  addShotPlanStep,
  getOrCreateContentItemScriptPlan,
  removeShotPlanStepForPlan,
  updateContentItemScriptPlan,
  updateShotPlanStepForPlan
} from "../content-item-script-plan-service.ts";
import { readFormBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { redirect, sendHtml } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";
import { LibraryError } from "../library-errors.ts";
import { RenderManifestError } from "../render-manifest-errors.ts";
import {
  createRenderManifestForVideoDraftJob,
  updateRenderManifestForContentItem
} from "../render-manifest-service.ts";
import { RenderPreflightError } from "../render-preflight-errors.ts";
import {
  getRenderPreflightContextForContentItem,
  runRenderPreflightForManifest
} from "../render-preflight-service.ts";
import { RenderAttemptError } from "../render-attempt-errors.ts";
import {
  getControlledRenderContextForContentItem,
  runControlledMultiShotSmokeRenderForManifest,
  runControlledSmokeRenderForManifest
} from "../render-attempt-service.ts";
import { RenderAttemptReviewError } from "../render-attempt-review-errors.ts";
import {
  approveRenderAttempt,
  getRenderAttemptReviewContextForContentItem,
  rejectRenderAttempt
} from "../render-attempt-review-service.ts";
import { RenderApprovedPromotionError } from "../render-approved-promotion-errors.ts";
import {
  getRenderApprovedPromotionContextForContentItem,
  promoteApprovedRenderAttempt
} from "../render-approved-promotion-service.ts";
import { VideoDraftJobError } from "../video-draft-job-errors.ts";
import {
  cancelVideoDraftJobForContentItem,
  createVideoDraftJobForContentItem,
  updateVideoDraftJobForContentItem
} from "../video-draft-job-service.ts";
import {
  renderContentItemDetailPage,
  renderContentItemFootagePage,
  renderContentItemFormPage,
  renderContentItemListPage,
  renderContentItemNotFoundPage,
  renderContentItemRenderPreflightPage,
  renderContentItemRenderAttemptsPage,
  renderContentItemRenderAttemptReviewPage,
  renderContentItemRenderAttemptPromotionPage,
  renderContentItemRenderManifestPage,
  renderContentItemScriptPlanPage,
  renderContentItemVideoDraftPage,
  valuesFromContentItem,
  valuesFromForm
} from "../views/content-item-pages.ts";

function statusCodeFor(error: unknown): number {
  if (
    error instanceof ContentItemError ||
    error instanceof CampaignError ||
    error instanceof LibraryError ||
    error instanceof RenderManifestError ||
    error instanceof RenderPreflightError ||
    error instanceof RenderAttemptError ||
    error instanceof RenderAttemptReviewError ||
    error instanceof RenderApprovedPromotionError ||
    error instanceof VideoDraftJobError
  ) {
    return error.statusCode;
  }
  return 500;
}

function isNotFoundLike(error: unknown): boolean {
  if (
    error instanceof ContentItemError ||
    error instanceof CampaignError ||
    error instanceof LibraryError ||
    error instanceof RenderManifestError ||
    error instanceof RenderPreflightError ||
    error instanceof RenderAttemptError ||
    error instanceof RenderAttemptReviewError ||
    error instanceof RenderApprovedPromotionError ||
    error instanceof VideoDraftJobError
  ) {
    return error.statusCode === 400 || error.statusCode === 404;
  }
  return false;
}

export async function handleContentItemPagePost(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  if (pathname === "/content-items/create" && request.method === "POST") {
    const body = await readFormBody(request);
    const values = valuesFromForm(body);
    try {
      const item = await createContentItem(values);
      redirect(response, `/content-items/${item.id}?success=Konten berhasil dibuat.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Konten gagal dibuat.";
      sendHtml(
        response,
        await renderContentItemFormPage({
          mode: "create",
          action: "/content-items/create",
          values,
          errorMessage: message
        }),
        statusCodeFor(error)
      );
    }
    return true;
  }

  const updateMatch = pathname.match(/^\/content-items\/([^/]+)\/update$/);
  if (updateMatch && request.method === "POST") {
    const body = await readFormBody(request);
    const values = valuesFromForm(body);
    try {
      const item = await updateContentItem(updateMatch[1], values);
      redirect(response, `/content-items/${item.id}?success=Konten berhasil disimpan.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Konten gagal disimpan.";
      let item;
      try {
        item = await getContentItem(updateMatch[1]);
      } catch {
        item = undefined;
      }
      sendHtml(
        response,
        await renderContentItemFormPage({
          mode: "edit",
          action: `/content-items/${encodeURIComponent(updateMatch[1])}/update`,
          values,
          item,
          errorMessage: message
        }),
        statusCodeFor(error)
      );
    }
    return true;
  }

  const statusMatch = pathname.match(/^\/content-items\/([^/]+)\/production-status$/);
  if (statusMatch && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      const item = await updateContentItemProductionStatus(statusMatch[1], body.production_status);
      redirect(response, `/content-items/${item.id}?success=Production status berhasil diubah.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Production status gagal diubah.";
      redirect(response, `/content-items/${encodeURIComponent(statusMatch[1])}?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const addFootageMatch = pathname.match(/^\/content-items\/([^/]+)\/footage\/add$/);
  if (addFootageMatch && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      await addContentItemFootageSelection(addFootageMatch[1], body);
      redirect(response, `/content-items/${encodeURIComponent(addFootageMatch[1])}/footage?success=Footage berhasil dipilih untuk konten.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Footage gagal dipilih.";
      redirect(response, `/content-items/${encodeURIComponent(addFootageMatch[1])}/footage?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const updateFootageMatch = pathname.match(/^\/content-items\/([^/]+)\/footage\/([^/]+)\/update$/);
  if (updateFootageMatch && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      await updateContentItemFootageSelectionForContentItem(updateFootageMatch[1], updateFootageMatch[2], body);
      redirect(response, `/content-items/${encodeURIComponent(updateFootageMatch[1])}/footage?success=Pilihan footage berhasil disimpan.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Pilihan footage gagal disimpan.";
      redirect(response, `/content-items/${encodeURIComponent(updateFootageMatch[1])}/footage?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const removeFootageMatch = pathname.match(/^\/content-items\/([^/]+)\/footage\/([^/]+)\/remove$/);
  if (removeFootageMatch && request.method === "POST") {
    try {
      await removeContentItemFootageSelectionForContentItem(removeFootageMatch[1], removeFootageMatch[2]);
      redirect(response, `/content-items/${encodeURIComponent(removeFootageMatch[1])}/footage?success=Pilihan footage berhasil dilepas.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Pilihan footage gagal dilepas.";
      redirect(response, `/content-items/${encodeURIComponent(removeFootageMatch[1])}/footage?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const saveScriptPlanMatch = pathname.match(/^\/content-items\/([^/]+)\/script-plan\/save$/);
  if (saveScriptPlanMatch && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      const plan = await getOrCreateContentItemScriptPlan(saveScriptPlanMatch[1]);
      await updateContentItemScriptPlan(plan.id, body);
      redirect(response, `/content-items/${encodeURIComponent(saveScriptPlanMatch[1])}/script-plan?success=Script plan berhasil disimpan.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Script plan gagal disimpan.";
      redirect(response, `/content-items/${encodeURIComponent(saveScriptPlanMatch[1])}/script-plan?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const addScriptStepMatch = pathname.match(/^\/content-items\/([^/]+)\/script-plan\/steps\/add$/);
  if (addScriptStepMatch && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      const plan = await getOrCreateContentItemScriptPlan(addScriptStepMatch[1]);
      await addShotPlanStep(plan.id, body);
      redirect(response, `/content-items/${encodeURIComponent(addScriptStepMatch[1])}/script-plan?success=Shot plan step berhasil ditambahkan.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Shot plan step gagal ditambahkan.";
      redirect(response, `/content-items/${encodeURIComponent(addScriptStepMatch[1])}/script-plan?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const updateScriptStepMatch = pathname.match(/^\/content-items\/([^/]+)\/script-plan\/steps\/([^/]+)\/update$/);
  if (updateScriptStepMatch && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      const plan = await getOrCreateContentItemScriptPlan(updateScriptStepMatch[1]);
      await updateShotPlanStepForPlan(plan.id, updateScriptStepMatch[2], body);
      redirect(response, `/content-items/${encodeURIComponent(updateScriptStepMatch[1])}/script-plan?success=Shot plan step berhasil disimpan.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Shot plan step gagal disimpan.";
      redirect(response, `/content-items/${encodeURIComponent(updateScriptStepMatch[1])}/script-plan?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const removeScriptStepMatch = pathname.match(/^\/content-items\/([^/]+)\/script-plan\/steps\/([^/]+)\/remove$/);
  if (removeScriptStepMatch && request.method === "POST") {
    try {
      const plan = await getOrCreateContentItemScriptPlan(removeScriptStepMatch[1]);
      await removeShotPlanStepForPlan(plan.id, removeScriptStepMatch[2]);
      redirect(response, `/content-items/${encodeURIComponent(removeScriptStepMatch[1])}/script-plan?success=Shot plan step berhasil dihapus.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Shot plan step gagal dihapus.";
      redirect(response, `/content-items/${encodeURIComponent(removeScriptStepMatch[1])}/script-plan?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const requestVideoDraftMatch = pathname.match(/^\/content-items\/([^/]+)\/video-draft\/request$/);
  if (requestVideoDraftMatch && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      await createVideoDraftJobForContentItem(requestVideoDraftMatch[1], body);
      redirect(response, `/content-items/${encodeURIComponent(requestVideoDraftMatch[1])}/video-draft?success=Video draft job metadata berhasil dibuat.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Video draft job gagal dibuat.";
      redirect(response, `/content-items/${encodeURIComponent(requestVideoDraftMatch[1])}/video-draft?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const updateVideoDraftMatch = pathname.match(/^\/content-items\/([^/]+)\/video-draft\/([^/]+)\/update$/);
  if (updateVideoDraftMatch && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      await updateVideoDraftJobForContentItem(updateVideoDraftMatch[1], updateVideoDraftMatch[2], body);
      redirect(response, `/content-items/${encodeURIComponent(updateVideoDraftMatch[1])}/video-draft?success=Video draft job metadata berhasil disimpan.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Video draft job gagal disimpan.";
      redirect(response, `/content-items/${encodeURIComponent(updateVideoDraftMatch[1])}/video-draft?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const cancelVideoDraftMatch = pathname.match(/^\/content-items\/([^/]+)\/video-draft\/([^/]+)\/cancel$/);
  if (cancelVideoDraftMatch && request.method === "POST") {
    try {
      await cancelVideoDraftJobForContentItem(cancelVideoDraftMatch[1], cancelVideoDraftMatch[2]);
      redirect(response, `/content-items/${encodeURIComponent(cancelVideoDraftMatch[1])}/video-draft?success=Video draft job dibatalkan.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Video draft job gagal dibatalkan.";
      redirect(response, `/content-items/${encodeURIComponent(cancelVideoDraftMatch[1])}/video-draft?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const createRenderManifestMatch = pathname.match(/^\/content-items\/([^/]+)\/video-draft\/([^/]+)\/manifest\/create$/);
  if (createRenderManifestMatch && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      await createRenderManifestForVideoDraftJob(createRenderManifestMatch[2], body);
      redirect(response, `/content-items/${encodeURIComponent(createRenderManifestMatch[1])}/video-draft/${encodeURIComponent(createRenderManifestMatch[2])}/manifest?success=Render manifest DB-only berhasil dibuat.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Render manifest gagal dibuat.";
      redirect(response, `/content-items/${encodeURIComponent(createRenderManifestMatch[1])}/video-draft/${encodeURIComponent(createRenderManifestMatch[2])}/manifest?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const updateRenderManifestMatch = pathname.match(/^\/content-items\/([^/]+)\/video-draft\/([^/]+)\/manifest\/([^/]+)\/update$/);
  if (updateRenderManifestMatch && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      await updateRenderManifestForContentItem(updateRenderManifestMatch[1], updateRenderManifestMatch[2], updateRenderManifestMatch[3], body);
      redirect(response, `/content-items/${encodeURIComponent(updateRenderManifestMatch[1])}/video-draft/${encodeURIComponent(updateRenderManifestMatch[2])}/manifest?success=Render manifest metadata berhasil disimpan.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Render manifest gagal disimpan.";
      redirect(response, `/content-items/${encodeURIComponent(updateRenderManifestMatch[1])}/video-draft/${encodeURIComponent(updateRenderManifestMatch[2])}/manifest?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const runRenderPreflightMatch = pathname.match(/^\/content-items\/([^/]+)\/video-draft\/([^/]+)\/manifest\/([^/]+)\/preflight\/run$/);
  if (runRenderPreflightMatch && request.method === "POST") {
    try {
      await getRenderPreflightContextForContentItem(runRenderPreflightMatch[1], runRenderPreflightMatch[2], runRenderPreflightMatch[3]);
      await runRenderPreflightForManifest(runRenderPreflightMatch[3]);
      redirect(response, `/content-items/${encodeURIComponent(runRenderPreflightMatch[1])}/video-draft/${encodeURIComponent(runRenderPreflightMatch[2])}/manifest/${encodeURIComponent(runRenderPreflightMatch[3])}/preflight?success=Render preflight DB-only selesai.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Render preflight gagal dijalankan.";
      redirect(response, `/content-items/${encodeURIComponent(runRenderPreflightMatch[1])}/video-draft/${encodeURIComponent(runRenderPreflightMatch[2])}/manifest/${encodeURIComponent(runRenderPreflightMatch[3])}/preflight?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const runSmokeRenderMatch = pathname.match(/^\/content-items\/([^/]+)\/video-draft\/([^/]+)\/manifest\/([^/]+)\/render-attempts\/run-smoke$/);
  if (runSmokeRenderMatch && request.method === "POST") {
    try {
      await getControlledRenderContextForContentItem(runSmokeRenderMatch[1], runSmokeRenderMatch[2], runSmokeRenderMatch[3]);
      const attempt = await runControlledSmokeRenderForManifest(runSmokeRenderMatch[3]);
      const message = attempt.attempt_status === "succeeded"
        ? "Controlled smoke render berhasil."
        : `Controlled smoke render selesai dengan status ${attempt.attempt_status}.`;
      redirect(response, `/content-items/${encodeURIComponent(runSmokeRenderMatch[1])}/video-draft/${encodeURIComponent(runSmokeRenderMatch[2])}/manifest/${encodeURIComponent(runSmokeRenderMatch[3])}/render-attempts?success=${encodeURIComponent(message)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Controlled smoke render gagal.";
      redirect(response, `/content-items/${encodeURIComponent(runSmokeRenderMatch[1])}/video-draft/${encodeURIComponent(runSmokeRenderMatch[2])}/manifest/${encodeURIComponent(runSmokeRenderMatch[3])}/render-attempts?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const runMultiShotSmokeRenderMatch = pathname.match(/^\/content-items\/([^/]+)\/video-draft\/([^/]+)\/manifest\/([^/]+)\/render-attempts\/run-multishot-smoke$/);
  if (runMultiShotSmokeRenderMatch && request.method === "POST") {
    try {
      await getControlledRenderContextForContentItem(runMultiShotSmokeRenderMatch[1], runMultiShotSmokeRenderMatch[2], runMultiShotSmokeRenderMatch[3]);
      const attempt = await runControlledMultiShotSmokeRenderForManifest(runMultiShotSmokeRenderMatch[3]);
      const message = attempt.attempt_status === "succeeded"
        ? "Controlled multi-shot smoke render berhasil."
        : `Controlled multi-shot smoke render selesai dengan status ${attempt.attempt_status}.`;
      redirect(response, `/content-items/${encodeURIComponent(runMultiShotSmokeRenderMatch[1])}/video-draft/${encodeURIComponent(runMultiShotSmokeRenderMatch[2])}/manifest/${encodeURIComponent(runMultiShotSmokeRenderMatch[3])}/render-attempts?success=${encodeURIComponent(message)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Controlled multi-shot smoke render gagal.";
      redirect(response, `/content-items/${encodeURIComponent(runMultiShotSmokeRenderMatch[1])}/video-draft/${encodeURIComponent(runMultiShotSmokeRenderMatch[2])}/manifest/${encodeURIComponent(runMultiShotSmokeRenderMatch[3])}/render-attempts?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const approveRenderAttemptReviewMatch = pathname.match(/^\/content-items\/([^/]+)\/video-draft\/([^/]+)\/manifest\/([^/]+)\/render-attempts\/([^/]+)\/review\/approve$/);
  if (approveRenderAttemptReviewMatch && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      await getRenderAttemptReviewContextForContentItem(
        approveRenderAttemptReviewMatch[1],
        approveRenderAttemptReviewMatch[2],
        approveRenderAttemptReviewMatch[3],
        approveRenderAttemptReviewMatch[4]
      );
      await approveRenderAttempt(approveRenderAttemptReviewMatch[4], body);
      redirect(response, `/content-items/${encodeURIComponent(approveRenderAttemptReviewMatch[1])}/video-draft/${encodeURIComponent(approveRenderAttemptReviewMatch[2])}/manifest/${encodeURIComponent(approveRenderAttemptReviewMatch[3])}/render-attempts/${encodeURIComponent(approveRenderAttemptReviewMatch[4])}/review?success=Render attempt disetujui secara DB-only.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Review render gagal disetujui.";
      redirect(response, `/content-items/${encodeURIComponent(approveRenderAttemptReviewMatch[1])}/video-draft/${encodeURIComponent(approveRenderAttemptReviewMatch[2])}/manifest/${encodeURIComponent(approveRenderAttemptReviewMatch[3])}/render-attempts/${encodeURIComponent(approveRenderAttemptReviewMatch[4])}/review?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const rejectRenderAttemptReviewMatch = pathname.match(/^\/content-items\/([^/]+)\/video-draft\/([^/]+)\/manifest\/([^/]+)\/render-attempts\/([^/]+)\/review\/reject$/);
  if (rejectRenderAttemptReviewMatch && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      await getRenderAttemptReviewContextForContentItem(
        rejectRenderAttemptReviewMatch[1],
        rejectRenderAttemptReviewMatch[2],
        rejectRenderAttemptReviewMatch[3],
        rejectRenderAttemptReviewMatch[4]
      );
      await rejectRenderAttempt(rejectRenderAttemptReviewMatch[4], body);
      redirect(response, `/content-items/${encodeURIComponent(rejectRenderAttemptReviewMatch[1])}/video-draft/${encodeURIComponent(rejectRenderAttemptReviewMatch[2])}/manifest/${encodeURIComponent(rejectRenderAttemptReviewMatch[3])}/render-attempts/${encodeURIComponent(rejectRenderAttemptReviewMatch[4])}/review?success=Render attempt ditolak secara DB-only.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Review render gagal ditolak.";
      redirect(response, `/content-items/${encodeURIComponent(rejectRenderAttemptReviewMatch[1])}/video-draft/${encodeURIComponent(rejectRenderAttemptReviewMatch[2])}/manifest/${encodeURIComponent(rejectRenderAttemptReviewMatch[3])}/render-attempts/${encodeURIComponent(rejectRenderAttemptReviewMatch[4])}/review?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const promoteRenderAttemptMatch = pathname.match(/^\/content-items\/([^/]+)\/video-draft\/([^/]+)\/manifest\/([^/]+)\/render-attempts\/([^/]+)\/promotion\/promote$/);
  if (promoteRenderAttemptMatch && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      await getRenderApprovedPromotionContextForContentItem(
        promoteRenderAttemptMatch[1],
        promoteRenderAttemptMatch[2],
        promoteRenderAttemptMatch[3],
        promoteRenderAttemptMatch[4]
      );
      await promoteApprovedRenderAttempt(promoteRenderAttemptMatch[4], body);
      redirect(response, `/content-items/${encodeURIComponent(promoteRenderAttemptMatch[1])}/video-draft/${encodeURIComponent(promoteRenderAttemptMatch[2])}/manifest/${encodeURIComponent(promoteRenderAttemptMatch[3])}/render-attempts/${encodeURIComponent(promoteRenderAttemptMatch[4])}/promotion?success=Draft render berhasil dipromosikan ke approved smoke.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Promosi draft render gagal.";
      redirect(response, `/content-items/${encodeURIComponent(promoteRenderAttemptMatch[1])}/video-draft/${encodeURIComponent(promoteRenderAttemptMatch[2])}/manifest/${encodeURIComponent(promoteRenderAttemptMatch[3])}/render-attempts/${encodeURIComponent(promoteRenderAttemptMatch[4])}/promotion?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  return false;
}

export async function handleContentItemPageGet(response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname === "/content-items") {
    sendHtml(response, await renderContentItemListPage(url));
    return true;
  }

  if (pathname === "/content-items/new") {
    sendHtml(
      response,
      await renderContentItemFormPage({
        mode: "create",
        action: "/content-items/create",
        campaignIdFromQuery: url.searchParams.get("campaign_id")
      })
    );
    return true;
  }

  const editMatch = pathname.match(/^\/content-items\/([^/]+)\/edit$/);
  if (editMatch) {
    try {
      const item = await getContentItem(editMatch[1]);
      sendHtml(
        response,
        await renderContentItemFormPage({
          mode: "edit",
          action: `/content-items/${encodeURIComponent(item.id)}/update`,
          values: valuesFromContentItem(item),
          item
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Konten tidak ditemukan.";
      sendHtml(response, renderContentItemNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  const footageMatch = pathname.match(/^\/content-items\/([^/]+)\/footage$/);
  if (footageMatch) {
    try {
      const item = await getContentItem(footageMatch[1]);
      sendHtml(response, await renderContentItemFootagePage(item, url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Konten tidak ditemukan.";
      sendHtml(response, renderContentItemNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  const scriptPlanMatch = pathname.match(/^\/content-items\/([^/]+)\/script-plan$/);
  if (scriptPlanMatch) {
    try {
      const item = await getContentItem(scriptPlanMatch[1]);
      sendHtml(response, await renderContentItemScriptPlanPage(item, url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Konten tidak ditemukan.";
      sendHtml(response, renderContentItemNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  const videoDraftMatch = pathname.match(/^\/content-items\/([^/]+)\/video-draft$/);
  if (videoDraftMatch) {
    try {
      const item = await getContentItem(videoDraftMatch[1]);
      sendHtml(response, await renderContentItemVideoDraftPage(item, url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Konten tidak ditemukan.";
      sendHtml(response, renderContentItemNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  const renderManifestMatch = pathname.match(/^\/content-items\/([^/]+)\/video-draft\/([^/]+)\/manifest$/);
  if (renderManifestMatch) {
    try {
      const item = await getContentItem(renderManifestMatch[1]);
      sendHtml(response, await renderContentItemRenderManifestPage(item, renderManifestMatch[2], url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Render manifest tidak ditemukan.";
      sendHtml(response, renderContentItemNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  const renderPreflightMatch = pathname.match(/^\/content-items\/([^/]+)\/video-draft\/([^/]+)\/manifest\/([^/]+)\/preflight$/);
  if (renderPreflightMatch) {
    try {
      const item = await getContentItem(renderPreflightMatch[1]);
      sendHtml(response, await renderContentItemRenderPreflightPage(item, renderPreflightMatch[2], renderPreflightMatch[3], url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Render preflight tidak ditemukan.";
      sendHtml(response, renderContentItemNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  const renderAttemptsMatch = pathname.match(/^\/content-items\/([^/]+)\/video-draft\/([^/]+)\/manifest\/([^/]+)\/render-attempts$/);
  if (renderAttemptsMatch) {
    try {
      const item = await getContentItem(renderAttemptsMatch[1]);
      sendHtml(response, await renderContentItemRenderAttemptsPage(item, renderAttemptsMatch[2], renderAttemptsMatch[3], url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Render attempts tidak ditemukan.";
      sendHtml(response, renderContentItemNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  const renderAttemptReviewMatch = pathname.match(/^\/content-items\/([^/]+)\/video-draft\/([^/]+)\/manifest\/([^/]+)\/render-attempts\/([^/]+)\/review$/);
  if (renderAttemptReviewMatch) {
    try {
      const item = await getContentItem(renderAttemptReviewMatch[1]);
      sendHtml(response, await renderContentItemRenderAttemptReviewPage(item, renderAttemptReviewMatch[2], renderAttemptReviewMatch[3], renderAttemptReviewMatch[4], url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Review render attempt tidak ditemukan.";
      sendHtml(response, renderContentItemNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  const renderAttemptPromotionMatch = pathname.match(/^\/content-items\/([^/]+)\/video-draft\/([^/]+)\/manifest\/([^/]+)\/render-attempts\/([^/]+)\/promotion$/);
  if (renderAttemptPromotionMatch) {
    try {
      const item = await getContentItem(renderAttemptPromotionMatch[1]);
      sendHtml(response, await renderContentItemRenderAttemptPromotionPage(item, renderAttemptPromotionMatch[2], renderAttemptPromotionMatch[3], renderAttemptPromotionMatch[4], url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Promosi render attempt tidak ditemukan.";
      sendHtml(response, renderContentItemNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  const detailMatch = pathname.match(/^\/content-items\/([^/]+)$/);
  if (detailMatch) {
    try {
      const item = await getContentItem(detailMatch[1]);
      sendHtml(response, await renderContentItemDetailPage(item, url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Konten tidak ditemukan.";
      sendHtml(response, renderContentItemNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  return false;
}
