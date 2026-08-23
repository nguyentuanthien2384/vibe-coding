'use client';

import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { NavItem } from '../../types/nav.types';
import { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

export interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onNavigate?: () => void;
}

const SidebarNavItem = ({ item, isActive, isCollapsed, onNavigate }: SidebarNavItemProps) => {
  const IconComponent = (LucideIcons as unknown as Record<string, ForwardRefExoticComponent<LucideProps & RefAttributes<SVGSVGElement>>>)[item.iconName];

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={isCollapsed ? (item.badgeCount ? `${item.label} (${item.badgeCount} đơn chưa xử lý)` : item.label) : undefined}
      className={`
        relative flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
        ${isActive
          ? 'bg-[#4880FF] text-white shadow-sm shadow-blue-500/20'
          : 'text-[#202224] opacity-70 hover:bg-[#F1F4F9] hover:opacity-100'
        }
        ${isCollapsed ? 'justify-center px-0 mx-auto w-10' : ''}
      `}
    >
      {IconComponent && (
        <IconComponent
          className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`}
        />
      )}
      {!isCollapsed && (
        <span className="text-sm font-semibold truncate">{item.label}</span>
      )}
      {!isCollapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
        <span
          className={`ml-auto flex-shrink-0 min-w-[20px] h-5 px-1.5 text-[11px] font-extrabold rounded-full inline-flex items-center justify-center transition-all ${
            isActive
              ? 'bg-white text-[#4880FF] shadow-xs'
              : 'bg-amber-500 text-white shadow-xs'
          }`}
        >
          {item.badgeCount > 99 ? '99+' : item.badgeCount}
        </span>
      )}
      {isCollapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
      )}
    </Link>
  );
};

export default SidebarNavItem;
