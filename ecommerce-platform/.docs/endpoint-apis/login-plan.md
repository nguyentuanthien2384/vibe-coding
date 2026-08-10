# DANH SÁCH ENDPOINTS API: MODULE AUTH - ĐĂNG NHẬP, REFRESH TOKEN & SESSION

> **Nguồn Plan:** `.docs/backend-plans/login-plan.md`  
> **Backend Service:** NestJS (`app/backend`)  
> **Base URL:** `http://localhost:3001/api/v1/auth`  

---

## 1. Danh sách Endpoints đã xây dựng

| STT | Method | Route | Auth Guard | Description | File xử lý |
|---|---|---|---|---|---|
| 1 | `POST` | `/api/v1/auth/login` | Public (Throttle 5/phút) | Đăng nhập tài khoản bằng email & password, hash bcrypt 12, cấp Access Token & Set Cookie `refreshToken` (HttpOnly). | [auth.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/auth.controller.ts) |
| 2 | `POST` | `/api/v1/auth/refresh-token` | Public (Throttle 10/phút) | Đổi Access Token mới bằng Refresh Token từ Cookie, xoay vòng Refresh Token & chống Replay Attack (Hủy tất cả session nếu phát hiện token bị tái sử dụng). | [auth.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/auth.controller.ts) |
| 3 | `POST` | `/api/v1/auth/logout` | Protected (`JwtAuthGuard`) | Đăng xuất người dùng, đưa Access Token JTI hiện tại vào Redis Blacklist với TTL tương ứng & xóa Refresh Token + Clear Cookie. | [auth.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/auth.controller.ts) |
| 4 | `GET` | `/api/v1/auth/me` | Protected (`JwtAuthGuard`) | Lấy thông tin chi tiết tài khoản cá nhân hiện tại (Không trả về mật khẩu). | [auth.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/auth.controller.ts) |

---

## 2. Chi tiết các File Code đã khởi tạo / cập nhật

1. **[app/backend/src/auth/dto/login.dto.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/dto/login.dto.ts)**: Validation DTO cho email (trim + lowercase) & password (min 6 chars).
2. **[app/backend/src/auth/interfaces/auth-response.interface.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/interfaces/auth-response.interface.ts)**: Định nghĩa interface response, `JwtPayload`, `JwtRefreshPayload`, `AuthUserResponse` (bổ sung `lastLoginAt`).
3. **[app/backend/src/auth/strategies/jwt.strategy.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/strategies/jwt.strategy.ts)**: Passport Strategy xác thực Bearer token & kiểm tra Blacklist trên Redis (`auth:blacklist:<jti>`).
4. **[app/backend/src/auth/guards/jwt-auth.guard.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/guards/jwt-auth.guard.ts)**: Guard bắt buộc xác thực token.
5. **[app/backend/src/auth/guards/roles.guard.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/guards/roles.guard.ts)**: Guard phân quyền theo vai trò người dùng (ADMIN, STAFF, CUSTOMER).
6. **[app/backend/src/auth/decorators/current-user.decorator.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/decorators/current-user.decorator.ts)**: Decorator trích xuất `req.user`.
7. **[app/backend/src/auth/decorators/roles.decorator.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/decorators/roles.decorator.ts)**: Decorator thiết lập vai trò `@Roles(...)`.
8. **[app/backend/src/auth/auth.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/auth.service.ts)**: Xử lý toàn bộ logic nghiệp vụ (compare bcrypt 12, sign JWT 15m/7d, lưu JTI Redis, Replay Attack mitigation, Logout Blacklist Redis, update `lastLoginAt`).
9. **[app/backend/src/auth/auth.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/auth.controller.ts)**: Routing endpoints, Throttler rate limiting, Set-Cookie HttpOnly.
10. **[app/backend/src/auth/auth.module.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/auth.module.ts)**: Đăng ký Passport, JwtModule, RedisModule, Strategy & Guards.
11. **[app/backend/src/redis/redis.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/redis/redis.service.ts)**: Bổ sung `delByPattern()` để xóa toàn bộ token rác/Replay Attack theo pattern.
