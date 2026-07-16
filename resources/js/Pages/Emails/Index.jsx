import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { withLayout } from '@/utils/withLayout';
import EmailCard from '@/Components/EmailCard';
import { RefreshCw } from 'lucide-react';

const PER_PAGE = 10;

const STATUS_LABEL_MAP = {
    interview: 'Interview',
    technical_test: 'Technical Test',
    hr_interview: 'HR Interview',
    user_interview: 'User Interview',
    offering: 'Offering',
    rejected: 'Rejected',
};

function formatTime(dateString) {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function openInGmail(gmailMessageId) {
    window.open(
        `https://mail.google.com/mail/u/0/#inbox/${gmailMessageId}`,
        '_blank'
    );
}

const Index = ({ emails }) => {
    const { flash } = usePage().props;
    const [page, setPage] = useState(1);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const totalPages = Math.ceil(emails.length / PER_PAGE);
    const start = (page - 1) * PER_PAGE;
    const paginatedEmails = emails.slice(start, start + PER_PAGE);

    const handleRefresh = () => {
        setIsRefreshing(true);

        router.post(
            '/emails/refresh',
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsRefreshing(false),
            }
        );
    };

    return (
            <div className="w-full">
                <div className="flex items-center justify-between mb-stack-md">
                    <h1 className="headline-element text-xl text-headline">Recruitment Emails</h1>

                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="label flex items-center gap-2 px-3 py-1.5 rounded-sm border border-outline-variant text-body hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                        {isRefreshing ? 'Menyinkronkan...' : 'Refresh'}
                    </button>
                </div>

                {flash?.status && (
                    <div className="mb-stack-md px-4 py-3 bg-primary/10 text-primary body-element rounded-sm">
                        {flash.status}
                    </div>
                )}

                <div className="bg-white border border-outline-variant rounded-md overflow-hidden">
                    {emails.length === 0 ? (
                        <div className="py-16 text-center text-on-surface-variant">
                            Belum ada email rekrutmen terdeteksi
                        </div>
                    ) : (
                        paginatedEmails.map((email) => (
                            <EmailCard
                                key={email.id}
                                sender={email.sender_email}
                                company={email.sender_domain}
                                subject={email.subject}
                                preview={email.snippet}
                                time={formatTime(email.received_at)}
                                status={STATUS_LABEL_MAP[email.detected_status] ?? 'Unlabeled'}
                                onClick={() => openInGmail(email.gmail_message_id)}
                            />
                        ))
                    )}
                </div>

                {emails.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-stack-sm mt-stack-md">
                        <p className="caption text-on-surface-variant">
                            Menampilkan {paginatedEmails.length} dari {emails.length} email
                        </p>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="label px-3 py-1.5 rounded-sm border border-outline-variant text-body hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Sebelumnya
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`label w-8 h-8 rounded-sm transition-colors ${p === page
                                            ? "bg-primary text-white font-semibold"
                                            : "text-body hover:bg-surface-container-high"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="label px-3 py-1.5 rounded-sm border border-outline-variant text-body hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
    );
};

export default withLayout(Index);