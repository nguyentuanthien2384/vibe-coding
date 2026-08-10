# DANH SÁCH ENDPOINTS API: MODULE THANH TOÁN (CHECKOUT MODULE)

> **Tài Liệu Kế Hoạch:** `.docs/backend-plans/checkout-plan.md`  
> **Framework:** NestJS (TypeScript)  
> **Trạng thái:** 🟢 Đã hoàn thành (Built & Compiled Cleanly)  
> **Cập nhật:** 2026-08-09  

---

## 1. Danh Sách Endpoints API Thực Tế

### 1.1 `POST /api/v1/vouchers/apply`
- **Mục đích:** Kiểm tra & tính toán số tiền giảm giá của Mã giảm giá (Voucher).
- **Quyền truy cập:** Public / Guest / Customer
- **Validation DTO:** `ApplyVoucherDto` (`code: string`, `subtotal: number`)
- **Rate Limit:** 30 requests/phút
- **Source File:** [vouchers.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/vouchers/vouchers.controller.ts) & [vouchers.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/vouchers/vouchers.service.ts)

---

### 1.2 `POST /api/v1/orders`
- **Mục đích:** Khởi tạo đơn hàng mới, kiểm tra tồn kho & trừ stock nguyên tử (`prisma.$transaction`), tự động dọn dẹp giỏ hàng DB và tạo thông tin VietQR nếu chọn thanh toán chuyển khoản.
- **Quyền truy cập:** Optional (Hỗ trợ cả Guest vãng lai qua `X-Session-ID` Header và User đã đăng nhập qua Bearer Token Cookie)
- **Validation DTO:** `CreateOrderDto` (`customerInfo`, `shippingAddress`, `shippingMethod`, `paymentMethod`, `voucherCode`, `orderNote`)
- **Rate Limit:** 10 requests/phút (Chống spam đặt đơn)
- **Source File:** [orders.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/orders/orders.controller.ts) & [orders.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/orders/orders.service.ts)

---

### 1.3 `GET /api/v1/orders/:orderCode/status`
- **Mục đích:** Polling từ Frontend 3s/lần để tra cứu trạng thái thanh toán đơn hàng (`PENDING` | `PAID` | `EXPIRED`).
- **Quyền truy cập:** Public
- **Rate Limit:** 120 requests/phút
- **Source File:** [orders.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/orders/orders.controller.ts) & [orders.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/orders/orders.service.ts)

---

### 1.4 `POST /api/v1/orders/webhook/payment`
- **Mục đích:** Cổng tiếp nhận Webhook biến động số dư từ Ngân hàng / VietQR, tự động cập nhật đơn hàng thành `PAID` & `CONFIRMED`. Sử dụng Redis (`webhook:processed:${txId}`) để chống Replay Attack và Idempotency.
- **Quyền truy cập:** Bank Webhook Gateway
- **Validation DTO:** `PaymentWebhookDto` (`transactionId`, `amount`, `transferContent`, `bankAccount`)
- **Rate Limit:** 100 requests/phút
- **Source File:** [orders.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/orders/orders.controller.ts) & [orders.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/orders/orders.service.ts)

---

### 1.5 `GET /api/v1/orders/my-orders`
- **Mục đích:** Lấy danh sách lịch sử đơn hàng của Khách hàng đã đăng nhập có phân trang (`page`, `limit`).
- **Quyền truy cập:** Customer (`JwtAuthGuard`)
- **Rate Limit:** 30 requests/phút
- **Source File:** [orders.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/orders/orders.controller.ts) & [orders.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/orders/orders.service.ts)

---

## 2. Các File Vật Lý Được Tạo Mới & Cập Nhật

1. `app/backend/src/vouchers/dto/apply-voucher.dto.ts`
2. `app/backend/src/vouchers/vouchers.service.ts`
3. `app/backend/src/vouchers/vouchers.controller.ts`
4. `app/backend/src/vouchers/vouchers.module.ts`
5. `app/backend/src/orders/dto/create-order.dto.ts`
6. `app/backend/src/orders/dto/payment-webhook.dto.ts`
7. `app/backend/src/orders/orders.service.ts`
8. `app/backend/src/orders/orders.controller.ts`
9. `app/backend/src/orders/orders.module.ts`
10. `app/backend/src/app.module.ts` (Đã khai báo `VouchersModule` & `OrdersModule`)
