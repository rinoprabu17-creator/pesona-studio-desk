# Controlled Demo Render Evidence

## Purpose

This document records Phase 2H.16 owner-provided controlled demo footage and render evidence for the controlled pilot stack `psd_pilot` on `pesona`.

This is evidence intake only. Codex did not run new commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize production render, approved video promotion, manual publish package creation, social publishing, OpenAI live runtime, scheduler/publisher automation, deployment, cutover, public exposure, restore, storage copy, or production operation.

## Scope And Non-Goals

In scope:

- Record owner-provided controlled pilot demo render evidence.
- Record synthetic demo footage creation, metadata/catalog state, footage selection, shot step footage linking, render manifest, preflight, controlled smoke render attempt, render DB counts, route checks, runtime status, and expected rerender guard.
- Record that the produced draft MP4 is evidence only and is not committed to Git.

Out of scope and not authorized:

- Running commands on Lenovo or on the `pesona` server by Codex.
- Production render.
- Approved video promotion.
- Manual publish package creation.
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

## Controlled Demo Render Scope

Owner-provided evidence records:

- This was controlled pilot demo render evidence.
- This was not production render.
- This was not approved video promotion.
- This was not manual publish package creation.
- This was not social publishing.
- This was not OpenAI live runtime.
- This was not scheduler/publisher automation.
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

## Demo Footage

Synthetic demo footage was created under:

```text
storage/footage/pilot-demo/pilot-sampul-raport-demo-001.mp4
```

Owner-provided format evidence:

- `720x1280`.
- Vertical `9:16`.
- Around `5` seconds.
- About `2.0M`.
- Generated with `ffmpeg testsrc2` inside the pilot `web-app` container.
- This is not production footage.

The generated footage file is a storage artifact and is not committed to Git.

## Footage Metadata And Selection

Owner-provided evidence records:

- Footage asset was scanned/cataloged.
- Footage asset status became approved/reviewed.
- Footage was selected for content `PILOT-DESAIN-GRATIS-01-D01`.

DB count evidence after footage selection:

| Table | Count |
| --- | ---: |
| `footage_assets` | `1` |
| `content_item_footage_selections` | `1` |
| `content_item_shot_plan_steps` | `4` |
| `video_draft_jobs` | `1` |
| `video_render_manifests` | `0` |
| `video_render_attempts` | `0` |

Shot steps were then linked to the selected footage.

Final shot step evidence:

| Check | Count |
| --- | ---: |
| `shot_steps_total` | `4` |
| `shot_steps_with_footage` | `4` |

Each shot step used:

```text
pilot-demo/pilot-sampul-raport-demo-001.mp4
```

## Render Manifest And Preflight

Owner-provided evidence records:

- Render manifest was created for content `PILOT-DESAIN-GRATIS-01-D01`.
- Manifest ID: `3f6e89a4-477e-43a2-84db-f5bc0da2d953`.
- Manifest status was changed to approved.
- Latest preflight was ready.
- Latest preflight ID: `a3463232-1c80-431c-82ee-2915ba6e066b`.
- Earlier warning `manifest_status_draft` was resolved by approving the manifest.

Render manifest and preflight evidence is PASS.

## Controlled Smoke Render

Controlled smoke render was run manually from the UI.

Owner-provided render attempt evidence:

| Field | Evidence |
| --- | --- |
| Render attempt ID | `5de99c97-6cf0-4f76-9638-6b39b4a0ee7c` |
| Attempt status | `succeeded` |
| Attempt mode | `manual_smoke` |
| Output | `smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4` |
| Output physical file | `storage/draft-videos/smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4` |
| Output size | `1950179` bytes |
| FFmpeg exit code | `0` |
| Started/completed | `2026-07-03 08:03:15 UTC` |
| Error message | Empty |

FFmpeg command preview:

```text
ffmpeg -i storage/footage/pilot-demo/pilot-sampul-raport-demo-001.mp4 -t 10 storage/draft-videos/smoke/pilot-desain-gratis-01-d01-3f6e89a4-20260703080315.mp4
```

Controlled smoke render is PASS. Draft MP4 creation is PASS.

The rendered MP4 is a generated storage artifact and is not committed to Git.

## Rerender Guard

After render, rerender was blocked because output already exists and overwrite is not allowed. This is expected and safe.

Do not click render again for the same output because overwrite guard is working.

## Render DB Counts After Render

Owner-provided DB count evidence after render:

| Table | Count |
| --- | ---: |
| `video_render_manifests` | `1` |
| `video_render_manifest_items` | `4` |
| `video_render_preflight_runs` | `2` |
| `video_render_attempts` | `1` |
| `video_render_attempt_reviews` | `0` |
| `video_approved_handoff_records` | `0` |
| `manual_publication_packages` | `0` |

No approval/promotion was performed. No manual publication package was created.

## Route And Runtime Evidence After Render

Owner-provided route evidence after render: all returned HTTP 200.

- `/health`.
- `/content-items`.
- `/approved-videos`.
- `/manual-publish-report`.

Owner-provided runtime evidence after render:

| Container | Status |
| --- | --- |
| `psd_pilot-n8n-1` | Up |
| `psd_pilot-web-app-1` | Up, `0.0.0.0:3400->3000` |
| `psd_pilot-campaign-planner-worker-1` | Up |
| `psd_pilot-mockup-worker-1` | Up |
| `psd_pilot-video-worker-1` | Up |
| `psd_pilot-postgres-1` | Up healthy |
| `psd_pilot-redis-1` | Up healthy |

Storage evidence after render:

| Check | Evidence |
| --- | --- |
| `/srv/pesona-studio` size | `469G` |
| `/srv/pesona-studio` available | `445G` |
| Repo storage after render | About `3.9M` before post-render backup |
| `/srv/pesona-studio` used in later backup evidence | About `13M` |

Pilot remained running.

## Outcome

Controlled demo footage creation is PASS.

Footage metadata/catalog is PASS. Footage selection is PASS. Shot step footage linking is PASS. Render manifest and preflight are PASS. Controlled smoke render is PASS. Draft MP4 creation is PASS.

No approval/promotion was performed. No manual publication package was created. No social API, publisher, scheduler, upload automation, OpenAI live runtime, public exposure, or cutover occurred.

Cutover remains blocked.

## What Was Not Executed By Codex

- No command on Lenovo.
- No new command on the `pesona` server.
- No production render.
- No approval/promotion.
- No manual publish package creation.
- No social publishing.
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

Next safe phase: controlled approval/promotion evidence, post-render backup restore dry-run planning in a separate isolated environment, or controlled pilot operating review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
