import { posix as path } from "node:path";
import { FootageAssetError } from "../footage-asset-errors.ts";
import { assertUuid } from "./library-validation.ts";

export type FootageAssetInput = {
  relative_path?: string;
  size_bytes?: unknown;
  status?: string;
  product_id?: string | null;
  school_level?: string | null;
  theme?: string | null;
  shot_type?: string;
  quality_score?: unknown;
  notes?: string | null;
  filename?: unknown;
  file_extension?: unknown;
};

export const footageStatuses = ["new", "reviewed", "approved", "rejected", "archived"] as const;
export const footageSchoolLevels = ["sd", "smp", "sma", "mi", "mts", "ma", "umum"] as const;
export const footageShotTypes = ["product", "process", "packing", "delivery", "workshop", "testimonial", "other"] as const;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNullableText(value: unknown): string | null {
  const text = normalizeText(value);
  return text === "" ? null : text;
}

function normalizeNullableUuid(value: unknown): string | null {
  const id = normalizeNullableText(value);
  if (id) assertUuid(id);
  return id;
}

function parseNonNegativeInteger(value: unknown, code: string, message: string): number {
  if (value === undefined || value === null || value === "") {
    throw new FootageAssetError(code, message, 400);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new FootageAssetError(code, message, 400);
  }
  return parsed;
}

function parseNullableQualityScore(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    throw new FootageAssetError("invalid_quality_score", "Quality score harus kosong atau angka 1 sampai 5.", 400);
  }
  return parsed;
}

export function validateFootageRelativePath(value: unknown): { relative_path: string; filename: string; file_extension: string } {
  const raw = normalizeText(value);
  if (!raw || raw.length > 500) {
    throw new FootageAssetError("invalid_relative_path", "Relative path footage wajib diisi dan maksimal 500 karakter.", 400);
  }

  if (raw.includes("\0") || raw.includes("\\")) {
    throw new FootageAssetError("unsafe_relative_path", "Relative path footage hanya boleh memakai pemisah slash (/).", 400);
  }

  if (path.isAbsolute(raw)) {
    throw new FootageAssetError("unsafe_relative_path", "Relative path footage tidak boleh absolute path.", 400);
  }

  if (/^[a-z]:\//i.test(raw)) {
    throw new FootageAssetError("unsafe_relative_path", "Relative path footage tidak boleh memakai drive path Windows.", 400);
  }

  if (raw.split("/").includes("..")) {
    throw new FootageAssetError("unsafe_relative_path", "Relative path footage tidak boleh memakai parent traversal.", 400);
  }

  const normalized = path.normalize(raw);
  if (normalized === "." || normalized.startsWith("../") || normalized === ".." || normalized.split("/").includes("..")) {
    throw new FootageAssetError("unsafe_relative_path", "Relative path footage tidak boleh memakai parent traversal.", 400);
  }

  if (normalized.startsWith("storage/") || normalized.startsWith("footage/") || normalized === "storage" || normalized === "footage") {
    throw new FootageAssetError("unsafe_relative_path", "Isi path relatif dari dalam storage/footage, bukan path storage penuh.", 400);
  }

  const filename = path.basename(normalized);
  if (!filename || filename === "." || filename === ".." || !filename.includes(".")) {
    throw new FootageAssetError("invalid_filename", "Relative path harus menunjuk file footage dengan ekstensi.", 400);
  }

  const extension = path.extname(filename).replace(/^\./, "").toLowerCase();
  if (!extension || extension.length > 20 || !/^[a-z0-9]+$/.test(extension)) {
    throw new FootageAssetError("invalid_file_extension", "Ekstensi file footage tidak valid.", 400);
  }

  return {
    relative_path: normalized,
    filename,
    file_extension: extension
  };
}

export function validateFootageStatus(value: unknown): string {
  const status = normalizeText(value);
  if (!footageStatuses.includes(status as any)) {
    throw new FootageAssetError("invalid_footage_status", "Status footage tidak valid.", 400);
  }
  return status;
}

export function validateFootageAssetInput(input: FootageAssetInput) {
  if (input.filename !== undefined || input.file_extension !== undefined) {
    throw new FootageAssetError("derived_footage_identity", "Filename dan ekstensi footage diturunkan dari relative path.", 400);
  }

  const pathParts = validateFootageRelativePath(input.relative_path);
  const sizeBytes = parseNonNegativeInteger(input.size_bytes, "invalid_size_bytes", "Ukuran file wajib angka 0 atau lebih.");
  const status = input.status === undefined || input.status === "" ? "new" : validateFootageStatus(input.status);
  const productId = normalizeNullableUuid(input.product_id);

  const schoolLevel = normalizeNullableText(input.school_level);
  if (schoolLevel && !footageSchoolLevels.includes(schoolLevel as any)) {
    throw new FootageAssetError("invalid_school_level", "Jenjang footage tidak valid.", 400);
  }

  const theme = normalizeNullableText(input.theme);
  if (theme && theme.length > 160) {
    throw new FootageAssetError("invalid_theme", "Tema footage maksimal 160 karakter.", 400);
  }

  const shotType = normalizeText(input.shot_type) || "other";
  if (!footageShotTypes.includes(shotType as any)) {
    throw new FootageAssetError("invalid_shot_type", "Shot type footage tidak valid.", 400);
  }

  const qualityScore = parseNullableQualityScore(input.quality_score);
  const notes = normalizeNullableText(input.notes);
  if (notes && notes.length > 2000) {
    throw new FootageAssetError("invalid_notes", "Catatan footage maksimal 2000 karakter.", 400);
  }

  return {
    ...pathParts,
    size_bytes: sizeBytes,
    status,
    product_id: productId,
    school_level: schoolLevel,
    theme,
    shot_type: shotType,
    quality_score: qualityScore,
    notes
  };
}
