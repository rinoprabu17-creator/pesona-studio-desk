# Post-Cutover Verification

Use this checklist only after owner-approved cutover. Phase 2G.4 does not perform cutover.

## Verification Within First Hour

Record:

- Date/time.
- Operator.
- Release tag.
- Branch.
- Server local IP.
- App health status.
- Postgres/Redis health.
- Any immediate warnings.

Routes to check:

- `/health`
- `/operational-readiness`
- `/manual-publish-report`
- `/manual-publish-closeouts`
- `/publication-packages`
- `/approved-videos`
- `/content-items`
- `/content-calendar`
- `/footage-assets`

DB counts to record:

```text
campaigns:
content_items:
footage_assets:
content_publications:
manual_publication_packages:
manual_publication_package_channels:
manual_publish_checklist_items:
manual_publish_evidence_logs:
manual_publish_closeouts:
```

Storage listings to record:

```text
storage/footage:
storage/draft-videos:
storage/approved-videos:
```

## Verification At End Of First Day

Confirm:

- Admins used the correct server.
- Operational Readiness warnings are understood.
- No unexpected `content_publications` rows appeared.
- Manual publish report still loads.
- Manual closeout page still loads.
- Storage free space is acceptable.
- No MP4/source files were staged in git.
- No social API, OpenAI automation, upload automation, scheduler, or publisher was enabled.

## Verification After First Week

Confirm:

- Daily SOP was followed.
- Weekly owner/admin review completed.
- Backup evidence exists.
- Manual publish evidence process is understood.
- Closeout process is understood.
- Incidents were recorded.
- Storage growth is acceptable.
- Owner decides whether to keep operating from the office server.

## Content Publications Visibility Check

Record:

```text
content_publications count:
expected by owner: yes/no
notes:
```

The count is for visibility. Do not mutate or create `content_publications` rows as part of verification.

## Manual Publish Workflow Checks

Check:

- Approved Videos page loads.
- Publication Packages page loads.
- Checklist/evidence pages are reachable from package detail.
- Manual Publish Report reflects package state.
- Closeout page reflects completed evidence state.
- Admin understands that posting remains manual on the platform.

## Incident Report Template

```text
incident_date:
operator:
route_or_component:
symptom:
current_branch:
current_tag:
health_status:
db_count_snapshot:
storage_snapshot:
last_safe_action:
owner_decision:
next_action:
```

## Owner Sign-Off

```text
owner_name:
sign_off_date:
decision: keep operating / rollback / observe longer
notes:
```
