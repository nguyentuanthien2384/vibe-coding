# BẢN THIẾT KẾ BACK-END: MODULE QUẢN LÝ NHÂN VIÊN & PHÂN QUYỀN (ADMIN STAFF & ROLE MANAGEMENT)

> **Tài liệu tham chiếu:** `.docs/ideas/dashboard/06-staff-idea.md` & `.docs/frontend-plans/dashboard/06-staff-plan.md`  
> **Tech Stack:** NestJS, Prisma ORM, MySQL, Redis, TypeScript  
> **Ứng dụng mục tiêu:** Backend API Server (`apps/backend` / `app/backend`)  
> **Phiên bản:** 1.0.0  
> **Ngày tạo:** 2026-08-22  

---

## 1. TỔNG QUAN HỆ THỐNG & NGUYÊN TẮC THIẾT KẾ

Module Quản lý Nhân viên & Nhóm quyền cung cấp hạ tầng quản trị phân quyền đa tầng (Hybrid RBAC + Fine-grained Permissions) dành riêng cho Ban quản trị hệ thống E-commerce TechBite, tuân thủ các nguyên tắc cốt lõi:

1. **Phân quyền 2 tầng linh hoạt (Hybrid Permission Architecture):**
   - **Tầng 1 - Nhóm quyền kế thừa (Role Groups):** Định nghĩa các chức danh nghiệp vụ chuẩn (`Super Admin`, `Cửa hàng trưởng`, `Nhân viên kho`, `CSKH & Marketing`) cùng bộ quyền mặc định gắn với nhóm.
   - **Tầng 2 - Đặc quyền cấp riêng (Custom / Additional Permissions):** Cho phép gán thêm các quyền cụ thể cho từng cá nhân mà không cần tạo thêm nhóm quyền mới.
2. **Bảo mật & Thu hồi phiên làm việc Real-time (Active Session Revocation):**
   - Khi nhân viên bị **Khóa tài khoản (`BLOCKED`)**: Hệ thống tự động thu hồi ngay lập tức toàn bộ Refresh Tokens trên Redis (`auth:refresh:${userId}:*`) và đưa `accessJti` hiện tại vào danh sách Blacklist (`blacklist:token:${jti}`).
   - Khi thay đổi quyền hạn của Nhóm quyền: Hệ thống tự động xóa cache quyền của toàn bộ nhân viên thuộc nhóm đó trên Redis (`auth:perms:user:${userId}`).
3. **An toàn dữ liệu hệ thống (System Integrity):**
   - Các nhóm quyền mặc định của hệ thống (`isSystem = true`, ví dụ `Super Admin`) được bảo vệ nghiêm ngặt: **CẤM xóa** và **CẤM sửa slug hệ thống**.
   - Không cho phép xóa nhóm quyền khi vẫn còn nhân viên đang được gán vào nhóm đó.
4. **Không rò rỉ dữ liệu nhạy cảm:**
   - **TUYỆT ĐỐI KHÔNG** trả về trường `password` hash trong bất kỳ API Response nào.
   - Mật khẩu khởi tạo được mã hóa an toàn bằng `bcrypt` với `saltRounds = 12`.

---

## 2. THIẾT KẾ DỮ LIỆU (DATABASE SCHEMA - PRISMA / MYSQL)

### 2.1. Bảng Nhóm Quyền (`RoleGroup`) & Cập nhật Bảng Người Dùng (`User`)

Bổ sung model `RoleGroup` và cập nhật quan hệ trên `User` trong file `prisma/schema.prisma`:

```prisma
// =============================================================================
// MODULE: STAFF & ROLE MANAGEMENT
// =============================================================================

/// Bảng định nghĩa nhóm quyền / chức danh quản trị trong hệ thống
model RoleGroup {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(100)
  slug        String   @unique @db.VarChar(100)
  description String?  @db.Text
  isSystem    Boolean  @default(false)
  permissions Json     // Mảng JSON chứa danh sách permission IDs: ["product.view", "order.view", ...]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  users User[]

  @@index([slug], name: "idx_role_group_slug")
  @@index([isSystem], name: "idx_role_group_system")
  @@map("role_groups")
}

/// Bảng Người Dùng (Cập nhật quan hệ RoleGroup và Custom Permissions)
model User {
  id                Int        @id @default(autoincrement())
  email             String     @unique @db.VarChar(255)
  password          String     @db.VarChar(255)
  fullName          String     @db.VarChar(100)
  phone             String?    @db.VarChar(20)
  avatarUrl         String?    @db.VarChar(500)
  notes             String?    @db.Text
  role              Role       @default(CUSTOMER)
  isActive          Boolean    @default(true)
  lastLoginAt       DateTime?
  
  // Quan hệ Nhóm quyền & Đặc quyền bổ sung
  roleGroupId       Int?
  roleGroup         RoleGroup? @relation(fields: [roleGroupId], references: [id], onDelete: SetNull)
  customPermissions Json?      // Mảng JSON chứa các đặc quyền cấp riêng: ["banner.manage"]

  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt

  cart              Cart?
  orders            Order[]
  addresses         Address[]
  emailLogs         EmailLog[]
  notifications     Notification[]

  @@index([email], name: "idx_user_email")
  @@index([role, isActive], name: "idx_user_role_active")
  @@index([roleGroupId], name: "idx_user_role_group")
  @@index([role, isActive, createdAt(sort: Desc)], name: "idx_user_admin_staff_filter")
  @@index([fullName, email, phone], name: "idx_user_search")
  @@map("users")
}
```

---

## 3. DANH MỤC QUYỀN HẠN HỆ THỐNG (SYSTEM PERMISSIONS CATALOG)

Hệ thống định nghĩa sẵn danh mục 9 quyền hạn cốt lõi được gom theo 4 nhóm chức năng nghiệp vụ:

| Mã Quyền (`id`) | Tên hiển thị (`label`) | Nhóm chức năng (`category`) | Mô tả chi tiết |
|---|---|---|---|
| `product.view` | Xem danh sách sản phẩm | `PRODUCT` | Truy cập trang danh sách sản phẩm & chi tiết sản phẩm |
| `product.manage` | Thêm/Sửa/Xóa sản phẩm | `PRODUCT` | Tạo mới, cập nhật giá/tồn kho và xóa sản phẩm |
| `category.manage` | Quản lý chuyên mục | `PRODUCT` | Thêm, sửa, xóa danh mục món ăn / sản phẩm |
| `order.view` | Xem danh sách đơn hàng | `ORDER` | Xem danh sách đơn hàng & chi tiết từng đơn hàng |
| `order.update_status` | Cập nhật trạng thái đơn hàng | `ORDER` | Chuyển đổi trạng thái (Xác nhận, Đang chuẩn bị, Giao hàng, Hủy đơn) |
| `payment.confirm` | Xác nhận thanh toán | `ORDER` | Xác nhận giao dịch VietQR / Chuyển khoản thành công |
| `report.export` | Xuất báo cáo & Hóa đơn | `ORDER` | Tải tập tin Excel `.xlsx` và In hóa đơn bán hàng A4/80mm |
| `customer.view` | Xem thông tin khách hàng | `CUSTOMER` | Tra cứu danh sách và lịch sử mua hàng của khách |
| `banner.manage` | Quản lý Banner/Quảng cáo | `SYSTEM` | Cấu hình Hero Banner, Promotion Banner và Menu website |

---

## 4. GIAO KÈO API (API CONTRACT & ENDPOINTS SPECIFICATION)

Toàn bộ các Endpoints bên dưới đều có tiền tố `/api/v1/admin` và được bảo vệ nghiêm ngặt bởi:
`@UseGuards(JwtAuthGuard, RolesGuard)` và `@Roles(Role.ADMIN)`.

```
========================================================================================================
MODULE: ROLE GROUPS (NHÓM QUYỀN)
========================================================================================================
1. GET    /api/v1/admin/role-groups                     -> Lấy danh sách nhóm quyền & thống kê
2. GET    /api/v1/admin/role-groups/:id                 -> Lấy chi tiết 1 nhóm quyền
3. POST   /api/v1/admin/role-groups                     -> Tạo mới nhóm quyền
4. PATCH  /api/v1/admin/role-groups/:id                 -> Cập nhật nhóm quyền & quyền hạn
5. DELETE /api/v1/admin/role-groups/:id                 -> Xóa nhóm quyền (Nếu không phải system & trống thành viên)
6. GET    /api/v1/admin/permissions                     -> Lấy danh mục tất cả quyền hạn có sẵn

========================================================================================================
MODULE: STAFFS (NHÂN VIÊN)
========================================================================================================
7. GET    /api/v1/admin/staffs                          -> Lấy danh sách nhân viên (Lọc, tìm kiếm, phân trang)
8. GET    /api/v1/admin/staffs/:id                      -> Xem chi tiết nhân viên (Kèm quyền kế thừa & đặc quyền)
9. POST   /api/v1/admin/staffs                          -> Tạo mới tài khoản nhân viên
10. PATCH /api/v1/admin/staffs/:id/status               -> Khóa / Mở khóa tài khoản (Thu hồi token)
11. PATCH /api/v1/admin/staffs/:id/role-group           -> Gán / Đổi nhóm quyền cho nhân viên
12. PATCH /api/v1/admin/staffs/:id/custom-permissions   -> Cập nhật đặc quyền bổ sung cấp riêng
13. PATCH /api/v1/admin/staffs/:id                      -> Chỉnh sửa thông tin cơ bản (Tên, SĐT, Ghi chú)
```

---

### 4.1. Chi tiết API Nhóm Quyền (Role Groups)

#### API 1: Lấy danh sách nhóm quyền & Thống kê tổng quan
* **Route:** `GET /api/v1/admin/role-groups`
* **Response `200 OK`:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "stats": {
      "totalGroups": 4,
      "totalAssignedStaffs": 12
    },
    "roleGroups": [
      {
        "id": 1,
        "name": "Super Admin",
        "slug": "super-admin",
        "description": "Toàn quyền quản trị hệ thống. Không thể chỉnh sửa.",
        "isSystem": true,
        "memberCount": 2,
        "permissions": ["product.view", "product.manage", "category.manage", "order.view", "order.update_status", "payment.confirm", "report.export", "customer.view", "banner.manage"],
        "createdAt": "2026-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Cửa hàng trưởng",
        "slug": "cua-hang-truong",
        "description": "Quản lý sản phẩm, đơn hàng và xem báo cáo khách hàng.",
        "isSystem": false,
        "memberCount": 3,
        "permissions": ["product.view", "product.manage", "category.manage", "order.view", "order.update_status", "payment.confirm", "report.export", "customer.view"],
        "createdAt": "2026-02-15T08:30:00.000Z"
      }
    ]
  }
}
```

#### API 3: Tạo mới nhóm quyền
* **Route:** `POST /api/v1/admin/role-groups`
* **Request Body (`CreateRoleGroupDto`):**
```json
{
  "name": "Nhân viên Telesale",
  "description": "Tư vấn và gọi điện xác nhận đơn hàng với khách hàng",
  "permissions": ["order.view", "order.update_status", "customer.view"]
}
```
* **Response `201 Created`:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Tạo nhóm quyền mới thành công",
  "data": {
    "id": 5,
    "name": "Nhân viên Telesale",
    "slug": "nhan-vien-telesale",
    "description": "Tư vấn và gọi điện xác nhận đơn hàng với khách hàng",
    "isSystem": false,
    "memberCount": 0,
    "permissions": ["order.view", "order.update_status", "customer.view"],
    "createdAt": "2026-08-22T16:00:00.000Z"
  }
}
```

#### API 4: Cập nhật nhóm quyền
* **Route:** `PATCH /api/v1/admin/role-groups/:id`
* **Request Body (`UpdateRoleGroupDto`):**
```json
{
  "name": "Cửa hàng trưởng chi nhánh",
  "description": "Quản lý toàn bộ vận hành tại chi nhánh",
  "permissions": ["product.view", "product.manage", "order.view", "order.update_status", "report.export"]
}
```
* **Logic kiểm soát:**
  - Nếu `roleGroup.isSystem === true`: Không cho phép đổi tên hệ thống hoặc bỏ các quyền gốc quan trọng.
  - Tự động phát tín hiệu xóa cache quyền hạn trên Redis của toàn bộ nhân viên thuộc nhóm này.

#### API 5: Xóa nhóm quyền
* **Route:** `DELETE /api/v1/admin/role-groups/:id`
* **Logic an toàn:**
  - Ném `BadRequestException("Không thể xóa nhóm quyền mặc định của hệ thống")` nếu `isSystem === true`.
  - Ném `BadRequestException("Không thể xóa nhóm quyền đang có nhân viên được gán")` nếu `memberCount > 0`.

---

### 4.2. Chi tiết API Quản lý Nhân Viên (Staffs)

#### API 7: Lấy danh sách nhân viên (Lọc, tìm kiếm, phân trang)
* **Route:** `GET /api/v1/admin/staffs`
* **Query Parameters (`GetStaffsQueryDto`):**
  - `page`: number (mặc định `1`)
  - `limit`: number (mặc định `10`)
  - `search`: string (tìm theo Tên, Email, SĐT)
  - `status`: `'ACTIVE' | 'BLOCKED' | 'ALL'` (mặc định `'ALL'`)
  - `role`: `'ADMIN' | 'STAFF' | 'ALL'` (mặc định `'ALL'`)
  - `roleGroupId`: number (lọc theo ID nhóm quyền)
* **Response `200 OK`:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "staffs": [
      {
        "id": "1",
        "numericId": 1,
        "fullName": "Nguyễn Văn A",
        "email": "admin@techbite.com",
        "phone": "0901234567",
        "role": "ADMIN",
        "roleLabel": "Quản trị viên",
        "roleGroupId": 1,
        "roleGroupName": "Super Admin",
        "status": "ACTIVE",
        "createdAt": "10/1/2024",
        "lastLoginAt": "2026-08-22T08:15:00.000Z"
      },
      {
        "id": "2",
        "numericId": 2,
        "fullName": "Trần Thị B",
        "email": "staff.01@techbite.com",
        "phone": "0908765432",
        "role": "STAFF",
        "roleLabel": "Nhân viên",
        "roleGroupId": null,
        "roleGroupName": "Chưa gán nhóm",
        "status": "ACTIVE",
        "createdAt": "15/2/2024",
        "lastLoginAt": "2026-08-21T17:45:00.000Z"
      }
    ],
    "pagination": {
      "total": 4,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

#### API 8: Xem chi tiết nhân viên
* **Route:** `GET /api/v1/admin/staffs/:id`
* **Response `200 OK`:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "2",
    "numericId": 2,
    "fullName": "Trần Thị B",
    "email": "staff.01@techbite.com",
    "phone": "0908765432",
    "avatarUrl": null,
    "role": "STAFF",
    "roleLabel": "Nhân viên",
    "roleGroupId": 3,
    "roleGroupName": "Nhân viên kho",
    "status": "ACTIVE",
    "createdAt": "15/2/2024",
    "lastLoginAt": "2026-08-21T17:45:00.000Z",
    "inheritedPermissions": ["product.view", "order.view", "order.update_status"],
    "customPermissions": ["customer.view"],
    "effectivePermissions": ["product.view", "order.view", "order.update_status", "customer.view"],
    "notes": "Nhân viên xử lý đơn hàng và tồn kho chi nhánh 1."
  }
}
```

#### API 9: Tạo mới tài khoản nhân viên
* **Route:** `POST /api/v1/admin/staffs`
* **Request Body (`CreateStaffDto`):**
```json
{
  "fullName": "Lê Văn C",
  "email": "staff.02@techbite.com",
  "phone": "0912345678",
  "password": "Password123",
  "role": "STAFF",
  "roleGroupId": 3
}
```
* **Validation & Xử lý:**
  - Email phải có định dạng hợp lệ, kiểm tra không bị trùng lặp trong bảng `User`.
  - Mật khẩu tối thiểu 6 ký tự (Tự động gán `Password123` nếu Admin để trống).
  - Hash mật khẩu qua `bcrypt.hash(password, 12)`.

#### API 10: Khóa / Mở khóa tài khoản nhân viên (Revoke Sessions)
* **Route:** `PATCH /api/v1/admin/staffs/:id/status`
* **Request Body (`UpdateStaffStatusDto`):**
```json
{
  "status": "BLOCKED",
  "reason": "Tạm đình chỉ công tác để thanh tra kho"
}
```
* **Quy trình Bảo mật Thu hồi Token:**
  1. Cập nhật `isActive = false` trong database.
  2. Ghi nhận thời gian khóa `auth:blocked_at:${userId}` lên Redis.
  3. Xóa toàn bộ Refresh Token của user trong Redis: `redis.del("auth:refresh:${userId}:*")`.
  4. Lập tức vô hiệu hóa mọi phiên đăng nhập của nhân viên trên tất cả thiết bị.

#### API 12: Cập nhật đặc quyền bổ sung cấp riêng
* **Route:** `PATCH /api/v1/admin/staffs/:id/custom-permissions`
* **Request Body (`UpdateCustomPermissionsDto`):**
```json
{
  "customPermissions": ["customer.view", "banner.manage"]
}
```
* **Xử lý:**
  - Lưu mảng `customPermissions` JSON vào bảng `User`.
  - Xóa cache phân quyền của user trên Redis: `redis.del("auth:perms:user:${userId}")` để kích hoạt quyền mới tức thì.

---

## 5. KIẾN TRÚC PHÂN QUYỀN & REDIS CACHING

### 5.1. Cơ chế Tính Quyền Hiệu Lực (Effective Permissions Calculator)

Mỗi khi một nhân viên gửi request lên hệ thống:

$$\text{Effective Permissions} = \text{Inherited Permissions (Role Group)} \cup \text{Custom Permissions (User)}$$

* **Đặc biệt với Quản trị viên (`role === 'ADMIN'`):** Mặc định sở hữu toàn bộ quyền `ALL_PERMISSIONS` mà không cần kiểm tra quyền con.

### 5.2. Cấu trúc Cache Redis

| Redis Key Pattern | Kiểu dữ liệu | TTL | Mục đích sử dụng |
|---|---|---|---|
| `auth:perms:user:${userId}` | String (JSON Array) | 15 phút | Cache danh sách `effectivePermissions` để giảm tải truy vấn MySQL khi Guard kiểm tra quyền |
| `auth:refresh:${userId}:${jti}` | String | 7 ngày | Quản lý Refresh Token JTI hỗ trợ Rotation và thu hồi phiên tức thì |
| `blacklist:token:${jti}` | String | Thời gian còn lại của token | Chặn đứng Access Token khi tài khoản bị khóa hoặc Logout |

---

## 6. LỘ TRÌNH THI CÔNG CHI TIẾT (IMPLEMENTATION CHECKLIST)

- [ ] **Bước 1 (Database):** Cập nhật `prisma/schema.prisma` với model `RoleGroup`, trường `roleGroupId` và `customPermissions` trên model `User`. Chạy `npx prisma db push` và cập nhật `prisma/seed.ts` để seed 4 nhóm quyền mặc định.
- [ ] **Bước 2 (DTOs & Types):** Định nghĩa toàn bộ DTOs với `class-validator` cho Role Groups và Staffs (`create-role-group.dto.ts`, `update-role-group.dto.ts`, `create-staff.dto.ts`, `update-staff-status.dto.ts`, `update-custom-permissions.dto.ts`).
- [ ] **Bước 3 (Role Groups Service & Controller):** Viết `RoleGroupsService` và `RoleGroupsController` với đầy đủ 6 endpoints quản lý nhóm quyền.
- [ ] **Bước 4 (Admin Staffs Service & Controller):** Viết `AdminStaffsService` và `AdminStaffsController` với đầy đủ 7 endpoints quản lý nhân viên, tích hợp thu hồi token Redis khi khóa tài khoản.
- [ ] **Bước 5 (Guards & Decorators):** Xây dựng Decorator `@RequirePermissions()` và Guard `PermissionsGuard` kiểm tra quyền thời gian thực từ Redis Cache.
- [ ] **Bước 6 (Tích hợp Frontend):** Đấu nối API từ `app/dash/my-app` vào Backend API thật, loại bỏ 100% Mock Data.
