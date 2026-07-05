# Product Requirements Document (PRD)
## Personal Job Aggregator & Recruitment Email Dashboard

**Tipe Project:** Personal use (bukan SaaS, bukan produk komersial)
**Status:** Draft v1.0
**Tanggal:** Juli 2026

---

## 1. Latar Belakang & Masalah

Sebagai pencari kerja aktif, pengguna (selanjutnya disebut "user") mengalami masalah berikut:

1. Lowongan kerja tersebar di banyak platform (JobStreet, Glints, LinkedIn Jobs, Kalibrr, dll), sehingga pencarian harus dilakukan manual satu per satu.
2. Tidak ada cara cepat untuk mengetahui lowongan mana yang benar-benar cocok dengan skill, pengalaman, dan preferensi user tanpa membaca satu per satu secara manual.
3. Inbox email dipenuhi notifikasi otomatis (bot) dari platform lowongan kerja, membuat email penting dari HR/perusahaan tertimpa dan terlambat dibaca.
4. Proses rekrutmen yang sedang berjalan sulit dipantau karena informasinya tersebar di banyak thread email.

## 2. Tujuan Produk

Membangun web application pribadi yang:
- Mengumpulkan lowongan kerja relevan dari platform pencarian kerja berdasarkan profil user.
- Memberi skor kecocokan (match score) berbasis AI untuk setiap lowongan.
- Memisahkan email penting dari HR/perusahaan dari email otomatis platform job board, lengkap dengan label status rekrutmen.

**Yang TIDAK menjadi tujuan (Non-Goals):**
- Tidak dibangun sebagai produk SaaS multi-user.
- Tidak menyediakan fitur apply otomatis (auto-fill form) — apply tetap dilakukan manual di platform asli.
- Tidak menyimpan riwayat lamaran sebagai job tracker terpisah (lihat Modul 2 — cukup notifikasi, bukan tracking record).

## 3. Target Pengguna

Satu pengguna: pemilik/developer aplikasi ini sendiri. Tidak ada kebutuhan multi-tenant, role management, atau billing.

## 4. Modul & Fitur

### 4.1 Modul 1 — Job Aggregator dengan AI Match Score

**Deskripsi:**
Mengambil (scrape) lowongan kerja dari platform job board berdasarkan query yang digenerate dari profil user, kemudian setiap lowongan diberi skor kecocokan menggunakan Gemini API.

**Fitur:**
- **Profil User** (disimpan di database lokal):
  - Skill utama & skill sekunder
  - Pengalaman kerja (tahun & ringkasan role)
  - Preferensi lokasi (kota / remote)
  - Preferensi tipe kerja (Remote / Hybrid / Onsite)
  - Range gaji yang diharapkan
  - Level (Junior / Mid / Senior)
- **Scraper terjadwal** (bukan real-time):
  - Target awal: 1–2 platform (misal Glints, LinkedIn Jobs)
  - Query pencarian dibangun otomatis dari data profil (keyword, lokasi, level)
  - Dijalankan berkala (misal 2x sehari) via cron job / scheduled script
- **AI Match Score (Gemini API)**:
  - Setiap lowongan yang berhasil di-scrape dikirim ke Gemini API bersama profil user
  - Output: skor 0–100 + alasan singkat kecocokan/ketidakcocokan
- **Dashboard tampilan**:
  - List lowongan diurutkan berdasarkan match score tertinggi
  - Filter tambahan: skill, lokasi, gaji, tipe kerja, level
  - Klik lowongan → redirect ke halaman asli platform untuk proses apply manual

**Di luar scope modul ini:**
- Auto-apply / auto-fill form lamaran
- Tracking status lamaran (lihat Non-Goals)

---

### 4.2 Modul 2 — Smart Email Dashboard (Notifikasi, bukan Tracker)

**Deskripsi:**
Menyambungkan Gmail milik user (OAuth) untuk memisahkan email penting dari HR/perusahaan dari email otomatis platform job board, serta memberi label status rekrutmen sebagai indikator visual — tanpa menyimpan sebagai record tracking terpisah.

**Fitur:**
- **Gmail OAuth** (mode Testing, akun sendiri sebagai test user — tidak perlu verifikasi Google)
- **Filter email**:
  - Email dari domain platform job board (misal `@jobstreet.com`, `@id.linkedin.com`, dll) → dikategorikan sebagai notifikasi bot, disembunyikan/diarsipkan dari tampilan utama
  - Email dari domain lain (perusahaan/personal) → ditampilkan sebagai kandidat email HR
- **Label status otomatis (keyword-based)**:
  - Interview
  - Technical Test
  - HR Interview
  - User Interview
  - Offering
  - Rejected
  - Label ini murni tampilan (tag visual di list email), tidak disimpan sebagai entry/record tracker
- **Interaksi**:
  - Klik email di dashboard → membuka email tersebut langsung di Gmail (deep link)

**Di luar scope modul ini:**
- Tidak ada job tracker/kanban board
- Tidak ada linking manual antar email dan "entry lamaran" (karena tidak ada entry yang disimpan)

---

## 5. Alur Sistem (High-Level)

**Job Aggregator:**
```
Profil User → Generate query scraping → Scraper ambil lowongan dari platform
→ Kirim tiap lowongan + profil ke Gemini API → Terima match score & alasan
→ Tampilkan di dashboard, diurutkan berdasarkan skor tertinggi
→ User klik → redirect ke platform asli untuk apply manual
```

**Email Dashboard:**
```
Gmail OAuth login → Ambil email masuk → Filter berdasarkan domain pengirim
→ Email non-bot ditampilkan → Scan keyword pada subjek/isi
→ Beri label status (Interview/Test/Offer/Reject) → User klik → buka di Gmail
```

## 6. Batasan & Risiko yang Diketahui

- **Scraping** bergantung pada struktur HTML platform yang bisa berubah kapan saja → butuh maintenance berkala.
- **Rate limit / blokir IP** saat scraping terlalu sering → mitigasi: scraping tidak real-time, cukup 2x/hari.
- **Klasifikasi email HR vs bot** berbasis domain/keyword tidak akan 100% akurat, terutama untuk kasus abu-abu (misal notifikasi platform yang sebenarnya berisi pesan recruiter).
- **Akurasi match score** bergantung pada kelengkapan data hasil scraping (deskripsi & requirement lowongan yang berhasil diparsing).
- **Gmail OAuth mode Testing** akan menampilkan warning "unverified app" saat login — dapat diabaikan karena hanya digunakan oleh pemilik akun sendiri.

## 7. Roadmap Pengembangan

| Fase | Modul | Target |
|---|---|---|
| Fase 1 (MVP) | Smart Email Dashboard | Filter email HR vs bot + label status keyword |
| Fase 2 | Job Aggregator (1–2 platform) | Scraping berbasis profil + tampilan dashboard lowongan |
| Fase 3 | AI Match Score (Gemini API) | Integrasi scoring otomatis ke hasil scraping |
| Fase 4 (opsional) | Peningkatan lanjutan | Notifikasi ke Telegram, AI classifier email menggunakan LLM, statistik pribadi (jumlah lamaran, response rate) |

## 8. Kriteria Sukses (Personal)

- User tidak perlu lagi membuka satu-satu platform job board secara manual untuk mencari lowongan relevan.
- User dapat langsung melihat lowongan dengan match score tertinggi di satu dashboard.
- Inbox Gmail user tidak lagi didominasi notifikasi bot; email HR/perusahaan mudah ditemukan dan diberi label status yang jelas.
