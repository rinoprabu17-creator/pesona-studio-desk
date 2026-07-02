# Phase 2H.7 New Server Bootstrap Evidence

## Phase Name

Phase 2H.7 New Server Bootstrap Evidence.

## Baseline

- Baseline tag: `phase-2h6-complete`.
- Baseline commit: `3de1646`.
- Current branch/state: `phase-2h7-new-server-bootstrap-evidence` with docs-only evidence changes not committed.
- This phase records owner-provided evidence only.

## Docs Created

- `docs/ops/NEW_SERVER_BOOTSTRAP_EVIDENCE.md`
- `docs/phase-2h7-new-server-bootstrap-evidence.md`

## Docs Updated

- `README.md`
- `README.local.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`

## Evidence Summary

Owner-provided evidence records a new native Ubuntu server candidate named `pesona`:

- Ubuntu 22.04.5 LTS, kernel `5.15.0-185-generic`.
- Intel Core i5-13400F, 10 cores, 16 logical threads.
- About `15Gi` RAM, accepted with limit for initial use.
- NVMe root disk with about `429G` free and SMART PASS.
- SATA SSD work storage mounted at `/srv/pesona-studio` with ext4 label `PSD_WORK`, UUID `0d68422c-b2b0-44d4-8c93-56d57e624b66`, mount options `rw,noatime`, and about `445G` available.
- HDD 1TB SMART PASS, candidate for backup/archive only.
- LAN IP `192.168.1.76`, Tailscale IP `100.120.79.33`, Tailscale active, public exposure not approved.
- Docker non-sudo access for user `pesona` recorded as PASS.
- Repo cloned to `/srv/pesona-studio/repos/pesona-studio-desk`, checked out at tag `phase-2h6-complete`, HEAD `3de1646`, git status clean.
- `.env.local` created from template, ignored, and not tracked; env values were not pasted.
- `docker compose config --quiet` passed with exit code `0`.

## Outcome

New Ubuntu server candidate bootstrap is a strong PASS for CPU, OS, Docker, storage mount, repo, env handling, and Compose config validation.

Accepted limitation:

- 16GB RAM for initial use. Owner will consider 32GB later if the content system proves it generates leads and converts to orders.

HOLD:

- GPU driver.
- Runtime smoke.
- Backup evidence.
- Restore dry-run.
- Cutover.

Lenovo remains partial PASS with hardware/storage HOLD. The new server candidate may replace Lenovo only after later validation and explicit owner approval.

## Safety Confirmations

- Docs-only/read-only evidence intake.
- No command run by Codex on Lenovo.
- No command run by Codex on the new `pesona` server.
- No `docker compose up`.
- No runtime smoke.
- No backup.
- No restore.
- No restore dry-run execution.
- No storage copy.
- No deployment.
- No cutover.
- No app/runtime code, migration, worker code, or `scripts/prepare-test-db.mjs` change.
- No existing containers stopped, restarted, or modified.
- No public exposure, Cloudflare Tunnel, scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- No secret, `.env.local` value, API key, database URL, token, password, dump, screenshot with secret, operational media, or generated media committed.

## Validation Results

| Check | Result |
| --- | --- |
| `git diff --check` | Passed: no output |
| `npm run check` | Passed using existing laptop-local PostgreSQL container: 106 tests, 106 pass, 0 fail |
| `git diff --name-only \| grep "workers/video" \|\| true` | Passed: no output |
| Path safety check | Passed: no changed paths under `apps/`, `workers/`, `packages/`, `migrations/`, `scripts/prepare-test-db.mjs`, `storage/`, env files, or generated media |
| Safety grep against changed docs only | Passed: expected terms appear only in evidence notes, warnings, non-goals, HOLD conditions, pending lists, or safety descriptions |
| `git status --short` | Docs/readme changes only; no commit and no push |

## Pending Execution List

The following remain pending and require separate owner approval:

- Explicit Docker non-sudo verification on the new `pesona` server.
- Isolated server runtime smoke planning.
- Runtime smoke execution.
- Backup evidence collection.
- Backup execution.
- Restore planning and restore dry-run execution in a separate test environment.
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

Recommended next safe phase: explicit Docker non-sudo verification and isolated server runtime smoke planning for the new `pesona` server. Do not treat Phase 2H.7 as cutover readiness.
