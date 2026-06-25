# Local Server Deployment Rehearsal

Purpose: rehearse the move from laptop/dev workflow toward the local office Lenovo server before the owner approves actual cutover. This document is a plan and checklist only. It is not an instruction to migrate live data, restore a database, copy storage, rebuild containers, or switch daily operations.

## Target Server

- Hardware: Lenovo i7-7700 office server.
- OS: Ubuntu Server.
- RAM target: 32GB.
- Storage target: SSD 2TB.
- Power: UPS planned.
- Operating hours: roughly 08:00-20:00. The system is not designed as a 24/7 service in this phase.

## Principles

- Pesona Studio Desk remains local-first.
- The SSD is the working storage for runtime data and local storage folders.
- Google Drive is backup/sharing only, not primary working storage.
- Rehearsal must not perform actual cutover.
- Rehearsal must not restore over active DB.
- Rehearsal must not delete volumes or storage.
- Rehearsal assumes no auto-publisher, no scheduler, no social API, no OpenAI runtime automation, no uploadd automation, no queue expansion, and no worker daemon changes.

## Rehearsal Phases

### 1. Hardware Readiness

Confirm:

- Lenovo i7-7700 is physically available.
- RAM target is installed or upgrade path is clear.
- SSD 2TB is installed or mount plan is documented.
- UPS is installed or owner accepts temporary power risk.
- Server has stable keyboard/monitor or remote admin access.

### 2. OS Readiness

Safe checks:

```bash
lsb_release -a
uname -a
df -h
free -h
ip addr
```

Confirm Ubuntu Server is installed, patched by technician/admin policy, and reachable on LAN.

### 3. Docker Readiness

Safe checks:

```bash
docker --version
docker compose version
docker info
```

Confirm Docker Engine and Compose plugin are installed. Do not create production containers during planning unless owner approves a separate deployment window.

### 4. Repo Clone Readiness

Confirm:

- Owner approves repository source.
- Technician/admin has read access.
- Target release tag is known.
- Current expected release baseline is documented.
- Worktree must be clean before any real operational use.

Safe checks after owner-approved clone/pull:

```bash
git branch --show-current
git tag --points-at HEAD
git status --short
```

### 5. Env File Readiness

Confirm:

- `.env.local` will be created from the example file by owner/admin.
- Owner provides credential values out of band.
- Credential values are not pasted into chat, screenshots, issue text, or git.
- `.env.local` remains untracked.
- Default local provider remains fake unless owner explicitly approves another mode.

### 6. Storage Mount And Path Readiness

Confirm:

- SSD path is identified.
- App storage path maps to the SSD working storage.
- Folder ownership and permissions allow Docker bind mount use.
- Storage is not placed in public cloud sync as primary runtime storage.
- Google Drive is only backup/sharing.

Safe checks:

```bash
df -h
ls -la storage
git status --short
```

### 7. Database Backup Evidence Readiness

Before any cutover, owner/admin must have:

- Current laptop/dev DB backup evidence if real data is being moved.
- Backup date and operator.
- Release tag and branch evidence.
- Backup location and access policy.
- Confirmation that credentials are not included in public/shared backup.

This phase does not run a real backup.

### 8. Test Restore Readiness

Restore dry-run must use a separate test database/environment only.

Forbidden:

```text
restore over active DB
docker compose down -v
docker volume rm
reset database
rm -rf storage
```

The dry-run must not delete volumes or storage. The owner must approve the dry-run target before any restore action.

### 9. App Smoke Route Readiness

After owner-approved rehearsal deployment only, safe read-only route checks are:

- `/health`
- `/operational-readiness`
- `/manual-publish-report`
- `/manual-publish-closeouts`
- `/publication-packages`
- `/approved-videos`
- `/content-items`

Safe check example:

```bash
curl -s -o /tmp/pesona-health.html -w "%{http_code}\n" http://localhost:3000/health
```

Do not use route checks as evidence that data migration is complete unless DB counts and storage listings are also reviewed.

### 10. Owner Approval Gate

Owner approval is required before:

- Real data backup.
- Real DB restore.
- Real storage copy.
- Server becomes the daily operational source.
- Public exposure, tunnel, reverse proxy, or internet access.
- Any non-default OpenAI, social API, scheduler, publisher, or upload behavior.

## Rehearsal Exit Criteria

Rehearsal is ready for owner review when:

- Hardware, OS, Docker, repo, env, storage, backup evidence, restore dry-run target, and smoke route plan are documented.
- No actual production restore happened.
- No Docker volume was deleted.
- No storage was deleted or copied as part of this phase.
- No runtime code or deployment automation was added.
