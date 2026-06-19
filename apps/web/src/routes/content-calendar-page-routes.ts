import { ContentCalendarError } from "../content-calendar-errors.ts";
import { getContentCalendar } from "../content-calendar-service.ts";
import type { ResponseLike } from "../http/response.ts";
import { sendHtml } from "../http/response.ts";
import { LibraryError } from "../library-errors.ts";
import { renderContentCalendarPage } from "../views/content-calendar-page.ts";

function calendarPageStatus(error: unknown): number {
  if (error instanceof ContentCalendarError || error instanceof LibraryError) {
    return error.statusCode;
  }
  return 500;
}

function safeCalendarErrorMessage(error: unknown): string {
  if (error instanceof ContentCalendarError || error instanceof LibraryError) {
    return error.message;
  }
  return "Kalender konten gagal dimuat.";
}

export async function handleContentCalendarPageGet(response: ResponseLike, pathname: string, url: URL): Promise<boolean> {
  if (pathname !== "/content-calendar") {
    return false;
  }

  try {
    sendHtml(response, renderContentCalendarPage(await getContentCalendar(url), url));
  } catch (error) {
    sendHtml(response, renderContentCalendarPage(null, url, safeCalendarErrorMessage(error)), calendarPageStatus(error));
  }
  return true;
}
