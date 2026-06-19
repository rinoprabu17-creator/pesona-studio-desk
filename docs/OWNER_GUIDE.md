# Owner Guide — Cara Owner Mengarahkan Pembangunan

## Prinsip kerja owner

Owner tidak perlu coding. Owner bertugas menjaga arah produk.

Tugas owner:

- Menentukan prioritas fase.
- Mengecek apakah fitur sesuai alur bisnis nyata.
- Memberi contoh konten/footage/mockup.
- Approve hasil tiap fase.
- Menolak fitur yang tidak perlu.

## Jangan minta Codex membangun semua sekaligus

Gunakan prompt fase dari `prompts/CODEX_TASK_PROMPTS.md` satu per satu.

Urutan aman:

1. Setup repo
2. Data model
3. Campaign Calendar
4. Script & Shot List
5. Footage Inbox
6. Video Render Worker Stub
7. Approval Board
8. Posting Scheduler
9. Mockup Generator
10. Lead Log Ringan
11. n8n Integration Skeleton

## Pertanyaan yang harus owner jawab di setiap fase

- Fitur ini membantu pekerjaan nyata atau cuma terlihat canggih?
- Apakah manusia tetap punya titik approval?
- Apakah fitur ini menambah beban admin?
- Apakah fitur ini harus masuk Growth OS Lite atau cukup di Studio Desk?
- Apakah fitur ini bisa dipangkas dulu?

## Checklist sebelum lanjut fase berikutnya

- Bisa login dan akses fitur.
- Data tersimpan.
- Status workflow jelas.
- Error tidak membuat sistem rusak.
- Tim manusia paham cara pakai.
- Tidak ada fitur liar di luar scope.

## Batas komunikasi ke customer

Mockup awal:

```text
Preview awal, tidak ada revisi.
```

Desain final:

```text
Gratis setelah cocok penawaran, bisa revisi sampai Desain OK.
```

DP:

```text
DP setelah desain final disetujui.
```

Garansi:

```text
Produk cacat produksi diganti baru, bukan repair.
```

Klise:

```text
Gratis klise untuk order di atas 100 eksemplar setelah Desain OK.
```

Ongkir:

```text
Gratis ongkir untuk Kota Medan.
```
