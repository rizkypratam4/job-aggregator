import { withLayout } from '@/utils/withLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Briefcase, Mail, Sparkles } from 'lucide-react';
import StatCard from '@/Components/StatCard';
import JobMatchCard from '@/Components/JobMatchCard';

function Dashboard({ title }) {
    return (
        <>
            <Head title={title} />
            <section className='grid grid-cols-1 md:grid-cols-2 gap-stack-md mb-8'>
                <StatCard
                    title="Match Baru Minggu Ini"
                    value={12}
                    badgeText="+3 dari minggu lalu"
                    cornerIcon={Sparkles}
                />

                <StatCard
                    title="Email HR Belum Dibaca"
                    value={5}
                    badgeText="Membutuhkan perhatian segera"
                    cornerIcon={Mail}
                    cornerIconColor="text-headline"
                />
            </section>

            <section className='flex flex-col gap-stack-sm'>
                <div className='flex justify-between items-center'>
                    <h3 className='headline-element text-lg text-headline'>Top Matches</h3>
                    <Link href="/job" className="label text-primary hover:underline flex items-center gap-1">
                        Lihat Semua
                        <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="flex flex-col gap-stack-sm">
                    <JobMatchCard
                        icon={Briefcase}
                        title="Senior Product Manager"
                        company="GoTo"
                        location="Jakarta"
                        matchScore={95}
                    />
                </div>
            </section>
        </>
    );
}

export default withLayout(Dashboard);