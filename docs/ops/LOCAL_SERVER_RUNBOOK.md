# Local Server Runbook

Purpose: operate Pesona Studio Desk as a local-first office system for content planning, footage handling, video review, manual publish package tracking, and operational readiness review.

## Expected Server

- Hardware target: office Lenovo i7-7700.
- OS target: Ubuntu Server.
- RAM target: 32GB.
- Storage target: SSD 2TB.
- Power: UPS planned so database and worker activity are not interrupted by sudden power loss.
- Operating hours: roughly 08:00-20:00. This system is not assumed to run 24/7.

## Storage Principle

- SSD 2TB is the working storage for `storage/`.
- Google Drive is backup/sharing only.
- Google Drive is not the primary working storage for footage, draft videos, approved videos, or app runtime files.
- Do not commit source footage, draft MP4, approved MP4, database dumps, or generated storage files.

## Startup Checklist

1. Confirm the server is on UPS or stable power.
2. Confirm free disk space is sufficient before starting daily work.
3. Confirm the repo is on the intended branch/tag for the current release.
4. Confirm `.env.local` exists on the server and is not tracked by git.
5. Start the local stack with the existing Compose file.
6. Confirm PostgreSQL and Redis are healthy.
7. Confirm the web app is reachable.
8. Open Operational Readiness and check warnings before production work.

Safe health commands:

```bash
git status --short
git branch --show-current
docker compose --env-file .env.local -f docker-compose.dev.yml config --quiet
docker compose --env-file .env.local -f docker-compose.dev.yml ps
curl -s -o /tmp/pesona-health.html -w "%{http_code}\n" http://localhost:3000/health
df -h
```

## Shutdown Checklist

1. Confirm no admin is actively editing or reviewing content.
2. Confirm no expected render or manual operation is in progress.
3. Capture any owner-requested evidence before shutdown.
4. Stop the stack without deleting volumes.
5. Leave the server powered according to office policy.

Safe stop command:

```bash
docker compose --env-file .env.local -f docker-compose.dev.yml down
```

## Safe Restart Checklist

1. Save current status: branch, tag, and `git status --short`.
2. Check container status.
3. Stop the stack without deleting volumes.
4. Start the stack again.
5. Confirm health and key pages.

Safe restart commands:

```bash
git status --short
docker compose --env-file .env.local -f docker-compose.dev.yml ps
docker compose --env-file .env.local -f docker-compose.dev.yml down
docker compose --env-file .env.local -f docker-compose.dev.yml up -d
curl -s -o /tmp/pesona-health.html -w "%{http_code}\n" http://localhost:3000/health
```

## Safe Update Checklist

1. Owner confirms the target release tag.
2. Capture current branch, tag, and `git status --short`.
3. Confirm the worktree is clean before pulling or switching release.
4. Confirm no local untracked evidence needs to be archived.
5. Apply the owner-approved update.
6. Run migrations only with `npm run db:migrate`.
7. Run `npm run check` if the server has enough time and resources.
8. Start or restart the stack without deleting volumes.
9. Confirm health and key read-only pages.

Recommended post-update pages:

- `/operational-readiness`
- `/manual-publish-report`
- `/manual-publish-closeouts`
- `/publication-packages`
- `/approved-videos`
- `/content-items`

## What Not To Run

These are forbidden during normal operations unless the owner explicitly approves a reset plan and backup evidence exists:

```text
docker compose down -v
docker volume rm
database reset commands
DROP/TRUNCATE/ALTER used as manual repair
rm -rf storage
rm -rf storage/footage
rm -rf storage/draft-videos
rm -rf storage/approved-videos
git add storage/**/*.mp4
```

Do not delete Docker volumes, reset the database, delete storage, or commit generated MP4/source files.

## Recovery Escalation Notes

Escalate to owner/admin before repair if:

- Database health fails after restart.
- A migration fails.
- Storage files are missing.
- Disk space is low and cleanup decisions involve footage or video outputs.
- Git branch/tag does not match the approved release.
- There is any temptation to delete volumes, reset DB, or remove storage files.

Collect branch, status, container status, recent logs, disk usage, and the exact route/error before asking for help.
