# BẢN THIẾT KẾ BACK-END: MODULE QUẢN LÝ SẢN PHẨM (PRODUCT MANAGEMENT)

> **Tài liệu tham chiếu:** `.docs/ideas/dashboard/02-product-idea.md` & `.docs/frontend-plans/dashboard/02-product-plan.md`  
> **Tech Stack:** NestJS, Prisma ORM, MySQL, Redis, TypeScript  

---

## 1. Thiết kế Dữ liệu (Database Schema - Prisma / MySQL)

### 1.1. Cập nhật Bảng `Product` (`products`)
Lưu trữ thông tin chi tiết của sản phẩm / món ăn, bao gồm giá gốc, giá khuyến mãi, tồn kho, hình ảnh và dữ liệu định dạng JSON cho mô tả ngắn/mô tả chi tiết từ Rich Text Editor.

```prisma
model Product {
  id               Int      @id @default(autoincrement())
  name             String   @db.VarChar(255)
  slug             String   @unique @db.VarChar(255)
  shortDescription Json?    // Dữ liệu Rich Text Editor dạng JSON
  longDescription  Json?    // Dữ liệu Rich Text Editor dạng JSON
  description      String?  @db.Text // Deprecated text representation (Backward Compatibility)
  price            Decimal  @db.Decimal(10, 2)
  salePrice        Decimal? @db.Decimal(10, 2)
  stock            Int      @default(0)
  imageUrl         String   @db.VarChar(500)
  categoryId       Int
  isFeatured       Boolean  @default(false)
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  category   Category    @relation(fields: [categoryId], references: [id])
  cartItems  CartItem[]
  orderItems OrderItem[]

  @@index([isFeatured, isActive, createdAt(sort: Desc)], name: "idx_product_featured_active")
  @@index([categoryId, isActive], name: "idx_product_category")
  @@index([slug], name: "idx_product_slug")
  @@index([isActive, name], name: "idx_product_active_name")
  @@index([name], name: "idx_product_name")
  @@index([price], name: "idx_product_price")
  @@index([stock], name: "idx_product_stock")
  @@map("products")
}
```

### 1.2. Ràng buộc & Tối ưu Dữ liệu (Constraints & Indexing)
- **Unique Constraint:** `slug` là duy nhất trên toàn hệ thống sản phẩm.
- **Foreign Key:** `categoryId` tham chiếu đến `Category.id`. Khi xóa danh mục, hệ thống chặn xóa nếu đang còn chứa sản phẩm (`onDelete: Restrict`).
- **Kỷ luật Rich Editor (CRITICAL):** `shortDescription` và `longDescription` **BẮT BUỘC lưu trữ dưới dạng JSON Object** (`Json?` trong Prisma / MySQL JSON column). TUYỆT ĐỐI không lưu trữ dạng HTML (để phòng tránh tấn công XSS) hoặc Markdown.
- **Indexing:**
  - `idx_product_category`: Tối ưu lọc danh sách sản phẩm theo chuyên mục trên Admin Dashboard & Public Frontend.
  - `idx_product_slug`: Tra cứu chi tiết sản phẩm tốc độ cao theo slug.
  - `idx_product_active_name`: Tối ưu tìm kiếm autocompleted/search debounced theo tên sản phẩm.
  - `idx_product_price` & `idx_product_stock`: Tối ưu sắp xếp và lọc theo tình trạng tồn kho/khoảng giá.

---

## 2. Giao kèo API (API Contract)

### 2.1. API Lấy Danh sách Sản phẩm Phân trang (Admin Dashboard)
- **Method & Route:** `GET /api/v1/admin/products`
- **Auth & Authorization:** Require JWT Access Token (`JwtAuthGuard`) + Role (`RolesGuard`: `ADMIN`, `STAFF`).
- **Query Params (DTO - `GetAdminProductsDto`):**
  - `search` (optional): `string` - Tìm kiếm theo tên hoặc slug sản phẩm (đã debounce 300ms-500ms phía Client).
  - `categoryId` (optional): `number` - Lọc theo chuyên mục sản phẩm (bao gồm khi click trực tiếp vào Badge chuyên mục tại bảng admin).
  - `status` (optional): `'ALL' | 'ACTIVE' | 'INACTIVE'` (Default: `'ALL'`).
  - `stockStatus` (optional): `'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'` (Default: `'ALL'`).
  - `isFeatured` (optional): `boolean` - Lọc theo cờ sản phẩm nổi bật.
  - `page` (optional): `number` (Default: `1`, Min: `1`).
  - `limit` (optional): `number` (Default: `10`, Max: `100`).
  - `sortBy` (optional): `'createdAt' | 'price' | 'stock' | 'name'` (Default: `'createdAt'`).
  - `sortOrder` (optional): `'asc' | 'desc'` (Default: `'desc'`).

- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách sản phẩm thành công",
  "data": [
    {
      "id": 101,
      "name": "Bánh Burger Bò Phô Mai Đặc Biệt",
      "slug": "banh-burger-bo-pho-mai-dac-biet",
      "price": 89000,
      "salePrice": 69000,
      "stock": 45,
      "imageUrl": "https://cdn.example.com/products/burger.jpg",
      "categoryId": 5,
      "categoryName": "Burger & Pizza",
      "categorySlug": "burger-pizza",
      "isFeatured": true,
      "isActive": true,
      "shortDescription": {
        "type": "doc",
        "content": [
          {
            "type": "paragraph",
            "content": [{ "type": "text", "text": "Burger bò Úc nướng kèm phô mai Cheddar béo ngậy." }]
          }
        ]
      },
      "longDescription": {
        "type": "doc",
        "content": [
          {
            "type": "paragraph",
            "content": [{ "type": "text", "text": "Thịt bò Úc tươi nhập khẩu 100% được chế biến kỳ công..." }]
          }
        ]
      },
      "createdAt": "2026-08-01T10:00:00.000Z",
      "updatedAt": "2026-08-12T07:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 78,
    "totalPages": 8
  }
}
```

---

### 2.2. API Lấy Chi tiết Sản phẩm theo ID (Admin Edit Page)
- **Method & Route:** `GET /api/v1/admin/products/:id`
- **Auth & Authorization:** Require JWT Access Token (`JwtAuthGuard`) + Role (`RolesGuard`: `ADMIN`, `STAFF`).
- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy thông tin chi tiết sản phẩm thành công",
  "data": {
    "id": 101,
    "name": "Bánh Burger Bò Phô Mai Đặc Biệt",
    "slug": "banh-burger-bo-pho-mai-dac-biet",
    "price": 89000,
    "salePrice": 69000,
    "stock": 45,
    "imageUrl": "https://cdn.example.com/products/burger.jpg",
    "categoryId": 5,
    "category": {
      "id": 5,
      "name": "Burger & Pizza",
      "slug": "burger-pizza"
    },
    "isFeatured": true,
    "isActive": true,
    "shortDescription": {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "Burger bò Úc nướng kèm phô mai Cheddar béo ngậy." }]
        }
      ]
    },
    "longDescription": {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "Thịt bò Úc tươi nhập khẩu 100%..." }]
        }
      ]
    },
    "createdAt": "2026-08-01T10:00:00.000Z",
    "updatedAt": "2026-08-12T07:30:00.000Z"
  }
}
```
- **Response Failure (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy sản phẩm với ID = 999",
  "error": "Not Found"
}
```

---

### 2.3. API Tạo Mới Sản phẩm (Create Product)
- **Method & Route:** `POST /api/v1/admin/products`
- **Auth & Authorization:** Require JWT Access Token (`JwtAuthGuard`) + Role (`RolesGuard`: `ADMIN`).
- **Request Payload (DTO - `CreateProductDto`):**
```json
{
  "name": "Gà Rán Sốt Cay Hàn Quốc",
  "slug": "ga-ran-sot-cay-han-quoc",
  "categoryId": 3,
  "price": 120000,
  "salePrice": 99000,
  "stock": 100,
  "imageUrl": "https://cdn.example.com/products/chicken.jpg",
  "isFeatured": true,
  "isActive": true,
  "shortDescription": {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "Gà giòn rụm phủ sốt cay ngọt chuẩn vị Hàn Quốc." }]
      }
    ]
  },
  "longDescription": {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "Chi tiết công thức gà chiên giòn..." }]
      }
    ]
  }
}
```

- **Quy tắc Kiểm tra & Xử lý (Validation Rules):**
  1. **Tự động sinh Slug:** Nếu trường `slug` để trống hoặc null, Backend tự động chuyển `name` thành slug tiếng Việt chuẩn không dấu bằng `slugify`.
  2. **Kiểm tra Slug trùng lặp:** Đảm bảo `slug` duy nhất trên DB. Trả 409 Conflict nếu trùng.
  3. **Kiểm tra Chuyên mục:** Đảm bảo `categoryId` tồn tại trên DB (`Category.findUnique`). Trả 400 Bad Request nếu không tìm thấy chuyên mục.
  4. **Validation Giá cả:** `price` phải lớn hơn 0. `salePrice` nếu có phải lớn hơn 0 và nhỏ hơn `price` (`salePrice < price`). Trả 400 Bad Request nếu vi phạm.
  5. **Validation Editor:** `shortDescription` và `longDescription` BẮT BUỘC là Valid JSON Object. CẤM chấp nhận chuỗi HTML hay Markdown.

- **Response Success (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Tạo mới sản phẩm thành công",
  "data": {
    "id": 102,
    "name": "Gà Rán Sốt Cay Hàn Quốc",
    "slug": "ga-ran-sot-cay-han-quoc",
    "price": 120000,
    "salePrice": 99000,
    "stock": 100,
    "imageUrl": "https://cdn.example.com/products/chicken.jpg",
    "categoryId": 3,
    "isFeatured": true,
    "isActive": true,
    "createdAt": "2026-08-12T08:30:00.000Z",
    "updatedAt": "2026-08-12T08:30:00.000Z"
  }
}
```

---

### 2.4. API Cập Nhật Sản phẩm (Update Product)
- **Method & Route:** `PATCH /api/v1/admin/products/:id`
- **Auth & Authorization:** Require JWT Access Token (`JwtAuthGuard`) + Role (`RolesGuard`: `ADMIN`).
- **Request Payload (DTO - `UpdateProductDto` - Partial):**
```json
{
  "name": "Gà Rán Sốt Cay Hàn Quốc (Cỡ Lớn)",
  "salePrice": 105000,
  "stock": 80,
  "shortDescription": {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "Gà giòn rụm phủ sốt cay ngọt cỡ lớn 6 miếng." }]
      }
    ]
  }
}
```

- **Quy tắc Validation:**
  - Đảm bảo sản phẩm `:id` tồn tại trong hệ thống.
  - Nếu cập nhật `slug`, kiểm tra không trùng với sản phẩm khác (`id !== targetId`).
  - Nếu cập nhật `salePrice` hoặc `price`, kiểm tra điều kiện `salePrice < price`.
  - Nếu cập nhật `categoryId`, kiểm tra danh mục mới tồn tại.

- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Cập nhật sản phẩm thành công",
  "data": {
    "id": 102,
    "name": "Gà Rán Sốt Cay Hàn Quốc (Cỡ Lớn)",
    "slug": "ga-ran-sot-cay-han-quoc",
    "price": 120000,
    "salePrice": 105000,
    "stock": 80,
    "imageUrl": "https://cdn.example.com/products/chicken.jpg",
    "categoryId": 3,
    "isFeatured": true,
    "isActive": true,
    "updatedAt": "2026-08-12T08:35:00.000Z"
  }
}
```

---

### 2.5. API Xóa Sản phẩm (Delete Product - With Safety Check)
- **Method & Route:** `DELETE /api/v1/admin/products/:id`
- **Auth & Authorization:** Require JWT Access Token (`JwtAuthGuard`) + Role (`RolesGuard`: `ADMIN`).
- **Ràng buộc Bảo vệ Lịch sử Hóa đơn (SAFETY RULES):**
  1. **Kiểm tra Lịch sử Đơn hàng (`OrderItem`):** Kiểm tra sản phẩm đã từng phát sinh trong bất kỳ đơn hàng nào chưa (`OrderItem.count({ where: { productId: id } }) > 0`).
  2. **Nếu ĐÃ có đơn hàng ➔ CẤM XÓA VĨNH VIỄN DB:** Trả về lỗi HTTP 400 Bad Request kèm thông báo chi tiết: *"Sản phẩm đã phát sinh đơn hàng trong quá khứ. Để đảm bảo tính toàn vẹn của báo cáo doanh thu và lịch sử mua hàng, sản phẩm không thể xóa vĩnh viễn. Vui lòng chuyển trạng thái sang Tạm ẩn (INACTIVE)"*.
  3. **Nếu CHƯA từng có đơn hàng:** Cho phép xóa vĩnh viễn sản phẩm. Đồng thời xóa các bản ghi liên quan trong `CartItem` nếu có.

- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Xóa vĩnh viễn sản phẩm thành công"
}
```
- **Response Failure (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Không thể xóa sản phẩm 'Bánh Burger Bò' vì đã có 15 đơn hàng liên quan. Vui lòng chuyển trạng thái sang Tạm ẩn.",
  "error": "Bad Request"
}
```

---

### 2.6. API Upload Hình ảnh Sản phẩm (Product Image Upload)
- **Method & Route:** `POST /api/v1/admin/products/upload-image`
- **Auth & Authorization:** Require JWT Access Token (`JwtAuthGuard`) + Role (`RolesGuard`: `ADMIN`, `STAFF`).
- **Content-Type:** `multipart/form-data` (Field name: `file`).
- **Validation:**
  - Định dạng file cho phép: `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`.
  - Dung lượng file tối đa: `5 MB`.
  - Lưu file tại thư mục server `/uploads/products/` với tên ngẫu nhiên UUID chống trùng lặp.
- **Response Success (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Upload hình ảnh sản phẩm thành công",
  "data": {
    "url": "/uploads/products/product-1723456789-abc12345.webp",
    "filename": "product-1723456789-abc12345.webp",
    "size": 345120,
    "mimetype": "image/webp"
  }
}
```

---

## 3. Kiến trúc, Xóa Cache & Bảo mật (Architecture & Caching Strategy)

### 3.1. Phân quyền & Bảo mật (Security & Authorization)
- Tất cả API Admin Sản phẩm BẮT BUỘC đi qua `JwtAuthGuard` để xác thực Access Token từ Header `Authorization: Bearer <token>`.
- Các thao tác biến đổi dữ liệu (`POST`, `PATCH`, `DELETE`) BẮT BUỘC chỉ dành cho người dùng có quyền `ADMIN` (`@Roles(Role.ADMIN)`).
- Thao tác xem/lọc danh sách và chi tiết (`GET`) mở cho cả `ADMIN` và `STAFF`.

### 3.2. Chiến lược Quản lý Cache (Redis Cache Invalidation)
- **Public Frontend Cache:** Các API xem danh sách sản phẩm nổi bật (`/api/v1/products/featured`), tìm kiếm gợi ý (`/api/v1/products/search-suggest`), chi tiết sản phẩm (`/api/v1/products/:slug`) được cache trên Redis (`cache:v1:products:*`) với TTL từ 600s đến 3600s.
- **Admin Dashboard Actions:** Ngay khi Admin thực hiện thao tác làm thay đổi sản phẩm (`POST /admin/products`, `PATCH /admin/products/:id`, `DELETE /admin/products/:id`), Backend Service BẮT BUỘC thực thi:
  1. Purge/Xóa toàn bộ key cache public liên quan (`cache:v1:products:*`, `cache:v1:categories:*`).
  2. Ghi nhận log cache invalidation để đảm bảo khách hàng lập tức nhìn thấy sản phẩm mới/thông tin giá cả mới cập nhật từ Admin Dashboard.

### 3.3. Quy chuẩn Xử lý Lỗi (Standardized Exceptions)
- **400 Bad Request:** Vi phạm DTO validation (Ví dụ: `salePrice >= price`, tồn kho âm, `categoryId` không tồn tại, hoặc sản phẩm đã có trong `OrderItem`).
- **401 Unauthorized:** Missing Access Token, Token hết hạn hoặc token đã bị đưa vào Redis Blacklist.
- **403 Forbidden:** User không phải là `ADMIN` khi cố gắng thực hiện thêm/sửa/xóa sản phẩm.
- **404 Not Found:** Không tìm thấy sản phẩm với `id` tương ứng.
- **409 Conflict:** `slug` sản phẩm bị trùng lặp với sản phẩm sẵn có trong DB.
