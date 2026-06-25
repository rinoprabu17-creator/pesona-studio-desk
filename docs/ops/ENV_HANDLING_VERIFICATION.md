# Env Handling Verification

## Purpose

This checklist confirms environment file handling without exposing secrets before any real office server deployment or cutover.

This document must not contain actual env values.

## Allowed Checks

- Confirm `.env.local` exists on the office server.
- Confirm `.env.local` is untracked or ignored by git.
- Confirm owner provides values privately.
- Confirm defaults remain safe unless owner approves a provider mode change.
- Confirm provider/live credentials are not enabled accidentally.

## Not Allowed

- Do not paste env values into chat.
- Do not commit `.env`, `.env.local`, or any copied secret file.
- Do not store env files in public Google Drive folders.
- Do not expose the dashboard publicly.
- Do not enable paid/live provider mode without owner approval.
- Do not paste database URLs, API keys, tokens, passwords, or service credentials into docs.

## Evidence Checklist

| Item | Yes / No | Evidence / Notes |
| --- | --- | --- |
| `.env.local` exists | Owner/technician to fill | Confirm presence only. |
| `.env.local` is git ignored/untracked | Owner/technician to fill | Do not print values. |
| No env values pasted into evidence | Owner/technician to fill | Evidence must be safe to share. |
| Owner provided values privately | Owner/technician to fill | No credentials in chat/docs/git. |
| Provider mode remains safe | Owner/technician to fill | No OpenAI/social/live provider without approval. |
| Dashboard remains LAN-only | Owner/technician to fill | No public exposure by default. |

## Safe Evidence Examples

Use short statements like:

- `.env.local exists: yes`
- `.env.local tracked by git: no`
- `Secrets pasted into evidence: no`
- `Provider mode approved by owner: no`

Do not include actual values after `DATABASE_URL=`, `OPENAI_API_KEY=`, internal tokens, passwords, or provider credentials.

## Hold Rule

If env handling is uncertain, hold cutover. Resolve the handling issue before backup, restore dry-run, storage copy, deployment, or public exposure.
