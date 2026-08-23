import { PermissionDefinition, StaffRoleGroup, StaffListItem, StaffDetail } from '../types/staff.types';

export const PERMISSION_GROUPS: {
  category: 'PRODUCT' | 'ORDER' | 'CUSTOMER' | 'SYSTEM';
  title: string;
  permissions: PermissionDefinition[];
}[] = [
  {
    category: 'PRODUCT',
    title: 'SẢN PHẨM & CHUYÊN MỤC',
    permissions: [
      { id: 'product.view', label: 'Xem danh sách sản phẩm', category: 'PRODUCT' },
      { id: 'product.manage', label: 'Thêm/Sửa/Xóa sản phẩm', category: 'PRODUCT' },
      { id: 'category.manage', label: 'Quản lý chuyên mục', category: 'PRODUCT' },
    ],
  },
  {
    category: 'ORDER',
    title: 'ĐƠN HÀNG & THANH TOÁN',
    permissions: [
      { id: 'order.view', label: 'Xem danh sách đơn hàng', category: 'ORDER' },
      { id: 'order.update_status', label: 'Cập nhật trạng thái đơn hàng', category: 'ORDER' },
      { id: 'payment.confirm', label: 'Xác nhận thanh toán', category: 'ORDER' },
      { id: 'report.export', label: 'Xuất báo cáo & Hóa đơn', category: 'ORDER' },
    ],
  },
  {
    category: 'CUSTOMER',
    title: 'NGƯỜI DÙNG & KHÁCH HÀNG',
    permissions: [
      { id: 'customer.view', label: 'Xem thông tin khách hàng', category: 'CUSTOMER' },
    ],
  },
  {
    category: 'SYSTEM',
    title: 'CẤU HÌNH HỆ THỐNG',
    permissions: [
      { id: 'banner.manage', label: 'Quản lý Banner/Quảng cáo', category: 'SYSTEM' },
    ],
  },
];

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) => g.permissions);

export const mockRoleGroups: StaffRoleGroup[] = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    description: 'Toàn quyền quản trị hệ thống. Không thể chỉnh sửa.',
    memberCount: 2,
    isSystem: true,
    permissions: ALL_PERMISSIONS.map((p) => p.id),
  },
  {
    id: 'role-store-manager',
    name: 'Cửa hàng trưởng',
    description: 'Quản lý sản phẩm, đơn hàng và xem báo cáo khách hàng.',
    memberCount: 3,
    isSystem: false,
    permissions: [
      'product.view',
      'product.manage',
      'category.manage',
      'order.view',
      'order.update_status',
      'payment.confirm',
      'report.export',
      'customer.view',
    ],
  },
  {
    id: 'role-warehouse',
    name: 'Nhân viên kho',
    description: 'Chỉ quản lý tồn kho và cập nhật trạng thái đơn hàng.',
    memberCount: 5,
    isSystem: false,
    permissions: ['product.view', 'order.view', 'order.update_status'],
  },
  {
    id: 'role-cskh',
    name: 'CSKH & Marketing',
    description: 'Quản lý đơn hàng, thông tin khách hàng và banner quảng cáo.',
    memberCount: 2,
    isSystem: false,
    permissions: ['order.view', 'customer.view', 'banner.manage'],
  },
];

export const mockStaffList: StaffListItem[] = [
  {
    id: '1',
    numericId: 1,
    fullName: 'Nguyễn Văn A',
    email: 'admin@techbite.com',
    phone: '0901234567',
    role: 'ADMIN',
    roleLabel: 'Quản trị viên',
    roleGroupId: 'role-super-admin',
    roleGroupName: 'Super Admin',
    status: 'ACTIVE',
    createdAt: '10/1/2024',
    lastLoginAt: '2026-08-22T08:15:00Z',
    inheritedPermissions: ALL_PERMISSIONS.map((p) => p.id),
    customPermissions: [],
  },
  {
    id: '2',
    numericId: 2,
    fullName: 'Trần Thị B',
    email: 'staff.01@techbite.com',
    phone: '0908765432',
    role: 'STAFF',
    roleLabel: 'Cửa hàng trưởng',
    roleGroupId: 'role-store-manager',
    roleGroupName: 'Cửa hàng trưởng',
    status: 'ACTIVE',
    createdAt: '15/2/2024',
    lastLoginAt: '2026-08-21T17:45:00Z',
    inheritedPermissions: [
      'product.view',
      'product.manage',
      'category.manage',
      'order.view',
      'order.update_status',
      'payment.confirm',
      'report.export',
      'customer.view',
    ],
    customPermissions: [],
  },
  {
    id: '3',
    numericId: 3,
    fullName: 'Lê Văn C',
    email: 'staff.02@techbite.com',
    phone: '0912345678',
    role: 'STAFF',
    roleLabel: 'Nhân viên kho',
    roleGroupId: 'role-warehouse',
    roleGroupName: 'Nhân viên kho',
    status: 'BLOCKED',
    createdAt: '20/3/2024',
    lastLoginAt: '2025-12-30T10:10:00Z',
    inheritedPermissions: ['product.view', 'order.view', 'order.update_status'],
    customPermissions: ['payment.confirm', 'report.export'],
  },
  {
    id: '4',
    numericId: 4,
    fullName: 'Phạm Minh D',
    email: 'staff.03@techbite.com',
    phone: '0987654321',
    role: 'STAFF',
    roleLabel: 'CSKH & Marketing',
    roleGroupId: 'role-cskh',
    roleGroupName: 'CSKH & Marketing',
    status: 'ACTIVE',
    createdAt: '5/4/2024',
    lastLoginAt: '2026-08-20T09:30:00Z',
    inheritedPermissions: ['order.view', 'customer.view', 'banner.manage', 'payment.confirm', 'report.export'],
    customPermissions: ['product.view'],
  },
];

export const getMockStaffDetail = (id: string): StaffDetail => {
  const staff = mockStaffList.find((s) => s.id === id) || mockStaffList[0];
  return {
    ...staff,
    notes: staff.role === 'ADMIN' ? 'Toàn quyền quản trị hệ thống TechBite.' : 'Nhân sự vận hành hệ thống.',
  };
};
