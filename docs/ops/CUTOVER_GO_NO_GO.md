# Cutover Go / No-Go

Cutover means the actual move of daily Pesona Studio Desk operations to the local office server. This document is a checklist and approval gate only. Phase 2G.4 does not execute cutover.

## Pre-Cutover Requirements

- Owner approves cutover date and scope.
- Target release tag is confirmed.
- Office server hardware is ready.
- Ubuntu Server is ready.
- Docker Engine and Compose plugin are ready.
- SSD working storage path is ready.
- UPS status is accepted by owner.
- `.env.local` is prepared without exposing credentials.
- Backup evidence exists.
- Restore dry-run evidence exists from a separate test environment.
- Read-only route smoke plan is ready.
- Rollback plan is understood by owner/admin.

## Owner Approval Gate

Do not start cutover until owner approves:

- Exact release tag.
- Backup evidence.
- Restore dry-run result.
- Storage path.
- Downtime window.
- Rollback criteria.
- People responsible for each step.

## Backup Evidence Gate

Go only if:

- Database backup evidence exists.
- Backup date and operator are recorded.
- Backup location is owner-approved.
- Credential files are excluded from public/shared folders.
- Storage backup/sharing scope is clear.

## Restore Dry-Run Gate

Go only if:

- Restore dry-run used a separate test database/environment.
- No restore over active DB occurred.
- No volume delete occurred.
- No storage delete occurred.
- Route checks and count checks passed in the test target.

## Route Smoke Gate

Go only if the plan can verify:

- `/health`
- `/operational-readiness`
- `/content-items`
- `/footage-assets`
- `/approved-videos`
- `/publication-packages`
- `/manual-publish-report`
- `/manual-publish-closeouts`

## Go Criteria

Cutover can proceed when:

- Owner explicitly says Go.
- Branch/tag is correct.
- Worktree is clean.
- Docker Compose config resolves.
- PostgreSQL and Redis are healthy on target.
- Storage path is on SSD.
- Backup evidence exists.
- Restore dry-run evidence passed.
- No blocking disk, power, or network risks remain.
- Admins know the rollback plan.

## No-Go Criteria

Do not proceed when:

- Owner approval is missing.
- Branch/tag is wrong.
- Worktree has unexplained changes.
- Backup evidence is missing.
- Restore dry-run was skipped.
- The target accidentally points at an active DB during test restore.
- Docker, Postgres, Redis, or web app is unhealthy.
- Disk space is low.
- Storage path is not on intended SSD.
- Public internet exposure is enabled without owner approval.
- Someone proposes destructive commands during cutover.

## Rollback Plan

Rollback means daily operations remain on the previous approved environment until the office server is ready.

Rollback triggers:

- App health fails.
- DB restore verification fails.
- Storage verification fails.
- Critical route returns non-200.
- Admin cannot reach dashboard on LAN.
- Unexpected data mismatch appears.
- Owner calls No-Go.

Rollback actions:

1. Stop using the new office server for daily operations.
2. Keep previous approved environment as source of truth.
3. Preserve evidence from the failed attempt.
4. Do not delete volumes or storage.
5. Do not overwrite backups.
6. Document blocker and owner decision.

## Post-Cutover Observation Window

Observe for:

- First hour.
- End of first business day.
- End of first week.

Use `POST_CUTOVER_VERIFICATION.md` for route, DB count, storage, manual publish, and owner sign-off checks.

## Non-Goals During Cutover

- No scheduler.
- No publisher.
- No social API.
- No OpenAI runtime automation.
- No uploadd automation.
- No queue expansion.
- No worker daemon changes.
- No public internet exposure unless owner separately approves it.
