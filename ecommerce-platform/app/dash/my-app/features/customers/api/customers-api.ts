import { MOCK_CUSTOMERS, MOCK_CUSTOMER_ORDERS } from '../data/mock-customers';
import {
  CustomerDetail,
  CustomerListItem,
  CustomerOrderSummary,
  CustomersListResponse,
  GetCustomersParams,
  CreateCustomerInput,
  UpdateCustomerStatusInput,
  UpdateCustomerInfoInput,
  CustomerAddress,
} from '../types/customer.types';

// State lưu trữ dữ liệu client-side tạm thời
let customersStore: CustomerDetail[] = [...MOCK_CUSTOMERS];

export async function getCustomers(params: GetCustomersParams): Promise<CustomersListResponse> {
  const {
    page = 1,
    limit = 10,
    search = '',
    type = 'ALL',
    status = 'ALL',
    sortBy = 'createdAt_desc',
  } = params;

  let filtered = [...customersStore];

  // 1. Tìm kiếm theo tên, email, sđt
  if (search.trim()) {
    const s = search.trim().toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.fullName.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        c.phone.includes(s)
    );
  }

  // 2. Lọc theo Loại khách hàng
  if (type !== 'ALL') {
    filtered = filtered.filter((c) => c.type === type);
  }

  // 3. Lọc theo Trạng thái
  if (status !== 'ALL') {
    filtered = filtered.filter((c) => c.status === status);
  }

  // 4. Sắp xếp
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'createdAt_desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'createdAt_asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'totalSpent_desc':
        return b.totalSpent - a.totalSpent;
      case 'totalOrders_desc':
        return b.totalOrders - a.totalOrders;
      case 'name_asc':
        return a.fullName.localeCompare(b.fullName, 'vi');
      default:
        return 0;
    }
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedData: CustomerListItem[] = filtered.slice(startIndex, startIndex + limit).map((c) => ({
    id: c.id,
    fullName: c.fullName,
    email: c.email,
    phone: c.phone,
    avatarUrl: c.avatarUrl,
    type: c.type,
    status: c.status,
    totalOrders: c.totalOrders,
    totalSpent: c.totalSpent,
    createdAt: c.createdAt,
    lastOrderAt: c.lastOrderAt,
  }));

  // Thống kê tổng quan
  const stats = {
    totalCustomers: customersStore.length,
    registeredCount: customersStore.filter((c) => c.type === 'REGISTERED').length,
    guestCount: customersStore.filter((c) => c.type === 'GUEST').length,
    activeCount: customersStore.filter((c) => c.status === 'ACTIVE').length,
    blockedCount: customersStore.filter((c) => c.status === 'BLOCKED').length,
  };

  return {
    data: paginatedData,
    total,
    page,
    limit,
    totalPages,
    stats,
  };
}

export async function getCustomerById(id: string): Promise<CustomerDetail | null> {
  const customer = customersStore.find((c) => c.id === id);
  return customer ? { ...customer } : null;
}

export async function getCustomerOrders(
  customerId: string,
  page = 1,
  limit = 5
): Promise<{ data: CustomerOrderSummary[]; total: number }> {
  const orders = MOCK_CUSTOMER_ORDERS[customerId] || [];
  const total = orders.length;
  const startIndex = (page - 1) * limit;
  const paginated = orders.slice(startIndex, startIndex + limit);
  return { data: paginated, total };
}

export async function createCustomer(input: CreateCustomerInput): Promise<CustomerDetail> {
  const newId = `cust-${Date.now().toString().slice(-4)}`;
  const now = new Date().toISOString();

  const newAddresses: CustomerAddress[] = input.address
    ? [
        {
          id: `addr-${Date.now().toString().slice(-4)}`,
          recipientName: input.fullName,
          phone: input.phone,
          provinceName: input.address.provinceName,
          districtName: input.address.districtName,
          wardName: input.address.wardName,
          detailAddress: input.address.detailAddress,
          isDefault: true,
        },
      ]
    : [];

  const newCustomer: CustomerDetail = {
    id: newId,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    type: 'REGISTERED',
    status: 'ACTIVE',
    totalOrders: 0,
    totalSpent: 0,
    createdAt: now,
    registeredAt: now,
    addresses: newAddresses,
  };

  customersStore = [newCustomer, ...customersStore];
  return newCustomer;
}

export async function updateCustomerStatus(input: UpdateCustomerStatusInput): Promise<CustomerDetail> {
  const index = customersStore.findIndex((c) => c.id === input.customerId);
  if (index === -1) {
    throw new Error('Không tìm thấy khách hàng');
  }

  const updated: CustomerDetail = {
    ...customersStore[index],
    status: input.status,
    notes: input.reason
      ? `${customersStore[index].notes || ''}\n[Cập nhật trạng thái ${input.status}]: ${input.reason}`.trim()
      : customersStore[index].notes,
  };

  customersStore[index] = updated;
  return updated;
}

export async function addCustomerAddress(
  customerId: string,
  addressInput: Omit<CustomerAddress, 'id'>
): Promise<CustomerAddress> {
  const customer = customersStore.find((c) => c.id === customerId);
  if (!customer) throw new Error('Khách hàng không tồn tại');

  const newAddr: CustomerAddress = {
    ...addressInput,
    id: `addr-${Date.now().toString().slice(-4)}`,
  };

  if (newAddr.isDefault) {
    customer.addresses.forEach((a) => (a.isDefault = false));
  } else if (customer.addresses.length === 0) {
    newAddr.isDefault = true;
  }

  customer.addresses.push(newAddr);
  return newAddr;
}

export async function updateCustomerInfo(input: UpdateCustomerInfoInput): Promise<CustomerDetail> {
  const index = customersStore.findIndex((c) => c.id === input.customerId);
  if (index === -1) {
    throw new Error('Không tìm thấy khách hàng');
  }

  const updated: CustomerDetail = {
    ...customersStore[index],
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    type: input.type,
    notes: input.notes,
  };

  customersStore[index] = updated;
  return updated;
}
