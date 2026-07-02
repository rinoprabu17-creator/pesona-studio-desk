# Phase 2H.11 Controlled Smoke Restore Dry-run Evidence

## Phase Name

Phase 2H.11 Controlled Smoke Restore Dry-run Evidence.

## Baseline

- Baseline branch: `main`.
- Baseline commit: `6653c40`.
- Baseline tag: `phase-2h10-complete`.
- Current branch/state: `phase-2h11-controlled-smoke-restore-dryrun-evidence` with docs-only evidence changes not committed.
- This phase records owner-provided controlled smoke restore dry-run evidence only.

## Docs Created

- `docs/ops/CONTROLLED_SMOKE_RESTORE_DRYRUN_EVIDENCE.md`
- `docs/phase-2h11-controlled-smoke-restore-dryrun-evidence.md`

## Docs Updated

- `README.md`
- `README.local.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`

## Evidence Summary

Owner-provided evidence records controlled restore dry-run evidence on `pesona`:

- Scope: isolated Docker Compose project `psd_restore_dryrun` only.
- Source backup: `/srv/pesona-studio/backups/psd-smoke-backup-20260702T075815Z`.
- Restore root: `/srv/pesona-studio/tmp/psd-smoke-restore-dryrun-20260702T083025Z`.
- Repo path: `/srv/pesona-studio/repos/pesona-studio-desk`.
- This was not restore to active DB.
- This was not production restore.
- This was not cutover.
- Backup checksum verification passed for all listed backup files.
- Network `psd_restore_dryrun_default` was created.
- Volume `psd_restore_dryrun_postgres_data_dev` was created.
- Container `psd_restore_dryrun-postgres-1` was started.
- Postgres readiness check passed.
- `postgres-smoke.dump` was restored into isolated restore Postgres using `pg_restore`.
- Restored table list showed `30` public tables.
- Table count validation returned `30`.
- `storage-smoke.tgz` was extracted into isolated tmp restore path.
- Restore dry-run Postgres was stopped after validation.
- Post-stop running containers for `psd_restore_dryrun`: none.
- `psd_restore_dryrun-postgres-1` exited with code `0`.
- Restore volume was preserved.
- No `docker compose down -v` was run.
- No `docker volume rm` was run.
- No storage deletion was run.

## Restored Database Evidence

Expected restored tables included:

- `campaign_plan_draft_items`
- `campaign_plan_draft_publications`
- `campaign_plan_generation_batches`
- `campaign_plan_runs`
- `campaigns`
- `colors`
- `content_item_footage_selections`
- `content_item_script_plans`
- `content_item_shot_plan_steps`
- `content_items`
- `content_publications`
- `footage_assets`
- `manual_publication_package_channels`
- `manual_publication_packages`
- `manual_publish_checklist_items`
- `manual_publish_closeouts`
- `manual_publish_evidence_logs`
- `offers`
- `pain_points`
- `products`
- `school_level_color_defaults`
- `video_approved_handoff_records`
- `video_draft_jobs`
- `video_render_approved_promotions`
- `video_render_attempt_reviews`
- `video_render_attempts`
- `video_render_manifest_items`
- `video_render_manifests`
- `video_render_preflight_checks`
- `video_render_preflight_runs`

## Restored Storage Evidence

Restored storage listing showed:

- `storage/`
- `storage/approved-videos/`
- `storage/approved-videos/.gitkeep`
- `storage/brand-assets/`
- `storage/brand-assets/.gitkeep`
- `storage/draft-videos/`
- `storage/draft-videos/.gitkeep`
- `storage/footage/`
- `storage/footage/.gitkeep`
- `storage/mockups/`
- `storage/mockups/.gitkeep`
- `storage/README.md`

## Evidence Files

Owner-provided evidence file listing:

| File | Size |
| --- | ---: |
| `restored-table-list.txt` | `2070` bytes |
| `restored-table-count.txt` | `3` bytes |
| `restored-storage-list.txt` | `1320` bytes |
| `restore-running-containers.txt` | `174` bytes |
| `post-stop-running-containers.txt` | `26` bytes |
| `post-stop-all-containers.txt` | `127` bytes |

No backup file, restore evidence file, dump file, archive file, checksum file, or storage artifact is committed to this repository.

## Storage Usage

Owner-provided storage evidence:

- `/srv/pesona-studio` mounted on `/dev/sdb1`.
- Size: `469G`.
- Available: `445G`.
- Restore evidence root size: `80K`.

## Outcome

Controlled smoke restore dry-run is PASS.

Backup checksum validation is PASS. Database restore validation is PASS. Storage archive extraction validation is PASS. Restore target stopped safely is PASS.

Runtime smoke PASS from Phase 2H.8 remains valid. Controlled smoke stop PASS from Phase 2H.9 remains valid. Controlled smoke backup PASS from Phase 2H.10 remains valid.

Cutover remains blocked.

## Safety Confirmations

- Docs-only/read-only evidence intake in this repo.
- No command run by Codex on Lenovo.
- No new command run by Codex on the `pesona` server.
- No production backup.
- No production restore.
- No restore to active database.
- No deployment.
- No cutover.
- No storage copy.
- No public exposure.
- No Cloudflare Tunnel.
- No scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- No container stop, restart, or mutation by Codex.
- No `docker compose up` or `docker compose down` by Codex.
- No `docker compose down -v`.
- No `docker volume rm`.
- No storage deletion.
- No app/runtime code, migration file, or `scripts/prepare-test-db.mjs` change.
- No backup file, restore evidence file, dump file, archive file, checksum file, env file, secret, `node_modules`, generated media, operational media, or storage artifact committed.

## Validation Results

Local validation on laptop/WSL completed for this docs-only evidence branch:

| Check | Result |
| --- | --- |
| `git diff --check` | PASS: no whitespace errors. |
| `npm run check` | PASS: 106 tests, 106 pass, 0 fail. |
| `git diff --name-only \| grep "workers/video" \|\| true` | PASS: no `workers/video` diff. |
| Path safety check | PASS: changed paths do not include forbidden app/runtime, migration, script, storage, backups, tmp restore evidence, env, secret, `node_modules`, media, dump, archive, checksum, or restore evidence artifact paths. |
| Safety grep against changed docs only | PASS: expected sensitive/destructive/runtime/backup/restore terms appear only in evidence notes, warnings, non-goals, HOLD conditions, pending lists, or safety descriptions. |
| `git status --short --ignored` | PASS: docs/readme changes only, plus ignored local artifacts before commit. |

## Pending Execution List

The following remain pending and require separate owner approval:

- Production backup policy acceptance.
- Production restore planning.
- Storage copy.
- Deployment.
- Cutover Go/No-Go.
- Actual cutover.
- GPU driver installation.
- Public exposure or Cloudflare Tunnel.
- `systemd`, cron, or autostart setup.
- Automated backup.
- Scheduler, publisher, social API, OpenAI live runtime, upload automation, queue expansion, or worker daemon changes.

## Recommended Next Phase

Recommended next safe phase: owner Go/No-Go planning for cutover readiness review, or production backup policy review. Do not treat Phase 2H.11 as cutover approval.
