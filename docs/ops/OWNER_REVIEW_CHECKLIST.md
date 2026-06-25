# Owner Review Checklist

Use this checklist to review the full local ops pack before giving it to technician/admin or approving any real office server work.

## Business Readiness

| Item | Go/Hold/Revise | Notes |
| --- | --- | --- |
| Local-first operating model accepted | | |
| Manual publish boundary accepted | | |
| No production VPS dependency accepted | | |
| Pending features understood | | |
| Owner knows freeze is not deployment | | |

## Admin Readiness

| Item | Go/Hold/Revise | Notes |
| --- | --- | --- |
| Daily/weekly SOP is clear | | |
| Operational Readiness dashboard use is clear | | |
| Manual publish package/checklist/evidence flow is clear | | |
| Closeout process is clear | | |
| Incident escalation path is clear | | |

## Technician Readiness

| Item | Go/Hold/Revise | Notes |
| --- | --- | --- |
| Technician handoff guide is clear | | |
| Evidence intake form is clear | | |
| Network/storage checklist is clear | | |
| Printable preflight checklist is clear | | |
| No secrets in evidence rule is clear | | |

## Backup / Restore Readiness

| Item | Go/Hold/Revise | Notes |
| --- | --- | --- |
| Backup/restore dry-run SOP is clear | | |
| Dry-run evidence template is clear | | |
| No restore over active DB rule is clear | | |
| No Docker volume delete rule is clear | | |
| No storage delete rule is clear | | |

## Cutover Readiness

| Item | Go/Hold/Revise | Notes |
| --- | --- | --- |
| Deployment rehearsal doc is clear | | |
| Cutover Go/No-Go criteria are clear | | |
| Rollback plan is clear | | |
| Post-cutover verification is clear | | |
| Public exposure remains disabled by default | | |

## Pending Feature Acceptance

| Pending Feature | Accepted As Pending? | Notes |
| --- | --- | --- |
| Office server actual deployment | | |
| Backup execution | | |
| Restore dry-run | | |
| Storage copy/cutover | | |
| Autostart/systemd/cron | | |
| Public exposure/tunnel | | |
| Automated backup | | |
| Scheduler/publisher/social API | | |
| OpenAI runtime automation | | |
| Queue/worker daemon expansion | | |
| Monitoring/alerts | | |

## Decision

```text
decision: Go / Hold / Revise
release_tag:
branch:
evidence_reviewed:
risks_accepted:
next_action:
owner_notes:
owner_name/signature:
date:
```
