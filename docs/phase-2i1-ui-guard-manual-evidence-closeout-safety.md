# Phase 2I.1 UI Guard Patch - Manual Evidence Log + Closeout Safety

## Scope

Phase 2I.1 is a laptop/WSL code safety patch for manual publish evidence logging and manual publish closeout readiness.

This phase does not run commands on `pesona` or Lenovo. It does not deploy, cut over, run production backup, run restore, run restore dry-run, perform storage copy, enable public exposure, enable Cloudflare Tunnel, enable scheduler/publisher/social API/upload automation/OpenAI live runtime, expand queues, expand worker daemons, run Docker Compose up/down, or mutate containers.

## Guard Behavior Added

Manual publish evidence creation is now blocked server-side when:

- `evidence_type` is missing or blank.
- `recorded_by_name` is missing or blank.
- Both `evidence_value` and `evidence_note` are missing or blank after trimming.

Input values are trimmed before insert. Validation failure returns a user-facing error and does not create a `manual_publish_evidence_logs` row.

Evidence history now detects blank evidence log anomalies where `evidence_value`, `evidence_note`, and `recorded_by_name` are all blank/null. Those rows remain visible with the warning:

```text
Blank evidence log anomaly - DB-only record, not valid publish proof
```

The known blank YouTube `admin_note` anomaly remains documented. This patch does not delete, mutate, hide, or fix existing anomaly data.

## Closeout Safety

Closeout creation is blocked server-side when the package is not genuinely ready. Blocking reasons now include:

- Package not marked `published_manually`.
- `published_manually_at` is empty.
- Checklist is incomplete.
- There are zero valid nonblank evidence logs.
- There is no valid publish proof; `admin_note`/sandbox evidence is not enough.
- A blank evidence log anomaly exists.
- A closeout already exists.

The closeout page displays a readiness assessment:

- `NOT_READY_FOR_CLOSEOUT` when blocked.
- `READY_FOR_CLOSEOUT` only when all server-side guards pass.

Blocked closeout attempts do not insert rows into `manual_publish_closeouts`.

## Files Changed

- `apps/web/src/manual-publish-evidence-guards.ts`
- `apps/web/src/manual-publish-closeout-service.ts`
- `apps/web/src/manual-publish-report-service.ts`
- `apps/web/src/validation/manual-publish-checklist-validation.ts`
- `apps/web/src/views/manual-publish-checklist-pages.ts`
- `apps/web/src/views/manual-publish-closeout-pages.ts`
- `tests/footage-catalog/footage-catalog.test.ts`
- `README.md`
- `README.local.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`
- `docs/phase-2i1-ui-guard-manual-evidence-closeout-safety.md`

No migration file and no `scripts/prepare-test-db.mjs` change were made.

## Validation

Validation completed on laptop/WSL:

| Command | Result |
| --- | --- |
| `git diff --check` | PASS. |
| `npm run test:footage-catalog` | PASS: 108 tests passed. |
| `npm run check` | PASS. |

Final local review commands run:

- `git status --short --ignored`
- `git diff --name-only`
- changed path safety grep

## Pending

- Commit/tag/push are intentionally not performed in this step.
- Real manual publish proof remains pending.
- Manual publish closeout remains blocked until readiness gaps are closed.
- Pilot backup restore dry-run planning remains separate.
- Cutover remains blocked pending explicit owner approval.
