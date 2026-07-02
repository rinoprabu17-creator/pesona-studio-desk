# Pilot Readiness Gate

## Purpose

This document defines the Phase 2H.12 pilot readiness gate for Pesona Studio Desk on the new native Ubuntu server candidate `pesona`.

This is an owner/operator decision gate only. It records the evidence required before a controlled pilot can be considered, and it does not authorize deployment, cutover, public exposure, production restore, or irreversible automation.

## Current Baseline

| Item | Status |
| --- | --- |
| Baseline tag | `phase-2h11-complete` |
| Server candidate | `pesona` |
| Server posture | Local-first, LAN/Tailscale only unless separately approved |
| Runtime smoke | PASS after migrations in Phase 2H.8 |
| Controlled stop | PASS in Phase 2H.9 |
| Smoke backup | PASS in Phase 2H.10 |
| Smoke restore dry-run | PASS in Phase 2H.11 |
| Cutover | BLOCKED |

## PASS Evidence Summary

- New server bootstrap PASS: native Ubuntu candidate `pesona` has accepted OS, CPU, Docker, repo, env handling, and Compose config evidence.
- Storage `/srv/pesona-studio` PASS: SATA SSD work storage mounted from `/dev/sdb1` with ext4 label `PSD_WORK` and sufficient initial free space.
- Isolated runtime smoke PASS: project `psd_server_smoke` built, started, migrated the isolated smoke database, and served key routes.
- Controlled stop PASS: smoke containers were stopped without volume deletion or storage deletion.
- Smoke backup PASS: isolated smoke backup checksums, storage archive readability, and PostgreSQL dump listing passed.
- Smoke restore dry-run PASS: isolated restore project restored the smoke dump, validated `30` tables, extracted storage archive, and stopped safely.

## Accepted Limitation

- RAM is accepted with limit for initial pilot: `16GB` is approved for initial use.
- Owner plans to upgrade to `32GB` later if the content system proves that it generates leads and converts to orders.
- This limitation is not a pilot blocker, but it should be monitored during any controlled pilot.

## HOLD Items

The following remain HOLD and require separate approval or evidence:

- GPU driver.
- Production backup policy.
- Autostart, `systemd`, or cron.
- Public exposure.
- Scheduler, publisher, or social API activation.
- OpenAI live runtime.
- Final cutover.

## Pilot Entry Criteria

A controlled pilot may only be considered when all criteria below are satisfied:

- Owner confirms the pilot scope.
- Access remains internal/LAN or Tailscale-only.
- No public tunnel is enabled.
- No real irreversible automation is enabled.
- Manual publish remains the default operating mode.
- Backup plan is accepted before pilot data is treated as important.
- Responsible operator is identified.

## Pilot Non-Goals

The pilot gate does not authorize:

- Cutover.
- Public exposure.
- Social API or publisher activation.
- OpenAI live runtime.
- Production restore.

## Go/Hold Checklist

| Gate | Required Decision |
| --- | --- |
| Owner confirms pilot scope | GO / HOLD |
| Responsible operator identified | GO / HOLD |
| Access remains LAN/Tailscale only | GO / HOLD |
| No public tunnel | GO / HOLD |
| Manual publish remains default | GO / HOLD |
| No irreversible automation | GO / HOLD |
| Backup plan accepted | GO / HOLD |
| Restore dry-run evidence reviewed | GO / HOLD |
| Existing container port conflicts reviewed | GO / HOLD |
| Cutover approval absent means cutover HOLD | GO / HOLD |

## Owner Sign-off Placeholder

| Field | Value |
| --- | --- |
| Owner name |  |
| Date |  |
| Pilot decision | GO / HOLD |
| Pilot scope |  |
| Responsible operator |  |
| Notes |  |

## Safety Confirmations

- This gate is documentation only.
- No server command is executed by this document.
- No deployment, cutover, backup, restore, restore dry-run, storage copy, public exposure, Docker Compose up/down, or container mutation is authorized by this document.
- No app/runtime code, migration file, or `scripts/prepare-test-db.mjs` change is authorized by this document.
- No env value, secret, backup artifact, restore evidence file, dump, archive, checksum file, generated media, operational media, or storage artifact should be committed to Git.

## Next Safe Phase

Recommended next safe phase: controlled pilot start procedure planning, or production backup policy review.

That next phase is not cutover. Cutover remains blocked until explicit owner Go/No-Go and cutover approval exist.
