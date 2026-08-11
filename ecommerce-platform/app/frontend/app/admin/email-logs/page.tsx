"use client";

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { EmailLogManagement } from '@/components/admin/email-logs/email-log-management';
import { useAuthStore } from '@/store/use-auth-store';
import { getMeApi } from '@/lib/auth';
import Link from 'next/link';

export default function AdminEmailLogsPage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(!user);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAdminAuth() {
      try {
        const currentUser = await getMeApi();
        if (isMounted) {
          setUser(currentUser);
          if (currentUser.role !== 'ADMIN') {
            setUnauthorized(true);
          }
        }
      } catch {
        if (isMounted) {
          setUnauthorized(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkAdminAuth();

    return () => {
      isMounted = false;
    };
  }, [setUser]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200/80 space-y-4 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-slate-200 mx-auto" />
            <div className="h-6 bg-slate-200 rounded-md w-1/3 mx-auto" />
            <div className="h-4 bg-slate-100 rounded-md w-1/2 mx-auto" />
          </div>
        ) : unauthorized || user?.role !== 'ADMIN' ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-sm border border-rose-100 space-y-5 max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center font-extrabold text-2xl shadow-inner">
              🔒
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Yêu cầu quyền Quản trị viên (ADMIN)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Trang Quản lý Nhật ký Email chỉ dành cho tài khoản có vai trò Quản trị viên hệ thống TechBite.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Về Trang chủ
              </Link>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-md shadow-orange-600/20"
              >
                Đăng nhập tài khoản Admin
              </Link>
            </div>
          </div>
        ) : (
          <EmailLogManagement />
        )}
      </main>

      <Footer />
    </div>
  );
}
