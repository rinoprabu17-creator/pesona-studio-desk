# Controlled Manual Evidence Log Sandbox Evidence

## Purpose

This document records Phase 2H.21 owner-provided controlled manual evidence log sandbox evidence for the controlled pilot stack `psd_pilot` on `pesona`.

This is evidence intake only. Codex did not run new commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize actual social publishing, real publish proof, closeout, scheduler/publisher automation, OpenAI live runtime, public exposure, deployment, cutover, restore, storage copy by Codex, or production operation.

## Scope And Non-Goals

In scope:

- Record owner-provided controlled manual evidence log sandbox evidence.
- Record DB-only evidence log rows, package status, checklist status, closeout status, file evidence, route checks, runtime status, and explicit non-goals.
- Record the accidental blank YouTube `admin_note` evidence log as a harmless DB-only anomaly.
- Record that no closeout was created and no checklist item was marked done.

Out of scope and not authorized:

- Running commands on Lenovo or on the `pesona` server by Codex.
- Deleting, fixing, or mutating the blank YouTube evidence log anomaly.
- Actual social publishing.
- Real publish proof.
- Manual closeout creation.
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

## Controlled Evidence Log Scope

Owner-provided evidence records:

- This was controlled manual evidence log sandbox evidence.
- Evidence logs were DB-only.
- This was not actual social publishing.
- This was not a real publish proof.
- This was not closeout.
- This was not scheduler/publisher automation.
- This was not OpenAI live runtime.
- This was not public exposure.
- This was not cutover.
- One accidental blank YouTube `admin_note` evidence log exists and is recorded as a harmless DB-only anomaly, not hidden.

## Pilot Baseline

| Item | Evidence |
| --- | --- |
| Server | `pesona` |
| Repo path | `/srv/pesona-studio/repos/pesona-studio-desk` |
| Pilot project | `psd_pilot` |
| Web port | `3400` |
| Baseline tag on server | `phase-2h12-complete` |
| Git head on server | `ea4cc57120ebc9efa0a2d4f6d02079b73e23404f` |
| Git status short count | `0` |
| Backup timestamp UTC | `2026-07-04T06:08:35Z` |

## Evidence Log Sandbox Counts

Owner-provided count evidence:

| Table | Count |
| --- | ---: |
| `manual_publication_packages` | `1` |
| `manual_publication_package_channels` | `4` |
| `manual_publish_checklist_items` | `32` |
| `manual_publish_evidence_logs` | `2` |
| `manual_publish_closeouts` | `0` |

Evidence log sandbox is PASS. No closeout is PASS.

## Package Status

Owner-provided package status evidence:

| Field | Evidence |
| --- | --- |
| Package ID | `ca5a591f-fdf1-4b8c-bb61-9295c186a7be` |
| Package status | `ready_manual_publish` |
| Package title | `PILOT-DESAIN-GRATIS-01-D01 - Manual Package Smoke` |
| `ready_at` | `2026-07-04 05:29:44.13736+00` |
| `published_manually_at` | Empty |
| Updated at | `2026-07-04 05:29:44.13736+00` |

Package remains `ready_manual_publish` is PASS.

## Intended Evidence Log

Owner-provided intended evidence log:

| Field | Evidence |
| --- | --- |
| Evidence log ID | `cd2bba56-ea9e-4035-a24d-4a70c4a8479f` |
| Package ID | `ca5a591f-fdf1-4b8c-bb61-9295c186a7be` |
| Package channel ID | `87cb5651-cb8c-4766-bb94-fdef94b54744` |
| Content item ID | `38a94f4f-4411-485e-9825-faeeeccd08d6` |
| Channel | `facebook` |
| Evidence type | `admin_note` |
| Evidence value | `PILOT_SMOKE_NO_PUBLISH` |
| Recorded by | `Rino` |
| Recorded at | `2026-07-04 06:06:45.943161+00` |
| Created at | `2026-07-04 06:06:45.943161+00` |
| Updated at | `2026-07-04 06:06:45.943161+00` |

Evidence note:

```text
CONTROLLED EVIDENCE LOG SANDBOX - PILOT SMOKE ONLY. Ini hanya catatan admin untuk membuktikan board evidence bisa mencatat log DB-only. Tidak ada upload, tidak ada publish, tidak ada schedule, tidak ada social API, tidak ada URL posting asli, dan belum closeout.
```

Intended Facebook `admin_note` recorded is PASS.

This is DB-only sandbox evidence, not real publish proof.

## Blank Evidence Log Anomaly

Owner-provided anomaly evidence:

| Field | Evidence |
| --- | --- |
| Evidence log ID | `0b4b5ff2-c994-46d9-8f1c-e5c6743a336c` |
| Package ID | `ca5a591f-fdf1-4b8c-bb61-9295c186a7be` |
| Package channel ID | `91383874-2ad3-45dd-a26f-5a4559d17425` |
| Content item ID | `38a94f4f-4411-485e-9825-faeeeccd08d6` |
| Channel | `youtube` |
| Evidence type | `admin_note` |
| Evidence value | Empty |
| Evidence note | Empty |
| Recorded by | Empty |
| Recorded at | `2026-07-04 06:04:04.545927+00` |
| Created at | `2026-07-04 06:04:04.545927+00` |
| Updated at | `2026-07-04 06:04:04.545927+00` |

Assessment:

- Harmless DB-only anomaly.
- No publish URL.
- No publish timestamp.
- No package status change.
- No closeout.
- Should not be deleted in this docs-only phase.

Blank YouTube `admin_note` anomaly captured is PASS.

## Evidence Log Summary

Owner-provided summary evidence:

| Channel | Evidence type | Total logs | Blank logs |
| --- | --- | ---: | ---: |
| `facebook` | `admin_note` | `1` | `0` |
| `youtube` | `admin_note` | `1` | `1` |

No publish URL recorded is PASS. No publish timestamp is PASS.

## Closeout And Checklist Status

Owner-provided closeout and checklist status:

| Item | Evidence |
| --- | --- |
| Closeouts query | `(0 rows)` |
| `manual_publish_closeouts` | `0` |

Checklist summary remains:

| Channel | Total | Done | Pending |
| --- | ---: | ---: | ---: |
| `facebook` | `8` | `0` | `8` |
| `instagram` | `8` | `0` | `8` |
| `tiktok` | `8` | `0` | `8` |
| `youtube` | `8` | `0` | `8` |

No checklist item was marked done in this phase.

No closeout is PASS. No checklist item marked done is PASS.

## File Evidence

Owner-provided approved video file evidence:

| File | Size |
| --- | ---: |
| `storage/approved-videos/.gitkeep` | `70` bytes |
| `storage/approved-videos/smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4` | `1950179` bytes |

Owner-provided storage archive evidence also included:

- Source demo footage:
  `storage/footage/pilot-demo/pilot-sampul-raport-demo-001.mp4`.
- Draft render:
  `storage/draft-videos/smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4`.
- Approved video:
  `storage/approved-videos/smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4`.

These media files are server storage artifacts and are not committed to Git.

## Route And Runtime Evidence

Owner-provided route evidence: all returned HTTP 200.

- `/health`.
- `/publication-packages`.
- `/manual-publish-report`.
- `/manual-publish-closeouts`.

Owner-provided runtime evidence:

| Container | Status |
| --- | --- |
| `psd_pilot-n8n-1` | Up |
| `psd_pilot-web-app-1` | Up, `0.0.0.0:3400->3000` |
| `psd_pilot-campaign-planner-worker-1` | Up |
| `psd_pilot-mockup-worker-1` | Up |
| `psd_pilot-video-worker-1` | Up |
| `psd_pilot-postgres-1` | Up healthy |
| `psd_pilot-redis-1` | Up healthy |

Pilot remained running.

## Outcome

Evidence log sandbox is PASS.

Intended Facebook `admin_note` recorded is PASS. Blank YouTube `admin_note` anomaly captured is PASS. No publish URL recorded is PASS. No publish timestamp is PASS. Package remains `ready_manual_publish` is PASS. No closeout is PASS. No checklist item marked done is PASS.

No upload, publish, schedule action, social API, publisher, scheduler, upload automation, OpenAI live runtime, public exposure, or cutover occurred.

Cutover remains blocked.

## Warnings And Non-Goals

- This is pilot smoke evidence only.
- No actual posting occurred.
- The YouTube blank `admin_note` is an anomaly and should be documented, not hidden.
- No manual closeout was created.
- No scheduler/publisher/social API/upload automation was enabled.
- No OpenAI live runtime was enabled.
- No public exposure.
- No cutover.

## What Was Not Executed By Codex

- No command on Lenovo.
- No new command on the `pesona` server.
- No production backup.
- No restore.
- No restore dry-run.
- No deployment.
- No cutover.
- No public exposure.
- No Cloudflare Tunnel.
- No storage copy by Codex.
- No deletion, fix, or mutation of the blank YouTube evidence log anomaly.
- No container stop, restart, or mutation.
- No Docker Compose up/down.
- No closeout creation.
- No actual publishing.
- No social API.
- No scheduler.
- No OpenAI live runtime.
- No app/runtime code change.
- No migration file change.
- No `scripts/prepare-test-db.mjs` change.
- No backup file, dump file, tar archive, checksum file, route evidence file, env file, secret, `node_modules`, generated media, rendered MP4, or storage artifact committed.

## Next Safe Phase

Next safe phase: manual publish closeout evidence, final restore dry-run planning in a separate isolated environment, or controlled pilot operating review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
