# Phase 2J.6 Real Footage Metadata Coverage Review

## Summary

Phase 2J.6 adds a local-only metadata coverage review layer for the expanded real-footage metadata fixture created in Phase 2J.5.

The phase evaluates whether the metadata batch is broad enough for practical content planning across products, channels, production stages, hooks, CTAs, and a 30-day calendar approximation. It remains metadata/review-only.

No video rendering, FFmpeg execution, real media scan, upload, publishing, publish package creation, public-ready approval, evidence log mutation, checklist mutation, closeout, server command, Docker Compose server command, backup/restore, cutover, env/secret/credential change, migration, `scripts/prepare-test-db.mjs` change, storage media mutation, rendered output creation, or `workers/video` change is included.

## Baseline

- Baseline commit: `d652ed2`.
- Baseline tag: `phase-2j5-complete`.
- Phase 2J.5 finalized an expanded metadata-only batch with `36` rows, `30` usable rows, `6` blocked rows, coverage gaps `0`, public-ready count `0`, and publish track blocked.

## Files Added

- `packages/content-engine/src/metadata-coverage-review.ts`.
- `scripts/metadata-coverage-review-smoke.mjs`.
- `docs/ops/REAL_FOOTAGE_METADATA_COVERAGE_REVIEW.md`.
- `docs/phase-2j6-real-footage-metadata-coverage-review.md`.

## Files Updated

- `packages/content-engine/src/index.ts`.
- `package.json`.
- `README.md`.
- `README.local.md`.
- `docs/ops/HANDOFF_PACK_INDEX.md`.
- `docs/ops/PENDING_FEATURES_REGISTER.md`.

## Metadata Coverage Review Model Result

The new review model outputs:

- Row counts.
- Coverage score.
- Coverage level.
- Product family coverage.
- Process stage coverage.
- Channel coverage.
- School level coverage.
- Color variant coverage.
- Hook asset coverage.
- CTA asset coverage.
- Content calendar support estimate.
- Weak spots.
- Recommended capture list.
- Blocked risk summary.
- Readiness notes.

`public_ready` remains hard-coded `false`. `publish_track` remains hard-coded `blocked`.

## 30-Day Calendar Support Estimation Result

The estimator is deterministic and metadata-only. It estimates:

- Unique short video idea capacity.
- Usable 30-day slot support.
- Strongest content pillars.
- Weakest content pillars.
- Minimum additional footage needed.
- Suggested capture list.

The estimate does not claim production readiness, media readability, render readiness, or public readiness.

## Coverage Score / Level Result

Current smoke result:

- Coverage score: `100`.
- Coverage level: `strong_metadata_base`.
- Product families covered: `2`.
- Raw process stages available from the expanded fixture: `12`.
- Required process coverage categories covered: `7` of `7`.
- Channels covered: `4`.
- Estimated unique short video ideas: `45`.
- Estimated usable 30-day slots: `30`.
- Weak spot count: `0`.

`strong_metadata_base` means the fixture has broad metadata coverage for planning. It does not approve rendering or publishing.

The process-stage numbers have different meanings: `12` is the raw unique normalized `process_stage` count from Phase 2J.5, while `7` is the Phase 2J.6 required process-category coverage count used by the planning review.

## Recommended Capture List Result

Current recommended capture list:

- Capture a small real-media verification set matching the strongest metadata rows before any render dry-run.
- Add fresh CTA/mockup clips whenever the owner changes the offer or channel priority.
- Keep adding Map Ijazah proof/QC footage until it matches Sampul Raport depth.

## Smoke Command

```bash
npm run ai:metadata-coverage:smoke
```

The smoke prints provider, fixture path, row counts, coverage score, coverage level, covered products/processes/channels, estimated ideas, estimated 30-day slots, weak spot count, recommended capture count, public-ready result, and publish-track result.

## Validation Checklist

Run before finalization:

- `git status --short`.
- `git diff --name-only`.
- `git ls-files --others --exclude-standard`.
- `git diff --check`.
- `npm run check`.
- `npm run ai:content-engine:smoke`.
- `npm run ai:real-footage-intake:smoke`.
- `npm run ai:script-draft-review:smoke`.
- `npm run ai:draft-plan-quality:smoke`.
- `npm run ai:real-footage-expanded:smoke`.
- `npm run ai:metadata-coverage:smoke`.
- `git diff --name-only | grep "workers/video" || true`.
- Forbidden path scan for env/secrets/credentials, migrations, `scripts/prepare-test-db.mjs`, storage media mutation, evidence/checklist closeout mutation, publishing/upload/render outputs, server/Docker Compose changes, FFmpeg/render command usage, accidental public-ready approval, and `workers/video`.

## Safety / Forbidden Path Result

Expected safety result:

- No `workers/video` change.
- No migration change.
- No `scripts/prepare-test-db.mjs` change.
- No env, secret, credential, API key, token, cookie, session, or generated runtime artifact.
- No storage media, rendered video, backup, dump, archive, checksum, route evidence, or production data artifact.
- No server command or Docker Compose server command.
- No evidence log, checklist, closeout, publishing, upload, backup/restore, or cutover mutation.
- No real media scan.
- No FFmpeg execution.
- No public-ready approval.

## Risks / Follow-Up

- Metadata breadth is not the same as real footage quality.
- Real file existence, codec, duration accuracy, audio, visual clarity, privacy risk, and platform suitability are still unverified.
- A controlled real-media intake dry-run gate should define read-only scan rules before touching actual footage folders.

## Recommended Next Phase

`Phase 2J.7 Real Footage Intake Dry-Run Gate`

This should be an approval gate first, defining exactly what can be scanned read-only and what remains blocked before any real media intake dry-run.
