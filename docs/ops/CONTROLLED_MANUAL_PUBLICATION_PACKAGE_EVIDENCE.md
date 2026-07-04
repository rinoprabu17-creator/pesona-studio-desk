# Controlled Manual Publication Package Evidence

## Purpose

This document records Phase 2H.19 owner-provided controlled manual publication package evidence for the controlled pilot stack `psd_pilot` on `pesona`.

This is evidence intake only. Codex did not run new commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize actual social publishing, scheduler/publisher automation, OpenAI live runtime, public exposure, deployment, cutover, restore, storage copy by Codex, or production operation.

## Scope And Non-Goals

In scope:

- Record owner-provided controlled manual publication package evidence.
- Record DB-only package creation from the approved-video handoff.
- Record package counts, package record, channel rows, file evidence, route checks, runtime status, and explicit non-goals.
- Record that no manual publish evidence log and no closeout were created.

Out of scope and not authorized:

- Running commands on Lenovo or on the `pesona` server by Codex.
- Actual social publishing.
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

## Controlled Package Scope

Owner-provided evidence records:

- This was controlled manual publication package evidence.
- Package creation was DB-only.
- Package was created from approved-video handoff.
- This was not actual social publishing.
- This was not scheduler/publisher automation.
- This was not OpenAI live runtime.
- This was not public exposure.
- This was not cutover.
- No manual publish evidence log was created.
- No closeout was created.

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
| Backup timestamp UTC | `2026-07-04T04:51:48Z` |

## Manual Publication Package Counts

Owner-provided count evidence:

| Table | Count |
| --- | ---: |
| `video_render_approved_promotions` | `1` |
| `video_approved_handoff_records` | `1` |
| `manual_publication_packages` | `1` |
| `manual_publication_package_channels` | `4` |
| `manual_publish_checklist_items` | `0` |
| `manual_publish_evidence_logs` | `0` |
| `manual_publish_closeouts` | `0` |

Manual publication package created is PASS. Four channel package rows created is PASS.

No manual publish evidence log is PASS. No closeout is PASS.

## Manual Publication Package Record

Owner-provided package record evidence:

| Field | Evidence |
| --- | --- |
| Package ID | `ca5a591f-fdf1-4b8c-bb61-9295c186a7be` |
| Handoff ID | `19614d06-6e0b-43bd-87c3-deb6829720ef` |
| Promotion ID | `1b9deb36-1468-436d-a2c5-2031dbe6dc51` |
| Render attempt ID | `5de99c97-6cf0-4f76-9638-6b39b4a0ee7c` |
| Render attempt review ID | `b94a495d-e857-4fe8-955b-93a2e58ffc46` |
| Render manifest ID | `3f6e89a4-477e-43a2-84db-f5bc0da2d953` |
| Video draft job ID | `5c6ac9b9-ad97-4a2f-a5bb-a0af39d7811b` |
| Content item ID | `38a94f4f-4411-485e-9825-faeeeccd08d6` |
| Package status | `draft_package` |
| Approved output relative path snapshot | `smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4` |
| Approved size bytes snapshot | `1950179` |
| Approved SHA256 snapshot | `97b066a05d2de5689d7158592912f0f8d3d8a37565891b04bcb5b96940b29b0b` |
| Package title | `PILOT-DESAIN-GRATIS-01-D01 - Manual Package Smoke` |
| Caption text | `Pilot smoke manual package only. Approved video sudah siap untuk proses manual publish, belum upload, belum publish, belum schedule.` |
| Hashtags | `#PilotSmoke #PesonaStudioDesk #DesainGratis #SampulRaport` |
| CTA | `Untuk simulasi pilot saja. Tidak digunakan untuk posting produksi.` |
| Created by | `Rino` |
| `ready_at` | Empty |
| `published_manually_at` | Empty |
| Created at | `2026-07-04 04:47:47.274786+00` |
| Updated at | `2026-07-04 04:47:47.274786+00` |

Manual publish note:

```text
MANUAL PUBLICATION PACKAGE - PILOT SMOKE ONLY. Package dibuat hanya sebagai evidence pilot dari approved handoff. Belum upload, belum publish, belum schedule, belum social API, dan belum cutover.
```

Package status remains `draft_package` is PASS.

This package is pilot smoke evidence only.

## Manual Package Channels

Owner-provided channel row evidence:

| ID | Channel | Status | Format | `planned_publish_at` | `manual_published_at` | `manual_publish_url` |
| --- | --- | --- | --- | --- | --- | --- |
| `893861e1-04f7-4f83-85ac-28d01f6252ce` | `instagram` | `draft_channel` | `standard_video` | Empty | Empty | Empty |
| `87cb5651-cb8c-4766-bb94-fdef94b54744` | `facebook` | `draft_channel` | `standard_video` | Empty | Empty | Empty |
| `ad921bf2-2d9f-4474-b130-4234bee995d5` | `tiktok` | `draft_channel` | `standard_video` | Empty | Empty | Empty |
| `91383874-2ad3-45dd-a26f-5a4559d17425` | `youtube` | `draft_channel` | `standard_video` | Empty | Empty | Empty |

Channel rows remain `draft_channel` is PASS.

## File Evidence

Owner-provided approved video file evidence:

| File | Size |
| --- | ---: |
| `storage/approved-videos/.gitkeep` | `70` bytes |
| `storage/approved-videos/smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4` | `1950179` bytes |

Owner-provided draft video file evidence:

| File | Size |
| --- | ---: |
| `storage/draft-videos/.gitkeep` | `67` bytes |
| `storage/draft-videos/smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4` | `1950179` bytes |

These media files are server storage artifacts and are not committed to Git.

## Route And Runtime Evidence

Owner-provided route evidence: all returned HTTP 200.

- `/health`.
- `/approved-videos`.
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

Manual publication package created is PASS.

Four channel package rows created is PASS. Package status remains `draft_package` is PASS. Channel rows remain `draft_channel` is PASS. No manual publish evidence log is PASS. No closeout is PASS.

No upload, publish, schedule action, social API, publisher, scheduler, upload automation, OpenAI live runtime, public exposure, or cutover occurred.

Cutover remains blocked.

## Warnings And Non-Goals

- This package is pilot smoke evidence only.
- No actual posting occurred.
- No manual publish evidence log was created.
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
- No container stop, restart, or mutation.
- No Docker Compose up/down.
- No manual publish evidence log creation.
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

Next safe phase: manual publish evidence log evidence, manual publish closeout evidence, final restore dry-run planning in a separate isolated environment, or controlled pilot operating review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
