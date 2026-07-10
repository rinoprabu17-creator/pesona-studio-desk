import { lstatSync, readdirSync, statSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { z } from "zod";
import { ContentEngineSmokeResultSchema, ContentEngineSmokeInputSchema } from "./schema.ts";
import { FakeContentEngineProvider } from "./fake-provider.ts";
import type { ContentEngineSmokeInput, ContentEngineSmokeResult } from "./types.ts";

const DEFAULT_APPROVED_SOURCE_ROOT = "packages/content-engine/fixtures/read-only-intake-sample";
const DEFAULT_OUTPUT_ROOT = "tmp/real-footage-mvp-proof";
const SUPPORTED_EXTENSIONS = new Set([".mp4", ".mov", ".m4v", ".avi", ".mkv", ".jpg", ".jpeg", ".png", ".webp"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".m4v", ".avi", ".mkv"]);

export const RealFootageMvpManifestItemSchema = z.object({
  id: z.string().min(1),
  filename: z.string().min(1),
  relative_path: z.string().min(1),
  extension: z.string().min(1),
  size_bytes: z.number().int().nonnegative(),
  basic_inferred_tags: z.array(z.string().min(1)),
  owner_review_needed: z.boolean(),
  owner_review_reason: z.string().min(1).nullable()
}).strict();

export const RealFootageMvpProofResultSchema = z.object({
  proof_id: z.literal("phase-2k1-real-footage-mvp-proof"),
  provider: z.literal("fake_content_engine"),
  approved_source_root: z.string().min(1),
  output_root: z.string().min(1),
  source_scan: z.object({
    scanned_files: z.number().int().min(0),
    accepted_media_files: z.number().int().min(0),
    rejected_files: z.number().int().min(0),
    video_files: z.number().int().min(0),
    image_files: z.number().int().min(0)
  }).strict(),
  manifest: z.object({
    generated: z.literal(true),
    item_count: z.number().int().min(0),
    items: z.array(RealFootageMvpManifestItemSchema)
  }).strict(),
  campaign_package: z.object({
    campaign_theme: z.string().min(1),
    content_calendar_items: z.array(z.unknown()).min(7),
    caption: z.string().min(1),
    hashtags: z.array(z.string().min(1)).min(1),
    cta: z.string().min(1),
    script: z.unknown(),
    shot_plan: z.array(z.unknown()).min(1),
    selected_footage: z.array(z.unknown()).min(1),
    render_plan: z.object({
      render_ready: z.boolean(),
      target_format: z.literal("vertical_short"),
      scenes: z.array(z.unknown()).min(1),
      blocker: z.string().min(1).nullable(),
      next_step_to_enable_render: z.string().min(1).nullable()
    }).strict(),
    draft_video_job: z.object({
      available: z.boolean(),
      job_id: z.string().min(1).nullable(),
      output_path: z.string().min(1).nullable()
    }).strict()
  }).strict(),
  output_files: z.object({
    source_manifest_path: z.string().min(1),
    campaign_package_path: z.string().min(1),
    render_plan_path: z.string().min(1),
    summary_path: z.string().min(1)
  }).strict(),
  safety: z.object({
    source_mutated: z.literal(false),
    media_decoded: z.literal(false),
    ffmpeg_executed: z.literal(false),
    upload_performed: z.literal(false),
    publish_performed: z.literal(false),
    external_api_used: z.literal(false),
    production_manifest_mutated: z.literal(false),
    real_metadata_store_mutated: z.literal(false)
  }).strict()
}).strict();

export type RealFootageMvpManifestItem = z.infer<typeof RealFootageMvpManifestItemSchema>;
export type RealFootageMvpProofResult = z.infer<typeof RealFootageMvpProofResultSchema>;

export async function runRealFootageMvpProof(input: {
  sourceRoot?: string;
  outputRoot?: string;
  projectRoot?: string;
  provider?: FakeContentEngineProvider;
} = {}): Promise<RealFootageMvpProofResult> {
  const projectRoot = input.projectRoot ? resolve(input.projectRoot) : process.cwd();
  const sourceRoot = normalizeRelativePath(input.sourceRoot || DEFAULT_APPROVED_SOURCE_ROOT);
  const outputRoot = normalizeRelativePath(input.outputRoot || DEFAULT_OUTPUT_ROOT);
  assertSafeRelativePath(sourceRoot, "sourceRoot");
  assertSafeRelativePath(outputRoot, "outputRoot");

  const sourceAbsolute = resolve(projectRoot, sourceRoot);
  const outputAbsolute = resolve(projectRoot, outputRoot);
  assertInsideProject(projectRoot, sourceAbsolute, "sourceRoot");
  assertInsideProject(projectRoot, outputAbsolute, "outputRoot");

  const scan = scanApprovedSourceFolder({ projectRoot, sourceRoot, sourceAbsolute });
  const smokeInput = buildMvpSmokeInput(scan.items);
  const provider = input.provider || new FakeContentEngineProvider();
  const generated = ContentEngineSmokeResultSchema.parse(await provider.generateSmoke(smokeInput));
  const campaignPackage = buildCampaignPackage(smokeInput, generated);

  const sourceManifestPath = join(outputRoot, "source-manifest.json");
  const campaignPackagePath = join(outputRoot, "campaign-package.json");
  const renderPlanPath = join(outputRoot, "render-plan.json");
  const summaryPath = join(outputRoot, "summary.json");

  const result = RealFootageMvpProofResultSchema.parse({
    proof_id: "phase-2k1-real-footage-mvp-proof",
    provider: provider.providerName,
    approved_source_root: sourceRoot,
    output_root: outputRoot,
    source_scan: scan.summary,
    manifest: {
      generated: true,
      item_count: scan.items.length,
      items: scan.items
    },
    campaign_package: campaignPackage,
    output_files: {
      source_manifest_path: sourceManifestPath,
      campaign_package_path: campaignPackagePath,
      render_plan_path: renderPlanPath,
      summary_path: summaryPath
    },
    safety: {
      source_mutated: false,
      media_decoded: false,
      ffmpeg_executed: false,
      upload_performed: false,
      publish_performed: false,
      external_api_used: false,
      production_manifest_mutated: false,
      real_metadata_store_mutated: false
    }
  });

  await mkdir(outputAbsolute, { recursive: true });
  await writeJson(join(projectRoot, sourceManifestPath), result.manifest);
  await writeJson(join(projectRoot, campaignPackagePath), result.campaign_package);
  await writeJson(join(projectRoot, renderPlanPath), result.campaign_package.render_plan);
  await writeJson(join(projectRoot, summaryPath), result);

  return result;
}

function scanApprovedSourceFolder(input: {
  projectRoot: string;
  sourceRoot: string;
  sourceAbsolute: string;
}): {
  items: RealFootageMvpManifestItem[];
  summary: {
    scanned_files: number;
    accepted_media_files: number;
    rejected_files: number;
    video_files: number;
    image_files: number;
  };
} {
  const items: RealFootageMvpManifestItem[] = [];
  let scannedFiles = 0;
  let rejectedFiles = 0;

  function visit(directory: string): void {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = resolve(directory, entry.name);
      const relativePath = normalizeRelativePath(relative(input.projectRoot, absolutePath));
      const lstat = lstatSync(absolutePath);
      if (lstat.isSymbolicLink()) {
        rejectedFiles += 1;
        continue;
      }
      if (entry.isDirectory()) {
        visit(absolutePath);
        continue;
      }
      scannedFiles += 1;
      const extension = extname(entry.name).toLowerCase();
      if (!SUPPORTED_EXTENSIONS.has(extension)) {
        rejectedFiles += 1;
        continue;
      }
      const item = buildManifestItem({
        index: items.length + 1,
        filename: basename(entry.name),
        relativePath,
        extension,
        sizeBytes: statSync(absolutePath).size
      });
      items.push(item);
    }
  }

  visit(input.sourceAbsolute);
  return {
    items,
    summary: {
      scanned_files: scannedFiles,
      accepted_media_files: items.length,
      rejected_files: rejectedFiles,
      video_files: items.filter((item) => VIDEO_EXTENSIONS.has(item.extension)).length,
      image_files: items.filter((item) => !VIDEO_EXTENSIONS.has(item.extension)).length
    }
  };
}

function buildManifestItem(input: {
  index: number;
  filename: string;
  relativePath: string;
  extension: string;
  sizeBytes: number;
}): RealFootageMvpManifestItem {
  const tags = inferTags(`${dirname(input.relativePath)} ${input.filename}`);
  const ownerReviewNeeded = input.sizeBytes === 0 || tags.includes("privacy") || tags.includes("placeholder");
  return RealFootageMvpManifestItemSchema.parse({
    id: `mvp-footage-${String(input.index).padStart(3, "0")}`,
    filename: input.filename,
    relative_path: input.relativePath,
    extension: input.extension,
    size_bytes: input.sizeBytes,
    basic_inferred_tags: tags,
    owner_review_needed: ownerReviewNeeded,
    owner_review_reason: ownerReviewNeeded
      ? "Filename or file metadata indicates privacy/placeholder/empty-size review is needed before render."
      : null
  });
}

function buildMvpSmokeInput(items: RealFootageMvpManifestItem[]): ContentEngineSmokeInput {
  const usableItems = items.filter((item) => !item.owner_review_needed && VIDEO_EXTENSIONS.has(item.extension));
  const selectedItems = (usableItems.length > 0 ? usableItems : items).slice(0, 5);
  return ContentEngineSmokeInputSchema.parse({
    campaign: {
      code: "PHASE-2K1-REAL-FOOTAGE-MVP-PROOF",
      product: "Sampul Raport",
      theme: "Proof konten real footage Sampul Raport dan Sampul Ijazah untuk mockup awal gratis",
      month: "2026-07",
      audience: ["SD", "SMP", "SMA", "MI", "MTs", "MA"],
      offer: "Mockup awal gratis sebelum penawaran",
      cta: "MOCKUP",
      channels: ["facebook", "instagram", "tiktok", "youtube"]
    },
    footage: selectedItems.map((item) => ({
      path: item.relative_path,
      owner_note: item.basic_inferred_tags.join(" "),
      duration_seconds: 6,
      orientation: item.basic_inferred_tags.includes("horizontal") ? "horizontal" : "vertical"
    }))
  });
}

function buildCampaignPackage(
  smokeInput: ContentEngineSmokeInput,
  generated: ContentEngineSmokeResult
): RealFootageMvpProofResult["campaign_package"] {
  const renderBlocker =
    "Actual render is not executed by Phase 2K.1 because the existing render path is DB/FFmpeg-backed in the web app and this CLI proof does not run server, database render jobs, workers, or FFmpeg.";
  return {
    campaign_theme: smokeInput.campaign.theme,
    content_calendar_items: generated.calendar,
    caption: generated.caption.caption,
    hashtags: generated.caption.hashtags,
    cta: generated.caption.cta,
    script: generated.script,
    shot_plan: generated.script.shot_list,
    selected_footage: generated.footage_selection,
    render_plan: {
      render_ready: false,
      target_format: "vertical_short",
      scenes: generated.video_draft_plan.scenes,
      blocker: renderBlocker,
      next_step_to_enable_render:
        "Wire this package into the existing DB-backed render manifest/preflight/controlled render attempt flow, then run a separate owner-approved local render smoke with FFmpeg explicitly enabled."
    },
    draft_video_job: {
      available: false,
      job_id: null,
      output_path: null
    }
  };
}

function inferTags(value: string): string[] {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, " ");
  const knownTags = [
    "sr",
    "sampul",
    "raport",
    "ijazah",
    "vertical",
    "horizontal",
    "product",
    "closeup",
    "foil",
    "poly",
    "packing",
    "qc",
    "delivery",
    "mockup",
    "desain",
    "gratis",
    "penamaan",
    "process",
    "privacy",
    "blurry",
    "placeholder",
    "unrelated",
    "maroon",
    "navy",
    "black",
    "green",
    "brown",
    "gray",
    "orange",
    "blue",
    "sd",
    "smp",
    "sma",
    "mi",
    "mts",
    "ma"
  ];
  const tags = knownTags.filter((tag) => normalized.includes(tag));
  return Array.from(new Set(tags.length > 0 ? tags : ["needs_manual_metadata"])).sort();
}

function normalizeRelativePath(value: string): string {
  return value.replaceAll("\\", "/").replace(/^\.?\//, "").replace(/\/+$/g, "");
}

function assertSafeRelativePath(value: string, label: string): void {
  if (!value || value.startsWith("/") || value.includes("..") || value.split("/").some((part) => part.length === 0)) {
    throw new Error(`${label}_must_be_safe_relative_path`);
  }
}

function assertInsideProject(projectRoot: string, targetPath: string, label: string): void {
  const relativePath = relative(projectRoot, targetPath);
  if (relativePath.startsWith("..") || relativePath === "" || relativePath.split(sep).includes("..")) {
    throw new Error(`${label}_must_stay_inside_project`);
  }
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
