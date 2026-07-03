# Controlled Draft Review Evidence

## Purpose

This document records Phase 2H.17 owner-provided controlled draft review approval evidence for the controlled pilot stack `psd_pilot` on `pesona`.

This is evidence intake only. Codex did not run new commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize production approval, approved-video promotion, approved handoff, manual publication package creation, social publishing, OpenAI live runtime, scheduler/publisher automation, public exposure, deployment, cutover, restore, storage copy, or production operation.

## Scope And Non-Goals

In scope:

- Record owner-provided controlled draft review approval evidence.
- Record the reviewed render attempt, DB-only review record, review/approval counts, file evidence, route checks, runtime status, and explicit non-goals.
- Record that approved-videos remained placeholder-only and no copy/promotion occurred.

Out of scope and not authorized:

- Running commands on Lenovo or on the `pesona` server by Codex.
- Production approval.
- Approved-video promotion.
- Approved handoff.
- Manual publication package creation.
- Social publishing or social API activation.
- OpenAI live runtime.
- Scheduler/publisher automation.
- Public exposure or Cloudflare Tunnel.
- Deployment.
- Cutover.
- Production backup.
- Restore or restore dry-run.
- Storage copy.
- Stopping, restarting, or mutating containers by Codex.
- Docker Compose up/down by Codex.
- App/runtime code, migration file, or `scripts/prepare-test-db.mjs` changes.
- Committing backup files, dump files, tar archives, checksum files, route evidence files, env files, secrets, `node_modules`, generated media, rendered MP4s, or storage artifacts.

## Controlled Review Scope

Owner-provided evidence records:

- This was controlled draft review approval evidence.
- Approval was DB-only.
- This was not production approval.
- This was not approved-video promotion.
- This was not approved handoff.
- This was not manual publication package creation.
- This was not social publishing.
- This was not OpenAI live runtime.
- This was not scheduler/publisher automation.
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

## Render Attempt Reviewed

Owner-provided reviewed render attempt evidence:

| Field | Evidence |
| --- | --- |
| Render attempt ID | `5de99c97-6cf0-4f76-9638-6b39b4a0ee7c` |
| Render manifest ID | `3f6e89a4-477e-43a2-84db-f5bc0da2d953` |
| Video draft job ID | `5c6ac9b9-ad97-4a2f-a5bb-a0af39d7811b` |
| Content item ID | `38a94f4f-4411-485e-9825-faeeeccd08d6` |
| Attempt status | `succeeded` |
| Attempt mode | `manual_smoke` |
| Output relative path | `smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4` |
| Output size | `1950179` |
| FFmpeg exit code | `0` |
| Error message | Empty |

Draft video remained under:

```text
storage/draft-videos/smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4
```

The rendered MP4 is a generated storage artifact and is not committed to Git.

## Review Record

Owner-provided review record evidence:

| Field | Evidence |
| --- | --- |
| Review record ID | `b94a495d-e857-4fe8-955b-93a2e58ffc46` |
| Review status | `approved` |
| Reviewer | `Rino` |
| Reviewed at | `2026-07-03 08:47:53.236638+00` |

Review note:

```text
APPROVED FOR PILOT SMOKE ONLY. Draft render synthetic demo berhasil dibuat dan hanya disetujui sebagai evidence pilot. Bukan konten produksi final, tidak dipublish, tidak diupload, tidak dicopy ke approved-videos.
```

This review approval is for pilot smoke evidence only. It is not final production approval.

## Review And Approval Counts

Owner-provided count evidence:

| Table | Count |
| --- | ---: |
| `video_render_attempts` | `1` |
| `video_render_attempt_reviews` | `1` |
| `video_render_approved_promotions` | `0` |
| `video_approved_handoff_records` | `0` |
| `manual_publication_packages` | `0` |

No promotion, handoff, or publication package was created.

## File Evidence

Owner-provided draft video file evidence:

| File | Size |
| --- | ---: |
| `storage/draft-videos/.gitkeep` | `67` bytes |
| `storage/draft-videos/smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4` | `1950179` bytes |

Owner-provided approved videos file evidence:

| File | Size |
| --- | ---: |
| `storage/approved-videos/.gitkeep` | `70` bytes |

Approved videos remained placeholder-only. No copy/promotion to approved-videos occurred.

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

Controlled draft review approval is PASS.

Review record created is PASS. Approved-videos remained placeholder-only is PASS. No promotion/handoff/package is PASS.

No social API, publisher, scheduler, upload automation, OpenAI live runtime, public exposure, or cutover occurred.

Cutover remains blocked.

## Warnings And Non-Goals

- This review approval is for pilot smoke evidence only.
- It is not final production approval.
- No promotion to approved-videos.
- No approved handoff.
- No manual publication package.
- No social API, publisher, scheduler, or upload automation.
- No OpenAI live runtime.
- No public exposure.
- No cutover.

## What Was Not Executed By Codex

- No command on Lenovo.
- No new command on the `pesona` server.
- No production approval.
- No approved-video promotion.
- No approved handoff.
- No manual publication package creation.
- No publishing.
- No production backup.
- No restore.
- No restore dry-run.
- No deployment.
- No cutover.
- No storage copy.
- No public exposure.
- No Cloudflare Tunnel.
- No scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- No container stop, restart, or mutation.
- No Docker Compose up/down.
- No app/runtime code change.
- No migration file change.
- No `scripts/prepare-test-db.mjs` change.
- No backup file, dump file, tar archive, checksum file, route evidence file, env file, secret, `node_modules`, generated media, rendered MP4, or storage artifact committed.

## Next Safe Phase

Next safe phase: controlled approved-video promotion evidence, post-review backup restore dry-run planning in a separate isolated environment, or controlled pilot operating review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
