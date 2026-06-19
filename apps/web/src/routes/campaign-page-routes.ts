import { CampaignError } from "../campaign-errors.ts";
import { createCampaign, getCampaign, updateCampaign } from "../campaign-service.ts";
import { readFormBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { redirect, sendHtml } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";
import { LibraryError } from "../library-errors.ts";
import {
  renderCampaignDetailPage,
  renderCampaignFormPage,
  renderCampaignListPage,
  renderCampaignNotFoundPage,
  valuesFromCampaign,
  valuesFromForm
} from "../views/campaign-pages.ts";

function isNotFoundLike(error: unknown): boolean {
  return (
    error instanceof CampaignError ||
    error instanceof LibraryError
  );
}

export async function handleCampaignPagePost(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  if (pathname === "/campaigns/create" && request.method === "POST") {
    const body = await readFormBody(request);
    const values = valuesFromForm(body);
    try {
      const campaign = await createCampaign(values);
      redirect(response, `/campaigns/${campaign.id}?success=Campaign berhasil dibuat.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Campaign gagal dibuat.";
      sendHtml(
        response,
        await renderCampaignFormPage({
          mode: "create",
          action: "/campaigns/create",
          values,
          errorMessage: message
        }),
        error instanceof CampaignError || error instanceof LibraryError ? error.statusCode : 500
      );
    }
    return true;
  }

  const updateMatch = pathname.match(/^\/campaigns\/([^/]+)\/update$/);
  if (updateMatch && request.method === "POST") {
    const body = await readFormBody(request);
    const values = valuesFromForm(body);
    try {
      const campaign = await updateCampaign(updateMatch[1], values);
      redirect(response, `/campaigns/${campaign.id}?success=Campaign berhasil disimpan.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Campaign gagal disimpan.";
      sendHtml(
        response,
        await renderCampaignFormPage({
          mode: "edit",
          action: `/campaigns/${encodeURIComponent(updateMatch[1])}/update`,
          values,
          errorMessage: message
        }),
        error instanceof CampaignError || error instanceof LibraryError ? error.statusCode : 500
      );
    }
    return true;
  }

  return false;
}

export async function handleCampaignPageGet(response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname === "/campaigns") {
    sendHtml(response, await renderCampaignListPage(url));
    return true;
  }

  if (pathname === "/campaigns/new") {
    sendHtml(
      response,
      await renderCampaignFormPage({
        mode: "create",
        action: "/campaigns/create",
        values: { status: "draft" }
      })
    );
    return true;
  }

  const editMatch = pathname.match(/^\/campaigns\/([^/]+)\/edit$/);
  if (editMatch) {
    try {
      const campaign = await getCampaign(editMatch[1]);
      sendHtml(
        response,
        await renderCampaignFormPage({
          mode: "edit",
          action: `/campaigns/${encodeURIComponent(campaign.id)}/update`,
          values: valuesFromCampaign(campaign)
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Campaign tidak ditemukan.";
      sendHtml(response, renderCampaignNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  const detailMatch = pathname.match(/^\/campaigns\/([^/]+)$/);
  if (detailMatch) {
    try {
      const campaign = await getCampaign(detailMatch[1]);
      sendHtml(response, renderCampaignDetailPage(campaign));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Campaign tidak ditemukan.";
      sendHtml(response, renderCampaignNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  return false;
}
