# DANH SÁCH ENDPOINTS & EVENT LISTENERS: MODULE EMAIL NOTIFICATIONS

> **Kế hoạch tham chiếu:** `.docs/backend-plans/mail-notification-plan.md`  
> **Source Code Path:** `app/backend/src/mail/`

---

## 1. Danh sách Admin Endpoints (Quản trị Nhật ký Email)

### 1.1. Tra cứu Nhật ký Gửi Email (Paginated & Filtered Logs)

- **Method & Route:** `GET /api/v1/admin/email-logs`
- **Auth & Protection:** `@UseGuards(JwtAuthGuard, RolesGuard)` -> `@Roles(Role.ADMIN)`
- **File vật lý:** [mail.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/mail/mail.controller.ts)
- **Query Parameters (`EmailLogQueryDto`):**
  - `page`: `number` (Default: 1)
  - `limit`: `number` (Default: 10)
  - `type`: `REGISTER_WELCOME` | `ORDER_CONFIRMATION` | `PASSWORD_CHANGED` | `SECURITY_ALERT` (Optional)
  - `status`: `PENDING` | `SENT` | `FAILED` (Optional)
  - `search`: `string` (Optional - tìm kiếm theo địa chỉ email `recipient` hoặc tiêu đề `subject`)

- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách nhật ký email thành công",
  "data": {
    "items": [
      {
        "id": 1,
        "userId": 5,
        "recipient": "customer@techbite.vn",
        "subject": "Xác nhận đơn hàng #TB-123456 - TechBite",
        "type": "ORDER_CONFIRMATION",
        "status": "SENT",
        "retryCount": 0,
        "sentAt": "2026-08-10T21:30:00.000Z",
        "createdAt": "2026-08-10T21:29:58.000Z",
        "user": {
          "id": 5,
          "fullName": "Nguyễn Văn A",
          "email": "customer@techbite.vn"
        }
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 1,
      "totalPages": 1
    }
  }
}
```

---

### 1.2. Thử Gửi lại Email Thất bại (Resend Email)

- **Method & Route:** `POST /api/v1/admin/email-logs/:id/resend`
- **Auth & Protection:** `@UseGuards(JwtAuthGuard, RolesGuard)` -> `@Roles(Role.ADMIN)`
- **File vật lý:** [mail.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/mail/mail.controller.ts)
- **URL Params:** `id` (ID của bản ghi `EmailLog`)
- **Xử lý:** Reset cờ `status = PENDING`, xóa `failedReason`, render lại HTML Handlebars và kích hoạt gửi lại bất đồng bộ.

- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Đã kích hoạt lại tiến trình gửi email cho nhật ký #1"
}
```

---

## 2. Các Event Triggers Nội bộ (Internal Async Event Listeners)

| Tên Event | Trigger Point | Loại Email | Class Listener |
|---|---|---|---|
| `user.registered` | Sau khi API Đăng ký tài khoản thành công (`AuthService.register`) | `REGISTER_WELCOME` | `AuthEmailListener` |
| `order.created` | Sau khi Đặt hàng thành công (`OrdersService.createOrder`) | `ORDER_CONFIRMATION` | `OrderEmailListener` |
| `order.paid` | Sau khi Đơn hàng chuyển trạng thái thanh toán `PAID` | `ORDER_CONFIRMATION` | `OrderEmailListener` |
| `password.changed` | Sau khi Đổi mật khẩu thành công (`AuthService.changePassword`) | `PASSWORD_CHANGED` | `AuthEmailListener` |
| `security.token_compromised` | Phát hiện Replay Attack do sử dụng Refresh Token không hợp lệ | `SECURITY_ALERT` | `AuthEmailListener` |

---

## 3. Danh sách File Code Vật lý Đã Tạo / Cập Nhật

1. `app/backend/src/mail/dto/email-log-query.dto.ts`
2. `app/backend/src/mail/events/mail.events.ts`
3. `app/backend/src/mail/templates/email-templates.ts`
4. `app/backend/src/mail/mail.service.ts`
5. `app/backend/src/mail/mail.controller.ts`
6. `app/backend/src/mail/listeners/auth-email.listener.ts`
7. `app/backend/src/mail/listeners/order-email.listener.ts`
8. `app/backend/src/mail/mail.module.ts`
9. `app/backend/src/app.module.ts` (Import EventEmitterModule & MailModule)
10. `app/backend/src/auth/auth.service.ts` (Phát các sự kiện auth)
11. `app/backend/src/orders/orders.service.ts` (Phát sự kiện đơn hàng)
