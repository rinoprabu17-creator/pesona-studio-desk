# Phase 2G.2 Admin UX Polish

Branch: `phase-2g2-admin-ux-polish`

Baseline tag: `phase-2g1-complete`

## Summary

Phase 2G.2 polishes the owner/admin experience without adding schema, worker, automation, upload, scheduler, publisher, social API, or OpenAI behavior.

Changes are limited to navigation grouping, reusable empty states, safer helper text, and clearer next-action links on existing read-only/manual-operation pages.

## Schema And Test DB

- No migration was added.
- `scripts/prepare-test-db.mjs` was not changed.
- Runtime behavior did not add new DB writes.

## Navigation Grouping

Sidebar navigation now renders visual sections:

- Overview
- Campaign & Content
- Video Pipeline
- Manual Publish
- Libraries / Setup

Existing routes remain unchanged and active route highlighting still works for exact routes and subpaths.

## Empty States Added

Reusable helper: `renderEmptyState(title, message, actions?)`

Applied to:

- Operational Readiness warnings when no warnings exist
- Manual Publish Closeouts when the list is empty
- Manual Publish Report when no packages match
- Publication Packages when the list is empty
- Approved Videos when the list is empty

All action links point to existing safe pages and do not introduce new mutations.

## Safety Notice Wording

Safety notices were cleaned and standardized on the selected pages:

- Tidak upload
- tidak scheduler
- tidak publisher
- tidak social API
- tidak OpenAI
- tidak mutasi file video
- tidak membuat content_publications
- tidak memutasi content_publications

The old typo `tidak uploa` is not present.

## Runtime Route Checks

Local runtime smoke used the current Docker Compose stack after rebuilding only `web-app`.

- `GET /operational-readiness`: 200
- `GET /manual-publish-report`: 200
- `GET /manual-publish-closeouts`: 200
- `GET /publication-packages`: 200
- `GET /approved-videos`: 200
- `GET /content-items`: 200

Rendered HTML confirmed grouped nav headings and safety notices.

## DB Counts

Before runtime route checks:

```json
{
  "campaigns": 10,
  "content_items": 13,
  "footage_assets": 18,
  "content_publications": 0,
  "manual_publication_packages": 1,
  "manual_publication_package_channels": 4,
  "manual_publish_checklist_items": 32,
  "manual_publish_evidence_logs": 3,
  "manual_publish_closeouts": 0
}
```

After runtime route checks:

```json
{
  "campaigns": 10,
  "content_items": 13,
  "footage_assets": 18,
  "content_publications": 0,
  "manual_publication_packages": 1,
  "manual_publication_package_channels": 4,
  "manual_publish_checklist_items": 32,
  "manual_publish_evidence_logs": 3,
  "manual_publish_closeouts": 0
}
```

Result: unchanged. `content_publications` remained `0`.

## Storage Listings

Before and after listings were unchanged.

Source footage:

```text
storage/footage/smoke/pesona-smoke-002.mp4 1350453 bytes
storage/footage/smoke/pesona-smoke-001.mp4 3784328 bytes
storage/footage/smoke/pesona-smoke-003.mp4 1203310 bytes
```

Draft videos:

```text
storage/draft-videos/smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4 5032913 bytes
storage/draft-videos/smoke/p2e2-smoke-1782278550613-3cf17da5-20260624052944.mp4 3749627 bytes
storage/draft-videos/.gitkeep 67 bytes
```

Approved videos:

```text
storage/approved-videos/smoke/p2e3-smoke-1782280783214-p2e3-smoke-1782280783214-d155392f-20260624060004-f087e2eb-approved-20260624070320.mp4 5032913 bytes
storage/approved-videos/.gitkeep 70 bytes
```

No MP4 was created, copied, moved, renamed, deleted, edited, or read by the changed runtime code.

## Safety Confirmation

- No OpenAI behavior added.
- No upload behavior added.
- No scheduler behavior added.
- No publisher behavior added.
- No social API behavior added.
- No queue behavior added.
- No worker daemon behavior added.
- No `workers/video` files changed.
- No storage write behavior added.
- No `content_publications` rows created or mutated.

## Tests And Validation

- `npm run test:footage-catalog`: passed, 106 tests.
- `npm run check`: passed.
- `git diff --check`: passed.
- Runtime source scan on changed runtime view files found no write SQL, filesystem APIs, social/network calls, storage paths, queue/worker daemon terms, or `tidak uploa`.
- `npm run db:migrate`: completed with all migrations skipped; no-op.

## Warnings

Non-blocking:

- The runtime DB currently has no manual publish closeouts, so the closeout page empty state rendered during smoke.
- The runtime smoke rebuilt only `web-app` to load source changes into the container. DB volumes and storage contents were not reset or deleted.

Blocking: none.

## Next Phase Readiness

Phase 2G.2 is ready for owner review. The app remains manual-operation/read-only where intended, with clearer navigation and empty-state guidance for daily admin use.
