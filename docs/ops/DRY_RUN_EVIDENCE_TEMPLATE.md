# Dry-Run Evidence Template

This template is for a future separate test environment dry-run. Phase 2G.5 does not run the dry-run, does not restore data, does not copy storage, and does not perform cutover.

## Safety Rules

- No restore over active DB.
- No Docker volume delete.
- No storage delete.
- No production cutover during dry-run.
- No `.env.local` attachment.
- No credentials in evidence.

## Dry-Run Target Environment

| Field | Evidence |
| --- | --- |
| Dry-run date | |
| Operator | |
| Test environment name | |
| Test database name/identifier | |
| Test storage path | |
| Confirmed separate from active/local production DB | |

## Backup Source

| Field | Evidence |
| --- | --- |
| Backup source name | |
| Backup date | |
| Backup operator | |
| Release tag in backup evidence | |
| Storage scope included | |
| Credentials excluded | |

## Restore Target Confirmation

| Field | Evidence |
| --- | --- |
| Restore target reviewed by owner/admin | |
| Target is test-only | |
| Active DB not targeted | |
| Docker volumes not deleted | |
| Storage not deleted | |

## Active DB Safety Confirmation

```text
active_db_name_or_identifier:
test_db_name_or_identifier:
operator_confirmation:
owner/admin_confirmation:
```

## Route Checks

| Route | Status | Notes |
| --- | --- | --- |
| `/health` | | |
| `/operational-readiness` | | |
| `/manual-publish-report` | | |
| `/manual-publish-closeouts` | | |
| `/publication-packages` | | |
| `/approved-videos` | | |
| `/content-items` | | |

## DB Count Comparison

| Table | Expected Count | Restored Test Count | Match? | Notes |
| --- | ---: | ---: | --- | --- |
| campaigns | | | | |
| content_items | | | | |
| footage_assets | | | | |
| content_publications | | | | |
| manual_publication_packages | | | | |
| manual_publication_package_channels | | | | |
| manual_publish_checklist_items | | | | |
| manual_publish_evidence_logs | | | | |
| manual_publish_closeouts | | | | |

## Storage Listing Sample

```text
storage/footage sample:
storage/draft-videos sample:
storage/approved-videos sample:
```

## Mismatch Log

| Mismatch | Impact | Owner/Admin Decision |
| --- | --- | --- |
| | | |
| | | |

## Pass / Fail

```text
dry_run_result: pass / fail / needs repeat
reason:
operator:
date:
```

## Owner Decision

```text
decision: accepted / repeat dry-run / blocked
evidence_reviewed:
risks_accepted:
next_action:
owner_name/sign_off:
```
