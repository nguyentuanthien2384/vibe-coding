'use client';

import { useState, useRef, useEffect } from 'react';
import { useAdminAuthStore } from '../../../store/admin-auth.store';
import UserAvatar from '../../../components/ui/user-avatar';
import UserMenuPopover from '../../../components/ui/user-menu-popover';
import { MoreVertical } from 'lucide-react';

const MOCK_USER = {
  id: '1',
  fullName: 'Moni Roy',
  email: 'admin@example.com',
  avatarUrl: 'https://i.pravatar.cc/150?u=jonealy',
  role: 'ADMIN' as const,
};

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, setUser, logout } = useAdminAuthStore();

  // Seed mock user on mount if not set
  useEffect(() => {
    if (!user) setUser(MOCK_USER);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentUser = user ?? MOCK_USER;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <UserAvatar name={currentUser.fullName} avatarUrl={currentUser.avatarUrl} size="md" role={currentUser.role} />
        <div className="hidden md:block text-left">
          <p className="text-sm font-bold text-[#202224] leading-none">{currentUser.fullName}</p>
          <p className="text-[12px] font-semibold text-[#202224] opacity-60 mt-1">
            {currentUser.role === 'ADMIN' ? 'Admin' : 'Staff'}
          </p>
        </div>
        <MoreVertical className="hidden md:block w-4 h-4 text-[#202224] opacity-60" />
      </button>

      {isOpen && (
        <UserMenuPopover
          user={currentUser}
          onClose={() => setIsOpen(false)}
          onLogout={async () => {
            await logout();
            window.location.href = '/login';
          }}
        />
      )}
    </div>
  );
};

export default UserProfileDropdown;
