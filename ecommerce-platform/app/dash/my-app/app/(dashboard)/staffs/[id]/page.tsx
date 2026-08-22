import React from 'react';
import StaffDetailContainer from '@/features/staffs/components/staff-detail-container';

export const metadata = {
  title: 'Chi tiết nhân viên | Admin Dashboard',
  description: 'Xem và quản lý chi tiết thông tin nhân viên',
};

interface StaffDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StaffDetailPage({ params }: StaffDetailPageProps) {
  const { id } = await params;

  return (
    <div className="w-full">
      <StaffDetailContainer staffId={id} />
    </div>
  );
}

