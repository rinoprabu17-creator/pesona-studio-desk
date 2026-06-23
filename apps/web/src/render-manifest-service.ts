import { query, withTransaction } from "./db.ts";
import type { DatabaseClient } from "./db.ts";
import { RenderManifestError } from "./render-manifest-errors.ts";
import { assertUuid } from "./validation/library-validation.ts";
import { validateRenderManifestInput } from "./validation/render-manifest-validation.ts";
import type { RenderManifestInput } from "./validation/render-manifest-validation.ts";

export type RenderManifestRow = {
  id: string;
  video_draft_job_id: string;
  content_item_id: string;
  script_plan_id: string;
  manifest_status: string;
  manifest_mode: string;
  target_format: string;
  planned_output_label: string | null;
  item_count: number;
  estimated_duration_seconds: number | null;
  selected_footage_count: number;
  missing_footage_step_count: number;
  manifest_warnings: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  job_status: string;
  render_mode: string;
  content_code: string;
  content_title: string;
};

export type RenderManifestItemRow = {
  id: string;
  manifest_id: string;
  shot_plan_step_id: string;
  content_item_footage_selection_id: string | null;
  footage_asset_id: string | null;
  sequence_number: number;
  step_type: string;
  visual_note: string | null;
  narration_text: string | null;
  overlay_text: string | null;
  duration_seconds: number | null;
  source_relative_path_snapshot: string | null;
  source_filename_snapshot: string | null;
  source_file_extension_snapshot: string | null;
  source_size_bytes_snapshot: number | null;
  item_warnings: string | null;
  created_at: string;
  updated_at: string;
};

export type RenderManifestContext = {
  job: {
    id: string;
    content_item_id: string;
    script_plan_id: string;
    job_status: string;
    target_format: string;
    render_mode: string;
    planned_output_label: string | null;
    content_code: string;
    content_title: string;
  } | null;
  manifest: RenderManifestRow | null;
  items: RenderManifestItemRow[];
};

type JobSnapshot = {
  id: string;
  content_item_id: string;
  script_plan_id: string;
  job_status: string;
  target_format: string;
  render_mode: string;
  planned_output_label: string | null;
  content_code: string;
  content_title: string;
  plan_content_item_id: string;
};

type StepSnapshot = {
  id: string;
  script_plan_id: string;
  content_item_footage_selection_id: string | null;
  sequence_number: number;
  step_type: string;
  visual_note: string | null;
  narration_text: string | null;
  overlay_text: string | null;
  duration_seconds: number | null;
  selection_content_item_id: string | null;
  footage_asset_id: string | null;
  relative_path: string | null;
  filename: string | null;
  file_extension: string | null;
  size_bytes: number | null;
};

const manifestSelect = `
  SELECT manifest.id,
         manifest.video_draft_job_id,
         manifest.content_item_id,
         manifest.script_plan_id,
         manifest.manifest_status,
         manifest.manifest_mode,
         manifest.target_format,
         manifest.planned_output_label,
         manifest.item_count,
         manifest.estimated_duration_seconds,
         manifest.selected_footage_count,
         manifest.missing_footage_step_count,
         manifest.manifest_warnings,
         manifest.notes,
         manifest.created_at,
         manifest.updated_at,
         job.job_status,
         job.render_mode,
         item.content_code,
         item.title AS content_title
  FROM video_render_manifests manifest
  JOIN video_draft_jobs job ON job.id = manifest.video_draft_job_id
  JOIN content_items item ON item.id = manifest.content_item_id
`;

const itemSelect = `
  SELECT id,
         manifest_id,
         shot_plan_step_id,
         content_item_footage_selection_id,
         footage_asset_id,
         sequence_number,
         step_type,
         visual_note,
         narration_text,
         overlay_text,
         duration_seconds,
         source_relative_path_snapshot,
         source_filename_snapshot,
         source_file_extension_snapshot,
         source_size_bytes_snapshot,
         item_warnings,
         created_at,
         updated_at
  FROM video_render_manifest_items
`;

function mapManifest(row: RenderManifestRow): RenderManifestRow {
  return {
    ...row,
    item_count: Number(row.item_count),
    estimated_duration_seconds: row.estimated_duration_seconds === null ? null : Number(row.estimated_duration_seconds),
    selected_footage_count: Number(row.selected_footage_count),
    missing_footage_step_count: Number(row.missing_footage_step_count)
  };
}

function mapItem(row: RenderManifestItemRow): RenderManifestItemRow {
  return {
    ...row,
    sequence_number: Number(row.sequence_number),
    duration_seconds: row.duration_seconds === null ? null : Number(row.duration_seconds),
    source_size_bytes_snapshot: row.source_size_bytes_snapshot === null ? null : Number(row.source_size_bytes_snapshot)
  };
}

async function getJobSnapshot(videoDraftJobId: string, client?: DatabaseClient): Promise<JobSnapshot> {
  const result = client
    ? await client.query<JobSnapshot>(
        `SELECT job.id,
                job.content_item_id,
                job.script_plan_id,
                job.job_status,
                job.target_format,
                job.render_mode,
                job.planned_output_label,
                item.content_code,
                item.title AS content_title,
                plan.content_item_id AS plan_content_item_id
         FROM video_draft_jobs job
         JOIN content_items item ON item.id = job.content_item_id
         JOIN content_item_script_plans plan ON plan.id = job.script_plan_id
         WHERE job.id = $1`,
        [videoDraftJobId]
      )
    : {
        rows: await query<JobSnapshot>(
          `SELECT job.id,
                  job.content_item_id,
                  job.script_plan_id,
                  job.job_status,
                  job.target_format,
                  job.render_mode,
                  job.planned_output_label,
                  item.content_code,
                  item.title AS content_title,
                  plan.content_item_id AS plan_content_item_id
           FROM video_draft_jobs job
           JOIN content_items item ON item.id = job.content_item_id
           JOIN content_item_script_plans plan ON plan.id = job.script_plan_id
           WHERE job.id = $1`,
          [videoDraftJobId]
        )
      };
  if (!result.rows[0]) {
    throw new RenderManifestError("video_draft_job_not_found", "Video draft job tidak ditemukan.", 404);
  }
  if (result.rows[0].plan_content_item_id !== result.rows[0].content_item_id) {
    throw new RenderManifestError("script_plan_mismatch", "Script plan video draft job tidak dimiliki konten ini.", 400);
  }
  return result.rows[0];
}

async function assertManifestBelongsToContentItem(contentItemId: string, jobId: string, manifestId: string): Promise<void> {
  assertUuid(contentItemId);
  assertUuid(jobId);
  assertUuid(manifestId);
  const rows = await query<{ id: string }>(
    `SELECT id
     FROM video_render_manifests
     WHERE id = $1
       AND video_draft_job_id = $2
       AND content_item_id = $3`,
    [manifestId, jobId, contentItemId]
  );
  if (!rows[0]) {
    throw new RenderManifestError("render_manifest_mismatch", "Render manifest tidak dimiliki konten dan video draft job ini.", 404);
  }
}

function handleWriteError(error: any): never {
  if (error?.code === "23505" && error.constraint === "video_render_manifests_job_key") {
    throw new RenderManifestError("duplicate_render_manifest", "Render manifest untuk video draft job ini sudah ada.", 409);
  }
  throw error;
}

export async function getRenderManifestById(manifestId: string): Promise<RenderManifestRow> {
  assertUuid(manifestId);
  const rows = await query<RenderManifestRow>(
    `${manifestSelect}
     WHERE manifest.id = $1`,
    [manifestId]
  );
  if (!rows[0]) {
    throw new RenderManifestError("render_manifest_not_found", "Render manifest tidak ditemukan.", 404);
  }
  return mapManifest(rows[0]);
}

export async function getRenderManifestForVideoDraftJob(videoDraftJobId: string): Promise<RenderManifestRow | null> {
  assertUuid(videoDraftJobId);
  await getJobSnapshot(videoDraftJobId);
  const rows = await query<RenderManifestRow>(
    `${manifestSelect}
     WHERE manifest.video_draft_job_id = $1`,
    [videoDraftJobId]
  );
  return rows[0] ? mapManifest(rows[0]) : null;
}

export async function listRenderManifestItems(manifestId: string): Promise<RenderManifestItemRow[]> {
  assertUuid(manifestId);
  await getRenderManifestById(manifestId);
  const rows = await query<RenderManifestItemRow>(
    `${itemSelect}
     WHERE manifest_id = $1
     ORDER BY sequence_number ASC, created_at ASC`,
    [manifestId]
  );
  return rows.map(mapItem);
}

export async function createRenderManifestForVideoDraftJob(
  videoDraftJobId: string,
  input: RenderManifestInput = {}
): Promise<RenderManifestRow> {
  assertUuid(videoDraftJobId);
  const value = validateRenderManifestInput(input);
  const inputHasTargetFormat =
    typeof input === "object" && input !== null && !Array.isArray(input) && Object.prototype.hasOwnProperty.call(input, "target_format");

  try {
    const manifestId = await withTransaction(async (client) => {
      const job = await getJobSnapshot(videoDraftJobId, client);
      const steps = await client.query<StepSnapshot>(
        `SELECT step.id,
                step.script_plan_id,
                step.content_item_footage_selection_id,
                step.sequence_number,
                step.step_type,
                step.visual_note,
                step.narration_text,
                step.overlay_text,
                step.duration_seconds,
                selection.content_item_id AS selection_content_item_id,
                selection.footage_asset_id,
                footage.relative_path,
                footage.filename,
                footage.file_extension,
                footage.size_bytes
         FROM content_item_shot_plan_steps step
         LEFT JOIN content_item_footage_selections selection ON selection.id = step.content_item_footage_selection_id
         LEFT JOIN footage_assets footage ON footage.id = selection.footage_asset_id
         WHERE step.script_plan_id = $1
         ORDER BY step.sequence_number ASC, step.created_at ASC`,
        [job.script_plan_id]
      );
      if (steps.rows.length === 0) {
        throw new RenderManifestError("shot_steps_required", "Shot plan step wajib ada sebelum membuat render manifest.", 400);
      }

      const itemWarnings = steps.rows.map((step) => {
        if (step.script_plan_id !== job.script_plan_id) {
          throw new RenderManifestError("shot_step_mismatch", "Shot plan step tidak dimiliki script plan video draft job ini.", 400);
        }
        if (step.selection_content_item_id && step.selection_content_item_id !== job.content_item_id) {
          throw new RenderManifestError("footage_selection_mismatch", "Pilihan footage pada shot step tidak dimiliki konten ini.", 400);
        }
        return step.content_item_footage_selection_id ? null : `Step ${step.sequence_number} belum memakai footage terpilih.`;
      });
      const missingCount = itemWarnings.filter(Boolean).length;
      const selectedCount = steps.rows.length - missingCount;
      const durationSum = steps.rows.reduce((total, step) => total + (step.duration_seconds === null ? 0 : Number(step.duration_seconds)), 0);
      const generatedWarnings = itemWarnings.filter(Boolean).join("\n") || null;
      const manifestWarnings = value.manifest_warnings || generatedWarnings;
      const created = await client.query<{ id: string }>(
        `INSERT INTO video_render_manifests (
           video_draft_job_id,
           content_item_id,
           script_plan_id,
           manifest_status,
           manifest_mode,
           target_format,
           planned_output_label,
           item_count,
           estimated_duration_seconds,
           selected_footage_count,
           missing_footage_step_count,
           manifest_warnings,
           notes
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING id`,
        [
          videoDraftJobId,
          job.content_item_id,
          job.script_plan_id,
          value.manifest_status,
          value.manifest_mode,
          inputHasTargetFormat ? value.target_format : job.target_format,
          job.planned_output_label,
          steps.rows.length,
          durationSum > 0 ? durationSum : null,
          selectedCount,
          missingCount,
          manifestWarnings,
          value.notes
        ]
      );
      for (const [index, step] of steps.rows.entries()) {
        await client.query(
          `INSERT INTO video_render_manifest_items (
             manifest_id,
             shot_plan_step_id,
             content_item_footage_selection_id,
             footage_asset_id,
             sequence_number,
             step_type,
             visual_note,
             narration_text,
             overlay_text,
             duration_seconds,
             source_relative_path_snapshot,
             source_filename_snapshot,
             source_file_extension_snapshot,
             source_size_bytes_snapshot,
             item_warnings
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            created.rows[0].id,
            step.id,
            step.content_item_footage_selection_id,
            step.footage_asset_id,
            step.sequence_number,
            step.step_type,
            step.visual_note,
            step.narration_text,
            step.overlay_text,
            step.duration_seconds,
            step.relative_path,
            step.filename,
            step.file_extension,
            step.size_bytes,
            itemWarnings[index]
          ]
        );
      }
      return created.rows[0].id;
    });
    return getRenderManifestById(manifestId);
  } catch (error: any) {
    handleWriteError(error);
  }
}

export async function updateRenderManifest(manifestId: string, input: RenderManifestInput): Promise<RenderManifestRow> {
  assertUuid(manifestId);
  const value = validateRenderManifestInput(input);
  const rows = await query<{ id: string }>(
    `UPDATE video_render_manifests
     SET manifest_status = $2,
         manifest_mode = $3,
         target_format = $4,
         manifest_warnings = $5,
         notes = $6,
         updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [manifestId, value.manifest_status, value.manifest_mode, value.target_format, value.manifest_warnings, value.notes]
  );
  if (!rows[0]) {
    throw new RenderManifestError("render_manifest_not_found", "Render manifest tidak ditemukan.", 404);
  }
  return getRenderManifestById(rows[0].id);
}

export async function updateRenderManifestForContentItem(
  contentItemId: string,
  jobId: string,
  manifestId: string,
  input: RenderManifestInput
): Promise<RenderManifestRow> {
  await assertManifestBelongsToContentItem(contentItemId, jobId, manifestId);
  return updateRenderManifest(manifestId, input);
}

export async function getRenderManifestContextForContentItem(contentItemId: string, jobId: string): Promise<RenderManifestContext> {
  assertUuid(contentItemId);
  assertUuid(jobId);
  const job = await getJobSnapshot(jobId);
  if (job.content_item_id !== contentItemId) {
    throw new RenderManifestError("video_draft_job_mismatch", "Video draft job tidak dimiliki konten ini.", 404);
  }
  const manifest = await getRenderManifestForVideoDraftJob(jobId);
  const items = manifest ? await listRenderManifestItems(manifest.id) : [];
  return {
    job: {
      id: job.id,
      content_item_id: job.content_item_id,
      script_plan_id: job.script_plan_id,
      job_status: job.job_status,
      target_format: job.target_format,
      render_mode: job.render_mode,
      planned_output_label: job.planned_output_label,
      content_code: job.content_code,
      content_title: job.content_title
    },
    manifest,
    items
  };
}
