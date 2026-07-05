# Job Aggregator App

Personal job aggregator with AI-powered match scoring and a smart recruitment email dashboard.

Aplikasi personal (single-user) untuk mengumpulkan lowongan kerja dari berbagai job board ke satu dashboard, memberi skor kecocokan otomatis berbasis AI, dan memisahkan email rekrutmen penting dari HR/perusahaan dari notifikasi otomatis job board di Gmail.

## Latar Belakang

Dibangun untuk menyelesaikan masalah pribadi saat mencari kerja:
- Lowongan tersebar di banyak platform (Glints, LinkedIn Jobs, dll), harus dicek manual satu per satu
- Inbox Gmail penuh notifikasi bot dari job board, sehingga email penting dari HR sering tertimpa dan terlambat dibaca

Detail lengkap kebutuhan produk ada di [`product.md`](./docs/PRODUCT.md).

## Fitur Utama

- **Job Aggregator** — scraping lowongan dari job board berdasarkan profil skill/pengalaman/preferensi, dengan skor kecocokan (match score) dari Gemini API
- **Smart Email Dashboard** — filter email HR/perusahaan dari notifikasi bot job board via Gmail OAuth, lengkap dengan label status rekrutmen (Interview, Technical Test, Offering, Rejected, dll)

## Tech Stack

- **Backend:** Laravel
- **Frontend:** Inertia.js + React + Tailwind CSS
- **Testing:** Pest
- **AI:** Gemini API (match scoring)
- **Integrasi:** Gmail API (OAuth)

Detail arsitektur lengkap ada di [`architecture.md`](./architecture.md).

## Dokumentasi Project

| File | Isi |
|---|---|
| [`product.md`](./product.md) | Kebutuhan produk, fitur, non-goals, roadmap |
| [`architecture.md`](./architecture.md) | Desain teknis, struktur folder, database schema |
| [`CLAUDE.md`](./CLAUDE.md) | Aturan kerja/coding standard |
| [`tasks.md`](./tasks.md) | Daftar tugas per fase pengembangan |
| [`FRONTEND_PLAN.md`](./FRONTEND_PLAN.md) | Rencana desain UI per screen |
| [`STITCH_PROMPT.md`](./STITCH_PROMPT.md) | Prompt untuk generate UI via Google Stitch |

## Setup Lokal

```bash
# Clone & install dependency backend
composer install

# Install dependency frontend
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Setup database (SQLite/MySQL, sesuaikan .env)
php artisan migrate

# Jalankan development server
php artisan serve
npm run dev
```

Konfigurasi environment tambahan yang dibutuhkan di `.env`:
```
GEMINI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

## Testing

```bash
php artisan test
# atau
./vendor/bin/pest
```

## Catatan

Project ini dibuat untuk penggunaan pribadi (single-user), bukan produk SaaS atau multi-tenant. Lihat bagian "Non-Goals" di [`product.md`](./product.md) untuk batasan scope yang disengaja.
