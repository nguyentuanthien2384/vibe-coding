'use client';

import React, { useState } from 'react';
import { useToast } from '../../../components/ui/toast';
import { useAdminAuthStore } from '../../../store/admin-auth.store';
import { profileApi } from '../api/profile-api';
import { KeyRound, Lock, Eye, EyeOff, Check, X, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';

export default function ChangePasswordForm() {
  const { showToast } = useToast();
  const logout = useAdminAuthStore((s) => s.logout);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password checklist rules
  const hasMinLength = newPassword.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword);
  const isDifferentFromOld = newPassword.length > 0 && oldPassword.length > 0 && newPassword !== oldPassword;
  const isMatching = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;

  // Calculate strength score 0-4
  const getStrengthScore = () => {
    if (!newPassword) return 0;
    let score = 0;
    if (hasMinLength) score += 1;
    if (hasLetter) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial || newPassword.length >= 10) score += 1;
    return score;
  };

  const strengthScore = getStrengthScore();

  const getStrengthLabel = () => {
    if (!newPassword) return { label: 'Chưa nhập', color: 'bg-slate-200 text-slate-500' };
    if (strengthScore <= 1) return { label: 'Yếu', color: 'bg-rose-500 text-rose-500' };
    if (strengthScore === 2 || strengthScore === 3) return { label: 'Trung bình', color: 'bg-amber-500 text-amber-500' };
    return { label: 'Mạnh & An toàn', color: 'bg-emerald-500 text-emerald-500' };
  };

  const strengthInfo = getStrengthLabel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!oldPassword.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }

    if (!hasMinLength) {
      setErrorMsg('Mật khẩu mới phải có độ dài tối thiểu 6 ký tự.');
      return;
    }

    if (!hasLetter || !hasNumber) {
      setErrorMsg('Mật khẩu mới phải chứa ít nhất một chữ cái và một chữ số.');
      return;
    }

    if (oldPassword === newPassword) {
      setErrorMsg('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Xác nhận mật khẩu mới không trùng khớp.');
      return;
    }

    try {
      setIsSubmitting(true);
      await profileApi.changePassword({
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      });

      showToast('success', 'Đổi mật khẩu thành công! Đang thu hồi các phiên đăng nhập cũ...');

      // Reset fields
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Tự động dọn dẹp và điều hướng về trang đăng nhập sau 1.5s
      setTimeout(async () => {
        await logout();
        window.location.assign('/login');
      }, 1500);
    } catch (err: any) {
      const msg = err?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại thông tin.';
      setErrorMsg(msg);
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center gap-2 pb-4 mb-6 border-b border-gray-100 dark:border-slate-800">
        <KeyRound className="w-5 h-5 text-amber-500" />
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            Đổi Mật Khẩu & Bảo Mật Phiên
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cập nhật mật khẩu quản trị định kỳ để bảo vệ an toàn cho dữ liệu hệ thống
          </p>
        </div>
      </div>

      {/* Security alert box */}
      <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
          <p className="font-bold">Lưu ý bảo mật quan trọng:</p>
          <p>
            Ngay khi đổi mật khẩu thành công, toàn bộ token của phiên đăng nhập hiện tại và trên mọi thiết bị khác sẽ bị thu hồi. Bạn sẽ cần đăng nhập lại với mật khẩu mới.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800 font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Mật khẩu hiện tại */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Mật Khẩu Hiện Tại <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showOldPassword ? 'text' : 'password'}
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Nhập mật khẩu bạn đang sử dụng"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm font-medium transition-all"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword((s) => !s)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mật khẩu mới */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Mật Khẩu Mới <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showNewPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự (bao gồm chữ & số)"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm font-medium transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((s) => !s)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Thanh đo độ mạnh mật khẩu */}
          {newPassword && (
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Độ mạnh mật khẩu:</span>
                <span className={`font-bold ${strengthScore <= 1 ? 'text-rose-600' : strengthScore <= 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {strengthInfo.label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${strengthScore >= 1 ? (strengthScore === 1 ? 'bg-rose-500' : strengthScore <= 3 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-transparent'}`} />
                <div className={`h-full rounded-full transition-all ${strengthScore >= 2 ? (strengthScore <= 3 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-transparent'}`} />
                <div className={`h-full rounded-full transition-all ${strengthScore >= 3 ? (strengthScore <= 3 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-transparent'}`} />
                <div className={`h-full rounded-full transition-all ${strengthScore >= 4 ? 'bg-emerald-500' : 'bg-transparent'}`} />
              </div>
            </div>
          )}
        </div>

        {/* Xác nhận mật khẩu mới */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Xác Nhận Mật Khẩu Mới <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 text-sm font-medium transition-all ${
                confirmPassword && !isMatching
                  ? 'border-rose-300 focus:ring-rose-500/30'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500/30'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((s) => !s)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && !isMatching && (
            <p className="text-[11px] text-rose-500 font-medium mt-1">
              Mật khẩu xác nhận không trùng khớp
            </p>
          )}
        </div>

        {/* Checklist quy tắc mật khẩu */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Quy chuẩn mật khẩu hợp lệ:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              {hasMinLength ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              )}
              <span className={hasMinLength ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-500'}>
                Độ dài tối thiểu 6 ký tự
              </span>
            </div>

            <div className="flex items-center gap-2">
              {hasLetter && hasNumber ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              )}
              <span className={hasLetter && hasNumber ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-500'}>
                Bao gồm cả chữ cái và số
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isDifferentFromOld ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              )}
              <span className={isDifferentFromOld ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-500'}>
                Khác với mật khẩu hiện tại
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isMatching ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              )}
              <span className={isMatching ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-500'}>
                Xác nhận mật khẩu trùng khớp
              </span>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex items-center justify-end pt-4 border-t border-gray-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={isSubmitting || !hasMinLength || !hasLetter || !hasNumber || !isMatching}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý đổi mật khẩu...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Cập Nhật Mật Khẩu & Đăng Xuất</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
