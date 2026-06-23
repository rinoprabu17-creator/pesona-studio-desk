import { query, withTransaction } from "./db.ts";
import type { DatabaseClient } from "./db.ts";
import { VideoDraftJobError } from "./video-draft-job-errors.ts";
import { assertUuid } from "./validation/library-validation.ts";
import { validateVideoDraftJobInput } from "./validation/video-draft-job-validation.ts";
import type { VideoDraftJobInput } from "./validation/video-draft-job-validation.ts";

export type VideoDraftJobRow = {
  id: string;
  content_item_id: string;
  script_plan_id: string;
  job_status: string;
  target_format: string;
  render_mode: string;
  duration_target_seconds: number | null;
  planned_output_label: string | null;
  request_notes: string | null;
  blocking_reason: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
  content_code: string;
  content_title: string;
  script_plan_status: string;
  script_video_format: string;
};

export type VideoDraftReadiness = {
  content_item_id: string;
  script_plan_id: string | null;
  has_script_plan: boolean;
  shot_step_count: number;
  selected_footage_count: number;
  steps_with_selected_footage_count: number;
  is_ready_for_future_render: boolean;
  readiness_warnings: string[];
};

export type VideoDraftJobContext = {
  readiness: VideoDraftReadiness;
  job: VideoDraftJobRow | null;
};

const videoDraftJobSelect = `
  SELECT job.id,
         job.content_item_id,
         job.script_plan_id,
         job.job_status,
         job.target_format,
         job.render_mode,
         job.duration_target_seconds,
         job.planned_output_label,
         job.request_notes,
         job.blocking_reason,
         job.review_notes,
         job.created_at,
         job.updated_at,
         item.content_code,
         item.title AS content_title,
         plan.plan_status AS script_plan_status,
         plan.video_format AS script_video_format
  FROM video_draft_jobs job
  JOIN content_items item ON item.id = job.content_item_id
  JOIN content_item_script_plans plan ON plan.id = job.script_plan_id
`;

function mapJob(row: VideoDraftJobRow): VideoDraftJobRow {
  return {
    ...row,
    duration_target_seconds: row.duration_target_seconds === null ? null : Number(row.duration_target_seconds)
  };
}

async function assertContentItemExists(contentItemId: string, client?: DatabaseClient): Promise<void> {
  const result = client
    ? await client.query<{ id: string }>(`SELECT id FROM content_items WHERE id = $1`, [contentItemId])
    : { rows: await query<{ id: string }>(`SELECT id FROM content_items WHERE id = $1`, [contentItemId]) };
  if (!result.rows[0]) {
    throw new VideoDraftJobError("content_item_not_found", "Content item tidak ditemukan.", 404);
  }
}

async function getScriptPlanForContentItem(contentItemId: string, client?: DatabaseClient): Promise<{ id: string } | null> {
  const result = client
    ? await client.query<{ id: string }>(`SELECT id FROM content_item_script_plans WHERE content_item_id = $1`, [contentItemId])
    : { rows: await query<{ id: string }>(`SELECT id FROM content_item_script_plans WHERE content_item_id = $1`, [contentItemId]) };
  return result.rows[0] || null;
}

async function assertScriptPlanBelongsToContentItem(
  contentItemId: string,
  scriptPlanId: string,
  client?: DatabaseClient
): Promise<void> {
  const result = client
    ? await client.query<{ content_item_id: string }>(`SELECT content_item_id FROM content_item_script_plans WHERE id = $1`, [scriptPlanId])
    : { rows: await query<{ content_item_id: string }>(`SELECT content_item_id FROM content_item_script_plans WHERE id = $1`, [scriptPlanId]) };
  if (!result.rows[0]) {
    throw new VideoDraftJobError("script_plan_not_found", "Script plan tidak ditemukan. Buat Script/Shot Plan terlebih dahulu.", 404);
  }
  if (result.rows[0].content_item_id !== contentItemId) {
    throw new VideoDraftJobError("script_plan_mismatch", "Script plan tidak dimiliki konten ini.", 400);
  }
}

async function assertJobBelongsToContentItem(contentItemId: string, jobId: string): Promise<void> {
  assertUuid(contentItemId);
  assertUuid(jobId);
  await assertContentItemExists(contentItemId);
  const rows = await query<{ content_item_id: string }>(
    `SELECT content_item_id FROM video_draft_jobs WHERE id = $1`,
    [jobId]
  );
  if (!rows[0]) {
    throw new VideoDraftJobError("video_draft_job_not_found", "Video draft job tidak ditemukan.", 404);
  }
  if (rows[0].content_item_id !== contentItemId) {
    throw new VideoDraftJobError("video_draft_job_mismatch", "Video draft job tidak dimiliki konten ini.", 404);
  }
}

function handleWriteError(error: any): never {
  if (error?.code === "23505" && error.constraint === "video_draft_jobs_script_plan_key") {
    throw new VideoDraftJobError("duplicate_video_draft_job", "Video draft job untuk script plan ini sudah ada.", 409);
  }
  throw error;
}

export async function getVideoDraftReadinessForContentItem(contentItemId: string): Promise<VideoDraftReadiness> {
  assertUuid(contentItemId);
  await assertContentItemExists(contentItemId);

  const plan = await getScriptPlanForContentItem(contentItemId);
  if (!plan) {
    return {
      content_item_id: contentItemId,
      script_plan_id: null,
      has_script_plan: false,
      shot_step_count: 0,
      selected_footage_count: 0,
      steps_with_selected_footage_count: 0,
      is_ready_for_future_render: false,
      readiness_warnings: ["Script/Shot Plan belum dibuat."]
    };
  }

  const [shotRows, selectedRows, stepsWithFootageRows] = await Promise.all([
    query<{ count: string }>(`SELECT COUNT(*)::int AS count FROM content_item_shot_plan_steps WHERE script_plan_id = $1`, [plan.id]),
    query<{ count: string }>(`SELECT COUNT(*)::int AS count FROM content_item_footage_selections WHERE content_item_id = $1`, [contentItemId]),
    query<{ count: string }>(
      `SELECT COUNT(*)::int AS count
       FROM content_item_shot_plan_steps
       WHERE script_plan_id = $1
         AND content_item_footage_selection_id IS NOT NULL`,
      [plan.id]
    )
  ]);

  const shotStepCount = Number(shotRows[0]?.count || 0);
  const selectedFootageCount = Number(selectedRows[0]?.count || 0);
  const stepsWithSelectedFootageCount = Number(stepsWithFootageRows[0]?.count || 0);
  const warnings: string[] = [];
  if (shotStepCount === 0) warnings.push("Shot plan step belum ada.");
  if (selectedFootageCount === 0) warnings.push("Footage terpilih belum ada.");
  if (shotStepCount > stepsWithSelectedFootageCount) {
    warnings.push("Sebagian shot plan step belum memakai footage terpilih.");
  }

  return {
    content_item_id: contentItemId,
    script_plan_id: plan.id,
    has_script_plan: true,
    shot_step_count: shotStepCount,
    selected_footage_count: selectedFootageCount,
    steps_with_selected_footage_count: stepsWithSelectedFootageCount,
    is_ready_for_future_render: shotStepCount > 0 && selectedFootageCount > 0,
    readiness_warnings: warnings
  };
}

export async function getVideoDraftJobById(jobId: string): Promise<VideoDraftJobRow> {
  assertUuid(jobId);
  const rows = await query<VideoDraftJobRow>(
    `${videoDraftJobSelect}
     WHERE job.id = $1`,
    [jobId]
  );
  if (!rows[0]) {
    throw new VideoDraftJobError("video_draft_job_not_found", "Video draft job tidak ditemukan.", 404);
  }
  return mapJob(rows[0]);
}

export async function getVideoDraftJobForContentItem(contentItemId: string): Promise<VideoDraftJobContext> {
  const readiness = await getVideoDraftReadinessForContentItem(contentItemId);
  const rows = await query<VideoDraftJobRow>(
    `${videoDraftJobSelect}
     WHERE job.content_item_id = $1`,
    [contentItemId]
  );
  return { readiness, job: rows[0] ? mapJob(rows[0]) : null };
}

export async function createVideoDraftJobForContentItem(
  contentItemId: string,
  input: VideoDraftJobInput
): Promise<VideoDraftJobRow> {
  assertUuid(contentItemId);
  const value = validateVideoDraftJobInput(input);

  try {
    const jobId = await withTransaction(async (client) => {
      await assertContentItemExists(contentItemId, client);
      const scriptPlanId = value.script_plan_id || (await getScriptPlanForContentItem(contentItemId, client))?.id;
      if (!scriptPlanId) {
        throw new VideoDraftJobError("script_plan_required", "Buat Script/Shot Plan terlebih dahulu sebelum request video draft job.", 400);
      }
      await assertScriptPlanBelongsToContentItem(contentItemId, scriptPlanId, client);

      const result = await client.query<{ id: string }>(
        `INSERT INTO video_draft_jobs (
           content_item_id,
           script_plan_id,
           job_status,
           target_format,
           render_mode,
           duration_target_seconds,
           planned_output_label,
           request_notes,
           blocking_reason,
           review_notes
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          contentItemId,
          scriptPlanId,
          value.job_status,
          value.target_format,
          value.render_mode,
          value.duration_target_seconds,
          value.planned_output_label,
          value.request_notes,
          value.blocking_reason,
          value.review_notes
        ]
      );
      return result.rows[0].id;
    });
    return getVideoDraftJobById(jobId);
  } catch (error: any) {
    handleWriteError(error);
  }
}

export async function updateVideoDraftJob(jobId: string, input: VideoDraftJobInput): Promise<VideoDraftJobRow> {
  assertUuid(jobId);
  const value = validateVideoDraftJobInput(input);

  try {
    const updatedId = await withTransaction(async (client) => {
      const existing = await client.query<{ id: string; content_item_id: string; script_plan_id: string }>(
        `SELECT id, content_item_id, script_plan_id FROM video_draft_jobs WHERE id = $1 FOR UPDATE`,
        [jobId]
      );
      if (!existing.rows[0]) {
        throw new VideoDraftJobError("video_draft_job_not_found", "Video draft job tidak ditemukan.", 404);
      }
      const scriptPlanId = value.script_plan_id || existing.rows[0].script_plan_id;
      await assertScriptPlanBelongsToContentItem(existing.rows[0].content_item_id, scriptPlanId, client);

      const result = await client.query<{ id: string }>(
        `UPDATE video_draft_jobs
         SET script_plan_id = $2,
             job_status = $3,
             target_format = $4,
             render_mode = $5,
             duration_target_seconds = $6,
             planned_output_label = $7,
             request_notes = $8,
             blocking_reason = $9,
             review_notes = $10,
             updated_at = now()
         WHERE id = $1
         RETURNING id`,
        [
          jobId,
          scriptPlanId,
          value.job_status,
          value.target_format,
          value.render_mode,
          value.duration_target_seconds,
          value.planned_output_label,
          value.request_notes,
          value.blocking_reason,
          value.review_notes
        ]
      );
      return result.rows[0].id;
    });
    return getVideoDraftJobById(updatedId);
  } catch (error: any) {
    handleWriteError(error);
  }
}

export async function updateVideoDraftJobForContentItem(
  contentItemId: string,
  jobId: string,
  input: VideoDraftJobInput
): Promise<VideoDraftJobRow> {
  await assertJobBelongsToContentItem(contentItemId, jobId);
  return updateVideoDraftJob(jobId, input);
}

export async function cancelVideoDraftJob(jobId: string): Promise<VideoDraftJobRow> {
  assertUuid(jobId);
  const rows = await query<{ id: string }>(
    `UPDATE video_draft_jobs
     SET job_status = 'cancelled',
         updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [jobId]
  );
  if (!rows[0]) {
    throw new VideoDraftJobError("video_draft_job_not_found", "Video draft job tidak ditemukan.", 404);
  }
  return getVideoDraftJobById(rows[0].id);
}

export async function cancelVideoDraftJobForContentItem(contentItemId: string, jobId: string): Promise<VideoDraftJobRow> {
  await assertJobBelongsToContentItem(contentItemId, jobId);
  return cancelVideoDraftJob(jobId);
}
