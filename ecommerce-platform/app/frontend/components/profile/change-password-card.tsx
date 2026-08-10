"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { changePasswordApi } from '../../lib/auth';
import { useAuthStore } from '../../store/use-auth-store';
import { showToast } from '../ui/toast';

export const ChangePasswordCard: React.FC = () => {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility State
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validate = (): boolean => {
    const errors: {
      oldPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!oldPassword) {
      errors.oldPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Mật khẩu phải chứa ít nhất 6 ký tự';
    } else if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword)) {
      errors.newPassword = 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số';
    } else if (newPassword === oldPassword) {
      errors.newPassword = 'Mật khẩu mới không được trùng với mật khẩu hiện tại';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await changePasswordApi({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      // Clear Form on success
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFieldErrors({});

      const msg = 'Đổi mật khẩu thành công! Toàn bộ phiên đăng nhập cũ đã được thu hồi. Vui lòng đăng nhập lại ⚡';
      setSuccessMessage(msg);

      showToast({
        message: msg,
        type: 'success',
      });

      // Thu hồi phiên đăng nhập phía Client & Chuyển hướng sang trang Đăng nhập
      logout();
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Đổi mật khẩu không thành công. Vui lòng thử lại.';
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
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 animate-fadeIn space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-gray-100">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
          Đổi mật khẩu
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Để bảo vệ tài khoản, vui lòng không chia sẻ mật khẩu cho người khác
        </p>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm flex items-start gap-3 animate-fadeIn">
          <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-bold">{successMessage}</p>
            <p className="text-xs text-green-700 mt-0.5">
              Mật khẩu của bạn đã được cập nhật thành công trong hệ thống.
            </p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {serverError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3 animate-fadeIn">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-bold">Đổi mật khẩu thất bại</p>
            <p className="text-xs mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 max-w-xl">
          {/* Old Password */}
          <div>
            <label htmlFor="oldPassword" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Mật khẩu hiện tại <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="oldPassword"
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={isSubmitting}
                placeholder="Nhập mật khẩu hiện tại"
                className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm transition-all outline-none ${
                  fieldErrors.oldPassword
                    ? 'border-red-300 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 bg-white text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                aria-label="Ẩn/hiện mật khẩu"
              >
                {showOldPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a9.98 9.98 0 013.682-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.oldPassword && (
              <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.oldPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSubmitting}
                placeholder="Tối thiểu 6 ký tự, gồm cả chữ và số"
                className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm transition-all outline-none ${
                  fieldErrors.newPassword
                    ? 'border-red-300 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 bg-white text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                aria-label="Ẩn/hiện mật khẩu"
              >
                {showNewPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a9.98 9.98 0 013.682-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.newPassword ? (
              <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.newPassword}</p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-500 font-medium">
                💡 Yêu cầu: Tối thiểu 6 ký tự, bao gồm ít nhất 1 chữ cái và 1 chữ số.
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                placeholder="Nhập lại mật khẩu mới"
                className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm transition-all outline-none ${
                  fieldErrors.confirmPassword
                    ? 'border-red-300 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 bg-white text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                aria-label="Ẩn/hiện mật khẩu"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a9.98 9.98 0 013.682-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-extrabold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer disabled:bg-slate-500 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Cập nhật mật khẩu</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
