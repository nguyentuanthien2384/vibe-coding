export type CustomerType = 'REGISTERED' | 'GUEST';

export type CustomerStatus = 'ACTIVE' | 'BLOCKED' | 'INACTIVE';

export interface CustomerAddressItem {
  id: number;
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
  avatarUrl?: string | null;
  type: CustomerType;
  status: CustomerStatus;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  lastOrderAt?: string | null;
  notes?: string | null;
}


export interface CustomerDetail extends CustomerListItem {
  averageOrderValue: number;
  addresses: CustomerAddressItem[];
  notes?: string | null;
  registeredAt?: string | null;
}

export interface CustomerOrderSummaryItem {
  id: number;
  orderCode: string;
  createdAt: string;
  totalAmount: number;
  itemsCount: number;
  paymentStatus: string;
  orderStatus: string;
}

export interface CustomerListResponse {
  statusCode: number;
  message: string;
  data: {
    items: CustomerListItem[];
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      stats: {
        totalCustomers: number;
        registeredCount: number;
        guestCount: number;
      };
    };
  };
}

export interface CustomerDetailResponse {
  statusCode: number;
  message: string;
  data: CustomerDetail;
}

export interface CustomerMutateResponse {
  statusCode: number;
  message: string;
  data: any;
}

export interface CustomerOrdersResponse {
  statusCode: number;
  message: string;
  data: {
    items: CustomerOrderSummaryItem[];
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  };
}
