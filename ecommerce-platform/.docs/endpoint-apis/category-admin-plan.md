# ENDPOINT APIS: Admin Category Management

> **Source Plan:** `.docs/backend-plans/dashboard/category-admin-plan.md`  
> **Base URL:** `/api/v1`  
> **Auth:** Tất cả endpoint đều yêu cầu `Authorization: Bearer <accessToken>`

---

## Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/v1/admin/categories` | ADMIN, STAFF | Lấy danh sách chuyên mục (phân trang, lọc, tìm kiếm) |
| `GET` | `/api/v1/admin/categories/:id` | ADMIN, STAFF | Lấy chi tiết chuyên mục theo ID |
| `POST` | `/api/v1/admin/categories` | ADMIN only | Tạo mới chuyên mục |
| `PATCH` | `/api/v1/admin/categories/:id` | ADMIN only | Cập nhật thông tin chuyên mục |
| `DELETE` | `/api/v1/admin/categories/:id` | ADMIN only | Xóa chuyên mục (có safety check) |

---

## Files vật lý đã tạo

| File | Mô tả |
|------|-------|
| `src/categories/admin-categories.controller.ts` | Controller 5 endpoints |
| `src/categories/admin-categories.service.ts` | Service: CRUD, slug auto-gen, circular ref protection, cache invalidation |
| `src/categories/dto/get-admin-categories.dto.ts` | DTO query: search, isActive, parentId, page, limit, sortBy, sortOrder |
| `src/categories/dto/create-category.dto.ts` | DTO create: name, slug (optional), iconUrl, parentId, position, isActive |
| `src/categories/dto/update-category.dto.ts` | DTO update: extends PartialType(CreateCategoryDto) |
| `src/categories/interfaces/admin-category.interface.ts` | TypeScript interfaces cho tất cả response types |

---

## Business Rules đã implement

- **Slug auto-generate:** Tự động slugify từ `name` nếu `slug` không truyền
- **Slug unique check:** 409 Conflict nếu slug đã tồn tại
- **Parent existence check:** 400 nếu `parentId` không tồn tại
- **Circular reference protection:** CẤM gán cha là chính mình hoặc con cháu của mình
- **Delete safety check:** CẤM xóa nếu có sản phẩm hoặc chuyên mục con
- **Cache invalidation:** Tự động xóa `cache:v1:categories:*` trên Redis sau mỗi thao tác ghi
