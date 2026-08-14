# DANH SÁCH ENDPOINTS API: MODULE THIẾT LẬP HỆ THỐNG & BANNER (SETTINGS & BANNERS API)

> **Kế hoạch Backend:** `.docs/backend-plans/dashboard/05-settings-plan.md`  
> **Kế hoạch Frontend:** `.docs/frontend-plans/dashboard/05-settings-plan.md`  
> **Ứng dụng triển khai:** NestJS Backend API (`apps/backend` / `app/backend`)  
> **Ngày hoàn thành:** 2026-08-14  

---

## 1. TỔNG QUAN ENDPOINTS

Hệ thống cung cấp 9 API Endpoints phục vụ song song cho 2 ứng dụng:
- **Admin Dashboard (`apps/dash`):** Quản lý cấu hình hệ thống (Cấu hình chung, VietQR & COD, Phí vận chuyển, Menu navigation, SEO) và quản lý Banners (Thêm/sửa/xóa/xắp xếp thứ tự, tự động xóa ảnh đĩa).
- **Storefront Frontend (`apps/frontend`):** Lấy thông tin cấu hình công khai và lấy danh sách Banners hiển thị trên Trang chủ & Trang danh sách sản phẩm.

---

## 2. CHI TIẾT DANH SÁCH ENDPOINTS

### 2.1 Nhóm Admin System Settings (`/api/v1/admin/settings`)

| Method | Route Path | Phân Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/admin/settings` | `ADMIN`, `STAFF` | Lấy toàn bộ cấu hình hệ thống (General, Payment, Shipping, Banners, Menus, SEO) |
| `PUT` | `/api/v1/admin/settings` | `ADMIN` | Cập nhật cấu hình hệ thống & tự động Purge Cache Redis |

### 2.2 Nhóm Admin Banner Management (`/api/v1/admin/banners`)

| Method | Route Path | Phân Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/admin/banners` | `ADMIN`, `STAFF` | Lấy tất cả Banner (Active + Inactive) có lọc theo `category`, `position`, `search` |
| `POST` | `/api/v1/admin/banners` | `ADMIN` | Tạo mới một Banner quảng cáo |
| `PATCH` | `/api/v1/admin/banners/reorder` | `ADMIN` | Thay đổi thứ tự Banners hàng loạt |
| `PATCH` | `/api/v1/admin/banners/:id` | `ADMIN` | Cập nhật thông tin 1 Banner (tự động xóa ảnh cũ nếu thay đổi) |
| `DELETE` | `/api/v1/admin/banners/:id` | `ADMIN` | Xóa Banner khỏi DB và xóa tập tin ảnh vật lý tương ứng trên ổ đĩa server |

### 2.3 Nhóm Public Storefront API (`/api/v1/settings` & `/api/v1/banners`)

| Method | Route Path | Bảo mật | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/settings/public` | Public | Lấy cấu hình công khai phục vụ Storefront (Cache Redis 1 giờ) |
| `GET` | `/api/v1/banners` | Public | Lấy danh sách Banner active lọc theo `category` (`HOME`/`PRODUCT`) & `position` |

---

## 3. THƯ MỤC FILE CODE THỰC TẾ TRÊN HỆ THỐNG

1. **Module Settings (`src/settings/`):**
   - `dto/update-system-settings.dto.ts`
   - `interfaces/system-settings.interface.ts`
   - `settings.service.ts`
   - `settings.controller.ts`
   - `admin-settings.controller.ts`
   - `settings.module.ts`

2. **Module Banners (`src/banners/`):**
   - `dto/get-banners-admin.dto.ts`
   - `dto/create-banner.dto.ts`
   - `dto/update-banner.dto.ts`
   - `dto/reorder-banners.dto.ts`
   - `dto/get-banners.dto.ts`
   - `interfaces/banner-response.interface.ts`
   - `admin-banners.controller.ts`
   - `banners.service.ts`
   - `banners.controller.ts`
   - `banners.module.ts`
