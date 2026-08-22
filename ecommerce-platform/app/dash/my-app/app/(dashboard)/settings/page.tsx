import { Suspense } from 'react';
import SettingsPageClient from '../../../features/settings/components/settings-page-client';

export const metadata = {
  title: 'Thiết Lập Hệ Thống | TechBite Admin',
  description: 'Quản lý thông tin cửa hàng, thông số thanh toán VietQR, phí giao hàng, danh sách banner và menu website.',
};

const SettingsPage = () => {
  return (
    <Suspense fallback={null}>
      <SettingsPageClient />
    </Suspense>
  );
};

export default SettingsPage;
