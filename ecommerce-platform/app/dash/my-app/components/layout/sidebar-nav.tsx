'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { NavGroup, NavItem } from '../../types/nav.types';
import { AdminRole } from '../../types/admin-user.types';
import { useAdminAuthStore } from '../../store/admin-auth.store';
import { useOrderStatsStore } from '../../store/order-stats.store';
import SidebarNavGroup from './sidebar-nav-group';

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'main',
    title: 'QUẢN LÝ KINH DOANH',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard', iconName: 'LayoutGrid' },
      { id: 'orders', label: 'Đơn hàng', href: '/orders', iconName: 'ListOrdered', permissionRequired: 'order.view' },
      { id: 'products', label: 'Sản phẩm', href: '/products', iconName: 'Box', permissionRequired: 'product.view' },
      { id: 'categories', label: 'Danh mục', href: '/categories', iconName: 'FolderTree', permissionRequired: 'category.manage' },
      { id: 'media', label: 'Quản lý Media', href: '/media', iconName: 'Image', permissionRequired: 'product.view' },
      { id: 'customers', label: 'Khách hàng', href: '/customers', iconName: 'Users', permissionRequired: 'customer.view' },
    ],
  },
  {
    id: 'system',
    title: 'HỆ THỐNG & CÀI ĐẶT',
    items: [
      { id: 'staffs', label: 'Nhân sự & Phân quyền', href: '/staffs', iconName: 'ShieldCheck', rolesAllowed: ['ADMIN'] },
      { id: 'settings', label: 'Cài đặt hệ thống', href: '/settings', iconName: 'Settings', permissionsRequired: ['setting.manage', 'banner.manage', 'point.manage'] },
      { id: 'profile', label: 'Hồ sơ cá nhân', href: '/profile', iconName: 'UserCheck' },
    ],
  },
];

interface SidebarNavProps {
  isCollapsed: boolean;
  userRole?: AdminRole;
}

const SidebarNav = ({ isCollapsed }: SidebarNavProps) => {
  const pathname = usePathname();
  const user = useAdminAuthStore((s) => s.user);
  const userRole = user?.role;
  const userPermissions = user?.permissions || [];

  const { pendingCount, fetchPendingCount } = useOrderStatsStore();

  // Tự động tải số lượng đơn hàng chờ xử lý và làm mới định kỳ mỗi 30s
  useEffect(() => {
    if (user) {
      fetchPendingCount();
      const timer = setInterval(() => {
        fetchPendingCount();
      }, 30000);
      return () => clearInterval(timer);
    }
  }, [user, fetchPendingCount]);

  const isItemAllowed = (item: NavItem): boolean => {
    // 1. Quản trị viên (ADMIN) luôn luôn có toàn quyền truy cập tất cả chức năng
    if (userRole === 'ADMIN') return true;

    // 2. Kiểm tra nếu Menu giới hạn cứng theo Role (VD: rolesAllowed: ['ADMIN'])
    if (item.rolesAllowed && (!userRole || !item.rolesAllowed.includes(userRole))) {
      return false;
    }

    // 3. Kiểm tra Phân quyền chi tiết (Fine-grained Permissions) đối với STAFF
    if (item.permissionsRequired && item.permissionsRequired.length > 0) {
      const hasAny = item.permissionsRequired.some(
        (p) => userPermissions.includes(p) || userPermissions.includes('*'),
      );
      if (!hasAny) return false;
    }

    if (item.permissionRequired) {
      return userPermissions.includes(item.permissionRequired) || userPermissions.includes('*');
    }

    return true;
  };

  const filteredGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items
      .filter(isItemAllowed)
      .map((item) => {
        // Gắn số lượng đơn hàng chưa xử lý động vào menu "Đơn hàng"
        if (item.id === 'orders') {
          return {
            ...item,
            badgeCount: pendingCount,
          };
        }
        return item;
      }),
  })).filter((group) => group.items.length > 0);

  return (
    <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-200">
      {filteredGroups.map((group) => (
        <SidebarNavGroup
          key={group.id}
          group={group}
          currentPath={pathname}
          isCollapsed={isCollapsed}
        />
      ))}
    </nav>
  );
};

export default SidebarNav;

