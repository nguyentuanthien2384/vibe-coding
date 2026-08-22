import React from 'react';
import { Header } from '../../../components/layout/header';
import { Footer } from '../../../components/layout/footer';
import { MaintenanceBanner } from '../../../components/layout/maintenance-banner';
import { ProfileContainer } from '../../../components/profile/profile-container';
import { getPublicSettings } from '../../../lib/settings';

export const metadata = {
  title: 'Hồ sơ cá nhân & Lịch sử đơn hàng - TechBite',
  description: 'Quản lý thông tin cá nhân và xem lịch sử các đơn hàng đã mua tại TechBite.',
};

export default async function ProfilePage() {
  const { general, menus, seo } = await getPublicSettings();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {general.maintenanceMode && (
        <MaintenanceBanner message={general.maintenanceMessage} />
      )}
      <Header generalSettings={general} menus={menus} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <ProfileContainer />
      </main>
      <Footer generalSettings={general} menus={menus} seo={seo} />
    </div>
  );
}
