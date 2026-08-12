# BẢN THIẾT KẾ BACK-END: MODULE QUẢN LÝ ĐƠN HÀNG (ADMIN ORDER MANAGEMENT)

> **Tài liệu tham chiếu:** `.docs/ideas/dashboard/03-order-idea.md` & `.docs/frontend-plans/dashboard/03-order-plan.md`  
> **Tech Stack:** NestJS, Prisma ORM, MySQL, Redis, BullMQ (Async Queue), TypeScript  
> **Ứng dụng mục tiêu:** Backend API Server (`apps/backend` / `app/backend`)  
> **Phiên bản:** 1.0.0  
> **Ngày tạo:** 2026-08-12  

---

## 1. Thiết kế Dữ liệu (Database Schema - Prisma / MySQL)

### 1.1. Bảng Dữ liệu Đơn hàng (`Order` & `OrderItem`)
Phần lớn schema của Order đã có sẵn trong `prisma/schema.prisma`. Bản thiết kế này chuẩn hóa và bổ sung các index tối ưu riêng cho Admin Dashboard.

```prisma
enum OrderStatus {
  PENDING      // Chờ xác nhận
  CONFIRMED    // Đã xác nhận
  PROCESSING   // Đang xử lý món / đóng gói
  SHIPPING     // Đang giao hàng
  DELIVERED    // Đã giao hàng thành công
  CANCELLED    // Đã hủy đơn
}

enum PaymentStatus {
  PENDING      // Chưa thanh toán (UNPAID)
  PAID         // Đã thanh toán
  FAILED       // Thanh toán thất bại
  EXPIRED      // Hết hạn thanh toán
}

enum PaymentMethod {
  COD          // Thanh toán khi nhận hàng
  QR_CODE      // Chuyển khoản VietQR
}

enum ShippingMethod {
  STANDARD     // Giao hàng tiêu chuẩn
  EXPRESS      // Giao hàng hỏa tốc
}

/// Bảng lưu Đơn hàng (Immutable Snapshot)
model Order {
  id             Int            @id @default(autoincrement())
  orderCode      String         @unique @db.VarChar(50)
  userId         Int?
  sessionId      String?        @db.VarChar(255)
  customerName   String         @db.VarChar(100)
  customerEmail  String         @db.VarChar(255)
  customerPhone  String         @db.VarChar(20)
  provinceName   String         @db.VarChar(100)
  districtName   String         @db.VarChar(100)
  wardName       String         @db.VarChar(100)
  detailAddress  String         @db.VarChar(500)
  shippingMethod ShippingMethod @default(STANDARD)
  shippingFee    Decimal        @db.Decimal(10, 2)
  subtotal       Decimal        @db.Decimal(10, 2)
  discountAmount Decimal        @default(0) @db.Decimal(10, 2)
  totalAmount    Decimal        @db.Decimal(10, 2)
  voucherCode    String?        @db.VarChar(50)
  orderNote      String?        @db.VarChar(500)
  cancelReason   String?        @db.VarChar(500)
  paymentMethod  PaymentMethod  @default(QR_CODE)
  paymentStatus  PaymentStatus  @default(PENDING)
  orderStatus    OrderStatus    @default(PENDING)
  paidAt         DateTime?
  completedAt    DateTime?
  cancelledAt    DateTime?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  user       User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  orderItems OrderItem[]

  @@index([orderCode], name: "idx_order_code")
  @@index([userId, createdAt(sort: Desc)], name: "idx_order_user_created")
  @@index([sessionId], name: "idx_order_session")
  @@index([paymentStatus, orderStatus], name: "idx_order_status")
  @@index([orderStatus, paymentStatus, createdAt(sort: Desc)], name: "idx_order_admin_filter")
  @@index([customerPhone], name: "idx_order_customer_phone")
  @@index([customerEmail], name: "idx_order_customer_email")
  @@map("orders")
}

/// Bảng lưu Chi tiết từng sản phẩm trong Đơn hàng
model OrderItem {
  id              Int      @id @default(autoincrement())
  orderId         Int
  productId       Int
  productName     String   @db.VarChar(255)
  productImageUrl String   @db.VarChar(500)
  price           Decimal  @db.Decimal(10, 2)
  originalPrice   Decimal? @db.Decimal(10, 2)
  quantity        Int
  itemTotal       Decimal  @db.Decimal(10, 2)
  createdAt       DateTime @default(now())

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Restrict)

  @@index([orderId], name: "idx_order_items_order")
  @@index([productId], name: "idx_order_items_product")
  @@map("order_items")
}
```

### 1.2. Constraints & Indexing (Ràng buộc & Tối ưu truy vấn)
1. **Unique Constraint:** `orderCode` duy nhất toàn hệ thống (VD: `ORD-1723456789-8812`).
2. **Indexing cho Admin Dashboard:**
   - `idx_order_admin_filter`: Phân trang, lọc theo `orderStatus`, `paymentStatus` kết hợp sắp xếp `createdAt DESC`.
   - `idx_order_customer_phone` & `idx_order_customer_email`: Tra cứu siêu tốc khi tìm kiếm đơn hàng theo SĐT / Email khách.
   - `idx_order_code`: Đảm bảo tốc độ tra cứu khi Admin gõ mã đơn hàng.
3. **Data Integrity & Immutability:**
   - Giá sản phẩm (`price`), tên sản phẩm (`productName`), hình ảnh (`productImageUrl`) trong `OrderItem` là **snapshot bất biến** lưu cứng tại thời điểm đặt hàng.
   - Khi xóa sản phẩm khỏi hệ thống (`Product`), `onDelete: Restrict` trên `OrderItem` ngăn chặn việc xóa sản phẩm đã tồn tại trong bất kỳ Đơn hàng nào.

---

## 2. Giao kèo API (API Contract)

### 2.1. API Lấy Danh sách Đơn hàng (Admin Dashboard)
- **Method & Route:** `GET /api/v1/admin/orders`
- **Auth & Authorization:** Require JWT Access Token (`JwtAuthGuard`) + Roles (`ADMIN`, `STAFF`).
- **Query Params (`GetAdminOrdersDto`):**
  - `search` (optional): `string` - Tìm kiếm theo mã đơn (`orderCode`), tên khách (`customerName`), email (`customerEmail`), hoặc SĐT (`customerPhone`). Đã bọc `useDebounce(400ms)` ở Client.
  - `orderStatus` (optional): `OrderStatus | 'ALL'` - Lọc theo trạng thái đơn hàng.
  - `paymentStatus` (optional): `PaymentStatus | 'ALL'` - Lọc theo trạng thái thanh toán (`PENDING`, `PAID`, `FAILED`, `EXPIRED`).
  - `paymentMethod` (optional): `PaymentMethod | 'ALL'` - Lọc theo phương thức thanh toán (`COD`, `QR_CODE`).
  - `startDate` (optional): `string` (ISO Date string `YYYY-MM-DD`) - Lọc từ ngày khởi tạo.
  - `endDate` (optional): `string` (ISO Date string `YYYY-MM-DD`) - Lọc đến ngày khởi tạo.
  - `page` (optional): `number` (Default: `1`, Min: `1`).
  - `limit` (optional): `number` (Default: `10`, Max: `100`).
  - `sortBy` (optional): `'createdAt'` | `'totalAmount'` | `'orderCode'` (Default: `'createdAt'`).
  - `sortOrder` (optional): `'asc'` | `'desc'` (Default: `'desc'`).

- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách đơn hàng thành công",
  "data": [
    {
      "id": 15,
      "orderCode": "ORD-1723456789-8812",
      "customerName": "Nguyen Van A",
      "customerEmail": "nguyenvana@gmail.com",
      "customerPhone": "0987654321",
      "totalAmount": 450000,
      "itemCount": 3,
      "orderStatus": "PENDING",
      "paymentStatus": "PENDING",
      "paymentMethod": "QR_CODE",
      "createdAt": "2026-08-12T10:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  },
  "summaryStats": {
    "totalOrders": 45,
    "pendingCount": 12,
    "confirmedCount": 15,
    "processingCount": 8,
    "shippingCount": 5,
    "deliveredCount": 3,
    "cancelledCount": 2,
    "unpaidCount": 14,
    "paidCount": 31
  }
}
```

---

### 2.2. API Xem Chi tiết Đơn hàng
- **Method & Route:** `GET /api/v1/admin/orders/:id`
- **Auth & Authorization:** Require JWT Access Token (`JwtAuthGuard`) + Roles (`ADMIN`, `STAFF`).
- **Path Params:** `id` (`number` - ID đơn hàng hoặc `orderCode`).
- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy chi tiết đơn hàng thành công",
  "data": {
    "id": 15,
    "orderCode": "ORD-1723456789-8812",
    "customer": {
      "id": 8,
      "name": "Nguyen Van A",
      "email": "nguyenvana@gmail.com",
      "phone": "0987654321"
    },
    "shippingAddress": {
      "recipientName": "Nguyen Van A",
      "phone": "0987654321",
      "provinceName": "Thành phố Hồ Chí Minh",
      "districtName": "Quận 1",
      "wardName": "Phường Bến Nghé",
      "detailAddress": "123 Đường Lê Lợi",
      "note": "Giao giờ hành chính"
    },
    "items": [
      {
        "id": 42,
        "productId": 5,
        "productName": "Cà Phê Muối Trứng Nướng Premium",
        "productImageUrl": "/uploads/images/caphe-muoi.jpg",
        "price": 45000,
        "originalPrice": 50000,
        "quantity": 2,
        "itemTotal": 90000
      }
    ],
    "summary": {
      "subtotal": 90000,
      "shippingFee": 15000,
      "discountAmount": 10000,
      "voucherCode": "WELCOME10",
      "totalAmount": 95000
    },
    "paymentMethod": "QR_CODE",
    "paymentStatus": "PAID",
    "orderStatus": "SHIPPING",
    "paidAt": "2026-08-12T10:18:22.000Z",
    "completedAt": null,
    "cancelledAt": null,
    "cancelReason": null,
    "createdAt": "2026-08-12T10:15:00.000Z",
    "updatedAt": "2026-08-12T10:20:00.000Z"
  }
}
```
- **Response Error (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy đơn hàng với ID hoặc mã code đã cung cấp",
  "error": "Not Found"
}
```

---

### 2.3. API Cập nhật Trạng thái Đơn hàng & Thanh toán
- **Method & Route:** `PATCH /api/v1/admin/orders/:id/status`
- **Auth & Authorization:** Require JWT Access Token (`JwtAuthGuard`) + Roles (`ADMIN`, `STAFF`).
- **Path Params:** `id` (`number`).
- **Request Payload (`UpdateOrderStatusDto`):**
```typescript
export class UpdateOrderStatusDto {
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Trạng thái đơn hàng không hợp lệ' })
  orderStatus?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'Trạng thái thanh toán không hợp lệ' })
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancelReason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNote?: string;
}
```
- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Cập nhật trạng thái đơn hàng thành công",
  "data": {
    "id": 15,
    "orderCode": "ORD-1723456789-8812",
    "orderStatus": "CONFIRMED",
    "paymentStatus": "PAID",
    "paidAt": "2026-08-12T10:25:00.000Z",
    "completedAt": null,
    "cancelledAt": null,
    "updatedAt": "2026-08-12T10:25:00.000Z"
  }
}
```
- **Response Error (400 Bad Request - Trạng thái chuyển đổi không hợp lệ):**
```json
{
  "statusCode": 400,
  "message": "Không thể chuyển trạng thái đơn hàng từ DELIVERED sang PENDING",
  "error": "Bad Request"
}
```

---

## 3. Quy tắc Chuyển đổi Trạng thái (State Machine Matrix)

### 3.1. Ma trận Trạng thái Đơn hàng (`OrderStatus`)

| Trạng thái hiện tại | Trạng thái cho phép chuyển sang | Điều kiện & Logic xử lý đính kèm |
|---|---|---|
| `PENDING` | `CONFIRMED`, `CANCELLED` | Kiểm tra tồn kho, gửi mail xác nhận đơn / mail hủy đơn |
| `CONFIRMED` | `PROCESSING`, `CANCELLED` | Đưa vào danh sách chuẩn bị món / đóng gói |
| `PROCESSING` | `SHIPPING`, `CANCELLED` | Bàn giao cho đơn vị vận chuyển |
| `SHIPPING` | `DELIVERED`, `CANCELLED` | Nếu `DELIVERED`: tự động set `completedAt = now()`. Nếu thanh toán COD, tự động set `paymentStatus = PAID` và `paidAt = now()` |
| `DELIVERED` | *(Trạng thái cuối)* | **CẤM** đổi sang trạng thái khác ngoại trừ quy trình Hoàn tiền (`REFUNDED` nếu nâng cấp sau) |
| `CANCELLED` | *(Trạng thái cuối)* | **CẤM** đổi sang trạng thái khác. Tự động hoàn trả `stock` sản phẩm trong DB |

### 3.2. Logic Hoàn trả Tồn kho khi Hủy Đơn hàng (`CANCELLED`)
- Khi `orderStatus` được cập nhật thành `CANCELLED`:
  - Thực hiện trong một **Prisma Transaction (`prisma.$transaction`)**:
    1. Cập nhật `orderStatus = CANCELLED`, `cancelledAt = new Date()`, lưu `cancelReason`.
    2. Duyệt qua danh sách `orderItems` của đơn hàng và cộng trả số lượng `quantity` vào trường `stock` của từng `Product`.
    3. Xóa cache Redis chi tiết sản phẩm và danh sách sản phẩm public.
    4. Đẩy event gửi email `ORDER_CANCELLED` vào BullMQ queue.

---

## 4. Xử lý Bất đồng bộ & Caching (Architecture & Background Jobs)

### 4.1. Chiến lược Caching (Redis Strategy)
- **Danh sách & Chi tiết Đơn hàng Admin (`/admin/orders`):**
  - Không cache danh sách đơn hàng Admin dạng tĩnh để đảm bảo dữ liệu mới nhất thời gian thực.
- **Invalidation Cache User Public:**
  - Khi Admin cập nhật trạng thái đơn hàng, tiến hành xóa ngay các cache liên quan của User:
    - `redis.del("cache:v1:orders:user:${userId}:*")`
    - `redis.del("cache:v1:orders:detail:${orderCode}")`

### 4.2. Xử lý Hàng đợi Gửi Email Thông báo (BullMQ / Async Queue)
- Mỗi khi `orderStatus` thay đổi, Controller/Service tạo một Job vào `EmailQueue`:
  - **`ORDER_CONFIRMED`**: Gửi email thông báo đơn hàng đã được xác nhận.
  - **`ORDER_SHIPPING`**: Gửi email thông báo đơn hàng đang trên đường giao kèm thông tin người nhận.
  - **`ORDER_DELIVERED`**: Gửi email cảm ơn và xác nhận hoàn tất giao hàng.
  - **`ORDER_CANCELLED`**: Gửi email thông báo hủy đơn và lý do hủy.

```typescript
// Ví dụ cấu trúc Payload Job trong EmailQueue
interface OrderStatusEmailJobPayload {
  orderId: number;
  orderCode: string;
  customerEmail: string;
  customerName: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  cancelReason?: string;
}
```

---

## 5. Báo cáo Tiến độ & Sẵn sàng Thi công

✅ **Đã hoàn tất bản quy hoạch Back-end tại file `.docs/backend-plans/dashboard/03-order-plan.md`. Sẵn sàng cho Antigravity thi công API.**
