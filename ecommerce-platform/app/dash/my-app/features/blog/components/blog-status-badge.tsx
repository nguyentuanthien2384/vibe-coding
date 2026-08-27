import { PostStatus } from '../types/blog.types';

interface BlogStatusBadgeProps {
  status: PostStatus;
  className?: string;
}

const STATUS_CONFIG: Record<PostStatus, { label: string; className: string; dot: string }> = {
  PUBLISHED: {
    label: 'Đã xuất bản',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
  SCHEDULED: {
    label: 'Lên lịch',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
  },
  DRAFT: {
    label: 'Bản nháp',
    className: 'bg-slate-100 text-slate-600 border border-slate-200',
    dot: 'bg-slate-400',
  },
  ARCHIVED: {
    label: 'Lưu trữ',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
    dot: 'bg-amber-500',
  },
};

export default function BlogStatusBadge({ status, className = '' }: BlogStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold text-xs px-2.5 py-1 rounded-full ${config.className} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
}
