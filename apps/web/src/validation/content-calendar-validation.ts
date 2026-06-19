import { ContentCalendarError } from "../content-calendar-errors.ts";
import { productionStatuses } from "./content-item-validation.ts";
import { publicationChannels, publicationStatuses } from "./content-publication-validation.ts";
import { assertUuid } from "./library-validation.ts";

export type ContentCalendarFilters = {
  month: string;
  campaign_id: string | null;
  channel: string | null;
  production_status: string | null;
  publication_status: string | null;
};

const monthPattern = /^\d{4}-\d{2}$/;

function normalizeOptional(value: string | null): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return text ? text : null;
}

function currentJakartaMonth(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit"
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}`;
}

function validateMonth(value: string | null): string {
  if (value === null) {
    return currentJakartaMonth();
  }

  const month = value.trim();
  if (!monthPattern.test(month)) {
    throw new ContentCalendarError("invalid_calendar_month", "Format bulan harus YYYY-MM.", 400);
  }

  const monthNumber = Number(month.slice(5, 7));
  if (monthNumber < 1 || monthNumber > 12) {
    throw new ContentCalendarError("invalid_calendar_month", "Bulan kalender tidak valid.", 400);
  }

  return month;
}

function validateCampaignId(value: string | null): string | null {
  const id = normalizeOptional(value);
  if (id) {
    assertUuid(id);
  }
  return id;
}

function validateChannelFilter(value: string | null): string | null {
  const channel = normalizeOptional(value);
  if (channel && !publicationChannels.includes(channel as any)) {
    throw new ContentCalendarError("invalid_channel", "Channel tidak valid.", 400);
  }
  return channel;
}

function validateProductionStatusFilter(value: string | null): string | null {
  const status = normalizeOptional(value);
  if (status && !productionStatuses.includes(status as any)) {
    throw new ContentCalendarError("invalid_production_status", "Status produksi tidak valid.", 400);
  }
  return status;
}

function validatePublicationStatusFilter(value: string | null): string | null {
  const status = normalizeOptional(value);
  if (status && !publicationStatuses.includes(status as any)) {
    throw new ContentCalendarError("invalid_publication_status", "Status publikasi tidak valid.", 400);
  }
  return status;
}

export function validateContentCalendarFilters(params: URLSearchParams): ContentCalendarFilters {
  return {
    month: validateMonth(params.has("month") ? params.get("month") : null),
    campaign_id: validateCampaignId(params.get("campaign_id")),
    channel: validateChannelFilter(params.get("channel")),
    production_status: validateProductionStatusFilter(params.get("production_status")),
    publication_status: validatePublicationStatusFilter(params.get("publication_status"))
  };
}
