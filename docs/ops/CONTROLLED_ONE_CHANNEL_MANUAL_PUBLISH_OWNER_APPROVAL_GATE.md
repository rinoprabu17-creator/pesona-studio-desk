# Controlled One-Channel Manual Publish Owner Approval Gate

## Purpose

This document defines the owner approval gate before any real one-channel manual publish pilot.

It converts the Phase 2I.14 Manual Publish SOP / Proof Capture Plan into an approval checklist. The gate prevents accidental publish without an owner-selected channel, final content, proof method, and safety confirmation. Closeout and cutover remain blocked.

## Current Baseline

- Repo baseline: `891bacb`, tag `phase-2i14-complete`.
- Runtime server remains at `phase-2i4-complete`.
- Runtime Git head: `8f675052be9cb97c1d70e685a04bedbc73d912ec`.
- Package ID: `ca5a591f-fdf1-4b8c-bb61-9295c186a7be`.
- Package status: `ready_manual_publish`.
- Checklist state: `24` done / `8` pending.
- Facebook: `6` done / `2` pending.
- Instagram: `6` done / `2` pending.
- TikTok: `6` done / `2` pending.
- YouTube: `6` done / `2` pending.
- Pending items for each channel:
  - `manual_post_created`.
  - `manual_url_recorded`.
- Evidence logs: `2`.
- Closeouts: `0`.
- `published_manually_at`: empty.
- Blank YouTube `admin_note` anomaly remains documented and unchanged.

This docs phase does not touch runtime.

## Gate Status

- Gate status: `HOLD`.
- Reason: owner has not yet selected the first channel and final publish details in this phase.
- Actual publishing is not approved by this phase.
- This phase only prepares the approval structure.

Current gate state: `HOLD / PENDING_OWNER_CHANNEL_SELECTION`.

## Recommended First Channel

Recommended first channel: Facebook.

Reasons:

- Facebook likely has easier proof/share URL handling.
- One channel is safer than testing all four channels at once.
- Facebook aligns with Meta manual publishing workflow.

Alternative: Instagram if owner prefers IG-first campaign flow.

TikTok and YouTube should not be first unless owner explicitly chooses them.

## Required Owner Approval Fields

The owner must explicitly approve all of these before a controlled one-channel manual publish pilot:

- Selected channel.
- Publication mode: public / draft / private / unlisted / test-only.
- Exact approved video file.
- Exact caption.
- Exact hashtags.
- Exact CTA.
- Publish operator.
- Proof capture method.
- Whether evidence log creation is allowed.
- Whether `manual_post_created` may be marked done after a real post.
- Whether `manual_url_recorded` may be marked done after a real URL/proof.
- Confirmation that no credential or account-sensitive data will be captured.
- Confirmation that no closeout will be created.

## Approved Video Candidate

- Approved video file candidate: `storage/approved-videos/smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4`.
- Content code: `PILOT-DESAIN-GRATIS-01-D01`.

This docs phase does not commit, copy, upload, or publish the MP4.

## Draft Approval Template

Selected channel:
`PENDING_OWNER_SELECTION`

Publication mode:
`PENDING_OWNER_SELECTION`

Approved video:
`PENDING_OWNER_APPROVAL`

Caption:
`PENDING_OWNER_APPROVAL`

Hashtags:
`PENDING_OWNER_APPROVAL`

CTA:
`PENDING_OWNER_APPROVAL`

Publish operator:
`PENDING_OWNER_APPROVAL`

Proof capture method:
`PENDING_OWNER_APPROVAL`

Evidence log allowed:
`PENDING_OWNER_APPROVAL`

Checklist update allowed:
`PENDING_OWNER_APPROVAL`

Closeout allowed:
`NO`

Cutover allowed:
`NO`

## Publish-Proof Rules

- `manual_post_created` can only be marked done after a real manual post exists.
- `manual_url_recorded` can only be marked done after a real URL/permalink/share link or approved platform proof exists.
- No fake URL.
- No placeholder URL.
- No dummy proof.
- No blank evidence value.
- No blank `recorded_by_name`.
- No credential screenshot.
- If the platform does not provide a URL, `manual_url_recorded` remains pending.

## Evidence Log Policy For Next Phase

Default: no evidence log unless owner explicitly approves it.

If owner approves evidence log creation, it must contain non-blank:

- Channel.
- `evidence_type`.
- `evidence_value`.
- `evidence_note`.
- `recorded_by_name`.

Evidence note must state:

- Controlled one-channel manual publish pilot.
- No automation.
- No social API.
- No scheduler.
- No credentials captured.
- No closeout yet.

Existing blank YouTube `admin_note` anomaly remains historical and must not be used as publish proof.

## Future Runtime Validation Requirements

If a future controlled one-channel manual publish pilot is approved, runtime validation must check:

- Only selected channel changed.
- Only expected publish-proof checklist items changed.
- Evidence log count changed only if explicitly approved.
- Other channels remain unchanged.
- Closeout count remains `0`.
- `published_manually_at` remains empty unless explicitly approved.
- Blank YouTube anomaly remains unchanged.
- Backup created and checksum verified.
- Pilot remains running.

## Go/No-Go

- Go for docs-only owner approval gate: YES.
- Go for actual publish in this phase: NO.
- Go for upload in this phase: NO.
- Go for `manual_post_created` in this phase: NO.
- Go for `manual_url_recorded` in this phase: NO.
- Go for evidence log creation in this phase: NO.
- Go for closeout: NO.
- Go for cutover: NO.
- Go for public exposure: NO.
- Go for scheduler/social API/publisher: NO.
- Go for future controlled one-channel manual publish pilot: CONDITIONAL YES after explicit owner approval.
- Current gate status: `HOLD / PENDING_OWNER_CHANNEL_SELECTION`.

## Recommended Next Phase

`Phase 2I.16 Controlled One-Channel Manual Publish Pilot - Owner Selected Channel`

This next phase must start only after owner provides:

- Selected channel.
- Publication mode.
- Final caption/hashtags/CTA.
- Proof capture method.
- Explicit permission to manually publish.
- Explicit permission whether to create evidence log.
- Explicit permission to update only selected channel publish-proof checklist items.

## Non-Goals And Safety Notes

This phase is docs-only/read-only.

It does not run a runtime command, does not publish, does not upload, does not create an evidence log, does not mutate checklist state, does not create closeout, does not set `published_manually_at`, does not create a real publish URL, does not capture credentials, does not run production backup, does not run restore or restore dry-run, does not perform storage copy, does not deploy, does not expose the app publicly, does not run Docker Compose up/down, does not mutate containers, does not enable scheduler/publisher/social API/OpenAI live runtime/upload automation, does not expand workers or queues, does not touch app/runtime code, does not touch migrations, does not change `scripts/prepare-test-db.mjs`, does not delete branches, and does not cut over.

The existing blank YouTube `admin_note` anomaly remains documented and unchanged.
