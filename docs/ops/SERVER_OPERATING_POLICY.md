# Server Operating Policy

## Purpose

This document defines the Phase 2H.12 operating policy draft for running Pesona Studio Desk on the local-first server candidate `pesona`.

This is policy documentation only. It does not start, stop, deploy, expose, back up, restore, or cut over any runtime.

## Operating Principle

- Pesona Studio Desk remains local-first for the MVP.
- The server is used during working hours unless owner approves a different schedule.
- Operator actions should preserve data first and avoid destructive cleanup.
- Manual operation is preferred until the owner approves automation.

## Access Policy

- Access is LAN/Tailscale only.
- Router port forwarding is not approved.
- Cloudflare Tunnel or any public tunnel is not approved unless owner grants separate approval.
- Public exposure requires a separate security and operations decision.

## Port Policy

- Avoid conflicts with existing containers that use ports `3010`, `3020`, and `3030`.
- Smoke and pilot ports must be documented separately before use.
- Any service binding to `0.0.0.0` must be treated as visible to LAN/Tailscale and reviewed before pilot use.

## Data Policy

- No secrets in Git, chat, screenshots, or docs.
- No env values committed.
- Working storage is under `/srv/pesona-studio`.
- Test/demo media must remain separate from real operational media.
- Production/customer data must not be introduced into isolated smoke or dry-run environments without explicit owner approval.

## Backup Policy Draft

- Manual backup is required before pilot data is treated as important.
- Backup evidence is required before any production-like use.
- Restore dry-run evidence is required before cutover.
- Backup files, dump files, tar archives, checksum files, and restore evidence files must not be committed to Git.

## Runtime Policy

- Manual start/stop remains the default until autostart is separately approved.
- Do not run `docker compose down -v` during normal operation.
- Do not remove Docker volumes during normal operation.
- Do not delete storage paths during normal operation.
- Do not stop, restart, or mutate unrelated existing containers.

## Media Policy

- Test/demo media must remain separate from real operational media.
- Real footage requires storage discipline: clear folder placement, no casual rename/delete, and backup planning before important use.
- Generated media and operational media must not be committed to Git.

## Incident And Rollback Notes

If a pilot runtime has an incident:

- Stop the affected stack if owner/operator approves.
- Preserve volumes.
- Preserve storage paths.
- Collect logs and route evidence.
- Record the time, operator, command, and result.
- Do not run destructive cleanup without owner approval.

## Explicit Non-Authorizations

This policy does not authorize:

- Deployment or cutover.
- Public exposure, Cloudflare Tunnel, or router port forwarding.
- Production backup, restore, or restore dry-run execution.
- Storage copy.
- Scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- Docker Compose up/down execution by Codex.
- Container mutation by Codex.
- App/runtime code changes.
- Migration file changes.
- `scripts/prepare-test-db.mjs` changes.

## Review Trigger

Review this policy before any controlled pilot start, production-like backup, public access decision, autostart setup, or cutover Go/No-Go.
