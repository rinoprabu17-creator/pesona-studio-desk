import { ManualPublicationPackageError } from "../manual-publication-package-errors.ts";
import {
  archiveManualPublicationPackage,
  createManualPublicationPackageFromPromotion,
  markManualPublicationPackageHold,
  markManualPublicationPackageNeedsRevision,
  markManualPublicationPackagePublishedManually,
  markManualPublicationPackageReady,
  updateManualPublicationPackage,
  updateManualPublicationPackageChannel
} from "../manual-publication-package-service.ts";
import { readFormBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { redirect, sendHtml } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";
import {
  renderManualPublicationPackageCreatePage,
  renderManualPublicationPackageDetailPage,
  renderManualPublicationPackageListPage
} from "../views/manual-publication-package-pages.ts";
import { renderNotFoundPage } from "./library-page-routes.ts";

function isNotFoundLike(error: unknown): boolean {
  return error instanceof ManualPublicationPackageError && (error.statusCode === 400 || error.statusCode === 404);
}

function formToPackageInput(body: Record<string, string>): Record<string, unknown> {
  const selected_channels = ["instagram", "facebook", "tiktok", "youtube"].filter((channel) => body[`channel_${channel}`]);
  const channel_formats: Record<string, string> = {};
  for (const channel of selected_channels) {
    channel_formats[channel] = body[`format_${channel}`] || "standard_video";
  }
  return {
    package_title: body.package_title,
    caption_text: body.caption_text,
    hashtags_text: body.hashtags_text,
    call_to_action: body.call_to_action,
    manual_publish_note: body.manual_publish_note,
    created_by_name: body.created_by_name,
    selected_channels,
    channel_formats
  };
}

async function handlePackageAction(
  request: RequestLike,
  response: ResponseLike,
  packageId: string,
  action: (packageId: string, input: unknown) => Promise<unknown>,
  success: string
): Promise<void> {
  const body = await readFormBody(request);
  try {
    await action(packageId, body);
    redirect(response, `/publication-packages/${encodeURIComponent(packageId)}?success=${encodeURIComponent(success)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Manual publication package gagal.";
    redirect(response, `/publication-packages/${encodeURIComponent(packageId)}?error=${encodeURIComponent(message)}`);
  }
}

export async function handleManualPublicationPackagePagePost(request: RequestLike, response: ResponseLike, pathname: string): Promise<boolean> {
  const createMatch = pathname.match(/^\/approved-videos\/([^/]+)\/publication-package\/create$/);
  if (createMatch && request.method === "POST") {
    const body = await readFormBody(request);
    try {
      const context = await createManualPublicationPackageFromPromotion(createMatch[1], formToPackageInput(body));
      redirect(response, `/publication-packages/${encodeURIComponent(context.package.id)}?success=${encodeURIComponent("Manual publication package dibuat.")}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Manual publication package gagal dibuat.";
      redirect(response, `/approved-videos/${encodeURIComponent(createMatch[1])}/publication-package/new?error=${encodeURIComponent(message)}`);
    }
    return true;
  }

  const updateMatch = pathname.match(/^\/publication-packages\/([^/]+)\/update$/);
  if (updateMatch && request.method === "POST") {
    await handlePackageAction(request, response, updateMatch[1], updateManualPublicationPackage, "Manual publication package diperbarui.");
    return true;
  }

  const readyMatch = pathname.match(/^\/publication-packages\/([^/]+)\/status\/ready$/);
  if (readyMatch && request.method === "POST") {
    await handlePackageAction(request, response, readyMatch[1], markManualPublicationPackageReady, "Package siap manual publish.");
    return true;
  }

  const holdMatch = pathname.match(/^\/publication-packages\/([^/]+)\/status\/hold$/);
  if (holdMatch && request.method === "POST") {
    await handlePackageAction(request, response, holdMatch[1], markManualPublicationPackageHold, "Package ditahan.");
    return true;
  }

  const needsRevisionMatch = pathname.match(/^\/publication-packages\/([^/]+)\/status\/needs-revision$/);
  if (needsRevisionMatch && request.method === "POST") {
    await handlePackageAction(request, response, needsRevisionMatch[1], markManualPublicationPackageNeedsRevision, "Package ditandai perlu revisi.");
    return true;
  }

  const publishedMatch = pathname.match(/^\/publication-packages\/([^/]+)\/status\/published-manually$/);
  if (publishedMatch && request.method === "POST") {
    await handlePackageAction(request, response, publishedMatch[1], markManualPublicationPackagePublishedManually, "Manual publish dicatat.");
    return true;
  }

  const archiveMatch = pathname.match(/^\/publication-packages\/([^/]+)\/status\/archive$/);
  if (archiveMatch && request.method === "POST") {
    await handlePackageAction(request, response, archiveMatch[1], archiveManualPublicationPackage, "Package diarsipkan.");
    return true;
  }

  const channelUpdateMatch = pathname.match(/^\/publication-packages\/([^/]+)\/channels\/([^/]+)\/update$/);
  if (channelUpdateMatch && request.method === "POST") {
    await handlePackageAction(
      request,
      response,
      channelUpdateMatch[1],
      (packageId, input) => updateManualPublicationPackageChannel(packageId, channelUpdateMatch[2], input),
      "Channel package diperbarui."
    );
    return true;
  }

  return false;
}

export async function handleManualPublicationPackagePageGet(response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname === "/publication-packages") {
    sendHtml(response, await renderManualPublicationPackageListPage(url));
    return true;
  }

  const createMatch = pathname.match(/^\/approved-videos\/([^/]+)\/publication-package\/new$/);
  if (createMatch) {
    try {
      sendHtml(response, await renderManualPublicationPackageCreatePage(createMatch[1], url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Manual publication package tidak ditemukan.";
      sendHtml(response, renderNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  const detailMatch = pathname.match(/^\/publication-packages\/([^/]+)$/);
  if (detailMatch) {
    try {
      sendHtml(response, await renderManualPublicationPackageDetailPage(detailMatch[1], url));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Manual publication package tidak ditemukan.";
      sendHtml(response, renderNotFoundPage(message), isNotFoundLike(error) ? 404 : 500);
    }
    return true;
  }

  return false;
}
