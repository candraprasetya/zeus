---
name: zeus-predev
description: Menghasilkan paket dokumen proposal Pre-Dev Review resmi untuk Reviewer/Tech Lead sebelum koding dimulai. Mengintegrasikan Blueprint, Excel Data Dictionary, mapping Error Code & Error Handling, JSON Wording i18n tri-lingual (EN, ID, ZH) cross-platform terpusat, serta arsitektur Kotlin & Swift.
---

# Zeus Pre-Dev - Banking Governance & Review Package

Ketika pengguna menjalankan perintah `/zeus-predev [fitur / blueprint]`, hasilkan paket dokumen teknis **Pre-Dev Review** yang rapi, komprehensif, dan siap dikirimkan kepada Reviewer / Tech Lead / Security Officer.

## 1. Single Source of Truth: JSON i18n Format (Shared Cross-Platform)
Android dan iOS menggunakan **satu repositori wording terpusat berbasis JSON** di branch yang sama (sebelum di-build ke framework native masing-masing):
- Format Wording JSON:
```json
{
  "feature_name": {
    "title": {
      "en": "QRIS Payment",
      "id": "Pembayaran QRIS",
      "zh": "QRIS 支付"
    },
    "error_insufficient_balance": {
      "en": "Your account balance is insufficient for this transaction.",
      "id": "Saldo rekening Anda tidak mencukupi untuk transaksi ini.",
      "zh": "您的账户余额不足以完成此交易。"
    }
  }
}
```

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
