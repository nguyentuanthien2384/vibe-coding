import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

export interface SidebarLogoProps {
  isCollapsed?: boolean;
  brandName?: string;
}

const SidebarLogo = ({ isCollapsed = false, brandName = 'DashStack' }: SidebarLogoProps) => {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2 px-6 py-5 border-b border-[#E0E0E0] hover:opacity-80 transition-opacity"
    >
      <div className="flex-shrink-0 text-[#4880FF]">
        <LayoutDashboard className="w-6 h-6" />
      </div>
      {!isCollapsed && (
        <span className="font-extrabold text-[20px] text-[#202224] tracking-tight truncate">
          {brandName}
        </span>
      )}
    </Link>
  );
};

export default SidebarLogo;
