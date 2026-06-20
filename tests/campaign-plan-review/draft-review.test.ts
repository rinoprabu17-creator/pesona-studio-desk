import test from "node:test";
import assert from "node:assert/strict";
import pg from "pg";
import { createCampaignPlanRun } from "../../apps/web/src/campaign-plan-run-service.ts";
import {
  approveAllReadyDraftItems,
  approveCampaignPlanDraftItem,
  approveCampaignPlanRun,
  editCampaignPlanDraftItem,
  getCampaignPlanDraftItem,
  getCampaignPlanRunReview,
  rejectCampaignPlanDraftItem,
  rejectCampaignPlanRun
} from "../../apps/web/src/campaign-plan-review-service.ts";
import { closeDatabase } from "../../apps/web/src/db.ts";
import { renderCampaignPlanReviewPage } from "../../apps/web/src/views/campaign-plan-review-pages.ts";
import { processNextRun } from "../../workers/campaign-planner/src/worker.ts";
import { loadWorkerConfig } from "../../workers/campaign-planner/src/lease.ts";

const databaseUrl = process.env.TEST_DATABASE_URL;
const shouldRun = Boolean(databaseUrl);
const { Pool } = pg;
const pool = databaseUrl ? new Pool({ connectionString: databaseUrl, max: 8 }) : null;
const testCampaignPrefix = `REVIEW-${process.pid}-`;
const campaignIds: string[] = [];

function maybeTest(name: string, fn: Parameters<typeof test>[1]) {
  test(name, { skip: shouldRun ? false : "TEST_DATABASE_URL tidak tersedia." }, fn);
}

async function createCampaign(codeSuffix: string) {
  const result = await pool!.query<{ id: string }>(
    `INSERT INTO campaigns (code, name, start_date, end_date, target_audience, status)
     VALUES ($1, $2, '2026-07-01', '2026-07-30', 'TU Sekolah', 'active')
     RETURNING id`,
    [`${testCampaignPrefix}${codeSuffix}-${Date.now()}`, `Review ${codeSuffix}`]
  );
  campaignIds.push(result.rows[0].id);
  return result.rows[0].id;
}

async function cleanup() {
  if (!pool) return;
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

function runInput(count = 30) {
  return {
    requested_content_count: count,
    selected_channels: ["instagram", "facebook", "tiktok", "youtube", "whatsapp_status"],
    owner_brief: "Review test.",
    default_posting_times: {
      instagram: "09:00",
      facebook: "09:15",
      tiktok: "19:00",
      youtube: "19:15",
      whatsapp_status: "07:00"
    }
  };
}

async function createReadyRun(code: string, count = 30) {
  const campaignId = await createCampaign(code);
  const run = await createCampaignPlanRun(campaignId, runInput(count));
  const started = Date.now();
  while (Date.now() - started < 5000) {
    const processed = await processNextRun(pool!, loadWorkerConfig({ workerId: `review-${code}`, fakeMode: "valid" }));
    const status = await pool!.query(`SELECT status FROM campaign_plan_runs WHERE id = $1`, [run.id]);
    if (status.rows[0]?.status === "ready_for_review") return { campaignId, runId: run.id };
    if (!processed.processed) await new Promise((resolve) => setTimeout(resolve, 25));
  }
  assert.fail(`Run ${run.id} tidak mencapai ready_for_review.`);
}

function editPayload(item: any, overrides: Record<string, unknown> = {}) {
  const youtube = item.publications.find((publication: any) => publication.channel === "youtube");
  return {
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
    youtube_platform_title: youtube?.platform_title,
    owner_notes: item.owner_notes,
    ...overrides
  };
}

async function operationalCounts(campaignId: string) {
  const result = await pool!.query(
    `SELECT
       (SELECT COUNT(*)::int FROM content_items WHERE campaign_id = $1) AS items,
       (SELECT COUNT(*)::int
        FROM content_publications p
        JOIN content_items i ON i.id = p.content_item_id
        WHERE i.campaign_id = $1) AS publications`,
    [campaignId]
  );
  return result.rows[0];
}

maybeTest("review lifecycle, concurrency, guards, no import, dan HTML escaping", async () => {
  const { campaignId, runId } = await createReadyRun("LIFE", 30);
  const beforeSnapshots = await pool!.query(`SELECT input_snapshot, strategy_snapshot FROM campaign_plan_runs WHERE id = $1`, [runId]);
  let review = await getCampaignPlanRunReview(runId);
  assert.equal(review.items.length, 30);
  assert.equal(review.summary.total_publications, 150);
  assert.equal(review.summary.pending_review, 30);
  assert.equal(review.summary.progress_percent, 0);
  assert.equal("input_snapshot" in review, false);
  assert.equal("strategy_snapshot" in review, false);

  const first = review.items[0];
  await assert.rejects(
    () => editCampaignPlanDraftItem(first.id, { ...editPayload(first), draft_sequence: 99 }),
    /Field strategy tidak boleh diubah/
  );

  review = await editCampaignPlanDraftItem(first.id, editPayload(first, { title: "Judul Review Valid 1" }));
  let edited = review.items.find((item: any) => item.id === first.id);
  assert.equal(edited.revision_number, first.revision_number + 1);
  assert.equal(edited.review_status, "pending_review");

  review = await approveCampaignPlanDraftItem(first.id, { expected_revision_number: edited.revision_number });
  edited = review.items.find((item: any) => item.id === first.id);
  assert.equal(edited.review_status, "approved");
  assert.equal(edited.revision_number, first.revision_number + 1);
  await assert.rejects(
    () => approveCampaignPlanDraftItem(first.id, { expected_revision_number: first.revision_number }),
    /Draft sudah berubah/
  );

  review = await editCampaignPlanDraftItem(first.id, editPayload(edited, { title: "Judul Review Valid 2" }));
  edited = review.items.find((item: any) => item.id === first.id);
  assert.equal(edited.review_status, "pending_review");

  review = await rejectCampaignPlanDraftItem(first.id, { expected_revision_number: edited.revision_number, owner_notes: "Tolak dulu" });
  edited = review.items.find((item: any) => item.id === first.id);
  assert.equal(edited.review_status, "rejected");
  assert.equal(edited.owner_notes, "Tolak dulu");

  review = await editCampaignPlanDraftItem(first.id, editPayload(edited, { owner_notes: "Catatan saja" }));
  edited = review.items.find((item: any) => item.id === first.id);
  assert.equal(edited.review_status, "rejected");
  const noteRevision = edited.revision_number;
  assert.equal(edited.owner_notes, "Catatan saja");

  review = await editCampaignPlanDraftItem(first.id, editPayload(edited, { title: "Judul Review Valid 3" }));
  edited = review.items.find((item: any) => item.id === first.id);
  assert.equal(edited.review_status, "pending_review");
  assert.equal(edited.revision_number, noteRevision + 1);

  const second = review.items[1];
  const [concurrentA, concurrentB] = await Promise.allSettled([
    editCampaignPlanDraftItem(second.id, editPayload(second, { title: "Concurrent A" })),
    editCampaignPlanDraftItem(second.id, editPayload(second, { title: "Concurrent B" }))
  ]);
  assert.equal([concurrentA, concurrentB].filter((result) => result.status === "fulfilled").length, 1);
  assert.equal([concurrentA, concurrentB].filter((result) => result.status === "rejected" && String((result as PromiseRejectedResult).reason?.code) === "stale_draft_revision").length, 1);

  const secondFresh = await getCampaignPlanDraftItem(second.id);
  await rejectCampaignPlanDraftItem(secondFresh.id, { expected_revision_number: secondFresh.revision_number });
  const secondRejected = await getCampaignPlanDraftItem(second.id);
  await approveCampaignPlanDraftItem(secondRejected.id, { expected_revision_number: secondRejected.revision_number });

  review = await getCampaignPlanRunReview(runId);
  const third = review.items[2];
  const staleTitle = third.title;
  await assert.rejects(
    () => editCampaignPlanDraftItem(third.id, editPayload(third, { title: review.items[3].title })),
    /Perubahan draft melanggar validasi/
  );
  assert.equal((await getCampaignPlanDraftItem(third.id)).title, staleTitle);

  await assert.rejects(
    () => editCampaignPlanDraftItem(third.id, editPayload(third, { hook: review.items[3].hook })),
    /Perubahan draft melanggar validasi/
  );
  await assert.rejects(
    () => editCampaignPlanDraftItem(third.id, editPayload(third, { hook: "Mockup dapat direvisi berkali-kali." })),
    /Perubahan draft melanggar validasi/
  );
  await assert.rejects(
    () => editCampaignPlanDraftItem(third.id, editPayload(third, { youtube_platform_title: "" })),
    /YouTube platform title wajib/
  );

  const summary = await approveAllReadyDraftItems(runId);
  assert.ok(summary.approved_count >= 29);
  assert.equal(summary.rejected_count, 0);
  review = await getCampaignPlanRunReview(runId);
  const pending = review.items.find((item: any) => item.review_status === "pending_review");
  if (pending) {
    await rejectCampaignPlanDraftItem(pending.id, { expected_revision_number: pending.revision_number });
  }
  const approved = await approveCampaignPlanRun(runId);
  assert.equal(approved.run.status, "approved");
  assert.equal(approved.message, "Rencana telah disetujui dan siap diimpor pada Phase 2A.4.");

  const approvedItem = approved.run.items.find((item: any) => item.review_status === "approved");
  await assert.rejects(
    () => editCampaignPlanDraftItem(approvedItem.id, editPayload(approvedItem, { title: "Tidak boleh" })),
    /Run tidak dapat direview/
  );
  await assert.rejects(
    () => approveAllReadyDraftItems(runId),
    /Run tidak dapat direview/
  );
  await assert.rejects(
    () => approveCampaignPlanRun(runId),
    /Run sudah disetujui/
  );
  await assert.rejects(
    () => createCampaignPlanRun(campaignId, runInput(5)),
    /Campaign masih memiliki plan run aktif/
  );

  const afterSnapshots = await pool!.query(`SELECT input_snapshot, strategy_snapshot FROM campaign_plan_runs WHERE id = $1`, [runId]);
  assert.deepEqual(afterSnapshots.rows[0].input_snapshot, beforeSnapshots.rows[0].input_snapshot);
  assert.deepEqual(afterSnapshots.rows[0].strategy_snapshot, beforeSnapshots.rows[0].strategy_snapshot);
  assert.deepEqual(await operationalCounts(campaignId), { items: 0, publications: 0 });
  const captions = await pool!.query(
    `SELECT COUNT(*)::int AS count
     FROM campaign_plan_draft_publications p
     JOIN campaign_plan_draft_items i ON i.id = p.draft_item_id
     WHERE i.run_id = $1 AND p.platform_caption IS NOT NULL`,
    [runId]
  );
  assert.equal(captions.rows[0].count, 0);

  const htmlRun = await getCampaignPlanRunReview(runId);
  htmlRun.items[0].title = `<script>globalThis.xss=1</script>`;
  const html = renderCampaignPlanReviewPage(htmlRun, new URL("http://localhost/review"));
  assert.ok(html.includes("&lt;script&gt;globalThis.xss=1&lt;/script&gt;"));
  assert.equal(html.includes("<script>globalThis.xss=1</script>"), false);
});

maybeTest("run approve guards, reject run terminal, dan rejected campaign bisa membuat run baru", async () => {
  const pendingCase = await createReadyRun("PENDING", 5);
  await assert.rejects(
    () => approveCampaignPlanRun(pendingCase.runId),
    /Masih ada draft yang menunggu review/
  );
  await rejectCampaignPlanRun(pendingCase.runId);
  const newRun = await createCampaignPlanRun(pendingCase.campaignId, runInput(5));
  assert.equal(newRun.status, "queued");

  const noApprovedCase = await createReadyRun("NOAPPROVED", 5);
  let review = await getCampaignPlanRunReview(noApprovedCase.runId);
  for (const item of review.items) {
    await rejectCampaignPlanDraftItem(item.id, { expected_revision_number: item.revision_number });
  }
  await assert.rejects(
    () => approveCampaignPlanRun(noApprovedCase.runId),
    /Minimal satu draft harus disetujui/
  );

  const mixedCase = await createReadyRun("MIXED", 5);
  review = await getCampaignPlanRunReview(mixedCase.runId);
  await approveCampaignPlanDraftItem(review.items[0].id, { expected_revision_number: review.items[0].revision_number });
  for (const item of review.items.slice(1)) {
    await rejectCampaignPlanDraftItem(item.id, { expected_revision_number: item.revision_number });
  }
  const [first, second] = await Promise.allSettled([
    approveCampaignPlanRun(mixedCase.runId),
    approveCampaignPlanRun(mixedCase.runId)
  ]);
  assert.equal([first, second].filter((result) => result.status === "fulfilled").length, 1);
  const final = await pool!.query(`SELECT status, approved_at, rejected_at FROM campaign_plan_runs WHERE id = $1`, [mixedCase.runId]);
  assert.equal(final.rows[0].status, "approved");
  assert.ok(final.rows[0].approved_at);
  assert.equal(final.rows[0].rejected_at, null);
});
