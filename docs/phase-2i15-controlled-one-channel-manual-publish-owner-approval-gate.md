# Phase 2I.15 Controlled One-Channel Manual Publish Pilot - Owner Approval Gate

## Summary

Phase 2I.15 records the docs-only owner approval gate for a future controlled one-channel manual publish pilot.

The gate converts the Phase 2I.14 Manual Publish SOP / Proof Capture Plan into the approval fields required before any real post. Because the owner has not selected the first channel or final publish details in this phase, the gate remains `HOLD / PENDING_OWNER_CHANNEL_SELECTION`.

## Baseline

- Repo baseline: `891bacb`, tag `phase-2i14-complete`.
- Runtime server remains at `phase-2i4-complete` per owner evidence.
- Runtime Git head: `8f675052be9cb97c1d70e685a04bedbc73d912ec`.
- Package ID: `ca5a591f-fdf1-4b8c-bb61-9295c186a7be`.
- Package status: `ready_manual_publish`.
- `published_manually_at`: empty.
- Total checklist state: `24` done / `8` pending.
- Facebook: `6` done / `2` pending.
- Instagram: `6` done / `2` pending.
- TikTok: `6` done / `2` pending.
- YouTube: `6` done / `2` pending.
- `manual_post_created` remains pending for all channels.
- `manual_url_recorded` remains pending for all channels.
- Manual publish evidence logs: `2`.
- Manual publish closeouts: `0`.
- Blank YouTube `admin_note` anomaly remains documented and unchanged.

## Documents Created

- `docs/ops/CONTROLLED_ONE_CHANNEL_MANUAL_PUBLISH_OWNER_APPROVAL_GATE.md`.
- `docs/phase-2i15-controlled-one-channel-manual-publish-owner-approval-gate.md`.

## Gate Status

- Gate status: `HOLD`.
- Hold reason: owner has not yet selected the first channel and final publish details.
- Actual publishing is not approved by this phase.
- This phase prepares only the owner approval structure.

Recommended first channel is Facebook because proof/share URL handling is likely easier and it avoids simultaneous four-channel publishing. Instagram remains the safe alternative if owner prefers IG-first campaign flow. TikTok and YouTube should not be first unless owner explicitly chooses them.

## Pending Owner Approvals

Before a future controlled one-channel manual publish pilot, the owner must explicitly approve:

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

## Safety Rules

- `manual_post_created` can only be marked done after a real manual post exists.
- `manual_url_recorded` can only be marked done after a real URL/permalink/share link or approved platform proof exists.
- No fake URL, placeholder URL, dummy proof, blank evidence value, or blank `recorded_by_name`.
- No credential screenshot.
- Evidence log creation remains blocked unless owner explicitly approves it.
- Existing blank YouTube `admin_note` anomaly remains historical and must not be used as publish proof.
- If the platform does not provide a URL, `manual_url_recorded` remains pending.

## Non-Goals

This phase had:

- No runtime command.
- No publish.
- No upload.
- No evidence log.
- No checklist mutation.
- No closeout.
- No cutover.
- No production backup by Codex.
- No restore or restore dry-run.
- No storage copy.
- No deployment.
- No public exposure.
- No Docker Compose up/down.
- No container mutation.
- No scheduler/social API/publisher activation.
- No OpenAI live runtime.
- No credential capture.
- No worker or queue expansion.

## Go/No-Go

- Docs-only owner approval gate: YES.
- Actual publish in this phase: NO.
- Upload in this phase: NO.
- `manual_post_created` in this phase: NO.
- `manual_url_recorded` in this phase: NO.
- Evidence log creation in this phase: NO.
- Closeout: NO.
- Cutover: NO.
- Public exposure: NO.
- Scheduler/social API/publisher: NO.
- Future controlled one-channel manual publish pilot: CONDITIONAL YES after explicit owner approval.

## Recommended Next Phase

`Phase 2I.16 Controlled One-Channel Manual Publish Pilot - Owner Selected Channel`

That phase should start only after the owner provides selected channel, publication mode, final caption/hashtags/CTA, proof capture method, explicit permission to manually publish, explicit permission whether to create evidence log, and explicit permission to update only selected channel publish-proof checklist items.

## Final Blocked State

Closeout remains blocked. Cutover remains blocked. Actual publishing remains blocked in this phase. `manual_post_created` and `manual_url_recorded` remain pending for all channels. Evidence log count remains unchanged at `2`. The existing blank YouTube `admin_note` anomaly remains documented and unchanged.
