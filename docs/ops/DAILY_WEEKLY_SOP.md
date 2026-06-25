# Daily And Weekly SOP

This SOP keeps Pesona Studio Desk usable for daily admin operations while preserving the MVP boundary: no auto-publishing, no social API posting, and human takeover for WA/DM follow-up.

## Roles

- Owner: approves release readiness, reviews operational warnings, decides escalation and reset/restore actions.
- Admin: runs daily dashboard checks, updates manual publish process, records checklist/evidence, and prepares reports.
- Content staff: follows content items, script plans, and shot/footage instructions.
- Reviewer/admin: reviews video outputs and approves or requests revision.
- Human takeover for WA/DM: handles conversations, quotes, and serious buyer follow-up outside Studio Desk.

## Daily Admin Checklist

1. Confirm the local server is reachable during office hours.
2. Open `/operational-readiness`.
3. Review system summary, pipeline funnel, manual publish readiness, and warnings.
4. Open `/content-calendar` and identify content that needs footage, script plan, render review, or manual publish follow-up.
5. Open `/footage-assets` and check new/reviewed/approved footage status.
6. Open `/approved-videos` and identify items ready for manual publish package preparation.
7. Open `/publication-packages` and continue only manual package/checklist/evidence steps.
8. Open `/manual-publish-report` and review incomplete packages.
9. Open `/manual-publish-closeouts` and confirm closeout candidates when evidence is complete.
10. Record operational blockers for owner review.

## Weekly Owner/Admin Checklist

1. Review current branch/tag and release notes.
2. Review `/operational-readiness` for stuck pipeline stages.
3. Review campaigns and content coverage for Sampul Raport and Sampul Ijazah.
4. Check footage quality and missing footage patterns.
5. Check approved videos waiting too long for manual publish.
6. Check manual publish report and closeout coverage.
7. Confirm storage free space is acceptable.
8. Confirm backup evidence exists for database and important storage files.
9. Review incident notes and decide next operational improvements.

## Footage Intake Checklist

1. Content staff records or provides footage according to the content item and shot instructions.
2. Admin keeps footage in local SSD working storage.
3. Admin catalogs footage metadata in Studio Desk.
4. Admin marks footage reviewed/approved only after checking relevance and quality.
5. Do not treat Google Drive as the working storage location.
6. Do not commit footage files to git.

## Approved Video Handoff Checklist

1. Reviewer confirms the render attempt has passed review.
2. Admin checks `/approved-videos`.
3. Admin reviews approved output path and handoff status.
4. Admin marks or confirms manual handoff readiness only through existing manual workflow.
5. Admin prepares publication package if the approved video is ready.

## Manual Publish Checklist And Evidence Process

1. Open `/publication-packages`.
2. Open the relevant package detail page.
3. Initialize or review checklist items using the existing manual checklist flow.
4. Complete checklist items only after the manual work is actually done.
5. Record manual URL evidence after posting is completed manually on the platform.
6. Use `/manual-publish-report` to identify missing checklist/evidence.
7. Do not assume any auto-posting happened. Posting remains manual unless a future owner-approved phase changes that boundary.

## Closeout Process

1. Open `/manual-publish-report`.
2. Confirm the package is ready/evidence complete.
3. Confirm manual URL evidence is present where required.
4. Open `/manual-publish-closeouts`.
5. Create or review closeout only through the existing manual closeout flow.
6. Treat closeout as evidence that the manual publish package reached operational completion.

## Operational Readiness Dashboard Review

Use `/operational-readiness` as the first daily dashboard. It should answer:

- Are content items moving through footage, script, draft, render, approval, handoff, package, evidence, report, and closeout?
- Are there packages with no checklist?
- Are there packages with incomplete checklist?
- Are there packages missing manual URL evidence?
- Are there ready evidence packages without closeout?
- Are there any unexpected `content_publications` rows to inspect?

## No Auto-Publishing Assumption

Manual publish means the admin posts directly on the platform and records evidence in Studio Desk. Studio Desk does not publish, schedule platform posts, upload to social platforms, or call social APIs in this phase.
