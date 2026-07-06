# Controlled Server Pull Runtime Guard Smoke Evidence

## Purpose

This document records Phase 2I.2 owner-provided controlled server pull and runtime guard smoke evidence for the controlled pilot stack `psd_pilot` on `pesona`.

This is evidence intake only. Codex did not run commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize actual publishing, closeout, scheduler/publisher automation, OpenAI live runtime, public exposure, deployment, cutover, restore, storage copy by Codex, or production operation.

## Scope And Non-Goals

In scope:

- Record owner-provided controlled server pull evidence.
- Record that runtime was updated to `phase-2i1-complete`.
- Record runtime guard smoke evidence for the Phase 2I.1 blank evidence guard and closeout readiness guard.
- Record route checks, running containers, DB counts, package/channel/checklist/evidence/closeout state, file evidence, and explicit non-goals.

Out of scope and not authorized:

- Running commands on Lenovo or on the `pesona` server by Codex.
- Creating closeout, publish evidence, real publish URL, or checklist completion.
- Deleting, fixing, hiding, or mutating the blank YouTube evidence log anomaly.
- Actual publishing.
- Scheduler/publisher automation.
- Social API activation.
- Upload automation.
- OpenAI live runtime.
- Public exposure or Cloudflare Tunnel.
- Deployment.
- Cutover.
- Production backup.
- Restore or restore dry-run.
- Storage copy by Codex.
- Stopping, restarting, or mutating containers by Codex.
- Docker Compose up/down by Codex.
- App/runtime code, migration file, or `scripts/prepare-test-db.mjs` changes.
- Committing backup files, dump files, tar archives, checksum files, route evidence files, env files, secrets, `node_modules`, generated media, rendered MP4s, or storage artifacts.

## Controlled Runtime Guard Smoke Scope

Owner-provided evidence records:

- This was controlled server pull plus runtime guard smoke evidence.
- Server runtime was updated to `phase-2i1-complete`.
- This phase verified the Phase 2I.1 guard behavior on the running pilot.
- This is not actual publishing.
- This is not closeout.
- This is not scheduler/publisher automation.
- This is not OpenAI live runtime.
- This is not public exposure.
- This is not cutover.

## Runtime Baseline

| Item | Evidence |
| --- | --- |
| Server | `pesona` |
| Repo path | `/srv/pesona-studio/repos/pesona-studio-desk` |
| Pilot project | `psd_pilot` |
| Web port | `3400` |
| Runtime Git head | `4fa59910229c81038d7ec36a5efc4c0bba8df363` |
| Runtime tag | `phase-2i1-complete` |
| Git status short count | `0` |
| Backup timestamp UTC | `2026-07-06T03:45:54Z` |
| Backup directory | `/srv/pesona-studio/backups/psd-pilot-phase-2i2-runtime-guard-smoke-backup-20260706T034554Z` |

## Runtime Guard Smoke Assessment

Owner-provided runtime guard smoke assessment:

| Field | Evidence |
| --- | --- |
| Phase | `2I.2 Controlled Server Pull + Runtime Guard Smoke Evidence` |
| Result | `PASS` |
| Runtime tag | `phase-2i1-complete` |
| Blank evidence guard | `PASS` |
| Closeout readiness guard | `PASS` |
| Closeout creation | Not performed |
| Manual publish | Not performed |
| Social API / scheduler / publisher | Not enabled |
| Cutover | Blocked |

Blank evidence guard details:

- UI rejected blank evidence submit with required recorder/name validation.
- Evidence log count after blank submit remained unchanged at `2`.
- No new blank evidence row was created.

Closeout readiness guard details:

- UI showed `NOT_READY_FOR_CLOSEOUT`.
- Closeout creation was not performed.
- `manual_publish_closeouts` remained `0`.

Runtime blank evidence guard is PASS. Runtime closeout readiness guard is PASS.

## Runtime Routes

Owner-provided route evidence: all returned HTTP 200.

| Route | Status |
| --- | --- |
| `/health` | `200` |
| `/publication-packages` | `200` |
| `/publication-packages/ca5a591f-fdf1-4b8c-bb61-9295c186a7be/checklist` | `200` |
| `/publication-packages/ca5a591f-fdf1-4b8c-bb61-9295c186a7be/closeout` | `200` |
| `/manual-publish-report` | `200` |
| `/manual-publish-closeouts` | `200` |

## Runtime Containers

Owner-provided container evidence records pilot containers remained running:

| Container | Evidence |
| --- | --- |
| `psd_pilot-web-app-1` | Running on `0.0.0.0:3400->3000` |
| `psd_pilot-n8n-1` | Running |
| `psd_pilot-campaign-planner-worker-1` | Running |
| `psd_pilot-mockup-worker-1` | Running |
| `psd_pilot-video-worker-1` | Running |
| `psd_pilot-postgres-1` | Running, healthy |
| `psd_pilot-redis-1` | Running, healthy |

Pilot remained running.

## Runtime DB Counts

Owner-provided count evidence:

| Table | Count |
| --- | ---: |
| `manual_publication_packages` | `1` |
| `manual_publication_package_channels` | `4` |
| `manual_publish_checklist_items` | `32` |
| `manual_publish_evidence_logs` | `2` |
| `manual_publish_closeouts` | `0` |

Evidence log count stayed unchanged after blank submit is PASS. Closeout remained `0` is PASS.

## Package Runtime Status

Owner-provided package runtime status:

| Field | Evidence |
| --- | --- |
| Package ID | `ca5a591f-fdf1-4b8c-bb61-9295c186a7be` |
| Package status | `ready_manual_publish` |
| Package title | `PILOT-DESAIN-GRATIS-01-D01 - Manual Package Smoke` |
| `ready_at` | `2026-07-04 05:29:44.13736+00` |
| `published_manually_at` | Empty |
| Updated at | `2026-07-04 05:29:44.13736+00` |

No publish timestamp is PASS.

## Channel Publish State

Owner-provided channel state evidence shows all four package channels remain unpublished:

| Channel | Channel ID | Status | `planned_publish_at` | `manual_published_at` | `manual_publish_url` |
| --- | --- | --- | --- | --- | --- |
| `facebook` | `87cb5651-cb8c-4766-bb94-fdef94b54744` | `draft_channel` | Empty | Empty | Empty |
| `instagram` | `893861e1-04f7-4f83-85ac-28d01f6252ce` | `draft_channel` | Empty | Empty | Empty |
| `tiktok` | `ad921bf2-2d9f-4474-b130-4234bee995d5` | `draft_channel` | Empty | Empty | Empty |
| `youtube` | `91383874-2ad3-45dd-a26f-5a4559d17425` | `draft_channel` | Empty | Empty | Empty |

All channels remain draft is PASS. No publish URL is PASS.

## Checklist Summary

Owner-provided checklist summary:

| Channel | Total | Done | Pending |
| --- | ---: | ---: | ---: |
| `facebook` | `8` | `0` | `8` |
| `instagram` | `8` | `0` | `8` |
| `tiktok` | `8` | `0` | `8` |
| `youtube` | `8` | `0` | `8` |

Checklist remains pending is PASS.

## Evidence Log Summary

Owner-provided evidence log summary:

| Channel | Evidence type | Total logs | Blank logs |
| --- | --- | ---: | ---: |
| `facebook` | `admin_note` | `1` | `0` |
| `youtube` | `admin_note` | `1` | `1` |

Existing blank YouTube `admin_note` anomaly remains visible and unchanged.

## Evidence Log Records

Owner-provided intended Facebook admin note:

| Field | Evidence |
| --- | --- |
| ID | `cd2bba56-ea9e-4035-a24d-4a70c4a8479f` |
| Evidence value | `PILOT_SMOKE_NO_PUBLISH` |
| Recorded by | `Rino` |
| Recorded at | `2026-07-04 06:06:45.943161+00` |

Owner-provided blank YouTube admin note anomaly:

| Field | Evidence |
| --- | --- |
| ID | `0b4b5ff2-c994-46d9-8f1c-e5c6743a336c` |
| Evidence type | `admin_note` |
| Evidence value | Empty |
| Evidence note | Empty |
| Recorded by | Empty |
| Recorded at | `2026-07-04 06:04:04.545927+00` |

Assessment: existing harmless DB-only anomaly, unchanged by this phase.

Existing YouTube blank anomaly remained documented and unchanged is PASS.

## Closeout State

Owner-provided closeout state:

| Item | Evidence |
| --- | --- |
| `manual_publish_closeouts` | `0` |
| Closeouts query | `(0 rows)` |

No closeout was created.

Closeout remained `0` is PASS.

## File And Storage Evidence

Owner-provided approved video file evidence:

| File | Size |
| --- | ---: |
| `storage/approved-videos/smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4` | `1950179` bytes |

Owner-provided storage archive evidence included:

- Source demo footage.
- Draft render.
- Approved video.

No storage artifact or rendered MP4 is committed to Git.

## Outcome

- Server runtime updated to `phase-2i1-complete`: PASS.
- Runtime blank evidence guard: PASS.
- Runtime closeout readiness guard: PASS.
- Evidence log count stayed unchanged after blank submit: PASS.
- No new blank evidence row: PASS.
- Closeout remained `0`: PASS.
- No publish timestamp or URL: PASS.
- All channels remain draft: PASS.
- Checklist remains pending: PASS.
- Existing YouTube blank anomaly remained documented and unchanged: PASS.
- Backup: PASS.
- Checksum validation: PASS.
- DB dump readability: PASS.
- Storage archive readability: PASS.
- Pilot remained running.

## Warnings And Non-Goals

- This is runtime guard smoke evidence only.
- No actual posting occurred.
- No closeout was created.
- No scheduler/publisher/social API/upload automation was enabled.
- No OpenAI live runtime was enabled.
- No public exposure.
- No cutover.
- Existing blank YouTube `admin_note` anomaly remains as historical runtime data.

## What Was Not Executed By Codex

- No command on Lenovo.
- No command on the `pesona` server.
- No production backup.
- No restore.
- No restore dry-run.
- No deployment.
- No cutover.
- No public exposure.
- No Cloudflare Tunnel.
- No storage copy by Codex.
- No deletion, fix, hiding, or mutation of the blank YouTube evidence log anomaly.
- No closeout creation.
- No publish evidence creation.
- No real publish URL creation.
- No checklist completion.
- No actual publishing.
- No social API.
- No scheduler.
- No OpenAI live runtime.
- No queue expansion or worker daemon expansion.
- No container stop, restart, or mutation.
- No Docker Compose up/down.
- No app/runtime code change.
- No migration file change.
- No `scripts/prepare-test-db.mjs` change.
- No backup file, dump file, tar archive, checksum file, route evidence file, env file, secret, `node_modules`, generated media, rendered MP4, or storage artifact committed.

## Next Safe Phase

Next safe phase: real manual publish proof evidence after actual manual posting, manual publish closeout evidence after readiness gaps are closed, pilot backup restore dry-run planning in a separate isolated environment, or controlled pilot operating review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
