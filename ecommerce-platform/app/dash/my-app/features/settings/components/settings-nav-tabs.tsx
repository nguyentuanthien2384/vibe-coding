'use client';

import { SettingsTab } from '../types/settings.types';
import { Store, CreditCard, Truck, Image, Menu, Globe, Mail, Coins } from 'lucide-react';

interface SettingsNavTabsProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  bannersCount: number;
  menusCount: number;
}

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'Cấu hình chung', icon: Store },
  { id: 'payment', label: 'Thanh toán & VietQR', icon: CreditCard },
  { id: 'shipping', label: 'Vận chuyển & Phí', icon: Truck },
  { id: 'points', label: 'Cấu hình Tích điểm', icon: Coins },
  { id: 'banners', label: 'Quản lý Banners', icon: Image },
  { id: 'menus', label: 'Navigation Menus', icon: Menu },
  { id: 'seo', label: 'SEO & Social Links', icon: Globe },
  { id: 'email', label: 'Cấu hình Email', icon: Mail },
];

const SettingsNavTabs = ({
  activeTab,
  onTabChange,
  bannersCount,
  menusCount,
}: SettingsNavTabsProps) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-2 shadow-sm overflow-x-auto">
      <div className="flex items-center gap-1 min-w-max">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const badgeValue =
            tab.id === 'banners' ? bannersCount : tab.id === 'menus' ? menusCount : undefined;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-[#4880FF] text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {badgeValue !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {badgeValue}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsNavTabs;
