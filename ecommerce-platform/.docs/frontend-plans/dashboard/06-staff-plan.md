# QUY HOẠCH KỸ THUẬT FRONTEND: TRANG QUẢN LÝ NHÂN VIÊN (STAFF MANAGEMENT)

> **Nguồn:** `.docs/ideas/dashboard/06-staff-idea.md`  
> **Mockup tham chiếu:** `.docs/ui-mockups/dash-products/index.html`  
> **Ứng dụng mục tiêu:** Admin Dashboard (`apps/dash` / `app/dash/my-app`)  
> **Phiên bản:** 1.0.0  
> **Ngày tạo:** 2026-08-22  

---

## 1. TỔNG QUAN YÊU CẦU VÀ MỤC TIÊU (OVERVIEW)

Module Quản lý Nhân viên cung cấp giao diện dành cho Quản trị viên (Admin) quản lý đội ngũ nhân sự trong hệ thống E-commerce TechBite, đáp ứng các tiêu chuẩn:
- **Quản lý chuyên biệt:** Chỉ hiển thị người dùng có quyền quản trị (`ADMIN` và `STAFF`), tách biệt hoàn toàn với danh sách khách hàng.
- **Tốc độ xử lý siêu nhanh:** Áp dụng Clean UI, tối ưu hiệu năng render, áp dụng `useDebounce` (400ms) cho tìm kiếm, hạn chế hiệu ứng rườm rà.
- **Thao tác nghiệp vụ tập trung:** Hiển thị danh sách nhân viên trực quan; Tra cứu, lọc theo vai trò và trạng thái; Xem thông tin chi tiết; Tạo mới nhân viên và Cấp phát/Thay đổi quyền hạn linh hoạt.

---

## 2. PHÂN RÃ COMPONENT (COMPONENT TREE)

### 2.1 Trang Danh sách Nhân viên (`/staffs`)
```
StaffListPage [SERVER]                             -> app/(dashboard)/staffs/page.tsx
|
+-- StaffListPageClient [CLIENT]                   -> features/staffs/components/staff-list-page-client.tsx
    |
    +-- StaffListPageHeader [DUMB]                 -> features/staffs/components/staff-list-page-header.tsx
    |   +-- Title ("Quản lý nhân viên" / "Staff Management")
    |   +-- CreateStaffButton [CLIENT]             -> features/staffs/components/create-staff-button.tsx
    |
    +-- StaffFilterBar [CLIENT]                    -> features/staffs/components/staff-filter-bar.tsx
    |   +-- SearchInput [CLIENT] (useDebounce 400ms)-> components/ui/search-input.tsx
    |   +-- RoleFilter [CLIENT]                    -> features/staffs/components/staff-role-filter.tsx
    |   +-- StatusFilter [CLIENT]                  -> features/staffs/components/staff-status-filter.tsx
    |
    +-- StaffTable [DUMB]                          -> features/staffs/components/staff-table.tsx
    |   +-- StaffTableHeader [DUMB]                -> features/staffs/components/staff-table-header.tsx
    |   +-- StaffTableRow [DUMB]                   -> features/staffs/components/staff-table-row.tsx
    |       +-- StaffIdentityCell (Avatar, Full Name, RoleBadge)
    |       +-- ContactInfoCell (Email, Phone)
    |       +-- StaffStatusBadge [DUMB]            -> features/staffs/components/staff-status-badge.tsx
    |       +-- CreatedAtCell (Ngày tham gia)
    |       +-- ActionButtons (ViewDetail Link, AssignRoleBtn, EditStatusBtn)
    |
    +-- StaffPagination [DUMB]                     -> features/staffs/components/staff-pagination.tsx
    |
    +-- CreateStaffModal [CLIENT]                  -> features/staffs/components/modals/create-staff-modal.tsx
    +-- UpdateStaffStatusModal [CLIENT]            -> features/staffs/components/modals/update-staff-status-modal.tsx
    +-- AssignStaffRoleModal [CLIENT]              -> features/staffs/components/modals/assign-staff-role-modal.tsx
```

### 2.2 Trang Chi tiết Nhân viên (`/staffs/[id]`)
```
StaffDetailPage [SERVER]                           -> app/(dashboard)/staffs/[id]/page.tsx
|
+-- StaffDetailContainer [CLIENT]                  -> features/staffs/components/staff-detail-container.tsx
    |
    +-- StaffDetailHeader [DUMB]                   -> features/staffs/components/staff-detail-header.tsx
    |   +-- BackToListLink (Link icon ArrowLeft -> /staffs)
    |   +-- StaffTitleBlock (Họ tên + Badges)
    |   +-- EditProfileButton [CLIENT]             -> features/staffs/components/edit-staff-profile-button.tsx
    |   +-- ToggleStatusButton [CLIENT]            -> features/staffs/components/toggle-staff-status-button.tsx
    |
    +-- StaffDetailGrid [CLIENT]                   -> features/staffs/components/staff-detail-grid.tsx
        |
        +-- StaffProfileCard [DUMB]                 -> features/staffs/components/cards/staff-profile-card.tsx
        |   +-- AvatarLarge & Basic Info (FullName, Email, Phone, Role)
        |   +-- AccountStatusBadge
        |   +-- RegistrationDate & LastLoginTimestamp
        |
        +-- StaffRolePermissionsCard [CLIENT]       -> features/staffs/components/cards/staff-role-permissions-card.tsx
            +-- RoleBadge (ADMIN / STAFF)
            +-- PermissionChecklist (Bảng chọn quyền hạn nếu có, hoặc hiển thị text mô tả quyền)
            +-- EditRoleButton (Mở AssignStaffRoleModal)
```

---

## 3. QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)

### 3.1 Màn hình Danh sách Nhân viên (`/staffs`)

| State | Kiểu dữ liệu | Chiến lược | Lý do |
|---|---|---|---|
| `searchQuery` | `string` | `useState` + `useDebounce(400ms)` | Tìm kiếm nhân viên theo Họ tên, Email hoặc SĐT |
| `selectedRole` | `StaffRole \| 'ALL'` | `useState` | Lọc theo vai trò (`ADMIN` vs `STAFF`) |
| `selectedStatus` | `StaffStatus \| 'ALL'` | `useState` | Lọc theo trạng thái tài khoản (`ACTIVE`, `INACTIVE`) |
| `currentPage` | `number` | `useState` | Trang hiện tại |
| `pageSize` | `number` | `useState` (10 hoặc 20) | Số bản ghi trên 1 trang |
| `isCreateModalOpen` | `boolean` | `useState` | Đóng/mở Modal Tạo nhân viên mới |
| `selectedStaffForAction` | `StaffListItem \| null` | `useState` | Quản lý Modal Cấp quyền hoặc Cập nhật trạng thái |

### 3.2 Màn hình Chi tiết Nhân viên (`/staffs/[id]`)

| State | Kiểu dữ liệu | Chiến lược | Lý do |
|---|---|---|---|
| `isEditModalOpen` | `boolean` | `useState` | Đóng/mở Modal Chỉnh sửa thông tin cơ bản |
| `isRoleModalOpen` | `boolean` | `useState` | Đóng/mở Modal Cấp phát quyền hạn |

---

## 4. ĐỊNH NGHĨA DỮ LIỆU & TYPE SYSTEM (`staff.types.ts`)

```typescript
export type StaffRole = 'ADMIN' | 'STAFF';

export type StaffStatus = 'ACTIVE' | 'INACTIVE';

export interface StaffListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role: StaffRole;
  status: StaffStatus;
  createdAt: string;
  lastLoginAt?: string;
}

export interface StaffDetail extends StaffListItem {
  permissions?: string[]; // Mở rộng hỗ trợ phân quyền chi tiết sau này
  notes?: string;
}

export interface CreateStaffInput {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  role: StaffRole;
}

export interface UpdateStaffStatusInput {
  staffId: string;
  status: StaffStatus;
  reason?: string;
}

export interface UpdateStaffRoleInput {
  staffId: string;
  role: StaffRole;
  permissions?: string[];
}
```

---

## 5. THIẾT KẾ UI & PHONG CÁCH STYLING (DESIGN SPECS & STYLES)

- **Layout Grid & Rounded Corners:**
  - Kế thừa phong cách Clean UI (`bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 p-6`).
  - Ưu tiên không gian trắng (Whitespace) để bố cục rõ ràng, dễ nhìn.
- **Brand Colors:**
  - Nút bấm chính: `#4880FF` (`bg-[#4880FF] hover:bg-[#3b6edc] text-white`).
- **Badge Styling:**
  - **Quản trị viên (`ADMIN`):** `bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800`.
  - **Nhân viên (`STAFF`):** `bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800`.
  - **Hoạt động (`ACTIVE`):** `bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800`.
  - **Ngưng hoạt động (`INACTIVE`):** `bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700`.

---

## 6. LỘ TRÌNH XÂY DỰNG VÀ TÍCH HỢP (IMPLEMENTATION STEPS)

1. **Khởi tạo Domain Types & Mock Data:**
   - Tạo file `features/staffs/types/staff.types.ts`.
   - Tạo file `features/staffs/data/mock-staffs.ts` chứa dữ liệu nhân viên mẫu để dựng UI trước.

2. **Xây dựng Màn hình Danh sách Nhân viên (`/staffs`):**
   - Dựng `StaffListPageHeader` và `StaffFilterBar` (với Search Input debounce).
   - Xây dựng `StaffTable`, `StaffTableRow`, `StaffStatusBadge`, `StaffRoleBadge`.
   - Bổ sung `StaffPagination` (Phân trang danh sách).

3. **Xây dựng Modals Thao tác (`CreateStaffModal` & `AssignStaffRoleModal`):**
   - Dựng form Tạo nhân viên thủ công có validation (Email, SĐT, Mật khẩu nếu có).
   - Dựng form Phân quyền, cho phép chọn `ADMIN` hoặc `STAFF`, tương lai có thể mở rộng danh sách checkbox các quyền phụ.

4. **Xây dựng Màn hình Chi tiết Nhân viên (`/staffs/[id]`):**
   - Dựng `StaffProfileCard` hiển thị thông tin cá nhân cơ bản.
   - Dựng `StaffRolePermissionsCard` hiển thị vai trò hiện tại và danh sách quyền hạn.
   
5. **Đồng bộ Navigation & Sidebar:**
   - Đăng ký route `/staffs` vào Admin Sidebar (`features/layout/components/admin-sidebar.tsx`) với icon `UserCheck` hoặc `ShieldCheck`.
   - Đảm bảo kiểm tra Type safety (`npx tsc --noEmit`) đạt 0 lỗi.
