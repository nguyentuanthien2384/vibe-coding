# AUTH REGISTER — API Endpoints

> **Source Plan:** `.docs/backend-plans/register-plan.md`  
> **Module:** `src/auth/`  
> **Base URL:** `/api/v1/auth`

---

## Endpoints

| # | Method | Route | Handler | Auth | Description |
|---|--------|-------|---------|------|-------------|
| 1 | POST | `/api/v1/auth/register` | `AuthController.register` | Public | Đăng ký tài khoản người dùng mới (Role: `CUSTOMER`). Mã hóa password `bcrypt` (salt 12), lưu `jti` vào Redis, trả `refreshToken` qua Cookie `HttpOnly`. |

---

## 1. `POST /api/v1/auth/register`

Tạo tài khoản người dùng mới, tự động mã hóa mật khẩu, tạo cặp token Access/Refresh và thiết lập cookie an toàn.

### Rate Limit (Chống Spam):
- `@Throttle({ default: { limit: 5, ttl: 60000 } })` (Tối đa 5 request / phút / IP)

---

### Request Body (`RegisterDto`)

| Field | Type | Required | Constraint | Description |
|-------|------|----------|------------|-------------|
| `email` | string | **Có** | Valid Email, auto `toLowerCase()` & `trim()` | Email tài khoản |
| `password` | string | **Có** | MinLength: 6, MaxLength: 50, chứa 1 chữ + 1 số | Mật khẩu tài khoản |
| `confirmPassword` | string | **Có** | Phải khớp 100% với `password` | Xác nhận mật khẩu |
| `fullName` | string | **Có** | MinLength: 2, MaxLength: 100 | Họ và tên |
| `phone` | string | Không | Regex số điện thoại VN | Số điện thoại liên hệ |

---

### Response Headers

```http
Set-Cookie: refreshToken=<JWT_REFRESH_TOKEN>; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth; Max-Age=604800
```

---

### Response Samples

#### 201 Created (Thành công):
```json
{
  "statusCode": 201,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "accessToken": "eyJhbGciOiJKV1QiLCJ...",
    "user": {
      "id": 1,
      "email": "nguyenvana@gmail.com",
      "fullName": "Nguyễn Văn A",
      "phone": "0912345678",
      "avatarUrl": null,
      "role": "CUSTOMER",
      "createdAt": "2026-08-09T12:00:00.000Z"
    }
  }
}
```

> ⚠️ **Quy tắc bảo mật:** Không bao giờ trả về trường `password` trong Response.

#### 400 Bad Request (Mật khẩu không khớp hoặc sai validation):
```json
{
  "statusCode": 400,
  "message": [
    "Xác nhận mật khẩu không trùng khớp với mật khẩu đã nhập"
  ],
  "error": "Bad Request"
}
```

#### 409 Conflict (Email trùng lặp):
```json
{
  "statusCode": 409,
  "message": "Email \"nguyenvana@gmail.com\" đã được đăng ký trên hệ thống",
  "error": "Conflict"
}
```

#### 429 Too Many Requests (Spam API):
```json
{
  "statusCode": 429,
  "message": "Thao tác quá nhanh, vui lòng thử lại sau 1 phút",
  "error": "Too Many Requests"
}
```

---

## Redis & Security Strategy

1. **Bcrypt Hashing:** `bcrypt` với `saltRound = 12`.
2. **Access Token:** JWT Hạn 15 phút, chứa `sub`, `email`, `role`, `jti`.
3. **Refresh Token:** JWT Hạn 7 ngày, chứa `sub`, `jti`.
4. **Redis Storage:** `ioredis` lưu key `auth:refresh:<userId>:<jti>` = `'active'` với TTL 7 ngày (604,800s).

---

## Files Created & Modified

| File | Action | Description |
|------|--------|-------------|
| [src/redis/redis.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/redis/redis.service.ts) | NEW | Service quản lý kết nối ioredis với fallback In-Memory |
| [src/redis/redis.module.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/redis/redis.module.ts) | NEW | Global module cho Redis |
| [src/auth/dto/register.dto.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/dto/register.dto.ts) | NEW | Class Validation DTO cho Đăng ký tài khoản |
| [src/auth/interfaces/auth-response.interface.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/interfaces/auth-response.interface.ts) | NEW | Interface định nghĩa response bảo mật |
| [src/auth/auth.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/auth.service.ts) | NEW | Business logic đăng ký (bcrypt 12, prisma user, jwt, redis jti) |
| [src/auth/auth.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/auth.controller.ts) | NEW | Route POST /api/v1/auth/register & Set-Cookie HttpOnly |
| [src/auth/auth.module.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/auth.module.ts) | NEW | Module Auth đăng ký controller, service, JwtModule |
| [src/app.module.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/app.module.ts) | MODIFIED | Tích hợp RedisModule, AuthModule, ThrottlerModule |
