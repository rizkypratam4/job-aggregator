import { MapPin, Laptop, Wallet } from "lucide-react";
import MatchScoreBadge from "./MatchScoreBadge";

const JobMatchCard = ({
    icon: Icon,
    title,
    company,
    location,
    matchScore,
    matchReason,
    workType,
    salaryRange,
    onClick,
}) => {
    const hasExtras = Boolean(workType || salaryRange || matchReason);

    return (
        <div
            onClick={onClick}
            className={`bg-white border border-outline-variant rounded-md p-stack-md flex flex-col sm:flex-row sm:justify-between gap-stack-sm hover:bg-surface-container-low transition-colors group cursor-pointer border-l-[3px] border-l-transparent hover:border-l-primary shadow-sm border-r border-primary/10 ${hasExtras ? "sm:items-start" : "items-center sm:items-start"
                }`}
        >
            <div className="flex flex-col gap-stack-sm min-w-0 w-full">
                <div className={`flex gap-stack-sm ${hasExtras ? "items-start" : "items-center"}`}>
                    {Icon && (
                        <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/10">
                            <Icon size={18} className="text-primary" />
                        </div>
                    )}
                    <div className="flex flex-col min-w-0">
                        <h4 className="headline-element text-base sm:text-lg text-headline leading-tight group-hover:text-primary transition-colors">
                            {title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="body-element text-sm text-headline font-medium">{company}</span>
                            <span className="w-1 h-1 bg-outline rounded-full"></span>
                            <span className="body-element text-sm text-body flex items-center gap-1">
                                <MapPin size={12} /> {location}
                            </span>
                        </div>
                    </div>
                </div>

                {(workType || salaryRange) && (
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        {workType && (
                            <span className="label bg-surface-container-high text-body px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap">
                                <Laptop size={12} /> {workType}
                            </span>
                        )}
                        {salaryRange && (
                            <span className="label bg-surface-container-high text-body px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap">
                                <Wallet size={12} /> {salaryRange}
                            </span>
                        )}
                    </div>
                )}

                {!hasExtras && matchScore != null && (
                    <div className="sm:hidden mt-1">
                        <MatchScoreBadge score={matchScore} />
                    </div>
                )}
            </div>

            <div className="hidden sm:flex flex-row sm:flex-col items-center sm:items-end gap-stack-sm sm:gap-1 shrink-0">
                {matchScore != null && <MatchScoreBadge score={matchScore} />}
                {matchReason && (
                    <p className="body-element text-sm text-body sm:text-right max-w-full sm:max-w-[200px] mt-1">
                        {matchReason}
                    </p>
                )}
            </div>

            {hasExtras && (
                <div className="flex sm:hidden flex-row items-center gap-stack-sm">
                    {matchScore != null && <MatchScoreBadge score={matchScore} />}
                    {matchReason && (
                        <p className="body-element text-sm text-body max-w-full mt-1">{matchReason}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default JobMatchCard;