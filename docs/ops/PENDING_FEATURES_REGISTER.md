# Pending Features Register

This register separates safe docs/read-only work from execution work. Every item below requires owner approval before implementation or operation.

| Category | Reason Pending | Risk Level | Prerequisites | Owner Approval Required | Recommended Future Phase |
| --- | --- | --- | --- | --- | --- |
| Office server actual deployment | Current phases only prepared docs and evidence templates | High | Technician evidence, backup plan, cutover plan | Yes | Local server deployment rehearsal execution |
| Backup execution | Backup SOP exists, but no backup was run in docs phases | High | Backup destination, access policy, operator | Yes | Backup evidence dry-run |
| Restore dry-run | Must use separate test environment and avoid active DB | High | Backup source, test DB, test storage path | Yes | Restore dry-run evidence phase |
| Storage copy/cutover | Storage contains operational media and must not be copied casually | High | Backup evidence, target SSD, owner window | Yes | Cutover rehearsal |
| Autostart/systemd/cron | Service startup policy not yet approved | Medium | Server deployment, owner operations policy | Yes | Server hardening phase |
| Cloudflare Tunnel/public exposure | Default is LAN-only; public access raises security risk | High | Security review, auth, owner approval | Yes | Remote access decision phase |
| Automated backup | Automation can damage or expose production data if wrong | High | Manual backup process proven, retention policy | Yes | Backup automation design phase |
| Scheduler/publisher/social API | Current publish process is manual evidence-based | High | Platform policy review, credentials, owner approval | Yes | Publishing integration research phase |
| OpenAI runtime automation | Local default avoids paid/live AI runtime behavior | Medium | Cost guard, secrets handling, owner approval | Yes | AI runtime governance phase |
| Queue/worker daemon expansion | Current docs pack does not add runtime behavior | Medium | Operational need, monitoring plan | Yes | Worker hardening phase |
| Monitoring/alerts | Useful later, but not needed for docs freeze | Medium | Deployment target, owner alert preference | Yes | Local ops monitoring phase |

## Current Safe Work

- Docs-only audit.
- Read-only route checks.
- Read-only DB counts.
- Storage listing by filename/size.
- Owner review preparation.

## Execution Work Still Pending

- Deployment.
- Backup.
- Restore.
- Storage copy.
- Cutover.
- Public exposure.
- Runtime automation.
