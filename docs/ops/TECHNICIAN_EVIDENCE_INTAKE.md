# Technician Evidence Intake

Purpose: collect technician/admin evidence before any actual local office server deployment or cutover. This document is safe to paste into chat because it should contain no credentials, no `.env.local` contents, and no private secrets.

Do not paste secrets into evidence. Do not attach `.env.local`. Do not include passwords, API keys, tokens, service credentials, database connection strings, or private customer data.

## Owner Request

| Field | Evidence |
| --- | --- |
| Owner request summary | |
| Request date | |
| Target release tag | |
| Target branch | |
| Evidence collected by | |
| Evidence collection date | |

## Technician

| Field | Evidence |
| --- | --- |
| Technician/admin name | |
| Role/company | |
| Contact method | |
| Evidence shared with | |

## Office Server Hardware

| Field | Evidence |
| --- | --- |
| Server model | |
| CPU | |
| RAM installed | |
| SSD size | |
| Other disks | |
| UPS connected | |
| Notes | |

## OS And Kernel

| Field | Evidence |
| --- | --- |
| Ubuntu version | |
| Kernel version | |
| Server timezone | |
| System date/time checked | |

## Docker

| Field | Evidence |
| --- | --- |
| Docker version | |
| Docker Compose version | |
| Docker service status | |
| Docker group/user notes | |

## Disk And Storage

| Field | Evidence |
| --- | --- |
| Disk layout summary | |
| SSD mount path | |
| Free disk space | |
| App storage path confirmation | |
| Storage path on SSD? | |
| Google Drive used only for backup/sharing? | |

## Network

| Field | Evidence |
| --- | --- |
| LAN IP | |
| LAN access confirmed from admin device | |
| Firewall status | |
| LAN-only status | |
| Public exposure disabled | |
| Cloudflare Tunnel/reverse proxy disabled unless owner approved | |

## Repo State

| Field | Evidence |
| --- | --- |
| Repo path | |
| Branch | |
| Tag at HEAD | |
| `git status --short` result | |
| Owner-approved release tag confirmed | |

## Env Handling

Do not paste env values here.

| Field | Evidence |
| --- | --- |
| `.env.local` exists | |
| `.env.local` not tracked by git | |
| Owner provided values privately | |
| No env file attached to evidence | |
| Default provider remains safe unless owner approved otherwise | |

## Compose And Health

| Field | Evidence |
| --- | --- |
| Docker Compose config result | |
| Postgres health | |
| Redis health | |
| Web app status | |
| Health route result | |

## Read-Only Route Smoke

| Route | Status | Notes |
| --- | --- | --- |
| `/health` | | |
| `/operational-readiness` | | |
| `/manual-publish-report` | | |
| `/manual-publish-closeouts` | | |
| `/publication-packages` | | |
| `/approved-videos` | | |
| `/content-items` | | |

## Unresolved Risks

| Risk | Severity | Owner/Admin Decision Needed |
| --- | --- | --- |
| | | |
| | | |
| | | |

## Evidence Safety Confirmation

- No secrets pasted.
- `.env.local` not attached.
- No API keys or tokens included.
- No database connection string included.
- No private customer data included.
- Evidence is safe to paste into owner/admin chat.
