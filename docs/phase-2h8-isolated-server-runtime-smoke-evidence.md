# Phase 2H.8 Isolated Server Runtime Smoke Evidence

## Phase Name

Phase 2H.8 Isolated Server Runtime Smoke Evidence.

## Baseline

- Baseline branch: `main`.
- Baseline commit: `7fbbd81`.
- Baseline tag: `phase-2h7-complete`.
- Current branch/state: `phase-2h8-isolated-server-runtime-smoke-evidence` with docs-only evidence changes not committed.
- This phase records owner-provided isolated server runtime smoke evidence only.

## Docs Created

- `docs/ops/ISOLATED_SERVER_RUNTIME_SMOKE_EVIDENCE.md`
- `docs/phase-2h8-isolated-server-runtime-smoke-evidence.md`

## Docs Updated

- `README.md`
- `README.local.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`

## Evidence Summary

Owner-provided evidence records isolated server runtime smoke for the new native Ubuntu server candidate `pesona`:

- Docker Compose project: `psd_server_smoke`.
- Repo path: `/srv/pesona-studio/repos/pesona-studio-desk`.
- Release baseline: `phase-2h6-complete` at `3de1646`.
- Pre-start evidence showed existing containers on ports `3010`, `3020`, and `3030`; ports `3000`, `5432`, `5678`, and `6379` were not occupied before smoke start.
- Compose config showed published ports for `web-app`, `postgres`, `redis`, and `n8n`.
- Owner started the isolated smoke stack manually; Codex did not run server commands.
- Isolated smoke network and named volumes were created.
- `postgres` and `redis` became healthy; app and worker containers started.
- `/health` returned HTTP 200 initially.
- DB-backed routes initially returned HTTP 500 because schema was missing.
- Migrations `001` through `018` were applied to the isolated smoke Postgres database.
- After migration, `psql \dt` showed `30` tables.
- Key routes returned HTTP 200 after migration.
- Storage evidence showed `/dev/sdb1` mounted at `/srv/pesona-studio` with `469G` total and `445G` available; repo `storage` size was `48K`.

## Outcome

Isolated server runtime smoke is PASS after migrations.

The new `pesona` server can build/start the isolated stack and serve key routes after schema migration. The initial HTTP 500 route issue was caused by missing database schema and was resolved by applying migrations to the isolated smoke database.

Cutover remains blocked.

## Safety Confirmations

- Docs-only/read-only evidence intake in this repo.
- No command run by Codex on Lenovo.
- No new command run by Codex on the `pesona` server.
- No deployment.
- No cutover.
- No backup.
- No restore.
- No restore dry-run execution.
- No storage copy.
- No public exposure.
- No Cloudflare Tunnel.
- No scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- No container stop, restart, or mutation by Codex.
- No `docker compose up` or `docker compose down` by Codex.
- No app/runtime code, migration file, or `scripts/prepare-test-db.mjs` change.
- No env file, secret, `node_modules`, generated media, operational media, or storage artifact committed.
- No production/customer data or media used.

## Validation Results

| Check | Result |
| --- | --- |
| `git diff --check` | Passed: no output |
| `npm run check` | Passed: 106 tests, 106 pass, 0 fail |
| `git diff --name-only \| grep "workers/video" \|\| true` | Passed: no output |
| Path safety check | Passed: no changed paths under `apps/`, `workers/`, `packages/`, `migrations/`, `scripts/prepare-test-db.mjs`, `storage/`, generated media, env files, `secrets/`, or `node_modules/` |
| Safety grep against changed docs only | Passed: expected terms appear only in evidence notes, warnings, non-goals, HOLD conditions, pending lists, or safety descriptions |
| `git status --short --ignored` | Docs/readme changes only, plus ignored local artifacts; no commit and no push |

## Pending Execution List

The following remain pending and require separate owner approval:

- Server smoke review and controlled stop procedure planning.
- Controlled stop procedure execution.
- Backup evidence acceptance.
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

Recommended next safe phase: server smoke review and controlled stop procedure planning, or backup evidence acceptance. Do not treat Phase 2H.8 as cutover readiness.
