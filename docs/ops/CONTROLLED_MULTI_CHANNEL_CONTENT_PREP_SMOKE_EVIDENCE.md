# Controlled Multi-Channel Content-Prep Checklist Smoke Evidence

## Purpose

This document records Phase 2I.10 owner-provided controlled multi-channel content-prep checklist smoke evidence for the controlled pilot stack `psd_pilot` on `pesona`.

This is evidence intake only. Codex did not run commands on Lenovo or on the `pesona` server in this phase. This evidence does not authorize actual publishing, evidence log creation, account login readiness, `manual_post_created`, `manual_url_recorded`, closeout, scheduler/publisher automation, OpenAI live runtime, public exposure, deployment, cutover, restore, storage copy by Codex, or production operation.

## Scope And Non-Goals

In scope:

- Record owner-provided controlled multi-channel content-prep checklist smoke evidence.
- Record that low-risk content-prep checklist items were marked done for Instagram, TikTok, and YouTube.
- Record that all four channels now have exactly `5` done and `3` pending checklist items.
- Record that account-login and publish-proof checklist items remained pending.
- Record validation gate output, routes, containers, DB counts, package/checklist/evidence/closeout state, file evidence, backup evidence, and explicit non-goals.

Out of scope and not authorized:

- Running commands on Lenovo or on the `pesona` server by Codex.
- Creating evidence logs, additional checklist completions outside owner-provided evidence, closeout, real publish URL, or publish timestamp.
- Completing `account_login_ready`, `manual_post_created`, or `manual_url_recorded`.
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
- Queue expansion or worker daemon expansion.
- App/runtime code, migration file, or `scripts/prepare-test-db.mjs` changes.
- Committing backup files, dump files, tar archives, checksum files, route evidence files, env files, secrets, `node_modules`, generated media, rendered MP4s, or storage artifacts.

## Runtime Baseline

| Item | Evidence |
| --- | --- |
| Server | `pesona` |
| Repo path | `/srv/pesona-studio/repos/pesona-studio-desk` |
| Pilot project | `psd_pilot` |
| Web port | `3400` |
| Runtime Git head | `8f675052be9cb97c1d70e685a04bedbc73d912ec` |
| Runtime tag | `phase-2i4-complete` |
| Backup timestamp UTC | `2026-07-07T03:40:50Z` |
| Backup directory | `/srv/pesona-studio/backups/psd-pilot-phase-2i10-multi-channel-content-prep-smoke-backup-20260707T034049Z` |

Runtime server remains at `phase-2i4-complete`.

## Validation Gate

Owner-provided validation gate output:

```text
20|12|2|0|ready_manual_publish|
multi_channel_prep_ok=ok
channel_distribution_ok=ok
blocked_items_ok=ok
```

Meaning:

- Checklist done count: `20`.
- Checklist pending count: `12`.
- Evidence log count: `2`.
- Closeout count: `0`.
- Package status: `ready_manual_publish`.
- `published_manually_at`: empty.
- Each channel has exactly `5` done checklist items.
- `account_login_ready`, `manual_post_created`, and `manual_url_recorded` remain pending across all channels.

Validation gate is PASS.

## Updated Checklist Items

Low-risk content-prep checklist items were marked done for Instagram, TikTok, and YouTube.

Instagram items marked done:

- `video_file_confirmed`.
- `caption_ready`.
- `hashtags_ready`.
- `cta_ready`.
- `final_visual_check`.

TikTok items marked done:

- `video_file_confirmed`.
- `caption_ready`.
- `hashtags_ready`.
- `cta_ready`.
- `final_visual_check`.

YouTube items marked done:

- `video_file_confirmed`.
- `caption_ready`.
- `hashtags_ready`.
- `cta_ready`.
- `final_visual_check`.

All were checked by `Rino`.

Shared checklist note:

```text
CONTROLLED MULTI-CHANNEL CONTENT-PREP CHECKLIST SMOKE - PILOT ONLY. Content-prep item marked ready for package review only. No account login change, no upload, no publish, no URL, no schedule, no closeout.
```

## Checklist Summary After Update

| Channel | Total | Done | Pending |
| --- | ---: | ---: | ---: |
| `facebook` | `8` | `5` | `3` |
| `instagram` | `8` | `5` | `3` |
| `tiktok` | `8` | `5` | `3` |
| `youtube` | `8` | `5` | `3` |

Total checklist state is `32` total, `20` done, and `12` pending.

## Blocked Checklist Items

The owner-provided validation confirms these items remained pending for Facebook, Instagram, TikTok, and YouTube:

- `account_login_ready`.
- `manual_post_created`.
- `manual_url_recorded`.

These items were not touched in this phase. `manual_post_created` and `manual_url_recorded` remain publish-proof checklist items and must remain blocked until an actual manual publish path is explicitly approved.

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

| Table | Count |
| --- | ---: |
| `manual_publication_packages` | `1` |
| `manual_publication_package_channels` | `4` |
| `manual_publish_checklist_items` | `32` |
| `manual_publish_evidence_logs` | `2` |
| `manual_publish_closeouts` | `0` |

## Package Runtime Status

| Field | Evidence |
| --- | --- |
| Package ID | `ca5a591f-fdf1-4b8c-bb61-9295c186a7be` |
| Package status | `ready_manual_publish` |
| Package title | `PILOT-DESAIN-GRATIS-01-D01 - Manual Package Smoke` |
| `ready_at` | `2026-07-04 05:29:44.13736+00` |
| `published_manually_at` | Empty |
| Updated at | `2026-07-04 05:29:44.13736+00` |

No publish timestamp is PASS.

## Evidence Log Summary

| Channel | Evidence type | Total logs | Blank logs |
| --- | --- | ---: | ---: |
| `facebook` | `admin_note` | `1` | `0` |
| `youtube` | `admin_note` | `1` | `1` |

Existing blank YouTube `admin_note` anomaly remains visible and unchanged. No new evidence log was created.

## Evidence Log Records

Intended Facebook admin note remains:

| Field | Evidence |
| --- | --- |
| ID | `cd2bba56-ea9e-4035-a24d-4a70c4a8479f` |
| Evidence value | `PILOT_SMOKE_NO_PUBLISH` |
| Recorded by | `Rino` |
| Recorded at | `2026-07-04 06:06:45.943161+00` |

Blank YouTube admin note anomaly remains:

| Field | Evidence |
| --- | --- |
| ID | `0b4b5ff2-c994-46d9-8f1c-e5c6743a336c` |
| Evidence type | `admin_note` |
| Evidence value | Empty |
| Evidence note | Empty |
| Recorded by | Empty |
| Recorded at | `2026-07-04 06:04:04.545927+00` |

Assessment: existing harmless DB-only anomaly, unchanged by this phase.

## Closeout State

- `manual_publish_closeouts = 0`.
- Closeouts query returned `(0 rows)`.
- No closeout was created.

## File And Storage Evidence

| File | Size |
| --- | ---: |
| `storage/approved-videos/smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4` | `1950179` bytes |

Storage archive included source demo footage, draft render, and approved video.

## Backup Summary

Owner-provided backup directory:

```text
/srv/pesona-studio/backups/psd-pilot-phase-2i10-multi-channel-content-prep-smoke-backup-20260707T034049Z
```

Backup directory size: `6.0M`.

`/srv/pesona-studio` storage: size `469G`, used `85M`, available `445G`.

Backup integrity evidence:

- `sha256sum -c SHA256SUMS.txt` passed for all listed evidence, dump, and archive files.
- PostgreSQL dump was readable through `pg_restore -l`.
- Dump was custom format for database `pesona_studio`, dumped from PostgreSQL `16.14`, with `306` TOC entries and expected schema/data entries.
- No restore was performed.

## Outcome

- Controlled multi-channel content-prep checklist smoke: PASS.
- Instagram, TikTok, and YouTube each reached `5` done / `3` pending: PASS.
- All four channels now have `5` done / `3` pending: PASS.
- Total checklist state is `20` done / `12` pending: PASS.
- `account_login_ready` remains pending: PASS.
- `manual_post_created` remains pending: PASS.
- `manual_url_recorded` remains pending: PASS.
- Evidence log count unchanged at `2`: PASS.
- Closeout count remains `0`: PASS.
- No publish timestamp or URL: PASS.
- Existing blank YouTube anomaly unchanged: PASS.
- Backup: PASS.
- Checksum validation: PASS.
- DB dump readability: PASS.
- Storage archive readability: PASS.
- Pilot remained running per owner evidence.

## Warnings And Non-Goals

- No command on Lenovo or `pesona` by Codex.
- This is runtime content-prep checklist smoke evidence only.
- No actual posting.
- No evidence log creation.
- No publish-proof checklist item completion.
- No account-login checklist item completion.
- No closeout creation.
- No real publish URL or publish timestamp.
- No scheduler/publisher/social API/upload automation.
- No OpenAI live runtime.
- No public exposure.
- No cutover.
- No deletion, fix, hiding, or mutation of the existing blank YouTube `admin_note` anomaly.
- Existing blank YouTube `admin_note` anomaly remains as historical runtime data.
- No app/runtime code, migration file, or `scripts/prepare-test-db.mjs` change.
- No backup artifact, rendered MP4, storage artifact, env file, secret, or generated file committed.
