'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SettingsTab, SystemSettingsPayload } from '../types/settings.types';
import SettingsHeader from './settings-header';
import SettingsNavTabs from './settings-nav-tabs';
import SettingsTabContent from './settings-tab-content';
import { useToast } from '../../../components/ui/toast';
import { getAdminSettings, patchGroupSettings } from '../api/settings-api';
import { Loader2, AlertTriangle, RefreshCw, CheckCircle, Save } from 'lucide-react';

/**
 * Các tab "form" — auto-save theo debounce 800ms sau khi user thay đổi.
 * Các tab "repeater" (banners, menus) — tự quản lý save bên trong component.
 */
const AUTO_SAVE_TABS: SettingsTab[] = ['general', 'payment', 'shipping', 'seo', 'email'];
const VALID_TABS: SettingsTab[] = ['general', 'payment', 'shipping', 'banners', 'menus', 'seo', 'email'];
const DEBOUNCE_MS = 800;

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const SettingsPageClient = () => {
  const { showToast } = useToast();
  const searchParams = useSearchParams();

  // Khởi tạo tab từ URL search params (?tab=menus) hoặc localStorage
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    const tabParam = searchParams.get('tab') as SettingsTab | null;
    if (tabParam && VALID_TABS.includes(tabParam)) return tabParam;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_settings_active_tab') as SettingsTab | null;
      if (saved && VALID_TABS.includes(saved)) return saved;
    }
    return 'general';
  });

  const [formData, setFormData] = useState<SystemSettingsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Ref giữ timer debounce để cancel khi cần
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref giữ tab hiện tại để dùng trong debounce callback (tránh stale closure)
  const activeTabRef = useRef<SettingsTab>(activeTab);
  activeTabRef.current = activeTab;

  // Đồng bộ tab khi searchParams thay đổi hoặc khi reload
  useEffect(() => {
    const tabParam = searchParams.get('tab') as SettingsTab | null;
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_settings_active_tab', tabParam);
      }
    } else if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_settings_active_tab') as SettingsTab | null;
      if (saved && VALID_TABS.includes(saved)) {
        setActiveTab(saved);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', saved);
        window.history.replaceState(null, '', url.toString());
      }
    }
  }, [searchParams]);

  const handleTabChange = useCallback((tab: SettingsTab) => {
    // Cancel pending debounce khi chuyển tab để tránh lưu tab cũ
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setSaveStatus('idle');
    setActiveTab(tab);

    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_settings_active_tab', tab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState(null, '', url.toString());
    }
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminSettings();
      setFormData(data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error('Lỗi khi nạp cài đặt hệ thống:', err);
      setError(e?.message || 'Không thể nạp thông tin cài đặt từ máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  /** Lưu group cụ thể lên API */
  const saveGroup = useCallback(
    async (tab: SettingsTab, data: SystemSettingsPayload) => {
      if (!AUTO_SAVE_TABS.includes(tab)) return;

      const groupMap: Record<string, unknown> = {
        general: data.general,
        payment: data.payment,
        shipping: data.shipping,
        seo: data.seo,
        email: data.email,
      };

      const value = groupMap[tab];
      if (value === undefined) return;

      setSaveStatus('saving');
      try {
        await patchGroupSettings(
          tab as 'general' | 'payment' | 'shipping' | 'seo' | 'email',
          value,
        );
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } catch (err: unknown) {
        const e = err as { message?: string };
        setSaveStatus('error');
        showToast('error', e?.message || `Lỗi khi lưu cấu hình ${tab}`);
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    },
    [showToast],
  );

  /** Xử lý thay đổi form — debounce 800ms rồi auto-save */
  const handleFormChange = useCallback(
    (updated: SystemSettingsPayload) => {
      setFormData(updated);

      const tab = activeTabRef.current;
      if (!AUTO_SAVE_TABS.includes(tab)) return;

      // Reset debounce timer
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      setSaveStatus('saving'); // show "đang lưu" sớm để UX mượt

      debounceTimer.current = setTimeout(() => {
        saveGroup(tab, updated);
      }, DEBOUNCE_MS);
    },
    [saveGroup],
  );

  // Cleanup timer khi unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // ─── Render States ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SettingsHeader />
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#4880FF] animate-spin" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Đang tải dữ liệu thiết lập hệ thống từ máy chủ...
          </p>
        </div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="space-y-6">
        <SettingsHeader />
        <div className="p-8 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                Lỗi tải thông tin thiết lập hệ thống
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchSettings}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Thử lại</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header với save status indicator */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <SettingsHeader />
        </div>

        {/* Auto-save status badge */}
        {AUTO_SAVE_TABS.includes(activeTab) && saveStatus !== 'idle' && (
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              saveStatus === 'saving'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                : saveStatus === 'saved'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {saveStatus === 'saving' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saveStatus === 'saved' && <CheckCircle className="w-3.5 h-3.5" />}
            {saveStatus === 'error' && <AlertTriangle className="w-3.5 h-3.5" />}
            <span>
              {saveStatus === 'saving' && 'Đang lưu tự động...'}
              {saveStatus === 'saved' && 'Đã lưu thành công'}
              {saveStatus === 'error' && 'Lỗi khi lưu'}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <SettingsNavTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        bannersCount={formData.banners.length}
        menusCount={formData.menus.length}
      />

      {/* Tab Content */}
      <SettingsTabContent activeTab={activeTab} data={formData} onChange={handleFormChange} />

      {/* Hint bar cho các tab form */}
      {AUTO_SAVE_TABS.includes(activeTab) && saveStatus === 'idle' && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl">
          <Save className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Thay đổi được lưu tự động sau{' '}
            <strong className="text-slate-500 dark:text-slate-400">{DEBOUNCE_MS / 1000}s</strong> khi
            bạn dừng nhập. Không cần nhấn nút lưu.
          </p>
        </div>
      )}
    </div>
  );
};

export default SettingsPageClient;
