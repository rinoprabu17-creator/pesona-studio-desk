import { LibraryError } from "../library-errors.ts";

export type ColorInput = {
  code?: string;
  name?: string;
  hex_preview?: string | null;
  sort_order?: number;
};

export const schoolLevels = ["sd", "smp", "sma", "smk", "mi", "mts", "ma", "other"] as const;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const slugPattern = /^[a-z0-9_]+$/;
const hexPattern = /^#[0-9A-Fa-f]{6}$/;

export function assertUuid(value: string): void {
  if (!uuidPattern.test(value)) {
    throw new LibraryError("invalid_uuid", "ID tidak valid.", 400);
  }
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalHex(value: unknown): string | null {
  const text = normalizeText(value);
  return text === "" ? null : text;
}

function parseSortOrder(value: unknown): number {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new LibraryError("bad_request", "Urutan harus berupa angka bulat.", 400);
  }

  return parsed;
}

export function validateColorInput(input: ColorInput, requireCode: boolean): Required<ColorInput> {
  const code = normalizeText(input.code);
  const name = normalizeText(input.name);
  const hexPreview = normalizeOptionalHex(input.hex_preview);
  const sortOrder = parseSortOrder(input.sort_order);

  if (requireCode && !code) {
    throw new LibraryError("bad_request", "Kode warna wajib diisi.", 400);
  }

  if (code && !slugPattern.test(code)) {
    throw new LibraryError("bad_request", "Kode warna hanya boleh huruf kecil, angka, dan underscore.", 400);
  }

  if (!name) {
    throw new LibraryError("bad_request", "Nama warna wajib diisi.", 400);
  }

  if (hexPreview && !hexPattern.test(hexPreview)) {
    throw new LibraryError("invalid_hex", "Preview hex harus menggunakan format #RRGGBB.", 400);
  }

  return {
    code,
    name,
    hex_preview: hexPreview,
    sort_order: sortOrder
  };
}
