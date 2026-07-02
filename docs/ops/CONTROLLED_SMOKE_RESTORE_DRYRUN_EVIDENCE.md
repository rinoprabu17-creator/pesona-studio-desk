# Controlled Smoke Restore Dry-run Evidence

## Purpose

This document records Phase 2H.11 owner-provided controlled restore dry-run evidence for the isolated smoke backup on the new native Ubuntu server candidate named `pesona`.

This is evidence intake only. Codex did not run new commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize production restore, deployment, cutover, storage copy, public exposure, or production operation.

## Scope And Non-Goals

In scope:

- Record owner-provided restore dry-run evidence for isolated Docker Compose project `psd_restore_dryrun`.
- Record source backup verification, isolated restore project creation, database restore validation, storage archive extraction validation, stop/preserve evidence, evidence file sizes, storage usage, and outcome.
- Record explicit warnings that this was not restore to the active database, not production restore, and not cutover.
- Record that restore dry-run target was stopped safely and preserved without destructive Docker volume operations.
- Record HOLD items and next safe phase.

Out of scope and not authorized:

- Running new commands on Lenovo or on the `pesona` server by Codex.
- Production backup.
- Production restore.
- Restore to active database.
- Deployment.
- Cutover.
- Storage copy.
- Public exposure or Cloudflare Tunnel.
- Scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- Stopping, restarting, or mutating containers by Codex.
- `docker compose up` or `docker compose down` by Codex.
- `docker compose down -v`.
- `docker volume rm`.
- Storage deletion.
- App/runtime code, migration file, or `scripts/prepare-test-db.mjs` changes.
- Committing backup files, restore evidence files, dump files, archive files, checksum files, env files, secrets, `node_modules`, generated media, operational media, or storage artifacts.

## Restore Dry-run Scope

Owner-provided evidence records that the restore dry-run was controlled and isolated:

| Item | Evidence |
| --- | --- |
| Server candidate | `pesona` |
| Restore dry-run project | `psd_restore_dryrun` |
| Source backup | `/srv/pesona-studio/backups/psd-smoke-backup-20260702T075815Z` |
| Restore root | `/srv/pesona-studio/tmp/psd-smoke-restore-dryrun-20260702T083025Z` |
| Repo path | `/srv/pesona-studio/repos/pesona-studio-desk` |
| Restore to active DB | Not performed |
| Production restore | Not performed |
| Cutover | Not performed |

## Backup Verification Evidence

Owner-provided `sha256sum -c SHA256SUMS.txt` evidence passed for all source backup files:

- `baseline-evidence.txt`
- `post-backup-all-containers.txt`
- `post-backup-running-containers.txt`
- `postgres-smoke.dump`
- `postgres-table-list.txt`
- `pre-backup-all-containers.txt`
- `pre-backup-running-containers.txt`
- `storage-smoke.tgz`

Backup checksum validation is PASS for this controlled restore dry-run.

## Restore Project Evidence

Owner-provided restore project evidence:

- Project: `psd_restore_dryrun`.
- Network created: `psd_restore_dryrun_default`.
- Volume created: `psd_restore_dryrun_postgres_data_dev`.
- Container started: `psd_restore_dryrun-postgres-1`.
- Postgres readiness check passed.

This restore project was isolated from the smoke project and active database. Codex did not start or stop it.

## Database Restore Evidence

Owner-provided database restore evidence:

- `postgres-smoke.dump` was restored into isolated restore Postgres using `pg_restore`.
- Restored table list showed `30` public tables.
- Table count validation returned `30`.
- Expected restored tables included:
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

Database restore validation is PASS.

## Storage Archive Restore Evidence

Owner-provided storage archive evidence:

- `storage-smoke.tgz` was extracted into isolated tmp path:

```text
/srv/pesona-studio/tmp/psd-smoke-restore-dryrun-20260702T083025Z/storage-restore
```

- Restored storage listing showed:
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

Storage archive extraction validation is PASS.

## Stop And Preserve Evidence

Owner-provided stop/preserve evidence:

- Restore dry-run Postgres was stopped after validation.
- Post-stop running containers for `psd_restore_dryrun`: none.
- `docker ps -a` showed `psd_restore_dryrun-postgres-1` exited with code `0`.
- Restore volume was preserved.
- No `docker compose down -v` was run.
- No `docker volume rm` was run.
- No storage deletion was run.

Restore target stopped safely is PASS.

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

These evidence files remain on the server restore evidence path only. They must not be committed to Git.

## Storage Usage Evidence

Owner-provided storage evidence:

| Check | Evidence |
| --- | --- |
| `/srv/pesona-studio` device | `/dev/sdb1` |
| Size | `469G` |
| Available | `445G` |
| Restore evidence root size | `80K` |

## Relationship To Prior Phases

- Phase 2H.8 isolated server runtime smoke remains PASS after migrations.
- Phase 2H.9 controlled smoke stop remains PASS.
- Phase 2H.10 controlled smoke backup evidence remains PASS.
- Phase 2H.11 validates the smoke backup through an isolated restore dry-run only.

## Outcome

Controlled smoke restore dry-run is PASS.

Backup checksum validation is PASS. Database restore validation is PASS. Storage archive extraction validation is PASS. Restore target stopped safely is PASS.

Cutover remains blocked.

This evidence does not authorize production restore, deployment, cutover, storage copy, public exposure, scheduler/publisher/social API activation, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.

## What Was Not Executed By Codex

- No command on Lenovo.
- No new command on the `pesona` server.
- No production backup.
- No production restore.
- No restore to active database.
- No deployment.
- No cutover.
- No storage copy.
- No public exposure.
- No Cloudflare Tunnel.
- No scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- No container stop, restart, or mutation.
- No `docker compose up` or `docker compose down`.
- No `docker compose down -v`.
- No `docker volume rm`.
- No storage deletion.
- No app/runtime code change.
- No migration file change.
- No `scripts/prepare-test-db.mjs` change.
- No backup file, restore evidence file, dump file, archive file, checksum file, env file, secret, `node_modules`, generated media, operational media, or storage artifact committed.

## Next Safe Phase

Next safe phase: owner Go/No-Go planning for cutover readiness review, or production backup policy review.

That next step is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
