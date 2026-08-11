import NotificationPopover from '@/features/notifications/components/notification-popover';
import UserProfileDropdown from '@/features/profile/components/user-profile-dropdown';

const HeaderActions = () => {
  return (
    <div className="flex items-center gap-6">
      {/* Notification Bell */}
      <NotificationPopover />

      {/* Divider */}
      <div className="h-6 w-px bg-[#E0E0E0]" />

      {/* User Profile */}
      <UserProfileDropdown />
    </div>
  );
};

export default HeaderActions;
