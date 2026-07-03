# Phase 2H.15 Pilot UI Flow + Post-Entry Backup Evidence

## Phase Name

Phase 2H.15 Pilot UI Flow + Post-Entry Backup Evidence.

## Baseline

- Baseline branch: `main`.
- Baseline commit: `387b211`.
- Baseline tag: `phase-2h14-complete`.
- Current branch/state: `phase-2h15-pilot-ui-flow-post-entry-backup-evidence` with docs-only evidence changes not committed.
- This phase records pilot UI flow evidence and owner-provided post-entry backup evidence only.

## Docs Created

- `docs/ops/PILOT_UI_FLOW_EVIDENCE.md`
- `docs/ops/PILOT_POST_ENTRY_BACKUP_EVIDENCE.md`
- `docs/phase-2h15-pilot-ui-flow-post-entry-backup-evidence.md`

## Docs Updated

- `README.md`
- `README.local.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`

## Pilot UI Flow Evidence Summary

Owner-provided evidence records a controlled pilot UI flow test on `psd_pilot`:

- Pilot URL used: `http://100.120.79.33:3400`.
- This was not production cutover.
- This was not public exposure.
- This was not social publishing.
- This was not OpenAI live runtime.
- This was not scheduler/publisher automation.
- No render was executed.
- No footage was selected or uploaded.
- Video draft job was metadata-only.
- One campaign was created: `Desain Gratis - Pilot`, code `PILOT-DESAIN-GRATIS-01`, date range `2026-07-02` to `2026-07-31`, product `Campuran / Semua Produk`, status `Aktif`.
- One content item was created: `PILOT-DESAIN-GRATIS-01-D01`, `Pilot Test - Sampul Raport Desain Gratis`, planned date `2026-07-03`, production status `planned`.
- One script plan exists.
- Four shot steps were created.
- One video draft metadata job was created with `draft_requested`, `vertical_9_16`, duration target `15`, label `Pilot Test Sampul Raport - Draft 1`, and render mode `disabled_metadata_only`.
- DB counts after UI flow: `campaigns` 1, `content_items` 1, `content_publications` 0, `footage_assets` 0, `content_item_script_plans` 1, `content_item_shot_plan_steps` 4, `video_draft_jobs` 1, `video_render_manifests` 0, `video_render_attempts` 0, `manual_publication_packages` 0.
- Route evidence after UI flow returned HTTP 200 for `/health`, `/content-calendar`, `/content-items`, `/approved-videos`, `/publication-packages`, `/manual-publish-report`, and `/manual-publish-closeouts`.
- One earlier SQL query warning was corrected by using actual `video_draft_jobs` columns. This warning is not a pilot failure.

## Post-Entry Backup Evidence Summary

Owner-provided evidence records post-entry pilot backup after UI metadata entry:

- Backup directory: `/srv/pesona-studio/backups/psd-pilot-post-ui-backup-20260702T101832Z`.
- Server: `pesona`.
- Repo path: `/srv/pesona-studio/repos/pesona-studio-desk`.
- Git head: `ea4cc57120ebc9efa0a2d4f6d02079b73e23404f`.
- Tag: `phase-2h12-complete`.
- Git status short count: `0`.
- Compose project: `psd_pilot`.
- Backup artifacts recorded as evidence only: `baseline-evidence.txt`, `pilot-db-evidence.txt`, `pilot-route-status.txt`, `pilot-running-containers.txt`, `postgres-dump-list.txt`, `postgres-pilot-post-ui.dump`, `SHA256SUMS.txt`, `storage-archive-list.txt`, and `storage-pilot-post-ui.tgz`.
- Backup directory size was `204K`.
- `/srv/pesona-studio` storage was `469G` size with `445G` available.
- `sha256sum -c SHA256SUMS.txt` passed for the listed post-entry backup files.
- `storage-pilot-post-ui.tgz` was readable and listed expected storage placeholder paths.
- `postgres-pilot-post-ui.dump` was readable via `pg_restore -l`, custom format for database `pesona_studio`, dumped from PostgreSQL `16.14`, with `306` TOC entries and expected schema/data entries.
- Pilot remained running after backup.

## Outcome

Pilot UI flow evidence is PASS.

Post-entry backup evidence is PASS.

Route check after UI flow is PASS. Post-entry backup checksum is PASS. Post-entry PostgreSQL dump readability is PASS. Post-entry storage archive readability is PASS.

Pilot remained running.

No backup artifacts were committed.

Cutover remains blocked.

## Safety Confirmations

- Docs-only/read-only release in this repo.
- No command run by Codex on Lenovo.
- No new command run by Codex on the `pesona` server.
- No production backup.
- No restore.
- No restore dry-run.
- No deployment.
- No cutover.
- No storage copy.
- No public exposure.
- No Cloudflare Tunnel.
- No scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- No render execution.
- No footage selection or upload.
- No Docker Compose up/down by Codex.
- No container stop, restart, or mutation by Codex.
- No app/runtime code, migration file, or `scripts/prepare-test-db.mjs` change.
- No backup file, dump file, tar archive, checksum file, route evidence file, env file, secret, `node_modules`, generated media, or storage artifact committed.

## Validation Results

Local validation on laptop/WSL completed for this docs-only evidence branch:

| Check | Result |
| --- | --- |
| `git diff --check` | PASS: no whitespace errors in tracked diff. |
| `npm run check` | PASS. |
| `git diff --name-only \| grep "workers/video" \|\| true` | PASS: no `workers/video` diff. |
| Path safety check | PASS: changed paths do not include forbidden app/runtime, migration, script, storage, backup, tmp, env, secret, `node_modules`, media, dump, archive, checksum, route evidence, or backup artifact paths. |
| Safety grep against changed docs only | PASS: expected sensitive/destructive/runtime/backup/restore terms appear only in evidence notes, warnings, non-goals, HOLD conditions, pending lists, or safety descriptions. |
| `git status --short --ignored` | PASS: docs/readme changes only, plus ignored local artifacts before commit. |

## Pending Execution List

The following remain pending and require separate owner approval:

- Post-entry pilot backup restore dry-run planning in a separate isolated environment.
- Post-entry pilot backup restore dry-run execution.
- Controlled pilot operating review evidence.
- Production backup policy acceptance.
- Production-like backup evidence.
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

Recommended next safe phase: post-entry pilot backup restore dry-run planning in a separate isolated environment, or controlled pilot operating review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
