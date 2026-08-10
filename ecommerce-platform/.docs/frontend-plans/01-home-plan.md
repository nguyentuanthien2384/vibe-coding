# KẾ HOẠCH KỸ THUẬT FRONTEND: TRANG CHỦ (Home Page)

> **Tính năng:** Home Page — "Phễu" đón khách đầu tiên của TechBite.
> **Stack:** Next.js (App Router) · React · Tailwind CSS · TypeScript · Zustand

---

## 1. PHÂN RÃ COMPONENT (COMPONENT TREE)

```
app/(store)/page.tsx                            [SMART] — Route Entry Point
│
├── HeroBanner                                  [DUMB]  — Shared UI ⭐
│   ├── HeroBadge                               [DUMB]
│   └── HeroCtaButton                           [DUMB]  — Shared UI ⭐
│
├── CategoryRail                                [SMART] — Fetch danh mục
│   └── CategoryChip (×n)                       [DUMB]  — Shared UI ⭐
│
├── FeaturedProductsSection                     [SMART] — Fetch sản phẩm nổi bật
│   ├── SectionHeader                           [DUMB]  — Shared UI ⭐
│   ├── ProductGrid                             [DUMB]  — Shared UI ⭐
│   │   └── ProductCard (×8)                    [DUMB]  — Shared UI ⭐
│   │       ├── ProductImageWrapper             [DUMB]
│   │       ├── DiscountBadge                   [DUMB]  — Shared UI ⭐
│   │       ├── StockBadge                      [DUMB]  — Shared UI ⭐
│   │       └── AddToCartButton                 [DUMB]  — Shared UI ⭐
│   └── ProductGridSkeleton                     [DUMB]  — Skeleton loading state
│
└── SocialProofBanner                           [DUMB]  — Shared UI ⭐
```

### Ghi chú Shared UI

| Component | Lý do tái sử dụng |
|---|---|
| `HeroBanner` | Dùng cho các trang Campaign / Landing phụ |
| `HeroCtaButton` | Nút CTA đồng nhất toàn dự án (màu cam `bg-orange-600`) |
| `CategoryChip` | Dùng trong trang Search, Filter Sidebar |
| `SectionHeader` | Dùng trong trang Product Listing, Cart |
| `ProductGrid` + `ProductCard` | Cốt lõi của toàn bộ hệ thống hiển thị sản phẩm |
| `DiscountBadge` / `StockBadge` | Tái dùng trong Product Detail, Search Result |
| `AddToCartButton` | Dùng trong Product Detail, Quick-view Modal |
| `SocialProofBanner` | Dùng trong Checkout Funnel để tăng trust |

---

## 2. QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)

### 2.1 Bảng chiến lược

| State | Kiểu dữ liệu | Chiến lược | Lý do |
|---|---|---|---|
| `isCategoriesLoading` | `boolean` | `useState` (local - `CategoryRail`) | Chỉ dùng trong 1 component |
| `isFeaturedLoading` | `boolean` | `useState` (local - `FeaturedProductsSection`) | Chỉ dùng trong 1 component |
| `categories` | `Category[]` | Server Component / React Query | Dữ liệu tĩnh, cache được |
| `featuredProducts` | `Product[]` | Server Component / React Query | Fetch 1 lần khi tải trang |
| `cartItems` | `CartItem[]` | **Zustand** (`useCartStore`) | Dùng toàn app, persist localStorage |
| `cartIsOpen` | `boolean` | **Zustand** (`useCartStore`) | Điều khiển Drawer từ bất kỳ component |
| `toastQueue` | `Toast[]` | **Zustand** (`useToastStore`) | Toast message dùng toàn app |
| `activeCategory` | `string \| null` | **URL Query Param** `?category=` | Cho phép share link filter, Back button hoạt động đúng |

### 2.2 Zustand Store Interface

```typescript
// store/cart.store.ts
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  openCart: () => void;
  closeCart: () => void;
}

// store/toast.store.ts
interface ToastState {
  queue: ToastMessage[];
  push: (message: ToastMessage) => void;
  dismiss: (id: string) => void;
}
```

### 2.3 URL Query Param

```
/                       → Tất cả sản phẩm nổi bật
/?category=nuoc-uong    → Lọc Featured Products theo danh mục
```

> **Lưu ý:** `FeaturedProductsSection` đọc `searchParams.category` qua Next.js App Router để filter phía server. Không dùng `useState` cho giá trị này.

---

## 3. CẤU TRÚC DỮ LIỆU (DATA INTERFACES)

### 3.1 Domain Entities

```typescript
// types/domain.ts

interface Category {
  id: string;
  name: string;           // VD: "Đồ Ăn Vặt"
  slug: string;           // VD: "do-an-vat"
  iconUrl: string;        // URL icon SVG/PNG
  parentId: string | null;
}

interface Product {
  id: string;
  name: string;           // VD: "Khô Gà Lá Chanh Xé Cay"
  slug: string;
  imageUrl: string;
  price: number;          // Giá gốc (đơn vị: VND)
  salePrice: number | null; // Giá khuyến mãi — null nếu không KM
  stock: number;          // 0 = hết hàng
  categoryId: string;
}

interface CartItem {
  productId: string;
  name: string;           // Snapshot tên lúc thêm
  imageUrl: string;       // Snapshot ảnh lúc thêm
  quantity: number;
  unitPrice: number;      // Snapshot giá lúc thêm — KHÔNG tính lại từ Product
}

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}
```

### 3.2 Component Props

```typescript
// components/home/hero-banner.tsx
interface HeroBannerProps {
  title: string;          // "Nạp Năng Lượng - Code Phê Hơn"
  subtitle: string;       // "Combo Thức Khuya giảm giá 20%..."
  imageUrl: string;
  ctaLabel: string;       // "Đặt ngay"
  ctaHref: string;        // "/products?tag=combo-deadline"
  badgeLabel?: string;    // "HOT DEAL 22h-2h" — tuỳ chọn
}

// components/shared/category-chip.tsx
interface CategoryChipProps {
  category: Category;
  isActive: boolean;
  onClick: (slug: string) => void;
}

// components/shared/product-card.tsx
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void; // Handler từ SMART parent
  priority?: boolean; // Next.js Image priority cho LCP
}

// components/shared/discount-badge.tsx
interface DiscountBadgeProps {
  originalPrice: number;
  salePrice: number;
}

// components/shared/stock-badge.tsx
type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

interface StockBadgeProps {
  stock: number;
}

// components/shared/add-to-cart-button.tsx
interface AddToCartButtonProps {
  productId: string;
  stock: number;          // Nếu 0, button bị disabled và hiển thị "Hết hàng"
  onAddToCart: (productId: string) => void;
  isLoading?: boolean;    // Optimistic UI state
}

// components/home/social-proof-banner.tsx
interface SocialProofBannerProps {
  statNumber: string;     // "500+"
  message: string;        // "anh em dev đã nạp năng lượng tại đây"
}

// components/shared/section-header.tsx
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;   // "Xem tất cả"
  actionHref?: string;    // "/products"
}

// components/shared/product-grid.tsx
interface ProductGridProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
  isLoading?: boolean;    // Render skeleton khi true
}
```

### 3.3 API Response Shape

```typescript
// types/api.ts

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

// GET /api/products?featured=true&limit=8&category={slug}
type FeaturedProductsResponse = PaginatedResponse<Product>;

// GET /api/categories?parentId=null
type CategoriesResponse = Category[];
```

---

## 4. LUỒNG XỬ LÝ CHÍNH (Data Flow)

```
[Server - page.tsx]
  │── fetch("/api/categories")   → truyền props xuống CategoryRail
  │── fetch("/api/products?featured=true&category=?")
  │                              → truyền props xuống FeaturedProductsSection
  │
[Client - ProductCard]
  │── onAddToCart(productId)
  │     ├── Gọi POST /api/cart  (chỉ gửi productId + quantity, KHÔNG gửi giá)
  │     ├── Dispatch useCartStore.addItem(...)
  │     └── Dispatch useToastStore.push({ type: 'success', title: 'Đã thêm vào giỏ!' })
  │
[Client - CategoryChip]
  └── onClick(slug) → router.push(`/?category=${slug}`) → Server re-fetch
```

---

## 5. CHECKLIST TRIỂN KHAI

- [ ] Tạo `types/domain.ts` và `types/api.ts`
- [ ] Tạo `store/cart.store.ts` (Zustand + persist middleware)
- [ ] Tạo `store/toast.store.ts` (Zustand)
- [ ] Dumb Components: `HeroBanner`, `CategoryChip`, `ProductCard`, `DiscountBadge`, `StockBadge`, `AddToCartButton`, `SectionHeader`, `SocialProofBanner`, `ProductGrid`, `ProductGridSkeleton`
- [ ] Smart Components: `CategoryRail`, `FeaturedProductsSection`
- [ ] Route Entry: `app/(store)/page.tsx` (Server Component)
- [ ] Xử lý URL param `?category=` trong Server Component
- [ ] Toast feedback khi "Thêm vào giỏ" thành công
- [ ] Cart Drawer mở khi dispatch `useCartStore.openCart()`
- [ ] Responsive grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- [ ] `ProductCard` có `priority={index < 4}` cho LCP optimization
