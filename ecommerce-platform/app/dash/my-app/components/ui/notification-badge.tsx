export interface NotificationBadgeProps {
  count: number;
  className?: string;
}

const NotificationBadge = ({ count, className = '' }: NotificationBadgeProps) => {
  if (count === 0) return null;
  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-orange-500 text-white rounded-full min-w-[20px] ${className}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default NotificationBadge;
