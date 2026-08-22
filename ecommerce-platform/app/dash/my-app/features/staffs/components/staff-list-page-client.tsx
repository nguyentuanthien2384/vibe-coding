'use client';
import React, { useState, useEffect, useCallback } from 'react';
import StaffListPageHeader from './staff-list-page-header';
import StaffFilterBar from './staff-filter-bar';
import StaffTable from './staff-table';
import CreateStaffModal from './modals/create-staff-modal';
import UpdateStaffStatusModal from './modals/update-staff-status-modal';
import CustomPermissionsModal from './modals/custom-permissions-modal';
import AssignStaffRoleModal from './modals/assign-staff-role-modal';

import {
  StaffRole,
  StaffStatus,
  StaffListItem,
  CreateStaffInput,
  UpdateStaffStatusInput,
  UpdateStaffCustomPermissionsInput,
  UpdateStaffRoleInput,
} from '../types/staff.types';
import {
  getStaffs,
  createStaff,
  updateStaffStatus,
  updateStaffCustomPermissions,
  updateStaffRoleGroup,
} from '../api/staffs-api';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/components/ui/toast';

export default function StaffListPageClient() {
  const [staffs, setStaffs] = useState<StaffListItem[]>([]);
  const [totalStaffs, setTotalStaffs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<StaffRole | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StaffStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const debouncedSearch = useDebounce(searchQuery, 400);
  const { showToast } = useToast();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedForStatus, setSelectedForStatus] = useState<StaffListItem | null>(null);
  const [selectedForCustomPerms, setSelectedForCustomPerms] = useState<StaffListItem | null>(null);
  const [selectedForAssignRole, setSelectedForAssignRole] = useState<StaffListItem | null>(null);

  // Fetch Data từ Backend API
  const fetchStaffs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getStaffs({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch,
        role: selectedRole,
        status: selectedStatus,
      });

      setStaffs(res.staffs);
      setTotalStaffs(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      showToast('error', err.message || 'Không thể tải danh sách nhân viên');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, selectedRole, selectedStatus, showToast]);

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  // Reset về page 1 khi đổi bộ lọc
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleRoleChange = (role: StaffRole | 'ALL') => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

  const handleStatusChange = (st: StaffStatus | 'ALL') => {
    setSelectedStatus(st);
    setCurrentPage(1);
  };

  // Handlers gọi Backend API
  const handleCreateStaff = async (data: CreateStaffInput) => {
    try {
      await createStaff(data);
      showToast('success', 'Tạo tài khoản nhân viên mới thành công!');
      fetchStaffs();
    } catch (err: any) {
      showToast('error', err.message || 'Tạo nhân viên thất bại');
    }
  };

  const handleUpdateStatus = async (data: UpdateStaffStatusInput) => {
    try {
      await updateStaffStatus(data);
      showToast(
        'success',
        data.status === 'BLOCKED'
          ? 'Đã khóa tài khoản và hủy phiên làm việc'
          : 'Đã mở khóa tài khoản nhân viên',
      );
      fetchStaffs();
    } catch (err: any) {
      showToast('error', err.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const handleUpdateCustomPermissions = async (data: UpdateStaffCustomPermissionsInput) => {
    try {
      await updateStaffCustomPermissions(data);
      showToast('success', 'Cập nhật đặc quyền bổ sung thành công!');
      fetchStaffs();
    } catch (err: any) {
      showToast('error', err.message || 'Cập nhật đặc quyền thất bại');
    }
  };

  const handleUpdateRoleGroup = async (data: UpdateStaffRoleInput) => {
    try {
      await updateStaffRoleGroup(data);
      showToast('success', 'Cập nhật phân quyền và nhóm vai trò thành công!');
      fetchStaffs();
    } catch (err: any) {
      showToast('error', err.message || 'Cập nhật phân quyền thất bại');
    }
  };

  return (
    <div className="w-full">
      <StaffListPageHeader onCreateClick={() => setIsCreateModalOpen(true)} />

      <StaffFilterBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedRole={selectedRole}
        onRoleChange={handleRoleChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        totalCount={totalStaffs}
      />

      <StaffTable
        staffs={staffs}
        totalStaffs={totalStaffs}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
        onOpenCustomPermissions={setSelectedForCustomPerms}
        onOpenAssignRole={setSelectedForAssignRole}
        onToggleStatus={setSelectedForStatus}
      />

      {/* Modals */}
      <CreateStaffModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateStaff}
      />

      <UpdateStaffStatusModal
        isOpen={!!selectedForStatus}
        staff={selectedForStatus}
        onClose={() => setSelectedForStatus(null)}
        onSubmit={handleUpdateStatus}
      />

      <CustomPermissionsModal
        isOpen={!!selectedForCustomPerms}
        staff={selectedForCustomPerms}
        onClose={() => setSelectedForCustomPerms(null)}
        onSubmit={handleUpdateCustomPermissions}
      />

      <AssignStaffRoleModal
        isOpen={!!selectedForAssignRole}
        staff={selectedForAssignRole}
        onClose={() => setSelectedForAssignRole(null)}
        onSubmit={handleUpdateRoleGroup}
      />
    </div>
  );
}

