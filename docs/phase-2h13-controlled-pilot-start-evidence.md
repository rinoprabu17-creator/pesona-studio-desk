# Phase 2H.13 Controlled Pilot Start Evidence

## Phase Name

Phase 2H.13 Controlled Pilot Start Evidence.

## Baseline

- Baseline branch: `main`.
- Baseline commit: `ea4cc57`.
- Baseline tag: `phase-2h12-complete`.
- Current branch/state: `phase-2h13-controlled-pilot-start-evidence` with docs-only evidence changes not committed.
- This phase records owner-provided controlled pilot start evidence only.

## Docs Created

- `docs/ops/CONTROLLED_PILOT_START_EVIDENCE.md`
- `docs/phase-2h13-controlled-pilot-start-evidence.md`

## Docs Updated

- `README.md`
- `README.local.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`

## Evidence Summary

Owner-provided evidence records controlled pilot start on `pesona`:

- Repo path `/srv/pesona-studio/repos/pesona-studio-desk`.
- Checked out release tag `phase-2h12-complete`.
- HEAD, `origin/main`, and `origin/HEAD` at `ea4cc57`.
- Git status clean before pilot start.
- Existing non-PSD containers on ports `3010`, `3020`, and `3030` were not stopped or modified.
- No existing listeners for `3000`, `3400`, `5432`, `5678`, or `6379` before pilot start.
- Temporary override file was created on the server at `/srv/pesona-studio/tmp/psd-pilot-compose.override.yml`.
- Override published only `web-app` host port `3400` to container port `3000`.
- Override removed host port publishing for `postgres`, `redis`, and `n8n`.
- Override set fake/local Campaign Planner provider and OpenAI disabled.
- Override set `restart: "no"` for pilot services.
- Docker Compose config showed only web-app host port `3400`; no host ports for `5432`, `5678`, `6379`, or `3000`.
- Pilot project `psd_pilot` created network and named volumes.
- Pilot Postgres readiness passed.
- Migrations `001` through `018` applied successfully to the pilot database.
- Full pilot stack started with build.
- Post-start runtime status showed Postgres and Redis healthy, web published only on host port `3400`, and n8n/Postgres/Redis internal-only.
- Eight route checks on `127.0.0.1:3400` returned HTTP 200.
- Host port evidence after start showed only PSD pilot web on `3400` plus existing `3010`, `3020`, and `3030`; no host listeners for `3000`, `5432`, `5678`, or `6379`.
- `/srv/pesona-studio` remained mounted on `/dev/sdb1` with `469G` size and `445G` available.
- Repo storage usage remained `48K`.
- Owner may review pilot through LAN/Tailscale at `http://100.120.79.33:3400/content-calendar`.
- Public exposure remains not approved.

## Outcome

Controlled pilot start is PASS.

Route check is PASS. Port isolation is PASS. Fake/local provider is PASS.

Manual publish remains default.

No social API, scheduler, publisher, upload automation, OpenAI live runtime, public exposure, production restore, storage copy, or cutover occurred.

Cutover remains blocked.

## Safety Confirmations

- Docs-only/read-only release in this repo.
- No command run by Codex on Lenovo.
- No new command run by Codex on the `pesona` server.
- No deployment.
- No cutover.
- No production backup.
- No restore.
- No restore dry-run.
- No storage copy.
- No public exposure.
- No Cloudflare Tunnel.
- No scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- No Docker Compose up/down by Codex.
- No container stop, restart, or mutation by Codex.
- No app/runtime code, migration file, or `scripts/prepare-test-db.mjs` change.
- No pilot override file from `/srv/pesona-studio/tmp` committed.
- No env file, secret, `node_modules`, generated media, storage artifact, backup file, dump file, tar archive, checksum file, or restore evidence file committed.

## Validation Results

Local validation on laptop/WSL completed for this docs-only evidence branch:

| Check | Result |
| --- | --- |
| `git diff --check` | PASS: no whitespace errors in tracked diff. |
| `npm run check` | PASS: 106 tests, 106 pass, 0 fail. |
| `git diff --name-only \| grep "workers/video" \|\| true` | PASS: no `workers/video` diff. |
| Path safety check | PASS: changed paths do not include forbidden app/runtime, migration, script, storage, backup, tmp override/evidence, env, secret, `node_modules`, media, dump, archive, checksum, or restore evidence artifact paths. |
| Safety grep against changed docs only | PASS: expected sensitive/destructive/runtime/backup/restore terms appear only in evidence notes, warnings, non-goals, HOLD conditions, pending lists, or safety descriptions. |
| `git status --short --ignored` | PASS: docs/readme changes only, plus ignored local artifacts before commit. |

## Pending Execution List

The following remain pending and require separate owner approval:

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

Recommended next safe phase: controlled pilot review and operating evidence, or production backup policy acceptance.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
