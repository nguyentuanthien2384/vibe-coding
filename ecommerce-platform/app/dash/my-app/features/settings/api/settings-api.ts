import { adminFetch } from '../../../lib/admin-api';
import {
  BannerSettingItem,
  EmailSettings,
  PointsConfig,
  SystemSettingsPayload,
} from '../types/settings.types';

/**
 * Lấy toàn bộ cấu hình hệ thống từ NestJS Backend API (bao gồm cấu hình điểm)
 */
export async function getAdminSettings(): Promise<SystemSettingsPayload> {
  const [res, pointsRes] = await Promise.allSettled([
    adminFetch<{ data: SystemSettingsPayload }>('/admin/settings'),
    getPointsConfig(),
  ]);

  if (res.status === 'rejected') {
    throw res.reason;
  }

  const payload = res.value.data;
  if (pointsRes.status === 'fulfilled') {
    payload.points = pointsRes.value;
  }

  return payload;
}

/**
 * Lấy cấu hình hệ thống điểm (GET /api/v1/admin/points/config)
 */
export async function getPointsConfig(): Promise<PointsConfig> {
  const res = await adminFetch<{ data: PointsConfig }>('/admin/points/config');
  return res.data;
}

/**
 * Cập nhật cấu hình hệ thống điểm (PATCH /api/v1/admin/points/config)
 */
export async function patchPointsConfig(dto: Partial<PointsConfig>): Promise<PointsConfig> {
  const res = await adminFetch<{ data: PointsConfig }>('/admin/points/config', {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
  return res.data;
}

/**
 * Cập nhật toàn bộ các nhóm cấu hình hệ thống (PUT)
 */
export async function updateAdminSettings(payload: Partial<SystemSettingsPayload>): Promise<boolean> {
  // Loại bỏ field banners (quản lý riêng) và hasPasswordConfigured trước khi gửi lên
  const { banners: _banners, email, ...rest } = payload;

  const body: Record<string, unknown> = { ...rest };

  if (email) {
    // Không gửi hasPasswordConfigured lên server
    const { hasPasswordConfigured: _hp, ...emailPayload } = email;
    body.email = emailPayload;
  }

  await adminFetch('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return true;
}

/**
 * Cập nhật nhanh một nhóm cấu hình đơn lẻ (PATCH /:group)
 */
export async function patchGroupSettings(
  group: 'general' | 'menus' | 'seo' | 'email' | 'payment' | 'shipping',
  value: unknown,
): Promise<boolean> {
  // Với group email: loại bỏ hasPasswordConfigured trước khi gửi
  let body = value;
  if (group === 'email' && value && typeof value === 'object') {
    const { hasPasswordConfigured: _hp, ...emailPayload } = value as EmailSettings;
    body = emailPayload;
  }

  await adminFetch(`/admin/settings/${group}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return true;
}

/**
 * Gửi email thử nghiệm để kiểm tra kết nối SMTP
 */
export async function testEmailConnection(
  targetEmail: string,
  customSettings?: Omit<EmailSettings, 'hasPasswordConfigured'>,
): Promise<{ success: boolean; message: string }> {
  const res = await adminFetch<{ success: boolean; message: string }>('/admin/settings/email/test', {
    method: 'POST',
    body: JSON.stringify({ targetEmail, customSettings }),
  });
  return res;
}

// ─── BANNERS APIs ────────────────────────────────────────────────────────────

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
  const res = await adminFetch<{ data: unknown[] }>(`/admin/banners${queryString}`);

  return (res.data || []).map((b: unknown) => {
    const bObj = b as Record<string, unknown>;
    return {
      id: String(bObj.id),
      title: String(bObj.title),
      subtitle: (bObj.subtitle as string) ?? '',
      imageUrl: String(bObj.imageUrl),
      targetUrl: (bObj.linkUrl as string) ?? '',
      category: (bObj.category as BannerSettingItem['category']) ?? 'HOME',
      position:
        ((bObj.bannerPosition ?? bObj.position) as BannerSettingItem['position']) ?? 'HERO_BANNER',
      order: (bObj.order as number) ?? (bObj.position as number) ?? 0,
      isActive: (bObj.isActive as boolean) ?? true,
    };
  });
}

/**
 * Tạo mới Banner quảng cáo
 */
export async function createAdminBanner(
  banner: Omit<BannerSettingItem, 'id'>,
): Promise<BannerSettingItem> {
  const res = await adminFetch<{ data: Record<string, unknown> }>('/admin/banners', {
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
    id: String(b.id),
    title: String(b.title),
    subtitle: (b.subtitle as string) ?? '',
    imageUrl: String(b.imageUrl),
    targetUrl: (b.linkUrl as string) ?? '',
    category: b.category as BannerSettingItem['category'],
    position: b.bannerPosition as BannerSettingItem['position'],
    order: b.order as number,
    isActive: b.isActive as boolean,
  };
}

/**
 * Cập nhật thông tin Banner
 */
export async function updateAdminBanner(
  id: string,
  banner: Partial<BannerSettingItem>,
): Promise<BannerSettingItem> {
  const res = await adminFetch<{ data: Record<string, unknown> }>(
    `/admin/banners/${encodeURIComponent(id)}`,
    {
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
    },
  );

  const b = res.data;
  return {
    id: String(b.id),
    title: String(b.title),
    subtitle: (b.subtitle as string) ?? '',
    imageUrl: String(b.imageUrl),
    targetUrl: (b.linkUrl as string) ?? '',
    category: b.category as BannerSettingItem['category'],
    position: b.bannerPosition as BannerSettingItem['position'],
    order: b.order as number,
    isActive: b.isActive as boolean,
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
