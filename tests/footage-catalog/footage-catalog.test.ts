import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdtemp, mkdir, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import pg from "pg";
import { createContentItem } from "../../apps/web/src/content-item-service.ts";
import {
  addContentItemFootageSelection,
  getContentItemFootageSelection,
  listContentItemFootageSelections,
  removeContentItemFootageSelection,
  removeContentItemFootageSelectionForContentItem,
  updateContentItemFootageSelection,
  updateContentItemFootageSelectionForContentItem
} from "../../apps/web/src/content-item-footage-service.ts";
import {
  batchUpdateFootageAssets,
  createFootageAsset,
  getFootageAsset,
  listFootageAssets,
  updateFootageAsset
} from "../../apps/web/src/footage-asset-service.ts";
import {
  importFootageScan,
  scanFootageDirectory
} from "../../apps/web/src/footage-scan-service.ts";
import { closeDatabase } from "../../apps/web/src/db.ts";
import { handleContentItemApiRoute } from "../../apps/web/src/routes/content-item-api-routes.ts";
import { handleContentItemPageGet } from "../../apps/web/src/routes/content-item-page-routes.ts";
import {
  validateFootageAssetInput,
  validateFootageRelativePath
} from "../../apps/web/src/validation/footage-asset-validation.ts";
import { validateContentItemFootageSelectionInput } from "../../apps/web/src/validation/content-item-footage-validation.ts";

const databaseUrl = process.env.TEST_DATABASE_URL;
const shouldRun = Boolean(databaseUrl);
const { Pool } = pg;
const pool = databaseUrl ? new Pool({ connectionString: databaseUrl, max: 4 }) : null;
const prefix = `footage-catalog-${process.pid}-${Date.now()}`;
const tempDirs: string[] = [];
const campaignIds: string[] = [];

function maybeTest(name: string, fn: Parameters<typeof test>[1]) {
  test(name, { skip: shouldRun ? false : "TEST_DATABASE_URL tidak tersedia." }, fn);
}

async function getProductId(code = "sampul_raport"): Promise<string> {
  const result = await pool!.query<{ id: string }>(`SELECT id FROM products WHERE code = $1`, [code]);
  assert.ok(result.rows[0]?.id);
  return result.rows[0].id;
}

test.after(async () => {
  if (pool) {
    const campaigns = await pool.query<{ id: string }>(`SELECT id FROM campaigns WHERE id = ANY($1::uuid[]) OR code LIKE $2`, [
      campaignIds,
      `${prefix}-%`
    ]);
    const ids = campaigns.rows.map((row) => row.id);
    if (ids.length) {
      await pool.query(
        `DELETE FROM content_item_footage_selections
         WHERE content_item_id IN (SELECT id FROM content_items WHERE campaign_id = ANY($1::uuid[]))`,
        [ids]
      );
      await pool.query(`DELETE FROM content_items WHERE campaign_id = ANY($1::uuid[])`, [ids]);
      await pool.query(`DELETE FROM campaigns WHERE id = ANY($1::uuid[])`, [ids]);
    }
    await pool.query(`DELETE FROM footage_assets WHERE relative_path LIKE $1`, [`${prefix}/%`]);
    await pool.query(`DELETE FROM products WHERE code LIKE $1`, [`${prefix}-%`]);
    await pool.end();
  }
  for (const dir of tempDirs) {
    await rm(dir, { recursive: true, force: true });
  }
  await closeDatabase();
});

async function createTempFootageRoot(): Promise<{ storageRoot: string; footageRoot: string }> {
  const storageRoot = await mkdtemp(join(tmpdir(), `${prefix}-storage-`));
  tempDirs.push(storageRoot);
  const footageRoot = join(storageRoot, "footage");
  await mkdir(footageRoot, { recursive: true });
  return { storageRoot, footageRoot };
}

async function createProduct(active = true): Promise<string> {
  const code = `${prefix}-${active ? "active" : "inactive"}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const result = await pool!.query<{ id: string }>(
    `INSERT INTO products (code, name, active, sort_order) VALUES ($1, $2, $3, 999) RETURNING id`,
    [code, `Test ${code}`, active]
  );
  return result.rows[0].id;
}

async function createCampaign(codeSuffix: string): Promise<string> {
  const code = `${prefix}-${codeSuffix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const result = await pool!.query<{ id: string }>(
    `INSERT INTO campaigns (code, name, start_date, end_date, target_audience, status)
     VALUES ($1, $2, $3, $4, $5, 'active')
     RETURNING id`,
    [code, `Footage Selection ${codeSuffix}`, "2026-07-01", "2026-07-31", "TU Sekolah"]
  );
  campaignIds.push(result.rows[0].id);
  return result.rows[0].id;
}

async function createContent(codeSuffix: string): Promise<string> {
  const campaignId = await createCampaign(codeSuffix);
  const content = await createContentItem({
    campaign_id: campaignId,
    title: `Footage selection ${codeSuffix}`,
    planned_content_date: "2026-07-10",
    audience_segment: "end_user_school",
    target_audience: "Kepala sekolah",
    content_pillar: "product_proof",
    hook: "Hook footage selection",
    angle: "Angle footage selection",
    cta_text: "Chat WA",
    notes: "Footage selection test."
  });
  return content.id;
}

async function createFootage(relativeName: string, status: string) {
  return createFootageAsset({
    relative_path: `${prefix}/${relativeName}`,
    size_bytes: 123,
    status,
    shot_type: "product",
    theme: `Selection ${relativeName}`,
    quality_score: 4
  });
}

function mockResponse() {
  return {
    statusCode: 0,
    headers: {} as Record<string, string>,
    body: "",
    writeHead(statusCode: number, headers?: Record<string, string>) {
      this.statusCode = statusCode;
      this.headers = headers || {};
    },
    end(body?: string) {
      this.body = body || "";
    }
  };
}

test("footage relative path validation rejects unsafe paths", () => {
  const invalidPaths = [
    "/tmp/video.mp4",
    "C:/Users/Rino/video.mp4",
    "d:/folder/video.mp4",
    "../video.mp4",
    "batch/../video.mp4",
    "batch\\video.mp4",
    "storage/footage/video.mp4",
    "footage/video.mp4",
    "folder/no-extension"
  ];

  for (const invalidPath of invalidPaths) {
    assert.throws(() => validateFootageRelativePath(invalidPath), /path|ekstensi|file/i);
  }

  assert.deepEqual(validateFootageRelativePath("batch-01/produk/SR-001.MP4"), {
    relative_path: "batch-01/produk/SR-001.MP4",
    filename: "SR-001.MP4",
    file_extension: "mp4"
  });
});

test("footage input validation derives filename and rejects raw derived identity", () => {
  const value = validateFootageAssetInput({
    relative_path: `${prefix}/valid-video.mov`,
    size_bytes: "12345",
    status: "",
    shot_type: "product",
    quality_score: "4"
  });

  assert.equal(value.filename, "valid-video.mov");
  assert.equal(value.file_extension, "mov");
  assert.equal(value.status, "new");
  assert.equal(value.size_bytes, 12345);
  assert.equal(value.quality_score, 4);

  assert.throws(
    () => validateFootageAssetInput({ relative_path: `${prefix}/x.mp4`, filename: "x.mp4", size_bytes: 1 }),
    /diturunkan/
  );
});

maybeTest("footage service create, list, detail, update, filters, duplicate guard", async () => {
  const productId = await getProductId();
  const created = await createFootageAsset({
    relative_path: `${prefix}/raport-maroon-001.mp4`,
    size_bytes: 2048,
    status: "new",
    product_id: productId,
    school_level: "sd",
    theme: "Raport maroon",
    shot_type: "product",
    quality_score: 3,
    notes: "Footage katalog test."
  });

  assert.equal(created.filename, "raport-maroon-001.mp4");
  assert.equal(created.file_extension, "mp4");
  assert.equal(created.product_code, "sampul_raport");
  assert.equal(created.status, "new");

  const detail = await getFootageAsset(created.id);
  assert.equal(detail.relative_path, created.relative_path);

  const filtered = await listFootageAssets({
    status: "new",
    product_code: "sampul_raport",
    theme: "maroon",
    shot_type: "product"
  });
  assert.equal(filtered.some((item) => item.id === created.id), true);

  const updated = await updateFootageAsset(created.id, {
    relative_path: `${prefix}/packing-001.mp4`,
    size_bytes: 4096,
    status: "reviewed",
    product_id: productId,
    school_level: "umum",
    theme: "Packing",
    shot_type: "packing",
    quality_score: "",
    notes: ""
  });

  assert.equal(updated.filename, "packing-001.mp4");
  assert.equal(updated.status, "reviewed");
  assert.equal(updated.school_level, "umum");
  assert.equal(updated.quality_score, null);
  assert.equal(updated.notes, null);

  await assert.rejects(
    () => createFootageAsset({ relative_path: updated.relative_path, size_bytes: 1, shot_type: "other" }),
    /sudah tercatat/
  );
});

maybeTest("footage scan reads regular files, validates relative paths, and ignores non-files", async () => {
  const { storageRoot, footageRoot } = await createTempFootageRoot();
  await mkdir(join(footageRoot, prefix, "nested"), { recursive: true });
  await writeFile(join(footageRoot, prefix, "clip-a.MP4"), "abc");
  await writeFile(join(footageRoot, prefix, "nested", "clip-b.mov"), "abcdef");
  await writeFile(join(footageRoot, prefix, "no-extension"), "unsafe");

  const result = await scanFootageDirectory({ storageRoot });
  assert.deepEqual(
    result.files.map((file) => ({
      relative_path: file.relative_path,
      filename: file.filename,
      file_extension: file.file_extension,
      size_bytes: file.size_bytes,
      cataloged: file.cataloged
    })),
    [
      {
        relative_path: `${prefix}/clip-a.MP4`,
        filename: "clip-a.MP4",
        file_extension: "mp4",
        size_bytes: 3,
        cataloged: false
      },
      {
        relative_path: `${prefix}/nested/clip-b.mov`,
        filename: "clip-b.mov",
        file_extension: "mov",
        size_bytes: 6,
        cataloged: false
      }
    ]
  );
  assert.equal(result.skipped.some((item) => item.relative_path === `${prefix}/no-extension`), true);
});

maybeTest("footage scan import creates metadata only and skips existing catalog records", async () => {
  const { storageRoot, footageRoot } = await createTempFootageRoot();
  await mkdir(join(footageRoot, prefix), { recursive: true });
  const existingPath = join(footageRoot, prefix, "existing.mp4");
  const missingPath = join(footageRoot, prefix, "missing.mp4");
  await writeFile(existingPath, "existing");
  await writeFile(missingPath, "missing");

  await createFootageAsset({
    relative_path: `${prefix}/existing.mp4`,
    size_bytes: 8,
    status: "new",
    shot_type: "product"
  });

  const beforeExisting = await stat(existingPath);
  const beforeMissing = await stat(missingPath);
  const result = await importFootageScan({}, { storageRoot });
  const afterExisting = await stat(existingPath);
  const afterMissing = await stat(missingPath);

  assert.deepEqual(result.created.map((file) => file.relative_path), [`${prefix}/missing.mp4`]);
  assert.deepEqual(result.skipped_existing.map((file) => file.relative_path), [`${prefix}/existing.mp4`]);
  assert.equal(result.skipped_unsafe.length, 0);

  const rows = await pool!.query<{ relative_path: string; status: string; shot_type: string; size_bytes: string }>(
    `SELECT relative_path, status, shot_type, size_bytes
     FROM footage_assets
     WHERE relative_path IN ($1, $2)
     ORDER BY relative_path`,
    [`${prefix}/existing.mp4`, `${prefix}/missing.mp4`]
  );
  assert.deepEqual(rows.rows, [
    {
      relative_path: `${prefix}/existing.mp4`,
      status: "new",
      shot_type: "product",
      size_bytes: "8"
    },
    {
      relative_path: `${prefix}/missing.mp4`,
      status: "new",
      shot_type: "other",
      size_bytes: "7"
    }
  ]);

  assert.equal(afterExisting.size, beforeExisting.size);
  assert.equal(afterExisting.mtimeMs, beforeExisting.mtimeMs);
  assert.equal(afterMissing.size, beforeMissing.size);
  assert.equal(afterMissing.mtimeMs, beforeMissing.mtimeMs);
});

maybeTest("footage batch update validates ids and enum fields", async () => {
  const missingValidId = "11111111-1111-4111-8111-111111111111";
  await assert.rejects(
    () => batchUpdateFootageAssets({ ids: [], updates: { status: "reviewed" } }),
    /minimal satu footage/i
  );
  await assert.rejects(
    () => batchUpdateFootageAssets({ ids: ["not-a-uuid"], updates: { status: "reviewed" } }),
    /ID tidak valid/i
  );
  await assert.rejects(
    () => batchUpdateFootageAssets({ ids: [missingValidId], updates: { status: "done" } }),
    /Status footage tidak valid/i
  );
  await assert.rejects(
    () => batchUpdateFootageAssets({ ids: [missingValidId], updates: { shot_type: "b-roll" } }),
    /Shot type footage tidak valid/i
  );
  await assert.rejects(
    () => batchUpdateFootageAssets({ ids: [missingValidId], updates: { school_level: "smk" } }),
    /Jenjang footage tidak valid/i
  );
});

maybeTest("footage batch update rejects missing and inactive product", async () => {
  const created = await createFootageAsset({
    relative_path: `${prefix}/batch-product.mp4`,
    size_bytes: 10,
    status: "new",
    shot_type: "other"
  });
  const inactiveProductId = await createProduct(false);

  await assert.rejects(
    () =>
      batchUpdateFootageAssets({
        ids: [created.id],
        updates: { product_id: "11111111-1111-4111-8111-111111111111" }
      }),
    /Produk tidak ditemukan/i
  );
  await assert.rejects(
    () =>
      batchUpdateFootageAssets({
        ids: [created.id],
        updates: { product_id: inactiveProductId }
      }),
    /Produk footage harus aktif/i
  );
});

maybeTest("footage batch update changes allowed metadata only and incomplete filter works", async () => {
  const productId = await getProductId();
  const first = await createFootageAsset({
    relative_path: `${prefix}/batch-first.mp4`,
    size_bytes: 111,
    status: "new",
    shot_type: "other"
  });
  const second = await createFootageAsset({
    relative_path: `${prefix}/batch-second.mp4`,
    size_bytes: 222,
    status: "new",
    shot_type: "product"
  });

  const result = await batchUpdateFootageAssets({
    ids: [first.id, second.id],
    updates: {
      status: "reviewed",
      shot_type: "packing",
      school_level: "sd",
      theme: "Batch review",
      product_id: productId,
      quality_score: 4,
      notes: "Metadata batch review."
    }
  });
  assert.equal(result.requested_count, 2);
  assert.equal(result.updated_count, 2);

  const firstUpdated = await getFootageAsset(first.id);
  assert.equal(firstUpdated.relative_path, first.relative_path);
  assert.equal(firstUpdated.filename, first.filename);
  assert.equal(firstUpdated.file_extension, first.file_extension);
  assert.equal(firstUpdated.size_bytes, first.size_bytes);
  assert.equal(firstUpdated.status, "reviewed");
  assert.equal(firstUpdated.shot_type, "packing");
  assert.equal(firstUpdated.school_level, "sd");
  assert.equal(firstUpdated.theme, "Batch review");
  assert.equal(firstUpdated.product_id, productId);
  assert.equal(firstUpdated.quality_score, 4);
  assert.equal(firstUpdated.notes, "Metadata batch review.");

  const incomplete = await listFootageAssets({ incomplete: true, theme: "Batch review" });
  assert.equal(incomplete.some((item) => item.id === first.id || item.id === second.id), false);

  await batchUpdateFootageAssets({
    ids: [first.id],
    updates: { quality_score: null }
  });
  const incompleteAfterClear = await listFootageAssets({ incomplete: true, theme: "Batch review" });
  assert.equal(incompleteAfterClear.some((item) => item.id === first.id), true);
});

maybeTest("footage batch update does not mutate physical files", async () => {
  const { storageRoot, footageRoot } = await createTempFootageRoot();
  await mkdir(join(footageRoot, prefix), { recursive: true });
  const filePath = join(footageRoot, prefix, "batch-file.mp4");
  await writeFile(filePath, "batch-metadata-only");
  const before = await stat(filePath);
  const imported = await importFootageScan({}, { storageRoot });
  const created = imported.created.find((item) => item.relative_path === `${prefix}/batch-file.mp4`);
  assert.ok(created);
  const rows = await pool!.query<{ id: string }>(`SELECT id FROM footage_assets WHERE relative_path = $1`, [
    `${prefix}/batch-file.mp4`
  ]);

  await batchUpdateFootageAssets({
    ids: [rows.rows[0].id],
    updates: { status: "reviewed", shot_type: "workshop", quality_score: 5 }
  });
  const after = await stat(filePath);

  assert.equal(after.size, before.size);
  assert.equal(after.mtimeMs, before.mtimeMs);
});

maybeTest("content footage selection adds reviewed and approved footage and lists in sequence", async () => {
  const contentItemId = await createContent("selection-add");
  const reviewed = await createFootage("selection-reviewed.mp4", "reviewed");
  const approved = await createFootage("selection-approved.mp4", "approved");

  const first = await addContentItemFootageSelection(contentItemId, {
    footage_asset_id: reviewed.id,
    sequence_number: 2,
    role: "product",
    usage_note: "Product middle shot."
  });
  const second = await addContentItemFootageSelection(contentItemId, {
    footage_asset_id: approved.id,
    sequence_number: 1,
    role: "opening",
    usage_note: "Opening shot."
  });

  assert.equal(first.footage_asset_id, reviewed.id);
  assert.equal(first.role, "product");
  assert.equal(second.footage_asset_id, approved.id);
  assert.equal(second.role, "opening");

  const selections = await listContentItemFootageSelections(contentItemId);
  assert.deepEqual(selections.map((selection) => selection.sequence_number), [1, 2]);
  assert.deepEqual(selections.map((selection) => selection.footage_asset_id), [approved.id, reviewed.id]);
});

maybeTest("content footage selection rejects new footage, duplicate footage, and duplicate sequence", async () => {
  const contentItemId = await createContent("selection-guards");
  const newFootage = await createFootage("selection-new.mp4", "new");
  const reviewed = await createFootage("selection-duplicate.mp4", "reviewed");
  const secondReviewed = await createFootage("selection-sequence.mp4", "reviewed");

  await assert.rejects(
    () =>
      addContentItemFootageSelection(contentItemId, {
        footage_asset_id: newFootage.id,
        sequence_number: 1,
        role: "product"
      }),
    /reviewed atau approved/i
  );

  await addContentItemFootageSelection(contentItemId, {
    footage_asset_id: reviewed.id,
    sequence_number: 1,
    role: "product"
  });

  await assert.rejects(
    () =>
      addContentItemFootageSelection(contentItemId, {
        footage_asset_id: reviewed.id,
        sequence_number: 2,
        role: "product"
      }),
    /sudah dipilih/i
  );

  await assert.rejects(
    () =>
      addContentItemFootageSelection(contentItemId, {
        footage_asset_id: secondReviewed.id,
        sequence_number: 1,
        role: "packing"
      }),
    /Urutan footage sudah dipakai/i
  );
});

maybeTest("content footage selection validates UUID, role, and positive sequence", async () => {
  assert.throws(
    () => validateContentItemFootageSelectionInput({ footage_asset_id: "not-a-uuid", sequence_number: 1, role: "product" }),
    /ID tidak valid/i
  );
  assert.throws(
    () =>
      validateContentItemFootageSelectionInput({
        footage_asset_id: "11111111-1111-4111-8111-111111111111",
        sequence_number: 0,
        role: "product"
      }),
    /angka positif/i
  );
  assert.throws(
    () =>
      validateContentItemFootageSelectionInput({
        footage_asset_id: "11111111-1111-4111-8111-111111111111",
        sequence_number: 1,
        role: "hero"
      }),
    /Role footage/i
  );
});

maybeTest("content footage selection updates metadata only", async () => {
  const contentItemId = await createContent("selection-update");
  const reviewed = await createFootage("selection-update.mp4", "reviewed");
  const created = await addContentItemFootageSelection(contentItemId, {
    footage_asset_id: reviewed.id,
    sequence_number: 1,
    role: "product",
    usage_note: "Initial note."
  });

  const updated = await updateContentItemFootageSelection(created.id, {
    sequence_number: 3,
    role: "closing",
    usage_note: "Closing note."
  });

  assert.equal(updated.id, created.id);
  assert.equal(updated.content_item_id, contentItemId);
  assert.equal(updated.footage_asset_id, reviewed.id);
  assert.equal(updated.sequence_number, 3);
  assert.equal(updated.role, "closing");
  assert.equal(updated.usage_note, "Closing note.");
  assert.equal(updated.relative_path, reviewed.relative_path);
  assert.equal(updated.filename, reviewed.filename);
  assert.equal(updated.file_extension, reviewed.file_extension);
  assert.equal(updated.size_bytes, reviewed.size_bytes);
});

maybeTest("content footage selection remove keeps footage row and physical file untouched", async () => {
  const { storageRoot, footageRoot } = await createTempFootageRoot();
  await mkdir(join(footageRoot, prefix), { recursive: true });
  const filePath = join(footageRoot, prefix, "selection-physical.mp4");
  await writeFile(filePath, "selection-metadata-only");
  const before = await stat(filePath);

  const contentItemId = await createContent("selection-remove");
  const reviewed = await createFootage("selection-physical.mp4", "reviewed");
  const selection = await addContentItemFootageSelection(contentItemId, {
    footage_asset_id: reviewed.id,
    sequence_number: 1,
    role: "product"
  });

  const removed = await removeContentItemFootageSelection(selection.id);
  const after = await stat(filePath);
  const footageAfter = await getFootageAsset(reviewed.id);
  const selections = await listContentItemFootageSelections(contentItemId);

  assert.equal(removed.removed, true);
  assert.equal(selections.length, 0);
  assert.equal(footageAfter.id, reviewed.id);
  assert.equal(footageAfter.relative_path, reviewed.relative_path);
  assert.equal(after.size, before.size);
  assert.equal(after.mtimeMs, before.mtimeMs);
  assert.equal(storageRoot.includes(prefix), true);
});

maybeTest("content footage page-safe update and remove reject mismatched content ownership", async () => {
  const contentItemA = await createContent("selection-owner-a");
  const contentItemB = await createContent("selection-owner-b");
  const reviewed = await createFootage("selection-owner.mp4", "reviewed");
  const selection = await addContentItemFootageSelection(contentItemB, {
    footage_asset_id: reviewed.id,
    sequence_number: 1,
    role: "product",
    usage_note: "Owned by content B."
  });

  await assert.rejects(
    () =>
      updateContentItemFootageSelectionForContentItem(contentItemA, selection.id, {
        sequence_number: 2,
        role: "closing",
        usage_note: "Should not update."
      }),
    /tidak dimiliki konten ini/i
  );

  let afterRejectedUpdate = await getContentItemFootageSelection(selection.id);
  assert.equal(afterRejectedUpdate.content_item_id, contentItemB);
  assert.equal(afterRejectedUpdate.sequence_number, 1);
  assert.equal(afterRejectedUpdate.role, "product");
  assert.equal(afterRejectedUpdate.usage_note, "Owned by content B.");

  await assert.rejects(
    () => removeContentItemFootageSelectionForContentItem(contentItemA, selection.id),
    /tidak dimiliki konten ini/i
  );

  afterRejectedUpdate = await getContentItemFootageSelection(selection.id);
  assert.equal(afterRejectedUpdate.content_item_id, contentItemB);
  assert.equal(afterRejectedUpdate.footage_asset_id, reviewed.id);
});

maybeTest("content footage selection missing rows return typed errors", async () => {
  await assert.rejects(
    () => listContentItemFootageSelections("11111111-1111-4111-8111-111111111111"),
    /Content item tidak ditemukan/i
  );
  await assert.rejects(
    () => getContentItemFootageSelection("11111111-1111-4111-8111-111111111111"),
    /Pilihan footage konten tidak ditemukan/i
  );
});

maybeTest("content footage selection page and API route before generic content detail", async () => {
  const contentItemId = await createContent("selection-route");
  const reviewed = await createFootage("selection-route.mp4", "reviewed");
  await addContentItemFootageSelection(contentItemId, {
    footage_asset_id: reviewed.id,
    sequence_number: 1,
    role: "opening"
  });

  const pageResponse = mockResponse();
  const pageHandled = await handleContentItemPageGet(
    pageResponse,
    `/content-items/${contentItemId}/footage`,
    new URL(`http://localhost/content-items/${contentItemId}/footage`)
  );
  assert.equal(pageHandled, true);
  assert.equal(pageResponse.statusCode, 200);
  assert.match(pageResponse.body, /Content Footage Selection/);
  assert.match(pageResponse.body, /Tidak ada file footage yang dipindah/);

  const apiResponse = mockResponse();
  const apiHandled = await handleContentItemApiRoute(
    { method: "GET", url: `/api/content-items/${contentItemId}/footage`, headers: {}, on() {} } as any,
    apiResponse,
    `/api/content-items/${contentItemId}/footage`,
    new URL(`http://localhost/api/content-items/${contentItemId}/footage`)
  );
  assert.equal(apiHandled, true);
  assert.equal(apiResponse.statusCode, 200);
  const body = JSON.parse(apiResponse.body);
  assert.equal(body.ok, true);
  assert.equal(body.data[0].footage_asset_id, reviewed.id);
});

test("content footage selection runtime files do not add forbidden AI or automation dependencies", () => {
  const source = [
    "apps/web/src/content-item-footage-service.ts",
    "apps/web/src/routes/content-item-api-routes.ts",
    "apps/web/src/routes/content-item-page-routes.ts",
    "apps/web/src/views/content-item-pages.ts",
    "apps/web/src/validation/content-item-footage-validation.ts"
  ].map((path) => readFileSync(path, "utf8")).join("\n");

  for (const forbidden of ["OpenAI", "openai", "scheduler", "publisher"]) {
    assert.equal(source.includes(forbidden), false);
  }
});
