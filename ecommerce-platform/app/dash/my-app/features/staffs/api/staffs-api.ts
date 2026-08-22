import { adminFetch } from '@/lib/admin-api';
import {
  StaffListItem,
  StaffDetail,
  StaffRole,
  StaffStatus,
  StaffRoleGroup,
  CreateStaffInput,
  UpdateStaffStatusInput,
  UpdateStaffRoleInput,
  UpdateStaffCustomPermissionsInput,
  CreateRoleGroupInput,
  UpdateRoleGroupInput,
} from '../types/staff.types';

export interface GetStaffsParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: StaffRole | 'ALL';
  status?: StaffStatus | 'ALL';
  roleGroupId?: number;
}

export interface GetStaffsResult {
  staffs: StaffListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RoleGroupsResult {
  stats: {
    totalGroups: number;
    totalAssignedStaffs: number;
  };
  roleGroups: StaffRoleGroup[];
}

/**
 * Lấy danh sách nhân viên quản trị từ NestJS Backend API
 */
export async function getStaffs(params: GetStaffsParams = {}): Promise<GetStaffsResult> {
  const { page = 1, limit = 10, search = '', role = 'ALL', status = 'ALL', roleGroupId } = params;

  const queryParts: string[] = [
    `page=${page}`,
    `limit=${limit}`,
    `role=${role}`,
    `status=${status}`,
  ];

  if (search.trim()) {
    queryParts.push(`search=${encodeURIComponent(search.trim())}`);
  }
  if (roleGroupId) {
    queryParts.push(`roleGroupId=${roleGroupId}`);
  }

  const res = await adminFetch<{
    success: boolean;
    data: {
      staffs: StaffListItem[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  }>(`/admin/staffs?${queryParts.join('&')}`);

  return {
    staffs: res.data.staffs || [],
    total: res.data.pagination?.total || 0,
    page: res.data.pagination?.page || page,
    limit: res.data.pagination?.limit || limit,
    totalPages: res.data.pagination?.totalPages || 1,
  };
}

/**
 * Lấy thông tin chi tiết một nhân viên
 */
export async function getStaffById(id: string): Promise<StaffDetail> {
  const res = await adminFetch<{
    success: boolean;
    data: StaffDetail;
  }>(`/admin/staffs/${id}`);

  return res.data;
}

/**
 * Tạo tài khoản nhân viên mới
 */
export async function createStaff(input: CreateStaffInput): Promise<StaffDetail> {
  const res = await adminFetch<{
    success: boolean;
    message: string;
    data: StaffDetail;
  }>('/admin/staffs', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return res.data;
}

/**
 * Khóa hoặc Mở khóa tài khoản nhân viên (Thu hồi token)
 */
export async function updateStaffStatus(input: UpdateStaffStatusInput): Promise<StaffDetail> {
  const res = await adminFetch<{
    success: boolean;
    message: string;
    data: StaffDetail;
  }>(`/admin/staffs/${input.staffId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: input.status,
      reason: input.reason,
    }),
  });

  return res.data;
}

/**
 * Gán / Đổi nhóm quyền cho nhân viên
 */
export async function updateStaffRoleGroup(input: UpdateStaffRoleInput): Promise<StaffDetail> {
  const res = await adminFetch<{
    success: boolean;
    message: string;
    data: StaffDetail;
  }>(`/admin/staffs/${input.staffId}/role-group`, {
    method: 'PATCH',
    body: JSON.stringify({
      role: input.role,
      roleGroupId: input.roleGroupId,
    }),
  });

  return res.data;
}

/**
 * Cập nhật đặc quyền bổ sung cấp riêng
 */
export async function updateStaffCustomPermissions(
  input: UpdateStaffCustomPermissionsInput,
): Promise<StaffDetail> {
  const res = await adminFetch<{
    success: boolean;
    message: string;
    data: StaffDetail;
  }>(`/admin/staffs/${input.staffId}/custom-permissions`, {
    method: 'PATCH',
    body: JSON.stringify({
      customPermissions: input.customPermissions,
    }),
  });

  return res.data;
}

/**
 * Chỉnh sửa thông tin cơ bản nhân viên (Tên, SĐT, Ghi chú)
 */
export async function updateStaffBasicInfo(
  id: string,
  data: { fullName?: string; phone?: string; notes?: string },
): Promise<StaffDetail> {
  const res = await adminFetch<{
    success: boolean;
    message: string;
    data: StaffDetail;
  }>(`/admin/staffs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLE GROUPS API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách nhóm quyền & Thống kê từ Backend API
 */
export async function getRoleGroups(): Promise<RoleGroupsResult> {
  const res = await adminFetch<{
    success: boolean;
    data: {
      stats: {
        totalGroups: number;
        totalAssignedStaffs: number;
      };
      roleGroups: StaffRoleGroup[];
    };
  }>('/admin/role-groups');

  return {
    stats: res.data.stats || { totalGroups: 0, totalAssignedStaffs: 0 },
    roleGroups: res.data.roleGroups || [],
  };
}

/**
 * Tạo mới nhóm quyền
 */
export async function createRoleGroup(input: CreateRoleGroupInput): Promise<StaffRoleGroup> {
  const res = await adminFetch<{
    success: boolean;
    message: string;
    data: StaffRoleGroup;
  }>('/admin/role-groups', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return res.data;
}

/**
 * Cập nhật nhóm quyền
 */
export async function updateRoleGroup(input: UpdateRoleGroupInput): Promise<StaffRoleGroup> {
  const res = await adminFetch<{
    success: boolean;
    message: string;
    data: StaffRoleGroup;
  }>(`/admin/role-groups/${input.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: input.name,
      description: input.description,
      permissions: input.permissions,
    }),
  });

  return res.data;
}

/**
 * Xóa nhóm quyền
 */
export async function deleteRoleGroup(id: string | number): Promise<void> {
  await adminFetch<{
    success: boolean;
    message: string;
  }>(`/admin/role-groups/${id}`, {
    method: 'DELETE',
  });
}
