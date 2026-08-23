'use client';

import { AdminUser } from '../../../types/admin-user.types';
import UserAvatar from '../../../components/ui/user-avatar';
import { ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';

interface ProfileHeaderProps {
  user: AdminUser | null;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  if (!user) return null;

  const displayName = user.fullName || 'Admin User';
  const roleLabel = user.role === 'ADMIN' ? 'Super Admin' : (user.roleGroupName || 'Nhân Viên Quản Trị');
  const roleBadgeBg =
    user.role === 'ADMIN'
      ? 'bg-blue-50 text-[#4880FF] border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <UserAvatar
              name={displayName}
              avatarUrl={user.avatarUrl}
              size="lg"
              role={user.role}
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                {displayName}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleBadgeBg}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {roleLabel}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
          <Calendar className="w-4 h-4 text-[#4880FF]" />
          <span>Phiên làm việc bảo mật Active</span>
        </div>
      </div>
    </div>
  );
}
