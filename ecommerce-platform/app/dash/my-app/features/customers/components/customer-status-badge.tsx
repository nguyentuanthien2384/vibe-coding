import { CustomerStatus } from '../types/customer.types';

interface CustomerStatusBadgeProps {
  status: CustomerStatus;
  className?: string;
}

const statusConfig: Record<CustomerStatus, { label: string; style: string }> = {
  ACTIVE: {
    label: 'Hoạt động',
    style: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  },
  BLOCKED: {
    label: 'Tạm khóa',
    style: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
  },
  INACTIVE: {
    label: 'Chưa kích hoạt',
    style: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
};

const CustomerStatusBadge = ({ status, className = '' }: CustomerStatusBadgeProps) => {
  const { label, style } = statusConfig[status] || statusConfig.ACTIVE;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
      {label}
    </span>
  );
};

export default CustomerStatusBadge;
