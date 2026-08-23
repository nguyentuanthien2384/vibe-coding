import { adminFetch } from '@/lib/admin-api';
import {
  AdminGlobalSearchData,
  AdminGlobalSearchResponse,
  GlobalSearchResultItem,
} from '../types/global-search.types';

export const STATIC_QUICK_ACTIONS: GlobalSearchResultItem[] = [
  {
    id: 'action-dashboard',
    title: 'Tổng quan Dashboard',
    subtitle: 'Xem báo cáo doanh thu & chỉ số thống kê',
    url: '/dashboard',
    type: 'action',
    badge: 'Trang chủ',
    badgeType: 'info',
  },
  {
    id: 'action-products',
    title: 'Quản lý Sản phẩm',
    subtitle: 'Danh sách và thông tin sản phẩm',
    url: '/products',
    type: 'action',
    badge: 'Sản phẩm',
    badgeType: 'neutral',
  },
  {
    id: 'action-orders',
    title: 'Quản lý Đơn hàng',
    subtitle: 'Xử lý và theo dõi trạng thái đơn hàng',
    url: '/orders',
    type: 'action',
    badge: 'Đơn hàng',
    badgeType: 'neutral',
  },
  {
    id: 'action-customers',
    title: 'Quản lý Khách hàng',
    subtitle: 'Danh sách và lịch sử mua sắm khách hàng',
    url: '/customers',
    type: 'action',
    badge: 'Khách hàng',
    badgeType: 'neutral',
  },
  {
    id: 'action-categories',
    title: 'Quản lý Chuyên mục',
    subtitle: 'Cấu trúc cây danh mục sản phẩm',
    url: '/categories',
    type: 'action',
    badge: 'Danh mục',
    badgeType: 'neutral',
  },
  {
    id: 'action-staffs',
    title: 'Quản lý Nhân viên & Phân quyền',
    subtitle: 'Danh sách tài khoản và nhóm quyền',
    url: '/staffs',
    type: 'action',
    badge: 'Hệ thống',
    badgeType: 'neutral',
  },
  {
    id: 'action-settings',
    title: 'Cài đặt Hệ thống',
    subtitle: 'Cấu hình chung, email, SEO, giao hàng',
    url: '/settings',
    type: 'action',
    badge: 'Cài đặt',
    badgeType: 'neutral',
  },
];

/**
 * Tích hợp gọi Backend API Global Search qua adminFetch (hỗ trợ HTTP Only cookies & Auto-Refresh Token)
 */
export async function searchGlobalAdmin(
  query: string,
  limit: number = 5,
): Promise<AdminGlobalSearchData> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      orders: [],
      products: [],
      customers: [],
      categories: [],
      staffs: [],
      actions: STATIC_QUICK_ACTIONS.slice(0, 4),
      totalResults: 4,
    };
  }

  try {
    const res = await adminFetch<AdminGlobalSearchResponse>(
      `/admin/dashboard/search/global?q=${encodeURIComponent(trimmed)}&limit=${limit}`,
    );

    if (res && res.data) {
      return res.data;
    }

    return {
      orders: [],
      products: [],
      customers: [],
      categories: [],
      staffs: [],
      actions: filterStaticActions(trimmed),
      totalResults: 0,
    };
  } catch (error) {
    console.error('Lỗi khi gọi API tìm kiếm toàn cục:', error);
    return {
      orders: [],
      products: [],
      customers: [],
      categories: [],
      staffs: [],
      actions: filterStaticActions(trimmed),
      totalResults: 0,
    };
  }
}

function filterStaticActions(query: string): GlobalSearchResultItem[] {
  const lower = query.toLowerCase();
  return STATIC_QUICK_ACTIONS.filter(
    (a) =>
      a.title.toLowerCase().includes(lower) ||
      (a.subtitle && a.subtitle.toLowerCase().includes(lower)) ||
      (a.badge && a.badge.toLowerCase().includes(lower)),
  );
}
