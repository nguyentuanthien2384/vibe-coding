export interface PermissionItem {
  id: string;
  label: string;
  category: 'PRODUCT' | 'ORDER' | 'CUSTOMER' | 'SYSTEM' | 'BLOG';
}

export const SYSTEM_PERMISSIONS: PermissionItem[] = [
  { id: 'product.view', label: 'Xem danh sách sản phẩm', category: 'PRODUCT' },
  { id: 'product.manage', label: 'Thêm/Sửa/Xóa sản phẩm', category: 'PRODUCT' },
  { id: 'category.manage', label: 'Quản lý chuyên mục', category: 'PRODUCT' },
  { id: 'order.view', label: 'Xem danh sách đơn hàng', category: 'ORDER' },
  { id: 'order.update_status', label: 'Cập nhật trạng thái đơn hàng', category: 'ORDER' },
  { id: 'payment.confirm', label: 'Xác nhận thanh toán', category: 'ORDER' },
  { id: 'report.export', label: 'Xuất báo cáo & Hóa đơn', category: 'ORDER' },
  { id: 'customer.view', label: 'Xem thông tin khách hàng', category: 'CUSTOMER' },
  { id: 'customer.manage', label: 'Quản lý thông tin khách hàng', category: 'CUSTOMER' },
  { id: 'blog.view', label: 'Xem bài viết & chuyên mục', category: 'BLOG' },
  { id: 'blog.manage', label: 'Thêm/Sửa/Xóa bài viết blog', category: 'BLOG' },
  { id: 'blog.category_manage', label: 'Quản lý chuyên mục bài viết', category: 'BLOG' },
  { id: 'banner.manage', label: 'Quản lý Banner/Quảng cáo', category: 'SYSTEM' },
  { id: 'setting.manage', label: 'Cấu hình hệ thống', category: 'SYSTEM' },
  { id: 'point.manage', label: 'Quản lý & Cấu hình tích điểm', category: 'SYSTEM' },
];


export interface RoleGroupItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  memberCount: number;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleGroupsListResponse {
  success: boolean;
  statusCode: number;
  data: {
    stats: {
      totalGroups: number;
      totalAssignedStaffs: number;
    };
    roleGroups: RoleGroupItem[];
  };
}

export interface RoleGroupDetailResponse {
  success: boolean;
  statusCode: number;
  data: RoleGroupItem;
}

export interface RoleGroupMutateResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: RoleGroupItem;
}
