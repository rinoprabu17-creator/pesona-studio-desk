# Office Server Network And Storage Checklist

This checklist prepares the office server environment before cutover. It does not perform cutover, backup, restore, deployment, or storage copy.

## LAN Access Assumptions

- Default access is LAN-only.
- Admins access the dashboard from office network devices.
- No public internet exposure by default.
- Cloudflare Tunnel or reverse proxy is only considered later if owner approves.

## Server Local IP Checklist

- Server has a stable local IP or DHCP reservation.
- Owner/admin records the local IP.
- Admin devices can reach the server on LAN.
- The IP plan does not expose the dashboard outside the office by default.

## Firewall Checklist

- Only required LAN ports are reachable.
- Public inbound access is blocked by default.
- Remote admin access is limited to owner-approved users.
- n8n and web dashboard are not exposed publicly.
- Any tunnel or public access requires owner approval and a separate security review.

## User Access Checklist

- Admin account exists for maintenance.
- Owner/admin knows who has shell access.
- Shared credentials are avoided.
- Access changes are recorded.
- Former staff access is removed by owner/admin policy.

## Storage Directory Checklist

- Runtime storage path is on SSD working storage.
- Storage folders are not treated as git content.
- Storage folders are not primary-synced to Google Drive.
- Google Drive is backup/sharing only.
- Storage permissions are compatible with Docker bind mounts.

Expected app storage areas:

- `storage/footage`
- `storage/draft-videos`
- `storage/approved-videos`
- `storage/mockups`
- `storage/brand-assets`

## SSD Mount Checklist

- SSD target is 2TB.
- Mount path is documented.
- Free space is reviewed before rehearsal.
- Mount survives reboot.
- Owner/admin confirms whether storage path should be symlinked or bind mounted.
- No storage deletion is performed during rehearsal planning.

Safe checks:

```bash
df -h
lsblk
mount
ls -la storage
```

## UPS And Power Checklist

- UPS is installed or procurement is pending.
- Server power cable is connected to UPS.
- Network equipment dependency is understood.
- Owner/admin knows shutdown procedure.
- Sudden power loss risk is recorded if UPS is not ready.

## Disk Space Monitoring Checklist

- Review `df -h` before heavy content work.
- Review storage folder size weekly.
- Do not delete footage/video outputs without owner approval and backup evidence.
- Do not commit generated MP4/source files to git.

Safe checks:

```bash
df -h
du -sh storage
du -sh storage/footage storage/draft-videos storage/approved-videos
```

## What Not To Store In Git

- `.env` or `.env.local`
- Database dumps
- Source footage
- Draft MP4 files
- Approved MP4 files
- Generated mockups
- Service credentials
- Customer private files not explicitly approved for git

## What Not To Store In Public Drive Folders

- Env files
- API keys
- tokens
- Database credentials
- Service account files
- Private customer data without owner-approved access policy
- Production database dumps unless owner approves the folder and access control
