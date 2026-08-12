# QUY HOẠCH KỸ THUẬT FRONTEND: TRANG QUẢN LÝ SẢN PHẨM (PRODUCT MANAGEMENT)

> **Nguồn:** `.docs/ideas/dashboard/02-product-idea.md`  
> **Mockup tham chiếu:** `.docs/ui-mockups/dash-products/index.html`  
> **Ứng dụng mục tiêu:** Admin Dashboard (`apps/dash` / `app/dash/my-app`)  
> **Phiên bản:** 1.0.0  
> **Ngày tạo:** 2026-08-12  

---

## 1. PHÂN RÃ COMPONENT (COMPONENT TREE)

### 1.1 Trang Danh sách Sản phẩm (`/products`)
```
ProductListPage [SERVER]                           -> app/(dashboard)/products/page.tsx
|
+-- ProductListPageClient [CLIENT]                 -> features/products/components/product-list-page-client.tsx
    |
    +-- ProductListPageHeader [DUMB]               -> features/products/components/product-list-page-header.tsx
    |   +-- Title ("Product Stock" / "Quản lý sản phẩm")
    |   +-- CreateProductButton [DUMB] (Link -> /products/create)
    |
    +-- ProductFilterBar [CLIENT]                  -> features/products/components/product-filter-bar.tsx
    |   +-- SearchInput [CLIENT] (useDebounce 300ms)-> components/ui/search-input.tsx
    |   +-- CategorySelectFilter [CLIENT]          -> features/products/components/category-select-filter.tsx
    |   +-- StatusSelectFilter [CLIENT]            -> features/products/components/status-select-filter.tsx
    |   +-- StockSelectFilter [CLIENT]             -> features/products/components/stock-select-filter.tsx
    |
    +-- ProductTable [DUMB]                        -> features/products/components/product-table.tsx
    |   +-- ProductTableHeader [DUMB]              -> features/products/components/product-table-header.tsx
    |   +-- ProductTableRow [DUMB]                 -> features/products/components/product-table-row.tsx
    |       +-- ProductThumbnail (next/image, aspect-square, rounded-2xl)
    |       +-- ProductNameSlug (Tên đậm + Slug xám bên dưới)
    |       +-- CategoryBadge (Interactive link/button -> trigger filter by category)
    |       +-- ProductPriceBlock (Giá gốc line-through + Giá khuyến mãi/Giá hiện tại font-extrabold text-[#4880FF])
    |       +-- StockBadge (Hiển thị số lượng tồn kho)
    |       +-- ProductStatusBadge [DUMB]          -> features/products/components/product-status-badge.tsx
    |       +-- EditLinkButton (Link icon Edit -> /products/[id]/edit)
    |       +-- DeleteButton (Icon Trash2 -> trigger DeleteConfirmModal)
    |
    +-- ProductPagination [DUMB]                   -> features/products/components/product-pagination.tsx
    |
    +-- DeleteConfirmModal [CLIENT]                -> features/products/components/delete-confirm-modal.tsx
```

### 1.2 Trang Tạo mới & Chỉnh sửa Sản phẩm (`/products/create` & `/products/[id]/edit`)
```
CreateProductPage [SERVER]                         -> app/(dashboard)/products/create/page.tsx
EditProductPage [SERVER]                           -> app/(dashboard)/products/[id]/edit/page.tsx
|
+-- ProductFormContainer [CLIENT]                  -> features/products/components/product-form-container.tsx
    |
    +-- ProductFormHeader [DUMB]                   -> features/products/components/product-form-header.tsx
    |   +-- BackToListLink (Link icon ArrowLeft -> /products)
    |   +-- FormTitle ("Thêm sản phẩm mới" / "Chỉnh sửa sản phẩm #ID")
    |
    +-- ProductFormLayout [CLIENT]                 -> features/products/components/product-form-layout.tsx
        |
        +-- ProductGeneralSection [CLIENT]         -> features/products/components/sections/product-general-section.tsx
        |   +-- NameInput (auto slug generation)
        |   +-- SlugInput (editable slug string)
        |   +-- CategorySelect (Dropdown chọn Chuyên mục)
        |
        +-- ProductPricingStockSection [CLIENT]    -> features/products/components/sections/product-pricing-stock-section.tsx
        |   +-- PriceInput (Giá gốc - number)
        |   +-- SalePriceInput (Giá khuyến mãi - number)
        |   +-- StockInput (Số lượng tồn kho - number)
        |
        +-- ProductMediaSection [CLIENT]           -> features/products/components/sections/product-media-section.tsx
        |   +-- ImageUploader (Upload/URL ảnh chính & gallery ảnh)
        |
        +-- ProductDescriptionSection [CLIENT]     -> features/products/components/sections/product-description-section.tsx
        |   +-- ShortDescriptionEditor [CLIENT]    -> features/products/components/rich-editor/json-rich-editor.tsx
        |   +-- LongDescriptionEditor [CLIENT]     -> features/products/components/rich-editor/json-rich-editor.tsx
        |
        +-- ProductSettingsSection [CLIENT]        -> features/products/components/sections/product-settings-section.tsx
        |   +-- StatusSwitch (ACTIVE / INACTIVE)
        |   +-- IsFeaturedToggle (Nổi bật: true/false)
        |
        +-- ProductFormActions [DUMB]              -> features/products/components/product-form-actions.tsx
            +-- CancelButton (Link -> /products)
            +-- SaveSubmitButton (Loading spinner, submit handler)
```

---

## 2. QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)

### 2.1 Màn hình Danh sách Sản phẩm (`/products`)

| State | Kiểu dữ liệu | Chiến lược | Lý do |
|---|---|---|---|
| `searchQuery` | `string` | `useState` + `useDebounce(300ms)` | Tìm kiếm sản phẩm theo tên hoặc slug không spam API |
| `selectedCategoryId` | `number \| null` | `useState` | Lọc sản phẩm theo chuyên mục (bao gồm click từ row bảng) |
| `statusFilter` | `'ALL' \| 'ACTIVE' \| 'INACTIVE'` | `useState` | Bộ lọc trạng thái kinh doanh |
| `stockFilter` | `'ALL' \| 'IN_STOCK' \| 'OUT_OF_STOCK'` | `useState` | Bộ lọc theo tình trạng tồn kho |
| `currentPage` | `number` | `useState` | Phân trang hiện tại |
| `pageSize` | `number` | `useState` (mặc định 10 hoặc 20) | Số lượng sản phẩm trên 1 trang |
| `deletingProductId` | `number \| null` | `useState` | ID sản phẩm đang chờ xác nhận xóa trong Modal |

### 2.2 Màn hình Form Sản phẩm (`/products/create` & `/products/[id]/edit`)

| State | Kiểu dữ liệu | Chiến lược | Lý do |
|---|---|---|---|
| `formData` | `ProductFormData` | `useForm` / `useState` local | Chứa toàn bộ dữ liệu form sản phẩm |
| `shortDescriptionJSON` | `Record<string, unknown> \| null` | `useState` | Dữ liệu mô tả ngắn dạng JSON từ Rich Editor |
| `longDescriptionJSON` | `Record<string, unknown> \| null` | `useState` | Dữ liệu mô tả chi tiết dạng JSON từ Rich Editor |
| `imageUrls` | `string[]` | `useState` | Danh sách URL ảnh đính kèm sản phẩm |
| `isSubmitting` | `boolean` | `useState` | Trạng thái gửi form / gọi API |
| `errors` | `Record<string, string>` | `useState` | Thông báo lỗi validation form realtime |

---

## 3. ĐỊNH NGHĨA INTERFACES & TYPES

```typescript
// features/products/types/product.types.ts

export type ProductStatus = 'ACTIVE' | 'INACTIVE';

export interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  stock: number;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  isFeatured: boolean;
  isActive: boolean;
  shortDescription: Record<string, unknown> | null; // JSON format
  longDescription: Record<string, unknown> | null;  // JSON format
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilterParams {
  search?: string;
  categoryId?: number;
  status?: ProductStatus | 'ALL';
  stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ALL';
  page: number;
  limit: number;
}

export interface ProductFormData {
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  stock: number;
  imageUrl: string;
  categoryId: number;
  isFeatured: boolean;
  isActive: boolean;
  shortDescription: Record<string, unknown> | null; // BẮT BUỘC DẠNG JSON
  longDescription: Record<string, unknown> | null;  // BẮT BUỘC DẠNG JSON
}
```

---

## 4. QUY CHUẨN DESIGN SYSTEM (FROM MOCKUP `dash-products/index.html`)

| Thành phần | Tailwind Classes | Ghi chú |
|---|---|---|
| Nền trang | `bg-[#F5F6FA]` hoặc `bg-gray-50` | Tạo độ tương phản tốt với Card trắng |
| Khối Card chứa Bảng | `bg-white rounded-3xl custom-shadow overflow-hidden border border-gray-50` | Bo góc 3xl mềm mại, shadow nhẹ |
| Tiêu đề trang | `text-3xl font-extrabold tracking-tight text-[#202224]` | Font Nunito Sans/Inter đậm nét |
| Ô Tìm kiếm Filter | `w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-[#4880FF]` | Bọc icon search vị trí `left-3` |
| Nút "Thêm sản phẩm" | `bg-[#4880FF] hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-200` | Nút hành động chính |
| Row Bảng Sản phẩm | `hover:bg-[#F9FAFB] transition-all duration-300 border-b border-gray-100` | Hover nhẹ nhàng mượt 300ms |
| Thumbnail Sản phẩm | `w-14 h-14 rounded-2xl bg-gray-50 p-1.5 border border-gray-100 overflow-hidden` | Khung ảnh 1:1 rounded 2xl |
| Giá bán (`price`) | `font-extrabold text-[#4880FF] text-lg` | Màu xanh nổi bật thương hiệu Admin |
| Giá cũ (`salePrice` cũ) | `text-gray-400 line-through text-xs font-semibold` | Đi kèm khi có giá khuyến mãi |
| Badge Chuyên mục | `px-3 py-1 bg-gray-100 text-gray-600 font-semibold text-xs rounded-lg hover:bg-blue-50 hover:text-[#4880FF] transition-colors cursor-pointer` | Click để kích hoạt lọc chuyên mục |
| Badge Tồn kho | `font-extrabold text-center` (`text-green-600` khi > 10, `text-amber-500` khi <= 10, `text-red-500` khi 0) | Cảnh báo tồn kho theo màu |
| Badge Trạng thái ACTIVE | `bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full` | Cho sản phẩm đang hoạt động |
| Badge Trạng thái INACTIVE | `bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full` | Cho sản phẩm tạm ẩn |
| Nút Sửa (Edit) | `p-2 text-gray-400 hover:text-[#4880FF] hover:bg-blue-50 rounded-xl transition-all` | Điều hướng `/products/[id]/edit` |
| Nút Xóa (Delete) | `p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all` | Mở Modal xác nhận xóa |

---

## 5. QUY TRÌNH NGHIỆP VỤ & ĐẶC TẢ CHI TIẾT MÀN HÌNH

### 5.1 Trang Danh sách Sản phẩm (`/products`)
- **Tải dữ liệu ban đầu:** Async Server Component fetch dữ liệu danh sách sản phẩm ban đầu từ NestJS Backend API `GET /api/v1/admin/products` kèm phân trang & bộ lọc.
- **Bộ lọc động (Filter Bar):**
  - **Ô nhập từ khóa:** Sử dụng hook `useDebounce` delay **300ms** khi người dùng gõ tên hoặc slug sản phẩm.
  - **Lọc Chuyên mục:** Dropdown chọn danh mục. Đặc biệt: Khi click trực tiếp vào tên chuyên mục tại cột "Category" ở bất kỳ hàng nào trong bảng, state `selectedCategoryId` tự động cập nhật để lọc danh sách sản phẩm theo chuyên mục đó.
  - **Lọc Trạng thái:** Tất cả / Đang bán (ACTIVE) / Tạm ẩn (INACTIVE).
  - **Lọc Tồn kho:** Tất cả / Còn hàng (> 0) / Hết hàng (= 0).
- **Hiển thị Bảng & Phân trang:**
  - Định dạng hiển thị giá tiền chuẩn VNĐ/USD.
  - Phân trang phân biệt rõ mốc số liệu (Ví dụ: `Showing 1-10 of 78 products`) kèm bộ nút chuyển trang `<` và `>`.

### 5.2 Trang Tạo mới & Chỉnh sửa Sản phẩm (`/products/create` & `/products/[id]/edit`)
- **Xử lý ở trang riêng biệt (Dedicated Page Layout):** Không dùng Modal popup rườm rà.
- **Form bao gồm các trường:**
  1. `name`: Tên sản phẩm (Bắt buộc).
  2. `slug`: Tự động tạo slug từ tên sản phẩm tiếng Việt có dấu (dùng hàm `slugify`), cho phép sửa tùy chỉnh.
  3. `categoryId`: Select dropdown chọn danh mục cha (Bắt buộc).
  4. `price`: Giá gốc sản phẩm (Bắt buộc, > 0).
  5. `salePrice`: Giá khuyến mãi (Tùy chọn, nếu có phải nhỏ hơn `price`).
  6. `stock`: Số lượng tồn kho (Bắt buộc, >= 0).
  7. `imageUrl`: Ảnh đại diện sản phẩm (Upload file hoặc chọn từ kho ảnh/URL).
  8. `isFeatured`: Switch toggle đánh dấu sản phẩm nổi bật trên trang chủ.
  9. `isActive`: Switch toggle kích hoạt hiển thị sản phẩm.
  10. `shortDescription`: Rich Text Editor (ProseMirror/TipTap JSON).
  11. `longDescription`: Rich Text Editor (ProseMirror/TipTap JSON).
- **RÀNG BUỘC KỶ LUẬT EDITOR (CRITICAL):**
  - Cả `shortDescription` và `longDescription` **BẮT BUỘC lưu dưới dạng JSON Object** trong Database (`@db.Text` chứa JSON stringified hoặc JSON type).
  - **TUYỆT ĐỐI KHÔNG** xuất ra định dạng HTML (để chống tấn công XSS) hoặc Markdown.

### 5.3 Quy trình Xóa sản phẩm (`DeleteConfirmModal`)
- Khi bấm icon Trash2 ở cột Action trên bảng sản phẩm:
  - Mở `DeleteConfirmModal` hiển thị thông tin sản phẩm cần xóa (Tên, Ảnh thumbnail, ID).
  - Hiển thị cảnh báo nếu sản phẩm đã từng có trong đơn hàng cũ (Nên chuyển trạng thái sang `INACTIVE` thay vì xóa vĩnh viễn DB).
  - Nút "Hủy bỏ" và Nút "Xác nhận xóa" (màu đỏ với spinner state khi đang gọi API DELETE).

---

## 6. CẤU TRÚC THƯ MỤC NGUỒN (DIRECTORY STRUCTURE)

```
apps/dash/ (hoặc app/dash/my-app/)
├── app/
│   └── (dashboard)/
│       └── products/
│           ├── page.tsx                             [NEW] Async Server Component
│           ├── create/
│           │   └── page.tsx                         [NEW] Async Server Component
│           └── [id]/
│               └── edit/
│                   └── page.tsx                     [NEW] Async Server Component
│
└── features/
    └── products/
        ├── types/
        │   └── product.types.ts                     [NEW] Interface DTOs & Props
        ├── data/
        │   └── mock-products.ts                     [NEW] Data mẫu kiểm thử UI
        ├── hooks/
        │   └── use-product-filter.ts                [NEW] Hook quản lý filter & debounce
        └── components/
            ├── product-list-page-client.tsx         [NEW] Smart Client Container List
            ├── product-list-page-header.tsx         [NEW] Header & Nút tạo mới
            ├── product-filter-bar.tsx               [NEW] Thanh bộ lọc tổng hợp
            ├── category-select-filter.tsx           [NEW] Dropdown chọn danh mục
            ├── status-select-filter.tsx             [NEW] Dropdown chọn trạng thái
            ├── stock-select-filter.tsx              [NEW] Dropdown chọn tồn kho
            ├── product-table.tsx                    [NEW] Bảng danh sách sản phẩm
            ├── product-table-header.tsx             [NEW] Header các cột
            ├── product-table-row.tsx                [NEW] Hàng hiển thị chi tiết sản phẩm
            ├── product-status-badge.tsx             [NEW] Badge trạng thái Active/Inactive
            ├── product-pagination.tsx               [NEW] Thanh phân trang
            ├── delete-confirm-modal.tsx             [NEW] Modal xác nhận xóa sản phẩm
            ├── product-form-container.tsx           [NEW] Smart Client Container Form (Add/Edit)
            ├── product-form-header.tsx              [NEW] Header form & nút quay lại
            ├── product-form-layout.tsx              [NEW] Layout lưới 2 cột cho Form
            ├── product-form-actions.tsx             [NEW] Nút Hủy & Lưu sản phẩm
            ├── rich-editor/
            │   └── json-rich-editor.tsx             [NEW] Editor xuất định dạng JSON
            └── sections/
                ├── product-general-section.tsx      [NEW] Nhóm thông tin chung (tên, slug, category)
                ├── product-pricing-stock-section.tsx [NEW] Nhóm giá cả & tồn kho
                ├── product-media-section.tsx        [NEW] Nhóm upload/quản lý hình ảnh
                ├── product-description-section.tsx  [NEW] Nhóm mô tả ngắn & chi tiết (Editor JSON)
                └── product-settings-section.tsx     [NEW] Nhóm cấu hình trạng thái & nổi bật
```

---

## 7. TIÊU CHUẨN KỸ THUẬT & QUY TẮC BẮT BUỘC (CODING STANDARDS)

1. **Phân tách Server & Client Component:**
   - Các `page.tsx` BẮT BUỘC là **Server Component**.
   - Chỉ dùng `'use client'` tại các file container/interactive components trong `features/products/components/`.
2. **Kỷ luật TypeScript:**
   - **TUYỆT ĐỐI CẤM** kiểu `any`. Mọi DTO, Props, API Responses và Editor Content phải được định nghĩa interface rõ ràng.
3. **Tối ưu Hiệu năng Search & Filter:**
   - Ô nhập tìm kiếm sản phẩm BẮT BUỘC sử dụng hook `useDebounce` với độ trễ **300ms** trước khi áp dụng bộ lọc.
4. **Chuẩn mã màu & STYLEGUIDE:**
   - Sử dụng đúng các utility class Tailwind của hệ thống (`bg-[#4880FF]`, `text-[#202224]`, `rounded-2xl`, `rounded-3xl`, `custom-shadow`).
