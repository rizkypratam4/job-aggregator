<?php

use App\Support\EmailClassifier;

beforeEach(function () {
    $this->classifier = new EmailClassifier();
});

it('detects interview status from Indonesian subject', function () {
    $result = $this->classifier->classify('Undangan Interview - Backend Developer', '');

    expect($result)->toBe('interview');
});

it('detects interview status from English subject', function () {
    $result = $this->classifier->classify('Interview Invitation for Software Engineer Role', '');

    expect($result)->toBe('interview');
});

it('detects technical_test status from keyword in snippet', function () {
    $result = $this->classifier->classify('Next Steps', 'Please complete the technical test within 48 hours.');

    expect($result)->toBe('technical_test');
});

it('detects technical_test status from Indonesian keyword psikotes', function () {
    $result = $this->classifier->classify('Jadwal Psikotes', '');

    expect($result)->toBe('technical_test');
});

it('detects hr_interview status distinctly from generic interview', function () {
    $result = $this->classifier->classify('HR Interview Schedule', '');

    expect($result)->toBe('hr_interview');
});

it('detects user_interview status distinctly from generic interview', function () {
    $result = $this->classifier->classify('User Interview Session', '');

    expect($result)->toBe('user_interview');
});

it('detects offering status', function () {
    $result = $this->classifier->classify(
        'Selamat!',
        'We are pleased to offer you the position of Backend Developer.'
    );

    expect($result)->toBe('offering');
});

it('detects offering status from Indonesian keyword', function () {
    $result = $this->classifier->classify('Surat Penawaran Kerja', '');

    expect($result)->toBe('offering');
});

it('detects rejected status', function () {
    $result = $this->classifier->classify(
        'Update Lamaran Anda',
        'Unfortunately, we have decided to move forward with other candidates.'
    );

    expect($result)->toBe('rejected');
});

it('detects rejected status from Indonesian keyword', function () {
    $result = $this->classifier->classify('Informasi Hasil Seleksi', 'Mohon maaf, Anda belum berhasil melanjutkan ke tahap berikutnya.');

    expect($result)->toBe('rejected');
});

it('returns null when no recruitment keyword matches', function () {
    $result = $this->classifier->classify('Newsletter Mingguan', 'Promo diskon 50% untuk semua produk kami.');

    expect($result)->toBeNull();
});

it('returns null for generic thank you email without status keywords', function () {
    $result = $this->classifier->classify('Terima kasih', 'Terima kasih sudah menghubungi kami.');

    expect($result)->toBeNull();
});

it('is case insensitive when matching keywords', function () {
    $result = $this->classifier->classify('UNDANGAN INTERVIEW - BACKEND DEVELOPER', '');

    expect($result)->toBe('interview');
});

it('matches keyword found only in snippet, not subject', function () {
    $result = $this->classifier->classify('Informasi Lanjutan', 'Kami ingin jadwal interview dengan Anda minggu depan.');

    expect($result)->toBe('interview');
});
