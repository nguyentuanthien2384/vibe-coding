export interface StatusBadgeProps {
  isActive: boolean;
  className?: string;
}

const StatusBadge = ({ isActive, className = '' }: StatusBadgeProps) => {
  if (isActive) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 transition-colors shadow-2xs ${className}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span>Hoạt động</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-slate-100 text-slate-600 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 transition-colors ${className}`}
    >
      <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
      <span>Tạm ẩn</span>
    </span>
  );
};

export default StatusBadge;

