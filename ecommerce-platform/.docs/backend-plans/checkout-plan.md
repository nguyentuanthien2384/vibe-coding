# BẢN QUY HOẠCH KIẾN TRÚC BACK-END: MODULE THANH TOÁN (CHECKOUT MODULE)

> **Nguồn Ý Tưởng:** `.docs/ideas/07-checkout.md`  
> **Tài Liệu Tham Chiếu:** `.docs/ARCHITECTURE.md`, `.docs/STYLEGUIDE.md`, `.agent/AGENTS.md`, `.docs/FEATURES_DONE.md`  
> **Tài Liệu Frontend:** `.docs/frontend-plans/07-checkout-plan.md`  
> **Tech Stack:** NestJS, Prisma ORM, MySQL, Redis, JWT (HttpOnly Cookies)  
> **Phiên bản:** 1.0.0  
> **Ngày tạo:** 2026-08-09  

---

## 1. TỔNG QUAN HỆ THỐNG & NGUYÊN TẮC BẢO MẬT (CORE PRINCIPLES)

1. **Bảo mật Giá cả (Price Integrity):**
   - Backend **TUYỆT ĐỐI KHÔNG** tin tưởng vào bất kỳ thông tin giá tiền hoặc tổng tiền nào do Frontend gửi lên.
   - Frontend chỉ gửi `shippingAddress`, `shippingMethod`, `paymentMethod`, `voucherCode`, `orderNote` và thông tin nhận diện giỏ hàng (`userId` từ JWT Token hoặc `sessionId` vãng lai).
   - Backend tự động đọc dữ liệu giỏ hàng trong DB MySQL (`carts` & `cart_items`), tra cứu giá bán hiện tại trong DB (`products.salePrice ?? products.price`), tính lại Phí vận chuyển, Giảm giá voucher và Tổng tiền thanh toán.

2. **Quản lý Tồn kho Bất đồng bộ & Giao dịch Nguyên tử (Atomic Transactions & Inventory):**
   - Đặt hàng thực thi trong 1 DB Transaction nguyên tử (`prisma.$transaction`).
   - Kiểm tra tồn kho khả dụng (`stock >= quantity`). Nếu 1 sản phẩm hết hàng hoặc không đủ số lượng, Rollback toàn bộ giao dịch và trả về lỗi HTTP 400 Bad Request.
   - Trừ `stock` ngay khi đơn hàng khởi tạo thành công.

3. **Cơ chế Xác thực Thanh toán VietQR & Webhook (Idempotent Webhook):**
   - Khi chọn `QR_CODE`, Order được tạo ở trạng thái `paymentStatus: 'PENDING'`. Backend tự động tạo mã giao dịch duy nhất (VD: `TB-892401`) và sinh URL VietQR.
   - Ngân hàng/Cổng thanh toán gửi Webhook tới `POST /api/v1/orders/webhook/payment`. Backend sử dụng Redis (`webhook:processed:${txId}`) kiểm tra tính trùng lặp (Idempotency), cập nhật trạng thái đơn thành `PAID` và `orderStatus: 'CONFIRMED'`.

---

## 2. TRỤ CỘT 1: THIẾT KẾ DỮ LIỆU (DATABASE SCHEMA)

### 2.1 Enum Định Nghĩa Trạng Thái

```prisma
enum ShippingMethod {
  STANDARD
  EXPRESS
}

enum PaymentMethod {
  COD
  QR_CODE
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  EXPIRED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPING
  DELIVERED
  CANCELLED
}

enum VoucherDiscountType {
  FIXED_AMOUNT
  PERCENTAGE
}
```

---

### 2.2 Chi Tiết Các Bảng Dữ Liệu (Prisma Models)

```prisma
// =============================================================================
// MODULE: CHECKOUT & ORDERS
// Source: .docs/backend-plans/checkout-plan.md
// =============================================================================

/// Bảng lưu Đơn hàng ( immutable snapshot)
model Order {
  id              Int            @id @default(autoincrement())
  orderCode       String         @unique @db.VarChar(50)
  userId          Int?
  sessionId       String?        @db.VarChar(255)
  customerName    String         @db.VarChar(100)
  customerEmail   String         @db.VarChar(255)
  customerPhone   String         @db.VarChar(20)
  provinceName    String         @db.VarChar(100)
  districtName    String         @db.VarChar(100)
  wardName        String         @db.VarChar(100)
  detailAddress   String         @db.VarChar(500)
  shippingMethod  ShippingMethod @default(STANDARD)
  shippingFee     Decimal        @db.Decimal(10, 2)
  subtotal        Decimal        @db.Decimal(10, 2)
  discountAmount  Decimal        @default(0) @db.Decimal(10, 2)
  totalAmount     Decimal        @db.Decimal(10, 2)
  voucherCode     String?        @db.VarChar(50)
  orderNote       String?        @db.VarChar(500)
  paymentMethod   PaymentMethod  @default(QR_CODE)
  paymentStatus   PaymentStatus  @default(PENDING)
  orderStatus     OrderStatus    @default(PENDING)
  paidAt          DateTime?
  cancelledAt     DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  user       User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  orderItems OrderItem[]

  @@index([orderCode], name: "idx_order_code")
  @@index([userId, createdAt(sort: Desc)], name: "idx_order_user_created")
  @@index([sessionId], name: "idx_order_session")
  @@index([paymentStatus, orderStatus], name: "idx_order_status")
  @@map("orders")
}

/// Bảng lưu Chi tiết từng sản phẩm trong Đơn hàng (Bất biến tại thời điểm mua)
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

/// Bảng quản lý Mã giảm giá (Vouchers)
model Voucher {
  id                Int                 @id @default(autoincrement())
  code              String              @unique @db.VarChar(50)
  title             String              @db.VarChar(255)
  discountType      VoucherDiscountType @default(FIXED_AMOUNT)
  discountValue     Decimal             @db.Decimal(10, 2)
  minOrderAmount    Decimal?            @db.Decimal(10, 2)
  maxDiscountAmount Decimal?            @db.Decimal(10, 2)
  usageLimit        Int?
  usedCount         Int                 @default(0)
  startDate         DateTime?
  endDate           DateTime?
  isActive          Boolean             @default(true)
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  @@index([code, isActive], name: "idx_voucher_code_active")
  @@map("vouchers")
}
```

---

## 3. TRỤ CỘT 2: GIAO KÈO API (API CONTRACTS)

### 3.1 API 1: Kiểm Tra & Áp Dụng Mã Giảm Giá (Voucher Check)

- **HTTP Method:** `POST`
- **Route:** `/api/v1/vouchers/apply`
- **Auth Required:** Optional (Public / Guest / User)
- **Middleware / Constraints:** Rate limit 20 requests/minute (bọc Debounce 400ms từ Client)

#### Request Body DTO (`ApplyVoucherDto`)
```typescript
export class ApplyVoucherDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().toUpperCase())
  code: string;

  @IsNumber()
  @Min(0)
  subtotal: number;
}
```

#### Response Success (`200 OK`)
```json
{
  "statusCode": 200,
  "message": "Áp dụng mã giảm giá thành công",
  "data": {
    "voucherCode": "TECHBITE200K",
    "discountType": "FIXED_AMOUNT",
    "discountValue": 200000,
    "calculatedDiscount": 200000,
    "message": "Giảm 200.000đ cho đơn hàng chạy deadline"
  }
}
```

#### Response Error (`400 Bad Request / 404 Not Found`)
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Mã giảm giá không áp dụng cho đơn hàng dưới 300.000đ"
}
```

---

### 3.2 API 2: Khởi Tạo Đơn Hàng (Create Order)

- **HTTP Method:** `POST`
- **Route:** `/api/v1/orders`
- **Auth Required:** Optional (Tự động đọc `userId` nếu có Bearer Token/Cookie HttpOnly, hoặc đọc `sessionId` từ Header `X-Session-ID` cho Guest)
- **Rate Limit:** Tối đa 5 lượt tạo đơn / IP / phút (chống Spam order)

#### Request Body DTO (`CreateOrderDto`)
```typescript
export class CustomerInfoDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^[0-9]{9,11}$/, { message: "Số điện thoại không hợp lệ" })
  phone: string;
}

export class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  provinceName: string;

  @IsString()
  @IsNotEmpty()
  districtName: string;

  @IsString()
  @IsNotEmpty()
  wardName: string;

  @IsString()
  @IsNotEmpty()
  detailAddress: string;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customerInfo: CustomerInfoDto;

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsEnum(ShippingMethod)
  shippingMethod: ShippingMethod;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  voucherCode?: string;

  @IsOptional()
  @IsString()
  orderNote?: string;
}
```

#### Response Success (`201 Created`) - Phương thức `QR_CODE`
```json
{
  "statusCode": 201,
  "message": "Khởi tạo đơn hàng thành công",
  "data": {
    "orderId": "1024",
    "orderCode": "TB-892401",
    "totalAmount": 10520000,
    "shippingFee": 30000,
    "discountAmount": 200000,
    "paymentMethod": "QR_CODE",
    "status": "PENDING",
    "qrInfo": {
      "qrCodeUrl": "https://api.vietqr.io/image/970422-0987654321-compact2.png?amount=10520000&addInfo=TB-892401&accountName=TECHBITE%20STORE",
      "bankName": "MBBank (Ngân hàng Quân Đội)",
      "accountNo": "0987654321",
      "accountName": "CÔNG TY TNHH TECHBITE ECOMMERCE",
      "amount": 10520000,
      "transferContent": "TB-892401",
      "expiresAt": "2026-08-09T16:15:00.000Z"
    }
  }
}
```

#### Response Success (`201 Created`) - Phương thức `COD`
```json
{
  "statusCode": 201,
  "message": "Đặt hàng COD thành công",
  "data": {
    "orderId": "1025",
    "orderCode": "TB-892402",
    "totalAmount": 10520000,
    "shippingFee": 30000,
    "discountAmount": 200000,
    "paymentMethod": "COD",
    "status": "PENDING"
  }
}
```

---

### 3.3 API 3: Truy Vấn Trạng Thái Thanh Toán Đơn Hàng (Polling Payment Status)

- **HTTP Method:** `GET`
- **Route:** `/api/v1/orders/:orderCode/status`
- **Auth Required:** Public / Optional
- **Tần suất gọi:** Client polling 3 giây/lần trong khi hiển thị Modal QR Code

#### Response Success (`200 OK`)
```json
{
  "statusCode": 200,
  "data": {
    "orderCode": "TB-892401",
    "paymentStatus": "PAID",
    "orderStatus": "CONFIRMED",
    "paidAt": "2026-08-09T16:02:15.000Z"
  }
}
```

---

### 3.4 API 4: Webhook Xác Nhận Thanh Toán Ngân Hàng (Payment Webhook)

- **HTTP Method:** `POST`
- **Route:** `/api/v1/orders/webhook/payment`
- **Auth Required:** Secret API Header Key (`X-Webhook-Secret`)

#### Request Body Payload
```json
{
  "transactionId": "FT260809123456",
  "amount": 10520000,
  "transferContent": "TB-892401 NGUYEN VAN A CHUYEN TIEN",
  "bankAccount": "0987654321",
  "transactionDate": "2026-08-09T16:02:10.000Z"
}
```

#### Response Success (`200 OK`)
```json
{
  "statusCode": 200,
  "message": "Webhook processed successfully",
  "orderCode": "TB-892401",
  "paymentStatus": "PAID"
}
```

---

### 3.5 API 5: Lấy Lịch Sử Đơn Hàng Cá Nhân (My Orders)

- **HTTP Method:** `GET`
- **Route:** `/api/v1/orders/my-orders?page=1&limit=10`
- **Auth Required:** Customer Bearer Token (`JwtAuthGuard`)

#### Response Success (`200 OK`)
```json
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": 1024,
        "orderCode": "TB-892401",
        "totalAmount": 10520000,
        "paymentMethod": "QR_CODE",
        "paymentStatus": "PAID",
        "orderStatus": "SHIPPING",
        "createdAt": "2026-08-09T16:00:00.000Z",
        "itemsCount": 2
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

## 4. TRỤ CỘT 3: XỬ LÝ BẤT ĐỒNG BỘ, CACHING & HẠ TẦNG (ARCHITECTURE & REDIS)

### 4.1 Luồng Khởi Tạo Đơn Hàng Chuẩn Enterprise (DB Transaction Flow)

```
[Client POST /api/v1/orders]
       ↓
1. Validate DTO (Họ tên, SĐT, Email, Địa chỉ)
       ↓
2. Lấy CartItem trong MySQL theo userId / sessionId
   ├── [Nếu giỏ hàng trống] ➔ Thăng lỗi 400 "Giỏ hàng của bạn đang trống"
   └── [Có sản phẩm] ➔ Tiếp tục
       ↓
3. Mở DB Transaction (prisma.$transaction):
   a. Re-fetch giá sản phẩm & stock từ DB `products`
   b. Kiểm tra tồn kho: if (product.stock < item.quantity) ➔ Rollback & Return 400
   c. Tính Subtotal = Sum(salePrice * quantity)
   d. Áp dụng Voucher (nếu có): Kiểm tra minOrderAmount, tính discountAmount & tăng voucher.usedCount
   e. Tính Phí ship: STANDARD (30.000đ) / EXPRESS (50.000đ)
   f. Tính TotalAmount = Subtotal + ShippingFee - DiscountAmount
   g. Trừ stock sản phẩm: update Product stock = stock - quantity
   h. Tạo bản ghi `Order` & danh sách `OrderItem` (Snapshot giá tại mốc thời gian mua)
   i. Xóa sạch các mục trong Giỏ hàng `cart_items`
       ↓
4. Trả về kết quả khởi tạo Đơn hàng (kèm VietQR URL nếu chọn QR_CODE)
```

---

### 4.2 Cấu Trúc Khóa Caching & Khóa Khóa Trống Lặp (Redis Schema)

1. **Khóa Đếm Ngược Mã QR (Payment Expiry Lock):**
   - **Key:** `order:qr_expire:${orderCode}`
   - **TTL:** `900` giây (15 phút)
   - **Mục đích:** Nếu hết 15 phút chưa nhận được Webhook thanh toán, Background Cron Job sẽ quét các key hết hạn và cập nhật `paymentStatus: 'EXPIRED'`, đồng thời hoàn lại `stock` vào DB Product.

2. **Chống Trùng Lặp Webhook (Webhook Idempotency Lock):**
   - **Key:** `webhook:processed:${transactionId}`
   - **TTL:** `86400` giây (24 giờ)
   - **Lệnh Redis:** `redis.set(key, "1", "NX", "EX", 86400)`
   - **Mục đích:** Đảm bảo 1 giao dịch chuyển khoản trùng lặp từ ngân hàng chỉ được xử lý đúng 1 lần duy nhất.

3. **Rate Limit Tạo Đơn Hàng:**
   - **Key:** `rate_limit:checkout:${ipOrUserId}`
   - **TTL:** `60` giây
   - **Max Attempts:** 5 requests.

---

## 5. KẾ HOẠCH THI CÔNG HỆ THỐNG (IMPLEMENTATION STEPS)

1. **Bước 1 (Database):** Thêm các enum (`ShippingMethod`, `PaymentMethod`, `PaymentStatus`, `OrderStatus`, `VoucherDiscountType`) và models (`Order`, `OrderItem`, `Voucher`) vào `prisma/schema.prisma`. Chạy `npx prisma db push` và `npx prisma generate`.
2. **Bước 2 (Module Orders NestJS):** Tạo module `orders` (`orders.module.ts`, `orders.controller.ts`, `orders.service.ts`, `dto/*`).
3. **Bước 3 (Module Vouchers NestJS):** Tạo module `vouchers` để kiểm tra và quản lý mã giảm giá.
4. **Bước 4 (Service Logic & Transactions):** Viết logic tạo đơn hàng bọc `prisma.$transaction`, trừ tồn kho, tự động xóa giỏ hàng và tạo VietQR URL.
5. **Bước 5 (Webhook & Redis Polling):** Viết endpoint Webhook thanh toán và status polling API.
6. **Bước 6 (Seeding & Testing):** Seed 2 mã voucher mẫu (`TECHBITE200K`, `WELCOME50K`) vào `prisma/seed.ts` và chạy test kiểm thử API bằng Postman/Curl.
