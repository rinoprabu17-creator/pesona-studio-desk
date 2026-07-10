import {
  resolveContentDirectorProvider,
  runRealFootageMvpRender
} from "../packages/content-engine/src/real-footage-mvp-render.ts";

const sourceRoot = process.env.REAL_FOOTAGE_INPUT_DIR || "/mnt/c/Users/rinop/Downloads/psd-real-footage-input";
const outputRoot = process.env.REAL_FOOTAGE_RENDER_OUTPUT_DIR || "tmp/real-footage-mvp-render";
const outputFilename = process.env.REAL_FOOTAGE_RENDER_OUTPUT_FILENAME || "pesona-studio-draft.mp4";
const requestedProvider = process.env.REAL_FOOTAGE_CONTENT_DIRECTOR_PROVIDER || "auto";

try {
  const providerConfig = resolveContentDirectorProvider(requestedProvider);
  const result = await runRealFootageMvpRender({
    sourceRoot,
    outputRoot,
    outputFilename,
    forceMockDirector: providerConfig.forceMockDirector || process.env.REAL_FOOTAGE_CONTENT_DIRECTOR_FORCE_MOCK === "true"
  });

  console.log(JSON.stringify({
    status: result.status,
    ai_status: result.ai_status,
    provider: result.provider,
    model: result.model,
    approved_source_root: result.approved_source_root,
    output_root: result.output_root,
    source_manifest_path: result.source_manifest_path,
    frame_manifest_path: result.frame_manifest_path,
    render_plan_path: result.render_plan_path,
    output_path: result.output_path,
    output_size_bytes: result.output_size_bytes,
    discovered_video_count: result.discovered_video_count,
    valid_video_count: result.valid_video_count,
    extracted_frame_count: result.extracted_frame_count,
    ai_frame_detail: result.ai_frame_detail,
    ai_frame_max_dimension: result.ai_frame_max_dimension,
    ai_frame_total_bytes: result.ai_frame_total_bytes,
    rendered_scene_count: result.rendered_scene_count,
    codec_name: result.output_probe.codec_name,
    audio_codec_name: result.output_probe.audio_codec_name,
    width: result.output_probe.width,
    height: result.output_probe.height,
    pix_fmt: result.output_probe.pix_fmt,
    duration_seconds: result.output_probe.duration_seconds,
    source_mutated: result.safety.source_mutated,
    upload_performed: result.safety.upload_performed,
    publish_performed: result.safety.publish_performed,
    deploy_performed: result.safety.deploy_performed,
    production_manifest_mutated: result.safety.production_manifest_mutated,
    real_metadata_store_mutated: result.safety.real_metadata_store_mutated
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({
    status: "failed",
    ai_status: (process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_FILE) && process.env.OPENAI_MODEL ? "live_requested" : "mock_only",
    approved_source_root: sourceRoot,
    output_root: outputRoot,
    error: error instanceof Error ? error.message : String(error)
  }, null, 2));
  process.exitCode = 1;
}

export {};
