'use client';
import React, { useState, useEffect, useCallback } from 'react';
import StaffDetailHeader from './staff-detail-header';
import StaffDetailGrid from './staff-detail-grid';
import StaffProfileCard from './cards/staff-profile-card';
import StaffRolePermissionsCard from './cards/staff-role-permissions-card';
import UpdateStaffStatusModal from './modals/update-staff-status-modal';
import CustomPermissionsModal from './modals/custom-permissions-modal';
import { StaffDetail, UpdateStaffStatusInput, UpdateStaffCustomPermissionsInput } from '../types/staff.types';
import {
  getStaffById,
  updateStaffStatus,
  updateStaffCustomPermissions,
} from '../api/staffs-api';
import { useToast } from '@/components/ui/toast';

interface StaffDetailContainerProps {
  staffId: string;
}

export default function StaffDetailContainer({ staffId }: StaffDetailContainerProps) {
  const [staff, setStaff] = useState<StaffDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCustomPermsModalOpen, setIsCustomPermsModalOpen] = useState(false);

  const { showToast } = useToast();

  const fetchStaffDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getStaffById(staffId);
      setStaff(data);
    } catch (err: any) {
      showToast('error', err.message || 'Không thể tải thông tin nhân viên');
    } finally {
      setIsLoading(false);
    }
  }, [staffId, showToast]);

  useEffect(() => {
    fetchStaffDetail();
  }, [fetchStaffDetail]);

  const handleUpdateStatus = async (data: UpdateStaffStatusInput) => {
    try {
      const updated = await updateStaffStatus(data);
      setStaff(updated);
      showToast(
        'success',
        data.status === 'BLOCKED'
          ? 'Đã khóa tài khoản và hủy phiên làm việc'
          : 'Đã mở khóa tài khoản nhân viên',
      );
    } catch (err: any) {
      showToast('error', err.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const handleUpdateCustomPermissions = async (data: UpdateStaffCustomPermissionsInput) => {
    try {
      const updated = await updateStaffCustomPermissions(data);
      setStaff(updated);
      showToast('success', 'Cập nhật đặc quyền bổ sung thành công!');
    } catch (err: any) {
      showToast('error', err.message || 'Cập nhật đặc quyền thất bại');
    }
  };

  const handleEditProfile = () => {
    alert('Tính năng cập nhật thông tin đang được hoàn thiện');
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 mt-4">Đang tải thông tin nhân viên...</p>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center">
        <p className="text-slate-500 font-medium">Không tìm thấy thông tin nhân viên.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <StaffDetailHeader
        staff={staff}
        onEditClick={handleEditProfile}
        onToggleStatusClick={() => setIsStatusModalOpen(true)}
      />

      <StaffDetailGrid>
        <StaffProfileCard staff={staff} />
        <StaffRolePermissionsCard
          staff={staff}
          onEditRoleClick={() => setIsCustomPermsModalOpen(true)}
        />
      </StaffDetailGrid>

      <UpdateStaffStatusModal
        isOpen={isStatusModalOpen}
        staff={staff}
        onClose={() => setIsStatusModalOpen(false)}
        onSubmit={handleUpdateStatus}
      />

      <CustomPermissionsModal
        isOpen={isCustomPermsModalOpen}
        staff={staff}
        onClose={() => setIsCustomPermsModalOpen(false)}
        onSubmit={handleUpdateCustomPermissions}
      />
    </div>
  );
}
