# Phase 2G.3 Local Ops Runbook + Backup/Restore SOP + Release Readiness Audit

Branch: `phase-2g3-local-ops-runbook-readiness`

Baseline tag: `phase-2g2-complete`

## Summary

Phase 2G.3 is a combined docs-first and read-only audit phase for running Pesona Studio Desk on the local office server.

Scope:

- Local server operations runbook.
- Daily/weekly admin SOP.
- Backup and restore dry-run SOP.
- Incident/troubleshooting guide.
- Release readiness checklist.
- Read-only validation evidence.

No runtime features, automation, publisher, scheduler, upload, AI generation, social API calls, schema changes, or worker behavior were added.

## Schema And Test DB

- No migration added.
- `scripts/prepare-test-db.mjs` unchanged.
- No app service or runtime DB query code added.
- No new DB write behavior added.

## Docs Created

- `docs/ops/LOCAL_SERVER_RUNBOOK.md`
- `docs/ops/DAILY_WEEKLY_SOP.md`
- `docs/ops/BACKUP_RESTORE_DRY_RUN.md`
- `docs/ops/TROUBLESHOOTING_INCIDENTS.md`
- `docs/ops/RELEASE_READINESS_CHECKLIST.md`
- `docs/phase-2g3-local-ops-runbook-readiness.md`

README links updated:

- `README.md`
- `README.local.md`

## Runtime Read-Only Route Checks

Local Docker stack was already available. No container rebuild, volume deletion, DB reset, or destructive Docker command was run.

Health and service checks:

- `docker compose -f docker-compose.dev.yml config --quiet`: passed.
- `docker compose -f docker-compose.dev.yml ps postgres redis web-app`: Postgres and Redis healthy; web-app running.
- `GET /health`: 200.

Read-only page checks:

- `/operational-readiness`
- `/manual-publish-report`
- `/manual-publish-closeouts`
- `/publication-packages`
- `/approved-videos`
- `/content-items`

All returned 200.

## DB And Storage Evidence

Before route checks:

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

After route checks:

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

Storage listing before and after route checks was unchanged.

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

## Safety Confirmation

- No MP4 created, copied, moved, renamed, deleted, edited, or read by runtime changes.
- No OpenAI behavior added.
- No upload behavior added.
- No scheduler behavior added.
- No publisher behavior added.
- No social API behavior added.
- No queue behavior added.
- No worker daemon behavior added.
- No `workers/video` files changed.
- No `content_publications` rows created or mutated.

## Validation Results

- `git status --short`: clean before changes.
- `git diff --check`: passed.
- `npm run check`: passed.
- Docker Compose config resolved.
- Read-only runtime route smoke passed.
- Docs safety grep found forbidden command and integration terms only as warnings, non-goals, checklists, or descriptions.
- Docs secret grep found only generic warnings and existing README.local placeholder/reference text; no actual credential value was added.
- `git diff --name-only | grep "workers/video" || true`: no output.
- Storage smoke files remain ignored by `.gitignore`.

## Warnings

Non-blocking:

- README.local already contains older OpenAI and test database placeholder examples; Phase 2G.3 only added ops doc links there.
- Docs intentionally mention destructive commands and integration terms as forbidden operations/non-goals.
- Runtime smoke was read-only and did not rebuild containers.

Blocking: none.

## Next Phase Readiness

Phase 2G.3 is ready for owner review. Recommended next options are local office server deployment rehearsal, backup dry-run evidence in a separate test environment, or operator training using the new SOPs.
