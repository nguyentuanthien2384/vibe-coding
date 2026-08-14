import { adminFetch } from '../../../lib/admin-api';
import {
  CustomerDetail,
  CustomerOrderSummary,
  CustomersListResponse,
  GetCustomersParams,
  CreateCustomerInput,
  UpdateCustomerStatusInput,
  UpdateCustomerInfoInput,
  CustomerAddress,
} from '../types/customer.types';

/**
 * Lấy danh sách khách hàng (Thành viên & Vãng lai) từ NestJS Backend API
 */
export async function getCustomers(params: GetCustomersParams): Promise<CustomersListResponse> {
  const {
    page = 1,
    limit = 10,
    search = '',
    type = 'ALL',
    status = 'ALL',
    sortBy = 'createdAt_desc',
  } = params;

  const queryParts: string[] = [
    `page=${page}`,
    `limit=${limit}`,
    `type=${type}`,
    `status=${status}`,
    `sortBy=${sortBy}`,
  ];

  if (search.trim()) {
    queryParts.push(`query=${encodeURIComponent(search.trim())}`);
  }

  const res = await adminFetch<any>(`/admin/customers?${queryParts.join('&')}`);

  return {
    data: res.data.items || [],
    total: res.data.meta?.totalItems || 0,
    page: res.data.meta?.page || page,
    limit: res.data.meta?.limit || limit,
    totalPages: res.data.meta?.totalPages || 1,
    stats: {
      totalCustomers: res.data.meta?.stats?.totalCustomers || 0,
      registeredCount: res.data.meta?.stats?.registeredCount || 0,
      guestCount: res.data.meta?.stats?.guestCount || 0,
      activeCount: res.data.meta?.stats?.registeredCount || 0,
      blockedCount: 0,
    },
  };
}

/**
 * Xem chi tiết thông tin khách hàng từ NestJS Backend API
 */
export async function getCustomerById(id: string): Promise<CustomerDetail | null> {
  try {
    const res = await adminFetch<any>(`/admin/customers/${encodeURIComponent(id)}`);
    return res.data || null;
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết khách hàng:', error);
    return null;
  }
}

/**
 * Lấy lịch sử đơn hàng của khách hàng từ NestJS Backend API
 */
export async function getCustomerOrders(
  customerId: string,
  page = 1,
  limit = 5
): Promise<{ data: CustomerOrderSummary[]; total: number }> {
  try {
    const res = await adminFetch<any>(
      `/admin/customers/${encodeURIComponent(customerId)}/orders?page=${page}&limit=${limit}`
    );
    return {
      data: res.data?.items || [],
      total: res.data?.meta?.totalItems || 0,
    };
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
    return { data: [], total: 0 };
  }
}

/**
 * Tạo mới tài khoản khách hàng thủ công
 */
export async function createCustomer(input: CreateCustomerInput): Promise<CustomerDetail> {
  const payload: any = {
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    password: input.password || '123456',
  };

  if (input.address) {
    payload.address = {
      recipientName: input.address.recipientName || input.fullName,
      phone: input.address.phone || input.phone,
      provinceCode: input.address.provinceCode || '79',
      provinceName: input.address.provinceName,
      districtCode: input.address.districtCode || '760',
      districtName: input.address.districtName,
      wardCode: input.address.wardCode || '26740',
      wardName: input.address.wardName,
      detailAddress: input.address.detailAddress,
    };
  }

  const res = await adminFetch<any>('/admin/customers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return res.data;
}

/**
 * Cập nhật trạng thái tài khoản khách hàng (ACTIVE / BLOCKED / INACTIVE)
 */
export async function updateCustomerStatus(
  input: UpdateCustomerStatusInput
): Promise<CustomerDetail> {
  const res = await adminFetch<any>(
    `/admin/customers/${encodeURIComponent(input.customerId)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status: input.status,
        reason: input.reason,
      }),
    }
  );

  return res.data;
}

/**
 * Cập nhật thông tin cá nhân cơ bản của khách hàng
 */
export async function updateCustomerInfo(
  input: UpdateCustomerInfoInput
): Promise<CustomerDetail> {
  const res = await adminFetch<any>(
    `/admin/customers/${encodeURIComponent(input.customerId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
      }),
    }
  );

  return res.data;
}

/**
 * Thêm địa chỉ nhận hàng mới cho khách hàng
 */
export async function addCustomerAddress(
  customerId: string,
  addressInput: Omit<CustomerAddress, 'id'>
): Promise<CustomerAddress> {
  const res = await adminFetch<any>(
    `/admin/customers/${encodeURIComponent(customerId)}/addresses`,
    {
      method: 'POST',
      body: JSON.stringify({
        recipientName: addressInput.recipientName,
        phone: addressInput.phone,
        provinceCode: addressInput.provinceCode || '79',
        provinceName: addressInput.provinceName,
        districtCode: addressInput.districtCode || '760',
        districtName: addressInput.districtName,
        wardCode: addressInput.wardCode || '26740',
        wardName: addressInput.wardName,
        detailAddress: addressInput.detailAddress,
        isDefault: addressInput.isDefault || false,
      }),
    }
  );

  return res.data;
}
