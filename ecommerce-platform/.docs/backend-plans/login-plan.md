# BẢN THIẾT KẾ BACK-END: MODULE AUTH - ĐĂNG NHẬP, REFRESH TOKEN & DỌN PHIÊN (LOGIN & AUTH SESSION)

> **Tài liệu tham chiếu:** `AGENTS.md`, `.docs/ARCHITECTURE.md`, `.docs/backend-plans/register-plan.md`  
> **Tech Stack:** NestJS, Prisma ORM, MySQL, Redis (`ioredis`), `jsonwebtoken`, `bcrypt` (saltRound = 12), `@nestjs/throttler`

---

## 1. Thiết kế Dữ liệu (Database Schema - Prisma / MySQL)

Chức năng **Đăng nhập (Login)** sử dụng bảng `User` đã được thiết kế trong `register-plan.md` và bổ sung trường theo dõi thời gian đăng nhập lần cuối (`lastLoginAt`).

### 1.1. Cập nhật Model `User` trong Prisma Schema

```prisma
// Enum định nghĩa Vai trò Người dùng
enum Role {
  ADMIN
  STAFF
  CUSTOMER
}

/// Bảng quản lý người dùng hệ thống (Khách hàng, Nhân viên, Quản trị viên)
model User {
  id          Int       @id @default(autoincrement())
  email       String    @unique @db.VarChar(255)
  password    String    @db.VarChar(255) // Hash bcrypt (saltRound = 12)
  fullName    String    @db.VarChar(100)
  phone       String?   @db.VarChar(20)
  avatarUrl   String?   @db.VarChar(500)
  role        Role      @default(CUSTOMER)
  isActive    Boolean   @default(true)
  lastLoginAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Indexes tối ưu truy vấn đăng nhập & kiểm tra vai trò
  @@index([email], name: "idx_user_email")
  @@index([role, isActive], name: "idx_user_role_active")
  @@map("users")
}
```

### 1.2. Ràng buộc Dữ liệu & Quy tắc Đăng nhập (Authentication Rules)
- **`email`**: Duy nhất, tự động `trim()` và `toLowerCase()` trước khi tra cứu DB.
- **`isActive`**: Nếu `isActive === false` (tài khoản bị khóa/đình chỉ), hệ thống BẮT BUỘC từ chối đăng nhập và trả về `401 Unauthorized` kèm thông báo phù hợp.
- **`password`**: Xác thực mật khẩu thông qua `bcrypt.compare(plainPassword, hashedPassword)`. CẤM so sánh chuỗi trực tiếp.
- **`lastLoginAt`**: Được cập nhật async ngay sau khi xác thực thông tin đăng nhập thành công.

---

## 2. Giao kèo API (API Contract)

### 2.1. API Đăng Nhập (Login Endpoint)

- **Method & Route:** `POST /api/v1/auth/login`
- **Auth Guard:** Public (Không yêu cầu Token)
- **Rate Limit (Chống Brute-Force Mật khẩu):** `@Throttle({ default: { limit: 5, ttl: 60000 } })` (Tối đa 5 lần thử đăng nhập / 1 phút / IP)

---

#### Request Body (`LoginDto`):

| Trường | Kiểu dữ liệu | Bắt buộc | Quy tắc Validation |
|---|---|---|---|
| `email` | `string` | **Có** | Email chuẩn, tự động `toLowerCase()` & `trim()` |
| `password` | `string` | **Có** | Tối thiểu 6 ký tự, không vượt quá 50 ký tự |

```typescript
// dtos/login.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có tối thiểu 6 ký tự' })
  @MaxLength(50, { message: 'Mật khẩu không vượt quá 50 ký tự' })
  password: string;
}
```

---

#### Header Trả về (Set-Cookie):

Khi đăng nhập thành công, Refresh Token tự động được gắn vào Cookie `HttpOnly`:
```http
Set-Cookie: refreshToken=<JWT_REFRESH_TOKEN>; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth; Max-Age=604800
```
- **`HttpOnly`**: Chống XSS đọc Token phía Client.
- **`Max-Age`**: 604,800 giây (7 ngày).

---

#### Response Success (200 OK):

```json
{
  "statusCode": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJKV1QiLCJ...",
    "user": {
      "id": 1,
      "email": "nguyenvana@gmail.com",
      "fullName": "Nguyễn Văn A",
      "phone": "0912345678",
      "avatarUrl": null,
      "role": "CUSTOMER",
      "lastLoginAt": "2026-08-09T13:40:00.000Z"
    }
  }
}
```

> ⚠️ **QUY TẮC BẢO MẬT BẮT BUỘC (AGENTS.md):**  
> Trong Response Payload **TUYỆT ĐỐI KHÔNG TRẢ VỀ TRƯỜNG `password`** hoặc thông tin nhạy cảm.

---

#### Response Failure (400 Bad Request - Validation Lỗi dữ liệu):

```json
{
  "statusCode": 400,
  "message": [
    "Email không đúng định dạng",
    "Mật khẩu phải có tối thiểu 6 ký tự"
  ],
  "error": "Bad Request"
}
```

---

#### Response Failure (401 Unauthorized - Sai Email / Mật khẩu hoặc Tài khoản bị khóa):

```json
{
  "statusCode": 401,
  "message": "Email hoặc mật khẩu không chính xác",
  "error": "Unauthorized"
}
```

---

#### Response Failure (429 Too Many Requests - Thử sai mật khẩu quá 5 lần/phút):

```json
{
  "statusCode": 429,
  "message": "Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 1 phút",
  "error": "Too Many Requests"
}
```

---

### 2.2. API Cấp Tái Tạo Token (Refresh Token Rotation Endpoint)

- **Method & Route:** `POST /api/v1/auth/refresh-token`
- **Auth Guard:** Public / Cookie Extract Guard
- **Rate Limit:** `@Throttle({ default: { limit: 10, ttl: 60000 } })`

---

#### Request Input:
Đọc `refreshToken` trực tiếp từ Header `Cookie`. Nếu không tìm thấy Cookie, trả về `401 Unauthorized`.

#### Response Success (200 OK):

Trả về `accessToken` mới và đồng thời xoay vòng Refresh Token thành `refreshToken` mới qua Header `Set-Cookie`.

```json
{
  "statusCode": 200,
  "message": "Làm mới phiên đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJKV1QiLCJ..."
  }
}
```

---

#### Kịch Bản Bảo Mật Replay Attack Detection (AGENTS.md & ARCHITECTURE.md):
1. Client gửi `refreshToken` chứa `jti = JTI_A` của `userId = 1`.
2. Kiểm tra Redis key `auth:refresh:1:JTI_A`.
3. **Nếu KHÔNG tồn tại hoặc ĐÃ BỊ XOÁ**:
   - Hệ thống phát tín hiệu **CẢNH BÁO BẢO MẬT (Security Replay Attack Alert)**.
   - Gọi lệnh Redis: Xóa **TOÀN BỘ** Refresh Token của user đó: `auth:refresh:1:*`.
   - Trả về `401 Unauthorized` kèm message: `"Phiên đăng nhập không hợp lệ hoặc đã bị thu hồi. Vui lòng đăng nhập lại"`.

---

### 2.3. API Đăng Xuất (Logout Endpoint)

- **Method & Route:** `POST /api/v1/auth/logout`
- **Auth Guard:** Protected (`JwtAuthGuard`) - BẮT BUỘC xác thực Access Token hợp lệ trước khi đưa vào Redis Blacklist (ngăn chặn spam rác RAM Redis).

---

#### Luồng Xử Lý Đăng Xuất (Logout Logic):
1. Extract `jti` và `exp` từ Access Token hiện tại.
2. Tính thời gian còn lại của Access Token: `ttl = exp - Math.floor(Date.now() / 1000)`.
3. Nếu `ttl > 0`, đưa `jti` của Access Token vào **Blacklist trên Redis**:
   - Key Format: `auth:blacklist:<access_jti>`
   - Command: `redis.setEx('auth:blacklist:' + access_jti, ttl, 'true')`
4. Đọc `refreshToken` từ Cookie, extract `refresh_jti` của Refresh Token và xóa khỏi Redis: `auth:refresh:<userId>:<refresh_jti>`.
5. Clear Cookie `refreshToken` phía client (Set `Max-Age=0`).

---

#### Response Success (200 OK):

```json
{
  "statusCode": 200,
  "message": "Đăng xuất thành công"
}
```

---

### 2.4. API Lấy Thông Tin Người Dùng Hiện Tại (Get Current Profile Endpoint)

- **Method & Route:** `GET /api/v1/auth/me`
- **Auth Guard:** Protected (`JwtAuthGuard` + `BlacklistMiddleware`)

---

#### Response Success (200 OK):

```json
{
  "statusCode": 200,
  "message": "Lấy thông tin tài khoản thành công",
  "data": {
    "id": 1,
    "email": "nguyenvana@gmail.com",
    "fullName": "Nguyễn Văn A",
    "phone": "0912345678",
    "avatarUrl": null,
    "role": "CUSTOMER",
    "createdAt": "2026-08-09T12:00:00.000Z",
    "lastLoginAt": "2026-08-09T13:40:00.000Z"
  }
}
```

---

## 3. Kiến trúc, Redis & Middleware Bảo mật (Architecture & Security Rules)

### 3.1. Cấu trúc Payload của JWT Token
- **Access Token (Hạn 15 phút):**
  ```json
  {
    "sub": 1,
    "email": "nguyenvana@gmail.com",
    "role": "CUSTOMER",
    "jti": "550e8400-e29b-41d4-a716-446655440000",
    "iat": 1786282800,
    "exp": 1786283700
  }
  ```
- **Refresh Token (Hạn 7 ngày):**
  ```json
  {
    "sub": 1,
    "jti": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "iat": 1786282800,
    "exp": 1786887600
  }
  ```

---

### 3.2. Quy Chuẩn Quản Lý Session trên Redis (`ioredis`)
- **TUYỆT ĐỐI KHÔNG** lưu chuỗi JWT token lên Redis (gây lãng phí bộ nhớ RAM). Chỉ lưu mã định danh `jti` (UUID v4).
- **Refresh Token Storage:**
  - Key: `auth:refresh:<userId>:<refresh_jti>`
  - Value: `"active"`
  - Lệnh tạo: `redis.setEx(key, 604800, 'active')` (Tự động xóa rác khi đủ 7 ngày).
- **Access Token Blacklist Storage:**
  - Key: `auth:blacklist:<access_jti>`
  - Value: `"blacklisted"`
  - Lệnh tạo: `redis.setEx(key, remainingTtlSeconds, 'blacklisted')`

---

### 3.3. Quy Định Middleware Bảo Vệ API (Jwt & Blacklist Guard)
1. **Bước 1 (Xác thực JWT Signature):** Verify Access Token với Secret Key. Nếu không hợp lệ hoặc hết hạn -> Trả về `401 Unauthorized` ngay lập tức mà chưa cần gọi Redis (giảm tải truy vấn cho Redis Server).
2. **Bước 2 (Kiểm tra Blacklist trên Redis):** Extract `jti` từ token đã verify. Gọi `redis.get('auth:blacklist:' + jti)`.
3. **Bước 3 (Xử lý kết quả):**
   - Nếu tồn tại key trong Blacklist -> Trả về `401 Unauthorized` (`"Token đã bị vô hiệu hóa do đăng xuất"`).
   - Nếu không có -> Cho phép request đi tiếp vào Controller và gán thông tin user vào `req.user`.

---

## 4. Cấu trúc Module NestJS Đề xuất

```
app/backend/src/modules/auth/
├── dtos/
│   ├── register.dto.ts               ← DTO Đăng ký
│   └── login.dto.ts                  ← DTO Đăng nhập
├── interfaces/
│   ├── auth-response.interface.ts    ← Interface Login/Register Response
│   └── jwt-payload.interface.ts      ← Interface JWT Access/Refresh Payload
├── guards/
│   ├── jwt-auth.guard.ts             ← Guard bảo vệ API yêu cầu xác thực
│   └── roles.guard.ts                ← Guard phân quyền (ADMIN, STAFF, CUSTOMER)
├── decorators/
│   ├── current-user.decorator.ts     ← Custom decorator lấy user từ req.user
│   └── roles.decorator.ts            ← Custom decorator gắn roles metadata
├── auth.controller.ts                ← Controller xử lý routes: /login, /refresh-token, /logout, /me
├── auth.service.ts                   ← Service chứa Business Logic (Login, Verify Pass, Sign Token, Redis ops)
├── auth.module.ts                    ← NestJS AuthModule (Import Passport, Jwt, RedisModule)
└── strategies/
    └── jwt.strategy.ts               ← Passport Jwt Strategy xác thực Bearer Token
```

---

## 5. Kế hoạch Triển khai (Step-by-Step Execution Plan)

1. **Cập nhật Prisma Schema:**
   - Thêm trường `lastLoginAt DateTime?` vào `model User`.
   - Chạy `npx prisma db push` hoặc `npx prisma migrate dev` để đồng bộ cơ sở dữ liệu.
2. **Tạo DTO & Interface:**
   - Tạo `dtos/login.dto.ts` với đầy đủ `class-validator` và `class-transformer`.
   - Tạo `interfaces/jwt-payload.interface.ts` định nghĩa cấu trúc `JwtPayload` (chứa `sub`, `email`, `role`, `jti`).
3. **Phát triển Logic trong `AuthService`:**
   - `login(loginDto: LoginDto)`: Tìm user theo email -> kiểm tra `isActive` -> so sánh `bcrypt.compare()` -> tạo JWT Access & Refresh Token -> lưu `jti` vào Redis -> cập nhật `lastLoginAt`.
   - `refreshToken(refreshTokenStr: string)`: Parse token -> check Redis -> nếu thiếu `jti` thì xóa sạch `auth:refresh:<userId>:*` (xử lý Replay Attack) -> nếu có thì revoke old `jti` & phát hành cặp token mới.
   - `logout(user: JwtPayload, refreshTokenStr?: string)`: Đưa access `jti` vào Redis Blacklist với TTL tương ứng + xóa refresh `jti`.
   - `getProfile(userId: number)`: Truy vấn DB lấy thông tin user mới nhất (loại bỏ `password`).
4. **Cấu hình `AuthController`:**
   - Định nghĩa route `POST /login` (Gắn Cookie `refreshToken` HttpOnly).
   - Định nghĩa route `POST /refresh-token` (Đọc Cookie, xoay token, Set-Cookie mới).
   - Định nghĩa route `POST /logout` (Xóa Cookie, blacklist Access Token).
   - Định nghĩa route `GET /me` (Bảo vệ bởi `JwtAuthGuard`).
5. **Cấu hình Middleware / Guard Blacklist:**
   - Đảm bảo `JwtStrategy` kiểm tra `jti` trên Redis Blacklist trước khi chấp nhận `req.user`.
6. **Kiểm thử Tích hợp & Bảo mật (Integration & Security Test):**
   - Đăng nhập thành công -> Nhận 200 OK + `accessToken` + Cookie `refreshToken` (HttpOnly).
   - Đăng nhập sai pass -> Trả 401 Unauthorized.
   - Thử spam sai quá 5 lần/phút -> Trả 429 Too Many Requests.
   - Gọi `/refresh-token` -> Đổi sang Refresh Token mới, token cũ bị thu hồi.
   - Sử dụng lại Refresh Token cũ (Replay Attack) -> Hệ thống phát hiện, tự động đăng xuất tất cả thiết bị của user.
   - Gọi `/logout` -> Token hiện tại không thể dùng để truy cập `/me` (trả 401).

