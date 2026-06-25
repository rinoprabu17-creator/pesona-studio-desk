# Phase 2H.1 Office Server Readiness Evidence

## Phase

Phase 2H.1 - Office Server Readiness Evidence + Repo Bootstrap Verification + Env Handling Verification + Cutover Hold Gate.

## Branch And Baseline

- Branch: `phase-2h1-office-server-readiness-evidence`
- Baseline tag: `phase-2g6-complete`
- Baseline status: verified reachable from current branch before changes.

## Owner-Reported Readiness Summary

Owner reported these prerequisites as checked and OK:

- Ubuntu Server installed/checked.
- Docker Engine + Compose plugin installed/checked.
- Storage path to SSD 2TB checked.
- LAN access checked.
- UPS/power checked.

## Scope Summary

This phase is docs-only/read-only evidence work. It records readiness and keeps cutover blocked until backup, restore dry-run, storage copy planning, rollback, and owner sign-off are complete.

## Docs Created

- `docs/ops/OFFICE_SERVER_READINESS_EVIDENCE.md`
- `docs/ops/OFFICE_SERVER_REPO_BOOTSTRAP_VERIFICATION.md`
- `docs/ops/ENV_HANDLING_VERIFICATION.md`
- `docs/ops/CUTOVER_HOLD_GATE.md`
- `docs/phase-2h1-office-server-readiness-evidence.md`

## Docs Updated

- `README.md`
- `README.local.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`

## Safety Confirmations

- No migration added.
- `scripts/prepare-test-db.mjs` unchanged.
- No app/runtime code added or changed.
- No new services added.
- No DB queries or DB write behavior added.
- No backup executed.
- No restore executed.
- No storage copy executed.
- No cutover executed.
- No MP4 created, copied, moved, deleted, edited, or read.
- No OpenAI, upload, scheduler, publisher, social API, queue, or worker daemon behavior added.
- No `workers/video` changes.
- No `content_publications` mutation.
- No public internet exposure.

## Validation Results

| Check | Result |
| --- | --- |
| Branch check | Passed: `phase-2h1-office-server-readiness-evidence` |
| Baseline tag reachable | Passed: `phase-2g6-complete` is reachable |
| Initial git status | Passed: clean before changes |
| `git diff --check` | Passed |
| `npm run check` | Passed: 106 tests, 106 pass |
| Docs secret grep | Passed with generic warning/placeholders only; no actual credential values added |
| Docs safety grep | Passed with terms only in warnings, non-goals, hold gates, checklists, pending features, or descriptions |
| `workers/video` diff check | Passed: no `workers/video` path in changed tracked diff |
| Storage ignore/listing checks | Passed: smoke MP4 files remain ignored and untracked |

## Runtime Route Smoke

Read-only route smoke was performed against the existing local stack without rebuilds, migrations, backup, restore, storage copy, or cutover.

| Route | Result |
| --- | --- |
| `/health` | 200 |
| `/operational-readiness` | 200 |
| `/manual-publish-report` | 200 |
| `/manual-publish-closeouts` | 200 |
| `/publication-packages` | 200 |
| `/approved-videos` | 200 |
| `/content-items` | 200 |

Postgres and Redis were reported healthy by Docker Compose. Web app was reachable on the existing local stack.

## Before/After DB Counts

Counts were captured with read-only `SELECT count(*)` queries before and after the route smoke. Values were unchanged.

| Table | Before | After |
| --- | ---: | ---: |
| `campaigns` | 10 | 10 |
| `content_items` | 13 | 13 |
| `footage_assets` | 18 | 18 |
| `content_publications` | 0 | 0 |
| `manual_publication_packages` | 1 | 1 |
| `manual_publication_package_channels` | 4 | 4 |
| `manual_publish_checklist_items` | 32 | 32 |
| `manual_publish_evidence_logs` | 3 | 3 |
| `manual_publish_closeouts` | 0 | 0 |

## Storage Listing Evidence

Storage listing checks were read-only and showed the current ignored smoke files:

```text
storage/footage/smoke/pesona-smoke-001.mp4 3784328 bytes
storage/footage/smoke/pesona-smoke-002.mp4 1350453 bytes
storage/footage/smoke/pesona-smoke-003.mp4 1203310 bytes
storage/draft-videos/.gitkeep 67 bytes
storage/draft-videos/smoke/p2e2-smoke-1782278550613-3cf17da5-20260624052944.mp4 3749627 bytes
storage/draft-videos/smoke/p2e3-smoke-1782280783214-d155392f-20260624060004.mp4 5032913 bytes
storage/approved-videos/.gitkeep 70 bytes
storage/approved-videos/smoke/p2e3-smoke-1782280783214-p2e3-smoke-1782280783214-d155392f-20260624060004-f087e2eb-approved-20260624070320.mp4 5032913 bytes
```

No storage files were created, copied, moved, renamed, deleted, edited, or read as media content by this phase.

## Warnings

- Office server evidence values not available from this repo must be filled by owner/technician.
- Cutover remains blocked after this phase.
- Backup evidence and restore dry-run evidence remain required before cutover.
- Runtime smoke reused the already running local Docker stack and did not rebuild containers.

No blocking warnings are known at document creation time.

## Pending Execution List

- Backup evidence collection.
- Restore dry-run planning or execution in a separate test environment.
- Storage copy planning.
- Cutover Go/No-Go sign-off.
- Rollback acceptance.
- Actual office server cutover.
- Autostart/systemd/cron decision.
- Cloudflare/public exposure decision.
- Automated backup design.
- Scheduler/publisher/social API decision.
- OpenAI runtime automation decision.
- Queue/worker daemon expansion decision.

## Recommended Next Step

Proceed to a backup evidence phase or restore dry-run planning phase. Do not proceed to cutover yet.
