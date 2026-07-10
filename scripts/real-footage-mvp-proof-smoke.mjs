import {
  loadContentEngineRuntimeConfig,
  runRealFootageMvpProof
} from "../packages/content-engine/src/index.ts";

const config = loadContentEngineRuntimeConfig();
const sourceRoot =
  process.env.REAL_FOOTAGE_MVP_SOURCE_ROOT || "packages/content-engine/fixtures/read-only-intake-sample";
const outputRoot = process.env.REAL_FOOTAGE_MVP_OUTPUT_ROOT || "tmp/real-footage-mvp-proof";

const result = await runRealFootageMvpProof({
  sourceRoot,
  outputRoot
});

const output = {
  provider: result.provider,
  requested_provider: process.env.AI_PROVIDER || "fake",
  active_provider: config.provider,
  live_enabled: config.liveEnabled,
  fallback_reason: config.fallbackReason,
  approved_source_root: result.approved_source_root,
  output_root: result.output_root,
  scanned_files: result.source_scan.scanned_files,
  accepted_media_files: result.source_scan.accepted_media_files,
  rejected_files: result.source_scan.rejected_files,
  video_files: result.source_scan.video_files,
  image_files: result.source_scan.image_files,
  manifest_generated: result.manifest.generated,
  manifest_item_count: result.manifest.item_count,
  owner_review_needed_count: result.manifest.items.filter((item) => item.owner_review_needed).length,
  content_calendar_items: result.campaign_package.content_calendar_items.length,
  caption_present: result.campaign_package.caption.length > 0,
  hashtags_count: result.campaign_package.hashtags.length,
  cta: result.campaign_package.cta,
  script_scene_count: result.campaign_package.script.scenes.length,
  shot_plan_count: result.campaign_package.shot_plan.length,
  selected_footage_count: result.campaign_package.selected_footage.length,
  selected_footage_with_clip_count: result.campaign_package.selected_footage.filter((item) => item.selected_clip).length,
  render_ready: result.campaign_package.render_plan.render_ready,
  render_blocker: result.campaign_package.render_plan.blocker,
  next_step_to_enable_render: result.campaign_package.render_plan.next_step_to_enable_render,
  draft_video_job_available: result.campaign_package.draft_video_job.available,
  draft_video_output_path: result.campaign_package.draft_video_job.output_path,
  source_manifest_path: result.output_files.source_manifest_path,
  campaign_package_path: result.output_files.campaign_package_path,
  render_plan_path: result.output_files.render_plan_path,
  summary_path: result.output_files.summary_path,
  source_mutated: result.safety.source_mutated,
  media_decoded: result.safety.media_decoded,
  ffmpeg_executed: result.safety.ffmpeg_executed,
  upload_performed: result.safety.upload_performed,
  publish_performed: result.safety.publish_performed,
  external_api_used: result.safety.external_api_used,
  production_manifest_mutated: result.safety.production_manifest_mutated,
  real_metadata_store_mutated: result.safety.real_metadata_store_mutated
};

if (
  output.provider !== "fake_content_engine" ||
  output.scanned_files < 1 ||
  output.accepted_media_files < 1 ||
  output.video_files < 1 ||
  output.manifest_generated !== true ||
  output.manifest_item_count < 1 ||
  output.content_calendar_items < 7 ||
  output.caption_present !== true ||
  output.hashtags_count < 1 ||
  output.script_scene_count < 3 ||
  output.shot_plan_count < 3 ||
  output.selected_footage_count < 3 ||
  output.selected_footage_with_clip_count < 1 ||
  output.render_ready !== false ||
  output.draft_video_job_available !== false ||
  output.source_mutated !== false ||
  output.media_decoded !== false ||
  output.ffmpeg_executed !== false ||
  output.upload_performed !== false ||
  output.publish_performed !== false ||
  output.external_api_used !== false ||
  output.production_manifest_mutated !== false ||
  output.real_metadata_store_mutated !== false
) {
  console.log(JSON.stringify(output, null, 2));
  throw new Error("real_footage_mvp_proof_smoke_failed");
}

console.log(JSON.stringify(output, null, 2));
