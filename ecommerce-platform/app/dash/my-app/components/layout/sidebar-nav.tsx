'use client';

import { usePathname } from 'next/navigation';
import { NavGroup } from '../../types/nav.types';
import { AdminRole } from '../../types/admin-user.types';
import SidebarNavGroup from './sidebar-nav-group';

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'main',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard', iconName: 'LayoutGrid' },
      { id: 'categories', label: 'Categories', href: '/categories', iconName: 'FolderTree' },
      { id: 'products', label: 'Products', href: '/products', iconName: 'Box' },
      { id: 'favorites', label: 'Favorites', href: '/favorites', iconName: 'Heart' },
      { id: 'inbox', label: 'Inbox', href: '/inbox', iconName: 'Mail' },
      { id: 'orders', label: 'Order Lists', href: '/orders', iconName: 'ListOrdered', badgeCount: 5 },
      { id: 'customers', label: 'Customers', href: '/customers', iconName: 'Users' },
      { id: 'stock', label: 'Product Stock', href: '/stock', iconName: 'Package' },
    ],
  },
  {
    id: 'pages',
    title: 'PAGES',
    items: [
      { id: 'pricing', label: 'Pricing', href: '/dashboard/pricing', iconName: 'Tag' },
      { id: 'calendar', label: 'Calendar', href: '/dashboard/calendar', iconName: 'Calendar' },
      { id: 'todo', label: 'To-Do', href: '/dashboard/todo', iconName: 'CheckSquare' },
      { id: 'team', label: 'Team', href: '/dashboard/team', iconName: 'Users' },
      { id: 'ui-elements', label: 'UI Elements', href: '/dashboard/ui', iconName: 'FileText' },
    ],
  },
];

interface SidebarNavProps {
  isCollapsed: boolean;
  userRole?: AdminRole;
}

const SidebarNav = ({ isCollapsed, userRole }: SidebarNavProps) => {
  const pathname = usePathname();

  const filteredGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !item.rolesAllowed || (userRole && item.rolesAllowed.includes(userRole))
    ),
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
