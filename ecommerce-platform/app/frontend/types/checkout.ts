/**
 * CẤU TRÚC DỮ LIỆU & INTERFACES CHO MODULE CHECKOUT
 */

export type ShippingMethodType = "STANDARD" | "EXPRESS";
export type PaymentMethodType = "COD" | "QR_CODE";

export interface ShippingAddressForm {
  fullName: string;
  email: string;
  phone: string;
  provinceCode: string;
  provinceName: string;
  districtCode: string;
  districtName: string;
  wardCode: string;
  wardName: string;
  detailAddress: string;
}

export interface CheckoutFormInput extends ShippingAddressForm {
  shippingMethod: ShippingMethodType;
  orderNote?: string;
  paymentMethod: PaymentMethodType;
  termsAgreed: boolean;
  voucherCode?: string;
  pointsToUse?: number;
}

export interface MiniCartItemData {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
}

export interface AppliedVoucherData {
  voucherCode: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  calculatedDiscount: number;
  message?: string;
}

export interface QRPaymentInfo {
  qrCodeUrl: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  amount: number;
  transferContent: string;
  expiresAt: string;
}

export interface OrderCreatedData {
  orderId: string;
  orderCode: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  pointsUsed?: number;
  pointsDiscount?: number;
  pointsEarned?: number;
  paymentMethod: PaymentMethodType;
  status: "PENDING" | "PAID";
  qrInfo?: QRPaymentInfo;
}

export type CreateOrderResponse = OrderCreatedData;

// ----------------------------------------------------
// PROPS INTERFACES CHO DUMB COMPONENTS
// ----------------------------------------------------

export interface ContactInfoFormProps {
  fullName: string;
  email: string;
  phone: string;
  onChange: (field: keyof ShippingAddressForm, value: string) => void;
  errors?: Record<string, string>;
}

export interface ShippingAddressFormProps {
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  detailAddress: string;
  onProvinceChange: (code: string, name: string) => void;
  onDistrictChange: (code: string, name: string) => void;
  onWardChange: (code: string, name: string) => void;
  onDetailAddressChange: (val: string) => void;
  errors?: Record<string, string>;
}

export interface ShippingMethodSelectorProps {
  selectedMethod: ShippingMethodType;
  onChange: (method: ShippingMethodType) => void;
  standardFee: number;
  expressFee: number;
}

export interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onChange: (method: PaymentMethodType) => void;
}

export interface MiniCartItemListProps {
  items: MiniCartItemData[];
}

export interface CheckoutPriceBreakdownProps {
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  pointsDiscountAmount?: number;
  total: number;
}

export interface CODConfirmationModalProps {
  isOpen: boolean;
  orderCode: string;
  totalAmount: number;
  onConfirm: () => void;
  onClose: () => void;
}

export interface QRPaymentModalProps {
  isOpen: boolean;
  orderCode: string;
  qrInfo: QRPaymentInfo;
  onClose: () => void;
  onPaymentSuccess: () => void;
}
