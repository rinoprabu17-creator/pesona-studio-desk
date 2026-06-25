# Troubleshooting And Incidents

Use this guide to collect evidence and recover safely. Do not use destructive repair commands unless the owner explicitly approves a written plan.

## App Not Reachable

Safe checks:

```bash
docker compose --env-file .env.local -f docker-compose.dev.yml ps
curl -s -o /tmp/pesona-health.html -w "%{http_code}\n" http://localhost:3000/health
docker compose --env-file .env.local -f docker-compose.dev.yml logs --tail=120 web-app
```

Collect:

- Current branch and release tag.
- Container status.
- Web app logs.
- Exact URL and browser error.

## Docker Container Unhealthy

Safe checks:

```bash
docker compose --env-file .env.local -f docker-compose.dev.yml ps
docker compose --env-file .env.local -f docker-compose.dev.yml logs --tail=120 postgres
docker compose --env-file .env.local -f docker-compose.dev.yml logs --tail=120 redis
docker compose --env-file .env.local -f docker-compose.dev.yml logs --tail=120 web-app
```

If a simple restart is approved for normal operations, restart without deleting volumes.

## Postgres Unavailable

Safe checks:

```bash
docker compose --env-file .env.local -f docker-compose.dev.yml ps postgres
docker compose --env-file .env.local -f docker-compose.dev.yml logs --tail=160 postgres
```

Do not reset the database. Do not remove the Postgres volume.

## Redis Unavailable

Safe checks:

```bash
docker compose --env-file .env.local -f docker-compose.dev.yml ps redis
docker compose --env-file .env.local -f docker-compose.dev.yml logs --tail=160 redis
```

Redis downtime may affect worker/job behavior. Preserve evidence before restart.

## Migration Failure

Safe checks:

```bash
npm run db:migrate
git status --short
```

Collect:

- Full migration output.
- Current branch/tag.
- Whether any migration was newly added in the current phase.
- Database backup status.

Do not manually edit migration ledger rows without owner-approved repair instructions.

## Tests Failing

Safe checks:

```bash
npm run check
npm run test:footage-catalog
```

Collect the failing test name, command, and first useful error. Do not reset the test or development DB unless the owner approved that specific action.

## Disk Space Low

Safe checks:

```bash
df -h
du -sh storage
du -sh storage/footage storage/draft-videos storage/approved-videos
```

Do not delete footage, draft videos, approved videos, or database volumes without owner approval and backup evidence.

## Storage File Missing

Safe checks:

```bash
find storage/footage -maxdepth 3 -type f | sort
find storage/draft-videos -maxdepth 3 -type f | sort
find storage/approved-videos -maxdepth 3 -type f | sort
```

Collect the app page, expected relative path, related content/package ID, and storage listing. Do not recreate or overwrite MP4 files during incident triage.

## Ignored MP4 Accidentally Staged

Safe checks:

```bash
git status --short
git check-ignore -v storage/footage/* storage/draft-videos/* storage/approved-videos/*
```

If an MP4 appears staged, stop and ask owner/admin before changing git index. Do not commit generated MP4/source files.

## Git Branch Or Tag Mistake

Safe checks:

```bash
git branch --show-current
git tag --points-at HEAD
git status --short
```

Do not force reset, force push, or delete tags during incident triage. Escalate with the current branch, tag, and status output.

## Social Platform Or Manual Posting Issue

Studio Desk does not auto-post in this phase. If a manual platform post fails:

1. Confirm the issue on the platform UI.
2. Keep Studio Desk package/checklist evidence unchanged until the manual issue is resolved.
3. Record the platform-side issue in admin notes.
4. Ask owner/admin before marking evidence complete.

Do not add social API calls, platform SDKs, or upload automation during incident handling.

## What To Collect Before Asking For Help

- Current branch and release tag.
- `git status --short`.
- Container `ps` output.
- Health check status code.
- Relevant route URL and status code.
- Recent logs for the affected container.
- Disk space output.
- Exact user-visible error.
- Last safe action performed.

## Destructive Commands Forbidden

These are forbidden during normal troubleshooting:

```text
docker compose down -v
docker volume rm
database reset commands
DROP/TRUNCATE used as manual cleanup
rm -rf storage
rm -rf storage/footage
rm -rf storage/draft-videos
rm -rf storage/approved-videos
```
