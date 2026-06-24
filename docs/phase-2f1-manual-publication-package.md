# Phase 2F.1 Manual Publication Package Foundation

## Baseline

- Branch: `phase-2f1-manual-publication-package`
- Baseline tag: `phase-2e6-complete`
- Scope: DB-only manual publication package foundation for approved video handoff records.
- Runtime date: 2026-06-24

## Implementation Summary

- Added migration `migrations/016_phase2f_manual_publication_packages.sql`.
- Added DB-only package tables:
  - `manual_publication_packages`
  - `manual_publication_package_channels`
- Added service, validation, and typed error modules:
  - `apps/web/src/manual-publication-package-service.ts`
  - `apps/web/src/manual-publication-package-errors.ts`
  - `apps/web/src/validation/manual-publication-package-validation.ts`
- Added page/API routes and views:
  - `apps/web/src/routes/manual-publication-package-api-routes.ts`
  - `apps/web/src/routes/manual-publication-package-page-routes.ts`
  - `apps/web/src/views/manual-publication-package-pages.ts`

## Tables / Constraints / Indexes

`manual_publication_packages`:

- Unique `handoff_id`.
- Unique `promotion_id`.
- Status values: `draft_package`, `ready_manual_publish`, `published_manually`, `hold`, `needs_revision`, `archived`.
- Approved output snapshot must be guarded `smoke/*.mp4`, with no absolute path, backslash, or traversal.
- Size snapshot is nullable or non-negative.
- SHA snapshot is nullable or 64 lowercase hex chars.
- Indexes: handoff, promotion, content item, package status, created time.

`manual_publication_package_channels`:

- Unique `(package_id, channel)`.
- Channels: `instagram`, `facebook`, `tiktok`, `youtube`.
- Channel statuses: `draft_channel`, `ready_manual_publish`, `published_manually`, `skipped`, `hold`, `archived`.
- Formats: `standard_video`, `reel`, `short`, `feed_video`, `story`.
- Indexes: package, content item, channel, channel status, planned publish time.

## Routes / APIs Added

Pages:

- `GET /publication-packages`
- `GET /publication-packages/:packageId`
- `GET /approved-videos/:promotionId/publication-package/new`
- `POST /approved-videos/:promotionId/publication-package/create`
- `POST /publication-packages/:packageId/update`
- `POST /publication-packages/:packageId/status/ready`
- `POST /publication-packages/:packageId/status/hold`
- `POST /publication-packages/:packageId/status/needs-revision`
- `POST /publication-packages/:packageId/status/published-manually`
- `POST /publication-packages/:packageId/status/archive`
- `POST /publication-packages/:packageId/channels/:channel/update`

APIs:

- `GET /api/publication-packages`
- `GET /api/publication-packages/:packageId`
- `POST /api/approved-videos/:promotionId/publication-package/create`
- `POST /api/publication-packages/:packageId/update`
- `POST /api/publication-packages/:packageId/status/ready`
- `POST /api/publication-packages/:packageId/status/hold`
- `POST /api/publication-packages/:packageId/status/needs-revision`
- `POST /api/publication-packages/:packageId/status/published-manually`
- `POST /api/publication-packages/:packageId/status/archive`
- `POST /api/publication-packages/:packageId/channels/:channel/update`

## Lifecycle Behavior

- GET/list/context operations do not create package rows.
- Package creation requires a `video_approved_handoff_records` row with `handoff_status = ready_for_manual_publish`.
- Handoff must reference `promotion_status = succeeded`.
- Approved output must resolve inside `storage/approved-videos/smoke`, exist, be regular, non-empty, and match DB SHA when a hash is present.
- Package rows store manual caption/copy fields only.
- Channel rows store selected manual channels and manual status fields only.
- `published_manually` means the user posted outside the system and recorded it manually. It does not call a social API and does not create `content_publications`.
- Duplicate package creation for the same handoff or promotion is blocked.

## Runtime Smoke Evidence

- Handoff id: `0aa5fea7-6d61-44be-8326-07c68fc2c7d3`
- Handoff status: `ready_for_manual_publish`
- Promotion id: `c40e7f07-13b1-4dbf-b5e8-a294252d0eea`
- Reviewed attempt id: `f087e2eb-9df8-4161-a4e2-31f125d57534`
- Review row id: `19d3949b-1126-4b8d-b7d6-99d406fd8463`
- Runtime package id: `65cd2ec9-a33b-474c-b5de-c5e450e82407`
- Runtime package status: `ready_manual_publish`
- Approved output snapshot:
  - `smoke/p2e3-smoke-1782280783214-p2e3-smoke-1782280783214-d155392f-20260624060004-f087e2eb-approved-20260624070320.mp4`
  - Size: `5,032,913` bytes
  - SHA-256: `0a4dc26de2222f4814c0409021ebd21bb346e09c353ad9ca998ca94fe90f7cb7`

Runtime channel rows:

- `facebook`: `draft_channel`, `feed_video`
- `instagram`: `published_manually`, `reel`, manual URL `https://instagram.com/p/manual-phase-2f1-smoke`
- `tiktok`: `draft_channel`, `short`
- `youtube`: `draft_channel`, `short`

Runtime route checks:

- `GET /publication-packages` returned `200`.
- `GET /approved-videos/c40e7f07-13b1-4dbf-b5e8-a294252d0eea/publication-package/new` returned `200`.
- `GET /api/publication-packages` returned an empty list before package creation.
- `POST /api/approved-videos/c40e7f07-13b1-4dbf-b5e8-a294252d0eea/publication-package/create` created the package.
- `POST /api/publication-packages/65cd2ec9-a33b-474c-b5de-c5e450e82407/status/ready` set package status to `ready_manual_publish`.
- `POST /api/publication-packages/65cd2ec9-a33b-474c-b5de-c5e450e82407/channels/instagram/update` recorded a DB-only manual channel publish.
- `GET /publication-packages/65cd2ec9-a33b-474c-b5de-c5e450e82407` returned `200`.
- `GET /api/publication-packages/65cd2ec9-a33b-474c-b5de-c5e450e82407` returned `200`.

## File / Row Safety Evidence

Approved output stat before and after:

- `storage/approved-videos/smoke/p2e3-smoke-1782280783214-p2e3-smoke-1782280783214-d155392f-20260624060004-f087e2eb-approved-20260624070320.mp4`
- Before: `size=5032913 mtime=1782284600 mode=81a4`
- After: `size=5032913 mtime=1782284600 mode=81a4`

Draft output stat before and after:

- `storage/draft-videos/smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4`
- Before: `size=5032913 mtime=1782280811 mode=81a4`
- After: `size=5032913 mtime=1782280811 mode=81a4`

Source footage stats before and after were unchanged:

- `storage/footage/smoke/pesona-smoke-001.mp4 size=3784328`
- `storage/footage/smoke/pesona-smoke-002.mp4 size=1350453`
- `storage/footage/smoke/pesona-smoke-003.mp4 size=1203310`

DB row safety:

- Handoff row stayed `ready_for_manual_publish`; `updated_at` stayed `2026-06-24T07:37:29.333Z`.
- Promotion row stayed `succeeded`; `updated_at` stayed `2026-06-24T07:03:20.121Z`.
- Attempt row stayed `succeeded`; `updated_at` stayed `2026-06-24T06:00:11.098Z`.
- Review row stayed `approved`; `updated_at` stayed `2026-06-24T06:36:52.995Z`.
- `content_publications` count for the content item stayed `0`.

No MP4 was created, copied, moved, renamed, deleted, or edited in Phase 2F.1.

## Validation Results

- `docker compose --env-file .env.local -f docker-compose.dev.yml config`: passed.
- Expected services were running.
- Postgres health: passed.
- Redis health: passed.
- `npm run db:migrate`: applied `016_phase2f_manual_publication_packages.sql`.
- Migration 016 verified in `schema_migrations`.
- Package tables verified with `to_regclass`.
- `npm run test:footage-catalog`: passed, 86 tests.
- `npm run check`: passed.
- `git diff --check`: passed.
- `git diff --name-only | grep "workers/video" || true`: no output.

## Safety Confirmation

- No OpenAI live call.
- No upload, scheduler, publisher, social API call, auto-posting, queue, or worker daemon was added.
- No Meta, TikTok, YouTube, Google API, Axios, or fetch integration was added.
- `workers/video` was not modified.
- Runtime package service performs read-only approved output stat/hash checks and writes only to `manual_publication_packages` and `manual_publication_package_channels`.
- `content_publications` was not mutated.
- Safety grep findings were non-blocking:
  - `createReadStream` is used only for read-only SHA-256.
  - Social channel names appear only as enum values, labels, URLs in runtime smoke evidence, or test assertions.
  - `upload`, `scheduler`, `publisher`, and `OpenAI` appear in UI safety notices and tests.
  - `mkdir`, `writeFile`, and `rm` appear in tests for temporary fixtures and cleanup only.
  - Existing skeleton checks still mention prior OpenAI-related files.

## Warnings

- Non-blocking: `GET /publication-packages` returned `500` before migration 016 was applied, as expected because the new tables did not exist yet. It returned `200` after migration.
- Non-blocking: one final optional `curl` to the package API hit a transient localhost connection refusal while the web-app container remained running; retry returned `200`.
- No blocking warnings.

## Final Summary

Phase 2F.1 passed. The manual publication package foundation is implemented, tested, and smoke-validated against the existing Phase 2E.6 ready handoff. The runtime smoke created one DB-only package with four channels, marked the package ready for manual publish, recorded one manual Instagram channel status, and did not mutate MP4 files, parent rows, or `content_publications`.

Next phase can build on these package rows as the manual posting package source of truth. Any real scheduler, publisher, upload, or social API integration should remain a separately approved phase.
