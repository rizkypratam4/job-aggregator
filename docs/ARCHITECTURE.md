# Architecture Document
## Personal Job Aggregator & Recruitment Email Dashboard

**Referensi produk:** `product.md`
**Status:** Draft v1.0
**Tanggal:** Juli 2026

---

## 1. Tech Stack

| Layer | Pilihan | Keterangan |
|---|---|---|
| Backend Framework | Laravel (versi terbaru, 11.x/12.x) | Routing, ORM, queue, scheduler, service layer |
| Frontend | React + Inertia.js | SPA experience tanpa perlu buat API terpisah penuh |
| Styling | Tailwind CSS | Default ekosistem Laravel + Inertia starter kit |
| Database | SQLite (lokal) atau MySQL | Sesuai kebiasaan `.env` — SQLite paling ringan untuk personal use |
| Queue | Laravel Queue (database driver) | Untuk proses scraping & panggil Gemini API secara async, tidak blocking request |
| Scheduler | Laravel Task Scheduling | Jalankan scraping berkala (`php artisan schedule:work` di lokal) |
| HTTP Client | Laravel `Http` facade (Guzzle di baliknya) | Untuk request ke Gemini API & Gmail API |
| HTML Parsing | `symfony/dom-crawler` + `symfony/css-selector` | Parsing hasil scraping HTML statis |
| Browser Automation (kondisional) | Panggil script Node.js + Playwright via `Process` facade | Hanya jika platform target adalah SPA (JS-rendered) — lihat Bagian 5 |
| Gmail Integration | `google/apiclient` (Google API PHP Client) | OAuth 2.0 + Gmail API readonly |
| AI Match Score | Gemini API (HTTP langsung, tanpa SDK khusus) | Endpoint `generateContent` |

**Catatan biaya:** Seluruh stack berjalan gratis untuk pemakaian lokal — Laravel, MySQL/SQLite, Node.js (jika dibutuhkan), semuanya open-source dan jalan di localhost tanpa biaya hosting.

---

## 2. Struktur Folder (Laravel)

```
app/
  Console/
    Commands/
      ScrapeJobListings.php        → Artisan command untuk trigger scraping
  Http/
    Controllers/
      DashboardController.php      → Halaman utama (Inertia render)
      ProfileController.php        → CRUD profil user
      JobListingController.php     → List, filter, sort lowongan
      EmailController.php          → List email terfilter + redirect ke Gmail
      GmailAuthController.php      → OAuth flow (redirect & callback)
  Jobs/
    ScrapeJobListingJob.php        → Queue job: scraping 1 platform
    GenerateMatchScoreJob.php      → Queue job: kirim lowongan ke Gemini API
    SyncGmailMessagesJob.php       → Queue job: fetch & filter email baru
  Models/
    Profile.php
    JobListing.php
    EmailMessage.php
  Services/
    Scraper/
      GlintsScraper.php
      LinkedInScraper.php
      ScraperInterface.php         → Kontrak method scrape() supaya scraper baru mudah ditambah
    Gemini/
      GeminiMatchScoreService.php  → Bangun prompt, kirim request, parse response
    Gmail/
      GmailService.php             → Fetch messages, filter domain, label keyword
  Support/
    EmailClassifier.php            → Logic keyword matching untuk status (Interview/Test/Offer/Reject)

resources/
  js/
    Pages/
      Dashboard.jsx
      JobListings/
        Index.jsx
      Emails/
        Index.jsx
      Profile/
        Edit.jsx
    Components/
      JobCard.jsx
      MatchScoreBadge.jsx
      EmailListItem.jsx
      StatusLabel.jsx

database/
  migrations/
    xxxx_create_profiles_table.php
    xxxx_create_job_listings_table.php
    xxxx_create_email_messages_table.php

routes/
  web.php                          → Route Inertia (dashboard, profile, job listings, emails)
  console.php                      → Schedule definition
```

---

## 3. Database Schema

### Tabel `profiles`
Menyimpan data profil user untuk generate query scraping & konteks prompt Gemini.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint | PK |
| primary_skills | json | Array skill utama, misal `["React", "Laravel", "PostgreSQL"]` |
| secondary_skills | json | Array skill sekunder |
| years_of_experience | integer | |
| experience_summary | text | Ringkasan pengalaman kerja, jadi konteks tambahan untuk Gemini |
| preferred_locations | json | Array lokasi, misal `["Jakarta", "Remote"]` |
| work_type | enum | `remote`, `hybrid`, `onsite`, `any` |
| level | enum | `junior`, `mid`, `senior` |
| expected_salary_min | integer | nullable |
| expected_salary_max | integer | nullable |
| created_at / updated_at | timestamp | |

### Tabel `job_listings`
Menyimpan cache hasil scraping.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint | PK |
| source_platform | string | `glints`, `linkedin`, dst |
| source_url | string | URL asli lowongan, untuk redirect saat apply |
| title | string | |
| company_name | string | |
| location | string | |
| work_type | string | Remote/Hybrid/Onsite (hasil parsing, bisa null jika tidak terdeteksi) |
| salary_min | integer | nullable |
| salary_max | integer | nullable |
| description | text | Deskripsi lengkap, dipakai sebagai input prompt Gemini |
| raw_requirements | text | nullable, requirement/skill yang disebutkan di lowongan |
| match_score | integer | nullable, hasil dari Gemini (0–100) |
| match_reason | text | nullable, alasan skor dari Gemini |
| scraped_at | timestamp | |
| created_at / updated_at | timestamp | |

**Index:** unique composite pada (`source_platform`, `source_url`) untuk mencegah duplikat saat scraping ulang.

### Tabel `email_messages`
Cache metadata email yang sudah difilter (bukan isi lengkap email — cukup metadata untuk tampilan & link).

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint | PK |
| gmail_message_id | string | ID asli dari Gmail API, untuk deep link |
| sender_email | string | |
| sender_domain | string | Diekstrak dari sender_email, dipakai untuk filtering |
| subject | string | |
| snippet | text | Preview singkat isi email |
| is_bot_notification | boolean | Hasil klasifikasi domain (true = disembunyikan dari tampilan utama) |
| detected_status | enum | nullable — `interview`, `technical_test`, `hr_interview`, `user_interview`, `offering`, `rejected`, `unknown` |
| received_at | timestamp | |
| created_at / updated_at | timestamp | |

**Index:** unique pada `gmail_message_id` untuk mencegah duplikat saat sync ulang.

---

## 4. Flow Teknis per Modul

### 4.1 Job Aggregator

```
Artisan Command (scheduled, 2x/hari)
  → dispatch ScrapeJobListingJob per platform (queue: scraping)
      → Service Scraper (Glints/LinkedIn) generate URL dari data Profile
      → Fetch HTML (Http facade) atau delegasi ke script Node/Playwright jika SPA
      → Parse hasil (DomCrawler) → simpan/update ke tabel job_listings
      → dispatch GenerateMatchScoreJob untuk setiap listing baru (queue: ai-scoring)
          → GeminiMatchScoreService bangun prompt (profile + job description)
          → Kirim ke Gemini API (Http::post)
          → Parse response → update kolom match_score & match_reason

Frontend (Inertia):
  JobListingController@index → query job_listings (filter, sort by match_score)
  → render Pages/JobListings/Index.jsx
  → user klik card → window.open(source_url) → redirect ke platform asli
```

### 4.2 Smart Email Dashboard

```
GmailAuthController → redirect ke Google OAuth consent screen
  → callback → simpan access_token & refresh_token (encrypted, di tabel terpisah atau storage terenkripsi)

SyncGmailMessagesJob (scheduled, atau manual trigger via tombol "Refresh")
  → GmailService fetch pesan terbaru via Gmail API
  → Untuk setiap pesan:
      - Ekstrak sender_domain
      - Jika domain masuk daftar known job board bot domains → is_bot_notification = true
      - Jika tidak → jalankan EmailClassifier (keyword matching) untuk detected_status
      - Simpan/update ke tabel email_messages

Frontend (Inertia):
  EmailController@index → query email_messages where is_bot_notification = false
  → render Pages/Emails/Index.jsx, tampilkan StatusLabel per item
  → user klik item → link ke https://mail.google.com/mail/u/0/#inbox/{gmail_message_id}
```

---

## 5. Strategi Scraping — Keputusan Teknis Penting

Sebelum implementasi scraper per platform, wajib dicek terlebih dahulu:

1. **Cek rendering method platform target** (View Page Source vs Inspect Element) untuk menentukan apakah konten lowongan tersedia di HTML mentah atau di-render via JavaScript.
2. **Jika HTML statis** → cukup pakai `Http` facade + `symfony/dom-crawler`, murni PHP, tidak perlu dependency tambahan.
3. **Jika SPA/JS-rendered** → buat script Node.js kecil dengan Playwright, dipanggil dari Laravel via:
```php
use Illuminate\Support\Facades\Process;

$result = Process::run('node scraper-scripts/glints.js ' . $query);
$data = json_decode($result->output(), true);
```
   Script Node ini hanya bertugas ambil & dump HTML/JSON hasil render, parsing tetap bisa dilakukan di sisi PHP setelah data diterima.

**Keputusan ini didokumentasikan per platform** di file terpisah (`docs/scraper-notes.md`) begitu tahap riset masing-masing platform dilakukan, karena setiap job board bisa berbeda karakteristiknya.

---

## 6. Keamanan & Kredensial

- **Gemini API key** dan **Google OAuth Client Secret** disimpan di `.env`, tidak pernah di-commit ke repository (pastikan `.env` ada di `.gitignore`).
- **Gmail access_token / refresh_token** milik user disimpan terenkripsi menggunakan Laravel Encrypted Casts (`'access_token' => 'encrypted'` di model) — meskipun ini personal use, tetap best practice agar token tidak plaintext di database.
- Aplikasi berjalan di localhost saja pada fase awal, sehingga tidak ada exposure ke jaringan publik.

---

## 7. Setup Project — Manual Inertia + React (Tanpa Starter Kit)

Project ini **tidak** menggunakan Laravel Breeze atau Jetstream. Inertia +
React disetup manual dari Laravel kosong. Berikut langkah dan
dependency-nya:

```bash
# 1. Install Laravel baru
composer create-project laravel/laravel jobhub
cd jobhub

# 2. Install Inertia server-side (Laravel adapter)
composer require inertiajs/inertia-laravel

# 3. Setup root Blade template
php artisan inertia:middleware
# lalu daftarkan middleware HandleInertiaRequests di bootstrap/app.php
```

Buat file `resources/views/app.blade.php` sebagai root template:
```blade
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    @vite('resources/js/app.jsx')
    @inertiaHead
</head>
<body>
    @inertia
</body>
</html>
```

```bash
# 4. Install dependency frontend (React + Inertia client + Vite)
npm install react react-dom @inertiajs/react
npm install -D @vitejs/plugin-react

# 5. Install Tailwind CSS (manual, tanpa bundled starter kit)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Konfigurasi `vite.config.js` agar mendukung React:
```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
});
```

Entry point `resources/js/app.jsx`:
```jsx
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

createInertiaApp({
    resolve: (name) => import(`./Pages/${name}.jsx`),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
```

```bash
# Backend dependency tambahan sesuai fitur aplikasi
composer require google/apiclient
composer require symfony/dom-crawler symfony/css-selector
composer require pestphp/pest --dev --with-all-dependencies
php artisan pest:install
```

Node.js terpisah (hanya jika dibutuhkan untuk scraping SPA):
```bash
npm install playwright
```

**Catatan:** karena setup manual (bukan starter kit), autentikasi (login,
session) juga **tidak otomatis tersedia** — halaman Login dan integrasi
Google OAuth diimplementasikan sendiri sesuai kebutuhan aplikasi ini
(lihat Bagian 4.2), bukan hasil scaffolding Breeze/Jetstream.

---

## 8. Software Quality — Aspek Desain

Dari seluruh atribut kualitas software, tiga hal berikut relevan di level desain arsitektur (bukan sekadar aturan coding harian — lihat `CLAUDE.md` untuk itu):

### Maintainability
- Setiap platform scraper (`GlintsScraper`, `LinkedInScraper`, dst) diimplementasikan sebagai class terpisah yang mengikuti kontrak `ScraperInterface`. Ketika platform mengubah struktur HTML-nya, perbaikan cukup dilakukan di satu file scraper terkait, tanpa menyentuh logic lain (queue job, service Gemini, dsb).
- Logic klasifikasi email (`EmailClassifier`) dan integrasi AI (`GeminiMatchScoreService`) dipisah sebagai Service class tersendiri, bukan inline di controller — supaya perubahan aturan keyword atau prompt Gemini tidak bercampur dengan logic HTTP/routing.

### Flexibility
- Penambahan platform scraper baru (misal Kalibrr di kemudian hari) cukup dengan membuat class baru yang implement `ScraperInterface`, tanpa mengubah `ScrapeJobListingJob` atau struktur database.
- Kolom `source_platform` di tabel `job_listings` bersifat generic (string), bukan enum kaku — supaya platform baru bisa ditambahkan tanpa migration schema.

### Testability
Menggunakan **Pest** sebagai testing framework. Prioritas bagian yang wajib diberi test (bukan seluruh aplikasi):

| Bagian | Jenis Test | Alasan |
|---|---|---|
| `EmailClassifier` | Unit test | Logic keyword matching rawan salah kalau diubah tanpa disadari — pastikan status (Interview/Test/Offer/Reject) terdeteksi benar dari berbagai contoh subjek/body email |
| `GeminiMatchScoreService` | Unit test (dengan HTTP fake) | Pastikan prompt terbentuk benar & response Gemini di-parse dengan benar, tanpa perlu hit API asli tiap kali test jalan |
| Scraper parsing logic | Unit test (dengan HTML fixture) | Simpan contoh HTML asli sebagai fixture, pastikan parsing tetap mengambil field yang benar (title, company, salary, dll) |
| `GmailService` domain filtering | Unit test | Pastikan domain job board dikenali sebagai bot notification dengan benar |

Bagian yang **tidak perlu** ditest secara ketat: tampilan Inertia/React (cukup dicek manual), routing dasar, migration.

---

## 9. Hal yang Perlu Diriset Lebih Dulu Sebelum Coding Scraper

- [ ] Cek rendering method Glints (target platform pertama)
- [ ] Cek rendering method LinkedIn Jobs (target platform kedua)
- [ ] Cek apakah ada rate limit/captcha yang muncul saat request berulang dari IP lokal
- [ ] Tentukan daftar awal `known job board bot domains` untuk filtering email (misal: domain notifikasi Glints, LinkedIn, JobStreet, Kalibrr)
