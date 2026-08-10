# ENDPOINT APIs — MODULE HOME PAGE

> **Nguồn:** `home-plan.md`
> **Backend:** NestJS `http://localhost:3001`
> **Cập nhật:** 2026-08-06

---

## 1. GET /api/v1/banners

| Thuộc tính | Giá trị |
|---|---|
| **Method** | `GET` |
| **Auth** | Public |
| **Controller** | `src/banners/banners.controller.ts` |
| **Service** | `src/banners/banners.service.ts` |
| **DTO** | `src/banners/dto/get-banners.dto.ts` |
| **Cache TTL** | 3600s (1 giờ) |

**Query Params:**
| Param | Type | Required | Mô tả |
|---|---|---|---|
| `type` | `HERO_BANNER \| PROMOTION_BANNER \| SOCIAL_PROOF` | ❌ | Lọc theo loại banner |

**Response 200:**
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách banner thành công",
  "data": [
    {
      "id": 1,
      "title": "Nạp Năng Lượng — Code Phê Hơn",
      "subtitle": "🔥 HOT DEAL • 22h - 2h sáng",
      "imageUrl": "https://...",
      "linkUrl": "/products?tag=combo-deadline",
      "type": "HERO_BANNER",
      "position": 1
    }
  ]
}
```

---

## 2. GET /api/v1/categories

| Thuộc tính | Giá trị |
|---|---|
| **Method** | `GET` |
| **Auth** | Public |
| **Controller** | `src/categories/categories.controller.ts` |
| **Service** | `src/categories/categories.service.ts` |
| **DTO** | `src/categories/dto/get-categories.dto.ts` |
| **Cache TTL** | 3600s (1 giờ) |

**Query Params:**
| Param | Type | Required | Default | Mô tả |
|---|---|---|---|---|
| `tree` | `boolean` | ❌ | `false` | Trả về cấu trúc cây (Parent-Child) |

**Response 200:**
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách danh mục thành công",
  "data": [
    {
      "id": 1,
      "name": "Đồ Ăn Vặt",
      "slug": "do-an-vat",
      "iconUrl": "🍟",
      "position": 1,
      "children": []
    }
  ]
}
```

---

## 3. GET /api/v1/products/featured

| Thuộc tính | Giá trị |
|---|---|
| **Method** | `GET` |
| **Auth** | Public |
| **Controller** | `src/products/products.controller.ts` |
| **Service** | `src/products/products.service.ts` |
| **DTO** | `src/products/dto/get-featured-products.dto.ts` |
| **Cache TTL** | 900s (15 phút) |

**Query Params:**
| Param | Type | Required | Default | Min | Max |
|---|---|---|---|---|---|
| `page` | `number` | ❌ | `1` | `1` | — |
| `limit` | `number` | ❌ | `8` | `1` | `50` |

**Response 200:**
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách sản phẩm nổi bật thành công",
  "data": [
    {
      "id": 1,
      "name": "Khô Gà Lá Chanh Xé Cay",
      "slug": "kho-ga-la-chanh-xe-cay",
      "price": 55000,
      "salePrice": 45000,
      "stock": 50,
      "imageUrl": "https://...",
      "isFeatured": true,
      "category": { "id": 1, "name": "Đồ Ăn Vặt" }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 8,
    "total": 8,
    "totalPages": 1
  }
}
```

**Response 400:**
```json
{
  "statusCode": 400,
  "message": ["page must not be less than 1", "limit must not be greater than 50"],
  "error": "Bad Request"
}
```
