# Controlled Approved Draft Promotion Handoff Evidence

## Purpose

This document records Phase 2H.18 owner-provided controlled approved draft promotion and approved-video handoff evidence for the controlled pilot stack `psd_pilot` on `pesona`.

This is evidence intake only. Codex did not run new commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize manual publication package creation, social publishing, scheduler/publisher automation, OpenAI live runtime, public exposure, deployment, cutover, restore, storage copy by Codex, or production operation.

## Scope And Non-Goals

In scope:

- Record owner-provided controlled approved draft promotion evidence.
- Record owner-provided DB-only approved-video handoff evidence.
- Record final promotion/handoff counts, file evidence, route checks, runtime status, and explicit non-goals.
- Record that manual publication package count remained `0`.

Out of scope and not authorized:

- Running commands on Lenovo or on the `pesona` server by Codex.
- Manual publication package creation.
- Social publishing or social API activation.
- Scheduler/publisher automation.
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

## Controlled Promotion And Handoff Scope

Owner-provided evidence records:

- This was controlled approved draft promotion + handoff evidence.
- Promotion was manual copy into approved-videos.
- Handoff was DB-only, marked ready for manual publish.
- This was not manual publication package creation.
- This was not social publishing.
- This was not scheduler/publisher automation.
- This was not OpenAI live runtime.
- This was not public exposure.
- This was not cutover.

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
| Final backup timestamp UTC | `2026-07-03T09:31:57Z` |

## Final Promotion And Handoff Counts

Owner-provided final count evidence:

| Table | Count |
| --- | ---: |
| `video_render_attempts` | `1` |
| `video_render_attempt_reviews` | `1` |
| `video_render_approved_promotions` | `1` |
| `video_approved_handoff_records` | `1` |
| `manual_publication_packages` | `0` |

Manual publication package remained `0`.

## Promotion Record

Owner-provided promotion record evidence:

| Field | Evidence |
| --- | --- |
| Promotion ID | `1b9deb36-1468-436d-a2c5-2031dbe6dc51` |
| Render attempt review ID | `b94a495d-e857-4fe8-955b-93a2e58ffc46` |
| Render attempt ID | `5de99c97-6cf0-4f76-9638-6b39b4a0ee7c` |
| Render manifest ID | `3f6e89a4-477e-43a2-84db-f5bc0da2d953` |
| Video draft job ID | `5c6ac9b9-ad97-4a2f-a5bb-a0af39d7811b` |
| Content item ID | `38a94f4f-4411-485e-9825-faeeeccd08d6` |
| Promotion status | `succeeded` |
| Promotion mode | `manual_copy` |
| Source output relative path | `smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4` |
| Approved output relative path | `smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4` |
| Source size bytes | `1950179` |
| Approved size bytes | `1950179` |
| Source SHA256 | `97b066a05d2de5689d7158592912f0f8d3d8a37565891b04bcb5b96940b29b0b` |
| Approved SHA256 | `97b066a05d2de5689d7158592912f0f8d3d8a37565891b04bcb5b96940b29b0b` |
| Error message | Empty |
| Started at | `2026-07-03 09:17:49.907529+00` |
| Completed at | `2026-07-03 09:17:49.92971+00` |

Approved draft promotion is PASS. Approved video copy is PASS. SHA256 source/approved match is PASS.

The approved video file is a generated storage artifact and is not committed to Git.

## Handoff Record

Owner-provided handoff record evidence:

| Field | Evidence |
| --- | --- |
| Handoff ID | `19614d06-6e0b-43bd-87c3-deb6829720ef` |
| Promotion ID | `1b9deb36-1468-436d-a2c5-2031dbe6dc51` |
| Render attempt ID | `5de99c97-6cf0-4f76-9638-6b39b4a0ee7c` |
| Render attempt review ID | `b94a495d-e857-4fe8-955b-93a2e58ffc46` |
| Render manifest ID | `3f6e89a4-477e-43a2-84db-f5bc0da2d953` |
| Video draft job ID | `5c6ac9b9-ad97-4a2f-a5bb-a0af39d7811b` |
| Content item ID | `38a94f4f-4411-485e-9825-faeeeccd08d6` |
| Handoff status | `ready_for_manual_publish` |
| Approved output snapshot | `smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4` |
| Approved size snapshot | `1950179` |
| Approved SHA256 snapshot | `97b066a05d2de5689d7158592912f0f8d3d8a37565891b04bcb5b96940b29b0b` |
| Handoff by | `Rino` |
| Handoff at | `2026-07-03 09:29:31.950085+00` |

Handoff note:

```text
READY FOR MANUAL PUBLISH HANDOFF - PILOT SMOKE ONLY. Approved video sudah berhasil dipromote ke approved-videos sebagai evidence pilot. Belum dibuat publication package, belum upload, belum publish, belum schedule, dan belum cutover.
```

DB-only handoff record is PASS. Handoff marked `ready_for_manual_publish` is PASS.

This handoff is pilot smoke evidence only.

## File Evidence

Owner-provided draft video file evidence:

| File | Size |
| --- | ---: |
| `storage/draft-videos/.gitkeep` | `67` bytes |
| `storage/draft-videos/smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4` | `1950179` bytes |

Owner-provided approved video file evidence:

| File | Size |
| --- | ---: |
| `storage/approved-videos/.gitkeep` | `70` bytes |
| `storage/approved-videos/smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4` | `1950179` bytes |

These media files are server storage artifacts and are not committed to Git.

## Route And Runtime Evidence

Owner-provided route evidence: all returned HTTP 200.

- `/health`.
- `/content-items`.
- `/approved-videos`.
- `/manual-publish-report`.

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

Approved draft promotion is PASS.

Approved video copy is PASS. SHA256 source/approved match is PASS. DB-only handoff record is PASS. Handoff marked `ready_for_manual_publish` is PASS. Manual publication package remained `0` is PASS.

No upload, publish, schedule action, social API, publisher, scheduler, upload automation, OpenAI live runtime, public exposure, or cutover occurred.

Cutover remains blocked.

## Warnings And Non-Goals

- This handoff is pilot smoke evidence only.
- No manual publication package was created.
- No upload, publish, or schedule action was performed.
- No social API, publisher, scheduler, or upload automation was enabled.
- No OpenAI live runtime was enabled.
- No public exposure.
- No cutover.

## What Was Not Executed By Codex

- No command on Lenovo.
- No new command on the `pesona` server.
- No manual publication package creation.
- No publishing.
- No social API.
- No scheduler.
- No OpenAI live runtime.
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
- No app/runtime code change.
- No migration file change.
- No `scripts/prepare-test-db.mjs` change.
- No backup file, dump file, tar archive, checksum file, route evidence file, env file, secret, `node_modules`, generated media, rendered MP4, or storage artifact committed.

## Next Safe Phase

Next safe phase: manual publication package evidence, final restore dry-run planning in a separate isolated environment, or controlled pilot operating review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
