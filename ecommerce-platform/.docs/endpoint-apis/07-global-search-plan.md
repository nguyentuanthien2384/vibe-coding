# DANH SÁCH ENDPOINTS: MODULE GLOBAL SEARCH (ADMIN DASHBOARD)

> **Tài liệu tham chiếu:** `.docs/backend-plans/dashboard/07-global-search-plan.md`  
> **Controller:** `app/backend/src/dashboard/dashboard.controller.ts`  
> **Service:** `app/backend/src/dashboard/dashboard.service.ts`  
> **DTO & Interface:** `app/backend/src/dashboard/dto/global-search.dto.ts`, `app/backend/src/dashboard/interfaces/global-search.interface.ts`  

---

## 1. Danh sách API Endpoints

### 1.1. `GET /api/v1/admin/dashboard/search/global`
Tìm kiếm toàn cục nhanh xuyên suốt 5 thực thể trong hệ thống (Đơn hàng, Sản phẩm, Khách hàng, Chuyên mục, Nhân sự) và Gợi ý điều hướng tác vụ nhanh.

- **Method:** `GET`
- **Path:** `/api/v1/admin/dashboard/search/global`
- **Bảo mật & Phân quyền:** `JwtAuthGuard` & `RolesGuard(Role.ADMIN, Role.STAFF)`
- **Query Parameters:**
  - `q` (string, required, min 1 char): Từ khóa tìm kiếm.
  - `limit` (number, optional, default: 5, min: 1, max: 50): Số kết quả tối đa cho từng nhóm thực thể.

#### Request Example:
```http
GET /api/v1/admin/dashboard/search/global?q=mochi&limit=5
Authorization: Bearer <jwt_access_token>
```

#### Response Example (200 OK):
```json
{
  "statusCode": 200,
  "data": {
    "orders": [],
    "products": [
      {
        "id": 108,
        "title": "Bánh Mochi Kem Trà Xanh Matcha",
        "subtitle": "28.000 đ - Kho: 24",
        "badge": "Đang bán",
        "badgeType": "success",
        "imageUrl": "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
        "url": "/products/108/edit",
        "type": "product"
      }
    ],
    "customers": [],
    "categories": [],
    "staffs": [],
    "actions": [],
    "totalResults": 1
  }
}
```

#### Response Example (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": [
    "Từ khóa tìm kiếm không được để trống"
  ],
  "error": "Bad Request"
}
```

#### Response Example (401 Unauthorized):
```json
{
  "statusCode": 401,
  "message": "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
  "error": "Unauthorized"
}
```

---

## 2. Danh sách tệp vật lý thi công

1. **DTO:** [app/backend/src/dashboard/dto/global-search.dto.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/dashboard/dto/global-search.dto.ts)
2. **Interface:** [app/backend/src/dashboard/interfaces/global-search.interface.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/dashboard/interfaces/global-search.interface.ts)
3. **Controller:** [app/backend/src/dashboard/dashboard.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/dashboard/dashboard.controller.ts)
4. **Service:** [app/backend/src/dashboard/dashboard.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/dashboard/dashboard.service.ts)
