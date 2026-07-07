# Phase 2J.9 Real Footage Read-Only Intake Review

## Summary

Phase 2J.9 adds a local review-only layer for the candidate manifest rows produced by the Phase 2J.8 read-only fixture intake.

The phase remains constrained to metadata strings and safe repo fixture output. It does not scan real media folders, open files, decode media, render video, upload, publish, create publish packages, mutate checklist/evidence data, or mark any output public-ready.

## Baseline

- Baseline commit: `c576349`
- Baseline tag: `phase-2j8-complete`
- Source fixture: `packages/content-engine/fixtures/read-only-intake-sample/`
- Provider: `fake_content_engine`
- Publish track: blocked

## Changed Files

- `packages/content-engine/src/read-only-intake-review.ts`
- `scripts/real-footage-read-only-intake-review-smoke.mjs`
- `package.json`
- `packages/content-engine/src/index.ts`
- `docs/ops/REAL_FOOTAGE_READ_ONLY_INTAKE_REVIEW.md`
- `docs/phase-2j9-real-footage-read-only-intake-review.md`
- `README.md`
- `README.local.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`

## Review Model

The review output records:

- total and reviewed candidates
- accepted metadata-review candidates
- manual-metadata candidates
- blocked candidates
- low-confidence candidates
- per-candidate confidence signals
- risk summary
- missing metadata summary
- recommended manual actions
- next safe actions
- `public_ready: false`
- `publish_track: blocked`

## Candidate Rules

- Privacy, unrelated, placeholder, and suspicious candidates are blocked.
- Blurry or weak-signal candidates require manual review.
- Unknown product family or process stage is low-confidence.
- Unknown orientation requires manual metadata.
- Horizontal and still-image candidates require manual channel-fit review.
- No candidate is public-ready in this phase.

## Smoke Command

```bash
npm run ai:real-footage-read-only-review:smoke
```

Expected:

- provider: `fake_content_engine`
- dry run: true
- read only: true
- total candidates >= 8
- reviewed candidates >= 8
- accepted for metadata review >= 3
- needs manual metadata >= 1
- blocked candidates >= 1
- public ready count = 0
- publish track = blocked

## Safety Result

This phase does not perform:

- real media folder scan
- media content opening
- media decoding
- FFmpeg execution
- render
- upload
- publishing
- publish package creation
- public-ready approval
- server command
- Docker Compose command
- storage mutation
- env/secret/credential change
- migration
- `scripts/prepare-test-db.mjs` change
- evidence log mutation
- checklist or closeout mutation

## Recommended Next Phase

`Phase 2J.10 Real Footage Owner-Approved Source Folder Gate`
