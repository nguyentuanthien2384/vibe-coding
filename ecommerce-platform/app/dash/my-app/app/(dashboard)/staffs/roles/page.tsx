import React from 'react';
import RoleListPageClient from '@/features/staffs/components/roles/role-list-page-client';

export const metadata = {
  title: 'Nhóm quyền (Roles) | Admin Dashboard',
  description: 'Định nghĩa các chức danh và bộ quyền hạn tương ứng',
};

export default function RolesPage() {
  return (
    <div className="w-full">
      <RoleListPageClient />
    </div>
  );
}
