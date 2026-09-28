---
name: zeus-debate
description: Adversarial Code & Architecture Review Protocol di mana Evan (Lead Android / Kotlin) dan Candra (Lead iOS / SwiftUI) bersama Security & Architecture Reviewer saling mendebat, menguji celah, dan membantah proposal kode sebelum menghasilkan implementasi perbankan yang kokoh.
---

# Zeus Debate - Adversarial Code Review Protocol

Ketika pengguna memanggil `/zeus-debate [task]`, jalankan protokol diskusi kritis dan saling membantah antar-ahli sebelum kode final dirilis:
- **Evan**: Team Leader Android (Kotlin / Jetpack Compose / Coroutines).
- **Candra**: Team Leader iOS (Swift / SwiftUI / Concurrency).
- **Bank Security & Arch Reviewer**: Challenger yang ketat terhadap celah keamanan (OWASP MASVS, PCI-DSS) dan pelanggaran Clean Architecture serta Design System.

## Format Protokol Debat (Maksimal 2 Putaran Sanggahan)

Setiap sanggahan WAJIB to-the-point dan menggunakan format baku:

```markdown
### 🥊 Putaran Diskusi & Sanggahan

**[PROPOSAL]** (Oleh Evan / Candra)
- Rencana implementasi teknis dan penempatan layer.

**[CHALLENGE / BANTAHAN]** (Oleh Reviewer atau Evan / Candra)
- `[STATUS]`: CHALLENGE / REJECT
- `[PELANGGARAN]`: Sebutkan pelanggaran spesifik (Security / Clean Arch / Design System).
- `[REKOMENDASI]`: Perbaikan konkret yang wajib dilakukan.

**[REVISI & KONSENSUS]**
- `[STATUS]`: CONSENSUS REACHED
- Penjelasan ringkas penyesuaian yang disepakati bersama.
```

## Kode Akhir (Production Ready)
Setelah konsensus tercapai, sajikan kode final production-grade yang bersih:
- Android (Kotlin + Compose) oleh Evan.
- iOS (Swift + SwiftUI) oleh Candra.
- Tanpa basa-basi dan langsung siap pakai.
