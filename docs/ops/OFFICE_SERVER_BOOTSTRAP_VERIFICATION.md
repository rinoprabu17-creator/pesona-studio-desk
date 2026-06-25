# Office Server Bootstrap Verification

## Purpose

This document is a controlled checklist for verifying that the office Lenovo server can be prepared for Pesona Studio Desk bootstrap work without approving production cutover.

The goal is evidence collection only: confirm the operating system, Docker, repository baseline, storage path, LAN-only posture, and environment-file handling are ready enough for the next gated step.

## Scope

This verification may record read-only server facts and configuration-check results:

- OS version.
- Kernel version.
- Docker version.
- Docker Compose version.
- Repository path.
- Git branch, tag, and status.
- SSD mount path.
- Free disk space.
- LAN IP, redacted or partially redacted.
- `.env.local` exists yes/no only.
- `.env.local` tracked by git yes/no only.
- Docker Compose config result.

## Non-Goals

Phase 2H.4 does not authorize:

- Backup execution.
- Restore execution.
- Restore dry-run execution.
- Restore over the active/local production database.
- Operational storage or media copy.
- Deployment or production cutover.
- Public internet exposure or Cloudflare Tunnel.
- `systemd`, cron, or autostart setup.
- Scheduler, publisher, social API, OpenAI runtime automation, upload automation, queue expansion, or worker daemon changes.
- App/runtime code changes.
- Database migrations.
- Changes to `scripts/prepare-test-db.mjs`.

Ollama may be installed on the Lenovo server, but Ollama integration is out of scope for this phase.

## Target Baseline

| Item | Required Value |
| --- | --- |
| Remote baseline | `origin/main` at `a3fa714` |
| Release tag | `phase-2h3-complete` |
| Branch for this docs phase | `phase-2h4-office-server-bootstrap-verification` |
| Dashboard exposure | LAN-only |
| Cutover status | Blocked |

## Server Bootstrap Checklist

| Check | Evidence To Record | Status |
| --- | --- | --- |
| OS version | Ubuntu Server version, no screenshots with secrets | Owner/technician to fill |
| Kernel version | Kernel version string | Owner/technician to fill |
| Docker version | Docker Engine version | Owner/technician to fill |
| Docker Compose version | Compose plugin version | Owner/technician to fill |
| Repo path | Local repository path, no private credential URLs | Owner/technician to fill |
| Git branch | Current branch name | Owner/technician to fill |
| Git tag | Tag at HEAD, expected `phase-2h3-complete` or later owner-approved tag | Owner/technician to fill |
| Git status | Clean or list of docs-only changes | Owner/technician to fill |
| SSD mount path | Mount path only, no media listing required | Owner/technician to fill |
| Free disk space | Available space summary | Owner/technician to fill |
| LAN IP | Redacted or partially redacted, for example `192.168.x.x` | Owner/technician to fill |
| `.env.local` exists | Yes/no only, no file contents | Owner/technician to fill |
| `.env.local` tracked by git | Yes/no only, expected no | Owner/technician to fill |
| Docker Compose config | Pass/fail only | Owner/technician to fill |

## Safe Commands For Technician

These commands are intended as read-only checks. Do not paste secrets or `.env.local` contents into chat or docs.

```bash
lsb_release -a
uname -a
docker --version
docker compose version
df -h
lsblk
ip addr
git branch --show-current
git tag --points-at HEAD
git status --short
git log --oneline --decorate -6
git check-ignore -v .env.local
docker compose --env-file .env.local -f docker-compose.dev.yml config --quiet
```

For `.env.local`, record only:

- File exists: yes/no.
- Git ignored: yes/no.
- Values pasted anywhere: no.

Do not run `cat .env.local`, do not copy the file into chat, and do not attach screenshots showing credentials.

## Forbidden Commands And Actions

Do not run or authorize:

- `docker compose down -v`.
- `docker volume rm`.
- `rm -rf`.
- Database reset.
- `DROP`, `TRUNCATE`, or `DELETE FROM`.
- Restore over active database.
- Backup execution unless owner asks in a separate explicit command.
- Restore execution or restore dry-run execution.
- Storage copy.
- MP4/media read, copy, move, edit, rename, or delete.
- Public exposure, Cloudflare Tunnel, or reverse proxy exposure.
- `systemd`, cron, or autostart setup.
- Scheduler, publisher, social API, OpenAI runtime automation, upload automation, queue expansion, or worker daemon changes.

## Evidence Fields To Fill

| Field | Value |
| --- | --- |
| Evidence date | Owner/technician to fill |
| Technician/admin name | Owner/technician to fill |
| Server model | Lenovo i7-7700 expected |
| OS version | Owner/technician to fill |
| Kernel version | Owner/technician to fill |
| Docker version | Owner/technician to fill |
| Docker Compose version | Owner/technician to fill |
| Repo path | Owner/technician to fill |
| Branch | Owner/technician to fill |
| Tag at HEAD | Owner/technician to fill |
| Git status summary | Owner/technician to fill |
| SSD mount path | Owner/technician to fill |
| Free disk space | Owner/technician to fill |
| LAN IP redacted | Owner/technician to fill |
| `.env.local` exists yes/no | Owner/technician to fill |
| `.env.local` tracked by git yes/no | Owner/technician to fill |
| Compose config result | Owner/technician to fill |
| Unresolved risks | Owner/technician to fill |

## Hold Conditions

Hold the process if any item below is true:

- Current branch/tag does not match an owner-approved baseline.
- Git status contains app/runtime, migration, storage, media, or secret files.
- `.env.local` is tracked by git.
- Secrets, tokens, API keys, database URLs, passwords, dumps, screenshots with secrets, or operational media are pasted into evidence.
- Docker Compose config fails.
- SSD mount path or available disk space is unclear.
- LAN-only status is unclear.
- Public exposure is proposed without a separate owner-approved phase.
- Backup, restore, restore dry-run execution, storage copy, deployment, or cutover is proposed inside this phase.
- Any destructive command is proposed.

## Final Boundary

Phase 2H.4 verifies bootstrap readiness only. It does not approve backup, restore, restore dry-run execution, storage copy, deployment, public exposure, or cutover.
