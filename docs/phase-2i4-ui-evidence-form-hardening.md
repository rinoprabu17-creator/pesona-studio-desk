# Phase 2I.4 UI/UX Evidence Form Hardening

## Summary

Phase 2I.4 hardens the manual publish evidence form so browser users cannot accidentally submit blank evidence. The server-side Phase 2I.1 validation remains the final authority.

This is a local UI/app hardening patch. Codex did not run commands on `pesona` or Lenovo. No migration, `scripts/prepare-test-db.mjs`, backup artifact, storage artifact, rendered MP4, generated file, env file, secret, or dump/archive/checksum file is committed.

## UI Hardening

The Add Evidence form now:

- Marks `Evidence Type` as required.
- Starts with an empty evidence type choice so the browser cannot silently default to `admin_note`.
- Marks `Recorded By` as required.
- Shows helper text: `Evidence Value or Evidence Note is required. Blank evidence is not valid publish proof.`
- Disables `Add Evidence` when `evidence_type` is blank.
- Disables `Add Evidence` when `recorded_by_name` is blank.
- Disables `Add Evidence` when both `evidence_value` and `evidence_note` are blank after trimming.
- Treats whitespace-only input as blank.
- Shows live helper feedback for missing fields.

The shared helper `getManualPublishEvidenceFormState` mirrors the browser-side trim/blank rules for tests and page rendering. It does not replace server-side validation.

## Server Authority

The Phase 2I.1 server-side guard remains unchanged as the final authority:

- Blank evidence log creation is rejected.
- Missing `recorded_by_name` is rejected.
- Missing `evidence_type` is rejected.
- At least one of `evidence_value` or `evidence_note` must be nonblank.
- Accepted values are trimmed before insert.
- Invalid submissions do not create `manual_publish_evidence_logs` rows.

## Blank Anomaly Visibility

Existing blank evidence rows remain visible. The blank YouTube `admin_note` anomaly remains documented and unchanged.

The evidence table keeps the warning:

`Blank evidence log anomaly - DB-only record, not valid publish proof`

The UI also states that anomaly rows remain visible as historical DB data and are not valid publish proof. No row is hidden, deleted, fixed, or mutated.

## Closeout Clarity

Closeout business logic is unchanged. Unsafe closeout remains blocked server-side.

The closeout page keeps `NOT_READY_FOR_CLOSEOUT` messaging and renders blocking reasons as a visible list, including reasons such as:

- Package not marked published manually.
- Checklist incomplete.
- No valid publish proof.
- Blank evidence anomaly exists.
- Existing closeout exists, when applicable.

## Validation

Commands to run for this phase:

- `git diff --check`
- `npm run test:footage-catalog`
- `npm run check`
- `git status --short --ignored`
- `git diff --name-only`

Results should confirm the UI helper tests, existing server-side blank evidence guard tests, blank anomaly display test, and closeout `NOT_READY_FOR_CLOSEOUT` tests pass.

## Non-Goals

- No command on `pesona` or Lenovo by Codex.
- No evidence log creation.
- No checklist completion.
- No closeout creation.
- No actual publishing.
- No real publish URL or publish timestamp.
- No production backup.
- No restore.
- No restore dry-run.
- No storage copy.
- No deployment.
- No cutover.
- No public exposure.
- No Docker Compose up/down.
- No container mutation.
- No social API.
- No scheduler.
- No OpenAI live runtime.
- No worker expansion.
- No deletion, hiding, fix, or mutation of the existing blank YouTube `admin_note` anomaly.
- No migration file or `scripts/prepare-test-db.mjs` change.
- No backup artifact, rendered MP4, storage artifact, env file, secret, or generated file committed.

## Remaining Pending Items

- Closeout remains blocked until the package is genuinely ready.
- Actual publish remains blocked.
- Social API/scheduler remains blocked.
- Public exposure remains blocked.
- Cutover remains blocked.
- Direct DB writes can still bypass app-level validation until a future DB constraint phase is approved.
