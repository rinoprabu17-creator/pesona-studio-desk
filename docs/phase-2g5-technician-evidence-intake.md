# Phase 2G.5 Technician Evidence Intake Pack

Branch: `phase-2g5-technician-evidence-intake`

Baseline tag: `phase-2g4-complete`

## Summary

Phase 2G.5 creates a docs-only technician evidence intake and owner sign-off pack for future local office server preparation.

This phase is documentation and owner-review material only. It does not perform deployment, backup, restore, storage copy, container rebuild, migration execution, or environment cutover.

## Docs Created

- `docs/ops/TECHNICIAN_EVIDENCE_INTAKE.md`
- `docs/ops/OFFICE_SERVER_PREFLIGHT_PRINTABLE.md`
- `docs/ops/OWNER_SIGNOFF_TEMPLATES.md`
- `docs/ops/DRY_RUN_EVIDENCE_TEMPLATE.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/phase-2g5-technician-evidence-intake.md`

README links updated:

- `README.md`
- `README.local.md`

## Safety Confirmations

- No migration added.
- `scripts/prepare-test-db.mjs` unchanged.
- No app/runtime code added.
- No new services added.
- No DB query added.
- No DB write behavior added.
- No actual deployment executed.
- No backup executed.
- No restore executed.
- No storage copy executed.
- No MP4 created, copied, moved, renamed, deleted, edited, or read.
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

- Branch check passed: `phase-2g5-technician-evidence-intake`.
- Baseline tag check passed: `phase-2g4-complete` is reachable from `HEAD`.
- Initial `git status --short`: clean.
- `git diff --check`: passed.
- `npm run check`: passed.
- Docker Compose config resolved.
- Existing Postgres and Redis services were healthy.
- Docs safety grep found restricted terms only as warnings, non-goals, checklists, or safe evidence labels.
- Docs secret grep found only generic warnings and existing README.local placeholder/reference text; no actual credential value was added.
- `git diff --name-only | grep "workers/video" || true`: no output.

## Runtime Smoke

Local Docker stack was already available. No container rebuild, deployment, backup, restore, storage copy, volume delete, or destructive command was run.

Routes:

- `GET /health`: 200
- `GET /operational-readiness`: 200
- `GET /manual-publish-report`: 200
- `GET /manual-publish-closeouts`: 200
- `GET /publication-packages`: 200
- `GET /approved-videos`: 200
- `GET /content-items`: 200

DB counts before route checks:

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

DB counts after route checks:

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

Storage listings before and after route checks were unchanged.

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

## Warnings

Non-blocking:

- README.local contains pre-existing OpenAI and test database placeholder examples; Phase 2G.5 only added links to new docs there.
- Docs intentionally mention `.env.local`, destructive commands, OpenAI, scheduler, publisher, upload, queue, worker daemon, and storage paths only as warnings, non-goals, checklists, or descriptions.
- Runtime smoke used the already-running local stack and did not rebuild containers.

Blocking: none.

## Pending Features

- Actual office server deployment.
- Actual backup.
- Actual restore dry-run in a separate test environment.
- Actual storage copy.
- Actual cutover.
- Public exposure/tunnel/reverse proxy decision.
- Auto-publisher, scheduler, social API, OpenAI runtime automation, upload automation, queue expansion, and worker daemon changes.

## Next Phase Readiness

Phase 2G.5 is ready for owner review. Recommended next options are owner review of the handoff pack, technician evidence collection on the office server, or a separate owner-approved dry-run environment exercise.
