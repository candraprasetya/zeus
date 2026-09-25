---
name: zeus-predev
description: Menghasilkan paket dokumen proposal Pre-Dev Review resmi untuk Reviewer/Tech Lead sebelum koding dimulai. Mengintegrasikan Blueprint, Excel Data Dictionary, mapping Error Code & Error Handling, JSON Wording i18n tri-lingual (EN, ID, ZH) cross-platform terpusat, serta arsitektur Kotlin & Swift.
---

# Zeus Pre-Dev - Banking Governance & Review Package

Ketika pengguna menjalankan perintah `/zeus-predev [fitur / blueprint]`, hasilkan paket dokumen teknis **Pre-Dev Review** yang rapi, komprehensif, dan siap dikirimkan kepada Reviewer / Tech Lead / Security Officer.

## 1. Single Source of Truth: Modular JSON i18n Format (Shared Cross-Platform)
Android dan iOS menggunakan **satu repositori wording terpusat berbasis JSON** di branch yang sama (sebelum di-build / di-compile ke framework native masing-masing).

Setiap fitur memiliki folder tersendiri (misal: `flazz/`, `financialasset/`, `notification/`), dengan penamaan file terpisah per bahasa (`en`, `id`, `zh`) serta pemisahan antara string base (AI-generated / standard) dan string override:

### Konvensi Struktur Folder & File:
```text
<feature_name>/
├── <feature>-ai-string-en.json
├── <feature>-ai-string-id.json
├── <feature>-ai-string-zh.json
├── <feature>-override-string-en.json
├── <feature>-override-string-id.json
└── <feature>-override-string-zh.json
```

Contoh untuk fitur `flazz`:
- `flazz/flazz-ai-string-en.json`
- `flazz/flazz-ai-string-id.json`
- `flazz/flazz-ai-string-zh.json`
- `flazz/flazz-override-string-en.json`
- `flazz/flazz-override-string-id.json`
- `flazz/flazz-override-string-zh.json`

### Format Isi JSON:
File JSON per-bahasa berbentuk flat key-value atau nested object per konteks:
```json
{
  "flazz_card_title": "Flazz Card Balance",
  "flazz_btn_topup": "Top Up",
  "flazz_error_nfc_disabled": "Please enable NFC on your device to read the card."
}
```
*Catatan:*
- `*-ai-string-<lang>.json`: Memuat dictionary string standar/otomatis dari blueprint & spec.
- `*-override-string-<lang>.json`: Khusus menampung copy khusus dari tim Product / Compliance / Legal yang meng-override string bawaan.
- Script generator framework native di Android (Kotlin) & iOS (SwiftUI) akan menggabungkan (*merge*) file `override` ke atas file `ai-string` lalu menghasilkan resource class / localization bundle di platform masing-masing.

## 2. Struktur Paket Dokumen Pre-Dev

Paket yang dihasilkan wajib memuat 5 bagian:

### A. Ringkasan Blueprint & Scope Fitur
- Deskripsi fitur dan batasan scope.
- Alur flow pengguna (Happy Path & Negative Path).

### B. Data Dictionary & Contract Model
- Mapping dari Excel Data Dictionary (Field Name, Type, Mandatory, Regex).
- DTO Model Contract untuk Android & iOS.

### C. Error Codes & Resilient Handling Matrix
| Error Code | Skenario Backend | Wording Key (JSON) | Tindakan UI / Recovery |
| :--- | :--- | :--- | :--- |
| `BOC-ERR-4001` | Saldo Tidak Cukup | `error_insufficient_balance` | Dialog warning informatif |
| `BOC-ERR-5004` | Gateway Timeout 504 | `error_network_timeout` | Auto-retry + dialog coba lagi |
| `BOC-AUTH-0002` | Session / Token Expired | `error_session_expired` | Flush Keystore/Keychain + Navigasi Login |

### D. Architectural Proposal: Evan (Android) & Candra (iOS)
- **Evan (Android Native)**: UseCase, Data Layer (Repository/DataSource), Presentation Layer (MVI/MVVM StateFlow & Jetpack Compose).
- **Candra (iOS Native)**: UseCase, Data Layer (Repository/DataSource), Presentation Layer (MVI/MVVM Async & SwiftUI).
- Kepatuhan Design System (Color Tokens & Reusable Custom Bank Widgets).

### E. Security & Compliance Checklist (PCI-DSS & OWASP MASVS)
- [ ] Invalidate Biometric key on new fingerprint enrollment.
- [ ] `FLAG_SECURE` (Android) / Screen Masking on background (iOS).
- [ ] Zero plain-text logging di Logcat / OSLog console.
- [ ] Key storage di AndroidKeyStore / iOS Keychain Services.
