// components/layout/maintenance-banner.tsx
import React from 'react';

interface MaintenanceBannerProps {
  message?: string;
}

export const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({
  message = 'Hệ thống đang bảo trì nâng cấp định kỳ. Một số tính năng có thể tạm thời gián đoạn!',
}) => {
  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 text-center shadow-inner flex items-center justify-center gap-2">
      <span className="text-base animate-bounce">⚠️</span>
      <span>{message}</span>
    </div>
  );
};
