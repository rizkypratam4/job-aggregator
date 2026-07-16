const MatchScoreBadge = ({ score }) => {
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="w-14 h-14 rounded-2xl bg-green-100 border-2 border-green-300 flex items-center justify-center">
                <span className="font-bold text-green-600 text-lg">{score}</span>
            </div>
            <span className="label text-body text-center">Match Score</span>
        </div>
    );
};

export default MatchScoreBadge;