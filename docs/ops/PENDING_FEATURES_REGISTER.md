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

## Phase 2H.1 Readiness Status

Owner reported these office server prerequisites as checked and OK:

- Ubuntu Server.
- Docker Engine + Compose plugin.
- Storage path to SSD 2TB.
- LAN access.
- UPS/power.

This status supports the next gated evidence step only. It does not remove the pending status of backup execution, restore dry-run, storage copy, deployment, cutover, public exposure, autostart/systemd/cron setup, automated backup, scheduler/publisher/social API activation, OpenAI runtime automation, queue expansion, or worker daemon changes.

## Phase 2H.2 Backup Evidence Planning Status

Phase 2H.2 adds backup evidence planning only:

- Backup sources to verify later.
- Backup destination options.
- Redacted evidence fields.
- Backup acceptance checklist.
- Sequence gate from accepted backup evidence through cutover.

This does not remove the pending status of backup execution, restore dry-run execution, storage copy, deployment, cutover, public exposure, autostart/systemd/cron setup, automated backup, scheduler/publisher/social API activation, OpenAI runtime automation, queue expansion, or worker daemon changes.

## Phase 2H.3 Backup Evidence Collection Pack Status

Phase 2H.3 adds collection templates only:

- Backup evidence collection rules.
- Safe paste and redaction guidance.
- PostgreSQL, Redis, storage, repo/tag, and destination evidence fields.
- Checksum/hash placeholder.
- Acceptance and owner review checklists.

This does not execute backup and does not remove the pending status of backup execution, restore dry-run planning/execution, storage copy, deployment, cutover, public exposure, autostart/systemd/cron setup, automated backup, scheduler/publisher/social API activation, OpenAI runtime automation, queue expansion, or worker daemon changes.

## Phase 2H.4 Office Server Bootstrap Verification Status

Phase 2H.4 adds a controlled bootstrap verification checklist only:

- OS, kernel, Docker, and Docker Compose evidence fields.
- Repo branch/tag/status evidence fields.
- SSD mount path and free disk space evidence fields.
- LAN-only and redacted IP evidence fields.
- `.env.local` existence and git tracking yes/no checks only.
- Docker Compose config pass/fail evidence.

This does not execute backup, restore, restore dry-run execution, storage copy, deployment, cutover, public exposure, autostart/systemd/cron setup, automated backup, scheduler/publisher/social API activation, OpenAI runtime automation, upload automation, queue expansion, or worker daemon changes.

## Phase 2H.5 Office Server Bootstrap Evidence Intake Status

Phase 2H.5 records owner-provided Lenovo bootstrap evidence only:

- Actual Lenovo server identity evidence.
- RAM evidence with 32GB target HOLD.
- Disk/storage evidence with 2TB SSD target HOLD.
- Docker Engine, Docker Compose, and non-sudo Docker access evidence.
- Existing container `0.0.0.0` bind caution without modification.
- Repo baseline at tag `phase-2h4-complete`, HEAD `2796057`, clean status.
- `.env.local` placeholder/template handling evidence without values.
- Docker Compose config pass evidence with storage warning.

Lenovo bootstrap is partial PASS with hardware/storage HOLD. This does not execute backup, restore, restore over active DB, restore dry-run execution, MP4/media read/copy/move/edit/rename/delete, storage copy, deployment, cutover, runtime smoke, `docker compose up`, public exposure, autostart/systemd/cron setup, automated backup, scheduler/publisher/social API activation, OpenAI runtime automation, upload automation, queue expansion, worker daemon changes, or existing Lenovo container changes.

## Phase 2H.6 Local Visual Demo Evidence Intake Status

Phase 2H.6 records laptop-only visual demo evidence:

- Docker Compose project `psd_visual_demo`.
- Host app URL `http://localhost:3300`.
- Synthetic demo content flow from calendar to controlled smoke draft render.
- Preflight result `ready`.
- Render attempt status `succeeded`.
- Approved/publish flow remained manual and inactive.
- `/approved-videos` showed no approved video.
- Host-port curl inconsistency warning with internal route checks returning HTTP 200.
- Demo env and generated demo media ignored and not committed.

This is not Lenovo readiness evidence, not production migration evidence, and not cutover evidence. It does not execute backup, restore, restore dry-run execution, storage copy, deployment, cutover, public exposure, social API activation, scheduler/publisher activation, upload automation, OpenAI live runtime, queue expansion, worker daemon expansion, or production/customer data/media use.

## Phase 2H.7 New Server Bootstrap Evidence Intake Status

Phase 2H.7 records owner-provided evidence for the new native Ubuntu server candidate named `pesona`:

- Native Ubuntu 22.04.5 LTS, kernel `5.15.0-185-generic`.
- Intel Core i5-13400F with 10 cores and 16 logical threads.
- RAM about `15Gi`; owner accepted 16GB with limit for initial use and deferred 32GB until the content system proves lead/order conversion.
- NVMe root disk SMART PASS and SATA SSD work storage mounted at `/srv/pesona-studio` with ext4 label `PSD_WORK`.
- HDD 1TB SMART PASS, candidate for backup/archive only.
- LAN and Tailscale evidence recorded; public exposure not approved.
- Docker non-sudo access for user `pesona` recorded as PASS.
- Existing unrelated containers were observed by owner but not stopped, restarted, or modified.
- Repo cloned at `/srv/pesona-studio/repos/pesona-studio-desk`, checked out at tag `phase-2h6-complete`, HEAD `3de1646`, clean status.
- `.env.local` created from template, ignored, and not tracked; env values were not pasted.
- `docker compose config --quiet` passed, but `docker compose up` was not executed.

New server bootstrap is a strong PASS for CPU, OS, Docker, storage mount, repo, env handling, and Compose config. GPU driver, runtime smoke, backup evidence, restore dry-run, and cutover remain HOLD. This phase does not execute server commands by Codex, backup, restore, restore dry-run execution, storage copy, deployment, cutover, public exposure, Cloudflare Tunnel, scheduler/publisher/social API activation, OpenAI live runtime, upload automation, queue expansion, worker daemon expansion, or existing container changes.

## Current Safe Work

- Docs-only audit.
- Read-only route checks.
- Read-only DB counts.
- Storage listing by filename/size.
- Owner review preparation.
- New server Docker non-sudo verification and isolated runtime smoke planning, only after explicit owner approval.

## Execution Work Still Pending

- Deployment.
- Backup.
- Restore.
- Storage copy.
- Cutover.
- Public exposure.
- Runtime automation.
