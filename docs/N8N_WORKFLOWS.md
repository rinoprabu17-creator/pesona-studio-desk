# n8n Workflows — Outline MVP

n8n bertugas sebagai orchestrator, bukan editor video dan bukan database utama.

## Workflow A — Local Footage Watcher

Trigger:

- Cron setiap 5 menit, atau filesystem watcher jika sudah siap.

Steps:

1. List file baru di folder storage lokal campaign.
2. Cocokkan folder dengan `content_code`.
3. Kirim file metadata ke API Studio Desk.
4. Panggil job `footage-intake-qa`.
5. Update status footage.

## Workflow B — Auto Generate Script

Trigger:

- Content item baru dengan status `Planned`.

Steps:

1. Ambil content item.
2. Ambil campaign knowledge base.
3. Panggil Script & Shot List Agent.
4. Simpan script dan shot list.
5. Ubah status ke `Waiting Footage`.

## Workflow C — Render Video Draft

Trigger:

- Content item memiliki footage usable minimum.

Steps:

1. Panggil Video Director Agent.
2. Simpan edit plan.
3. Push job ke queue render worker.
4. Tunggu callback worker.
5. Simpan path/output lokal dan backup/share link jika ada.
6. Ubah status ke `Draft Ready`.

## Workflow D — Revision Render

Trigger:

- Approval status `Revision Requested`.

Steps:

1. Ambil revision notes.
2. Panggil Video Director Agent dengan notes.
3. Push render job v2.
4. Simpan output baru.
5. Status kembali `Draft Ready`.

## Workflow E — Posting Reminder

Trigger:

- Content approved dan scheduled_at mendekati waktu posting.

Steps:

1. Kirim notifikasi ke admin.
2. Tampilkan link MP4 dan caption.
3. Setelah admin posting, admin input URL.
4. Status `Posted`.

## Workflow F — Mockup Render

Trigger:

- Admin klik Generate Mockup.

Steps:

1. Panggil Mockup Assistant Agent.
2. Push job ke Mockup Render Worker.
3. Simpan output PNG/JPG.
4. Status `Mockup Ready`.
