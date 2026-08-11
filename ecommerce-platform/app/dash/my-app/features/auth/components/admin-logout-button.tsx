'use client';

import { useAdminAuthStore } from '../../../store/admin-auth.store';
import { LogOut } from 'lucide-react';

interface AdminLogoutButtonProps {
  isCollapsed?: boolean;
}

const AdminLogoutButton = ({ isCollapsed = false }: AdminLogoutButtonProps) => {
  const logout = useAdminAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <button
      onClick={handleLogout}
      title={isCollapsed ? 'Logout' : undefined}
      className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg text-[#202224] opacity-70 hover:bg-red-50 hover:text-red-600 hover:opacity-100 transition-all duration-200 ${
        isCollapsed ? 'justify-center px-0 mx-auto w-10' : ''
      }`}
    >
      <LogOut className="w-5 h-5 flex-shrink-0" />
      {!isCollapsed && <span className="text-sm font-semibold">Logout</span>}
    </button>
  );
};

export default AdminLogoutButton;
