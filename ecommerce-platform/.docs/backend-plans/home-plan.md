# BẢN THIẾT KẾ BACK-END: MODULE TRANG CHỦ (HOME PAGE)

> **Tài liệu tham chiếu:** `01-home-idea.md`  
> **Tech Stack:** NestJS, Prisma ORM, MySQL, Redis, BullMQ  

---

## 1. Thiết kế Dữ liệu (Database Schema - Prisma / MySQL)

### 1.1. Bảng `Banner` (Mới)
Lưu thông tin các Banner quảng cáo (Hero Banner, Social Proof, Promotion) trên Trang chủ.

```prisma
model Banner {
  id          Int        @id @default(autoincrement())
  title       String     @db.VarChar(255)
  subtitle    String?    @db.VarChar(255)
  imageUrl    String     @db.VarChar(500)
  linkUrl     String?    @db.VarChar(500)
  type        BannerType @default(HERO_BANNER)
  position    Int        @default(0)
  isActive    Boolean    @default(true)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([type, isActive, position], name: "idx_banner_type_active")
}

enum BannerType {
  HERO_BANNER
  PROMOTION_BANNER
  SOCIAL_PROOF
}
```

### 1.2. Bảng `Category` (Danh mục)
Mô tả cây danh mục đồ ăn/nước uống (Parent-Child).

```prisma
model Category {
  id          Int        @id @default(autoincrement())
  name        String     @db.VarChar(100)
  slug        String     @unique @db.VarChar(100)
  iconUrl     String?    @db.VarChar(500)
  parentId    Int?
  position    Int        @default(0)
  isActive    Boolean    @default(true)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  parent      Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  children    Category[] @relation("CategoryHierarchy")
  products    Product[]

  @@index([slug], name: "idx_category_slug")
  @@index([isActive, position], name: "idx_category_active_position")
}
```

### 1.3. Bảng `Product` (Sản phẩm / Món ăn)
Lưu thông tin món ăn, hỗ trợ hiển thị danh sách nổi bật ở Trang chủ.

```prisma
model Product {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(255)
  slug        String   @unique @db.VarChar(255)
  description String?  @db.Text
  price       Decimal  @db.Decimal(10, 2)
  salePrice   Decimal? @db.Decimal(10, 2)
  stock       Int      @default(0)
  imageUrl    String   @db.VarChar(500)
  categoryId  Int
  isFeatured  Boolean  @default(false)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  category    Category @relation(fields: [categoryId], references: [id])

  @@index([isFeatured, isActive, createdAt(sort: Desc)], name: "idx_product_featured_active")
  @@index([categoryId, isActive], name: "idx_product_category")
}
```

---

## 2. Giao kèo API (API Contract)

### 2.1. API Lấy Danh sách Banners
- **Method & Route:** `GET /api/v1/banners`
- **Auth Guard:** Public (Không yêu cầu đăng nhập)
- **Query Params (DTO):**
  - `type` (optional): Enum (`HERO_BANNER`, `PROMOTION_BANNER`, `SOCIAL_PROOF`)
- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách banner thành công",
  "data": [
    {
      "id": 1,
      "title": "Nạp Năng Lượng - Code Phê Hơn",
      "subtitle": "Combo Thức Khuya giảm giá 20% từ 22h - 2h sáng.",
      "imageUrl": "https://images.unsplash.com/photo-1585238342024-78d387f4a707",
      "linkUrl": "/promotions/combo-coder",
      "type": "HERO_BANNER",
      "position": 1
    }
  ]
}
```

### 2.2. API Lấy Danh sách Danh mục Món ăn (Categories)
- **Method & Route:** `GET /api/v1/categories`
- **Auth Guard:** Public (Không yêu cầu đăng nhập)
- **Query Params (DTO):**
  - `tree` (optional): `boolean` (Default: `false`)
- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách danh mục thành công",
  "data": [
    {
      "id": 1,
      "name": "Đồ Ăn Vặt",
      "slug": "do-an-vat",
      "iconUrl": "https://...",
      "position": 1,
      "children": []
    }
  ]
}
```

### 2.3. API Lấy Danh sách Sản phẩm Nổi bật (Featured Menu)
- **Method & Route:** `GET /api/v1/products/featured`
- **Auth Guard:** Public (Không yêu cầu đăng nhập)
- **Query Params (DTO):**
  - `page`: `number` (Default: 1, Min: 1)
  - `limit`: `number` (Default: 8, Max: 50)
- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách sản phẩm nổi bật thành công",
  "data": [
    {
      "id": 101,
      "name": "Khô Gà Lá Chanh Xé Cay",
      "slug": "kho-ga-la-chanh-xe-cay",
      "price": 45000,
      "salePrice": 40000,
      "stock": 50,
      "imageUrl": "https://images.unsplash.com/photo-1585238342024-78d387f4a707",
      "isFeatured": true,
      "category": {
        "id": 1,
        "name": "Đồ Ăn Vặt"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 8,
    "total": 24,
    "totalPages": 3
  }
}
```
- **Response Failure (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": ["page must be an integer number", "limit must not be greater than 50"],
  "error": "Bad Request"
}
```

---

## 3. Kiến trúc, Caching & Background Jobs

### 3.1. Chiến lược Caching (Redis)
Vì Trang chủ có mật độ truy vấn đọc cực kỳ cao (Read-Heavy 99%):
- **Banners & Categories Cache:**
  - Key Format: `cache:banners:type:{type}` & `cache:categories:all`
  - TTL: 3600 giây (1 giờ).
  - Invalidation Strategy: Tự động xóa cache khi Admin cập nhật dữ liệu qua Admin API.
- **Featured Products Cache:**
  - Key Format: `cache:products:featured:p{page}:l{limit}`
  - TTL: 900 giây (15 phút).
  - Invalidation Strategy: Xóa cache khi có cập nhật trạng thái `isFeatured`, giá hoặc kho sản phẩm.

### 3.2. Xử lý Ngầm (Background Jobs - BullMQ)
- **Banner Impression & Click Tracking:** Gửi event lượt xem/click ngầm qua Queue `analytics-queue` để ghi nhận thống kê mà không gây nghẽn Main Loop của NestJS API Server.
- **Graceful Fallback:** Tự động fallback xuống MySQL Database nếu Redis Service không phản hồi.
