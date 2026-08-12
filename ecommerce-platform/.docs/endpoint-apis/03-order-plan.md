# ENDPOINT APIS: Admin Order Management

> **Source Plan:** `.docs/backend-plans/dashboard/03-order-plan.md`  
> **Base URL:** `/api/v1`  
> **Auth:** Tất cả các endpoint đều yêu cầu Header `Authorization: Bearer <accessToken>` và quyền `ADMIN` hoặc `STAFF`.

---

## Endpoints

| Method | Route | Auth Roles | Description |
|--------|-------|------------|-------------|
| `GET` | `/api/v1/admin/orders` | ADMIN, STAFF | Lấy danh sách đơn hàng có phân trang, bộ lọc (search, status, date) & thống kê summary |
| `GET` | `/api/v1/admin/orders/:id` | ADMIN, STAFF | Lấy chi tiết đơn hàng theo ID hoặc Mã Đơn Hàng (`orderCode`) |
| `PATCH` | `/api/v1/admin/orders/:id/status` | ADMIN, STAFF | Cập nhật trạng thái đơn hàng & trạng thái thanh toán (có State Machine & hoàn kho) |

---

## Files vật lý đã tạo trong Backend (`app/backend/src/orders`)

| File | Mô tả |
|------|-------|
| `src/orders/admin-orders.controller.ts` | Controller gồm 3 RESTful endpoints bảo mật bằng `JwtAuthGuard` & `RolesGuard(ADMIN, STAFF)` |
| `src/orders/admin-orders.service.ts` | Service xử lý logic truy vấn dữ liệu, phân trang, lọc debounced search, state machine validation, Prisma transaction hoàn kho và xóa Redis Cache |
| `src/orders/dto/get-admin-orders.dto.ts` | DTO xác thực Query parameters: search, orderStatus, paymentStatus, paymentMethod, startDate, endDate, page, limit, sortBy, sortOrder |
| `src/orders/dto/update-order-status.dto.ts` | DTO xác thực Body payload: orderStatus, paymentStatus, cancelReason, adminNote |
| `src/orders/interfaces/admin-order.interface.ts` | Interfaces định nghĩa response contract chuẩn mực cho Admin Order Management |
| `src/orders/orders.module.ts` | Module cập nhật đăng ký `AdminOrdersController`, `AdminOrdersService` & import `AuthModule` |

---

## Quy tắc Nghiệp vụ đã Thực thi (Implemented Business Rules)

1. **Bộ lọc & Tìm kiếm Debounced (Search & Filter):**
   - Ô tìm kiếm hỗ trợ tra cứu theo `orderCode`, `customerName`, `customerEmail`, `customerPhone`.
   - Hỗ trợ lọc đa chiều theo trạng thái đơn hàng, trạng thái thanh toán, phương thức thanh toán và khoảng ngày khởi tạo (`startDate` -> `endDate`).
2. **Thống kê Tổng quan (Summary Statistics):**
   - API tự động tính toán tổng số đơn và đếm riêng các trạng thái (`pendingCount`, `confirmedCount`, `processingCount`, `shippingCount`, `deliveredCount`, `cancelledCount`, `unpaidCount`, `paidCount`) phục vụ hiển thị nhãn tab tức thì trên UI Admin.
3. **Kiểm soát Ma trận Trạng thái (State Machine Validation):**
   - CẤM chuyển trạng thái đối với các đơn hàng đã ở trạng thái cuối (`DELIVERED` hoặc `CANCELLED`).
   - Tự động set `completedAt = new Date()` khi đơn chuyển sang `DELIVERED`. Nếu thanh toán COD, tự động cập nhật `paymentStatus = PAID` và `paidAt = new Date()`.
   - Tự động set `paidAt = new Date()` khi thanh toán chuyển sang `PAID`.
4. **Hoàn trả Tồn kho khi Hủy Đơn (Inventory Restock on Cancel):**
   - Khi chuyển trạng thái sang `CANCELLED`, thực thi trong `prisma.$transaction` để cộng trả lại số lượng tồn kho `stock` của từng sản phẩm trong đơn.
5. **Xóa Cache Redis:**
   - Tự động xóa cache danh sách đơn hàng public và chi tiết đơn hàng của User trên Redis sau mỗi thao tác cập nhật.
