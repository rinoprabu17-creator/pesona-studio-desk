import { getContentCalendar } from "../content-calendar-service.ts";
import type { RequestLike } from "../http/request.ts";
import { sendSuccess } from "../http/response.ts";
import type { ResponseLike } from "../http/response.ts";

export async function handleContentCalendarApiRoute(request: RequestLike, response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname === "/api/content-calendar" && request.method === "GET") {
    sendSuccess(response, await getContentCalendar(url));
    return true;
  }

  return false;
}
