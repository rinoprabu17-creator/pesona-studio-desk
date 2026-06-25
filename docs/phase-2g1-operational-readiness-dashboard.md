# Phase 2G.1 Operational Readiness Dashboard

Branch: `phase-2g1-operational-readiness-dashboard`
Baseline tag: `phase-2f4-complete`

## Summary

Phase 2G.1 adds a DB-read-only operational readiness dashboard for owner/admin visibility across the Pesona Studio Desk pipeline. It summarizes content, footage, video draft, render, approved video, manual publication package, checklist/evidence, manual publish report readiness, and closeout state in one place.

No migration was added. `scripts/prepare-test-db.mjs` was not changed.

## Routes Added

- `GET /operational-readiness`
- `GET /api/operational-readiness`
- `GET /api/operational-readiness/summary`
- `GET /api/operational-readiness/pipeline`

## Dashboard Sections

- Safety notice: read-only dashboard, no upload, no scheduler, no publisher, no OpenAI, no social API, no file mutation, no `content_publications` mutation.
- System readiness summary.
- Pipeline readiness funnel.
- Manual publish readiness.
- Health warnings.
- Links to Approved Videos, Publication Packages, Manual Publish Report, Manual Closeouts, Content Calendar, Footage, and Content Items.

## Runtime Route Checks

Runtime smoke was run against the local Docker dev stack after rebuilding/recreating `web-app` only. `docker compose config --quiet` passed. Postgres and Redis were healthy.

`npm run db:migrate` was run safely and all migrations were skipped as already applied through `018_phase2f_manual_publish_closeouts.sql`.

Route results:

- `GET /operational-readiness`: `200`
- `GET /api/operational-readiness`: `200`
- `GET /api/operational-readiness/summary`: `200`
- `GET /api/operational-readiness/pipeline`: `200`

Requested package ID `65cd2ec9-a33b-474c-b5e8-a294252d0eea` was not present in the local runtime DB, so smoke used the current DB state.

## Runtime Counts

Before and after route calls were unchanged:

| Table | Before | After |
| --- | ---: | ---: |
| campaigns | 10 | 10 |
| content_items | 13 | 13 |
| footage_assets | 18 | 18 |
| content_publications | 0 | 0 |
| manual_publication_packages | 1 | 1 |
| manual_publication_package_channels | 4 | 4 |
| manual_publish_checklist_items | 32 | 32 |
| manual_publish_evidence_logs | 3 | 3 |
| manual_publish_closeouts | 0 | 0 |

`content_publications` remained unchanged at `0`.

## Runtime Payload Snapshot

Summary payload:

- total campaigns: 10
- total content items: 13
- total footage assets: 18
- total approved footage: 1
- content items with selected footage: 11
- content items with script plan: 9
- video draft jobs: 6
- render manifests: 5
- render preflight runs: 4
- render attempts: 4
- approved promotions: 1
- handoff records: 1
- manual publication packages: 1
- manual publication package channels: 4
- checklist items: 32
- evidence logs: 3
- closeouts: 0
- content publications: 0

Pipeline payload:

- content_items_total: 13
- with_footage_selection: 11
- with_script_plan: 9
- with_video_draft_job: 6
- with_render_manifest: 5
- with_succeeded_render_attempt: 2
- with_approved_promotion: 1
- with_ready_handoff: 1
- with_publication_package: 1
- with_checklist_initialized: 1
- with_manual_url_evidence: 1
- with_ready_evidence_complete_report: 0
- with_closeout: 0

Manual publish readiness payload:

- packages_total: 1
- packages_no_checklist: 0
- packages_checklist_incomplete: 1
- packages_missing_manual_url: 0
- packages_ready_evidence_complete: 0
- closeouts_total: 0
- blocked_closeout_candidates: 0

Health warnings: 1 non-blocking warning for incomplete manual publish readiness.

## Storage Listing

Before and after route calls were unchanged.

Source footage:

```text
storage/footage/smoke/pesona-smoke-001.mp4 3784328 bytes
storage/footage/smoke/pesona-smoke-002.mp4 1350453 bytes
storage/footage/smoke/pesona-smoke-003.mp4 1203310 bytes
```

Draft videos:

```text
storage/draft-videos/.gitkeep 67 bytes
storage/draft-videos/smoke/p2e2-smoke-1782278550613-3cf17da5-20260624052944.mp4 3749627 bytes
storage/draft-videos/smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4 5032913 bytes
```

Approved videos:

```text
storage/approved-videos/.gitkeep 70 bytes
storage/approved-videos/smoke/p2e3-smoke-1782280783214-p2e3-smoke-1782280783214-d155392f-20260624060004-f087e2eb-approved-20260624070320.mp4 5032913 bytes
```

No MP4 file was created, copied, moved, renamed, deleted, edited, or read by the operational readiness runtime. The smoke used directory listings only for before/after evidence.

## Safety Confirmation

- Runtime service uses SELECT-derived reads only.
- No `INSERT`, `UPDATE`, `DELETE`, `UPSERT`, `DROP`, `TRUNCATE`, or `ALTER` was added to operational readiness runtime code.
- No mutation of `content_items`, `content_publications`, manual publish tables, render/review/promotion/handoff tables, or footage tables.
- No upload, scheduler, publisher, social API, Google API, Meta API, TikTok API, YouTube API, OpenAI call, queue, or worker daemon was added.
- No API SDK was added.
- No runtime filesystem import was added for operational readiness.
- `workers/video` was not changed.

## Tests And Validation

Added/updated tests in `tests/footage-catalog/footage-catalog.test.ts` covering:

- API counts from existing fixtures.
- DB-read-only summary/API behavior with before/after counts.
- Pipeline funnel progression after isolated fixture creation through existing services.
- Manual publish readiness states: no checklist, incomplete checklist, missing manual URL, ready evidence complete, and closeout.
- Page route `200` and safety notice.
- API route order safety.
- No migration added and no prepare-test-db change.
- Runtime source scan for forbidden DB mutation, filesystem, worker, queue, social API, upload/publisher/scheduler behavior.

Validation results:

- `npm run test:footage-catalog`: passed, 102 tests.
- `npm run check`: passed.
- `npm run db:migrate`: no-op, all migrations skipped.
- `docker compose -f docker-compose.dev.yml config --quiet`: passed.

## Warnings

- Non-blocking: local runtime package ID `65cd2ec9-a33b-474c-b5e8-a294252d0eea` was absent.
- Non-blocking: local runtime data has one manual publish warning for incomplete checklist/report readiness.

## Next Phase Readiness

Phase 2G.1 is ready for owner review after final full validation. The next phase can build on the read-only dashboard without introducing publishing, scheduling, upload, AI generation, or worker behavior.
