# FRONTEND PLAN: Trang Danh Sách Sản Phẩm (Product List Page)

## 1. PHÂN RÃ COMPONENT (COMPONENT TREE)

```text
apps/frontend/
└── components/
    ├── shared/ [Shared UI]
    │   ├── product-card.tsx            - [DUMB] [Shared UI] Thẻ hiển thị sản phẩm (Ảnh 1:1, Tên, Giá, Badge, CTA "Thêm vào giỏ")
    │   ├── badge.tsx                   - [DUMB] [Shared UI] Nhãn trạng thái (New, Out of Stock, Sale %)
    │   ├── pagination.tsx              - [DUMB] [Shared UI] Bộ phân trang (Trang trước/sau, Danh sách trang)
    │   ├── search-input.tsx            - [DUMB] [Shared UI] Ô nhập từ khóa tìm kiếm kèm debounce
    │   └── skeleton-card.tsx           - [DUMB] [Shared UI] Khung xương loading (Skeleton) cho Product Card
    └── product-list/
        ├── product-list-container.tsx  - [SMART] Page/Container chính: Đồng bộ URL Query, Fetch API, quản lý State ẩn/hiện bộ lọc
        ├── product-list-hero-banner.tsx - [DUMB] Banner nổi bật đầu trang (Ảnh Unsplash bo góc rounded-2xl, overlay thông điệp)
        ├── product-list-toolbar.tsx   - [DUMB] Thanh công cụ phía trên Grid: Nút Toggle Filter, đếm kết quả, Dropdown Sắp xếp (Sort)
        ├── product-filter-sidebar.tsx  - [DUMB] Cột bộ lọc bên trái (Danh mục, Khoảng giá, Trạng thái tồn kho, Nút xóa lọc)
        │   ├── filter-category-group.tsx - [DUMB] Khối lọc theo Danh mục sản phẩm (Checkbox / Radio list)
        │   ├── filter-price-range.tsx   - [DUMB] Khối lọc theo Khoảng giá (Min - Max Input / Range slider)
        │   └── filter-stock-status.tsx - [DUMB] Khối lọc theo Trạng thái còn hàng (Toggle switch / Checkbox)
        ├── product-grid.tsx            - [DUMB] Lưới sản phẩm 4 cột (Responsive: 2/3/4 cột), hiển thị Loading Skeleton / Empty State
        └── product-list-empty.tsx      - [DUMB] Giao diện hiển thị khi không tìm thấy sản phẩm khớp bộ lọc
```

### Chi tiết Phân loại Components:
- **`product-list-container.tsx` [SMART]:** Container chính quản lý việc đọc/ghi URL searchParams, gọi API danh sách sản phẩm (có phân trang & filter), quản lý State đóng/mở sidebar bộ lọc (`isFilterOpen`), và kết nối tới `useCartStore` để xử lý sự kiện "Thêm vào giỏ".
- **`product-list-hero-banner.tsx` [DUMB]:** Nhận props `bannerUrl`, `title`, `description` để in ra Banner trang nhã bo góc `rounded-2xl`.
- **`product-list-toolbar.tsx` [DUMB]:** Nhận props `totalProducts`, `sortOption`, `isFilterOpen`, `onToggleFilter`, `onSortChange` để render thanh điều khiển ngay trên lưới sản phẩm.
- **`product-filter-sidebar.tsx` [DUMB]:** Pure component nhận vào danh sách danh mục, các giá trị filter hiện tại và callbacks (`onCategoryChange`, `onPriceChange`, `onResetFilter`) để phát sự kiện lên Container.
- **`product-grid.tsx` [DUMB]:** Nhận props `products`, `isLoading`, `onAddToCart` để render danh sách thẻ sản phẩm dạng Grid (2 cột trên Mobile, 3 cột trên Tablet, 4 cột trên Desktop).
- **`product-list-empty.tsx` [DUMB]:** Nhận props `onResetFilter` để hiển thị màn hình trống kèm CTA gợi ý xóa bộ lọc.
- **Components [Shared UI]:** `product-card.tsx`, `badge.tsx`, `pagination.tsx`, `search-input.tsx`, `skeleton-card.tsx` được thiết kế dùng chung cho Trang chủ, Trang danh mục, và kết quả tìm kiếm toàn trang.

---

## 2. QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)

### Phân loại & Chiến lược Lưu trữ State:

| Tên State | Mô tả | Loại State | Chiến lược Lưu trữ | Rationale |
| `category` | Danh mục sản phẩm đang chọn | **URL Parameter** | URL Query (`?category=slug`) | Dễ dàng bookmark, chia sẻ URL danh mục cho người dùng khác |
| `q` | Từ khóa tìm kiếm sản phẩm | **URL Parameter** | URL Query (`?q=keyword`) | Lưu lại vết tìm kiếm trên thanh địa chỉ trình duyệt |
| `minPrice` / `maxPrice` | Khoảng giá cần lọc | **URL Parameter** | URL Query (`?minPrice=100&maxPrice=500`) | Hỗ trợ gởi link có sẵn bộ lọc giá |
| `inStock` | Chỉ hiển thị sản phẩm còn hàng | **URL Parameter** | URL Query (`?inStock=true`) | Đảm bảo tính nhất quán state khi reload trang |
| `sort` | Tiêu chí sắp xếp (`latest`, `price_asc`, `price_desc`, `featured`) | **URL Parameter** | URL Query (`?sort=price_asc`) | Đẩy lên URL để lưu lựa chọn ưu tiên của User |
| `page` / `limit` | Trang hiện tại & số lượng item trên 1 trang | **URL Parameter** | URL Query (`?page=1&limit=12`) | Chuẩn SEO và hỗ trợ quay lại (Browser Back/Forward) |
| `isFilterOpen` | Trạng thái ẩn/hiện Cột bộ lọc (Sidebar) | **Local State** | React `useState` / `localStorage` | Lưu trải nghiệm cá nhân của User (ẩn sidebar để mở rộng lưới 4 cột) |
| `isLoading` | Trạng thái đang tải dữ liệu từ API | **Local State** | React `useState` (hoặc React Query `isPending`) | Chỉ phục vụ hiệu ứng loading Skeleton cục bộ |
| `cartItems` | Danh sách sản phẩm trong giỏ hàng | **Global State** | Zustand (`useCartStore`) | Khi bấm nút "Thêm vào giỏ" ở Product Card, sync tức thì với Cart Drawer |

---

## 3. CẤU TRÚC DỮ LIỆU (DATA INTERFACES)

```typescript
// types/product-list.ts

/** Tiêu chí sắp xếp sản phẩm */
export type ProductSortOption = 'latest' | 'price_asc' | 'price_desc' | 'featured';

/** Cấu trúc tham số lọc sản phẩm từ URL Query */
export interface ProductFilterParams {
  category?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: ProductSortOption;
  page: number;
  limit: number;
}

/** Đơn vị thông tin Danh mục dùng cho bộ lọc */
export interface CategoryFilterItem {
  id: string;
  name: string;
  slug: string;
  count: number;
}

/** Thông tin Sản phẩm hiển thị trên Card */
export interface ProductItemData {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;              // Giá hiện tại (text-red-600 font-bold)
  originalPrice?: number;     // Giá gốc chưa giảm (text-slate-400 line-through)
  discountPercentage?: number;// % Giảm giá (dùng cho Badge bg-[#A63D40])
  rating?: number;            // Số sao trung bình (1-5)
  reviewCount?: number;       // Số lượng đánh giá
  stock: number;              // Tồn kho (stock === 0 -> Hiển thị Badge Out of Stock)
  isNew?: boolean;            // Nhãn sản phẩm mới
}

/** Metadata phân trang trả về từ Backend API */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

// ----------------------------------------------------
// PROPS INTERFACES CHO CÁC DUMB COMPONENTS
// ----------------------------------------------------

/** Props cho Component Banner đầu trang */
export interface ProductListHeroBannerProps {
  bannerUrl: string;
  title: string;
  subtitle?: string;
}

/** Props cho Thanh công cụ ProductListToolbar */
export interface ProductListToolbarProps {
  totalProducts: number;
  sortOption: ProductSortOption;
  isFilterOpen: boolean;
  onToggleFilter: () => void;
  onSortChange: (newSort: ProductSortOption) => void;
}

/** Props cho Cột bộ lọc ProductFilterSidebar */
export interface ProductFilterSidebarProps {
  categories: CategoryFilterItem[];
  selectedCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
  onSelectCategory: (categorySlug?: string) => void;
  onPriceChange: (min?: number, max?: number) => void;
  onStockToggle: (inStock: boolean) => void;
  onResetFilter: () => void;
}

/** Props cho Shared UI ProductCard */
export interface ProductCardProps {
  product: ProductItemData;
  onAddToCart: (productId: string) => void;
}

/** Props cho Lưới sản phẩm ProductGrid */
export interface ProductGridProps {
  products: ProductItemData[];
  isLoading: boolean;
  isFilterOpen: boolean;
  onAddToCart: (productId: string) => void;
  onResetFilter?: () => void;
}

/** Props cho Shared UI Pagination */
export interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (newPage: number) => void;
}
```
