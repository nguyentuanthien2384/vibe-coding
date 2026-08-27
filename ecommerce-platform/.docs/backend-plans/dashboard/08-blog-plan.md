# BẢN THIẾT KẾ BACK-END: MODULE QUẢN LÝ BLOG & BÀI VIẾT (ADMIN DASHBOARD BLOG)

> **Tài liệu tham chiếu:** `.docs/ideas/dashboard/07-blog-idea.md`, `.docs/frontend-plans/dashboard/07-blog-plan.md`, `.docs/ARCHITECTURE.md`, `AGENTS.md`  
> **Tech Stack:** NestJS, Prisma ORM, MySQL, Redis (`ioredis`), `@nestjs/schedule`, Multer, `class-validator`, `class-transformer`  
> **Ứng dụng mục tiêu:** Backend API Server (`apps/backend` / `app/backend`)  
> **Phiên bản:** 1.0.0 · **Ngày tạo:** 2026-08-27  

---

## 1. THIẾT KẾ DỮ LIỆU (DATABASE SCHEMA - PRISMA / MYSQL)

Module **Quản lý Blog & Bài viết Admin** chịu trách nhiệm lưu trữ bài viết, chuyên mục, thẻ hashtag, ảnh đại diện và liên kết nhúng sản phẩm (Cross-selling / Upselling) vào nội dung.

### 1.1. Enums Mới Trong `prisma/schema.prisma`

```prisma
enum PostStatus {
  DRAFT       // Bản nháp, chỉ tác giả/admin xem được
  SCHEDULED   // Đã lên lịch, tự động chuyển PUBLISHED khi đến thời điểm scheduledAt
  PUBLISHED   // Đã công khai trên website
  ARCHIVED    // Lưu trữ / ẩn bài viết
}
```

---

### 1.2. Bảng `PostCategory` (`post_categories`)

```prisma
/// Bảng chuyên mục bài viết (Tin Tức, Góc Coder, Review Món Ăn, Mẹo Năng Lượng...)
model PostCategory {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(100)
  slug        String   @unique @db.VarChar(100)
  description String?  @db.VarChar(500)
  icon        String?  @db.VarChar(100) // Emoji hoặc icon SVG URL
  orderIndex  Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  posts Post[]

  @@index([slug], name: "idx_post_category_slug")
  @@index([isActive, orderIndex], name: "idx_post_category_active_order")
  @@map("post_categories")
}
```

---

### 1.3. Bảng `Post` (`posts`)

```prisma
/// Bảng bài viết Blog & Tin tức quản trị
model Post {
  id              Int        @id @default(autoincrement())
  title           String     @db.VarChar(255)
  slug            String     @unique @db.VarChar(255)
  summary         String     @db.VarChar(500)
  thumbnail       String     @db.VarChar(500)
  content         Json       // Cấu trúc TipTap JSON Blocks chuẩn (Node, Mark, Block)
  status          PostStatus @default(DRAFT)
  readTimeMinutes Int        @default(5)
  views           Int        @default(0) // Lưu bền vững, sync định kỳ từ Redis
  
  // Tác giả & Chuyên mục
  authorId        Int
  categoryId      Int
  
  // Thời gian lên lịch & Xuất bản
  scheduledAt     DateTime?
  publishedAt     DateTime?
  
  // SEO Metadata On-page
  metaTitle       String?    @db.VarChar(255)
  metaDescription String?    @db.VarChar(500)
  canonicalUrl    String?    @db.VarChar(500)
  ogImage         String?    @db.VarChar(500)

  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  author          User         @relation(fields: [authorId], references: [id], onDelete: Restrict)
  category        PostCategory @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  postTags        PostTag[]
  postProducts    PostProduct[]

  @@index([slug], name: "idx_post_slug")
  @@index([status, publishedAt(sort: Desc)], name: "idx_post_status_published")
  @@index([categoryId, status, publishedAt(sort: Desc)], name: "idx_post_category_status")
  @@index([authorId], name: "idx_post_author")
  @@index([status, scheduledAt], name: "idx_post_scheduled_scan")
  @@index([title], name: "idx_post_title")
  @@map("posts")
}
```

---

### 1.4. Bảng `Tag` (`tags`) & `PostTag` (`post_tags`)

```prisma
/// Bảng thẻ bài viết (Hashtags)
model Tag {
  id        Int       @id @default(autoincrement())
  name      String    @db.VarChar(50)
  slug      String    @unique @db.VarChar(50)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  postTags  PostTag[]

  @@index([slug], name: "idx_tag_slug")
  @@map("tags")
}

/// Bảng trung gian liên kết Post và Tag (Nhiều-Nhiều)
model PostTag {
  id        Int      @id @default(autoincrement())
  postId    Int
  tagId     Int
  createdAt DateTime @default(now())

  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([postId, tagId], name: "idx_post_tag_unique")
  @@index([postId], name: "idx_post_tag_post")
  @@index([tagId], name: "idx_post_tag_tag")
  @@map("post_tags")
}
```

---

### 1.5. Bảng `PostProduct` (`post_products`) - Nhúng Sản Phẩm (Cross-selling)

```prisma
/// Bảng liên kết sản phẩm được nhắc đến trong bài viết
model PostProduct {
  id           Int      @id @default(autoincrement())
  postId       Int
  productId    Int
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())

  post         Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  product      Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([postId, productId], name: "idx_post_product_unique")
  @@index([postId, displayOrder], name: "idx_post_product_order")
  @@index([productId], name: "idx_post_product_product")
  @@map("post_products")
}
```

---

### 1.6. Cập nhật Quan Hệ Trong Model Sẵn Có (`schema.prisma`)
- **Model `User`**: Bổ sung `posts Post[]`
- **Model `Product`**: Bổ sung `postProducts PostProduct[]`

---

## 2. GIAO KÈO API QUẢN TRỊ (API CONTRACT & ENDPOINTS)

> 🔒 **Phân quyền & Bảo mật:** Toàn bộ API bên dưới đều có tiền tố `/api/v1/admin/blog` và được bảo vệ nghiêm ngặt bởi:  
> `@UseGuards(JwtAuthGuard, RolesGuard)` và `@Roles(Role.ADMIN, Role.STAFF)`.

```
========================================================================================================
DANH SÁCH ENDPOINT QUẢN LÝ BLOG ADMIN (KHỚP 100% FRONTEND PLAN)
========================================================================================================
1. GET    /api/v1/admin/blog/posts                     -> Lấy danh sách bài viết (Lọc, tìm kiếm, phân trang)
2. GET    /api/v1/admin/blog/posts/:id                 -> Lấy chi tiết bài viết (Kèm TipTap JSON & Sản phẩm)
3. POST   /api/v1/admin/blog/posts                     -> Tạo mới bài viết
4. PUT    /api/v1/admin/blog/posts/:id                 -> Cập nhật toàn bộ bài viết
5. PATCH  /api/v1/admin/blog/posts/:id/status          -> Đổi trạng thái bài viết nhanh
6. DELETE /api/v1/admin/blog/posts/:id                 -> Xóa bài viết
7. POST   /api/v1/admin/blog/posts/upload-thumbnail    -> Upload ảnh đại diện bài viết (16:9)
8. GET    /api/v1/admin/blog/categories                -> Lấy danh sách chuyên mục blog
9. POST   /api/v1/admin/blog/categories                -> Tạo mới chuyên mục blog
10. PATCH /api/v1/admin/blog/categories/:id            -> Cập nhật chuyên mục blog
11. DELETE /api/v1/admin/blog/categories/:id           -> Xóa chuyên mục blog (Có kiểm tra an toàn)
12. GET   /api/v1/admin/blog/products/search-embed     -> Tìm kiếm sản phẩm store để gắn kèm bài viết
```

---

### 2.1. API 1: Lấy Danh Sách Bài Viết Phân Trang (`GET /api/v1/admin/blog/posts`)

* **Route:** `GET /api/v1/admin/blog/posts`
* **Query Parameters (`AdminGetBlogPostsQueryDto`):**
  - `page`: number (Default: `1`)
  - `limit`: number (Default: `10`, Max: `50`)
  - `search`: string (Tìm kiếm theo Tiêu đề, Slug, Tác giả)
  - `categoryId`: number (Lọc theo ID chuyên mục)
  - `status`: `'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED' | 'ALL'` (Default: `'ALL'`)
  - `sortBy`: `'latest' | 'views'` (Default: `'latest'`)

* **Response `200 OK`:**
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách bài viết quản trị thành công",
  "data": {
    "items": [
      {
        "id": 101,
        "title": "Top 7 Món Ăn Vặt 'Cứu Cánh' Đêm Chạy Deadline Cho Anh Em Lập Trình Viên",
        "slug": "top-7-mon-an-vat-cuu-canh-dem-chay-deadline",
        "summary": "Tổng hợp các món ăn nhanh vừa tiện lợi, vừa giàu protein giúp giữ tỉnh táo suốt đêm trắng fix bug.",
        "thumbnail": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=338&fit=crop",
        "status": "PUBLISHED",
        "views": 1845,
        "readTimeMinutes": 6,
        "categoryId": 2,
        "category": {
          "id": 2,
          "name": "Góc Coder Thức Khuya",
          "slug": "goc-coder-thuc-khuya"
        },
        "authorId": 1,
        "author": {
          "id": 1,
          "fullName": "Hoàng Nam Dev",
          "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop"
        },
        "tags": [
          { "id": 1, "name": "Thức Khuya", "slug": "thuc-khuya" },
          { "id": 2, "name": "Deadline", "slug": "deadline" }
        ],
        "publishedAt": "2026-08-25T14:30:00.000Z",
        "scheduledAt": null,
        "createdAt": "2026-08-25T10:00:00.000Z",
        "updatedAt": "2026-08-25T14:30:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 2.2. API 2: Lấy Chi Tiết Bài Viết (`GET /api/v1/admin/blog/posts/:id`)

* **Route:** `GET /api/v1/admin/blog/posts/:id`
* **Response `200 OK`:**
```json
{
  "statusCode": 200,
  "message": "Lấy thông tin chi tiết bài viết thành công",
  "data": {
    "id": 101,
    "title": "Top 7 Món Ăn Vặt 'Cứu Cánh' Đêm Chạy Deadline Cho Anh Em Lập Trình Viên",
    "slug": "top-7-mon-an-vat-cuu-canh-dem-chay-deadline",
    "summary": "Tổng hợp các món ăn nhanh vừa tiện lợi, vừa giàu protein giúp giữ tỉnh táo suốt đêm trắng fix bug.",
    "thumbnail": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=338&fit=crop",
    "content": {
      "type": "doc",
      "content": [
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "1. Khô Gà Lá Chanh Xé Cay" }]
        },
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "Khô gà xé cay là lựa chọn hàng đầu của đa số lập trình viên..." }]
        }
      ]
    },
    "status": "PUBLISHED",
    "views": 1845,
    "readTimeMinutes": 6,
    "categoryId": 2,
    "category": {
      "id": 2,
      "name": "Góc Coder Thức Khuya",
      "slug": "goc-coder-thuc-khuya"
    },
    "authorId": 1,
    "author": {
      "id": 1,
      "fullName": "Hoàng Nam Dev",
      "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop"
    },
    "tags": [
      { "id": 1, "name": "Thức Khuya", "slug": "thuc-khuya" }
    ],
    "products": [
      {
        "id": 1,
        "postId": 101,
        "productId": 201,
        "displayOrder": 1,
        "product": {
          "id": 201,
          "name": "Khô Gà Lá Chanh Xé Cay 200g",
          "slug": "kho-ga-la-chanh-xe-cay-200g",
          "imageUrl": "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=200&h=200&fit=crop",
          "price": 55000,
          "salePrice": 45000,
          "stock": 42,
          "isActive": true
        }
      }
    ],
    "metaTitle": "Top 7 Món Ăn Vặt Cho Dân IT Chạy Deadline | TechBite",
    "metaDescription": "Bí quyết nạp năng lượng ban đêm không gây nặng bụng hay buồn ngủ.",
    "canonicalUrl": "https://techbite.vn/blog/top-7-mon-an-vat-cuu-canh-dem-chay-deadline",
    "ogImage": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
    "publishedAt": "2026-08-25T14:30:00.000Z",
    "scheduledAt": null,
    "createdAt": "2026-08-25T10:00:00.000Z",
    "updatedAt": "2026-08-25T14:30:00.000Z"
  }
}
```

---

### 2.3. API 3: Tạo Mới Bài Viết (`POST /api/v1/admin/blog/posts`)

* **Route:** `POST /api/v1/admin/blog/posts`
* **Request Body (`CreatePostDto`):**
```json
{
  "title": "Bí Quyết Giữ Tỉnh Táo 12 Tiếng Không Cần Nạp Quá Nhiều Đường",
  "slug": "bi-quyet-giu-tinh-tao-12-tieng-khong-can-duong",
  "summary": "Cách phân bổ hạt dinh dưỡng macca, óc chó xen kẽ các cữ uống nước giúp não bộ hoạt động bền bỉ.",
  "thumbnail": "/uploads/blog/energy-tips.webp",
  "content": {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "Khi làm việc liên tục 12 tiếng..." }]
      }
    ]
  },
  "status": "PUBLISHED",
  "categoryId": 5,
  "tagIds": [1, 3],
  "productIds": [201, 202],
  "scheduledAt": null,
  "metaTitle": "Bí Quyết Giữ Tỉnh Táo 12 Tiếng Khi Code | TechBite",
  "metaDescription": "Mẹo dinh dưỡng từ hạt ngũ cốc giúp coder tập trung cao độ.",
  "canonicalUrl": null,
  "ogImage": null
}
```

* **Validation Rules:**
  1. `title`: Bắt buộc, chuỗi 5-255 ký tự.
  2. `slug`: Nếu để trống hoặc null, Backend tự động sinh từ `title` bằng thư viện `slugify`. Kiểm tra tính duy nhất trong bảng `Post`. Ném `ConflictException(409)` nếu trùng.
  3. `content`: Bắt buộc là Valid JSON Object (`type === 'doc'`). Ném `BadRequestException(400)` nếu nhận dạng HTML string hoặc rỗng.
  4. `categoryId`: Phải tồn tại trong `PostCategory`.
  5. `status`: Thuộc enum `PostStatus`. Nếu `status === 'PUBLISHED'`, tự động set `publishedAt = new Date()`. Nếu `status === 'SCHEDULED'`, `scheduledAt` bắt buộc phải là thời gian trong tương lai (`scheduledAt > new Date()`).
  6. Ghi nhận `authorId` trích xuất trực tiếp từ JWT Token của người gửi request (`req.user.userId`).

* **Response `201 Created`:**
```json
{
  "statusCode": 201,
  "message": "Tạo bài viết mới thành công",
  "data": {
    "id": 103,
    "title": "Bí Quyết Giữ Tỉnh Táo 12 Tiếng Không Cần Nạp Quá Nhiều Đường",
    "slug": "bi-quyet-giu-tinh-tao-12-tieng-khong-can-duong",
    "status": "PUBLISHED",
    "publishedAt": "2026-08-27T11:20:00.000Z",
    "createdAt": "2026-08-27T11:20:00.000Z"
  }
}
```

---

### 2.4. API 4: Cập Nhật Bài Viết (`PUT /api/v1/admin/blog/posts/:id`)

* **Route:** `PUT /api/v1/admin/blog/posts/:id`
* **Request Body (`UpdatePostDto`):** Kế thừa toàn bộ trường của `CreatePostDto`.
* **Quy trình Xử lý & Invalidation:**
  1. Kiểm tra bài viết `:id` tồn tại trong DB.
  2. Kiểm tra `slug` không bị trùng lặp với bài viết khác (`id !== targetId`).
  3. Đồng bộ lại danh sách `PostTag` và `PostProduct` trong `prisma.$transaction`.
  4. Xóa cache Redis: `cache:v1:blog:posts:*` và `cache:v1:blog:post:${slug}`.
  5. Kích hoạt Next.js On-Demand Revalidation Webhook.
* **Response `200 OK`:**
```json
{
  "statusCode": 200,
  "message": "Cập nhật bài viết thành công",
  "data": {
    "id": 103,
    "slug": "bi-quyet-giu-tinh-tao-12-tieng-khong-can-duong",
    "status": "PUBLISHED",
    "updatedAt": "2026-08-27T11:35:00.000Z"
  }
}
```

---

### 2.5. API 5: Đổi Nhanh Trạng Thái Bài Viết (`PATCH /api/v1/admin/blog/posts/:id/status`)

* **Route:** `PATCH /api/v1/admin/blog/posts/:id/status`
* **Request Body (`UpdatePostStatusDto`):**
```json
{
  "status": "ARCHIVED"
}
```
* **Response `200 OK`:**
```json
{
  "statusCode": 200,
  "message": "Cập nhật trạng thái bài viết thành công",
  "data": {
    "id": 103,
    "status": "ARCHIVED",
    "updatedAt": "2026-08-27T11:40:00.000Z"
  }
}
```

---

### 2.6. API 6: Xóa Bài Viết (`DELETE /api/v1/admin/blog/posts/:id`)

* **Route:** `DELETE /api/v1/admin/blog/posts/:id`
* **Quy trình Xử lý:**
  1. Xóa bài viết trong DB (Cascade tự động xóa `PostTag` và `PostProduct`).
  2. Kiểm tra file ảnh `thumbnail` trên ổ đĩa. Nếu không có bài viết hoặc banner nào khác tham chiếu tới file này thì tiến hành xóa file vật lý qua `UploadService.deleteFile()`.
  3. Xóa cache Redis và trigger Next.js Revalidate.
* **Response `200 OK`:**
```json
{
  "statusCode": 200,
  "message": "Xóa bài viết thành công"
}
```

---

### 2.7. API 7: Upload Ảnh Đại Diện Bài Viết (`POST /api/v1/admin/blog/posts/upload-thumbnail`)

* **Route:** `POST /api/v1/admin/blog/posts/upload-thumbnail`
* **Content-Type:** `multipart/form-data` (Field: `file`)
* **Validation:** File dạng `.png`, `.jpg`, `.jpeg`, `.webp`, tối đa `5 MB`.
* **Response `201 Created`:**
```json
{
  "statusCode": 201,
  "message": "Upload hình ảnh thumbnail thành công",
  "data": {
    "url": "/uploads/blog/blog-thumbnail-1724756890-a1b2c3d4.webp",
    "filename": "blog-thumbnail-1724756890-a1b2c3d4.webp",
    "size": 245180,
    "mimetype": "image/webp"
  }
}
```

---

### 2.8. API 8 - 11: Quản Lý Chuyên Mục Blog (`CRUD /api/v1/admin/blog/categories`)

1. **`GET /api/v1/admin/blog/categories`:** Lấy danh sách chuyên mục kèm số lượng bài viết (`postCount`).
2. **`POST /api/v1/admin/blog/categories`:** Tạo chuyên mục (`CreatePostCategoryDto`: `name`, `slug`, `icon`, `description`, `orderIndex`, `isActive`).
3. **`PATCH /api/v1/admin/blog/categories/:id`:** Cập nhật chuyên mục.
4. **`DELETE /api/v1/admin/blog/categories/:id`:** 
   - **Quy tắc an toàn dữ liệu:** Kiểm tra `Post.count({ where: { categoryId: id } }) > 0`.
   - Nếu đang có bài viết: Ném `BadRequestException("Không thể xóa chuyên mục đang chứa bài viết. Vui lòng chuyển bài viết sang chuyên mục khác trước khi xóa")`.

---

### 2.9. API 12: Tìm Kiếm Sản Phẩm Để Gắn Vào Bài Viết (`GET /api/v1/admin/blog/products/search-embed`)

* **Route:** `GET /api/v1/admin/blog/products/search-embed?q=kho+ga`
* **Response `200 OK`:**
```json
{
  "statusCode": 200,
  "message": "Tìm kiếm sản phẩm thành công",
  "data": [
    {
      "id": 201,
      "name": "Khô Gà Lá Chanh Xé Cay 200g",
      "slug": "kho-ga-la-chanh-xe-cay-200g",
      "imageUrl": "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=200&h=200&fit=crop",
      "price": 55000,
      "salePrice": 45000,
      "stock": 42,
      "isActive": true
    }
  ]
}
```

---

## 3. XỬ LÝ BẤT ĐỒNG BỘ, REDIS BUFFER & BACKGROUND JOBS

### 3.1. Cấu Trúc Module NestJS (`apps/backend/src/blog`)

```text
apps/backend/src/blog/
├── dto/
│   ├── create-post.dto.ts                    ← Validation DTO tạo bài viết
│   ├── update-post.dto.ts                    ← Validation DTO cập nhật bài viết
│   ├── update-post-status.dto.ts             ← DTO đổi trạng thái
│   ├── admin-get-blog-posts-query.dto.ts     ← Query DTO lọc phân trang Admin
│   ├── create-post-category.dto.ts           ← DTO tạo chuyên mục
│   └── update-post-category.dto.ts           ← DTO sửa chuyên mục
├── interfaces/
│   └── blog.interface.ts                     ← TypeScript Domain Interfaces
├── controllers/
│   ├── admin-blog.controller.ts              ← Router Admin Dashboard
│   └── public-blog.controller.ts             ← Router Public Storefront
├── services/
│   ├── admin-blog.service.ts                 ← Business Logic CRUD Admin
│   ├── public-blog.service.ts                ← Query cache & SEO
│   └── blog-scheduler.service.ts             ← Cron Jobs (Views buffer & Scheduled publishing)
└── blog.module.ts
```

---

### 3.2. Chiến Lược Cache Redis & Revalidation

1. **Redis Cache Keys:**
   - `cache:v1:blog:categories`: Danh sách chuyên mục (TTL: 1800s).
   - `cache:v1:blog:posts:*`: Danh sách bài viết public (TTL: 300s).
   - `cache:v1:blog:post:${slug}`: Chi tiết bài viết public (TTL: 900s).
   - `blog:views:${postId}`: Atomic Counter tăng view realtime (Không đặt TTL).
2. **On-Demand Cache Invalidation:**
   - Ngay khi Admin Create / Update / Delete / Change Status bài viết:
     1. Xóa toàn bộ key `cache:v1:blog:posts:*` và `cache:v1:blog:post:${slug}` trên Redis.
     2. Gửi Webhook tới Next.js Storefront:
        `POST ${FRONTEND_URL}/api/revalidate?tag=blog-posts&secret=${REVALIDATE_SECRET}`.

---

### 3.3. Background Cron Jobs (`@nestjs/schedule`)

1. **Job 1: Đồng Bộ View Buffer Từ Redis Về MySQL (`@Cron('*/5 * * * *')`)**
   - **Tần suất:** 5 phút / lần.
   - **Logic:** Quét toàn bộ key `blog:views:*`, lấy delta view bằng atomic `redis.getdel(key)`, thực hiện `UPDATE posts SET views = views + ${delta} WHERE id = ${postId}` theo batch trong transaction. Triệt tiêu hoàn toàn nghẽn lock dòng DB.

2. **Job 2: Quét & Xuất Bản Bài Viết Đã Lên Lịch (`@Cron('*/1 * * * *')`)**
   - **Tần suất:** 1 phút / lần.
   - **Logic:**
     ```typescript
     const scheduledPosts = await this.prisma.post.findMany({
       where: {
         status: PostStatus.SCHEDULED,
         scheduledAt: { lte: new Date() },
       },
     });

     for (const post of scheduledPosts) {
       await this.prisma.post.update({
         where: { id: post.id },
         data: {
           status: PostStatus.PUBLISHED,
           publishedAt: new Date(),
         },
       });
       await this.invalidateBlogCache(post.slug);
     }
     ```

---

## 4. KẾ HOẠCH TRIỂN KHAI BACKEND (EXECUTION CHECKLIST)

- [ ] **1. Prisma Schema & DB Push:**
  - [ ] Bổ sung enum `PostStatus`.
  - [ ] Thêm các models `PostCategory`, `Post`, `Tag`, `PostTag`, `PostProduct`.
  - [ ] Thêm relations vào `User` và `Product`.
  - [ ] Chạy `npx prisma db push` & `npx prisma generate`.
- [ ] **2. DTOs & Validation:**
  - [ ] Định nghĩa `CreatePostDto`, `UpdatePostDto`, `AdminGetBlogPostsQueryDto`, `UpdatePostStatusDto`.
  - [ ] Định nghĩa `CreatePostCategoryDto`, `UpdatePostCategoryDto`.
- [ ] **3. Admin Blog Services & Controller:**
  - [ ] Cài đặt `admin-blog.service.ts` với đầy đủ 12 endpoints nghiệp vụ.
  - [ ] Tích hợp `UploadService` upload ảnh thumbnail 16:9 và dọn dẹp file rác khi xóa bài viết.
  - [ ] Xây dựng bộ lọc an toàn cho chuyên mục và chống trùng lặp slug.
- [ ] **4. Cron Scheduler Service:**
  - [ ] Cài đặt `blog-scheduler.service.ts` xử lý sync view và tự động kích hoạt xuất bản bài viết lên lịch.
- [ ] **5. Kiểm tra Type Safety:**
  - [ ] Chạy `npx tsc --noEmit` đạt 0 lỗi.
