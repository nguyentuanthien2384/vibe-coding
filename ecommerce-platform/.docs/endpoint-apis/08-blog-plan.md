# DANH SÁCH ENDPOINTS API: MODULE QUẢN LÝ BLOG (ADMIN DASHBOARD BLOG)

> **Tài liệu tham chiếu:** `.docs/backend-plans/dashboard/08-blog-plan.md`  
> **Source Controller:** `app/backend/src/blog/controllers/blog-admin.controller.ts`  
> **Source Service:** `app/backend/src/blog/services/blog-admin.service.ts`  
> **Xác thực & Phân quyền:** `@UseGuards(JwtAuthGuard, RolesGuard)`, `@Roles(Role.ADMIN, Role.STAFF)`  

---

## 1. Danh Sách Endpoints Quản Lý Bài Viết (Posts)

| STT | Phương thức | Endpoint URI | Mô tả chức năng | Quyền truy cập |
|---|---|---|---|---|
| 1 | `GET` | `/api/v1/admin/blog/posts` | Lấy danh sách bài viết phân trang (Hỗ trợ `search`, `categoryId`, `status`, `sortBy`) | `ADMIN`, `STAFF` |
| 2 | `GET` | `/api/v1/admin/blog/posts/:id` | Lấy chi tiết bài viết (Kèm TipTap Content JSON, sản phẩm gắn kèm, tags) | `ADMIN`, `STAFF` |
| 3 | `POST` | `/api/v1/admin/blog/posts` | Tạo mới bài viết (Tự động sinh slug nếu rỗng, đồng bộ tags & products) | `ADMIN`, `STAFF` |
| 4 | `PUT` | `/api/v1/admin/blog/posts/:id` | Cập nhật toàn bộ bài viết (Đồng bộ tags, products, cập nhật `publishedAt` nếu chuyển sang `PUBLISHED`) | `ADMIN`, `STAFF` |
| 5 | `PATCH` | `/api/v1/admin/blog/posts/:id` | Cập nhật từng phần bài viết | `ADMIN`, `STAFF` |
| 6 | `PATCH` | `/api/v1/admin/blog/posts/:id/status` | Đổi nhanh trạng thái bài viết (`PUBLISHED`, `SCHEDULED`, `DRAFT`, `ARCHIVED`) | `ADMIN`, `STAFF` |
| 7 | `DELETE` | `/api/v1/admin/blog/posts/:id` | Xóa bài viết (Tự động dọn dẹp file thumbnail nếu không còn tham chiếu) | `ADMIN`, `STAFF` |
| 8 | `POST` | `/api/v1/admin/blog/posts/upload-thumbnail` | Upload ảnh đại diện thumbnail (16:9, max 5MB, JPEG/PNG/WebP/SVG/GIF) | `ADMIN`, `STAFF` |

---

## 2. Danh Sách Endpoints Quản Lý Chuyên Mục (Categories)

| STT | Phương thức | Endpoint URI | Mô tả chức năng | Quyền truy cập |
|---|---|---|---|---|
| 9 | `GET` | `/api/v1/admin/blog/categories` | Lấy danh sách chuyên mục kèm số lượng bài viết (`postCount`) | `ADMIN`, `STAFF` |
| 10 | `POST` | `/api/v1/admin/blog/categories` | Tạo mới chuyên mục bài viết | `ADMIN`, `STAFF` |
| 11 | `PATCH` / `PUT` | `/api/v1/admin/blog/categories/:id` | Cập nhật chuyên mục | `ADMIN`, `STAFF` |
| 12 | `DELETE` | `/api/v1/admin/blog/categories/:id` | Xóa chuyên mục (Chặn xóa nếu còn bài viết - Data Safety) | `ADMIN`, `STAFF` |

---

## 3. Danh Sách Endpoints Nhúng Sản Phẩm (Cross-selling)

| STT | Phương thức | Endpoint URI | Mô tả chức năng | Quyền truy cập |
|---|---|---|---|---|
| 13 | `GET` | `/api/v1/admin/blog/products/search-embed` | Tìm kiếm sản phẩm store theo tên/slug để gắn vào bài viết | `ADMIN`, `STAFF` |
