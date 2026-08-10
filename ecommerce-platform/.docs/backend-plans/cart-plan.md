# BẢN THIẾT KẾ BACK-END: MODULE GIỎ HÀNG (SHOPPING CART)

> **Tài liệu tham chiếu:** `.docs/ideas/02-cart-idea.md`, `.docs/frontend-plans/02-cart-plan.md`, `.docs/ARCHITECTURE.md`  
> **Tech Stack:** NestJS, Prisma ORM, MySQL, Redis, NestJS Throttler, class-validator  

---

## 1. Thiết kế Dữ liệu (Database Schema - Prisma / MySQL)

Module **Giỏ hàng (Cart)** lưu trữ thông tin sản phẩm tạm thời của người dùng trước khi tiến hành tạo đơn hàng (Checkout).  
Hệ thống hỗ trợ cả người dùng đã đăng nhập (lưu DB MySQL) và khách vãng lai (Guest Cart qua Session / LocalStorage client và đồng bộ qua API Merge Cart).

### 1.1. Bảng `Cart` (Giỏ Hàng)

```prisma
/// Bảng Giỏ hàng (Mỗi User có tối đa 1 Giỏ hàng chủ động)
model Cart {
  id        Int        @id @default(autoincrement())
  userId    Int?       @unique // 1 User có tối đa 1 Cart chủ động (FK -> User.id)
  sessionId String?    @unique @db.VarChar(255) // Session ID cho Guest chưa Login
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  user      User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]

  @@index([userId], name: "idx_cart_user")
  @@index([sessionId], name: "idx_cart_session")
  @@map("carts")
}
```

### 1.2. Bảng `CartItem` (Chi Tiết Giỏ Hàng)

```prisma
/// Chi tiết từng dòng sản phẩm nằm trong Giỏ Hàng
model CartItem {
  id        Int      @id @default(autoincrement())
  cartId    Int      // FK -> Cart.id
  productId Int      // FK -> Product.id
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  cart    Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([cartId, productId], name: "idx_cart_product_unique")
  @@index([cartId], name: "idx_cart_items_cart")
  @@map("cart_items")
}
```

### 1.3. Cập nhật Model Sẵn Có trong `prisma/schema.prisma`

- **Model `User`**: Bổ sung quan hệ 1-1 `cart Cart?`
- **Model `Product`**: Bổ sung quan hệ 1-n `cartItems CartItem[]`

---

## 2. Giao kèo API (API Contract)

### Các Quy tắc Nghiệp vụ Cốt lõi (Critical Business Rules):
1. **Tính toán giá tiền (Pricing Integrity):** Mọi phép tính tiền (`subtotal`, `shippingFee`, `discount`, `total`) BẮT BUỘC thực hiện ở Backend dựa trên giá thực tế của sản phẩm (`salePrice ?? price`). Frontend KHÔNG ĐƯỢC PHÉP truyền giá tiền.
2. **Kiểm tra Tồn kho (Stock Guard):** Khi thêm sản phẩm hoặc đổi số lượng, API kiểm tra `product.stock >= quantity` và `product.isActive === true`. Nếu vi phạm, trả về lỗi 400 Bad Request.
3. **Phí giao hàng (Shipping Fee Logic):** Miễn phí giao hàng cho đơn từ 200,000 VNĐ. Đơn dưới 200,000 VNĐ tính phí cố định 30,000 VNĐ.

---

### 2.1. Lấy chi tiết giỏ hàng (`GET /api/v1/cart`)

- **Method & Route:** `GET /api/v1/cart`
- **Auth Guard:** Optional JWT Auth (Nêu có Token ➔ Lấy giỏ của User; Nếu không có Token ➔ Đọc `X-Session-ID` Header để lấy giỏ Guest).
- **Rate Limit:** `@Throttle({ default: { limit: 100, ttl: 60000 } })`

#### Header Request:
- `Authorization: Bearer <access_token>` (Tùy chọn)
- `X-Session-ID: <uuid_v4>` (Tùy chọn cho Guest)

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
      },
      {
        "id": 102,
        "productId": 202,
        "name": "Sữa Bắp Non Hạt Óc Chó TechBite 330ml",
        "slug": "sua-bap-non-hat-oc-cho-techbite-330ml",
        "imageUrl": "https://images.unsplash.com/photo-1556881286-fc6915169721?w=200&h=200&fit=crop",
        "price": 30000,
        "originalPrice": null,
        "quantity": 1,
        "stock": 10,
        "isAvailable": true,
        "itemTotal": 30000
      }
    ]
  }
}
```

---

### 2.2. Thêm sản phẩm vào giỏ hàng (`POST /api/v1/cart/items`)

- **Method & Route:** `POST /api/v1/cart/items`
- **Auth Guard:** Optional JWT Auth / Guest Session Header.
- **Rate Limit:** `@Throttle({ default: { limit: 60, ttl: 60000 } })`

#### Request Body (`AddToCartDto`):

```typescript
export class AddToCartDto {
  @IsInt({ message: 'productId phải là số nguyên' })
  @Min(1, { message: 'productId không hợp lệ' })
  productId: number;

  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  @Max(99, { message: 'Số lượng tối đa cho mỗi sản phẩm là 99' })
  quantity: number;
}
```

#### Response Success (201 Created):

```json
{
  "statusCode": 201,
  "message": "Đã thêm sản phẩm vào giỏ hàng",
  "data": {
    "cartId": 12,
    "totalItems": 4,
    "subtotal": 165000,
    "shippingFee": 0,
    "discount": 0,
    "total": 165000
  }
}
```

#### Response Error (400 Bad Request - Vượt quá tồn kho):

```json
{
  "statusCode": 400,
  "message": "Số lượng yêu cầu (12) vượt quá số lượng tồn kho khả dụng (5)",
  "error": "Bad Request"
}
```

---

### 2.3. Cập nhật số lượng sản phẩm trong giỏ (`PATCH /api/v1/cart/items/:id`)

- **Method & Route:** `PATCH /api/v1/cart/items/:id`
- **Auth Guard:** Optional JWT Auth / Guest Session Header.
- **Params:** `id`: `number` (ID của `CartItem`)

#### Request Body (`UpdateCartItemDto`):

```typescript
export class UpdateCartItemDto {
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  @Max(99, { message: 'Số lượng tối đa là 99' })
  quantity: number;
}
```

#### Response Success (200 OK):

```json
{
  "statusCode": 200,
  "message": "Cập nhật số lượng sản phẩm thành công",
  "data": {
    "cartId": 12,
    "updatedItem": {
      "id": 101,
      "productId": 201,
      "quantity": 3,
      "itemTotal": 135000
    },
    "subtotal": 165000,
    "total": 165000
  }
}
```

---

### 2.4. Xóa 1 sản phẩm khỏi giỏ (`DELETE /api/v1/cart/items/:id`)

- **Method & Route:** `DELETE /api/v1/cart/items/:id`
- **Auth Guard:** Optional JWT Auth / Guest Session Header.
- **Params:** `id`: `number` (ID của `CartItem`)

#### Response Success (200 OK):

```json
{
  "statusCode": 200,
  "message": "Đã xóa sản phẩm khỏi giỏ hàng",
  "data": {
    "cartId": 12,
    "totalItems": 2
  }
}
```

---

### 2.5. Xóa toàn bộ giỏ hàng (`DELETE /api/v1/cart`)

- **Method & Route:** `DELETE /api/v1/cart`
- **Auth Guard:** Optional JWT Auth / Guest Session Header.

#### Response Success (200 OK):

```json
{
  "statusCode": 200,
  "message": "Đã dọn dẹp toàn bộ giỏ hàng",
  "data": {
    "cartId": 12,
    "totalItems": 0
  }
}
```

---

### 2.6. Đồng bộ Giỏ hàng Guest sau khi Đăng nhập (`POST /api/v1/cart/merge`)

- **Method & Route:** `POST /api/v1/cart/merge`
- **Auth Guard:** `JwtAuthGuard` (Bắt buộc người dùng đã authenticated).
- **Mục đích:** Khi người dùng mua sắm với vai trò Guest (lưu giỏ ở LocalStorage / Guest Session) và bấm Đăng nhập, Frontend gửi danh sách sản phẩm Guest lên để gộp vào giỏ hàng lưu ở DB MySQL của User.

#### Request Body (`MergeCartDto`):

```typescript
export class MergeCartItemDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number;
}

export class MergeCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MergeCartItemDto)
  items: MergeCartItemDto[];
}
```

#### Logic Xử Lý Merge Cart:
1. Lấy hoặc tạo `Cart` cho `userId` hiện tại.
2. Lặp qua danh sách `items` từ client gửi lên:
   - Nếu sản phẩm đã có trong DB Cart của User ➔ Cộng dồn số lượng.
   - Nếu sản phẩm chưa có trong DB Cart ➔ Tạo `CartItem` mới.
   - Kiểm tra giới hạn `stock` của sản phẩm. Nếu số lượng sau gộp > `stock`, tự động clamp về giá trị `stock` khả dụng tối đa.
3. Trả về Giỏ hàng hoàn chỉnh đã đồng bộ.

---

## 3. Kiến trúc, Caching & Tối ưu Hiệu năng (Architecture & Caching)

### 3.1. Cấu trúc Module NestJS Đề xuất

```text
app/backend/src/modules/cart/
├── dtos/
│   ├── add-to-cart.dto.ts        ← Validation cho thêm vào giỏ
│   ├── update-cart-item.dto.ts   ← Validation cho sửa số lượng
│   └── merge-cart.dto.ts         ← Validation cho đồng bộ giỏ hàng
├── interfaces/
│   └── cart.interface.ts         ← Type definitions cho Response Giỏ hàng & Items
├── cart.controller.ts            ← Định nghĩa 6 endpoints API Giỏ hàng
├── cart.service.ts               ← Logic tính tiền, stock guard, merge cart & Prisma CRUD
└── cart.module.ts                ← NestJS Module registration
```

### 3.2. Caching & Quản lý Session
- **Redis Cache Giỏ Hàng:** Lưu Cache kết quả tính toán giỏ hàng theo key `cache:cart:user:<userId>` hoặc `cache:cart:session:<sessionId>` với TTL = 300 giây (5 phút). Invalidated ngay khi có thao tác Add/Update/Delete/Merge hoặc khi sản phẩm trong giỏ bị thay đổi giá/stock.
- **Xóa Giỏ Hàng Tự Động (Cleanup Job):** Giỏ hàng Guest (`sessionId != null` và `userId == null`) không hoạt động quá 30 ngày sẽ được dọn dẹp định kỳ bằng Cron Job / BullMQ worker để chống phình DB MySQL.

---

## 4. Kế hoạch Triển khai (Execution Checklist)

1. **Prisma Schema Update:**
   - Thêm model `Cart`, `CartItem` vào `prisma/schema.prisma`.
   - Cập nhật quan hệ trong `User` và `Product`.
   - Chạy `npx prisma db push` (hoặc migration) & `npx prisma generate`.
2. **DTOs & Interfaces:**
   - ĐỊnh nghĩa `AddToCartDto`, `UpdateCartItemDto`, `MergeCartDto`.
   - Định nghĩa `ICartResponse`, `ICartItemResponse`.
3. **Cart Service:**
   - Cài đặt các hàm: `getCart()`, `addToCart()`, `updateCartItem()`, `removeCartItem()`, `clearCart()`, `mergeCart()`.
   - Đảm bảo 100% tính toán giá tiền & tồn kho ở Backend.
4. **Cart Controller:**
   - Gắn `@UseGuards()`, `@Throttle()` và routing chuẩn REST API.
5. **E2E & Integration Testing:**
   - Test thêm/sửa/xóa sản phẩm, trường hợp vượt tồn kho, gộp giỏ hàng Guest -> Auth User.
