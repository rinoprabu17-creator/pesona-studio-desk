# Ops Docs Consistency Audit

This audit reviews the ops docs from Phase 2G.3, Phase 2G.4, Phase 2G.5, and Phase 2G.6 for consistent local-first operating assumptions.

## Ops Docs Index

### Phase 2G.3

- `docs/ops/LOCAL_SERVER_RUNBOOK.md`
- `docs/ops/DAILY_WEEKLY_SOP.md`
- `docs/ops/BACKUP_RESTORE_DRY_RUN.md`
- `docs/ops/TROUBLESHOOTING_INCIDENTS.md`
- `docs/ops/RELEASE_READINESS_CHECKLIST.md`

### Phase 2G.4

- `docs/ops/LOCAL_SERVER_DEPLOYMENT_REHEARSAL.md`
- `docs/ops/TECHNICIAN_HANDOFF.md`
- `docs/ops/OFFICE_SERVER_NETWORK_STORAGE_CHECKLIST.md`
- `docs/ops/CUTOVER_GO_NO_GO.md`
- `docs/ops/POST_CUTOVER_VERIFICATION.md`

### Phase 2G.5

- `docs/ops/TECHNICIAN_EVIDENCE_INTAKE.md`
- `docs/ops/OFFICE_SERVER_PREFLIGHT_PRINTABLE.md`
- `docs/ops/OWNER_SIGNOFF_TEMPLATES.md`
- `docs/ops/DRY_RUN_EVIDENCE_TEMPLATE.md`
- `docs/ops/HANDOFF_PACK_INDEX.md`

### Phase 2G.6

- `docs/ops/FINAL_LOCAL_OPS_RELEASE_AUDIT.md`
- `docs/ops/LOCAL_OPS_FREEZE_CANDIDATE_CHECKLIST.md`
- `docs/ops/OPS_DOCS_CONSISTENCY_AUDIT.md`
- `docs/ops/ROUTE_STORAGE_EVIDENCE_SNAPSHOT.md`
- `docs/ops/PENDING_FEATURES_REGISTER.md`
- `docs/ops/OWNER_REVIEW_CHECKLIST.md`

## Consistency Checks

| Principle | Status | Notes |
| --- | --- | --- |
| Local SSD is working storage | Consistent | Storage folders remain local working storage |
| Google Drive backup/sharing only | Consistent | Not primary runtime storage |
| No public exposure by default | Consistent | Public access is pending owner approval |
| No destructive Docker/DB/storage commands | Consistent | Forbidden-command lists are warnings only |
| No secrets in chat/docs/git | Consistent | Evidence templates exclude credentials |
| Manual publish only | Consistent | No auto-publisher or social API |
| Owner approval gates | Consistent | Cutover, restore, public exposure remain gated |

## Reading Order

1. `docs/ops/RELEASE_READINESS_CHECKLIST.md`
2. `docs/ops/LOCAL_SERVER_RUNBOOK.md`
3. `docs/ops/BACKUP_RESTORE_DRY_RUN.md`
4. `docs/ops/LOCAL_SERVER_DEPLOYMENT_REHEARSAL.md`
5. `docs/ops/TECHNICIAN_HANDOFF.md`
6. `docs/ops/OFFICE_SERVER_NETWORK_STORAGE_CHECKLIST.md`
7. `docs/ops/TECHNICIAN_EVIDENCE_INTAKE.md`
8. `docs/ops/OFFICE_SERVER_PREFLIGHT_PRINTABLE.md`
9. `docs/ops/CUTOVER_GO_NO_GO.md`
10. `docs/ops/POST_CUTOVER_VERIFICATION.md`
11. `docs/ops/OWNER_SIGNOFF_TEMPLATES.md`
12. `docs/ops/PENDING_FEATURES_REGISTER.md`

## Duplicate / Overlap Notes

- Storage safety appears in multiple docs intentionally because it is a high-risk operational area.
- Forbidden command warnings appear in multiple docs intentionally so technician/admin readers see the guardrails in context.
- Owner approval gates appear in multiple docs intentionally because cutover, restore, public exposure, and automation decisions are separate business decisions.

## Warnings

Non-blocking:

- README.local still contains older OpenAI/local test database examples. These are existing development docs, not Phase 2G.6 runtime changes.
- Some docs mention systemd, cron, public exposure, OpenAI, scheduler, publisher, upload, queue, worker daemon, and forbidden commands as pending features or warnings.

Blocking issues: none.
