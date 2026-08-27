import React, { Suspense } from 'react';
import { Header } from '../../../components/layout/header';
import { Footer } from '../../../components/layout/footer';
import { ProfileContainer } from '../../../components/profile/profile-container';

export const metadata = {
  title: 'Hồ sơ cá nhân & Lịch sử đơn hàng - TechBite',
  description: 'Quản lý thông tin cá nhân và xem lịch sử các đơn hàng đã mua tại TechBite.',
};

export default async function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Đang tải hồ sơ...</div>}>
          <ProfileContainer />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
