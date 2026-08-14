# QUY HOẠCH KỸ THUẬT FRONTEND: TRANG QUẢN LÝ KHÁCH HÀNG (CUSTOMER MANAGEMENT)

> **Nguồn:** `.docs/ideas/dashboard/04-customer-idea.md`  
> **Mockup tham chiếu:** `.docs/ui-mockups/dash-products/index.html`  
> **Ứng dụng mục tiêu:** Admin Dashboard (`apps/dash` / `app/dash/my-app`)  
> **Phiên bản:** 1.0.0  
> **Ngày tạo:** 2026-08-14  

---

## 1. TỔNG QUAN YÊU CẦU VÀ MỤC TIÊU (OVERVIEW)

Module Quản lý Khách hàng cung cấp giao diện dành cho Admin và Staff quản lý tập trung toàn bộ dữ liệu khách hàng trong hệ thống E-commerce TechBite, đáp ứng các tiêu chuẩn:
- **Phân loại khách hàng chuẩn xác:** Hiển thị rõ ràng 2 nhóm đối tượng: Khách hàng đăng ký tài khoản (`REGISTERED` với role `CUSTOMER`) và Khách hàng vãng lai (`GUEST` đặt hàng không qua đăng ký).
- **Tốc độ xử lý siêu nhanh:** Tối ưu hiệu năng render, áp dụng `useDebounce` (400ms) cho tìm kiếm, phân trang mượt mà không gây giật lag.
- **Thao tác nghiệp vụ linh hoạt:** Tìm kiếm theo Tên, Email, SĐT; Lọc theo loại và trạng thái; Xem danh sách địa chỉ giao hàng; Xem lịch sử mua hàng có phân trang; Tạo mới khách hàng thủ công và Cập nhật trạng thái (Active / Blocked / Inactive).

---

## 2. PHÂN RÃ COMPONENT (COMPONENT TREE)

### 2.1 Trang Danh sách Khách hàng (`/customers`)
```
CustomerListPage [SERVER]                          -> app/(dashboard)/customers/page.tsx
|
+-- CustomerListPageClient [CLIENT]                -> features/customers/components/customer-list-page-client.tsx
    |
    +-- CustomerListPageHeader [DUMB]              -> features/customers/components/customer-list-page-header.tsx
    |   +-- Title ("Quản lý khách hàng" / "Customer Management")
    |   +-- StatsSummaryBadges (Tổng số khách, Khách đăng ký, Khách vãng lai)
    |   +-- CreateCustomerButton [CLIENT]          -> features/customers/components/create-customer-button.tsx
    |
    +-- CustomerFilterBar [CLIENT]                 -> features/customers/components/customer-filter-bar.tsx
    |   +-- SearchInput [CLIENT] (useDebounce 400ms)-> components/ui/search-input.tsx
    |   +-- CustomerTypeFilter [CLIENT]            -> features/customers/components/customer-type-filter.tsx
    |   +-- CustomerStatusFilter [CLIENT]          -> features/customers/components/customer-status-filter.tsx
    |   +-- CustomerSortDropdown [CLIENT]          -> features/customers/components/customer-sort-dropdown.tsx
    |
    +-- CustomerTable [DUMB]                       -> features/customers/components/customer-table.tsx
    |   +-- CustomerTableHeader [DUMB]             -> features/customers/components/customer-table-header.tsx
    |   +-- CustomerTableRow [DUMB]                -> features/customers/components/customer-table-row.tsx
    |       +-- CustomerIdentityCell (Avatar, Full Name, CustomerTypeBadge)
    |       +-- ContactInfoCell (Email, Phone)
    |       +-- CustomerStatusBadge [DUMB]         -> features/customers/components/customer-status-badge.tsx
    |       +-- CustomerTypeBadge [DUMB]           -> features/customers/components/customer-type-badge.tsx
    |       +-- FinancialStatsCell (Số đơn hàng + Tổng chi tiêu font-extrabold text-[#4880FF])
    |       +-- CreatedAtCell (Ngày khởi tạo / Ngày mua đầu)
    |       +-- QuickStatusDropdown [CLIENT]       -> features/customers/components/quick-status-dropdown.tsx
    |       +-- ViewDetailButton (Link icon Eye -> /customers/[id])
    |       +-- EditCustomerButton [CLIENT]
    |
    +-- CustomerPagination [DUMB]                  -> features/customers/components/customer-pagination.tsx
    |
    +-- CreateCustomerModal [CLIENT]               -> features/customers/components/create-customer-modal.tsx
    +-- UpdateCustomerStatusModal [CLIENT]         -> features/customers/components/update-customer-status-modal.tsx
```

### 2.2 Trang Chi tiết Khách hàng (`/customers/[id]`)
```
CustomerDetailPage [SERVER]                        -> app/(dashboard)/customers/[id]/page.tsx
|
+-- CustomerDetailContainer [CLIENT]               -> features/customers/components/customer-detail-container.tsx
    |
    +-- CustomerDetailHeader [DUMB]                -> features/customers/components/customer-detail-header.tsx
    |   +-- BackToListLink (Link icon ArrowLeft -> /customers)
    |   +-- CustomerTitleBlock (Họ tên + Mã KH + Badges)
    |   +-- EditCustomerButton [CLIENT]            -> features/customers/components/edit-customer-button.tsx
    |   +-- ToggleStatusButton [CLIENT]            -> features/customers/components/toggle-status-button.tsx
    |
    +-- CustomerDetailGrid [CLIENT]                -> features/customers/components/customer-detail-grid.tsx
        |
        +-- CustomerProfileCard [DUMB]              -> features/customers/components/cards/customer-profile-card.tsx
        |   +-- AvatarLarge & Basic Info (FullName, Email, Phone, Role, Type)
        |   +-- AccountStatusBadge
        |   +-- RegistrationDate & LastActiveTimestamp
        |
        +-- CustomerFinancialMetricsCard [DUMB]    -> features/customers/components/cards/customer-financial-metrics-card.tsx
        |   +-- TotalSpentMetric (Font-extrabold text-2xl text-[#4880FF])
        |   +-- TotalOrdersMetric
        |   +-- AverageOrderValueMetric (AOV)
        |   +-- LastOrderTimestamp
        |
        +-- CustomerAddressesCard [CLIENT]         -> features/customers/components/cards/customer-addresses-card.tsx
        |   +-- AddressItemCard (RecipientName, Phone, FullAddress, DefaultBadge)
        |   +-- AddAddressButton [CLIENT]          -> features/customers/components/modals/add-address-modal.tsx
        |
        +-- CustomerOrderHistoryCard [CLIENT]      -> features/customers/components/cards/customer-order-history-card.tsx
            +-- OrderHistoryFilterBar (Search orderCode, Status filter)
            +-- OrderHistoryTable (OrderCode, Date, ItemsCount, TotalAmount, PaymentStatus, OrderStatus, Link -> /orders/[id])
            +-- OrderHistoryPagination (Mini Pagination 5/10 bản ghi per page)
```

---

## 3. QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)

### 3.1 Màn hình Danh sách Khách hàng (`/customers`)

| State | Kiểu dữ liệu | Chiến lược | Lý do |
|---|---|---|---|
| `searchQuery` | `string` | `useState` + `useDebounce(400ms)` | Tìm kiếm khách hàng theo Họ tên, Email hoặc SĐT |
| `selectedType` | `CustomerType \| 'ALL'` | `useState` | Lọc theo loại khách hàng (`REGISTERED` vs `GUEST`) |
| `selectedStatus` | `CustomerStatus \| 'ALL'` | `useState` | Lọc theo trạng thái tài khoản (`ACTIVE`, `BLOCKED`, `INACTIVE`) |
| `sortBy` | `CustomerSortOption` | `useState` | Sắp xếp danh sách (`createdAt_desc`, `totalSpent_desc`, `totalOrders_desc`, `name_asc`) |
| `currentPage` | `number` | `useState` | Trang hiện tại |
| `pageSize` | `number` | `useState` (10 hoặc 20) | Số bản ghi trên 1 trang |
| `isCreateModalOpen` | `boolean` | `useState` | Đóng/mở Modal Tạo khách hàng thủ công |
| `selectedCustomerForStatus` | `CustomerListItem \| null` | `useState` | Quản lý Modal Cập nhật trạng thái khách hàng |

### 3.2 Màn hình Chi tiết Khách hàng (`/customers/[id]`)

| State | Kiểu dữ liệu | Chiến lược | Lý do |
|---|---|---|---|
| `orderSearch` | `string` | `useState` + `useDebounce(300ms)` | Tìm kiếm nhanh đơn hàng trong lịch sử mua của khách |
| `orderStatusFilter` | `OrderStatus \| 'ALL'` | `useState` | Lọc lịch sử đơn hàng của khách |
| `orderPage` | `number` | `useState` | Phân trang cho lịch sử đơn hàng |
| `orderPageSize` | `number` | `useState` (5 hoặc 10) | Kích thước trang lịch sử đơn |
| `isEditModalOpen` | `boolean` | `useState` | Đóng/mở Modal Chỉnh sửa thông tin khách hàng |
| `isAddAddressModalOpen` | `boolean` | `useState` | Đóng/mở Modal Thêm địa chỉ mới cho khách |

---

## 4. ĐỊNH NGHĨA DỮ LIỆU & TYPE SYSTEM (`customer.types.ts`)

```typescript
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
```

---

## 5. THIẾT KẾ UI & PHONG CÁCH STYLING (DESIGN SPECS & STYLES)

- **Layout Grid & Rounded Corners:**
  - Khối thẻ container dùng `bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6`.
  - Giữ khoảng trống không gian trắng (whitespace) chuẩn mực, tạo cảm giác thoáng đãng và sang trọng.
- **Brand Colors:**
  - Primary Accent Button & Metric text: `#4880FF` (`bg-[#4880FF] hover:bg-[#3b6edc] text-white`).
  - Text giá trị nổi bật / Tổng chi tiêu: `font-extrabold text-[#4880FF]`.
- **Badge Styling:**
  - **Khách đăng ký (`REGISTERED`):** `bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800`.
  - **Khách vãng lai (`GUEST`):** `bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800`.
  - **Hoạt động (`ACTIVE`):** `bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800`.
  - **Tạm khóa (`BLOCKED`):** `bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800`.
  - **Ngưng hoạt động (`INACTIVE`):** `bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700`.

---

## 6. LỘ TRÌNH XÂY DỰNG VÀ TÍCH HỢP (IMPLEMENTATION STEPS)

1. **Khởi tạo Domain Types & Mock Data:**
   - Tạo file `features/customers/types/customer.types.ts`.
   - Tạo file `features/customers/data/mock-customers.ts` hỗ trợ phát triển UI độc lập trước khi đấu nối API.

2. **Xây dựng Màn hình Danh sách Khách hàng (`/customers`):**
   - Xây dựng `CustomerListPageHeader` với nút mở `CreateCustomerModal`.
   - Xây dựng `CustomerFilterBar` với `SearchInput` debounced 400ms và bộ lọc loại/trạng thái.
   - Xây dựng `CustomerTable`, `CustomerTableRow`, `CustomerStatusBadge`, `CustomerTypeBadge`.
   - Xây dựng `CustomerPagination` hỗ trợ phân trang chuẩn.

3. **Xây dựng Modals Thao tác (`CreateCustomerModal` & `UpdateCustomerStatusModal`):**
   - Form tạo khách hàng thủ công có validate đầy đủ (Họ tên, Email, SĐT).
   - Modal cập nhật trạng thái có radio chọn trạng thái (`ACTIVE` / `BLOCKED` / `INACTIVE`) và ô nhập lý do (nếu khóa tài khoản).

4. **Xây dựng Màn hình Chi tiết Khách hàng (`/customers/[id]`):**
   - Xây dựng `CustomerProfileCard` & `CustomerFinancialMetricsCard`.
   - Xây dựng `CustomerAddressesCard` hiển thị danh sách địa chỉ nhận hàng kèm nhãn Địa chỉ mặc định.
   - Xây dựng `CustomerOrderHistoryCard` hiển thị bảng danh sách đơn hàng đã mua của khách hàng có phân trang nội bộ và link kết nối trực tiếp đến màn Chi tiết đơn hàng `/orders/[id]`.

5. **Đồng bộ Navigation & Sidebar:**
   - Đăng ký route `/customers` vào Admin Sidebar (`features/layout/components/admin-sidebar.tsx`) với icon `Users`.
   - Đảm bảo kiểm tra Type safety (`npx tsc --noEmit`) đạt 0 lỗi.
