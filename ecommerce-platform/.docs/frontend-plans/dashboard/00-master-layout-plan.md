# QUY HOẠCH KỸ THUẬT FRONTEND: BỐ CỤC TOÀN CỤC DASHBOARD (MASTER LAYOUT)

> **Nguồn:** `.docs/ideas/dashboard/00-master-layout-idea.md`  
> **Mockup tham chiếu:** `.docs/ui-mockups/dash-home/index.html`  
> **Ứng dụng mục tiêu:** Admin Dashboard (`apps/dash`)  
> **Phiên bản:** 1.0.0  
> **Ngày tạo:** 2026-08-11  

---

## 1. PHÂN RÃ COMPONENT (COMPONENT TREE)

```
DashboardLayout [SMART]                          → apps/dash/app/(dashboard)/layout.tsx
│
├── AdminSidebar [SMART]                         → apps/dash/components/layout/admin-sidebar.tsx
│   ├── SidebarLogo [DUMB] ★ Shared UI           → apps/dash/components/ui/sidebar-logo.tsx
│   ├── SidebarNav [SMART]                       → apps/dash/components/layout/sidebar-nav.tsx
│   │   ├── SidebarNavGroup [DUMB]               → apps/dash/components/layout/sidebar-nav-group.tsx
│   │   └── SidebarNavItem [DUMB]                → apps/dash/components/layout/sidebar-nav-item.tsx
│   └── SidebarFooter [SMART]                    → apps/dash/components/layout/sidebar-footer.tsx
│       ├── QuickSettingsButton [DUMB]           → apps/dash/components/layout/quick-settings-button.tsx
│       └── AdminLogoutButton [SMART]            → apps/dash/features/auth/components/admin-logout-button.tsx
│
├── AdminHeader [SMART]                          → apps/dash/components/layout/admin-header.tsx
│   ├── SidebarToggleBtn [SMART]                 → apps/dash/components/layout/sidebar-toggle-btn.tsx
│   ├── AdminSearchBar [SMART]                   → apps/dash/components/layout/admin-search-bar.tsx
│   │   └── SearchInput [DUMB] ★ Shared UI       → apps/dash/components/ui/search-input.tsx
│   └── HeaderActions [SMART]                    → apps/dash/components/layout/header-actions.tsx
│       ├── NotificationPopover [SMART]          → apps/dash/features/notifications/components/notification-popover.tsx
│       │   ├── NotificationBell [DUMB]          → apps/dash/components/ui/notification-bell.tsx
│       │   └── NotificationBadge [DUMB]         → apps/dash/components/ui/notification-badge.tsx
│       └── UserProfileDropdown [SMART]          → apps/dash/features/profile/components/user-profile-dropdown.tsx
│           ├── UserAvatar [DUMB] ★ Shared UI    → apps/dash/components/ui/user-avatar.tsx
│           └── UserMenuPopover [DUMB]           → apps/dash/components/ui/user-menu-popover.tsx
│
└── AdminMainContent [DUMB]                      → apps/dash/components/layout/admin-main-content.tsx
    ├── BreadcrumbNav [SMART]                    → apps/dash/components/layout/breadcrumb-nav.tsx
    └── {children}                               → (Next.js App Router slot — nhúng page content)
```

### Chú thích nhãn

| Nhãn | Ý nghĩa |
|------|---------|
| `[SMART]` | Kết nối Store / Zustand / Gọi API / Xử lý router active path hoặc state phức tạp |
| `[DUMB]` | Thuần UI Component, chỉ nhận `props`, không chứa side-effect hoặc logic API |
| `★ Shared UI` | Đặt trong `apps/dash/components/ui/`, tái sử dụng rộng rãi toàn bộ trang Admin |

---

## 2. QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)

### 2.1 Bảng phân loại State

| State | Kiểu dữ liệu | Chiến lược | Lý do |
|---|---|---|---|
| `isSidebarCollapsed` | `boolean` | **Zustand Global** (`useSidebarStore`) | Thu phóng Sidebar desktop, lưu preference vào `localStorage` |
| `isMobileSidebarOpen` | `boolean` | **Zustand Global** (`useSidebarStore`) | Đóng/mở Sidebar Drawer khi xem trên thiết bị Mobile/Tablet |
| `currentAdminUser` | `AdminUser \| null` | **Zustand Global** (`useAdminAuthStore`) | Thông tin admin/staff đang đăng nhập, hiển thị tên/avatar & phân quyền menu |
| `unreadNotificationCount`| `number` | **Zustand / Tanstack Query** | Hiển thị badge số thông báo chưa đọc trên Header |
| `globalSearchQuery` | `string` | **State Cục Bộ + `useDebounce`** | Tìm kiếm nhanh đơn hàng/sản phẩm/khách hàng (Debounce 300ms) |
| `isNotificationOpen` | `boolean` | **`useState` Cục Bộ** (`HeaderActions`) | Trạng thái đóng/mở popover danh sách thông báo |
| `isProfileDropdownOpen` | `boolean` | **`useState` Cục Bộ** (`UserProfileDropdown`) | Trạng thái đóng/mở menu thả xuống của tài khoản Admin |

### 2.2 Cấu trúc Store đề xuất (Zustand)

```typescript
// apps/dash/store/sidebar.store.ts
export interface SidebarStore {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

// apps/dash/store/admin-auth.store.ts
import { AdminUser } from '../types/admin-user.types';

export interface AdminAuthStore {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AdminUser | null) => void;
  logout: () => Promise<void>;
}
```

---

## 3. CẤU TRÚC DỮ LIỆU & INTERFACES (DATA CONTRACTS)

### 3.1 Domain Types

```typescript
// apps/dash/types/admin-user.types.ts
export type AdminRole = 'ADMIN' | 'STAFF';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: AdminRole;
}

// apps/dash/types/nav.types.ts
export interface NavItem {
  id: string;
  label: string;
  href: string;
  iconName: string; // Tên icon Lucide (ví dụ: 'LayoutDashboard', 'ShoppingBag', 'Users', 'Settings')
  badgeCount?: number;
  rolesAllowed?: AdminRole[];
  children?: NavItem[];
}

export interface NavGroup {
  id: string;
  title?: string;
  items: NavItem[];
}

// apps/dash/types/notification.types.ts
export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'ORDER' | 'STOCK' | 'SYSTEM';
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
}
```

### 3.2 Component Props (Strict TypeScript Interfaces)

```typescript
// apps/dash/components/ui/sidebar-logo.tsx
export interface SidebarLogoProps {
  isCollapsed?: boolean;
  brandName?: string;
  logoUrl?: string;
}

// apps/dash/components/layout/sidebar-nav-item.tsx
export interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onNavigate?: () => void;
}

// apps/dash/components/layout/sidebar-nav-group.tsx
export interface SidebarNavGroupProps {
  group: NavGroup;
  currentPath: string;
  isCollapsed: boolean;
}

// apps/dash/components/ui/notification-bell.tsx
export interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
}

// apps/dash/components/ui/user-avatar.tsx
export interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  role?: AdminRole;
}

// apps/dash/components/layout/admin-main-content.tsx
export interface AdminMainContentProps {
  children: React.ReactNode;
  className?: string;
}
```

---

## 4. QUY CHUẨN THIẾT KẾ & BẢO MẬT (DESIGN & SECURITY CONSTRAINTS)

1. **Giao diện & Style Guide Admin (`apps/dash`):**
   - Đọc trực tiếp thiết kế từ `.docs/ui-mockups/dash-home/index.html`.
   - Màu chủ đạo: Slate/Zinc dark palette cho Sidebar (`bg-slate-900 text-slate-100`), Header trắng tinh gọn (`bg-white border-b border-slate-200`), Nền làm việc `bg-slate-50`.
   - Màu nhận diện trạng thái Active Menu: `bg-slate-800 text-orange-500 font-semibold border-r-4 border-orange-500`.

2. **Ràng buộc kỹ thuật & Phân quyền:**
   - Kiểm tra `role` của `AdminUser` để ẩn/hiện các mục menu nhạy cảm (Ví dụ: Mục quản lý Nhân viên / Settings chỉ dành riêng cho `ADMIN`).
   - Phân tách tuyệt đối giữa Server Component (mặc định) và Client Component (`use client`).
   - Không được phép chuyển `page.tsx` thành Client Component, chỉ tách các component con tương tác (`HeaderActions`, `SidebarNav`, `AdminSearchBar`) thành Client Component khi thực sự cần thiết.

3. **Hiệu năng & Bảo mật:**
   - Ô nhập tìm kiếm trên Header (`AdminSearchBar`) **BẮT BUỘC** qua hook `useDebounce` với độ trễ 300ms - 500ms trước khi kích hoạt API/Route Search.
   - Quản lý JWT token phía Backend/BFF via HttpOnly Cookie, tuyệt đối không lưu token nhạy cảm vào LocalStorage.

---

## 5. CẤU TRÚC THƯ MỤC NƠI THI CÔNG (`apps/dash`)

```
apps/dash/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx                     ← DashboardLayout [SMART]
│   │   └── page.tsx                       ← Dashboard Home Page
│   └── layout.tsx                         ← RootLayout (Providers, Fonts)
│
├── components/
│   ├── ui/                                ← Dumb & Shared Components
│   │   ├── sidebar-logo.tsx
│   │   ├── search-input.tsx
│   │   ├── notification-bell.tsx
│   │   ├── notification-badge.tsx
│   │   ├── user-avatar.tsx
│   │   └── user-menu-popover.tsx
│   │
│   └── layout/                            ← Layout Wrapper Components
│       ├── admin-sidebar.tsx
│       ├── sidebar-nav.tsx
│       ├── sidebar-nav-group.tsx
│       ├── sidebar-nav-item.tsx
│       ├── sidebar-footer.tsx
│       ├── quick-settings-button.tsx
│       ├── admin-header.tsx
│       ├── sidebar-toggle-btn.tsx
│       ├── admin-search-bar.tsx
│       ├── header-actions.tsx
│       ├── admin-main-content.tsx
│       └── breadcrumb-nav.tsx
│
├── features/
│   ├── auth/
│   │   └── components/
│   │       └── admin-logout-button.tsx
│   ├── notifications/
│   │   └── components/
│   │       └── notification-popover.tsx
│   └── profile/
│       └── components/
│           └── user-profile-dropdown.tsx
│
├── store/
│   ├── sidebar.store.ts
│   └── admin-auth.store.ts
│
└── types/
    ├── admin-user.types.ts
    ├── nav.types.ts
    └── notification.types.ts
```
