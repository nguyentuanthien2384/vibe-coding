'use client';

import { useSidebarStore } from '../../store/sidebar.store';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const SidebarToggleBtn = () => {
  const { isCollapsed, isMobileOpen, toggleCollapse, toggleMobile } = useSidebarStore();

  return (
    <>
      {/* Desktop toggle */}
      <button
        onClick={toggleCollapse}
        className="hidden lg:flex items-center justify-center w-9 h-9 rounded-lg text-[#202224] opacity-60 hover:bg-[#F1F4F9] hover:opacity-100 transition-all"
        aria-label="Toggle sidebar"
      >
        {isCollapsed ? (
          <PanelLeftOpen className="w-5 h-5" />
        ) : (
          <PanelLeftClose className="w-5 h-5" />
        )}
      </button>

      {/* Mobile toggle */}
      <button
        onClick={toggleMobile}
        className="flex lg:hidden items-center justify-center w-9 h-9 rounded-lg text-[#202224] opacity-60 hover:bg-[#F1F4F9] hover:opacity-100 transition-all"
        aria-label="Open menu"
      >
        <PanelLeftOpen className="w-5 h-5" />
      </button>
    </>
  );
};

export default SidebarToggleBtn;
