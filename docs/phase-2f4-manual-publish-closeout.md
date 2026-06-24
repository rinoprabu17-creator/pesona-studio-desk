# Phase 2F.4 Manual Publish Closeout

## Scope

- Phase: Phase 2F.4 Manual Publish Closeout DB-only
- Branch: `phase-2f4-manual-publish-closeout`
- Baseline tag: `phase-2f3-complete`
- Result: Pass

Phase 2F.4 adds a DB-only closeout certificate for manual publication packages. A package can be closed only when the derived manual publish report says every selected channel has an initialized checklist, all checklist items done, and manual post URL evidence present.

This phase does not publish, upload, schedule, call social APIs, call OpenAI, create `content_publications`, read MP4 files, or mutate any storage files.

## Migration

Added `migrations/018_phase2f_manual_publish_closeouts.sql`.

Table: `manual_publish_closeouts`

Key columns:

- `id`
- `package_id`
- `content_item_id`
- `closeout_status`
- `report_status_snapshot`
- `package_status_snapshot`
- `selected_channel_count_snapshot`
- `checklist_total_snapshot`
- `checklist_done_snapshot`
- `evidence_count_snapshot`
- `manual_url_channel_count_snapshot`
- `channels_with_manual_url_snapshot`
- `missing_manual_url_channels_snapshot`
- `closed_by_name`
- `closeout_note`
- `closed_at`
- `created_at`
- `updated_at`

Constraints:

- `UNIQUE(package_id)`
- `closeout_status = 'closed'`
- `report_status_snapshot = 'ready_evidence_complete'`
- `selected_channel_count_snapshot > 0`
- `checklist_total_snapshot > 0`
- `checklist_done_snapshot = checklist_total_snapshot`
- `manual_url_channel_count_snapshot = selected_channel_count_snapshot`
- `missing_manual_url_channels_snapshot = ''`

Indexes:

- `package_id`
- `content_item_id`
- `closeout_status`
- `closed_at`
- `created_at`

Migration 018 is additive-only and creates only the closeout table and indexes.

## Implementation

Added closeout service, validation, API routes, page routes, and pages:

- `apps/web/src/manual-publish-closeout-service.ts`
- `apps/web/src/manual-publish-closeout-errors.ts`
- `apps/web/src/validation/manual-publish-closeout-validation.ts`
- `apps/web/src/routes/manual-publish-closeout-api-routes.ts`
- `apps/web/src/routes/manual-publish-closeout-page-routes.ts`
- `apps/web/src/views/manual-publish-closeout-pages.ts`

Updated route registration and navigation:

- `apps/web/src/server.ts`
- `apps/web/src/views/layout.ts`
- `apps/web/src/views/manual-publish-report-pages.ts`
- `apps/web/src/views/manual-publication-package-pages.ts`

Updated checks and test DB setup:

- `scripts/check-skeleton.mjs`
- `scripts/prepare-test-db.mjs`
- `tests/footage-catalog/footage-catalog.test.ts`

## Routes

API routes:

- `GET /api/manual-publish-closeouts`
- `GET /api/manual-publish-closeouts/:closeoutId`
- `GET /api/publication-packages/:packageId/closeout/eligibility`
- `POST /api/publication-packages/:packageId/closeout/create`

Page routes:

- `GET /manual-publish-closeouts`
- `GET /manual-publish-closeouts/:closeoutId`
- `GET /publication-packages/:packageId/closeout`
- `POST /publication-packages/:packageId/closeout/create`

Closeout routes are registered before generic package detail routes.

## Eligibility

Closeout eligibility is derived from the Phase 2F.3 manual publish report service.

Allowed only when:

- package exists
- no closeout already exists for the package
- `report_status = ready_evidence_complete`
- checklist total is greater than zero
- checklist done equals checklist total
- selected channel count is greater than zero
- manual URL channel count equals selected channel count
- missing manual URL channel list is empty

Duplicate closeout creation is blocked with a conflict response. The service does not update an existing closeout.

Closeout creation writes only one row in `manual_publish_closeouts`. It does not mutate package, channel, checklist, evidence, content publication, handoff, promotion, attempt, review, render, footage, or content rows.

## Snapshot Fields

Closeout rows snapshot:

- report status
- package status
- selected channel count
- checklist done and total
- evidence count
- manual URL channel count
- channels with manual URL
- missing manual URL channels
- closeout name/note metadata

## Runtime Smoke

Runtime package used:

- package id: `65cd2ec9-a33b-474c-b5de-c5e450e82407`
- content item id: `b41166c1-f7d1-462d-8e40-d3002f10d1d3`

This package was intentionally incomplete:

- report status: `checklist_incomplete`
- checklist: `3/32`
- evidence rows: `3`
- manual URL channels: `instagram`
- missing manual URL channels: `facebook`, `tiktok`, `youtube`

Routes checked:

- `GET /publication-packages/65cd2ec9-a33b-474c-b5de-c5e450e82407/closeout` -> `200`
- `GET /api/publication-packages/65cd2ec9-a33b-474c-b5de-c5e450e82407/closeout/eligibility` -> `200`
- `POST /api/publication-packages/65cd2ec9-a33b-474c-b5de-c5e450e82407/closeout/create` -> `400`
- `GET /manual-publish-closeouts` -> `200`
- `GET /api/manual-publish-closeouts` -> `200`

Blocked create result:

- error code: `manual_publish_closeout_not_ready`
- reason: report status was `checklist_incomplete`
- reason: checklist was `3/32`
- reason: missing manual URL channels were `facebook`, `tiktok`, `youtube`
- closeout rows created for runtime package: `0`

## DB Evidence

Before runtime route checks:

```json
{
  "content_item_id": "b41166c1-f7d1-462d-8e40-d3002f10d1d3",
  "closeouts": 0,
  "packages": 1,
  "channels": 4,
  "checklist": 32,
  "evidence": 3,
  "content_publications": 0
}
```

After runtime route checks:

```json
{
  "content_item_id": "b41166c1-f7d1-462d-8e40-d3002f10d1d3",
  "closeouts": 0,
  "runtime_closeouts": 0,
  "packages": 1,
  "channels": 4,
  "checklist": 32,
  "evidence": 3,
  "content_publications": 0
}
```

Runtime DB rows were unchanged. No `content_publications` row was created.

## Storage Evidence

Before and after storage listings matched.

Source footage:

```text
storage/footage/smoke/pesona-smoke-001.mp4 3784328 1782278276.0429051490 bytes
storage/footage/smoke/pesona-smoke-002.mp4 1350453 1782280287.2413194210 bytes
storage/footage/smoke/pesona-smoke-003.mp4 1203310 1782280334.6205186230 bytes
```

Draft videos:

```text
storage/draft-videos/.gitkeep 67 1781846550.1669778710 bytes
storage/draft-videos/smoke/p2e2-smoke-1782278550613-3cf17da5-20260624052944.mp4 3749627 1782278988.8381988150 bytes
storage/draft-videos/smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4 5032913 1782280811.0604014220 bytes
```

Approved videos:

```text
storage/approved-videos/.gitkeep 70 1781846550.1669778710 bytes
storage/approved-videos/smoke/p2e3-smoke-1782280783214-p2e3-smoke-1782280783214-d155392f-20260624060004-f087e2eb-approved-20260624070320.mp4 5032913 1782284600.0896123000 bytes
```

No MP4 was created, copied, moved, deleted, edited, or read by the closeout runtime path.

## Tests

Added/updated tests cover:

- missing package closeout eligibility
- incomplete runtime-style package blocked with clear reasons
- incomplete checklist rejection
- complete checklist with missing manual URL rejection
- successful closeout for complete isolated fixture
- snapshot correctness
- duplicate closeout rejection
- closeout-only write behavior
- list/detail API behavior
- route ordering
- closeout page safety notice
- no OpenAI, scheduler, publisher, upload, social API, queue, worker daemon, filesystem, or `workers/video` dependency in runtime closeout code

Validation results:

- `npm run test:footage-catalog` passed: 96 tests, 96 pass
- `npm run check` passed
- `git diff --check` passed

## Safety

Confirmed:

- closeout runtime service writes only `manual_publish_closeouts`
- no package/channel/checklist/evidence mutation
- no `content_publications` mutation
- no handoff/promotion/attempt/review mutation
- no storage mutation
- no MP4 read or write
- no OpenAI call
- no upload
- no scheduler
- no publisher
- no social API call
- no queue or worker daemon
- no `workers/video` file modified

Focused runtime safety grep found no disallowed runtime file operations or external API behavior. The only allowed write pattern in closeout runtime code is `INSERT INTO manual_publish_closeouts`.

## Warnings

- Non-blocking: runtime package remains intentionally incomplete, so runtime smoke proves the closeout is blocked. Positive closeout creation is covered by isolated tests.

## Next Phase Readiness

Phase 2F.4 is ready for owner review. The next phase can build on the closeout certificate as a DB-only terminal record without assuming any upload, scheduler, publisher, social API, OpenAI, or worker automation exists.
