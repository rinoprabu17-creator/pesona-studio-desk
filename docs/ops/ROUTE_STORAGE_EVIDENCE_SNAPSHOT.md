# Route And Storage Evidence Snapshot

Purpose: document the latest read-only evidence snapshot for owner review.

Baseline tag: `phase-2g5-complete`

This snapshot is read-only evidence, not mutation. It does not deploy, back up, restore, copy storage, read MP4 content, write storage, or change DB rows.

## Route Smoke

| Route | Latest Observed Status | Notes |
| --- | --- | --- |
| `/health` | 200 | Read-only health route |
| `/operational-readiness` | 200 | Read-only dashboard |
| `/manual-publish-report` | 200 | Read-only/manual report page |
| `/manual-publish-closeouts` | 200 | Manual closeout page |
| `/publication-packages` | 200 | Manual package page |
| `/approved-videos` | 200 | Approved videos page |
| `/content-items` | 200 | Content item page |

## DB Counts

| Table | Latest Observed Count |
| --- | ---: |
| campaigns | 10 |
| content_items | 13 |
| footage_assets | 18 |
| content_publications | 0 |
| manual_publication_packages | 1 |
| manual_publication_package_channels | 4 |
| manual_publish_checklist_items | 32 |
| manual_publish_evidence_logs | 3 |
| manual_publish_closeouts | 0 |

## Storage Listing

### `storage/footage/smoke`

```text
storage/footage/smoke/pesona-smoke-001.mp4 3784328 bytes
storage/footage/smoke/pesona-smoke-002.mp4 1350453 bytes
storage/footage/smoke/pesona-smoke-003.mp4 1203310 bytes
```

### `storage/draft-videos`

```text
storage/draft-videos/.gitkeep 67 bytes
storage/draft-videos/smoke/p2e2-smoke-1782278550613-3cf17da5-20260624052944.mp4 3749627 bytes
storage/draft-videos/smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4 5032913 bytes
```

### `storage/approved-videos`

```text
storage/approved-videos/.gitkeep 70 bytes
storage/approved-videos/smoke/p2e3-smoke-1782280783214-p2e3-smoke-1782280783214-d155392f-20260624060004-f087e2eb-approved-20260624070320.mp4 5032913 bytes
```

## Content Publications Visibility Check

`content_publications` is counted for visibility only. This snapshot does not mutate or create rows.
