import { NavGroup } from '../../types/nav.types';
import SidebarNavItem from './sidebar-nav-item';

export interface SidebarNavGroupProps {
  group: NavGroup;
  currentPath: string;
  isCollapsed: boolean;
}

const SidebarNavGroup = ({ group, currentPath, isCollapsed }: SidebarNavGroupProps) => {
  return (
    <div className="mb-2">
      {group.title && !isCollapsed && (
        <p className="px-4 pt-5 pb-2 text-[12px] font-bold text-[#202224] opacity-60">
          {group.title}
        </p>
      )}
      {isCollapsed && group.title && (
        <div className="mx-3 my-2 border-t border-[#E0E0E0]" />
      )}
      <ul className="space-y-0.5">
        {group.items.map((item) => (
          <li key={item.id}>
            <SidebarNavItem
              item={item}
              isActive={currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href + '/'))}
              isCollapsed={isCollapsed}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarNavGroup;
