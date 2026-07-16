<?php

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| Baris di bawah ini memberi tahu Pest agar semua test di folder Feature
| dan Unit menggunakan class Tests\TestCase (extends Laravel base
| TestCase), plus RefreshDatabase khusus untuk Feature. Tanpa ini,
| helper seperti config(), Http::fake(), dan database testing tidak
| akan ter-boot dengan benar — persis penyebab error
| "Target class [config] does not exist" sebelumnya.
|
*/

uses(TestCase::class, RefreshDatabase::class)->in('Feature');
uses(TestCase::class)->in('Unit');
