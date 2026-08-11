"use client";

import React from 'react';
import Link from 'next/link';
import { UserProfile } from '../../types/auth.types';

export type ProfileTab = 'info' | 'orders' | 'addresses' | 'favorites' | 'notifications';

interface ProfileSidebarProps {
  user: UserProfile;
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  onLogout: () => void;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  user,
  activeTab,
  onTabChange,
  onLogout,
}) => {
  const displayName = user.fullName || user.name || 'Thành viên';
  const initials = displayName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 sticky top-28 space-y-6 w-full min-w-0">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-xl sm:text-2xl mb-3 shadow-sm border-2 border-amber-200">
          {initials || 'NA'}
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate w-full px-2">
          {displayName}
        </h2>
        <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full mt-1.5 inline-block tracking-wide">
          Premium Member
        </span>
        <p className="text-xs text-slate-500 mt-1.5 truncate w-full px-2">
          {user.email}
        </p>
      </div>

      {/* Sidebar Menu */}
      <nav className="flex flex-col space-y-1.5">
        <button
          type="button"
          onClick={() => onTabChange('info')}
          className={`flex items-center gap-3 px-4 py-3 text-sm transition-all text-left w-full cursor-pointer min-w-0 ${
            activeTab === 'info'
              ? 'bg-orange-50 text-orange-600 font-bold border-l-4 border-orange-600 rounded-r-xl shadow-xs'
              : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900 rounded-xl font-medium border-l-4 border-transparent'
          }`}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="whitespace-nowrap truncate">Thông tin cá nhân</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('orders')}
          className={`flex items-center gap-3 px-4 py-3 text-sm transition-all text-left w-full cursor-pointer min-w-0 ${
            activeTab === 'orders'
              ? 'bg-orange-50 text-orange-600 font-bold border-l-4 border-orange-600 rounded-r-xl shadow-xs'
              : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900 rounded-xl font-medium border-l-4 border-transparent'
          }`}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span className="whitespace-nowrap truncate">Lịch sử đơn hàng</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('addresses')}
          className={`flex items-center gap-3 px-4 py-3 text-sm transition-all text-left w-full cursor-pointer min-w-0 ${
            activeTab === 'addresses'
              ? 'bg-orange-50 text-orange-600 font-bold border-l-4 border-orange-600 rounded-r-xl shadow-xs'
              : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900 rounded-xl font-medium border-l-4 border-transparent'
          }`}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="whitespace-nowrap truncate">Địa chỉ nhận hàng</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('favorites')}
          className={`flex items-center gap-3 px-4 py-3 text-sm transition-all text-left w-full cursor-pointer min-w-0 ${
            activeTab === 'favorites'
              ? 'bg-orange-50 text-orange-600 font-bold border-l-4 border-orange-600 rounded-r-xl shadow-xs'
              : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900 rounded-xl font-medium border-l-4 border-transparent'
          }`}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="whitespace-nowrap truncate">Món yêu thích</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('notifications')}
          className={`flex items-center gap-3 px-4 py-3 text-sm transition-all text-left w-full cursor-pointer min-w-0 ${
            activeTab === 'notifications'
              ? 'bg-orange-50 text-orange-600 font-bold border-l-4 border-orange-600 rounded-r-xl shadow-xs'
              : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900 rounded-xl font-medium border-l-4 border-transparent'
          }`}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" />
          </svg>
          <span className="whitespace-nowrap truncate">Thông báo của tôi</span>
        </button>

        {user.role === 'ADMIN' && (
          <Link
            href="/admin/email-logs"
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-all text-left w-full cursor-pointer min-w-0"
          >
            <span className="text-base">⚡</span>
            <span className="whitespace-nowrap truncate">Quản lý Email Logs</span>
          </Link>
        )}

        <div className="pt-3 mt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm w-full cursor-pointer min-w-0"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="whitespace-nowrap truncate">Đăng xuất</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
