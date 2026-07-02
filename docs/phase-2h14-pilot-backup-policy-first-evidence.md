# Phase 2H.14 Pilot Backup Policy + First Pilot Backup Evidence

## Phase Name

Phase 2H.14 Pilot Backup Policy + First Pilot Backup Evidence.

## Baseline

- Baseline branch: `main`.
- Baseline commit: `1b8d7cc`.
- Baseline tag: `phase-2h13-complete`.
- Current branch/state: `phase-2h14-pilot-backup-policy-first-evidence` with docs-only evidence changes not committed.
- This phase records pilot backup policy and owner-provided first pilot backup evidence only.

## Docs Created

- `docs/ops/PILOT_BACKUP_POLICY.md`
- `docs/ops/FIRST_PILOT_BACKUP_EVIDENCE.md`
- `docs/phase-2h14-pilot-backup-policy-first-evidence.md`

## Docs Updated

- `README.md`
- `README.local.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`

## Evidence Summary

Owner-provided evidence records first pilot backup for `psd_pilot` on `pesona`:

- Backup scope: controlled pilot stack `psd_pilot`.
- This is pilot backup evidence, not production backup and not cutover.
- No restore was performed.
- No restore dry-run was performed.
- Pilot stack remained running after backup.
- Server repo path: `/srv/pesona-studio/repos/pesona-studio-desk`.
- Git head: `ea4cc57120ebc9efa0a2d4f6d02079b73e23404f`.
- Tag: `phase-2h12-complete`.
- Git status short count: `0`.
- Backup directory: `/srv/pesona-studio/backups/psd-pilot-backup-20260702T091559Z`.
- Pilot running container status showed web on `0.0.0.0:3400->3000/tcp`, Postgres and Redis healthy/internal-only, and n8n/workers up.
- Pilot route check was captured.
- Postgres readiness passed.
- PostgreSQL custom dump `postgres-pilot.dump` was created.
- Table list and table count evidence were created.
- Storage archive `storage-pilot.tgz` was created.
- `SHA256SUMS.txt` was created.
- Checksum verification passed for listed files.
- Storage archive readability passed.
- PostgreSQL dump readability via `pg_restore -l` passed.
- `/srv/pesona-studio` remained mounted on `/dev/sdb1` with `469G` size and `445G` available.
- Backup directory size was `212K`.

## Policy Summary

- Pilot backup must be taken before pilot data is considered important.
- Manual pilot backup is required before any meaningful real content or test campaign data entry.
- Backup artifacts must stay outside Git.
- Restore dry-run for pilot backup is a separate phase.
- Cutover remains blocked.

## Outcome

Pilot backup policy is recorded.

First pilot backup evidence is PASS. Checksum verification is PASS. Storage archive readability is PASS. PostgreSQL dump readability is PASS.

Pilot remained running after backup.

No backup artifacts were committed.

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
- No Docker Compose up/down by Codex.
- No container stop, restart, or mutation by Codex.
- No app/runtime code, migration file, or `scripts/prepare-test-db.mjs` change.
- No backup file, dump file, tar archive, checksum file, route evidence file, env file, secret, `node_modules`, generated media, or storage artifact committed.

## Validation Results

Local validation on laptop/WSL completed for this docs-only evidence branch:

| Check | Result |
| --- | --- |
| `git diff --check` | PASS: no whitespace errors in tracked diff. |
| `npm run check` | PASS: 106 tests, 106 pass, 0 fail. |
| `git diff --name-only \| grep "workers/video" \|\| true` | PASS: no `workers/video` diff. |
| Path safety check | PASS: changed paths do not include forbidden app/runtime, migration, script, storage, backup, tmp, env, secret, `node_modules`, media, dump, archive, checksum, route evidence, or backup artifact paths. |
| Safety grep against changed docs only | PASS: expected sensitive/destructive/runtime/backup/restore terms appear only in policy notes, evidence notes, warnings, non-goals, HOLD conditions, pending lists, or safety descriptions. |
| `git status --short --ignored` | PASS: docs/readme changes only, plus ignored local artifacts before commit. |

## Pending Execution List

The following remain pending and require separate owner approval:

- Pilot backup restore dry-run planning in a separate isolated environment.
- Pilot backup restore dry-run execution.
- Controlled pilot review and operating evidence.
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

Recommended next safe phase: pilot backup restore dry-run planning in a separate isolated environment, or controlled pilot review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
