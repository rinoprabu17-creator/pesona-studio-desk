import { channels, timezone } from "../../../../packages/campaign-planner/src/index.ts";
import { CampaignPlanRunError } from "../campaign-plan-run-errors.ts";

export type CampaignPlanRunInput = {
  requested_content_count: number;
  selected_channels: string[];
  owner_brief: string | null;
  default_posting_times: Record<string, string> | null;
};

const channelSet = new Set<string>(channels);
const postingTimePattern = /^\d{2}:\d{2}$/;

function parseCount(value: unknown): number {
  if (value === undefined || value === null || value === "") return 30;
  const count = Number(value);
  if (!Number.isInteger(count) || count < 1 || count > 30) {
    throw new CampaignPlanRunError("invalid_requested_content_count", "Jumlah konten harus 1 sampai 30.", 400);
  }
  return count;
}

function validatePostingTime(value: string): boolean {
  if (!postingTimePattern.test(value)) return false;
  const [hour, minute] = value.split(":").map(Number);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

export function validateCampaignPlanRunInput(input: Record<string, unknown>): CampaignPlanRunInput {
  const requestedContentCount = parseCount(input.requested_content_count);
  const rawChannels = Array.isArray(input.selected_channels)
    ? input.selected_channels
    : typeof input.selected_channels === "string" && input.selected_channels
      ? [input.selected_channels]
      : [];
  const selectedChannels = rawChannels.map(String).filter(Boolean);

  if (!selectedChannels.length) {
    throw new CampaignPlanRunError("selected_channels_required", "Pilih minimal satu channel.", 400);
  }

  if (new Set(selectedChannels).size !== selectedChannels.length) {
    throw new CampaignPlanRunError("duplicate_selected_channel", "Channel tidak boleh duplikat.", 400);
  }

  for (const channel of selectedChannels) {
    if (!channelSet.has(channel)) {
      throw new CampaignPlanRunError("invalid_channel", "Channel tidak valid.", 400);
    }
  }

  const ownerBrief = typeof input.owner_brief === "string" && input.owner_brief.trim()
    ? input.owner_brief.trim()
    : null;
  if (ownerBrief && ownerBrief.length > 2000) {
    throw new CampaignPlanRunError("owner_brief_too_long", "Brief tambahan maksimal 2000 karakter.", 400);
  }

  const defaultPostingTimes: Record<string, string> = {};
  const rawTimes = input.default_posting_times && typeof input.default_posting_times === "object"
    ? input.default_posting_times as Record<string, unknown>
    : {};

  for (const channel of selectedChannels) {
    const value = rawTimes[channel];
    if (typeof value !== "string" || !value.trim()) continue;
    if (!validatePostingTime(value)) {
      throw new CampaignPlanRunError("invalid_posting_time", "Jam posting harus format HH:mm valid.", 400);
    }
    defaultPostingTimes[channel] = value;
  }

  return {
    requested_content_count: requestedContentCount,
    selected_channels: selectedChannels,
    owner_brief: ownerBrief,
    default_posting_times: Object.keys(defaultPostingTimes).length ? defaultPostingTimes : null
  };
}

export function valuesFromPlanRunForm(body: Record<string, string>): Record<string, unknown> {
  const default_posting_times: Record<string, string> = {};
  for (const channel of channels) {
    default_posting_times[channel] = body[`posting_time_${channel}`] || "";
  }

  return {
    requested_content_count: body.requested_content_count,
    selected_channels: Object.entries(body)
      .filter(([key, value]) => key.startsWith("channel_") && value)
      .map(([, value]) => value),
    owner_brief: body.owner_brief || null,
    default_posting_times,
    timezone
  };
}
