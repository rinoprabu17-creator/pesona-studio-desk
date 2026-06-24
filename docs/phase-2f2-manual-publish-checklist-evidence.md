# Phase 2F.2 Manual Publish Checklist & Evidence Log

## Summary

- Phase: Phase 2F.2 Manual Publish Checklist & Evidence Log DB-only.
- Branch: `phase-2f2-manual-publish-checklist-evidence`.
- Baseline tag: `phase-2f1-complete`.
- Result: PASS.
- Scope: DB-only checklist items, text-only evidence logs, derived package completion summary, API/page routes, UI link from publication package detail, tests, and runtime smoke evidence.

No MP4 was created, copied, moved, renamed, deleted, edited, or read for screenshot evidence. No upload, scheduler, publisher, social platform call, OpenAI call, queue, or worker daemon was added.

## Migration

Added `migrations/017_phase2f_manual_publish_checklist_evidence.sql`.

Tables:

- `manual_publish_checklist_items`
  - One row per package channel checklist key.
  - Unique key: `(package_channel_id, checklist_key)`.
  - Channel values: `instagram`, `facebook`, `tiktok`, `youtube`.
  - Status values: `pending`, `done`, `skipped`, `blocked`.
  - Default keys: `video_file_confirmed`, `caption_ready`, `hashtags_ready`, `cta_ready`, `account_login_ready`, `manual_post_created`, `manual_url_recorded`, `final_visual_check`.
  - Indexed by package, package channel, content item, channel, status, done flag, and created time.
- `manual_publish_evidence_logs`
  - Text-only evidence rows for package channels.
  - Evidence values: `manual_post_url`, `screenshot_reference`, `admin_note`, `issue_note`, `confirmation_note`.
  - Indexed by package, package channel, content item, channel, evidence type, recorded time, and created time.

`npm run db:migrate` applied migration 017. Verification confirmed both new tables exist.

## Lifecycle

- GET/list/context operations do not create checklist or evidence rows.
- `initializeManualPublishChecklist(packageId)` creates missing default checklist items for existing package channels.
- Initialization is idempotent and does not overwrite existing rows.
- Checklist updates write one checklist row only.
- Evidence add writes one evidence row only.
- Completion summary is derived from package status, channel rows, checklist counts, evidence counts, and manual URL evidence presence.
- Parent package/channel rows are not changed by the 2F.2 service.
- `content_publications` is not changed.

## Routes And APIs

API routes added:

- `GET /api/publication-packages/:packageId/checklist`
- `POST /api/publication-packages/:packageId/checklist/initialize`
- `POST /api/publication-packages/:packageId/checklist/:checklistItemId/update`
- `POST /api/publication-packages/:packageId/evidence/:channel/add`
- `GET /api/publication-packages/:packageId/evidence`
- `GET /api/publication-packages/:packageId/completion-summary`

Page routes added:

- `GET /publication-packages/:packageId/checklist`
- `POST /publication-packages/:packageId/checklist/initialize`
- `POST /publication-packages/:packageId/checklist/:checklistItemId/update`
- `POST /publication-packages/:packageId/evidence/:channel/add`

The package detail page now links to the checklist page and shows checklist done/total, evidence count, manual URL channel count, and package status.

## Runtime Smoke Evidence

Existing Phase 2F.1 evidence used:

- Package id: `65cd2ec9-a33b-474c-b5de-c5e450e82407`
- Handoff id: `0aa5fea7-6d61-44be-8326-07c68fc2c7d3`
- Promotion id: `c40e7f07-13b1-4dbf-b5e8-a294252d0eea`
- Render attempt id: `f087e2eb-9df8-4161-a4e2-31f125d57534`
- Review id: `19d3949b-1126-4b8d-b7d6-99d406fd8463`
- Approved output: `storage/approved-videos/smoke/p2e3-smoke-1782280783214-p2e3-smoke-1782280783214-d155392f-20260624060004-f087e2eb-approved-20260624070320.mp4`
- Draft output: `storage/draft-videos/smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4`

Before DB counts:

- Checklist rows: 0.
- Evidence rows: 0.
- `content_publications` rows for the content item: 0.

Runtime actions:

- Opened checklist page: HTTP 200.
- Opened checklist API: HTTP 200.
- Opened completion summary API: HTTP 200.
- Confirmed reads created no checklist/evidence rows.
- Initialized checklist by API: HTTP 201.
- Marked Instagram `caption_ready`, `manual_url_recorded`, and `final_visual_check` as `done` by API: HTTP 200 each.
- Added three Instagram text-only evidence rows by API: `manual_post_url`, `screenshot_reference`, and `admin_note`: HTTP 201 each.

After DB counts:

- Checklist rows: 32.
- Done checklist rows: 3.
- Evidence rows: 3.
- Manual URL evidence channels: 1 (`instagram`).
- `content_publications` rows for the content item: 0.

Completion summary:

- Package status: `ready_manual_publish`.
- Selected channels: 4.
- Checklist done/total: 3/32.
- Pending checklist rows: 29.
- Evidence count: 3.
- Channels with manual URL evidence: `instagram`.

## File Safety

Approved output stat before and after:

- Path: `storage/approved-videos/smoke/p2e3-smoke-1782280783214-p2e3-smoke-1782280783214-d155392f-20260624060004-f087e2eb-approved-20260624070320.mp4`
- Size: 5,032,913 bytes.
- Mtime epoch: 1782284600.
- Type: regular file.

Draft output stat before and after:

- Path: `storage/draft-videos/smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4`
- Size: 5,032,913 bytes.
- Mtime epoch: 1782280811.
- Type: regular file.

Source footage stats before and after:

- `storage/footage/smoke/pesona-smoke-001.mp4`: 3,784,328 bytes, mtime 1782278276.0429051490.
- `storage/footage/smoke/pesona-smoke-002.mp4`: 1,350,453 bytes, mtime 1782280287.2413194210.
- `storage/footage/smoke/pesona-smoke-003.mp4`: 1,203,310 bytes, mtime 1782280334.6205186230.

Confirmed unchanged:

- Approved MP4 file stat.
- Draft MP4 file stat.
- Source footage file stats.
- Package row timestamp.
- Package channel row timestamps.
- Handoff row timestamp.
- Promotion row timestamp.
- Attempt row timestamp.
- Review row timestamp.
- `content_publications` count.

## Tests And Validation

Commands run:

- `git branch --show-current`: `phase-2f2-manual-publish-checklist-evidence`.
- `git merge-base --is-ancestor phase-2f1-complete HEAD`: passed.
- `git status --short`: clean before changes.
- `docker compose --env-file .env.local -f docker-compose.dev.yml config`: passed.
- `docker compose --env-file .env.local -f docker-compose.dev.yml ps`: expected services running.
- `docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build web-app`: passed; web app rebuilt only.
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec postgres pg_isready -U pesona -d pesona_studio`: passed.
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec redis redis-cli ping`: `PONG`.
- `npm run db:migrate`: migration 017 applied.
- `npm run test:footage-catalog`: 91 tests passed.
- `git diff --check`: passed.
- `npm run check`: passed.

Tests added or updated cover:

- Missing package rejection.
- Read context has no row creation side effects.
- Default checklist initialization count and idempotency.
- Checklist update writes only the checklist row.
- Checklist/evidence validation.
- Manual URL requires `http` or `https`.
- Screenshot reference remains text-only.
- Evidence add does not mutate package, channel, parent rows, files, or `content_publications`.
- Completion summary counts checklist, evidence, and manual URL evidence.
- API/page route ordering.
- Package detail checklist link and summary.
- Checklist page safety notice and forms.
- No OpenAI, social platform call, scheduler, publisher, upload, queue, worker daemon, or `workers/video` dependency.

## Safety Scan

Changed runtime files were scanned for risky calls and forbidden integrations. Findings were either absent or allowed as enum/text labels and test fixture text. The checklist service has no filesystem import and performs no storage reads or writes.

Documentation sensitive-pattern scan passed.

`workers/video` was not modified.

## Warnings

- Non-blocking: Runtime package channel `instagram` already had `channel_status = published_manually` from Phase 2F.1 evidence. Phase 2F.2 did not change it.
- Non-blocking: Evidence values are manual text records only; no external verification or file attachment exists in this phase by design.

## Next Phase Readiness

The system now has a DB-only manual publish checklist and evidence log foundation. Future phases can build manual completion or reporting behavior from these rows without requiring upload, scheduler, publisher, social platform calls, OpenAI calls, queue behavior, or file mutation.
