"use client";

import React, { useState } from 'react';
import { RegisterFormProps } from '../../types/auth-ui.types';

export const RegisterForm: React.FC<RegisterFormProps> = ({
  register,
  errors,
  isSubmitting,
  serverError,
  onSubmit,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4 w-full" noValidate>
      {/* Server Error Alert */}
      {serverError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold flex items-center gap-2.5 animate-fadeIn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 shrink-0 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{serverError}</span>
        </div>
      )}

      {/* Name Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="fullname">
          HỌ VÀ TÊN
        </label>
        <input
          id="fullname"
          type="text"
          placeholder="Nguyễn Văn A"
          {...register('fullName')}
          className={`appearance-none block w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors font-medium ${
            errors.fullName
              ? 'border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
          }`}
        />
        {errors.fullName && (
          <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
            ⚠️ {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Email Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="email">
          ĐỊA CHỈ EMAIL
        </label>
        <input
          id="email"
          type="email"
          placeholder="user@techbite.vn"
          {...register('email')}
          className={`appearance-none block w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors font-medium ${
            errors.email
              ? 'border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
          }`}
        />
        {errors.email && (
          <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
            ⚠️ {errors.email.message}
          </p>
        )}
      </div>

      {/* Phone Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="phone">
          SỐ ĐIỆN THOẠI
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="0912345678"
          {...register('phone')}
          className={`appearance-none block w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors font-medium ${
            errors.phone
              ? 'border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
          }`}
        />
        {errors.phone && (
          <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
            ⚠️ {errors.phone.message}
          </p>
        )}
      </div>

      {/* Password & Confirm Password Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="password">
            MẬT KHẨU
          </label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('password')}
            className={`appearance-none block w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors font-medium ${
              errors.password
                ? 'border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
            }`}
          />
          {errors.password && (
            <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
              ⚠️ {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="password_confirm">
            XÁC NHẬN MẬT KHẨU
          </label>
          <input
            id="password_confirm"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('confirmPassword')}
            className={`appearance-none block w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors font-medium ${
              errors.confirmPassword
                ? 'border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
              ⚠️ {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      {/* Toggle show password option */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-xs text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
        >
          {showPassword ? '🙈 Ẩn mật khẩu' : '👁️ Hiển thị mật khẩu'}
        </button>
      </div>

      {/* Primary Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-orange-600/20 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Đang khởi tạo tài khoản...</span>
            </>
          ) : (
            <span>Tạo Tài Khoản</span>
          )}
        </button>
      </div>
    </form>
  );
};
