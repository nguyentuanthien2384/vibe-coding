# BẢN THIẾT KẾ BACK-END: MODULE QUẢN LÝ KHÁCH HÀNG (ADMIN CUSTOMER MANAGEMENT)

> **Tài liệu tham chiếu:** `.docs/ideas/dashboard/04-customer-idea.md` & `.docs/frontend-plans/dashboard/04-customer-plan.md`  
> **Tech Stack:** NestJS, Prisma ORM, MySQL, Redis, TypeScript  
> **Ứng dụng mục tiêu:** Backend API Server (`apps/backend` / `app/backend`)  
> **Phiên bản:** 1.0.0  
> **Ngày tạo:** 2026-08-14  

---

## 1. TỔNG QUAN HỆ THỐNG & NGUYÊN TẮC THIẾT KẾ

Module Quản lý Khách hàng dán nhãn toàn bộ dữ liệu người dùng mua hàng thuộc 2 nhóm đối tượng:
1. **Khách hàng Đăng ký (`REGISTERED`):** Người dùng có tài khoản hệ thống (`User` table với `role = CUSTOMER`).
2. **Khách hàng Vãng lai (`GUEST`):** Người đặt hàng không thông qua tạo tài khoản (`Order` table với `userId IS NULL`, truy vấn tổng hợp theo `customerEmail` / `customerPhone`).

### Nguyên tắc Kỹ thuật Cốt lõi:
- **Phân quyền chặt chẽ:** Toàn bộ Admin Customer APIs bảo mật bằng `JwtAuthGuard` & `RolesGuard(Role.ADMIN, Role.STAFF)`.
- **Tốc độ truy vấn siêu nhanh:** Tối ưu hóa Database Indexing cho thao tác lọc/tìm kiếm, phân trang server-side (`page`, `limit`), áp dụng `useDebounce` (400ms) ở Frontend.
- **Bảo mật & An toàn tài khoản:** Khi chuyển trạng thái tài khoản sang `BLOCKED`, tự động thu hồi ngay lập tức toàn bộ Refresh Tokens trên Redis (`auth:refresh:${userId}:*`) và đưa JTI hiện tại vào Blacklist.
- **Không rò rỉ dữ liệu nhạy cảm:** Bị cấm trả về `password` hash hoặc thông tin bảo mật nội bộ trong bất kỳ API Response nào.

---

## 2. THIẾT KẾ DỮ LIỆU (DATABASE SCHEMA - PRISMA / MYSQL)

### 2.1. Bảng Người Dùng (`User`) & Sổ Địa Chỉ (`Address`)

Cấu trúc schema `User` và `Address` đã tồn tại trong `prisma/schema.prisma`. Bản thiết kế này bổ sung index và quy chuẩn ánh sáng dữ liệu cho Admin Customer Management.

```prisma
enum Role {
  ADMIN
  STAFF
  CUSTOMER
}

/// Bảng quản lý người dùng hệ thống
model User {
  id          Int       @id @default(autoincrement())
  email       String    @unique @db.VarChar(255)
  password    String    @db.VarChar(255)
  fullName    String    @db.VarChar(100)
  phone       String?   @db.VarChar(20)
  avatarUrl   String?   @db.VarChar(500)
  role        Role      @default(CUSTOMER)
  isActive    Boolean   @default(true)
  lastLoginAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  cart          Cart?
  orders        Order[]
  addresses     Address[]
  emailLogs     EmailLog[]
  notifications Notification[]

  @@index([email], name: "idx_user_email")
  @@index([role, isActive], name: "idx_user_role_active")
  @@index([role, isActive, createdAt(sort: Desc)], name: "idx_user_admin_customer_filter")
  @@index([fullName, email, phone], name: "idx_user_search")
  @@map("users")
}

/// Sổ địa chỉ giao hàng của người dùng
model Address {
  id            Int      @id @default(autoincrement())
  userId        Int
  recipientName String   @db.VarChar(100)
  phone         String   @db.VarChar(20)
  provinceCode  String   @db.VarChar(50)
  provinceName  String   @db.VarChar(100)
  districtCode  String   @db.VarChar(50)
  districtName  String   @db.VarChar(100)
  wardCode      String   @db.VarChar(50)
  wardName      String   @db.VarChar(100)
  detailAddress String   @db.VarChar(500)
  isDefault     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isDefault], name: "idx_address_user_default")
  @@map("addresses")
}
```

### 2.2. Ánh xá & Đơn hàng Khách Vãng lai (`Order`)

Tận dụng index sẵn có trên `Order` để truy vấn danh sách & chỉ số tài chính cho khách vãng lai:

```prisma
model Order {
  // ... các trường Order hiện có
  @@index([userId, createdAt(sort: Desc)], name: "idx_order_user_created")
  @@index([customerEmail, customerPhone], name: "idx_order_guest_contact")
}
```

---

## 3. GIAO KÈO API (API CONTRACTS)

Tất cả các endpoint đều có tiền tố: `/api/v1/admin/customers`.  
Yêu cầu Header: `Authorization: Bearer <accessToken>`.

---

### 3.1. API Lấy danh sách Khách hàng (`GET /api/v1/admin/customers`)

Hỗ trợ phân trang, tìm kiếm debounced (Tên, Email, SĐT), lọc theo Loại (`REGISTERED` / `GUEST`), Trạng thái (`ACTIVE` / `BLOCKED` / `INACTIVE`), và Sắp xếp.

- **Query Parameters (`CustomerQueryDto`):**
  - `query` (optional, string): Từ khóa tìm kiếm theo Họ tên, Email, SĐT.
  - `type` (optional, enum): `'ALL'` | `'REGISTERED'` | `'GUEST'` (mặc định `'ALL'`).
  - `status` (optional, enum): `'ALL'` | `'ACTIVE'` | `'BLOCKED'` | `'INACTIVE'` (mặc định `'ALL'`).
  - `sortBy` (optional, enum): `'createdAt_desc'` | `'createdAt_asc'` | `'totalSpent_desc'` | `'totalOrders_desc'` | `'name_asc'` (mặc định `'createdAt_desc'`).
  - `page` (optional, number): Số trang (mặc định `1`).
  - `limit` (optional, number): Số lượng bản ghi per page (mặc định `10`).

- **Response Payload (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách khách hàng thành công",
  "data": {
    "items": [
      {
        "id": "15",
        "fullName": "Nguyễn Văn An",
        "email": "an.nguyen@example.com",
        "phone": "0912345678",
        "avatarUrl": "https://api.techbite.vn/uploads/avatars/user-15.jpg",
        "type": "REGISTERED",
        "status": "ACTIVE",
        "totalOrders": 8,
        "totalSpent": 2450000.00,
        "createdAt": "2026-08-01T10:30:00.000Z",
        "lastOrderAt": "2026-08-12T14:20:00.000Z"
      },
      {
        "id": "guest:guest.buyer@gmail.com",
        "fullName": "Trần Thị Bình (Khách vãng lai)",
        "email": "guest.buyer@gmail.com",
        "phone": "0987654321",
        "avatarUrl": null,
        "type": "GUEST",
        "status": "ACTIVE",
        "totalOrders": 2,
        "totalSpent": 680000.00,
        "createdAt": "2026-08-05T08:15:00.000Z",
        "lastOrderAt": "2026-08-10T11:00:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 45,
      "totalPages": 5,
      "stats": {
        "totalCustomers": 45,
        "registeredCount": 30,
        "guestCount": 15
      }
    }
  }
}
```

---

### 3.2. API Xem Chi tiết Khách hàng (`GET /api/v1/admin/customers/:id`)

Trả về toàn bộ profile, chỉ số tài chính (Tổng chi tiêu, Số đơn, Giá trị đơn trung bình AOV), danh sách địa chỉ nhận hàng và thông tin bổ sung.

- **Path Parameter:**
  - `id`: ID số của User đăng ký (VD: `15`) HOẶC key tổng hợp của khách vãng lai (VD: `guest:email@domain.com`).

- **Response Payload (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy thông tin chi tiết khách hàng thành công",
  "data": {
    "id": "15",
    "fullName": "Nguyễn Văn An",
    "email": "an.nguyen@example.com",
    "phone": "0912345678",
    "avatarUrl": "https://api.techbite.vn/uploads/avatars/user-15.jpg",
    "type": "REGISTERED",
    "status": "ACTIVE",
    "totalOrders": 8,
    "totalSpent": 2450000.00,
    "averageOrderValue": 306250.00,
    "createdAt": "2026-08-01T10:30:00.000Z",
    "lastOrderAt": "2026-08-12T14:20:00.000Z",
    "addresses": [
      {
        "id": 4,
        "recipientName": "Nguyễn Văn An",
        "phone": "0912345678",
        "provinceCode": "79",
        "provinceName": "Thành phố Hồ Chí Minh",
        "districtCode": "760",
        "districtName": "Quận 1",
        "wardCode": "26740",
        "wardName": "Phường Bến Nghé",
        "detailAddress": "123 Lê Lợi, Tầng 5",
        "isDefault": true
      }
    ],
    "notes": "Khách hàng thân thiết, thường xuyên gọi hỏa tốc"
  }
}
```

---

### 3.3. API Tạo mới Khách hàng thủ công (`POST /api/v1/admin/customers`)

Cho phép Admin/Staff chủ động tạo tài khoản khách hàng mới.

- **Request Body (`CreateCustomerDto`):**
```json
{
  "fullName": "Lê Văn Cường",
  "email": "cuong.le@example.com",
  "phone": "0933112233",
  "password": "Password123!",
  "address": {
    "recipientName": "Lê Văn Cường",
    "phone": "0933112233",
    "provinceCode": "01",
    "provinceName": "Thành phố Hà Nội",
    "districtCode": "001",
    "districtName": "Quận Ba Đình",
    "wardCode": "00001",
    "wardName": "Phường Phúc Xá",
    "detailAddress": "Số 45 Hàng Than"
  }
}
```

- **Response Payload (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Tạo khách hàng mới thành công",
  "data": {
    "id": 18,
    "fullName": "Lê Văn Cường",
    "email": "cuong.le@example.com",
    "phone": "0933112233",
    "role": "CUSTOMER",
    "isActive": true,
    "createdAt": "2026-08-14T09:50:00.000Z"
  }
}
```

---

### 3.4. API Cập nhật Trạng thái Tài khoản (`PATCH /api/v1/admin/customers/:id/status`)

Thay đổi trạng thái tài khoản (`ACTIVE`, `BLOCKED`, `INACTIVE`). Khi chuyển sang `BLOCKED`, kích hoạt ngay cơ chế thu hồi token toàn bộ phiên đăng nhập của User trên Redis.

- **Request Body (`UpdateCustomerStatusDto`):**
```json
{
  "status": "BLOCKED",
  "reason": "Vi phạm chính sách thanh toán nhiều lần"
}
```

- **Response Payload (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Cập nhật trạng thái tài khoản khách hàng thành công",
  "data": {
    "id": 15,
    "status": "BLOCKED",
    "isActive": false,
    "updatedAt": "2026-08-14T09:52:00.000Z"
  }
}
```

---

### 3.5. API Cập nhật Thông tin Khách hàng (`PATCH /api/v1/admin/customers/:id`)

Cho phép chỉnh sửa thông tin cá nhân cơ bản (`fullName`, `phone`, `email`).

- **Request Body (`UpdateCustomerDto`):**
```json
{
  "fullName": "Nguyễn Văn An (Đã cập nhật)",
  "phone": "0912999888"
}
```

- **Response Payload (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Cập nhật thông tin khách hàng thành công",
  "data": {
    "id": 15,
    "fullName": "Nguyễn Văn An (Đã cập nhật)",
    "email": "an.nguyen@example.com",
    "phone": "0912999888",
    "updatedAt": "2026-08-14T09:55:00.000Z"
  }
}
```

---

### 3.6. API Lấy Lịch sử Đơn hàng của Khách (`GET /api/v1/admin/customers/:id/orders`)

Trả về danh sách đơn hàng đã mua của khách hàng cụ thể (hỗ trợ tìm kiếm theo `orderCode` và lọc theo `orderStatus`).

- **Query Parameters (`CustomerOrderQueryDto`):**
  - `search` (optional, string): Mã đơn hàng.
  - `status` (optional, enum): Status đơn hàng.
  - `page` (optional, number): Số trang.
  - `limit` (optional, number): Số bản ghi per page (mặc định `5` hoặc `10`).

- **Response Payload (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy lịch sử đơn hàng thành công",
  "data": {
    "items": [
      {
        "id": 102,
        "orderCode": "TB-20260812-9901",
        "createdAt": "2026-08-12T14:20:00.000Z",
        "totalAmount": 450000.00,
        "itemsCount": 3,
        "paymentStatus": "PAID",
        "orderStatus": "DELIVERED"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 5,
      "totalItems": 8,
      "totalPages": 2
    }
  }
}
```

---

### 3.7. API Thêm Địa chỉ Mới cho Khách (`POST /api/v1/admin/customers/:id/addresses`)

Cho phép Admin/Staff thêm địa chỉ giao hàng cho khách hàng trong trang Chi tiết.

- **Request Body (`AddCustomerAddressDto`):**
```json
{
  "recipientName": "Nguyễn Văn An",
  "phone": "0912345678",
  "provinceCode": "79",
  "provinceName": "Thành phố Hồ Chí Minh",
  "districtCode": "769",
  "districtName": "Thành phố Thủ Đức",
  "wardCode": "26830",
  "wardName": "Phường Thảo Điền",
  "detailAddress": "88 Xuân Thủy",
  "isDefault": false
}
```

- **Response Payload (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Thêm địa chỉ giao hàng thành công",
  "data": {
    "id": 8,
    "userId": 15,
    "recipientName": "Nguyễn Văn An",
    "phone": "0912345678",
    "provinceName": "Thành phố Hồ Chí Minh",
    "districtName": "Thành phố Thủ Đức",
    "wardName": "Phường Thảo Điền",
    "detailAddress": "88 Xuân Thủy",
    "isDefault": false
  }
}
```

---

## 4. QUY TRÌNH XỬ LÝ NGHIỆP VỤ & BẢO MẬT (BUSINESS LOGIC & SECURITY)

### 4.1. Mã hóa Mật khẩu & Tạo Tài khoản Thủ công
- Sử dụng `bcrypt` với `saltRound = 12` để mã hóa mật khẩu khi Admin tạo tài khoản thủ công qua API `POST /api/v1/admin/customers`.
- Kiểm tra trùng lặp `email` trên bảng `User`. Nếu email đã tồn tại ➔ Ném lỗi `ConflictException('Email đã tồn tại trong hệ thống')`.

### 4.2. Cơ chế Thu hồi Phiên tức thì khi Khóa Tài khoản (`BLOCKED`)
- Khi chuyển trạng thái khách hàng sang `BLOCKED` (hoặc `isActive = false`):
  1. Cập nhật `isActive = false` trong database MySQL.
  2. Thực hiện xóa toàn bộ keys Refresh Token của User trong Redis: `redis.del(auth:refresh:${userId}:*)`.
  3. Ghi lại timestamp `auth:user_blocked:${userId}` trên Redis với TTL 15 phút.
  4. Middleware `JwtStrategy` kiểm tra nếu User thuộc danh sách bị Block ➔ Trả về `401 Unauthorized` ngay lập tức trên mọi request tiếp theo từ tất cả thiết bị của khách hàng đó.

### 4.3. Tổng hợp Dữ liệu Khách Vãng lai (`GUEST Aggregation`)
- Khách vãng lai không có record trong bảng `User`. Hệ thống gom nhóm dynamic từ bảng `Order` dựa trên cờ `userId IS NULL` và ghép theo `customerEmail` / `customerPhone`.
- Chỉ số `totalOrders` = `COUNT(id)`, `totalSpent` = `SUM(totalAmount)` từ các đơn hàng có status khác `CANCELLED`.

---

## 5. CACHING & TOÀN VẸN DỮ LIỆU (REDIS CACHING)

- **Danh sách & Thống kê:** Cache Redis key `cache:v1:admin:customers:stats` với TTL 5 phút lưu trữ tổng số lượng khách hàng (`totalCustomers`, `registeredCount`, `guestCount`).
- **Xóa Cache (Cache Invalidation):** Tự động xóa key `cache:v1:admin:customers:stats` khi:
  - Có người dùng mới đăng ký tài khoản thành công (`POST /api/v1/auth/register`).
  - Admin tạo mới khách hàng thủ công (`POST /api/v1/admin/customers`).
  - Khách vãng lai đặt đơn thành công (`POST /api/v1/orders`).

---

## 6. BẢNG TỔNG HỢP DTO & VALIDATION RULES

| DTO Name | Target Endpoint | Fields & Validation Rules |
|---|---|---|
| `CustomerQueryDto` | `GET /customers` | `query?: string`, `type?: 'ALL'\|'REGISTERED'\|'GUEST'`, `status?: 'ALL'\|'ACTIVE'\|'BLOCKED'\|'INACTIVE'`, `sortBy?: string`, `page?: number (min 1)`, `limit?: number (min 1, max 100)` |
| `CreateCustomerDto` | `POST /customers` | `fullName: IsNotEmpty()`, `email: IsEmail()`, `phone: IsMobilePhone('vi-VN')`, `password?: MinLength(6)`, `address?: AddressObject` |
| `UpdateCustomerStatusDto` | `PATCH /customers/:id/status` | `status: IsEnum(['ACTIVE', 'BLOCKED', 'INACTIVE'])`, `reason?: string` |
| `UpdateCustomerDto` | `PATCH /customers/:id` | `fullName?: IsString()`, `phone?: IsMobilePhone('vi-VN')` |
| `CustomerOrderQueryDto` | `GET /customers/:id/orders` | `search?: string`, `status?: OrderStatus`, `page?: number`, `limit?: number` |
| `AddCustomerAddressDto` | `POST /customers/:id/addresses` | `recipientName: IsNotEmpty()`, `phone: IsNotEmpty()`, `provinceCode: IsNotEmpty()`, `provinceName: IsNotEmpty()`, `districtCode: IsNotEmpty()`, `districtName: IsNotEmpty()`, `wardCode: IsNotEmpty()`, `wardName: IsNotEmpty()`, `detailAddress: IsNotEmpty()`, `isDefault?: IsBoolean()` |

---

## 7. BÁO CÁO HOÀN THÀNH

✅ Đã hoàn tất bản quy hoạch Back-end tại file `.docs/backend-plans/dashboard/04-customer-plan.md`. Sẵn sàng cho Antigravity thi công API.
