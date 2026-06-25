# Backup Evidence Collection

## Purpose

This document defines how owner/admin/technician should collect backup evidence for Pesona Studio Desk without exposing secrets or triggering backup, restore, storage copy, deployment, or cutover.

Phase 2H.3 is a docs-only/read-only collection pack. It prepares the intake format for future evidence and does not execute the backup.

## Scope

Use this document to collect safe, redacted evidence for:

- PostgreSQL backup readiness and evidence fields.
- Redis evidence only if persistence is actually used.
- Storage backup scope and destination evidence.
- Repo/tag baseline evidence.
- Owner acceptance or hold decision.

## Non-Goals

- Do not run backup.
- Do not run restore.
- Do not run restore dry-run execution.
- Do not restore over the active/local production database.
- Do not copy, move, read, edit, rename, or delete MP4/media content.
- Do not perform storage copy.
- Do not deploy.
- Do not cut over.
- Do not add systemd, cron, autostart, public exposure, Cloudflare Tunnel, scheduler, publisher, social API, OpenAI runtime automation, upload automation, queue expansion, or worker daemon changes.
- Do not add app/runtime code, migrations, database queries, or `scripts/prepare-test-db.mjs` changes.

## Evidence Collection Rules

- Evidence must be safe to paste into owner review.
- Use summaries, filenames, sizes, timestamps, tags, and redacted paths only.
- Do not paste command output that reveals credentials, private URLs, API keys, tokens, passwords, private customer data, or raw dump contents.
- Do not attach `.env`, `.env.local`, database dumps, screenshots with secrets, or operational media.
- Do not attach MP4/media files to chat or git.
- If evidence is unclear or sensitive, redact more and add an owner/technician note.

## What May Be Safely Pasted

- Release tag, for example `phase-2h2-complete`.
- Branch name and clean/dirty git status summary.
- Server model or hostname if owner accepts sharing it.
- OS/Docker version summaries.
- Backup filename with sensitive parts redacted.
- Backup file size.
- Backup destination type, such as local external drive, internal SSD backup folder, or owner-approved Google Drive backup/sharing folder.
- Hash/checksum value if owner approves sharing it and it does not reveal private path data.
- Redacted storage folder names and counts.
- Owner decision: accept, hold, or repeat evidence.

## What Must Be Redacted

- `.env`
- `.env.local`
- API keys
- database URLs
- tokens
- passwords
- raw database dumps
- raw operational media
- screenshots with credentials or private URLs
- private customer data
- exact public share links unless owner approves sharing them

## PostgreSQL Backup Evidence Fields

| Field | Evidence |
| --- | --- |
| Evidence date/time | Owner/technician to fill |
| Operator | Owner/technician to fill |
| Release tag | Owner/technician to fill |
| Database source label | Redacted label only |
| Backup method summary | Owner/technician to fill |
| Dump filename | Redacted if needed |
| Dump size | Owner/technician to fill |
| Dump created successfully | Yes / No |
| Dump stored at approved destination | Yes / No |
| Credentials excluded | Yes / No |
| Actual database URL pasted | Must be No |
| Notes / warnings | Owner/technician to fill |

## Redis Evidence Fields

Fill this only if Redis persistence is actually used. If Redis is cache/queue-only and owner accepts that it is not backed up, record that decision.

| Field | Evidence |
| --- | --- |
| Redis persistence used | Yes / No / Unknown |
| Owner decision | Back up / Skip / Hold |
| Evidence source | Owner/technician to fill |
| Backup needed | Yes / No |
| Secrets excluded | Yes / No |
| Notes / warnings | Owner/technician to fill |

## Storage Backup Evidence Fields

This section records scope and evidence only. It does not authorize storage copy or MP4/media handling.

| Field | Evidence |
| --- | --- |
| Storage root label | Redacted label only |
| Included folders | Owner-approved names only |
| Excluded folders/files | Owner/technician to fill |
| Raw media attached to chat/git | Must be No |
| MP4/media copied by this phase | Must be No |
| File count summary | Owner/technician to fill if safe |
| Size summary | Owner/technician to fill if safe |
| Owner media policy accepted | Yes / No |
| Notes / warnings | Owner/technician to fill |

## Repo/Tag Evidence Fields

| Field | Evidence |
| --- | --- |
| Release tag | Expected `phase-2h2-complete` or later owner-approved tag |
| Branch | Owner/technician to fill |
| Git status summary | Clean / Dirty / Hold |
| Latest commit short hash | Owner/technician to fill |
| Remote status summary | Owner/technician to fill |
| Unexpected local changes | Yes / No |

## Backup Destination Evidence Fields

| Field | Evidence |
| --- | --- |
| Destination type | Local external drive / Internal SSD backup folder / Google Drive backup-sharing folder |
| Destination label | Redacted label only |
| Destination access owner | Owner/admin/technician to fill |
| Public/shared folder risk reviewed | Yes / No |
| Secrets excluded from destination | Yes / No |
| Raw media policy accepted | Yes / No |
| Retention expectation | Owner/technician to fill |
| Notes / warnings | Owner/technician to fill |

## Backup File Naming Convention

Use names that are clear but do not expose secrets:

```text
pesona_studio_<scope>_<YYYYMMDD-HHMM>_<release-tag>_<redacted-operator>.dump
pesona_studio_storage_manifest_<YYYYMMDD-HHMM>_<release-tag>.txt
```

Examples:

```text
pesona_studio_postgres_20260701-0930_phase-2h2-complete_REDACTED.dump
pesona_studio_storage_manifest_20260701-0930_phase-2h2-complete.txt
```

Do not include credentials, customer names, private folder IDs, public share URLs, or real secrets in filenames.

## Backup Checksum/Hash Evidence Placeholder

| File Label | Hash Type | Hash Value | Notes |
| --- | --- | --- | --- |
| Owner/technician to fill | SHA256 or owner-approved method | Owner/technician to fill | Do not include private path data. |

## Backup Acceptance Checklist

| Check | Accept / Hold | Notes |
| --- | --- | --- |
| Release tag recorded | Hold until filled | Expected `phase-2h2-complete` or later owner-approved tag. |
| PostgreSQL evidence complete | Hold until filled | No database URL or credentials. |
| Redis decision recorded if relevant | Hold until filled | Only if persistence is used. |
| Storage scope approved | Hold until filled | No raw media in chat/git. |
| Destination approved | Hold until filled | Access policy must be clear. |
| Hash/checksum evidence captured if owner requires | Hold until filled | Redacted evidence only. |
| Secrets excluded | Hold until confirmed | `.env` and `.env.local` excluded. |
| Owner acceptance decision recorded | Hold until signed | Required before restore dry-run planning. |

## Owner Review Checklist

- Evidence is readable without secret values.
- Backup source and destination are clear.
- Media handling policy is clear.
- Redis persistence decision is clear.
- No raw dump, raw media, `.env`, `.env.local`, API keys, database URLs, tokens, or passwords are included.
- Backup evidence is accepted, held, or sent back for cleanup.

## Hold Conditions

Hold if:

- evidence includes secrets,
- evidence includes raw operational media,
- evidence includes database dumps,
- destination access policy is unclear,
- Redis persistence decision is unknown,
- storage scope is not owner-approved,
- release tag is missing,
- restore dry-run or cutover is proposed before backup evidence acceptance,
- restore over the active/local production database is proposed,
- any destructive command is proposed.

If held, the next step is evidence cleanup or backup evidence planning clarification, not restore dry-run execution or cutover.
