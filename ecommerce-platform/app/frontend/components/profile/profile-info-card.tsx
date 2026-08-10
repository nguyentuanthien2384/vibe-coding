"use client";

import React, { useState } from 'react';
import { UserProfile } from '../../types/auth.types';
import { updateProfileApi } from '../../lib/auth';
import { useAuthStore } from '../../store/use-auth-store';
import { showToast } from '../ui/toast';

interface ProfileInfoCardProps {
  user: UserProfile;
  onUpdateProfile?: (updatedUser: UserProfile) => void;
}

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  user,
  onUpdateProfile,
}) => {
  const setUser = useAuthStore((state) => state.setUser);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [fullName, setFullName] = useState(user.fullName || user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');

  // Status & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; phone?: string }>({});

  const validate = (): boolean => {
    const errors: { fullName?: string; phone?: string } = {};

    if (!fullName.trim()) {
      errors.fullName = 'Họ và tên không được để trống';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Họ và tên phải có tối thiểu 2 ký tự';
    }

    if (phone.trim()) {
      const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
      if (!phoneRegex.test(phone.trim())) {
        errors.phone = 'Số điện thoại không đúng định dạng (VD: 0901234567)';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStartEdit = () => {
    setFullName(user.fullName || user.name || '');
    setPhone(user.phone || '');
    setAvatarUrl(user.avatarUrl || '');
    setServerError(null);
    setFieldErrors({});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setServerError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedUser = await updateProfileApi({
        fullName: fullName.trim(),
        phone: phone.trim() ? phone.trim() : undefined,
        avatarUrl: avatarUrl.trim() ? avatarUrl.trim() : undefined,
      });

      // Update Zustand Auth Store
      setUser(updatedUser);

      if (onUpdateProfile) {
        onUpdateProfile(updatedUser);
      }

      showToast({
        message: 'Cập nhật thông tin cá nhân thành công! ⚡',
        type: 'success',
      });

      setIsEditing(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Cập nhật không thành công. Vui lòng thử lại';
      setServerError(errorMsg);
      showToast({
        message: errorMsg,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 animate-fadeIn">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Thông tin cá nhân
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quản lý và cập nhật thông tin tài khoản của bạn tại TechBite
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold transition-all bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl text-sm cursor-pointer shadow-xs active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Chỉnh sửa</span>
          </button>
        )}
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3 animate-fadeIn">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="font-bold">Không thể lưu thay đổi</p>
            <p className="text-xs mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      {/* VIEW MODE */}
      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Họ và tên
            </span>
            <span className="text-slate-900 font-bold text-sm">
              {user.fullName || user.name || '—'}
            </span>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Địa chỉ Email
            </span>
            <span className="text-slate-900 font-bold text-sm flex items-center justify-between">
              <span>{user.email}</span>
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                Đã xác thực
              </span>
            </span>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Số điện thoại
            </span>
            <span className="text-slate-900 font-bold text-sm">
              {user.phone || 'Chưa cập nhật'}
            </span>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Vai trò / Hạng thành viên
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-900 font-bold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
              <span>{user.role === 'ADMIN' ? 'Quản trị viên 👑' : user.role === 'STAFF' ? 'Nhân viên 💼' : 'Thành viên TechBite ⚡'}</span>
            </span>
          </div>
        </div>
      ) : (
        /* EDIT MODE */
        <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSubmitting}
                placeholder="Nhập họ và tên của bạn"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                  fieldErrors.fullName
                    ? 'border-red-300 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 bg-white text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
              {fieldErrors.fullName && (
                <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Địa chỉ Email <span className="text-slate-400 font-normal">(Không thể thay đổi)</span>
              </label>
              <input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-slate-500 text-sm cursor-not-allowed font-medium"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Số điện thoại
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSubmitting}
                placeholder="VD: 0901234567"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                  fieldErrors.phone
                    ? 'border-red-300 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 bg-white text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Avatar URL */}
            <div>
              <label htmlFor="avatarUrl" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Link ảnh đại diện (URL)
              </label>
              <input
                id="avatarUrl"
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                disabled={isSubmitting}
                placeholder="https://example.com/avatar.png"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-slate-900 text-sm transition-all outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-extrabold text-white bg-orange-600 hover:bg-orange-700 transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer disabled:bg-orange-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

