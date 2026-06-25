# Office Server Preflight Printable

Print or export this checklist before preparing the office server. It is a planning and evidence checklist only. It does not authorize deployment, backup, restore, storage copy, or cutover.

Use `Pass/Fail` as `Pass`, `Fail`, or `N/A`.

## Hardware

| Item | Pass/Fail | Evidence | Owner/Admin Notes |
| --- | --- | --- | --- |
| Lenovo i7-7700 server available | | | |
| RAM target 32GB installed or plan accepted | | | |
| SSD target 2TB installed or plan accepted | | | |
| Server physically secure | | | |
| Keyboard/monitor or remote admin path available | | | |

## OS

| Item | Pass/Fail | Evidence | Owner/Admin Notes |
| --- | --- | --- | --- |
| Ubuntu Server installed | | | |
| Ubuntu version recorded | | | |
| Kernel version recorded | | | |
| Timezone/date checked | | | |
| Admin user access confirmed | | | |

## Docker

| Item | Pass/Fail | Evidence | Owner/Admin Notes |
| --- | --- | --- | --- |
| Docker Engine installed | | | |
| Docker Compose plugin installed | | | |
| Docker versions recorded | | | |
| Docker service healthy | | | |
| Compose config check planned | | | |

## Repo

| Item | Pass/Fail | Evidence | Owner/Admin Notes |
| --- | --- | --- | --- |
| Repo clone/pull approved by owner | | | |
| Correct branch recorded | | | |
| Correct release tag recorded | | | |
| Worktree clean | | | |
| No generated files staged | | | |

## Env Handling

| Item | Pass/Fail | Evidence | Owner/Admin Notes |
| --- | --- | --- | --- |
| `.env.local` prepared privately | | | |
| `.env.local` not committed | | | |
| No secrets pasted into evidence | | | |
| No env file attached to chat/ticket | | | |
| Default safe provider confirmed unless owner approved otherwise | | | |

## Storage

| Item | Pass/Fail | Evidence | Owner/Admin Notes |
| --- | --- | --- | --- |
| Storage path confirmed | | | |
| Storage path is on SSD | | | |
| Free disk space acceptable | | | |
| Google Drive is backup/sharing only | | | |
| No MP4/source files staged in git | | | |

## Backup Evidence Readiness

| Item | Pass/Fail | Evidence | Owner/Admin Notes |
| --- | --- | --- | --- |
| Backup requirement understood | | | |
| Backup evidence location owner-approved | | | |
| Credentials excluded from public/shared backup | | | |
| Backup operator/date fields ready | | | |

## Restore Dry-Run Readiness

| Item | Pass/Fail | Evidence | Owner/Admin Notes |
| --- | --- | --- | --- |
| Separate test environment identified | | | |
| Active DB safety checked | | | |
| No restore over active DB | | | |
| No Docker volume delete | | | |
| No storage delete | | | |

## Network / LAN

| Item | Pass/Fail | Evidence | Owner/Admin Notes |
| --- | --- | --- | --- |
| LAN IP recorded | | | |
| Admin device can reach LAN IP | | | |
| Firewall status recorded | | | |
| LAN-only access confirmed | | | |
| Public exposure disabled unless owner approved | | | |

## UPS / Power

| Item | Pass/Fail | Evidence | Owner/Admin Notes |
| --- | --- | --- | --- |
| UPS installed or status recorded | | | |
| Server connected to UPS | | | |
| Network equipment power dependency understood | | | |
| Shutdown plan understood | | | |

## Route Smoke Plan

| Item | Pass/Fail | Evidence | Owner/Admin Notes |
| --- | --- | --- | --- |
| `/health` planned | | | |
| `/operational-readiness` planned | | | |
| `/manual-publish-report` planned | | | |
| `/manual-publish-closeouts` planned | | | |
| `/publication-packages` planned | | | |
| `/approved-videos` planned | | | |
| `/content-items` planned | | | |

## Owner Approval Gate

| Item | Pass/Fail | Evidence | Owner/Admin Notes |
| --- | --- | --- | --- |
| Owner reviewed technician evidence | | | |
| Owner reviewed backup evidence plan | | | |
| Owner reviewed restore dry-run plan | | | |
| Owner accepted unresolved risks | | | |
| Owner decision recorded | | | |

## Explicit No-Go Items

Mark No-Go if any item is true:

| No-Go Item | Yes/No | Evidence | Owner/Admin Notes |
| --- | --- | --- | --- |
| Wrong branch/tag | | | |
| Missing backup evidence | | | |
| Restore dry-run skipped | | | |
| Active DB target risk | | | |
| Public exposure without approval | | | |
| Low disk space | | | |
| Storage path not on SSD | | | |
| Destructive command proposed | | | |
