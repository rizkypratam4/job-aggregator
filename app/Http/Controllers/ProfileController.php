<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileRequest;
use App\Models\Profile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(): Response 
    {
        return Inertia::render('Profile/Edit', [
            'profile' => Profile::first(),
            'title' => 'Profile',
        ]);
    }

    public function update(ProfileRequest $request): RedirectResponse 
    {
        $validated = $request->validated();

        $profile = Profile::first() ?? new Profile();
        $profile->fill($validated);
        $profile->save();   
        
        return redirect()->route('profile.edit')->with('status', 'Profile berhasil disimpan');
    }
}
