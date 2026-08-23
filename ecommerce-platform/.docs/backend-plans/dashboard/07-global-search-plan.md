# BẢN THIẾT KẾ BACK-END: MODULE GLOBAL SEARCH (TÌM KIẾM TOÀN CỤC ĐA THỰC THỂ)

> **Phân hệ:** Admin Dashboard & Command Palette  
> **Tech Stack:** NestJS, Prisma ORM, MySQL, Redis Caching, NestJS Throttler, RBAC Guard  
> **Vị trí file:** `.docs/backend-plans/dashboard/07-global-search-plan.md`  

---

## 1. Thiết kế Dữ liệu & Chỉ mục (Database Schema & Indexing)

Module Global Search thực hiện tìm kiếm đa thực thể trên các bảng cốt lõi của hệ thống Ecommerce bao gồm: `Order`, `Product`, `User` (Khách hàng & Nhân sự), `Category`.

### 1.1. Bảng `Order` (Đơn hàng)

```prisma
model Order {
  id               Int           @id @default(autoincrement())
  orderCode        String        @unique @db.VarChar(50)
  userId           Int?
  customerName     String        @db.VarChar(100)
  customerPhone    String        @db.VarChar(20)
  customerEmail    String?       @db.VarChar(100)
  totalAmount      Decimal       @db.Decimal(12, 2)
  orderStatus      OrderStatus   @default(PENDING)
  paymentStatus    PaymentStatus @default(PENDING)
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  // Quan hệ
  user             User?         @relation(fields: [userId], references: [id])
  orderItems       OrderItem[]

  // Chỉ mục phục vụ tìm kiếm nhanh theo mã đơn, SĐT, Email, Tên khách
  @@index([orderCode], name: "idx_order_order_code")
  @@index([customerPhone], name: "idx_order_customer_phone")
  @@index([customerEmail], name: "idx_order_customer_email")
  @@index([customerName], name: "idx_order_customer_name")
}
```

### 1.2. Bảng `Product` (Sản phẩm)

```prisma
model Product {
  id               Int           @id @default(autoincrement())
  name             String        @db.VarChar(255)
  slug             String        @unique @db.VarChar(255)
  price            Decimal       @db.Decimal(12, 2)
  salePrice        Decimal?      @db.Decimal(12, 2)
  stock            Int           @default(0)
  imageUrl         String?       @db.VarChar(500)
  categoryId       Int
  isActive         Boolean       @default(true)
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  category         Category      @relation(fields: [categoryId], references: [id])

  // Chỉ mục tối ưu tìm kiếm theo tên và trạng thái
  @@index([name], name: "idx_product_name")
  @@index([isActive, name], name: "idx_product_active_name")
}
```

### 1.3. Bảng `User` (Khách hàng & Nhân sự)

```prisma
model User {
  id               Int           @id @default(autoincrement())
  email            String        @unique @db.VarChar(100)
  phone            String?       @db.VarChar(20)
  password         String        @db.VarChar(255)
  fullName         String        @db.VarChar(100)
  role             Role          @default(CUSTOMER)
  avatarUrl        String?       @db.VarChar(500)
  isActive         Boolean       @default(true)
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  orders           Order[]

  // Chỉ mục tối ưu tìm kiếm theo email, số điện thoại và họ tên
  @@index([email], name: "idx_user_email")
  @@index([phone], name: "idx_user_phone")
  @@index([role, fullName], name: "idx_user_role_fullname")
}
```

### 1.4. Bảng `Category` (Chuyên mục)

```prisma
model Category {
  id               Int           @id @default(autoincrement())
  name             String        @db.VarChar(100)
  slug             String        @unique @db.VarChar(100)
  iconUrl          String?       @db.VarChar(500)
  parentId         Int?
  isActive         Boolean       @default(true)
  createdAt        DateTime      @default(now())

  products         Product[]

  @@index([name], name: "idx_category_name")
}
```

---

## 2. Giao kèo API (API Contract)

### 2.1. API Tìm kiếm toàn cục đa thực thể (Global Search)

- **Method & Route:** `GET /api/v1/admin/dashboard/search/global`
- **Bảo mật & Phân quyền:**
  - `JwtAuthGuard`: Bắt buộc Access Token JWT hợp lệ.
  - `RolesGuard(Role.ADMIN, Role.STAFF)`: Chỉ cho phép tài khoản Quản trị viên và Nhân viên truy cập.
- **Rate Limit:** `@Throttle({ default: { limit: 120, ttl: 60000 } })` (Tối đa 120 requests/phút).

#### Request Query Parameters (`GlobalSearchQueryDto`):

| Tham số | Kiểu | Bắt buộc | Mặc định | Ràng buộc & Validation |
| :--- | :--- | :--- | :--- | :--- |
| `q` | `string` | **Có** | N/A | `@IsString()`, `@MinLength(1)`, `@Transform(trim)` |
| `limit` | `number` | Không | `5` | `@IsOptional()`, `@IsInt()`, `@Min(1)`, `@Max(50)` |

#### Response Success (200 OK):

```json
{
  "statusCode": 200,
  "data": {
    "orders": [
      {
        "id": 101,
        "title": "#ORD-2026-8891",
        "subtitle": "Nguyễn Văn An - 1.450.000 đ",
        "badge": "DELIVERED",
        "badgeType": "success",
        "url": "/orders/101",
        "type": "order"
      }
    ],
    "products": [
      {
        "id": 105,
        "title": "Bánh Mochi Kem Trà Xanh Matcha",
        "subtitle": "28.000 đ - Kho: 24",
        "badge": "Đang bán",
        "badgeType": "success",
        "imageUrl": "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
        "url": "/products/105/edit",
        "type": "product"
      }
    ],
    "customers": [
      {
        "id": 201,
        "title": "Nguyễn Văn An",
        "subtitle": "an.nguyen@gmail.com • 0912345678",
        "badge": "Hoạt động",
        "badgeType": "success",
        "imageUrl": "https://i.pravatar.cc/150?u=cust201",
        "url": "/customers/201",
        "type": "customer"
      }
    ],
    "categories": [
      {
        "id": 41,
        "title": "Đồ Ăn Vặt",
        "subtitle": "Slug: /do-an-vat",
        "imageUrl": "/uploads/images/snack.png",
        "url": "/categories?search=%C4%90%E1%BB%93%20%C4%82n%20V%E1%BA%B7t",
        "type": "category"
      }
    ],
    "staffs": [
      {
        "id": 2,
        "title": "System Administrator",
        "subtitle": "admin@techbite.com • 0900000001",
        "badge": "ADMIN",
        "badgeType": "info",
        "url": "/staffs/2",
        "type": "staff"
      }
    ],
    "actions": [
      {
        "id": "action-products",
        "title": "Quản lý Sản phẩm",
        "subtitle": "Danh sách và thông tin sản phẩm",
        "url": "/products",
        "type": "action",
        "badge": "Sản phẩm",
        "badgeType": "neutral"
      }
    ],
    "totalResults": 6
  }
}
```

#### Response Error (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": ["Từ khóa tìm kiếm không được để trống"],
  "error": "Bad Request"
}
```

#### Response Error (401 Unauthorized):
```json
{
  "statusCode": 401,
  "message": "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
  "error": "Unauthorized"
}
```

---

## 3. Kiến trúc Xử lý, Tối ưu & Caching (Architecture & Optimization)

### 3.1. Chiến lược Truy vấn Song song (Parallel Query Execution)
Để đảm bảo độ trễ phản hồi (Response Latency) < 80ms:
- Không thực hiện truy vấn tuần tự nối tiếp nhau (Sequential Await).
- Sử dụng `Promise.all()` phân tán đồng thời 5 câu lệnh truy vấn xuống MySQL:
  1. `prisma.order.findMany(...)`
  2. `prisma.product.findMany(...)`
  3. `prisma.user.findMany({ where: { role: Role.CUSTOMER } })`
  4. `prisma.category.findMany(...)`
  5. `prisma.user.findMany({ where: { role: { in: [Role.ADMIN, Role.STAFF] } } })`
- Mỗi truy vấn áp dụng giới hạn `take: limit` và chỉ định trường cụ thể qua `select`, loại bỏ tuyệt đối các trường nhạy cảm (`password`, `refreshTokenJti`).

### 3.2. Chiến lược Caching trên Redis
- **Khóa Cache:** `cache:v1:admin:search:${md5(normalizedQuery)}:${limit}`
- **Thời gian tồn tại (TTL):** 30 giây (Ngắn vì dữ liệu Admin biến động theo CRUD thời gian thực).
- **Cơ chế Cache Invalidation:** Khi có sự kiện Tạo/Sửa/Xóa đơn hàng, sản phẩm hoặc khách hàng, xóa các pattern key `cache:v1:admin:search:*` liên quan.

### 3.3. Xử lý Điều hướng & Deep Linking Chuẩn Xác
Đảm bảo mọi thực thể trả về từ Backend đều có `url` dẫn thẳng tới màn hình chi tiết hoặc màn hình chỉnh sửa tương ứng:
- **Đơn hàng:** `/orders/:id`
- **Sản phẩm:** `/products/:id/edit`
- **Khách hàng:** `/customers/:id`
- **Nhân sự:** `/staffs/:id`
- **Danh mục:** `/categories?search=:name`
- **Tác vụ nhanh:** `/dashboard`, `/products`, `/orders`, `/customers`, `/staffs`, `/settings`
