---
name: zeus-mock
description: Banking Mock Server Generator terintegrasi dengan Mockkiwi. Mengonversi Blueprint, Error Matrix, dan Excel Data Dictionary menjadi endpoint mock JSON valid dengan schema standar bank (error_schema & output_schema), multi-response (200 Success, 400 Validation Error, 504 Timeout, 401 Expired), siap diimpor ke Mockkiwi.
---

# Zeus Mock - Mockkiwi Banking Integration Specialist

Ketika pengguna menjalankan perintah `/zeus-mock [nama fitur / endpoint]`, hasilkan berkas spesifikasi **Mockkiwi JSON Endpoint** resmi yang mematuhi standar perbankan dan kompatibel 100% dengan **Mockkiwi App & CLI** (`com.candraprasetya.MockKiwiApp`).

## 1. Schema Standar Endpoint Mockkiwi (`uid_<uuid>.json`)

Setiap endpoint mock yang dihasilkan wajib memiliki struktur berikut:

```json
{
  "id": "<generate-unique-uuid-v4>",
  "name": "<Nama Endpoint Deskriptif, misal: Inquire Balance / Top Up Flazz>",
  "method": "POST",
  "path": "/api/v3/<domain>/<feature-action>",
  "responses": [
    {
      "id": "<response-uuid-1>",
      "statusCode": 200,
      "documentation": "SUCCESS - 000",
      "isActive": true,
      "timeoutMs": 0,
      "filePath": "",
      "sendAsBody": false,
      "body": "{\n  \"error_schema\": {\n    \"error_code\": \"BOC-000\",\n    \"http_code\": 200,\n    \"error_message\": {\n      \"indonesian\": \"Transaksi Berhasil\",\n      \"english\": \"Transaction Successful\"\n    }\n  },\n  \"output_schema\": {\n    \"status\": \"SUCCESS\",\n    \"transaction_id\": \"TRX-20260925-99881\",\n    \"epoch\": 1758814800000\n  }\n}"
    },
    {
      "id": "<response-uuid-2>",
      "statusCode": 400,
      "documentation": "ERROR - Saldo Kurang (4001)",
      "isActive": false,
      "timeoutMs": 0,
      "filePath": "",
      "sendAsBody": false,
      "body": "{\n  \"error_schema\": {\n    \"error_code\": \"BOC-ERR-4001\",\n    \"http_code\": 400,\n    \"error_message\": {\n      \"indonesian\": \"Saldo rekening Anda tidak mencukupi untuk transaksi ini.\",\n      \"english\": \"Your account balance is insufficient for this transaction.\"\n    }\n  }\n}"
    },
    {
      "id": "<response-uuid-3>",
      "statusCode": 504,
      "documentation": "ERROR - Gateway Timeout (5004)",
      "isActive": false,
      "timeoutMs": 3000,
      "filePath": "",
      "sendAsBody": false,
      "body": "{\n  \"error_schema\": {\n    \"error_code\": \"BOC-ERR-5004\",\n    \"http_code\": 504,\n    \"error_message\": {\n      \"indonesian\": \"Oops.. Terjadi gangguan koneksi, silakan coba beberapa saat lagi.\",\n      \"english\": \"Oops.. Connection timeout, please try again later.\"\n    }\n  }\n}"
    },
    {
      "id": "<response-uuid-4>",
      "statusCode": 401,
      "documentation": "ERROR - Token Expired (0002)",
      "isActive": false,
      "timeoutMs": 0,
      "filePath": "",
      "sendAsBody": false,
      "body": "{\n  \"error_schema\": {\n    \"error_code\": \"BOC-AUTH-0002\",\n    \"http_code\": 401,\n    \"error_message\": {\n      \"indonesian\": \"Sesi Anda telah berakhir, silakan login kembali.\",\n      \"english\": \"Your session has expired, please log in again.\"\n    }\n  }\n}"
    }
  ]
}
```

## 2. Aturan Format Data & Nilai Mock
1. **Bilingual Error Messages**: Setiap `error_message` wajib menyediakan pasangan `indonesian` dan `english` yang sesuai dengan kamus data atau file i18n (`*-ai-string-*.json`).
2. **Realistic Dummy Data**: Nilai pada `output_schema` harus realistis (nama nasabah format masking, nomor rekening 10 digit, nomor kartu 16 digit ter-masking, timestamp epoch milliseconds).
3. **Resilience & Chaos Simulation**:
   - Respon timeout memiliki `timeoutMs: 3000` atau lebih untuk memvalidasi handling Coroutines/Async timeout di aplikasi mobile Evan (Android) dan Candra (iOS).
4. **Zero Fluff**: Langsung sajikan kode JSON Mockkiwi siap simpan / import tanpa basa-basi pembuka atau penutup.
