const StatCard = ({ title, value, badgeText, badgeIcon: BadgeIcon, cornerIcon: CornerIcon, cornerIconColor = "text-primary" }) => {
  return (
    <div className="bg-white border border-outline-variant rounded-md p-stack-lg flex flex-col justify-between relative overflow-hidden group hover:border-primary/30 transition-colors">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-on-primary-container/20 transition-colors"></div>

      <div className="flex items-start justify-between mb-stack-md relative z-10">
        <h2 className="text-sm text-body">{title}</h2>
        {CornerIcon && <CornerIcon size={24} className={cornerIconColor} />}
      </div>

      <div className="flex items-end gap-3 relative z-10">
        <span className="text-3xl font-bold text-headline">{value}</span>
        <span className="label text-tertiary-container mb-1 bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1">
          {BadgeIcon && <BadgeIcon size={14} />}
          {badgeText}
        </span>
      </div>
    </div>
  );
};

export default StatCard;