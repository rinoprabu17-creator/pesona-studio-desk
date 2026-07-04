# Controlled Manual Publish Readiness Checklist Evidence

## Purpose

This document records Phase 2H.20 owner-provided controlled manual publish readiness and checklist board evidence for the controlled pilot stack `psd_pilot` on `pesona`.

This is evidence intake only. Codex did not run new commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize actual social publishing, manual publish evidence log creation, closeout, scheduler/publisher automation, OpenAI live runtime, public exposure, deployment, cutover, restore, storage copy by Codex, or production operation.

## Scope And Non-Goals

In scope:

- Record owner-provided controlled manual publish readiness evidence.
- Record owner-provided checklist board initialization evidence.
- Record DB-only readiness/checklist actions, counts, package readiness state, checklist summary, file evidence, route checks, runtime status, and explicit non-goals.
- Record that no manual publish evidence log and no closeout were created.

Out of scope and not authorized:

- Running commands on Lenovo or on the `pesona` server by Codex.
- Actual social publishing.
- Manual publish evidence log creation.
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

## Controlled Readiness And Checklist Scope

Owner-provided evidence records:

- This was controlled manual publish readiness and checklist board evidence.
- Readiness/checklist actions were DB-only.
- This was not actual social publishing.
- This was not manual publish evidence log creation.
- This was not closeout.
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
| Backup timestamp UTC | `2026-07-04T05:45:33Z` |

## Manual Readiness And Checklist Counts

Owner-provided count evidence:

| Table | Count |
| --- | ---: |
| `manual_publication_packages` | `1` |
| `manual_publication_package_channels` | `4` |
| `manual_publish_checklist_items` | `32` |
| `manual_publish_evidence_logs` | `0` |
| `manual_publish_closeouts` | `0` |

Manual publish readiness status is PASS. Checklist board initialization is PASS.

No manual publish evidence log is PASS. No closeout is PASS.

## Package Readiness Status

Owner-provided package readiness evidence:

| Field | Evidence |
| --- | --- |
| Package ID | `ca5a591f-fdf1-4b8c-bb61-9295c186a7be` |
| Package status | `ready_manual_publish` |
| Package title | `PILOT-DESAIN-GRATIS-01-D01 - Manual Package Smoke` |
| Created by | `Rino` |
| `ready_at` | `2026-07-04 05:29:44.13736+00` |
| `published_manually_at` | Empty |
| Updated at | `2026-07-04 05:29:44.13736+00` |

Manual publish note:

```text
MANUAL PUBLICATION PACKAGE - PILOT SMOKE ONLY. Package dibuat hanya sebagai evidence pilot dari approved handoff. Belum upload, belum publish, belum schedule, belum social API, dan belum cutover.
```

Package status `ready_manual_publish` is PASS.

This readiness state is pilot smoke evidence only.

## Checklist Board Summary

Owner-provided checklist board evidence:

| Channel | Total | Done | Pending |
| --- | ---: | ---: | ---: |
| `facebook` | `8` | `0` | `8` |
| `instagram` | `8` | `0` | `8` |
| `tiktok` | `8` | `0` | `8` |
| `youtube` | `8` | `0` | `8` |

Total checklist items: `32`.

Checklist item state:

- All items are `pending`.
- All `is_done = false`.
- `checked_by_name`: Empty.
- `checked_at`: Empty.
- `checklist_note`: Empty.

Checklist keys represented per channel:

- `account_login_ready`.
- `caption_ready`.
- `cta_ready`.
- `final_visual_check`.
- `hashtags_ready`.
- `manual_post_created`.
- `manual_url_recorded`.
- `video_file_confirmed`.

32 checklist items created is PASS. Four channels times eight checklist items is PASS. All checklist items remain pending is PASS.

## Evidence And Closeout Status

Owner-provided evidence and closeout status:

| Item | Evidence |
| --- | --- |
| `manual_publish_evidence_logs` | `0` |
| `manual_publish_closeouts` | `0` |
| Evidence logs query | `(0 rows)` |
| Closeouts query | `(0 rows)` |
| Manual publish URL | Not recorded |
| Manual publish proof | Not recorded |
| Manual closeout | Not occurred |

No manual publish evidence log is PASS. No closeout is PASS.

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

Manual publish readiness status is PASS.

Checklist board initialization is PASS. 32 checklist items created is PASS. Four channels times eight checklist items is PASS. All checklist items remain pending is PASS. No manual publish evidence log is PASS. No closeout is PASS.

No upload, publish, schedule action, social API, publisher, scheduler, upload automation, OpenAI live runtime, public exposure, or cutover occurred.

Cutover remains blocked.

## Warnings And Non-Goals

- This is pilot smoke evidence only.
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
