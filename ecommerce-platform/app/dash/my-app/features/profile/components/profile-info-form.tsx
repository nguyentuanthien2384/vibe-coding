'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AdminUser } from '../../../types/admin-user.types';
import { useAdminAuthStore } from '../../../store/admin-auth.store';
import { useToast } from '../../../components/ui/toast';
import { profileApi } from '../api/profile-api';
import UserAvatar from '../../../components/ui/user-avatar';
import { User, Phone, Mail, UploadCloud, Trash2, Shield, CheckCircle2, Loader2, Save } from 'lucide-react';

interface ProfileInfoFormProps {
  user: AdminUser | null;
}

export default function ProfileInfoForm({ user }: ProfileInfoFormProps) {
  const { showToast } = useToast();
  const setUser = useAdminAuthStore((s) => s.setUser);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatarUrl || null);
    }
  }, [user]);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Vui lòng chọn tập tin hình ảnh hợp lệ (PNG, JPG, WebP, SVG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Kích thước file ảnh không được vượt quá 5MB');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const uploadedUrl = await profileApi.uploadAvatar(file);
      setAvatarUrl(uploadedUrl);
      showToast('success', 'Tải ảnh đại diện thành công!');
    } catch (err: any) {
      showToast('error', err?.message || 'Lỗi khi tải ảnh lên máy chủ');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const updatedUser = await profileApi.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        avatarUrl,
      });

      // Cập nhật Zustand auth store đồng bộ toàn bộ ứng dụng (Header, Dropdown)
      if (user) {
        setUser({
          ...user,
          fullName: updatedUser.fullName,
          phone: updatedUser.phone,
          avatarUrl: updatedUser.avatarUrl,
        });
      }

      showToast('success', 'Cập nhật thông tin cá nhân thành công!');
    } catch (err: any) {
      const msg = err?.message || 'Không thể lưu thay đổi. Vui lòng thử lại sau.';
      setErrorMsg(msg);
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const permissionsList = user?.permissions || [];
  const isSuperAdmin = user?.role === 'ADMIN';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center gap-2 pb-4 mb-6 border-b border-gray-100 dark:border-slate-800">
        <User className="w-5 h-5 text-[#4880FF]" />
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            Thông Tin Cá Nhân
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cập nhật họ tên, số điện thoại và ảnh đại diện hiển thị của bạn trong hệ thống
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800 font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ảnh đại diện */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
            Ảnh Đại Diện (Avatar)
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group">
              <UserAvatar
                name={fullName || user?.fullName || 'User'}
                avatarUrl={avatarUrl}
                size="lg"
                role={user?.role}
              />
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarFileChange}
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="px-4 py-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-[#4880FF] text-xs font-bold rounded-xl transition-all flex items-center gap-2 border border-blue-200 dark:border-blue-800 cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{avatarUrl ? 'Thay đổi ảnh' : 'Tải ảnh lên'}</span>
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa ảnh</span>
                </button>
              )}
              <span className="text-[11px] text-slate-400 block w-full sm:w-auto">
                Hỗ trợ PNG, JPG, WebP tối đa 5MB
              </span>
            </div>
          </div>
        </div>

        {/* Họ và tên & Số điện thoại */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Họ và Tên <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn Quản Trị"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30 text-sm font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Số Điện Thoại
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0901234567"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/30 text-sm font-medium transition-all"
              />
            </div>
          </div>
        </div>

        {/* Email & Vai trò (Readonly/Display) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Địa Chỉ Email (Đăng nhập)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 text-sm font-medium cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Email dùng để định danh tài khoản và không thể tự thay đổi
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Vai Trò & Nhóm Quyền
            </label>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#4880FF]" />
                <span className="text-xs font-bold text-slate-800 dark:text-white">
                  {user?.role === 'ADMIN' ? 'Toàn Quyền Quản Trị (ADMIN)' : (user?.roleGroupName || 'Nhân Viên (STAFF)')}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Danh sách Quyền hạn (Permissions Badges) */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Danh Sách Quyền Hạn Đang Sở Hữu
          </label>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            {isSuperAdmin ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#4880FF]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Bạn sở hữu toàn quyền quản trị cao nhất (* Super Admin) trong toàn bộ hệ thống.</span>
              </div>
            ) : permissionsList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {permissionsList.map((perm) => (
                  <span
                    key={perm}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 shadow-xs"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400">Không có quyền bổ sung</span>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="flex items-center justify-end pt-4 border-t border-gray-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={isSubmitting || isUploadingAvatar}
            className="px-6 py-2.5 bg-[#4880FF] hover:bg-[#3b6edc] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu thay đổi...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu Thay Đổi Hồ Sơ</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
