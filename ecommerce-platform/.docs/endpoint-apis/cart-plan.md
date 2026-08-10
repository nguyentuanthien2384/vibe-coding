# CART MODULE — API Endpoints

> **Source Plan:** `.docs/backend-plans/cart-plan.md`  
> **Module:** `src/cart/`  
> **Base URL:** `/api/v1/cart`

---

## Endpoints Summary

| # | Method | Route | Handler | Auth | Description |
|---|--------|-------|---------|------|-------------|
| 1 | `GET` | `/api/v1/cart` | `CartController.getCart` | Optional JWT / Guest Session | Lấy chi tiết giỏ hàng & tổng tiền tệ |
| 2 | `POST` | `/api/v1/cart/items` | `CartController.addToCart` | Optional JWT / Guest Session | Thêm sản phẩm vào giỏ hàng (Check tồn kho) |
| 3 | `PATCH` | `/api/v1/cart/items/:id` | `CartController.updateCartItem` | Optional JWT / Guest Session | Cập nhật số lượng sản phẩm |
| 4 | `DELETE` | `/api/v1/cart/items/:id` | `CartController.removeCartItem` | Optional JWT / Guest Session | Xóa 1 dòng sản phẩm khỏi giỏ hàng |
| 5 | `DELETE` | `/api/v1/cart` | `CartController.clearCart` | Optional JWT / Guest Session | Xóa toàn bộ giỏ hàng |
| 6 | `POST` | `/api/v1/cart/merge` | `CartController.mergeCart` | Required JWT (`JwtAuthGuard`) | Đồng bộ giỏ hàng vãng lai sau đăng nhập |

---

## Endpoint Details

### 1. `GET /api/v1/cart`
Lấy danh sách sản phẩm và tổng giá trị thanh toán của Giỏ hàng (hỗ trợ User đăng nhập hoặc Guest qua Header `X-Session-ID`).

#### Response Success (200 OK):
```json
{
  "statusCode": 200,
  "message": "Lấy thông tin giỏ hàng thành công",
  "data": {
    "cartId": 12,
    "totalItems": 3,
    "subtotal": 120000,
    "shippingFee": 0,
    "discount": 0,
    "total": 120000,
    "items": [
      {
        "id": 101,
        "productId": 201,
        "name": "Bắp Rang Bơ Caramel Jumbo Gói 200g",
        "slug": "bap-rang-bo-caramel-jumbo-200g",
        "imageUrl": "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=200&h=200&fit=crop",
        "price": 45000,
        "originalPrice": 55000,
        "quantity": 2,
        "stock": 50,
        "isAvailable": true,
        "itemTotal": 90000
      }
    ]
  }
}
```

---

### 2. `POST /api/v1/cart/items`
Thêm sản phẩm vào giỏ hàng. Tự động cộng dồn số lượng nếu sản phẩm đã có sẵn.

#### Request Body (`AddToCartDto`):
```json
{
  "productId": 201,
  "quantity": 2
}
```

#### Response Error (400 Bad Request - Tồn kho không đủ):
```json
{
  "statusCode": 400,
  "message": "Số lượng yêu cầu (12) vượt quá tồn kho khả dụng (5) của sản phẩm",
  "error": "Bad Request"
}
```

---

### 3. `PATCH /api/v1/cart/items/:id`
Cập nhật số lượng của dòng sản phẩm có ID `:id`.

#### Request Body (`UpdateCartItemDto`):
```json
{
  "quantity": 3
}
```

---

### 4. `DELETE /api/v1/cart/items/:id`
Xóa sản phẩm ra khỏi giỏ hàng.

---

### 5. `DELETE /api/v1/cart`
Clear toàn bộ sản phẩm trong giỏ hàng.

---

### 6. `POST /api/v1/cart/merge`
Gộp giỏ hàng vãng lai (Guest) từ LocalStorage client vào giỏ hàng tài khoản DB sau khi Đăng Nhập.

#### Request Body (`MergeCartDto`):
```json
{
  "items": [
    { "productId": 201, "quantity": 2 },
    { "productId": 202, "quantity": 1 }
  ]
}
```

---

## Files Created & Registered

| File | Action | Description |
|------|--------|-------------|
| [src/auth/guards/optional-jwt-auth.guard.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/guards/optional-jwt-auth.guard.ts) | NEW | Guard hỗ trợ Optional User Authentication |
| [src/cart/dto/add-to-cart.dto.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/cart/dto/add-to-cart.dto.ts) | NEW | Validation DTO cho thêm giỏ hàng |
| [src/cart/dto/update-cart-item.dto.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/cart/dto/update-cart-item.dto.ts) | NEW | Validation DTO cho cập nhật số lượng |
| [src/cart/dto/merge-cart.dto.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/cart/dto/merge-cart.dto.ts) | NEW | Validation DTO cho gộp giỏ hàng vãng lai |
| [src/cart/interfaces/cart.interface.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/cart/interfaces/cart.interface.ts) | NEW | TypeScript Interfaces cho Cart Response |
| [src/cart/cart.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/cart/cart.service.ts) | NEW | Service tính toán tiền, check stock, Prisma queries |
| [src/cart/cart.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/cart/cart.controller.ts) | NEW | Controller định nghĩa 6 API Endpoints |
| [src/cart/cart.module.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/cart/cart.module.ts) | NEW | NestJS Module chứa Cart components |
| [src/app.module.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/app.module.ts) | MODIFIED | Đăng ký CartModule vào AppModule |
