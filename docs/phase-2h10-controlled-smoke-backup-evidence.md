# Phase 2H.10 Controlled Smoke Backup Evidence

## Phase Name

Phase 2H.10 Controlled Smoke Backup Evidence.

## Baseline

- Baseline branch: `main`.
- Baseline commit: `76a9b0c`.
- Baseline tag: `phase-2h9-complete`.
- Current branch/state: `phase-2h10-controlled-smoke-backup-evidence` with docs-only evidence changes not committed.
- This phase records owner-provided controlled smoke backup evidence only.

## Docs Created

- `docs/ops/CONTROLLED_SMOKE_BACKUP_EVIDENCE.md`
- `docs/phase-2h10-controlled-smoke-backup-evidence.md`

## Docs Updated

- `README.md`
- `README.local.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`

## Evidence Summary

Owner-provided evidence records controlled backup evidence for the isolated server smoke stack on `pesona`:

- Scope: isolated smoke stack `psd_server_smoke` only.
- This is not production backup.
- This is not restore.
- This is not restore dry-run.
- This is not cutover.
- Repo path: `/srv/pesona-studio/repos/pesona-studio-desk`.
- Git head: `76a9b0ca8ce9bb81c9043f8bda3b0881491c9146`.
- Tag: `phase-2h9-complete`.
- Git status short count: `0`.
- Backup directory: `/srv/pesona-studio/backups/psd-smoke-backup-20260702T075815Z`.
- Pre-backup and post-backup evidence showed no running smoke containers.
- Only `psd_server_smoke-postgres-1` was started for logical dump.
- Postgres readiness check passed.
- `pg_dump --format=custom --no-owner --no-privileges` created `postgres-smoke.dump`.
- Table list evidence was created as `postgres-table-list.txt`.
- Smoke storage archive was created as `storage-smoke.tgz`.
- Postgres was stopped again.
- No `docker compose down -v` was run.
- No `docker volume rm` was run.
- No storage deletion was run.

## Backup Files

Owner-provided file evidence:

| File | Size |
| --- | ---: |
| `baseline-evidence.txt` | `197` bytes |
| `pre-backup-running-containers.txt` | `26` bytes |
| `pre-backup-all-containers.txt` | `589` bytes |
| `postgres-smoke.dump` | `161344` bytes |
| `postgres-table-list.txt` | `2070` bytes |
| `storage-smoke.tgz` | `827` bytes |
| `post-backup-running-containers.txt` | `26` bytes |
| `post-backup-all-containers.txt` | `597` bytes |
| `SHA256SUMS.txt` | `742` bytes |

No backup file, dump file, archive file, or checksum file is committed to this repository.

## Storage And Integrity

Owner-provided storage evidence:

- `/srv/pesona-studio` mounted from `/dev/sdb1`.
- Size: `469G`.
- Available: `445G`.
- Backup directory size: `196K`.

Owner-provided integrity evidence:

- `sha256sum -c SHA256SUMS.txt` passed for all listed files.
- `storage-smoke.tgz` was readable and listed expected placeholder storage paths.
- `postgres-smoke.dump` was readable with `pg_restore -l`.
- Dump format: custom.
- Database: `pesona_studio`.
- Dumped from PostgreSQL `16.14`.
- TOC entries: `306`.
- Expected schema/data entries were present, including campaign, content, footage, manual publication, video draft, render attempt, and render manifest tables.
- No restore was performed.

## Outcome

Controlled smoke backup evidence is PASS.

Checksum verification is PASS. Backup archive readability is PASS. PostgreSQL dump listing readability is PASS.

Restore was not performed. Restore dry-run was not performed. Cutover remains blocked.

## Safety Confirmations

- Docs-only/read-only evidence intake in this repo.
- No command run by Codex on Lenovo.
- No new command run by Codex on the `pesona` server.
- No production backup.
- No restore.
- No restore dry-run execution.
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
- No backup file, dump file, archive file, checksum file, env file, secret, `node_modules`, generated media, operational media, or storage artifact committed.

## Validation Results

Local validation on laptop/WSL completed for this docs-only evidence branch:

| Check | Result |
| --- | --- |
| `git diff --check` | PASS: no whitespace errors. |
| `npm run check` | PASS: 106 tests, 106 pass, 0 fail. |
| `git diff --name-only \| grep "workers/video" \|\| true` | PASS: no `workers/video` diff. |
| Path safety check | PASS: changed paths do not include forbidden app/runtime, migration, script, storage, backups, env, secret, `node_modules`, media, dump, archive, or checksum paths. |
| Safety grep against changed docs only | PASS: expected sensitive/destructive/runtime/backup terms appear only in evidence notes, warnings, non-goals, HOLD conditions, pending lists, or safety descriptions. |
| `git status --short --ignored` | PASS: docs/readme changes only, plus ignored local artifacts; no commit and no push performed. |

## Pending Execution List

The following remain pending and require separate owner approval:

- Restore dry-run planning in a separate isolated environment.
- Restore dry-run execution.
- Production backup acceptance.
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

Recommended next safe phase: restore dry-run planning in a separate isolated environment. Do not treat Phase 2H.10 as cutover readiness.
