const statusStyles = {
    Interview: "bg-primary/10 text-tertiary-container",
    "Technical Test": "bg-primary/10 text-tertiary-container",
    "HR Interview": "bg-primary/10 text-tertiary-container",
    "User Interview": "bg-primary/10 text-tertiary-container",
    Offering: "bg-success/10 text-success",
    Rejected: "bg-danger/10 text-danger",
    Unlabeled: "bg-surface-container-high text-body",
};

const EmailCard = ({ sender, company, subject, preview, time, status, onClick }) => {
    const badgeClass = statusStyles[status] ?? statusStyles.Unlabeled;

    return (
        <div
            onClick={onClick}
            className="px-stack-lg py-stack-md border-b border-outline-variant last:border-b-0 hover:bg-surface-container-low transition-colors cursor-pointer"
        >
            <div className="flex items-start justify-between gap-stack-sm">
                <span className="body-element text-body">
                    {sender} <span className="text-on-surface-variant">({company})</span>
                </span>
                <span className="caption text-on-surface-variant shrink-0">{time}</span>
            </div>

            <h3 className="headline-element text-base sm:text-lg text-headline mt-1">{subject}</h3>

            <div className="flex items-start justify-between gap-stack-md mt-1">
                <p className="body-element text-tertiary line-clamp-1 flex-1 min-w-0">{preview}</p>
                <span className={`label px-2.5 py-1 rounded-full shrink-0 ${badgeClass}`}>{status}</span>
            </div>
        </div>
    );
};

export default EmailCard;