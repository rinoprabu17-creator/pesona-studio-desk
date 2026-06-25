# Backup Restore Sequence Gate

## Purpose

This gate defines the safe order from backup evidence through cutover. It prevents skipping directly from office server readiness to restore, storage copy, deployment, public exposure, or cutover.

Phase 2H.2 is planning only.

## Required Sequence

1. Backup evidence accepted.
2. Restore dry-run planning.
3. Restore dry-run execution in a separate test environment.
4. Storage copy plan.
5. Rollback plan.
6. Cutover Go/No-Go.
7. Actual cutover.

## Gate Details

| Step | Required Evidence | May Proceed When |
| --- | --- | --- |
| Backup evidence accepted | Owner-approved backup source, destination, operator, release tag, secrets exclusion | Owner signs or explicitly accepts backup evidence. |
| Restore dry-run planning | Separate test target, active DB safety confirmation, expected route checks | Owner approves plan. |
| Restore dry-run execution | Restore evidence from separate test environment only | Dry-run passes and owner accepts result. |
| Storage copy plan | Source, target, timing, media handling policy, rollback impact | Owner approves plan. |
| Rollback plan | Known restore path and owner decision process | Owner accepts rollback risk. |
| Cutover Go/No-Go | Final owner decision and responsible staff | Owner signs Go. |
| Actual cutover | Prior gates complete | Execution phase approved separately. |

## Explicit Non-Authorization

Phase 2H.2 does not authorize:

- backup execution,
- restore execution,
- restore dry-run execution,
- restore over an active database,
- storage copy,
- deployment,
- public exposure,
- Cloudflare Tunnel,
- systemd, cron, or autostart setup,
- scheduler, publisher, social API, OpenAI runtime automation, upload automation, queue expansion, or worker daemon changes,
- actual cutover.

## Stop Conditions

Stop and hold if:

- backup evidence is incomplete,
- evidence contains secrets,
- `.env` or `.env.local` is proposed for backup into git/chat/public Drive,
- raw operational media is proposed for chat/git,
- database dumps are proposed for git/chat,
- restore target is not clearly separate from active/local production,
- storage scope is unclear,
- owner approval is missing,
- a destructive command is proposed.

## Owner Decision Rule

Each gate is an operational/business decision. Passing one gate does not automatically trigger the next gate. No script, job, service, or automation is created by this document.
