import { CustomerType } from '../types/customer.types';
import { UserCheck, UserX } from 'lucide-react';

interface CustomerTypeBadgeProps {
  type: CustomerType;
  className?: string;
}

const typeConfig: Record<CustomerType, { label: string; style: string; icon: typeof UserCheck }> = {
  REGISTERED: {
    label: 'Thành viên',
    style: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    icon: UserCheck,
  },
  GUEST: {
    label: 'Vãng lai',
    style: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    icon: UserX,
  },
};

const CustomerTypeBadge = ({ type, className = '' }: CustomerTypeBadgeProps) => {
  const { label, style, icon: Icon } = typeConfig[type] || typeConfig.REGISTERED;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${style} ${className}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
};

export default CustomerTypeBadge;
