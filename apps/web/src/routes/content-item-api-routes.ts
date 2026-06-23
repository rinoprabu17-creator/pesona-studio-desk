import {
  createContentItem,
  getContentItem,
  listContentItems,
  updateContentItem,
  updateContentItemProductionStatus
} from "../content-item-service.ts";
import {
  addContentItemFootageSelection,
  listContentItemFootageSelections,
  removeContentItemFootageSelection,
  updateContentItemFootageSelection
} from "../content-item-footage-service.ts";
import {
  addShotPlanStep,
  getOrCreateContentItemScriptPlan,
  listShotPlanSteps,
  removeShotPlanStep,
  updateContentItemScriptPlan,
  updateShotPlanStep
} from "../content-item-script-plan-service.ts";
import { readJsonBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { sendSuccess } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";
import {
  cancelVideoDraftJob,
  createVideoDraftJobForContentItem,
  getVideoDraftJobForContentItem,
  updateVideoDraftJob
} from "../video-draft-job-service.ts";
import {
  createRenderManifestForVideoDraftJob,
  getRenderManifestForVideoDraftJob,
  listRenderManifestItems,
  updateRenderManifest
} from "../render-manifest-service.ts";

export async function handleContentItemApiRoute(request: RequestLike, response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname === "/api/content-items" && request.method === "GET") {
    sendSuccess(
      response,
      await listContentItems({
        campaign_id: url.searchParams.get("campaign_id"),
        production_status: url.searchParams.get("production_status")
      })
    );
    return true;
  }

  if (pathname === "/api/content-items" && request.method === "POST") {
    sendSuccess(response, await createContentItem(await readJsonBody(request)), 201);
    return true;
  }

  const statusMatch = pathname.match(/^\/api\/content-items\/([^/]+)\/production-status$/);
  if (statusMatch && request.method === "POST") {
    const body = await readJsonBody(request);
    sendSuccess(response, await updateContentItemProductionStatus(statusMatch[1], body.production_status));
    return true;
  }

  const footageMatch = pathname.match(/^\/api\/content-items\/([^/]+)\/footage$/);
  if (footageMatch && request.method === "GET") {
    sendSuccess(response, await listContentItemFootageSelections(footageMatch[1]));
    return true;
  }

  if (footageMatch && request.method === "POST") {
    sendSuccess(response, await addContentItemFootageSelection(footageMatch[1], await readJsonBody(request)), 201);
    return true;
  }

  const scriptPlanMatch = pathname.match(/^\/api\/content-items\/([^/]+)\/script-plan$/);
  if (scriptPlanMatch && request.method === "GET") {
    const plan = await getOrCreateContentItemScriptPlan(scriptPlanMatch[1]);
    const steps = await listShotPlanSteps(plan.id);
    sendSuccess(response, { plan, steps });
    return true;
  }

  if (scriptPlanMatch && request.method === "POST") {
    const plan = await getOrCreateContentItemScriptPlan(scriptPlanMatch[1], await readJsonBody(request));
    sendSuccess(response, plan, 201);
    return true;
  }

  const videoDraftMatch = pathname.match(/^\/api\/content-items\/([^/]+)\/video-draft$/);
  if (videoDraftMatch && request.method === "GET") {
    sendSuccess(response, await getVideoDraftJobForContentItem(videoDraftMatch[1]));
    return true;
  }

  if (videoDraftMatch && request.method === "POST") {
    sendSuccess(response, await createVideoDraftJobForContentItem(videoDraftMatch[1], await readJsonBody(request)), 201);
    return true;
  }

  const scriptPlanUpdateMatch = pathname.match(/^\/api\/script-plans\/([^/]+)$/);
  if (scriptPlanUpdateMatch && request.method === "POST") {
    sendSuccess(response, await updateContentItemScriptPlan(scriptPlanUpdateMatch[1], await readJsonBody(request)));
    return true;
  }

  const scriptPlanStepAddMatch = pathname.match(/^\/api\/script-plans\/([^/]+)\/steps$/);
  if (scriptPlanStepAddMatch && request.method === "POST") {
    sendSuccess(response, await addShotPlanStep(scriptPlanStepAddMatch[1], await readJsonBody(request)), 201);
    return true;
  }

  const scriptPlanStepMatch = pathname.match(/^\/api\/script-plan-steps\/([^/]+)$/);
  if (scriptPlanStepMatch && request.method === "POST") {
    sendSuccess(response, await updateShotPlanStep(scriptPlanStepMatch[1], await readJsonBody(request)));
    return true;
  }

  const removeScriptPlanStepMatch = pathname.match(/^\/api\/script-plan-steps\/([^/]+)\/remove$/);
  if (removeScriptPlanStepMatch && request.method === "POST") {
    sendSuccess(response, await removeShotPlanStep(removeScriptPlanStepMatch[1]));
    return true;
  }

  const videoDraftJobMatch = pathname.match(/^\/api\/video-draft-jobs\/([^/]+)$/);
  if (videoDraftJobMatch && request.method === "POST") {
    sendSuccess(response, await updateVideoDraftJob(videoDraftJobMatch[1], await readJsonBody(request)));
    return true;
  }

  const videoDraftManifestMatch = pathname.match(/^\/api\/video-draft-jobs\/([^/]+)\/render-manifest$/);
  if (videoDraftManifestMatch && request.method === "GET") {
    const manifest = await getRenderManifestForVideoDraftJob(videoDraftManifestMatch[1]);
    const items = manifest ? await listRenderManifestItems(manifest.id) : [];
    sendSuccess(response, { manifest, items });
    return true;
  }

  if (videoDraftManifestMatch && request.method === "POST") {
    sendSuccess(response, await createRenderManifestForVideoDraftJob(videoDraftManifestMatch[1], await readJsonBody(request)), 201);
    return true;
  }

  const renderManifestMatch = pathname.match(/^\/api\/render-manifests\/([^/]+)$/);
  if (renderManifestMatch && request.method === "POST") {
    sendSuccess(response, await updateRenderManifest(renderManifestMatch[1], await readJsonBody(request)));
    return true;
  }

  const cancelVideoDraftJobMatch = pathname.match(/^\/api\/video-draft-jobs\/([^/]+)\/cancel$/);
  if (cancelVideoDraftJobMatch && request.method === "POST") {
    sendSuccess(response, await cancelVideoDraftJob(cancelVideoDraftJobMatch[1]));
    return true;
  }

  const selectionMatch = pathname.match(/^\/api\/content-item-footage\/([^/]+)$/);
  if (selectionMatch && request.method === "POST") {
    sendSuccess(response, await updateContentItemFootageSelection(selectionMatch[1], await readJsonBody(request)));
    return true;
  }

  const removeSelectionMatch = pathname.match(/^\/api\/content-item-footage\/([^/]+)\/remove$/);
  if (removeSelectionMatch && request.method === "POST") {
    sendSuccess(response, await removeContentItemFootageSelection(removeSelectionMatch[1]));
    return true;
  }

  const contentItemMatch = pathname.match(/^\/api\/content-items\/([^/]+)$/);
  if (contentItemMatch && request.method === "GET") {
    sendSuccess(response, await getContentItem(contentItemMatch[1]));
    return true;
  }

  if (contentItemMatch && request.method === "POST") {
    sendSuccess(response, await updateContentItem(contentItemMatch[1], await readJsonBody(request)));
    return true;
  }

  return false;
}
