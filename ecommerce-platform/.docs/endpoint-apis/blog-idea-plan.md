# DANH SÁCH API ENDPOINTS: MODULE BLOG & TIN TỨC

> **Backend Path:** `apps/backend/src/blog`  
> **Status:** Đã hoàn thiện mã nguồn và kiểm thử kiểu dữ liệu (TypeScript Validated)

---

## 1. Public Storefront APIs (`/api/v1/blog`)

| Phương thức | Endpoint | Auth | Chức năng | Caching & Rate Limit |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/blog/categories` | Public | Lấy danh sách chuyên mục blog | Redis (`cache:v1:blog:categories`, TTL 1800s) |
| `GET` | `/api/v1/blog/posts` | Public | Lấy danh sách bài viết có phân trang, lọc theo category, tag, tìm kiếm, sắp xếp | Redis (`cache:v1:blog:posts:*`, TTL 300s) |
| `GET` | `/api/v1/blog/posts/:slug` | Public | Lấy chi tiết bài viết, sản phẩm đính kèm và bài liên quan | Redis (`cache:v1:blog:post:${slug}`, TTL 900s) |
| `POST` | `/api/v1/blog/posts/:slug/view` | Public | Tăng số lượt xem bài viết bất đồng bộ | Throttler (120 req/min), Redis Atomic Counter (`blog:views:${postId}`) |

---

## 2. Admin Dashboard APIs (`/api/v1/admin/blog`)

> **Yêu cầu bảo mật:** `JwtAuthGuard` + `RolesGuard(['ADMIN', 'STAFF'])`

| Phương thức | Endpoint | Chức năng | Ghi chú |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/blog/posts` | Lấy danh sách bài viết quản trị | Hỗ trợ phân trang, lọc theo `status`, `categoryId`, `q` |
| `POST` | `/api/v1/admin/blog/posts` | Tạo mới bài viết | Tự động invalidate Redis cache & revalidate Next.js |
| `PUT` | `/api/v1/admin/blog/posts/:id` | Cập nhật bài viết | Tự động invalidate Redis cache & revalidate Next.js |
| `PATCH` | `/api/v1/admin/blog/posts/:id/status` | Cập nhật nhanh trạng thái bài viết | `DRAFT`, `SCHEDULED`, `PUBLISHED`, `ARCHIVED` |
| `DELETE` | `/api/v1/admin/blog/posts/:id` | Xóa bài viết | Xóa quan hệ PostTag, PostProduct và làm sạch cache |
| `GET` | `/api/v1/admin/blog/categories` | Lấy toàn bộ chuyên mục bài viết | Sắp xếp theo `orderIndex` |
| `POST` | `/api/v1/admin/blog/categories` | Tạo chuyên mục mới | Xóa cache categories |
| `PUT` | `/api/v1/admin/blog/categories/:id` | Cập nhật chuyên mục | Xóa cache categories |
| `DELETE` | `/api/v1/admin/blog/categories/:id` | Xóa chuyên mục | Xóa cache categories |

---

## 3. Background Cron Jobs (`BlogSchedulerService`)

1. **Sync Views Buffer (`*/5 * * * *`):** Đọc delta lượt xem từ Redis (`blog:views:*`) và batch update vào MySQL theo giao dịch (`prisma.$transaction`).
2. **Publish Scheduled Posts (`*/1 * * * *`):** Tự động chuyển các bài viết trạng thái `SCHEDULED` sang `PUBLISHED` khi tới thời gian `scheduledAt` và làm mới cache.
