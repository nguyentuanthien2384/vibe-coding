# BẢN QUY HOẠCH KIẾN TRÚC BACK-END: HỆ THỐNG TÍCH ĐIỂM & ĐỔI ĐIỂM (LOYALTY POINTS SYSTEM)

> **Nguồn Ý Tưởng:** `.docs/ideas/09-points-idea.md`  
> **Tài Liệu Tham Chiếu:** `.docs/ARCHITECTURE.md`, `.docs/STYLEGUIDE.md`, `.agent/AGENTS.md`, `.docs/FEATURES_DONE.md`  
> **Tài Liệu Frontend:** `.docs/frontend-plans/09-points-plan.md`  
> **Tech Stack:** NestJS, Prisma ORM, MySQL, Redis, JWT (HttpOnly Cookies), Server-Sent Events (SSE), Nodemailer  
> **Phiên bản:** 1.0.0  
> **Ngày tạo:** 2026-08-24  

---

## 1. TỔNG QUAN HỆ THỐNG & NGUYÊN TẮC BẢO MẬT (CORE PRINCIPLES)

1. **Bảo Mật Giá Trị Tiền & Điểm Thưởng (Anti-Tampering & Security):**
   - Backend **TUYỆT ĐỐI KHÔNG** tin tưởng bất kỳ số tiền giảm giá hoặc số điểm hợp lệ nào do Client tính toán gửi lên.
   - Client chỉ gửi `pointsToUse` (số điểm muốn áp dụng). Backend có trách nhiệm tra cứu số dư thực tế trong DB MySQL, kiểm tra điều kiện áp dụng, tỷ lệ quy đổi và tính toán khấu trừ chính xác.
   - Xác thực người dùng BẮT BUỘC trích xuất từ JWT Access Token hợp lệ (`req.user.id`). CẤM tin tưởng `userId` gửi trong Request Body. Khách vãng lai (`GUEST`) không được phép sử dụng hay tích điểm thưởng.

2. **Nguyên Tử Hóa & Chống Trùng Lặp Giao Dịch (Atomic Transactions & Idempotency):**
   - Mọi thao tác khấu trừ điểm khi Đặt hàng, hoàn điểm khi Hủy đơn, hay cộng điểm khi Hoàn tất đơn hàng BẮT BUỘC phải chạy bên trong `prisma.$transaction`.
   - Sử dụng **Redis Distributed Lock** (`lock:points:${userId}`, TTL 5 giây) để ngăn chặn tấn công Race-condition / Double-spending khi người dùng gửi nhiều request đặt hàng đồng thời.
   - Mọi thay đổi điểm số phải được ghi vết bất biến (Immutable Ledger) vào bảng `points_ledger`.

3. **Cơ Chế Tính Điểm & Thăng Hạng Thành Viên Tự Động (Tier & Earning Lifecycle):**
   - **Tích điểm (`EARN`):** Kích hoạt tự động khi Đơn hàng chuyển sang trạng thái `DELIVERED` (Đã giao hàng) hoặc `PAID` (Đã thanh toán). Điểm tích lũy = `(Tổng tiền hàng thực trả - Phí ship) * Tỷ lệ tích điểm * Hệ số Hạng thành viên`.
   - **Đổi điểm (`REDEEM`):** Khấu trừ ngay tại bước tạo Đơn hàng (`POST /api/v1/orders`). Nếu số tiền giảm từ điểm bù đủ 100% giá trị đơn hàng, `totalAmount` trở về `0đ` và trạng thái thanh toán được đánh dấu trực tiếp là `PAID`.
   - **Hoàn điểm (`REFUND`):** Khi Đơn hàng bị HỦY (`CANCELLED`), hệ thống tự động hoàn lại 100% số điểm khách đã sử dụng cho đơn hàng đó vào tài khoản.

---

## 2. TRỤ CỘT 1: THIẾT KẾ DỮ LIỆU (DATABASE SCHEMA)

### 2.1 Enum Định Nghĩa Trong Prisma

```prisma
enum MembershipTier {
  BRONZE
  SILVER
  GOLD
  DIAMOND
}

enum PointsTransactionType {
  EARN       // Tích điểm từ đơn hàng hoàn tất
  REDEEM     // Trừ điểm khi thanh toán đơn hàng
  REFUND     // Hoàn trả điểm do đơn hàng bị hủy
  EXPIRE     // Điểm hết hạn sử dụng
  ADJUST     // Điều chỉnh thủ công từ Quản trị viên
}
```

---

### 2.2 Chi Tiết Các Bảng Dữ Liệu (Prisma Models)

```prisma
// =============================================================================
// MODULE: USER & LOYALTY POINTS
// =============================================================================

/// Cập nhật bảng User bổ sung số dư điểm và hạng thành viên
model User {
  id                Int             @id @default(autoincrement())
  email             String          @unique @db.VarChar(255)
  password          String          @db.VarChar(255)
  fullName          String          @db.VarChar(100)
  phone             String?         @db.VarChar(20)
  avatarUrl         String?         @db.VarChar(500)
  notes             String?         @db.Text
  role              Role            @default(CUSTOMER)
  isActive          Boolean         @default(true)
  lastLoginAt       DateTime?
  
  // --- Loyalty Points Fields ---
  loyaltyPoints     Int             @default(0)
  membershipTier    MembershipTier  @default(BRONZE)
  totalSpentAccum   Decimal         @default(0) @db.Decimal(12, 2) // Tổng chi tiêu tích lũy để thăng hạng
  
  roleGroupId       Int?
  roleGroup         RoleGroup?      @relation(fields: [roleGroupId], references: [id], onDelete: SetNull)
  customPermissions Json?

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  cart              Cart?
  orders            Order[]
  addresses         Address[]
  emailLogs         EmailLog[]
  notifications     Notification[]
  pointsLedgers     PointsLedger[]

  @@index([email], name: "idx_user_email")
  @@index([role, isActive], name: "idx_user_role_active")
  @@index([membershipTier], name: "idx_user_membership_tier")
  @@index([loyaltyPoints], name: "idx_user_loyalty_points")
  @@map("users")
}

/// Bảng lưu vết lịch sử biến động điểm bất biến (Immutable Points Ledger)
model PointsLedger {
  id            Int                   @id @default(autoincrement())
  userId        Int
  orderId       Int?
  orderCode     String?               @db.VarChar(50)
  type          PointsTransactionType
  points        Int                   // Số điểm biến động (+ hoặc -)
  balanceBefore Int                   // Số dư điểm trước giao dịch
  balanceAfter  Int                   // Số dư điểm sau giao dịch
  description   String                @db.VarChar(255)
  metadata      Json?                 // Dữ liệu chi tiết bổ sung (tỷ lệ, chiết khấu...)
  createdAt     DateTime              @default(now())

  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  order Order? @relation(fields: [orderId], references: [id], onDelete: SetNull)

  @@index([userId, createdAt(sort: Desc)], name: "idx_points_ledger_user_created")
  @@index([userId, type], name: "idx_points_ledger_user_type")
  @@index([orderId], name: "idx_points_ledger_order")
  @@index([orderCode], name: "idx_points_ledger_order_code")
  @@map("points_ledgers")
}

/// Cập nhật bảng Order lưu thông tin điểm đã áp dụng và điểm nhận được
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
  discountAmount Decimal        @default(0) @db.Decimal(10, 2) // Giảm giá từ Voucher
  
  // --- Loyalty Points Tracking ---
  pointsUsed     Int            @default(0)                   // Số điểm đã khấu trừ
  pointsDiscount Decimal        @default(0) @db.Decimal(10, 2)// Số tiền VNĐ giảm từ điểm
  pointsEarned   Int            @default(0)                   // Số điểm được cộng khi hoàn tất
  isPointsEarned Boolean        @default(false)               // Cờ đánh dấu đã cộng điểm (chống cộng lặp)
  
  totalAmount    Decimal        @db.Decimal(10, 2)            // Tổng tiền sau voucher & điểm
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

  user          User?          @relation(fields: [userId], references: [id], onDelete: SetNull)
  orderItems    OrderItem[]
  pointsLedgers PointsLedger[]

  @@index([orderCode], name: "idx_order_code")
  @@index([userId, createdAt(sort: Desc)], name: "idx_order_user_created")
  @@index([paymentStatus, orderStatus], name: "idx_order_status")
  @@map("orders")
}
```

---

### 2.3 Cấu Hình Mặc Định Hệ Thống Điểm (`SystemSetting`)

Hệ thống lưu cấu hình điểm dưới dạng JSON trong bảng `system_settings` với key `'points_config'`:

```json
{
  "earnRatePercentage": 1.0,
  "redeemRateVnd": 1000,
  "minPointsToRedeem": 10,
  "maxRedeemPercentage": 100,
  "pointsExpiryDays": 0,
  "tierMultipliers": {
    "BRONZE": 1.0,
    "SILVER": 1.1,
    "GOLD": 1.25,
    "DIAMOND": 1.5
  },
  "tierThresholds": {
    "BRONZE": 0,
    "SILVER": 2000000,
    "GOLD": 5000000,
    "DIAMOND": 10000000
  }
}
```

---

## 3. TRỤ CỘT 2: GIAO KÈO API (API CONTRACTS)

### 3.1 Danh Sách Endpoints Khách Hàng (Customer Points API)

#### 1. Lấy Thông Tin Tổng Quan Điểm & Tiến Trình Thăng Hạng
- **Route:** `GET /api/v1/points/summary`
- **Auth:** `JwtAuthGuard` (Bắt buộc đăng nhập)
- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy thông tin điểm tích lũy thành công",
  "data": {
    "currentPoints": 150,
    "equivalentVnd": 150000,
    "membershipTier": "GOLD",
    "tierProgress": {
      "currentTierSpent": 3500000,
      "nextTierThreshold": 5000000,
      "progressPercentage": 70,
      "nextTier": "DIAMOND"
    },
    "totalPointsEarned": 320,
    "totalPointsRedeemed": 170,
    "pointsExpiringSoon": null
  }
}
```

---

#### 2. Lấy Lịch Sử Biến Động Điểm (Phân Trang & Lọc)
- **Route:** `GET /api/v1/points/history`
- **Auth:** `JwtAuthGuard`
- **Query Parameters (`PointsHistoryQueryDto`):**
  - `page`: `number` (Mặc định: 1)
  - `limit`: `number` (Mặc định: 10)
  - `type`: `PointsTransactionType | 'ALL'` (Mặc định: 'ALL')
- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy lịch sử điểm thành công",
  "data": {
    "items": [
      {
        "id": 1,
        "userId": 10,
        "orderId": 105,
        "orderCode": "TB-98214",
        "type": "EARN",
        "points": 45,
        "balanceBefore": 105,
        "balanceAfter": 150,
        "description": "Tích lũy điểm từ đơn hàng #TB-98214",
        "createdAt": "2026-08-22T14:30:00.000Z"
      },
      {
        "id": 2,
        "userId": 10,
        "orderId": 104,
        "orderCode": "TB-97532",
        "type": "REDEEM",
        "points": -50,
        "balanceBefore": 155,
        "balanceAfter": 105,
        "description": "Khấu trừ điểm thanh toán đơn hàng #TB-97532",
        "createdAt": "2026-08-20T10:15:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

---

#### 3. Lấy Cấu Hình Hệ Thống Điểm (Public API)
- **Route:** `GET /api/v1/points/config`
- **Auth:** Không yêu cầu (Public)
- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy cấu hình điểm thành công",
  "data": {
    "earnRatePercentage": 1.0,
    "redeemRateVnd": 1000,
    "minPointsToRedeem": 10,
    "maxRedeemPercentage": 100,
    "pointsExpiryDays": 0
  }
}
```

---

#### 4. Xem Trước Tính Toán Khấu Trừ Điểm Khi Checkout (Preview Points Calculation)
- **Route:** `POST /api/v1/points/preview-checkout`
- **Auth:** `JwtAuthGuard`
- **Request Body (`PreviewPointsCheckoutDto`):**
```json
{
  "pointsToUse": 50,
  "voucherCode": "TECHBITE10"
}
```
- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Tính toán điểm hợp lệ",
  "data": {
    "userAvailablePoints": 150,
    "maxPointsCanUse": 120,
    "conversionRate": 1000,
    "pointsToUse": 50,
    "discountAmount": 50000,
    "remainingPayableAmount": 70000,
    "isFullyCovered": false,
    "estimatedPointsEarn": 12
  }
}
```

---

#### 5. Cập Nhật API Tạo Đơn Hàng (`POST /api/v1/orders`)
- **Route:** `POST /api/v1/orders`
- **Auth:** Optional (Hỗ trợ cả Guest và Logged-in User)
- **Request Body Bổ Sung:**
```json
{
  "customerInfo": {
    "fullName": "Nguyễn Văn A",
    "email": "vana@gmail.com",
    "phone": "0987654321"
  },
  "shippingAddress": {
    "provinceName": "TP. Hồ Chí Minh",
    "districtName": "Quận 1",
    "wardName": "Phường Bến Nghé",
    "detailAddress": "123 Lê Lợi"
  },
  "shippingMethod": "STANDARD",
  "paymentMethod": "QR_CODE",
  "voucherCode": "GIAM20K",
  "pointsToUse": 50,
  "orderNote": "Giao giờ hành chính"
}
```
- **Xử lý Logic Backend:**
  - Nếu `pointsToUse > 0` và request không có JWT User: Ném lỗi `401 Unauthorized` ("Vui lòng đăng nhập để sử dụng điểm").
  - Nếu `pointsToUse > user.loyaltyPoints`: Ném lỗi `400 Bad Request` ("Số điểm sử dụng vượt quá số dư khả dụng").
  - Trừ `pointsToUse` trong `prisma.$transaction`, ghi `PointsLedger` (Type: `REDEEM`).
  - Nếu `totalAmount === 0`: Đổi `paymentStatus = 'PAID'`, `orderStatus = 'CONFIRMED'`.

---

### 3.2 Danh Sách Endpoints Quản Trị (Admin Points API)

#### 6. Admin Điều Chỉnh Điểm Thủ Công Cho Khách Hàng
- **Route:** `POST /api/v1/admin/points/adjust`
- **Auth:** `JwtAuthGuard`, `RolesGuard(ADMIN)`
- **Request Body (`AdjustPointsDto`):**
```json
{
  "userId": 10,
  "points": 50,
  "reason": "Bù điểm do sự cố giao hàng chậm đơn TB-98214"
}
```
- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Điều chỉnh điểm thành công",
  "data": {
    "userId": 10,
    "pointsAdjusted": 50,
    "newBalance": 200
  }
}
```

---

#### 7. Admin Cập Nhật Cấu Hình Hệ Thống Điểm
- **Route:** `PATCH /api/v1/admin/points/config`
- **Auth:** `JwtAuthGuard`, `RolesGuard(ADMIN)`
- **Request Body (`UpdatePointsConfigDto`):**
```json
{
  "earnRatePercentage": 1.5,
  "redeemRateVnd": 1000,
  "minPointsToRedeem": 10,
  "maxRedeemPercentage": 100
}
```

---

## 4. TRỤ CỘT 3: KIẾN TRÚC BẤT ĐỒNG BỘ, REDIS & BACKGROUND JOBS

### 4.1 Chiến Lược Redis Caching & Distributed Locks

1. **Redis Cache Cấu Hình (`cache:points:config`):**
   - TTL: 24 giờ (`86400s`).
   - Tự động xóa (Invalidate) khi Admin gọi `PATCH /api/v1/admin/points/config`.

2. **Redis Cache User Summary (`cache:points:summary:${userId}`):**
   - TTL: 10 phút.
   - Xóa ngay lập tức khi phát sinh bất kỳ giao dịch biến động điểm nào trong `PointsLedger`.

3. **Redis Distributed Lock Chống Race-Condition (`lock:points:${userId}`):**
   - TTL: 5 giây.
   - Trước khi thực thi transaction đặt hàng trừ điểm, Service gọi `redis.set(key, '1', 'EX', 5, 'NX')`. Nếu trả về `null` (đang có giao dịch khác xử lý) ➔ Ném lỗi `429 Too Many Requests`.

---

### 4.2 Luồng Lifecycle Tích Điểm Tự Động (Auto-Earning Workflow)

```
Admin chuyển Order sang DELIVERED hoặc Webhook nhận thanh toán PAID
    ↓
    `AdminOrdersService.updateOrderStatus` / `OrdersService.handleWebhookPayment`
    ↓
    Gọi `PointsService.handleOrderCompleted(orderId)`
    ↓
    Prisma Transaction:
    ├── Kiểm tra Order: `order.userId != null` VÀ `order.isPointsEarned == false`
    ├── Tính số tiền tính điểm: `netAmount = order.totalAmount - order.shippingFee`
    ├── Lấy cấu hình tỷ lệ tích điểm + Hệ số Hạng thành viên của User
    ├── Tính số điểm nhận: `earnedPoints = Math.floor(netAmount * (earnRate / 100) * tierMultiplier)`
    ├── Cập nhật User: `user.loyaltyPoints += earnedPoints`, `user.totalSpentAccum += netAmount`
    ├── Đánh giá thăng hạng: Nếu `totalSpentAccum >= tierThreshold` ➔ Nâng `membershipTier`
    ├── Ghi `PointsLedger` (Type: `EARN`, points: earnedPoints)
    ├── Đánh dấu `order.isPointsEarned = true` và `order.pointsEarned = earnedPoints`
    └── Xóa Redis cache `cache:points:summary:${userId}`
    ↓
    Kích hoạt Thông báo Bất đồng bộ (Async Notification):
    ├── Gửi In-App Push SSE (`NotificationsService.pushNotification`)
    └── Gửi Email thông báo tích điểm thành công (`MailService.sendPointsEarnedEmail`)
```

---

## 5. CẤU TRÚC CODE BACKEND (MODULE ARCHITECTURE)

```
apps/backend/src/
├── points/
│   ├── dto/
│   │   ├── preview-points-checkout.dto.ts
│   │   ├── points-history-query.dto.ts
│   │   ├── adjust-points.dto.ts
│   │   └── update-points-config.dto.ts
│   ├── interfaces/
│   │   ├── points-summary.interface.ts
│   │   ├── points-config.interface.ts
│   │   └── points-calculation-result.interface.ts
│   ├── points.controller.ts            → Endpoints cho Khách hàng (/api/v1/points)
│   ├── admin-points.controller.ts      → Endpoints cho Quản trị viên (/api/v1/admin/points)
│   ├── points.service.ts               → Core Business Logic: Tích điểm, Trừ điểm, Hoàn điểm, Thăng hạng
│   └── points.module.ts                → Khai báo Module, Provider, Export PointsService
├── orders/
│   ├── orders.service.ts               → Tích hợp gọi PointsService khi Checkout & Webhook
│   └── admin-orders.service.ts         → Kích hoạt hoàn tất đơn hàng tích điểm
```

---

## 6. KỶ LUẬT THI CÔNG & KIỂM THỬ (TESTING & COMPLIANCE)

1. **TypeScript Enterprise Strictness:** Tuyệt đối không dùng kiểu `any`. Định nghĩa đầy đủ DTO với `class-validator` (`@IsInt`, `@Min`, `@Max`, `@IsOptional`).
2. **Xử Lý Lỗi HTTP Chuẩn Mực:**
   - Điểm không đủ: `BadRequestException('Số điểm sử dụng vượt quá số dư khả dụng')`.
   - Chưa đăng nhập dùng điểm: `UnauthorizedException('Vui lòng đăng nhập để sử dụng điểm thưởng')`.
   - Lỗi Transaction: `InternalServerErrorException('Giao dịch xử lý điểm thất bại')`.
3. **Database Migration:** Chạy `npx prisma db push` và `npx prisma generate` để đồng bộ model `PointsLedger` và các trường mới trên MySQL.
4. **Kiểm tra biên (Edge Cases):**
   - Đơn hàng 0đ sau khi trừ điểm: Không sinh VietQR code, đánh dấu `PAID` lập tức.
   - Hủy đơn hàng đã dùng điểm: Hoàn trả chính xác số điểm đã dùng, không hoàn điểm nếu đơn không dùng điểm.
   - Khách vãng lai: Không tích điểm, không trừ điểm, không ghi ledger.
