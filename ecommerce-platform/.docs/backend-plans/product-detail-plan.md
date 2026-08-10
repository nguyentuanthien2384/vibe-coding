# BẢN THIẾT KẾ BACK-END: MODULE CHI TIẾT SẢN PHẨM (PRODUCT DETAIL PAGE)

> **Tài liệu tham chiếu:** Stitch Design Spec `projects/14083943767292039570/screens/5c7730acee494cbaa154a105347ab0c9`  
> **Tech Stack:** NestJS, Prisma ORM, MySQL, Redis, BullMQ  

---

## 1. Thiết kế Dữ liệu (Database Schema - Prisma / MySQL)

### 1.1. Bảng `Product` (Sản phẩm)
Bảng lưu trữ chính thông tin món ăn/sản phẩm với các chỉ mục Index tối ưu tra cứu chi tiết qua `slug` và `id`.

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

  category Category @relation(fields: [categoryId], references: [id])

  @@index([slug], name: "idx_product_slug")
  @@index([categoryId, isActive], name: "idx_product_category")
  @@index([isFeatured, isActive], name: "idx_product_featured_active")
  @@map("products")
}
```

### 1.2. Bảng `Category` (Danh mục)
```prisma
model Category {
  id        Int       @id @default(autoincrement())
  name      String    @db.VarChar(100)
  slug      String    @unique @db.VarChar(100)
  iconUrl   String?   @db.VarChar(500)
  parentId  Int?
  position  Int       @default(0)
  isActive  Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  products Product[]

  @@index([slug], name: "idx_category_slug")
  @@index([isActive, position], name: "idx_category_active_position")
  @@map("categories")
}
```

---

## 2. Giao kèo API (API Contract)

### 2.1. API Lấy Chi tiết Sản phẩm theo Slug (Product Detail Endpoint)
- **Method & Route:** `GET /api/v1/products/:slug`
- **Auth Guard:** Public (Không yêu cầu đăng nhập)
- **Path Params:** `slug` (chuỗi định danh sản phẩm hoặc ID số fallback)

- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy thông tin sản phẩm thành công",
  "data": {
    "id": 1,
    "name": "Burger Bò Phô Mai Hai Tầng Sốt BBQ Đặc Biệt",
    "slug": "burger-bo-pho-mai-hai-tang-sot-bbq",
    "description": "Trải nghiệm bùng nổ vị giác với 2 lớp bò Úc tươi xay nướng than hoa mọng nước, phô mai Cheddar tan chảy béo ngậy, kẹp trong vỏ bánh mì bơ Pháp mềm thơm, quyện cùng nước sốt BBQ công thức độc quyền đậm đà.",
    "price": 119000,
    "salePrice": 89000,
    "stock": 45,
    "imageUrl": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    "isFeatured": true,
    "category": {
      "id": 4,
      "name": "Combo Deadline",
      "slug": "combo-deadline"
    }
  }
}
```

- **Response Failure (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy sản phẩm với slug này",
  "error": "Not Found"
}
```

### 2.2. API Lấy Danh sách Sản phẩm Liên quan (Related Products Endpoint)
- **Method & Route:** `GET /api/v1/products/:slug/related`
- **Auth Guard:** Public (Không yêu cầu đăng nhập)
- **Query Params:**
  - `limit` (optional): `number` (Default: 4, Max: 12)

- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách sản phẩm liên quan thành công",
  "data": [
    {
      "id": 2,
      "name": "Combo Gà Rán Sốt Cay Hàn Quốc + Pepsi",
      "slug": "combo-ga-ran-sot-cay-han-quoc-pepsi",
      "price": 105000,
      "salePrice": 89000,
      "stock": 35,
      "imageUrl": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec",
      "isFeatured": true,
      "category": {
        "id": 4,
        "name": "Combo Deadline"
      }
    }
  ]
}
```

---

## 3. Kiến trúc, Caching & Background Jobs

### 3.1. Chiến lược Caching (Redis In-Memory Store)
- **Detail Cache:**
  - Key Format: `cache:products:detail:<slug>`
  - TTL: 600 giây (10 phút).
  - Invalidation Strategy: Khi có cập nhật thông tin sản phẩm hoặc biến động tồn kho (`stock`), hủy cache key chi tiết sản phẩm tương ứng.

### 3.2. Background Jobs (View Count Tracker)
- **BullMQ Worker (`product-views-queue`):** Khi có lượt truy cập API Chi tiết sản phẩm, đẩy nhiệm vụ đếm lượt xem ngầm vào Queue để cập nhật số lượt xem/bán mà không gây delay mượt mà cho Main Thread của API.
