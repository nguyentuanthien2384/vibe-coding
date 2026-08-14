import { adminFetch } from '../../../lib/admin-api';
import { BannerSettingItem, SystemSettingsPayload } from '../types/settings.types';

/**
 * Lấy toàn bộ cấu hình hệ thống (General, Payment, Shipping, Banners, Menus, SEO) từ NestJS Backend API
 */
export async function getAdminSettings(): Promise<SystemSettingsPayload> {
  const res = await adminFetch<{ data: SystemSettingsPayload }>('/admin/settings');
  return res.data;
}

/**
 * Cập nhật toàn bộ các nhóm cấu hình hệ thống
 */
export async function updateAdminSettings(payload: Partial<SystemSettingsPayload>): Promise<boolean> {
  await adminFetch('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return true;
}

/**
 * Lấy danh sách Banners từ NestJS Backend API
 */
export async function getAdminBanners(params?: {
  category?: string;
  position?: string;
  search?: string;
}): Promise<BannerSettingItem[]> {
  const queryParts: string[] = [];
  if (params?.category && params.category !== 'ALL') queryParts.push(`category=${params.category}`);
  if (params?.position && params.position !== 'ALL') queryParts.push(`position=${params.position}`);
  if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search.trim())}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  const res = await adminFetch<{ data: any[] }>(`/admin/banners${queryString}`);

  return (res.data || []).map((b: any) => ({
    id: b.id.toString(),
    title: b.title,
    subtitle: b.subtitle ?? '',
    imageUrl: b.imageUrl,
    targetUrl: b.linkUrl ?? '',
    category: b.category ?? 'HOME',
    position: b.bannerPosition ?? b.position ?? 'HERO_BANNER',
    order: b.order ?? b.position ?? 0,
    isActive: b.isActive ?? true,
  }));
}

/**
 * Tạo mới Banner quảng cáo
 */
export async function createAdminBanner(
  banner: Omit<BannerSettingItem, 'id'>,
): Promise<BannerSettingItem> {
  const res = await adminFetch<{ data: any }>('/admin/banners', {
    method: 'POST',
    body: JSON.stringify({
      title: banner.title,
      subtitle: banner.subtitle,
      imageUrl: banner.imageUrl,
      targetUrl: banner.targetUrl,
      category: banner.category,
      position: banner.position,
      order: banner.order,
      isActive: banner.isActive,
    }),
  });

  const b = res.data;
  return {
    id: b.id.toString(),
    title: b.title,
    subtitle: b.subtitle ?? '',
    imageUrl: b.imageUrl,
    targetUrl: b.linkUrl ?? '',
    category: b.category,
    position: b.bannerPosition,
    order: b.order,
    isActive: b.isActive,
  };
}

/**
 * Cập nhật thông tin Banner
 */
export async function updateAdminBanner(
  id: string,
  banner: Partial<BannerSettingItem>,
): Promise<BannerSettingItem> {
  const res = await adminFetch<{ data: any }>(`/admin/banners/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      ...(banner.title !== undefined && { title: banner.title }),
      ...(banner.subtitle !== undefined && { subtitle: banner.subtitle }),
      ...(banner.imageUrl !== undefined && { imageUrl: banner.imageUrl }),
      ...(banner.targetUrl !== undefined && { targetUrl: banner.targetUrl }),
      ...(banner.category !== undefined && { category: banner.category }),
      ...(banner.position !== undefined && { position: banner.position }),
      ...(banner.order !== undefined && { order: banner.order }),
      ...(banner.isActive !== undefined && { isActive: banner.isActive }),
    }),
  });

  const b = res.data;
  return {
    id: b.id.toString(),
    title: b.title,
    subtitle: b.subtitle ?? '',
    imageUrl: b.imageUrl,
    targetUrl: b.linkUrl ?? '',
    category: b.category,
    position: b.bannerPosition,
    order: b.order,
    isActive: b.isActive,
  };
}

/**
 * Xóa Banner khỏi hệ thống (và tự động xóa file đĩa)
 */
export async function deleteAdminBanner(id: string): Promise<boolean> {
  await adminFetch(`/admin/banners/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return true;
}

/**
 * Thay đổi thứ tự Banners hàng loạt
 */
export async function reorderAdminBanners(
  items: { id: string; order: number }[],
): Promise<boolean> {
  await adminFetch('/admin/banners/reorder', {
    method: 'PATCH',
    body: JSON.stringify({
      items: items.map((it) => ({
        id: parseInt(it.id, 10),
        order: it.order,
      })),
    }),
  });
  return true;
}
