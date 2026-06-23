# Phase 2B.7 Footage Operations Handoff

Status: ready for owner review

Branch baseline: `phase-2b7-footage-operations-handoff`

Baseline tag: `phase-2b6-complete`

## Purpose

Phase 2B completed the local footage catalog workflow:

- manual footage metadata records
- read-only scan preview for `storage/footage`
- metadata-only import for missing files
- batch metadata review and update
- runtime smoke reports for catalog, scan, and review

This handoff is for operators and developers before moving into future script, shot selection, or video workflow phases. It does not introduce upload, AI tagging, render, scheduler, publisher, or Google Drive primary storage behavior.

## Operating Boundary

The working storage remains local-first:

- Primary footage working folder: `storage/footage`
- Primary runtime: office/local Docker Compose stack
- Google Drive: backup/sharing only, not daily footage working storage
- VPS: optional later only with owner approval

The Phase 2B catalog stores metadata in PostgreSQL. The catalog does not guarantee that a physical file exists unless the scan page sees it under `storage/footage`.

## Operator Workflow

1. Copy original footage manually into `storage/footage`.

   Use clear subfolders that make sense for operators, for example by product, campaign, date, or shooting session. Do not use paths outside `storage/footage` for the active footage workflow.

2. Open scan preview:

   ```text
   http://localhost:3000/footage-assets/scan
   ```

   The scan preview is read-only for files. It reads directory entries and file metadata, then shows whether files are already cataloged.

3. Import missing metadata.

   Use the scan import action to create database metadata records for files that exist under `storage/footage` but are not yet cataloged. Import does not edit, move, rename, copy, upload, or generate footage files.

4. Open review workflow:

   ```text
   http://localhost:3000/footage-assets/review
   ```

5. Use filters to find records needing review.

   Useful filters:

   - status
   - shot type
   - product
   - school level
   - incomplete metadata

6. Select records and batch update safe metadata fields.

   Allowed review fields:

   - status
   - shot type
   - school level
   - theme
   - product
   - quality score
   - notes

   Batch review does not change file identity fields:

   - relative path
   - filename
   - file extension
   - size in bytes
   - created time

## Metadata Quality Before Future Script/Video Workflow

Before future script or shot selection work depends on footage, reusable records should be reviewed:

- `status` should usually be `reviewed` or `approved`.
- `shot_type` should not remain `other` unless the clip is truly unknown or miscellaneous.
- `product` should be filled when the clip clearly belongs to Sampul Raport or Sampul Ijazah.
- `school_level` should be filled when the clip is specific to SD, SMP, SMA, MI, MTs, MA, or umum.
- `theme` should describe the reusable context, such as packing, workshop, foil detail, product stack, delivery, or testimonial context.
- `quality_score` should be filled for footage likely to be reused.
- `notes` should capture operator context that helps later script/shot selection.

Incomplete metadata currently means one or more of these is true:

- status is `new`
- shot type is `other`
- product is empty
- theme is empty
- quality score is empty

## What Is Not Supported Yet

Phase 2B does not support:

- file upload
- AI tagging or AI analysis
- video render or generation
- auto-publish
- scheduler automation
- Google Drive as primary storage
- directory watcher automation
- physical file cleanup workflow
- automatic mapping from content scripts to footage

Operators should treat Phase 2B as a safe catalog and review layer only.

## Smoke Data Hygiene

Local databases may contain metadata-only smoke rows from Phase 2B runtime tests. Known examples use paths like:

- `smoke/phase-2b2-test.mp4`
- `smoke/phase-2b4-scan-test.mp4`
- `smoke/phase-2b6-review-a.mp4`
- `smoke/phase-2b6-review-b.mp4`

These rows are non-blocking. Some smoke metadata rows intentionally point to files that do not exist anymore. That is expected because the smoke tests proved metadata behavior and avoided leaving physical footage fixtures behind.

To identify smoke metadata rows safely, use a read-only query:

```sh
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres psql -U pesona -d pesona_studio -P pager=off -c "SELECT id, relative_path, status, shot_type, product_id, theme, quality_score FROM footage_assets WHERE relative_path LIKE 'smoke/%' ORDER BY relative_path;"
```

Recommended handling:

- Leave smoke rows alone if they do not interfere with review.
- If the operator wants them out of active review, archive them through `/footage-assets/review`.
- For API-based archival, use the existing batch metadata endpoint with selected IDs and `status: archived`.
- Do not manually remove smoke rows from the database unless owner explicitly approves a future controlled cleanup task.
- Do not reset the database or storage to remove smoke rows.

Example metadata-only archival through the existing API:

```sh
curl -fsS -i -X POST http://localhost:3000/api/footage-assets/batch-update \
  -H 'Content-Type: application/json' \
  --data '{"ids":["<smoke-row-id>"],"updates":{"status":"archived","notes":"Archived smoke metadata row after owner review."}}'
```

This changes only catalog metadata. It does not touch physical footage files.

## Safe Verification Commands

Use these commands for non-destructive verification:

```sh
git status --short
docker compose --env-file .env.local -f docker-compose.dev.yml ps
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres pg_isready -U pesona -d pesona_studio
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T redis redis-cli ping
npm run db:migrate
curl -fsS -i http://localhost:3000/footage-assets
curl -fsS -i http://localhost:3000/footage-assets/scan
curl -fsS -i http://localhost:3000/footage-assets/review
curl -fsS -i http://localhost:3000/api/footage-assets
curl -fsS -i http://localhost:3000/api/footage-assets/scan
npm run check
git diff --check
```

If containers are stale, rebuild with:

```sh
docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build
```

Do not remove volumes or reset storage during normal verification.

## Developer Notes

Phase 2B behavior is intentionally conservative:

- Scan reads file metadata only.
- Import creates database records only.
- Batch review updates metadata only.
- Existing path validation protects relative paths.
- Product assignment requires an active product.
- Review does not add upload, render, AI tagging, scheduling, publishing, or storage cleanup.

If a future phase needs cleanup or richer status handling, propose it as a separate owner-approved task with a clear rollback plan.

## Next Phase Readiness

Phase 2B is ready for script and shot selection planning. Future Phase 2C should still avoid AI tagging, render, or automation until the footage selection rules are clear:

- which metadata fields are required for matching
- how shot types map to script scenes
- how product and school level affect clip eligibility
- how quality score affects reusable footage selection
- how operators review or override automatic suggestions later

The next phase should continue local-first, metadata-first, and owner-reviewed.
