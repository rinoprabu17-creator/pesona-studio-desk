# Local Ops Freeze Candidate Checklist

Freeze candidate definition: the docs and local ops handoff pack are stable enough for owner/technician review.

Freeze does not mean production deployment. Freeze does not authorize restore, storage copy, public exposure, or cutover.

## Checklist

| Item | Pass/Fail | Evidence | Notes |
| --- | --- | --- | --- |
| Branch/tag clean | | | |
| Docs present | | | |
| README links present | | | |
| Handoff index updated | | | |
| No runtime code changes | | | |
| No migration | | | |
| No prepare-test-db changes | | | |
| No storage/MP4 tracked | | | |
| Tests pass | | | |
| Read-only route smoke documented | | | |
| DB counts documented if smoke performed | | | |
| Storage listing documented if smoke performed | | | |
| Pending features clearly listed | | | |
| Owner approval gates documented | | | |

## Explicit Non-Authorization

This freeze candidate does not authorize:

- Actual office server deployment.
- Real backup.
- Real restore.
- Restore over active DB.
- Storage copy.
- Docker volume delete.
- Storage delete.
- Production cutover.
- Public internet exposure.
- systemd service creation.
- cron job creation.
- Scheduler/publisher/social API/OpenAI runtime automation.

## Sign-Off Fields

```text
review_date:
release_tag:
branch:
owner_decision: freeze candidate accepted / hold / revise
evidence_reviewed:
risks_accepted:
next_action:
owner_name/sign_off:
```
