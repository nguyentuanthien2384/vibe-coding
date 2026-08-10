# BẢN THIẾT KẾ BACK-END: MODULE AUTH - ĐĂNG KÝ TÀI KHOẢN (REGISTER)

> **Tài liệu tham chiếu:** `AGENTS.md`, `.docs/ARCHITECTURE.md`, `.docs/backend-plans/search-suggest-plan.md`  
> **Tech Stack:** NestJS, Prisma ORM, MySQL, Redis (`ioredis`), `jsonwebtoken`, `bcrypt` (saltRound = 12), NestJS Throttler  

---

## 1. Thiết kế Dữ liệu (Database Schema - Prisma / MySQL)

Tính năng **Đăng ký tài khoản (Register)** yêu cầu bổ sung bảng `User` vào `prisma/schema.prisma` để quản lý người dùng và phân quyền hệ thống.

### 1.1. Bổ sung Enum & Model `User` vào Prisma Schema

```prisma
// Enum định nghĩa Vai trò Người dùng
enum Role {
  ADMIN
  STAFF
  CUSTOMER
}

/// Bảng quản lý người dùng hệ thống (Khách hàng, Nhân viên, Quản trị viên)
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique @db.VarChar(255)
  password  String   @db.VarChar(255) // Hash bcrypt (saltRound = 12)
  fullName  String   @db.VarChar(100)
  phone     String?  @db.VarChar(20)
  avatarUrl String?  @db.VarChar(500)
  role      Role     @default(CUSTOMER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Indexes tối ưu truy vấn danh nhập & tìm kiếm
  @@index([email], name: "idx_user_email")
  @@index([role, isActive], name: "idx_user_role_active")
  @@map("users")
}
```

### 1.2. Ràng buộc Dữ liệu & Quy tắc Bảo mật DB (Database Rules)
- **`email`**: Duy nhất (`@unique`), tự động `trim()` và chuyển thành chữ thường (`lowercase`) trước khi truy vấn/lưu.
- **`password`**: Độ dài trường 255 ký tự để lưu hash `bcrypt` (chuỗi hash chuẩn có độ dài 60 ký tự). TUYỆT ĐỐI KHÔNG lưu plain-text.
- **`role`**: Mặc định là `CUSTOMER`. Khi người dùng đăng ký qua API Public, hệ thống **ÉP CỨNG** giá trị `role = Role.CUSTOMER`, bỏ qua mọi trường `role` nếu client cố tình gửi trong Body Request (chống lỗi leo thang đặc quyền - Privilege Escalation).

---

## 2. Giao kèo API (API Contract)

### 2.1. API Đăng Ký Tài Khoản (Register Account Endpoint)

- **Method & Route:** `POST /api/v1/auth/register`
- **Auth Guard:** Public (Không yêu cầu Token)
- **Rate Limit (Chống Spam Đăng ký):** `@Throttle({ default: { limit: 5, ttl: 60000 } })` (Tối đa 5 lượt đăng ký / phút / IP)

---

#### Request Body (`RegisterDto`):

| Trường | Kiểu dữ liệu | Bắt buộc | Quy tắc Validation |
|---|---|---|---|
| `email` | `string` | **Có** | Email chuẩn, tự động `toLowerCase()` & `trim()` |
| `password` | `string` | **Có** | Tối thiểu 6 ký tự, tối đa 50 ký tự, chứa ít nhất 1 chữ cái và 1 chữ số |
| `confirmPassword` | `string` | **Có** | Phải khớp 100% với `password` |
| `fullName` | `string` | **Có** | Tối thiểu 2 ký tự, tối đa 100 ký tự, tự động `trim()` |
| `phone` | `string` | Không | Định dạng số điện thoại (VD: 10-11 chữ số Việt Nam) |

```typescript
// dtos/register.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có tối thiểu 6 ký tự' })
  @MaxLength(50, { message: 'Mật khẩu không vượt quá 50 ký tự' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, { message: 'Mật khẩu phải chứa ít nhất một chữ cái và một chữ số' })
  password: string;

  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống' })
  @IsString()
  confirmPassword: string;

  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @IsString()
  @MinLength(2, { message: 'Họ và tên phải có tối thiểu 2 ký tự' })
  @MaxLength(100, { message: 'Họ và tên không vượt quá 100 ký tự' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  fullName: string;

  @IsOptional()
  @IsString()
  @Matches(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, { message: 'Số điện thoại không hợp lệ' })
  phone?: string;
}
```

---

#### Header Trả về (Set-Cookie):

Khi đăng ký thành công, hệ thống tự động đăng nhập cho User bằng cách trả về `refreshToken` trong Header `Set-Cookie`:
```http
Set-Cookie: refreshToken=<JWT_REFRESH_TOKEN>; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth; Max-Age=604800
```
- **`HttpOnly`**: Ngăn ngừa Javascript phía Client (XSS) truy cập token.
- **`Max-Age`**: 604,800 giây (7 ngày).

---

#### Response Success (201 Created):

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

> ⚠️ **QUY TẮC BẢO MẬT BẮT BUỘC (AGENTS.md):**  
> Trong Response Payload **TUYỆT ĐỐI KHÔNG TRẢ VỀ TRƯỜNG `password`** hoặc bất kỳ thông tin nhạy cảm nào.

---

#### Response Failure (400 Bad Request - Validation Lỗi dữ liệu / Mật khẩu không khớp):

```json
{
  "statusCode": 400,
  "message": [
    "Xác nhận mật khẩu không trùng khớp với mật khẩu đã nhập"
  ],
  "error": "Bad Request"
}
```

---

#### Response Failure (409 Conflict - Email đã được đăng ký):

```json
{
  "statusCode": 409,
  "message": "Email \"nguyenvana@gmail.com\" đã được đăng ký trên hệ thống",
  "error": "Conflict"
}
```

---

#### Response Failure (429 Too Many Requests - Spam API):

```json
{
  "statusCode": 429,
  "message": "Thao tác quá nhanh, vui lòng thử lại sau 1 phút",
  "error": "Too Many Requests"
}
```

---

## 3. Kiến trúc, Redis & Background Jobs (Architecture & Security)

### 3.1. Mã Hóa Mật Khẩu (Password Hashing)
- Sử dụng thư viện `bcrypt`.
- Quy chuẩn `saltRound = 12` (theo quy định nghiêm ngặt tại `AGENTS.md`).
- Tuyệt đối không lưu plain text.

### 3.2. Quản Lý Token & Redis (`ioredis`)
- **Access Token:**
  - Thời hạn: `15 phút`.
  - Payload: `{ sub: user.id, email: user.email, role: user.role, jti: uuid() }`.
- **Refresh Token:**
  - Thời hạn: `7 ngày`.
  - Payload: `{ sub: user.id, jti: refreshJti }`.
- **Lưu trữ Redis (`ioredis`):**
  - **KHÔNG** lưu plain token vào Redis. Chỉ lưu mã định danh `jti` (JWT ID).
  - Key Format: `auth:refresh:<userId>:<jti>` -> Value: `'active'`.
  - TTL trên Redis: Tính toán chính xác thời gian còn lại của JWT (604800s = 7 ngày) dùng `redis.setEx()` để Redis tự động dọn rác, tránh tràn RAM.

### 3.3. Tác Vụ Ngầm (Background Job - Send Welcome Email)
- Sau khi lưu User thành công vào DB và sinh Token, hệ thống phát sự kiện `UserRegisteredEvent`.
- Đẩy nhiệm vụ gửi **Email chào mừng (Welcome Email)** vào Message Queue (BullMQ / NestJS EventEmitter async) để xử lý ngầm (Background Worker).
- **Mục tiêu:** Giữ thời gian phản hồi API đăng ký siêu nhanh (< 100ms), không bị block Main Thread do chờ kết nối server SMTP.

---

## 4. Cấu trúc Module NestJS Đề xuất

```
app/backend/src/modules/auth/
├── dtos/
│   └── register.dto.ts               ← DTO validation dữ liệu Đăng ký
├── interfaces/
│   └── auth-response.interface.ts    ← Interface Response (AccessToken + AuthUser)
├── auth.controller.ts                ← Controller xử lý route POST /register & Set-Cookie
├── auth.service.ts                   ← Service chứa Business Logic (check email, hash bcrypt 12, create user, sign JWT, set Redis jti)
├── auth.module.ts                    ← NestJS AuthModule (Import Passport, Jwt, Redis)
└── strategies/
    └── jwt.strategy.ts               ← Strategy xác thực Access Token cho các API sau
```

---

## 5. Kế hoạch Triển khai (Step-by-Step Execution Plan)

1. **Cập nhật Prisma Schema:** Bổ sung Enum `Role` và Model `User` vào `prisma/schema.prisma`. Chạy `npx prisma db push` hoặc migration.
2. **Cài đặt Thư viện:** `bcrypt`, `@types/bcrypt`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `ioredis`.
3. **Tạo Module Auth:** `nest g module modules/auth`, `nest g controller modules/auth`, `nest g service modules/auth`.
4. **Tạo `RegisterDto` & Custom Validator / Interceptor:** Đảm bảo validate `confirmPassword === password` và sanitize `email`, `fullName`.
5. **Xây dựng `AuthService.register()`:**
   - Kiểm tra Email tồn tại trong DB -> Ném `ConflictException` (409).
   - Hash mật khẩu với `bcrypt.hash(password, 12)`.
   - Lưu User vào Database bằng Prisma với `role: Role.CUSTOMER`.
   - Sinh Access Token & Refresh Token (`jti`).
   - Lưu `jti` vào Redis với TTL 7 ngày qua `redis.setEx()`.
   - Phát sự kiện gửi mail chào mừng ngầm.
6. **Xây dựng `AuthController.register()`:**
   - Tiếp nhận `RegisterDto`.
   - Set Cookie `refreshToken` (HttpOnly, Path=/api/v1/auth).
   - Trả về JSON thành công không chứa `password`.
7. **Kiểm thử API (Integration & Security Test):**
   - Đăng ký thành công -> Nhận 201 + Access Token + Cookie.
   - Thử đăng ký trùng Email -> Nhận 409.
   - Thử gửi `role: "ADMIN"` trong body -> Hệ thống vẫn lưu `role: "CUSTOMER"`.
   - Kiểm tra DB & Response -> Không có trường `password` lộ ra.
