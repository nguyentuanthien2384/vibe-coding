import React from 'react';
import StaffListPageClient from '@/features/staffs/components/staff-list-page-client';

export const metadata = {
  title: 'Quản lý nhân viên | Admin Dashboard',
  description: 'Quản lý tài khoản, phân quyền và thông tin nhân viên',
};

export default function StaffsPage() {
  return (
    <div className="w-full">
      <StaffListPageClient />
    </div>
  );
}
