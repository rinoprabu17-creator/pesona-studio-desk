import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import net from "node:net";
import { basename, extname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import zlib from "node:zlib";
import type { DatabaseClient } from "./db.ts";
import { pool, query, withTransaction } from "./db.ts";
import { runRealFootageMvpRender } from "../../../packages/content-engine/src/real-footage-mvp-render.ts";

const videoExtensions = new Set([".mp4", ".mov", ".m4v", ".avi", ".mkv"]);
const defaultStorageRoot = () => {
  const configured = process.env.APP_STORAGE_DIR;
  if (configured && (existsSync(configured) || !configured.startsWith("/app/"))) return configured;
  return join(process.cwd(), "storage");
};
const defaultFootageRoot = () => process.env.OPERATIONAL_FOOTAGE_SOURCE_DIR || join(defaultStorageRoot(), "footage");
const videoQueueName = "ops:video-render";
const mockupQueueName = "ops:mockup-render";

export type OperationalSummary = {
  campaigns: number;
  content_items: number;
  footage_assets: number;
  video_jobs: number;
  draft_ready: number;
  schedules_today: number;
  mockup_jobs: number;
  leads: number;
};

export async function getOperationalSummary(): Promise<OperationalSummary> {
  const rows = await query<OperationalSummary>(`
    SELECT
      (SELECT COUNT(*)::int FROM ops_campaigns WHERE status = 'active') AS campaigns,
      (SELECT COUNT(*)::int FROM ops_content_items) AS content_items,
      (SELECT COUNT(*)::int FROM ops_footage_assets) AS footage_assets,
      (SELECT COUNT(*)::int FROM ops_video_jobs WHERE status IN ('queued', 'rendering', 'draft_ready', 'failed')) AS video_jobs,
      (SELECT COUNT(*)::int FROM ops_video_jobs WHERE status = 'draft_ready') AS draft_ready,
      (SELECT COUNT(*)::int FROM ops_posting_schedules WHERE scheduled_at::date = now()::date AND status <> 'posted') AS schedules_today,
      (SELECT COUNT(*)::int FROM ops_mockup_jobs WHERE status IN ('queued', 'rendering', 'ready', 'failed')) AS mockup_jobs,
      (SELECT COUNT(*)::int FROM ops_leads) AS leads
  `);
  return rows[0];
}

export async function createOperationalCampaign(input: {
  name: string;
  product_type: string;
  theme: string;
  start_date: string;
  days?: number;
}): Promise<{ campaign_id: string; content_items_created: number }> {
  const days = Math.min(Math.max(Number(input.days || 30), 1), 30);
  return withTransaction(async (client) => {
    const campaign = await client.query<{ id: string }>(
      `INSERT INTO ops_campaigns (name, product_type, theme, start_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [input.name.trim(), normalizeProduct(input.product_type), input.theme.trim(), input.start_date]
    );
    const campaignId = campaign.rows[0].id;
    for (let index = 0; index < days; index += 1) {
      const planned = addDays(input.start_date, index);
      const item = buildContentItem(input.theme, normalizeProduct(input.product_type), index + 1);
      await client.query(
        `INSERT INTO ops_content_items
          (campaign_id, planned_date, content_code, campaign_theme, angle, caption, hashtags, cta, script_json, shot_list_json, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, 'script_siap')`,
        [
          campaignId,
          planned,
          `PSD-${String(index + 1).padStart(2, "0")}`,
          input.theme,
          item.angle,
          item.caption,
          item.hashtags,
          item.cta,
          JSON.stringify(item.script),
          JSON.stringify(item.shot_list)
        ]
      );
    }
    return { campaign_id: campaignId, content_items_created: days };
  });
}

export async function listOperationalState(): Promise<Record<string, unknown>> {
  const [campaigns, contentItems, footage, videoJobs, schedules, mockups, leads] = await Promise.all([
    query(`SELECT * FROM ops_campaigns ORDER BY created_at DESC LIMIT 20`),
    query(`SELECT * FROM ops_content_items ORDER BY planned_date ASC LIMIT 40`),
    query(`SELECT * FROM ops_footage_assets ORDER BY created_at DESC LIMIT 40`),
    query(`SELECT * FROM ops_video_jobs ORDER BY created_at DESC LIMIT 40`),
    query(`SELECT * FROM ops_posting_schedules ORDER BY scheduled_at ASC LIMIT 40`),
    query(`SELECT * FROM ops_mockup_jobs ORDER BY created_at DESC LIMIT 40`),
    query(`SELECT * FROM ops_leads ORDER BY created_at DESC LIMIT 40`)
  ]);
  return { campaigns, contentItems, footage, videoJobs, schedules, mockups, leads };
}

export async function scanOperationalFootage(sourceRoot = defaultFootageRoot()): Promise<{ scanned: number; stored: number; source_root: string }> {
  const root = resolve(sourceRoot);
  assertSafeReadableRoot(root);
  const files = listVideoFiles(root);
  let stored = 0;
  for (const filePath of files) {
    const fileStat = statSync(filePath);
    const probe = ffprobeVideo(filePath);
    const relativePath = normalizePath(relative(root, filePath));
    const orientation = orientationFor(probe.width, probe.height);
    const tags = inferTags(relativePath);
    await query(
      `INSERT INTO ops_footage_assets
        (source_root, file_path, relative_path, filename, extension, size_bytes, mtime_ms, ffprobe_json,
         duration_seconds, width, height, orientation, qa_status, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (source_root, relative_path) DO UPDATE SET
         size_bytes = EXCLUDED.size_bytes,
         mtime_ms = EXCLUDED.mtime_ms,
         ffprobe_json = EXCLUDED.ffprobe_json,
         duration_seconds = EXCLUDED.duration_seconds,
         width = EXCLUDED.width,
         height = EXCLUDED.height,
         orientation = EXCLUDED.orientation,
         qa_status = EXCLUDED.qa_status,
         tags = EXCLUDED.tags,
         updated_at = now()`,
      [
        root,
        filePath,
        relativePath,
        basename(filePath),
        extname(filePath).toLowerCase(),
        fileStat.size,
        Math.round(fileStat.mtimeMs),
        JSON.stringify(probe),
        probe.duration_seconds,
        probe.width,
        probe.height,
        orientation,
        probe.valid ? "usable" : "invalid",
        tags
      ]
    );
    stored += 1;
  }
  return { scanned: files.length, stored, source_root: root };
}

export async function queueOperationalVideoJob(input: {
  content_item_id: string;
  provider?: string;
  source_root?: string;
  revision_notes?: string;
}): Promise<{ id: string; status: string; redis_enqueued: boolean }> {
  const sourceRoot = resolve(input.source_root || defaultFootageRoot());
  const outputRoot = `storage/draft-videos/operational/${Date.now()}`;
  const rows = await query<{ id: string; status: string }>(
    `INSERT INTO ops_video_jobs (content_item_id, provider, source_root, output_root, revision_notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, status`,
    [input.content_item_id, input.provider || process.env.REAL_FOOTAGE_CONTENT_DIRECTOR_PROVIDER || "mock", sourceRoot, outputRoot, input.revision_notes || null]
  );
  const redis = await redisPush(videoQueueName, rows[0].id);
  await query(`UPDATE ops_content_items SET status = 'draft_dirender', updated_at = now() WHERE id = $1`, [input.content_item_id]);
  return { ...rows[0], redis_enqueued: redis };
}

export async function processOneOperationalVideoJob(): Promise<{ processed: boolean; job_id?: string; status?: string; error?: string }> {
  const redisJobId = await redisPop(videoQueueName);
  const job = await leaseVideoJob(redisJobId || undefined);
  if (!job) return { processed: false };
  try {
    const result = await runRealFootageMvpRender({
      sourceRoot: job.source_root,
      outputRoot: job.output_root,
      outputFilename: "draft.mp4",
      forceMockDirector: job.provider !== "openai"
    });
    await query(
      `UPDATE ops_video_jobs SET
        status = 'draft_ready',
        output_path = $2,
        render_plan_path = $3,
        caption = $4,
        hashtags = $5,
        cta = $6,
        codec_video = $7,
        codec_audio = $8,
        width = $9,
        height = $10,
        pix_fmt = $11,
        duration_seconds = $12,
        size_bytes = $13,
        error_message = NULL,
        finished_at = now(),
        updated_at = now()
       WHERE id = $1`,
      [
        job.id,
        result.output_path,
        result.render_plan_path,
        result.render_plan.caption,
        result.render_plan.hashtags,
        result.render_plan.cta,
        result.output_probe.codec_name,
        result.output_probe.audio_codec_name,
        result.output_probe.width,
        result.output_probe.height,
        result.output_probe.pix_fmt,
        result.output_probe.duration_seconds,
        result.output_size_bytes
      ]
    );
    await query(`UPDATE ops_content_items SET status = 'draft_siap_review', updated_at = now() WHERE id = $1`, [job.content_item_id]);
    return { processed: true, job_id: job.id, status: "draft_ready" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const failedStatus = job.attempts + 1 >= job.max_attempts ? "failed" : "queued";
    await query(
      `UPDATE ops_video_jobs SET status = $2, error_message = $3, finished_at = CASE WHEN $2 = 'failed' THEN now() ELSE finished_at END, updated_at = now()
       WHERE id = $1`,
      [job.id, failedStatus, message]
    );
    if (failedStatus === "queued") await redisPush(videoQueueName, job.id);
    return { processed: true, job_id: job.id, status: failedStatus, error: message };
  }
}

export async function reviewOperationalVideoJob(input: {
  job_id: string;
  action: "approve" | "revision" | "reject";
  notes?: string;
}): Promise<{ job_id: string; status: string; revision_job_id?: string }> {
  if (input.action === "approve") {
    const rows = await query<{ content_item_id: string }>(
      `UPDATE ops_video_jobs SET status = 'approved', revision_notes = $2, updated_at = now()
       WHERE id = $1 RETURNING content_item_id`,
      [input.job_id, input.notes || null]
    );
    if (!rows[0]) throw new Error("video_job_not_found");
    await query(`UPDATE ops_content_items SET status = 'disetujui', updated_at = now() WHERE id = $1`, [rows[0].content_item_id]);
    return { job_id: input.job_id, status: "approved" };
  }
  if (input.action === "reject") {
    await query(`UPDATE ops_video_jobs SET status = 'rejected', revision_notes = $2, updated_at = now() WHERE id = $1`, [input.job_id, input.notes || null]);
    return { job_id: input.job_id, status: "rejected" };
  }
  const source = await query<{ content_item_id: string; provider: string; source_root: string }>(
    `UPDATE ops_video_jobs SET status = 'revision_requested', revision_notes = $2, updated_at = now()
     WHERE id = $1 RETURNING content_item_id, provider, source_root`,
    [input.job_id, input.notes || null]
  );
  if (!source[0]) throw new Error("video_job_not_found");
  await query(`UPDATE ops_content_items SET status = 'perlu_revisi', updated_at = now() WHERE id = $1`, [source[0].content_item_id]);
  const revision = await queueOperationalVideoJob({
    content_item_id: source[0].content_item_id,
    provider: source[0].provider,
    source_root: source[0].source_root,
    revision_notes: input.notes
  });
  return { job_id: input.job_id, status: "revision_requested", revision_job_id: revision.id };
}

export async function scheduleOperationalPost(input: {
  content_item_id: string;
  video_job_id?: string;
  channel: string;
  scheduled_at?: string;
  caption?: string;
}): Promise<{ id: string; status: string }> {
  const scheduledAt = input.scheduled_at || defaultJakartaPublishTime();
  const caption = input.caption || (await query<{ caption: string }>(`SELECT caption FROM ops_content_items WHERE id = $1`, [input.content_item_id]))[0]?.caption || "";
  const rows = await query<{ id: string; status: string }>(
    `INSERT INTO ops_posting_schedules (content_item_id, video_job_id, channel, scheduled_at, caption, status)
     VALUES ($1, $2, $3, $4, $5, 'ready_to_post') RETURNING id, status`,
    [input.content_item_id, input.video_job_id || null, input.channel, scheduledAt, caption]
  );
  await query(`UPDATE ops_content_items SET status = 'dijadwalkan', updated_at = now() WHERE id = $1`, [input.content_item_id]);
  return rows[0];
}

export async function markOperationalPosted(input: { schedule_id: string; posted_url: string }): Promise<{ id: string; status: string }> {
  const rows = await query<{ id: string; status: string; content_item_id: string }>(
    `UPDATE ops_posting_schedules
     SET status = 'posted', posted_url = $2, posted_at = now(), updated_at = now()
     WHERE id = $1 RETURNING id, status, content_item_id`,
    [input.schedule_id, input.posted_url]
  );
  if (rows[0]) await query(`UPDATE ops_content_items SET status = 'terposting', updated_at = now() WHERE id = $1`, [rows[0].content_item_id]);
  return rows[0];
}

export async function queueOperationalMockup(input: {
  school_name: string;
  product_type: string;
  color_mode?: string;
  color_hex?: string;
  city?: string;
  logo_path?: string;
  lead_id?: string;
}): Promise<{ id: string; status: string; redis_enqueued: boolean }> {
  const logoPath = input.logo_path ? assertSafeLogoPath(input.logo_path) : null;
  const rows = await query<{ id: string; status: string }>(
    `INSERT INTO ops_mockup_jobs (lead_id, school_name, product_type, color_mode, color_hex, city, logo_path)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, status`,
    [
      input.lead_id || null,
      input.school_name.trim(),
      normalizeProduct(input.product_type),
      input.color_mode || "auto",
      normalizeColor(input.color_hex || "#6E1F1F"),
      input.city || null,
      logoPath
    ]
  );
  const redis = await redisPush(mockupQueueName, rows[0].id);
  return { ...rows[0], redis_enqueued: redis };
}

export async function processOneOperationalMockupJob(): Promise<{ processed: boolean; job_id?: string; status?: string; output_path?: string; error?: string }> {
  const redisJobId = await redisPop(mockupQueueName);
  const job = await leaseMockupJob(redisJobId || undefined);
  if (!job) return { processed: false };
  try {
    const outputPath = await renderMockupPng(job);
    await query(
      `UPDATE ops_mockup_jobs SET status = 'ready', output_path = $2, error_message = NULL, finished_at = now(), updated_at = now()
       WHERE id = $1`,
      [job.id, outputPath]
    );
    return { processed: true, job_id: job.id, status: "ready", output_path: outputPath };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const failedStatus = job.attempts + 1 >= job.max_attempts ? "failed" : "queued";
    await query(`UPDATE ops_mockup_jobs SET status = $2, error_message = $3, updated_at = now() WHERE id = $1`, [job.id, failedStatus, message]);
    if (failedStatus === "queued") await redisPush(mockupQueueName, job.id);
    return { processed: true, job_id: job.id, status: failedStatus, error: message };
  }
}

export async function createOperationalLead(input: {
  name: string;
  wa?: string;
  school_name?: string;
  channel: string;
  status?: string;
  notes?: string;
  content_item_id?: string;
  mockup_job_id?: string;
}): Promise<{ id: string; status: string }> {
  const rows = await query<{ id: string; status: string }>(
    `INSERT INTO ops_leads (name, wa, school_name, channel, status, notes, content_item_id, mockup_job_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, status`,
    [
      input.name.trim(),
      input.wa || null,
      input.school_name || null,
      input.channel,
      input.status || "WA Masuk",
      input.notes || null,
      input.content_item_id || null,
      input.mockup_job_id || null
    ]
  );
  return rows[0];
}

export async function updateOperationalLead(input: { id: string; status: string; notes?: string }): Promise<{ id: string; status: string }> {
  const rows = await query<{ id: string; status: string }>(
    `UPDATE ops_leads SET status = $2, notes = COALESCE($3, notes), updated_at = now() WHERE id = $1 RETURNING id, status`,
    [input.id, input.status, input.notes || null]
  );
  return rows[0];
}

export async function checkOperationalHealth(): Promise<Record<string, unknown>> {
  const storageReady = existsSync(defaultStorageRoot());
  const databaseReady = await pool.query("SELECT 1").then(() => true).catch(() => false);
  const redisReady = await redisPing();
  return { status: databaseReady && storageReady ? "ok" : "degraded", databaseReady, redisReady, storageReady };
}

async function leaseVideoJob(preferredId?: string): Promise<any | null> {
  return withTransaction(async (client: DatabaseClient) => {
    let rows = preferredId
      ? await client.query(`SELECT * FROM ops_video_jobs WHERE id = $1 AND status = 'queued' LIMIT 1 FOR UPDATE SKIP LOCKED`, [preferredId])
      : { rows: [] };
    if (!rows.rows[0]) {
      rows = await client.query(`SELECT * FROM ops_video_jobs WHERE status = 'queued' ORDER BY queued_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED`);
    }
    const job = rows.rows[0];
    if (!job) return null;
    await client.query(
      `UPDATE ops_video_jobs SET status = 'rendering', attempts = attempts + 1, started_at = now(), updated_at = now() WHERE id = $1`,
      [job.id]
    );
    return job;
  });
}

async function leaseMockupJob(preferredId?: string): Promise<any | null> {
  return withTransaction(async (client: DatabaseClient) => {
    let rows = preferredId
      ? await client.query(`SELECT * FROM ops_mockup_jobs WHERE id = $1 AND status = 'queued' LIMIT 1 FOR UPDATE SKIP LOCKED`, [preferredId])
      : { rows: [] };
    if (!rows.rows[0]) {
      rows = await client.query(`SELECT * FROM ops_mockup_jobs WHERE status = 'queued' ORDER BY queued_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED`);
    }
    const job = rows.rows[0];
    if (!job) return null;
    await client.query(
      `UPDATE ops_mockup_jobs SET status = 'rendering', attempts = attempts + 1, started_at = now(), updated_at = now() WHERE id = $1`,
      [job.id]
    );
    return job;
  });
}

function buildContentItem(theme: string, productType: string, sequence: number): any {
  const productLabel = productType === "sampul_ijazah" ? "Sampul Ijazah" : "Sampul Raport";
  const angle = sequence % 3 === 0 ? "Finishing rapi sebelum dikirim" : sequence % 3 === 1 ? "Preview mockup awal tanpa revisi mockup" : "Desain final setelah cocok penawaran";
  return {
    angle,
    caption: `${productLabel} untuk sekolah yang ingin proses rapi. Mockup awal gratis sebagai preview awal tanpa revisi mockup. Desain final bisa direvisi sampai Desain OK setelah cocok penawaran.`,
    hashtags: ["#SampulRaport", "#SampulIjazah", "#PesonaStudio", "#Sekolah"],
    cta: "Ketik MOCKUP untuk minta preview awal.",
    script: {
      hook: `Sekolah butuh ${productLabel} yang terlihat rapi?`,
      body: `${theme}: tampilkan bahan, proses, dan hasil akhir secara jelas.`,
      closing: "Ketik MOCKUP untuk preview awal, lalu tim manusia bantu lanjutkan penawaran."
    },
    shot_list: [
      { scene_number: 1, visual_instruction: "Close-up bahan atau cover", overlay_text: productLabel },
      { scene_number: 2, visual_instruction: "Proses finishing atau QC", overlay_text: "Dicek sebelum kirim" },
      { scene_number: 3, visual_instruction: "Hasil siap dikirim", overlay_text: "Ketik MOCKUP" }
    ]
  };
}

function addDays(startDate: string, days: number): string {
  const date = new Date(`${startDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function normalizeProduct(value: string): string {
  if (value === "sampul_ijazah") return value;
  return "sampul_raport";
}

function normalizeColor(value: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#6E1F1F";
}

function listVideoFiles(root: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const absolute = join(root, entry.name);
    if (entry.isDirectory()) {
      found.push(...listVideoFiles(absolute));
    } else if (entry.isFile() && videoExtensions.has(extname(entry.name).toLowerCase())) {
      found.push(absolute);
    }
  }
  return found.sort();
}

function ffprobeVideo(filePath: string): any {
  const result = spawnSync(process.env.FFPROBE_BIN || "ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration:stream=codec_type,codec_name,width,height",
    "-of", "json",
    filePath
  ], { encoding: "utf8" });
  if (result.status !== 0) {
    return { valid: false, error: result.stderr || `ffprobe_exit_${result.status}` };
  }
  const parsed = JSON.parse(result.stdout || "{}");
  const video = (parsed.streams || []).find((stream: any) => stream.codec_type === "video") || {};
  return {
    valid: Boolean(video.codec_name),
    codec_name: video.codec_name || null,
    width: video.width || null,
    height: video.height || null,
    duration_seconds: parsed.format?.duration ? Number(parsed.format.duration) : null
  };
}

function orientationFor(width?: number | null, height?: number | null): string {
  if (!width || !height) return "unknown";
  if (width === height) return "square";
  return height > width ? "vertical" : "horizontal";
}

function inferTags(value: string): string[] {
  return Array.from(new Set(value.toLowerCase().split(/[^a-z0-9]+/).filter((part) => part.length > 2).slice(0, 8)));
}

function assertSafeReadableRoot(root: string): void {
  if (!existsSync(root)) throw new Error(`footage_source_not_found: ${root}`);
  if (root.includes("\0")) throw new Error("footage_source_invalid");
}

function assertSafeLogoPath(value: string): string {
  const root = resolve(defaultStorageRoot(), "brand-assets");
  const absolute = resolve(root, value);
  if (!absolute.startsWith(`${root}${sep}`) && absolute !== root) throw new Error("logo_path_outside_brand_assets");
  return absolute;
}

function normalizePath(value: string): string {
  return value.split(sep).join("/");
}

function defaultJakartaPublishTime(): string {
  const now = new Date();
  now.setUTCHours(12, 0, 0, 0);
  return now.toISOString();
}

async function renderMockupPng(job: any): Promise<string> {
  const outputRoot = join(defaultStorageRoot(), "mockups", "operational");
  await mkdir(outputRoot, { recursive: true });
  const relativePath = normalizePath(join("storage", "mockups", "operational", `${job.id}.png`));
  const outputPath = join(process.cwd(), relativePath);
  const width = 900;
  const height = 600;
  const color = hexToRgb(job.color_hex || "#6E1F1F");
  const png = createMockupPng(width, height, color);
  writeFileSync(outputPath, png);
  return relativePath;
}

function createMockupPng(width: number, height: number, color: [number, number, number]): Buffer {
  const rows: Buffer[] = [];
  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0;
    for (let x = 0; x < width; x += 1) {
      const offset = 1 + x * 4;
      const band = x > width * 0.68 ? 0.72 : y < height * 0.18 ? 1.18 : 1;
      row[offset] = Math.min(255, Math.round(color[0] * band));
      row[offset + 1] = Math.min(255, Math.round(color[1] * band));
      row[offset + 2] = Math.min(255, Math.round(color[2] * band));
      row[offset + 3] = 255;
    }
    rows.push(row);
  }
  const raw = Buffer.concat(rows);
  return Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"),
    pngChunk("IHDR", Buffer.concat([uint32(width), uint32(height), Buffer.from([8, 6, 0, 0, 0])])),
    pngChunk("IDAT", zlib.deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBuffer = Buffer.from(type, "ascii");
  const crc = crc32(Buffer.concat([typeBuffer, data]));
  return Buffer.concat([uint32(data.length), typeBuffer, data, uint32(crc)]);
}

function uint32(value: number): Buffer {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value >>> 0, 0);
  return buffer;
}

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = normalizeColor(hex).slice(1);
  return [Number.parseInt(clean.slice(0, 2), 16), Number.parseInt(clean.slice(2, 4), 16), Number.parseInt(clean.slice(4, 6), 16)];
}

async function redisPush(queue: string, value: string): Promise<boolean> {
  return redisCommand(["LPUSH", queue, value]).then(() => true).catch(() => false);
}

async function redisPop(queue: string): Promise<string | null> {
  const value = await redisCommand(["RPOP", queue]).catch(() => null);
  return typeof value === "string" ? value : null;
}

async function redisPing(): Promise<boolean> {
  const value = await redisCommand(["PING"]).catch(() => null);
  return value === "PONG";
}

async function redisCommand(args: string[]): Promise<string | number | null> {
  const redisUrl = new URL(process.env.REDIS_URL || "redis://localhost:6379");
  const command = `*${args.length}\r\n${args.map((arg) => `$${Buffer.byteLength(arg)}\r\n${arg}\r\n`).join("")}`;
  return new Promise((resolvePromise, reject) => {
    const socket = net.createConnection({ host: redisUrl.hostname, port: Number(redisUrl.port || 6379) });
    let data = "";
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error("redis_timeout"));
    }, 1000);
    socket.on("connect", () => socket.write(command));
    socket.on("data", (chunk) => {
      data += chunk.toString("utf8");
      socket.end();
    });
    socket.on("end", () => {
      clearTimeout(timer);
      if (data.startsWith("+")) resolvePromise(data.slice(1).trim());
      else if (data.startsWith(":")) resolvePromise(Number(data.slice(1).trim()));
      else if (data.startsWith("$-1")) resolvePromise(null);
      else if (data.startsWith("$")) {
        const parts = data.split("\r\n");
        resolvePromise(parts[1] || null);
      } else if (data.startsWith("-")) reject(new Error(data.slice(1).trim()));
      else resolvePromise(null);
    });
    socket.on("error", reject);
  });
}

export async function runOperationalSmoke(): Promise<Record<string, unknown>> {
  const campaign = await createOperationalCampaign({
    name: `Smoke MVP ${Date.now()}`,
    product_type: "sampul_raport",
    theme: "Bukti proses sampul raport sekolah",
    start_date: new Date().toISOString().slice(0, 10),
    days: 30
  });
  const content = await query<{ id: string }>(`SELECT id FROM ops_content_items WHERE campaign_id = $1 ORDER BY planned_date LIMIT 1`, [campaign.campaign_id]);
  const footage = await scanOperationalFootage(process.env.OPERATIONAL_FOOTAGE_SOURCE_DIR || "packages/content-engine/fixtures/read-only-intake-sample");
  const videoJob = await queueOperationalVideoJob({ content_item_id: content[0].id, provider: "mock", source_root: footage.source_root });
  const videoResult = await processUntilJob("video", videoJob.id);
  if (videoResult.status !== "draft_ready") throw new Error(`operational_video_smoke_failed: ${videoResult.status || videoResult.error}`);
  const reviewed = videoResult.status === "draft_ready" ? await reviewOperationalVideoJob({ job_id: videoJob.id, action: "approve", notes: "Smoke approve" }) : null;
  const schedule = await scheduleOperationalPost({ content_item_id: content[0].id, video_job_id: videoJob.id, channel: "instagram" });
  const posted = await markOperationalPosted({ schedule_id: schedule.id, posted_url: "manual://smoke-post" });
  const mockup = await queueOperationalMockup({ school_name: "SD Contoh Pesona", product_type: "sampul_raport", color_hex: "#6E1F1F" });
  const mockupResult = await processUntilJob("mockup", mockup.id);
  if (mockupResult.status !== "ready") throw new Error(`operational_mockup_smoke_failed: ${mockupResult.status || mockupResult.error}`);
  const lead = await createOperationalLead({ name: "Bu Admin Smoke", channel: "instagram", school_name: "SD Contoh Pesona", status: "WA Masuk", mockup_job_id: mockup.id });
  const leadUpdated = await updateOperationalLead({ id: lead.id, status: "Masuk Penawaran", notes: "Handoff manual Growth OS Lite" });
  return {
    campaign,
    footage,
    video_job: videoJob,
    video_result: videoResult,
    reviewed,
    schedule,
    posted,
    mockup,
    mockup_result: mockupResult,
    lead: leadUpdated,
    summary: await getOperationalSummary()
  };
}

async function processUntilJob(kind: "video" | "mockup", jobId: string): Promise<any> {
  let last: any = { processed: false };
  for (let index = 0; index < 5; index += 1) {
    last = kind === "video" ? await processOneOperationalVideoJob() : await processOneOperationalMockupJob();
    if (last.job_id === jobId) return last;
  }
  return last;
}
