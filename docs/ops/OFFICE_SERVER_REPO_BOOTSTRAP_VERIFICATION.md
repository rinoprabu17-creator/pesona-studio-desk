# Office Server Repo Bootstrap Verification

## Purpose

This checklist verifies that the Pesona Studio Desk repository can be prepared on the office server without deployment cutover, data restore, storage copy, or public exposure.

The checks below are read-only or configuration validation checks. They do not restore data, mutate the database, copy MP4 files, start publishing, schedule posts, call social APIs, call OpenAI, or cut over operations.

## Target Release Tag

Future server setup should use:

- `phase-2g6-complete`, or
- a later owner-approved tag.

Do not treat a branch checkout as production-ready unless owner approval confirms the exact tag/branch.

## Safe Repo Checks

Run only after the repo is cloned/pulled with owner approval. Do not paste secrets.

```bash
git branch --show-current
git tag --points-at HEAD
git status --short
git log --oneline --decorate -6
docker compose --env-file .env.local -f docker-compose.dev.yml config --quiet
```

## Expected Evidence

| Check | Expected Result | Evidence |
| --- | --- | --- |
| Current branch | Owner-approved branch or detached release tag | Owner/technician to fill |
| Tag at HEAD | `phase-2g6-complete` or later owner-approved tag | Owner/technician to fill |
| Git status | No unexpected app/runtime changes | Owner/technician to fill |
| Recent log | Shows expected release baseline | Owner/technician to fill |
| Compose config | Resolves successfully | Owner/technician to fill |

## Git Safety

- No generated storage or MP4 files should be staged.
- No `.env`, `.env.local`, database dumps, credentials, screenshots with secrets, or operational media should be committed.
- Do not commit technician evidence unless owner asks.
- Do not push from the office server unless owner explicitly approves.

## Cutover Boundary

Repo bootstrap verification is not deployment cutover. It does not approve:

- backup execution,
- restore dry-run,
- restore over any active database,
- storage copy,
- autostart setup,
- public internet exposure,
- scheduler/publisher/social API activation,
- OpenAI runtime automation,
- queue or worker daemon expansion.
