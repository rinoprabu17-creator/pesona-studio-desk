import test from "node:test";
import assert from "node:assert/strict";
import pg from "pg";
import {
  cancelCampaignPlanRun,
  createCampaignPlanRun,
  getCampaignPlanRun,
  retryCampaignPlanRun
} from "../../apps/web/src/campaign-plan-run-service.ts";
import {
  approveAllReadyDraftItems,
  approveCampaignPlanDraftItem,
  approveCampaignPlanRun,
  editCampaignPlanDraftItem,
  getCampaignPlanRunReview,
  rejectCampaignPlanRun,
  rejectCampaignPlanDraftItem
} from "../../apps/web/src/campaign-plan-review-service.ts";
import {
  getCampaignPlanImportPreview,
  importApprovedCampaignPlanRun,
  type CampaignPlanImportFailpoint
} from "../../apps/web/src/campaign-plan-import-service.ts";
import { createContentItem } from "../../apps/web/src/content-item-service.ts";
import { getContentItem } from "../../apps/web/src/content-item-service.ts";
import { getContentCalendar } from "../../apps/web/src/content-calendar-service.ts";
import { closeDatabase } from "../../apps/web/src/db.ts";
import { renderCampaignPlanImportPage } from "../../apps/web/src/views/campaign-plan-import-pages.ts";
import { renderContentItemDetailPage } from "../../apps/web/src/views/content-item-pages.ts";
import { renderContentCalendarPage } from "../../apps/web/src/views/content-calendar-page.ts";
import { processNextRun } from "../../workers/campaign-planner/src/worker.ts";
import { loadWorkerConfig } from "../../workers/campaign-planner/src/lease.ts";

const databaseUrl = process.env.DATABASE_URL;
const shouldRun = Boolean(databaseUrl);
const { Pool } = pg;
const pool = databaseUrl ? new Pool({ connectionString: databaseUrl, max: 12 }) : null;
const testCampaignPrefix = `IMPORT-${process.pid}-`;
const campaignIds: string[] = [];
const changedReferenceRows: Array<{ table: string; id: string }> = [];

function maybeTest(name: string, fn: Parameters<typeof test>[1]) {
  test(name, { skip: shouldRun ? false : "DATABASE_URL tidak tersedia." }, fn);
}

async function createCampaign(codeSuffix: string, overrides: Record<string, unknown> = {}) {
  const values = {
    code: `${testCampaignPrefix}${codeSuffix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: `Import ${codeSuffix}`,
    start_date: "2026-07-01",
    end_date: "2026-07-30",
    target_audience: "TU Sekolah",
    status: "active",
    ...overrides
  };
  const result = await pool!.query<{ id: string }>(
    `INSERT INTO campaigns (code, name, start_date, end_date, target_audience, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [values.code, values.name, values.start_date, values.end_date, values.target_audience, values.status]
  );
  campaignIds.push(result.rows[0].id);
  return result.rows[0].id;
}

function runInput(count = 30) {
  return {
    requested_content_count: count,
    selected_channels: ["instagram", "facebook", "tiktok", "youtube", "whatsapp_status"],
    owner_brief: "Approved import test.",
    default_posting_times: {
      instagram: "09:00",
      facebook: "09:15",
      tiktok: "19:00",
      youtube: "19:15",
      whatsapp_status: "07:00"
    }
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processReadyRun(code: string, count = 30) {
  const campaignId = await createCampaign(code);
  const run = await createCampaignPlanRun(campaignId, runInput(count));
  let processedTarget = false;
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const processed = await processNextRun(pool!, loadWorkerConfig({ workerId: `import-${code}-${attempt}`, fakeMode: "valid" }));
    const status = await pool!.query(`SELECT status FROM campaign_plan_runs WHERE id = $1`, [run.id]);
    if (status.rows[0]?.status === "ready_for_review") {
      processedTarget = true;
      break;
    }
    if (processed.runId === run.id && processed.result === "finalized") {
      processedTarget = true;
      break;
    }
    if (!processed.processed) await sleep(25);
  }
  assert.equal(processedTarget, true);
  return { campaignId, runId: run.id };
}

function editPayload(item: any, overrides: Record<string, unknown> = {}) {
  const youtube = item.publications.find((publication: any) => publication.channel === "youtube");
  const values: Record<string, unknown> = {
    expected_revision_number: item.revision_number,
    title: item.title,
    school_level: item.school_level,
    color_code: item.color_code,
    target_audience: item.target_audience,
    hook: item.hook,
    angle: item.angle,
    cta_text: item.cta_text,
    cta_keyword: item.cta_keyword,
    planning_reason: item.planning_reason,
    owner_notes: item.owner_notes,
    ...overrides
  };
  if (youtube?.platform_title) {
    values.youtube_platform_title = youtube.platform_title;
  }
  return values;
}

async function approveRun(runId: string) {
  await approveAllReadyDraftItems(runId);
  let review = await getCampaignPlanRunReview(runId);
  for (const item of review.items.filter((row: any) => row.review_status === "pending_review")) {
    await approveCampaignPlanDraftItem(item.id, { expected_revision_number: item.revision_number });
  }
  return approveCampaignPlanRun(runId);
}

async function rejectFirstItems(runId: string, count: number) {
  let review = await getCampaignPlanRunReview(runId);
  for (const item of review.items.slice(0, count)) {
    await rejectCampaignPlanDraftItem(item.id, { expected_revision_number: item.revision_number, owner_notes: `Rejected ${item.draft_sequence}` });
  }
}

async function operationalCounts(campaignId: string) {
  const result = await pool!.query(
    `SELECT
       (SELECT COUNT(*)::int FROM content_items WHERE campaign_id = $1) AS content_items,
       (SELECT COUNT(*)::int
        FROM content_publications p
        JOIN content_items i ON i.id = p.content_item_id
        WHERE i.campaign_id = $1) AS content_publications`,
    [campaignId]
  );
  return result.rows[0];
}

async function cleanup() {
  if (!pool) return;
  for (const row of changedReferenceRows.splice(0)) {
    await pool.query(`UPDATE ${row.table} SET active = true, updated_at = now() WHERE id = $1`, [row.id]);
  }
  const tracked = await pool.query<{ id: string }>(
    `SELECT id FROM campaigns WHERE id = ANY($1::uuid[]) OR code LIKE $2`,
    [campaignIds, `${testCampaignPrefix}%`]
  );
  const ids = tracked.rows.map((row) => row.id);
  if (!ids.length) return;
  await pool.query(
    `DELETE FROM campaign_plan_draft_publications
     WHERE draft_item_id IN (
       SELECT i.id FROM campaign_plan_draft_items i
       JOIN campaign_plan_runs r ON r.id = i.run_id
       WHERE r.campaign_id = ANY($1::uuid[])
     )`,
    [ids]
  );
  await pool.query(
    `DELETE FROM campaign_plan_draft_items
     WHERE run_id IN (SELECT id FROM campaign_plan_runs WHERE campaign_id = ANY($1::uuid[]))`,
    [ids]
  );
  await pool.query(
    `DELETE FROM campaign_plan_generation_batches
     WHERE run_id IN (SELECT id FROM campaign_plan_runs WHERE campaign_id = ANY($1::uuid[]))`,
    [ids]
  );
  await pool.query(`DELETE FROM campaign_plan_runs WHERE campaign_id = ANY($1::uuid[])`, [ids]);
  await pool.query(
    `DELETE FROM content_publications
     WHERE content_item_id IN (SELECT id FROM content_items WHERE campaign_id = ANY($1::uuid[]))`,
    [ids]
  );
  await pool.query(`DELETE FROM content_items WHERE campaign_id = ANY($1::uuid[])`, [ids]);
  await pool.query(`DELETE FROM campaigns WHERE id = ANY($1::uuid[])`, [ids]);
}

test.after(async () => {
  await cleanup();
  const finalCounts = await pool?.query(
    `SELECT
       (SELECT COUNT(*)::int FROM campaigns WHERE code LIKE $1) AS campaigns,
       (SELECT COUNT(*)::int FROM campaign_plan_runs r JOIN campaigns c ON c.id = r.campaign_id WHERE c.code LIKE $1) AS runs,
       (SELECT COUNT(*)::int FROM campaign_plan_generation_batches b JOIN campaign_plan_runs r ON r.id = b.run_id JOIN campaigns c ON c.id = r.campaign_id WHERE c.code LIKE $1) AS batches,
       (SELECT COUNT(*)::int FROM campaign_plan_draft_items i JOIN campaign_plan_runs r ON r.id = i.run_id JOIN campaigns c ON c.id = r.campaign_id WHERE c.code LIKE $1) AS draft_items,
       (SELECT COUNT(*)::int FROM campaign_plan_draft_publications p JOIN campaign_plan_draft_items i ON i.id = p.draft_item_id JOIN campaign_plan_runs r ON r.id = i.run_id JOIN campaigns c ON c.id = r.campaign_id WHERE c.code LIKE $1) AS draft_publications,
       (SELECT COUNT(*)::int FROM content_items i JOIN campaigns c ON c.id = i.campaign_id WHERE c.code LIKE $1) AS content_items,
       (SELECT COUNT(*)::int FROM content_publications p JOIN content_items i ON i.id = p.content_item_id JOIN campaigns c ON c.id = i.campaign_id WHERE c.code LIKE $1) AS content_publications`,
    [`${testCampaignPrefix}%`]
  );
  if (finalCounts) {
    assert.deepEqual(finalCounts.rows[0], {
      campaigns: 0,
      runs: 0,
      batches: 0,
      draft_items: 0,
      draft_publications: 0,
      content_items: 0,
      content_publications: 0
    });
  }
  await pool?.end();
  await closeDatabase();
});

test.beforeEach(async () => {
  await cleanup();
  campaignIds.length = 0;
});

maybeTest("positive import 30/150, field mapping, calendar, safe HTML, dan idempotency", async () => {
  const { campaignId, runId } = await processReadyRun("POSITIVE", 30);
  let review = await getCampaignPlanRunReview(runId);
  const first = review.items[0];
  review = await editCampaignPlanDraftItem(first.id, editPayload(first, {
    title: "Import <script>title</script>",
    owner_notes: "Owner <b>notes</b>"
  }));
  await approveRun(runId);

  const result = await importApprovedCampaignPlanRun(runId);
  assert.equal(result.status, "imported");
  assert.equal(result.already_imported, false);
  assert.equal(result.summary.approved_draft_items, 30);
  assert.equal(result.summary.rejected_draft_items, 0);
  assert.equal(result.summary.content_items_created, 30);
  assert.equal(result.summary.publications_created, 150);
  assert.ok(result.imported_at);

  const afterCounts = await operationalCounts(campaignId);
  assert.deepEqual(afterCounts, { content_items: 30, content_publications: 150 });
  const statuses = await pool!.query(
    `SELECT
       (SELECT COUNT(*)::int FROM content_items WHERE campaign_id = $1 AND production_status = 'planned') AS planned_items,
       (SELECT COUNT(*)::int FROM content_publications p JOIN content_items i ON i.id = p.content_item_id WHERE i.campaign_id = $1 AND p.publication_status = 'planned') AS planned_publications,
       (SELECT COUNT(*)::int FROM content_publications p JOIN content_items i ON i.id = p.content_item_id WHERE i.campaign_id = $1 AND p.platform_caption IS NULL) AS null_captions,
       (SELECT COUNT(*)::int FROM campaign_plan_draft_items WHERE run_id = $2 AND imported_content_item_id IS NOT NULL AND imported_at IS NOT NULL) AS mapped_items,
       (SELECT COUNT(*)::int FROM campaign_plan_draft_publications p JOIN campaign_plan_draft_items i ON i.id = p.draft_item_id WHERE i.run_id = $2 AND p.imported_publication_id IS NOT NULL AND p.imported_at IS NOT NULL) AS mapped_publications`,
    [campaignId, runId]
  );
  assert.deepEqual(statuses.rows[0], {
    planned_items: 30,
    planned_publications: 150,
    null_captions: 150,
    mapped_items: 30,
    mapped_publications: 150
  });

  const codes = await pool!.query<{ content_code: string; sequence_number: number }>(
    `SELECT content_code, sequence_number FROM content_items WHERE campaign_id = $1 ORDER BY sequence_number`,
    [campaignId]
  );
  assert.equal(new Set(codes.rows.map((row) => row.content_code)).size, 30);
  assert.equal(codes.rows[0].content_code.endsWith("-D01"), true);
  assert.equal(codes.rows[29].content_code.endsWith("-D30"), true);

  const mapping = await pool!.query(
    `SELECT i.product_code, p.code AS imported_product_code,
            i.color_code, color.code AS imported_color_code,
            i.primary_offer_code, offer.code AS imported_offer_code,
            i.primary_pain_point_code, pain.code AS imported_pain_point_code,
            i.owner_notes, i.planning_reason, ci.notes, ci.title,
            pub.platform_title, cp.platform_title AS imported_platform_title,
            pub.planned_publish_at::text AS draft_publish_at, cp.planned_publish_at::text AS imported_publish_at,
            cp.published_url, cp.published_at, cp.failure_reason
     FROM campaign_plan_draft_items i
     JOIN content_items ci ON ci.id = i.imported_content_item_id
     LEFT JOIN products p ON p.id = ci.product_id
     LEFT JOIN colors color ON color.id = ci.color_id
     LEFT JOIN offers offer ON offer.id = ci.primary_offer_id
     LEFT JOIN pain_points pain ON pain.id = ci.primary_pain_point_id
     JOIN campaign_plan_draft_publications pub ON pub.draft_item_id = i.id AND pub.channel = 'youtube'
     JOIN content_publications cp ON cp.id = pub.imported_publication_id
     WHERE i.run_id = $1 AND i.draft_sequence = 1`,
    [runId]
  );
  const mapped = mapping.rows[0];
  assert.equal(mapped.product_code, mapped.imported_product_code);
  assert.equal(mapped.color_code, mapped.imported_color_code);
  assert.equal(mapped.primary_offer_code, mapped.imported_offer_code);
  assert.equal(mapped.primary_pain_point_code, mapped.imported_pain_point_code);
  assert.equal(mapped.notes, "Owner <b>notes</b>");
  assert.notEqual(mapped.notes, mapped.planning_reason);
  assert.equal(mapped.title, "Import <script>title</script>");
  assert.equal(mapped.platform_title, mapped.imported_platform_title);
  assert.ok(mapped.imported_publish_at);
  assert.equal(mapped.published_url, null);
  assert.equal(mapped.published_at, null);
  assert.equal(mapped.failure_reason, null);

  const calendar = await getContentCalendar(new URL(`http://localhost/api/content-calendar?month=2026-07&campaign_id=${campaignId}`));
  assert.equal(calendar.counts.content_items, 30);
  assert.equal(calendar.counts.publications, 150);
  assert.ok(calendar.days.flatMap((day) => day.content_items).every((item) => item.production_status === "planned"));
  assert.ok(calendar.days.flatMap((day) => day.content_items).flatMap((item) => item.publications).every((publication) => publication.publication_status === "planned"));

  const html = renderCampaignPlanImportPage(await getCampaignPlanImportPreview(runId), new URL("http://localhost/import"));
  assert.ok(html.includes("Import &lt;script&gt;title&lt;/script&gt;"));
  assert.ok(html.includes("Owner &lt;b&gt;notes&lt;/b&gt;"));
  assert.equal(html.includes("Import <script>title</script>"), false);
  const htmlSafe = JSON.stringify(result);
  assert.equal(/postgresql:\/\/|DATABASE_URL|password=|stack|input_snapshot|strategy_snapshot|provider_output/i.test(htmlSafe), false);

  const second = await importApprovedCampaignPlanRun(runId);
  assert.equal(second.already_imported, true);
  assert.deepEqual(await operationalCounts(campaignId), { content_items: 30, content_publications: 150 });
});

maybeTest("approved-only import melewati rejected draft dan mempertahankan sequence operational existing", async () => {
  const { campaignId, runId } = await processReadyRun("MIXED", 30);
  for (let i = 1; i <= 3; i += 1) {
    await createContentItem({
      campaign_id: campaignId,
      title: `Manual ${i}`,
      planned_content_date: `2026-07-0${i}`,
      audience_segment: "end_user_school",
      target_audience: "TU Sekolah",
      content_pillar: "education",
      hook: `Manual hook ${i}`,
      angle: `Manual angle ${i}`,
      cta_text: "Hubungi admin",
      cta_keyword: `MANUAL${i}`
    });
  }
  await rejectFirstItems(runId, 5);
  await approveRun(runId);
  const result = await importApprovedCampaignPlanRun(runId);
  assert.equal(result.summary.approved_draft_items, 25);
  assert.equal(result.summary.rejected_draft_items, 5);
  assert.equal(result.summary.content_items_created, 25);
  assert.equal(result.summary.publications_created, 125);
  assert.equal(result.content_items[0].content_code.endsWith("-D04"), true);

  const rejectedMappings = await pool!.query(
    `SELECT
       (SELECT COUNT(*)::int FROM campaign_plan_draft_items WHERE run_id = $1 AND review_status = 'rejected' AND imported_content_item_id IS NULL AND imported_at IS NULL) AS rejected_items_unmapped,
       (SELECT COUNT(*)::int FROM campaign_plan_draft_publications p JOIN campaign_plan_draft_items i ON i.id = p.draft_item_id WHERE i.run_id = $1 AND i.review_status = 'rejected' AND p.imported_publication_id IS NULL AND p.imported_at IS NULL) AS rejected_publications_unmapped`,
    [runId]
  );
  assert.deepEqual(rejectedMappings.rows[0], {
    rejected_items_unmapped: 5,
    rejected_publications_unmapped: 25
  });
  const calendar = await getContentCalendar(new URL(`http://localhost/api/content-calendar?month=2026-07&campaign_id=${campaignId}`));
  assert.equal(calendar.counts.content_items, 28);
  assert.equal(calendar.counts.publications, 125);
});

maybeTest("closeout one-to-one mapping, shared timestamp, rejected null mapping, dan summary existing", async () => {
  const { campaignId, runId } = await processReadyRun("ONE-TO-ONE", 30);
  await rejectFirstItems(runId, 5);
  await approveRun(runId);
  const result = await importApprovedCampaignPlanRun(runId);
  assert.equal(result.summary.approved_draft_items, 25);
  assert.equal(result.summary.rejected_draft_items, 5);
  assert.equal(result.content_items.length, 25);
  assert.deepEqual(result.content_items.map((item) => item.draft_sequence), Array.from({ length: 25 }, (_, index) => index + 6));

  const counts = await pool!.query(
    `SELECT
       (SELECT COUNT(*)::int FROM campaign_plan_draft_items WHERE run_id = $1 AND review_status = 'approved') AS approved_items,
       (SELECT COUNT(imported_content_item_id)::int FROM campaign_plan_draft_items WHERE run_id = $1 AND review_status = 'approved') AS mapped_items,
       (SELECT COUNT(DISTINCT imported_content_item_id)::int FROM campaign_plan_draft_items WHERE run_id = $1 AND review_status = 'approved') AS distinct_mapped_items,
       (SELECT COUNT(*)::int FROM content_items WHERE campaign_id = $2) AS operational_items,
       (SELECT COUNT(*)::int FROM campaign_plan_draft_publications p JOIN campaign_plan_draft_items i ON i.id = p.draft_item_id WHERE i.run_id = $1 AND i.review_status = 'approved') AS approved_publications,
       (SELECT COUNT(p.imported_publication_id)::int FROM campaign_plan_draft_publications p JOIN campaign_plan_draft_items i ON i.id = p.draft_item_id WHERE i.run_id = $1 AND i.review_status = 'approved') AS mapped_publications,
       (SELECT COUNT(DISTINCT p.imported_publication_id)::int FROM campaign_plan_draft_publications p JOIN campaign_plan_draft_items i ON i.id = p.draft_item_id WHERE i.run_id = $1 AND i.review_status = 'approved') AS distinct_mapped_publications,
       (SELECT COUNT(*)::int FROM content_publications p JOIN content_items i ON i.id = p.content_item_id WHERE i.campaign_id = $2) AS operational_publications,
       (SELECT COUNT(*)::int FROM campaign_plan_draft_items WHERE run_id = $1 AND review_status = 'rejected' AND imported_content_item_id IS NULL AND imported_at IS NULL) AS rejected_items_unmapped,
       (SELECT COUNT(*)::int FROM campaign_plan_draft_publications p JOIN campaign_plan_draft_items i ON i.id = p.draft_item_id WHERE i.run_id = $1 AND i.review_status = 'rejected' AND p.imported_publication_id IS NULL AND p.imported_at IS NULL) AS rejected_publications_unmapped,
       (SELECT COUNT(DISTINCT imported_at)::int FROM campaign_plan_draft_items WHERE run_id = $1 AND review_status = 'approved') AS item_timestamp_count,
       (SELECT COUNT(DISTINCT p.imported_at)::int FROM campaign_plan_draft_publications p JOIN campaign_plan_draft_items i ON i.id = p.draft_item_id WHERE i.run_id = $1 AND i.review_status = 'approved') AS publication_timestamp_count,
       (SELECT COUNT(*)::int FROM campaign_plan_draft_items i JOIN campaign_plan_runs r ON r.id = i.run_id WHERE i.run_id = $1 AND i.review_status = 'approved' AND i.imported_at = r.imported_at) AS items_matching_run_time,
       (SELECT COUNT(*)::int FROM campaign_plan_draft_publications p JOIN campaign_plan_draft_items i ON i.id = p.draft_item_id JOIN campaign_plan_runs r ON r.id = i.run_id WHERE i.run_id = $1 AND i.review_status = 'approved' AND p.imported_at = r.imported_at) AS publications_matching_run_time`,
    [runId, campaignId]
  );
  assert.deepEqual(counts.rows[0], {
    approved_items: 25,
    mapped_items: 25,
    distinct_mapped_items: 25,
    operational_items: 25,
    approved_publications: 125,
    mapped_publications: 125,
    distinct_mapped_publications: 125,
    operational_publications: 125,
    rejected_items_unmapped: 5,
    rejected_publications_unmapped: 25,
    item_timestamp_count: 1,
    publication_timestamp_count: 1,
    items_matching_run_time: 25,
    publications_matching_run_time: 125
  });

  const second = await importApprovedCampaignPlanRun(runId);
  assert.equal(second.already_imported, true);
  assert.equal(second.summary.approved_draft_items, 25);
  assert.equal(second.summary.rejected_draft_items, 5);
  assert.equal(second.summary.content_items_created, 25);
  assert.equal(second.summary.publications_created, 125);
  assert.deepEqual(second.content_items.map((item) => item.draft_sequence), result.content_items.map((item) => item.draft_sequence));
});

maybeTest("closeout rejected sequence behavior tidak membuat gap operational", async () => {
  const { campaignId, runId } = await processReadyRun("REJECTED-SEQUENCE", 5);
  for (let i = 1; i <= 3; i += 1) {
    await createContentItem({
      campaign_id: campaignId,
      title: `Existing ${i}`,
      planned_content_date: `2026-07-0${i}`,
      audience_segment: "end_user_school",
      target_audience: "TU Sekolah",
      content_pillar: "education",
      hook: `Existing hook ${i}`,
      angle: `Existing angle ${i}`,
      cta_text: "Hubungi admin",
      cta_keyword: `EXIST${i}`
    });
  }
  let review = await getCampaignPlanRunReview(runId);
  await rejectCampaignPlanDraftItem(review.items[1].id, { expected_revision_number: review.items[1].revision_number });
  await rejectCampaignPlanDraftItem(review.items[3].id, { expected_revision_number: review.items[3].revision_number });
  await approveRun(runId);
  const result = await importApprovedCampaignPlanRun(runId);
  assert.deepEqual(result.content_items.map((item) => [item.draft_sequence, item.content_code.split("-D").at(-1)]), [
    [1, "04"],
    [3, "05"],
    [5, "06"]
  ]);
  const rows = await pool!.query(
    `SELECT draft_sequence, review_status, imported_content_item_id IS NOT NULL AS mapped
     FROM campaign_plan_draft_items
     WHERE run_id = $1
     ORDER BY draft_sequence`,
    [runId]
  );
  assert.deepEqual(rows.rows.map((row) => [row.draft_sequence, row.review_status, row.mapped]), [
    [1, "approved", true],
    [2, "rejected", false],
    [3, "approved", true],
    [4, "rejected", false],
    [5, "approved", true]
  ]);
});

maybeTest("closeout re-import setelah operational edit tidak menimpa data operational", async () => {
  const { campaignId, runId } = await processReadyRun("REIMPORT-EDIT", 5);
  await approveRun(runId);
  const imported = await importApprovedCampaignPlanRun(runId);
  const first = imported.content_items[0];
  await pool!.query(
    `UPDATE content_items
     SET title = 'Operational title edited',
         notes = 'Operational notes edited',
         updated_at = now()
     WHERE id = $1`,
    [first.content_item_id]
  );
  const before = await pool!.query(
    `SELECT id, content_code, title, notes FROM content_items WHERE campaign_id = $1 ORDER BY sequence_number`,
    [campaignId]
  );
  const second = await importApprovedCampaignPlanRun(runId);
  const after = await pool!.query(
    `SELECT id, content_code, title, notes FROM content_items WHERE campaign_id = $1 ORDER BY sequence_number`,
    [campaignId]
  );
  assert.equal(second.already_imported, true);
  assert.deepEqual(after.rows, before.rows);
  assert.equal(after.rows[0].title, "Operational title edited");
  assert.equal(after.rows[0].notes, "Operational notes edited");
  assert.deepEqual(await operationalCounts(campaignId), { content_items: 5, content_publications: 25 });
});

maybeTest("closeout imported run terminal guard dan new generation run setelah import", async () => {
  const { campaignId, runId } = await processReadyRun("TERMINAL", 5);
  await approveRun(runId);
  await assert.rejects(
    () => createCampaignPlanRun(campaignId, runInput(5)),
    /Campaign masih memiliki plan run aktif/
  );
  await importApprovedCampaignPlanRun(runId);
  const review = await getCampaignPlanRunReview(runId);
  const first = review.items[0];
  const countsBefore = await operationalCounts(campaignId);
  const mappingBefore = await pool!.query(
    `SELECT i.id, i.imported_content_item_id, i.imported_at, p.id AS publication_id, p.imported_publication_id, p.imported_at AS publication_imported_at
     FROM campaign_plan_draft_items i
     LEFT JOIN campaign_plan_draft_publications p ON p.draft_item_id = i.id
     WHERE i.run_id = $1
     ORDER BY i.draft_sequence, p.channel, p.publication_format`,
    [runId]
  );

  await assert.rejects(() => editCampaignPlanDraftItem(first.id, editPayload(first, { title: "Should fail" })), /Run tidak dapat direview/);
  await assert.rejects(() => approveCampaignPlanDraftItem(first.id, { expected_revision_number: first.revision_number }), /Run tidak dapat direview/);
  await assert.rejects(() => rejectCampaignPlanDraftItem(first.id, { expected_revision_number: first.revision_number }), /Run tidak dapat direview/);
  await assert.rejects(() => approveAllReadyDraftItems(runId), /Run tidak dapat direview/);
  await assert.rejects(() => approveCampaignPlanRun(runId), /Run sudah disetujui|Run tidak dapat direview|Run tidak dapat disetujui/);
  await assert.rejects(() => rejectCampaignPlanRun(runId), /Run tidak dapat direject|Run tidak dapat direview|Run tidak dapat ditolak/);
  await assert.rejects(() => retryCampaignPlanRun(runId), /Run tidak dapat diretry/);
  await assert.rejects(() => cancelCampaignPlanRun(runId), /Run tidak dapat dibatalkan/);
  assert.equal((await importApprovedCampaignPlanRun(runId)).already_imported, true);
  assert.equal((await getCampaignPlanRun(runId)).status, "imported");
  assert.deepEqual(await operationalCounts(campaignId), countsBefore);
  const mappingAfter = await pool!.query(
    `SELECT i.id, i.imported_content_item_id, i.imported_at, p.id AS publication_id, p.imported_publication_id, p.imported_at AS publication_imported_at
     FROM campaign_plan_draft_items i
     LEFT JOIN campaign_plan_draft_publications p ON p.draft_item_id = i.id
     WHERE i.run_id = $1
     ORDER BY i.draft_sequence, p.channel, p.publication_format`,
    [runId]
  );
  assert.deepEqual(mappingAfter.rows, mappingBefore.rows);

  const newRun = await createCampaignPlanRun(campaignId, runInput(5));
  assert.equal(newRun.status, "queued");
  assert.equal((await getCampaignPlanRun(runId)).status, "imported");
  await cancelCampaignPlanRun(newRun.id);
});

maybeTest("concurrent import dan concurrent manual create tidak membuat duplicate", async () => {
  const { campaignId, runId } = await processReadyRun("CONCURRENT", 10);
  await approveRun(runId);
  const [first, second] = await Promise.all([
    importApprovedCampaignPlanRun(runId),
    importApprovedCampaignPlanRun(runId)
  ]);
  assert.equal([first, second].filter((result) => result.already_imported === false).length, 1);
  assert.equal([first, second].filter((result) => result.already_imported === true).length, 1);
  assert.deepEqual(await operationalCounts(campaignId), { content_items: 10, content_publications: 50 });

  const secondCase = await processReadyRun("MANUAL-CONCURRENT", 10);
  await approveRun(secondCase.runId);
  const [importResult, idempotentImportResult, manualResult] = await Promise.all([
    importApprovedCampaignPlanRun(secondCase.runId),
    importApprovedCampaignPlanRun(secondCase.runId),
    createContentItem({
      campaign_id: secondCase.campaignId,
      title: "Manual concurrent",
      planned_content_date: "2026-07-10",
      audience_segment: "end_user_school",
      target_audience: "TU Sekolah",
      content_pillar: "education",
      hook: "Manual hook concurrent",
      angle: "Manual angle concurrent",
      cta_text: "Hubungi admin",
      cta_keyword: "MANUAL-CONCURRENT"
    })
  ]);
  assert.equal(importResult.status, "imported");
  assert.equal([importResult, idempotentImportResult].filter((result) => result.already_imported === false).length, 1);
  assert.equal([importResult, idempotentImportResult].filter((result) => result.already_imported === true).length, 1);
  assert.ok(manualResult.content_code);
  const sequences = await pool!.query(
    `SELECT sequence_number, content_code FROM content_items WHERE campaign_id = $1 ORDER BY sequence_number`,
    [secondCase.campaignId]
  );
  assert.equal(sequences.rows.length, 11);
  assert.equal(new Set(sequences.rows.map((row) => row.sequence_number)).size, 11);
  assert.equal(new Set(sequences.rows.map((row) => row.content_code)).size, 11);
});

maybeTest("closeout staging versus strategy consistency menolak missing, extra, timestamp drift, dan immutable drift", async () => {
  const cases = [
    {
      name: "missing-publication",
      mutate: async (runId: string) => {
        await pool!.query(
          `DELETE FROM campaign_plan_draft_publications
           WHERE id = (
             SELECT p.id
             FROM campaign_plan_draft_publications p
             JOIN campaign_plan_draft_items i ON i.id = p.draft_item_id
             WHERE i.run_id = $1 AND i.draft_sequence = 1
             LIMIT 1
           )`,
          [runId]
        );
      }
    },
    {
      name: "extra-publication",
      mutate: async (runId: string) => {
        await pool!.query(
          `INSERT INTO campaign_plan_draft_publications (draft_item_id, channel, publication_format, planned_publish_at, platform_title)
           SELECT id, 'instagram', 'feed_image', (planned_content_date::text || 'T11:00:00+07:00')::timestamptz, 'Extra title'
           FROM campaign_plan_draft_items
           WHERE run_id = $1 AND draft_sequence = 1`,
          [runId]
        );
      }
    },
    {
      name: "timestamp-drift",
      mutate: async (runId: string) => {
        await pool!.query(
          `UPDATE campaign_plan_draft_publications p
           SET planned_publish_at = '2026-07-15T09:30:00+07:00',
               updated_at = now()
           FROM campaign_plan_draft_items i
           WHERE i.id = p.draft_item_id
             AND i.run_id = $1
             AND i.draft_sequence = 1
             AND p.channel = 'instagram'`,
          [runId]
        );
      }
    },
    {
      name: "immutable-drift",
      mutate: async (runId: string) => {
        await pool!.query(
          `UPDATE campaign_plan_draft_items
           SET content_pillar = 'education',
               updated_at = now()
           WHERE run_id = $1 AND draft_sequence = 1`,
          [runId]
        );
      }
    }
  ];

  for (const item of cases) {
    const { campaignId, runId } = await processReadyRun(`STRATEGY-${item.name}`, 5);
    await approveRun(runId);
    await item.mutate(runId);
    await assert.rejects(
      () => importApprovedCampaignPlanRun(runId),
      (error: any) => error?.code === "campaign_plan_import_state_inconsistent"
    );
    assert.deepEqual(await operationalCounts(campaignId), { content_items: 0, content_publications: 0 });
  }
});

maybeTest("atomic rollback failpoint dan retry sukses", async () => {
  for (const failpoint of ["after_content_items", "after_publications", "before_mapping", "before_finalize"] as CampaignPlanImportFailpoint[]) {
    const { campaignId, runId } = await processReadyRun(`ROLLBACK-${failpoint}`, 5);
    await approveRun(runId);
    await assert.rejects(
      () => importApprovedCampaignPlanRun(runId, { failpoint }),
      /Import gagal diproses/
    );
    const rolledBack = await pool!.query(
      `SELECT r.status, r.imported_at,
              (SELECT COUNT(*)::int FROM content_items WHERE campaign_id = $2) AS content_items,
              (SELECT COUNT(*)::int FROM content_publications p JOIN content_items i ON i.id = p.content_item_id WHERE i.campaign_id = $2) AS publications,
              (SELECT COUNT(*)::int FROM campaign_plan_draft_items WHERE run_id = $1 AND imported_content_item_id IS NOT NULL) AS mapped_items,
              (SELECT COUNT(*)::int FROM campaign_plan_draft_publications p JOIN campaign_plan_draft_items i ON i.id = p.draft_item_id WHERE i.run_id = $1 AND p.imported_publication_id IS NOT NULL) AS mapped_publications
       FROM campaign_plan_runs r
       WHERE r.id = $1`,
      [runId, campaignId]
    );
    assert.deepEqual(rolledBack.rows[0], {
      status: "approved",
      imported_at: null,
      content_items: 0,
      publications: 0,
      mapped_items: 0,
      mapped_publications: 0
    });
    const safeError = await pool!.query(`SELECT error_code, error_message FROM campaign_plan_runs WHERE id = $1`, [runId]);
    assert.equal(safeError.rows[0].error_code, "campaign_plan_import_failed");
    assert.equal(/postgresql:\/\/|DATABASE_URL|password=|stack|SELECT|INSERT|UPDATE/i.test(String(safeError.rows[0].error_message)), false);
    const retried = await importApprovedCampaignPlanRun(runId);
    assert.equal(retried.status, "imported");
    const cleared = await pool!.query(`SELECT error_code, error_message FROM campaign_plan_runs WHERE id = $1`, [runId]);
    assert.equal(cleared.rows[0].error_code, null);
    assert.equal(cleared.rows[0].error_message, null);
    assert.deepEqual(await operationalCounts(campaignId), { content_items: 5, content_publications: 25 });
  }
});

maybeTest("closeout exact field mapping, timezone calendar round-trip, dan HTML safety pages", async () => {
  const campaignId = await createCampaign("TZ", {
    start_date: "2026-07-15",
    end_date: "2026-07-15"
  });
  const run = await createCampaignPlanRun(campaignId, {
    requested_content_count: 1,
    selected_channels: ["instagram"],
    owner_brief: "Timezone audit.",
    default_posting_times: { instagram: "09:30" }
  });
  await processNextRun(pool!, loadWorkerConfig({ workerId: "import-tz", fakeMode: "valid" }));
  let review = await getCampaignPlanRunReview(run.id);
  const item = review.items[0];
  await editCampaignPlanDraftItem(item.id, editPayload(item, {
    title: `<script>alert("x")</script>`,
    owner_notes: `<script>alert("x")</script>`
  }));
  await approveRun(run.id);
  const imported = await importApprovedCampaignPlanRun(run.id);
  const contentItemId = imported.content_items[0].content_item_id;
  const exact = await pool!.query(
    `SELECT r.campaign_id AS draft_campaign_id,
            i.title AS draft_title,
            i.planned_content_date::text AS draft_date,
            i.product_code,
            ci.product_id,
            p.id AS expected_product_id,
            i.school_level,
            ci.school_level AS imported_school_level,
            i.color_code,
            ci.color_id,
            color.id AS expected_color_id,
            i.audience_segment,
            ci.audience_segment AS imported_audience_segment,
            i.target_audience,
            ci.target_audience AS imported_target_audience,
            i.content_pillar,
            ci.content_pillar AS imported_content_pillar,
            i.primary_offer_code,
            ci.primary_offer_id,
            offer.id AS expected_offer_id,
            i.primary_pain_point_code,
            ci.primary_pain_point_id,
            pain.id AS expected_pain_point_id,
            i.hook,
            ci.hook AS imported_hook,
            i.angle,
            ci.angle AS imported_angle,
            i.cta_text,
            ci.cta_text AS imported_cta_text,
            i.cta_keyword,
            ci.cta_keyword AS imported_cta_keyword,
            i.owner_notes,
            i.planning_reason,
            ci.notes,
            ci.production_status,
            dp.channel,
            cp.channel AS imported_channel,
            dp.publication_format,
            cp.publication_format AS imported_publication_format,
            dp.planned_publish_at,
            cp.planned_publish_at AS imported_planned_publish_at,
            dp.platform_title,
            cp.platform_title AS imported_platform_title,
            cp.platform_caption,
            cp.publication_status,
            cp.published_url,
            cp.published_at,
            cp.failure_reason
     FROM campaign_plan_draft_items i
     JOIN campaign_plan_runs r ON r.id = i.run_id
     JOIN content_items ci ON ci.id = i.imported_content_item_id
     LEFT JOIN products p ON p.code = i.product_code
     LEFT JOIN colors color ON color.code = i.color_code
     LEFT JOIN offers offer ON offer.code = i.primary_offer_code
     LEFT JOIN pain_points pain ON pain.code = i.primary_pain_point_code
     JOIN campaign_plan_draft_publications dp ON dp.draft_item_id = i.id
     JOIN content_publications cp ON cp.id = dp.imported_publication_id
     WHERE i.run_id = $1`,
    [run.id]
  );
  const row = exact.rows[0];
  assert.equal(row.draft_campaign_id, campaignId);
  assert.equal(row.draft_title, `<script>alert("x")</script>`);
  assert.equal(row.draft_date, "2026-07-15");
  assert.equal(row.product_id, row.expected_product_id);
  assert.equal(row.school_level, row.imported_school_level);
  assert.equal(row.color_id, row.expected_color_id);
  assert.equal(row.audience_segment, row.imported_audience_segment);
  assert.equal(row.target_audience, row.imported_target_audience);
  assert.equal(row.content_pillar, row.imported_content_pillar);
  assert.equal(row.primary_offer_id, row.expected_offer_id);
  assert.equal(row.primary_pain_point_id, row.expected_pain_point_id);
  assert.equal(row.hook, row.imported_hook);
  assert.equal(row.angle, row.imported_angle);
  assert.equal(row.cta_text, row.imported_cta_text);
  assert.equal(row.cta_keyword, row.imported_cta_keyword);
  assert.equal(row.notes, `<script>alert("x")</script>`);
  assert.notEqual(row.notes, row.planning_reason);
  assert.equal(row.production_status, "planned");
  assert.equal(row.channel, row.imported_channel);
  assert.equal(row.publication_format, row.imported_publication_format);
  assert.equal(new Date(row.imported_planned_publish_at).toISOString(), "2026-07-15T02:30:00.000Z");
  assert.equal(new Date(row.planned_publish_at).toISOString(), new Date(row.imported_planned_publish_at).toISOString());
  assert.equal(row.platform_title, row.imported_platform_title);
  assert.equal(row.platform_caption, null);
  assert.equal(row.publication_status, "planned");
  assert.equal(row.published_url, null);
  assert.equal(row.published_at, null);
  assert.equal(row.failure_reason, null);

  const calendar = await getContentCalendar(new URL(`http://localhost/api/content-calendar?month=2026-07&campaign_id=${campaignId}`));
  assert.equal(calendar.counts.content_items, 1);
  assert.equal(calendar.counts.publications, 1);
  assert.equal(calendar.days[0].date, "2026-07-15");
  assert.equal(calendar.days[0].content_items[0].production_status, "planned");
  assert.equal(calendar.days[0].content_items[0].publications[0].publication_status, "planned");
  assert.equal(calendar.days[0].content_items[0].publications[0].planned_publish_at, "2026-07-15T02:30:00.000Z");
  assert.ok(calendar.days[0].content_items[0].publications[0].planned_publish_at_jakarta?.includes("2026-07-15 09:30:00 WIB"));

  const importHtml = renderCampaignPlanImportPage(await getCampaignPlanImportPreview(run.id), new URL("http://localhost/import"));
  const contentHtml = await renderContentItemDetailPage(await getContentItem(contentItemId), new URL("http://localhost/content"));
  const calendarHtml = renderContentCalendarPage(calendar, new URL("http://localhost/content-calendar?month=2026-07"));
  for (const html of [importHtml, contentHtml, calendarHtml]) {
    assert.ok(html.includes("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"));
    assert.equal(html.includes(`<script>alert("x")</script>`), false);
  }
});

maybeTest("closeout imported mapping corruption ditolak pada idempotent summary path", async () => {
  const corruptions = [
    {
      name: "item-null",
      mutate: async (runId: string) => {
        await pool!.query(
          `UPDATE campaign_plan_draft_items
           SET imported_content_item_id = NULL, imported_at = NULL, updated_at = now()
           WHERE run_id = $1 AND draft_sequence = 1`,
          [runId]
        );
      }
    },
    {
      name: "publication-null",
      mutate: async (runId: string) => {
        await pool!.query(
          `UPDATE campaign_plan_draft_publications p
           SET imported_publication_id = NULL, imported_at = NULL, updated_at = now()
           FROM campaign_plan_draft_items i
           WHERE i.id = p.draft_item_id AND i.run_id = $1 AND i.draft_sequence = 1
             AND p.channel = 'instagram'`,
          [runId]
        );
      }
    },
    {
      name: "duplicate-item",
      mutate: async (runId: string) => {
        const row = await pool!.query(
          `SELECT imported_content_item_id FROM campaign_plan_draft_items WHERE run_id = $1 AND draft_sequence = 1`,
          [runId]
        );
        await pool!.query(
          `UPDATE campaign_plan_draft_items
           SET imported_content_item_id = $2, updated_at = now()
           WHERE run_id = $1 AND draft_sequence = 2`,
          [runId, row.rows[0].imported_content_item_id]
        );
      }
    },
    {
      name: "duplicate-publication",
      mutate: async (runId: string) => {
        const row = await pool!.query(
          `SELECT p.imported_publication_id
           FROM campaign_plan_draft_publications p
           JOIN campaign_plan_draft_items i ON i.id = p.draft_item_id
           WHERE i.run_id = $1 AND i.draft_sequence = 1 AND p.channel = 'instagram'`,
          [runId]
        );
        await pool!.query(
          `UPDATE campaign_plan_draft_publications p
           SET imported_publication_id = $2, updated_at = now()
           FROM campaign_plan_draft_items i
           WHERE i.id = p.draft_item_id AND i.run_id = $1 AND i.draft_sequence = 2
             AND p.channel = 'instagram'`,
          [runId, row.rows[0].imported_publication_id]
        );
      }
    },
    {
      name: "wrong-campaign",
      mutate: async (runId: string) => {
        const otherCampaignId = await createCampaign("CORRUPT-OTHER");
        const other = await createContentItem({
          campaign_id: otherCampaignId,
          title: "Other campaign content",
          planned_content_date: "2026-07-01",
          audience_segment: "end_user_school",
          target_audience: "TU Sekolah",
          content_pillar: "education",
          hook: "Other hook",
          angle: "Other angle",
          cta_text: "Hubungi admin"
        });
        await pool!.query(
          `UPDATE campaign_plan_draft_items
           SET imported_content_item_id = $2, updated_at = now()
           WHERE run_id = $1 AND draft_sequence = 1`,
          [runId, other.id]
        );
      }
    }
  ];

  for (const corruption of corruptions) {
    const { campaignId, runId } = await processReadyRun(`CORRUPT-${corruption.name}`, 5);
    await approveRun(runId);
    await importApprovedCampaignPlanRun(runId);
    const before = await operationalCounts(campaignId);
    await corruption.mutate(runId);
    await assert.rejects(
      () => importApprovedCampaignPlanRun(runId),
      (error: any) => error?.code === "campaign_plan_import_state_inconsistent" && error?.statusCode === 409
    );
    await assert.rejects(
      () => getCampaignPlanImportPreview(runId),
      (error: any) => error?.code === "campaign_plan_import_state_inconsistent" && error?.statusCode === 409
    );
    assert.deepEqual(await operationalCounts(campaignId), before);
  }
});

maybeTest("reference drift, campaign drift, invalid state, dan mapping consistency ditolak tanpa operational write", async () => {
  const referenceCase = await processReadyRun("REFDRIFT", 5);
  await approveRun(referenceCase.runId);
  const ref = await pool!.query<{ table_name: string; id: string }>(
    `SELECT 'products' AS table_name, p.id
     FROM campaign_plan_draft_items i
     JOIN products p ON p.code = i.product_code
     WHERE i.run_id = $1 AND i.product_code IS NOT NULL
     LIMIT 1`,
    [referenceCase.runId]
  );
  assert.ok(ref.rows[0]);
  changedReferenceRows.push({ table: ref.rows[0].table_name, id: ref.rows[0].id });
  await pool!.query(`UPDATE products SET active = false, updated_at = now() WHERE id = $1`, [ref.rows[0].id]);
  await assert.rejects(
    () => importApprovedCampaignPlanRun(referenceCase.runId),
    (error: any) => error?.code === "campaign_plan_reference_unavailable"
  );
  assert.deepEqual(await operationalCounts(referenceCase.campaignId), { content_items: 0, content_publications: 0 });
  await cleanup();

  const codeDrift = await processReadyRun("CODEDRIFT", 5);
  await approveRun(codeDrift.runId);
  await pool!.query(`UPDATE campaigns SET code = code || '-CHANGED', updated_at = now() WHERE id = $1`, [codeDrift.campaignId]);
  await assert.rejects(() => importApprovedCampaignPlanRun(codeDrift.runId), (error: any) => error?.code === "campaign_plan_campaign_changed");
  assert.deepEqual(await operationalCounts(codeDrift.campaignId), { content_items: 0, content_publications: 0 });

  const dateDrift = await processReadyRun("DATEDRIFT", 5);
  await approveRun(dateDrift.runId);
  await pool!.query(`UPDATE campaigns SET start_date = '2026-08-01', end_date = '2026-08-30', updated_at = now() WHERE id = $1`, [dateDrift.campaignId]);
  await assert.rejects(() => importApprovedCampaignPlanRun(dateDrift.runId), (error: any) => error?.code === "campaign_plan_date_outside_campaign");
  assert.deepEqual(await operationalCounts(dateDrift.campaignId), { content_items: 0, content_publications: 0 });

  const statusDrift = await processReadyRun("STATUSDRIFT", 5);
  await approveRun(statusDrift.runId);
  await pool!.query(`UPDATE campaigns SET status = 'completed', updated_at = now() WHERE id = $1`, [statusDrift.campaignId]);
  await assert.rejects(() => importApprovedCampaignPlanRun(statusDrift.runId), (error: any) => error?.code === "campaign_plan_run_not_importable");
  assert.deepEqual(await operationalCounts(statusDrift.campaignId), { content_items: 0, content_publications: 0 });

  const nameDrift = await processReadyRun("NAMEDRIFT", 5);
  await approveRun(nameDrift.runId);
  await pool!.query(`UPDATE campaigns SET name = name || ' Updated', notes = 'Updated only', updated_at = now() WHERE id = $1`, [nameDrift.campaignId]);
  assert.equal((await importApprovedCampaignPlanRun(nameDrift.runId)).status, "imported");

  for (const status of ["queued", "generating", "validation_failed", "ready_for_review", "failed", "rejected", "cancelled"]) {
    const stateCase = await processReadyRun(`STATE-${status}`, 5);
    await pool!.query(`UPDATE campaign_plan_runs SET status = $2, approved_at = NULL, updated_at = now() WHERE id = $1`, [stateCase.runId, status]);
    await assert.rejects(() => importApprovedCampaignPlanRun(stateCase.runId), (error: any) => error?.code === "campaign_plan_run_not_importable");
    assert.deepEqual(await operationalCounts(stateCase.campaignId), { content_items: 0, content_publications: 0 });
    await pool!.query(
      `UPDATE campaign_plan_runs
       SET status = 'cancelled',
           claimed_at = NULL,
           claimed_by = NULL,
           heartbeat_at = NULL,
           lease_expires_at = NULL,
           updated_at = now()
       WHERE id = $1`,
      [stateCase.runId]
    );
  }

  const pendingCase = await processReadyRun("PENDING", 5);
  await pool!.query(`UPDATE campaign_plan_runs SET status = 'approved', approved_at = now(), updated_at = now() WHERE id = $1`, [pendingCase.runId]);
  await assert.rejects(() => importApprovedCampaignPlanRun(pendingCase.runId), (error: any) => error?.code === "pending_draft_reviews_exist");

  const noApprovedCase = await processReadyRun("NOAPPROVED", 5);
  let review = await getCampaignPlanRunReview(noApprovedCase.runId);
  for (const item of review.items) {
    await rejectCampaignPlanDraftItem(item.id, { expected_revision_number: item.revision_number });
  }
  await pool!.query(`UPDATE campaign_plan_runs SET status = 'approved', approved_at = now(), updated_at = now() WHERE id = $1`, [noApprovedCase.runId]);
  await assert.rejects(() => importApprovedCampaignPlanRun(noApprovedCase.runId), (error: any) => error?.code === "no_approved_draft_items");

  const invalidCase = await processReadyRun("INVALID", 5);
  await approveRun(invalidCase.runId);
  await pool!.query(
    `UPDATE campaign_plan_draft_items
     SET validation_errors = '[{"code":"test_invalid","message":"Invalid","path":"items.0.title"}]'::jsonb,
         updated_at = now()
     WHERE run_id = $1 AND draft_sequence = 1`,
    [invalidCase.runId]
  );
  await assert.rejects(() => importApprovedCampaignPlanRun(invalidCase.runId), (error: any) => error?.code === "approved_draft_item_invalid");

  const inconsistentCase = await processReadyRun("INCONSISTENT", 5);
  await approveRun(inconsistentCase.runId);
  const manual = await createContentItem({
    campaign_id: inconsistentCase.campaignId,
    title: "Partial mapping",
    planned_content_date: "2026-07-01",
    audience_segment: "end_user_school",
    target_audience: "TU Sekolah",
    content_pillar: "education",
    hook: "Partial hook",
    angle: "Partial angle",
    cta_text: "Hubungi admin"
  });
  await pool!.query(
    `UPDATE campaign_plan_draft_items
     SET imported_content_item_id = $2, imported_at = now(), updated_at = now()
     WHERE run_id = $1 AND draft_sequence = 1`,
    [inconsistentCase.runId, manual.id]
  );
  await assert.rejects(() => importApprovedCampaignPlanRun(inconsistentCase.runId), (error: any) => error?.code === "campaign_plan_import_state_inconsistent");
});

maybeTest("direct nullable reference drift ditolak karena strategy immutable", async () => {
  const { campaignId, runId } = await processReadyRun("NULLREF", 5);
  await approveRun(runId);
  await pool!.query(
    `UPDATE campaign_plan_draft_items
     SET product_code = NULL,
         color_code = NULL,
         primary_offer_code = NULL,
         primary_pain_point_code = NULL,
         updated_at = now()
     WHERE run_id = $1 AND draft_sequence = 1`,
    [runId]
  );
  await assert.rejects(
    () => importApprovedCampaignPlanRun(runId),
    (error: any) => error?.code === "campaign_plan_import_state_inconsistent"
  );
  assert.deepEqual(await operationalCounts(campaignId), { content_items: 0, content_publications: 0 });
});
