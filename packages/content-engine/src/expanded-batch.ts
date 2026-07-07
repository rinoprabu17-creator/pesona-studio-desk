import { readFileSync } from "node:fs";
import { z } from "zod";
import { FootageIntakeManifestRowSchema, type FootageIntakeManifestRow } from "./intake.ts";

const ExpandedChannelFitSchema = z.enum(["facebook", "instagram", "tiktok", "youtube"]);

export const ExpandedFootageBatchRowSchema = z.object({
  footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1).refine((value) => !value.startsWith("/") && !value.includes(".."), "relative_path must be safe and relative"),
  product_family: z.string().min(1),
  visual_type: z.string().min(1),
  process_stage: z.string().min(1),
  duration_sec: z.number().int().positive(),
  orientation: z.enum(["vertical", "horizontal", "square"]),
  location: z.string().min(1),
  school_level: z.string().min(1).nullable(),
  color_variant: z.string().min(1).nullable(),
  content_tags: z.array(z.string().min(1)).min(1),
  notes: z.string().min(1),
  usable: z.boolean(),
  risk_flags: z.array(z.string().min(1)),
  recommended_use: z.array(z.string().min(1)).min(1),
  channel_fit: z.array(ExpandedChannelFitSchema).min(1),
  quality_score: z.number().int().min(0).max(100)
}).strict();

export const ExpandedFootageBatchManifestSchema = z.object({
  manifest_version: z.literal("real-footage-expanded-batch-smoke-v1"),
  source: z.string().min(1),
  mode: z.literal("metadata_only_fixture"),
  rows: z.array(ExpandedFootageBatchRowSchema).min(30)
}).strict();

export type ExpandedFootageBatchRow = z.infer<typeof ExpandedFootageBatchRowSchema>;
export type ExpandedFootageBatchManifest = z.infer<typeof ExpandedFootageBatchManifestSchema>;

export type ExpandedBatchSummary = {
  total_rows: number;
  usable_rows: number;
  blocked_rows: number;
  missing_required_fields: number;
  product_family_breakdown: Record<string, number>;
  process_stage_breakdown: Record<string, number>;
  visual_type_breakdown: Record<string, number>;
  orientation_breakdown: Record<string, number>;
  channel_fit_breakdown: Record<string, number>;
  school_level_breakdown: Record<string, number>;
  color_variant_breakdown: Record<string, number>;
  risk_flag_breakdown: Record<string, number>;
  average_quality_score: number;
  low_quality_count: number;
  metadata_coverage_gaps: string[];
};

export type ExpandedBatchParseResult = {
  manifest: ExpandedFootageBatchManifest;
  summary: ExpandedBatchSummary;
  usableRows: ExpandedFootageBatchRow[];
  blockedRows: ExpandedFootageBatchRow[];
  pipelineRows: FootageIntakeManifestRow[];
  usablePipelineRows: FootageIntakeManifestRow[];
};

export function loadExpandedFootageBatch(filePath: string): ExpandedBatchParseResult {
  const parsed = JSON.parse(readFileSync(filePath, "utf8"));
  const manifest = ExpandedFootageBatchManifestSchema.parse(parsed);
  const normalizedRows = manifest.rows.map(normalizeExpandedRow);
  const normalizedManifest = ExpandedFootageBatchManifestSchema.parse({ ...manifest, rows: normalizedRows });
  const usableRows = normalizedManifest.rows.filter((row) => row.usable && row.risk_flags.length === 0);
  const blockedRows = normalizedManifest.rows.filter((row) => !row.usable || row.risk_flags.length > 0);
  const pipelineRows = normalizedManifest.rows.map(toFootageIntakeRow);
  return {
    manifest: normalizedManifest,
    summary: summarizeExpandedBatch(normalizedManifest.rows, usableRows, blockedRows),
    usableRows,
    blockedRows,
    pipelineRows,
    usablePipelineRows: pipelineRows.filter((row) => row.usable && row.risk_flags.length === 0)
  };
}

function normalizeExpandedRow(row: ExpandedFootageBatchRow): ExpandedFootageBatchRow {
  return ExpandedFootageBatchRowSchema.parse({
    ...row,
    product_family: normalizeToken(row.product_family),
    visual_type: normalizeToken(row.visual_type),
    process_stage: normalizeToken(row.process_stage),
    location: normalizeToken(row.location),
    school_level: row.school_level ? normalizeToken(row.school_level) : null,
    color_variant: row.color_variant ? normalizeToken(row.color_variant) : null,
    content_tags: normalizeStringList(row.content_tags),
    risk_flags: normalizeStringList(row.risk_flags),
    recommended_use: normalizeStringList(row.recommended_use)
  });
}

function toFootageIntakeRow(row: ExpandedFootageBatchRow): FootageIntakeManifestRow {
  return FootageIntakeManifestRowSchema.parse({
    footage_id: row.footage_id,
    filename: row.filename,
    relative_path: row.relative_path,
    product_family: row.product_family,
    visual_type: row.visual_type,
    duration_sec: row.duration_sec,
    orientation: row.orientation,
    location: row.location,
    school_level: row.school_level,
    content_tags: row.content_tags,
    notes: [
      row.notes,
      `process ${row.process_stage}`,
      row.color_variant ? `color ${row.color_variant}` : null,
      `recommended ${row.recommended_use.join(" ")}`
    ].filter(Boolean).join(". "),
    usable: row.usable,
    risk_flags: row.risk_flags
  });
}

function summarizeExpandedBatch(
  rows: ExpandedFootageBatchRow[],
  usableRows: ExpandedFootageBatchRow[],
  blockedRows: ExpandedFootageBatchRow[]
): ExpandedBatchSummary {
  return {
    total_rows: rows.length,
    usable_rows: usableRows.length,
    blocked_rows: blockedRows.length,
    missing_required_fields: 0,
    product_family_breakdown: countBy(rows.map((row) => row.product_family)),
    process_stage_breakdown: countBy(rows.map((row) => row.process_stage)),
    visual_type_breakdown: countBy(rows.map((row) => row.visual_type)),
    orientation_breakdown: countBy(rows.map((row) => row.orientation)),
    channel_fit_breakdown: countBy(rows.flatMap((row) => row.channel_fit)),
    school_level_breakdown: countBy(rows.map((row) => row.school_level || "unspecified")),
    color_variant_breakdown: countBy(rows.map((row) => row.color_variant || "unspecified")),
    risk_flag_breakdown: countBy(rows.flatMap((row) => row.risk_flags.length ? row.risk_flags : ["none"])),
    average_quality_score: average(rows.map((row) => row.quality_score)),
    low_quality_count: rows.filter((row) => row.quality_score < 60).length,
    metadata_coverage_gaps: detectCoverageGaps(rows, usableRows)
  };
}

function detectCoverageGaps(rows: ExpandedFootageBatchRow[], usableRows: ExpandedFootageBatchRow[]): string[] {
  const gaps: string[] = [];
  if (usableRows.filter((row) => row.product_family === "map_ijazah").length < 6) gaps.push("map_ijazah_usable_footage_below_6");
  if (usableRows.filter((row) => row.process_stage === "packing_qc").length < 3) gaps.push("packing_qc_coverage_below_3");
  if (usableRows.filter((row) => row.visual_type.includes("close_up")).length < 6) gaps.push("close_up_product_coverage_below_6");
  if (usableRows.filter((row) => row.orientation === "vertical").length < 20) gaps.push("vertical_social_footage_below_20");
  if (usableRows.filter((row) => row.process_stage.includes("process") || row.process_stage.includes("assembly") || row.process_stage.includes("poly") || row.process_stage.includes("penamaan")).length < 8) gaps.push("process_footage_below_8");
  if (usableRows.filter((row) => row.process_stage === "delivery_ready").length < 2) gaps.push("delivery_ready_coverage_below_2");
  if (usableRows.filter((row) => row.content_tags.includes("mockup") || row.recommended_use.includes("cta")).length < 3) gaps.push("cta_mockup_related_coverage_below_3");
  if (usableRows.filter((row) => row.quality_score >= 75).length < 20) gaps.push("usable_high_quality_footage_below_20");
  if (new Set(rows.map((row) => row.product_family)).size < 2) gaps.push("product_family_coverage_below_2");
  return gaps;
}

function normalizeStringList(values: string[]): string[] {
  return Array.from(new Set(values.map(normalizeToken).filter(Boolean))).sort();
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce((accumulator, value) => {
    accumulator[value] = (accumulator[value] || 0) + 1;
    return accumulator;
  }, {} as Record<string, number>);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}
