# BẢN THIẾT KẾ BACK-END: MODULE QUẢN LÝ CHUYÊN MỤC (CATEGORY MANAGEMENT)

> **Tài liệu tham chiếu:** `.docs/ideas/dashboard/01-category-idea.md` & `.docs/frontend-plans/dashboard/01-category-plan.md`  
> **Tech Stack:** NestJS, Prisma ORM, MySQL, Redis, TypeScript  

---

## 1. Thiết kế Dữ liệu (Database Schema - Prisma / MySQL)

### 1.1. Bảng `Category` (`categories`)
Lưu trữ thông tin chuyên mục sản phẩm, hỗ trợ cấu trúc cây phân cấp (Parent - Child).

```prisma
model Category {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(100)
  slug      String   @unique @db.VarChar(100)
  iconUrl   String?  @db.VarChar(500)
  parentId  Int?
  position  Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  parent   Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  children Category[] @relation("CategoryHierarchy")
  products Product[]

  @@index([slug], name: "idx_category_slug")
  @@index([isActive, position], name: "idx_category_active_position")
  @@index([parentId], name: "idx_category_parent")
  @@map("categories")
}
```

### 1.2. Ràng buộc & Tối ưu Dữ liệu (Constraints & Indexing)
- **Unique Constraint:** `slug` là duy nhất trên toàn hệ thống.
- **Foreign Key:** `parentId` tham chiếu đến `Category.id`. Khi xóa chuyên mục cha (`onDelete: SetNull`), các chuyên mục con chuyển về cấp cao nhất (parentId = null) hoặc bị chặn xóa nếu có ràng buộc nghiệp vụ.
- **Indexing:**
  - `idx_category_slug`: Tối ưu tra cứu nhanh theo slug cho trang sản phẩm theo danh mục ở Frontend.
  - `idx_category_active_position`: Tối ưu sắp xếp danh mục hiển thị trên trang chủ và thanh menu.
  - `idx_category_parent`: Tối ưu truy vấn danh sách chuyên mục con.

---

## 2. Giao kèo API (API Contract)

### 2.1. API Lấy Danh sách Chuyên mục (Admin Dashboard)
- **Method & Route:** `GET /api/v1/admin/categories`
- **Auth & Authorization:** Require JWT Access Token (`JwtAuthGuard`) + Role (`RolesGuard`: `ADMIN`, `STAFF`).
- **Query Params (DTO - `GetAdminCategoriesDto`):**
  - `search` (optional): `string` - Tìm kiếm theo tên hoặc slug (đã debounce phía Client 300ms-500ms).
  - `isActive` (optional): `boolean` - Lọc theo trạng thái hoạt động.
  - `parentId` (optional): `number` | `'null'` - Lọc theo chuyên mục cha.
  - `page` (optional): `number` (Default: `1`, Min: `1`).
  - `limit` (optional): `number` (Default: `10`, Max: `100`).
  - `sortBy` (optional): `'createdAt'` | `'position'` | `'name'` (Default: `'position'`).
  - `sortOrder` (optional): `'asc'` | `'desc'` (Default: `'asc'`).
- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách chuyên mục thành công",
  "data": [
    {
      "id": 1,
      "name": "Đồ Ăn Nhanh",
      "slug": "do-an-nhanh",
      "iconUrl": "https://cdn.example.com/icons/fastfood.png",
      "parentId": null,
      "parentName": null,
      "position": 1,
      "isActive": true,
      "productCount": 24,
      "childrenCount": 3,
      "createdAt": "2026-08-01T10:00:00.000Z",
      "updatedAt": "2026-08-10T15:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

---

### 2.2. API Lấy Chi tiết Chuyên mục theo ID
- **Method & Route:** `GET /api/v1/admin/categories/:id`
- **Auth & Authorization:** Require JWT Access Token (`JwtAuthGuard`) + Role (`RolesGuard`: `ADMIN`, `STAFF`).
- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Lấy thông tin chi tiết chuyên mục thành công",
  "data": {
    "id": 1,
    "name": "Đồ Ăn Nhanh",
    "slug": "do-an-nhanh",
    "iconUrl": "https://cdn.example.com/icons/fastfood.png",
    "parentId": null,
    "position": 1,
    "isActive": true,
    "parent": null,
    "children": [
      {
        "id": 5,
        "name": "Burger & Pizza",
        "slug": "burger-pizza",
        "position": 1,
        "isActive": true
      }
    ],
    "productCount": 24,
    "createdAt": "2026-08-01T10:00:00.000Z",
    "updatedAt": "2026-08-10T15:30:00.000Z"
  }
}
```
- **Response Failure (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy chuyên mục với ID = 999",
  "error": "Not Found"
}
```

---

### 2.3. API Tạo Mới Chuyên mục (Create Category)
- **Method & Route:** `POST /api/v1/admin/categories`
- **Auth & Authorization:** Require JWT Access Token (`JwtAuthGuard`) + Role (`RolesGuard`: `ADMIN`).
- **Request Payload (DTO - `CreateCategoryDto`):**
```json
{
  "name": "Món Lẩu & Nướng",
  "slug": "mon-lau-nuong",
  "iconUrl": "https://cdn.example.com/icons/hotpot.png",
  "parentId": null,
  "position": 2,
  "isActive": true
}
```
*Ghi chú: Nếu `slug` để trống, Backend sẽ tự động sinh slug chuẩn từ `name` (sử dụng slugify).*

- **Response Success (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Tạo mới chuyên mục thành công",
  "data": {
    "id": 16,
    "name": "Món Lẩu & Nướng",
    "slug": "mon-lau-nuong",
    "iconUrl": "https://cdn.example.com/icons/hotpot.png",
    "parentId": null,
    "position": 2,
    "isActive": true,
    "createdAt": "2026-08-12T08:00:00.000Z",
    "updatedAt": "2026-08-12T08:00:00.000Z"
  }
}
```
- **Response Failure (409 Conflict):**
```json
{
  "statusCode": 409,
  "message": "Slug 'mon-lau-nuong' đã tồn tại trong hệ thống",
  "error": "Conflict"
}
```
- **Response Failure (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Chuyên mục cha (parentId = 999) không tồn tại",
  "error": "Bad Request"
}
```

---

### 2.4. API Cập Nhật Chuyên mục (Update Category)
- **Method & Route:** `PATCH /api/v1/admin/categories/:id`
- **Auth & Authorization:** Require JWT Access Token (`JwtAuthGuard`) + Role (`RolesGuard`: `ADMIN`).
- **Request Payload (DTO - `UpdateCategoryDto`):**
```json
{
  "name": "Món Lẩu & Đồ Nướng Hàn Quốc",
  "slug": "mon-lau-do-nuong-han-quoc",
  "iconUrl": "https://cdn.example.com/icons/hotpot-v2.png",
  "parentId": null,
  "position": 2,
  "isActive": true
}
```

- **Validation Quy tắc Đệ quy (Circular Reference Protection):**
  - CẤM gán `parentId` bằng chính `id` của chuyên mục đó.
  - CẤM gán `parentId` là một trong các chuyên mục con thuộc cây của chuyên mục hiện tại (tránh đệ quy vô tận).

- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Cập nhật chuyên mục thành công",
  "data": {
    "id": 16,
    "name": "Món Lẩu & Đồ Nướng Hàn Quốc",
    "slug": "mon-lau-do-nuong-han-quoc",
    "iconUrl": "https://cdn.example.com/icons/hotpot-v2.png",
    "parentId": null,
    "position": 2,
    "isActive": true,
    "updatedAt": "2026-08-12T08:05:00.000Z"
  }
}
```

---

### 2.5. API Xóa Chuyên mục (Delete Category)
- **Method & Route:** `DELETE /api/v1/admin/categories/:id`
- **Auth & Authorization:** Require JWT Access Token (`JwtAuthGuard`) + Role (`RolesGuard`: `ADMIN`).
- **Ràng buộc Bảo vệ Dữ liệu (Safety Checks):**
  1. Kiểm tra nếu chuyên mục có chứa sản phẩm (`Product.count({ where: { categoryId: id } }) > 0`) ➔ **CẤM XÓA**, trả lỗi HTTP 400 Bad Request.
  2. Kiểm tra nếu chuyên mục đang có chuyên mục con (`Category.count({ where: { parentId: id } }) > 0`) ➔ **CẤM XÓA**, trả lỗi HTTP 400 Bad Request.
- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Xóa chuyên mục thành công"
}
```
- **Response Failure (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Không thể xóa chuyên mục này vì đang có 12 sản phẩm liên quan. Vui lòng chuyển sản phẩm sang chuyên mục khác trước.",
  "error": "Bad Request"
}
```

---

## 3. Kiến trúc, Xóa Cache & Bảo mật (Architecture & Caching Strategy)

### 3.1. Phân quyền & Bảo mật (Security & Authorization)
- Tất cả API Admin Chuyên mục BẮT BUỘC đi qua `JwtAuthGuard` để xác thực Access Token từ Header `Authorization: Bearer <token>`.
- Các thao tác ghi/sửa/xóa (`POST`, `PATCH`, `DELETE`) BẮT BUỘC chỉ dành cho quyền `ADMIN` (`@Roles(Role.ADMIN)`).
- Thao tác xem/lọc danh sách (`GET`) mở cho cả `ADMIN` và `STAFF`.

### 3.2. Chiến lược Quản lý Cache (Redis Cache Invalidation)
- **Công khai (Public Frontend):** Khách hàng xem danh mục qua `GET /api/v1/categories` được cache trên Redis (`cache:categories:all`, `cache:categories:tree`) với TTL 3600 giây.
- **Quản trị (Admin Dashboard):** Khi Admin thực hiện bất kỳ thao tác thay đổi dữ liệu nào (`POST`, `PATCH`, `DELETE` chuyên mục), Service BẮT BUỘC thực thi:
  1. Xóa toàn bộ key cache public liên quan (`cache:categories:*`).
  2. Log ghi nhận cache invalidation để đảm bảo dữ liệu mới nhất được phản ánh tức thì trên trang chủ và trang danh sách sản phẩm của khách hàng.

### 3.3. Xử lý Lỗi chuẩn hóa (Standard Exception Handling)
- **400 Bad Request:** Lỗi DTO validation hoặc vi phạm logic ràng buộc sản phẩm/chuyên mục con.
- **401 Unauthorized:** Token không hợp lệ, hết hạn hoặc bị blacklist trên Redis.
- **403 Forbidden:** User không có quyền `ADMIN` khi gọi API ghi/sửa/xóa.
- **404 Not Found:** Không tìm thấy chuyên mục tương ứng với `id`.
- **409 Conflict:** `slug` trùng lặp với chuyên mục đã có.
