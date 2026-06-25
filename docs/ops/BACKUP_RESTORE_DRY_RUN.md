# Backup And Restore Dry-Run SOP

This SOP describes manual backup and restore dry-run expectations. It does not add backup automation and must not be used to restore over the active local production database.

## Backup Principles

- Local SSD is the working storage.
- Google Drive is backup/sharing only.
- Google Drive is not primary working storage.
- Backup evidence should be understandable to owner/admin without exposing credentials.
- Restore dry-runs must use a separate test database/environment only.

## What To Back Up

- Database dump from the local PostgreSQL database.
- `storage/footage` metadata and source files if owner policy allows backing up footage.
- `storage/draft-videos` only for local smoke/output files intentionally kept.
- `storage/approved-videos` approved outputs intentionally kept.
- Docs and config examples that are safe to share.
- Release tag and git status evidence.

## What Not To Back Up Publicly

Do not put these in public/shared backup folders:

- `.env` or `.env.local`
- API keys
- tokens
- service credentials
- database credentials
- private customer data unless the owner approves the location and access policy

## Manual Backup Checklist

1. Confirm no urgent admin work is in progress.
2. Capture branch, tag, and `git status --short`.
3. Capture database migration state if needed.
4. Create a database dump using the approved local admin method.
5. Copy only owner-approved storage folders/files.
6. Keep backup location and date clear.
7. Do not copy credential files into public/shared folders.
8. Record backup evidence: date, operator, source, destination, and what was included.

Example evidence fields:

```text
backup_date:
operator:
release_tag:
database_dump_name:
storage_scope:
destination:
notes:
```

## Restore Dry-Run Checklist

Warning: do not run restore over the active/local production DB.

Warning: do not delete Docker volumes during restore dry-run.

1. Create or select a separate test database/environment.
2. Confirm the target is not the active local production DB.
3. Confirm restore inputs are from the intended backup date.
4. Restore the database dump into the separate test database only.
5. Mount or copy test storage files only into a separate test storage location.
6. Start the app against the test environment if needed.
7. Verify read-only pages and selected records.
8. Destroy or archive the test environment only after owner/admin confirms evidence is captured.

## Restore Verification Checklist

Verify:

- App health endpoint returns 200.
- `/operational-readiness` loads.
- `/content-items` loads.
- `/footage-assets` loads.
- `/approved-videos` loads.
- `/publication-packages` loads.
- `/manual-publish-report` loads.
- Expected campaigns/content/package counts are present.
- Expected storage files are visible in the test location.
- No restore was performed over the active local production DB.

## Evidence Checklist

Capture:

- Restore date.
- Operator.
- Backup source name.
- Test database/environment name.
- App route checks.
- Count comparison.
- Storage sample listing.
- Any warnings or mismatches.
- Owner/admin decision: pass, needs repeat, or blocked.

## Forbidden During Dry-Run

Do not run destructive reset behavior on the active environment:

```text
docker compose down -v
docker volume rm
database reset commands
DROP/TRUNCATE used as cleanup
rm -rf storage
```

If cleanup is needed, stop and ask owner to approve a written cleanup plan for the separate test environment.
