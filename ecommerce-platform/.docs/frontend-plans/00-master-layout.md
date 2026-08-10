# QUY HOẠCH KỸ THUẬT FRONTEND: BỐ CỤC TOÀN CỤC (MASTER LAYOUT)

> **Nguồn:** `.docs/ideas/00-master-layout-idea.md`
> **Phiên bản:** 1.0.0
> **Ngày tạo:** 2026-08-03

---

## 1. PHÂN RÃ COMPONENT (COMPONENT TREE)

```
RootLayout [SMART]                          → app/layout.tsx (Next.js App Router)
│
├── Header [SMART]                          → features/layout/components/header.tsx
│   ├── Logo [DUMB] ★ Shared UI            → components/ui/logo.tsx
│   ├── SearchBar [SMART]                  → features/layout/components/search-bar.tsx
│   │   └── SearchInput [DUMB] ★ Shared UI → components/ui/search-input.tsx
│   └── HeaderActions [SMART]              → features/layout/components/header-actions.tsx
│       ├── AuthButton [SMART]             → features/auth/components/auth-button.tsx
│       └── CartIconButton [SMART]         → features/cart/components/cart-icon-button.tsx
│           └── CartBadge [DUMB] ★ Shared  → components/ui/cart-badge.tsx
│
├── MainContent [DUMB]                     → features/layout/components/main-content.tsx
│   └── {children}                         → (Next.js slot — page content injected here)
│
└── Footer [DUMB]                          → features/layout/components/footer.tsx
    ├── FooterBrand [DUMB]                 → features/layout/components/footer-brand.tsx
    │   ├── Logo [DUMB] ★ Shared UI        → (tái dụng components/ui/logo.tsx)
    │   └── ContactInfo [DUMB]             → features/layout/components/contact-info.tsx
    ├── FooterPolicyLinks [DUMB]           → features/layout/components/footer-policy-links.tsx
    └── FooterSocialLinks [DUMB]           → features/layout/components/footer-social-links.tsx
```

### Chú thích nhãn

| Nhãn | Ý nghĩa |
|------|---------|
| `[SMART]` | Kết nối Store / gọi API / xử lý event phức tạp |
| `[DUMB]` | Thuần UI, nhận Props, không chứa side-effect |
| `★ Shared UI` | Nên đặt trong `components/ui/`, tái sử dụng toàn dự án |

### Shared UI cần tạo ngay từ Sprint 1

- `Logo` — hiển thị ở cả Header và Footer
- `SearchInput` — input có icon kính lúp, dùng được ở trang Search nếu cần
- `CartBadge` — số lượng item nổi trên icon giỏ hàng

---

## 2. QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)

### 2.1 Bảng phân loại State

| State | Kiểu dữ liệu | Chiến lược | Lý do |
|---|---|---|---|
| `cartItemCount` | `number` | **Zustand Global** (`useCartStore`) | Cần chia sẻ giữa `CartIconButton` và `CartDrawer` ở mọi trang |
| `cartItems` | `CartItem[]` | **Zustand Global** (`useCartStore`) | Dữ liệu giỏ hàng cần persist (localStorage) khi chưa login |
| `currentUser` | `User \| null` | **Zustand Global** (`useAuthStore`) | Trạng thái đăng nhập dùng khắp app, điều hướng UI Header |
| `isCartDrawerOpen` | `boolean` | **Zustand Global** (`useCartStore`) | `CartIconButton` trigger, `CartDrawer` consume — 2 component khác cây |
| `searchQuery` | `string` | **URL Query Param** (`?q=...`) | Cho phép share link tìm kiếm, back/forward browser hoạt động đúng |
| `isSearchFocused` | `boolean` | **`useState` cục bộ** (`SearchBar`) | Chỉ ảnh hưởng hiệu ứng UI của thanh search, không cần global |
| `isHeaderScrolled` | `boolean` | **`useState` cục bộ** (`Header`) | Dùng để thêm `shadow` khi cuộn, chỉ Header cần biết |

### 2.2 Cấu trúc Store đề xuất

```typescript
// store/cart.store.ts
interface CartStore {
  items: CartItem[];
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (productId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  getTotalCount: () => number; // Zustand selector
}

// store/auth.store.ts
interface AuthStore {
  currentUser: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}
```

### 2.3 Chiến lược Persistence

- `useCartStore` → dùng `zustand/middleware/persist` với `localStorage`.
  - **Điều kiện:** Khi user đăng nhập, sync `localStorage` cart lên DB qua API `POST /cart/merge`, sau đó xóa localStorage.
- `useAuthStore` → **không persist** vào localStorage. Hydrate lại bằng cách gọi `GET /auth/me` trong `RootLayout` khi app mount.

---

## 3. CẤU TRÚC DỮ LIỆU (DATA INTERFACES)

### 3.1 Shared Domain Types

```typescript
// types/user.types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'CUSTOMER' | 'ADMIN';
}

// types/cart.types.ts
export interface CartItem {
  cartItemId: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  unitPrice: number;       // Giá tại thời điểm thêm vào giỏ (snapshot)
  quantity: number;
}
```

### 3.2 Props của Dumb Components quan trọng

```typescript
// components/ui/logo.tsx
export interface LogoProps {
  variant?: 'default' | 'white';   // 'white' dùng ở footer nền tối
  size?: 'sm' | 'md' | 'lg';
  href?: string;                   // default: '/'
}

// components/ui/cart-badge.tsx
export interface CartBadgeProps {
  count: number;
  onClick: () => void;
  'aria-label'?: string;
}

// components/ui/search-input.tsx
export interface SearchInputProps {
  value: string;
  placeholder?: string;
  isLoading?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
}

// features/layout/components/footer-policy-links.tsx
export interface PolicyLink {
  label: string;
  href: string;
}

export interface FooterPolicyLinksProps {
  links: PolicyLink[];
}

// features/layout/components/footer-social-links.tsx
export type SocialPlatform = 'facebook' | 'instagram' | 'youtube' | 'tiktok';

export interface SocialLink {
  platform: SocialPlatform;
  href: string;
  label: string;   // aria-label cho accessibility
}

export interface FooterSocialLinksProps {
  socialLinks: SocialLink[];
  appStoreUrl?: string;
  googlePlayUrl?: string;
}

// features/layout/components/contact-info.tsx
export interface ContactInfoProps {
  address: string;
  phone: string;
  email: string;
}

// features/layout/components/main-content.tsx
export interface MainContentProps {
  children: React.ReactNode;
  className?: string;   // cho phép page override padding nếu cần full-bleed
}
```

### 3.3 Ràng buộc kỹ thuật từ STYLEGUIDE

- `Header` phải có class `sticky top-0 z-50` + thêm `shadow-md` khi `isHeaderScrolled === true`.
- Nền tổng thể `RootLayout`: `bg-gray-50`.
- `CartDrawer` mở theo hướng dẫn UX: **slide từ phải sang**, không navigate sang trang mới.
- Nút Đăng nhập trong `AuthButton`: dùng `bg-slate-900 text-white` (Secondary Action).

---

## 4. CẤU TRÚC THƯ MỤC ĐỀ XUẤT

```
apps/frontend/
├── app/
│   └── layout.tsx                        ← RootLayout [SMART]
│
├── components/
│   └── ui/
│       ├── logo.tsx                      ← [DUMB] ★ Shared
│       ├── search-input.tsx              ← [DUMB] ★ Shared
│       └── cart-badge.tsx                ← [DUMB] ★ Shared
│
├── features/
│   ├── layout/
│   │   └── components/
│   │       ├── header.tsx
│   │       ├── header-actions.tsx
│   │       ├── search-bar.tsx
│   │       ├── main-content.tsx
│   │       ├── footer.tsx
│   │       ├── footer-brand.tsx
│   │       ├── footer-policy-links.tsx
│   │       ├── footer-social-links.tsx
│   │       └── contact-info.tsx
│   ├── auth/
│   │   └── components/
│   │       └── auth-button.tsx
│   └── cart/
│       └── components/
│           └── cart-icon-button.tsx
│
├── store/
│   ├── cart.store.ts
│   └── auth.store.ts
│
└── types/
    ├── user.types.ts
    └── cart.types.ts
```
