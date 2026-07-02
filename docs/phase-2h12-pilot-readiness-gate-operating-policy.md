# Phase 2H.12 Pilot Readiness Gate + Operating Policy

## Phase Name

Phase 2H.12 Pilot Readiness Gate + Operating Policy.

## Baseline

- Baseline branch: `main`.
- Baseline commit: `ff82fc5`.
- Baseline tag: `phase-2h11-complete`.
- Current branch/state: `phase-2h12-pilot-readiness-gate-operating-policy` with docs-only policy changes not committed.
- This phase creates a pilot readiness gate and server operating policy only.

## Docs Created

- `docs/ops/PILOT_READINESS_GATE.md`
- `docs/ops/SERVER_OPERATING_POLICY.md`
- `docs/phase-2h12-pilot-readiness-gate-operating-policy.md`

## Docs Updated

- `README.md`
- `README.local.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`

## Policy Summary

Phase 2H.12 records that the new server candidate `pesona` has enough evidence to support owner/operator pilot readiness discussion, while keeping cutover blocked.

PASS evidence available before this gate:

- New server bootstrap PASS.
- Storage `/srv/pesona-studio` PASS.
- Isolated runtime smoke PASS.
- Controlled stop PASS.
- Smoke backup PASS.
- Smoke restore dry-run PASS.

Accepted limitation:

- `16GB` RAM is accepted for initial pilot with monitoring.
- Upgrade to `32GB` remains deferred until the content system proves lead/order value.

HOLD items:

- GPU driver.
- Production backup policy.
- Autostart, `systemd`, or cron.
- Public exposure.
- Scheduler, publisher, or social API activation.
- OpenAI live runtime.
- Final cutover.

## Pilot Entry Criteria

- Owner confirms pilot scope.
- Access remains internal/LAN or Tailscale-only.
- No public tunnel.
- No real irreversible automation.
- Manual publish remains default.
- Backup plan accepted.
- Responsible operator identified.

## Pilot Non-Goals

- No cutover.
- No public exposure.
- No social API or publisher activation.
- No OpenAI live runtime.
- No production restore.

## Safety Confirmations

- Docs-only/read-only release in this repo.
- No command run by Codex on Lenovo.
- No command run by Codex on the `pesona` server.
- No deployment.
- No cutover.
- No backup.
- No restore.
- No restore dry-run.
- No storage copy.
- No public exposure.
- No Cloudflare Tunnel.
- No scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- No Docker Compose up/down.
- No container start, stop, restart, or mutation.
- No app/runtime code, migration file, or `scripts/prepare-test-db.mjs` change.
- No backup file, restore evidence file, dump file, archive file, checksum file, env file, secret, `node_modules`, generated media, operational media, or storage artifact committed.

## Validation Results

Local validation on laptop/WSL completed for this docs-only policy branch:

| Check | Result |
| --- | --- |
| `git diff --check` | PASS: no whitespace errors in tracked diff. |
| `npm run check` | PASS: 106 tests, 106 pass, 0 fail. |
| `git diff --name-only \| grep "workers/video" \|\| true` | PASS: no `workers/video` diff. |
| Path safety check | PASS: changed paths do not include forbidden app/runtime, migration, script, storage, backup, tmp restore evidence, env, secret, `node_modules`, media, dump, archive, checksum, or restore evidence artifact paths. |
| Safety grep against changed docs only | PASS: expected sensitive/destructive/runtime/backup/restore terms appear only in policy notes, warnings, non-goals, HOLD conditions, pending lists, or safety descriptions. |
| `git status --short --ignored` | PASS: docs/readme changes only, plus ignored local artifacts before commit. |

## Pending Execution List

The following remain pending and require separate owner approval:

- Controlled pilot start procedure.
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

Recommended next safe phase: controlled pilot start procedure, or production backup policy review.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
