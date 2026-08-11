import { Bell } from 'lucide-react';

export interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
}

const NotificationBell = ({ unreadCount, onClick }: NotificationBellProps) => {
  return (
    <button
      onClick={onClick}
      className="relative p-1 text-[#202224] hover:opacity-70 transition-opacity"
      aria-label="Thông báo"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
      )}
    </button>
  );
};

export default NotificationBell;
