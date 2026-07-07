import { readFileSync } from "node:fs";
import { z } from "zod";
import { ContentEngineSmokeInputSchema } from "./schema.ts";
import type { ContentEngineSmokeInput } from "./types.ts";

export const FootageIntakeManifestRowSchema = z.object({
  footage_id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1).refine((value) => !value.startsWith("/") && !value.includes(".."), "relative_path must be safe and relative"),
  product_family: z.string().min(1),
  visual_type: z.string().min(1),
  duration_sec: z.number().int().positive(),
  orientation: z.enum(["vertical", "horizontal", "square"]),
  location: z.string().min(1),
  school_level: z.string().min(1).nullable(),
  content_tags: z.array(z.string().min(1)),
  notes: z.string().min(1),
  usable: z.boolean(),
  risk_flags: z.array(z.string().min(1))
}).strict();

export const FootageIntakeManifestSchema = z.object({
  manifest_version: z.literal("real-footage-intake-smoke-v1"),
  source: z.string().min(1),
  mode: z.literal("metadata_only_fixture"),
  rows: z.array(FootageIntakeManifestRowSchema).min(1)
}).strict();

export type FootageIntakeManifestRow = z.infer<typeof FootageIntakeManifestRowSchema>;
export type FootageIntakeManifest = z.infer<typeof FootageIntakeManifestSchema>;

export type FootageIntakeSummary = {
  total_rows: number;
  usable_rows: number;
  blocked_rows: number;
  missing_required_fields: number;
  orientation_breakdown: Record<string, number>;
  product_family_breakdown: Record<string, number>;
  risk_flag_breakdown: Record<string, number>;
};

export type FootageIntakeParseResult = {
  manifest: FootageIntakeManifest;
  summary: FootageIntakeSummary;
  usableRows: FootageIntakeManifestRow[];
  blockedRows: FootageIntakeManifestRow[];
};

export function loadFootageIntakeManifest(filePath: string): FootageIntakeParseResult {
  const parsed = JSON.parse(readFileSync(filePath, "utf8"));
  const manifest = FootageIntakeManifestSchema.parse(parsed);
  const normalizedRows = manifest.rows.map(normalizeFootageRow);
  const normalizedManifest = FootageIntakeManifestSchema.parse({ ...manifest, rows: normalizedRows });
  const usableRows = normalizedManifest.rows.filter((row) => row.usable && row.risk_flags.length === 0);
  const blockedRows = normalizedManifest.rows.filter((row) => !row.usable || row.risk_flags.length > 0);

  return {
    manifest: normalizedManifest,
    summary: summarizeFootageRows(normalizedManifest.rows, usableRows, blockedRows),
    usableRows,
    blockedRows
  };
}

export function buildSmokeInputFromFootageRows(rows: FootageIntakeManifestRow[]): ContentEngineSmokeInput {
  return ContentEngineSmokeInputSchema.parse({
    campaign: {
      code: "PILOT-DESAIN-GRATIS-REAL-FOOTAGE-BATCH-01",
      product: "Sampul Raport",
      theme: "Real footage batch smoke untuk Desain Gratis dan mockup awal",
      month: "2026-07",
      audience: ["SD", "SMP", "SMA", "MI", "MTs", "MA"],
      offer: "Desain Gratis setelah cocok penawaran",
      cta: "MOCKUP",
      channels: ["facebook", "instagram", "tiktok", "youtube"]
    },
    footage: rows.map((row) => ({
      path: row.relative_path,
      owner_note: [
        row.product_family,
        row.visual_type,
        row.school_level ? `jenjang ${row.school_level}` : null,
        row.location,
        row.notes,
        row.content_tags.join(" ")
      ].filter(Boolean).join(". "),
      duration_seconds: row.duration_sec,
      orientation: row.orientation
    }))
  });
}

export function normalizeFootageRow(row: FootageIntakeManifestRow): FootageIntakeManifestRow {
  return FootageIntakeManifestRowSchema.parse({
    ...row,
    product_family: normalizeToken(row.product_family),
    visual_type: normalizeToken(row.visual_type),
    location: normalizeToken(row.location),
    school_level: row.school_level ? normalizeToken(row.school_level) : null,
    content_tags: normalizeStringList(row.content_tags),
    risk_flags: normalizeStringList(row.risk_flags)
  });
}

function summarizeFootageRows(
  rows: FootageIntakeManifestRow[],
  usableRows: FootageIntakeManifestRow[],
  blockedRows: FootageIntakeManifestRow[]
): FootageIntakeSummary {
  return {
    total_rows: rows.length,
    usable_rows: usableRows.length,
    blocked_rows: blockedRows.length,
    missing_required_fields: 0,
    orientation_breakdown: countBy(rows.map((row) => row.orientation)),
    product_family_breakdown: countBy(rows.map((row) => row.product_family)),
    risk_flag_breakdown: countBy(rows.flatMap((row) => row.risk_flags.length ? row.risk_flags : ["none"]))
  };
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
