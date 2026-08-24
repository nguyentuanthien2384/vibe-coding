# DANH SÁCH ENDPOINTS API: HỆ THỐNG TÍCH ĐIỂM & ĐỔI ĐIỂM (LOYALTY POINTS SYSTEM)

> **Tài Liệu Backend Plan:** `.docs/backend-plans/points-plan.md`  
> **Module Source:** `apps/backend/src/points/`  
> **Trạng thái:** Hoàn tất & Đã kiểm thử TypeScript Typecheck (0 lỗi)  

---

## 1. Customer Endpoints (`/api/v1/points`)

| Method | Route | Auth Guard | Role Guard | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/points/summary` | `JwtAuthGuard` | All Authenticated | Lấy tổng quan điểm, giá trị quy đổi VNĐ, hạng thành viên và tiến trình thăng hạng |
| `GET` | `/api/v1/points/history` | `JwtAuthGuard` | All Authenticated | Lấy lịch sử biến động điểm phân trang (`page`, `limit`) và lọc theo loại (`type`: ALL/EARN/REDEEM/REFUND/ADJUST) |
| `GET` | `/api/v1/points/config` | Public | None | Lấy cấu hình hệ thống điểm (tỷ lệ tích, tỷ lệ đổi, mốc đổi tối thiểu, hạn sử dụng) |
| `POST` | `/api/v1/points/preview-checkout` | `JwtAuthGuard` | All Authenticated | Tính toán xem trước số điểm có thể dùng, số tiền giảm giá và dự kiến điểm tích lũy |

---

## 2. Admin Endpoints (`/api/v1/admin/points`)

| Method | Route | Auth Guard | Role Guard | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/points/customers/:userId/history` | `JwtAuthGuard` | `ADMIN`, `STAFF` | Quản trị viên xem lịch sử điểm của khách hàng cụ thể |
| `POST` | `/api/v1/admin/points/adjust` | `JwtAuthGuard` | `ADMIN` | Quản trị viên điều chỉnh thủ công điểm số (+/-) kèm lý do ghi vết |
| `PATCH` | `/api/v1/admin/points/config` | `JwtAuthGuard` | `ADMIN` | Quản trị viên cập nhật cấu hình tỷ lệ tích/đổi điểm và mốc thăng hạng |

---

## 3. Tích Hợp Lifecycle Đơn Hàng (`/api/v1/orders`)

| Trigger Point | File Thực Thi | Logic Xử Lý |
| :--- | :--- | :--- |
| **Đặt hàng có dùng điểm (`POST /orders`)** | `orders.service.ts` | Trừ điểm nguyên tử trong DB transaction, ghi `PointsLedger` (Type: `REDEEM`). Đơn hàng `0đ` tự động chuyển sang `PAID` và `CONFIRMED`. |
| **Giao hàng hoàn tất (`PATCH /admin/orders/:id/status` -> `DELIVERED`)** | `admin-orders.service.ts` | Tự động tính điểm = `(Tiền hàng - Ship) * EarningRate * TierMultiplier`, cộng điểm vào tài khoản, đánh giá thăng hạng, ghi `PointsLedger` (Type: `EARN`) và phát SSE Notification. |
| **Hủy đơn hàng (`PATCH /admin/orders/:id/status` -> `CANCELLED`)** | `admin-orders.service.ts` | Tự động hoàn trả lại 100% số điểm đã dùng (`pointsUsed`), ghi `PointsLedger` (Type: `REFUND`) và phát SSE Notification. |
