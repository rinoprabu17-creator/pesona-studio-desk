import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildMockContentDirectorOutput,
  buildRealFootageFfmpegArgs,
  checkClaims,
  RealFootageContentDirectorOutputSchema,
  resolveContentDirectorProvider,
  runContentDirector,
  type RealFootageVideoInput
} from "../../packages/content-engine/src/real-footage-mvp-render.ts";

const videos: RealFootageVideoInput[] = [
  {
    id: "real-footage-001",
    filename: "proses produksi cover 2.mp4",
    absolute_path: "/mnt/c/Users/rinop/Downloads/psd-real-footage-input/proses produksi cover 2.mp4",
    display_path: "proses produksi cover 2.mp4",
    extension: ".mp4",
    size_bytes: 1024,
    inferred_tags: ["produksi", "cover"],
    mtime_ms_before: 1
  },
  {
    id: "real-footage-002",
    filename: "proses produksi emboss 2.mp4",
    absolute_path: "/mnt/c/Users/rinop/Downloads/psd-real-footage-input/proses produksi emboss 2.mp4",
    display_path: "proses produksi emboss 2.mp4",
    extension: ".mp4",
    size_bytes: 2048,
    inferred_tags: ["produksi", "emboss"],
    mtime_ms_before: 1
  }
];

test("real footage content director mock output matches strict schema", () => {
  const output = buildMockContentDirectorOutput(videos);

  assert.doesNotThrow(() => RealFootageContentDirectorOutputSchema.parse(output));
  assert.equal(output.shot_plan.length, 3);
  assert.equal(output.selected_footage.length, 2);
  assert.match(output.cta, /MOCKUP/);
});

test("real footage claim checker blocks unsafe mockup revision claims", () => {
  assert.deepEqual(checkClaims({
    caption: "Mockup bisa revisi sampai cocok.",
    cta: "Ketik MOCKUP.",
    overlays: ["Preview sekolah"],
    knowledgeBase: {}
  }), ["mockup_must_not_offer_revision"]);
  assert.deepEqual(checkClaims({
    caption: "Mockup bisa direvisi untuk sekolah.",
    cta: "Ketik MOCKUP.",
    overlays: ["Preview sekolah"],
    knowledgeBase: {}
  }), ["mockup_must_not_offer_revision"]);
});

test("real footage claim checker blocks reversed mockup revision phrases", () => {
  assert.deepEqual(checkClaims({
    caption: "Revisi mockup gratis untuk sekolah.",
    cta: "Ketik MOCKUP.",
    overlays: ["Preview sekolah"],
    knowledgeBase: {}
  }), ["mockup_must_not_offer_revision"]);
});

test("real footage claim checker allows final design revision after offer fit", () => {
  assert.deepEqual(checkClaims({
    caption: "Desain final dapat direvisi sampai Desain OK setelah customer cocok penawaran.",
    cta: "Ketik MOCKUP untuk preview awal.",
    overlays: ["Preview awal sampul sekolah"],
    knowledgeBase: {}
  }), []);
});

test("real footage content director repair retry succeeds once after claim failure", async () => {
  const bad = {
    ...buildMockContentDirectorOutput(videos),
    caption: "Mockup bisa direvisi sampai cocok untuk sekolah."
  };
  const good = buildMockContentDirectorOutput(videos);
  const requests: Record<string, unknown>[] = [];
  const client = {
    responses: {
      async parse(request: Record<string, unknown>) {
        requests.push(request);
        return {
          status: "completed",
          output_parsed: requests.length === 1 ? bad : good
        };
      }
    }
  };

  const output = await withOpenAIEnv(() => runContentDirector({
    videos,
    probes: videos.map((video) => ({
      clip_path: video.display_path,
      valid_video: true,
      codec_name: "h264",
      audio_codec_name: "aac",
      has_audio: true,
      width: 720,
      height: 1280,
      pix_fmt: "yuv420p",
      duration_seconds: 10,
      size_bytes: video.size_bytes,
      error: null
    })),
    frames: [],
    knowledgeBase: {},
    client
  }));

  assert.equal(requests.length, 2);
  assert.equal(output.caption, good.caption);
  assert.match(JSON.stringify(requests[1]), /mockup_must_not_offer_revision/);
});

test("real footage content director repair retry fails clearly after second claim failure", async () => {
  const bad = {
    ...buildMockContentDirectorOutput(videos),
    caption: "Revisi mockup gratis sampai cocok."
  };
  const client = {
    responses: {
      async parse() {
        return {
          status: "completed",
          output_parsed: bad
        };
      }
    }
  };

  await assert.rejects(
    withOpenAIEnv(() => runContentDirector({
      videos,
      probes: videos.map((video) => ({
        clip_path: video.display_path,
        valid_video: true,
        codec_name: "h264",
        audio_codec_name: "aac",
        has_audio: true,
        width: 720,
        height: 1280,
        pix_fmt: "yuv420p",
        duration_seconds: 10,
        size_bytes: video.size_bytes,
        error: null
      })),
      frames: [],
      knowledgeBase: {},
      client
    })),
    /content_director_claim_repair_failed: mockup_must_not_offer_revision/
  );
});

test("real footage openai provider request does not fallback to mock without key and model", () => {
  assert.throws(
    () => resolveContentDirectorProvider("openai", {}),
    /openai_content_director_requested_but_OPENAI_API_KEY_or_OPENAI_API_KEY_FILE_or_OPENAI_MODEL_missing/
  );
  assert.throws(
    () => resolveContentDirectorProvider("openai", { OPENAI_API_KEY_FILE: "/run/secrets/openai_api_key" }),
    /openai_content_director_requested_but_OPENAI_API_KEY_or_OPENAI_API_KEY_FILE_or_OPENAI_MODEL_missing/
  );
  assert.equal(resolveContentDirectorProvider("openai", {
    OPENAI_MODEL: "gpt-test",
    OPENAI_API_KEY_FILE: "/run/secrets/openai_api_key"
  }).forceMockDirector, false);
  assert.equal(resolveContentDirectorProvider("mock", {}).forceMockDirector, true);
});

test("real footage OpenAI compose override wires only required worker secrets", () => {
  const compose = readFileSync("docker-compose.openai.yml", "utf8");
  const webAppSection = section(compose, "web-app:");
  const campaignWorkerSection = section(compose, "campaign-planner-worker:");
  const videoWorkerSection = section(compose, "video-worker:");

  assert.match(videoWorkerSection, /REAL_FOOTAGE_CONTENT_DIRECTOR_PROVIDER:\s*openai/);
  assert.match(videoWorkerSection, /OPENAI_MODEL:\s*\$\{OPENAI_MODEL:\?/);
  assert.match(videoWorkerSection, /OPENAI_API_KEY_FILE:\s*\/run\/secrets\/openai_api_key/);
  assert.match(videoWorkerSection, /REAL_FOOTAGE_INPUT_DIR:\s*storage\/footage\/psd-real-footage-input/);
  assert.match(videoWorkerSection, /REAL_FOOTAGE_RENDER_OUTPUT_DIR:\s*storage\/draft-videos\/real-footage-mvp/);
  assert.match(videoWorkerSection, /secrets:\s*\n\s*- openai_api_key/);
  assert.match(campaignWorkerSection, /OPENAI_API_KEY_FILE:\s*\/run\/secrets\/openai_api_key/);
  assert.doesNotMatch(webAppSection, /OPENAI_API_KEY/);
  assert.match(compose, /openai_api_key:\s*\n\s*file:\s*\.\/secrets\/openai_api_key\.txt/);
});

test("real footage FFmpeg args render vertical H.264 AAC MP4 with overlays", () => {
  const args = buildRealFootageFfmpegArgs([
    {
      scene_number: 1,
      clip_path: "proses produksi cover 2.mp4",
      clip_absolute_path: "/input/proses produksi cover 2.mp4",
      start_second: 0,
      duration_seconds: 4,
      overlay_text: "Proses sampul sekolah",
      overlay_text_path: "/tmp/scene-1.txt",
      shot_intent: "Buka dengan proses.",
      has_audio: true
    },
    {
      scene_number: 2,
      clip_path: "proses produksi emboss 2.mp4",
      clip_absolute_path: "/input/proses produksi emboss 2.mp4",
      start_second: 1,
      duration_seconds: 4,
      overlay_text: "Ketik MOCKUP",
      overlay_text_path: "/tmp/scene-2.txt",
      shot_intent: "Tutup dengan CTA.",
      has_audio: false
    }
  ], "/tmp/pesona-studio-draft.mp4", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf");
  const joined = args.join(" ");

  assert.match(joined, /scale=720:1280:force_original_aspect_ratio=decrease/);
  assert.match(joined, /pad=720:1280/);
  assert.match(joined, /drawtext=/);
  assert.match(joined, /concat=n=2:v=1:a=0/);
  assert.match(joined, /concat=n=2:v=0:a=1/);
  assert.match(joined, /-c:v libx264/);
  assert.match(joined, /-pix_fmt yuv420p/);
  assert.match(joined, /-r 30/);
  assert.match(joined, /-c:a aac/);
  assert.match(joined, /-ac 2/);
  assert.match(joined, /-movflags \+faststart/);
  assert.equal(args.at(-1), "/tmp/pesona-studio-draft.mp4");
});

test("real footage FFmpeg args reject invalid scene count", () => {
  assert.throws(
    () => buildRealFootageFfmpegArgs([], "/tmp/out.mp4", "/tmp/font.ttf"),
    /render_scene_count_must_be_between_1_and_3/
  );
});

async function withOpenAIEnv<T>(callback: () => Promise<T>): Promise<T> {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  process.env.OPENAI_API_KEY = "test-key";
  process.env.OPENAI_MODEL = "test-model";
  try {
    return await callback();
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
  }
}

function section(source: string, marker: string): string {
  const start = source.indexOf(`  ${marker}`);
  assert.notEqual(start, -1);
  const rest = source.slice(start + 2);
  const next = rest.search(/\n  [a-zA-Z0-9-]+:/);
  return next === -1 ? rest : rest.slice(0, next);
}
