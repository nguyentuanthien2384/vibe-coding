'use client';

import { useState } from 'react';
import { EmailSettings, SmtpEncryption } from '../../types/settings.types';
import { testEmailConnection } from '../../api/settings-api';
import {
  Mail,
  Server,
  Lock,
  User,
  ShieldCheck,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  Bell,
  KeyRound,
} from 'lucide-react';

interface EmailSettingsFormProps {
  data: EmailSettings;
  onChange: (updated: EmailSettings) => void;
}

const inputClass =
  'w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white';

const inputSimpleClass =
  'w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white';

const EmailSettingsForm = ({ data, onChange }: EmailSettingsFormProps) => {
  const [testEmail, setTestEmail] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handle = (field: keyof EmailSettings, value: string | number | boolean) => {
    onChange({ ...data, [field]: value });
  };

  const handleTestConnection = async () => {
    if (!testEmail.trim()) {
      setTestStatus('error');
      setTestMessage('Vui lòng nhập email nhận thử nghiệm');
      return;
    }

    setTestStatus('loading');
    setTestMessage('');

    try {
      // Gửi customSettings để test ngay thông số hiện tại trên form (chưa lưu)
      const { hasPasswordConfigured: _hp, ...emailPayload } = data;
      const result = await testEmailConnection(testEmail.trim(), emailPayload);
      setTestStatus('success');
      setTestMessage(result.message);
    } catch (err: unknown) {
      setTestStatus('error');
      const error = err as { message?: string };
      setTestMessage(error?.message || 'Kết nối SMTP thất bại. Kiểm tra lại Host, Port và mật khẩu.');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-8">
      {/* ─── Header ─── */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#4880FF]" />
          Cấu hình Email SMTP
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Thiết lập máy chủ gửi thư hệ thống (xác nhận đơn hàng, chào mừng thành viên, reset mật
          khẩu...).
        </p>
      </div>

      {/* ─── Section 1: SMTP Server ─── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-[#4880FF]" />
          Thông số Máy chủ SMTP
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SMTP Host */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              SMTP Host <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.smtpHost}
                onChange={(e) => handle('smtpHost', e.target.value)}
                placeholder="smtp.gmail.com"
                className={inputClass}
              />
              <Server className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* SMTP Port */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              SMTP Port <span className="text-rose-500">*</span>
            </label>
            <select
              value={data.smtpPort}
              onChange={(e) => handle('smtpPort', parseInt(e.target.value, 10))}
              className={inputSimpleClass}
            >
              <option value={587}>587 — TLS (Khuyên dùng)</option>
              <option value={465}>465 — SSL</option>
              <option value={25}>25 — Plain (Không mã hóa)</option>
              <option value={2525}>2525 — Alternative TLS</option>
            </select>
          </div>

          {/* Encryption */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Kiểu Mã Hóa (Encryption)
            </label>
            <div className="flex gap-3">
              {(['tls', 'ssl', 'none'] as SmtpEncryption[]).map((enc) => (
                <button
                  key={enc}
                  type="button"
                  onClick={() => handle('smtpEncryption', enc)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    data.smtpEncryption === enc
                      ? 'bg-[#4880FF] text-white border-[#4880FF] shadow-md shadow-blue-500/20'
                      : 'bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-[#4880FF]'
                  }`}
                >
                  {enc.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Mail Driver */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mail Driver
            </label>
            <select
              value={data.mailDriver ?? 'smtp'}
              onChange={(e) => handle('mailDriver', e.target.value)}
              className={inputSimpleClass}
            >
              <option value="smtp">SMTP (Thông thường)</option>
              <option value="sendgrid">SendGrid API</option>
              <option value="mailgun">Mailgun API</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Section 2: Authentication ─── */}
      <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#4880FF]" />
          Xác Thực Tài Khoản SMTP
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SMTP User */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              SMTP Username (Email đăng nhập) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={data.smtpUser}
                onChange={(e) => handle('smtpUser', e.target.value)}
                placeholder="no-reply@yourdomain.com"
                className={inputClass}
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* SMTP Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              SMTP Password / App Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={data.smtpPassword ?? ''}
                onChange={(e) => handle('smtpPassword', e.target.value)}
                placeholder={
                  data.hasPasswordConfigured
                    ? '●●●●●●●● (Đã thiết lập — để trống để giữ nguyên)'
                    : 'Nhập mật khẩu ứng dụng...'
                }
                className={inputClass}
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            {data.hasPasswordConfigured && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Mật khẩu đã được thiết lập. Để trống để giữ
                nguyên giá trị cũ.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Section 3: Sender Info ─── */}
      <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-[#4880FF]" />
          Thông Tin Người Gửi (Sender Identity)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tên Hiển Thị Người Gửi (From Name) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.fromName}
                onChange={(e) => handle('fromName', e.target.value)}
                placeholder="TechBite Platform"
                className={inputClass}
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              From Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={data.fromEmail}
                onChange={(e) => handle('fromEmail', e.target.value)}
                placeholder="no-reply@techbite.vn"
                className={inputClass}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Reply-To Email (Tuỳ chọn)
            </label>
            <div className="relative">
              <input
                type="email"
                value={data.replyToEmail ?? ''}
                onChange={(e) => handle('replyToEmail', e.target.value)}
                placeholder="support@techbite.vn"
                className={inputClass}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Cảnh Báo Admin (Tuỳ chọn)
            </label>
            <div className="relative">
              <input
                type="email"
                value={data.adminAlertEmail ?? ''}
                onChange={(e) => handle('adminAlertEmail', e.target.value)}
                placeholder="admin@techbite.vn"
                className={inputClass}
              />
              <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Section 4: Notification Toggles ─── */}
      <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#4880FF]" />
          Cấu Hình Gửi Email Tự Động
        </h3>

        <div className="space-y-3">
          {[
            {
              field: 'enableOrderAlertAdmin' as keyof EmailSettings,
              label: 'Thông báo Admin khi có đơn hàng mới',
              desc: 'Gửi email đến Admin Alert Email mỗi khi có đơn hàng mới được đặt.',
            },
            {
              field: 'enableWelcomeMail' as keyof EmailSettings,
              label: 'Gửi email chào mừng khách hàng đăng ký mới',
              desc: 'Gửi email welcome cho thành viên vừa tạo tài khoản thành công.',
            },
          ].map(({ field, label, desc }) => (
            <div
              key={field}
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => handle(field, !data[field])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  data[field] ? 'bg-[#4880FF]' : 'bg-gray-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    data[field] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Section 5: Test Connection ─── */}
      <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Send className="w-4 h-4 text-[#4880FF]" />
          Kiểm Tra Kết Nối SMTP (Test Connection)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Gửi email thử nghiệm ngay với thông số hiện tại trên form (chưa cần lưu) để xác nhận cấu
          hình SMTP hoạt động đúng.
        </p>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => {
                setTestEmail(e.target.value);
                if (testStatus !== 'idle') setTestStatus('idle');
              }}
              placeholder="Nhập email nhận thử nghiệm..."
              className={inputClass}
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testStatus === 'loading'}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#4880FF] hover:bg-blue-600 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/20 whitespace-nowrap"
          >
            {testStatus === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {testStatus === 'loading' ? 'Đang gửi...' : 'Gửi Email Test'}
          </button>
        </div>

        {testStatus === 'success' && (
          <div className="flex items-start gap-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200">{testMessage}</p>
          </div>
        )}

        {testStatus === 'error' && (
          <div className="flex items-start gap-3 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-rose-800 dark:text-rose-200">{testMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailSettingsForm;
