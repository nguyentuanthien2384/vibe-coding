import React from 'react';
import { Header } from '../../components/layout/header';
import { Footer } from '../../components/layout/footer';
import { MaintenanceBanner } from '../../components/layout/maintenance-banner';
import { getPublicSettings } from '../../lib/settings';

export const metadata = {
  title: 'Xác thực tài khoản - TechBite',
  description: 'Đăng nhập hoặc đăng ký tài khoản TechBite để nhận ưu đãi và mua sắm đồ ăn vặt chạy deadline.',
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { general, menus, seo } = await getPublicSettings();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {general.maintenanceMode && (
        <MaintenanceBanner message={general.maintenanceMessage} />
      )}
      <Header generalSettings={general} menus={menus} />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <Footer generalSettings={general} menus={menus} seo={seo} />
    </div>
  );
}
