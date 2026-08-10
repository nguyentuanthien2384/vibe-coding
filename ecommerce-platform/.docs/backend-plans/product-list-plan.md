# BẢN THIẾT KẾ BACK-END: MODULE DANH SÁCH SẢN PHẨM (PRODUCT LIST PAGE)

> **Tài liệu tham chiếu:** `03-product-list-idea.md`  
> **Tech Stack:** NestJS, Prisma ORM, MySQL, Redis, BullMQ  

---

## 1. Thiết kế Dữ liệu (Database Schema - Prisma / MySQL)

### 1.1. Bảng `Product` (Sản phẩm)
Lưu trữ toàn bộ dữ liệu món ăn/sản phẩm với các Index được tối ưu hóa cho Bộ lọc (Filter), Tìm kiếm (Search) và Phân trang (Pagination).

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

  // Optimization Indexes cho Filter, Sort & Fulltext Search
  @@index([isActive, categoryId, price], name: "idx_product_filter_cat_price")
  @@index([isActive, createdAt(sort: Desc)], name: "idx_product_sort_created")
  @@index([isActive, price], name: "idx_product_sort_price")
  @@index([isActive, isFeatured], name: "idx_product_sort_featured")
  @@fulltext([name], name: "idx_product_fulltext_name")
}
```

### 1.2. Bảng `Category` (Danh mục)
Tham chiếu danh mục sản phẩm phục vụ cho bộ lọc bên thanh Sidebar left.

```prisma
model Category {
  id          Int       @id @default(autoincrement())
  name        String    @db.VarChar(100)
  slug        String    @unique @db.VarChar(100)
  iconUrl     String?   @db.VarChar(500)
  parentId    Int?
  position    Int       @default(0)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  products    Product[]

  @@index([isActive, position], name: "idx_category_active_pos")
}
```

---

## 2. Giao kèo API (API Contract)

### 2.1. API Lấy Danh sách Sản phẩm (Product List with Filter & Sort)
- **Method & Route:** `GET /api/v1/products`
- **Auth Guard:** Public (Không yêu cầu đăng nhập)
- **Query Params DTO (`GetProductsDto`):**
  - `page`: `number` (Default: 1, Min: 1)
  - `limit`: `number` (Default: 12, Max: 48)
  - `categoryId` (optional): `number` (Lọc theo danh mục)
  - `minPrice` (optional): `number` (Lọc giá từ)
  - `maxPrice` (optional): `number` (Lọc giá đến)
  - `search` (optional): `string` (Tìm kiếm theo tên sản phẩm)
  - `sortBy` (optional): Enum (`createdAt`, `price`, `isFeatured`, default: `createdAt`)
  - `sortOrder` (optional): Enum (`asc`, `desc`, default: `desc`)

- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách sản phẩm thành công",
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
      "createdAt": "2026-08-05T10:00:00.000Z",
      "category": {
        "id": 1,
        "name": "Đồ Ăn Vặt",
        "slug": "do-an-vat"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 48,
    "totalPages": 4
  }
}
```

- **Response Failure (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": [
    "minPrice must not be negative",
    "sortBy must be one of the following values: createdAt, price, isFeatured"
  ],
  "error": "Bad Request"
}
```

### 2.2. API Lấy Metadata Bộ lọc (Filter Meta Options)
Phục vụ dựng thanh bộ lọc bên trái (Số lượng món theo từng danh mục, khoảng giá Min-Max hiện có).

- **Method & Route:** `GET /api/v1/products/filter-meta`
- **Auth Guard:** Public (Không yêu cầu đăng nhập)
- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy thông tin bộ lọc thành công",
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Đồ Ăn Vặt",
        "slug": "do-an-vat",
        "productCount": 24
      },
      {
        "id": 2,
        "name": "Nước Uống",
        "slug": "nuoc-uong",
        "productCount": 18
      }
    ],
    "priceRange": {
      "min": 15000,
      "max": 150000
    }
  }
}
```

### 2.3. API Lấy Chi tiết Sản phẩm theo Slug
- **Method & Route:** `GET /api/v1/products/:slug`
- **Auth Guard:** Public (Không yêu cầu đăng nhập)
- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy thông tin sản phẩm thành công",
  "data": {
    "id": 101,
    "name": "Khô Gà Lá Chanh Xé Cay",
    "slug": "kho-ga-la-chanh-xe-cay",
    "description": "Khô gà xé cay đậm vị, thơm mùi lá chanh tươi, giòn rụm thích hợp chạy deadline đêm.",
    "price": 45000,
    "salePrice": 40000,
    "stock": 50,
    "imageUrl": "https://images.unsplash.com/photo-1585238342024-78d387f4a707",
    "isFeatured": true,
    "category": {
      "id": 1,
      "name": "Đồ Ăn Vặt",
      "slug": "do-an-vat"
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

---

## 3. Kiến trúc, Caching & Background Jobs

### 3.1. Chiến lược Caching (Redis)
- **Danh sách sản phẩm theo bộ lọc & phân trang:**
  - Key Format: `cache:products:list:<md5_hash_of_query_params>`
  - TTL: 300 giây (5 phút).
  - Invalidation Strategy: Khi có hành vi thêm/sửa/xóa sản phẩm từ phía Admin hoặc thay đổi kho (`stock`), phát sự kiện NestJS `ProductUpdatedEvent` để purge các cache key chứa prefix `cache:products:list:*`.
- **Filter Meta Cache:**
  - Key Format: `cache:products:filter-meta`
  - TTL: 3600 giây (1 giờ).

### 3.2. Xử lý Ngầm & Tối ưu Truy vấn (Background Jobs & Search Optimization)
- **Fulltext Search:** Với truy vấn tìm kiếm `search`, sử dụng MySQL Fulltext Index (`idx_product_fulltext_name`) dạng `IN BOOLEAN MODE` đối với danh mục nhỏ. Đề xuất sẵn mở rộng Elasticsearch/Meilisearch qua BullMQ Sync Worker khi số lượng sản phẩm vượt quá 50,000 items.
- **Analytics Track Search Keywords:** Khi người dùng thực hiện lọc/tìm kiếm, đẩy từ khóa vào Queue `search-analytics-queue` để lưu trữ ngầm báo cáo các món ăn được tìm kiếm nhiều nhất.
