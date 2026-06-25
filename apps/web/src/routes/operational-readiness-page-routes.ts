import type { ResponseLike } from "../http/response.ts";
import { sendHtml } from "../http/response.ts";
import { renderOperationalReadinessPage } from "../views/operational-readiness-pages.ts";

export async function handleOperationalReadinessPageGet(response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname === "/operational-readiness") {
    sendHtml(response, await renderOperationalReadinessPage(url));
    return true;
  }

  return false;
}
