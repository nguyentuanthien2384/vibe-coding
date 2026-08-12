# DANH SÁCH API ENDPOINTS: MODULE QUẢN LÝ SẢN PHẨM (PRODUCT MANAGEMENT)

> **Tài liệu plan:** `.docs/backend-plans/dashboard/02-product-plan.md`  
> **Module Backend:** NestJS (`app/backend/src/products/`)  

---

## 1. Danh sách Endpoints Admin Dashboard (`/api/v1/admin/products`)

| Method | Endpoint Route | Quyền hạn (Roles) | Môn tả chức năng | File thực thi |
|---|---|---|---|---|
| `GET` | `/api/v1/admin/products` | `ADMIN`, `STAFF` | Lấy danh sách sản phẩm phân trang, bộ lọc (search, category, status, stockStatus, isFeatured) | `admin-products.controller.ts` |
| `GET` | `/api/v1/admin/products/:id` | `ADMIN`, `STAFF` | Lấy chi tiết thông tin 1 sản phẩm theo ID | `admin-products.controller.ts` |
| `POST` | `/api/v1/admin/products` | `ADMIN` | Tạo mới sản phẩm (Tự động sinh slug, validate giá & JSON Rich Editor) | `admin-products.controller.ts` |
| `PATCH` | `/api/v1/admin/products/:id` | `ADMIN` | Cập nhật thông tin sản phẩm | `admin-products.controller.ts` |
| `DELETE` | `/api/v1/admin/products/:id` | `ADMIN` | Xóa vĩnh viễn sản phẩm (Có kiểm tra an toàn: Chặn xóa nếu sản phẩm đã phát sinh đơn hàng) | `admin-products.controller.ts` |
| `POST` | `/api/v1/admin/upload/image` | `ADMIN`, `STAFF` | Upload hình ảnh sản phẩm (Tối đa 5MB, format PNG, JPG, WebP, SVG) | `upload.controller.ts` |

---

## 2. Chi tiết Request & Response Contracts

### 2.1 `GET /api/v1/admin/products`
- **Query Parameters:** `search`, `categoryId`, `status` (`ALL`|`ACTIVE`|`INACTIVE`), `stockStatus` (`ALL`|`IN_STOCK`|`OUT_OF_STOCK`), `isFeatured`, `page`, `limit`, `sortBy`, `sortOrder`.
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
      "shortDescription": { "type": "doc", "content": [...] },
      "longDescription": { "type": "doc", "content": [...] },
      "createdAt": "2026-08-01T10:00:00.000Z",
      "updatedAt": "2026-08-12T07:30:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 78, "totalPages": 8 }
}
```

### 2.2 `GET /api/v1/admin/products/:id`
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
    "category": { "id": 5, "name": "Burger & Pizza", "slug": "burger-pizza" },
    "isFeatured": true,
    "isActive": true,
    "shortDescription": { "type": "doc", "content": [...] },
    "longDescription": { "type": "doc", "content": [...] },
    "createdAt": "2026-08-01T10:00:00.000Z",
    "updatedAt": "2026-08-12T07:30:00.000Z"
  }
}
```

### 2.3 `POST /api/v1/admin/products`
- **Body Payload:**
```json
{
  "name": "Gà Rán Sốt Cay Hàn Quốc",
  "slug": "ga-ran-sot-cay-han-quoc",
  "categoryId": 3,
  "price": 120000,
  "salePrice": 99000,
  "stock": 100,
  "imageUrl": "/uploads/images/chicken.jpg",
  "isFeatured": true,
  "isActive": true,
  "shortDescription": { "type": "doc", "content": [...] },
  "longDescription": { "type": "doc", "content": [...] }
}
```
- **Response Success (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Tạo mới sản phẩm thành công",
  "data": { ... }
}
```

### 2.4 `PATCH /api/v1/admin/products/:id`
- **Body Payload (Partial):** `UpdateProductDto`
- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Cập nhật sản phẩm thành công",
  "data": { ... }
}
```

### 2.5 `DELETE /api/v1/admin/products/:id`
- **Response Success (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Xóa vĩnh viễn sản phẩm thành công"
}
```
- **Response Failure (400 Bad Request - Safety Check):**
```json
{
  "statusCode": 400,
  "message": "Không thể xóa sản phẩm 'Bánh Burger Bò' vì đã có 15 đơn hàng liên quan. Vui lòng chuyển trạng thái sang Tạm ẩn (INACTIVE) để bảo toàn lịch sử hóa đơn.",
  "error": "Bad Request"
}
```

---

## 3. Cấu trúc File Vật lý đã tạo

- Controller: [app/backend/src/products/admin-products.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/products/admin-products.controller.ts)
- Service: [app/backend/src/products/admin-products.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/products/admin-products.service.ts)
- DTOs:
  - [app/backend/src/products/dto/get-admin-products.dto.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/products/dto/get-admin-products.dto.ts)
  - [app/backend/src/products/dto/create-product.dto.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/products/dto/create-product.dto.ts)
  - [app/backend/src/products/dto/update-product.dto.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/products/dto/update-product.dto.ts)
- Interfaces: [app/backend/src/products/interfaces/admin-product.interface.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/products/interfaces/admin-product.interface.ts)
- Module: [app/backend/src/products/products.module.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/products/products.module.ts)
