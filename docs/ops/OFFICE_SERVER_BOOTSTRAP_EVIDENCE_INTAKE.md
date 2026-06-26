# Office Server Bootstrap Evidence Intake

## Purpose

This document records owner-provided Lenovo Ubuntu server bootstrap evidence for Phase 2H.5. It is an evidence intake record only, created from pasted terminal output and owner statements.

The result is a partial bootstrap PASS with hardware/storage HOLD. It does not approve runtime, deployment, storage copy, backup, restore, restore dry-run execution, public exposure, or cutover.

## Scope And Non-Goals

In scope:

- Record server identity evidence.
- Record RAM and storage evidence.
- Record Docker installation and non-sudo Docker access evidence.
- Record existing container exposure caution.
- Record repository baseline evidence.
- Record `.env.local` handling evidence without values.
- Record Docker Compose config evidence.
- Preserve blockers and next allowed steps.

Out of scope and not authorized:

- Backup execution.
- Restore execution.
- Restore dry-run execution.
- Restore over active DB.
- MP4/media content read, copy, move, edit, rename, or delete.
- Storage copy.
- Deployment.
- Cutover.
- `docker compose up`.
- Stopping, changing, restarting, or modifying existing Lenovo containers.
- `systemd`, cron, autostart, public exposure, Cloudflare Tunnel, scheduler, publisher, social API, OpenAI runtime automation, upload automation, queue expansion, or worker daemon changes.
- App/runtime code changes.
- Database migrations.
- Changes to `scripts/prepare-test-db.mjs`.
- Secrets, `.env`, `.env.local` values, API keys, database URLs, tokens, passwords, dumps, screenshots with secrets, or operational media.

## Evidence Source Statement

The evidence below comes from owner-provided Lenovo terminal output pasted into chat and owner statements about purchased hardware. Codex did not log in to the Lenovo server, did not execute server runtime commands, did not access operational media, and did not run backup, restore, restore dry-run execution, storage copy, deployment, `docker compose up`, or cutover.

Network addresses are recorded only as evidence and require caution/redaction in future handoff material.

## Server Identity Evidence

| Item | Evidence | Status |
| --- | --- | --- |
| Terminal identity | Prompt/session indicated actual Lenovo terminal: `pesona@pesona` | PASS |
| Hostname from `uname` | Linux host `pesona` | PASS |
| Kernel | `6.8.0-124-generic` | PASS |
| Architecture | `x86_64` | PASS |
| WSL status | Evidence indicates not WSL2 | PASS |

## RAM Evidence And HOLD Status

| Item | Evidence | Status |
| --- | --- | --- |
| Current memory | `free -h` showed total Mem around `15Gi` | HOLD |
| Target memory | Target is 32GB | HOLD |
| Owner hardware statement | Owner stated 16GBx2 RAM upgrade is purchased/in transit | HOLD |
| Required next validation | Revalidate after RAM is installed | HOLD |

RAM target is not met yet. Bootstrap cannot proceed to runtime smoke, deployment, or cutover from this evidence.

## Disk/Storage Evidence And HOLD Status

| Item | Evidence | Status |
| --- | --- | --- |
| `sda` | `238.5G`, model 256GB SSD | Evidence recorded |
| `sda` role | Contains Ubuntu boot/LVM | Evidence recorded |
| Root LV | `/` is 100G ext4 | Evidence recorded |
| Free VG space | `ubuntu-vg` has about `135.42G` free | Evidence recorded |
| `sdb` | `476.9G`, SATA3 512GB SSD | Evidence recorded |
| `sdb` partitions | Multiple existing partitions including `vfat`, `ntfs`, and `ext4` labelled writable | Evidence recorded |
| 2TB SSD | Not visible yet | HOLD |
| Owner hardware statement | Owner stated 2TB SSD is purchased/in transit but not installed | HOLD |
| Final storage target | Final working storage target remains undefined until 2TB SSD is installed and approved | HOLD |

Do not use the 100G root filesystem or the mixed-partition `sdb` as final Pesona Studio Desk working storage. Docker named volumes should not be started until the 2TB SSD storage plan and mount path are approved, because volumes may land under Docker default storage on the root disk.

## Network Evidence

| Item | Evidence | Status |
| --- | --- | --- |
| LAN/private addresses | `hostname -I` showed addresses including `192.168.1.100` and `192.168.1.44` | Evidence recorded with caution |
| Additional address | `100.125.39.20` was present | Evidence recorded with caution |
| Docker bridge addresses | Docker bridge addresses were present | Evidence recorded with caution |
| Public exposure | Not approved | HOLD |

Address evidence should be redacted or partially redacted in external handoff copies. This is not proof of approved public exposure.

## Docker Evidence

| Item | Evidence | Status |
| --- | --- | --- |
| Docker Engine | Installed, version `29.1.3` | PASS |
| Docker Compose | Installed, version `2.40.3` | PASS |
| Initial non-sudo Docker | `docker ps` without sudo initially failed due permission | Evidence recorded |
| Docker group membership | User `pesona` was added to `docker` group | PASS |
| Current group evidence | `groups` includes `docker` | PASS |
| Current non-sudo Docker | `docker ps` without sudo works | PASS |

Docker non-sudo access status: PASS.

## Existing Container Exposure Caution

Existing containers were visible on the Lenovo server:

| Container | Port Binding Evidence | Action In This Phase |
| --- | --- | --- |
| `growth_os_container` | `0.0.0.0:3010->3000` | Record only |
| `ollama` | `0.0.0.0:11434->11434` | Record only |
| `wa-blast` | `0.0.0.0:3001->3000` | Record only |
| `wa-blast-produksi` | `0.0.0.0:3002->3000` | Record only |

Warning: `0.0.0.0` means binding to all interfaces on the server. This is an exposure caution only, not public exposure approval and not proof that the services are reachable from the public internet.

Do not stop, change, restart, or modify these containers in Phase 2H.5.

## Docker Images And Volumes Evidence

Images present:

- `ollama/ollama:latest`
- `pesona-growth-os-pesona-growth-os:latest`
- `wa-blast-produksi-wa-blast-2:latest`
- `wa-blast-wa-blast-1:latest`

`sudo docker volume ls` showed no Docker volumes at that time. This is evidence only, not an instruction to clean, modify, or create Docker volumes.

## Repo Baseline Evidence

| Item | Evidence | Status |
| --- | --- | --- |
| Clone URL | `https://github.com/rinoprabu17-creator/pesona-studio-desk.git` | PASS |
| Repo path | `/home/pesona/pesona-studio-desk` | PASS |
| Checked out tag | `phase-2h4-complete` | PASS |
| HEAD | `2796057` | PASS |
| Remote/local refs | `origin/main`, `origin/HEAD`, and local `main` at `2796057` | PASS |
| Git status | `git status --short` clean | PASS |
| Detached tag status | Detached HEAD at release tag is acceptable for evidence/read-only server baseline | PASS |

## Env Handling Evidence

| Item | Evidence | Status |
| --- | --- | --- |
| Template exists | `.env.local.example` exists | PASS |
| Initial local env | `.env.local` was initially absent | Evidence recorded |
| Local env creation | `.env.local` was created by copying `.env.local.example` | PASS |
| Git ignore | `.env.local` is ignored by git via `.gitignore` | PASS |
| Git tracking | `git ls-files .env.local` produced no tracked file output | PASS |
| Values pasted | No `.env.local` values were pasted | PASS |
| Provider/live credentials | Not approved | HOLD |

Env handling status: PASS for placeholder/local template only. Provider/live credentials remain not approved.

## Compose Config Evidence

| Item | Evidence | Status |
| --- | --- | --- |
| Config command | `docker compose --env-file .env.local -f docker-compose.dev.yml config --quiet` | PASS |
| Exit result | Passed with exit code 0 | PASS |
| Services resolved | `redis`, `postgres`, `mockup-worker`, `n8n`, `video-worker`, `web-app`, `campaign-planner-worker` | PASS |
| Named volumes resolved | `redis_data_dev`, `n8n_data_dev`, `postgres_data_dev` | PASS with storage warning |

Do not run `docker compose up` until the 2TB SSD storage plan is approved, because named volumes may land under Docker default storage on the root disk.

## Bootstrap Pass/Hold Matrix

| Area | Status | Notes |
| --- | --- | --- |
| Server identity | PASS | Actual Lenovo Ubuntu host evidence recorded. |
| RAM target | HOLD | Current memory around 15Gi; 32GB target not installed/validated. |
| Storage target | HOLD | 2TB SSD not visible; final mount path not defined. |
| Network | HOLD | LAN/private evidence recorded with caution; public exposure not approved. |
| Docker install | PASS | Engine and Compose versions recorded. |
| Docker non-sudo access | PASS | `pesona` group membership includes `docker`; `docker ps` without sudo works. |
| Existing containers | HOLD/CAUTION | Bindings to `0.0.0.0` recorded; no changes authorized. |
| Repo baseline | PASS | Tag `phase-2h4-complete`, HEAD `2796057`, clean status. |
| Env handling | PASS/HOLD | Placeholder `.env.local` handling passes; provider/live credentials not approved. |
| Compose config | PASS/HOLD | Config validates; runtime blocked until storage plan approved. |
| Runtime smoke | NOT RUN | Intentionally not executed in this phase. |
| Backup evidence | NOT ACCEPTED | Backup execution/evidence acceptance remains pending. |
| Restore dry-run | NOT RUN | Intentionally not executed in this phase. |
| Cutover | BLOCKED | Hardware/storage and evidence gates remain open. |

## Blockers

- SSD 2TB not installed/visible.
- RAM 32GB not installed/validated.
- Final storage mount path not defined.
- Runtime smoke not run.
- Backup evidence not accepted.
- Restore dry-run not run.
- Cutover blocked.

## Next Allowed Steps

Allowed next steps remain docs/read-only unless owner separately approves an execution phase:

- Install the purchased 16GBx2 RAM and revalidate memory evidence.
- Install the purchased 2TB SSD and record read-only `lsblk`/disk evidence.
- Define and approve the final storage mount path in docs before any runtime start.
- Update evidence docs with redacted hardware/storage validation after installation.
- Prepare a separate owner-approved phase for backup evidence review/acceptance.
- Prepare a separate owner-approved phase for runtime smoke only after RAM/storage blockers are cleared.

## Explicit Non-Authorization Statement

Phase 2H.5 records evidence only. It does not authorize backup, restore, restore over active DB, restore dry-run execution, storage copy, deployment, public exposure, runtime smoke, `docker compose up`, stopping or modifying existing Lenovo containers, or cutover.
