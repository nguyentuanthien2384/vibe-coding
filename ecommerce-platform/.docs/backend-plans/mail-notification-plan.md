# BẢN THIẾT KẾ BACK-END: MODULE EMAIL NOTIFICATIONS (MAIL SERVICE & BACKGROUND QUEUE)

> **Tài liệu tham chiếu:** `AGENTS.md`, `.docs/ARCHITECTURE.md`, `.docs/ideas/08-mail-notification.md`  
> **Tech Stack:** NestJS, Prisma ORM, MySQL, Redis (`ioredis`), BullMQ Queue (`@nestjs/bullmq`), `@nestjs-modules/mailer` / `nodemailer`, Handlebars Template (`hbs`), `@nestjs/event-emitter`

---

## 1. Tổng quan Kiến trúc & Luồng xử lý (Architecture & Workflow)

Hệ thống gửi Email Thông báo cho **TechBite** được thiết kế theo mô hình **Event-Driven Architecture** kết hợp **Message Queue (BullMQ + Redis)** nhằm bảo đảm 3 mục tiêu cốt lõi:
1. **Non-blocking Performance:** Không làm chậm các API chính (Checkout, Đăng ký, Đổi mật khẩu) do các tác vụ kết nối SMTP Server bên thứ ba.
2. **High Reliability & Resilience:** Tự động retry khi gặp sự cố mạng/SMTP server (Exponential Backoff), lưu vết toàn bộ nhật ký gửi email (`EmailLog`) để audit và quản trị.
3. **Security First:** Phát tín hiệu cảnh báo bảo mật tức thì khi phát hiện nghi vấn lộ Refresh Token (Replay Attack) hoặc đổi mật khẩu.

```
┌────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│ Business Event Trigger │ ───> │ NestJS EventEmitter2    │ ───> │ BullMQ Queue            │
│ (Register, Order, etc.)│      │ (Emit event bất đồng bộ)│      │ (name: 'mail-queue')    │
└────────────────────────┘      └─────────────────────────┘      └────────────┬────────────┘
                                                                              │
                                                                              ▼
┌────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│ User Inbox             │ <─── │ SMTP Transport Provider │ <─── │ MailProcessor (Worker)  │
│ (Email Client)         │      │ (Resend / SendGrid /...)│      │ (Render HTML + Send)    │
└────────────────────────┘      └─────────────────────────┘      └────────────┬────────────┘
                                                                              │
                                                                              ▼
                                                                 ┌─────────────────────────┐
                                                                 │ EmailLog (MySQL DB)     │
                                                                 │ (Update SENT / FAILED)  │
                                                                 └─────────────────────────┘
```

---

## 2. Thiết kế Dữ liệu (Database Schema - Prisma / MySQL)

Để quản lý lịch sử gửi email, theo dõi trạng thái phân phối và hỗ trợ quản trị viên gửi lại email thất bại, chúng ta bổ sung Model `EmailLog` và Enums liên quan vào `prisma/schema.prisma`.

### 2.1. Prisma Enums & Model `EmailLog`

```prisma
// Enum phân loại mục đích gửi Email
enum EmailType {
  REGISTER_WELCOME       // Email chào mừng khi đăng ký tài khoản thành công
  ORDER_CONFIRMATION     // Email xác nhận đơn hàng thành công
  PASSWORD_CHANGED       // Email thông báo đổi mật khẩu thành công
  SECURITY_ALERT         // Email cảnh báo bảo mật (Lộ Refresh Token / Replay Attack)
}

// Enum trạng thái xử lý gửi Email
enum EmailStatus {
  PENDING   // Đã đẩy vào Queue, đang chờ Worker xử lý
  SENT      // Đã gửi thành công qua SMTP Provider
  FAILED    // Gửi thất bại (Đã thử lại tối đa số lần cho phép)
}

/// Bảng lưu trữ nhật ký gửi Email thông báo của hệ thống
model EmailLog {
  id           Int         @id @default(autoincrement())
  userId       Int?        // ID người nhận (Null nếu chưa tạo xong user hoặc guest)
  recipient    String      @db.VarChar(255) // Địa chỉ email người nhận
  subject      String      @db.VarChar(255) // Tiêu đề Email
  type         EmailType   // Loại email thông báo
  status       EmailStatus @default(PENDING) // Trạng thái gửi
  metadata     Json?       // Lưu thông tin động (orderCode, ipAddress, payload, error message)
  retryCount   Int         @default(0) // Số lần đã thực hiện retry
  sentAt       DateTime?   // Thời điểm gửi thành công
  failedReason String?     @db.Text // Lý do thất bại nếu status === FAILED
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  // Quan hệ tùy chọn với bảng User
  user         User?       @relation(fields: [userId], references: [id], onDelete: SetNull)

  // Indexes tối ưu tra cứu cho Admin Dashboard
  @@index([recipient], name: "idx_email_log_recipient")
  @@index([type, status], name: "idx_email_log_type_status")
  @@index([createdAt], name: "idx_email_log_created_at")
  @@map("email_logs")
}
```

### 2.2. Cập nhật Quan hệ trong Model `User`
```prisma
model User {
  // ... các trường hiện có ...
  emailLogs   EmailLog[]
}
```

---

## 3. Giao kèo API & Event Contracts (API & Internal Event Specifications)

Module Email hoạt động chủ yếu qua **Event Listeners** nội bộ của Backend, đồng thời cung cấp **Admin APIs** cho phép Quản trị viên xem log và kích hoạt gửi lại email.

### 3.1. Danh sách Events Kích hoạt Email Nội bộ (Internal Event Triggers)

#### 1. Event: `user.registered`
- **Kịch bản:** Ngay sau khi API `POST /api/v1/auth/register` hoàn tất tạo User mới.
- **Payload Data (`UserRegisteredEvent`):**
  ```typescript
  export class UserRegisteredEvent {
    userId: number;
    email: string;
    fullName: string;
    registeredAt: Date;
  }
  ```
- **Hành động Mail Worker:** Render template `register-welcome.hbs`, gửi email chào mừng và lưu `EmailLog` kiểu `REGISTER_WELCOME`.

#### 2. Event: `order.created` / `order.paid`
- **Kịch bản:** Khi người dùng hoàn tất đặt hàng (`POST /api/v1/orders/checkout`) hoặc thanh toán VietQR thành công (`PAID`).
- **Payload Data (`OrderConfirmedEvent`):**
  ```typescript
  export class OrderConfirmedEvent {
    userId: number;
    email: string;
    customerName: string;
    orderCode: string;
    totalAmount: number;
    shippingFee: number;
    discountAmount: number;
    finalAmount: number;
    paymentMethod: string;
    shippingAddress: string;
    items: Array<{
      productName: string;
      quantity: number;
      price: number;
      subtotal: number;
    }>;
    createdAt: Date;
  }
  ```
- **Hành động Mail Worker:** Render template `order-confirmation.hbs`, gửi bảng kê chi tiết món ăn/sản phẩm và lưu `EmailLog` kiểu `ORDER_CONFIRMATION`.

#### 3. Event: `password.changed`
- **Kịch bản:** Sau khi API `PATCH /api/v1/auth/change-password` xác thực mật khẩu cũ và cập nhật hash mới thành công.
- **Payload Data (`PasswordChangedEvent`):**
  ```typescript
  export class PasswordChangedEvent {
    userId: number;
    email: string;
    fullName: string;
    changedAt: Date;
    ipAddress: string;
    userAgent: string;
  }
  ```
- **Hành động Mail Worker:** Render template `password-changed.hbs`, gửi cảnh báo thời gian & IP thực hiện đổi mật khẩu, lưu `EmailLog` kiểu `PASSWORD_CHANGED`.

#### 4. Event: `security.token_compromised`
- **Kịch bản:** Khi Auth System phát hiện `RefreshToken` cũ bị phát lại (Replay Attack Detection), thu hồi toàn bộ token của User.
- **Payload Data (`TokenCompromisedEvent`):**
  ```typescript
  export class TokenCompromisedEvent {
    userId: number;
    email: string;
    fullName: string;
    detectedAt: Date;
    ipAddress: string;
    userAgent: string;
  }
  ```
- **Hành động Mail Worker:** Render template `security-alert.hbs`, phát tín hiệu cảnh báo màu đỏ mận khẩn cấp, yêu cầu người dùng đổi lại mật khẩu và lưu `EmailLog` kiểu `SECURITY_ALERT`.

---

### 3.2. Quản trị API (Admin APIs for Email Management)

#### Endpoint 1: Danh sách Nhật ký Gửi Email (`GET /api/v1/admin/email-logs`)
- **Auth & Role:** `@UseGuards(JwtAuthGuard, RolesGuard)` -> `@Roles(Role.ADMIN)`
- **Query Params (`EmailLogQueryDto`):**
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `type` (`EmailType`, optional)
  - `status` (`EmailStatus`, optional)
  - `search` (string, optional - tìm theo recipient / subject)

- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách nhật ký email thành công",
  "data": {
    "items": [
      {
        "id": 105,
        "userId": 12,
        "recipient": "customer@techbite.vn",
        "subject": "Xác nhận đơn hàng #TB-884920 - TechBite",
        "type": "ORDER_CONFIRMATION",
        "status": "SENT",
        "retryCount": 0,
        "sentAt": "2026-08-10T21:30:00.000Z",
        "createdAt": "2026-08-10T21:29:58.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 150,
      "totalPages": 15
    }
  }
}
```

#### Endpoint 2: Thử gửi lại Email Thất bại (`POST /api/v1/admin/email-logs/:id/resend`)
- **Auth & Role:** `@UseGuards(JwtAuthGuard, RolesGuard)` -> `@Roles(Role.ADMIN)`
- **Params:** `id` (EmailLog ID)
- **Xử lý:** Lấy dữ liệu `EmailLog`, nếu status `FAILED` ➔ Đẩy lại Job mới vào BullMQ Queue với `retryCount = 0`.

---

## 4. Đặc tả Template Email (HTML Template Specifications)

Tuân thủ nghiêm ngặt **Design Specs** tại `08-mail-notification.md`:
- **UI Style:** Sạch sẽ (Clean), Whitespace rộng rãi, Container chính bo góc `rounded-2xl` (`border-radius: 16px;`), Nền xám nhạt (`#f8fafc`), Thẻ nội dung trắng (`#ffffff`).
- **Brand Colors:**
  - Cam thương hiệu TechBite (CTA Buttons): `#ff8c42`
  - Đỏ mận (Security Alert / Badges): `#A63D40`
  - Chữ tiêu đề: `#1e293b`
  - Chữ nội dung: `#475569`
- **Cấu trúc khung Email (Standard Layout Structure):**

```
+-------------------------------------------------------------------+
|                           TECHBITE LOGO                           |
|                    (Header centered, max-height 48px)             |
+-------------------------------------------------------------------+
|  [Card Container: rounded-2xl (16px), bg-white, padding: 32px]     |
|                                                                   |
|  Xin chào, {{fullName}}!                                         |
|                                                                   |
|  [NỘI DUNG THÔNG BÁO TƯƠNG ỨNG THEO LOẠI EMAIL]                  |
|  - Welcome text (REGISTER_WELCOME)                                |
|  - Bảng kê chi tiết đơn hàng (ORDER_CONFIRMATION)                 |
|  - Cảnh báo đổi mật khẩu + IP (PASSWORD_CHANGED)                  |
|  - Khối Cảnh báo đỏ mận bg-[#A63D40] (SECURITY_ALERT)              |
|                                                                   |
|  [PRIMARY CTA BUTTON: bg-[#ff8c42], text-white, rounded-xl]       |
|  "Xem chi tiết đơn hàng" / "Đăng nhập tài khoản" / "Bảo vệ ngay"  |
+-------------------------------------------------------------------+
|                        FOOTER THÔNG TIN                           |
|  Cần hỗ trợ? Liên hệ support@techbite.vn | Hotline: 1900-TECHBITE  |
|  © 2026 TechBite Inc. All rights reserved.                        |
+-------------------------------------------------------------------+
```

---

## 5. Cấu trúc Module NestJS & File Tổ chức (Backend Implementation Structure)

```text
apps/backend/src/mail/
├── mail.module.ts                 # Import BullModule, MailerModule, TypeOrm/Prisma
├── mail.service.ts                # Service quản lý tạo Job & CRUD EmailLog
├── mail.processor.ts              # BullMQ Consumer Processor (MailProcessor)
├── mail.controller.ts             # Admin Controllers (/api/v1/admin/email-logs)
├── listeners/
│   ├── auth-email.listener.ts     # Lắng nghe register, password, security events
│   └── order-email.listener.ts    # Lắng nghe order events
├── dtos/
│   └── email-log-query.dto.ts     # DTO phân trang & bộ lọc EmailLog
└── templates/                     # Handlebars Templates (.hbs)
    ├── register-welcome.hbs
    ├── order-confirmation.hbs
    ├── password-changed.hbs
    └── security-alert.hbs
```

---

## 6. Kế hoạch Kiểm thử & Xác minh (Verification & Testing Strategy)

1. **Unit & Integration Test:**
   - Test Event Listener nhận đúng payload và nạp đúng dữ liệu vào BullMQ Queue.
   - Test `MailProcessor` xử lý đúng logic: thành công update `status = SENT`, thất bại retry 3 lần ➔ update `status = FAILED`.
2. **SMTP Integration Verification:**
   - Cấu hình Mailtrap / Resend / Ethereal Email ở môi trường Dev để kiểm tra việc nhận email và render đúng HTML layout.
3. **Queue Health Monitoring:**
   - Kiểm tra Redis kết nối ổn định, các job không bị treo hay kẹt trên RAM.

---
*✅ Bản thiết kế Back-end Email Notifications đã sẵn sàng để thi công code.*
