# Local Storage

Folder ini adalah storage kerja lokal Pesona Studio Desk pada runtime local-first.

Subfolder:

- `footage`: footage masuk dari petugas.
- `draft-videos`: output draft render video.
- `approved-videos`: video yang sudah siap dipakai/posting manual.
- `mockups`: output mockup awal.
- `brand-assets`: logo, warna, dan aset brand operasional.

Isi subfolder diabaikan dari git. File `.gitkeep` hanya menjaga struktur folder.

Google Drive hanya untuk backup/sharing penting, bukan working directory utama. Jangan hapus isi storage, Docker volume, atau database tanpa backup dan approval owner.
