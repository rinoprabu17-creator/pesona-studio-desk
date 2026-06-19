# Video Render Spec

## Tujuan

Membuat draft video MP4 otomatis dari footage produk, template, text overlay, dan CTA.

## Output video draft

- Format: Vertical 9:16
- Durasi umum: 15–30 detik
- Format file: MP4
- Include text overlay
- Include CTA keyword
- Include caption draft
- Include thumbnail/cover text

## Video templates MVP

1. Mockup Magnet
   - CTA: MOCKUP
   - Fokus: nama sekolah tampil di sampul

2. Desain Gratis
   - CTA: DESAIN
   - Fokus: desain final gratis setelah cocok penawaran

3. DP Setelah Desain OK
   - CTA: RAPORT / IJAZAH
   - Fokus: customer aman sebelum DP

4. Bukti Produk / Proses
   - CTA: HARGA / KATALOG
   - Fokus: bahan, foil, QC, packing

5. Agen / Pemasar Daerah
   - CTA: AGEN
   - Fokus: peluang jualan untuk jaringan sekolah

6. Pain Point Response
   - CTA dinamis
   - Fokus: tepat waktu, slow response, foil pudar, garansi, luar daerah

## Edit plan JSON

Render worker menerima data seperti:

```json
{
  "content_id": "SR-D01-MOCKUP",
  "template": "mockup_magnet_v1",
  "format": "9:16",
  "duration_seconds": 18,
  "scenes": [
    {
      "scene": 1,
      "clip_file_id": "drive_clip_001",
      "clip_start": 0,
      "clip_end": 3,
      "overlay_text": "Mau lihat nama sekolahmu tampil di Sampul Raport?",
      "overlay_position": "top"
    },
    {
      "scene": 2,
      "clip_file_id": "drive_clip_002",
      "clip_start": 0,
      "clip_end": 5,
      "overlay_text": "Mockup awal gratis",
      "overlay_position": "center"
    },
    {
      "scene": 3,
      "clip_file_id": "drive_clip_003",
      "clip_start": 0,
      "clip_end": 6,
      "overlay_text": "Ketik MOCKUP di komentar",
      "overlay_position": "bottom"
    }
  ],
  "caption": "...",
  "cover_text": "Mockup Sampul Raport Gratis"
}
```

## Revision flow

Jika reviewer klik revisi:

- Simpan catatan revisi.
- Buat versi render baru: v2, v3, dst.
- Jangan hapus video lama.
- Status kembali `Draft Ready` setelah render ulang.
