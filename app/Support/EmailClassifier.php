<?php

namespace App\Support;

class EmailClassifier
{
    private const KEYWORD_MAP = [
        'rejected' => [
            'unfortunately',
            'tidak dapat melanjutkan',
            'belum berhasil',
            'belum dapat melanjutkan',
            'not moving forward',
            'we regret',
            'mohon maaf',
            'kandidat lain',
            'not selected',
            'tidak lolos',
        ],
        'offering' => [
            'pleased to offer',
            'job offer',
            'offering letter',
            'surat penawaran',
            'menawarkan posisi',
            'welcome to the team',
            'selamat bergabung',
            'letter of offer',
        ],
        'technical_test' => [
            'technical test',
            'coding test',
            'take home test',
            'take-home assignment',
            'psikotes',
            'psychotest',
            'tes teknis',
            'skill assessment',
            'online assessment',
            'technical assessment',
            'tes psikologi',
        ],
        'user_interview' => [
            'user interview',
            'interview with user',
            'interview dengan user',
        ],
        'hr_interview' => [
            'hr interview',
            'interview dengan hr',
            'interview with hr',
        ],
        'interview' => [
            'schedule an interview',
            'jadwal interview',
            'undangan interview',
            'interview invitation',
            'jadwal wawancara',
            'undangan wawancara',
            'would like to interview',
            'interview process',
        ],
    ];

    public function classify(string $subject, string $snippet = ''): ?string
    {
        $text = strtolower($subject . ' ' . $snippet);

        foreach (self::KEYWORD_MAP as $status => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($text, strtolower($keyword))) {
                    return $status;
                }
            }
        }

        return null;
    }
}
