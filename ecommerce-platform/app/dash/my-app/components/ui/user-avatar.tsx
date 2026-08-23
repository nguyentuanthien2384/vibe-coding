'use client';

import { useState, useEffect } from 'react';
import { AdminRole } from '../../types/admin-user.types';
import { getImageUrl } from '../../lib/image-url';

export interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  role?: AdminRole;
}

const sizeMap = {
  sm: { container: 'w-7 h-7', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-11 h-11', text: 'text-base' },
};

const UserAvatar = ({ name, avatarUrl, size = 'md', role }: UserAvatarProps) => {
  const { container, text } = sizeMap[size];
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [avatarUrl]);

  const initials = (name || 'User')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  const fullImageUrl = avatarUrl ? getImageUrl(avatarUrl) : null;
  const showImage = fullImageUrl && !hasError;

  return (
    <div className={`relative flex-shrink-0 ${container}`}>
      {showImage ? (
        <img
          src={fullImageUrl}
          alt={name}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover rounded-full border border-[#E0E0E0] dark:border-slate-700"
        />
      ) : (
        <div
          className={`w-full h-full ${text} flex items-center justify-center rounded-full bg-gradient-to-br from-[#4880FF] to-blue-600 text-white font-bold border border-[#E0E0E0] dark:border-slate-700 select-none shadow-xs`}
        >
          {initials}
        </div>
      )}
      {role === 'ADMIN' && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#4880FF] border-2 border-white dark:border-slate-900 rounded-full" />
      )}
    </div>
  );
};

export default UserAvatar;
