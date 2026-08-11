import QuickSettingsButton from './quick-settings-button';
import AdminLogoutButton from '../../features/auth/components/admin-logout-button';

interface SidebarFooterProps {
  isCollapsed: boolean;
}

const SidebarFooter = ({ isCollapsed }: SidebarFooterProps) => {
  return (
    <div className="border-t border-[#E0E0E0] px-4 py-3 space-y-0.5 mt-4">
      <QuickSettingsButton isCollapsed={isCollapsed} />
      <AdminLogoutButton isCollapsed={isCollapsed} />
    </div>
  );
};

export default SidebarFooter;
