# Backup Evidence Template

This fillable template is safe to use for future backup evidence only if secrets and operational media are excluded.

Do not paste `.env`, `.env.local`, API keys, database URLs, tokens, passwords, dump contents, screenshots with secrets, raw operational media, MP4 files, or customer-private data.

## Server Identity

| Field | Value |
| --- | --- |
| Evidence date/time |  |
| Owner request reference |  |
| Technician/operator |  |
| Server model/label |  |
| OS summary |  |
| Docker summary |  |
| LAN-only status |  |
| Notes |  |

## Repo Baseline

| Field | Value |
| --- | --- |
| Release tag |  |
| Branch |  |
| Latest commit short hash |  |
| Git status summary |  |
| Remote status summary |  |
| Unexpected local changes |  |
| Notes |  |

## Database Backup Evidence

| Field | Value |
| --- | --- |
| PostgreSQL source label, redacted |  |
| Backup method summary |  |
| Dump filename, redacted if needed |  |
| Dump size |  |
| Dump destination label |  |
| Dump created successfully |  |
| Credentials excluded |  |
| Database URL pasted | Must be No |
| Warnings |  |

## Redis Evidence

Fill only if Redis persistence is actually used.

| Field | Value |
| --- | --- |
| Redis persistence used |  |
| Backup needed |  |
| Owner decision |  |
| Evidence summary |  |
| Secrets excluded |  |
| Warnings |  |

## Storage Backup Evidence

| Field | Value |
| --- | --- |
| Storage root label, redacted |  |
| Included folder names |  |
| Excluded folder/file notes |  |
| File count summary, if safe |  |
| Size summary, if safe |  |
| Raw media attached to chat/git | Must be No |
| MP4/media copied by this phase | Must be No |
| Owner media policy accepted |  |
| Warnings |  |

## Destination Evidence

| Field | Value |
| --- | --- |
| Destination type |  |
| Destination label, redacted |  |
| Access owner |  |
| Public/shared folder risk reviewed |  |
| Secrets excluded from destination |  |
| Raw media policy accepted |  |
| Retention expectation |  |
| Warnings |  |

## Checksum / Hash Evidence

| File Label | Hash Type | Hash Value | Notes |
| --- | --- | --- | --- |
|  |  |  |  |

## Redaction Confirmation

| Check | Yes / No |
| --- | --- |
| `.env` excluded |  |
| `.env.local` excluded |  |
| API keys excluded |  |
| Database URLs excluded |  |
| Tokens excluded |  |
| Passwords excluded |  |
| Raw database dumps excluded from chat/git |  |
| Raw operational media excluded from chat/git |  |
| Screenshots with secrets excluded |  |

## Acceptance Decision

| Field | Value |
| --- | --- |
| Decision | Accept / Hold / Repeat evidence |
| Decision date/time |  |
| Evidence reviewed by |  |
| Risks accepted |  |
| Required cleanup |  |
| Next safe step | Backup evidence review/acceptance / Restore dry-run planning / Hold |

## Owner Notes

```text
Owner notes:

Owner name/sign-off:

Date:
```
