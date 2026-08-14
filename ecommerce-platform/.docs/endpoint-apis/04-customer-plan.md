# DANH SÁCH ENDPOINTS API: MODULE QUẢN LÝ KHÁCH HÀNG (ADMIN CUSTOMER MANAGEMENT)

> **Kế hoạch tham chiếu:** `.docs/backend-plans/dashboard/04-customer-plan.md`  
> **Tệp tin triển khai:** `app/backend/src/customers/admin-customers.controller.ts`  
> **Dịch vụ xử lý:** `app/backend/src/customers/admin-customers.service.ts`  
> **Bảo mật:** `JwtAuthGuard` + `RolesGuard(ADMIN, STAFF)`  
> **Ngày hoàn thành:** 2026-08-14  

---

## Danh sách API Endpoints đã xây dựng:

| # | HTTP Method | Route Endpoint | Mô tả chức năng | Request DTO | Response Interface |
|---|---|---|---|---|---|
| 1 | `GET` | `/api/v1/admin/customers` | Lấy danh sách khách hàng (Thành viên + Vãng lai) có phân trang, bộ lọc (Tên/Email/SĐT, Loại `REGISTERED`/`GUEST`, Trạng thái `ACTIVE`/`BLOCKED`/`INACTIVE`) và sắp xếp | `CustomerQueryDto` | `CustomerListResponse` |
| 2 | `GET` | `/api/v1/admin/customers/:id` | Xem chi tiết thông tin khách hàng (Profile, tổng chi tiêu `totalSpent`, số đơn `totalOrders`, AOV, sổ địa chỉ `addresses`) | Path param `id` | `CustomerDetailResponse` |
| 3 | `POST` | `/api/v1/admin/customers` | Tạo mới tài khoản khách hàng thủ công (Mã hóa `bcrypt`, hỗ trợ tạo sẵn địa chỉ mặc định) | `CreateCustomerDto` | `CustomerMutateResponse` |
| 4 | `PATCH` | `/api/v1/admin/customers/:id/status` | Cập nhật trạng thái tài khoản khách hàng (`ACTIVE`, `BLOCKED`, `INACTIVE`). Khi bị `BLOCKED`, tự động thu hồi toàn bộ Refresh Tokens trên Redis (`auth:refresh:${userId}:*`) | `UpdateCustomerStatusDto` | `CustomerMutateResponse` |
| 5 | `PATCH` | `/api/v1/admin/customers/:id` | Cập nhật thông tin cá nhân cơ bản của khách hàng (`fullName`, `phone`, `email`) | `UpdateCustomerDto` | `CustomerMutateResponse` |
| 6 | `GET` | `/api/v1/admin/customers/:id/orders` | Lấy danh sách lịch sử đơn hàng của khách hàng có phân trang nội bộ và tìm kiếm theo mã đơn | `CustomerOrderQueryDto` | `CustomerOrdersResponse` |
| 7 | `POST` | `/api/v1/admin/customers/:id/addresses` | Thêm địa chỉ nhận hàng mới cho khách hàng | `AddCustomerAddressDto` | `CustomerMutateResponse` |
| 8 | `PATCH` | `/api/v1/admin/customers/:id/addresses/:addressId/default` | Đặt địa chỉ mặc định cho khách hàng | Path params | `CustomerMutateResponse` |
| 9 | `DELETE` | `/api/v1/admin/customers/:id/addresses/:addressId` | Xóa địa chỉ nhận hàng của khách hàng | Path params | `CustomerMutateResponse` |

---

## Chi tiết File vật lý triển khai:
- Controller: [app/backend/src/customers/admin-customers.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/customers/admin-customers.controller.ts)
- Service: [app/backend/src/customers/admin-customers.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/customers/admin-customers.service.ts)
- Module: [app/backend/src/customers/customers.module.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/customers/customers.module.ts)
- DTOs: `app/backend/src/customers/dto/`
- Interfaces: [app/backend/src/customers/interfaces/customer.interface.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/customers/interfaces/customer.interface.ts)
