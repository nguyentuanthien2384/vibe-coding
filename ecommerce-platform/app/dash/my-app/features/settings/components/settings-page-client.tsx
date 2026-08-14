'use client';

import { useState, useMemo } from 'react';
import { SettingsTab, SystemSettingsPayload } from '../types/settings.types';
import { INITIAL_MOCK_SETTINGS } from '../data/mock-settings';
import SettingsHeader from './settings-header';
import SettingsNavTabs from './settings-nav-tabs';
import SettingsTabContent from './settings-tab-content';
import SaveSettingsActionBar from './save-settings-action-bar';
import { useToast } from '../../../components/ui/toast';

const SettingsPageClient = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [formData, setFormData] = useState<SystemSettingsPayload>(INITIAL_MOCK_SETTINGS);
  const [initialData, setInitialData] = useState<SystemSettingsPayload>(INITIAL_MOCK_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  // Check if form data has been modified
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  const handleReset = () => {
    setFormData(initialData);
    showToast('warning', 'Đã khôi phục cài đặt về trạng thái ban đầu');
  };

  const handleSave = () => {
    setIsSaving(true);

    // Mocking save delay
    setTimeout(() => {
      setInitialData(formData);
      setIsSaving(false);
      showToast('success', 'Lưu thiết lập hệ thống thành công 🚀');
    }, 600);
  };

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
