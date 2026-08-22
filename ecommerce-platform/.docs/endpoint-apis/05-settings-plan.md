# DANH SÁCH ENDPOINTS API: MODULE THIẾT LẬP HỆ THỐNG (SETTINGS API SPECIFICATION)

> **Kế hoạch Backend:** `.docs/backend-plans/dashboard/05-settings-plan.md`  
> **Kế hoạch Frontend:** `.docs/frontend-plans/dashboard/05-settings-plan.md`  
> **Ứng dụng triển khai:** NestJS Backend API (`apps/backend` / `app/backend`)  
> **Phiên bản:** 2.0.0 (Cấu hình chung, Menu navigation, Thông tin & SEO, Cấu hình Email SMTP)  
> **Ngày cập nhật:** 2026-08-22  

---

## 1. TỔNG QUAN ENDPOINTS

Hệ thống cung cấp nhóm API hoàn chỉnh phục vụ song song cho 2 ứng dụng:
- **Admin Dashboard (`apps/dash`):** Quản lý toàn diện 4 nhóm thiết lập (`general`, `menus`, `seo`, `email`), hỗ trợ kiểm tra kết nối SMTP trực tiếp (`/email/test`).
- **Storefront Frontend (`apps/frontend`):** Cung cấp các endpoints công khai đã được tối ưu cache Redis (`/public`, `/seo`, `/menus`).

---

## 2. CHI TIẾT DANH SÁCH ENDPOINTS

### 2.1 Nhóm Admin System Settings (`/api/v1/admin/settings`)

| Method | Route Path | Phân Quyền | Body / Query | Mô tả |
|---|---|---|---|---|
| `GET` | `/api/v1/admin/settings` | `ADMIN`, `STAFF` | None | Lấy toàn bộ 4 nhóm cấu hình hệ thống (đã ẩn `smtpPassword`) |
| `PUT` | `/api/v1/admin/settings` | `ADMIN` | `UpdateSystemSettingsDto` | Cập nhật đồng loạt hoặc từng nhóm cấu hình, tự động Purge Cache Redis |
| `GET` | `/api/v1/admin/settings/:group` | `ADMIN`, `STAFF` | Params: `group` (`general`, `menus`, `seo`, `email`) | Lấy thông tin chi tiết một nhóm cấu hình |
| `PATCH` | `/api/v1/admin/settings/:group` | `ADMIN` | Object DTO theo group | Cập nhật nhanh một nhóm cấu hình riêng lẻ |
| `POST` | `/api/v1/admin/settings/email/test` | `ADMIN` | `TestEmailConnectionDto` | Gửi email thử nghiệm để kiểm tra xác thực cấu hình SMTP |

---

### 2.2 Nhóm Public Storefront API (`/api/v1/settings`)

| Method | Route Path | Phân Quyền | Caching | Mô tả |
|---|---|---|---|---|
| `GET` | `/api/v1/settings/public` | Public | Redis Cache 1h | Lấy cấu hình chung, thông tin cửa hàng và liên hệ cho Storefront |
| `GET` | `/api/v1/settings/seo` | Public | Redis Cache 1h | Lấy đầy đủ thẻ meta SEO, OpenGraph, GA4 cho Next.js Metadata API |
| `GET` | `/api/v1/settings/menus` | Public | Redis Cache 1h | Lấy danh sách menu Header & Footer đã lọc `isActive: true` |

---

## 3. THƯ MỤC FILE CODE TRÊN HỆ THỐNG

1. **Module Settings (`src/settings/`):**
   - `dto/general-settings.dto.ts`
   - `dto/menu-settings.dto.ts`
   - `dto/seo-settings.dto.ts`
   - `dto/email-settings.dto.ts`
   - `dto/update-system-settings.dto.ts`
   - `interfaces/system-settings.interface.ts`
   - `settings.service.ts`
   - `settings.controller.ts`
   - `admin-settings.controller.ts`
   - `settings.module.ts`

2. **Module Mail (`src/mail/`):**
   - `mail.service.ts` (Dynamic Transporter & Test SMTP Connection)
   - `mail.controller.ts`
   - `templates/email-templates.ts`
