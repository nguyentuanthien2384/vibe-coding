# PRODUCT LIST PAGE — API Endpoints

> **Source Plan:** `.docs/backend-plans/product-list-plan.md`  
> **Module:** `src/products/`  
> **Base URL:** `/api/v1/products`

---

## Endpoints

| # | Method | Route | Handler | Auth |
|---|--------|-------|---------|------|
| 1 | GET | `/api/v1/products` | `ProductsController.findAll` | Public |
| 2 | GET | `/api/v1/products/filter-meta` | `ProductsController.getFilterMeta` | Public |
| 3 | GET | `/api/v1/products/featured` | `ProductsController.findFeatured` | Public |
| 4 | GET | `/api/v1/products/:slug` | `ProductsController.findBySlug` | Public |

---

## 1. `GET /api/v1/products`

**Query Params (`GetProductsDto`):**

| Param | Type | Default | Constraint |
|-------|------|---------|-----------|
| `page` | number | 1 | Min: 1 |
| `limit` | number | 12 | Min: 1, Max: 48 |
| `categoryId` | number | — | optional |
| `minPrice` | number | — | Min: 0 |
| `maxPrice` | number | — | Min: 0 |
| `search` | string | — | optional, MySQL Fulltext |
| `sortBy` | enum | `createdAt` | `createdAt` \| `price` \| `isFeatured` |
| `sortOrder` | enum | `desc` | `asc` \| `desc` |

**200 OK:**
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách sản phẩm thành công",
  "data": [ { "id": 101, "name": "...", "slug": "...", "price": 45000, ... } ],
  "pagination": { "page": 1, "limit": 12, "total": 48, "totalPages": 4 }
}
```

**Cache:** Key `cache:products:list:<md5_of_params>`, TTL 300s.

---

## 2. `GET /api/v1/products/filter-meta`

**200 OK:**
```json
{
  "statusCode": 200,
  "message": "Lấy thông tin bộ lọc thành công",
  "data": {
    "categories": [ { "id": 1, "name": "Đồ Ăn Vặt", "slug": "do-an-vat", "productCount": 24 } ],
    "priceRange": { "min": 15000, "max": 150000 }
  }
}
```

**Cache:** Key `cache:products:filter-meta`, TTL 3600s.

---

## 3. `GET /api/v1/products/featured`

**Query Params:** `page` (default: 1), `limit` (default: 8, max: 50)

**200 OK:** Paginated list of `isFeatured=true` products.  
**Cache:** Key `cache:products:featured:p{page}:l{limit}`, TTL 900s.

---

## 4. `GET /api/v1/products/:slug`

**Path Param:** `slug` — unique product slug.

**200 OK:**
```json
{
  "statusCode": 200,
  "message": "Lấy thông tin sản phẩm thành công",
  "data": { "id": 101, "name": "...", "description": "...", "price": 45000, "category": { ... } }
}
```

**404 Not Found:** `"Không tìm thấy sản phẩm với slug này"`

---

## Files Changed

| File | Action |
|------|--------|
| `src/products/dto/get-products.dto.ts` | NEW |
| `src/products/interfaces/product-response.interface.ts` | MODIFIED (extended) |
| `src/products/products.service.ts` | MODIFIED (added `findAll`, `findFilterMeta`, `findBySlug`) |
| `src/products/products.controller.ts` | MODIFIED (added 3 new routes) |
