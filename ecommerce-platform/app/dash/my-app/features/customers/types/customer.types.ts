export type CustomerType = 'REGISTERED' | 'GUEST';

export type CustomerStatus = 'ACTIVE' | 'BLOCKED' | 'INACTIVE';

export type CustomerSortOption = 
  | 'createdAt_desc'
  | 'createdAt_asc'
  | 'totalSpent_desc'
  | 'totalOrders_desc'
  | 'name_asc';

export interface CustomerAddress {
  id: string;
  recipientName: string;
  phone: string;
  provinceCode?: string;
  provinceName: string;
  districtCode?: string;
  districtName: string;
  wardCode?: string;
  wardName: string;
  detailAddress: string;
  isDefault: boolean;
}

export interface CustomerListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  type: CustomerType;
  status: CustomerStatus;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  lastOrderAt?: string;
}

export interface CustomerDetail extends CustomerListItem {
  addresses: CustomerAddress[];
  notes?: string;
  registeredAt?: string;
}

export interface CustomerOrderSummary {
  id: string;
  orderCode: string;
  createdAt: string;
  totalAmount: number;
  itemsCount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
}

export interface CreateCustomerInput {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  address?: {
    provinceName: string;
    districtName: string;
    wardName: string;
    detailAddress: string;
  };
}

export interface UpdateCustomerStatusInput {
  customerId: string;
  status: CustomerStatus;
  reason?: string;
}

export interface UpdateCustomerInfoInput {
  customerId: string;
  fullName: string;
  email: string;
  phone: string;
  type: CustomerType;
  notes?: string;
}

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: CustomerType | 'ALL';
  status?: CustomerStatus | 'ALL';
  sortBy?: CustomerSortOption;
}

export interface CustomersListResponse {
  data: CustomerListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    totalCustomers: number;
    registeredCount: number;
    guestCount: number;
    activeCount: number;
    blockedCount: number;
  };
}
