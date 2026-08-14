'use client';

import { useState, useMemo, useEffect } from 'react';
import { SettingsTab, SystemSettingsPayload } from '../types/settings.types';
import SettingsHeader from './settings-header';
import SettingsNavTabs from './settings-nav-tabs';
import SettingsTabContent from './settings-tab-content';
import SaveSettingsActionBar from './save-settings-action-bar';
import { useToast } from '../../../components/ui/toast';
import { getAdminSettings, updateAdminSettings } from '../api/settings-api';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

const SettingsPageClient = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [formData, setFormData] = useState<SystemSettingsPayload | null>(null);
  const [initialData, setInitialData] = useState<SystemSettingsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminSettings();
      setFormData(data);
      setInitialData(data);
    } catch (err: any) {
      console.error('Lỗi khi nạp cài đặt hệ thống:', err);
      setError(err?.message || 'Không thể nạp thông tin cài đặt từ máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Check if form data has been modified
  const isDirty = useMemo(() => {
    if (!formData || !initialData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
      showToast('warning', 'Đã khôi phục cài đặt về trạng thái ban đầu');
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);

    try {
      await updateAdminSettings(formData);
      setInitialData(formData);
      showToast('success', 'Lưu thiết lập hệ thống thành công 🚀');
    } catch (err: any) {
      console.error('Lỗi khi lưu cài đặt hệ thống:', err);
      showToast('error', err?.message || 'Lỗi khi lưu thiết lập hệ thống');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-24">
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
      <div className="space-y-6 pb-24">
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
    <div className="space-y-6 pb-24">
      {/* Header */}
      <SettingsHeader />

      {/* Navigation Tabs */}
      <SettingsNavTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        bannersCount={formData.banners.length}
        menusCount={formData.menus.length}
      />

      {/* Tab Content */}
      <SettingsTabContent
        activeTab={activeTab}
        data={formData}
        onChange={setFormData}
      />

      {/* Floating Save Action Bar */}
      <SaveSettingsActionBar
        isVisible={isDirty}
        isSaving={isSaving}
        onReset={handleReset}
        onSave={handleSave}
      />
    </div>
  );
};

export default SettingsPageClient;
