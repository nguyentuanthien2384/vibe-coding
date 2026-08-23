import { Suspense } from 'react';
import ProfilePageClient from '../../../../features/profile/components/profile-page-client';

export const metadata = {
  title: 'Hồ Sơ Cá Nhân & Bảo Mật | TechBite Admin',
  description: 'Quản lý thông tin tài khoản cá nhân và đổi mật khẩu an toàn.',
};

export default function DashboardProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfilePageClient />
    </Suspense>
  );
}
