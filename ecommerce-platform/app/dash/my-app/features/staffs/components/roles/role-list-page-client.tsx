'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search } from 'lucide-react';
import RoleListHeader from './role-list-header';
import RoleMetricsCards from './role-metrics-cards';
import RoleTable from './role-table';
import RoleGroupModal from './role-group-modal';
import { StaffRoleGroup, CreateRoleGroupInput, UpdateRoleGroupInput } from '../../types/staff.types';
import {
  getRoleGroups,
  createRoleGroup,
  updateRoleGroup,
  deleteRoleGroup,
} from '../../api/staffs-api';
import { useToast } from '@/components/ui/toast';
import { useDebounce } from '@/hooks/use-debounce';

export default function RoleListPageClient() {
  const [roleGroups, setRoleGroups] = useState<StaffRoleGroup[]>([]);
  const [stats, setStats] = useState({ totalGroups: 0, totalAssignedStaffs: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StaffRoleGroup | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { showToast } = useToast();

  const fetchRoleGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getRoleGroups();
      setRoleGroups(res.roleGroups);
      setStats(res.stats);
    } catch (err: any) {
      showToast('error', err.message || 'Không thể tải danh sách nhóm quyền');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRoleGroups();
  }, [fetchRoleGroups]);

  const filteredGroups = useMemo(() => {
    return roleGroups.filter((g) => {
      const matchSearch =
        g.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (g.description && g.description.toLowerCase().includes(debouncedSearch.toLowerCase()));
      return matchSearch;
    });
  }, [roleGroups, debouncedSearch]);

  const handleOpenCreate = () => {
    setSelectedGroup(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (group: StaffRoleGroup) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleDelete = async (groupId: string | number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhóm quyền này không?')) return;

    try {
      await deleteRoleGroup(groupId);
      showToast('success', 'Đã xóa nhóm quyền thành công');
      fetchRoleGroups();
    } catch (err: any) {
      showToast('error', err.message || 'Xóa nhóm quyền thất bại');
    }
  };

  const handleSave = async (data: CreateRoleGroupInput | UpdateRoleGroupInput) => {
    try {
      if ('id' in data) {
        await updateRoleGroup(data);
        showToast('success', 'Cập nhật nhóm quyền thành công!');
      } else {
        await createRoleGroup(data);
        showToast('success', 'Tạo nhóm quyền mới thành công!');
      }
      fetchRoleGroups();
    } catch (err: any) {
      showToast('error', err.message || 'Lưu nhóm quyền thất bại');
    }
  };

  return (
    <div className="w-full">
      <RoleListHeader onCreateClick={handleOpenCreate} />

      <RoleMetricsCards
        totalGroups={stats.totalGroups}
        totalAssignedStaffs={stats.totalAssignedStaffs}
      />

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên nhóm, mô tả..."
            className="w-full h-11 pl-11 pr-4 bg-[#F8FAFC] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="w-full h-64 flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="w-8 h-8 border-4 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Đang tải danh sách nhóm quyền...</p>
        </div>
      ) : (
        <RoleTable
          roleGroups={filteredGroups}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      <RoleGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roleGroup={selectedGroup}
        onSubmit={handleSave}
      />
    </div>
  );
}
