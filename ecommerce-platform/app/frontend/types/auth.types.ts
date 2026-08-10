/**
 * Types & Data Contracts cho Module Auth (Đăng nhập, Đăng ký, User Profile)
 */

export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface UserProfile {
  id: number | string;
  fullName: string;
  name?: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt: string | Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword?: string;
}

export interface UpdateProfileDto {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}

export interface OrderItemDetail {
  id: number;
  productId: string;
  productName: string;
  productImageUrl?: string;
  price: number;
  quantity: number;
  itemTotal: number;
}

export interface OrderSummaryItem {
  id: string | number;
  orderCode: string;
  customerName?: string;
  createdAt: string;
  paidAt?: string | Date;
  totalAmount: number;
  shippingFee?: number;
  discountAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  status?: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
  itemCount: number;
  orderItems?: OrderItemDetail[];
}

export interface OrderStatusCounts {
  ALL: number;
  PENDING: number;
  CONFIRMED: number;
  PROCESSING: number;
  SHIPPING: number;
  DELIVERED: number;
  CANCELLED: number;
}

export interface MyOrdersResponse {
  items: OrderSummaryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  statusCounts?: OrderStatusCounts;
}

export interface OrderDetailData {
  id: string | number;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingMethod: 'STANDARD' | 'EXPRESS';
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'COD' | 'QR_CODE';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  orderNote?: string;
  createdAt: string;
  paidAt?: string;
  qrInfo?: {
    qrCodeUrl: string;
    bankName: string;
    accountNo: string;
    accountName: string;
    amount: number;
    transferContent: string;
    expiresAt: string;
  };
  itemsCount: number;
  orderItems: OrderItemDetail[];
}
