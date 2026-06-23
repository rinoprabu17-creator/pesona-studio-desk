import { query, withTransaction } from "./db.ts";
import type { DatabaseClient } from "./db.ts";
import { ContentItemScriptPlanError } from "./content-item-script-plan-errors.ts";
import { assertUuid } from "./validation/library-validation.ts";
import {
  validateScriptPlanInput,
  validateShotPlanStepInput
} from "./validation/content-item-script-plan-validation.ts";
import type {
  ContentItemScriptPlanInput,
  ShotPlanStepInput
} from "./validation/content-item-script-plan-validation.ts";

export type ContentItemScriptPlanRow = {
  id: string;
  content_item_id: string;
  plan_status: string;
  video_format: string;
  hook_text: string | null;
  main_message: string | null;
  cta_text: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ShotPlanStepRow = {
  id: string;
  script_plan_id: string;
  content_item_id: string;
  content_item_footage_selection_id: string | null;
  sequence_number: number;
  step_type: string;
  visual_note: string | null;
  narration_text: string | null;
  overlay_text: string | null;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
  footage_selection_sequence_number: number | null;
  footage_selection_role: string | null;
  footage_relative_path: string | null;
  footage_filename: string | null;
  footage_status: string | null;
};

const scriptPlanSelect = `
  SELECT id,
         content_item_id,
         plan_status,
         video_format,
         hook_text,
         main_message,
         cta_text,
         notes,
         created_at,
         updated_at
  FROM content_item_script_plans
`;

const shotPlanStepSelect = `
  SELECT step.id,
         step.script_plan_id,
         plan.content_item_id,
         step.content_item_footage_selection_id,
         step.sequence_number,
         step.step_type,
         step.visual_note,
         step.narration_text,
         step.overlay_text,
         step.duration_seconds,
         step.created_at,
         step.updated_at,
         selection.sequence_number AS footage_selection_sequence_number,
         selection.role AS footage_selection_role,
         footage.relative_path AS footage_relative_path,
         footage.filename AS footage_filename,
         footage.status AS footage_status
  FROM content_item_shot_plan_steps step
  JOIN content_item_script_plans plan ON plan.id = step.script_plan_id
  LEFT JOIN content_item_footage_selections selection ON selection.id = step.content_item_footage_selection_id
  LEFT JOIN footage_assets footage ON footage.id = selection.footage_asset_id
`;

function mapShotPlanStep(row: ShotPlanStepRow): ShotPlanStepRow {
  return {
    ...row,
    sequence_number: Number(row.sequence_number),
    duration_seconds: row.duration_seconds === null ? null : Number(row.duration_seconds),
    footage_selection_sequence_number: row.footage_selection_sequence_number === null ? null : Number(row.footage_selection_sequence_number)
  };
}

async function assertContentItemExists(contentItemId: string, client?: DatabaseClient): Promise<void> {
  const result = client
    ? await client.query<{ id: string }>(`SELECT id FROM content_items WHERE id = $1`, [contentItemId])
    : { rows: await query<{ id: string }>(`SELECT id FROM content_items WHERE id = $1`, [contentItemId]) };
  if (!result.rows[0]) {
    throw new ContentItemScriptPlanError("content_item_not_found", "Content item tidak ditemukan.", 404);
  }
}

async function getPlanContentItemId(planId: string, client?: DatabaseClient): Promise<string> {
  const result = client
    ? await client.query<{ content_item_id: string }>(`SELECT content_item_id FROM content_item_script_plans WHERE id = $1`, [planId])
    : { rows: await query<{ content_item_id: string }>(`SELECT content_item_id FROM content_item_script_plans WHERE id = $1`, [planId]) };
  if (!result.rows[0]) {
    throw new ContentItemScriptPlanError("script_plan_not_found", "Script plan tidak ditemukan.", 404);
  }
  return result.rows[0].content_item_id;
}

async function assertFootageSelectionBelongsToContentItem(
  contentItemId: string,
  selectionId: string | null,
  client?: DatabaseClient
): Promise<void> {
  if (!selectionId) return;
  const result = client
    ? await client.query<{ content_item_id: string }>(`SELECT content_item_id FROM content_item_footage_selections WHERE id = $1`, [selectionId])
    : { rows: await query<{ content_item_id: string }>(`SELECT content_item_id FROM content_item_footage_selections WHERE id = $1`, [selectionId]) };
  if (!result.rows[0]) {
    throw new ContentItemScriptPlanError("footage_selection_not_found", "Pilihan footage tidak ditemukan.", 404);
  }
  if (result.rows[0].content_item_id !== contentItemId) {
    throw new ContentItemScriptPlanError("footage_selection_mismatch", "Pilihan footage tidak dimiliki konten script plan ini.", 400);
  }
}

async function assertStepBelongsToPlan(planId: string, stepId: string): Promise<void> {
  assertUuid(planId);
  assertUuid(stepId);
  const rows = await query<{ script_plan_id: string }>(
    `SELECT script_plan_id FROM content_item_shot_plan_steps WHERE id = $1`,
    [stepId]
  );
  if (!rows[0]) {
    throw new ContentItemScriptPlanError("shot_plan_step_not_found", "Shot plan step tidak ditemukan.", 404);
  }
  if (rows[0].script_plan_id !== planId) {
    throw new ContentItemScriptPlanError("shot_plan_step_mismatch", "Shot plan step tidak dimiliki script plan ini.", 404);
  }
}

function handleWriteError(error: any): never {
  if (error?.code === "23505") {
    if (error.constraint === "content_item_script_plans_content_item_key") {
      throw new ContentItemScriptPlanError("duplicate_script_plan", "Script plan untuk konten ini sudah ada.", 409);
    }
    if (error.constraint === "content_item_shot_plan_steps_plan_sequence_key") {
      throw new ContentItemScriptPlanError("duplicate_shot_plan_sequence", "Urutan shot plan sudah dipakai.", 409);
    }
  }
  throw error;
}

export async function getContentItemScriptPlan(contentItemId: string): Promise<ContentItemScriptPlanRow | null> {
  assertUuid(contentItemId);
  await assertContentItemExists(contentItemId);
  const rows = await query<ContentItemScriptPlanRow>(
    `${scriptPlanSelect}
     WHERE content_item_id = $1`,
    [contentItemId]
  );
  return rows[0] || null;
}

export async function getScriptPlanById(planId: string): Promise<ContentItemScriptPlanRow> {
  assertUuid(planId);
  const rows = await query<ContentItemScriptPlanRow>(
    `${scriptPlanSelect}
     WHERE id = $1`,
    [planId]
  );
  if (!rows[0]) {
    throw new ContentItemScriptPlanError("script_plan_not_found", "Script plan tidak ditemukan.", 404);
  }
  return rows[0];
}

export async function getOrCreateContentItemScriptPlan(
  contentItemId: string,
  input: ContentItemScriptPlanInput = {}
): Promise<ContentItemScriptPlanRow> {
  assertUuid(contentItemId);
  const value = validateScriptPlanInput(input);

  try {
    const planId = await withTransaction(async (client) => {
      await assertContentItemExists(contentItemId, client);
      const existing = await client.query<{ id: string }>(
        `SELECT id FROM content_item_script_plans WHERE content_item_id = $1 FOR UPDATE`,
        [contentItemId]
      );
      if (existing.rows[0]) {
        return existing.rows[0].id;
      }
      const created = await client.query<{ id: string }>(
        `INSERT INTO content_item_script_plans (
           content_item_id, plan_status, video_format, hook_text, main_message, cta_text, notes
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [contentItemId, value.plan_status, value.video_format, value.hook_text, value.main_message, value.cta_text, value.notes]
      );
      return created.rows[0].id;
    });
    return getScriptPlanById(planId);
  } catch (error: any) {
    handleWriteError(error);
  }
}

export async function updateContentItemScriptPlan(
  planId: string,
  input: ContentItemScriptPlanInput
): Promise<ContentItemScriptPlanRow> {
  assertUuid(planId);
  const value = validateScriptPlanInput(input);

  const rows = await query<{ id: string }>(
    `UPDATE content_item_script_plans
     SET plan_status = $2,
         video_format = $3,
         hook_text = $4,
         main_message = $5,
         cta_text = $6,
         notes = $7,
         updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [planId, value.plan_status, value.video_format, value.hook_text, value.main_message, value.cta_text, value.notes]
  );
  if (!rows[0]) {
    throw new ContentItemScriptPlanError("script_plan_not_found", "Script plan tidak ditemukan.", 404);
  }
  return getScriptPlanById(rows[0].id);
}

export async function listShotPlanSteps(planId: string): Promise<ShotPlanStepRow[]> {
  assertUuid(planId);
  await getPlanContentItemId(planId);
  const rows = await query<ShotPlanStepRow>(
    `${shotPlanStepSelect}
     WHERE step.script_plan_id = $1
     ORDER BY step.sequence_number ASC, step.created_at ASC`,
    [planId]
  );
  return rows.map(mapShotPlanStep);
}

export async function getShotPlanStep(stepId: string): Promise<ShotPlanStepRow> {
  assertUuid(stepId);
  const rows = await query<ShotPlanStepRow>(
    `${shotPlanStepSelect}
     WHERE step.id = $1`,
    [stepId]
  );
  if (!rows[0]) {
    throw new ContentItemScriptPlanError("shot_plan_step_not_found", "Shot plan step tidak ditemukan.", 404);
  }
  return mapShotPlanStep(rows[0]);
}

export async function addShotPlanStep(planId: string, input: ShotPlanStepInput): Promise<ShotPlanStepRow> {
  assertUuid(planId);
  const value = validateShotPlanStepInput(input);

  try {
    const stepId = await withTransaction(async (client) => {
      const contentItemId = await getPlanContentItemId(planId, client);
      await assertFootageSelectionBelongsToContentItem(contentItemId, value.content_item_footage_selection_id, client);
      const result = await client.query<{ id: string }>(
        `INSERT INTO content_item_shot_plan_steps (
           script_plan_id,
           content_item_footage_selection_id,
           sequence_number,
           step_type,
           visual_note,
           narration_text,
           overlay_text,
           duration_seconds
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          planId,
          value.content_item_footage_selection_id,
          value.sequence_number,
          value.step_type,
          value.visual_note,
          value.narration_text,
          value.overlay_text,
          value.duration_seconds
        ]
      );
      return result.rows[0].id;
    });
    return getShotPlanStep(stepId);
  } catch (error: any) {
    handleWriteError(error);
  }
}

export async function updateShotPlanStep(stepId: string, input: ShotPlanStepInput): Promise<ShotPlanStepRow> {
  assertUuid(stepId);
  const value = validateShotPlanStepInput(input);

  try {
    const updatedId = await withTransaction(async (client) => {
      const existing = await client.query<{ script_plan_id: string }>(
        `SELECT script_plan_id FROM content_item_shot_plan_steps WHERE id = $1 FOR UPDATE`,
        [stepId]
      );
      if (!existing.rows[0]) {
        throw new ContentItemScriptPlanError("shot_plan_step_not_found", "Shot plan step tidak ditemukan.", 404);
      }
      const contentItemId = await getPlanContentItemId(existing.rows[0].script_plan_id, client);
      await assertFootageSelectionBelongsToContentItem(contentItemId, value.content_item_footage_selection_id, client);
      const result = await client.query<{ id: string }>(
        `UPDATE content_item_shot_plan_steps
         SET content_item_footage_selection_id = $2,
             sequence_number = $3,
             step_type = $4,
             visual_note = $5,
             narration_text = $6,
             overlay_text = $7,
             duration_seconds = $8,
             updated_at = now()
         WHERE id = $1
         RETURNING id`,
        [
          stepId,
          value.content_item_footage_selection_id,
          value.sequence_number,
          value.step_type,
          value.visual_note,
          value.narration_text,
          value.overlay_text,
          value.duration_seconds
        ]
      );
      return result.rows[0].id;
    });
    return getShotPlanStep(updatedId);
  } catch (error: any) {
    handleWriteError(error);
  }
}

export async function updateShotPlanStepForPlan(
  planId: string,
  stepId: string,
  input: ShotPlanStepInput
): Promise<ShotPlanStepRow> {
  await assertStepBelongsToPlan(planId, stepId);
  return updateShotPlanStep(stepId, input);
}

export async function removeShotPlanStep(stepId: string): Promise<{ removed: true; id: string }> {
  assertUuid(stepId);
  const rows = await query<{ id: string }>(
    `DELETE FROM content_item_shot_plan_steps
     WHERE id = $1
     RETURNING id`,
    [stepId]
  );
  if (!rows[0]) {
    throw new ContentItemScriptPlanError("shot_plan_step_not_found", "Shot plan step tidak ditemukan.", 404);
  }
  return { removed: true, id: rows[0].id };
}

export async function removeShotPlanStepForPlan(planId: string, stepId: string): Promise<{ removed: true; id: string }> {
  await assertStepBelongsToPlan(planId, stepId);
  return removeShotPlanStep(stepId);
}
