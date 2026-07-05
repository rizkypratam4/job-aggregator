# Tasks.md

Daftar tugas actionable untuk pengembangan project ini.
Referensi: `product.md` (kebutuhan), `architecture.md` (desain teknis), `CLAUDE.md` (aturan kerja).

Urutan mengikuti roadmap di `product.md`: **Fase 1 (Email Dashboard) → Fase 2 (Job Aggregator) → Fase 3 (AI Match Score) → Fase 4 (opsional)**.

Checklist `[ ]` bisa dicentang manual seiring progres.

---

## Fase 0 — Setup Awal Project (Manual, Tanpa Breeze/Jetstream)

- [✅] Install Laravel baru: `composer create-project laravel/laravel job-aggregator`
- [✅] Konfigurasi database lokal (`.env`) — SQLite atau MySQL
- [✅] Install Inertia server-side: `composer require inertiajs/inertia-laravel`
- [✅] Jalankan `php artisan inertia:middleware`, daftarkan middleware `HandleInertiaRequests` di `bootstrap/app.php`
- [✅] Buat root template `resources/views/app.blade.php` (dengan `@vite`, `@inertiaHead`, `@inertia`)
- [✅] Install dependency frontend: `npm install react react-dom @inertiajs/react` dan `npm install -D @vitejs/plugin-react`
- [✅] Konfigurasi `vite.config.js` untuk mendaftarkan plugin React + entry point `resources/js/app.jsx`
- [✅] Buat entry point `resources/js/app.jsx` (setup `createInertiaApp`)
- [✅] Install Tailwind manual: `npm install -D tailwindcss postcss autoprefixer` lalu `npx tailwindcss init -p`
- [✅] Konfigurasi `tailwind.config.js` — set `content` path ke `resources/**/*.{blade.php,jsx}`
- [✅] Buat halaman test sederhana (`Pages/Test.jsx`) untuk pastikan Inertia + React + Tailwind sudah nyambung sebelum lanjut ke fitur asli
- [✅] Install dependency backend: `google/apiclient`, `symfony/dom-crawler`, `symfony/css-selector`
- [✅] Install Pest: `composer require pestphp/pest --dev --with-all-dependencies` lalu `php artisan pest:install`
- [✅] Pastikan `.env` masuk `.gitignore`, siapkan `.env.example` tanpa isi kredensial asli
- [ ] Buat repository git lokal (kalau belum), commit awal struktur kosong

**Catatan:** Karena setup manual (bukan starter kit), autentikasi/session tidak otomatis tersedia dari scaffolding — implementasi Login & Google OAuth dikerjakan sendiri di Fase 1.1.

---

## Fase 1 — Smart Email Dashboard (MVP)

### 1.1 Setup Gmail OAuth
- [ ] Buat project baru di Google Cloud Console
- [ ] Enable Gmail API
- [ ] Buat OAuth Client ID (Web application), set redirect URI ke `localhost`
- [ ] Set OAuth consent screen ke mode **Testing**, tambahkan email sendiri sebagai Test User
- [ ] Simpan `client_id` & `client_secret` di `.env`
- [ ] Implementasi `GmailAuthController` — route redirect ke consent screen & handle callback
- [ ] Simpan `access_token` & `refresh_token` terenkripsi (encrypted cast di model)
- [ ] Test manual: login berhasil, token tersimpan

### 1.2 Sinkronisasi Email
- [ ] Buat migration tabel `email_messages` (sesuai schema di `architecture.md`)
- [ ] Buat model `EmailMessage`
- [ ] Implementasi `GmailService` — fetch pesan terbaru via Gmail API
- [ ] Implementasi `SyncGmailMessagesJob` — simpan/update ke tabel `email_messages`
- [ ] Tentukan daftar awal **known job board bot domains** (Glints, LinkedIn, JobStreet, Kalibrr, dll) untuk filtering
- [ ] Implementasi logic `is_bot_notification` berdasarkan domain pengirim

### 1.3 Klasifikasi Status Email
- [ ] Implementasi `EmailClassifier` — keyword matching untuk status (Interview/Technical Test/HR Interview/User Interview/Offering/Rejected)
- [ ] Kumpulkan contoh nyata subjek/body email (dari inbox sendiri) sebagai referensi sebelum menulis keyword rules
- [ ] **[Pest]** Unit test `EmailClassifier` dengan berbagai skenario subjek/body
- [ ] **[Pest]** Unit test `GmailService` domain filtering

### 1.4 Dashboard Frontend
- [ ] Buat `EmailController@index` — query email non-bot, urutkan terbaru
- [ ] Buat halaman `Pages/Emails/Index.jsx` (Inertia + React)
- [ ] Komponen `EmailListItem.jsx` — tampilkan sender, subjek, snippet, label status
- [ ] Komponen `StatusLabel.jsx` — badge visual per status
- [ ] Implementasi klik email → buka deep link Gmail (`https://mail.google.com/mail/u/0/#inbox/{gmail_message_id}`)
- [ ] Tambahkan tombol "Refresh" manual untuk trigger sync tanpa nunggu jadwal

### 1.5 Scheduler
- [ ] Daftarkan `SyncGmailMessagesJob` di scheduler (`routes/console.php`), jalankan berkala (misal tiap 1-2 jam)
- [ ] Test jalankan `php artisan schedule:work` di lokal, pastikan job jalan sesuai jadwal

**Milestone Fase 1 selesai jika:** Login Gmail berhasil, email HR terlihat terpisah dari notifikasi bot, status label muncul dengan benar, klik email membuka Gmail.

---

## Fase 2 — Job Aggregator

### 2.1 Profil User
- [ ] Buat migration tabel `profiles`
- [ ] Buat model `Profile`
- [ ] Buat `ProfileController` (form create/edit)
- [ ] Buat halaman `Pages/Profile/Edit.jsx` — form input skill, pengalaman, lokasi, tipe kerja, level, ekspektasi gaji
- [ ] Isi profil sendiri sebagai data pertama

### 2.2 Riset Platform (WAJIB sebelum coding scraper)
- [ ] Cek rendering method **Glints** (View Page Source vs Inspect Element)
- [ ] Cek rendering method **LinkedIn Jobs**
- [ ] Cek apakah muncul rate limit/captcha saat request berulang dari IP lokal
- [ ] Tentukan pendekatan scraping per platform: HTML statis (Guzzle+DomCrawler) atau SPA (Node+Playwright)
- [ ] Dokumentasikan hasil riset ini (bisa jadi catatan tambahan di `architecture.md` atau file terpisah kalau perlu)

### 2.3 Implementasi Scraper
- [ ] Buat `ScraperInterface` (kontrak method `scrape(Profile $profile): array`)
- [ ] Buat migration tabel `job_listings` (sesuai schema di `architecture.md`)
- [ ] Buat model `JobListing`
- [ ] Implementasi `GlintsScraper` — generate query URL dari profil, fetch & parse hasil
- [ ] **[Jika SPA]** Buat script Node.js + Playwright terpisah, dipanggil via `Process::run()`
- [ ] Implementasi `LinkedInScraper` (setelah Glints stabil)
- [ ] **[Pest]** Unit test parsing scraper menggunakan HTML fixture (simpan contoh HTML asli di `tests/Fixtures/`)
- [ ] Implementasi `ScrapeJobListingJob` — orkestrasi panggil scraper, simpan/update ke `job_listings`, cegah duplikat (unique constraint `source_platform` + `source_url`)

### 2.4 Dashboard Frontend
- [ ] Buat `JobListingController@index` — query job_listings dengan filter (skill, lokasi, gaji, tipe kerja, level)
- [ ] Buat halaman `Pages/JobListings/Index.jsx`
- [ ] Komponen `JobCard.jsx` — tampilkan info lowongan
- [ ] Implementasi filter UI (dropdown/checkbox untuk skill, lokasi, dll)
- [ ] Implementasi klik card → buka `source_url` di tab baru (redirect ke platform asli)

### 2.5 Scheduler
- [ ] Buat Artisan command `ScrapeJobListings` — dispatch `ScrapeJobListingJob` per platform
- [ ] Daftarkan di scheduler, jalankan 2x/hari
- [ ] Test manual jalankan command langsung sebelum diserahkan ke scheduler

**Milestone Fase 2 selesai jika:** Profil bisa diisi, scraper berhasil ambil lowongan minimal dari 1 platform, dashboard menampilkan hasil dengan filter dasar, klik lowongan berhasil redirect ke platform asli.

---

## Fase 3 — AI Match Score (Gemini API)

- [ ] Buat akun/API key Gemini API, simpan di `.env`
- [ ] Implementasi `GeminiMatchScoreService` — bangun prompt dari data profil + deskripsi lowongan
- [ ] Tentukan format response yang diminta ke Gemini (skor 0-100 + alasan singkat) — desain prompt supaya response terstruktur dan mudah di-parse (misal minta format JSON)
- [ ] Implementasi validasi response Gemini sebelum disimpan (cek struktur, tipe data)
- [ ] Implementasi `GenerateMatchScoreJob` — dispatch untuk tiap job listing baru, update kolom `match_score` & `match_reason`
- [ ] **[Pest]** Unit test `GeminiMatchScoreService` menggunakan `Http::fake()` — jangan hit API asli saat test
- [ ] Update `JobListingController@index` — default sort berdasarkan `match_score` tertinggi
- [ ] Update `JobCard.jsx` — tampilkan skor & alasan (komponen `MatchScoreBadge.jsx`)
- [ ] Hubungkan `ScrapeJobListingJob` agar otomatis dispatch `GenerateMatchScoreJob` setelah listing baru tersimpan

**Milestone Fase 3 selesai jika:** Setiap lowongan baru otomatis mendapat match score dari Gemini, dashboard terurut berdasarkan skor tertinggi, alasan skor terlihat di UI.

---

## Fase 4 — Peningkatan Lanjutan (Opsional)

- [ ] Notifikasi ke Telegram bot pribadi saat ada email HR baru atau lowongan match score tinggi
- [ ] Ganti/lengkapi `EmailClassifier` keyword-based dengan LLM classifier (Gemini) untuk kasus ambigu
- [ ] Statistik pribadi sederhana: jumlah lamaran per bulan (dihitung dari data scraping + email), response rate, dsb
- [ ] Tambah platform scraper lain (Kalibrr, JobStreet) — tinggal implement `ScraperInterface` baru

---

## Catatan Pengerjaan

- Setiap task teknis baru yang menyimpang dari `architecture.md` (misal ganti pendekatan scraping) — update dokumen tersebut supaya tetap sinkron.
- Jangan kerjakan task Fase 2/3 sebelum Fase 1 stabil — urutan ini sengaja dibuat bertahap sesuai roadmap `product.md`.
- Task yang ditandai **[Pest]** wajib diselesaikan sebelum menganggap sub-bagian terkait "selesai", sesuai `CLAUDE.md`.
