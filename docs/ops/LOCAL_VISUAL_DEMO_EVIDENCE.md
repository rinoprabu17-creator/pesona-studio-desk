# Local Visual Demo Evidence

## Purpose

This document records the Phase 2H.6 laptop-only visual demo evidence for Pesona Studio Desk. The demo rehearsed the visible admin flow from content calendar through controlled draft video review using isolated synthetic data.

This is evidence of a local visual rehearsal only. It is not Lenovo office server readiness evidence, not production migration evidence, and not cutover evidence.

## Scope And Non-Goals

In scope:

- Record the isolated laptop Docker Compose project used for the demo.
- Record local browser URLs for the visual flow.
- Record demo-only data identifiers and paths.
- Record route check results.
- Record what worked and what remained mocked/fake.
- Record safety boundaries and known warnings.

Out of scope and not authorized:

- Lenovo server commands.
- Deployment.
- Cutover.
- Backup execution.
- Restore execution or restore dry-run execution.
- Restore over active DB.
- Storage copy.
- Public exposure.
- Social API, scheduler, publisher, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- Production/customer data.
- Real operational footage.
- Copying, moving, reading, editing, renaming, or deleting existing operational MP4/media content.
- Committing `.env.visual-demo`, secrets, env values, generated demo media, dumps, screenshots with secrets, or operational media.

## Laptop-Only Statement

The rehearsal was performed on the laptop/WSL repository using the isolated Docker Compose project `psd_visual_demo`.

It did not run on the Lenovo office server. It does not change the Lenovo Phase 2H.5 result: Lenovo bootstrap remains partial PASS with hardware/storage HOLD because the 32GB RAM target and 2TB SSD target are not installed/validated yet.

## Docker Project

| Item | Value |
| --- | --- |
| Compose project name | `psd_visual_demo` |
| Host app URL | `http://localhost:3300` |
| Provider mode | Fake/local only |
| Public exposure | Not enabled |
| Social/API publishing | Not enabled |
| OpenAI live runtime | Not enabled |

The project used alternate host ports to avoid stopping or modifying the existing local `pesona-studio-desk-dev` stack.

## Browser URLs

| Surface | URL |
| --- | --- |
| Calendar | `http://localhost:3300/content-calendar?month=2026-06` |
| Content item | `http://localhost:3300/content-items/7fd19dde-5e61-4425-94d6-bb2aee4fd858` |
| Footage selection | `http://localhost:3300/content-items/7fd19dde-5e61-4425-94d6-bb2aee4fd858/footage` |
| Script/shot plan | `http://localhost:3300/content-items/7fd19dde-5e61-4425-94d6-bb2aee4fd858/script-plan` |
| Video draft | `http://localhost:3300/content-items/7fd19dde-5e61-4425-94d6-bb2aee4fd858/video-draft` |
| Render attempts | `http://localhost:3300/content-items/7fd19dde-5e61-4425-94d6-bb2aee4fd858/video-draft/631a960b-f11a-4c19-addf-110dc21ec122/manifest/60b8e0a3-d8af-4ce6-abb7-5adac01ca757/render-attempts` |
| Draft review | `http://localhost:3300/content-items/7fd19dde-5e61-4425-94d6-bb2aee4fd858/video-draft/631a960b-f11a-4c19-addf-110dc21ec122/manifest/60b8e0a3-d8af-4ce6-abb7-5adac01ca757/render-attempts/968a1d27-0023-4467-be4b-be547a121b32/review` |
| Approved videos | `http://localhost:3300/approved-videos` |

## Visual Flow Tested

The visual rehearsal covered:

1. Content calendar route with the demo item visible.
2. Content item detail route.
3. Footage metadata and content footage selection.
4. Script/shot planning route.
5. Video draft job route.
6. Render manifest and DB-only preflight route.
7. Controlled local smoke render attempt route.
8. Draft review route.
9. Approved videos route remaining empty/manual.

## Demo Data Created

| Record | Value |
| --- | --- |
| Campaign ID | `d8df1f00-49e4-448b-84a6-512aa57de035` |
| Content item ID | `7fd19dde-5e61-4425-94d6-bb2aee4fd858` |
| Content code | `VISUAL-DEMO-20260626040804-D01` |
| Publication ID | `fc005584-7a48-4117-801d-cd838fba37e8` |
| Footage asset ID | `d0cce509-ee7b-4484-b627-147596e1c543` |
| Footage selection ID | `0ee20182-1880-42f1-b5f5-3a135e7ee738` |
| Script plan ID | `e09f01dc-aaec-4ec0-ac6d-9d82ca149133` |
| Shot plan step ID | `2c805d79-1f96-4fde-b759-69724d52ab40` |
| Video draft job ID | `631a960b-f11a-4c19-addf-110dc21ec122` |
| Render manifest ID | `60b8e0a3-d8af-4ce6-abb7-5adac01ca757` |
| Preflight run ID | `e49c0ced-d136-4180-bef4-c759bb7e9dd7` |
| Preflight result | `ready` |
| Render attempt ID | `968a1d27-0023-4467-be4b-be547a121b32` |
| Render status | `succeeded` |

All rows were synthetic/demo-only and created in the isolated laptop demo database.

## Demo Media Paths

These paths are evidence only and must not be committed:

| Media | Path | Size |
| --- | --- | --- |
| Synthetic source footage | `storage/footage/demo-rehearsal/psd-visual-demo-20260626110642.mp4` | `69096` bytes |
| Controlled smoke draft video | `storage/draft-videos/smoke/visual-demo-20260626040804-d01-60b8e0a3-20260626040805.mp4` | `42175` bytes |

The source footage was newly generated synthetic test media for this laptop-only demo. No existing operational media was copied, moved, read, edited, renamed, or deleted.

## Route Check Summary

Internal HTTP route checks from inside the isolated `psd_visual_demo` web-app container returned HTTP 200 and expected page markers for:

- `/health`
- `/content-calendar?month=2026-06`
- `/content-items`
- `/content-items/7fd19dde-5e61-4425-94d6-bb2aee4fd858`
- `/content-items/7fd19dde-5e61-4425-94d6-bb2aee4fd858/footage`
- `/content-items/7fd19dde-5e61-4425-94d6-bb2aee4fd858/script-plan`
- `/content-items/7fd19dde-5e61-4425-94d6-bb2aee4fd858/video-draft`
- `/content-items/7fd19dde-5e61-4425-94d6-bb2aee4fd858/video-draft/631a960b-f11a-4c19-addf-110dc21ec122/manifest`
- `/content-items/7fd19dde-5e61-4425-94d6-bb2aee4fd858/video-draft/631a960b-f11a-4c19-addf-110dc21ec122/manifest/60b8e0a3-d8af-4ce6-abb7-5adac01ca757/preflight`
- `/content-items/7fd19dde-5e61-4425-94d6-bb2aee4fd858/video-draft/631a960b-f11a-4c19-addf-110dc21ec122/manifest/60b8e0a3-d8af-4ce6-abb7-5adac01ca757/render-attempts`
- `/content-items/7fd19dde-5e61-4425-94d6-bb2aee4fd858/video-draft/631a960b-f11a-4c19-addf-110dc21ec122/manifest/60b8e0a3-d8af-4ce6-abb7-5adac01ca757/render-attempts/968a1d27-0023-4467-be4b-be547a121b32/review`
- `/content-publications/fc005584-7a48-4117-801d-cd838fba37e8`
- `/footage-assets/d0cce509-ee7b-4484-b627-147596e1c543`
- `/approved-videos`

The `/approved-videos` route showed no approved video, confirming the approved/publish flow remained manual and inactive.

## What Worked

- The isolated stack started with Docker Compose project `psd_visual_demo`.
- Compose config validation passed before runtime start.
- Existing migrations and seed completed in the isolated demo database.
- Synthetic footage was generated under ignored demo storage.
- Demo campaign/content/calendar data was visible.
- Footage selection and script/shot planning were visible.
- Video draft job, render manifest, and preflight were visible.
- Preflight completed with result `ready`.
- Controlled smoke render completed with status `succeeded`.
- Draft review route was available.

## What Remained Mocked/Fake

- Campaign Planner provider remained fake/local.
- Demo content and media were synthetic.
- No customer or production data was used.
- Publish/approved handoff remained manual and inactive.
- No social API, scheduler, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion was enabled.

## What Was Not Executed

- No Lenovo command.
- No deployment.
- No cutover.
- No backup.
- No restore.
- No restore dry-run execution.
- No storage copy.
- No public exposure.
- No social API call.
- No scheduler or publisher activation.
- No upload automation.
- No OpenAI live runtime.
- No production/customer data use.
- No real operational footage use.
- No existing operational MP4/media content copied, moved, read, edited, renamed, or deleted.

## Known Warnings

- Host-port curl to `http://localhost:3300` became inconsistent after startup from the sandbox, although Docker reported `psd_visual_demo-web-app-1` bound to `0.0.0.0:3300->3000` and internal container route checks returned HTTP 200.
- Demo files are ignored and must not be committed.
- `.env.visual-demo` is ignored and must not be committed.
- The demo stack may still be running for owner browser review.

## Safety Confirmation

Phase 2H.6 evidence confirms the demo was laptop-only and isolated. It does not authorize Lenovo readiness, office server deployment, cutover, backup, restore, restore dry-run execution, storage copy, public exposure, social API, scheduler, upload automation, OpenAI live runtime, queue expansion, worker daemon expansion, or use of production/customer data/media.

## Next Steps

- Owner may review the local browser URLs while the demo stack remains running.
- Keep `.env.visual-demo` and generated demo media ignored/uncommitted.
- If owner approves, a later cleanup step can stop the isolated demo stack without deleting volumes.
- Do not treat this evidence as Lenovo readiness or cutover evidence.
