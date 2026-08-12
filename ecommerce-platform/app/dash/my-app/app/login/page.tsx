'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAccessToken } from '../../lib/admin-api';

interface LoginResponse {
  message?: string;
  data?: { accessToken?: string };
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const result = (await response.json()) as LoginResponse;

      if (!response.ok || !result.data?.accessToken) {
        throw new Error(result.message || 'Đăng nhập không thành công.');
      }

      setAccessToken(result.data.accessToken);
      const redirectTo = new URLSearchParams(window.location.search).get('redirect');
      router.replace(redirectTo?.startsWith('/') ? redirectTo : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập không thành công.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F6FA] p-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/70">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4880FF]">Dashboard</p>
        <h1 className="mt-2 text-2xl font-bold text-[#202224]">Đăng nhập quản trị</h1>
        <p className="mt-2 text-sm text-slate-500">Sử dụng tài khoản quản trị hoặc nhân viên của bạn.</p>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-slate-700">
            Email
            <input
              autoComplete="email"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none transition focus:border-[#4880FF] focus:ring-4 focus:ring-blue-100"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Mật khẩu
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none transition focus:border-[#4880FF] focus:ring-4 focus:ring-blue-100"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <button
            className="w-full rounded-lg bg-[#4880FF] py-3 text-sm font-semibold text-white transition hover:bg-[#376eea] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
      </section>
    </main>
  );
}
