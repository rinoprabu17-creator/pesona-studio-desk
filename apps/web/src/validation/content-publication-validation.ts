import { ContentPublicationError } from "../content-publication-errors.ts";
import { assertUuid } from "./library-validation.ts";

export type ContentPublicationInput = {
  content_item_id?: string | null;
  channel?: string;
  publication_format?: string;
  planned_publish_at?: string | null;
  platform_title?: string | null;
  platform_caption?: string | null;
  published_url?: string | null;
  published_at?: string | null;
  failure_reason?: string | null;
  publication_status?: string;
};

export const publicationChannels = ["instagram", "facebook", "tiktok", "youtube", "whatsapp_status"] as const;
export const publicationFormats = [
  "reel",
  "short_video",
  "feed_video",
  "feed_image",
  "carousel",
  "status_video",
  "status_image",
  "standard_video"
] as const;
export const publicationStatuses = ["planned", "scheduled", "publishing", "posted", "failed", "cancelled"] as const;

export const channelFormatMatrix: Record<string, readonly string[]> = {
  instagram: ["reel", "feed_video", "feed_image", "carousel"],
  facebook: ["reel", "feed_video", "feed_image", "carousel"],
  tiktok: ["short_video"],
  youtube: ["short_video", "standard_video"],
  whatsapp_status: ["status_video", "status_image"]
};

export const publicationTransitions: Record<string, string[]> = {
  planned: ["scheduled", "cancelled"],
  scheduled: ["publishing", "cancelled"],
  publishing: ["posted", "failed"],
  failed: ["scheduled", "cancelled"],
  cancelled: ["planned"],
  posted: []
};

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNullableText(value: unknown): string | null {
  const text = normalizeText(value);
  return text === "" ? null : text;
}

export function normalizeLocalJakartaDateTime(value: unknown): string | null {
  const text = normalizeNullableText(value);
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(text)) {
    return `${text}:00+07:00`;
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(text)) {
    return `${text}+07:00`;
  }
  return text;
}

export function validateTimestamp(value: unknown, code: "invalid_planned_publish_at" | "invalid_published_at", label: string): string | null {
  const text = normalizeLocalJakartaDateTime(value);
  if (!text) return null;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    throw new ContentPublicationError(code, `${label} harus berupa timestamp valid.`, 400);
  }
  return date.toISOString();
}

function validateNullableUrl(value: unknown): string | null {
  const text = normalizeNullableText(value);
  if (!text) return null;
  if (text.length > 2048) {
    throw new ContentPublicationError("invalid_published_url", "Published URL maksimal 2048 karakter.", 400);
  }
  try {
    const url = new URL(text);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("bad protocol");
    }
  } catch {
    throw new ContentPublicationError("invalid_published_url", "Published URL harus memakai http atau https.", 400);
  }
  return text;
}

export function validateChannel(value: unknown): string {
  const channel = normalizeText(value);
  if (!publicationChannels.includes(channel as any)) {
    throw new ContentPublicationError("invalid_channel", "Channel publikasi tidak valid.", 400);
  }
  return channel;
}

export function validatePublicationFormat(value: unknown): string {
  const format = normalizeText(value);
  if (!publicationFormats.includes(format as any)) {
    throw new ContentPublicationError("invalid_publication_format", "Format publikasi tidak valid.", 400);
  }
  return format;
}

export function assertChannelFormat(channel: string, format: string): void {
  if (!(channelFormatMatrix[channel] || []).includes(format)) {
    throw new ContentPublicationError("invalid_channel_format", "Kombinasi channel dan format tidak valid.", 400);
  }
}

function validatePlatformTitle(value: unknown): string | null {
  const text = normalizeNullableText(value);
  if (text && text.length > 200) {
    throw new ContentPublicationError("invalid_platform_title", "Platform title maksimal 200 karakter.", 400);
  }
  return text;
}

function validatePlatformCaption(value: unknown): string | null {
  const text = normalizeNullableText(value);
  if (text && text.length > 10000) {
    throw new ContentPublicationError("invalid_platform_caption", "Platform caption maksimal 10000 karakter.", 400);
  }
  return text;
}

export function validateFailureReason(value: unknown, required = false): string | null {
  const text = normalizeNullableText(value);
  if (required && !text) {
    throw new ContentPublicationError("failure_reason_required", "Failure reason wajib diisi.", 400);
  }
  if (text && text.length > 3000) {
    throw new ContentPublicationError("invalid_failure_reason", "Failure reason maksimal 3000 karakter.", 400);
  }
  return text;
}

export function validatePublicationStatus(value: unknown): string {
  const status = normalizeText(value);
  if (!publicationStatuses.includes(status as any)) {
    throw new ContentPublicationError("invalid_publication_status", "Publication status tidak valid.", 400);
  }
  return status;
}

export function validateCreatePublicationInput(contentItemId: string, input: ContentPublicationInput) {
  assertUuid(contentItemId);
  const channel = validateChannel(input.channel);
  const publicationFormat = validatePublicationFormat(input.publication_format);
  assertChannelFormat(channel, publicationFormat);

  return {
    content_item_id: contentItemId,
    channel,
    publication_format: publicationFormat,
    planned_publish_at: validateTimestamp(input.planned_publish_at, "invalid_planned_publish_at", "Jadwal posting"),
    platform_title: validatePlatformTitle(input.platform_title),
    platform_caption: validatePlatformCaption(input.platform_caption)
  };
}

export function validateUpdatePublicationInput(input: ContentPublicationInput, status: string) {
  if (input.content_item_id !== undefined || input.channel !== undefined || input.publication_format !== undefined) {
    throw new ContentPublicationError("immutable_publication_identity", "Identitas publikasi tidak boleh diubah.", 400);
  }
  if (input.publication_status !== undefined || input.published_at !== undefined || input.failure_reason !== undefined) {
    throw new ContentPublicationError("immutable_publication_identity", "Status publikasi harus diubah dari action status.", 400);
  }
  if (status !== "posted" && normalizeNullableText(input.published_url)) {
    throw new ContentPublicationError("invalid_published_url", "Published URL hanya dapat diubah setelah publikasi terposting.", 400);
  }

  return {
    planned_publish_at: validateTimestamp(input.planned_publish_at, "invalid_planned_publish_at", "Jadwal posting"),
    platform_title: validatePlatformTitle(input.platform_title),
    platform_caption: validatePlatformCaption(input.platform_caption),
    published_url: status === "posted" ? validateNullableUrl(input.published_url) : null
  };
}

export function validateStatusActionInput(input: ContentPublicationInput) {
  const status = validatePublicationStatus(input.publication_status);
  return {
    publication_status: status,
    planned_publish_at: validateTimestamp(input.planned_publish_at, "invalid_planned_publish_at", "Jadwal posting"),
    platform_title: validatePlatformTitle(input.platform_title),
    published_at: validateTimestamp(input.published_at, "invalid_published_at", "Published at"),
    published_url: validateNullableUrl(input.published_url),
    failure_reason: validateFailureReason(input.failure_reason)
  };
}
