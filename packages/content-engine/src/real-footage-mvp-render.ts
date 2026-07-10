import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readdirSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { z, ZodError } from "zod";
import { resolveOpenAISecret } from "../../campaign-planner/src/openai-config.ts";

const DEFAULT_SOURCE_ROOT = "/mnt/c/Users/rinop/Downloads/psd-real-footage-input";
const DEFAULT_OUTPUT_ROOT = "tmp/real-footage-mvp-render";
const DEFAULT_OUTPUT_FILENAME = "pesona-studio-draft.mp4";
const DEFAULT_FONT_FILE = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
const DIRECTOR_PROMPT_VERSION = "real-footage-mvp-content-director-v1";
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".m4v", ".avi", ".mkv"]);
const MAX_FRAMES_PER_VIDEO = 3;
const MAX_FRAMES_PER_REQUEST = 12;
const AI_FRAME_DETAIL = "low";
const AI_FRAME_MAX_DIMENSION = 512;

export const RealFootageDirectorSceneSchema = z.object({
  scene_number: z.number().int().min(1).max(3),
  clip_path: z.string().min(1),
  start_second: z.number().min(0),
  duration_seconds: z.number().min(1).max(8),
  overlay_text: z.string().min(1).max(90),
  shot_intent: z.string().min(1).max(180)
}).strict();

export const RealFootageContentDirectorOutputSchema = z.object({
  campaign_theme: z.string().min(1).max(160),
  content_angle: z.string().min(1).max(220),
  caption: z.string().min(1).max(900),
  hashtags: z.array(z.string().min(1).max(40)).min(3).max(12),
  cta: z.string().min(1).max(160),
  script: z.object({
    hook: z.string().min(1).max(220),
    body: z.string().min(1).max(700),
    closing: z.string().min(1).max(220)
  }).strict(),
  shot_plan: z.array(RealFootageDirectorSceneSchema).length(3),
  selected_footage: z.array(z.object({
    clip_path: z.string().min(1),
    reason: z.string().min(1).max(220)
  }).strict()).min(1).max(3)
}).strict();

export type RealFootageContentDirectorOutput = z.infer<typeof RealFootageContentDirectorOutputSchema>;
export type RealFootageDirectorScene = z.infer<typeof RealFootageDirectorSceneSchema>;

export type RealFootageVideoInput = {
  id: string;
  filename: string;
  absolute_path: string;
  display_path: string;
  extension: string;
  size_bytes: number;
  inferred_tags: string[];
  mtime_ms_before: number;
};

export type RealFootageProbe = {
  clip_path: string;
  valid_video: boolean;
  codec_name: string | null;
  audio_codec_name: string | null;
  has_audio: boolean;
  width: number | null;
  height: number | null;
  pix_fmt: string | null;
  duration_seconds: number | null;
  size_bytes: number;
  error: string | null;
};

export type RealFootageFrame = {
  clip_path: string;
  frame_path: string;
  second: number;
  size_bytes: number;
};

export type RealFootageMvpRenderResult = {
  render_id: "real-footage-mvp-render";
  status: "rendered";
  ai_status: "live" | "mock_only";
  provider: "openai" | "mock_content_director";
  model: string | null;
  approved_source_root: string;
  output_root: string;
  source_manifest_path: string;
  frame_manifest_path: string;
  render_plan_path: string;
  output_path: string;
  output_size_bytes: number;
  discovered_video_count: number;
  valid_video_count: number;
  extracted_frame_count: number;
  ai_frame_detail: "low";
  ai_frame_max_dimension: 512;
  ai_frame_total_bytes: number;
  rendered_scene_count: number;
  content_director_output: RealFootageContentDirectorOutput;
  source_manifest: RealFootageVideoInput[];
  source_probes: RealFootageProbe[];
  extracted_frames: RealFootageFrame[];
  render_plan: {
    render_ready: true;
    scenes: RealFootageDirectorScene[];
    caption: string;
    hashtags: string[];
    cta: string;
    claim_check: {
      passed: true;
      findings: string[];
    };
  };
  output_probe: {
    codec_name: "h264";
    audio_codec_name: "aac";
    width: 720;
    height: 1280;
    pix_fmt: "yuv420p";
    duration_seconds: number;
    size_bytes: number;
  };
  safety: {
    source_mutated: false;
    source_deleted_or_moved: false;
    upload_performed: false;
    publish_performed: false;
    deploy_performed: false;
    production_manifest_mutated: false;
    real_metadata_store_mutated: false;
  };
};

type CommandResult = {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
};

export type OpenAIResponsesClient = {
  responses: {
    parse(request: Record<string, unknown>): Promise<any>;
  };
};

export function resolveContentDirectorProvider(
  requestedProvider = "auto",
  env: Record<string, string | undefined> = process.env
): { requestedProvider: string; forceMockDirector: boolean } {
  if (!["auto", "mock", "openai"].includes(requestedProvider)) {
    throw new Error(`unsupported_content_director_provider: ${requestedProvider}`);
  }
  if (requestedProvider === "openai" && (!hasOpenAISecretPointer(env) || !env.OPENAI_MODEL?.trim())) {
    throw new Error("openai_content_director_requested_but_OPENAI_API_KEY_or_OPENAI_API_KEY_FILE_or_OPENAI_MODEL_missing");
  }
  return {
    requestedProvider,
    forceMockDirector: requestedProvider === "mock"
  };
}

export async function runRealFootageMvpRender(input: {
  sourceRoot?: string;
  outputRoot?: string;
  outputFilename?: string;
  ffmpegPath?: string;
  ffprobePath?: string;
  fontFile?: string;
  projectRoot?: string;
  client?: OpenAIResponsesClient;
  forceMockDirector?: boolean;
} = {}): Promise<RealFootageMvpRenderResult> {
  const projectRoot = resolve(input.projectRoot || process.cwd());
  const sourceRoot = input.sourceRoot || DEFAULT_SOURCE_ROOT;
  const outputRoot = normalizeRelativePath(input.outputRoot || DEFAULT_OUTPUT_ROOT);
  const outputFilename = input.outputFilename || DEFAULT_OUTPUT_FILENAME;
  assertSafeOutputRoot(outputRoot);
  assertSafeOutputFilename(outputFilename);

  const ffmpegPath = input.ffmpegPath || process.env.FFMPEG_BIN || "ffmpeg";
  const ffprobePath = input.ffprobePath || process.env.FFPROBE_BIN || "ffprobe";
  const outputAbsoluteRoot = resolveInsideProject(projectRoot, outputRoot, "outputRoot");
  const outputAbsolutePath = resolveInsideProject(projectRoot, join(outputRoot, outputFilename), "outputFilename");
  const outputPath = normalizePath(relative(projectRoot, outputAbsolutePath));
  const sourceAbsoluteRoot = resolveSourceRoot(sourceRoot);
  assertApprovedSourceRoot(sourceAbsoluteRoot);
  await mkdir(outputAbsoluteRoot, { recursive: true });

  const manifest = discoverRealFootageVideos(sourceAbsoluteRoot);
  if (manifest.length === 0) {
    throw new Error("no_supported_video_files_found_in_approved_source_root");
  }

  const sourceProbes: RealFootageProbe[] = [];
  for (const video of manifest) {
    sourceProbes.push(await probeVideo(video, ffprobePath));
  }
  const sourceManifestPath = join(outputRoot, "source-manifest.json");
  const probeManifestPath = join(outputRoot, "probe-manifest.json");
  await writeJson(resolveInsideProject(projectRoot, sourceManifestPath, "sourceManifestPath"), manifest);
  await writeJson(resolveInsideProject(projectRoot, probeManifestPath, "probeManifestPath"), sourceProbes);
  const validVideos = manifest.filter((video) => sourceProbes.some((probe) => probe.clip_path === video.display_path && probe.valid_video));
  if (validVideos.length === 0) {
    const reasons = Array.from(new Set(sourceProbes.map((probe) => probe.error || "unknown_probe_error")));
    throw new Error(`no_valid_video_inputs_after_ffprobe: ${reasons.join("; ")}`);
  }

  const frames = await extractRepresentativeFrames({
    videos: validVideos,
    probes: sourceProbes,
    outputRoot: outputAbsoluteRoot,
    ffmpegPath
  });

  const knowledgeBase = await loadKnowledgeBase(projectRoot);
  const directorOutput = await runContentDirector({
    videos: validVideos,
    probes: sourceProbes,
    frames,
    knowledgeBase,
    client: input.client,
    forceMockDirector: input.forceMockDirector
  });
  const renderPlanScenes = normalizeRenderPlanScenes(directorOutput, validVideos, sourceProbes);
  const claimFindings = checkContentDirectorClaims(directorOutput, renderPlanScenes, knowledgeBase);
  if (claimFindings.length > 0) {
    throw new Error(`claim_check_failed: ${claimFindings.join("; ")}`);
  }

  const frameManifestPath = join(outputRoot, "frame-manifest.json");
  const renderPlanPath = join(outputRoot, "render-plan.json");
  const renderPlan = {
    render_ready: true as const,
    scenes: renderPlanScenes,
    caption: directorOutput.caption,
    hashtags: directorOutput.hashtags,
    cta: directorOutput.cta,
    claim_check: {
      passed: true as const,
      findings: [] as string[]
    }
  };
  await writeJson(resolveInsideProject(projectRoot, frameManifestPath, "frameManifestPath"), frames);
  await writeJson(resolveInsideProject(projectRoot, renderPlanPath, "renderPlanPath"), renderPlan);

  const fontFile = input.fontFile || process.env.FFMPEG_FONT_FILE || DEFAULT_FONT_FILE;
  if (!existsSync(fontFile)) {
    throw new Error(`font_file_not_found: ${fontFile}`);
  }
  const scenes = renderPlanScenes.map((scene) => ({
    ...scene,
    clip_absolute_path: validVideos.find((video) => video.display_path === scene.clip_path)?.absolute_path || scene.clip_path,
    overlay_text_path: join(outputAbsoluteRoot, "overlays", `scene-${scene.scene_number}.txt`),
    has_audio: sourceProbes.find((probe) => probe.clip_path === scene.clip_path)?.has_audio || false
  }));
  await mkdir(join(outputAbsoluteRoot, "overlays"), { recursive: true });
  for (const scene of scenes) {
    await writeFile(scene.overlay_text_path, `${wrapOverlayText(scene.overlay_text)}\n`, "utf8");
  }

  const ffmpegArgs = buildRealFootageFfmpegArgs(scenes, outputAbsolutePath, fontFile);
  const ffmpegResult = await runCommand(ffmpegPath, ffmpegArgs, 180_000);
  if (ffmpegResult.exitCode !== 0) {
    throw new Error(`ffmpeg_render_failed: ${truncate(ffmpegResult.stderr) || `exit_${ffmpegResult.exitCode}`}`);
  }

  const outputProbe = await probeOutputVideo(outputAbsolutePath, ffprobePath);
  const sourceMutated = detectSourceMutation(manifest);
  if (sourceMutated.length > 0) {
    throw new Error(`source_mutation_detected: ${sourceMutated.join(", ")}`);
  }

  const aiLive = Boolean(hasOpenAISecretPointer(process.env) && process.env.OPENAI_MODEL && !input.forceMockDirector);
  const result: RealFootageMvpRenderResult = {
    render_id: "real-footage-mvp-render",
    status: "rendered",
    ai_status: aiLive ? "live" : "mock_only",
    provider: aiLive ? "openai" : "mock_content_director",
    model: aiLive ? process.env.OPENAI_MODEL || null : null,
    approved_source_root: sourceAbsoluteRoot,
    output_root: outputRoot,
    source_manifest_path: sourceManifestPath,
    frame_manifest_path: frameManifestPath,
    render_plan_path: renderPlanPath,
    output_path: outputPath,
    output_size_bytes: outputProbe.size_bytes,
    discovered_video_count: manifest.length,
    valid_video_count: validVideos.length,
    extracted_frame_count: frames.length,
    ai_frame_detail: AI_FRAME_DETAIL,
    ai_frame_max_dimension: AI_FRAME_MAX_DIMENSION,
    ai_frame_total_bytes: frames.reduce((total, frame) => total + frame.size_bytes, 0),
    rendered_scene_count: scenes.length,
    content_director_output: directorOutput,
    source_manifest: manifest,
    source_probes: sourceProbes,
    extracted_frames: frames,
    render_plan: renderPlan,
    output_probe: outputProbe,
    safety: {
      source_mutated: false,
      source_deleted_or_moved: false,
      upload_performed: false,
      publish_performed: false,
      deploy_performed: false,
      production_manifest_mutated: false,
      real_metadata_store_mutated: false
    }
  };
  await writeJson(resolveInsideProject(projectRoot, join(outputRoot, "render-result.json"), "renderResultPath"), result);
  return result;
}

export function buildRealFootageFfmpegArgs(
  scenes: Array<RealFootageDirectorScene & {
    clip_absolute_path: string;
    overlay_text_path: string;
    has_audio: boolean;
  }>,
  outputAbsolutePath: string,
  fontFile: string
): string[] {
  if (scenes.length < 1 || scenes.length > 3) {
    throw new Error("render_scene_count_must_be_between_1_and_3");
  }
  const args = ["-hide_banner", "-loglevel", "error", "-y"];
  for (const scene of scenes) {
    args.push("-ss", String(clampStart(scene.start_second)), "-t", String(clampDuration(scene.duration_seconds)), "-i", scene.clip_absolute_path);
  }
  const videoFilters = scenes.map((scene, index) => {
    const duration = clampDuration(scene.duration_seconds);
    const drawtext = [
      `fontfile='${escapeFilterPath(fontFile)}'`,
      `textfile='${escapeFilterPath(scene.overlay_text_path)}'`,
      "reload=0",
      "fontcolor=white",
      "fontsize=44",
      "line_spacing=10",
      "borderw=4",
      "bordercolor=black",
      "box=1",
      "boxcolor=black@0.42",
      "boxborderw=22",
      "x=(w-text_w)/2",
      "y=h-text_h-130"
    ].join(":");
    return `[${index}:v]setpts=PTS-STARTPTS,trim=duration=${duration},scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps=30,format=yuv420p,drawtext=${drawtext}[v${index}]`;
  });
  const audioFilters = scenes.map((scene, index) => {
    const duration = clampDuration(scene.duration_seconds);
    if (scene.has_audio) {
      return `[${index}:a]atrim=duration=${duration},asetpts=PTS-STARTPTS,aresample=48000,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[a${index}]`;
    }
    return `anullsrc=channel_layout=stereo:sample_rate=48000,atrim=duration=${duration},asetpts=PTS-STARTPTS[a${index}]`;
  });
  const concatVideos = scenes.map((_, index) => `[v${index}]`).join("");
  const concatAudio = scenes.map((_, index) => `[a${index}]`).join("");
  args.push(
    "-filter_complex",
    `${videoFilters.join(";")};${audioFilters.join(";")};${concatVideos}concat=n=${scenes.length}:v=1:a=0[outv];${concatAudio}concat=n=${scenes.length}:v=0:a=1[outa]`,
    "-map",
    "[outv]",
    "-map",
    "[outa]",
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "21",
    "-pix_fmt",
    "yuv420p",
    "-r",
    "30",
    "-c:a",
    "aac",
    "-ac",
    "2",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    "-shortest",
    outputAbsolutePath
  );
  return args;
}

export function buildFrameExtractionFfmpegArgs(input: {
  sourcePath: string;
  outputFramePath: string;
  second: number;
}): string[] {
  return [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-ss",
    String(input.second),
    "-i",
    input.sourcePath,
    "-frames:v",
    "1",
    "-vf",
    buildAiFrameScaleFilter(),
    "-q:v",
    "6",
    input.outputFramePath
  ];
}

export function buildAiFrameScaleFilter(): string {
  return `scale='if(gt(iw,ih),min(${AI_FRAME_MAX_DIMENSION},iw),-2)':'if(gt(iw,ih),-2,min(${AI_FRAME_MAX_DIMENSION},ih))'`;
}

export function buildResponsesApiImageInput(imageUrl: string): { type: "input_image"; image_url: string; detail: "low" } {
  return {
    type: "input_image",
    image_url: imageUrl,
    detail: AI_FRAME_DETAIL
  };
}

export function buildMockContentDirectorOutput(videos: RealFootageVideoInput[]): RealFootageContentDirectorOutput {
  const selected = videos.slice(0, Math.min(3, videos.length));
  const scenes = [0, 1, 2].map((index) => {
    const video = selected[index] || selected[selected.length - 1];
    return {
      scene_number: index + 1,
      clip_path: video.display_path,
      start_second: 0,
      duration_seconds: 4,
      overlay_text: [
        "Proses sampul sekolah terlihat rapi",
        "Detail bahan dan finishing dicek",
        "Ketik MOCKUP untuk preview awal"
      ][index],
      shot_intent: [
        "Buka dengan proses produksi nyata.",
        "Tampilkan detail kerja dan quality control.",
        "Tutup dengan ajakan mockup awal tanpa klaim berlebihan."
      ][index]
    };
  });
  return RealFootageContentDirectorOutputSchema.parse({
    campaign_theme: "Konten real footage Sampul Raport dan Sampul Ijazah",
    content_angle: "Tunjukkan proses produksi nyata agar sekolah percaya sebelum meminta mockup awal.",
    caption:
      "Lihat proses pembuatan sampul sekolah dari footage nyata. Tim Pesona bantu buat preview awal supaya sekolah punya gambaran sebelum lanjut penawaran.",
    hashtags: ["#SampulRaport", "#SampulIjazah", "#MockupAwal", "#PesonaStudio", "#Sekolah"],
    cta: "Ketik MOCKUP untuk minta preview awal.",
    script: {
      hook: "Butuh sampul raport atau ijazah yang terlihat rapi untuk sekolah?",
      body: "Footage ini menunjukkan proses dan detail kerja sebelum pesanan dikirim. Tim sales manusia akan bantu lanjutkan kebutuhan sekolah lewat WA.",
      closing: "Ketik MOCKUP untuk minta preview awal."
    },
    shot_plan: scenes,
    selected_footage: selected.map((video) => ({
      clip_path: video.display_path,
      reason: "Dipilih sebagai klip valid dari folder owner-approved."
    }))
  });
}

export function checkClaims(input: {
  caption: string;
  cta: string;
  overlays: string[];
  script?: string[];
  contentFields?: string[];
  knowledgeBase: unknown;
}): string[] {
  const text = [
    input.caption,
    input.cta,
    ...input.overlays,
    ...(input.script || []),
    ...(input.contentFields || [])
  ].join(" ").toLowerCase();
  const findings: string[] = [];
  const forbidden = [
    {
      pattern: /(mockup[^.]{0,100}(revisi|sampai cocok|berkali|sepuas)|(revisi|sampai cocok|berkali|sepuas)[^.]{0,100}mockup)/,
      reason: "mockup_must_not_offer_revision"
    },
    { pattern: /(24 jam|selalu instan|selalu instant)/, reason: "response_claim_too_strong" },
    { pattern: /(anti pudar selamanya|tidak akan pudar)/, reason: "foil_permanence_claim_too_strong" },
    { pattern: /gratis ongkir(?![^.]{0,80}medan)/, reason: "free_shipping_must_be_medan_scoped" },
    { pattern: /gratis klise(?![^.]{0,100}(100|seratus))/, reason: "free_cliche_must_include_minimum_quantity" },
    { pattern: /garansi(?![^.]{0,80}cacat produksi)/, reason: "warranty_must_be_production_defect_scoped" }
  ];
  for (const item of forbidden) {
    if (item.pattern.test(text) && !findings.includes(item.reason)) findings.push(item.reason);
  }
  if (!text.includes("mockup")) findings.push("cta_must_include_mockup");
  return findings;
}

export function checkContentDirectorClaims(
  output: RealFootageContentDirectorOutput,
  scenes: Pick<RealFootageDirectorScene, "overlay_text" | "shot_intent">[],
  knowledgeBase: unknown
): string[] {
  return checkClaims({
    caption: output.caption,
    cta: output.cta,
    overlays: scenes.map((scene) => scene.overlay_text),
    script: [output.script.hook, output.script.body, output.script.closing, ...scenes.map((scene) => scene.shot_intent)],
    contentFields: [
      output.campaign_theme,
      output.content_angle,
      ...output.hashtags,
      ...output.selected_footage.map((item) => item.reason)
    ],
    knowledgeBase
  });
}

export async function runContentDirector(input: {
  videos: RealFootageVideoInput[];
  probes: RealFootageProbe[];
  frames: RealFootageFrame[];
  knowledgeBase: unknown;
  client?: OpenAIResponsesClient;
  forceMockDirector?: boolean;
}): Promise<RealFootageContentDirectorOutput> {
  if (input.forceMockDirector || !hasOpenAISecretPointer(process.env) || !process.env.OPENAI_MODEL) {
    return buildMockContentDirectorOutput(input.videos);
  }
  const client = input.client || createOpenAIResponsesClient({ timeoutMs: 120_000 });
  const prompt = await buildContentDirectorPrompt(input);
  const firstOutput = await requestContentDirectorOutput(client, {
    model: process.env.OPENAI_MODEL,
    instructions: prompt.instructions,
    input: prompt.input,
    max_output_tokens: 2200
  });
  const firstFindings = checkContentDirectorClaims(firstOutput, firstOutput.shot_plan, input.knowledgeBase);
  if (firstFindings.length === 0) {
    return firstOutput;
  }
  const repairPrompt = buildContentDirectorRepairPrompt({
    originalInstructions: prompt.instructions,
    originalInput: prompt.input,
    previousOutput: firstOutput,
    findings: firstFindings
  });
  const repairedOutput = await requestContentDirectorOutput(client, {
    model: process.env.OPENAI_MODEL,
    instructions: repairPrompt.instructions,
    input: repairPrompt.input,
    max_output_tokens: 2200
  });
  const repairedFindings = checkContentDirectorClaims(repairedOutput, repairedOutput.shot_plan, input.knowledgeBase);
  if (repairedFindings.length > 0) {
    throw new Error(`content_director_claim_repair_failed: ${repairedFindings.join("; ")}`);
  }
  return repairedOutput;
}

function createOpenAIResponsesClient(options: { apiKey?: string; timeoutMs: number }): OpenAIResponsesClient {
  const apiKey = options.apiKey || resolveOpenAISecret().apiKey;
  return new OpenAI({
    apiKey,
    maxRetries: 0,
    timeout: options.timeoutMs
  }) as unknown as OpenAIResponsesClient;
}

function hasOpenAISecretPointer(env: Record<string, string | undefined>): boolean {
  return Boolean(env.OPENAI_API_KEY?.trim() || env.OPENAI_API_KEY_FILE?.trim());
}

async function buildContentDirectorPrompt(input: {
  videos: RealFootageVideoInput[];
  probes: RealFootageProbe[];
  frames: RealFootageFrame[];
  knowledgeBase: unknown;
}): Promise<{ instructions: string; input: any }> {
  const text = JSON.stringify({
    source_videos: input.videos.map((video) => ({
      clip_path: video.display_path,
      filename: video.filename,
      size_bytes: video.size_bytes,
      inferred_tags: video.inferred_tags,
      probe: input.probes.find((probe) => probe.clip_path === video.display_path) || null,
      sampled_frames: input.frames.filter((frame) => frame.clip_path === video.display_path).map((frame) => ({
        clip_path: frame.clip_path,
        second: frame.second,
        size_bytes: frame.size_bytes
      }))
    })),
    frame_policy: {
      max_frames_per_video: MAX_FRAMES_PER_VIDEO,
      max_frames_per_request: MAX_FRAMES_PER_REQUEST,
      frames_are_resized_local_jpegs: true
    },
    campaign_knowledge_base: input.knowledgeBase
  }, null, 2);
  const imageContent = [];
  for (const frame of input.frames.slice(0, MAX_FRAMES_PER_REQUEST)) {
    const frameBytes = await readFile(frame.frame_path);
    imageContent.push(buildResponsesApiImageInput(`data:image/jpeg;base64,${frameBytes.toString("base64")}`));
  }
  return {
    instructions: [
      `Prompt version: ${DIRECTOR_PROMPT_VERSION}.`,
      "Anda adalah satu AI Content Director untuk Pesona Studio Desk.",
      "Buat satu paket konten vertikal dari footage nyata yang sudah divalidasi lokal.",
      "Pilih 1 sampai 3 klip, buat tepat 3 scene, dan isi start_second serta duration_seconds yang realistis.",
      "Semua scene wajib memakai clip_path dari daftar input. Jangan mengarang path.",
      "Gunakan Bahasa Indonesia. CTA wajib mengarah ke keyword MOCKUP.",
      "Jaga klaim sesuai campaign knowledge base.",
      "Aturan mockup wajib:",
      "1. Mockup awal gratis hanya preview awal, simulasi awal, atau gambaran awal.",
      "2. Mockup awal tidak direvisi.",
      "3. Dilarang menawarkan revisi mockup dalam caption, CTA, overlay, script, shot intent, reason, atau field kreatif lain.",
      "4. Dilarang menulis mockup bisa direvisi, revisi mockup, revisi mockup gratis, mockup sampai cocok, mockup revisi sampai cocok, mockup berkali-kali, atau mockup sepuasnya.",
      "5. Revisi hanya berlaku untuk desain final setelah customer cocok penawaran atau cocok harga.",
      "6. Desain final dapat direvisi sampai Desain OK.",
      "7. DP setelah Desain OK.",
      "CTA aman: Ketik MOCKUP untuk minta preview awal.",
      "Jangan menyarankan upload, publishing, scheduler, atau integrasi media sosial."
    ].join("\n"),
    input: [{
      role: "user",
      content: [
        {
          type: "input_text",
          text
        },
        ...imageContent
      ]
    }]
  };
}

async function requestContentDirectorOutput(
  client: OpenAIResponsesClient,
  input: {
    model: string | undefined;
    instructions: string;
    input: any;
    max_output_tokens: number;
  }
): Promise<RealFootageContentDirectorOutput> {
  const response = await client.responses.parse({
    model: input.model,
    instructions: input.instructions,
    input: input.input,
    text: {
      format: zodTextFormat(RealFootageContentDirectorOutputSchema, "real_footage_content_director")
    },
    store: false,
    background: false,
    max_output_tokens: input.max_output_tokens
  });
  assertCompleteOpenAIResponse(response);
  if (!response.output_parsed) {
    throw new Error("content_director_missing_structured_output");
  }
  try {
    return RealFootageContentDirectorOutputSchema.parse(response.output_parsed);
  } catch (error) {
    throw new Error(`content_director_invalid_structured_output: ${formatZodError(error)}`);
  }
}

function buildContentDirectorRepairPrompt(input: {
  originalInstructions: string;
  originalInput: any;
  previousOutput: RealFootageContentDirectorOutput;
  findings: string[];
}): { instructions: string; input: any } {
  return {
    instructions: [
      input.originalInstructions,
      "REPAIR MODE.",
      "Structured output sebelumnya valid secara schema tetapi gagal claim checker.",
      "Perbaiki seluruh structured output. Jangan melakukan patch parsial.",
      "Jangan memakai string yang menawarkan revisi mockup. Tetap boleh menyebut revisi desain final setelah cocok penawaran.",
      "Retry ini kesempatan terakhir; output berikutnya akan divalidasi ulang dengan Zod dan claim checker yang sama."
    ].join("\n"),
    input: [{
      role: "user",
      content: [
        {
          type: "input_text",
          text: JSON.stringify({
            validation_errors: input.findings,
            previous_structured_output: input.previousOutput,
            original_input: input.originalInput
          }, null, 2)
        }
      ]
    }]
  };
}

function discoverRealFootageVideos(sourceAbsoluteRoot: string): RealFootageVideoInput[] {
  const items: RealFootageVideoInput[] = [];
  function visit(directory: string): void {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = resolve(directory, entry.name);
      const lstat = lstatSync(absolutePath);
      if (lstat.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        visit(absolutePath);
        continue;
      }
      if (!entry.isFile()) continue;
      const extension = extname(entry.name).toLowerCase();
      if (!VIDEO_EXTENSIONS.has(extension)) continue;
      const fileStat = statSync(absolutePath);
      const displayPath = normalizePath(relative(sourceAbsoluteRoot, absolutePath));
      items.push({
        id: `real-footage-${String(items.length + 1).padStart(3, "0")}`,
        filename: basename(entry.name),
        absolute_path: absolutePath,
        display_path: displayPath,
        extension,
        size_bytes: fileStat.size,
        inferred_tags: inferTags(`${dirname(displayPath)} ${entry.name}`),
        mtime_ms_before: fileStat.mtimeMs
      });
    }
  }
  visit(sourceAbsoluteRoot);
  return items.sort((a, b) => a.display_path.localeCompare(b.display_path));
}

async function probeVideo(video: RealFootageVideoInput, ffprobePath: string): Promise<RealFootageProbe> {
  const command = await runCommand(ffprobePath, [
    "-v",
    "error",
    "-show_entries",
    "stream=codec_name,codec_type,width,height,pix_fmt:format=duration,size",
    "-of",
    "json",
    video.absolute_path
  ], 30_000);
  if (command.exitCode !== 0) {
    return invalidProbe(video, truncate(command.stderr) || `ffprobe_exit_${command.exitCode}`);
  }
  try {
    const parsed = JSON.parse(command.stdout);
    const streams = Array.isArray(parsed?.streams) ? parsed.streams : [];
    const videoStream = streams.find((stream: any) => stream?.codec_type === "video");
    const audioStream = streams.find((stream: any) => stream?.codec_type === "audio");
    const duration = Number(parsed?.format?.duration);
    const width = Number(videoStream?.width);
    const height = Number(videoStream?.height);
    if (!videoStream?.codec_name || !Number.isFinite(duration) || duration <= 0 || width <= 0 || height <= 0) {
      return invalidProbe(video, "missing_or_invalid_video_stream_metadata");
    }
    return {
      clip_path: video.display_path,
      valid_video: true,
      codec_name: String(videoStream.codec_name),
      audio_codec_name: audioStream?.codec_name ? String(audioStream.codec_name) : null,
      has_audio: Boolean(audioStream?.codec_name),
      width,
      height,
      pix_fmt: videoStream.pix_fmt ? String(videoStream.pix_fmt) : null,
      duration_seconds: duration,
      size_bytes: Number(parsed?.format?.size) || video.size_bytes,
      error: null
    };
  } catch (error) {
    return invalidProbe(video, error instanceof Error ? error.message : String(error));
  }
}

async function extractRepresentativeFrames(input: {
  videos: RealFootageVideoInput[];
  probes: RealFootageProbe[];
  outputRoot: string;
  ffmpegPath: string;
}): Promise<RealFootageFrame[]> {
  const frames: RealFootageFrame[] = [];
  const frameRoot = join(input.outputRoot, "frames");
  await mkdir(frameRoot, { recursive: true });
  for (const video of input.videos) {
    if (frames.length >= MAX_FRAMES_PER_REQUEST) break;
    const probe = input.probes.find((item) => item.clip_path === video.display_path);
    if (!probe?.duration_seconds) continue;
    for (const second of representativeSeconds(probe.duration_seconds).slice(0, MAX_FRAMES_PER_VIDEO)) {
      if (frames.length >= MAX_FRAMES_PER_REQUEST) break;
      const framePath = join(frameRoot, `${hashPath(video.display_path)}-${String(frames.length + 1).padStart(2, "0")}.jpg`);
      const result = await runCommand(input.ffmpegPath, buildFrameExtractionFfmpegArgs({
        sourcePath: video.absolute_path,
        outputFramePath: framePath,
        second
      }), 60_000);
      if (result.exitCode !== 0) {
        throw new Error(`frame_extraction_failed: ${video.display_path}: ${truncate(result.stderr) || `exit_${result.exitCode}`}`);
      }
      frames.push({
        clip_path: video.display_path,
        frame_path: framePath,
        second,
        size_bytes: statSync(framePath).size
      });
    }
  }
  return frames;
}

function normalizeRenderPlanScenes(
  output: RealFootageContentDirectorOutput,
  videos: RealFootageVideoInput[],
  probes: RealFootageProbe[]
): RealFootageDirectorScene[] {
  const knownPaths = new Set(videos.map((video) => video.display_path));
  return output.shot_plan.slice(0, 3).map((scene, index) => {
    const fallback = videos[Math.min(index, videos.length - 1)];
    const clipPath = knownPaths.has(scene.clip_path) ? scene.clip_path : fallback.display_path;
    const probe = probes.find((item) => item.clip_path === clipPath);
    const maxStart = Math.max(0, (probe?.duration_seconds || 4) - 1);
    return RealFootageDirectorSceneSchema.parse({
      scene_number: index + 1,
      clip_path: clipPath,
      start_second: Math.min(clampStart(scene.start_second), maxStart),
      duration_seconds: Math.min(clampDuration(scene.duration_seconds), Math.max(1, probe?.duration_seconds || 4)),
      overlay_text: scene.overlay_text,
      shot_intent: scene.shot_intent
    });
  });
}

async function probeOutputVideo(path: string, ffprobePath: string): Promise<RealFootageMvpRenderResult["output_probe"]> {
  const command = await runCommand(ffprobePath, [
    "-v",
    "error",
    "-show_entries",
    "stream=codec_name,codec_type,width,height,pix_fmt:format=duration,size",
    "-of",
    "json",
    path
  ], 30_000);
  if (command.exitCode !== 0) {
    throw new Error(`output_ffprobe_failed: ${truncate(command.stderr) || `exit_${command.exitCode}`}`);
  }
  const parsed = JSON.parse(command.stdout);
  const streams = Array.isArray(parsed?.streams) ? parsed.streams : [];
  const videoStream = streams.find((stream: any) => stream?.codec_type === "video");
  const audioStream = streams.find((stream: any) => stream?.codec_type === "audio");
  const duration = Number(parsed?.format?.duration);
  const sizeBytes = Number(parsed?.format?.size) || statSync(path).size;
  if (
    videoStream?.codec_name !== "h264" ||
    audioStream?.codec_name !== "aac" ||
    Number(videoStream?.width) !== 720 ||
    Number(videoStream?.height) !== 1280 ||
    videoStream?.pix_fmt !== "yuv420p" ||
    !Number.isFinite(duration) ||
    duration <= 0 ||
    sizeBytes <= 0
  ) {
    throw new Error(`render_output_validation_failed: ${JSON.stringify(parsed)}`);
  }
  return {
    codec_name: "h264",
    audio_codec_name: "aac",
    width: 720,
    height: 1280,
    pix_fmt: "yuv420p",
    duration_seconds: duration,
    size_bytes: sizeBytes
  };
}

function invalidProbe(video: RealFootageVideoInput, error: string | null): RealFootageProbe {
  return {
    clip_path: video.display_path,
    valid_video: false,
    codec_name: null,
    audio_codec_name: null,
    has_audio: false,
    width: null,
    height: null,
    pix_fmt: null,
    duration_seconds: null,
    size_bytes: video.size_bytes,
    error
  };
}

function detectSourceMutation(videos: RealFootageVideoInput[]): string[] {
  const mutated: string[] = [];
  for (const video of videos) {
    if (!existsSync(video.absolute_path)) {
      mutated.push(`${video.display_path}:missing`);
      continue;
    }
    const fileStat = statSync(video.absolute_path);
    if (fileStat.size !== video.size_bytes || fileStat.mtimeMs !== video.mtime_ms_before) {
      mutated.push(video.display_path);
    }
  }
  return mutated;
}

async function loadKnowledgeBase(projectRoot: string): Promise<unknown> {
  const raw = await readFile(resolve(projectRoot, "configs/campaign_knowledge_base.json"), "utf8");
  return JSON.parse(raw);
}

function runCommand(command: string, args: string[], timeoutMs: number): Promise<CommandResult> {
  return new Promise((resolveRun) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let settled = false;
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolveRun({ exitCode: null, stdout, stderr: `${stderr}${error.message}`, timedOut });
    });
    child.on("close", (exitCode) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolveRun({ exitCode, stdout, stderr, timedOut });
    });
  });
}

function assertCompleteOpenAIResponse(response: any): void {
  if (response?.status && response.status !== "completed") {
    throw new Error(`content_director_incomplete_response: ${response.status}`);
  }
  const refusal = JSON.stringify(response?.output || "").toLowerCase();
  if (refusal.includes("refusal")) {
    throw new Error("content_director_refusal");
  }
}

function representativeSeconds(duration: number): number[] {
  if (duration <= 3) return [0];
  return Array.from(new Set([
    Math.max(0, Math.floor(duration * 0.15)),
    Math.max(0, Math.floor(duration * 0.5)),
    Math.max(0, Math.floor(duration * 0.8))
  ]));
}

function inferTags(value: string): string[] {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, " ");
  const tags = [
    "sampul",
    "raport",
    "ijazah",
    "produksi",
    "proses",
    "emboss",
    "cover",
    "foil",
    "qc",
    "packing",
    "mockup",
    "sekolah"
  ].filter((tag) => normalized.includes(tag));
  return Array.from(new Set(tags.length > 0 ? tags : ["needs_manual_metadata"])).sort();
}

function resolveSourceRoot(sourceRoot: string): string {
  const resolved = isAbsolute(sourceRoot) ? resolve(sourceRoot) : resolve(process.cwd(), sourceRoot);
  if (!existsSync(resolved) || !statSync(resolved).isDirectory()) {
    throw new Error(`approved_source_root_not_found: ${resolved}`);
  }
  return resolved;
}

function assertApprovedSourceRoot(value: string): void {
  const normalized = normalizePath(value).toLowerCase();
  const forbiddenParts = ["/storage/approved-videos", "/storage/draft-videos", "/publish", "/upload", "/backup", "/production"];
  if (forbiddenParts.some((part) => normalized.includes(part))) {
    throw new Error(`approved_source_root_looks_like_production_or_publish_path: ${value}`);
  }
}

function assertSafeOutputRoot(value: string): void {
  if (!value || value.startsWith("/") || value.includes("\\") || value.split("/").some((part) => !part || part === "..")) {
    throw new Error("outputRoot_must_be_safe_project_relative_path");
  }
  if (!value.startsWith("tmp/") && !value.startsWith("storage/draft-videos/")) {
    throw new Error("outputRoot_must_be_under_tmp_or_storage_draft_videos");
  }
}

function assertSafeOutputFilename(value: string): void {
  if (basename(value) !== value || extname(value).toLowerCase() !== ".mp4") {
    throw new Error("outputFilename_must_be_an_mp4_basename");
  }
}

function resolveInsideProject(projectRoot: string, relativePath: string, label: string): string {
  const normalized = normalizeRelativePath(relativePath);
  const target = resolve(projectRoot, normalized);
  const rel = relative(projectRoot, target);
  if (!rel || rel.startsWith("..") || rel.split(sep).includes("..")) {
    throw new Error(`${label}_must_stay_inside_project`);
  }
  return target;
}

function normalizeRelativePath(value: string): string {
  return normalizePath(value).replace(/^\.?\//, "").replace(/\/+$/g, "");
}

function normalizePath(value: string): string {
  return value.replaceAll("\\", "/");
}

function clampStart(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value * 10) / 10);
}

function clampDuration(value: number): number {
  if (!Number.isFinite(value)) return 4;
  return Math.max(1, Math.min(8, Math.round(value * 10) / 10));
}

function wrapOverlayText(value: string, maxLineLength = 24): string {
  const lines: string[] = [];
  let current = "";
  for (const word of value.trim().split(/\s+/)) {
    if (!current) current = word;
    else if (`${current} ${word}`.length <= maxLineLength) current = `${current} ${word}`;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.join("\n");
}

function escapeFilterPath(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll(":", "\\:").replaceAll("'", "\\'");
}

function truncate(value: string | null | undefined, maxLength = 2000): string | null {
  if (!value) return null;
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function hashPath(value: string): string {
  return createHash("sha1").update(value).digest("hex").slice(0, 12);
}

function formatZodError(error: unknown): string {
  if (!(error instanceof ZodError)) return "unknown";
  return error.issues.map((issue) => `${issue.path.join(".")}:${issue.message}`).slice(0, 8).join("; ");
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
