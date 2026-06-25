# Backup Evidence Plan

## Purpose

This plan defines what evidence owner/admin/technician should collect before any real backup is accepted for the office server.

Phase 2H.2 is planning only. It does not run backup, restore, restore dry-run execution, storage copy, deployment, public exposure, or cutover.

## Scope

This document prepares a safe evidence checklist for a future backup evidence phase. The evidence should prove that the required backup sources and destinations are understood before execution.

## Non-Goals

- Do not run backup.
- Do not run restore.
- Do not run restore dry-run execution.
- Do not copy storage files.
- Do not copy, move, read, edit, rename, or delete MP4/media content.
- Do not create backup automation.
- Do not add deployment automation.
- Do not add systemd, cron, autostart, public exposure, Cloudflare Tunnel, scheduler, publisher, social API, OpenAI runtime automation, upload automation, queue expansion, or worker daemon changes.
- Do not add app/runtime code, database queries, migrations, or `scripts/prepare-test-db.mjs` changes.

## Backup Sources To Verify Later

| Source | Evidence Needed Later | Notes |
| --- | --- | --- |
| PostgreSQL database | Backup date, source DB name, dump filename, operator, destination | Do not paste database URL or credentials. |
| Redis | Whether persistence is used and whether Redis backup is required | Skip Redis backup if it is cache/queue-only and owner accepts that. |
| Local storage folders | Folder scope, owner-approved media policy, destination | Includes working storage paths only if approved. Do not attach raw operational media to chat/git. |
| Config templates | Safe template files only | Templates are OK; `.env`, `.env.local`, and real credentials are not. |
| Repo release tag reference | Branch/tag/status evidence | Expected baseline: `phase-2h1-complete` or later owner-approved tag. |

## Must Not Be Backed Up Into Git Or Chat

- `.env`
- `.env.local`
- API keys
- database URLs
- tokens
- passwords
- raw operational media
- database dumps
- screenshots that reveal secrets
- provider credentials
- private customer data unless owner has approved the location and access policy

## Backup Destination Options

| Destination Option | Use Case | Cautions |
| --- | --- | --- |
| Local external drive | Offline backup or technician-held backup evidence | Must be physically controlled by owner/admin. |
| Internal SSD backup folder | Short-term local staging before external/cloud copy | Must not be confused with primary working storage. |
| Google Drive backup/sharing folder | Owner-approved sharing or secondary backup | Drive is not primary working storage and must not contain secrets in public/shared folders. |

## Evidence Fields To Fill Later

| Field | Value |
| --- | --- |
| Evidence date | Owner/technician to fill |
| Owner request reference | Owner/technician to fill |
| Operator name | Owner/technician to fill |
| Office server name/model | Owner/technician to fill |
| Release tag | Owner/technician to fill |
| Git branch/status summary | Owner/technician to fill |
| PostgreSQL backup scope | Owner/technician to fill |
| Redis persistence decision | Owner/technician to fill |
| Storage folder scope | Owner/technician to fill |
| Destination option selected | Owner/technician to fill |
| Destination path/name, redacted if needed | Owner/technician to fill |
| Secrets excluded confirmation | Owner/technician to fill |
| Raw media excluded from chat/git confirmation | Owner/technician to fill |
| Unresolved risks | Owner/technician to fill |
| Owner acceptance decision | Owner/technician to fill |

## Safe Evidence Examples

Use redacted output only:

```text
release_tag: phase-2h1-complete
git_status: clean
postgres_backup_planned: yes
postgres_dump_name: pesona_studio_YYYYMMDD_REDACTED.dump
redis_persistence_used: no / owner to confirm
storage_scope: approved folders listed by name only
destination: Google Drive owner-approved backup folder, path redacted
secrets_included: no
raw_media_attached_to_chat: no
```

Do not include:

```text
DATABASE_URL=...
OPENAI_API_KEY=...
INTERNAL_API_TOKEN=...
password values
private dump download links
raw MP4 attachments
```

## Backup Acceptance Checklist

| Check | Accept / Hold | Notes |
| --- | --- | --- |
| Release tag identified | Hold until filled | Must be owner-approved. |
| PostgreSQL source identified without credentials | Hold until filled | No database URL in evidence. |
| Redis persistence decision recorded | Hold until filled | Only back up Redis if persistence is actually used. |
| Storage scope approved by owner | Hold until filled | No raw media in git/chat. |
| Destination selected and access policy clear | Hold until filled | Public/shared folders must not contain secrets. |
| Secrets excluded | Hold until filled | `.env` and `.env.local` excluded. |
| Evidence safe to paste into owner review | Hold until filled | Redacted only. |
| Owner accepts evidence | Hold until signed | Required before restore dry-run planning. |

## Hold Rule

Hold the sequence if evidence is incomplete, unclear, includes secrets, includes raw operational media in chat/git, lacks a destination decision, lacks owner acceptance, or suggests restoring over the active database.

Incomplete backup evidence means the next step is evidence cleanup, not restore dry-run execution or cutover.
