"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { LoginFormProps } from '../../types/auth-ui.types';

export const LoginForm: React.FC<LoginFormProps> = ({
  register,
  errors,
  isSubmitting,
  serverError,
  onSubmit,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-5 w-full" noValidate>
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

      {/* Email Field */}
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-2 tracking-wider uppercase" htmlFor="email">
          ĐỊA CHỈ EMAIL
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            id="email"
            type="email"
            placeholder="user@techbite.vn"
            {...register('email')}
            className={`block w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors font-medium ${
              errors.email
                ? 'border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                : 'border-gray-200 focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20'
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
            ⚠️ {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase" htmlFor="password">
            MẬT KHẨU
          </label>
          <Link href="/forgot-password" className="text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors">
            Quên mật khẩu?
          </Link>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('password')}
            className={`block w-full pl-10 pr-10 py-3 bg-gray-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors font-medium ${
              errors.password
                ? 'border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                : 'border-gray-200 focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.05 10.05 0 012.122-.063c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
            ⚠️ {errors.password.message}
          </p>
        )}
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center">
        <input
          id="remember-me"
          type="checkbox"
          className="h-4 w-4 text-orange-600 focus:ring-orange-600 border-gray-300 rounded accent-orange-600 cursor-pointer"
        />
        <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer select-none">
          Ghi nhớ đăng nhập
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-orange-600/20 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Đang xác thực...</span>
          </>
        ) : (
          <>
            <span>Đăng Nhập</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
};
