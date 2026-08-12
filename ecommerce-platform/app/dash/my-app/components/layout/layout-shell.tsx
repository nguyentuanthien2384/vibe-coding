'use client';

import { useSidebarStore } from '../../store/sidebar.store';
import { useAdminAuthInit } from '../../hooks/use-admin-auth-init';
import AdminSidebar from './admin-sidebar';
import AdminHeader from './admin-header';
import AdminMainContent from './admin-main-content';

interface LayoutShellProps {
  children: React.ReactNode;
}

const LayoutShell = ({ children }: LayoutShellProps) => {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  // Tự động khởi tạo phiên & tải thông tin người dùng từ Backend /api/v1/auth/me
  useAdminAuthInit();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6FA]">
      <AdminSidebar />

      {/* Main area — offset by sidebar width via Tailwind class */}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        <AdminHeader />
        <AdminMainContent>{children}</AdminMainContent>
      </div>
    </div>
  );
};

export default LayoutShell;
