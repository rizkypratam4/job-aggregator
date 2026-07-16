<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;

class GmailAuthController extends Controller
{
    // Scope tambahan di luar scope default Socialite untuk Google.
    private const SCOPES = [
        'https://www.googleapis.com/auth/gmail.readonly',
    ];

    // Tampilkan Login, atau redirect ke Dashboard jika sudah login.
    public function index(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Login');
    }

    // Redirect ke Google OAuth saat login dengan Google.
    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')
            ->scopes(self::SCOPES)
            ->with([
                'access_type' => 'offline',
                'prompt' => 'consent',
            ])
            ->redirect();
    }

    // Handle callback Google dan simpan/update data user.
    public function handleCallback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (InvalidStateException $e) {
            report($e);

            return redirect()
                ->route('login')
                ->with('error', 'Sesi login kedaluwarsa, silakan coba lagi.');
        } catch (Exception $e) {
            report($e);

            return redirect()
                ->route('login')
                ->with('error', 'Gagal menyambungkan akun Google. Silakan coba lagi.');
        }

        $expiresAt = $googleUser->expiresIn
            ? now()->addSeconds($googleUser->expiresIn)
            : null;

        $existingUser = User::where('email', $googleUser->getEmail())->first();

        $user = User::updateOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name' => $googleUser->getName(),
                'google_id' => $googleUser->getId(),
                'gmail_access_token' => $googleUser->token,
                'gmail_refresh_token' => $googleUser->refreshToken ?? $existingUser?->gmail_refresh_token,
                'gmail_token_expires_at' => $expiresAt,
            ]
        );

        Auth::login($user, remember: true);

        return redirect()->route('dashboard');
    }

    // Logout dan hapus session, token Gmail tetap disimpan.
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
