import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
}

export const SectionHeader = ({
  title,
  subtitle,
  actionLabel,
  actionHref,
}: SectionHeaderProps) => {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="text-sm font-semibold text-orange-600 hover:text-orange-500 hover:underline underline-offset-2 transition-colors"
        >
          {actionLabel} →
        </Link>
      )}
    </div>
  );
};
