import {
  archiveManualPublicationPackage,
  createManualPublicationPackageFromPromotion,
  getManualPublicationPackageContext,
  listManualPublicationPackages,
  markManualPublicationPackageHold,
  markManualPublicationPackageNeedsRevision,
  markManualPublicationPackagePublishedManually,
  markManualPublicationPackageReady,
  updateManualPublicationPackage,
  updateManualPublicationPackageChannel
} from "../manual-publication-package-service.ts";
import { readJsonBody } from "../http/request.ts";
import type { RequestLike } from "../http/request.ts";
import { sendSuccess } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";

export async function handleManualPublicationPackageApiRoute(request: RequestLike, response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname === "/api/publication-packages" && request.method === "GET") {
    sendSuccess(response, await listManualPublicationPackages({
      package_status: url.searchParams.get("package_status"),
      channel: url.searchParams.get("channel"),
      q: url.searchParams.get("q"),
      content_item_id: url.searchParams.get("content_item_id")
    }));
    return true;
  }

  const createMatch = pathname.match(/^\/api\/approved-videos\/([^/]+)\/publication-package\/create$/);
  if (createMatch && request.method === "POST") {
    sendSuccess(response, await createManualPublicationPackageFromPromotion(createMatch[1], await readJsonBody(request)), 201);
    return true;
  }

  const updateMatch = pathname.match(/^\/api\/publication-packages\/([^/]+)\/update$/);
  if (updateMatch && request.method === "POST") {
    sendSuccess(response, await updateManualPublicationPackage(updateMatch[1], await readJsonBody(request)));
    return true;
  }

  const readyMatch = pathname.match(/^\/api\/publication-packages\/([^/]+)\/status\/ready$/);
  if (readyMatch && request.method === "POST") {
    sendSuccess(response, await markManualPublicationPackageReady(readyMatch[1], await readJsonBody(request)));
    return true;
  }

  const holdMatch = pathname.match(/^\/api\/publication-packages\/([^/]+)\/status\/hold$/);
  if (holdMatch && request.method === "POST") {
    sendSuccess(response, await markManualPublicationPackageHold(holdMatch[1], await readJsonBody(request)));
    return true;
  }

  const needsRevisionMatch = pathname.match(/^\/api\/publication-packages\/([^/]+)\/status\/needs-revision$/);
  if (needsRevisionMatch && request.method === "POST") {
    sendSuccess(response, await markManualPublicationPackageNeedsRevision(needsRevisionMatch[1], await readJsonBody(request)));
    return true;
  }

  const publishedMatch = pathname.match(/^\/api\/publication-packages\/([^/]+)\/status\/published-manually$/);
  if (publishedMatch && request.method === "POST") {
    sendSuccess(response, await markManualPublicationPackagePublishedManually(publishedMatch[1], await readJsonBody(request)));
    return true;
  }

  const archiveMatch = pathname.match(/^\/api\/publication-packages\/([^/]+)\/status\/archive$/);
  if (archiveMatch && request.method === "POST") {
    sendSuccess(response, await archiveManualPublicationPackage(archiveMatch[1], await readJsonBody(request)));
    return true;
  }

  const channelUpdateMatch = pathname.match(/^\/api\/publication-packages\/([^/]+)\/channels\/([^/]+)\/update$/);
  if (channelUpdateMatch && request.method === "POST") {
    sendSuccess(response, await updateManualPublicationPackageChannel(channelUpdateMatch[1], channelUpdateMatch[2], await readJsonBody(request)));
    return true;
  }

  const detailMatch = pathname.match(/^\/api\/publication-packages\/([^/]+)$/);
  if (detailMatch && request.method === "GET") {
    sendSuccess(response, await getManualPublicationPackageContext(detailMatch[1]));
    return true;
  }

  return false;
}
