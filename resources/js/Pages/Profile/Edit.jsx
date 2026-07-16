import { withLayout } from '@/utils/withLayout';
import TagInput from '@/Components/TagInput';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { Save } from "lucide-react";


const workTypeOptions = [
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'Onsite' },
    { value: 'any', label: 'Any' },
];

const levelOptions = [
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid' },
    { value: 'senior', label: 'Senior' },
];

const Edit = ({ profile }) => {
    const { data, setData, post, processing, errors } = useForm({
        primary_skills: profile?.primary_skills ?? [],
        secondary_skills: profile?.secondary_skills ?? [],
        years_of_experience: profile?.years_of_experience ?? '',
        experience_summary: profile?.experience_summary ?? '',
        preferred_locations: profile?.preferred_locations ?? [],
        work_type: profile?.work_type ?? 'any',
        level: profile?.level ?? '',
        expected_salary_min: profile?.expected_salary_min ?? '',
        expected_salary_max: profile?.expected_salary_max ?? '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/profile');
    };

    return (
        <div className="p-gutter md:p-margin-page max-w-3xl mx-auto">
            <form
                onSubmit={handleSubmit}
                className="bg-white border border-outline-variant rounded-md p-stack-lg flex flex-col gap-stack-lg"
            >
                <TagInput
                    label="Skill Utama"
                    helperText="Pisahkan dengan koma (contoh: React, Laravel, PostgreSQL)"
                    tags={data.primary_skills}
                    onChange={(tags) => setData('primary_skills', tags)}
                    placeholder="Tambahkan skill..."
                />
                {errors.primary_skills && (
                    <p className="text-danger text-sm -mt-4">{errors.primary_skills}</p>
                )}

                <TagInput
                    label="Skill Sekunder"
                    tags={data.secondary_skills}
                    onChange={(tags) => setData('secondary_skills', tags)}
                    placeholder="Tambahkan skill sekunder..."
                />
                {errors.secondary_skills && (
                    <p className="text-danger text-sm -mt-4">{errors.secondary_skills}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-stack-md">
                    <div>
                        <TextInput
                            label="Pengalaman Kerja (tahun)"
                            type="number"
                            min="0"
                            max="60"
                            value={data.years_of_experience}
                            onChange={(value) => setData('years_of_experience', value)}
                            placeholder="Contoh: 3"
                            error={errors.years_of_experience}
                        />
                    </div>

                    <div>
                        <label className="label text-headline block mb-1.5">Level</label>
                        <select
                            value={data.level}
                            onChange={(e) => setData('level', e.target.value)}
                            className="w-full bg-white border border-outline-variant rounded-sm px-3 py-2 body-element text-primary font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        >
                            <option value="">Pilih level...</option>
                            {levelOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {errors.level && (
                            <p className="text-danger text-sm mt-1">{errors.level}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="label text-headline block mb-1.5">Ringkasan Pengalaman</label>
                    <textarea
                        value={data.experience_summary}
                        onChange={(e) => setData('experience_summary', e.target.value)}
                        placeholder="Tuliskan secara singkat pengalaman profesional Anda..."
                        rows={4}
                        maxLength={2000}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-sm px-3 py-2 body-element text-headline placeholder:text-on-surface-variant resize-y focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                    {errors.experience_summary && (
                        <p className="text-danger text-sm mt-1">{errors.experience_summary}</p>
                    )}
                </div>

                <TagInput
                    label="Lokasi Preferensi"
                    tags={data.preferred_locations}
                    onChange={(tags) => setData('preferred_locations', tags)}
                    placeholder="Tambahkan lokasi..."
                />
                {errors.preferred_locations && (
                    <p className="text-danger text-sm -mt-4">{errors.preferred_locations}</p>
                )}

                <div>
                    <label className="label text-headline block mb-2">Tipe Kerja</label>
                    <div className="flex flex-wrap items-center gap-stack-md">
                        {workTypeOptions.map((option) => (
                            <label key={option.value} className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="radio"
                                    name="workType"
                                    value={option.value}
                                    checked={data.work_type === option.value}
                                    onChange={(e) => setData('work_type', e.target.value)}
                                    className="w-4 h-4 accent-primary cursor-pointer"
                                />
                                <span className="body-element text-headline">{option.label}</span>
                            </label>
                        ))}
                    </div>
                    {errors.work_type && (
                        <p className="text-danger text-sm mt-1">{errors.work_type}</p>
                    )}
                </div>

                <div>
                    <label className="label text-headline block mb-1.5">Rentang Gaji Diharapkan (IDR)</label>
                    <div className="flex items-start gap-stack-sm">
                        <TextInput
                            type="number"
                            min="0"
                            value={data.expected_salary_min}
                            onChange={(value) => setData('expected_salary_min', value)}
                            placeholder="Rp Min"
                            error={errors.expected_salary_min}
                        />
                        <span className="text-on-surface-variant shrink-0 mt-2">-</span>
                        
                        <TextInput
                            type="number"
                            min="0"
                            value={data.expected_salary_max}
                            onChange={(value) => setData('expected_salary_max', value)}
                            placeholder="Rp Max"
                            error={errors.expected_salary_max}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-stack-sm border-t border-outline-variant">
                    <button
                        disabled={processing}
                        type="submit"
                        className="flex items-center gap-2 bg-primary text-white label px-4 py-2.5 rounded-sm hover:bg-tertiary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={16} />
                        {processing ? 'Menyimpan...' : 'Simpan Profil'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default withLayout(Edit);