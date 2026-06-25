# Office Server Readiness Evidence

## Purpose

This document records readiness evidence for the local office Lenovo server before any real Pesona Studio Desk deployment or cutover.

This is a docs-only/read-only evidence record. It does not run deployment, backup, restore, storage copy, database migration, public exposure, publisher, scheduler, social API, OpenAI runtime automation, queue expansion, or worker daemon changes.

## Owner-Reported Readiness

| Area | Status | Notes |
| --- | --- | --- |
| Ubuntu Server installed/checked | OK | Reported by owner before Phase 2H.1. |
| Docker Engine + Compose plugin installed/checked | OK | Reported by owner before Phase 2H.1. |
| Storage path to SSD 2TB checked | OK | Reported by owner before Phase 2H.1. |
| LAN access checked | OK | Reported by owner before Phase 2H.1. |
| UPS/power checked | OK | Reported by owner before Phase 2H.1. |

## Evidence Fields

Fill these on the office server or from technician evidence. Do not paste secrets, `.env.local` contents, credentials, API keys, tokens, or private provider values.

| Evidence Item | Value | Source / Notes |
| --- | --- | --- |
| Server model | Owner/technician to fill | Expected Lenovo i7-7700 office server. |
| RAM | Owner/technician to fill | Target 32GB. |
| OS version | Owner/technician to fill | Read-only check only. |
| Kernel version | Owner/technician to fill | Read-only check only. |
| Docker version | Owner/technician to fill | Docker Engine installed/checked: OK. |
| Docker Compose version | Owner/technician to fill | Compose plugin installed/checked: OK. |
| Disk layout | Owner/technician to fill | Confirm SSD working storage. |
| SSD mount path | Owner/technician to fill | Must point to 2TB SSD working storage. |
| Free disk space | Owner/technician to fill | Must be enough for footage and approved video outputs. |
| LAN IP | Owner/technician to fill | LAN-only by default. |
| LAN-only status | Owner/technician to fill | No public internet exposure by default. |
| UPS/power status | OK | Owner reported UPS/power checked. |
| Repo path | Owner/technician to fill | Future setup path only; no cutover in this phase. |
| Branch/tag/status | Owner/technician to fill | Future target tag: `phase-2g6-complete` or later owner-approved tag. |
| Env handling | Owner/technician to fill | Confirm file presence/ignore status only, never values. |
| Unresolved risks | Owner/technician to fill | Record blockers before any next step. |

## Boundary Confirmation

- Local SSD remains the working storage principle.
- Google Drive remains backup/sharing only, not primary working storage.
- Manual publish remains the current operating model.
- No auto-publisher, scheduler, social API, OpenAI runtime automation, upload automation, queue expansion, or worker daemon change is approved by this document.
- No backup, restore, storage copy, or cutover is approved by this document.
- No `.env.local` contents or credentials should be copied into evidence.

## Evidence Handling Rule

Evidence should be safe to paste into owner review because it contains no secrets. Screenshots or terminal output must redact user names, private LAN details if sensitive, secrets, tokens, passwords, provider keys, and database URLs.
