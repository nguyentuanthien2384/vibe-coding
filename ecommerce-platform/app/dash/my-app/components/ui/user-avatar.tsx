import Image from 'next/image';
import { AdminRole } from '../../types/admin-user.types';

export interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  role?: AdminRole;
}

const sizeMap = {
  sm: { container: 'w-7 h-7', text: 'text-xs', px: 28 },
  md: { container: 'w-10 h-10', text: 'text-sm', px: 40 },
  lg: { container: 'w-11 h-11', text: 'text-base', px: 44 },
};

const UserAvatar = ({ name, avatarUrl, size = 'md', role }: UserAvatarProps) => {
  const { container, text, px } = sizeMap[size];
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={`relative flex-shrink-0 ${container}`}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name}
          width={px}
          height={px}
          className="object-cover rounded-full border border-[#E0E0E0]"
        />
      ) : (
        <div
          className={`${container} ${text} flex items-center justify-center rounded-full bg-gradient-to-br from-[#4880FF] to-blue-600 text-white font-semibold border border-[#E0E0E0]`}
        >
          {initials}
        </div>
      )}
      {role === 'ADMIN' && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#4880FF] border-2 border-white rounded-full" />
      )}
    </div>
  );
};

export default UserAvatar;
