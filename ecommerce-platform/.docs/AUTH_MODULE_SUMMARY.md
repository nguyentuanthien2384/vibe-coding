# TỔNG QUAN & LỊCH SỬ PHÁT TRIỂN MODULE AUTH (AUTHENTICATION & USER MANAGEMENT)

Tài liệu ghi nhận toàn bộ kiến trúc, API contracts, cơ chế bảo mật Redis/JWT, kiến trúc BFF Next.js và lịch sử phát triển của Module Auth trong dự án TechBite E-Commerce Platform.

---

## 1. MỤC TIÊU & TECH STACK

- **Backend (`apps/backend`):** NestJS, Prisma ORM, MySQL, Redis (`ioredis`), Passport JWT, Bcrypt.
- **Frontend / BFF (`apps/frontend`):** Next.js App Router, React, Tailwind CSS, TypeScript, Zustand.
- **Bảo mật Cookie:** `accessToken` (15m) & `refreshToken` (7d) được lưu trữ kiên cố dưới dạng **HttpOnly Cookies** (`sameSite: 'lax'`, `path: '/'`). TUYỆT ĐỐI không lưu Token hoặc thông tin User dạng Plain Text xuống LocalStorage.

---

## 2. CẤU TRÚC DỮ LIỆU DATABASE (MYSQL PRISMA SCHEMA)

```prisma
enum Role {
  ADMIN
  STAFF
  CUSTOMER
}

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

  @@index([email], name: "idx_user_email")
  @@index([role, isActive], name: "idx_user_role_active")
  @@map("users")
}
```

---

## 3. QUY CHUẨN XÁC THỰC MẬT KHẨU & DỮ LIỆU

- **Mã hóa mật khẩu:** Sử dụng `bcrypt` với **12 salt rounds**.
- **Độ mạnh mật khẩu (Password Strength Rule):**
  - Độ dài: Từ 6 đến 50 ký tự (`MinLength(6)`, `MaxLength(50)`).
  - Định dạng: Bắt buộc chứa ít nhất **1 chữ cái** và **1 chữ số** (`/^(?=.*[a-zA-Z])(?=.*\d)/`).
  - Áp dụng đồng bộ 100% cho cả chức năng **Đăng ký tài khoản** và **Đổi mật khẩu**.

---

## 4. DANH SÁCH API ENDPOINTS FULL-STACK

| Chức năng | NestJS Backend Route | Next.js BFF Route | Phương thức | Bảo mật |
| :--- | :--- | :--- | :---: | :---: |
| **Đăng ký tài khoản** | `POST /api/v1/auth/register` | `POST /api/auth/register` | `POST` | Public (`@Throttle`) |
| **Đăng nhập** | `POST /api/v1/auth/login` | `POST /api/auth/login` | `POST` | Public (`@Throttle`) |
| **Làm mới Token** | `POST /api/v1/auth/refresh-token` | `POST /api/auth/refresh` | `POST` | Refresh Token Cookie |
| **Đăng xuất** | `POST /api/v1/auth/logout` | `POST /api/auth/logout` | `POST` | `JwtAuthGuard` |
| **Lấy thông tin tài khoản** | `GET /api/v1/auth/me` | `GET /api/auth/me` | `GET` | `JwtAuthGuard` |
| **Cập nhật hồ sơ cá nhân** | `PATCH /api/v1/auth/profile` | `PATCH /api/auth/profile` | `PATCH` | `JwtAuthGuard` |
| **Đổi mật khẩu** | `PATCH /api/v1/auth/change-password` | `POST /api/auth/change-password` | `PATCH` | `JwtAuthGuard` (`@Throttle`) |

---

## 5. CƠ CHẾ BẢO MẬT PHIÊN LÀM VIỆC TRÊN REDIS

1. **Quản lý Refresh Token Active:**
   - Key: `auth:refresh:${userId}:${refreshJti}`
   - Value: `active`
   - TTL: 7 ngày (604,800 giây).

2. **Cơ chế Chống Replay Attack (Refresh Token Rotation):**
   - Khi refresh token, hệ thống hủy token cũ và cấp cặp token mới.
   - Nếu phát hiện Refresh Token cũ/đã thu hồi cố tình được dùng lại, hệ thống lập tức xóa **toàn bộ** Refresh Token `auth:refresh:${userId}:*` trên Redis để ép tất cả thiết bị đăng nhập lại.

3. **Danh sách Đen Access Token (Single-device Blacklist):**
   - Key: `auth:blacklist:${accessJti}`
   - Value: `true`
   - TTL: Thời gian còn lại của Access Token (`exp - nowSeconds`).

4. **Vô hiệu hóa Token Đa Trình Duyệt khi Đổi Mật Khẩu (Multi-device Invalidation):**
   - Key: `auth:password_changed:${userId}`
   - Value: Timestamp đổi mật khẩu (giây).
   - TTL: 15 phút (900 giây, bằng đúng lifetime của Access Token).
   - Trong `JwtStrategy`: So sánh `payload.iat < passwordChangedAt` ➔ Nếu token được tạo trước mốc đổi mật khẩu, lập tức từ chối **401 Unauthorized** trên mọi thiết bị.

---

## 6. KIẾN TRÚC FRONTEND & BFF (NEXT.JS & ZUSTAND)

- **`lib/server-api.ts` (Server Interceptor):** Tự động bắt 401 Unauthorized phía Next.js Server (Server Components, Route Handlers), đọc refresh token từ `cookies()`, gọi NestJS refresh token và tự động retry request gốc.
- **`lib/client-api.ts` (Client Interceptor):** Quản lý cờ `isRefreshing` và hàng đợi `failedQueue` chống race-condition khi nhiều request client đồng thời gặp 401.
- **`useAuthInit` Hook:** Khởi tạo và khôi phục phiên đăng nhập người dùng khi ứng dụng mount hoặc F5.
- **`useAuthStore` (Zustand):** Quản lý state `user` và `isAuthenticated` trên bộ nhớ RAM.

---

## 7. LỊCH SỬ PHÁT TRIỂN & CÁC MỐC HOÀN THÀNH

### 📅 [2026-08-09] UI Module Auth & Profile
- Thiết kế và dựng hoàn chỉnh giao diện Stitch/Tailwind CSS cho 3 màn hình: Đăng nhập, Đăng ký, Hồ sơ cá nhân.

### 📅 [2026-08-09] API Đăng ký & Tự động đăng nhập
- Xây dựng Next.js Route Handler `/api/auth/register` và NestJS `POST /api/v1/auth/register`.
- Thiết lập Cookie `HttpOnly` cho `accessToken` & `refreshToken`.

### 📅 [2026-08-09] API Đăng nhập & Quản lý phiên Redis
- Xây dựng NestJS `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`.
- Mã hóa `bcrypt` 12 salt rounds, lưu JTI trên Redis, hỗ trợ Blacklist token khi logout.

### 📅 [2026-08-09] Tự động Refresh Token (Client & Server)
- Xây dựng `lib/client-api.ts` và `lib/server-api.ts` tự động bắt 401, refresh token và retry request mượt mà trên cả Client Component và Server Component.

### 📅 [2026-08-09] Khôi phục phiên đăng nhập khi F5 (Auth Hydration)
- Tạo hook `useAuthInit`, sửa lỗi Prisma Client role export, đồng bộ tên người dùng lên Header realtime.

### 📅 [2026-08-09] Tích hợp API Profile & Chỉnh sửa hồ sơ cá nhân
- Xây dựng `PATCH /api/v1/auth/profile`, hỗ trợ chỉnh sửa Họ tên, Số điện thoại, Ảnh đại diện với 3 trạng thái **Loading, Success, Error**.
- Đồng bộ thông tin tên người dùng hiển thị trên Header tức thì không cần F5.

### 📅 [2026-08-09] Chức năng Đổi mật khẩu & Thu hồi Token Đa thiết bị
- Xây dựng `PATCH /api/v1/auth/change-password` xác thực mật khẩu cũ bằng bcrypt.
- Đồng bộ 100% quy tắc độ mạnh mật khẩu với chức năng Đăng ký.
- Xây dựng cơ chế thu hồi toàn bộ token đa thiết bị qua mốc thời gian `auth:password_changed:${userId}` trên Redis kết hợp kiểm tra `iat` trong `JwtStrategy`. Tự động xóa cookies và điều hướng về `/login` khi đổi mật khẩu thành công.
