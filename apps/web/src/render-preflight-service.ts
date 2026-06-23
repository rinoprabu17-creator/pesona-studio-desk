import { query, withTransaction } from "./db.ts";
import type { DatabaseClient } from "./db.ts";
import { RenderPreflightError } from "./render-preflight-errors.ts";
import { assertUuid } from "./validation/library-validation.ts";

export type RenderPreflightRunRow = {
  id: string;
  render_manifest_id: string;
  video_draft_job_id: string;
  content_item_id: string;
  run_status: string;
  preflight_result: string;
  check_count: number;
  blocking_check_count: number;
  warning_check_count: number;
  summary: string | null;
  created_at: string;
  updated_at: string;
};

export type RenderPreflightCheckRow = {
  id: string;
  preflight_run_id: string;
  render_manifest_item_id: string | null;
  check_code: string;
  check_level: string;
  check_status: string;
  message: string;
  created_at: string;
};

export type RenderPreflightContext = {
  manifest: PreflightManifestSnapshot;
  items: PreflightItemSnapshot[];
  latestRun: RenderPreflightRunRow | null;
  latestChecks: RenderPreflightCheckRow[];
  runs: RenderPreflightRunRow[];
};

type PreflightManifestSnapshot = {
  id: string;
  video_draft_job_id: string;
  content_item_id: string;
  script_plan_id: string;
  manifest_status: string;
  manifest_mode: string;
  target_format: string;
  item_count: number;
  estimated_duration_seconds: number | null;
  selected_footage_count: number;
  missing_footage_step_count: number;
  manifest_warnings: string | null;
  job_status: string;
  render_mode: string;
  content_code: string;
  content_title: string;
};

export type PreflightItemSnapshot = {
  id: string;
  manifest_id: string;
  sequence_number: number;
  step_type: string;
  duration_seconds: number | null;
  content_item_footage_selection_id: string | null;
  footage_asset_id: string | null;
  source_relative_path_snapshot: string | null;
  source_filename_snapshot: string | null;
  source_file_extension_snapshot: string | null;
  source_size_bytes_snapshot: number | null;
  item_warnings: string | null;
};

export type GeneratedPreflightCheck = {
  render_manifest_item_id: string | null;
  check_code: string;
  check_level: "info" | "warning" | "blocking";
  check_status: "pass" | "fail";
  message: string;
};

const runSelect = `
  SELECT id,
         render_manifest_id,
         video_draft_job_id,
         content_item_id,
         run_status,
         preflight_result,
         check_count,
         blocking_check_count,
         warning_check_count,
         summary,
         created_at,
         updated_at
  FROM video_render_preflight_runs
`;

const checkSelect = `
  SELECT id,
         preflight_run_id,
         render_manifest_item_id,
         check_code,
         check_level,
         check_status,
         message,
         created_at
  FROM video_render_preflight_checks
`;

function mapRun(row: RenderPreflightRunRow): RenderPreflightRunRow {
  return {
    ...row,
    check_count: Number(row.check_count),
    blocking_check_count: Number(row.blocking_check_count),
    warning_check_count: Number(row.warning_check_count)
  };
}

function mapItem(row: PreflightItemSnapshot): PreflightItemSnapshot {
  return {
    ...row,
    sequence_number: Number(row.sequence_number),
    duration_seconds: row.duration_seconds === null ? null : Number(row.duration_seconds),
    source_size_bytes_snapshot: row.source_size_bytes_snapshot === null ? null : Number(row.source_size_bytes_snapshot)
  };
}

async function getManifestSnapshot(manifestId: string, client?: DatabaseClient): Promise<PreflightManifestSnapshot> {
  const result = client
    ? await client.query<PreflightManifestSnapshot>(
        `SELECT manifest.id,
                manifest.video_draft_job_id,
                manifest.content_item_id,
                manifest.script_plan_id,
                manifest.manifest_status,
                manifest.manifest_mode,
                manifest.target_format,
                manifest.item_count,
                manifest.estimated_duration_seconds,
                manifest.selected_footage_count,
                manifest.missing_footage_step_count,
                manifest.manifest_warnings,
                job.job_status,
                job.render_mode,
                item.content_code,
                item.title AS content_title
         FROM video_render_manifests manifest
         JOIN video_draft_jobs job ON job.id = manifest.video_draft_job_id
         JOIN content_items item ON item.id = manifest.content_item_id
         JOIN content_item_script_plans plan ON plan.id = manifest.script_plan_id
         WHERE manifest.id = $1
           AND job.content_item_id = manifest.content_item_id
           AND job.script_plan_id = manifest.script_plan_id
           AND plan.content_item_id = manifest.content_item_id`,
        [manifestId]
      )
    : {
        rows: await query<PreflightManifestSnapshot>(
          `SELECT manifest.id,
                  manifest.video_draft_job_id,
                  manifest.content_item_id,
                  manifest.script_plan_id,
                  manifest.manifest_status,
                  manifest.manifest_mode,
                  manifest.target_format,
                  manifest.item_count,
                  manifest.estimated_duration_seconds,
                  manifest.selected_footage_count,
                  manifest.missing_footage_step_count,
                  manifest.manifest_warnings,
                  job.job_status,
                  job.render_mode,
                  item.content_code,
                  item.title AS content_title
           FROM video_render_manifests manifest
           JOIN video_draft_jobs job ON job.id = manifest.video_draft_job_id
           JOIN content_items item ON item.id = manifest.content_item_id
           JOIN content_item_script_plans plan ON plan.id = manifest.script_plan_id
           WHERE manifest.id = $1
             AND job.content_item_id = manifest.content_item_id
             AND job.script_plan_id = manifest.script_plan_id
             AND plan.content_item_id = manifest.content_item_id`,
          [manifestId]
        )
      };
  if (!result.rows[0]) {
    throw new RenderPreflightError("render_manifest_not_found", "Render manifest tidak ditemukan atau relasi job/script tidak konsisten.", 404);
  }
  const row = result.rows[0];
  return {
    ...row,
    item_count: Number(row.item_count),
    estimated_duration_seconds: row.estimated_duration_seconds === null ? null : Number(row.estimated_duration_seconds),
    selected_footage_count: Number(row.selected_footage_count),
    missing_footage_step_count: Number(row.missing_footage_step_count)
  };
}

async function listManifestItems(manifestId: string, client?: DatabaseClient): Promise<PreflightItemSnapshot[]> {
  const result = client
    ? await client.query<PreflightItemSnapshot>(
        `SELECT id,
                manifest_id,
                sequence_number,
                step_type,
                duration_seconds,
                content_item_footage_selection_id,
                footage_asset_id,
                source_relative_path_snapshot,
                source_filename_snapshot,
                source_file_extension_snapshot,
                source_size_bytes_snapshot,
                item_warnings
         FROM video_render_manifest_items
         WHERE manifest_id = $1
         ORDER BY sequence_number ASC, created_at ASC`,
        [manifestId]
      )
    : {
        rows: await query<PreflightItemSnapshot>(
          `SELECT id,
                  manifest_id,
                  sequence_number,
                  step_type,
                  duration_seconds,
                  content_item_footage_selection_id,
                  footage_asset_id,
                  source_relative_path_snapshot,
                  source_filename_snapshot,
                  source_file_extension_snapshot,
                  source_size_bytes_snapshot,
                  item_warnings
           FROM video_render_manifest_items
           WHERE manifest_id = $1
           ORDER BY sequence_number ASC, created_at ASC`,
          [manifestId]
        )
      };
  return result.rows.map(mapItem);
}

function isSafeRelativePath(value: string | null): boolean {
  if (!value) return true;
  return !value.startsWith("/") && !value.includes("\\") && !/(^|\/)\.\.($|\/)/.test(value);
}

function makeCheck(
  check_code: string,
  check_level: GeneratedPreflightCheck["check_level"],
  check_status: GeneratedPreflightCheck["check_status"],
  message: string,
  render_manifest_item_id: string | null = null
): GeneratedPreflightCheck {
  return { render_manifest_item_id, check_code, check_level, check_status, message };
}

export function buildRenderPreflightChecks(manifest: PreflightManifestSnapshot, items: PreflightItemSnapshot[]): GeneratedPreflightCheck[] {
  const checks: GeneratedPreflightCheck[] = [];
  checks.push(makeCheck("manifest_exists", "info", "pass", "Render manifest ditemukan."));

  checks.push(
    makeCheck(
      "manifest_mode_metadata_only",
      "blocking",
      manifest.manifest_mode === "metadata_only" ? "pass" : "fail",
      manifest.manifest_mode === "metadata_only"
        ? "Manifest mode metadata_only."
        : "Manifest mode tidak metadata_only."
    )
  );

  if (manifest.manifest_status === "reviewed" || manifest.manifest_status === "approved") {
    checks.push(makeCheck("manifest_status_reviewed_or_approved", "blocking", "pass", "Manifest sudah reviewed atau approved."));
  } else if (manifest.manifest_status === "draft") {
    checks.push(makeCheck("manifest_status_draft", "warning", "fail", "Manifest masih draft; owner sebaiknya review sebelum future render."));
  } else {
    checks.push(makeCheck("manifest_status_reviewed_or_approved", "blocking", "fail", "Manifest harus reviewed atau approved sebelum future render."));
  }

  checks.push(
    makeCheck(
      "job_render_mode_disabled",
      "blocking",
      manifest.render_mode === "disabled_metadata_only" ? "pass" : "fail",
      manifest.render_mode === "disabled_metadata_only"
        ? "Video draft job tetap metadata-only."
        : "Video draft job render_mode tidak disabled_metadata_only."
    )
  );

  checks.push(
    makeCheck(
      "job_not_cancelled_or_archived",
      "blocking",
      manifest.job_status === "cancelled" || manifest.job_status === "archived" ? "fail" : "pass",
      manifest.job_status === "cancelled" || manifest.job_status === "archived"
        ? "Video draft job dibatalkan atau diarsipkan."
        : "Video draft job masih aktif untuk perencanaan."
    )
  );

  checks.push(
    makeCheck(
      "manifest_has_items",
      "blocking",
      items.length > 0 ? "pass" : "fail",
      items.length > 0 ? "Manifest memiliki item." : "Manifest belum memiliki item."
    )
  );

  checks.push(
    makeCheck(
      "manifest_item_count_matches",
      "blocking",
      manifest.item_count === items.length ? "pass" : "fail",
      manifest.item_count === items.length
        ? "Item count manifest sesuai jumlah item."
        : `Item count manifest ${manifest.item_count} tidak sesuai jumlah item ${items.length}.`
    )
  );

  const selectedItems = items.filter((item) => item.footage_asset_id).length;
  checks.push(
    makeCheck(
      "selected_footage_count_matches",
      "warning",
      manifest.selected_footage_count === selectedItems ? "pass" : "fail",
      manifest.selected_footage_count === selectedItems
        ? "Selected footage count sesuai item dengan footage."
        : `Selected footage count ${manifest.selected_footage_count} tidak sesuai item dengan footage ${selectedItems}.`
    )
  );

  checks.push(
    makeCheck(
      "target_format_valid",
      "info",
      ["vertical_9_16", "square_1_1", "horizontal_16_9", "other"].includes(manifest.target_format) ? "pass" : "fail",
      "Target format manifest diperiksa."
    )
  );

  checks.push(
    makeCheck(
      "estimated_duration_limit",
      "blocking",
      manifest.estimated_duration_seconds === null || manifest.estimated_duration_seconds <= 600 ? "pass" : "fail",
      manifest.estimated_duration_seconds === null || manifest.estimated_duration_seconds <= 600
        ? "Estimasi durasi manifest aman."
        : "Estimasi durasi manifest melewati 600 detik."
    )
  );

  if (manifest.missing_footage_step_count > 0) {
    checks.push(makeCheck("manifest_missing_footage_steps", "warning", "fail", `${manifest.missing_footage_step_count} step belum memiliki footage snapshot.`));
  }

  if (manifest.manifest_warnings) {
    checks.push(makeCheck("manifest_warnings_present", "warning", "fail", "Manifest memiliki warning yang perlu dibaca owner."));
  }

  for (const item of items) {
    checks.push(
      makeCheck(
        "item_snapshot_path_safe",
        "blocking",
        isSafeRelativePath(item.source_relative_path_snapshot) ? "pass" : "fail",
        isSafeRelativePath(item.source_relative_path_snapshot)
          ? `Path snapshot item ${item.sequence_number} aman.`
          : `Path snapshot item ${item.sequence_number} tidak aman.`,
        item.id
      )
    );

    if (!item.footage_asset_id || !item.source_relative_path_snapshot) {
      checks.push(makeCheck("item_without_footage_snapshot", "warning", "fail", `Item ${item.sequence_number} belum memiliki footage snapshot.`, item.id));
    }

    if (item.duration_seconds === null) {
      checks.push(makeCheck("item_duration_missing", "warning", "fail", `Item ${item.sequence_number} belum memiliki durasi.`, item.id));
    }

    if (item.item_warnings) {
      checks.push(makeCheck("item_warning_present", "warning", "fail", `Item ${item.sequence_number} memiliki warning.`, item.id));
    }
  }

  return checks;
}

export async function getRenderPreflightRunById(runId: string): Promise<RenderPreflightRunRow> {
  assertUuid(runId);
  const rows = await query<RenderPreflightRunRow>(
    `${runSelect}
     WHERE id = $1`,
    [runId]
  );
  if (!rows[0]) {
    throw new RenderPreflightError("preflight_run_not_found", "Render preflight run tidak ditemukan.", 404);
  }
  return mapRun(rows[0]);
}

export async function listRenderPreflightRunsForManifest(manifestId: string): Promise<RenderPreflightRunRow[]> {
  assertUuid(manifestId);
  await getManifestSnapshot(manifestId);
  const rows = await query<RenderPreflightRunRow>(
    `${runSelect}
     WHERE render_manifest_id = $1
     ORDER BY created_at DESC, id DESC`,
    [manifestId]
  );
  return rows.map(mapRun);
}

export async function listRenderPreflightChecks(runId: string): Promise<RenderPreflightCheckRow[]> {
  assertUuid(runId);
  await getRenderPreflightRunById(runId);
  return query<RenderPreflightCheckRow>(
    `${checkSelect}
     WHERE preflight_run_id = $1
     ORDER BY
       CASE check_level
         WHEN 'blocking' THEN 1
         WHEN 'warning' THEN 2
         ELSE 3
       END,
       check_code ASC,
       created_at ASC`,
    [runId]
  );
}

export async function runRenderPreflightForManifest(manifestId: string): Promise<RenderPreflightRunRow> {
  assertUuid(manifestId);
  const runId = await withTransaction(async (client) => {
    const manifest = await getManifestSnapshot(manifestId, client);
    const items = await listManifestItems(manifestId, client);
    const checks = buildRenderPreflightChecks(manifest, items);
    const blockingCount = checks.filter((check) => check.check_level === "blocking" && check.check_status === "fail").length;
    const warningCount = checks.filter((check) => check.check_level === "warning" && check.check_status === "fail").length;
    const result = blockingCount === 0 ? "ready" : "blocked";
    const summary = result === "ready"
      ? `Preflight ready dengan ${warningCount} warning.`
      : `Preflight blocked dengan ${blockingCount} blocking check dan ${warningCount} warning.`;

    const created = await client.query<{ id: string }>(
      `INSERT INTO video_render_preflight_runs (
         render_manifest_id,
         video_draft_job_id,
         content_item_id,
         run_status,
         preflight_result,
         check_count,
         blocking_check_count,
         warning_check_count,
         summary
       )
       VALUES ($1, $2, $3, 'completed', $4, $5, $6, $7, $8)
       RETURNING id`,
      [manifest.id, manifest.video_draft_job_id, manifest.content_item_id, result, checks.length, blockingCount, warningCount, summary]
    );

    for (const check of checks) {
      await client.query(
        `INSERT INTO video_render_preflight_checks (
           preflight_run_id,
           render_manifest_item_id,
           check_code,
           check_level,
           check_status,
           message
         )
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [created.rows[0].id, check.render_manifest_item_id, check.check_code, check.check_level, check.check_status, check.message]
      );
    }

    return created.rows[0].id;
  });
  return getRenderPreflightRunById(runId);
}

export async function getRenderPreflightContextForManifest(manifestId: string): Promise<RenderPreflightContext> {
  assertUuid(manifestId);
  const manifest = await getManifestSnapshot(manifestId);
  const items = await listManifestItems(manifestId);
  const runs = await listRenderPreflightRunsForManifest(manifestId);
  const latestRun = runs[0] || null;
  const latestChecks = latestRun ? await listRenderPreflightChecks(latestRun.id) : [];
  return { manifest, items, latestRun, latestChecks, runs };
}

export async function getRenderPreflightContextForContentItem(
  contentItemId: string,
  jobId: string,
  manifestId: string
): Promise<RenderPreflightContext> {
  assertUuid(contentItemId);
  assertUuid(jobId);
  assertUuid(manifestId);
  const context = await getRenderPreflightContextForManifest(manifestId);
  if (context.manifest.content_item_id !== contentItemId || context.manifest.video_draft_job_id !== jobId) {
    throw new RenderPreflightError("render_preflight_mismatch", "Render preflight tidak dimiliki konten dan video draft job ini.", 404);
  }
  return context;
}
