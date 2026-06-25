# Release Readiness Checklist

Current release baseline should be `phase-2g2-complete`.

## Completed Pipeline Baseline

- 2F.1 Manual Publication Package
- 2F.2 Manual Publish Checklist & Evidence Log
- 2F.3 Manual Publish Report / Export Board
- 2F.4 Manual Publish Closeout Certificate
- 2G.1 Operational Readiness Dashboard
- 2G.2 Admin UX Polish

## Pre-Use Checklist

1. Confirm server branch/tag matches the approved release.
2. Confirm `git status --short` is clean before operational use.
3. Confirm Docker Compose config resolves.
4. Confirm PostgreSQL and Redis are healthy.
5. Run `npm run db:migrate` and confirm no unexpected migration work.
6. Open `/operational-readiness`.
7. Open `/content-calendar`.
8. Open `/approved-videos`.
9. Open `/publication-packages`.
10. Open `/manual-publish-report`.
11. Confirm no unexpected `content_publications` rows unless owner expects them.
12. Confirm storage free space is acceptable.

## Pre-Demo Checklist

1. Confirm owner-approved demo data is present.
2. Confirm no sensitive data is visible in browser tabs or terminal output.
3. Confirm manual publish pages show safety notices.
4. Confirm navigation groups are visible.
5. Confirm empty states look clear on pages with no data.
6. Confirm the demo route list returns 200:
   - `/operational-readiness`
   - `/content-calendar`
   - `/content-items`
   - `/footage-assets`
   - `/approved-videos`
   - `/publication-packages`
   - `/manual-publish-report`
   - `/manual-publish-closeouts`

## Pre-Server-Migration Checklist

1. Confirm target office server hardware and SSD layout.
2. Confirm Docker Engine and Docker Compose v2 are installed.
3. Confirm `.env.local` is prepared on the server and not committed.
4. Confirm storage path maps to the SSD working storage.
5. Confirm database backup exists from the old environment.
6. Perform restore dry-run in separate test environment first.
7. Confirm Google Drive is used only for backup/sharing.
8. Confirm owner approves the cutover window.
9. Confirm rollback plan exists before moving real operations.

## Go Criteria

Go when:

- Branch/tag matches approved release.
- App health is 200.
- PostgreSQL and Redis are healthy.
- `npm run check` passes for release validation.
- Operational Readiness page loads.
- Manual publish report and closeout pages load.
- Storage listings are stable.
- Backup evidence exists.
- No blocking warnings remain.

## No-Go Criteria

Do not proceed when:

- Branch/tag is wrong.
- Worktree has unexplained changes.
- Database migration fails.
- PostgreSQL or Redis is unhealthy.
- App health is not 200.
- Disk space is critically low.
- Storage files expected by active records are missing.
- Backup evidence is missing before risky changes.
- Owner has not approved an environment migration or reset.

## Known Non-Goals

- No auto-publisher.
- No scheduler.
- No social API.
- No OpenAI runtime automation.
- No production VPS dependency.
- No automatic upload to social platforms.
- No queue or worker expansion in this release readiness phase.

## Next Recommended Phase Options

- Local office server deployment rehearsal.
- Backup evidence dry-run on a separate test environment.
- Operator training using the daily/weekly SOP.
- Read-only release audit dashboard export if owner wants a printable checklist later.
- Manual publishing workflow refinements after owner/admin feedback.
