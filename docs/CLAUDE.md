# CLAUDE.md

Panduan kerja untuk Claude (atau siapapun) saat membantu coding project ini.
Referensi: `product.md` (kebutuhan produk), `architecture.md` (desain teknis).

---

## Konteks Project

Personal web app (bukan SaaS, 1 pengguna) untuk:
1. Agregasi lowongan kerja + AI match score (Gemini API)
2. Filter email rekrutmen dari Gmail (pisahkan HR vs notifikasi bot)

Stack: Laravel + Inertia + React, Tailwind, Pest untuk testing.

---

## Aturan Coding Wajib

### Correctness
- Jangan asumsikan format response API eksternal (Gemini, Gmail) selalu konsisten — selalu validasi struktur response sebelum diproses/disimpan (cek key ada/tidak, tipe data sesuai).
- Untuk logic keyword matching (`EmailClassifier`) atau parsing HTML (scraper), tulis dulu contoh kasus nyata (subjek email asli, potongan HTML asli) sebelum implementasi — jangan menebak-nebak pola tanpa data konkret.
- Kalau ragu terhadap suatu logic, tulis unit test Pest untuk memverifikasi sebelum lanjut ke bagian berikutnya, terutama untuk 4 area yang disebut di `architecture.md` bagian Testability.

### Reliability
- Setiap pemanggilan API eksternal (Gemini, Gmail, scraping target) wajib dibungkus try-catch, dan gagal dengan log yang jelas (`Log::error(...)`) — jangan biarkan exception silent atau bikin seluruh queue job mati tanpa jejak.
- Gunakan `retry()` helper Laravel untuk HTTP call yang berpotensi gagal sementara (timeout, rate limit) sebelum dianggap gagal permanen.
- Job yang gagal harus tercatat di `failed_jobs` table (default Laravel) — jangan disable fitur ini.
- Validasi token Gmail (access_token/refresh_token) sebelum dipakai; kalau expired, refresh otomatis dan log kejadian tersebut, jangan biarkan gagal diam-diam.

### Maintainability
- Scraper baru wajib mengikuti `ScraperInterface` yang sudah didefinisikan di `architecture.md` — jangan membuat pendekatan ad-hoc di luar kontrak ini.
- Jangan taruh logic bisnis (parsing, keyword matching, prompt building) langsung di Controller. Controller hanya orkestrasi request/response; logic ada di Service class atau Job class.
- Kalau menemukan struktur HTML platform berubah dan scraper rusak, perbaikan cukup di file scraper platform terkait — jangan sampai perubahan ini menjalar ke job/queue/model lain.

### Understandability
- Penamaan variabel dan method harus deskriptif — hindari singkatan ambigu (`ml`, `svc`, `tmp`) kecuali sudah lazim (`id`, `url`).
- Beri komentar singkat khusus di logic yang non-trivial atau melibatkan keputusan bisnis (misal kenapa suatu domain dianggap "bot", kenapa threshold match score tertentu dipilih) — bukan komentar yang menjelaskan ulang kode secara literal.
- Setiap Service class baru diberi docblock singkat di atasnya: tujuan class ini apa, dipanggil dari mana.

---

## Testing (Pest)

- Framework: **Pest**, bukan PHPUnit gaya lama (meski keduanya kompatibel di Laravel).
- Wajib ditest (unit test):
  - `EmailClassifier` — berbagai skenario subjek/body email → status yang benar
  - `GeminiMatchScoreService` — gunakan `Http::fake()`, jangan hit API asli saat test
  - Parsing scraper (per platform) — gunakan HTML fixture yang disimpan di `tests/Fixtures/`, jangan scraping live saat test
  - `GmailService` domain filtering — daftar domain bot vs non-bot
- Tidak wajib ditest: tampilan Inertia/React, routing dasar, migration.
- Jalankan `php artisan test` (atau `./vendor/bin/pest`) sebelum menganggap suatu fitur selesai.

---

## Yang Sengaja Tidak Diprioritaskan (Sesuai Skala Personal Project)

Jangan habiskan waktu untuk hal-hal berikut kecuali diminta eksplisit:
- Optimasi performa/efficiency berlebihan (single user, tidak ada tekanan skala)
- Desain untuk portability lintas OS/stack lain
- Desain reusability formal (modul/package generik untuk dipakai project lain)
- Proteksi keamanan tingkat multi-tenant/public-facing (aplikasi jalan di localhost, 1 user)

---

## Batasan Fitur (Jangan Ditambah Tanpa Diminta)

- **Tidak ada job tracker/kanban board.** Status rekrutmen cukup sebagai label visual di email, bukan record tersimpan terpisah.
- **Tidak ada auto-apply/auto-fill form lamaran.** Apply tetap manual, aplikasi hanya redirect ke platform asli.
- **Tidak dirancang multi-user.** Jangan tambahkan auth multi-user, role, atau billing kecuali diminta secara eksplisit di kemudian hari.

---

## Alur Kerja yang Disarankan

1. Baca `product.md` untuk pastikan fitur yang dikerjakan sesuai kebutuhan asli.
2. Baca `architecture.md` untuk struktur folder, schema, dan flow teknis yang sudah disepakati.
3. Implementasi mengikuti struktur yang ada — jangan restrukturisasi folder/pola arsitektur tanpa didiskusikan dulu.
4. Tulis test Pest untuk bagian kritikal (lihat daftar di atas) sebelum menganggap task selesai.
5. Kalau ada keputusan desain baru yang berubah dari `architecture.md` (misal ganti library scraping), update juga dokumen tersebut supaya tetap sinkron.
