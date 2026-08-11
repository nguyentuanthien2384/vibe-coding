'use client';

import { useEffect } from 'react';
import { useSidebarStore } from '../../store/sidebar.store';

/**
 * Syncs the Zustand sidebar state to a CSS custom property
 * so the layout offset can be driven purely by CSS.
 */
const SidebarCssSync = () => {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? '64px' : '256px'
    );
  }, [isCollapsed]);

  return null;
};

export default SidebarCssSync;
