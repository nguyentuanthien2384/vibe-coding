import React from 'react';
import LayoutShell from '../../components/layout/layout-shell';
import { ToastProvider } from '../../components/ui/toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <ToastProvider>
      <LayoutShell>{children}</LayoutShell>
    </ToastProvider>
  );
};

export default DashboardLayout;

