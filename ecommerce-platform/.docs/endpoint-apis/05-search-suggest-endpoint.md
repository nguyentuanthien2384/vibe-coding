# SEARCH SUGGEST — API Endpoints

> **Source Plan:** `.docs/backend-plans/05-search-suggest-plan.md`  
> **Module:** `src/products/`  
> **Base URL:** `/api/v1/products`

---

## Endpoints

| # | Method | Route | Handler | Auth |
|---|--------|-------|---------|------|
| 1 | GET | `/api/v1/products/search-suggest` | `ProductsController.getSearchSuggest` | Public |

---

## 1. `GET /api/v1/products/search-suggest`

Lấy danh sách tối đa N sản phẩm gợi ý dựa trên từ khóa gõ trên thanh tìm kiếm Header.

> **⚠️ Ràng buộc Routing:** Route `/search-suggest` được khai báo TRƯỚC route `/:slug` trong NestJS Controller để tránh xung đột đường dẫn.

### Query Parameters (`SearchSuggestQueryDto`)

| Param | Type | Required | Default | Constraint |
|-------|------|----------|---------|------------|
| `q` | string | **Có** | — | MinLength: 2, tự động `trim()` |
| `limit` | number | Không | 5 | Min: 1, Max: 10 |

### Response Samples

#### 200 OK (Thành công):
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách gợi ý tìm kiếm thành công",
  "data": {
    "query": "bắp",
    "totalFound": 12,
    "items": [
      {
        "id": 201,
        "name": "Bắp Rang Bơ Caramel Jumbo Gói 200g",
        "slug": "bap-rang-bo-caramel-jumbo-200g",
        "imageUrl": "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=200&h=200&fit=crop",
        "price": 45000,
        "originalPrice": 55000
      },
      {
        "id": 202,
        "name": "Sữa Bắp Non Hạt Óc Chó TechBite 330ml",
        "slug": "sua-bap-non-hat-oc-cho-techbite-330ml",
        "imageUrl": "https://images.unsplash.com/photo-1556881286-fc6915169721?w=200&h=200&fit=crop",
        "price": 25000,
        "originalPrice": 30000
      }
    ]
  }
}
```

#### 400 Bad Request (Từ khóa ít hơn 2 ký tự):
```json
{
  "statusCode": 400,
  "message": [
    "Từ khóa tìm kiếm phải có tối thiểu 2 ký tự"
  ],
  "error": "Bad Request"
}
```

### Caching Strategy
- **Key Format:** `cache:search-suggest:<normalized_query>:<limit>`
- **TTL:** 600s (10 phút)

---

## Files Created & Modified

| File | Action |
|------|--------|
| [src/products/dto/search-suggest-query.dto.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/products/dto/search-suggest-query.dto.ts) | NEW |
| [src/products/interfaces/search-suggest-response.interface.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/products/interfaces/search-suggest-response.interface.ts) | NEW |
| [src/products/products.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/products/products.service.ts) | MODIFIED (added `getSearchSuggestions` & cache) |
| [src/products/products.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/products/products.controller.ts) | MODIFIED (added `GET search-suggest` endpoint) |
