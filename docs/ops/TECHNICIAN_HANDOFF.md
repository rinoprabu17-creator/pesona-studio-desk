# Technician Handoff

Audience: office technician or admin helping prepare the local office server for Pesona Studio Desk.

This guide is for preparation and evidence collection. It does not authorize actual cutover, DB restore, storage copy, public exposure, or new automation.

## Technician May Do

- Install or update Ubuntu packages according to office maintenance policy.
- Install Docker Engine and Docker Compose plugin.
- Verify disk, SSD mount, UPS, and LAN network.
- Clone or pull the repository only after owner approval.
- Set up `.env.local` using owner-provided values without exposing credentials.
- Run safe health checks.
- Report evidence back to owner/admin.

## Technician Must Not Do

- Expose dashboard to public internet.
- Upload credentials or env values to chat, screenshots, tickets, or shared folders.
- Commit `.env`, `.env.local`, database dumps, MP4 files, or generated storage files.
- Run destructive Docker, DB, or storage commands.
- Run `docker compose down -v`.
- Run `docker volume rm`.
- Reset database.
- Restore over active DB.
- Delete storage folders.
- Enable OpenAI, social API, publisher, scheduler, upload automation, queue expansion, or worker daemon changes.
- Modify worker/runtime files without owner/dev approval.
- Add cron jobs or deployment automation.

## Information To Provide Back

| Evidence | Required Detail | Status |
| --- | --- | --- |
| OS version | Ubuntu Server version and kernel | Pending |
| Docker version | Docker Engine and Compose plugin versions | Pending |
| Disk layout | SSD size, mount path, free space | Pending |
| LAN access | Server local IP and allowed users | Pending |
| Firewall | LAN-only access confirmation | Pending |
| UPS | Installed, tested, or pending | Pending |
| Repo state | Branch, tag, and clean status | Pending |
| Storage path | Runtime storage path on SSD | Pending |
| Env handling | `.env.local` present and untracked | Pending |
| Health checks | Compose config, container status, app health | Pending |

## Safe Evidence Commands

```bash
lsb_release -a
uname -a
docker --version
docker compose version
df -h
free -h
ip addr
git branch --show-current
git tag --points-at HEAD
git status --short
docker compose --env-file .env.local -f docker-compose.dev.yml config --quiet
docker compose --env-file .env.local -f docker-compose.dev.yml ps
curl -s -o /tmp/pesona-health.html -w "%{http_code}\n" http://localhost:3000/health
```

## Credential Handling

- Owner/admin supplies credentials privately.
- Technician confirms presence and file permissions without revealing values.
- Do not paste credentials into terminal logs being shared.
- Do not store credentials in public Drive folders.
- Do not commit env files.

## Handoff Completion

Technician handoff is complete when owner/admin receives:

- Hardware and OS evidence.
- Docker evidence.
- LAN and firewall evidence.
- Storage and SSD evidence.
- UPS status.
- Repo branch/tag/status evidence.
- Health check evidence.
- List of any unresolved risks.
