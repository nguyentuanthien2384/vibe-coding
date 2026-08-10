# BẢN THIẾT KẾ BACK-END: MODULE SEARCH SUGGEST (TÌM KIẾM GỢI Ý)

> **Tài liệu tham chiếu:** `05-search-suggest-idea.md`, `05-search-suggest-plan.md`, `05-search-suggest-brief.md`  
> **Tech Stack:** NestJS, Prisma ORM, MySQL, Cache Manager (Redis / In-Memory), NestJS Throttler  

---

## 1. Thiết kế Dữ liệu (Database Schema - Prisma / MySQL)

Tính năng **Search Suggest** truy vấn trực tiếp trên bảng `Product` sẵn có trong Database, không tạo thêm bảng mới nhưng BẮT BUỘC tối ưu chỉ mục (Indexes) phục vụ tìm kiếm nhanh (latency < 50ms).

### 1.1. Bảng `Product` (Sản phẩm)

```prisma
model Product {
  id            String   @id @default(uuid())
  name          String   @db.VarChar(255)
  slug          String   @unique @db.VarChar(255)
  description   String?  @db.Text
  price         Decimal  @db.Decimal(10, 2)
  salePrice     Decimal? @db.Decimal(10, 2)
  stock         Int      @default(0)
  imageUrl      String   @db.VarChar(500)
  categoryId    String
  isFeatured    Boolean  @default(false)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  category      Category @relation(fields: [categoryId], references: [id])

  // Indexes tối ưu truy vấn Search Suggest
  @@index([isActive, name], name: "idx_product_active_name")
  @@fulltext([name], name: "idx_product_fulltext_name")
}
```

### 1.2. Giải pháp Truy vấn (Query Strategy)
- **Dataset vừa và nhỏ (< 50,000 dòng):** Sử dụng `contains` (LIKE `%query%`) của Prisma kết hợp với lọc `isActive: true`.
- **Dataset lớn (> 50,000 dòng):** Sử dụng MySQL Fulltext Search `MATCH(name) AGAINST(? IN BOOLEAN MODE)` hoặc tích hợp Elasticsearch/Meilisearch.
- **Tiêu chuẩn dữ liệu trả về:** 
  - Ưu tiên hiển thị sản phẩm `isActive = true`.
  - Giá trả về: `price` nguyên bản và `salePrice` nếu có (để Frontend tính toán hiển thị gạch ngang).

---

## 2. Giao kèo API (API Contract)

### 2.1. API Lấy Gợi ý Tìm kiếm (Search Suggest Endpoints)

> **⚠️ QUY TẮC ROUTING QUAN TRỌNG:**  
> Trong `products.controller.ts`, route `GET /search-suggest` BẮT BUỘC phải được khai báo **TRƯỚC** route `GET /:slug` để tránh NestJS Router nhầm lẫn chuỗi `"search-suggest"` là một tham số `:slug`.

- **Method & Route:** `GET /api/v1/products/search-suggest`
- **Auth Guard:** Public (Không yêu cầu đăng nhập)
- **Rate Limit (Chống Spam API):** `@Throttle({ default: { limit: 60, ttl: 60000 } })` (Tối đa 60 requests/phút per IP)

#### Request Query Parameters (`SearchSuggestQueryDto`):

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---|---|---|---|---|
| `q` | `string` | **Có** | N/A | Từ khóa tìm kiếm (Tối thiểu 2 ký tự, tự động `trim()`) |
| `limit` | `number` | Không | `5` | Số sản phẩm gợi ý tối đa (Min: 1, Max: 10) |

#### Validation Rules (NestJS `class-validator`):
- `q`: `@IsNotEmpty()`, `@IsString()`, `@MinLength(2, { message: 'Từ khóa tìm kiếm phải có tối thiểu 2 ký tự' })`
- `limit`: `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`, `@Min(1)`, `@Max(10)`

---

#### Response Success (200 OK):

```json
{
  "statusCode": 200,
  "message": "Lấy danh sách gợi ý tìm kiếm thành công",
  "data": {
    "query": "bắp",
    "totalFound": 12,
    "items": [
      {
        "id": "prod-201",
        "name": "Bắp Rang Bơ Caramel Jumbo Gói 200g",
        "slug": "bap-rang-bo-caramel-jumbo-200g",
        "imageUrl": "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=200&h=200&fit=crop",
        "price": 45000,
        "originalPrice": 55000
      },
      {
        "id": "prod-202",
        "name": "Sữa Bắp Non Hạt Óc Chó TechBite 330ml",
        "slug": "sua-bap-non-hat-oc-cho-techbite-330ml",
        "imageUrl": "https://images.unsplash.com/photo-1556881286-fc6915169721?w=200&h=200&fit=crop",
        "price": 25000,
        "originalPrice": 30000
      },
      {
        "id": "prod-203",
        "name": "Bắp Nướng Mỡ Hành Chay Sấy Giòn 150g",
        "slug": "bap-nuong-mo-hanh-chay-say-gion-150g",
        "imageUrl": "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=200&h=200&fit=crop",
        "price": 32000,
        "originalPrice": null
      }
    ]
  }
}
```

---

#### Response Failure (400 Bad Request - Từ khóa quá ngắn):

```json
{
  "statusCode": 400,
  "message": [
    "Từ khóa tìm kiếm phải có tối thiểu 2 ký tự"
  ],
  "error": "Bad Request"
}
```

---

#### Response Failure (429 Too Many Requests - Spam API):

```json
{
  "statusCode": 429,
  "message": "Thao tác quá nhanh, vui lòng thử lại sau 1 phút",
  "error": "Too Many Requests"
}
```

---

## 3. Kiến trúc, Caching & Tối ưu Hiệu năng (Architecture & Caching)

### 3.1. Chiến lược Caching (Redis / Cache Manager)
Do tính năng Search Suggest phản hồi theo từng lượt gõ (sau debounce 500ms), tần suất gọi API lớn. BẮT BUỘC áp dụng Caching:

- **Key Format:** `cache:search-suggest:<normalized_query>:<limit>`
  - Chuẩn hóa query: `const normalizedQuery = query.trim().toLowerCase();`
  - Ví dụ: `cache:search-suggest:bap:5`
- **TTL (Time-To-Live):** `600` giây (10 phút).
- **Cache Invalidation:** Khi Admin thêm/sửa/xóa sản phẩm hoặc thay đổi trạng thái `isActive`, bắn sự kiện `ProductUpdatedEvent` để purge các cache key bắt đầu bằng `cache:search-suggest:*`.

### 3.2. Cấu trúc Module NestJS Đề xuất

```
app/backend/src/modules/products/
├── dtos/
│   └── search-suggest-query.dto.ts     ← DTO Validation cho Query Params
├── interfaces/
│   └── search-suggest.interface.ts     ← Interface định nghĩa Response Payload
├── products.controller.ts              ← Thêm GET /search-suggest (TRƯỚC GET /:slug)
└── products.service.ts                 ← Thêm hàm getSearchSuggestions(dto)
```

---

## 4. Thứ tự Triển khai API Back-end

1. **`dtos/search-suggest-query.dto.ts`**: Tạo DTO validation với `@MinLength(2)` & `@Type(() => Number)`.
2. **`interfaces/search-suggest.interface.ts`**: Định nghĩa contract trả về.
3. **`products.service.ts`**: Viết logic `getSearchSuggestions()`:
   - Kiểm tra cache Redis/In-Memory.
   - Nếu miss cache, gọi Prisma `findMany` kết hợp đếm `count` cho `totalFound`.
   - Lưu cache kết quả và trả về client.
4. **`products.controller.ts`**: Thêm route `GET /search-suggest` **ngay phía trên** route `GET /:slug`.
5. **Unit Test / E2E Test**: Test case tìm kiếm chính xác, tìm kiếm không ra kết quả, validation error (< 2 ký tự).
