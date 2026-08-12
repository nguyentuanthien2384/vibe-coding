'use client';

import { useState, useRef, useEffect } from 'react';
import { useAdminAuthStore } from '../../../store/admin-auth.store';
import UserAvatar from '../../../components/ui/user-avatar';
import UserMenuPopover from '../../../components/ui/user-menu-popover';
import { MoreVertical } from 'lucide-react';

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAdminAuthStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.assign('/login');
  };

  const displayName = user?.fullName || 'Admin User';
  const displayRole = user?.role === 'ADMIN' ? 'Admin' : 'Staff';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <UserAvatar name={displayName} avatarUrl={user?.avatarUrl} size="md" role={user?.role || 'ADMIN'} />
        <div className="hidden md:block text-left">
          <p className="text-sm font-bold text-[#202224] leading-none">{displayName}</p>
          <p className="text-[12px] font-semibold text-[#202224] opacity-60 mt-1">
            {displayRole}
          </p>
        </div>
        <MoreVertical className="hidden md:block w-4 h-4 text-[#202224] opacity-60" />
      </button>

      {isOpen && user && (
        <UserMenuPopover
          user={user}
          onClose={() => setIsOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default UserProfileDropdown;
