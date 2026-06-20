import { CampaignPlanImportError } from "../campaign-plan-import-errors.ts";
import {
  getCampaignPlanImportPreview,
  importApprovedCampaignPlanRun
} from "../campaign-plan-import-service.ts";
import type { RequestLike } from "../http/request.ts";
import { redirect, sendHtml } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";
import { renderCampaignPlanImportPage } from "../views/campaign-plan-import-pages.ts";
import { renderCampaignNotFoundPage } from "../views/campaign-pages.ts";

function statusCodeFor(error: unknown): number {
  if (error instanceof CampaignPlanImportError) return error.statusCode;
  if (error instanceof Error && "statusCode" in error && typeof (error as any).statusCode === "number") {
    return (error as any).statusCode;
  }
  return 500;
}

export async function handleCampaignPlanImportPageGet(response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  const importMatch = pathname.match(/^\/campaign-plan-runs\/([^/]+)\/import$/);
  if (importMatch) {
    try {
      sendHtml(response, renderCampaignPlanImportPage(await getCampaignPlanImportPreview(importMatch[1]), url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Import run tidak dapat ditampilkan.";
      sendHtml(response, renderCampaignNotFoundPage(message), statusCodeFor(error));
    }
    return true;
  }

  return false;
}

export async function handleCampaignPlanImportPagePost(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  const importMatch = pathname.match(/^\/campaign-plan-runs\/([^/]+)\/import$/);
  if (importMatch && request.method === "POST") {
    try {
      const result = await importApprovedCampaignPlanRun(importMatch[1]);
      const message = result.already_imported ? "Rencana sudah pernah diimpor." : "Rencana berhasil diimpor ke Kalender Konten.";
      redirect(response, `/campaign-plan-runs/${encodeURIComponent(importMatch[1])}/import?success=${encodeURIComponent(message)}`);
    } catch (error) {
      try {
        const preview = await getCampaignPlanImportPreview(importMatch[1]);
        sendHtml(
          response,
          renderCampaignPlanImportPage(preview, new URL(`http://localhost${pathname}`), error instanceof Error ? error.message : "Import gagal."),
          statusCodeFor(error)
        );
      } catch {
        redirect(response, `/campaign-plan-runs/${encodeURIComponent(importMatch[1])}/review?error=${encodeURIComponent(error instanceof Error ? error.message : "Import gagal.")}`);
      }
    }
    return true;
  }

  return false;
}
