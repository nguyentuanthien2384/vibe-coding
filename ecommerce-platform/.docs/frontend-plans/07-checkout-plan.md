# QUY HOẠCH KỸ THUẬT FRONTEND: TRANG THANH TOÁN (CHECKOUT PAGE)

> **Nguồn Ý Tưởng:** `.docs/ideas/07-checkout.md`  
> **Tài Liệu Tham Chiếu:** `.docs/ARCHITECTURE.md`, `.docs/STYLEGUIDE.md`, `.agent/AGENTS.md`, `.docs/FEATURES_DONE.md`  
> **Phiên bản:** 1.0.0  
> **Ngày tạo:** 2026-08-09  

---

## 1. PHÂN RÃ COMPONENT (COMPONENT TREE)

Để tuân thủ tuyệt đối quy tắc **Next.js App Router (Server Component là mặc định)** và **Phân tách rõ ràng Logic - UI (Smart vs Dumb Components)**, kiến trúc cây Component cho module Checkout được quy hoạch chi tiết như sau:

```
apps/frontend/
├── app/
│   └── checkout/
│       ├── page.tsx [SERVER]                     → Server Component khởi tạo trang Checkout, prefetch Auth & Cart state
│       └── success/
│           └── page.tsx [SERVER]                 → Trang xác nhận đặt hàng thành công (Order Confirmation)
├── components/
│   └── checkout/
│       ├── checkout-container.tsx [SMART]        → State Manager chính: Quản lý Form, Vouchers, Shipping Method, Payment Modal state
│       ├── checkout-layout-grid.tsx [DUMB]       → Grid layout 2 cột trên Desktop (7:5), 1 cột trên Mobile (`rounded-2xl`, gap-6)
│       │
│       ├── shipping/
│       │   ├── user-shipping-section.tsx [DUMB]  → Card bọc thông tin người nhận & vận chuyển (`bg-white rounded-2xl p-6`)
│       │   ├── contact-info-form.tsx [DUMB]      → Inputs Họ tên, Email, Số điện thoại (tự điền khi User đã đăng nhập)
│       │   ├── shipping-address-form.tsx [DUMB]  → Chọn Tỉnh/Thành, Quận/Huyện, Phường/Xã và Số nhà / Tên đường chi tiết
│       │   ├── shipping-method-selector.tsx [DUMB] → Radio choice chọn Giao hàng Tiêu chuẩn (30k) hoặc Hỏa tốc (50k)
│       │   ├── order-note-input.tsx [DUMB]       → Textarea nhập ghi chú đơn hàng cho Đơn vị vận chuyển
│       │   └── checkout-terms-checkbox.tsx [DUMB]→ Checkbox đồng ý Điều khoản mua hàng & Bảo mật của TechBite
│       │
│       ├── summary/
│       │   ├── order-summary-section.tsx [DUMB]  → Card bọc tóm tắt đơn hàng & thanh toán bên cột phải
│       │   ├── mini-cart-item-list.tsx [DUMB]    → Danh sách sản phẩm mini cuộn gọn (Thumbnail 1:1, Tên, Số lượng, Giá bán)
│       │   ├── mini-cart-item.tsx [DUMB]         → Single item row hiển thị thông tin sản phẩm snapshot
│       │   ├── coupon-input-container.tsx [SMART]→ Input nhập mã giảm giá, sử dụng useDebounce (300-500ms), gọi API validate
│       │   ├── checkout-price-breakdown.tsx [DUMB]→ Tính Tạm tính, Phí vận chuyển, Giảm giá voucher, Tổng cộng (`text-red-600 font-bold`)
│       │   ├── payment-method-selector.tsx [DUMB]→ Radio choice chọn phương thức: COD hoặc QR Code (VietQR)
│       │   └── checkout-submit-button.tsx [DUMB] → Nút "Xác nhận & Thanh toán" (`bg-orange-600 hover:bg-orange-700 text-white font-extrabold`)
│       │
│       └── modals/
│           ├── cod-confirmation-modal.tsx [SMART] → Popup thông báo ghi chú COD "Thanh toán trực tiếp cho shipper khi nhận hàng" & Redirect
│           └── qr-payment-modal.tsx [SMART]      → Popup VietQR Code: Ảnh QR, Mã chuyển khoản, Đếm ngược 15p, Nút Tải QR & Polling/SSE Auto confirmation
```

### Chú thích phân loại Component

| Nhãn | Ý nghĩa | Quy tắc thực thi |
|---|---|---|
| `[SERVER]` | Next.js Async Server Component | Giữ vai trò khung trang (`page.tsx`), **CẤM** chuyển `page.tsx` thành Client Component |
| `[SMART]` | Client Container Component (`"use client"`) | Kết nối Store/Custom Hook/TanStack Query, xử lý Submit, Validation & Side-effects |
| `[DUMB]` | Pure UI Component (`"use client"` hoặc Server) | Chỉ nhận `props`, render UI, **CẤM** gọi API hay truy cập Store trực tiếp |

---

## 2. QUẢN LÝ TRẠNG THÁI & LUỒNG THANH TOÁN (STATE MANAGEMENT & FLOW)

### 2.1 Bảng phân loại State

| State | Kiểu Dữ Liệu | Loại State | Công Cụ | Mục Đích & Rationale |
|---|---|---|---|---|
| `cartItems` | `CartItem[]` | Global State | Zustand (`useCartStore`) | Lấy danh sách sản phẩm hiện tại để hiển thị Mini Cart & gửi API order |
| `user` | `User \| null` | Global State | Zustand (`useAuthStore`) | Tự động điền (Auto-fill) Họ tên, Email, SĐT nếu người dùng đã Đăng nhập |
| `shippingAddress` | `ShippingAddressForm` | Local Form State | React Hook Form + Zod | Quản lý thông tin giao hàng (Họ tên, SĐT, Email, Tỉnh/Thành, Huyện, Xã, Địa chỉ) |
| `shippingMethod` | `'STANDARD' \| 'EXPRESS'` | Local State | React Hook Form / `useState` | Lựa chọn phương thức vận chuyển và cập nhật Phí vận chuyển tương ứng |
| `orderNote` | `string` | Local Form State | React Hook Form | Ghi chú từ khách hàng gửi cho bên giao hàng |
| `termsAgreed` | `boolean` | Local Form State | React Hook Form | Bắt buộc tick đồng ý điều khoản mới cho phép submit nút Thanh toán |
| `paymentMethod` | `'COD' \| 'QR_CODE'` | Local Form State | React Hook Form | Chọn 1 trong 2 phương thức thanh toán |
| `voucherCode` | `string` | Local State | `useState` + `useDebounce` | Mã giảm giá đang gõ, bọc Debounce 400ms trước khi kiểm tra |
| `appliedVoucher` | `VoucherDiscount \| null` | Local State | `useState` | Kết quả mã giảm giá hợp lệ áp dụng cho đơn hàng |
| `isSubmittingOrder` | `boolean` | Local UI State | `useState` | Trạng thái Loading spinner trên nút Thanh toán (chống double click) |
| `activeModal` | `'NONE' \| 'COD_CONFIRM' \| 'QR_PAYMENT'` | Local UI State | `useState` | Điều khiển hiển thị Modal popup tương ứng theo Phương thức đã chọn |
| `qrPaymentDetails` | `QRPaymentInfo \| null` | Local State | `useState` | Lưu URL QR Code, Nội dung CK, Số tiền, Thời gian đếm ngược sau khi backend tạo order |
| `paymentStatus` | `'PENDING' \| 'PAID' \| 'EXPIRED'` | Local State / Polling | TanStack Query / `useQuery` | Lắng nghe trạng thái thanh toán realtime cho đơn QR Code |

---

### 2.2 Sơ đồ luồng Thanh toán (Checkout Flow)

#### A. Luồng Tự động điền dữ liệu (Auto-fill User Info)
```
User mở trang `/checkout`
    ↓ Server / Client Component mount
    ↓ Kiểm tra Zustand `useAuthStore.user`
    ├── [Đã Đăng Nhập] ➔ Tự động pre-fill `fullName`, `email`, `phone` vào Form
    └── [Chưa Đăng Nhập / Guest] ➔ Giữ Form trống, cho phép nhập thông tin giao hàng trực tiếp
```

#### B. Luồng Thanh toán COD (Cash On Delivery)
```
User chọn phương thức [COD] ➔ Click "Xác nhận & Thanh toán"
    ↓ Validate toàn bộ Form với Zod Schema (Họ tên, SĐT hợp lệ, Địa chỉ, Tick điều khoản)
    ↓ Đúng validation ➔ Kích hoạt `isSubmittingOrder = true`
    ↓ Gọi API POST /api/v1/orders (Payload: cartItems, shippingAddress, paymentMethod: 'COD', voucherCode)
    ↓
    ├── [Thành công 201]
    │   ├── API trả về `orderId`, `orderCode`, `totalAmount`
    │   ├── Mở `CODConfirmationModal`: Hiển thị "Thanh toán trực tiếp cho shipper khi nhận hàng"
    │   ├── Clear giỏ hàng trong Zustand (`useCartStore.clearCart()`)
    │   └── Click "Hoàn tất" / Tự động redirect về `/checkout/success?orderCode=...`
    └── [Thất bại 400/422/500]
        ├── Bắt lỗi từ Backend (VD: "Sản phẩm A đã hết hàng" hoặc "Giá sản phẩm đã thay đổi")
        └── Toast notification báo lỗi & hủy trạng thái Submitting
```

#### C. Luồng Thanh toán QR Code (VietQR Auto Confirmation)
```
User chọn phương thức [QR Code] ➔ Click "Xác nhận & Thanh toán"
    ↓ Validate Form ➔ Gọi API POST /api/v1/orders (paymentMethod: 'QR_CODE')
    ↓ Backend khởi tạo Order trạng thái PENDING, sinh VietQR Image URL & Mã giao dịch ngẫu nhiên
    ↓ Frontend nhận `qrPaymentDetails` ➔ Mở `QRPaymentModal`
    ↓
    ├── Hiển thị Ảnh Mã QR Code VietQR, Số tiền, Nội dung chuyển khoản & Đồng hồ đếm ngược 15 phút
    ├── Kích hoạt Polling / SSE (`GET /api/v1/orders/:id/status`) mỗi 3 giây
    │
    ├── [Kịch bản 1: User quét mã & Chuyển khoản thành công]
    │   ├── Webhook Ngân hàng gửi tới NestJS Backend ➔ Backend đổi trạng thái Order ➔ PAID
    │   ├── Polling Endpoint nhận `status: 'PAID'`
    │   ├── Modal đổi giao diện: Checkmark Xanh "Thanh toán thành công!" + Âm thanh/Toast
    │   ├── Clear giỏ hàng trong Zustand
    │   └── Sau 2 giây tự động redirect sang `/checkout/success?orderCode=...`
    │
    ├── [Kịch bản 2: Hết thời gian đếm ngược (15 phút)]
    │   ├── Client đếm về 00:00 hoặc Polling nhận `status: 'EXPIRED'`
    │   └── Modal hiển thị thông báo "Mã QR đã hết hạn" + Nút "Tạo lại mã" hoặc "Đổi sang COD"
    │
    └── [Kịch bản 3: User bấm Nút "Tải mã QR"]
        └── Tự động tải file ảnh VietQR `.png` về máy khách hàng
```

---

## 3. CẤU TRÚC DỮ LIỆU & INTERFACES (DATA CONTRACTS)

```typescript
// types/checkout.ts

/** 1. Phương thức vận chuyển */
export type ShippingMethodType = 'STANDARD' | 'EXPRESS';

/** 2. Phương thức thanh toán */
export type PaymentMethodType = 'COD' | 'QR_CODE';

/** 3. Cấu trúc Form dữ liệu Giao Hàng & Thanh Toán */
export interface CheckoutFormInput {
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
  shippingMethod: ShippingMethodType;
  orderNote?: string;
  paymentMethod: PaymentMethodType;
  termsAgreed: boolean;
  voucherCode?: string;
}

/** 4. Payload gửi lên NestJS API để khởi tạo Đơn hàng */
export interface CreateOrderPayload {
  items: {
    productId: string;
    quantity: number;
  }[];
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    province: string;
    district: string;
    ward: string;
    detail: string;
  };
  shippingMethod: ShippingMethodType;
  paymentMethod: PaymentMethodType;
  orderNote?: string;
  voucherCode?: string;
}

/** 5. Trả về từ API khi Áp dụng Voucher */
export interface ApplyVoucherResponse {
  success: boolean;
  voucherCode: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  maxDiscountAmount?: number;
  calculatedDiscount: number;
  message?: string;
}

/** 6. Trả về từ API Tạo Đơn hàng (POST /api/v1/orders) */
export interface CreateOrderResponse {
  orderId: string;
  orderCode: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  paymentMethod: PaymentMethodType;
  status: 'PENDING' | 'PAID';
  qrInfo?: {
    qrCodeUrl: string;       // URL ảnh VietQR
    bankName: string;         // Tên ngân hàng (VD: MBBank, VietinBank)
    accountNo: string;        // Số tài khoản
    accountName: string;      // Tên chủ tài khoản
    amount: number;           // Số tiền cần CK
    transferContent: string;  // Nội dung CK bắt buộc (VD: TECHBITE10243)
    expiresAt: string;        // ISO String hết hạn (15 phút)
  };
}

/** 7. Trả về từ API Polling Trạng thái Thanh toán QR */
export interface OrderPaymentStatusResponse {
  orderId: string;
  orderCode: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';
  paidAt?: string;
}

// ----------------------------------------------------
// PROPS INTERFACES CHO DUMB COMPONENTS
// ----------------------------------------------------

export interface ShippingAddressFormProps {
  register: any; // Type từ React Hook Form
  errors: any;
  onProvinceChange: (code: string) => void;
  onDistrictChange: (code: string) => void;
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
  items: Array<{
    id: string;
    productId: string;
    name: string;
    image: string;
    price: number;
    originalPrice?: number;
    quantity: number;
  }>;
}

export interface CheckoutPriceBreakdownProps {
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
}

export interface CODConfirmationModalProps {
  isOpen: boolean;
  orderCode: string;
  totalAmount: number;
  onConfirm: () => void;
}

export interface QRPaymentModalProps {
  isOpen: boolean;
  qrInfo: NonNullable<CreateOrderResponse['qrInfo']>;
  onClose: () => void;
  onPaymentSuccess: () => void;
}
```

---

## 4. INTEGRATION & API CONTRACTS (CLIENT & SERVER INTEGRATION)

### 4.1 Danh sách Endpoints Backend (`apps/backend`)

| Task | HTTP Method | Endpoint | Auth Required | Mô Tả & Nhiệm Vụ |
|---|---|---|---|---|
| Áp dụng Voucher | `POST` | `/api/v1/vouchers/apply` | Optional | Kiểm tra mã voucher, tính toán số tiền giảm theo giá trị giỏ hàng |
| Khởi tạo Đơn hàng | `POST` | `/api/v1/orders` | Optional (Guest/User) | Tính giá cứng tại Backend, trừ stock tạm, sinh Order & VietQR |
| Polling Trạng thái QR | `GET` | `/api/v1/orders/:id/status` | Optional | Client gọi 3s/lần để phát hiện thanh toán chuyển khoản thành công |
| Thông tin User | `GET` | `/api/v1/auth/me` | Bearer Token | Tự động lấy profile để auto-fill vào Form thanh toán |

### 4.2 Xử lý Lỗi & Edge Cases (Enterprise Resilience)

1. **Thay đổi giá tiền hoặc Hết hàng đột ngột (Race Condition):**
   - Khi bấm "Xác nhận & Thanh toán", NestJS Backend sẽ re-validate `stock` và `price` trong DB.
   - Nếu có sản phẩm hết hàng hoặc thay đổi giá: Trả về lỗi HTTP `400 Bad Request` kèm chi tiết `outOfStockItems` hoặc `priceChangedItems`.
   - Frontend bắt lỗi: Toast cảnh báo màu đỏ, cập nhật lại giỏ hàng và không tạo đơn.

2. **Quy chuẩn Debounce khi nhập Mã Giảm Giá:**
   - Dùng custom hook `useDebounce` với độ trễ **400ms**.
   - Tránh việc gọi API liên tục mỗi khi người dùng gõ từng ký tự vào ô Voucher.

3. **Bảo mật giá tiền:**
   - Frontend **TUYỆT ĐỐI KHÔNG** tính tổng tiền rồi gửi số tiền đó lên Server.
   - Frontend chỉ gửi `productId` và `quantity`. Mọi phép tính `totalAmount` BẮT BUỘC thực hiện ở NestJS Backend để chống Tampering.

---

## 5. QUY CHUẨN UI/UX & STYLING (STYLEGUIDE COMPLIANCE)

Tuân thủ nghiêm ngặt file quy chuẩn thiết kế giao diện `.docs/STYLEGUIDE.md`:

- **Nền Trang (Background):** `bg-gray-50` để tạo tương phản sạch sẽ, nổi bật các khối Card thông tin màu trắng.
- **Khối Thẻ (Cards):** Bo góc mềm mại `rounded-2xl`, shadow nhẹ `shadow-sm`, padding `p-6` rộng rãi thoáng đãng (Whitespace).
- **Màu Sắc Hành Động (CTA Color):** Nút "Xác nhận & Thanh toán" BẮT BUỘC dùng màu Cam thương hiệu **`bg-orange-600 hover:bg-orange-700 text-white font-extrabold`** (Chỉ màu cam mới chốt sale).
- **Màu Giá Tiền & Giảm Giá:**
  - Tổng tiền thanh toán: `text-red-600 font-bold text-2xl`.
  - Giá gốc chưa giảm: `text-slate-400 line-through text-sm`.
  - Badge giảm giá voucher: `bg-[#A63D40] text-white text-xs font-semibold rounded-md px-2 py-0.5`.
- **Layout Đáp Ứng (Responsive):**
  - **Desktop (`lg:`):** Grid 2 cột (`grid-cols-12`), cột trái Thông tin giao hàng chiếm 7 cột (`col-span-7`), cột phải Tóm tắt đơn hàng chiếm 5 cột (`col-span-5`).
  - **Mobile / Tablet:** 1 cột cuộn dọc, khối Tóm tắt đơn hàng hiển thị gọn gàng, Nút submit thanh toán ghim cố định ở đáy màn hình (Sticky Bottom Bar) nếu cuộn trang dài.

---

## 6. KỶ LUẬT LẬP TRÌNH (ENTERPRISE CODING STANDARDS)

1. **TypeScript Strictness:** CẤM tuyệt đối dùng `any`. Mọi DTO, Component Props và API Payload đều phải định nghĩa `interface` / `type` tường minh.
2. **Next.js Component Rules:** `app/checkout/page.tsx` và `app/checkout/success/page.tsx` BẮT BUỘC là Async Server Components. Tách biệt hoàn toàn phần tương tác Form & Modals sang Client Components (`"use client"`).
3. **Kỷ luật Debounce:** Input mã giảm giá BẮT BUỘC bọc qua `useDebounce` (trễ 400ms). CẤM viết lại bằng `setTimeout` rườm rà.
4. **Clean Code & Naming Conventions:** Component dùng `PascalCase` (VD: `CheckoutLayoutGrid`), file name dùng `kebab-case` (VD: `checkout-layout-grid.tsx`).
