# Phase 2I.14 Manual Publish SOP / Proof Capture Plan

Phase 2I.14 creates the manual publish SOP and proof capture plan before any real post. This is a docs-only/read-only release in the repository.

## Baseline

- Repo baseline: `8c19f32`, tag `phase-2i13-complete`
- Runtime server remains at `phase-2i4-complete` per owner evidence.
- Runtime Git head: `8f675052be9cb97c1d70e685a04bedbc73d912ec`
- Package ID: `ca5a591f-fdf1-4b8c-bb61-9295c186a7be`
- Package status: `ready_manual_publish`
- Checklist state remains `24` done / `8` pending.
- Each channel remains `6` done / `2` pending.
- `manual_post_created` remains pending for all channels.
- `manual_url_recorded` remains pending for all channels.
- Evidence log count remains `2`.
- Closeout count remains `0`.
- `published_manually_at` remains empty.
- Existing blank YouTube `admin_note` anomaly remains documented and unchanged.

## Documents Created

- `docs/ops/MANUAL_PUBLISH_SOP_PROOF_CAPTURE_PLAN.md`
- `docs/phase-2i14-manual-publish-sop-proof-capture-plan.md`

## SOP Decision

The SOP requires a future one-channel pilot first, not four-channel publishing. Recommended first channel is Facebook or Instagram. Owner must explicitly approve selected channel, final video file, caption, hashtags, CTA, visibility/publication mode, publish operator, and proof capture method before any real publish.

Operator must use the official platform UI only. No automation, scheduler, social API, third-party posting tool, upload automation, OpenAI live runtime, public exposure, or cutover is approved.

## Proof And Safety Rules

- Proof must be real, not dummy.
- Acceptable proof is platform URL/permalink/share link, platform post ID if URL is delayed, platform-visible post timestamp, or a non-secret redacted screenshot only if URL is unavailable.
- Fake URL, placeholder URL, draft URL treated as public proof, blank evidence value, blank `recorded_by_name`, evidence with no channel/source, or screenshots containing security/private data are not acceptable.
- Do not capture credentials, passwords, tokens, cookies, sessions, OTP, 2FA code, recovery code, private phone number, private email inbox, security settings, or business payment data.
- Existing blank YouTube `admin_note` anomaly must remain documented and must not be used as publish proof.

## Non-Goals

This phase has no runtime command, no publish, no upload, no evidence log, no checklist mutation, no closeout, and no cutover.

No backup artifacts, rendered MP4s, storage artifacts, env files, secrets, credentials, generated files, app/runtime code, migration files, or `scripts/prepare-test-db.mjs` changes are included in this docs-only release.

## Go/No-Go

- Docs-only SOP/proof plan: YES.
- Actual publish in this phase: NO.
- Upload in this phase: NO.
- `manual_post_created` in this phase: NO.
- `manual_url_recorded` in this phase: NO.
- Evidence log creation in this phase: NO.
- Closeout: NO.
- Cutover: NO.
- Public exposure: NO.
- Scheduler/social API/publisher: NO.
- OpenAI live runtime: NO.
- Uncontrolled checklist mutation: NO.
- Future controlled one-channel manual publish pilot: CONDITIONAL YES after explicit owner approval.

## Recommended Next Phase

`Phase 2I.15 Controlled One-Channel Manual Publish Pilot - Owner Approval Gate`

The next phase should be an owner approval gate first, not immediate publish. It should choose exact first channel, confirm public/draft/private/unlisted/test-only mode, approve caption/hashtags/CTA, approve video file, approve proof capture method, confirm no credential capture, and confirm no closeout.

## Final Blocked State

- Actual publishing remains blocked.
- Upload remains blocked.
- Evidence log creation remains blocked.
- Checklist mutation remains blocked.
- `manual_post_created` remains pending.
- `manual_url_recorded` remains pending.
- Closeout remains blocked.
- Cutover remains blocked.
