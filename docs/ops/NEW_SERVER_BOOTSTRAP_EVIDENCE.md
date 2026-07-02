# New Server Bootstrap Evidence

## Purpose

This document records Phase 2H.7 owner-provided bootstrap evidence for the new native Ubuntu server candidate named `pesona`.

This is evidence intake only. No command in this phase was run on the Lenovo server or on the new `pesona` server by Codex. This document does not authorize runtime smoke, backup, restore, storage copy, deployment, public exposure, or cutover.

## Scope And Non-Goals

In scope:

- Record owner-provided identity, OS, CPU, RAM, storage, network, Docker, GPU, repo, env, and Compose config evidence.
- Record accepted limitations and HOLD items.
- Record the next safe phase boundary.

Out of scope and not authorized:

- Running commands on Lenovo or on the new `pesona` server.
- `docker compose up`.
- Runtime smoke.
- Backup execution.
- Restore execution or restore dry-run execution.
- Storage copy.
- Deployment.
- Cutover.
- App/runtime code, migrations, worker code, or `scripts/prepare-test-db.mjs` changes.
- Stopping, restarting, or modifying existing containers.
- Public exposure, Cloudflare Tunnel, scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- Committing secrets, `.env.local` values, API keys, database URLs, tokens, passwords, dumps, screenshots with secrets, operational media, or generated media.

## Server Identity

| Item | Evidence |
| --- | --- |
| Hostname | `pesona` |
| Platform | Native Ubuntu, not WSL |
| OS | Ubuntu 22.04.5 LTS |
| Kernel | `5.15.0-185-generic` |
| Session evidence | Owner evidence included both root session and `pesona` user session |

## CPU And RAM

| Item | Evidence |
| --- | --- |
| CPU | Intel Core i5-13400F |
| Logical threads | `16` |
| Core count | `10` |
| RAM | About `15Gi` visible |
| Owner RAM decision | Proceed with 16GB RAM for initial use; upgrade to 32GB later if the content system proves it generates leads and converts to orders |
| RAM status | ACCEPTED WITH LIMIT, not blocking initial smoke or initial operation |

## Storage Evidence

### NVMe Root Disk

| Item | Evidence |
| --- | --- |
| Device | `nvme0n1` |
| Size | `476.9G` |
| Role | Ubuntu root LVM |
| Root free space | `/` has about `429G` free |
| SMART status | PASSED |
| Percentage used | `6%` |
| Media/Data Integrity Errors | `0` |

### SATA SSD Work Storage

| Item | Evidence |
| --- | --- |
| Device | `/dev/sdb` |
| Serial | `TSM25522308173` |
| Preparation | Intentionally wiped, repartitioned, and formatted by owner before evidence intake |
| Partition | `/dev/sdb1` |
| Filesystem | `ext4` |
| Label | `PSD_WORK` |
| UUID | `0d68422c-b2b0-44d4-8c93-56d57e624b66` |
| Mount point | `/srv/pesona-studio` |
| fstab | Entry present |
| Mount options | `rw,noatime` |
| Space | About `469G` total and `445G` available |
| Ownership | `pesona:docker` |
| Permissions | `775` |
| SMART status | PASSED |
| Reallocated/Pending/Uncorrectable | `0` |

Owner evidence recorded these directories under `/srv/pesona-studio`:

- `/srv/pesona-studio/repos`
- `/srv/pesona-studio/storage`
- `/srv/pesona-studio/backups`
- `/srv/pesona-studio/tmp`
- `/srv/pesona-studio/storage/footage`
- `/srv/pesona-studio/storage/draft-videos`
- `/srv/pesona-studio/storage/approved-videos`

### HDD Archive Candidate

| Item | Evidence |
| --- | --- |
| Device | `/dev/sda` |
| Model | `ST1000DM010-2EP1` |
| Size/class | HDD 1TB |
| Current partition role | NTFS Data partition |
| SMART overall-health | PASSED |
| Current status | Candidate for backup/archive, not active working storage |

## Package Maintenance Warning

Owner evidence noted that `apt update` showed a Cloudflare repository GPG warning. `smartmontools` still installed successfully from the Ubuntu repository.

Status: maintenance warning remains open. This warning is not accepted as a blocker for docs-only evidence intake, but it should be resolved before relying on that third-party repository for server maintenance.

## Network And Tailscale

| Item | Evidence |
| --- | --- |
| LAN IP | `192.168.1.76` |
| Tailscale IP | `100.120.79.33` |
| Tailscale status | Active |
| Public exposure | Not approved |

## Docker Non-Sudo Access

Docker access for user `pesona` is recorded as PASS.

Owner evidence:

- `groups` included `pesona adm cdrom sudo dip plugdev lxd docker`.
- `docker ps` worked without sudo.

Existing containers observed by owner:

| Container | Port binding |
| --- | --- |
| `growth_os_app` | `0.0.0.0:3010->3000` |
| `wablast1_app` | `0.0.0.0:3020->3000` |
| `wablast2_app` | `0.0.0.0:3030->3000` |

These containers were not stopped, restarted, modified, or inspected by Codex in this phase.

## GPU Evidence

| Item | Evidence |
| --- | --- |
| PCI detection | NVIDIA GPU detected as `NVIDIA Device 2582` |
| `nvidia-smi` | Not available |
| Recommended driver | `nvidia-driver-595-open` |
| Status | HOLD |

GPU driver readiness is not required for initial runtime smoke.

## Repo Evidence

| Item | Evidence |
| --- | --- |
| Final repo path | `/srv/pesona-studio/repos/pesona-studio-desk` |
| Clone method | HTTPS |
| Remote URL | `https://github.com/rinoprabu17-creator/pesona-studio-desk.git` |
| Checked out tag | `phase-2h6-complete` |
| HEAD | `3de1646` |
| `origin/main` | `3de1646` |
| `origin/HEAD` | `3de1646` |
| Local `main` | `3de1646` |
| Git status | Clean |
| Server baseline state | Detached HEAD at release tag is acceptable for server baseline |

## Env And Compose Evidence

| Item | Evidence |
| --- | --- |
| Env template handling | `.env.local` created from `.env.local.example` |
| Git ignore | `.env.local` ignored by git |
| Git tracking | `.env.local` not tracked |
| Env values | Not pasted and not recorded |
| Compose config | `docker compose config --quiet` passed with exit code `0` |
| Runtime start | Not executed |

Compose services present in owner evidence:

- `postgres`
- `redis`
- `n8n`
- `video-worker`
- `web-app`
- `campaign-planner-worker`
- `mockup-worker`

Compose volumes present in owner evidence:

- `postgres_data_dev`
- `redis_data_dev`
- `n8n_data_dev`

## Outcome

New Ubuntu server candidate bootstrap is a strong PASS for:

- CPU.
- Native Ubuntu OS.
- Docker non-sudo access.
- Work storage mount.
- Repo bootstrap.
- Env template handling.
- Compose config validation.

Accepted limitation:

- 16GB RAM is accepted for initial use with owner-stated upgrade path to 32GB if the content system proves lead and order conversion.

HOLD:

- GPU driver.
- Runtime smoke.
- Backup evidence.
- Restore dry-run.
- Cutover.

Lenovo remains partial PASS with hardware/storage HOLD. The new `pesona` server candidate may replace Lenovo as the target server only after later validation and explicit owner approval.

## What Was Not Executed

- No Lenovo command.
- No new server command by Codex.
- No `docker compose up`.
- No runtime smoke.
- No backup.
- No restore.
- No restore dry-run execution.
- No storage copy.
- No deployment.
- No cutover.
- No existing container stop, restart, or modification.
- No public exposure.
- No Cloudflare Tunnel.
- No scheduler, publisher, social API, upload automation, OpenAI live runtime, queue expansion, or worker daemon expansion.
- No app/runtime code change.
- No migration change.
- No `scripts/prepare-test-db.mjs` change.
- No env value, API key, database URL, token, password, dump, screenshot with secret, operational media, or generated media committed.

## Next Safe Phase

Next safe phase: explicit Docker non-sudo verification and isolated server runtime smoke planning for the new `pesona` server.

That next phase must remain gated and must not be treated as cutover. Runtime smoke, backup, restore dry-run, storage copy, deployment, public exposure, and cutover each require explicit owner approval before execution.
