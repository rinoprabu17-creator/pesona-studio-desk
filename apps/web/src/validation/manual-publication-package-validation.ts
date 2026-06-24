import { ManualPublicationPackageError } from "../manual-publication-package-errors.ts";

export const manualPublicationPackageStatuses = [
  "draft_package",
  "ready_manual_publish",
  "published_manually",
  "hold",
  "needs_revision",
  "archived"
] as const;

export const manualPublicationPackageChannels = ["instagram", "facebook", "tiktok", "youtube"] as const;

export const manualPublicationPackageChannelStatuses = [
  "draft_channel",
  "ready_manual_publish",
  "published_manually",
  "skipped",
  "hold",
  "archived"
] as const;

export const manualPublicationPackageFormats = ["standard_video", "reel", "short", "feed_video", "story"] as const;

export type ManualPublicationPackageStatus = typeof manualPublicationPackageStatuses[number];
export type ManualPublicationPackageChannel = typeof manualPublicationPackageChannels[number];
export type ManualPublicationPackageChannelStatus = typeof manualPublicationPackageChannelStatuses[number];
export type ManualPublicationPackageFormat = typeof manualPublicationPackageFormats[number];

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown, maxLength: number, label: string): string | null {
  const text = normalizeText(value);
  if (!text) return null;
  if (text.length > maxLength) {
    throw new ManualPublicationPackageError("manual_publication_package_validation_failed", `${label} maksimal ${maxLength} karakter.`, 400);
  }
  return text;
}

export function validateManualPublicationPackageStatus(value: unknown): ManualPublicationPackageStatus {
  const status = normalizeText(value) || "draft_package";
  if (!manualPublicationPackageStatuses.includes(status as ManualPublicationPackageStatus)) {
    throw new ManualPublicationPackageError("manual_publication_package_validation_failed", "Status package manual publication tidak valid.", 400);
  }
  return status as ManualPublicationPackageStatus;
}

export function validateManualPublicationPackageChannelStatus(value: unknown): ManualPublicationPackageChannelStatus {
  const status = normalizeText(value) || "draft_channel";
  if (!manualPublicationPackageChannelStatuses.includes(status as ManualPublicationPackageChannelStatus)) {
    throw new ManualPublicationPackageError("manual_publication_package_validation_failed", "Status channel manual publication tidak valid.", 400);
  }
  return status as ManualPublicationPackageChannelStatus;
}

export function validateManualPublicationPackageChannel(value: unknown): ManualPublicationPackageChannel {
  const channel = normalizeText(value);
  if (!manualPublicationPackageChannels.includes(channel as ManualPublicationPackageChannel)) {
    throw new ManualPublicationPackageError("manual_publication_package_validation_failed", "Channel manual publication tidak valid.", 400);
  }
  return channel as ManualPublicationPackageChannel;
}

export function validateManualPublicationPackageFormat(value: unknown): ManualPublicationPackageFormat {
  const format = normalizeText(value) || "standard_video";
  if (!manualPublicationPackageFormats.includes(format as ManualPublicationPackageFormat)) {
    throw new ManualPublicationPackageError("manual_publication_package_validation_failed", "Format publikasi manual tidak valid.", 400);
  }
  return format as ManualPublicationPackageFormat;
}

export function validateSelectedChannels(value: unknown): ManualPublicationPackageChannel[] {
  const rawChannels = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  const channels = rawChannels.map(validateManualPublicationPackageChannel);
  const unique = Array.from(new Set(channels));
  if (unique.length === 0) {
    throw new ManualPublicationPackageError("manual_publication_package_validation_failed", "Pilih minimal satu channel manual publication.", 400);
  }
  if (unique.length !== channels.length) {
    throw new ManualPublicationPackageError("manual_publication_package_validation_failed", "Channel manual publication tidak boleh duplikat.", 400);
  }
  return unique;
}

export function validateOptionalTimestamp(value: unknown, label: string): string | null {
  const text = normalizeText(value);
  if (!text) return null;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    throw new ManualPublicationPackageError("manual_publication_package_validation_failed", `${label} harus timestamp valid.`, 400);
  }
  return date.toISOString();
}

export function validateManualPublishUrl(value: unknown): string | null {
  const text = optionalText(value, 1000, "URL publish manual");
  if (!text) return null;
  let parsed: URL;
  try {
    parsed = new URL(text);
  } catch {
    throw new ManualPublicationPackageError("manual_publication_package_validation_failed", "URL publish manual harus valid.", 400);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new ManualPublicationPackageError("manual_publication_package_validation_failed", "URL publish manual harus http atau https.", 400);
  }
  return text;
}

export function validateManualPublicationPackageInput(input: unknown): {
  package_title: string | null;
  caption_text: string | null;
  hashtags_text: string | null;
  call_to_action: string | null;
  manual_publish_note: string | null;
  created_by_name: string | null;
  selected_channels: ManualPublicationPackageChannel[];
  channel_formats: Record<string, ManualPublicationPackageFormat>;
  planned_publish_at: Record<string, string | null>;
} {
  const value = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const selectedChannels = validateSelectedChannels(value.selected_channels);
  const channelFormats: Record<string, ManualPublicationPackageFormat> = {};
  const plannedPublishAt: Record<string, string | null> = {};
  const rawFormats = value.channel_formats && typeof value.channel_formats === "object" ? value.channel_formats as Record<string, unknown> : {};
  const rawPlanned = value.planned_publish_at && typeof value.planned_publish_at === "object" ? value.planned_publish_at as Record<string, unknown> : {};
  for (const channel of selectedChannels) {
    channelFormats[channel] = validateManualPublicationPackageFormat(rawFormats[channel]);
    plannedPublishAt[channel] = validateOptionalTimestamp(rawPlanned[channel], `Planned publish ${channel}`);
  }
  return {
    package_title: optionalText(value.package_title, 200, "Judul package"),
    caption_text: optionalText(value.caption_text, 2200, "Caption"),
    hashtags_text: optionalText(value.hashtags_text, 1000, "Hashtag"),
    call_to_action: optionalText(value.call_to_action, 500, "CTA"),
    manual_publish_note: optionalText(value.manual_publish_note, 2000, "Catatan publish manual"),
    created_by_name: optionalText(value.created_by_name, 120, "Nama pembuat"),
    selected_channels: selectedChannels,
    channel_formats: channelFormats,
    planned_publish_at: plannedPublishAt
  };
}

export function validateManualPublicationPackageUpdateInput(input: unknown): {
  package_title: string | null;
  caption_text: string | null;
  hashtags_text: string | null;
  call_to_action: string | null;
  manual_publish_note: string | null;
  created_by_name: string | null;
} {
  const value = input && typeof input === "object" ? input as Record<string, unknown> : {};
  return {
    package_title: optionalText(value.package_title, 200, "Judul package"),
    caption_text: optionalText(value.caption_text, 2200, "Caption"),
    hashtags_text: optionalText(value.hashtags_text, 1000, "Hashtag"),
    call_to_action: optionalText(value.call_to_action, 500, "CTA"),
    manual_publish_note: optionalText(value.manual_publish_note, 2000, "Catatan publish manual"),
    created_by_name: optionalText(value.created_by_name, 120, "Nama pembuat")
  };
}

export function validateManualPublicationPackageChannelInput(input: unknown): {
  channel_status: ManualPublicationPackageChannelStatus;
  publication_format: ManualPublicationPackageFormat;
  planned_publish_at: string | null;
  manual_published_at: string | null;
  manual_publish_url: string | null;
  manual_publish_note: string | null;
} {
  const value = input && typeof input === "object" ? input as Record<string, unknown> : {};
  return {
    channel_status: validateManualPublicationPackageChannelStatus(value.channel_status),
    publication_format: validateManualPublicationPackageFormat(value.publication_format),
    planned_publish_at: validateOptionalTimestamp(value.planned_publish_at, "Planned publish"),
    manual_published_at: validateOptionalTimestamp(value.manual_published_at, "Manual published"),
    manual_publish_url: validateManualPublishUrl(value.manual_publish_url),
    manual_publish_note: optionalText(value.manual_publish_note, 2000, "Catatan channel")
  };
}
