'use client';

import { useAdminAuthStore } from '../../store/admin-auth.store';
import { useSidebarStore } from '../../store/sidebar.store';
import SidebarLogo from '../ui/sidebar-logo';
import SidebarNav from './sidebar-nav';
import SidebarFooter from './sidebar-footer';

const AdminSidebar = () => {
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebarStore();
  const user = useAdminAuthStore((s) => s.user);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full bg-white border-r border-[#E0E0E0] flex flex-col
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <SidebarLogo isCollapsed={isCollapsed} />
        <SidebarNav isCollapsed={isCollapsed} userRole={user?.role} />
        <SidebarFooter isCollapsed={isCollapsed} />
      </aside>
    </>
  );
};

export default AdminSidebar;
