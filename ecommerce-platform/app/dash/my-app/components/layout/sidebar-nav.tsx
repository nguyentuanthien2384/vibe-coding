'use client';

import { usePathname } from 'next/navigation';
import { NavGroup, NavItem } from '../../types/nav.types';
import { AdminRole } from '../../types/admin-user.types';
import { useAdminAuthStore } from '../../store/admin-auth.store';
import SidebarNavGroup from './sidebar-nav-group';

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'main',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard', iconName: 'LayoutGrid' },
      { id: 'categories', label: 'Categories', href: '/categories', iconName: 'FolderTree', permissionRequired: 'category.manage' },
      { id: 'products', label: 'Products', href: '/products', iconName: 'Box', permissionRequired: 'product.view' },
      { id: 'favorites', label: 'Favorites', href: '/favorites', iconName: 'Heart', rolesAllowed: ['ADMIN'] },
      { id: 'inbox', label: 'Inbox', href: '/inbox', iconName: 'Mail', rolesAllowed: ['ADMIN'] },
      { id: 'orders', label: 'Order Lists', href: '/orders', iconName: 'ListOrdered', badgeCount: 5, permissionRequired: 'order.view' },
      { id: 'customers', label: 'Customers', href: '/customers', iconName: 'Users', permissionRequired: 'customer.view' },
      { id: 'staffs', label: 'Staffs', href: '/staffs', iconName: 'ShieldCheck', rolesAllowed: ['ADMIN'] },
      { id: 'stock', label: 'Product Stock', href: '/stock', iconName: 'Package', permissionRequired: 'product.view' },
      { id: 'settings', label: 'Settings', href: '/settings', iconName: 'Settings', permissionsRequired: ['setting.manage', 'banner.manage'] },
    ],
  },
  {
    id: 'pages',
    title: 'PAGES',
    items: [
      { id: 'pricing', label: 'Pricing', href: '/dashboard/pricing', iconName: 'Tag', rolesAllowed: ['ADMIN'] },
      { id: 'calendar', label: 'Calendar', href: '/dashboard/calendar', iconName: 'Calendar' },
      { id: 'todo', label: 'To-Do', href: '/dashboard/todo', iconName: 'CheckSquare' },
      { id: 'team', label: 'Team', href: '/dashboard/team', iconName: 'Users', rolesAllowed: ['ADMIN'] },
      { id: 'ui-elements', label: 'UI Elements', href: '/dashboard/ui', iconName: 'FileText', rolesAllowed: ['ADMIN'] },
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
    items: group.items.filter(isItemAllowed),
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
