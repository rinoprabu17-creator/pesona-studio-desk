import { channelFormatMatrix, ctaKeywordPattern, defaultPillarDistribution, schoolLevels } from "./constants.ts";
import { CampaignPlanDraftSchema } from "./schema.ts";
import { validateClaims } from "./claim-rules.ts";
import type { CampaignPlanDraft, CampaignPlannerInput, ValidationIssue } from "./types.ts";

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function issue(code: string, message: string, path: string | null): ValidationIssue {
  return { code, message, path };
}

function codeSet(items: Array<{ code: string }>): Set<string> {
  return new Set(items.map((item) => item.code));
}

function dateInRange(date: string, startDate: string, endDate: string): boolean {
  return date >= startDate && date <= endDate;
}

function distributionForDraft(draft: CampaignPlanDraft): Record<string, number> {
  return draft.items.reduce<Record<string, number>>((result, item) => {
    result[item.content_pillar] = (result[item.content_pillar] || 0) + 1;
    return result;
  }, {});
}

function expectedScaledDistribution(count: number): Record<string, number> {
  const entries = Object.entries(defaultPillarDistribution);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  const allocation = new Map<string, number>();
  const remainders: Array<{ pillar: string; remainder: number; index: number }> = [];
  let allocated = 0;
  entries.forEach(([pillar, value], index) => {
    const exact = (count * value) / total;
    const floor = Math.floor(exact);
    allocation.set(pillar, floor);
    allocated += floor;
    remainders.push({ pillar, remainder: exact - floor, index });
  });
  remainders.sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  for (let index = 0; index < count - allocated; index += 1) {
    const pillar = remainders[index]?.pillar;
    if (pillar) allocation.set(pillar, (allocation.get(pillar) || 0) + 1);
  }
  return Object.fromEntries(entries.map(([pillar]) => [pillar, allocation.get(pillar) || 0]));
}

export function validateReferencesAndBusinessRules(
  input: CampaignPlannerInput,
  draft: CampaignPlanDraft
): { errors: ValidationIssue[]; warnings: ValidationIssue[] } {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const products = codeSet(input.products);
  const colors = codeSet(input.colors);
  const offers = codeSet(input.offers);
  const painPoints = codeSet(input.pain_points);
  const sequences = new Set<number>();

  if (draft.requested_content_count !== input.requested_content_count || draft.items.length !== input.requested_content_count) {
    errors.push(issue("requested_count_mismatch", "Jumlah draft tidak sesuai request.", "items"));
  }

  draft.items.forEach((item, index) => {
    const path = `items.${index}`;
    if (sequences.has(item.draft_sequence)) {
      errors.push(issue("duplicate_draft_sequence", "Draft sequence duplikat.", `${path}.draft_sequence`));
    }
    sequences.add(item.draft_sequence);
    if (item.draft_sequence !== index + 1) {
      errors.push(issue("draft_sequence_not_contiguous", "Draft sequence harus berurutan dari 1.", `${path}.draft_sequence`));
    }
    if (!dateInRange(item.planned_content_date, input.campaign.start_date, input.campaign.end_date)) {
      errors.push(issue("planned_date_outside_campaign", "Tanggal konten berada di luar periode campaign.", `${path}.planned_content_date`));
    }
    if (item.product_code && !products.has(item.product_code)) {
      errors.push(issue("invalid_product_reference", "Product code tidak tersedia atau tidak aktif.", `${path}.product_code`));
    }
    if (item.color_code && !colors.has(item.color_code)) {
      errors.push(issue("invalid_color_reference", "Color code tidak tersedia atau tidak aktif.", `${path}.color_code`));
    }
    if (item.primary_offer_code && !offers.has(item.primary_offer_code)) {
      errors.push(issue("invalid_offer_reference", "Offer code tidak tersedia atau tidak aktif.", `${path}.primary_offer_code`));
    }
    if (item.primary_pain_point_code && !painPoints.has(item.primary_pain_point_code)) {
      errors.push(issue("invalid_pain_point_reference", "Pain point code tidak tersedia atau tidak aktif.", `${path}.primary_pain_point_code`));
    }
    if (item.school_level && !schoolLevels.includes(item.school_level as any)) {
      errors.push(issue("invalid_school_level", "School level tidak valid.", `${path}.school_level`));
    }
    if (!item.cta_text.trim()) {
      errors.push(issue("missing_cta_text", "CTA text wajib tersedia.", `${path}.cta_text`));
    }
    if (item.cta_keyword && !ctaKeywordPattern.test(item.cta_keyword)) {
      errors.push(issue("invalid_cta_keyword", "CTA keyword harus uppercase dan memakai format yang valid.", `${path}.cta_keyword`));
    }
    item.publications.forEach((publication, publicationIndex) => {
      const publicationPath = `${path}.publications.${publicationIndex}`;
      if (!(channelFormatMatrix as Record<string, readonly string[]>)[publication.channel]?.includes(publication.publication_format)) {
        errors.push(issue("invalid_channel_format", "Kombinasi channel dan format tidak valid.", publicationPath));
      }
      if (publication.channel === "youtube" && !publication.platform_title) {
        errors.push(issue("youtube_title_required", "Publication YouTube wajib memiliki platform title.", `${publicationPath}.platform_title`));
      }
      if (publication.channel !== "youtube" && publication.platform_title !== null) {
        errors.push(issue("non_youtube_title_not_allowed", "Platform title hanya diisi untuk YouTube pada Phase 2A.", `${publicationPath}.platform_title`));
      }
      if (publication.platform_caption !== null) {
        errors.push(issue("platform_caption_not_allowed", "Platform caption belum digenerate pada Phase 2A.", `${publicationPath}.platform_caption`));
      }
    });
  });

  const expected = expectedScaledDistribution(input.requested_content_count);
  const actual = distributionForDraft(draft);
  for (const [pillar, count] of Object.entries(expected)) {
    if ((actual[pillar] || 0) !== count) {
      warnings.push(issue("pillar_distribution_mismatch", "Distribusi pillar berbeda dari strategy.", "items"));
      break;
    }
  }

  return { errors, warnings };
}

export function validateDuplicatesAndDiversity(draft: CampaignPlanDraft): { errors: ValidationIssue[]; warnings: ValidationIssue[] } {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const titles = new Map<string, number>();
  const hooks = new Map<string, number>();
  const ctaCounts = new Map<string, number>();
  const offerCounts = new Map<string, number>();
  const painCounts = new Map<string, number>();

  draft.items.forEach((item, index) => {
    const title = normalizeText(item.title);
    const hook = normalizeText(item.hook);
    if (titles.has(title)) {
      errors.push(issue("duplicate_title", "Title identik ditemukan.", `items.${index}.title`));
    }
    if (hooks.has(hook)) {
      errors.push(issue("duplicate_hook", "Hook identik ditemukan.", `items.${index}.hook`));
    }
    titles.set(title, index);
    hooks.set(hook, index);
    ctaCounts.set(normalizeText(item.cta_text), (ctaCounts.get(normalizeText(item.cta_text)) || 0) + 1);
    if (item.primary_offer_code) offerCounts.set(item.primary_offer_code, (offerCounts.get(item.primary_offer_code) || 0) + 1);
    if (item.primary_pain_point_code) painCounts.set(item.primary_pain_point_code, (painCounts.get(item.primary_pain_point_code) || 0) + 1);
  });

  const warningThreshold = Math.max(3, Math.ceil(draft.items.length * 0.6));
  for (const [cta, count] of ctaCounts) {
    if (count > warningThreshold) {
      warnings.push(issue("cta_repeated_often", `CTA terlalu sering sama: ${cta}`, "items"));
    }
  }
  for (const [offer, count] of offerCounts) {
    if (count > warningThreshold) {
      warnings.push(issue("offer_repeated_often", `Offer terlalu sering berulang: ${offer}`, "items"));
    }
  }
  for (const [painPoint, count] of painCounts) {
    if (count > warningThreshold) {
      warnings.push(issue("pain_point_repeated_often", `Pain point terlalu sering berulang: ${painPoint}`, "items"));
    }
  }

  return { errors, warnings };
}

export function validateCampaignPlanDraft(input: CampaignPlannerInput, draft: CampaignPlanDraft) {
  const schema = CampaignPlanDraftSchema.safeParse(draft);
  const schemaErrors = schema.success
    ? []
    : schema.error.issues.map((item) => issue("schema_validation_failed", item.message, item.path.join(".")));
  if (!schema.success) {
    return { errors: schemaErrors, warnings: [] };
  }

  const reference = validateReferencesAndBusinessRules(input, schema.data);
  const claims = validateClaims(schema.data);
  const duplicate = validateDuplicatesAndDiversity(schema.data);

  return {
    errors: [...reference.errors, ...claims.errors, ...duplicate.errors],
    warnings: [...reference.warnings, ...claims.warnings, ...duplicate.warnings]
  };
}
