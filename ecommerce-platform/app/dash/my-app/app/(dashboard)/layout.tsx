import React from 'react';
import LayoutShell from '../../components/layout/layout-shell';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return <LayoutShell>{children}</LayoutShell>;
};

export default DashboardLayout;
