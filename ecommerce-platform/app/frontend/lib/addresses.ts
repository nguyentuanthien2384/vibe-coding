import { clientApiFetch } from './client-api';
import { CreateAddressInput, UpdateAddressInput, UserAddress } from '../types/address.types';

/**
 * Lấy danh sách địa chỉ giao hàng của người dùng đang đăng nhập
 */
export async function getAddressesApi(): Promise<UserAddress[]> {
  const res = await clientApiFetch<any>('/api/addresses', {
    method: 'GET',
    cache: 'no-store',
  });
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

/**
 * Tạo địa chỉ giao hàng mới
 */
export async function createAddressApi(input: CreateAddressInput): Promise<UserAddress> {
  const res = await clientApiFetch<any>('/api/addresses', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return res?.data || res;
}

/**
 * Cập nhật địa chỉ giao hàng
 */
export async function updateAddressApi(id: number, input: UpdateAddressInput): Promise<UserAddress> {
  const res = await clientApiFetch<any>(`/api/addresses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return res?.data || res;
}

/**
 * Đặt 1 địa chỉ làm địa chỉ mặc định
 */
export async function setDefaultAddressApi(id: number): Promise<UserAddress> {
  const res = await clientApiFetch<any>(`/api/addresses/${id}/set-default`, {
    method: 'PATCH',
  });
  return res?.data || res;
}

/**
 * Xóa 1 địa chỉ giao hàng
 */
export async function deleteAddressApi(id: number): Promise<{ success: boolean; message: string }> {
  const res = await clientApiFetch<any>(`/api/addresses/${id}`, {
    method: 'DELETE',
  });
  return res?.data || res;
}
