# Cutover Hold Gate

## Purpose

This document explicitly holds office server cutover until backup, restore, storage, rollback, and owner approval gates are complete.

Phase 2H.1 records readiness evidence only. It does not authorize cutover.

## Status After Phase 2H.1

| Area | Status |
| --- | --- |
| Server prerequisites | OK by owner report |
| Docs/evidence pack | Ready for owner review |
| Repo bootstrap verification | Checklist prepared |
| Env handling verification | Checklist prepared |
| Cutover | Blocked |

## Cutover Is Blocked Until

- Backup evidence is accepted by owner.
- Restore dry-run in a separate test environment passes.
- Storage copy plan is approved.
- Cutover Go/No-Go is signed.
- Rollback plan is accepted.
- Owner confirms operating window and responsible staff.

## Explicitly Pending Execution

- Actual backup.
- Actual restore dry-run.
- Actual storage copy.
- Actual cutover.
- Autostart, systemd, or cron setup.
- Cloudflare Tunnel or public exposure.
- Automated backup.
- Scheduler, publisher, or social API activation.
- OpenAI runtime automation.
- Queue expansion or worker daemon changes.

## Go / Hold Checklist

| Gate | Go Criteria | Current Status |
| --- | --- | --- |
| Owner server prerequisite report | Ubuntu, Docker, SSD path, LAN, UPS checked | Go for evidence only |
| Repo bootstrap evidence | Branch/tag/status and Compose config verified | Hold until filled on server |
| Env handling evidence | `.env.local` present, ignored, and not exposed | Hold until filled on server |
| Backup evidence | Backup exists and owner accepts evidence | Hold |
| Restore dry-run | Separate test environment restore passes | Hold |
| Storage copy plan | Owner approves source, target, and timing | Hold |
| Rollback plan | Owner accepts rollback route | Hold |
| Cutover decision | Owner signs Go | Hold |

## Non-Authorization Statement

This hold gate does not approve backup, restore, storage copy, deployment, public internet exposure, systemd/cron setup, scheduler, publisher, social API, OpenAI runtime automation, queue expansion, or worker daemon changes.
