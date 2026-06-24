# Phase 2F.3 Manual Publish Report / Export Board

## Summary

- Phase: Phase 2F.3 Manual Publish Report / Export Board DB-only/read-only.
- Branch: `phase-2f3-manual-publish-report-board`.
- Baseline tag: `phase-2f2-complete`.
- Result: PASS.
- Migration: none. Phase 2F.3 uses existing Phase 2F.1 and 2F.2 tables.

The report board derives package and channel reporting from manual publication packages, package channels, checklist items, evidence logs, content items, and campaigns. Runtime behavior is read-only.

## Routes And APIs

API routes added:

- `GET /api/manual-publish-report`
- `GET /api/manual-publish-report/summary`
- `GET /api/manual-publish-report/export.csv`
- `GET /api/manual-publish-report/packages/:packageId`

Page routes added:

- `GET /manual-publish-report`
- `GET /manual-publish-report/packages/:packageId`

The sidebar now includes `Manual Publish Report`. Publication package detail links to the matching report detail page.

## Report Fields

Package report fields:

- `package_id`
- `package_status`
- `content_item_id`
- `content_code`
- `content_title`
- `campaign_code`
- `campaign_name`
- `approved_output_relative_path_snapshot`
- `selected_channel_count`
- `checklist_total`
- `checklist_done`
- `checklist_pending`
- `checklist_skipped`
- `checklist_blocked`
- `evidence_count`
- `manual_url_channel_count`
- `channels_with_manual_url`
- `missing_manual_url_channels`
- `checklist_initialized`
- `checklist_complete`
- `manual_url_complete`
- `report_status`
- `created_at`
- `updated_at`

Channel report fields:

- `package_channel_id`
- `package_id`
- `channel`
- `channel_status`
- `publication_format`
- `checklist_total`
- `checklist_done`
- `checklist_pending`
- `checklist_blocked`
- `checklist_skipped`
- `evidence_count`
- `has_manual_post_url`
- `latest_manual_post_url`
- `latest_evidence_at`
- `missing_checklist_keys`
- `channel_report_status`

Derived statuses:

- `no_checklist`
- `checklist_incomplete`
- `missing_manual_url`
- `ready_evidence_complete`

Filters:

- `q`
- `package_status`
- `channel`
- `report_status`
- `channel_report_status`
- `missing_manual_url`
- `checklist_initialized`
- `limit` with default 50 and max 200.

## CSV Behavior

`GET /api/manual-publish-report/export.csv` returns CSV as the HTTP response body only. It does not write CSV to disk.

CSV columns:

- `package_id`
- `content_code`
- `content_title`
- `campaign_code`
- `package_status`
- `report_status`
- `selected_channel_count`
- `checklist_done`
- `checklist_total`
- `evidence_count`
- `manual_url_channel_count`
- `channels_with_manual_url`
- `missing_manual_url_channels`

CSV values escape commas, quotes, and newlines.

## Runtime Smoke Evidence

Runtime package id:

- `65cd2ec9-a33b-474c-b5de-c5e450e82407`

Runtime route checks:

- `GET /manual-publish-report`: 200.
- `GET /api/manual-publish-report`: 200.
- `GET /api/manual-publish-report/summary`: 200.
- `GET /api/manual-publish-report/export.csv`: 200.
- `GET /api/manual-publish-report/packages/65cd2ec9-a33b-474c-b5de-c5e450e82407`: 200.
- `GET /manual-publish-report/packages/65cd2ec9-a33b-474c-b5de-c5e450e82407`: 200.

Runtime derived result:

- Package count: 1.
- Total packages: 1.
- `no_checklist`: 0.
- `checklist_incomplete`: 1.
- `missing_manual_url`: 0.
- `ready_evidence_complete`: 0.
- Runtime package status: `checklist_incomplete`.
- Checklist done/total: 3/32.
- Evidence count: 3.
- Missing manual URL channels: `facebook`, `tiktok`, `youtube`.

CSV preview:

```text
package_id,content_code,content_title,campaign_code,package_status,report_status,selected_channel_count,checklist_done,checklist_total,evidence_count,manual_url_channel_count,channels_with_manual_url,missing_manual_url_channels
65cd2ec9-a33b-474c-b5de-c5e450e82407,P2E3-SMOKE-1782280783214,Smoke render multi-shot footage nyata Phase 2E.3,P2E3-SMOKE-1782280783214,ready_manual_publish,checklist_incomplete,4,3,32,3,1,instagram,facebook|tiktok|youtube
```

## DB Count Safety

Before route checks:

- `manual_publication_packages`: 1.
- `manual_publication_package_channels`: 4.
- `manual_publish_checklist_items`: 32.
- `manual_publish_evidence_logs`: 3.
- `content_publications` for runtime content item: 0.

After route checks:

- `manual_publication_packages`: 1.
- `manual_publication_package_channels`: 4.
- `manual_publish_checklist_items`: 32.
- `manual_publish_evidence_logs`: 3.
- `content_publications` for runtime content item: 0.

Confirmed unchanged. Report runtime did not insert, update, delete, or mutate any row.

## Storage Safety

Source footage listing before and after:

- `storage/footage/smoke/pesona-smoke-001.mp4` 3,784,328 bytes, mtime 1782278276.0429051490.
- `storage/footage/smoke/pesona-smoke-002.mp4` 1,350,453 bytes, mtime 1782280287.2413194210.
- `storage/footage/smoke/pesona-smoke-003.mp4` 1,203,310 bytes, mtime 1782280334.6205186230.

Draft output listing before and after:

- `storage/draft-videos/.gitkeep` 67 bytes, mtime 1781846550.1669778710.
- `storage/draft-videos/smoke/p2e2-smoke-1782278550613-3cf17da5-20260624052944.mp4` 3,749,627 bytes, mtime 1782278988.8381988150.
- `storage/draft-videos/smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4` 5,032,913 bytes, mtime 1782280811.0604014220.

Approved output listing before and after:

- `storage/approved-videos/.gitkeep` 70 bytes, mtime 1781846550.1669778710.
- `storage/approved-videos/smoke/p2e3-smoke-1782280783214-p2e3-smoke-1782280783214-d155392f-20260624060004-f087e2eb-approved-20260624070320.mp4` 5,032,913 bytes, mtime 1782284600.0896123000.

Confirmed:

- No MP4 was created.
- No MP4 was copied.
- No MP4 was moved.
- No MP4 was renamed.
- No MP4 was deleted.
- No MP4 was edited.
- No MP4 was read by the report service.
- No storage file was written.

## Tests And Validation

Commands run:

- `git branch --show-current`: `phase-2f3-manual-publish-report-board`.
- `git merge-base --is-ancestor phase-2f2-complete HEAD`: passed.
- `git status --short`: clean before changes.
- `docker compose --env-file .env.local -f docker-compose.dev.yml config`: passed.
- `docker compose --env-file .env.local -f docker-compose.dev.yml ps`: expected services running.
- `docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build web-app`: passed; web app rebuilt only.
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec postgres pg_isready -U pesona -d pesona_studio`: passed.
- `docker compose --env-file .env.local -f docker-compose.dev.yml exec redis redis-cli ping`: `PONG`.
- `npm run db:migrate`: no-op, migrations 001 through 017 skipped.
- `npm run test:footage-catalog`: 93 tests passed.
- `git diff --check`: passed.
- `npm run check`: passed.

Tests added or updated cover:

- Missing package detail rejection.
- Read-only report calls do not create checklist, evidence, package, channel, or `content_publications` rows.
- Summary counts for all derived report states.
- Channel states before checklist, after partial checklist, after complete checklist without URL, and after complete checklist with URL.
- Filters for query, package status, channel, report status, missing manual URL, and checklist initialization.
- CSV escaping for commas, quotes, and newlines.
- CSV response-only behavior with no file write.
- Page/API route ordering.
- Read-only safety notice.
- Runtime source scan for no DB writes, no filesystem access, no OpenAI, no social platform calls, no scheduler, no publisher, no upload, no queue, and no worker daemon dependency.

## Safety Scan

Focused report runtime scan confirmed:

- `manual-publish-report-service.ts` uses `SELECT` queries only.
- No runtime filesystem import is used.
- No social platform API call is used.
- No OpenAI call is used.
- No upload, scheduler, publisher, queue, or worker daemon was added.
- `workers/video` was not modified.

Broad grep output included expected safety notice text, existing skeleton checks, and test fixture setup. These were non-runtime or text-label hits.

## Warnings

- Non-blocking: The runtime package is intentionally incomplete from Phase 2F.2 evidence, so the report status is `checklist_incomplete`.
- Non-blocking: CSV export is simple response-only text and does not include streaming or saved files by design.

## Next Phase Readiness

Phase 2F.3 provides a read-only reporting layer over manual publication package, checklist, and evidence data. Future phases can build manual completion workflows from these derived statuses without adding automation, storage mutation, social API calls, OpenAI calls, or background workers.
