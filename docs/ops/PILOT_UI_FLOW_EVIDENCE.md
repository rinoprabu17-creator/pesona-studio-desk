# Pilot UI Flow Evidence

## Purpose

This document records Phase 2H.15 owner-provided pilot UI flow evidence for the controlled pilot stack `psd_pilot` on `pesona`.

This is evidence intake only. Codex did not run new commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize production cutover, public exposure, social publishing, OpenAI live runtime, scheduler/publisher automation, render execution, footage upload, deployment, restore, storage copy, or worker expansion.

## Scope And Non-Goals

In scope:

- Record owner-provided browser/UI evidence from the controlled pilot UI flow.
- Record the created pilot campaign, content item, script/shot plan, shot steps, and metadata-only video draft job.
- Record DB count evidence after the UI flow.
- Record latest DB record evidence.
- Record route evidence after the UI flow.
- Record that no render, footage selection, upload, render manifest, render attempt, or manual publication package was created.

Out of scope and not authorized:

- Running commands on Lenovo or on the `pesona` server by Codex.
- Production cutover.
- Public exposure or Cloudflare Tunnel.
- Social publishing or social API activation.
- OpenAI live runtime.
- Scheduler/publisher automation.
- Render execution.
- Footage selection or upload.
- Restore or restore dry-run.
- Storage copy.
- Deployment.
- Stopping, restarting, or mutating containers by Codex.
- Docker Compose up/down by Codex.
- App/runtime code, migration file, or `scripts/prepare-test-db.mjs` changes.
- Committing backup files, dump files, tar archives, checksum files, route evidence files, env files, secrets, `node_modules`, generated media, or storage artifacts.

## Pilot UI Flow Scope

Owner-provided evidence records:

- This was a controlled pilot UI flow test.
- This was not production cutover.
- This was not public exposure.
- This was not social publishing.
- This was not OpenAI live runtime.
- This was not scheduler/publisher automation.
- No render was executed.
- No footage was selected or uploaded.
- Video draft job was metadata-only.

## Browser Access

Owner used this pilot URL:

```text
http://100.120.79.33:3400
```

Access remains LAN/Tailscale-only. Public exposure remains not approved.

## Campaign Created

Owner-created campaign evidence:

| Field | Evidence |
| --- | --- |
| Name | `Desain Gratis - Pilot` |
| Code | `PILOT-DESAIN-GRATIS-01` |
| Date range | `2026-07-02` to `2026-07-31` |
| Product | `Campuran / Semua Produk` |
| Status | `Aktif` |
| Target audience | `Sekolah SD/SMP/SMA, admin sekolah, kepala sekolah, operator sekolah` |
| Note | `DATA TEST PILOT - bukan data produksi. Test alur kalender konten sampai draft video.` |

## Content Item Created

Owner-created content item evidence:

| Field | Evidence |
| --- | --- |
| Content code | `PILOT-DESAIN-GRATIS-01-D01` |
| Title | `Pilot Test - Sampul Raport Desain Gratis` |
| Planned date | `2026-07-03` |
| Production status | `planned` |

## Script And Shot Plan Created

Owner-provided evidence:

- Script plan exists.
- Four shot steps were created.

## Video Draft Job Metadata Created

Owner-created video draft metadata evidence:

| Field | Evidence |
| --- | --- |
| Job status | `draft_requested` |
| Target format | `vertical_9_16` |
| Duration target | `15` |
| Planned output label | `Pilot Test Sampul Raport - Draft 1` |
| Render mode | `disabled_metadata_only` |

Additional evidence:

- No render attempt was executed.
- No render manifest was created.
- No footage asset was selected.
- No manual publication package was created.

## DB Count Evidence After UI Flow

Owner-provided DB count evidence:

| Table | Count |
| --- | ---: |
| `campaigns` | `1` |
| `content_items` | `1` |
| `content_publications` | `0` |
| `footage_assets` | `0` |
| `content_item_script_plans` | `1` |
| `content_item_shot_plan_steps` | `4` |
| `video_draft_jobs` | `1` |
| `video_render_manifests` | `0` |
| `video_render_attempts` | `0` |
| `manual_publication_packages` | `0` |

## Latest DB Record Evidence

Latest content item evidence:

| Field | Evidence |
| --- | --- |
| Content code | `PILOT-DESAIN-GRATIS-01-D01` |
| Title | `Pilot Test - Sampul Raport Desain Gratis` |
| Production status | `planned` |
| Planned date | `2026-07-03` |

Latest video draft metadata evidence:

| Field | Evidence |
| --- | --- |
| Job status | `draft_requested` |
| Target format | `vertical_9_16` |
| Duration target | `15` |
| Planned output label | `Pilot Test Sampul Raport - Draft 1` |
| Render mode | `disabled_metadata_only` |

## Route Evidence After UI Flow

Owner-provided route evidence after UI flow: all returned HTTP 200.

- `/health`.
- `/content-calendar`.
- `/content-items`.
- `/approved-videos`.
- `/publication-packages`.
- `/manual-publish-report`.
- `/manual-publish-closeouts`.

Route check after UI flow is PASS.

## Warning

One earlier SQL query attempted to read a non-existent `status` column on `video_draft_jobs`. The query was corrected to use actual columns:

- `job_status`.
- `target_format`.
- `duration_target_seconds`.
- `planned_output_label`.
- `render_mode`.

This warning is not a pilot failure. No render was executed yet because no footage is selected.

## Outcome

Pilot UI flow evidence is PASS.

Route check after UI flow is PASS.

The controlled pilot UI flow created one pilot campaign, one content item, one script plan, four shot steps, and one metadata-only video draft job. No render, footage selection/upload, render manifest, render attempt, or manual publication package occurred.

Cutover remains blocked.

## What Was Not Executed By Codex

- No command on Lenovo.
- No new command on the `pesona` server.
- No production backup.
- No restore.
- No restore dry-run.
- No deployment.
- No cutover.
- No storage copy.
- No public exposure.
- No Cloudflare Tunnel.
- No social publishing.
- No scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- No render execution.
- No footage selection or upload.
- No container stop, restart, or mutation.
- No Docker Compose up/down.
- No app/runtime code change.
- No migration file change.
- No `scripts/prepare-test-db.mjs` change.
- No backup file, dump file, tar archive, checksum file, route evidence file, env file, secret, `node_modules`, generated media, or storage artifact committed.

## Next Safe Phase

Next safe phase: post-entry pilot backup restore dry-run planning in a separate isolated environment, or controlled pilot operating review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
