import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { mkdtemp, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
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
  addShotPlanStep,
  getContentItemScriptPlan,
  getOrCreateContentItemScriptPlan,
  getShotPlanStep,
  listShotPlanSteps,
  removeShotPlanStep,
  updateContentItemScriptPlan,
  updateShotPlanStep
} from "../../apps/web/src/content-item-script-plan-service.ts";
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
import {
  validateScriptPlanInput,
  validateShotPlanStepInput
} from "../../apps/web/src/validation/content-item-script-plan-validation.ts";
import {
  cancelVideoDraftJob,
  createVideoDraftJobForContentItem,
  getVideoDraftJobById,
  getVideoDraftJobForContentItem,
  getVideoDraftReadinessForContentItem,
  updateVideoDraftJob
} from "../../apps/web/src/video-draft-job-service.ts";
import { validateVideoDraftJobInput } from "../../apps/web/src/validation/video-draft-job-validation.ts";
import {
  createRenderManifestForVideoDraftJob,
  getRenderManifestById,
  getRenderManifestContextForContentItem,
  getRenderManifestForVideoDraftJob,
  listRenderManifestItems,
  updateRenderManifest
} from "../../apps/web/src/render-manifest-service.ts";
import { validateRenderManifestInput } from "../../apps/web/src/validation/render-manifest-validation.ts";
import {
  buildRenderPreflightChecks,
  getRenderPreflightContextForContentItem,
  getRenderPreflightRunById,
  listRenderPreflightChecks,
  listRenderPreflightRunsForManifest,
  runRenderPreflightForManifest
} from "../../apps/web/src/render-preflight-service.ts";
import {
  validateRenderPreflightResult,
  validateRenderPreflightRunStatus
} from "../../apps/web/src/validation/render-preflight-validation.ts";
import {
  buildSafeFfmpegMultiShotArgs,
  buildSafeFfmpegArgs,
  getControlledRenderContextForContentItem,
  getControlledRenderContextForManifest,
  getRenderAttemptById,
  isSafeRenderSourceRelativePath,
  listRenderAttemptsForManifest,
  runControlledMultiShotSmokeRenderForManifest,
  runControlledSmokeRenderForManifest,
  validateControlledMultiShotRenderEligibility,
  validateControlledRenderEligibility
} from "../../apps/web/src/render-attempt-service.ts";
import {
  validateRenderAttemptMode,
  validateRenderAttemptOutputRelativePath,
  validateRenderAttemptStatus
} from "../../apps/web/src/validation/render-attempt-validation.ts";
import {
  approveRenderAttempt,
  getRenderAttemptReviewByAttemptId,
  getRenderAttemptReviewContext,
  getRenderAttemptReviewContextForContentItem,
  listRenderAttemptReviewsForManifest,
  rejectRenderAttempt,
  validateRenderAttemptReviewEligibility
} from "../../apps/web/src/render-attempt-review-service.ts";
import {
  validateRenderAttemptReviewInput,
  validateRenderAttemptReviewStatus
} from "../../apps/web/src/validation/render-attempt-review-validation.ts";
import {
  getRenderApprovedPromotionByAttemptId,
  getRenderApprovedPromotionContext,
  getRenderApprovedPromotionContextForContentItem,
  listRenderApprovedPromotionsForManifest,
  promoteApprovedRenderAttempt,
  validateRenderApprovedPromotionEligibility
} from "../../apps/web/src/render-approved-promotion-service.ts";
import {
  validateRenderApprovedPromotionInput,
  validateRenderApprovedPromotionStatus
} from "../../apps/web/src/validation/render-approved-promotion-validation.ts";
import {
  archiveApprovedVideoHandoff,
  getApprovedVideoHandoffContext,
  getApprovedVideoHandoffContextForContentItem,
  getHandoffByPromotionId,
  listApprovedVideoLibrary,
  markApprovedVideoHold,
  markApprovedVideoNeedsRevision,
  markApprovedVideoReadyForManualPublish,
  validateApprovedVideoHandoffEligibility
} from "../../apps/web/src/approved-video-handoff-service.ts";
import {
  validateApprovedVideoHandoffInput,
  validateApprovedVideoHandoffStatus
} from "../../apps/web/src/validation/approved-video-handoff-validation.ts";
import { handleApprovedVideoApiRoute } from "../../apps/web/src/routes/approved-video-api-routes.ts";
import {
  handleApprovedVideoPageGet,
  handleApprovedVideoPagePost
} from "../../apps/web/src/routes/approved-video-page-routes.ts";
import {
  archiveManualPublicationPackage,
  createManualPublicationPackageFromHandoff,
  createManualPublicationPackageFromPromotion,
  getManualPublicationPackageByHandoffId,
  getManualPublicationPackageContext,
  getManualPublicationPackageCreateContext,
  listManualPublicationPackages,
  markManualPublicationPackageHold,
  markManualPublicationPackageNeedsRevision,
  markManualPublicationPackagePublishedManually,
  markManualPublicationPackageReady,
  updateManualPublicationPackage,
  updateManualPublicationPackageChannel,
  validateManualPublicationPackageEligibility
} from "../../apps/web/src/manual-publication-package-service.ts";
import {
  validateManualPublicationPackageChannelInput,
  validateManualPublicationPackageChannelStatus,
  validateManualPublicationPackageInput,
  validateManualPublicationPackageStatus
} from "../../apps/web/src/validation/manual-publication-package-validation.ts";
import { handleManualPublicationPackageApiRoute } from "../../apps/web/src/routes/manual-publication-package-api-routes.ts";
import {
  handleManualPublicationPackagePageGet,
  handleManualPublicationPackagePagePost
} from "../../apps/web/src/routes/manual-publication-package-page-routes.ts";
import {
  addManualPublishEvidence,
  getManualPublicationPackageCompletionSummary,
  getManualPublishChecklistContext,
  getManualPublishChecklistContextForChannel,
  initializeManualPublishChecklist,
  listManualPublishEvidence,
  setManualPublishChecklistItemStatus
} from "../../apps/web/src/manual-publish-checklist-service.ts";
import {
  validateManualPublishChecklistItemInput,
  validateManualPublishChecklistStatus,
  validateManualPublishEvidenceInput,
  validateManualPublishEvidenceType
} from "../../apps/web/src/validation/manual-publish-checklist-validation.ts";
import { handleManualPublishChecklistApiRoute } from "../../apps/web/src/routes/manual-publish-checklist-api-routes.ts";
import {
  handleManualPublishChecklistPageGet,
  handleManualPublishChecklistPagePost
} from "../../apps/web/src/routes/manual-publish-checklist-page-routes.ts";
import {
  exportManualPublishReportCsv,
  getManualPublishReportBoard,
  getManualPublishReportPackageDetail,
  getManualPublishReportSummary
} from "../../apps/web/src/manual-publish-report-service.ts";
import { validateManualPublishReportFilters } from "../../apps/web/src/validation/manual-publish-report-validation.ts";
import { handleManualPublishReportApiRoute } from "../../apps/web/src/routes/manual-publish-report-api-routes.ts";
import { handleManualPublishReportPageGet } from "../../apps/web/src/routes/manual-publish-report-page-routes.ts";
import {
  createManualPublishCloseout,
  getManualPublishCloseoutByPackageId,
  getManualPublishCloseoutDetail,
  getManualPublishCloseoutEligibility,
  listManualPublishCloseouts
} from "../../apps/web/src/manual-publish-closeout-service.ts";
import { validateManualPublishCloseoutInput } from "../../apps/web/src/validation/manual-publish-closeout-validation.ts";
import { handleManualPublishCloseoutApiRoute } from "../../apps/web/src/routes/manual-publish-closeout-api-routes.ts";
import {
  handleManualPublishCloseoutPageGet,
  handleManualPublishCloseoutPagePost
} from "../../apps/web/src/routes/manual-publish-closeout-page-routes.ts";
import {
  getOperationalReadinessDashboard,
  getOperationalReadinessPipeline,
  getOperationalReadinessSummary
} from "../../apps/web/src/operational-readiness-service.ts";
import { validateOperationalReadinessFilters } from "../../apps/web/src/validation/operational-readiness-validation.ts";
import { handleOperationalReadinessApiRoute } from "../../apps/web/src/routes/operational-readiness-api-routes.ts";
import { handleOperationalReadinessPageGet } from "../../apps/web/src/routes/operational-readiness-page-routes.ts";

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
        `DELETE FROM manual_publish_closeouts
         WHERE content_item_id IN (SELECT id FROM content_items WHERE campaign_id = ANY($1::uuid[]))`,
        [ids]
      );
      await pool.query(
        `DELETE FROM manual_publish_evidence_logs
         WHERE content_item_id IN (SELECT id FROM content_items WHERE campaign_id = ANY($1::uuid[]))`,
        [ids]
      );
      await pool.query(
        `DELETE FROM manual_publish_checklist_items
         WHERE content_item_id IN (SELECT id FROM content_items WHERE campaign_id = ANY($1::uuid[]))`,
        [ids]
      );
      await pool.query(
        `DELETE FROM manual_publication_package_channels
         WHERE content_item_id IN (SELECT id FROM content_items WHERE campaign_id = ANY($1::uuid[]))`,
        [ids]
      );
      await pool.query(
        `DELETE FROM manual_publication_packages
         WHERE content_item_id IN (SELECT id FROM content_items WHERE campaign_id = ANY($1::uuid[]))`,
        [ids]
      );
      await pool.query(
        `DELETE FROM video_approved_handoff_records
         WHERE content_item_id IN (SELECT id FROM content_items WHERE campaign_id = ANY($1::uuid[]))`,
        [ids]
      );
      await pool.query(
        `DELETE FROM video_render_approved_promotions
         WHERE content_item_id IN (SELECT id FROM content_items WHERE campaign_id = ANY($1::uuid[]))`,
        [ids]
      );
      await pool.query(
        `DELETE FROM video_render_attempt_reviews
         WHERE content_item_id IN (SELECT id FROM content_items WHERE campaign_id = ANY($1::uuid[]))`,
        [ids]
      );
      await pool.query(
        `DELETE FROM video_render_attempts
         WHERE content_item_id IN (SELECT id FROM content_items WHERE campaign_id = ANY($1::uuid[]))`,
        [ids]
      );
      await pool.query(
        `DELETE FROM video_render_preflight_checks
         WHERE preflight_run_id IN (
           SELECT id FROM video_render_preflight_runs
           WHERE content_item_id IN (SELECT id FROM content_items WHERE campaign_id = ANY($1::uuid[]))
         )`,
        [ids]
      );
      await pool.query(
        `DELETE FROM video_render_preflight_runs
         WHERE content_item_id IN (SELECT id FROM content_items WHERE campaign_id = ANY($1::uuid[]))`,
        [ids]
      );
      await pool.query(
        `DELETE FROM video_render_manifest_items
         WHERE manifest_id IN (
           SELECT id FROM video_render_manifests
           WHERE content_item_id IN (SELECT id FROM content_items WHERE campaign_id = ANY($1::uuid[]))
         )`,
        [ids]
      );
      await pool.query(
        `DELETE FROM video_render_manifests
         WHERE content_item_id IN (SELECT id FROM content_items WHERE campaign_id = ANY($1::uuid[]))`,
        [ids]
      );
      await pool.query(
        `DELETE FROM video_draft_jobs
         WHERE content_item_id IN (SELECT id FROM content_items WHERE campaign_id = ANY($1::uuid[]))`,
        [ids]
      );
      await pool.query(
        `DELETE FROM content_item_shot_plan_steps
         WHERE script_plan_id IN (
           SELECT id FROM content_item_script_plans
           WHERE content_item_id IN (SELECT id FROM content_items WHERE campaign_id = ANY($1::uuid[]))
         )`,
        [ids]
      );
      await pool.query(
        `DELETE FROM content_item_script_plans
         WHERE content_item_id IN (SELECT id FROM content_items WHERE campaign_id = ANY($1::uuid[]))`,
        [ids]
      );
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

async function createReadyRenderAttemptFixture(
  codeSuffix: string,
  options: { createSourceFile?: boolean; manifestStatus?: "reviewed" | "approved"; runPreflight?: boolean; sourceCount?: number } = {}
) {
  const createSourceFile = options.createSourceFile ?? true;
  const manifestStatus = options.manifestStatus || "approved";
  const sourceCount = options.sourceCount || 1;
  const { storageRoot, footageRoot } = await createTempFootageRoot();
  const contentItemId = await createContent(`render-attempt-${codeSuffix}`);
  const plan = await getOrCreateContentItemScriptPlan(contentItemId);
  const reviewedItems = [];
  const selections = [];
  const steps = [];
  const sourcePaths = [];
  for (let index = 1; index <= sourceCount; index += 1) {
    const reviewed = await createFootage(`render-attempt-${codeSuffix}-${index}.mp4`, "reviewed");
    const selection = await addContentItemFootageSelection(contentItemId, {
      footage_asset_id: reviewed.id,
      sequence_number: index,
      role: index === 1 ? "opening" : "product"
    });
    const step = await addShotPlanStep(plan.id, {
      content_item_footage_selection_id: selection.id,
      sequence_number: index,
      step_type: index === 1 ? "hook" : "product",
      duration_seconds: 5
    });
    reviewedItems.push(reviewed);
    selections.push(selection);
    steps.push(step);
    sourcePaths.push(join(footageRoot, reviewed.relative_path));
  }
  const job = await createVideoDraftJobForContentItem(contentItemId, {
    script_plan_id: plan.id,
    job_status: "planning_ready",
    target_format: "vertical_9_16",
    render_mode: "disabled_metadata_only"
  });
  const manifest = await createRenderManifestForVideoDraftJob(job.id, {
    manifest_status: manifestStatus,
    manifest_mode: "metadata_only",
    target_format: "vertical_9_16"
  });

  if (createSourceFile) {
    for (const sourcePath of sourcePaths) {
      await mkdir(dirname(sourcePath), { recursive: true });
      await writeFile(sourcePath, `mock source for ${codeSuffix}`);
    }
  }
  const preflight = options.runPreflight === false ? null : await runRenderPreflightForManifest(manifest.id);

  return {
    storageRoot,
    footageRoot,
    contentItemId,
    plan,
    reviewed: reviewedItems[0],
    reviewedItems,
    selection: selections[0],
    selections,
    step: steps[0],
    steps,
    job,
    manifest,
    preflight,
    sourcePath: sourcePaths[0],
    sourcePaths
  };
}

async function withAppStorageRoot<T>(storageRoot: string, fn: () => Promise<T>): Promise<T> {
  const previous = process.env.APP_STORAGE_DIR;
  process.env.APP_STORAGE_DIR = storageRoot;
  try {
    return await fn();
  } finally {
    if (previous === undefined) {
      delete process.env.APP_STORAGE_DIR;
    } else {
      process.env.APP_STORAGE_DIR = previous;
    }
  }
}

async function createSucceededReviewFixture(codeSuffix: string) {
  const fixture = await createReadyRenderAttemptFixture(`review-${codeSuffix}`, {
    createSourceFile: true,
    manifestStatus: "approved"
  });
  const outputRelativePath = `smoke/review-${fixture.manifest.id.slice(0, 8)}-${codeSuffix}.mp4`;
  const attempt = await runControlledSmokeRenderForManifest(fixture.manifest.id, {
    storageRoot: fixture.storageRoot,
    output_relative_path: outputRelativePath,
    ffmpegRunner: async (args) => {
      const outputPath = String(args.at(-1) || "");
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, `review output ${codeSuffix}`);
      return { exitCode: 0, errorMessage: null };
    }
  });
  return {
    ...fixture,
    attempt,
    outputRelativePath,
    outputPath: join(fixture.storageRoot, "draft-videos", outputRelativePath)
  };
}

async function insertRenderAttemptWithStatus(
  fixture: Awaited<ReturnType<typeof createReadyRenderAttemptFixture>>,
  attemptStatus: string,
  outputRelativePath: string | null,
  outputSizeBytes: number | null
): Promise<string> {
  const result = await pool!.query<{ id: string }>(
    `INSERT INTO video_render_attempts (
       render_manifest_id,
       preflight_run_id,
       video_draft_job_id,
       content_item_id,
       attempt_status,
       attempt_mode,
       output_relative_path,
       output_size_bytes,
       ffmpeg_exit_code,
       error_message,
       completed_at
     )
     VALUES ($1, $2, $3, $4, $5, 'manual_smoke', $6, $7, CASE WHEN $5 = 'succeeded' THEN 0 ELSE NULL END, NULL, CASE WHEN $5 IN ('succeeded', 'failed', 'blocked') THEN now() ELSE NULL END)
     RETURNING id`,
    [
      fixture.manifest.id,
      fixture.preflight!.id,
      fixture.job.id,
      fixture.contentItemId,
      attemptStatus,
      outputRelativePath,
      outputSizeBytes
    ]
  );
  return result.rows[0].id;
}

async function insertRenderAttemptReviewWithStatus(
  fixture: Awaited<ReturnType<typeof createReadyRenderAttemptFixture>>,
  attemptId: string,
  reviewStatus: string
): Promise<string> {
  const result = await pool!.query<{ id: string }>(
    `INSERT INTO video_render_attempt_reviews (
       render_attempt_id,
       render_manifest_id,
       video_draft_job_id,
       content_item_id,
       review_status,
       review_note,
       reviewed_by_name,
       reviewed_at
     )
     VALUES ($1, $2, $3, $4, $5, 'test review', 'Owner', CASE WHEN $5 IN ('approved', 'rejected') THEN now() ELSE NULL END)
     RETURNING id`,
    [
      attemptId,
      fixture.manifest.id,
      fixture.job.id,
      fixture.contentItemId,
      reviewStatus
    ]
  );
  return result.rows[0].id;
}

async function createApprovedPromotionFixture(codeSuffix: string) {
  const fixture = await createSucceededReviewFixture(`promotion-${codeSuffix}`);
  await withAppStorageRoot(fixture.storageRoot, async () => {
    await approveRenderAttempt(fixture.attempt.id, {
      reviewed_by_name: "Owner",
      review_note: "Ready for promotion."
    });
  });
  return fixture;
}

async function createSucceededHandoffFixture(codeSuffix: string) {
  const fixture = await createApprovedPromotionFixture(`handoff-${codeSuffix}`);
  let promotion: Awaited<ReturnType<typeof promoteApprovedRenderAttempt>> | null = null;
  await withAppStorageRoot(fixture.storageRoot, async () => {
    promotion = await promoteApprovedRenderAttempt(fixture.attempt.id, {
      promoted_by_name: "Owner",
      promotion_note: "Ready for handoff."
    });
  });
  assert.ok(promotion);
  return {
    ...fixture,
    promotion,
    approvedPath: join(fixture.storageRoot, "approved-videos", promotion.approved_output_relative_path!)
  };
}

async function createReadyHandoffFixture(codeSuffix: string) {
  const fixture = await createSucceededHandoffFixture(codeSuffix);
  let handoff: Awaited<ReturnType<typeof markApprovedVideoReadyForManualPublish>> | null = null;
  await withAppStorageRoot(fixture.storageRoot, async () => {
    handoff = await markApprovedVideoReadyForManualPublish(fixture.promotion.id, {
      handoff_by_name: "Owner",
      handoff_note: "Ready for manual publish."
    });
  });
  assert.ok(handoff);
  return { ...fixture, handoff };
}

async function createManualPublicationPackageFixture(codeSuffix: string) {
  const fixture = await createReadyHandoffFixture(`package-${codeSuffix}`);
  let packageContext: Awaited<ReturnType<typeof createManualPublicationPackageFromHandoff>> | null = null;
  await withAppStorageRoot(fixture.storageRoot, async () => {
    packageContext = await createManualPublicationPackageFromHandoff(fixture.handoff.id, {
      package_title: `Package ${codeSuffix}`,
      caption_text: "Caption manual aman.",
      hashtags_text: "#sampulraport",
      call_to_action: "Chat WA untuk tanya Sampul Raport.",
      manual_publish_note: "DB-only package fixture.",
      created_by_name: "Owner",
      selected_channels: ["instagram", "facebook", "tiktok", "youtube"],
      channel_formats: {
        instagram: "reel",
        facebook: "feed_video",
        tiktok: "short",
        youtube: "short"
      }
    });
  });
  assert.ok(packageContext);
  return { ...fixture, packageContext };
}

async function insertApprovedPromotionWithStatus(
  fixture: Awaited<ReturnType<typeof createSucceededReviewFixture>>,
  reviewId: string,
  promotionStatus: string,
  approvedOutputRelativePath: string | null,
  approvedSizeBytes: number | null,
  approvedSha256: string | null = null
): Promise<string> {
  const result = await pool!.query<{ id: string }>(
    `INSERT INTO video_render_approved_promotions (
       render_attempt_review_id,
       render_attempt_id,
       render_manifest_id,
       video_draft_job_id,
       content_item_id,
       promotion_status,
       promotion_mode,
       source_output_relative_path,
       approved_output_relative_path,
       source_size_bytes,
       approved_size_bytes,
       source_sha256,
       approved_sha256,
       started_at,
       completed_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, 'manual_copy', $7, $8, $9, $10, NULL, $11, now(), CASE WHEN $6 IN ('succeeded', 'failed', 'blocked') THEN now() ELSE NULL END)
     RETURNING id`,
    [
      reviewId,
      fixture.attempt.id,
      fixture.manifest.id,
      fixture.job.id,
      fixture.contentItemId,
      promotionStatus,
      fixture.outputRelativePath,
      approvedOutputRelativePath,
      fixture.attempt.output_size_bytes,
      approvedSizeBytes,
      approvedSha256
    ]
  );
  return result.rows[0].id;
}

function jsonRequest(body: Record<string, unknown> = {}) {
  const raw = JSON.stringify(body);
  return {
    method: "POST",
    url: "",
    headers: { "content-type": "application/json" },
    on(event: string, listener: (chunk?: Buffer) => void) {
      if (event === "data") {
        listener(Buffer.from(raw));
      }
      if (event === "end") {
        listener();
      }
    }
  };
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

maybeTest("script plan create/get and update fields", async () => {
  const contentItemId = await createContent("script-plan-create");
  const created = await getOrCreateContentItemScriptPlan(contentItemId, {
    plan_status: "draft",
    video_format: "reels",
    hook_text: "Opening hook.",
    main_message: "Main message.",
    cta_text: "Chat WA.",
    notes: "Manual planning only."
  });

  assert.equal(created.content_item_id, contentItemId);
  assert.equal(created.video_format, "reels");
  assert.equal(created.hook_text, "Opening hook.");

  const idempotent = await getOrCreateContentItemScriptPlan(contentItemId, {
    plan_status: "approved",
    video_format: "story",
    hook_text: "Should not overwrite existing plan."
  });
  assert.equal(idempotent.id, created.id);
  assert.equal(idempotent.video_format, "reels");

  const updated = await updateContentItemScriptPlan(created.id, {
    plan_status: "reviewed",
    video_format: "short_video",
    hook_text: "Updated hook.",
    main_message: "Updated message.",
    cta_text: "Updated CTA.",
    notes: ""
  });
  assert.equal(updated.plan_status, "reviewed");
  assert.equal(updated.video_format, "short_video");
  assert.equal(updated.hook_text, "Updated hook.");
  assert.equal(updated.notes, null);

  const loaded = await getContentItemScriptPlan(contentItemId);
  assert.equal(loaded?.id, created.id);
});

maybeTest("script plan validation rejects invalid plan status and video format", async () => {
  assert.throws(() => validateScriptPlanInput({ plan_status: "done" }), /Status script plan tidak valid/i);
  assert.throws(() => validateScriptPlanInput({ video_format: "feature_film" }), /Format video script plan tidak valid/i);
});

maybeTest("shot plan steps add with and without selected footage and list in sequence", async () => {
  const contentItemId = await createContent("script-plan-steps");
  const plan = await getOrCreateContentItemScriptPlan(contentItemId);
  const reviewed = await createFootage("script-step-reviewed.mp4", "reviewed");
  const selection = await addContentItemFootageSelection(contentItemId, {
    footage_asset_id: reviewed.id,
    sequence_number: 1,
    role: "product"
  });

  const withoutFootage = await addShotPlanStep(plan.id, {
    sequence_number: 2,
    step_type: "cta",
    visual_note: "Closing visual without a footage reference.",
    narration_text: "Hubungi WA.",
    overlay_text: "Ketik MOCKUP",
    duration_seconds: 5
  });
  const withFootage = await addShotPlanStep(plan.id, {
    content_item_footage_selection_id: selection.id,
    sequence_number: 1,
    step_type: "product",
    visual_note: "Show selected product footage.",
    narration_text: "Produk terlihat rapi.",
    overlay_text: "Sampul Raport",
    duration_seconds: 8
  });

  assert.equal(withFootage.content_item_footage_selection_id, selection.id);
  assert.equal(withFootage.footage_relative_path, reviewed.relative_path);
  assert.equal(withoutFootage.content_item_footage_selection_id, null);

  const steps = await listShotPlanSteps(plan.id);
  assert.deepEqual(steps.map((step) => step.sequence_number), [1, 2]);
  assert.deepEqual(steps.map((step) => step.id), [withFootage.id, withoutFootage.id]);
});

maybeTest("shot plan rejects selected footage from another content item and duplicate sequence", async () => {
  const contentItemA = await createContent("script-plan-owner-a");
  const contentItemB = await createContent("script-plan-owner-b");
  const planA = await getOrCreateContentItemScriptPlan(contentItemA);
  const reviewed = await createFootage("script-owner.mp4", "reviewed");
  const selectionB = await addContentItemFootageSelection(contentItemB, {
    footage_asset_id: reviewed.id,
    sequence_number: 1,
    role: "product"
  });

  await assert.rejects(
    () =>
      addShotPlanStep(planA.id, {
        content_item_footage_selection_id: selectionB.id,
        sequence_number: 1,
        step_type: "product"
      }),
    /tidak dimiliki konten script plan ini/i
  );

  await addShotPlanStep(planA.id, {
    sequence_number: 1,
    step_type: "hook"
  });

  await assert.rejects(
    () =>
      addShotPlanStep(planA.id, {
        sequence_number: 1,
        step_type: "cta"
      }),
    /Urutan shot plan sudah dipakai/i
  );
});

maybeTest("shot plan validation rejects invalid step type and duration", async () => {
  assert.throws(
    () => validateShotPlanStepInput({ sequence_number: 1, step_type: "hero" }),
    /Tipe shot plan tidak valid/i
  );
  assert.throws(
    () => validateShotPlanStepInput({ sequence_number: 1, step_type: "scene", duration_seconds: 0 }),
    /Durasi shot/i
  );
  assert.throws(
    () => validateShotPlanStepInput({ sequence_number: 0, step_type: "scene" }),
    /angka positif/i
  );
});

maybeTest("shot plan update changes planning metadata only", async () => {
  const contentItemId = await createContent("script-plan-update-step");
  const plan = await getOrCreateContentItemScriptPlan(contentItemId);
  const reviewed = await createFootage("script-update-step.mp4", "reviewed");
  const selection = await addContentItemFootageSelection(contentItemId, {
    footage_asset_id: reviewed.id,
    sequence_number: 1,
    role: "opening"
  });
  const step = await addShotPlanStep(plan.id, {
    sequence_number: 1,
    step_type: "hook"
  });

  const updated = await updateShotPlanStep(step.id, {
    content_item_footage_selection_id: selection.id,
    sequence_number: 2,
    step_type: "product",
    visual_note: "Updated visual.",
    narration_text: "Updated narration.",
    overlay_text: "Updated overlay.",
    duration_seconds: 6
  });

  assert.equal(updated.id, step.id);
  assert.equal(updated.content_item_footage_selection_id, selection.id);
  assert.equal(updated.sequence_number, 2);
  assert.equal(updated.step_type, "product");
  assert.equal(updated.footage_relative_path, reviewed.relative_path);
  const footageAfter = await getFootageAsset(reviewed.id);
  assert.equal(footageAfter.relative_path, reviewed.relative_path);
  assert.equal(footageAfter.filename, reviewed.filename);
  assert.equal(footageAfter.size_bytes, reviewed.size_bytes);
});

maybeTest("shot plan remove keeps plan, content, selected footage, footage asset, and physical file untouched", async () => {
  const { storageRoot, footageRoot } = await createTempFootageRoot();
  await mkdir(join(footageRoot, prefix), { recursive: true });
  const filePath = join(footageRoot, prefix, "script-remove-physical.mp4");
  await writeFile(filePath, "script-plan-metadata-only");
  const before = await stat(filePath);

  const contentItemId = await createContent("script-plan-remove-step");
  const plan = await getOrCreateContentItemScriptPlan(contentItemId);
  const reviewed = await createFootage("script-remove-physical.mp4", "reviewed");
  const selection = await addContentItemFootageSelection(contentItemId, {
    footage_asset_id: reviewed.id,
    sequence_number: 1,
    role: "product"
  });
  const step = await addShotPlanStep(plan.id, {
    content_item_footage_selection_id: selection.id,
    sequence_number: 1,
    step_type: "product"
  });

  const removed = await removeShotPlanStep(step.id);
  const after = await stat(filePath);
  const planAfter = await getContentItemScriptPlan(contentItemId);
  const selectionAfter = await getContentItemFootageSelection(selection.id);
  const footageAfter = await getFootageAsset(reviewed.id);

  assert.equal(removed.removed, true);
  await assert.rejects(() => getShotPlanStep(step.id), /Shot plan step tidak ditemukan/i);
  assert.equal(planAfter?.id, plan.id);
  assert.equal(selectionAfter.id, selection.id);
  assert.equal(footageAfter.id, reviewed.id);
  assert.equal(after.size, before.size);
  assert.equal(after.mtimeMs, before.mtimeMs);
  assert.equal(storageRoot.includes(prefix), true);
});

maybeTest("script plan page and API route before generic content detail", async () => {
  const contentItemId = await createContent("script-plan-route");
  const pageResponse = mockResponse();
  const pageHandled = await handleContentItemPageGet(
    pageResponse,
    `/content-items/${contentItemId}/script-plan`,
    new URL(`http://localhost/content-items/${contentItemId}/script-plan`)
  );
  assert.equal(pageHandled, true);
  assert.equal(pageResponse.statusCode, 200);
  assert.match(pageResponse.body, /Script \/ Shot Planning/);
  assert.match(pageResponse.body, /Tidak ada generasi AI/);

  const apiResponse = mockResponse();
  const apiHandled = await handleContentItemApiRoute(
    { method: "GET", url: `/api/content-items/${contentItemId}/script-plan`, headers: {}, on() {} } as any,
    apiResponse,
    `/api/content-items/${contentItemId}/script-plan`,
    new URL(`http://localhost/api/content-items/${contentItemId}/script-plan`)
  );
  assert.equal(apiHandled, true);
  assert.equal(apiResponse.statusCode, 200);
  const body = JSON.parse(apiResponse.body);
  assert.equal(body.ok, true);
  assert.equal(body.data.plan.content_item_id, contentItemId);
  assert.deepEqual(body.data.steps, []);
});

maybeTest("video draft readiness reports missing script plan", async () => {
  const contentItemId = await createContent("video-readiness-no-plan");
  const readiness = await getVideoDraftReadinessForContentItem(contentItemId);

  assert.equal(readiness.has_script_plan, false);
  assert.equal(readiness.shot_step_count, 0);
  assert.equal(readiness.selected_footage_count, 0);
  assert.equal(readiness.is_ready_for_future_render, false);
  assert.match(readiness.readiness_warnings.join(" "), /Script\/Shot Plan belum dibuat/i);
});

maybeTest("video draft readiness reports script plan without shot steps", async () => {
  const contentItemId = await createContent("video-readiness-no-steps");
  await getOrCreateContentItemScriptPlan(contentItemId);

  const readiness = await getVideoDraftReadinessForContentItem(contentItemId);
  assert.equal(readiness.has_script_plan, true);
  assert.equal(readiness.shot_step_count, 0);
  assert.equal(readiness.selected_footage_count, 0);
  assert.equal(readiness.is_ready_for_future_render, false);
  assert.match(readiness.readiness_warnings.join(" "), /Shot plan step belum ada/i);
});

maybeTest("video draft readiness reports shot steps without selected footage", async () => {
  const contentItemId = await createContent("video-readiness-no-footage");
  const plan = await getOrCreateContentItemScriptPlan(contentItemId);
  await addShotPlanStep(plan.id, {
    sequence_number: 1,
    step_type: "hook"
  });

  const readiness = await getVideoDraftReadinessForContentItem(contentItemId);
  assert.equal(readiness.shot_step_count, 1);
  assert.equal(readiness.selected_footage_count, 0);
  assert.equal(readiness.steps_with_selected_footage_count, 0);
  assert.equal(readiness.is_ready_for_future_render, false);
  assert.match(readiness.readiness_warnings.join(" "), /Footage terpilih belum ada/i);
});

maybeTest("video draft readiness passes with selected footage and shot steps", async () => {
  const contentItemId = await createContent("video-readiness-ready");
  const plan = await getOrCreateContentItemScriptPlan(contentItemId);
  const reviewed = await createFootage("video-readiness-ready.mp4", "reviewed");
  const selection = await addContentItemFootageSelection(contentItemId, {
    footage_asset_id: reviewed.id,
    sequence_number: 1,
    role: "product"
  });
  await addShotPlanStep(plan.id, {
    content_item_footage_selection_id: selection.id,
    sequence_number: 1,
    step_type: "product"
  });

  const readiness = await getVideoDraftReadinessForContentItem(contentItemId);
  assert.equal(readiness.shot_step_count, 1);
  assert.equal(readiness.selected_footage_count, 1);
  assert.equal(readiness.steps_with_selected_footage_count, 1);
  assert.equal(readiness.is_ready_for_future_render, true);
});

maybeTest("video draft job create rejects missing and mismatched script plans", async () => {
  const contentItemA = await createContent("video-create-a");
  const contentItemB = await createContent("video-create-b");
  const planB = await getOrCreateContentItemScriptPlan(contentItemB);

  await assert.rejects(
    () => createVideoDraftJobForContentItem(contentItemA, { job_status: "draft_requested" }),
    /Script\/Shot Plan terlebih dahulu/i
  );

  await assert.rejects(
    () =>
      createVideoDraftJobForContentItem(contentItemA, {
        script_plan_id: planB.id,
        job_status: "draft_requested"
      }),
    /Script plan tidak dimiliki konten ini/i
  );
});

maybeTest("video draft job create, duplicate guard, update metadata only, and cancel without delete", async () => {
  const contentItemId = await createContent("video-job-create");
  const plan = await getOrCreateContentItemScriptPlan(contentItemId);
  const created = await createVideoDraftJobForContentItem(contentItemId, {
    script_plan_id: plan.id,
    job_status: "draft_requested",
    target_format: "vertical_9_16",
    render_mode: "disabled_metadata_only",
    duration_target_seconds: 30,
    planned_output_label: "Draft Reels 1",
    request_notes: "Metadata only request."
  });

  assert.equal(created.content_item_id, contentItemId);
  assert.equal(created.script_plan_id, plan.id);
  assert.equal(created.render_mode, "disabled_metadata_only");

  await assert.rejects(
    () => createVideoDraftJobForContentItem(contentItemId, { script_plan_id: plan.id }),
    /sudah ada/i
  );

  const updated = await updateVideoDraftJob(created.id, {
    script_plan_id: plan.id,
    job_status: "planning_ready",
    target_format: "square_1_1",
    render_mode: "disabled_metadata_only",
    duration_target_seconds: 45,
    planned_output_label: "Square draft request",
    request_notes: "Updated request.",
    blocking_reason: "",
    review_notes: "Ready for owner review."
  });
  assert.equal(updated.id, created.id);
  assert.equal(updated.job_status, "planning_ready");
  assert.equal(updated.target_format, "square_1_1");
  assert.equal(updated.duration_target_seconds, 45);

  const cancelled = await cancelVideoDraftJob(created.id);
  assert.equal(cancelled.id, created.id);
  assert.equal(cancelled.job_status, "cancelled");

  const stillExists = await getVideoDraftJobById(created.id);
  assert.equal(stillExists.id, created.id);
});

maybeTest("video draft job validation rejects invalid fields", async () => {
  assert.throws(() => validateVideoDraftJobInput({ job_status: "rendering" }), /Status video draft job tidak valid/i);
  assert.throws(() => validateVideoDraftJobInput({ target_format: "cinema" }), /Target format video draft tidak valid/i);
  assert.throws(() => validateVideoDraftJobInput({ render_mode: "enabled" }), /disabled_metadata_only/i);
  assert.throws(
    () => validateVideoDraftJobInput({ duration_target_seconds: 181 }),
    /Target durasi/i
  );
});

maybeTest("video draft job does not mutate content planning rows, footage metadata, or physical file", async () => {
  const { storageRoot, footageRoot } = await createTempFootageRoot();
  await mkdir(join(footageRoot, prefix), { recursive: true });
  const filePath = join(footageRoot, prefix, "video-job-physical.mp4");
  await writeFile(filePath, "video-draft-job-metadata-only");
  const before = await stat(filePath);

  const contentItemId = await createContent("video-job-physical");
  const plan = await getOrCreateContentItemScriptPlan(contentItemId);
  const reviewed = await createFootage("video-job-physical.mp4", "reviewed");
  const selection = await addContentItemFootageSelection(contentItemId, {
    footage_asset_id: reviewed.id,
    sequence_number: 1,
    role: "product"
  });
  const step = await addShotPlanStep(plan.id, {
    content_item_footage_selection_id: selection.id,
    sequence_number: 1,
    step_type: "product"
  });

  const job = await createVideoDraftJobForContentItem(contentItemId, {
    script_plan_id: plan.id,
    job_status: "planning_ready",
    target_format: "vertical_9_16",
    render_mode: "disabled_metadata_only"
  });
  await updateVideoDraftJob(job.id, {
    script_plan_id: plan.id,
    job_status: "blocked",
    target_format: "horizontal_16_9",
    render_mode: "disabled_metadata_only",
    blocking_reason: "Owner review needed."
  });
  const after = await stat(filePath);
  const context = await getVideoDraftJobForContentItem(contentItemId);
  const stepsAfter = await listShotPlanSteps(plan.id);
  const selectionAfter = await getContentItemFootageSelection(selection.id);
  const footageAfter = await getFootageAsset(reviewed.id);

  assert.equal(context.job?.id, job.id);
  assert.equal(stepsAfter.some((row) => row.id === step.id), true);
  assert.equal(selectionAfter.id, selection.id);
  assert.equal(footageAfter.relative_path, reviewed.relative_path);
  assert.equal(footageAfter.filename, reviewed.filename);
  assert.equal(footageAfter.file_extension, reviewed.file_extension);
  assert.equal(footageAfter.size_bytes, reviewed.size_bytes);
  assert.equal(after.size, before.size);
  assert.equal(after.mtimeMs, before.mtimeMs);
  assert.equal(storageRoot.includes(prefix), true);
});

maybeTest("video draft page and API route before generic content detail", async () => {
  const contentItemId = await createContent("video-job-route");
  await getOrCreateContentItemScriptPlan(contentItemId);

  const pageResponse = mockResponse();
  const pageHandled = await handleContentItemPageGet(
    pageResponse,
    `/content-items/${contentItemId}/video-draft`,
    new URL(`http://localhost/content-items/${contentItemId}/video-draft`)
  );
  assert.equal(pageHandled, true);
  assert.equal(pageResponse.statusCode, 200);
  assert.match(pageResponse.body, /Video Draft Job/);
  assert.match(pageResponse.body, /tidak menjalankan alat render lokal/);

  const apiResponse = mockResponse();
  const apiHandled = await handleContentItemApiRoute(
    { method: "GET", url: `/api/content-items/${contentItemId}/video-draft`, headers: {}, on() {} } as any,
    apiResponse,
    `/api/content-items/${contentItemId}/video-draft`,
    new URL(`http://localhost/api/content-items/${contentItemId}/video-draft`)
  );
  assert.equal(apiHandled, true);
  assert.equal(apiResponse.statusCode, 200);
  const body = JSON.parse(apiResponse.body);
  assert.equal(body.ok, true);
  assert.equal(body.data.readiness.content_item_id, contentItemId);
});

maybeTest("render manifest rejects missing video draft job and jobs without shot steps", async () => {
  await assert.rejects(
    () => createRenderManifestForVideoDraftJob("11111111-1111-4111-8111-111111111111"),
    /Video draft job tidak ditemukan/i
  );

  const contentItemId = await createContent("manifest-no-steps");
  const plan = await getOrCreateContentItemScriptPlan(contentItemId);
  const job = await createVideoDraftJobForContentItem(contentItemId, {
    script_plan_id: plan.id,
    render_mode: "disabled_metadata_only"
  });

  await assert.rejects(
    () => createRenderManifestForVideoDraftJob(job.id),
    /Shot plan step wajib ada/i
  );
});

maybeTest("render manifest create snapshots selected footage and missing footage step warnings", async () => {
  const contentItemId = await createContent("manifest-create");
  const plan = await getOrCreateContentItemScriptPlan(contentItemId);
  const reviewed = await createFootage("manifest-snapshot.mp4", "reviewed");
  const selection = await addContentItemFootageSelection(contentItemId, {
    footage_asset_id: reviewed.id,
    sequence_number: 1,
    role: "product"
  });
  const second = await addShotPlanStep(plan.id, {
    sequence_number: 2,
    step_type: "cta",
    visual_note: "CTA without selected footage.",
    duration_seconds: 5
  });
  const first = await addShotPlanStep(plan.id, {
    content_item_footage_selection_id: selection.id,
    sequence_number: 1,
    step_type: "product",
    visual_note: "Selected product footage.",
    narration_text: "Narasi produk.",
    overlay_text: "Sampul Raport",
    duration_seconds: 8
  });
  const job = await createVideoDraftJobForContentItem(contentItemId, {
    script_plan_id: plan.id,
    target_format: "square_1_1",
    render_mode: "disabled_metadata_only",
    planned_output_label: "Manifest snapshot"
  });

  const manifest = await createRenderManifestForVideoDraftJob(job.id, {
    manifest_status: "draft",
    manifest_mode: "metadata_only",
    target_format: "square_1_1",
    notes: "DB-only manifest."
  });
  const items = await listRenderManifestItems(manifest.id);

  assert.equal(manifest.video_draft_job_id, job.id);
  assert.equal(manifest.content_item_id, contentItemId);
  assert.equal(manifest.script_plan_id, plan.id);
  assert.equal(manifest.manifest_mode, "metadata_only");
  assert.equal(manifest.target_format, "square_1_1");
  assert.equal(manifest.item_count, 2);
  assert.equal(manifest.selected_footage_count, 1);
  assert.equal(manifest.missing_footage_step_count, 1);
  assert.equal(manifest.estimated_duration_seconds, 13);
  assert.match(manifest.manifest_warnings || "", /Step 2 belum memakai footage/i);

  assert.deepEqual(items.map((item) => item.sequence_number), [1, 2]);
  assert.equal(items[0].shot_plan_step_id, first.id);
  assert.equal(items[0].content_item_footage_selection_id, selection.id);
  assert.equal(items[0].footage_asset_id, reviewed.id);
  assert.equal(items[0].source_relative_path_snapshot, reviewed.relative_path);
  assert.equal(items[0].source_filename_snapshot, reviewed.filename);
  assert.equal(items[0].source_file_extension_snapshot, reviewed.file_extension);
  assert.equal(items[0].source_size_bytes_snapshot, reviewed.size_bytes);
  assert.equal(items[1].shot_plan_step_id, second.id);
  assert.equal(items[1].content_item_footage_selection_id, null);
  assert.match(items[1].item_warnings || "", /belum memakai footage/i);
});

maybeTest("render manifest duplicate handling and metadata-only update", async () => {
  const contentItemId = await createContent("manifest-update");
  const plan = await getOrCreateContentItemScriptPlan(contentItemId);
  await addShotPlanStep(plan.id, {
    sequence_number: 1,
    step_type: "hook",
    duration_seconds: 6
  });
  const job = await createVideoDraftJobForContentItem(contentItemId, {
    script_plan_id: plan.id,
    target_format: "vertical_9_16",
    render_mode: "disabled_metadata_only"
  });
  const manifest = await createRenderManifestForVideoDraftJob(job.id);

  await assert.rejects(
    () => createRenderManifestForVideoDraftJob(job.id),
    /sudah ada/i
  );

  const updated = await updateRenderManifest(manifest.id, {
    manifest_status: "reviewed",
    manifest_mode: "metadata_only",
    target_format: "horizontal_16_9",
    manifest_warnings: "Reviewed DB-only manifest.",
    notes: "Metadata update only."
  });
  const items = await listRenderManifestItems(manifest.id);

  assert.equal(updated.id, manifest.id);
  assert.equal(updated.manifest_status, "reviewed");
  assert.equal(updated.target_format, "horizontal_16_9");
  assert.equal(updated.notes, "Metadata update only.");
  assert.equal(items.length, 1);
  assert.equal(items[0].sequence_number, 1);
});

maybeTest("render manifest validation rejects invalid status and mode", async () => {
  assert.throws(() => validateRenderManifestInput({ manifest_status: "rendering" }), /Status render manifest tidak valid/i);
  assert.throws(() => validateRenderManifestInput({ manifest_mode: "file" }), /metadata_only/i);
  assert.throws(() => validateRenderManifestInput({ target_format: "cinema" }), /Target format render manifest tidak valid/i);
});

maybeTest("render manifest create and update do not mutate related rows or physical files", async () => {
  const { storageRoot, footageRoot } = await createTempFootageRoot();
  await mkdir(join(footageRoot, prefix), { recursive: true });
  const filePath = join(footageRoot, prefix, "manifest-physical.mp4");
  await writeFile(filePath, "render-manifest-db-only");
  const before = await stat(filePath);

  const contentItemId = await createContent("manifest-physical");
  const plan = await getOrCreateContentItemScriptPlan(contentItemId);
  const reviewed = await createFootage("manifest-physical.mp4", "reviewed");
  const selection = await addContentItemFootageSelection(contentItemId, {
    footage_asset_id: reviewed.id,
    sequence_number: 1,
    role: "product"
  });
  const step = await addShotPlanStep(plan.id, {
    content_item_footage_selection_id: selection.id,
    sequence_number: 1,
    step_type: "product",
    duration_seconds: 7
  });
  const job = await createVideoDraftJobForContentItem(contentItemId, {
    script_plan_id: plan.id,
    render_mode: "disabled_metadata_only"
  });

  const manifest = await createRenderManifestForVideoDraftJob(job.id);
  await updateRenderManifest(manifest.id, {
    manifest_status: "approved",
    manifest_mode: "metadata_only",
    target_format: manifest.target_format,
    notes: "Approved for future planning only."
  });

  const after = await stat(filePath);
  const jobAfter = await getVideoDraftJobById(job.id);
  const planAfter = await getContentItemScriptPlan(contentItemId);
  const stepsAfter = await listShotPlanSteps(plan.id);
  const selectionAfter = await getContentItemFootageSelection(selection.id);
  const footageAfter = await getFootageAsset(reviewed.id);

  assert.equal(jobAfter.id, job.id);
  assert.equal(planAfter?.id, plan.id);
  assert.equal(stepsAfter.some((row) => row.id === step.id), true);
  assert.equal(selectionAfter.id, selection.id);
  assert.equal(footageAfter.relative_path, reviewed.relative_path);
  assert.equal(footageAfter.filename, reviewed.filename);
  assert.equal(footageAfter.file_extension, reviewed.file_extension);
  assert.equal(footageAfter.size_bytes, reviewed.size_bytes);
  assert.equal(after.size, before.size);
  assert.equal(after.mtimeMs, before.mtimeMs);
  assert.equal(storageRoot.includes(prefix), true);
});

maybeTest("render manifest page and API route before generic video draft job route", async () => {
  const contentItemId = await createContent("manifest-route");
  const plan = await getOrCreateContentItemScriptPlan(contentItemId);
  await addShotPlanStep(plan.id, {
    sequence_number: 1,
    step_type: "hook"
  });
  const job = await createVideoDraftJobForContentItem(contentItemId, {
    script_plan_id: plan.id,
    render_mode: "disabled_metadata_only"
  });
  const manifest = await createRenderManifestForVideoDraftJob(job.id);

  const pageResponse = mockResponse();
  const pageHandled = await handleContentItemPageGet(
    pageResponse,
    `/content-items/${contentItemId}/video-draft/${job.id}/manifest`,
    new URL(`http://localhost/content-items/${contentItemId}/video-draft/${job.id}/manifest`)
  );
  assert.equal(pageHandled, true);
  assert.equal(pageResponse.statusCode, 200);
  assert.match(pageResponse.body, /Render Manifest/);
  assert.match(pageResponse.body, /DB-only/);

  const apiResponse = mockResponse();
  const apiHandled = await handleContentItemApiRoute(
    { method: "GET", url: `/api/video-draft-jobs/${job.id}/render-manifest`, headers: {}, on() {} } as any,
    apiResponse,
    `/api/video-draft-jobs/${job.id}/render-manifest`,
    new URL(`http://localhost/api/video-draft-jobs/${job.id}/render-manifest`)
  );
  assert.equal(apiHandled, true);
  assert.equal(apiResponse.statusCode, 200);
  const body = JSON.parse(apiResponse.body);
  assert.equal(body.ok, true);
  assert.equal(body.data.manifest.id, manifest.id);

  const context = await getRenderManifestContextForContentItem(contentItemId, job.id);
  assert.equal(context.manifest?.id, manifest.id);
});

maybeTest("render preflight rejects missing manifest", async () => {
  await assert.rejects(
    () => runRenderPreflightForManifest("11111111-1111-4111-8111-111111111111"),
    /Render manifest tidak ditemukan/i
  );
});

maybeTest("render preflight returns ready for reviewed manifest with safe snapshots", async () => {
  const contentItemId = await createContent("preflight-ready");
  const plan = await getOrCreateContentItemScriptPlan(contentItemId);
  const reviewed = await createFootage("preflight-ready.mp4", "reviewed");
  const selection = await addContentItemFootageSelection(contentItemId, {
    footage_asset_id: reviewed.id,
    sequence_number: 1,
    role: "product"
  });
  await addShotPlanStep(plan.id, {
    content_item_footage_selection_id: selection.id,
    sequence_number: 1,
    step_type: "product",
    duration_seconds: 9
  });
  const job = await createVideoDraftJobForContentItem(contentItemId, {
    script_plan_id: plan.id,
    render_mode: "disabled_metadata_only"
  });
  const manifest = await createRenderManifestForVideoDraftJob(job.id, {
    manifest_status: "reviewed",
    manifest_mode: "metadata_only",
    target_format: "vertical_9_16"
  });

  const run = await runRenderPreflightForManifest(manifest.id);
  const checks = await listRenderPreflightChecks(run.id);

  assert.equal(run.preflight_result, "ready");
  assert.equal(run.blocking_check_count, 0);
  assert.equal(run.warning_check_count, 0);
  assert.ok(checks.length > 0);
  assert.equal(checks.some((check) => check.check_code === "item_snapshot_path_safe" && check.check_status === "pass"), true);

  const runById = await getRenderPreflightRunById(run.id);
  assert.equal(runById.id, run.id);
});

maybeTest("render preflight allows draft manifest as warning and allows multiple runs", async () => {
  const contentItemId = await createContent("preflight-draft");
  const plan = await getOrCreateContentItemScriptPlan(contentItemId);
  const reviewed = await createFootage("preflight-draft.mp4", "reviewed");
  const selection = await addContentItemFootageSelection(contentItemId, {
    footage_asset_id: reviewed.id,
    sequence_number: 1,
    role: "product"
  });
  await addShotPlanStep(plan.id, {
    content_item_footage_selection_id: selection.id,
    sequence_number: 1,
    step_type: "product",
    duration_seconds: 5
  });
  const job = await createVideoDraftJobForContentItem(contentItemId, {
    script_plan_id: plan.id,
    render_mode: "disabled_metadata_only"
  });
  const manifest = await createRenderManifestForVideoDraftJob(job.id, {
    manifest_status: "draft",
    manifest_mode: "metadata_only",
    target_format: "vertical_9_16"
  });

  const first = await runRenderPreflightForManifest(manifest.id);
  const second = await runRenderPreflightForManifest(manifest.id);
  const runs = await listRenderPreflightRunsForManifest(manifest.id);
  const checks = await listRenderPreflightChecks(first.id);

  assert.equal(first.preflight_result, "ready");
  assert.equal(first.blocking_check_count, 0);
  assert.equal(first.warning_check_count, 1);
  assert.equal(checks.some((check) => check.check_code === "manifest_status_draft" && check.check_level === "warning"), true);
  assert.equal(runs.length >= 2, true);
  assert.notEqual(first.id, second.id);
});

maybeTest("render preflight blocks cancelled video draft job and item count mismatch", async () => {
  const contentItemId = await createContent("preflight-blocked");
  const plan = await getOrCreateContentItemScriptPlan(contentItemId);
  const reviewed = await createFootage("preflight-blocked.mp4", "reviewed");
  const selection = await addContentItemFootageSelection(contentItemId, {
    footage_asset_id: reviewed.id,
    sequence_number: 1,
    role: "product"
  });
  await addShotPlanStep(plan.id, {
    content_item_footage_selection_id: selection.id,
    sequence_number: 1,
    step_type: "product",
    duration_seconds: 5
  });
  const job = await createVideoDraftJobForContentItem(contentItemId, {
    script_plan_id: plan.id,
    render_mode: "disabled_metadata_only"
  });
  const manifest = await createRenderManifestForVideoDraftJob(job.id, {
    manifest_status: "approved",
    manifest_mode: "metadata_only",
    target_format: "vertical_9_16"
  });
  await cancelVideoDraftJob(job.id);
  await pool!.query(`UPDATE video_render_manifests SET item_count = $2 WHERE id = $1`, [manifest.id, 99]);

  const run = await runRenderPreflightForManifest(manifest.id);
  const checks = await listRenderPreflightChecks(run.id);

  assert.equal(run.preflight_result, "blocked");
  assert.equal(run.blocking_check_count, 2);
  assert.equal(checks.some((check) => check.check_code === "job_not_cancelled_or_archived" && check.check_status === "fail"), true);
  assert.equal(checks.some((check) => check.check_code === "manifest_item_count_matches" && check.check_status === "fail"), true);
});

maybeTest("render preflight warns for missing footage item and does not mutate related rows or physical file", async () => {
  const { storageRoot, footageRoot } = await createTempFootageRoot();
  await mkdir(join(footageRoot, prefix), { recursive: true });
  const filePath = join(footageRoot, prefix, "preflight-physical.mp4");
  await writeFile(filePath, "render-preflight-db-only");
  const before = await stat(filePath);

  const contentItemId = await createContent("preflight-physical");
  const plan = await getOrCreateContentItemScriptPlan(contentItemId);
  const reviewed = await createFootage("preflight-physical.mp4", "reviewed");
  const selection = await addContentItemFootageSelection(contentItemId, {
    footage_asset_id: reviewed.id,
    sequence_number: 1,
    role: "product"
  });
  const selectedStep = await addShotPlanStep(plan.id, {
    content_item_footage_selection_id: selection.id,
    sequence_number: 1,
    step_type: "product",
    duration_seconds: 7
  });
  const missingStep = await addShotPlanStep(plan.id, {
    sequence_number: 2,
    step_type: "closing"
  });
  const job = await createVideoDraftJobForContentItem(contentItemId, {
    script_plan_id: plan.id,
    render_mode: "disabled_metadata_only"
  });
  const manifest = await createRenderManifestForVideoDraftJob(job.id, {
    manifest_status: "approved",
    manifest_mode: "metadata_only",
    target_format: "vertical_9_16"
  });

  const run = await runRenderPreflightForManifest(manifest.id);
  const checks = await listRenderPreflightChecks(run.id);
  const after = await stat(filePath);
  const jobAfter = await getVideoDraftJobById(job.id);
  const manifestAfter = await getRenderManifestById(manifest.id);
  const stepsAfter = await listShotPlanSteps(plan.id);
  const selectionAfter = await getContentItemFootageSelection(selection.id);
  const footageAfter = await getFootageAsset(reviewed.id);

  assert.equal(run.preflight_result, "ready");
  assert.equal(run.blocking_check_count, 0);
  assert.equal(run.warning_check_count >= 3, true);
  assert.equal(checks.some((check) => check.check_code === "item_without_footage_snapshot" && check.check_status === "fail"), true);
  assert.equal(jobAfter.id, job.id);
  assert.equal(manifestAfter.id, manifest.id);
  assert.equal(stepsAfter.some((row) => row.id === selectedStep.id), true);
  assert.equal(stepsAfter.some((row) => row.id === missingStep.id), true);
  assert.equal(selectionAfter.id, selection.id);
  assert.equal(footageAfter.relative_path, reviewed.relative_path);
  assert.equal(after.size, before.size);
  assert.equal(after.mtimeMs, before.mtimeMs);
  assert.equal(storageRoot.includes(prefix), true);
});

test("render preflight unsafe snapshot path rule creates blocking check", () => {
  const manifest = {
    id: "manifest",
    video_draft_job_id: "job",
    content_item_id: "content",
    script_plan_id: "plan",
    manifest_status: "approved",
    manifest_mode: "metadata_only",
    target_format: "vertical_9_16",
    item_count: 1,
    estimated_duration_seconds: 10,
    selected_footage_count: 1,
    missing_footage_step_count: 0,
    manifest_warnings: null,
    job_status: "planning_ready",
    render_mode: "disabled_metadata_only",
    content_code: "TEST",
    content_title: "Test"
  };
  const items = [{
    id: "item",
    manifest_id: "manifest",
    sequence_number: 1,
    step_type: "product",
    duration_seconds: 10,
    content_item_footage_selection_id: "selection",
    footage_asset_id: "footage",
    source_relative_path_snapshot: "../unsafe.mp4",
    source_filename_snapshot: "unsafe.mp4",
    source_file_extension_snapshot: ".mp4",
    source_size_bytes_snapshot: 1,
    item_warnings: null
  }];

  const checks = buildRenderPreflightChecks(manifest, items);
  assert.equal(checks.some((check) => check.check_code === "item_snapshot_path_safe" && check.check_level === "blocking" && check.check_status === "fail"), true);
});

maybeTest("render preflight validation rejects invalid generated statuses", async () => {
  assert.throws(() => validateRenderPreflightRunStatus("running"), /Status preflight run tidak valid/i);
  assert.throws(() => validateRenderPreflightResult("maybe"), /Hasil preflight tidak valid/i);
});

maybeTest("render preflight page and API route before generic render manifest route", async () => {
  const contentItemId = await createContent("preflight-route");
  const plan = await getOrCreateContentItemScriptPlan(contentItemId);
  const reviewed = await createFootage("preflight-route.mp4", "reviewed");
  const selection = await addContentItemFootageSelection(contentItemId, {
    footage_asset_id: reviewed.id,
    sequence_number: 1,
    role: "product"
  });
  await addShotPlanStep(plan.id, {
    content_item_footage_selection_id: selection.id,
    sequence_number: 1,
    step_type: "product",
    duration_seconds: 6
  });
  const job = await createVideoDraftJobForContentItem(contentItemId, {
    script_plan_id: plan.id,
    render_mode: "disabled_metadata_only"
  });
  const manifest = await createRenderManifestForVideoDraftJob(job.id, {
    manifest_status: "reviewed",
    manifest_mode: "metadata_only",
    target_format: "vertical_9_16"
  });
  const run = await runRenderPreflightForManifest(manifest.id);

  const pageResponse = mockResponse();
  const pageHandled = await handleContentItemPageGet(
    pageResponse,
    `/content-items/${contentItemId}/video-draft/${job.id}/manifest/${manifest.id}/preflight`,
    new URL(`http://localhost/content-items/${contentItemId}/video-draft/${job.id}/manifest/${manifest.id}/preflight`)
  );
  assert.equal(pageHandled, true);
  assert.equal(pageResponse.statusCode, 200);
  assert.match(pageResponse.body, /Render Preflight/);
  assert.match(pageResponse.body, /DB-only/);

  const apiResponse = mockResponse();
  const apiHandled = await handleContentItemApiRoute(
    { method: "GET", url: `/api/render-manifests/${manifest.id}/preflight`, headers: {}, on() {} } as any,
    apiResponse,
    `/api/render-manifests/${manifest.id}/preflight`,
    new URL(`http://localhost/api/render-manifests/${manifest.id}/preflight`)
  );
  assert.equal(apiHandled, true);
  assert.equal(apiResponse.statusCode, 200);
  const body = JSON.parse(apiResponse.body);
  assert.equal(body.ok, true);
  assert.equal(body.data.manifest.id, manifest.id);
  assert.equal(body.data.latestRun.id, run.id);

  const context = await getRenderPreflightContextForContentItem(contentItemId, job.id, manifest.id);
  assert.equal(context.latestRun?.id, run.id);
});

maybeTest("controlled render attempt rejects missing manifest and missing ready preflight", async () => {
  await assert.rejects(
    () => runControlledSmokeRenderForManifest("11111111-1111-4111-8111-111111111111"),
    /Render manifest tidak ditemukan/i
  );

  const fixture = await createReadyRenderAttemptFixture("no-preflight", {
    createSourceFile: true,
    runPreflight: false
  });

  await assert.rejects(
    () => runControlledSmokeRenderForManifest(fixture.manifest.id, { storageRoot: fixture.storageRoot }),
    /preflight ready wajib/i
  );
});

maybeTest("controlled render attempt records blocked attempt when latest preflight is blocked", async () => {
  const fixture = await createReadyRenderAttemptFixture("blocked-preflight", {
    createSourceFile: true
  });
  await cancelVideoDraftJob(fixture.job.id);
  const blockedRun = await runRenderPreflightForManifest(fixture.manifest.id);

  const attempt = await runControlledSmokeRenderForManifest(fixture.manifest.id, {
    storageRoot: fixture.storageRoot
  });
  const attempts = await listRenderAttemptsForManifest(fixture.manifest.id);

  assert.equal(blockedRun.preflight_result, "blocked");
  assert.equal(attempt.attempt_status, "blocked");
  assert.equal(attempt.preflight_run_id, blockedRun.id);
  assert.match(attempt.error_message || "", /Preflight terakhir belum ready/i);
  assert.equal(attempts.some((row) => row.id === attempt.id), true);
});

test("controlled render path validation rejects unsafe source and output paths", () => {
  assert.equal(isSafeRenderSourceRelativePath(`${prefix}/safe.mp4`), true);
  assert.equal(isSafeRenderSourceRelativePath("../unsafe.mp4"), false);
  assert.equal(isSafeRenderSourceRelativePath("/absolute.mp4"), false);
  assert.equal(isSafeRenderSourceRelativePath("nested\\unsafe.mp4"), false);

  assert.equal(validateRenderAttemptOutputRelativePath("smoke/output.mp4"), "smoke/output.mp4");
  assert.throws(() => validateRenderAttemptOutputRelativePath("output.mp4"), /smoke/i);
  assert.throws(() => validateRenderAttemptOutputRelativePath("smoke/../output.mp4"), /traversal/i);
  assert.throws(() => validateRenderAttemptOutputRelativePath("/smoke/output.mp4"), /smoke/i);
  assert.throws(() => validateRenderAttemptOutputRelativePath("smoke/output.mov"), /mp4|traversal/i);
});

maybeTest("controlled render eligibility blocks missing physical source and existing output", async () => {
  const missingSource = await createReadyRenderAttemptFixture("missing-source", {
    createSourceFile: false
  });
  const missingEligibility = await validateControlledRenderEligibility(missingSource.manifest.id, {
    storageRoot: missingSource.storageRoot
  });
  const blockedAttempt = await runControlledSmokeRenderForManifest(missingSource.manifest.id, {
    storageRoot: missingSource.storageRoot
  });

  assert.equal(missingEligibility.ok, false);
  assert.match(missingEligibility.blocking_reasons.join(" "), /Source footage fisik tidak ditemukan/i);
  assert.equal(blockedAttempt.attempt_status, "blocked");
  assert.equal(blockedAttempt.output_relative_path, null);

  const existingOutput = await createReadyRenderAttemptFixture("existing-output", {
    createSourceFile: true
  });
  const outputRelativePath = `smoke/existing-output-${existingOutput.manifest.id.slice(0, 8)}.mp4`;
  const outputPath = join(existingOutput.storageRoot, "draft-videos", outputRelativePath);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, "existing output");

  const existingEligibility = await validateControlledRenderEligibility(existingOutput.manifest.id, {
    storageRoot: existingOutput.storageRoot,
    output_relative_path: outputRelativePath
  });
  const existingAttempt = await runControlledSmokeRenderForManifest(existingOutput.manifest.id, {
    storageRoot: existingOutput.storageRoot,
    output_relative_path: outputRelativePath
  });

  assert.equal(existingEligibility.ok, false);
  assert.match(existingEligibility.blocking_reasons.join(" "), /tidak boleh overwrite/i);
  assert.equal(existingAttempt.attempt_status, "blocked");
  assert.match(existingAttempt.error_message || "", /tidak boleh overwrite/i);
});

test("controlled render builds FFmpeg argument array without shell command string", () => {
  const args = buildSafeFfmpegArgs("/tmp/source.mp4", "/tmp/output.mp4", { target_format: "square_1_1" });
  assert.equal(Array.isArray(args), true);
  assert.equal(args.includes("-i"), true);
  assert.equal(args.includes("/tmp/source.mp4"), true);
  assert.equal(args.includes("-n"), true);
  assert.equal(args.at(-1), "/tmp/output.mp4");
  assert.equal(args.join(" ").includes("scale=720:720"), true);
});

test("controlled multi-shot render builds FFmpeg argument array without shell command string", () => {
  const args = buildSafeFfmpegMultiShotArgs(["/tmp/source-a.mp4", "/tmp/source-b.mp4"], "/tmp/output.mp4", {
    target_format: "vertical_9_16"
  });
  assert.equal(Array.isArray(args), true);
  assert.equal(args.filter((arg) => arg === "-i").length, 2);
  assert.equal(args.includes("-filter_complex"), true);
  assert.equal(args.includes("shell"), false);
  assert.equal(args.join(" ").includes("concat=n=2:v=1:a=0"), true);
  assert.equal(args.join(" ").includes("scale=720:1280"), true);
  assert.equal(args.includes("-n"), true);
  assert.equal(args.at(-1), "/tmp/output.mp4");
  assert.throws(() => buildSafeFfmpegMultiShotArgs(["/tmp/one.mp4"], "/tmp/output.mp4"), /2 sampai 3/i);
});

maybeTest("controlled multi-shot eligibility requires at least two safe source-backed items", async () => {
  const single = await createReadyRenderAttemptFixture("multishot-single", {
    createSourceFile: true,
    sourceCount: 1
  });
  const singleEligibility = await validateControlledMultiShotRenderEligibility(single.manifest.id, {
    storageRoot: single.storageRoot
  });
  const singleAttempt = await runControlledMultiShotSmokeRenderForManifest(single.manifest.id, {
    storageRoot: single.storageRoot
  });

  assert.equal(singleEligibility.ok, false);
  assert.match(singleEligibility.blocking_reasons.join(" "), /minimal 2/i);
  assert.equal(singleAttempt.attempt_status, "blocked");
  assert.match(singleAttempt.error_message || "", /minimal 2/i);

  const multi = await createReadyRenderAttemptFixture("multishot-ready", {
    createSourceFile: true,
    sourceCount: 3
  });
  const multiEligibility = await validateControlledMultiShotRenderEligibility(multi.manifest.id, {
    storageRoot: multi.storageRoot
  });
  assert.equal(multiEligibility.ok, true);
  assert.match(multiEligibility.source_relative_path || "", /-1\.mp4/);
  assert.match(multiEligibility.source_relative_path || "", /-2\.mp4/);
  assert.match(multiEligibility.source_relative_path || "", /-3\.mp4/);
});

maybeTest("controlled multi-shot rejects missing or blocked latest preflight", async () => {
  const missingPreflight = await createReadyRenderAttemptFixture("multishot-no-preflight", {
    createSourceFile: true,
    runPreflight: false,
    sourceCount: 2
  });
  await assert.rejects(
    () => runControlledMultiShotSmokeRenderForManifest(missingPreflight.manifest.id, { storageRoot: missingPreflight.storageRoot }),
    /preflight ready wajib/i
  );

  const blockedPreflight = await createReadyRenderAttemptFixture("multishot-blocked-preflight", {
    createSourceFile: true,
    sourceCount: 2
  });
  await cancelVideoDraftJob(blockedPreflight.job.id);
  const blockedRun = await runRenderPreflightForManifest(blockedPreflight.manifest.id);
  const attempt = await runControlledMultiShotSmokeRenderForManifest(blockedPreflight.manifest.id, {
    storageRoot: blockedPreflight.storageRoot
  });

  assert.equal(blockedRun.preflight_result, "blocked");
  assert.equal(attempt.attempt_status, "blocked");
  assert.match(attempt.error_message || "", /Preflight terakhir belum ready/i);
});

maybeTest("controlled multi-shot blocks unsafe and missing physical source", async () => {
  const unsafe = await createReadyRenderAttemptFixture("multishot-unsafe-source", {
    createSourceFile: true,
    sourceCount: 2
  });
  await pool!.query(
    `UPDATE video_render_manifest_items
     SET source_relative_path_snapshot = '../unsafe.mp4'
     WHERE manifest_id = $1
       AND sequence_number = 1`,
    [unsafe.manifest.id]
  );
  const unsafeEligibility = await validateControlledMultiShotRenderEligibility(unsafe.manifest.id, {
    storageRoot: unsafe.storageRoot
  });
  const unsafeAttempt = await runControlledMultiShotSmokeRenderForManifest(unsafe.manifest.id, {
    storageRoot: unsafe.storageRoot
  });

  assert.equal(unsafeEligibility.ok, false);
  assert.match(unsafeEligibility.blocking_reasons.join(" "), /minimal 2/i);
  assert.equal(unsafeAttempt.attempt_status, "blocked");

  const missing = await createReadyRenderAttemptFixture("multishot-missing-source", {
    createSourceFile: false,
    sourceCount: 2
  });
  const missingEligibility = await validateControlledMultiShotRenderEligibility(missing.manifest.id, {
    storageRoot: missing.storageRoot
  });
  const missingAttempt = await runControlledMultiShotSmokeRenderForManifest(missing.manifest.id, {
    storageRoot: missing.storageRoot
  });

  assert.equal(missingEligibility.ok, false);
  assert.match(missingEligibility.blocking_reasons.join(" "), /fisik tidak ditemukan/i);
  assert.equal(missingAttempt.attempt_status, "blocked");
  assert.match(missingAttempt.error_message || "", /fisik tidak ditemukan/i);
});

maybeTest("controlled multi-shot output path cannot escape smoke and does not overwrite existing output", async () => {
  const fixture = await createReadyRenderAttemptFixture("multishot-output-guards", {
    createSourceFile: true,
    sourceCount: 2
  });

  await assert.rejects(
    () =>
      validateControlledMultiShotRenderEligibility(fixture.manifest.id, {
        storageRoot: fixture.storageRoot,
        output_relative_path: "../outside.mp4"
      }),
    /smoke|traversal/i
  );

  const outputRelativePath = `smoke/multishot-existing-${fixture.manifest.id.slice(0, 8)}.mp4`;
  const outputPath = join(fixture.storageRoot, "draft-videos", outputRelativePath);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, "existing output");

  const eligibility = await validateControlledMultiShotRenderEligibility(fixture.manifest.id, {
    storageRoot: fixture.storageRoot,
    output_relative_path: outputRelativePath
  });
  const attempt = await runControlledMultiShotSmokeRenderForManifest(fixture.manifest.id, {
    storageRoot: fixture.storageRoot,
    output_relative_path: outputRelativePath
  });

  assert.equal(eligibility.ok, false);
  assert.match(eligibility.blocking_reasons.join(" "), /tidak boleh overwrite/i);
  assert.equal(attempt.attempt_status, "blocked");
  assert.match(attempt.error_message || "", /tidak boleh overwrite/i);
});

maybeTest("controlled render mocked success records smoke output and keeps source plus planning rows intact", async () => {
  const fixture = await createReadyRenderAttemptFixture("mock-success", {
    createSourceFile: true
  });
  const beforeSource = await stat(fixture.sourcePath);
  const outputRelativePath = `smoke/mock-success-${fixture.manifest.id.slice(0, 8)}.mp4`;
  let capturedArgs: string[] = [];

  const attempt = await runControlledSmokeRenderForManifest(fixture.manifest.id, {
    storageRoot: fixture.storageRoot,
    output_relative_path: outputRelativePath,
    ffmpegRunner: async (args) => {
      capturedArgs = args;
      const outputPath = args.at(-1);
      assert.ok(outputPath);
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, "mock mp4 output");
      return { exitCode: 0, errorMessage: null };
    }
  });

  const outputPath = join(fixture.storageRoot, "draft-videos", outputRelativePath);
  const outputStat = await stat(outputPath);
  const afterSource = await stat(fixture.sourcePath);
  const loadedAttempt = await getRenderAttemptById(attempt.id);
  const jobAfter = await getVideoDraftJobById(fixture.job.id);
  const manifestAfter = await getRenderManifestById(fixture.manifest.id);
  const planAfter = await getContentItemScriptPlan(fixture.contentItemId);
  const stepsAfter = await listShotPlanSteps(fixture.plan.id);
  const selectionAfter = await getContentItemFootageSelection(fixture.selection.id);
  const footageAfter = await getFootageAsset(fixture.reviewed.id);

  assert.equal(attempt.attempt_status, "succeeded");
  assert.equal(loadedAttempt.output_relative_path, outputRelativePath);
  assert.equal(loadedAttempt.output_size_bytes, outputStat.size);
  assert.equal(loadedAttempt.ffmpeg_exit_code, 0);
  assert.equal(capturedArgs.includes("-i"), true);
  assert.equal(capturedArgs.includes(fixture.sourcePath), true);
  assert.equal(outputStat.size > 0, true);
  assert.equal(afterSource.size, beforeSource.size);
  assert.equal(afterSource.mtimeMs, beforeSource.mtimeMs);
  assert.equal(jobAfter.id, fixture.job.id);
  assert.equal(manifestAfter.id, fixture.manifest.id);
  assert.equal(planAfter?.id, fixture.plan.id);
  assert.equal(stepsAfter.some((row) => row.id === fixture.step.id), true);
  assert.equal(selectionAfter.id, fixture.selection.id);
  assert.equal(footageAfter.relative_path, fixture.reviewed.relative_path);
  assert.equal(footageAfter.filename, fixture.reviewed.filename);
  assert.equal(footageAfter.file_extension, fixture.reviewed.file_extension);
  assert.equal(footageAfter.size_bytes, fixture.reviewed.size_bytes);
});

maybeTest("controlled multi-shot mocked success records smoke output and keeps source plus planning rows intact", async () => {
  const fixture = await createReadyRenderAttemptFixture("multishot-mock-success", {
    createSourceFile: true,
    sourceCount: 3
  });
  const beforeSources = await Promise.all(fixture.sourcePaths.map((sourcePath) => stat(sourcePath)));
  const outputRelativePath = `smoke/multishot-success-${fixture.manifest.id.slice(0, 8)}.mp4`;
  let capturedArgs: string[] = [];

  const attempt = await runControlledMultiShotSmokeRenderForManifest(fixture.manifest.id, {
    storageRoot: fixture.storageRoot,
    output_relative_path: outputRelativePath,
    ffmpegRunner: async (args) => {
      capturedArgs = args;
      const outputPath = args.at(-1);
      assert.ok(outputPath);
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, "mock multishot mp4 output");
      return { exitCode: 0, errorMessage: null };
    }
  });

  const outputPath = join(fixture.storageRoot, "draft-videos", outputRelativePath);
  const outputStat = await stat(outputPath);
  const afterSources = await Promise.all(fixture.sourcePaths.map((sourcePath) => stat(sourcePath)));
  const loadedAttempt = await getRenderAttemptById(attempt.id);
  const jobAfter = await getVideoDraftJobById(fixture.job.id);
  const manifestAfter = await getRenderManifestById(fixture.manifest.id);
  const planAfter = await getContentItemScriptPlan(fixture.contentItemId);
  const stepsAfter = await listShotPlanSteps(fixture.plan.id);
  const selectionAfter = await getContentItemFootageSelection(fixture.selection.id);
  const footageAfter = await getFootageAsset(fixture.reviewed.id);

  assert.equal(attempt.attempt_status, "succeeded");
  assert.equal(loadedAttempt.output_relative_path, outputRelativePath);
  assert.equal(loadedAttempt.output_size_bytes, outputStat.size);
  assert.equal(loadedAttempt.ffmpeg_exit_code, 0);
  assert.equal(capturedArgs.filter((arg) => arg === "-i").length, 3);
  assert.equal(capturedArgs.includes("-filter_complex"), true);
  assert.equal(capturedArgs.join(" ").includes("concat=n=3:v=1:a=0"), true);
  assert.equal(capturedArgs.some((arg) => arg.includes("storage/approved-videos")), false);
  assert.equal(outputStat.size > 0, true);
  for (let index = 0; index < fixture.sourcePaths.length; index += 1) {
    assert.equal(afterSources[index].size, beforeSources[index].size);
    assert.equal(afterSources[index].mtimeMs, beforeSources[index].mtimeMs);
  }
  assert.equal(jobAfter.id, fixture.job.id);
  assert.equal(manifestAfter.id, fixture.manifest.id);
  assert.equal(planAfter?.id, fixture.plan.id);
  assert.deepEqual(stepsAfter.map((row) => row.id).sort(), fixture.steps.map((row) => row.id).sort());
  assert.equal(selectionAfter.id, fixture.selection.id);
  assert.equal(footageAfter.relative_path, fixture.reviewed.relative_path);
  assert.equal(footageAfter.filename, fixture.reviewed.filename);
  assert.equal(footageAfter.file_extension, fixture.reviewed.file_extension);
  assert.equal(footageAfter.size_bytes, fixture.reviewed.size_bytes);
});

maybeTest("controlled render validation rejects invalid generated attempt fields", async () => {
  assert.throws(() => validateRenderAttemptStatus("queued"), /Status render attempt tidak valid/i);
  assert.throws(() => validateRenderAttemptMode("auto"), /manual_smoke/i);
});

maybeTest("controlled render page and API route before generic render manifest route", async () => {
  const fixture = await createReadyRenderAttemptFixture("route", {
    createSourceFile: false,
    manifestStatus: "reviewed"
  });

  const pageResponse = mockResponse();
  const pageHandled = await handleContentItemPageGet(
    pageResponse,
    `/content-items/${fixture.contentItemId}/video-draft/${fixture.job.id}/manifest/${fixture.manifest.id}/render-attempts`,
    new URL(`http://localhost/content-items/${fixture.contentItemId}/video-draft/${fixture.job.id}/manifest/${fixture.manifest.id}/render-attempts`)
  );
  assert.equal(pageHandled, true);
  assert.equal(pageResponse.statusCode, 200);
  assert.match(pageResponse.body, /Controlled Smoke Render/);
  assert.match(pageResponse.body, /Run Multi-Shot Smoke Render/);
  assert.match(pageResponse.body, /manual-only/);

  const apiResponse = mockResponse();
  const apiHandled = await handleContentItemApiRoute(
    { method: "GET", url: `/api/render-manifests/${fixture.manifest.id}/render-attempts`, headers: {}, on() {} } as any,
    apiResponse,
    `/api/render-manifests/${fixture.manifest.id}/render-attempts`,
    new URL(`http://localhost/api/render-manifests/${fixture.manifest.id}/render-attempts`)
  );
  assert.equal(apiHandled, true);
  assert.equal(apiResponse.statusCode, 200);
  const body = JSON.parse(apiResponse.body);
  assert.equal(body.ok, true);
  assert.equal(body.data.manifest.id, fixture.manifest.id);
  assert.equal(Boolean(body.data.multiShotEligibility), true);

  const apiPostResponse = mockResponse();
  const apiPostHandled = await handleContentItemApiRoute(
    { method: "POST", url: `/api/render-manifests/${fixture.manifest.id}/render-attempts/run-multishot-smoke`, headers: {}, on() {} } as any,
    apiPostResponse,
    `/api/render-manifests/${fixture.manifest.id}/render-attempts/run-multishot-smoke`,
    new URL(`http://localhost/api/render-manifests/${fixture.manifest.id}/render-attempts/run-multishot-smoke`)
  );
  assert.equal(apiPostHandled, true);
  assert.equal(apiPostResponse.statusCode, 201);
  const apiPostBody = JSON.parse(apiPostResponse.body);
  assert.equal(apiPostBody.ok, true);
  assert.equal(apiPostBody.data.attempt_status, "blocked");
  assert.match(apiPostBody.data.error_message || "", /minimal 2|fisik tidak ditemukan/i);

  const context = await getControlledRenderContextForContentItem(fixture.contentItemId, fixture.job.id, fixture.manifest.id, {
    storageRoot: fixture.storageRoot
  });
  const manifestContext = await getControlledRenderContextForManifest(fixture.manifest.id, { storageRoot: fixture.storageRoot });
  assert.equal(context.manifest.id, fixture.manifest.id);
  assert.equal(manifestContext.latestPreflight?.id, fixture.preflight?.id);
});

maybeTest("render attempt review context rejects missing and mismatched attempts", async () => {
  await assert.rejects(
    () => getRenderAttemptReviewContext("11111111-1111-4111-8111-111111111111"),
    /tidak ditemukan/i
  );

  const fixture = await createSucceededReviewFixture("context");
  await withAppStorageRoot(fixture.storageRoot, async () => {
    await assert.rejects(
      () => getRenderAttemptReviewContextForContentItem(
        "22222222-2222-4222-8222-222222222222",
        fixture.job.id,
        fixture.manifest.id,
        fixture.attempt.id
      ),
      /tidak dimiliki/i
    );
  });
});

maybeTest("render attempt review validation normalizes safe inputs", async () => {
  assert.equal(validateRenderAttemptReviewStatus("approved"), "approved");
  assert.equal(validateRenderAttemptReviewStatus(""), "pending_review");
  assert.throws(() => validateRenderAttemptReviewStatus("published"), /Status review render tidak valid/i);
  assert.deepEqual(validateRenderAttemptReviewInput({ review_note: "  siap  ", reviewed_by_name: " Owner " }), {
    review_note: "siap",
    reviewed_by_name: "Owner"
  });
  assert.throws(() => validateRenderAttemptReviewInput({ review_note: "x".repeat(2001) }), /Catatan review maksimal/i);
});

maybeTest("render attempt review approve requires succeeded smoke output file and metadata", async () => {
  const fixture = await createReadyRenderAttemptFixture("review-eligibility", {
    createSourceFile: true,
    manifestStatus: "approved"
  });
  const blockedAttempt = await runControlledSmokeRenderForManifest(fixture.manifest.id, {
    storageRoot: fixture.storageRoot,
    output_relative_path: `smoke/review-blocked-${fixture.manifest.id.slice(0, 8)}.mp4`,
    ffmpegRunner: async () => ({ exitCode: 1, errorMessage: "mock failure" })
  });

  const statuses = ["requested", "running", "failed", "blocked"];
  const attempts = [blockedAttempt.id];
  for (const statusValue of statuses.slice(0, 3)) {
    attempts.push(await insertRenderAttemptWithStatus(fixture, statusValue, null, null));
  }

  await withAppStorageRoot(fixture.storageRoot, async () => {
    for (const attemptId of attempts) {
      await assert.rejects(
        () => approveRenderAttempt(attemptId, { reviewed_by_name: "Owner" }),
        /succeeded|Output render belum tersedia|tidak bisa direview/i
      );
    }

    const missingOutputAttemptId = await insertRenderAttemptWithStatus(fixture, "succeeded", "smoke/missing-review-output.mp4", 128);
    await assert.rejects(
      () => approveRenderAttempt(missingOutputAttemptId, { reviewed_by_name: "Owner" }),
      /fisik tidak ditemukan/i
    );

    const zeroRelativePath = `smoke/zero-${fixture.manifest.id.slice(0, 8)}.mp4`;
    await mkdir(dirname(join(fixture.storageRoot, "draft-videos", zeroRelativePath)), { recursive: true });
    await writeFile(join(fixture.storageRoot, "draft-videos", zeroRelativePath), "");
    const zeroAttemptId = await insertRenderAttemptWithStatus(fixture, "succeeded", zeroRelativePath, 0);
    await assert.rejects(
      () => approveRenderAttempt(zeroAttemptId, { reviewed_by_name: "Owner" }),
      /non-empty|kosong/i
    );
  });
});

maybeTest("render attempt review approve writes only review row and keeps attempt and files unchanged", async () => {
  const fixture = await createSucceededReviewFixture("approve");
  await withAppStorageRoot(fixture.storageRoot, async () => {
    const attemptBefore = await getRenderAttemptById(fixture.attempt.id);
    const outputBefore = await stat(fixture.outputPath);
    const sourceBefore = await stat(fixture.sourcePath);

    const review = await approveRenderAttempt(fixture.attempt.id, {
      reviewed_by_name: "Owner",
      review_note: "DB-only approval."
    });

    const attemptAfter = await getRenderAttemptById(fixture.attempt.id);
    const outputAfter = await stat(fixture.outputPath);
    const sourceAfter = await stat(fixture.sourcePath);
    const storedReview = await getRenderAttemptReviewByAttemptId(fixture.attempt.id);
    const reviews = await listRenderAttemptReviewsForManifest(fixture.manifest.id);
    const eligibility = await validateRenderAttemptReviewEligibility(fixture.attempt.id);

    assert.equal(review.review_status, "approved");
    assert.ok(review.reviewed_at);
    assert.equal(storedReview?.id, review.id);
    assert.equal(reviews.some((row) => row.id === review.id), true);
    assert.equal(eligibility.ok, true);
    assert.deepEqual(attemptAfter, attemptBefore);
    assert.equal(outputAfter.size, outputBefore.size);
    assert.equal(outputAfter.mtimeMs, outputBefore.mtimeMs);
    assert.equal(sourceAfter.size, sourceBefore.size);
    assert.equal(sourceAfter.mtimeMs, sourceBefore.mtimeMs);
  });
});

maybeTest("render attempt review reject stores note and terminal reviews cannot be changed", async () => {
  const rejected = await createSucceededReviewFixture("reject");
  await withAppStorageRoot(rejected.storageRoot, async () => {
    const review = await rejectRenderAttempt(rejected.attempt.id, {
      reviewed_by_name: "Owner",
      review_note: "Perlu revisi cut."
    });
    assert.equal(review.review_status, "rejected");
    assert.equal(review.review_note, "Perlu revisi cut.");
    assert.equal(review.reviewed_by_name, "Owner");
    assert.ok(review.reviewed_at);

    await assert.rejects(
      () => approveRenderAttempt(rejected.attempt.id, { reviewed_by_name: "Owner" }),
      /terminal/i
    );
  });

  const approved = await createSucceededReviewFixture("terminal");
  await withAppStorageRoot(approved.storageRoot, async () => {
    await approveRenderAttempt(approved.attempt.id, { reviewed_by_name: "Owner" });
    await assert.rejects(
      () => rejectRenderAttempt(approved.attempt.id, { reviewed_by_name: "Owner", review_note: "ubah" }),
      /terminal/i
    );
  });
});

maybeTest("render attempt review page and API routes match before generic attempt route", async () => {
  const fixture = await createSucceededReviewFixture("routes");
  await withAppStorageRoot(fixture.storageRoot, async () => {
    const pageResponse = mockResponse();
    const pagePath = `/content-items/${fixture.contentItemId}/video-draft/${fixture.job.id}/manifest/${fixture.manifest.id}/render-attempts/${fixture.attempt.id}/review`;
    const pageHandled = await handleContentItemPageGet(pageResponse, pagePath, new URL(`http://localhost${pagePath}`));
    assert.equal(pageHandled, true);
    assert.equal(pageResponse.statusCode, 200);
    assert.match(pageResponse.body, /Review Draft Render/);
    assert.match(pageResponse.body, /DB-only/);
    assert.match(pageResponse.body, /approved-videos/);

    const apiResponse = mockResponse();
    const apiPath = `/api/render-attempts/${fixture.attempt.id}/review`;
    const apiHandled = await handleContentItemApiRoute(
      { method: "GET", url: apiPath, headers: {}, on() {} } as any,
      apiResponse,
      apiPath,
      new URL(`http://localhost${apiPath}`)
    );
    assert.equal(apiHandled, true);
    assert.equal(apiResponse.statusCode, 200);
    assert.equal(JSON.parse(apiResponse.body).data.attempt.id, fixture.attempt.id);

    const approveResponse = mockResponse();
    const approvePath = `/api/render-attempts/${fixture.attempt.id}/review/approve`;
    const approveRequest = jsonRequest({ reviewed_by_name: "Owner", review_note: "route approval" });
    const approveHandled = await handleContentItemApiRoute(
      { ...approveRequest, url: approvePath } as any,
      approveResponse,
      approvePath,
      new URL(`http://localhost${approvePath}`)
    );
    assert.equal(approveHandled, true);
    assert.equal(approveResponse.statusCode, 201);
    assert.equal(JSON.parse(approveResponse.body).data.review_status, "approved");
  });
});

maybeTest("render attempts page shows review status and link", async () => {
  const fixture = await createSucceededReviewFixture("page-status");
  await withAppStorageRoot(fixture.storageRoot, async () => {
    await approveRenderAttempt(fixture.attempt.id, { reviewed_by_name: "Owner" });
    const pageResponse = mockResponse();
    const pagePath = `/content-items/${fixture.contentItemId}/video-draft/${fixture.job.id}/manifest/${fixture.manifest.id}/render-attempts`;
    const pageHandled = await handleContentItemPageGet(pageResponse, pagePath, new URL(`http://localhost${pagePath}`));
    assert.equal(pageHandled, true);
    assert.equal(pageResponse.statusCode, 200);
    assert.match(pageResponse.body, /Disetujui/);
    assert.match(pageResponse.body, new RegExp(`/render-attempts/${fixture.attempt.id}/review`));
  });
});

maybeTest("approved promotion context rejects missing attempts and requires approved review", async () => {
  await assert.rejects(
    () => getRenderApprovedPromotionContext("11111111-1111-4111-8111-111111111111"),
    /tidak ditemukan/i
  );

  const noReview = await createSucceededReviewFixture("promotion-no-review");
  await withAppStorageRoot(noReview.storageRoot, async () => {
    const context = await getRenderApprovedPromotionContext(noReview.attempt.id);
    assert.equal(context.review, null);
    assert.equal(context.eligibility.ok, false);
    assert.match(context.eligibility.blocking_reasons.join(" "), /Review render belum ada/i);
    await assert.rejects(
      () => promoteApprovedRenderAttempt(noReview.attempt.id, { promoted_by_name: "Owner" }),
      /Review render belum ada/i
    );
  });

  for (const statusValue of ["pending_review", "rejected", "archived"]) {
    const fixture = await createSucceededReviewFixture(`promotion-${statusValue}`);
    await insertRenderAttemptReviewWithStatus(fixture, fixture.attempt.id, statusValue);
    await withAppStorageRoot(fixture.storageRoot, async () => {
      const context = await getRenderApprovedPromotionContext(fixture.attempt.id);
      assert.equal(context.review?.review_status, statusValue);
      assert.equal(context.eligibility.ok, false);
      assert.match(context.eligibility.blocking_reasons.join(" "), /approved/i);
    });
  }
});

maybeTest("approved promotion validation normalizes safe inputs", async () => {
  assert.equal(validateRenderApprovedPromotionStatus("succeeded"), "succeeded");
  assert.equal(validateRenderApprovedPromotionStatus(""), "requested");
  assert.throws(() => validateRenderApprovedPromotionStatus("published"), /Status promosi render tidak valid/i);
  assert.deepEqual(validateRenderApprovedPromotionInput({ promotion_note: "  siap  ", promoted_by_name: " Owner " }), {
    promotion_note: "siap",
    promoted_by_name: "Owner"
  });
  assert.throws(() => validateRenderApprovedPromotionInput({ promotion_note: "x".repeat(2001) }), /Catatan promosi maksimal/i);
});

maybeTest("approved promotion requires succeeded attempt and physical non-empty draft source", async () => {
  const fixture = await createReadyRenderAttemptFixture("promotion-eligibility", {
    createSourceFile: true,
    manifestStatus: "approved"
  });
  for (const statusValue of ["requested", "running", "failed", "blocked"]) {
    const attemptId = await insertRenderAttemptWithStatus(fixture, statusValue, null, null);
    await insertRenderAttemptReviewWithStatus(fixture, attemptId, "approved");
    await withAppStorageRoot(fixture.storageRoot, async () => {
      const context = await getRenderApprovedPromotionContext(attemptId);
      assert.equal(context.eligibility.ok, false);
      assert.match(context.eligibility.blocking_reasons.join(" "), /succeeded|Output draft render belum tersedia/i);
    });
  }

  const missingAttemptId = await insertRenderAttemptWithStatus(fixture, "succeeded", "smoke/missing-promotion-source.mp4", 128);
  await insertRenderAttemptReviewWithStatus(fixture, missingAttemptId, "approved");
  await withAppStorageRoot(fixture.storageRoot, async () => {
    await assert.rejects(
      () => promoteApprovedRenderAttempt(missingAttemptId, { promoted_by_name: "Owner" }),
      /fisik tidak ditemukan/i
    );
  });

  const zeroRelativePath = `smoke/zero-promotion-${fixture.manifest.id.slice(0, 8)}.mp4`;
  await mkdir(dirname(join(fixture.storageRoot, "draft-videos", zeroRelativePath)), { recursive: true });
  await writeFile(join(fixture.storageRoot, "draft-videos", zeroRelativePath), "");
  const zeroAttemptId = await insertRenderAttemptWithStatus(fixture, "succeeded", zeroRelativePath, 0);
  await insertRenderAttemptReviewWithStatus(fixture, zeroAttemptId, "approved");
  await withAppStorageRoot(fixture.storageRoot, async () => {
    await assert.rejects(
      () => promoteApprovedRenderAttempt(zeroAttemptId, { promoted_by_name: "Owner" }),
      /non-empty|kosong/i
    );
  });
});

maybeTest("approved promotion copies one file, records row, and keeps source, attempt, and review unchanged", async () => {
  const fixture = await createApprovedPromotionFixture("success");
  await withAppStorageRoot(fixture.storageRoot, async () => {
    const attemptBefore = await getRenderAttemptById(fixture.attempt.id);
    const reviewBefore = await getRenderAttemptReviewByAttemptId(fixture.attempt.id);
    const draftBefore = await stat(fixture.outputPath);
    const sourceBefore = await stat(fixture.sourcePath);
    const approvedSmokeRoot = join(fixture.storageRoot, "approved-videos", "smoke");
    const beforeApprovedFiles = await readdir(approvedSmokeRoot).catch(() => []);

    const promotion = await promoteApprovedRenderAttempt(fixture.attempt.id, {
      promoted_by_name: "Owner",
      promotion_note: "Manual copy approval."
    });

    const approvedPath = join(fixture.storageRoot, "approved-videos", promotion.approved_output_relative_path!);
    const approvedStat = await stat(approvedPath);
    const draftAfter = await stat(fixture.outputPath);
    const sourceAfter = await stat(fixture.sourcePath);
    const attemptAfter = await getRenderAttemptById(fixture.attempt.id);
    const reviewAfter = await getRenderAttemptReviewByAttemptId(fixture.attempt.id);
    const storedPromotion = await getRenderApprovedPromotionByAttemptId(fixture.attempt.id);
    const promotions = await listRenderApprovedPromotionsForManifest(fixture.manifest.id);
    const afterApprovedFiles = await readdir(approvedSmokeRoot);
    const eligibility = await validateRenderApprovedPromotionEligibility(fixture.attempt.id);

    assert.equal(promotion.promotion_status, "succeeded");
    assert.equal(promotion.promotion_mode, "manual_copy");
    assert.match(promotion.approved_output_relative_path || "", /^smoke\/.+[.]mp4$/);
    assert.equal(promotion.source_output_relative_path, fixture.outputRelativePath);
    assert.equal(promotion.source_size_bytes, draftBefore.size);
    assert.equal(promotion.approved_size_bytes, draftBefore.size);
    assert.equal(promotion.source_sha256, promotion.approved_sha256);
    assert.equal(readFileSync(approvedPath, "utf8"), readFileSync(fixture.outputPath, "utf8"));
    assert.equal(approvedStat.size, draftBefore.size);
    assert.equal(afterApprovedFiles.length, beforeApprovedFiles.length + 1);
    assert.deepEqual(attemptAfter, attemptBefore);
    assert.deepEqual(reviewAfter, reviewBefore);
    assert.equal(storedPromotion?.id, promotion.id);
    assert.equal(promotions.some((row) => row.id === promotion.id), true);
    assert.equal(draftAfter.size, draftBefore.size);
    assert.equal(draftAfter.mtimeMs, draftBefore.mtimeMs);
    assert.equal(sourceAfter.size, sourceBefore.size);
    assert.equal(sourceAfter.mtimeMs, sourceBefore.mtimeMs);
    assert.equal(eligibility.ok, false);
    assert.match(eligibility.blocking_reasons.join(" "), /promotion row/i);

    const approvedBeforeDuplicate = await stat(approvedPath);
    await assert.rejects(
      () => promoteApprovedRenderAttempt(fixture.attempt.id, { promoted_by_name: "Owner" }),
      /promotion row/i
    );
    const approvedAfterDuplicate = await stat(approvedPath);
    assert.equal(approvedAfterDuplicate.size, approvedBeforeDuplicate.size);
    assert.equal(approvedAfterDuplicate.mtimeMs, approvedBeforeDuplicate.mtimeMs);
  });
});

maybeTest("approved promotion page and API routes match before generic attempt route", async () => {
  const fixture = await createApprovedPromotionFixture("routes");
  await withAppStorageRoot(fixture.storageRoot, async () => {
    const pageResponse = mockResponse();
    const pagePath = `/content-items/${fixture.contentItemId}/video-draft/${fixture.job.id}/manifest/${fixture.manifest.id}/render-attempts/${fixture.attempt.id}/promotion`;
    const pageHandled = await handleContentItemPageGet(pageResponse, pagePath, new URL(`http://localhost${pagePath}`));
    assert.equal(pageHandled, true);
    assert.equal(pageResponse.statusCode, 200);
    assert.match(pageResponse.body, /Promote Draft Render/);
    assert.match(pageResponse.body, /approved-videos\/smoke/);

    const reviewPageResponse = mockResponse();
    const reviewPagePath = `/content-items/${fixture.contentItemId}/video-draft/${fixture.job.id}/manifest/${fixture.manifest.id}/render-attempts/${fixture.attempt.id}/review`;
    const reviewPageHandled = await handleContentItemPageGet(reviewPageResponse, reviewPagePath, new URL(`http://localhost${reviewPagePath}`));
    assert.equal(reviewPageHandled, true);
    assert.match(reviewPageResponse.body, /Promote to Approved Smoke/);

    const apiResponse = mockResponse();
    const apiPath = `/api/render-attempts/${fixture.attempt.id}/promotion`;
    const apiHandled = await handleContentItemApiRoute(
      { method: "GET", url: apiPath, headers: {}, on() {} } as any,
      apiResponse,
      apiPath,
      new URL(`http://localhost${apiPath}`)
    );
    assert.equal(apiHandled, true);
    assert.equal(apiResponse.statusCode, 200);
    assert.equal(JSON.parse(apiResponse.body).data.attempt.id, fixture.attempt.id);

    const promoteResponse = mockResponse();
    const promotePath = `/api/render-attempts/${fixture.attempt.id}/promotion/promote`;
    const promoteRequest = jsonRequest({ promoted_by_name: "Owner", promotion_note: "route promotion" });
    const promoteHandled = await handleContentItemApiRoute(
      { ...promoteRequest, url: promotePath } as any,
      promoteResponse,
      promotePath,
      new URL(`http://localhost${promotePath}`)
    );
    assert.equal(promoteHandled, true);
    assert.equal(promoteResponse.statusCode, 201);
    assert.equal(JSON.parse(promoteResponse.body).data.promotion_status, "succeeded");
  });
});

maybeTest("approved video library lists succeeded promotions and filters by handoff status and query", async () => {
  const readyFixture = await createSucceededHandoffFixture("library-ready");
  const pendingFixture = await createSucceededHandoffFixture("library-pending");
  const failedFixture = await createSucceededReviewFixture("handoff-library-failed");
  await withAppStorageRoot(failedFixture.storageRoot, async () => {
    const review = await approveRenderAttempt(failedFixture.attempt.id, { reviewed_by_name: "Owner" });
    await insertApprovedPromotionWithStatus(failedFixture, review.id, "failed", null, null);
  });

  await withAppStorageRoot(readyFixture.storageRoot, async () => {
    await markApprovedVideoReadyForManualPublish(readyFixture.promotion.id, {
      handoff_by_name: "Owner",
      handoff_note: "Ready for manual publish."
    });
  });

  const library = await listApprovedVideoLibrary({ q: prefix });
  assert.equal(library.some((row) => row.promotion_id === readyFixture.promotion.id), true);
  assert.equal(library.some((row) => row.promotion_id === pendingFixture.promotion.id), true);
  assert.equal(library.some((row) => row.render_attempt_id === failedFixture.attempt.id), false);

  const readyRows = await listApprovedVideoLibrary({ handoff_status: "ready_for_manual_publish", q: prefix });
  assert.equal(readyRows.some((row) => row.promotion_id === readyFixture.promotion.id), true);
  assert.equal(readyRows.some((row) => row.promotion_id === pendingFixture.promotion.id), false);

  const pendingRows = await listApprovedVideoLibrary({ handoff_status: "pending_handoff", q: pendingFixture.contentItemId });
  assert.equal(pendingRows.length, 0);
  const contentRows = await listApprovedVideoLibrary({ content_item_id: pendingFixture.contentItemId });
  assert.equal(contentRows.length, 1);
  assert.equal(contentRows[0].promotion_id, pendingFixture.promotion.id);
});

maybeTest("approved video handoff context rejects invalid promotions and does not create handoff rows", async () => {
  await assert.rejects(
    () => getApprovedVideoHandoffContext("11111111-1111-4111-8111-111111111111"),
    /tidak ditemukan/i
  );

  const failedFixture = await createSucceededReviewFixture("handoff-context-failed");
  let failedPromotionId = "";
  await withAppStorageRoot(failedFixture.storageRoot, async () => {
    const review = await approveRenderAttempt(failedFixture.attempt.id, { reviewed_by_name: "Owner" });
    failedPromotionId = await insertApprovedPromotionWithStatus(failedFixture, review.id, "failed", null, null);
  });
  await assert.rejects(
    () => getApprovedVideoHandoffContext(failedPromotionId),
    /succeeded/i
  );

  const fixture = await createSucceededHandoffFixture("context");
  await withAppStorageRoot(fixture.storageRoot, async () => {
    assert.equal(await getHandoffByPromotionId(fixture.promotion.id), null);
    const context = await getApprovedVideoHandoffContext(fixture.promotion.id);
    assert.equal(context.libraryItem.promotion_id, fixture.promotion.id);
    assert.equal(context.handoff, null);
    assert.equal(context.eligibility.ok, true);
    assert.equal(await getHandoffByPromotionId(fixture.promotion.id), null);

    const ownedContext = await getApprovedVideoHandoffContextForContentItem(
      fixture.contentItemId,
      fixture.job.id,
      fixture.manifest.id,
      fixture.attempt.id,
      fixture.promotion.id
    );
    assert.equal(ownedContext.libraryItem.promotion_id, fixture.promotion.id);
    await assert.rejects(
      () => getApprovedVideoHandoffContextForContentItem(
        "11111111-1111-4111-8111-111111111111",
        fixture.job.id,
        fixture.manifest.id,
        fixture.attempt.id,
        fixture.promotion.id
      ),
      /tidak dimiliki/i
    );
  });
});

maybeTest("approved video handoff validation normalizes statuses and input", () => {
  assert.equal(validateApprovedVideoHandoffStatus("ready_for_manual_publish"), "ready_for_manual_publish");
  assert.equal(validateApprovedVideoHandoffStatus(""), "pending_handoff");
  assert.throws(() => validateApprovedVideoHandoffStatus("published"), /Status handoff/i);
  assert.deepEqual(validateApprovedVideoHandoffInput({ handoff_note: "  siap  ", handoff_by_name: " Owner " }), {
    handoff_note: "siap",
    handoff_by_name: "Owner"
  });
  assert.throws(() => validateApprovedVideoHandoffInput({ handoff_note: "x".repeat(2001) }), /Catatan handoff maksimal/i);
});

maybeTest("approved video handoff requires safe physical non-empty approved output", async () => {
  const missingFixture = await createSucceededReviewFixture("handoff-missing-output");
  let missingPromotionId = "";
  await withAppStorageRoot(missingFixture.storageRoot, async () => {
    const review = await approveRenderAttempt(missingFixture.attempt.id, { reviewed_by_name: "Owner" });
    missingPromotionId = await insertApprovedPromotionWithStatus(
      missingFixture,
      review.id,
      "succeeded",
      "smoke/missing-handoff-output.mp4",
      128
    );
    await assert.rejects(
      () => markApprovedVideoReadyForManualPublish(missingPromotionId, { handoff_by_name: "Owner" }),
      /fisik tidak ditemukan/i
    );
  });

  const zeroFixture = await createSucceededReviewFixture("handoff-zero-output");
  let zeroPromotionId = "";
  const zeroRelativePath = `smoke/zero-handoff-${zeroFixture.manifest.id.slice(0, 8)}.mp4`;
  await mkdir(dirname(join(zeroFixture.storageRoot, "approved-videos", zeroRelativePath)), { recursive: true });
  await writeFile(join(zeroFixture.storageRoot, "approved-videos", zeroRelativePath), "");
  await withAppStorageRoot(zeroFixture.storageRoot, async () => {
    const review = await approveRenderAttempt(zeroFixture.attempt.id, { reviewed_by_name: "Owner" });
    zeroPromotionId = await insertApprovedPromotionWithStatus(zeroFixture, review.id, "succeeded", zeroRelativePath, 0);
    const eligibility = await validateApprovedVideoHandoffEligibility(zeroPromotionId);
    assert.equal(eligibility.ok, false);
    assert.match(eligibility.blocking_reasons.join(" "), /kosong|non-empty/i);
    await assert.rejects(
      () => markApprovedVideoReadyForManualPublish(zeroPromotionId, { handoff_by_name: "Owner" }),
      /kosong|non-empty/i
    );
  });

  assert.throws(() => validateRenderAttemptOutputRelativePath("../outside.mp4"), /path|smoke|slash/i);
});

maybeTest("approved video handoff inserts then updates one row and keeps promotion, attempt, review, and files unchanged", async () => {
  const fixture = await createSucceededHandoffFixture("lifecycle");
  await withAppStorageRoot(fixture.storageRoot, async () => {
    const promotionBefore = await getRenderApprovedPromotionByAttemptId(fixture.attempt.id);
    const attemptBefore = await getRenderAttemptById(fixture.attempt.id);
    const reviewBefore = await getRenderAttemptReviewByAttemptId(fixture.attempt.id);
    const approvedBefore = await stat(fixture.approvedPath);
    const draftBefore = await stat(fixture.outputPath);
    const sourceBefore = await stat(fixture.sourcePath);

    const ready = await markApprovedVideoReadyForManualPublish(fixture.promotion.id, {
      handoff_by_name: "Owner",
      handoff_note: "Manual publish handoff."
    });

    assert.equal(ready.promotion_id, fixture.promotion.id);
    assert.equal(ready.handoff_status, "ready_for_manual_publish");
    assert.equal(ready.approved_output_relative_path_snapshot, fixture.promotion.approved_output_relative_path);
    assert.equal(ready.approved_size_bytes_snapshot, approvedBefore.size);
    assert.match(ready.approved_sha256_snapshot || "", /^[a-f0-9]{64}$/);
    assert.equal(ready.handoff_by_name, "Owner");
    assert.equal(ready.handoff_note, "Manual publish handoff.");
    assert.ok(ready.handoff_at);

    const hold = await markApprovedVideoHold(fixture.promotion.id, {
      handoff_by_name: "Owner",
      handoff_note: "Hold for timing."
    });
    assert.equal(hold.id, ready.id);
    assert.equal(hold.handoff_status, "hold");
    const needsRevision = await markApprovedVideoNeedsRevision(fixture.promotion.id, {
      handoff_by_name: "Owner",
      handoff_note: "Caption needs revision."
    });
    assert.equal(needsRevision.id, ready.id);
    assert.equal(needsRevision.handoff_status, "needs_revision");
    const archived = await archiveApprovedVideoHandoff(fixture.promotion.id, {
      handoff_by_name: "Owner",
      handoff_note: "Archive test."
    });
    assert.equal(archived.id, ready.id);
    assert.equal(archived.handoff_status, "archived");

    const count = await pool!.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM video_approved_handoff_records WHERE promotion_id = $1`,
      [fixture.promotion.id]
    );
    assert.equal(count.rows[0].count, "1");
    assert.deepEqual(await getRenderApprovedPromotionByAttemptId(fixture.attempt.id), promotionBefore);
    assert.deepEqual(await getRenderAttemptById(fixture.attempt.id), attemptBefore);
    assert.deepEqual(await getRenderAttemptReviewByAttemptId(fixture.attempt.id), reviewBefore);
    assert.equal((await stat(fixture.approvedPath)).size, approvedBefore.size);
    assert.equal((await stat(fixture.approvedPath)).mtimeMs, approvedBefore.mtimeMs);
    assert.equal((await stat(fixture.outputPath)).size, draftBefore.size);
    assert.equal((await stat(fixture.outputPath)).mtimeMs, draftBefore.mtimeMs);
    assert.equal((await stat(fixture.sourcePath)).size, sourceBefore.size);
    assert.equal((await stat(fixture.sourcePath)).mtimeMs, sourceBefore.mtimeMs);
  });
});

maybeTest("approved video page and API routes match before generic approved video detail route", async () => {
  const fixture = await createSucceededHandoffFixture("routes");
  await withAppStorageRoot(fixture.storageRoot, async () => {
    const listPageResponse = mockResponse();
    const listHandled = await handleApprovedVideoPageGet(listPageResponse, "/approved-videos", new URL("http://localhost/approved-videos"));
    assert.equal(listHandled, true);
    assert.equal(listPageResponse.statusCode, 200);
    assert.match(listPageResponse.body, /Approved Video Library/);
    assert.match(listPageResponse.body, /DB-only/);
    assert.match(listPageResponse.body, new RegExp(fixture.promotion.id));

    const detailPath = `/approved-videos/${fixture.promotion.id}`;
    const detailPageResponse = mockResponse();
    const detailHandled = await handleApprovedVideoPageGet(detailPageResponse, detailPath, new URL(`http://localhost${detailPath}`));
    assert.equal(detailHandled, true);
    assert.equal(detailPageResponse.statusCode, 200);
    assert.match(detailPageResponse.body, /Approved Video Detail/);
    assert.match(detailPageResponse.body, /Mark Ready for Manual Publish/);
    assert.match(detailPageResponse.body, /Tidak upload/i);
    assert.match(detailPageResponse.body, /tidak mutasi file/i);

    const apiListResponse = mockResponse();
    const apiListPath = `/api/approved-videos?q=${encodeURIComponent(prefix)}`;
    const apiListHandled = await handleApprovedVideoApiRoute(
      { method: "GET", url: apiListPath, headers: {}, on() {} } as any,
      apiListResponse,
      "/api/approved-videos",
      new URL(`http://localhost${apiListPath}`)
    );
    assert.equal(apiListHandled, true);
    assert.equal(apiListResponse.statusCode, 200);
    assert.equal(JSON.parse(apiListResponse.body).data.some((row: any) => row.promotion_id === fixture.promotion.id), true);

    const apiDetailResponse = mockResponse();
    const apiDetailPath = `/api/approved-videos/${fixture.promotion.id}`;
    const apiDetailHandled = await handleApprovedVideoApiRoute(
      { method: "GET", url: apiDetailPath, headers: {}, on() {} } as any,
      apiDetailResponse,
      apiDetailPath,
      new URL(`http://localhost${apiDetailPath}`)
    );
    assert.equal(apiDetailHandled, true);
    assert.equal(apiDetailResponse.statusCode, 200);
    assert.equal(JSON.parse(apiDetailResponse.body).data.libraryItem.promotion_id, fixture.promotion.id);

    const readyResponse = mockResponse();
    const readyPath = `/api/approved-videos/${fixture.promotion.id}/handoff/ready`;
    const readyRequest = jsonRequest({ handoff_by_name: "Owner", handoff_note: "route ready" });
    const readyHandled = await handleApprovedVideoApiRoute(
      { ...readyRequest, url: readyPath } as any,
      readyResponse,
      readyPath,
      new URL(`http://localhost${readyPath}`)
    );
    assert.equal(readyHandled, true);
    assert.equal(readyResponse.statusCode, 201);
    assert.equal(JSON.parse(readyResponse.body).data.handoff_status, "ready_for_manual_publish");

    const holdResponse = mockResponse();
    const holdPath = `/approved-videos/${fixture.promotion.id}/handoff/hold`;
    const holdRequest = jsonRequest({ handoff_by_name: "Owner", handoff_note: "page hold" });
    const holdHandled = await handleApprovedVideoPagePost(
      { ...holdRequest, url: holdPath } as any,
      holdResponse,
      holdPath
    );
    assert.equal(holdHandled, true);
    assert.equal(holdResponse.statusCode, 303);
    assert.match(holdResponse.headers.Location, new RegExp(`/approved-videos/${fixture.promotion.id}`));
  });
});

maybeTest("manual publication package eligibility rejects missing, non-ready, failed promotion, and missing approved file", async () => {
  await assert.rejects(
    () => validateManualPublicationPackageEligibility("11111111-1111-4111-8111-111111111111"),
    /Handoff approved video tidak ditemukan/i
  );

  const holdFixture = await createSucceededHandoffFixture("package-hold");
  await withAppStorageRoot(holdFixture.storageRoot, async () => {
    const hold = await markApprovedVideoHold(holdFixture.promotion.id, { handoff_by_name: "Owner" });
    const eligibility = await validateManualPublicationPackageEligibility(hold.id);
    assert.equal(eligibility.ok, false);
    assert.match(eligibility.blocking_reasons.join(" "), /ready_for_manual_publish/i);
  });

  const failedFixture = await createSucceededReviewFixture("package-failed-promotion");
  await withAppStorageRoot(failedFixture.storageRoot, async () => {
    const review = await approveRenderAttempt(failedFixture.attempt.id, { reviewed_by_name: "Owner" });
    const failedPromotionId = await insertApprovedPromotionWithStatus(failedFixture, review.id, "failed", null, null);
    const handoff = await pool!.query<{ id: string }>(
      `INSERT INTO video_approved_handoff_records (
         promotion_id,
         render_attempt_id,
         render_attempt_review_id,
         render_manifest_id,
         video_draft_job_id,
         content_item_id,
         handoff_status,
         approved_output_relative_path_snapshot,
         approved_size_bytes_snapshot,
         approved_sha256_snapshot,
         handoff_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'ready_for_manual_publish', $7, 128, NULL, now())
       RETURNING id`,
      [
        failedPromotionId,
        failedFixture.attempt.id,
        review.id,
        failedFixture.manifest.id,
        failedFixture.job.id,
        failedFixture.contentItemId,
        "smoke/missing-failed-promotion.mp4"
      ]
    );
    const eligibility = await validateManualPublicationPackageEligibility(handoff.rows[0].id);
    assert.equal(eligibility.ok, false);
    assert.match(eligibility.blocking_reasons.join(" "), /Promotion harus succeeded|fisik tidak ditemukan/i);
  });

  const missingFixture = await createSucceededReviewFixture("package-missing-approved");
  await withAppStorageRoot(missingFixture.storageRoot, async () => {
    const review = await approveRenderAttempt(missingFixture.attempt.id, { reviewed_by_name: "Owner" });
    const promotionId = await insertApprovedPromotionWithStatus(missingFixture, review.id, "succeeded", "smoke/missing-package-approved.mp4", 128);
    const handoff = await pool!.query<{ id: string }>(
      `INSERT INTO video_approved_handoff_records (
         promotion_id,
         render_attempt_id,
         render_attempt_review_id,
         render_manifest_id,
         video_draft_job_id,
         content_item_id,
         handoff_status,
         approved_output_relative_path_snapshot,
         approved_size_bytes_snapshot,
         approved_sha256_snapshot,
         handoff_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'ready_for_manual_publish', 'smoke/missing-package-approved.mp4', 128, NULL, now())
       RETURNING id`,
      [promotionId, missingFixture.attempt.id, review.id, missingFixture.manifest.id, missingFixture.job.id, missingFixture.contentItemId]
    );
    const eligibility = await validateManualPublicationPackageEligibility(handoff.rows[0].id);
    assert.equal(eligibility.ok, false);
    assert.match(eligibility.blocking_reasons.join(" "), /fisik tidak ditemukan/i);
  });
});

maybeTest("manual publication package validation normalizes package and channel input", () => {
  assert.equal(validateManualPublicationPackageStatus("ready_manual_publish"), "ready_manual_publish");
  assert.equal(validateManualPublicationPackageStatus(""), "draft_package");
  assert.equal(validateManualPublicationPackageChannelStatus("published_manually"), "published_manually");
  assert.throws(() => validateManualPublicationPackageStatus("scheduled"), /Status package/i);
  assert.throws(() => validateManualPublicationPackageChannelStatus("posted"), /Status channel/i);
  const input = validateManualPublicationPackageInput({
    package_title: "  Siap Posting  ",
    caption_text: " Caption ",
    selected_channels: ["instagram", "youtube"],
    channel_formats: { instagram: "reel", youtube: "short" }
  });
  assert.equal(input.package_title, "Siap Posting");
  assert.deepEqual(input.selected_channels, ["instagram", "youtube"]);
  assert.equal(input.channel_formats.instagram, "reel");
  assert.throws(() => validateManualPublicationPackageInput({ selected_channels: [] }), /minimal satu channel/i);
  assert.throws(() => validateManualPublicationPackageInput({ selected_channels: ["instagram", "instagram"] }), /duplikat/i);
  assert.equal(validateManualPublicationPackageChannelInput({ manual_publish_url: "https://example.com/post" }).manual_publish_url, "https://example.com/post");
  assert.throws(() => validateManualPublicationPackageChannelInput({ manual_publish_url: "ftp://example.com/post" }), /http/i);
});

maybeTest("manual publication package creates package and channels, blocks duplicate, and read context has no side effects", async () => {
  const fixture = await createReadyHandoffFixture("create");
  await withAppStorageRoot(fixture.storageRoot, async () => {
    assert.equal(await getManualPublicationPackageByHandoffId(fixture.handoff.id), null);
    const createContext = await getManualPublicationPackageCreateContext(fixture.handoff.id);
    assert.equal(createContext.existingPackage, null);
    assert.equal(createContext.eligibility.ok, true);
    assert.equal(await getManualPublicationPackageByHandoffId(fixture.handoff.id), null);

    const packageContext = await createManualPublicationPackageFromHandoff(fixture.handoff.id, {
      package_title: "Package Siap Posting",
      caption_text: "Caption manual tanpa AI.",
      hashtags_text: "#sampulraport #pesonagama",
      call_to_action: "Chat WA untuk konsultasi.",
      manual_publish_note: "Posting manual saja.",
      created_by_name: "Owner",
      selected_channels: ["instagram", "facebook", "tiktok", "youtube"],
      channel_formats: {
        instagram: "reel",
        facebook: "feed_video",
        tiktok: "short",
        youtube: "short"
      }
    });

    assert.equal(packageContext.package.handoff_id, fixture.handoff.id);
    assert.equal(packageContext.package.promotion_id, fixture.promotion.id);
    assert.equal(packageContext.package.package_status, "draft_package");
    assert.equal(packageContext.package.approved_output_relative_path_snapshot, fixture.promotion.approved_output_relative_path);
    assert.equal(packageContext.package.approved_size_bytes_snapshot, (await stat(fixture.approvedPath)).size);
    assert.match(packageContext.package.approved_sha256_snapshot || "", /^[a-f0-9]{64}$/);
    assert.equal(packageContext.channels.length, 4);
    assert.deepEqual(packageContext.channels.map((channel) => channel.channel).sort(), ["facebook", "instagram", "tiktok", "youtube"]);

    const stored = await getManualPublicationPackageByHandoffId(fixture.handoff.id);
    assert.equal(stored?.id, packageContext.package.id);
    await assert.rejects(
      () => createManualPublicationPackageFromHandoff(fixture.handoff.id, { selected_channels: ["instagram"] }),
      /sudah ada/i
    );
  });
});

maybeTest("manual publication package updates status and channel rows without mutating parents, files, or content publications", async () => {
  const fixture = await createManualPublicationPackageFixture("lifecycle");
  await withAppStorageRoot(fixture.storageRoot, async () => {
    const handoffBefore = await getHandoffByPromotionId(fixture.promotion.id);
    const promotionBefore = await getRenderApprovedPromotionByAttemptId(fixture.attempt.id);
    const attemptBefore = await getRenderAttemptById(fixture.attempt.id);
    const reviewBefore = await getRenderAttemptReviewByAttemptId(fixture.attempt.id);
    const approvedBefore = await stat(fixture.approvedPath);
    const draftBefore = await stat(fixture.outputPath);
    const sourceBefore = await stat(fixture.sourcePath);
    const contentPublicationsBefore = await pool!.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM content_publications WHERE content_item_id = $1`,
      [fixture.contentItemId]
    );

    const updated = await updateManualPublicationPackage(fixture.packageContext.package.id, {
      package_title: "Updated Package",
      caption_text: "Updated manual caption.",
      hashtags_text: "#updated",
      call_to_action: "Manual CTA",
      manual_publish_note: "Still DB-only.",
      created_by_name: "Owner"
    });
    assert.equal(updated.package.package_title, "Updated Package");
    assert.equal(updated.package.caption_text, "Updated manual caption.");

    const ready = await markManualPublicationPackageReady(fixture.packageContext.package.id);
    assert.equal(ready.package.package_status, "ready_manual_publish");
    assert.ok(ready.package.ready_at);
    assert.equal((await markManualPublicationPackageHold(fixture.packageContext.package.id)).package.package_status, "hold");
    assert.equal((await markManualPublicationPackageNeedsRevision(fixture.packageContext.package.id)).package.package_status, "needs_revision");
    const published = await markManualPublicationPackagePublishedManually(fixture.packageContext.package.id);
    assert.equal(published.package.package_status, "published_manually");
    assert.ok(published.package.published_manually_at);
    assert.equal((await archiveManualPublicationPackage(fixture.packageContext.package.id)).package.package_status, "archived");

    const channelUpdated = await updateManualPublicationPackageChannel(fixture.packageContext.package.id, "instagram", {
      channel_status: "published_manually",
      publication_format: "reel",
      manual_publish_url: "https://instagram.com/p/manual-test",
      manual_publish_note: "Posted manually outside system."
    });
    const instagram = channelUpdated.channels.find((channel) => channel.channel === "instagram");
    assert.equal(instagram?.channel_status, "published_manually");
    assert.equal(instagram?.manual_publish_url, "https://instagram.com/p/manual-test");
    assert.ok(instagram?.manual_published_at);

    const contentPublicationsAfter = await pool!.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM content_publications WHERE content_item_id = $1`,
      [fixture.contentItemId]
    );
    assert.deepEqual(await getHandoffByPromotionId(fixture.promotion.id), handoffBefore);
    assert.deepEqual(await getRenderApprovedPromotionByAttemptId(fixture.attempt.id), promotionBefore);
    assert.deepEqual(await getRenderAttemptById(fixture.attempt.id), attemptBefore);
    assert.deepEqual(await getRenderAttemptReviewByAttemptId(fixture.attempt.id), reviewBefore);
    assert.equal(contentPublicationsAfter.rows[0].count, contentPublicationsBefore.rows[0].count);
    assert.equal((await stat(fixture.approvedPath)).size, approvedBefore.size);
    assert.equal((await stat(fixture.approvedPath)).mtimeMs, approvedBefore.mtimeMs);
    assert.equal((await stat(fixture.outputPath)).size, draftBefore.size);
    assert.equal((await stat(fixture.outputPath)).mtimeMs, draftBefore.mtimeMs);
    assert.equal((await stat(fixture.sourcePath)).size, sourceBefore.size);
    assert.equal((await stat(fixture.sourcePath)).mtimeMs, sourceBefore.mtimeMs);
  });
});

maybeTest("manual publication package list filters and page/API routes are ordered safely", async () => {
  const fixture = await createManualPublicationPackageFixture("routes");
  await withAppStorageRoot(fixture.storageRoot, async () => {
    const ready = await markManualPublicationPackageReady(fixture.packageContext.package.id);
    const listed = await listManualPublicationPackages({ package_status: "ready_manual_publish", channel: "youtube", q: fixture.packageContext.content.content_code });
    assert.equal(listed.some((row) => row.id === ready.package.id), true);

    const listPageResponse = mockResponse();
    const listHandled = await handleManualPublicationPackagePageGet(listPageResponse, "/publication-packages", new URL("http://localhost/publication-packages"));
    assert.equal(listHandled, true);
    assert.equal(listPageResponse.statusCode, 200);
    assert.match(listPageResponse.body, /Publication Packages/);
    assert.match(listPageResponse.body, /DB-only/);

    const createPagePath = `/approved-videos/${fixture.promotion.id}/publication-package/new`;
    const createPageResponse = mockResponse();
    const createPageHandled = await handleManualPublicationPackagePageGet(createPageResponse, createPagePath, new URL(`http://localhost${createPagePath}`));
    assert.equal(createPageHandled, true);
    assert.equal(createPageResponse.statusCode, 200);
    assert.match(createPageResponse.body, /Create Publication Package/);

    const detailPath = `/publication-packages/${ready.package.id}`;
    const detailPageResponse = mockResponse();
    const detailHandled = await handleManualPublicationPackagePageGet(detailPageResponse, detailPath, new URL(`http://localhost${detailPath}`));
    assert.equal(detailHandled, true);
    assert.equal(detailPageResponse.statusCode, 200);
    assert.match(detailPageResponse.body, /published_manually hanya catatan manual/);

    const apiListResponse = mockResponse();
    const apiListPath = `/api/publication-packages?channel=youtube&q=${encodeURIComponent(fixture.packageContext.content.content_code)}`;
    const apiListHandled = await handleManualPublicationPackageApiRoute(
      { method: "GET", url: apiListPath, headers: {}, on() {} } as any,
      apiListResponse,
      "/api/publication-packages",
      new URL(`http://localhost${apiListPath}`)
    );
    assert.equal(apiListHandled, true);
    assert.equal(apiListResponse.statusCode, 200);
    assert.equal(JSON.parse(apiListResponse.body).data.some((row: any) => row.id === ready.package.id), true);

    const apiDetailResponse = mockResponse();
    const apiDetailPath = `/api/publication-packages/${ready.package.id}`;
    const apiDetailHandled = await handleManualPublicationPackageApiRoute(
      { method: "GET", url: apiDetailPath, headers: {}, on() {} } as any,
      apiDetailResponse,
      apiDetailPath,
      new URL(`http://localhost${apiDetailPath}`)
    );
    assert.equal(apiDetailHandled, true);
    assert.equal(apiDetailResponse.statusCode, 200);
    assert.equal(JSON.parse(apiDetailResponse.body).data.package.id, ready.package.id);

    const channelResponse = mockResponse();
    const channelPath = `/api/publication-packages/${ready.package.id}/channels/youtube/update`;
    const channelRequest = jsonRequest({ channel_status: "hold", publication_format: "short", manual_publish_note: "route hold" });
    const channelHandled = await handleManualPublicationPackageApiRoute(
      { ...channelRequest, url: channelPath } as any,
      channelResponse,
      channelPath,
      new URL(`http://localhost${channelPath}`)
    );
    assert.equal(channelHandled, true);
    assert.equal(channelResponse.statusCode, 200);
    assert.equal(JSON.parse(channelResponse.body).data.channels.find((row: any) => row.channel === "youtube").channel_status, "hold");

    const pageStatusResponse = mockResponse();
    const pageStatusPath = `/publication-packages/${ready.package.id}/status/hold`;
    const pageStatusHandled = await handleManualPublicationPackagePagePost(
      { ...jsonRequest({}), url: pageStatusPath } as any,
      pageStatusResponse,
      pageStatusPath
    );
    assert.equal(pageStatusHandled, true);
    assert.equal(pageStatusResponse.statusCode, 303);
  });
});

maybeTest("manual publish checklist context rejects missing package and reads do not create rows", async () => {
  await assert.rejects(
    () => getManualPublishChecklistContext("11111111-1111-4111-8111-111111111111"),
    /package tidak ditemukan/i
  );

  const fixture = await createManualPublicationPackageFixture("checklist-context");
  const packageId = fixture.packageContext.package.id;
  const before = await pool!.query<{ count: string }>(
    `SELECT count(*)::text AS count FROM manual_publish_checklist_items WHERE package_id = $1`,
    [packageId]
  );
  assert.equal(before.rows[0].count, "0");
  const context = await getManualPublishChecklistContext(packageId);
  assert.equal(context.package.id, packageId);
  assert.equal(context.checklistItems.length, 0);
  assert.equal(context.evidenceLogs.length, 0);
  const after = await pool!.query<{ count: string }>(
    `SELECT count(*)::text AS count FROM manual_publish_checklist_items WHERE package_id = $1`,
    [packageId]
  );
  assert.equal(after.rows[0].count, "0");
});

maybeTest("manual publish checklist initialize is idempotent and item update only changes checklist row", async () => {
  const fixture = await createManualPublicationPackageFixture("checklist-init");
  const packageId = fixture.packageContext.package.id;
  const initialized = await initializeManualPublishChecklist(packageId);
  assert.equal(initialized.channels.length, 4);
  assert.equal(initialized.checklistItems.length, 32);
  const second = await initializeManualPublishChecklist(packageId);
  assert.equal(second.checklistItems.length, 32);

  const packageBefore = await getManualPublicationPackageContext(packageId);
  const item = second.checklistItems.find((row) => row.channel === "instagram" && row.checklist_key === "caption_ready");
  assert.ok(item);
  const updated = await setManualPublishChecklistItemStatus(item.id, {
    checklist_status: "done",
    checked_by_name: "Owner",
    checklist_note: "Caption checked manually."
  });
  assert.equal(updated.checklist_status, "done");
  assert.equal(updated.is_done, true);
  assert.equal(updated.checked_by_name, "Owner");
  assert.ok(updated.checked_at);
  assert.deepEqual(await getManualPublicationPackageContext(packageId), packageBefore);
});

maybeTest("manual publish checklist and evidence validation rejects unsafe values", () => {
  assert.equal(validateManualPublishChecklistStatus("done"), "done");
  assert.throws(() => validateManualPublishChecklistStatus("posted"), /Status checklist/i);
  assert.equal(validateManualPublishEvidenceType("manual_post_url"), "manual_post_url");
  assert.throws(() => validateManualPublishEvidenceType("file_upload"), /Tipe evidence/i);
  assert.equal(validateManualPublishChecklistItemInput({ checklist_status: "done", checked_by_name: " Owner " }).checked_by_name, "Owner");
  assert.throws(() => validateManualPublishChecklistItemInput({ checklist_note: "x".repeat(2001) }), /Catatan checklist maksimal/i);
  assert.equal(validateManualPublishEvidenceInput({ evidence_type: "manual_post_url", evidence_value: "https://example.com/post" }).evidence_value, "https://example.com/post");
  assert.throws(() => validateManualPublishEvidenceInput({ evidence_type: "manual_post_url", evidence_value: "ftp://example.com/post" }), /http/i);
  assert.equal(validateManualPublishEvidenceInput({ evidence_type: "screenshot_reference", evidence_value: "../screenshots/manual.png" }).evidence_value, "../screenshots/manual.png");
});

maybeTest("manual publish evidence and completion summary do not mutate package, channels, parents, files, or content publications", async () => {
  const fixture = await createManualPublicationPackageFixture("evidence-safety");
  const packageId = fixture.packageContext.package.id;
  await withAppStorageRoot(fixture.storageRoot, async () => {
    const packageBefore = await getManualPublicationPackageContext(packageId);
    const handoffBefore = await getHandoffByPromotionId(fixture.promotion.id);
    const promotionBefore = await getRenderApprovedPromotionByAttemptId(fixture.attempt.id);
    const attemptBefore = await getRenderAttemptById(fixture.attempt.id);
    const reviewBefore = await getRenderAttemptReviewByAttemptId(fixture.attempt.id);
    const approvedBefore = await stat(fixture.approvedPath);
    const draftBefore = await stat(fixture.outputPath);
    const sourceBefore = await stat(fixture.sourcePath);
    const contentPublicationsBefore = await pool!.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM content_publications WHERE content_item_id = $1`,
      [fixture.contentItemId]
    );

    const initialized = await initializeManualPublishChecklist(packageId);
    for (const key of ["caption_ready", "manual_url_recorded", "final_visual_check"]) {
      const item = initialized.checklistItems.find((row) => row.channel === "instagram" && row.checklist_key === key);
      assert.ok(item);
      await setManualPublishChecklistItemStatus(item.id, {
        checklist_status: "done",
        checked_by_name: "Owner",
        checklist_note: `${key} done.`
      });
    }
    await addManualPublishEvidence(packageId, "instagram", {
      evidence_type: "manual_post_url",
      evidence_value: "https://instagram.com/p/manual-phase-2f2-smoke",
      evidence_note: "Manual URL recorded as text.",
      recorded_by_name: "Owner"
    });
    await addManualPublishEvidence(packageId, "instagram", {
      evidence_type: "screenshot_reference",
      evidence_value: "owner-note/screenshot-reference-only",
      evidence_note: "Reference text only; no file read.",
      recorded_by_name: "Owner"
    });
    await addManualPublishEvidence(packageId, "instagram", {
      evidence_type: "admin_note",
      evidence_value: "Manual publish checked.",
      evidence_note: "DB-only note.",
      recorded_by_name: "Owner"
    });

    const evidence = await listManualPublishEvidence(packageId, { channel: "instagram" });
    assert.equal(evidence.length, 3);
    const summary = await getManualPublicationPackageCompletionSummary(packageId);
    assert.equal(summary.checklist_total, 32);
    assert.equal(summary.checklist_done, 3);
    assert.equal(summary.evidence_count, 3);
    assert.equal(summary.manual_url_channel_count, 1);
    assert.deepEqual(summary.channels_with_manual_url, ["instagram"]);
    const channelContext = await getManualPublishChecklistContextForChannel(packageId, "instagram");
    assert.equal(channelContext.channels.length, 1);
    assert.equal(channelContext.checklistItems.length, 8);

    const packageAfter = await getManualPublicationPackageContext(packageId);
    assert.deepEqual(packageAfter.package, packageBefore.package);
    assert.deepEqual(packageAfter.channels, packageBefore.channels);
    assert.deepEqual(await getHandoffByPromotionId(fixture.promotion.id), handoffBefore);
    assert.deepEqual(await getRenderApprovedPromotionByAttemptId(fixture.attempt.id), promotionBefore);
    assert.deepEqual(await getRenderAttemptById(fixture.attempt.id), attemptBefore);
    assert.deepEqual(await getRenderAttemptReviewByAttemptId(fixture.attempt.id), reviewBefore);
    const contentPublicationsAfter = await pool!.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM content_publications WHERE content_item_id = $1`,
      [fixture.contentItemId]
    );
    assert.equal(contentPublicationsAfter.rows[0].count, contentPublicationsBefore.rows[0].count);
    assert.equal((await stat(fixture.approvedPath)).size, approvedBefore.size);
    assert.equal((await stat(fixture.approvedPath)).mtimeMs, approvedBefore.mtimeMs);
    assert.equal((await stat(fixture.outputPath)).size, draftBefore.size);
    assert.equal((await stat(fixture.outputPath)).mtimeMs, draftBefore.mtimeMs);
    assert.equal((await stat(fixture.sourcePath)).size, sourceBefore.size);
    assert.equal((await stat(fixture.sourcePath)).mtimeMs, sourceBefore.mtimeMs);
  });
});

maybeTest("manual publish checklist page and API routes are ordered before generic package detail", async () => {
  const fixture = await createManualPublicationPackageFixture("checklist-routes");
  const packageId = fixture.packageContext.package.id;
  await withAppStorageRoot(fixture.storageRoot, async () => {
    const packageDetailResponse = mockResponse();
    const packageDetailPath = `/publication-packages/${packageId}`;
    const packageDetailHandled = await handleManualPublicationPackagePageGet(packageDetailResponse, packageDetailPath, new URL(`http://localhost${packageDetailPath}`));
    assert.equal(packageDetailHandled, true);
    assert.equal(packageDetailResponse.statusCode, 200);
    assert.match(packageDetailResponse.body, /Open Checklist & Evidence/);

    const checklistPageResponse = mockResponse();
    const checklistPath = `/publication-packages/${packageId}/checklist`;
    const checklistHandled = await handleManualPublishChecklistPageGet(checklistPageResponse, checklistPath, new URL(`http://localhost${checklistPath}`));
    assert.equal(checklistHandled, true);
    assert.equal(checklistPageResponse.statusCode, 200);
    assert.match(checklistPageResponse.body, /Manual Publish Checklist/);
    assert.match(checklistPageResponse.body, /Evidence reference adalah teks saja/);

    const initializeResponse = mockResponse();
    const initializePath = `/api/publication-packages/${packageId}/checklist/initialize`;
    const initializeHandled = await handleManualPublishChecklistApiRoute(
      { ...jsonRequest({}), url: initializePath } as any,
      initializeResponse,
      initializePath,
      new URL(`http://localhost${initializePath}`)
    );
    assert.equal(initializeHandled, true);
    assert.equal(initializeResponse.statusCode, 201);
    const initialized = JSON.parse(initializeResponse.body).data;
    assert.equal(initialized.checklistItems.length, 32);

    const item = initialized.checklistItems.find((row: any) => row.channel === "instagram" && row.checklist_key === "caption_ready");
    const updateResponse = mockResponse();
    const updatePath = `/api/publication-packages/${packageId}/checklist/${item.id}/update`;
    const updateHandled = await handleManualPublishChecklistApiRoute(
      { ...jsonRequest({ checklist_status: "done", checked_by_name: "Owner" }), url: updatePath } as any,
      updateResponse,
      updatePath,
      new URL(`http://localhost${updatePath}`)
    );
    assert.equal(updateHandled, true);
    assert.equal(updateResponse.statusCode, 200);
    assert.equal(JSON.parse(updateResponse.body).data.checklist_status, "done");

    const evidenceResponse = mockResponse();
    const evidencePath = `/api/publication-packages/${packageId}/evidence/instagram/add`;
    const evidenceHandled = await handleManualPublishChecklistApiRoute(
      { ...jsonRequest({ evidence_type: "admin_note", evidence_value: "route evidence", recorded_by_name: "Owner" }), url: evidencePath } as any,
      evidenceResponse,
      evidencePath,
      new URL(`http://localhost${evidencePath}`)
    );
    assert.equal(evidenceHandled, true);
    assert.equal(evidenceResponse.statusCode, 201);

    const summaryResponse = mockResponse();
    const summaryPath = `/api/publication-packages/${packageId}/completion-summary`;
    const summaryHandled = await handleManualPublishChecklistApiRoute(
      { method: "GET", url: summaryPath, headers: {}, on() {} } as any,
      summaryResponse,
      summaryPath,
      new URL(`http://localhost${summaryPath}`)
    );
    assert.equal(summaryHandled, true);
    assert.equal(summaryResponse.statusCode, 200);
    assert.equal(JSON.parse(summaryResponse.body).data.evidence_count, 1);

    const pagePostResponse = mockResponse();
    const pagePostPath = `/publication-packages/${packageId}/evidence/instagram/add`;
    const pagePostHandled = await handleManualPublishChecklistPagePost(
      { ...jsonRequest({ evidence_type: "admin_note", evidence_value: "page evidence" }), url: pagePostPath } as any,
      pagePostResponse,
      pagePostPath
    );
    assert.equal(pagePostHandled, true);
    assert.equal(pagePostResponse.statusCode, 303);
  });
});

async function markPackageChecklistComplete(packageId: string) {
  const initialized = await initializeManualPublishChecklist(packageId);
  for (const item of initialized.checklistItems) {
    await setManualPublishChecklistItemStatus(item.id, {
      checklist_status: "done",
      checked_by_name: "Owner",
      checklist_note: "Report fixture checklist complete."
    });
  }
  return getManualPublishChecklistContext(packageId);
}

maybeTest("manual publish report derives package and channel statuses read-only", async () => {
  const noChecklist = await createManualPublicationPackageFixture("report-no-checklist");
  const partial = await createManualPublicationPackageFixture("report-partial");
  const missingUrl = await createManualPublicationPackageFixture("report-missing-url");
  const ready = await createManualPublicationPackageFixture("report-ready");

  const partialInit = await initializeManualPublishChecklist(partial.packageContext.package.id);
  const partialItem = partialInit.checklistItems.find((row) => row.channel === "instagram" && row.checklist_key === "caption_ready");
  assert.ok(partialItem);
  await setManualPublishChecklistItemStatus(partialItem.id, { checklist_status: "done", checked_by_name: "Owner" });
  await markPackageChecklistComplete(missingUrl.packageContext.package.id);
  await markPackageChecklistComplete(ready.packageContext.package.id);
  await addManualPublishEvidence(ready.packageContext.package.id, "instagram", {
    evidence_type: "manual_post_url",
    evidence_value: "https://instagram.com/p/report-ready",
    recorded_by_name: "Owner"
  });
  await addManualPublishEvidence(ready.packageContext.package.id, "facebook", {
    evidence_type: "manual_post_url",
    evidence_value: "https://facebook.com/report-ready",
    recorded_by_name: "Owner"
  });
  await addManualPublishEvidence(ready.packageContext.package.id, "tiktok", {
    evidence_type: "manual_post_url",
    evidence_value: "https://tiktok.com/@pesona/video/1",
    recorded_by_name: "Owner"
  });
  await addManualPublishEvidence(ready.packageContext.package.id, "youtube", {
    evidence_type: "manual_post_url",
    evidence_value: "https://youtube.com/shorts/report-ready",
    recorded_by_name: "Owner"
  });

  const beforeCounts = await pool!.query<{
    packages: string;
    channels: string;
    checklist: string;
    evidence: string;
    publications: string;
  }>(
    `SELECT
       (SELECT count(*)::text FROM manual_publication_packages) AS packages,
       (SELECT count(*)::text FROM manual_publication_package_channels) AS channels,
       (SELECT count(*)::text FROM manual_publish_checklist_items) AS checklist,
       (SELECT count(*)::text FROM manual_publish_evidence_logs) AS evidence,
       (SELECT count(*)::text FROM content_publications) AS publications`
  );
  const board = await getManualPublishReportBoard({ q: "report-", limit: 200 });
  const summary = await getManualPublishReportSummary({ q: "report-", limit: 200 });
  const byId = new Map(board.packages.map((row) => [row.package_id, row]));
  assert.equal(byId.get(noChecklist.packageContext.package.id)?.report_status, "no_checklist");
  assert.equal(byId.get(partial.packageContext.package.id)?.report_status, "checklist_incomplete");
  assert.equal(byId.get(missingUrl.packageContext.package.id)?.report_status, "missing_manual_url");
  assert.equal(byId.get(ready.packageContext.package.id)?.report_status, "ready_evidence_complete");
  assert.equal(byId.get(noChecklist.packageContext.package.id)?.channels[0].channel_report_status, "no_checklist");
  assert.equal(byId.get(partial.packageContext.package.id)?.channels.find((row) => row.channel === "instagram")?.channel_report_status, "checklist_incomplete");
  assert.equal(byId.get(missingUrl.packageContext.package.id)?.channels.find((row) => row.channel === "instagram")?.channel_report_status, "missing_manual_url");
  assert.equal(byId.get(ready.packageContext.package.id)?.channels.find((row) => row.channel === "instagram")?.channel_report_status, "ready_evidence_complete");
  assert.equal(summary.no_checklist >= 1, true);
  assert.equal(summary.checklist_incomplete >= 1, true);
  assert.equal(summary.missing_manual_url >= 1, true);
  assert.equal(summary.ready_evidence_complete >= 1, true);

  assert.equal((await getManualPublishReportBoard({ q: ready.packageContext.content.content_code })).packages.some((row) => row.package_id === ready.packageContext.package.id), true);
  assert.equal((await getManualPublishReportBoard({ package_status: "draft_package", q: "report-" })).packages.length >= 1, true);
  assert.equal((await getManualPublishReportBoard({ channel: "youtube", q: "report-" })).packages.every((row) => row.channels.some((channel) => channel.channel === "youtube")), true);
  assert.equal((await getManualPublishReportBoard({ report_status: "ready_evidence_complete", q: "report-" })).packages.some((row) => row.package_id === ready.packageContext.package.id), true);
  assert.equal((await getManualPublishReportBoard({ missing_manual_url: "true", q: "report-" })).packages.some((row) => row.package_id === missingUrl.packageContext.package.id), true);
  assert.equal((await getManualPublishReportBoard({ checklist_initialized: "false", q: "report-" })).packages.some((row) => row.package_id === noChecklist.packageContext.package.id), true);

  const afterCounts = await pool!.query<{
    packages: string;
    channels: string;
    checklist: string;
    evidence: string;
    publications: string;
  }>(
    `SELECT
       (SELECT count(*)::text FROM manual_publication_packages) AS packages,
       (SELECT count(*)::text FROM manual_publication_package_channels) AS channels,
       (SELECT count(*)::text FROM manual_publish_checklist_items) AS checklist,
       (SELECT count(*)::text FROM manual_publish_evidence_logs) AS evidence,
       (SELECT count(*)::text FROM content_publications) AS publications`
  );
  assert.deepEqual(afterCounts.rows[0], beforeCounts.rows[0]);
});

maybeTest("manual publish report detail, CSV export, and routes are read-only", async () => {
  const fixture = await createManualPublicationPackageFixture("report-csv");
  const packageId = fixture.packageContext.package.id;
  await pool!.query(`UPDATE content_items SET title = $2 WHERE id = $1`, [
    fixture.contentItemId,
    "CSV comma, quote \" and newline\ncontent"
  ]);
  await markPackageChecklistComplete(packageId);
  await addManualPublishEvidence(packageId, "instagram", {
    evidence_type: "manual_post_url",
    evidence_value: "https://instagram.com/p/report-csv",
    recorded_by_name: "Owner"
  });

  const beforeCounts = await pool!.query<{
    checklist: string;
    evidence: string;
    publications: string;
  }>(
    `SELECT
       (SELECT count(*)::text FROM manual_publish_checklist_items WHERE package_id = $1) AS checklist,
       (SELECT count(*)::text FROM manual_publish_evidence_logs WHERE package_id = $1) AS evidence,
       (SELECT count(*)::text FROM content_publications WHERE content_item_id = $2) AS publications`,
    [packageId, fixture.contentItemId]
  );

  const detail = await getManualPublishReportPackageDetail(packageId);
  assert.equal(detail.package_id, packageId);
  assert.equal(detail.channels.find((row) => row.channel === "instagram")?.has_manual_post_url, true);
  await assert.rejects(() => getManualPublishReportPackageDetail("11111111-1111-4111-8111-111111111111"), /tidak ditemukan/i);
  assert.throws(() => validateManualPublishReportFilters({ report_status: "posted" }), /Status report/i);

  const csv = await exportManualPublishReportCsv({ q: "report-csv", limit: 200 });
  assert.match(csv, /^package_id,content_code,content_title/m);
  assert.match(csv, /"CSV comma, quote "" and newline\ncontent"/);
  assert.equal(readFileSync("apps/web/src/manual-publish-report-service.ts", "utf8").includes("writeFile"), false);

  const pageResponse = mockResponse();
  const pageHandled = await handleManualPublishReportPageGet(pageResponse, "/manual-publish-report", new URL("http://localhost/manual-publish-report?q=report-csv"));
  assert.equal(pageHandled, true);
  assert.equal(pageResponse.statusCode, 200);
  assert.match(pageResponse.body, /Report ini read-only/);
  assert.match(pageResponse.body, /Tidak upload/);
  assert.match(pageResponse.body, /tidak scheduler/);
  assert.match(pageResponse.body, /tidak publisher/);
  assert.match(pageResponse.body, /tidak OpenAI/);
  assert.match(pageResponse.body, /tidak social API/);
  assert.match(pageResponse.body, /tidak mutasi file video/);

  const detailPageResponse = mockResponse();
  const detailPath = `/manual-publish-report/packages/${packageId}`;
  const detailPageHandled = await handleManualPublishReportPageGet(detailPageResponse, detailPath, new URL(`http://localhost${detailPath}`));
  assert.equal(detailPageHandled, true);
  assert.equal(detailPageResponse.statusCode, 200);
  assert.match(detailPageResponse.body, /Channel Report/);

  const apiResponse = mockResponse();
  const apiHandled = await handleManualPublishReportApiRoute(
    { method: "GET", url: "/api/manual-publish-report?q=report-csv", headers: {}, on() {} } as any,
    apiResponse,
    "/api/manual-publish-report",
    new URL("http://localhost/api/manual-publish-report?q=report-csv")
  );
  assert.equal(apiHandled, true);
  assert.equal(apiResponse.statusCode, 200);
  assert.equal(JSON.parse(apiResponse.body).data.packages.some((row: any) => row.package_id === packageId), true);

  const summaryResponse = mockResponse();
  const summaryHandled = await handleManualPublishReportApiRoute(
    { method: "GET", url: "/api/manual-publish-report/summary?q=report-csv", headers: {}, on() {} } as any,
    summaryResponse,
    "/api/manual-publish-report/summary",
    new URL("http://localhost/api/manual-publish-report/summary?q=report-csv")
  );
  assert.equal(summaryHandled, true);
  assert.equal(summaryResponse.statusCode, 200);

  const csvResponse = mockResponse();
  const csvHandled = await handleManualPublishReportApiRoute(
    { method: "GET", url: "/api/manual-publish-report/export.csv?q=report-csv", headers: {}, on() {} } as any,
    csvResponse,
    "/api/manual-publish-report/export.csv",
    new URL("http://localhost/api/manual-publish-report/export.csv?q=report-csv")
  );
  assert.equal(csvHandled, true);
  assert.equal(csvResponse.statusCode, 200);
  assert.match(csvResponse.headers["Content-Type"], /text\/csv/);
  assert.match(csvResponse.body, /report-csv/);

  const apiDetailResponse = mockResponse();
  const apiDetailPath = `/api/manual-publish-report/packages/${packageId}`;
  const apiDetailHandled = await handleManualPublishReportApiRoute(
    { method: "GET", url: apiDetailPath, headers: {}, on() {} } as any,
    apiDetailResponse,
    apiDetailPath,
    new URL(`http://localhost${apiDetailPath}`)
  );
  assert.equal(apiDetailHandled, true);
  assert.equal(apiDetailResponse.statusCode, 200);
  assert.equal(JSON.parse(apiDetailResponse.body).data.package_id, packageId);

  const afterCounts = await pool!.query<{
    checklist: string;
    evidence: string;
    publications: string;
  }>(
    `SELECT
       (SELECT count(*)::text FROM manual_publish_checklist_items WHERE package_id = $1) AS checklist,
       (SELECT count(*)::text FROM manual_publish_evidence_logs WHERE package_id = $1) AS evidence,
       (SELECT count(*)::text FROM content_publications WHERE content_item_id = $2) AS publications`,
    [packageId, fixture.contentItemId]
  );
  assert.deepEqual(afterCounts.rows[0], beforeCounts.rows[0]);
});

async function makePackageCloseoutReady(packageId: string) {
  await markPackageChecklistComplete(packageId);
  for (const channel of ["instagram", "facebook", "tiktok", "youtube"]) {
    await addManualPublishEvidence(packageId, channel, {
      evidence_type: "manual_post_url",
      evidence_value: `https://example.com/${channel}/closeout-ready`,
      recorded_by_name: "Owner"
    });
  }
}

maybeTest("manual publish closeout eligibility blocks missing, incomplete, and missing URL packages", async () => {
  await assert.rejects(
    () => getManualPublishCloseoutEligibility("11111111-1111-4111-8111-111111111111"),
    /Package manual publish tidak ditemukan/i
  );

  const incomplete = await createManualPublicationPackageFixture("closeout-incomplete");
  const incompleteInit = await initializeManualPublishChecklist(incomplete.packageContext.package.id);
  const item = incompleteInit.checklistItems.find((row) => row.channel === "instagram" && row.checklist_key === "caption_ready");
  assert.ok(item);
  await setManualPublishChecklistItemStatus(item.id, { checklist_status: "done", checked_by_name: "Owner" });
  const incompleteEligibility = await getManualPublishCloseoutEligibility(incomplete.packageContext.package.id);
  assert.equal(incompleteEligibility.ok, false);
  assert.equal(incompleteEligibility.report_status, "checklist_incomplete");
  assert.match(incompleteEligibility.blocking_reasons.join(" "), /Checklist belum lengkap/i);
  await assert.rejects(() => createManualPublishCloseout(incomplete.packageContext.package.id), /Checklist belum lengkap/i);

  const missingUrl = await createManualPublicationPackageFixture("closeout-missing-url");
  await markPackageChecklistComplete(missingUrl.packageContext.package.id);
  const missingUrlEligibility = await getManualPublishCloseoutEligibility(missingUrl.packageContext.package.id);
  assert.equal(missingUrlEligibility.ok, false);
  assert.equal(missingUrlEligibility.report_status, "missing_manual_url");
  assert.match(missingUrlEligibility.blocking_reasons.join(" "), /Manual URL belum lengkap/i);
  await assert.rejects(() => createManualPublishCloseout(missingUrl.packageContext.package.id), /Manual URL belum lengkap/i);

  const closeouts = await pool!.query<{ count: string }>(`SELECT count(*)::text AS count FROM manual_publish_closeouts WHERE package_id IN ($1, $2)`, [
    incomplete.packageContext.package.id,
    missingUrl.packageContext.package.id
  ]);
  assert.equal(closeouts.rows[0].count, "0");
});

maybeTest("manual publish closeout creates certificate only when report is complete and keeps parents and files unchanged", async () => {
  const fixture = await createManualPublicationPackageFixture("closeout-success");
  const packageId = fixture.packageContext.package.id;
  await withAppStorageRoot(fixture.storageRoot, async () => {
    await makePackageCloseoutReady(packageId);
    const eligibility = await getManualPublishCloseoutEligibility(packageId);
    assert.equal(eligibility.ok, true);
    assert.equal(eligibility.report_status, "ready_evidence_complete");

    const packageBefore = await getManualPublicationPackageContext(packageId);
    const checklistBefore = await getManualPublishChecklistContext(packageId);
    const handoffBefore = await getHandoffByPromotionId(fixture.promotion.id);
    const promotionBefore = await getRenderApprovedPromotionByAttemptId(fixture.attempt.id);
    const attemptBefore = await getRenderAttemptById(fixture.attempt.id);
    const reviewBefore = await getRenderAttemptReviewByAttemptId(fixture.attempt.id);
    const approvedBefore = await stat(fixture.approvedPath);
    const draftBefore = await stat(fixture.outputPath);
    const sourceBefore = await stat(fixture.sourcePath);
    const contentPublicationsBefore = await pool!.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM content_publications WHERE content_item_id = $1`,
      [fixture.contentItemId]
    );

    const closeout = await createManualPublishCloseout(packageId, {
      closed_by_name: "Owner",
      closeout_note: "Manual publish evidence complete."
    });
    assert.equal(closeout.package_id, packageId);
    assert.equal(closeout.closeout_status, "closed");
    assert.equal(closeout.report_status_snapshot, "ready_evidence_complete");
    assert.equal(closeout.selected_channel_count_snapshot, 4);
    assert.equal(closeout.checklist_total_snapshot, 32);
    assert.equal(closeout.checklist_done_snapshot, 32);
    assert.equal(closeout.manual_url_channel_count_snapshot, 4);
    assert.equal(closeout.missing_manual_url_channels_snapshot, "");
    assert.equal(closeout.closed_by_name, "Owner");
    assert.ok(closeout.closed_at);

    const duplicateBefore = String(closeout.updated_at);
    await assert.rejects(() => createManualPublishCloseout(packageId, { closed_by_name: "Other" }), /Closeout sudah ada/i);
    assert.equal(String((await getManualPublishCloseoutByPackageId(packageId))?.updated_at), duplicateBefore);

    const detail = await getManualPublishCloseoutDetail(closeout.id);
    assert.equal(detail.id, closeout.id);
    assert.equal(detail.content_code, fixture.packageContext.content.content_code);
    assert.equal((await listManualPublishCloseouts({ package_id: packageId })).length, 1);

    const packageAfter = await getManualPublicationPackageContext(packageId);
    const checklistAfter = await getManualPublishChecklistContext(packageId);
    assert.deepEqual(packageAfter, packageBefore);
    assert.deepEqual(checklistAfter.checklistItems, checklistBefore.checklistItems);
    assert.deepEqual(checklistAfter.evidenceLogs, checklistBefore.evidenceLogs);
    assert.deepEqual(await getHandoffByPromotionId(fixture.promotion.id), handoffBefore);
    assert.deepEqual(await getRenderApprovedPromotionByAttemptId(fixture.attempt.id), promotionBefore);
    assert.deepEqual(await getRenderAttemptById(fixture.attempt.id), attemptBefore);
    assert.deepEqual(await getRenderAttemptReviewByAttemptId(fixture.attempt.id), reviewBefore);
    const contentPublicationsAfter = await pool!.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM content_publications WHERE content_item_id = $1`,
      [fixture.contentItemId]
    );
    assert.equal(contentPublicationsAfter.rows[0].count, contentPublicationsBefore.rows[0].count);
    assert.equal((await stat(fixture.approvedPath)).size, approvedBefore.size);
    assert.equal((await stat(fixture.approvedPath)).mtimeMs, approvedBefore.mtimeMs);
    assert.equal((await stat(fixture.outputPath)).size, draftBefore.size);
    assert.equal((await stat(fixture.outputPath)).mtimeMs, draftBefore.mtimeMs);
    assert.equal((await stat(fixture.sourcePath)).size, sourceBefore.size);
    assert.equal((await stat(fixture.sourcePath)).mtimeMs, sourceBefore.mtimeMs);
  });
});

maybeTest("manual publish closeout routes work and are ordered before generic package detail", async () => {
  const incomplete = await createManualPublicationPackageFixture("closeout-routes-incomplete");
  const ready = await createManualPublicationPackageFixture("closeout-routes-ready");
  await makePackageCloseoutReady(ready.packageContext.package.id);

  const pageResponse = mockResponse();
  const pagePath = `/publication-packages/${incomplete.packageContext.package.id}/closeout`;
  const pageHandled = await handleManualPublishCloseoutPageGet(pageResponse, pagePath, new URL(`http://localhost${pagePath}`));
  assert.equal(pageHandled, true);
  assert.equal(pageResponse.statusCode, 200);
  assert.match(pageResponse.body, /Closeout adalah sertifikat DB-only/);
  assert.match(pageResponse.body, /tidak membuat content_publications/);

  const eligibilityResponse = mockResponse();
  const eligibilityPath = `/api/publication-packages/${incomplete.packageContext.package.id}/closeout/eligibility`;
  const eligibilityHandled = await handleManualPublishCloseoutApiRoute(
    { method: "GET", url: eligibilityPath, headers: {}, on() {} } as any,
    eligibilityResponse,
    eligibilityPath,
    new URL(`http://localhost${eligibilityPath}`)
  );
  assert.equal(eligibilityHandled, true);
  assert.equal(eligibilityResponse.statusCode, 200);
  assert.equal(JSON.parse(eligibilityResponse.body).data.ok, false);

  const createResponse = mockResponse();
  const createPath = `/api/publication-packages/${ready.packageContext.package.id}/closeout/create`;
  const createHandled = await handleManualPublishCloseoutApiRoute(
    { ...jsonRequest({ closed_by_name: "Owner", closeout_note: "route closeout" }), url: createPath } as any,
    createResponse,
    createPath,
    new URL(`http://localhost${createPath}`)
  );
  assert.equal(createHandled, true);
  assert.equal(createResponse.statusCode, 201);
  const closeoutId = JSON.parse(createResponse.body).data.id;

  const listResponse = mockResponse();
  const listHandled = await handleManualPublishCloseoutApiRoute(
    { method: "GET", url: "/api/manual-publish-closeouts", headers: {}, on() {} } as any,
    listResponse,
    "/api/manual-publish-closeouts",
    new URL("http://localhost/api/manual-publish-closeouts")
  );
  assert.equal(listHandled, true);
  assert.equal(listResponse.statusCode, 200);
  assert.equal(JSON.parse(listResponse.body).data.some((row: any) => row.id === closeoutId), true);

  const detailResponse = mockResponse();
  const detailPath = `/api/manual-publish-closeouts/${closeoutId}`;
  const detailHandled = await handleManualPublishCloseoutApiRoute(
    { method: "GET", url: detailPath, headers: {}, on() {} } as any,
    detailResponse,
    detailPath,
    new URL(`http://localhost${detailPath}`)
  );
  assert.equal(detailHandled, true);
  assert.equal(detailResponse.statusCode, 200);

  const listPageResponse = mockResponse();
  const listPageHandled = await handleManualPublishCloseoutPageGet(listPageResponse, "/manual-publish-closeouts", new URL("http://localhost/manual-publish-closeouts"));
  assert.equal(listPageHandled, true);
  assert.equal(listPageResponse.statusCode, 200);

  const detailPageResponse = mockResponse();
  const detailPagePath = `/manual-publish-closeouts/${closeoutId}`;
  const detailPageHandled = await handleManualPublishCloseoutPageGet(detailPageResponse, detailPagePath, new URL(`http://localhost${detailPagePath}`));
  assert.equal(detailPageHandled, true);
  assert.equal(detailPageResponse.statusCode, 200);
  assert.match(detailPageResponse.body, /Manual Publish Closeout Detail/);

  const pagePostResponse = mockResponse();
  const pagePostPath = `/publication-packages/${incomplete.packageContext.package.id}/closeout/create`;
  const pagePostHandled = await handleManualPublishCloseoutPagePost(
    { ...jsonRequest({ closed_by_name: "Owner" }), url: pagePostPath } as any,
    pagePostResponse,
    pagePostPath
  );
  assert.equal(pagePostHandled, true);
  assert.equal(pagePostResponse.statusCode, 303);

  assert.equal(validateManualPublishCloseoutInput({ closed_by_name: " Owner ", closeout_note: " Done " }).closed_by_name, "Owner");
  assert.throws(() => validateManualPublishCloseoutInput({ closeout_note: "x".repeat(2001) }), /Catatan closeout maksimal/i);
});

async function operationalReadinessCounts() {
  const result = await pool!.query<{
    campaigns: string;
    content_items: string;
    footage_assets: string;
    content_publications: string;
    manual_publication_packages: string;
    manual_publication_package_channels: string;
    manual_publish_checklist_items: string;
    manual_publish_evidence_logs: string;
    manual_publish_closeouts: string;
    video_render_attempts: string;
    video_render_approved_promotions: string;
    video_approved_handoff_records: string;
  }>(`
    SELECT
      (SELECT count(*)::text FROM campaigns) AS campaigns,
      (SELECT count(*)::text FROM content_items) AS content_items,
      (SELECT count(*)::text FROM footage_assets) AS footage_assets,
      (SELECT count(*)::text FROM content_publications) AS content_publications,
      (SELECT count(*)::text FROM manual_publication_packages) AS manual_publication_packages,
      (SELECT count(*)::text FROM manual_publication_package_channels) AS manual_publication_package_channels,
      (SELECT count(*)::text FROM manual_publish_checklist_items) AS manual_publish_checklist_items,
      (SELECT count(*)::text FROM manual_publish_evidence_logs) AS manual_publish_evidence_logs,
      (SELECT count(*)::text FROM manual_publish_closeouts) AS manual_publish_closeouts,
      (SELECT count(*)::text FROM video_render_attempts) AS video_render_attempts,
      (SELECT count(*)::text FROM video_render_approved_promotions) AS video_render_approved_promotions,
      (SELECT count(*)::text FROM video_approved_handoff_records) AS video_approved_handoff_records
  `);
  return result.rows[0];
}

maybeTest("operational readiness API returns counts from existing fixtures", async () => {
  const fixture = await createManualPublicationPackageFixture("readiness-api-counts");
  await makePackageCloseoutReady(fixture.packageContext.package.id);
  await createManualPublishCloseout(fixture.packageContext.package.id, {
    closed_by_name: "Owner",
    closeout_note: "readiness count closeout"
  });

  const summary = await getOperationalReadinessSummary();
  assert.equal(summary.total_campaigns >= 1, true);
  assert.equal(summary.total_content_items >= 1, true);
  assert.equal(summary.total_footage_assets >= 1, true);
  assert.equal(summary.video_draft_jobs >= 1, true);
  assert.equal(summary.render_manifests >= 1, true);
  assert.equal(summary.render_preflight_runs >= 1, true);
  assert.equal(summary.render_attempts >= 1, true);
  assert.equal(summary.approved_promotions >= 1, true);
  assert.equal(summary.handoff_records >= 1, true);
  assert.equal(summary.manual_publication_packages >= 1, true);
  assert.equal(summary.manual_publication_package_channels >= 4, true);
  assert.equal(summary.checklist_items >= 32, true);
  assert.equal(summary.evidence_logs >= 4, true);
  assert.equal(summary.closeouts >= 1, true);
  assert.equal(summary.content_publications >= 0, true);

  const response = mockResponse();
  const handled = await handleOperationalReadinessApiRoute(
    { method: "GET", url: "/api/operational-readiness", headers: {}, on() {} } as any,
    response,
    "/api/operational-readiness",
    new URL("http://localhost/api/operational-readiness")
  );
  assert.equal(handled, true);
  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.ok, true);
  assert.equal(body.data.summary.manual_publication_packages >= 1, true);
  assert.equal(body.data.safety_notice.some((row: string) => row.includes("read-only")), true);
});

maybeTest("operational readiness summary and API are DB-read-only", async () => {
  const fixture = await createManualPublicationPackageFixture("readiness-read-only");
  await initializeManualPublishChecklist(fixture.packageContext.package.id);
  const before = await operationalReadinessCounts();

  await getOperationalReadinessDashboard({ limit: "200" });
  await getOperationalReadinessSummary();
  await getOperationalReadinessPipeline();

  for (const [path, url] of [
    ["/api/operational-readiness", "http://localhost/api/operational-readiness"],
    ["/api/operational-readiness/summary", "http://localhost/api/operational-readiness/summary"],
    ["/api/operational-readiness/pipeline", "http://localhost/api/operational-readiness/pipeline"]
  ]) {
    const response = mockResponse();
    const handled = await handleOperationalReadinessApiRoute(
      { method: "GET", url: path, headers: {}, on() {} } as any,
      response,
      path,
      new URL(url)
    );
    assert.equal(handled, true);
    assert.equal(response.statusCode, 200);
  }

  const after = await operationalReadinessCounts();
  assert.deepEqual(after, before);
});

maybeTest("operational readiness pipeline funnel counts progress after isolated fixture", async () => {
  const before = await getOperationalReadinessPipeline();
  const fixture = await createManualPublicationPackageFixture("readiness-pipeline");
  await makePackageCloseoutReady(fixture.packageContext.package.id);
  await createManualPublishCloseout(fixture.packageContext.package.id, {
    closed_by_name: "Owner",
    closeout_note: "readiness pipeline closeout"
  });
  const after = await getOperationalReadinessPipeline();

  assert.equal(after.content_items_total, before.content_items_total + 1);
  assert.equal(after.with_footage_selection, before.with_footage_selection + 1);
  assert.equal(after.with_script_plan, before.with_script_plan + 1);
  assert.equal(after.with_video_draft_job, before.with_video_draft_job + 1);
  assert.equal(after.with_render_manifest, before.with_render_manifest + 1);
  assert.equal(after.with_succeeded_render_attempt, before.with_succeeded_render_attempt + 1);
  assert.equal(after.with_approved_promotion, before.with_approved_promotion + 1);
  assert.equal(after.with_ready_handoff, before.with_ready_handoff + 1);
  assert.equal(after.with_publication_package, before.with_publication_package + 1);
  assert.equal(after.with_checklist_initialized, before.with_checklist_initialized + 1);
  assert.equal(after.with_manual_url_evidence, before.with_manual_url_evidence + 1);
  assert.equal(after.with_ready_evidence_complete_report, before.with_ready_evidence_complete_report + 1);
  assert.equal(after.with_closeout, before.with_closeout + 1);
});

maybeTest("operational readiness manual publish readiness reflects checklist, URL, ready report, and closeout states", async () => {
  const noChecklist = await createManualPublicationPackageFixture("readiness-no-checklist");
  const incomplete = await createManualPublicationPackageFixture("readiness-incomplete");
  const missingUrl = await createManualPublicationPackageFixture("readiness-missing-url");
  const ready = await createManualPublicationPackageFixture("readiness-ready");
  const closed = await createManualPublicationPackageFixture("readiness-closed");

  const incompleteInit = await initializeManualPublishChecklist(incomplete.packageContext.package.id);
  await setManualPublishChecklistItemStatus(incompleteInit.checklistItems[0].id, {
    checklist_status: "done",
    checked_by_name: "Owner"
  });
  await markPackageChecklistComplete(missingUrl.packageContext.package.id);
  await makePackageCloseoutReady(ready.packageContext.package.id);
  await makePackageCloseoutReady(closed.packageContext.package.id);
  await createManualPublishCloseout(closed.packageContext.package.id, {
    closed_by_name: "Owner",
    closeout_note: "readiness manual closeout"
  });

  const dashboard = await getOperationalReadinessDashboard({ limit: "200" });
  assert.equal(dashboard.manual_publish.packages_total >= 5, true);
  assert.equal(dashboard.manual_publish.packages_no_checklist >= 1, true);
  assert.equal(dashboard.manual_publish.packages_checklist_incomplete >= 1, true);
  assert.equal(dashboard.manual_publish.packages_missing_manual_url >= 1, true);
  assert.equal(dashboard.manual_publish.packages_ready_evidence_complete >= 2, true);
  assert.equal(dashboard.manual_publish.closeouts_total >= 1, true);
  assert.equal(dashboard.manual_publish.blocked_closeout_candidates >= 1, true);
  assert.equal(dashboard.warnings.some((row) => row.package_id === noChecklist.packageContext.package.id && row.warning_type === "no_checklist"), true);
  assert.equal(dashboard.warnings.some((row) => row.package_id === incomplete.packageContext.package.id && row.warning_type === "checklist_incomplete"), true);
  assert.equal(dashboard.warnings.some((row) => row.package_id === missingUrl.packageContext.package.id && row.warning_type === "missing_manual_url"), true);
  assert.equal(dashboard.warnings.some((row) => row.package_id === ready.packageContext.package.id && row.warning_type === "ready_evidence_complete"), true);
  assert.equal(dashboard.warnings.some((row) => row.package_id === closed.packageContext.package.id), false);
});

maybeTest("operational readiness page route returns safety notice and API route order does not collide", async () => {
  await createManualPublicationPackageFixture("readiness-routes");

  const pageResponse = mockResponse();
  const pageHandled = await handleOperationalReadinessPageGet(
    pageResponse,
    "/operational-readiness",
    new URL("http://localhost/operational-readiness")
  );
  assert.equal(pageHandled, true);
  assert.equal(pageResponse.statusCode, 200);
  assert.match(pageResponse.body, /Dashboard ini read-only/);
  assert.match(pageResponse.body, /Tidak ada upload/);
  assert.match(pageResponse.body, /Tidak membuat atau mengubah content_publications/);
  assert.match(pageResponse.body, /System Readiness Summary/);
  assert.match(pageResponse.body, /Pipeline Readiness Funnel/);
  assert.match(pageResponse.body, /Manual Publish Readiness/);

  const summaryResponse = mockResponse();
  const summaryHandled = await handleOperationalReadinessApiRoute(
    { method: "GET", url: "/api/operational-readiness/summary", headers: {}, on() {} } as any,
    summaryResponse,
    "/api/operational-readiness/summary",
    new URL("http://localhost/api/operational-readiness/summary")
  );
  assert.equal(summaryHandled, true);
  assert.equal(summaryResponse.statusCode, 200);
  assert.equal(JSON.parse(summaryResponse.body).data.total_content_items >= 1, true);

  const pipelineResponse = mockResponse();
  const pipelineHandled = await handleOperationalReadinessApiRoute(
    { method: "GET", url: "/api/operational-readiness/pipeline", headers: {}, on() {} } as any,
    pipelineResponse,
    "/api/operational-readiness/pipeline",
    new URL("http://localhost/api/operational-readiness/pipeline")
  );
  assert.equal(pipelineHandled, true);
  assert.equal(pipelineResponse.statusCode, 200);
  assert.equal(JSON.parse(pipelineResponse.body).data.content_items_total >= 1, true);

  const serverSource = readFileSync("apps/web/src/server.ts", "utf8");
  assert.equal(serverSource.indexOf("handleOperationalReadinessApiRoute") < serverSource.indexOf("handleContentItemApiRoute"), true);
  assert.equal(serverSource.indexOf("handleOperationalReadinessPageGet") < serverSource.indexOf("handleContentCalendarPageGet"), true);
});

test("operational readiness validation rejects write input, no migration added, and prepare-test-db unchanged for phase", () => {
  assert.deepEqual(validateOperationalReadinessFilters({}), { limit: 50 });
  assert.deepEqual(validateOperationalReadinessFilters({ limit: "200" }), { limit: 200 });
  assert.throws(() => validateOperationalReadinessFilters({ limit: "201" }), /Limit operational readiness/i);
  assert.equal(readdirSync("migrations").some((fileName) => fileName.includes("phase2g") || fileName.includes("operational_readiness")), false);
  assert.equal(readFileSync("scripts/prepare-test-db.mjs", "utf8").includes("operational_readiness"), false);
});

test("content footage, script planning, video draft, render manifest, preflight, and controlled render runtime files keep dependencies guarded", () => {
  const source = [
    "apps/web/src/content-item-footage-service.ts",
    "apps/web/src/content-item-script-plan-service.ts",
    "apps/web/src/video-draft-job-service.ts",
    "apps/web/src/render-manifest-service.ts",
    "apps/web/src/render-preflight-service.ts",
    "apps/web/src/render-attempt-review-service.ts",
    "apps/web/src/routes/content-item-api-routes.ts",
    "apps/web/src/routes/content-item-page-routes.ts",
    "apps/web/src/validation/content-item-footage-validation.ts",
    "apps/web/src/validation/content-item-script-plan-validation.ts",
    "apps/web/src/validation/video-draft-job-validation.ts",
    "apps/web/src/validation/render-manifest-validation.ts",
    "apps/web/src/validation/render-preflight-validation.ts",
    "apps/web/src/validation/render-attempt-validation.ts",
    "apps/web/src/validation/render-attempt-review-validation.ts",
    "apps/web/src/validation/render-approved-promotion-validation.ts",
    "apps/web/src/validation/approved-video-handoff-validation.ts",
    "apps/web/src/validation/manual-publication-package-validation.ts",
    "apps/web/src/validation/manual-publish-checklist-validation.ts"
  ].map((path) => readFileSync(path, "utf8")).join("\n");

  for (const forbidden of ["OpenAI", "openai", "scheduler", "publisher", "fluent-ffmpeg", "child_process", "spawn", "exec", "execFile", "approved-videos", "workers/video", "writeFile", "copyFile", "createWriteStream", "appendFile", "truncate"]) {
    assert.equal(source.includes(forbidden), false);
  }

  const contentItemViewSource = readFileSync("apps/web/src/views/content-item-pages.ts", "utf8");
  for (const forbidden of ["fluent-ffmpeg", "child_process", "spawn", "exec(", "execFile", "writeFile", "copyFile", "createWriteStream", "appendFile", "truncate"]) {
    assert.equal(contentItemViewSource.includes(forbidden), false);
  }
  assert.equal(contentItemViewSource.includes("approved-videos"), true);
  assert.equal(contentItemViewSource.includes("OpenAI"), true);

  const renderAttemptSource = readFileSync("apps/web/src/render-attempt-service.ts", "utf8");
  for (const forbidden of ["exec(", "execFile", "shell:", "unlink", "rename", "copyFile", "writeFile", "appendFile", "createWriteStream", "storage/approved-videos", "workers/video", "OpenAI", "openai", "scheduler", "publisher", "upload"]) {
    assert.equal(renderAttemptSource.includes(forbidden), false);
  }
  assert.equal(renderAttemptSource.includes(`spawn("ffmpeg"`), true);
  assert.equal(renderAttemptSource.includes("storage/draft-videos"), true);
  assert.equal(renderAttemptSource.includes("storage/footage"), true);

  const renderReviewSource = readFileSync("apps/web/src/render-attempt-review-service.ts", "utf8");
  for (const forbidden of ["exec(", "execFile", "shell:", "rm(", "unlink", "rename", "copyFile", "writeFile", "appendFile", "createWriteStream", "storage/approved-videos", "workers/video", "OpenAI", "openai", "scheduler", "publisher", "upload"]) {
    assert.equal(renderReviewSource.includes(forbidden), false);
  }
  assert.equal(renderReviewSource.includes("\"draft-videos\""), true);
  assert.equal(renderReviewSource.includes("\"smoke\""), true);

  const renderPromotionSource = readFileSync("apps/web/src/render-approved-promotion-service.ts", "utf8");
  for (const forbidden of ["exec(", "execFile", "shell:", "rm(", "unlink", "rename", "writeFile", "appendFile", "createWriteStream", "workers/video", "OpenAI", "openai", "scheduler", "publisher", "upload"]) {
    assert.equal(renderPromotionSource.includes(forbidden), false);
  }
  assert.equal(renderPromotionSource.includes("copyFile"), true);
  assert.equal(renderPromotionSource.includes("\"approved-videos\""), true);
  assert.equal(renderPromotionSource.includes("\"draft-videos\""), true);
  assert.equal(renderPromotionSource.includes("\"smoke\""), true);

  const handoffRuntimeSource = [
    "apps/web/src/approved-video-handoff-service.ts",
    "apps/web/src/routes/approved-video-api-routes.ts",
    "apps/web/src/routes/approved-video-page-routes.ts"
  ].map((path) => readFileSync(path, "utf8")).join("\n");
  for (const forbidden of ["exec(", "execFile", "shell:", "rm(", "unlink", "rename", "copyFile", "writeFile", "appendFile", "createWriteStream", "mkdir", "workers/video", "OpenAI", "openai", "scheduler", "publisher", "upload"]) {
    assert.equal(handoffRuntimeSource.includes(forbidden), false);
  }
  assert.equal(handoffRuntimeSource.includes("createReadStream"), true);
  assert.equal(handoffRuntimeSource.includes("\"approved-videos\""), true);
  assert.equal(handoffRuntimeSource.includes("\"smoke\""), true);

  const handoffViewSource = readFileSync("apps/web/src/views/approved-video-pages.ts", "utf8");
  for (const forbidden of ["exec(", "execFile", "shell:", "unlink", "rename", "copyFile", "writeFile", "appendFile", "createWriteStream", "mkdir", "workers/video"]) {
    assert.equal(handoffViewSource.includes(forbidden), false);
  }
  assert.equal(handoffViewSource.includes("OpenAI"), true);
  assert.equal(handoffViewSource.includes("scheduler"), true);
  assert.equal(handoffViewSource.includes("publisher"), true);
  assert.equal(handoffViewSource.includes("upload"), true);

  const packageRuntimeSource = [
    "apps/web/src/manual-publication-package-service.ts",
    "apps/web/src/routes/manual-publication-package-api-routes.ts",
    "apps/web/src/routes/manual-publication-package-page-routes.ts"
  ].map((path) => readFileSync(path, "utf8")).join("\n");
  for (const forbidden of ["exec(", "execFile", "shell:", "rm(", "unlink", "rename", "copyFile", "writeFile", "appendFile", "createWriteStream", "mkdir", "workers/video", "OpenAI", "openai", "scheduler", "publisher", "upload", "graph.facebook", "facebook.com", "googleapis", "axios", "fetch("]) {
    assert.equal(packageRuntimeSource.includes(forbidden), false);
  }
  assert.equal(packageRuntimeSource.includes("createReadStream"), true);
  assert.equal(packageRuntimeSource.includes("\"approved-videos\""), true);
  assert.equal(packageRuntimeSource.includes("\"smoke\""), true);

  const packageViewSource = readFileSync("apps/web/src/views/manual-publication-package-pages.ts", "utf8");
  for (const forbidden of ["exec(", "execFile", "shell:", "rm(", "unlink", "rename", "copyFile", "writeFile", "appendFile", "createWriteStream", "mkdir", "workers/video", "graph.facebook", "facebook.com", "googleapis", "axios", "fetch("]) {
    assert.equal(packageViewSource.includes(forbidden), false);
  }
  assert.equal(packageViewSource.includes("OpenAI"), true);
  assert.equal(packageViewSource.includes("scheduler"), true);
  assert.equal(packageViewSource.includes("publisher"), true);
  assert.equal(packageViewSource.includes("upload"), true);
  assert.equal(packageViewSource.includes("TikTok"), true);
  assert.equal(packageViewSource.includes("YouTube"), true);

  const checklistRuntimeSource = [
    "apps/web/src/manual-publish-checklist-service.ts",
    "apps/web/src/routes/manual-publish-checklist-api-routes.ts",
    "apps/web/src/routes/manual-publish-checklist-page-routes.ts"
  ].map((path) => readFileSync(path, "utf8")).join("\n");
  for (const forbidden of ["exec(", "execFile", "shell:", "rm(", "unlink", "rename", "copyFile", "writeFile", "appendFile", "createWriteStream", "mkdir", "createReadStream", "storage/approved-videos", "storage/draft-videos", "storage/footage", "workers/video", "OpenAI", "openai", "scheduler", "publisher", "upload", "graph.facebook", "facebook.com", "googleapis", "axios", "fetch("]) {
    assert.equal(checklistRuntimeSource.includes(forbidden), false);
  }

  const checklistViewSource = readFileSync("apps/web/src/views/manual-publish-checklist-pages.ts", "utf8");
  for (const forbidden of ["exec(", "execFile", "shell:", "rm(", "unlink", "rename", "copyFile", "writeFile", "appendFile", "createWriteStream", "mkdir", "createReadStream", "storage/approved-videos", "storage/draft-videos", "storage/footage", "workers/video", "graph.facebook", "facebook.com", "googleapis", "axios", "fetch("]) {
    assert.equal(checklistViewSource.includes(forbidden), false);
  }
  assert.equal(checklistViewSource.includes("OpenAI"), true);
  assert.equal(checklistViewSource.includes("scheduler"), true);
  assert.equal(checklistViewSource.includes("publisher"), true);
  assert.equal(checklistViewSource.includes("upload"), true);

  const reportRuntimeSource = [
    "apps/web/src/manual-publish-report-service.ts",
    "apps/web/src/routes/manual-publish-report-api-routes.ts",
    "apps/web/src/routes/manual-publish-report-page-routes.ts",
    "apps/web/src/validation/manual-publish-report-validation.ts"
  ].map((path) => readFileSync(path, "utf8")).join("\n");
  for (const forbidden of ["INSERT INTO", "UPDATE ", "DELETE FROM", "DROP", "TRUNCATE", "ALTER TABLE", "exec(", "execFile", "shell:", "rm(", "unlink", "rename", "copyFile", "writeFile", "appendFile", "createWriteStream", "mkdir", "createReadStream", "storage/approved-videos", "storage/draft-videos", "storage/footage", "workers/video", "OpenAI", "openai", "scheduler", "publisher", "upload", "graph.facebook", "facebook.com", "googleapis", "axios", "fetch("]) {
    assert.equal(reportRuntimeSource.includes(forbidden), false);
  }
  assert.equal(reportRuntimeSource.includes("SELECT"), true);

  const reportViewSource = readFileSync("apps/web/src/views/manual-publish-report-pages.ts", "utf8");
  for (const forbidden of ["INSERT INTO", "UPDATE ", "DELETE FROM", "DROP", "TRUNCATE", "ALTER TABLE", "exec(", "execFile", "shell:", "rm(", "unlink", "rename", "copyFile", "writeFile", "appendFile", "createWriteStream", "mkdir", "createReadStream", "storage/approved-videos", "storage/draft-videos", "storage/footage", "workers/video", "graph.facebook", "facebook.com", "googleapis", "axios", "fetch("]) {
    assert.equal(reportViewSource.includes(forbidden), false);
  }
  assert.equal(reportViewSource.includes("OpenAI"), true);
  assert.equal(reportViewSource.includes("scheduler"), true);
  assert.equal(reportViewSource.includes("publisher"), true);
  assert.equal(reportViewSource.includes("upload"), true);

  const closeoutRuntimeSource = [
    "apps/web/src/manual-publish-closeout-service.ts",
    "apps/web/src/routes/manual-publish-closeout-api-routes.ts",
    "apps/web/src/routes/manual-publish-closeout-page-routes.ts",
    "apps/web/src/validation/manual-publish-closeout-validation.ts"
  ].map((path) => readFileSync(path, "utf8")).join("\n");
  for (const forbidden of ["UPDATE ", "DELETE FROM", "DROP", "TRUNCATE", "ALTER TABLE", "exec(", "execFile", "shell:", "rm(", "unlink", "rename", "copyFile", "writeFile", "appendFile", "createWriteStream", "mkdir", "createReadStream", "storage/approved-videos", "storage/draft-videos", "storage/footage", "workers/video", "OpenAI", "openai", "scheduler", "publisher", "upload", "queue", "worker daemon", "graph.facebook", "facebook.com", "googleapis", "axios", "fetch("]) {
    assert.equal(closeoutRuntimeSource.includes(forbidden), false);
  }
  assert.equal(closeoutRuntimeSource.includes("INSERT INTO manual_publish_closeouts"), true);

  const closeoutViewSource = readFileSync("apps/web/src/views/manual-publish-closeout-pages.ts", "utf8");
  for (const forbidden of ["INSERT INTO", "UPDATE ", "DELETE FROM", "DROP", "TRUNCATE", "ALTER TABLE", "exec(", "execFile", "shell:", "rm(", "unlink", "rename", "copyFile", "writeFile", "appendFile", "createWriteStream", "mkdir", "createReadStream", "storage/approved-videos", "storage/draft-videos", "storage/footage", "workers/video", "graph.facebook", "facebook.com", "googleapis", "axios", "fetch("]) {
    assert.equal(closeoutViewSource.includes(forbidden), false);
  }
  assert.equal(closeoutViewSource.includes("OpenAI"), true);
  assert.equal(closeoutViewSource.includes("scheduler"), true);
  assert.equal(closeoutViewSource.includes("publisher"), true);
  assert.equal(closeoutViewSource.includes("publish"), true);
  assert.equal(closeoutViewSource.includes("upload"), true);

  const operationalRuntimeSource = [
    "apps/web/src/operational-readiness-service.ts",
    "apps/web/src/routes/operational-readiness-api-routes.ts",
    "apps/web/src/routes/operational-readiness-page-routes.ts",
    "apps/web/src/validation/operational-readiness-validation.ts",
    "apps/web/src/operational-readiness-errors.ts"
  ].map((path) => readFileSync(path, "utf8")).join("\n");
  for (const forbidden of ["INSERT INTO", "UPDATE ", "DELETE FROM", "DROP", "TRUNCATE", "ALTER TABLE", "exec(", "execFile", "shell:", "rm(", "unlink", "rename", "copyFile", "writeFile", "appendFile", "createWriteStream", "createReadStream", "mkdir", "storage/approved-videos", "storage/draft-videos", "storage/footage", "workers/video", "queue", "worker daemon", "graph.facebook", "facebook.com", "googleapis", "axios", "fetch("]) {
    assert.equal(operationalRuntimeSource.includes(forbidden), false);
  }
  assert.equal(operationalRuntimeSource.includes("SELECT"), true);
  assert.equal(operationalRuntimeSource.includes("OpenAI"), true);
  assert.equal(operationalRuntimeSource.includes("upload"), true);

  const operationalViewSource = readFileSync("apps/web/src/views/operational-readiness-pages.ts", "utf8");
  for (const forbidden of ["INSERT INTO", "UPDATE ", "DELETE FROM", "DROP", "TRUNCATE", "ALTER TABLE", "exec(", "execFile", "shell:", "rm(", "unlink", "rename", "copyFile", "writeFile", "appendFile", "createWriteStream", "createReadStream", "mkdir", "storage/approved-videos", "storage/draft-videos", "storage/footage", "workers/video", "graph.facebook", "facebook.com", "googleapis", "axios", "fetch("]) {
    assert.equal(operationalViewSource.includes(forbidden), false);
  }
  assert.equal(operationalViewSource.includes("OpenAI"), false);
  assert.equal(operationalViewSource.includes("upload"), false);
});
