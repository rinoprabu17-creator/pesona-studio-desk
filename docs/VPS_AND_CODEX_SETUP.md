# VPS & Codex Setup Notes

## Rekomendasi cara kerja

Gunakan VPS sebagai development/staging server. Jangan langsung utak-atik production tanpa backup.

## Struktur folder VPS

```text
/opt/pesona/
  studio-desk/
    repo aplikasi
  backups/
    database backup
  logs/
```

## User Linux

Jangan bekerja sebagai root terus-menerus.

Buat user misalnya:

```text
pesona
```

## Tool utama di VPS

- Git
- Docker
- Docker Compose
- Codex CLI opsional tapi disarankan jika owner ingin Codex bekerja langsung di VPS
- tmux opsional untuk session terminal yang tidak putus

## Codex di VPS

Codex CLI berguna jika:

- Codex perlu membaca repo langsung di VPS.
- Codex perlu menjalankan command build/test/docker.
- Owner ingin memberi prompt langsung dari terminal VPS.

Codex CLI tidak wajib jika:

- Owner memakai Codex App/IDE di laptop.
- Codex bekerja lewat GitHub/Codex Cloud.
- VPS hanya menarik hasil code dari Git.

## Safety rule

- Selalu pakai Git.
- Buat branch per fitur.
- Commit sebelum dan sesudah perubahan besar.
- Backup database sebelum migration besar.
- Jangan taruh `.env` di Git.
- Jangan beri Codex akses root tanpa perlu.
- Jangan expose n8n tanpa password/HTTPS.
