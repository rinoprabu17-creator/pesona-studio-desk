import { z } from "zod";
import {
  audienceSegments,
  channels,
  contentPillars,
  ctaKeywordPattern,
  publicationFormats,
  schoolLevels,
  timezone
} from "./constants.ts";

export const ChannelSchema = z.enum(channels);
export const PublicationFormatSchema = z.enum(publicationFormats);
export const AudienceSegmentSchema = z.enum(audienceSegments);
export const ContentPillarSchema = z.enum(contentPillars);
export const SchoolLevelSchema = z.enum(schoolLevels);

function isValidDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function hasDuplicateCodes(items: Array<{ code: string }>): boolean {
  return new Set(items.map((item) => item.code)).size !== items.length;
}

export const DateOnlySchema = z.string().refine(isValidDateOnly, "Tanggal harus valid dalam format YYYY-MM-DD.");
export const PostingTimeSchema = z.string().regex(/^\d{2}:\d{2}$/).refine((value) => {
  const [hour, minute] = value.split(":").map(Number);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}, "Posting time harus HH:mm valid.");

export const JakartaTimestampSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+07:00$/);
export const CtaKeywordSchema = z.string().max(40).regex(ctaKeywordPattern);

const ActiveReferenceSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  active: z.literal(true).optional()
}).strict();

export const ProductSnapshotSchema = ActiveReferenceSchema;
export const ColorSnapshotSchema = ActiveReferenceSchema.extend({
  hex_preview: z.string().nullable().optional()
}).strict();
export const OfferSnapshotSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  public_phrase: z.string().min(1),
  condition_text: z.string().nullable().optional(),
  risk_note: z.string().nullable().optional(),
  active: z.literal(true).optional()
}).strict();
export const PainPointSnapshotSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  buyer_fear: z.string().nullable().optional(),
  content_angle: z.string().nullable().optional(),
  safe_claim: z.string().nullable().optional(),
  avoid_claim: z.string().nullable().optional(),
  active: z.literal(true).optional()
}).strict();
export const SchoolLevelColorDefaultSnapshotSchema = z.object({
  school_level: SchoolLevelSchema,
  color_code: z.string().min(1),
  active: z.literal(true).optional()
}).strict();

export const CampaignPlannerInputSchema = z.object({
  campaign: z.object({
    id: z.string().uuid(),
    code: z.string().min(1),
    name: z.string().min(1),
    start_date: DateOnlySchema,
    end_date: DateOnlySchema,
    target_audience: z.string().min(1),
    primary_product_code: z.string().min(1).nullable()
  }).strict(),
  requested_content_count: z.number().int().min(1).max(30),
  selected_channels: z.array(ChannelSchema).min(1).refine(
    (items) => new Set(items).size === items.length,
    "Selected channel tidak boleh duplikat."
  ),
  owner_brief: z.string().max(2000).nullable(),
  default_posting_times: z.partialRecord(ChannelSchema, PostingTimeSchema).nullable(),
  products: z.array(ProductSnapshotSchema),
  colors: z.array(ColorSnapshotSchema),
  school_level_defaults: z.array(SchoolLevelColorDefaultSnapshotSchema),
  offers: z.array(OfferSnapshotSchema),
  pain_points: z.array(PainPointSnapshotSchema),
  timezone: z.literal(timezone)
}).strict().superRefine((value, context) => {
  if (value.campaign.end_date < value.campaign.start_date) {
    context.addIssue({
      code: "custom",
      message: "Campaign end_date tidak boleh sebelum start_date.",
      path: ["campaign", "end_date"]
    });
  }

  if (value.campaign.primary_product_code && !value.products.some((product) => product.code === value.campaign.primary_product_code)) {
    context.addIssue({
      code: "custom",
      message: "Campaign primary_product_code harus tersedia pada active product snapshot.",
      path: ["campaign", "primary_product_code"]
    });
  }

  const referenceGroups: Array<[string, Array<{ code: string }>]> = [
    ["products", value.products],
    ["colors", value.colors],
    ["offers", value.offers],
    ["pain_points", value.pain_points]
  ];
  for (const [path, items] of referenceGroups) {
    if (hasDuplicateCodes(items)) {
      context.addIssue({
        code: "custom",
        message: "Reference code tidak boleh duplikat.",
        path: [path]
      });
    }
  }
});

export const StrategyPublicationSchema = z.object({
  channel: ChannelSchema,
  publication_format: PublicationFormatSchema,
  planned_publish_at: JakartaTimestampSchema.nullable()
}).strict();

export const CampaignPlanStrategySlotSchema = z.object({
  draft_sequence: z.number().int().min(1),
  planned_content_date: DateOnlySchema,
  product_code: z.string().min(1).nullable(),
  audience_segment: AudienceSegmentSchema,
  content_pillar: ContentPillarSchema,
  primary_offer_code: z.string().min(1).nullable(),
  primary_pain_point_code: z.string().min(1).nullable(),
  publications: z.array(StrategyPublicationSchema).min(1)
}).strict();

export const ProviderBatchItemOutputSchema = z.object({
  draft_sequence: z.number().int().min(1),
  title: z.string().min(1).max(200),
  school_level: SchoolLevelSchema.nullable(),
  color_code: z.string().min(1).nullable(),
  target_audience: z.string().min(1).max(500),
  hook: z.string().min(1).max(1000),
  angle: z.string().min(1).max(2000),
  cta_text: z.string().min(1).max(1000),
  cta_keyword: CtaKeywordSchema.nullable(),
  planning_reason: z.string().min(1).max(1000),
  youtube_title: z.string().min(1).max(200).nullable()
}).strict();

export const ProviderBatchResultSchema = z.object({
  provider_name: z.string().min(1),
  model_name: z.string().min(1),
  response_id: z.string().min(1).nullable(),
  usage: z.object({
    input_tokens: z.number().int().nonnegative().nullable().optional(),
    output_tokens: z.number().int().nonnegative().nullable().optional(),
    total_tokens: z.number().int().nonnegative().nullable().optional()
  }).strict().nullable(),
  items: z.array(ProviderBatchItemOutputSchema)
}).strict();

export const FinalPublicationSchema = StrategyPublicationSchema.extend({
  platform_title: z.string().min(1).max(200).nullable(),
  platform_caption: z.null()
}).strict();

export const CampaignPlanDraftItemSchema = z.object({
  draft_sequence: z.number().int().min(1),
  planned_content_date: DateOnlySchema,
  title: z.string().min(1).max(200),
  product_code: z.string().min(1).nullable(),
  school_level: SchoolLevelSchema.nullable(),
  color_code: z.string().min(1).nullable(),
  audience_segment: AudienceSegmentSchema,
  target_audience: z.string().min(1).max(500),
  content_pillar: ContentPillarSchema,
  primary_offer_code: z.string().min(1).nullable(),
  primary_pain_point_code: z.string().min(1).nullable(),
  hook: z.string().min(1).max(1000),
  angle: z.string().min(1).max(2000),
  cta_text: z.string().min(1).max(1000),
  cta_keyword: CtaKeywordSchema.nullable(),
  planning_reason: z.string().min(1).max(1000),
  publications: z.array(FinalPublicationSchema).min(1)
}).strict();

export const CampaignPlanDraftSchema = z.object({
  plan_summary: z.string().min(1).max(2000),
  requested_content_count: z.number().int().min(1).max(30),
  items: z.array(CampaignPlanDraftItemSchema).min(1)
}).strict();

export const ValidationIssueSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  path: z.string().nullable()
}).strict();

export const ValidationSummarySchema = z.object({
  valid: z.boolean(),
  error_count: z.number().int().nonnegative(),
  warning_count: z.number().int().nonnegative()
}).strict();
