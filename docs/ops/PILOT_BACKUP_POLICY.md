# Pilot Backup Policy

## Purpose

This document defines the Phase 2H.14 pilot backup policy for Pesona Studio Desk on the controlled pilot stack `psd_pilot` running on `pesona`.

This is a policy document only. It records owner decisions for when pilot backup is required and what must remain outside Git. It does not run backup, restore, restore dry-run, storage copy, deployment, public exposure, or cutover.

## Scope

This policy applies to the controlled pilot stack:

- Server: `pesona`.
- Compose project: `psd_pilot`.
- Pilot web port: `3400`.
- Storage root: `/srv/pesona-studio`.

## Policy Decisions

- Pilot backup must be taken before pilot data is considered important.
- Manual pilot backup is required before any meaningful real content or test campaign data entry.
- Backup artifacts must stay outside Git.
- Restore dry-run for pilot backup is a separate phase.
- Cutover remains blocked.

## Required Pilot Backup Evidence

Each pilot backup evidence record should include:

- Server and repo baseline.
- Git tag, git head, and clean status evidence.
- Compose project name.
- Pilot running container status before and after backup.
- Route check evidence.
- PostgreSQL readiness evidence.
- PostgreSQL custom-format dump evidence.
- PostgreSQL table list and table count evidence.
- Storage archive evidence.
- Checksum file evidence.
- Checksum verification result.
- Storage mount and available-space evidence.
- Explicit statement that no restore, restore dry-run, storage copy, deployment, public exposure, or cutover occurred.

## Artifact Handling

Do not commit any pilot backup artifact to Git, including:

- Backup directories.
- PostgreSQL dump files.
- Tar or archive files.
- Checksum files.
- Route evidence files.
- Container status evidence files.
- Table list or table count evidence files.
- Storage archive lists.
- Env files.
- Secrets.
- Generated media.
- Storage artifacts.

## Restore Policy

- No restore is authorized by pilot backup evidence alone.
- No restore dry-run is authorized by pilot backup evidence alone.
- Any pilot restore dry-run must be a separate isolated phase with explicit owner approval.
- Production restore remains blocked.

## Runtime Policy During Backup

- The pilot stack may remain running during backup when owner executes and accepts the procedure.
- Existing non-PSD containers must not be stopped or modified as part of pilot backup evidence collection.
- Codex must not stop, restart, mutate, or run Docker Compose up/down against server containers.

## Non-Authorizations

This policy does not authorize:

- Production backup.
- Restore or restore dry-run.
- Storage copy.
- Deployment.
- Cutover.
- Public exposure or Cloudflare Tunnel.
- Scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- App/runtime code changes.
- Migration file changes.
- `scripts/prepare-test-db.mjs` changes.

## Next Safe Phase

Recommended next safe phase: pilot backup restore dry-run planning in a separate isolated environment, or controlled pilot review evidence.

That next phase is not cutover. Cutover remains blocked until owner Go/No-Go and explicit cutover approval exist.
