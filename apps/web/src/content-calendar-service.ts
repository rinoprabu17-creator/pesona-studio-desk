import { query } from "./db.ts";
import { ContentCalendarError } from "./content-calendar-errors.ts";
import { validateContentCalendarFilters } from "./validation/content-calendar-validation.ts";
import type { ContentCalendarFilters } from "./validation/content-calendar-validation.ts";

export const calendarTimezone = "Asia/Jakarta";

export type ContentCalendarCampaignOption = {
  id: string;
  code: string;
  name: string;
};

export type ContentCalendarPublication = {
  id: string;
  channel: string;
  publication_format: string;
  publication_status: string;
  planned_publish_at: string | null;
  planned_publish_at_jakarta: string | null;
  platform_title: string | null;
  published_url: string | null;
  failure_reason: string | null;
};

export type ContentCalendarItem = {
  id: string;
  content_code: string;
  title: string;
  planned_content_date: string;
  campaign: {
    id: string;
    code: string;
    name: string;
  };
  product: {
    id: string;
    code: string;
    name: string;
  } | null;
  content_pillar: string;
  production_status: string;
  cta_text: string;
  cta_keyword: string | null;
  publications: ContentCalendarPublication[];
};

export type ContentCalendarDay = {
  date: string;
  content_items: ContentCalendarItem[];
};

export type ContentCalendarData = {
  timezone: "Asia/Jakarta";
  month: string;
  range: {
    start_date: string;
    end_date: string;
  };
  filters: ContentCalendarFilters;
  counts: {
    content_items: number;
    publications: number;
  };
  campaign_options: ContentCalendarCampaignOption[];
  days: ContentCalendarDay[];
};

type CalendarContentRow = {
  id: string;
  content_code: string;
  title: string;
  planned_content_date: string | Date;
  campaign_id: string;
  campaign_code: string;
  campaign_name: string;
  product_id: string | null;
  product_code: string | null;
  product_name: string | null;
  content_pillar: string;
  production_status: string;
  cta_text: string;
  cta_keyword: string | null;
};

type CalendarPublicationRow = {
  id: string;
  content_item_id: string;
  channel: string;
  publication_format: string;
  publication_status: string;
  planned_publish_at: string | Date | null;
  platform_title: string | null;
  published_url: string | null;
  failure_reason: string | null;
};

function formatDate(value: unknown): string {
  if (value instanceof Date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: calendarTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(value);
    const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
    return `${part("year")}-${part("month")}-${part("day")}`;
  }
  return String(value || "").slice(0, 10);
}

function monthRange(month: string): { startDate: string; nextMonthStart: string; endDate: string } {
  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7)) - 1;
  const start = new Date(Date.UTC(year, monthIndex, 1));
  const next = new Date(Date.UTC(year, monthIndex + 1, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 0));

  return {
    startDate: start.toISOString().slice(0, 10),
    nextMonthStart: next.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10)
  };
}

function formatTimestamp(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

function formatJakartaTimestamp(value: unknown): string | null {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: calendarTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")}:${part("second")} WIB`;
}

async function assertCampaignExists(campaignId: string | null): Promise<void> {
  if (!campaignId) return;
  const rows = await query<{ id: string }>(`SELECT id FROM campaigns WHERE id = $1`, [campaignId]);
  if (!rows[0]) {
    throw new ContentCalendarError("campaign_not_found", "Campaign tidak ditemukan.", 404);
  }
}

export async function listCalendarCampaignOptions(): Promise<ContentCalendarCampaignOption[]> {
  return query<ContentCalendarCampaignOption>(
    `SELECT id, code, name
     FROM campaigns
     ORDER BY start_date DESC, created_at DESC`
  );
}

async function listMonthContentItems(filters: ContentCalendarFilters, startDate: string, nextMonthStart: string): Promise<CalendarContentRow[]> {
  const where = [`ci.planned_content_date >= $1::date`, `ci.planned_content_date < $2::date`];
  const params: unknown[] = [startDate, nextMonthStart];

  if (filters.campaign_id) {
    params.push(filters.campaign_id);
    where.push(`ci.campaign_id = $${params.length}`);
  }

  if (filters.production_status) {
    params.push(filters.production_status);
    where.push(`ci.production_status = $${params.length}`);
  }

  return query<CalendarContentRow>(
    `SELECT ci.id,
            ci.content_code,
            ci.title,
            ci.planned_content_date,
            c.id AS campaign_id,
            c.code AS campaign_code,
            c.name AS campaign_name,
            p.id AS product_id,
            p.code AS product_code,
            p.name AS product_name,
            ci.content_pillar,
            ci.production_status,
            ci.cta_text,
            ci.cta_keyword
     FROM content_items ci
     JOIN campaigns c ON c.id = ci.campaign_id
     LEFT JOIN products p ON p.id = ci.product_id
     WHERE ${where.join(" AND ")}
     ORDER BY ci.planned_content_date ASC, c.code ASC, ci.sequence_number ASC`,
    params
  );
}

async function listPublicationsForContentItems(contentItemIds: string[], filters: ContentCalendarFilters): Promise<CalendarPublicationRow[]> {
  if (!contentItemIds.length) {
    return [];
  }

  const where = [`cp.content_item_id = ANY($1::uuid[])`];
  const params: unknown[] = [contentItemIds];

  if (filters.channel) {
    params.push(filters.channel);
    where.push(`cp.channel = $${params.length}`);
  }

  if (filters.publication_status) {
    params.push(filters.publication_status);
    where.push(`cp.publication_status = $${params.length}`);
  }

  return query<CalendarPublicationRow>(
    `SELECT cp.id,
            cp.content_item_id,
            cp.channel,
            cp.publication_format,
            cp.publication_status,
            cp.planned_publish_at,
            cp.platform_title,
            cp.published_url,
            cp.failure_reason
     FROM content_publications cp
     WHERE ${where.join(" AND ")}
     ORDER BY cp.content_item_id, cp.planned_publish_at NULLS LAST, cp.channel, cp.publication_format`,
    params
  );
}

function mapPublication(row: CalendarPublicationRow): ContentCalendarPublication {
  return {
    id: row.id,
    channel: row.channel,
    publication_format: row.publication_format,
    publication_status: row.publication_status,
    planned_publish_at: formatTimestamp(row.planned_publish_at),
    planned_publish_at_jakarta: formatJakartaTimestamp(row.planned_publish_at),
    platform_title: row.platform_title,
    published_url: row.published_url,
    failure_reason: row.failure_reason
  };
}

function mapContentItem(row: CalendarContentRow, publications: ContentCalendarPublication[]): ContentCalendarItem {
  return {
    id: row.id,
    content_code: row.content_code,
    title: row.title,
    planned_content_date: formatDate(row.planned_content_date),
    campaign: {
      id: row.campaign_id,
      code: row.campaign_code,
      name: row.campaign_name
    },
    product: row.product_id
      ? {
          id: row.product_id,
          code: row.product_code || "",
          name: row.product_name || ""
        }
      : null,
    content_pillar: row.content_pillar,
    production_status: row.production_status,
    cta_text: row.cta_text,
    cta_keyword: row.cta_keyword,
    publications
  };
}

export async function getContentCalendar(url: URL): Promise<ContentCalendarData> {
  const filters = validateContentCalendarFilters(url.searchParams);
  const range = monthRange(filters.month);
  await assertCampaignExists(filters.campaign_id);

  const [campaignOptions, contentRows] = await Promise.all([
    listCalendarCampaignOptions(),
    listMonthContentItems(filters, range.startDate, range.nextMonthStart)
  ]);

  const publicationRows = await listPublicationsForContentItems(
    contentRows.map((row) => row.id),
    filters
  );
  const publicationByContentItem = new Map<string, ContentCalendarPublication[]>();
  for (const row of publicationRows) {
    const publication = mapPublication(row);
    const existing = publicationByContentItem.get(row.content_item_id);
    if (existing) {
      existing.push(publication);
    } else {
      publicationByContentItem.set(row.content_item_id, [publication]);
    }
  }

  const requiresPublicationMatch = Boolean(filters.channel || filters.publication_status);
  const items = contentRows
    .map((row) => mapContentItem(row, publicationByContentItem.get(row.id) || []))
    .filter((item) => !requiresPublicationMatch || item.publications.length > 0);

  const daysByDate = new Map<string, ContentCalendarItem[]>();
  for (const item of items) {
    const existing = daysByDate.get(item.planned_content_date);
    if (existing) {
      existing.push(item);
    } else {
      daysByDate.set(item.planned_content_date, [item]);
    }
  }

  const days = Array.from(daysByDate.entries()).map(([date, contentItems]) => ({
    date,
    content_items: contentItems
  }));

  return {
    timezone: calendarTimezone,
    month: filters.month,
    range: {
      start_date: range.startDate,
      end_date: range.endDate
    },
    filters,
    counts: {
      content_items: items.length,
      publications: items.reduce((total, item) => total + item.publications.length, 0)
    },
    campaign_options: campaignOptions,
    days
  };
}
