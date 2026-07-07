# Manual Publish SOP / Proof Capture Plan

Phase: 2I.14
Evidence type: docs-only manual publish SOP and proof capture plan
Runtime server baseline: `pesona`
Runtime tag: `phase-2i4-complete`

## Purpose

This document defines the manual publish SOP before any real post. It defines proof capture rules, prevents dummy publish proof, prevents credential leakage, and keeps closeout/cutover blocked until real proof is validated.

This phase is docs-only/read-only. It is not actual publishing, not upload, not evidence log creation, not checklist mutation, not closeout, not scheduler/publisher automation, not OpenAI live runtime, not public exposure, and not cutover.

## Current Baseline

- Repo baseline: `8c19f32`, tag `phase-2i13-complete`
- Runtime server remains at `phase-2i4-complete`
- Runtime Git head: `8f675052be9cb97c1d70e685a04bedbc73d912ec`
- Package ID: `ca5a591f-fdf1-4b8c-bb61-9295c186a7be`
- Package status: `ready_manual_publish`
- Checklist state: `24` done / `8` pending
- Facebook: `6` done / `2` pending
- Instagram: `6` done / `2` pending
- TikTok: `6` done / `2` pending
- YouTube: `6` done / `2` pending
- Pending items for each channel: `manual_post_created`, `manual_url_recorded`
- Evidence logs: `2`
- Closeouts: `0`
- `published_manually_at`: empty
- Blank YouTube `admin_note` anomaly remains documented and unchanged.

Codex did not run commands on `pesona`, did not run commands on Lenovo, did not deploy, did not run backup, did not run restore or restore dry-run, did not perform storage copy, did not run Docker Compose up/down, and did not mutate containers.

## Manual Publish SOP

- Run a one-channel pilot first, not all four channels.
- Recommended first channel: Facebook or Instagram.
- Owner must explicitly approve the selected channel before publish.
- Owner must approve the final video file.
- Owner must approve caption, hashtags, and CTA.
- Owner must approve visibility/publication mode.
- Owner must approve the publish operator.
- Owner must approve the proof capture method.
- Operator must not use automation, scheduler, social API, or third-party posting tools.
- Operator must manually upload/post through the official platform UI only.
- Operator must avoid showing or capturing credentials or account security data.

## Approved Video Reference

- Approved video file: `storage/approved-videos/smoke/pilot-desain-gratis-01-d01-pilot-desain-gratis-01-d01-3f6e89a4-20260703080315-5de99c97-approved-20260703091749.mp4`
- Content code: `PILOT-DESAIN-GRATIS-01-D01`

This docs phase does not commit, copy, render, upload, or publish the MP4.

## Proof Capture Rules

Proof must be real, not dummy.

Acceptable proof:

- Public/share URL/permalink from the platform.
- Platform post ID if URL is delayed.
- Platform-visible post timestamp.
- Non-secret screenshot only if URL is unavailable, with sensitive areas redacted.

Unacceptable proof:

- Fake URL.
- Placeholder URL.
- Draft URL treated as public proof.
- Screenshot showing password, token, cookie, session, recovery data, OTP, 2FA code, private phone number, private email inbox, private security settings, or business payment data.
- Blank evidence value.
- Blank `recorded_by_name`.
- Evidence with no channel or no source.

## Evidence Log Rules

- No evidence log should be created until there is real proof or explicitly approved admin evidence.
- Existing blank YouTube `admin_note` anomaly must remain documented and must not be used as publish proof.

For real publish proof, required fields are:

- `channel`
- `evidence_type`
- `evidence_value`
- `evidence_note`
- `recorded_by_name`
- `recorded_at`

Field rules:

- `evidence_value` must not be blank.
- `recorded_by_name` must not be blank.
- For URL proof, `evidence_value` should contain the real URL, permalink, or share link.
- Evidence note should include manual publish pilot, channel, operator, no automation/social API/scheduler, no credentials captured, and no closeout yet.

## Checklist Update Rules

- `manual_post_created` can only be marked done after a real manual post exists.
- `manual_url_recorded` can only be marked done after a real URL, permalink, share link, or approved platform proof exists.
- Only the selected pilot channel may be updated in the one-channel manual publish pilot.
- Other channels must remain unchanged.
- If no URL is available, `manual_url_recorded` must remain pending.
- If the post is saved as draft only, `manual_post_created` should remain pending unless owner explicitly defines draft as the intended pilot state.

## Closeout Rules

- Closeout remains blocked after one-channel publish.
- No automatic closeout is allowed.

Closeout can only be considered after:

- Owner approves the closeout gate.
- All intended channel checklist items are complete.
- Publish proof is valid.
- `published_manually_at` is correctly set if required by implementation.
- Existing anomaly is acknowledged.
- Backup evidence is complete.

## Screenshot And Redaction Rules

- Do not capture credentials.
- Do not capture passwords, tokens, cookies, sessions, OTP, 2FA code, recovery code, private phone number, private email inbox, security settings, or business payment data.
- If screenshot is needed, capture only the final published post view or public page view.
- Redact account avatars/names only if owner wants privacy, while keeping proof useful.
- Prefer URL over screenshot.

## Future One-Channel Pilot Validation Gate

Future runtime validation should confirm:

- Total checklist count changes only by expected selected channel items.
- Evidence log count changes only if approved proof is created.
- `manual_post_created` and `manual_url_recorded` are done only for the selected channel.
- Other channels remain unchanged.
- Closeout remains `0`.
- Package status remains safe.
- `published_manually_at` remains empty unless explicitly approved.
- Existing blank YouTube anomaly remains unchanged.
- Pilot containers remain running.
- Backup is created and checksum verified.

## Recommended One-Channel Pilot Sequence

1. Owner chooses channel.
2. Owner approves exact post content.
3. Operator manually publishes or creates intended real post.
4. Operator captures real URL, permalink, or share link.
5. Operator updates only selected channel checklist:
   - `manual_post_created`
   - `manual_url_recorded`
6. Optional evidence log only if owner approves.
7. Run validation.
8. Create backup.
9. Document evidence.
10. Do not closeout yet.

## Go/No-Go

- Go for docs-only SOP/proof plan: YES.
- Go for actual publish in this phase: NO.
- Go for `manual_post_created` in this phase: NO.
- Go for `manual_url_recorded` in this phase: NO.
- Go for evidence log creation in this phase: NO.
- Go for closeout: NO.
- Go for cutover: NO.
- Go for scheduler/social API/publisher: NO.
- Go for future controlled one-channel manual publish pilot: CONDITIONAL YES after explicit owner approval.

## Recommended Next Phase

`Phase 2I.15 Controlled One-Channel Manual Publish Pilot - Owner Approval Gate`

This should be owner-approval gate first, not immediate publish:

- Choose exact first channel.
- Confirm whether the post will be public, draft, private, unlisted, or test-only.
- Approve caption, hashtags, and CTA.
- Approve video file.
- Approve proof capture method.
- Confirm no credential capture.
- Confirm no closeout.

## Final Blocked State

- Actual publishing remains blocked in this phase.
- Upload remains blocked in this phase.
- Evidence log creation remains blocked in this phase.
- Checklist mutation remains blocked in this phase.
- Closeout remains blocked.
- Cutover remains blocked.
- Public exposure remains blocked.
- Scheduler/social API/publisher automation remains blocked.
- OpenAI live runtime remains blocked.
