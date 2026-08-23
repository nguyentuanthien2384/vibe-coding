import Link from 'next/link';
import { User, Settings, LogOut } from 'lucide-react';
import { AdminUser } from '../../types/admin-user.types';

export interface UserMenuPopoverProps {
  user: AdminUser;
  onClose: () => void;
  onLogout: () => void;
}

const UserMenuPopover = ({ user, onClose, onLogout }: UserMenuPopoverProps) => {
  return (
    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E0E0E0] py-1 z-50">
      {/* User Info */}
      <div className="px-4 py-3 border-b border-[#F1F4F9]">
        <p className="text-sm font-bold text-[#202224] truncate">{user.fullName}</p>
        <p className="text-xs text-[#202224] opacity-60 truncate mt-0.5">{user.email}</p>
        <span className="inline-flex mt-1.5 items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#E5EFFF] text-[#4880FF]">
          {user.role === 'ADMIN' ? '🛡 Admin' : '👤 Staff'}
        </span>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        <Link
          href="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#202224] opacity-70 hover:bg-[#F1F4F9] hover:opacity-100 transition-all"
        >
          <User className="w-4 h-4 text-[#4880FF]" />
          <span>Hồ sơ cá nhân & Bảo mật</span>
        </Link>
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#202224] opacity-70 hover:bg-[#F1F4F9] hover:opacity-100 transition-all"
        >
          <Settings className="w-4 h-4 text-slate-500" />
          <span>Cài đặt hệ thống</span>
        </Link>
      </div>

      {/* Logout */}
      <div className="border-t border-[#F1F4F9] py-1">
        <button
          onClick={() => { onLogout(); onClose(); }}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default UserMenuPopover;
