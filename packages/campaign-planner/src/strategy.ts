import {
  audienceSegments,
  channelFormatMatrix,
  defaultBatchSize,
  defaultChannelFormats,
  defaultPillarDistribution,
  maxBatchSize,
  minBatchSize
} from "./constants.ts";
import { CampaignPlannerInputSchema, CampaignPlanStrategySlotSchema } from "./schema.ts";
import type { CampaignPlannerInput, CampaignPlanStrategySlot } from "./types.ts";

function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysInclusive(startDate: string, endDate: string): number {
  const start = parseDateOnly(startDate).getTime();
  const end = parseDateOnly(endDate).getTime();
  return Math.floor((end - start) / 86_400_000) + 1;
}

export function allocatePillars(contentCount: number): Record<string, number> {
  const entries = Object.entries(defaultPillarDistribution);
  const totalWeight = entries.reduce((total, [, weight]) => total + weight, 0);
  const allocation = new Map<string, number>();
  const remainders: Array<{ pillar: string; remainder: number; index: number }> = [];
  let allocated = 0;

  entries.forEach(([pillar, weight], index) => {
    const exact = (contentCount * weight) / totalWeight;
    const base = Math.floor(exact);
    allocation.set(pillar, base);
    allocated += base;
    remainders.push({ pillar, remainder: exact - base, index });
  });

  remainders.sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  for (let i = 0; i < contentCount - allocated; i += 1) {
    const pillar = remainders[i]?.pillar;
    if (pillar) {
      allocation.set(pillar, (allocation.get(pillar) || 0) + 1);
    }
  }

  return Object.fromEntries(entries.map(([pillar]) => [pillar, allocation.get(pillar) || 0]));
}

function expandPillars(contentCount: number): string[] {
  const allocation = allocatePillars(contentCount);
  return Object.entries(allocation).flatMap(([pillar, count]) => Array.from({ length: count }, () => pillar));
}

function plannedDateForIndex(input: CampaignPlannerInput, index: number): string {
  const totalDays = daysInclusive(input.campaign.start_date, input.campaign.end_date);
  if (totalDays <= 0) {
    return input.campaign.start_date;
  }

  const count = input.requested_content_count;
  const offset = count === 1 ? 0 : Math.floor((index * (totalDays - 1)) / (count - 1));
  const date = parseDateOnly(input.campaign.start_date);
  date.setUTCDate(date.getUTCDate() + offset);
  return formatDateOnly(date);
}

function productForIndex(input: CampaignPlannerInput, index: number): string | null {
  if (input.campaign.primary_product_code) {
    return input.campaign.primary_product_code;
  }
  const productCodes = input.products.map((product) => product.code);
  if (!productCodes.length) {
    return null;
  }
  return productCodes[index % productCodes.length] || null;
}

function audienceForPillar(pillar: string, index: number): (typeof audienceSegments)[number] {
  if (pillar === "agent") return "agent_marketer";
  if (pillar === "offer" || pillar === "trust_process") return "mixed";
  return index % 5 === 4 ? "mixed" : "end_user_school";
}

function offerForPillar(input: CampaignPlannerInput, pillar: string, index: number): string | null {
  const offerCodes = input.offers.map((offer) => offer.code);
  if (!offerCodes.length) return null;
  const known: Record<string, string> = {
    mockup_magnet: "mockup_awal_gratis",
    desain_gratis: "desain_final_gratis",
    trust_process: "video_call_workshop_luar_daerah",
    product_proof: "garansi_ganti_baru_cacat_produksi",
    offer: offerCodes[index % offerCodes.length]
  };
  const candidate = known[pillar];
  return candidate && offerCodes.includes(candidate) ? candidate : null;
}

function painPointForPillar(input: CampaignPlannerInput, pillar: string, index: number): string | null {
  const painCodes = input.pain_points.map((painPoint) => painPoint.code);
  if (!painCodes.length) return null;
  if (pillar === "pain_point" || pillar === "trust_process" || pillar === "education") {
    return painCodes[index % painCodes.length] || null;
  }
  return null;
}

function plannedPublishAt(date: string, time: string | undefined): string | null {
  return time ? `${date}T${time}:00+07:00` : null;
}

export function buildCampaignPlanStrategy(input: CampaignPlannerInput): CampaignPlanStrategySlot[] {
  const value = CampaignPlannerInputSchema.parse(input);
  const pillars = expandPillars(value.requested_content_count);

  return pillars.map((pillar, index) => {
    const date = plannedDateForIndex(value, index);
    const slot: CampaignPlanStrategySlot = {
      draft_sequence: index + 1,
      planned_content_date: date,
      product_code: productForIndex(value, index),
      audience_segment: audienceForPillar(pillar, index),
      content_pillar: pillar as CampaignPlanStrategySlot["content_pillar"],
      primary_offer_code: offerForPillar(value, pillar, index),
      primary_pain_point_code: painPointForPillar(value, pillar, index),
      publications: value.selected_channels.map((channel) => ({
        channel,
        publication_format: defaultChannelFormats[channel],
        planned_publish_at: plannedPublishAt(date, value.default_posting_times?.[channel])
      }))
    };
    return CampaignPlanStrategySlotSchema.parse(slot);
  });
}

export function splitStrategyIntoBatches(
  strategySlots: CampaignPlanStrategySlot[],
  batchSize = defaultBatchSize
): CampaignPlanStrategySlot[][] {
  if (!Number.isInteger(batchSize) || batchSize < minBatchSize || batchSize > maxBatchSize) {
    throw new RangeError(`Batch size harus integer ${minBatchSize}-${maxBatchSize}.`);
  }
  const size = batchSize;
  const batches: CampaignPlanStrategySlot[][] = [];
  for (let index = 0; index < strategySlots.length; index += size) {
    batches.push(strategySlots.slice(index, index + size));
  }
  return batches;
}

export function isValidChannelFormat(channel: string, format: string): boolean {
  return Boolean((channelFormatMatrix as Record<string, readonly string[]>)[channel]?.includes(format));
}
