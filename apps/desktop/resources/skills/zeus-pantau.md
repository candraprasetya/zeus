---
name: zeus-pantau
description: Memantau dan memetakan arsitektur, modul, flow, dan knowledge proyek ke dalam folder .knowledge dengan format Obsidian Flavored Markdown dan JSON Canvas (.canvas). Gunakan untuk menganalisis basis kode, membuat mindmap, dan mengelola knowledge graph proyek.
---

# Zeus Pantau - Obsidian Knowledge & Mindmap Mapping

Skill ini digunakan ketika pengguna menjalankan perintah `/zeus-pantau` atau meminta AI memantau, memetakan, dan mencatat struktur knowledge proyek ke dalam folder `.knowledge/`.

## 1. Lokasi & Standar File Knowledge

Semua hasil analisis dan pemetaan disimpan di dalam direktori `.knowledge/` pada root proyek:
- `.knowledge/graph.canvas`: File JSON Canvas (standar Obsidian Canvas 1.0) yang menghubungkan seluruh node topik, arsitektur, dan relasi sistem.
- `.knowledge/*.md`: Catatan markdown berformat **Obsidian Flavored Markdown** untuk setiap entitas/konsep/modul.
- `.knowledge/INDEX.md`: Peta indeks utama yang merangkum seluruh knowledge nodes dengan wikilinks.

## 2. Struktur JSON Canvas (`.knowledge/graph.canvas`)

File `.canvas` mengikuti standar open JSON Canvas:
```json
{
  "nodes": [
    {
      "id": "16-char-hex-id-1",
      "type": "text",
      "text": "# Core System\nDeskripsi ringkas sistem inti",
      "x": 0,
      "y": 0,
      "width": 260,
      "height": 140,
      "color": "1"
    },
    {
      "id": "16-char-hex-id-2",
      "type": "file",
      "file": ".knowledge/database.md",
      "x": 350,
      "y": 0,
      "width": 260,
      "height": 140,
      "color": "4"
    }
  ],
  "edges": [
    {
      "id": "edge-hex-id-1",
      "fromNode": "16-char-hex-id-1",
      "fromSide": "right",
      "toNode": "16-char-hex-id-2",
      "toSide": "left",
      "label": "persists to"
    }
  ]
}
```

Warna Node Obsidian Canvas (angka 1-6):
- `"1"`: Red / Rose (Highlight / Entry point)
- `"2"`: Orange (Modul / Components)
- `"3"`: Yellow (Logic / Handlers)
- `"4"`: Green (Data / Storage / Database)
- `"5"`: Cyan / Blue (Services / External / API)
- `"6"`: Purple (Models / Schemas / Types)

## 3. Format Catatan Obsidian (`.knowledge/*.md`)

Gunakan frontmatter dan wikilinks:
```markdown
---
title: Database & Persistence
tags:
  - architecture
  - database
---

# Database & Persistence

Deskripsi komponen dan perannya dalam arsitektur aplikasi.

## Hubungan Terkait
- Terhubung dengan [[Architecture Overview]]
- Mengelola data untuk [[Session Manager]]

## Invariant & Catatan Kunci
- Ringkasan aturan penting.
```

## 4. Alur Kerja Perintah `/zeus-pantau`

Saat pengguna meminta `/zeus-pantau` atau "pantau proyek ini":
1. Periksa apakah folder `.knowledge/` sudah ada. Jika belum, siapkan direktori tersebut.
2. Analisis file-file kunci dalam proyek (arsitektur, entry point, model data, API/IPC).
3. Buat / perbarui catatan markdown di `.knowledge/*.md` untuk modul-modul penting.
4. Perbarui `.knowledge/graph.canvas` dengan koordinat rapi (node tidak tumpang tindih, terhubung dengan edge yang berlabel jelas).
5. Beri tahu pengguna bahwa knowledge graph berhasil diperbarui dan dapat dilihat langsung melalui menu **Open Mindmap** di WorkPanel.
