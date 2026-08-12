# QUY HOẠCH KỸ THUẬT FRONTEND: TRANG QUẢN LÝ ĐƠN HÀNG (ORDER MANAGEMENT)

> **Nguồn:** `.docs/ideas/dashboard/03-order-idea.md`  
> **Mockup tham chiếu:** `.docs/ui-mockups/dash-products/index.html`  
> **Ứng dụng mục tiêu:** Admin Dashboard (`apps/dash` / `app/dash/my-app`)  
> **Phiên bản:** 1.0.0  
> **Ngày tạo:** 2026-08-12  

---

## 1. PHÂN RÃ COMPONENT (COMPONENT TREE)

### 1.1 Trang Danh sách Đơn hàng (`/orders`)
```
OrderListPage [SERVER]                             -> app/(dashboard)/orders/page.tsx
|
+-- OrderListPageClient [CLIENT]                   -> features/orders/components/order-list-page-client.tsx
    |
    +-- OrderListPageHeader [DUMB]                 -> features/orders/components/order-list-page-header.tsx
    |   +-- Title ("Order Management" / "Quản lý đơn hàng")
    |   +-- CreateManualOrderButton [DUMB] (Link -> /orders/create)
    |
    +-- OrderFilterBar [CLIENT]                    -> features/orders/components/order-filter-bar.tsx
    |   +-- SearchInput [CLIENT] (useDebounce 400ms)-> components/ui/search-input.tsx
    |   +-- OrderStatusTabs [CLIENT]               -> features/orders/components/order-status-tabs.tsx
    |   +-- PaymentStatusFilter [CLIENT]           -> features/orders/components/payment-status-filter.tsx
    |   +-- DateRangeFilter [CLIENT]               -> features/orders/components/date-range-filter.tsx
    |
    +-- OrderTable [DUMB]                          -> features/orders/components/order-table.tsx
    |   +-- OrderTableHeader [DUMB]                -> features/orders/components/order-table-header.tsx
    |   +-- OrderTableRow [DUMB]                   -> features/orders/components/order-table-row.tsx
    |       +-- OrderCodeBadge (Mã đơn hàng #ORD-XXXXX font-mono font-bold)
    |       +-- CustomerInfoCell (Tên + Email/SĐT khách hàng)
    |       +-- TotalAmountCell (Giá tiền font-extrabold text-[#4880FF])
    |       +-- CreatedAtCell (Thời gian khởi tạo DD/MM/YYYY HH:mm)
    |       +-- PaymentStatusBadge [DUMB]          -> features/orders/components/payment-status-badge.tsx
    |       +-- OrderStatusBadge [DUMB]            -> features/orders/components/order-status-badge.tsx
    |       +-- QuickStatusDropdown [CLIENT]       -> features/orders/components/quick-status-dropdown.tsx
    |       +-- ViewDetailButton (Link icon Eye -> /orders/[id])
    |
    +-- OrderPagination [DUMB]                     -> features/orders/components/order-pagination.tsx
    |
    +-- UpdateStatusModal [CLIENT]                 -> features/orders/components/update-status-modal.tsx
```

### 1.2 Trang Chi tiết Đơn hàng (`/orders/[id]`)
```
OrderDetailPage [SERVER]                           -> app/(dashboard)/orders/[id]/page.tsx
|
+-- OrderDetailContainer [CLIENT]                  -> features/orders/components/order-detail-container.tsx
    |
    +-- OrderDetailHeader [DUMB]                   -> features/orders/components/order-detail-header.tsx
    |   +-- BackToListLink (Link icon ArrowLeft -> /orders)
    |   +-- OrderTitleBlock (Mã đơn hàng + Ngày tạo)
    |   +-- PrintInvoiceButton [CLIENT]            -> features/orders/components/print-invoice-button.tsx
    |   +-- ChangeStatusButton [CLIENT]            -> features/orders/components/change-status-button.tsx
    |
    +-- OrderProgressStepper [DUMB]                -> features/orders/components/order-progress-stepper.tsx
    |   +-- StepItem (Tạo đơn -> Đã xác nhận -> Đang xử lý -> Đang giao -> Đã giao)
    |
    +-- OrderDetailGrid [CLIENT]                   -> features/orders/components/order-detail-grid.tsx
        |
        +-- PaymentInfoCard [DUMB]                 -> features/orders/components/cards/payment-info-card.tsx
        |   +-- PaymentMethodBadge (COD / VietQR)
        |   +-- PaymentStatusBadge
        |   +-- PaidAtTimestamp
        |
        +-- CustomerShippingCard [DUMB]            -> features/orders/components/cards/customer-shipping-card.tsx
        |   +-- RecipientNamePhone
        |   +-- FullAddressString
        |   +-- ShippingNote
        |
        +-- OrderItemsCard [DUMB]                  -> features/orders/components/cards/order-items-card.tsx
        |   +-- OrderItemTable (Thumbnail, Name, Quantity, Unit Price snapshot, Subtotal)
        |
        +-- OrderFinancialSummaryCard [DUMB]       -> features/orders/components/cards/order-financial-summary-card.tsx
            +-- SubtotalRow
            +-- ShippingFeeRow
            +-- DiscountRow (Voucher code & reduced amount)
            +-- TotalAmountRow (Highlight text-xl font-extrabold text-[#4880FF])
```

---

## 2. QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)

### 2.1 Màn hình Danh sách Đơn hàng (`/orders`)

| State | Kiểu dữ liệu | Chiến lược | Lý do |
|---|---|---|---|
| `searchQuery` | `string` | `useState` + `useDebounce(400ms)` | Tìm kiếm đơn hàng theo code, tên khách hàng, email hoặc SĐT |
| `selectedOrderStatus` | `OrderStatus \| 'ALL'` | `useState` | Lọc danh sách theo trạng thái đơn hàng |
| `selectedPaymentStatus`| `PaymentStatus \| 'ALL'` | `useState` | Lọc danh sách theo trạng thái thanh toán |
| `startDate` | `string \| null` | `useState` | Lọc đơn hàng từ ngày chỉ định |
| `endDate` | `string \| null` | `useState` | Lọc đơn hàng đến ngày chỉ định |
| `currentPage` | `number` | `useState` | Trang hiện tại |
| `pageSize` | `number` | `useState` (10 hoặc 20) | Số đơn hàng trên 1 trang |
| `updatingOrder` | `{ id: string; status: OrderStatus } \| null` | `useState` | Quản lý Modal đổi trạng thái nhanh |

### 2.2 Màn hình Chi tiết Đơn hàng (`/orders/[id]`)

| State | Kiểu dữ liệu | Chiến lược | Lý do |
|---|---|---|---|
| `orderDetail` | `OrderDetail` | Server Fetch (SSR) + Client Hydration | Thông tin chi tiết đơn hàng |
| `isUpdatingStatus` | `boolean` | `useState` | Loading state khi gọi API cập nhật trạng thái |
| `isPrinting` | `boolean` | `useState` | Trigger in hóa đơn giao diện |

---

## 3. ĐỊNH NGHĨA INTERFACES & TYPES

```typescript
// features/orders/types/order.types.ts

export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PROCESSING' 
  | 'SHIPPING' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'REFUNDED';

export type PaymentStatus = 
  | 'UNPAID' 
  | 'PAID' 
  | 'REFUNDED';

export type PaymentMethod = 
  | 'COD' 
  | 'VIETQR' 
  | 'BANK_TRANSFER';

export interface OrderItem {
  id: string;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number; // Đơn giá snapshot tại thời điểm mua
  subtotal: number;
}

export interface CustomerInfo {
  id?: string;
  name: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  recipientName: string;
  phone: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  detailAddress: string;
  note?: string;
}

export interface OrderSummary {
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
}

export interface OrderListItem {
  id: string;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  itemCount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface OrderDetail extends OrderListItem {
  customer: CustomerInfo;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  summary: OrderSummary;
  paidAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export interface OrderFilterParams {
  search?: string;
  orderStatus?: OrderStatus | 'ALL';
  paymentStatus?: PaymentStatus | 'ALL';
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}
```

---

## 4. QUY CHUẨN DESIGN SYSTEM (FROM MOCKUP `dash-products/index.html`)

| Thành phần | Tailwind Classes | Ghi chú |
|---|---|---|
| Nền trang | `bg-[#F5F6FA]` hoặc `bg-gray-50` | Tạo độ tương phản tốt với Card trắng |
| Khối Card chứa Bảng | `bg-white rounded-3xl custom-shadow overflow-hidden border border-gray-50` | Bo góc 3xl mềm mại, shadow nhẹ |
| Tiêu đề trang | `text-3xl font-extrabold tracking-tight text-[#202224]` | Font Nunito Sans/Inter đậm nét |
| Mã đơn hàng | `font-mono font-bold text-gray-900 hover:text-[#4880FF]` | Mã code nổi bật dạng monospace |
| Tổng tiền (`totalAmount`) | `font-extrabold text-[#4880FF] text-lg` | Màu xanh nổi bật thương hiệu Admin |
| Tab trạng thái đơn hàng | `px-4 py-2 text-sm font-semibold rounded-xl transition-all` (`bg-[#4880FF] text-white` khi Active) | Trượt lọc nhanh danh sách |
| Badge OrderStatus `PENDING` | `bg-amber-50 text-amber-600 border border-amber-200 font-bold text-xs px-2.5 py-1 rounded-full` | Chờ xác nhận |
| Badge OrderStatus `CONFIRMED` | `bg-blue-50 text-blue-600 border border-blue-200 font-bold text-xs px-2.5 py-1 rounded-full` | Đã xác nhận |
| Badge OrderStatus `PROCESSING` | `bg-purple-50 text-purple-600 border border-purple-200 font-bold text-xs px-2.5 py-1 rounded-full` | Đang xử lý món |
| Badge OrderStatus `SHIPPING` | `bg-sky-50 text-sky-600 border border-sky-200 font-bold text-xs px-2.5 py-1 rounded-full` | Đang giao hàng |
| Badge OrderStatus `DELIVERED` | `bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold text-xs px-2.5 py-1 rounded-full` | Hoàn thành |
| Badge OrderStatus `CANCELLED` | `bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs px-2.5 py-1 rounded-full` | Đã hủy |
| Badge PaymentStatus `UNPAID` | `bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full` | Chưa thanh toán |
| Badge PaymentStatus `PAID` | `bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full` | Đã thanh toán |
| Nút "Xem chi tiết" | `p-2 text-gray-400 hover:text-[#4880FF] hover:bg-blue-50 rounded-xl transition-all` | Link `/orders/[id]` |

---

## 5. QUY TRÌNH NGHIỆP VỤ & ĐẶC TẢ CHI TIẾT MÀN HÌNH

### 5.1 Trang Danh sách Đơn hàng (`/orders`)
- **Tải dữ liệu ban đầu:** Async Server Component fetch dữ liệu danh sách đơn hàng ban đầu từ NestJS Backend API `GET /api/v1/admin/orders` kèm phân trang & bộ lọc.
- **Bộ lọc động (Filter Bar):**
  - **Ô nhập từ khóa:** Sử dụng hook `useDebounce` trễ **400ms** khi gõ mã đơn hàng `#ORD-...`, tên khách hàng, email hoặc số điện thoại.
  - **Tabs Trạng thái đơn:** Thẻ lọc nhanh các trạng thái (`Tất cả`, `Chờ xác nhận`, `Đã xác nhận`, `Đang xử lý`, `Đang giao`, `Đã giao`, `Đã hủy`).
  - **Lọc Trạng thái thanh toán:** Tất cả / Chưa thanh toán (UNPAID) / Đã thanh toán (PAID).
- **Thao tác đổi trạng thái nhanh (Quick Status Update):**
  - Cho phép Admin/Staff chuyển trạng thái trực tiếp trên từng hàng của bảng thông qua dropdown menu hoặc click trigger `UpdateStatusModal`.
  - Có Toast thông báo kết quả cập nhật thành công/thất bại.

### 5.2 Trang Chi tiết Đơn hàng (`/orders/[id]`)
- **Hiển thị Stepper Tiến trình Đơn hàng:** Visual stepper bar thể hiện rõ 5 mốc tiến trình (`Tạo đơn` ➔ `Xác nhận` ➔ `Đang chuẩn bị` ➔ `Đang giao` ➔ `Đã giao`).
- **Giao diện Bento Layout các thông tin:**
  1. Thẻ Thanh toán: Phương thức (VietQR/COD), Nhãn thanh toán, Mốc thời gian `paidAt`.
  2. Thẻ Khách hàng & Giao hàng: Tên người nhận, SĐT, Địa chỉ đầy đủ, Ghi chú giao hàng.
  3. Bảng Sản phẩm: Danh sách món ăn/sản phẩm với thumbnail, đơn giá snapshot, số lượng và tổng tiền từng món.
  4. Bảng Tổng kết Tài chính: Tạm tính, Phí ship, Giảm giá voucher, Tổng tiền thanh toán cuối cùng.
- **Chức năng In hóa đơn (Print Invoice):**
  - Nút "In hóa đơn" trigger chế độ in browser (`window.print()`) với CSS print style tối ưu khổ giấy A4/Receipt.

---

## 6. CẤU TRÚC THƯ MỤC NGUỒN (DIRECTORY STRUCTURE)

```
apps/dash/ (hoặc app/dash/my-app/)
├── app/
│   └── (dashboard)/
│       └── orders/
│           ├── page.tsx                             [NEW] Async Server Component
│           └── [id]/
│               └── page.tsx                         [NEW] Async Server Component
│
└── features/
    └── orders/
        ├── types/
        │   └── order.types.ts                       [NEW] Interface DTOs & Props
        └── components/
            ├── order-list-page-client.tsx           [NEW] Client Container Danh sách
            ├── order-list-page-header.tsx           [NEW] Header Danh sách Đơn hàng
            ├── order-filter-bar.tsx                 [NEW] Thanh bộ lọc & Debounce search
            ├── order-status-tabs.tsx                [NEW] Tab trạng thái đơn hàng
            ├── payment-status-filter.tsx            [NEW] Dropdown lọc thanh toán
            ├── order-table.tsx                      [NEW] Bảng đơn hàng
            ├── order-table-header.tsx               [NEW] Header bảng đơn hàng
            ├── order-table-row.tsx                  [NEW] hàng dữ liệu đơn hàng
            ├── order-status-badge.tsx               [NEW] Badge trạng thái đơn hàng
            ├── payment-status-badge.tsx             [NEW] Badge trạng thái thanh toán
            ├── quick-status-dropdown.tsx            [NEW] Dropdown đổi trạng thái nhanh
            ├── update-status-modal.tsx              [NEW] Modal xác nhận đổi trạng thái
            ├── order-pagination.tsx                 [NEW] Phân trang đơn hàng
            ├── order-detail-container.tsx           [NEW] Container Chi tiết Đơn hàng
            ├── order-detail-header.tsx              [NEW] Header Chi tiết Đơn hàng
            ├── order-progress-stepper.tsx           [NEW] Stepper tiến trình giao hàng
            ├── order-detail-grid.tsx                [NEW] Grid Bento chi tiết
            ├── print-invoice-button.tsx             [NEW] Nút in hóa đơn
            └── cards/
                ├── payment-info-card.tsx            [NEW] Thẻ thông tin thanh toán
                ├── customer-shipping-card.tsx       [NEW] Thẻ người nhận & địa chỉ
                ├── order-items-card.tsx             [NEW] Bảng món ăn trong đơn
                └── order-financial-summary-card.tsx [NEW] Bảng tính tổng tiền
```
