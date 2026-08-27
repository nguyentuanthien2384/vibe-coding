# BẢN THIẾT KẾ BACK-END: MODULE BLOG & TIN TỨC (TECHBITE ECOMMERCE)

> **Tài liệu tham chiếu:** `.docs/ideas/10-blog-idea.md`, `.docs/frontend-plans/blog-idea-plan.md`, `.docs/ARCHITECTURE.md`, `AGENTS.md`  
> **Tech Stack:** NestJS, Prisma ORM, MySQL, Redis (`ioredis`), `@nestjs/schedule`, `class-validator`, `class-transformer`

---

## 1. THIẾT KẾ DỮ LIỆU (DATABASE SCHEMA - PRISMA / MYSQL)

Module **Blog & Tin tức** quản lý toàn bộ bài viết, chuyên mục, thẻ hashtag và mối liên kết nhúng sản phẩm trực tiếp vào bài viết (Cross-selling / Upselling).

### 1.1. Enums Mới Cần Bổ Sung Trong `prisma/schema.prisma`

```prisma
enum PostStatus {
  DRAFT       // Bản nháp, chỉ tác giả/admin xem được
  SCHEDULED   // Đã lên lịch, tự động chuyển PUBLISHED khi đến thời điểm scheduledAt
  PUBLISHED   // Đã công khai trên store
  ARCHIVED    // Lưu trữ / ẩn bài viết
}
```

### 1.2. Bảng `PostCategory` (Chuyên mục bài viết)

```prisma
/// Bảng chuyên mục bài viết (Góc Coder, Review Đồ Ăn, Nước Tăng Lực...)
model PostCategory {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(100)
  slug        String   @unique @db.VarChar(100)
  description String?  @db.VarChar(500)
  icon        String?  @db.VarChar(100) // Emoji hoặc icon class/SVG url
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

### 1.3. Bảng `Post` (Bài viết)

```prisma
/// Bảng bài viết Blog & Tin tức
model Post {
  id              Int        @id @default(autoincrement())
  title           String     @db.VarChar(255)
  slug            String     @unique @db.VarChar(255)
  summary         String     @db.VarChar(500)
  thumbnail       String     @db.VarChar(500)
  content         Json       // Cấu trúc TipTap JSON Blocks chuẩn (Nodes, Marks, Blocks)
  status          PostStatus @default(DRAFT)
  readTimeMinutes Int        @default(5)
  views           Int        @default(0) // Giá trị lưu bền vững (sync từ Redis theo batch)
  
  // Tác giả & Chuyên mục
  authorId        Int
  categoryId      Int
  
  // Thời gian lên lịch & Xuất bản
  scheduledAt     DateTime?
  publishedAt     DateTime?
  
  // SEO Metadata
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
  @@map("posts")
}
```

### 1.4. Bảng `Tag` & `PostTag` (Thẻ Hashtag & Quan hệ Nhiều-Nhiều)

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

/// Bảng trung gian liên kết Post và Tag
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

### 1.5. Bảng `PostProduct` (Sản phẩm đính kèm bài viết - Cross-selling)

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

### 1.6. Cập nhật Model Sẵn Có trong `prisma/schema.prisma`

- **Model `User`**: Bổ sung quan hệ `posts Post[]`
- **Model `Product`**: Bổ sung quan hệ `postProducts PostProduct[]`

---

## 2. GIAO KÈO API (API CONTRACT - RESTFUL)

### 2.1. CÁC ENDPOINT DÀNH CHO PUBLIC CLIENT (`/api/v1/blog`)

#### 1. Lấy danh sách chuyên mục Blog (`GET /api/v1/blog/categories`)
- **Route:** `GET /api/v1/blog/categories`
- **Auth:** Public
- **Caching:** Redis `cache:v1:blog:categories` (TTL: 1800s)

##### Response Success (200 OK):
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách chuyên mục blog thành công",
  "data": [
    {
      "id": 1,
      "name": "Tất Cả Bài Viết",
      "slug": "tat-ca",
      "description": "Toàn bộ bài viết mẹo hay & tin tức",
      "icon": "📰",
      "postCount": 24
    },
    {
      "id": 2,
      "name": "Góc Coder Thức Khuya",
      "slug": "goc-coder-thuc-khuya",
      "description": "Bí quyết nạp năng lượng chạy deadline",
      "icon": "💻",
      "postCount": 12
    }
  ]
}
```

---

#### 2. Lấy danh sách bài viết công khai có phân trang & tìm kiếm (`GET /api/v1/blog/posts`)
- **Route:** `GET /api/v1/blog/posts`
- **Auth:** Public
- **Query Params (`GetBlogPostsQueryDto`):**
  - `page`: `number` (Default: `1`)
  - `limit`: `number` (Default: `9`, Max: `30`)
  - `category`: `string` (Slug chuyên mục, optional)
  - `tag`: `string` (Slug tag, optional)
  - `q`: `string` (Từ khóa tìm kiếm Debounced, optional)
  - `sort`: `'latest' | 'views'` (Default: `'latest'`)
  - `featured`: `boolean` (Lọc bài viết nổi bật, optional)

##### Response Success (200 OK):
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách bài viết thành công",
  "data": {
    "items": [
      {
        "id": 101,
        "title": "Top 7 Món Ăn Vặt 'Cứu Cánh' Đêm Chạy Deadline Cho Anh Em Lập Trình Viên",
        "slug": "top-7-mon-an-vat-cuu-canh-dem-chay-deadline",
        "summary": "Tổng hợp các món ăn nhanh vừa tiện lợi, vừa giàu protein giúp giữ tỉnh táo suốt đêm trắng fix bug.",
        "thumbnail": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=675&fit=crop",
        "status": "PUBLISHED",
        "views": 1845,
        "readTimeMinutes": 6,
        "publishedAt": "2026-08-25T14:30:00.000Z",
        "author": {
          "id": 1,
          "fullName": "Hoàng Nam Dev",
          "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop",
          "role": "ADMIN"
        },
        "category": {
          "id": 2,
          "name": "Góc Coder Thức Khuya",
          "slug": "goc-coder-thuc-khuya"
        },
        "tags": [
          { "id": 1, "name": "Thức Khuya", "slug": "thuc-khuya" },
          { "id": 2, "name": "Deadline", "slug": "deadline" }
        ]
      }
    ],
    "meta": {
      "page": 1,
      "limit": 9,
      "totalItems": 24,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

#### 3. Lấy chi tiết 1 bài viết theo Slug (`GET /api/v1/blog/posts/:slug`)
- **Route:** `GET /api/v1/blog/posts/:slug`
- **Auth:** Public
- **Caching:** Redis `cache:v1:blog:post:${slug}` (TTL: 900s)

##### Response Success (200 OK):
```json
{
  "statusCode": 200,
  "message": "Lấy chi tiết bài viết thành công",
  "data": {
    "id": 101,
    "title": "Top 7 Món Ăn Vặt 'Cứu Cánh' Đêm Chạy Deadline Cho Anh Em Lập Trình Viên",
    "slug": "top-7-mon-an-vat-cuu-canh-dem-chay-deadline",
    "summary": "Tổng hợp các món ăn nhanh vừa tiện lợi, vừa giàu protein giúp giữ tỉnh táo suốt đêm trắng fix bug.",
    "thumbnail": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=675&fit=crop",
    "content": {
      "type": "doc",
      "content": [
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "1. Khô Gà Lá Chanh Xé Cay – Kích Thích Vị Giác" }]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Khô gà xé cay là lựa chọn hàng đầu của đa số lập trình viên vì vừa tiện lợi vừa thơm giòn..." }
          ]
        }
      ]
    },
    "status": "PUBLISHED",
    "views": 1845,
    "readTimeMinutes": 6,
    "publishedAt": "2026-08-25T14:30:00.000Z",
    "metaTitle": "Top 7 Món Ăn Vặt Cho Dân IT Chạy Deadline | TechBite",
    "metaDescription": "Bí quyết nạp năng lượng ban đêm không gây nặng bụng hay buồn ngủ.",
    "canonicalUrl": "https://techbite.vn/blog/top-7-mon-an-vat-cuu-canh-dem-chay-deadline",
    "ogImage": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
    "author": {
      "id": 1,
      "fullName": "Hoàng Nam Dev",
      "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop",
      "role": "ADMIN",
      "bio": "Senior Tech Writer & Food Reviewer tại TechBite"
    },
    "category": {
      "id": 2,
      "name": "Góc Coder Thức Khuya",
      "slug": "goc-coder-thuc-khuya"
    },
    "tags": [
      { "id": 1, "name": "Thức Khuya", "slug": "thuc-khuya" },
      { "id": 2, "name": "Deadline", "slug": "deadline" }
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
          "imageUrl": "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=300&h=300&fit=crop",
          "price": 55000,
          "salePrice": 45000,
          "stock": 25,
          "isActive": true
        }
      }
    ],
    "relatedPosts": [
      {
        "id": 102,
        "title": "So Sánh Nước Tăng Lực Không Đường: Celsius vs Monster",
        "slug": "so-sanh-nuoc-tang-luc-khong-duong-celsius-vs-monster",
        "summary": "Đánh giá chi tiết hàm lượng caffeine và cảm giác tim đập sau 4 tiếng code.",
        "thumbnail": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&h=338&fit=crop",
        "status": "PUBLISHED",
        "views": 920,
        "readTimeMinutes": 4,
        "publishedAt": "2026-08-24T09:15:00.000Z",
        "author": { "id": 2, "fullName": "Minh Thư", "avatarUrl": null, "role": "STAFF" },
        "category": { "id": 4, "name": "Nước Tăng Lực & Cà Phê", "slug": "nuoc-tang-luc-ca-phe" },
        "tags": []
      }
    ]
  }
}
```

---

#### 4. Ghi nhận lượt xem bài viết tăng dần bất đồng bộ (`POST /api/v1/blog/posts/:slug/view`)
- **Route:** `POST /api/v1/blog/posts/:slug/view`
- **Auth:** Public
- **Rate Limit:** `@Throttle({ default: { limit: 120, ttl: 60000 } })`
- **Logic:** Tăng biến đếm Redis `INCR blog:views:${postId}`. Tuyệt đối KHÔNG ghi thẳng vào MySQL để tránh DB row locks.

##### Response Success (200 OK):
```json
{
  "statusCode": 200,
  "message": "Ghi nhận lượt xem thành công"
}
```

---

### 2.2. CÁC ENDPOINT QUẢN TRỊ ADMIN DASHBOARD (`/api/v1/admin/blog`)

> 🔒 **Auth & Permissions:** Tất cả endpoint dưới đây yêu cầu `JwtAuthGuard` + `RolesGuard(['ADMIN', 'STAFF'])`.

#### 1. Lấy danh sách bài viết quản trị (`GET /api/v1/admin/blog/posts`)
- **Route:** `GET /api/v1/admin/blog/posts`
- **Query Params (`AdminGetPostsQueryDto`):** `page`, `limit`, `status`, `categoryId`, `q`.

##### Response Success (200 OK):
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách bài viết quản trị thành công",
  "data": {
    "items": [
      {
        "id": 101,
        "title": "Top 7 Món Ăn Vặt Cứu Cánh Đêm Chạy Deadline",
        "slug": "top-7-mon-an-vat-cuu-canh-dem-chay-deadline",
        "thumbnail": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
        "status": "PUBLISHED",
        "views": 1845,
        "category": { "id": 2, "name": "Góc Coder Thức Khuya" },
        "author": { "id": 1, "fullName": "Hoàng Nam Dev" },
        "publishedAt": "2026-08-25T14:30:00.000Z",
        "scheduledAt": null,
        "createdAt": "2026-08-25T10:00:00.000Z"
      }
    ],
    "meta": { "page": 1, "limit": 10, "totalItems": 45, "totalPages": 5, "hasNextPage": true, "hasPrevPage": false }
  }
}
```

---

#### 2. Tạo mới bài viết (`POST /api/v1/admin/blog/posts`)
- **Route:** `POST /api/v1/admin/blog/posts`
- **Request Body (`CreatePostDto`):**

```typescript
export class CreatePostDto {
  @IsString({ message: 'Tiêu đề không được để trống' })
  @MaxLength(255, { message: 'Tiêu đề tối đa 255 ký tự' })
  title: string;

  @IsString({ message: 'Slug không được để trống' })
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug không đúng định dạng kebab-case' })
  slug: string;

  @IsString({ message: 'Tóm tắt bài viết không được để trống' })
  @MaxLength(500)
  summary: string;

  @IsUrl({}, { message: 'Thumbnail phải là URL hợp lệ' })
  thumbnail: string;

  @IsObject({ message: 'Nội dung TipTap content phải là Object JSON' })
  content: Record<string, unknown>;

  @IsEnum(PostStatus, { message: 'Trạng thái bài viết không hợp lệ' })
  status: PostStatus;

  @IsInt({ message: 'categoryId phải là số nguyên' })
  @Min(1)
  categoryId: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  productIds?: number[]; // Danh sách ID sản phẩm đính kèm bài viết

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsUrl()
  ogImage?: string;

  @IsOptional()
  @IsUrl()
  canonicalUrl?: string;
}
```

##### Response Success (201 Created):
```json
{
  "statusCode": 201,
  "message": "Tạo bài viết mới thành công",
  "data": {
    "id": 108,
    "title": "Bí Quyết Giữ Sức Khỏe Cho Dev Khi OT",
    "slug": "bi-quyet-giu-suc-khoe-cho-dev-khi-ot",
    "status": "DRAFT",
    "createdAt": "2026-08-27T09:00:00.000Z"
  }
}
```

---

#### 3. Cập nhật bài viết (`PUT /api/v1/admin/blog/posts/:id`)
- **Route:** `PUT /api/v1/admin/blog/posts/:id`
- **Request Body (`UpdatePostDto`):** `PartialType(CreatePostDto)`
- **Logic:** Tự động kích hoạt Invalidation Cache Redis và gửi Webhook On-demand revalidate Next.js.

##### Response Success (200 OK):
```json
{
  "statusCode": 200,
  "message": "Cập nhật bài viết thành công",
  "data": {
    "id": 108,
    "slug": "bi-quyet-giu-suc-khoe-cho-dev-khi-ot",
    "status": "PUBLISHED",
    "updatedAt": "2026-08-27T09:15:00.000Z"
  }
}
```

---

#### 4. Đổi trạng thái bài viết nhanh (`PATCH /api/v1/admin/blog/posts/:id/status`)
- **Route:** `PATCH /api/v1/admin/blog/posts/:id/status`
- **Request Body (`UpdatePostStatusDto`):**

```typescript
export class UpdatePostStatusDto {
  @IsEnum(PostStatus)
  status: PostStatus;
}
```

---

#### 5. Xóa bài viết (`DELETE /api/v1/admin/blog/posts/:id`)
- **Route:** `DELETE /api/v1/admin/blog/posts/:id`

##### Response Success (200 OK):
```json
{
  "statusCode": 200,
  "message": "Đã xóa bài viết thành công"
}
```

---

#### 6. Quản lý Chuyên mục Blog (`CRUD /api/v1/admin/blog/categories`)
- `GET /api/v1/admin/blog/categories`
- `POST /api/v1/admin/blog/categories` (`CreatePostCategoryDto`)
- `PUT /api/v1/admin/blog/categories/:id` (`UpdatePostCategoryDto`)
- `DELETE /api/v1/admin/blog/categories/:id`

---

## 3. KIẾN TRÚC BẤT ĐỒNG BỘ, REDIS BUFFER & BACKGROUND JOBS

### 3.1. Cấu Trúc Module NestJS (`apps/backend/src/modules/blog`)

```text
apps/backend/src/modules/blog/
├── dtos/
│   ├── create-post.dto.ts
│   ├── update-post.dto.ts
│   ├── get-blog-posts-query.dto.ts
│   ├── create-post-category.dto.ts
│   └── update-post-category.dto.ts
├── interfaces/
│   └── blog.interface.ts
├── controllers/
│   ├── blog-public.controller.ts     ← Phục vụ Frontend Storefront
│   └── blog-admin.controller.ts      ← Phục vụ Admin Dashboard
├── services/
│   ├── blog-public.service.ts        ← Logic query, cache, SEO JSON-LD
│   ├── blog-admin.service.ts         ← Logic CRUD, Revalidation
│   └── blog-scheduler.service.ts     ← Cron sync views & publish scheduled
└── blog.module.ts
```

### 3.2. Chiến Lược Redis Caching & Cache Invalidation

1. **Cache Key Patterns:**
   - Danh sách chuyên mục: `cache:v1:blog:categories` (TTL: 1800s)
   - Danh sách bài viết: `cache:v1:blog:posts:*` (TTL: 300s)
   - Chi tiết bài viết: `cache:v1:blog:post:${slug}` (TTL: 900s)
   - Atomic Views Counter: `blog:views:${postId}` (Không đặt TTL, sync bằng Cron)

2. **On-Demand Cache Invalidation:**
   - Khi Admin Create / Update / Delete / Chuyển Status bài viết:
     1. Xóa toàn bộ key `cache:v1:blog:posts:*` và `cache:v1:blog:post:${slug}` trên Redis.
     2. Gửi request Webhook Revalidation đến Next.js App Router:
        `POST ${FRONTEND_URL}/api/revalidate?tag=blog-posts&secret=${REVALIDATE_SECRET}`.

### 3.3. Background Cron Jobs (`@nestjs/schedule`)

1. **Job 1: Sync Views Buffer từ Redis về MySQL (`@Cron('*/5 * * * *')`)**
   - **Tần suất:** Chạy mỗi 5 phút một lần.
   - **Quy trình:**
     1. Quét toàn bộ key có dạng `blog:views:*` trong Redis.
     2. Đọc giá trị delta view bằng `redis.getdel(key)` (hoặc Pipeline atomic get + reset).
     3. Chạy `prisma.$transaction()` thực hiện `UPDATE posts SET views = views + ${delta} WHERE id = ${postId}` theo batch.
     4. Triệt tiêu hoàn toàn nghẽn hàng đợi (row lock contention) trên MySQL.

2. **Job 2: Quét & Xuất bản Bài viết Đã Lên Lịch (`@Cron('*/1 * * * *')`)**
   - **Tần suất:** Chạy mỗi 1 phút một lần.
   - **Quy trình:**
     1. Query: `prisma.post.findMany({ where: { status: 'SCHEDULED', scheduledAt: { lte: new Date() } } })`.
     2. Cập nhật `status: 'PUBLISHED'`, `publishedAt: new Date()`.
     3. Kích hoạt Invalidate Cache Redis & Revalidate Next.js.

---

## 4. KẾ HOẠCH TRIỂN KHAI BACKEND (EXECUTION CHECKLIST)

- [ ] **Prisma Schema Update:**
  - [ ] Thêm enum `PostStatus`.
  - [ ] Thêm model `PostCategory`, `Post`, `Tag`, `PostTag`, `PostProduct`.
  - [ ] Bổ sung relations trong `User` và `Product`.
  - [ ] Chạy `npx prisma db push` và `npx prisma generate`.
- [ ] **DTOs & Validation:**
  - [ ] Viết `CreatePostDto`, `UpdatePostDto`, `GetBlogPostsQueryDto`, `AdminGetPostsQueryDto`.
  - [ ] Viết `CreatePostCategoryDto`, `UpdatePostCategoryDto`.
- [ ] **Public Services & Controller:**
  - [ ] Cài đặt `getPublicPosts()`, `getPostBySlug()`, `getCategories()`, `recordPostView()`.
  - [ ] Tích hợp Redis Caching & Throttler chống spam view.
- [ ] **Admin Services & Controller:**
  - [ ] Cài đặt `createPost()`, `updatePost()`, `deletePost()`, `changeStatus()`.
  - [ ] Tích hợp On-Demand Cache Invalidation & Next.js Revalidation Trigger.
- [ ] **Scheduled Cron Tasks:**
  - [ ] Cài đặt `BlogSchedulerService` cho view syncing (5 min) và scheduled publishing (1 min).
