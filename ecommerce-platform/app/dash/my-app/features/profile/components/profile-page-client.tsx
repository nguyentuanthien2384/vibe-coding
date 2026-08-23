'use client';

import React, { useState } from 'react';
import { useAdminAuthStore } from '../../../store/admin-auth.store';
import { ProfileTabType } from '../types/profile.types';
import ProfileHeader from './profile-header';
import ProfileInfoForm from './profile-info-form';
import ChangePasswordForm from './change-password-form';
import { User, KeyRound } from 'lucide-react';

export default function ProfilePageClient() {
  const user = useAdminAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<ProfileTabType>('info');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Profile */}
      <ProfileHeader user={user} />

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-1.5 shadow-sm">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'info'
                ? 'bg-[#4880FF] text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Thông Tin Cá Nhân</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#4880FF] text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Đổi Mật Khẩu & Bảo Mật</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'info' && <ProfileInfoForm user={user} />}
        {activeTab === 'security' && <ChangePasswordForm />}
      </div>
    </div>
  );
}
