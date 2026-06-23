import { lstat, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { query, withTransaction } from "./db.ts";
import type { DatabaseClient } from "./db.ts";
import { FootageAssetError } from "./footage-asset-errors.ts";
import { validateFootageRelativePath, footageShotTypes } from "./validation/footage-asset-validation.ts";

export type FootageScanFile = {
  relative_path: string;
  filename: string;
  file_extension: string;
  size_bytes: number;
  cataloged: boolean;
};

export type FootageScanSkipped = {
  relative_path: string;
  reason: string;
};

export type FootageScanResult = {
  storage_root: string;
  files: FootageScanFile[];
  skipped: FootageScanSkipped[];
};

export type FootageScanImportInput = {
  shot_type?: string;
};

export type FootageScanImportResult = {
  created: FootageScanFile[];
  skipped_existing: FootageScanFile[];
  skipped_unsafe: FootageScanSkipped[];
};

const maxScanDepth = 20;

function normalizeRelativePath(path: string): string {
  return path.split(sep).join("/");
}

function getFootageRoot(storageRoot?: string): string {
  const root = storageRoot || process.env.APP_STORAGE_DIR || join(process.cwd(), "storage");
  return join(root, "footage");
}

function assertShotType(value: unknown): string {
  const shotType = typeof value === "string" && value.trim() ? value.trim() : "other";
  if (!footageShotTypes.includes(shotType as any)) {
    throw new FootageAssetError("invalid_shot_type", "Shot type footage tidak valid.", 400);
  }
  return shotType;
}

async function existingRelativePaths(paths: string[], client?: DatabaseClient): Promise<Set<string>> {
  if (paths.length === 0) return new Set();
  const sql = `SELECT relative_path FROM footage_assets WHERE relative_path = ANY($1::text[])`;
  const params = [paths];
  const rows = client
    ? (await client.query<{ relative_path: string }>(sql, params)).rows
    : await query<{ relative_path: string }>(sql, params);
  return new Set(rows.map((row) => row.relative_path));
}

async function collectFiles(root: string, current: string, skipped: FootageScanSkipped[], depth: number): Promise<FootageScanFile[]> {
  if (depth > maxScanDepth) {
    skipped.push({ relative_path: normalizeRelativePath(relative(root, current)), reason: "max_depth_exceeded" });
    return [];
  }

  let entries;
  try {
    entries = await readdir(current, { withFileTypes: true });
  } catch (error: any) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }

  const files: FootageScanFile[] = [];
  for (const entry of entries) {
    const fullPath = join(current, entry.name);
    const relativePath = normalizeRelativePath(relative(root, fullPath));

    if (entry.isDirectory()) {
      files.push(...await collectFiles(root, fullPath, skipped, depth + 1));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    try {
      const validated = validateFootageRelativePath(relativePath);
      const stats = await lstat(fullPath);
      if (!stats.isFile()) continue;
      files.push({
        ...validated,
        size_bytes: stats.size,
        cataloged: false
      });
    } catch (error) {
      skipped.push({
        relative_path: relativePath,
        reason: error instanceof Error ? error.message : "Path footage tidak valid."
      });
    }
  }

  return files;
}

export async function scanFootageDirectory(options: { storageRoot?: string } = {}): Promise<FootageScanResult> {
  const root = getFootageRoot(options.storageRoot);
  const skipped: FootageScanSkipped[] = [];
  const files = await collectFiles(root, root, skipped, 0);
  const existing = await existingRelativePaths(files.map((file) => file.relative_path));

  return {
    storage_root: root,
    files: files
      .map((file) => ({ ...file, cataloged: existing.has(file.relative_path) }))
      .sort((a, b) => a.relative_path.localeCompare(b.relative_path)),
    skipped
  };
}

export async function importFootageScan(input: FootageScanImportInput = {}, options: { storageRoot?: string } = {}): Promise<FootageScanImportResult> {
  const shotType = assertShotType(input.shot_type);
  const root = getFootageRoot(options.storageRoot);
  const skipped: FootageScanSkipped[] = [];
  const files = (await collectFiles(root, root, skipped, 0)).sort((a, b) => a.relative_path.localeCompare(b.relative_path));

  return withTransaction(async (client) => {
    const existing = await existingRelativePaths(files.map((file) => file.relative_path), client);
    const created: FootageScanFile[] = [];
    const skippedExisting: FootageScanFile[] = [];

    for (const file of files) {
      if (existing.has(file.relative_path)) {
        skippedExisting.push({ ...file, cataloged: true });
        continue;
      }

      const insert = await client.query<{ id: string }>(
        `INSERT INTO footage_assets (
           relative_path, filename, file_extension, size_bytes, status, shot_type
         )
         VALUES ($1, $2, $3, $4, 'new', $5)
         ON CONFLICT (relative_path) DO NOTHING
         RETURNING id`,
        [file.relative_path, file.filename, file.file_extension, file.size_bytes, shotType]
      );

      if (insert.rows[0]) {
        created.push({ ...file, cataloged: true });
        existing.add(file.relative_path);
      } else {
        skippedExisting.push({ ...file, cataloged: true });
      }
    }

    return {
      created,
      skipped_existing: skippedExisting,
      skipped_unsafe: skipped
    };
  });
}
