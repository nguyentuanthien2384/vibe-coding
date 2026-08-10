# THÔNG TIN API ENDPOINTS: MODULE CHI TIẾT SẢN PHẨM (PRODUCT DETAIL)

> **Tài liệu tham chiếu:** `.docs/backend-plans/product-detail-plan.md`  
> **Physical Files:**  
> - Controller: `app/backend/src/products/products.controller.ts`  
> - Service: `app/backend/src/products/products.service.ts`  
> - Interfaces: `app/backend/src/products/interfaces/product-response.interface.ts`  

---

## Danh sách API Endpoints

### 1. `GET /api/v1/products/:slug`
- **Mô tả:** Lấy thông tin chi tiết sản phẩm dựa trên `slug` (hoặc ID fallback).
- **Controller Method:** `ProductsController.findBySlug(slug)`
- **Service Method:** `ProductsService.findBySlug(slug)`
- **Response Structure:**
```json
{
  "statusCode": 200,
  "message": "Lấy thông tin sản phẩm thành công",
  "data": {
    "id": 1,
    "name": "Burger Bò Phô Mai Hai Tầng Sốt BBQ Đặc Biệt",
    "slug": "burger-bo-pho-mai-hai-tang-sot-bbq",
    "description": "Trải nghiệm bùng nổ vị giác...",
    "price": 119000,
    "salePrice": 89000,
    "stock": 45,
    "imageUrl": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    "isFeatured": true,
    "category": {
      "id": 4,
      "name": "Combo Deadline",
      "slug": "combo-deadline"
    }
  }
}
```

### 2. `GET /api/v1/products/:slug/related`
- **Mô tả:** Lấy danh sách các sản phẩm liên quan cùng nhóm danh mục với sản phẩm hiện tại.
- **Controller Method:** `ProductsController.findRelated(slug, limit)`
- **Service Method:** `ProductsService.findRelatedProducts(slug, limit)`
- **Response Structure:**
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách sản phẩm liên quan thành công",
  "data": [
    {
      "id": 2,
      "name": "Combo Gà Rán Sốt Cay Hàn Quốc + Pepsi",
      "slug": "combo-ga-ran-sot-cay-han-quoc-pepsi",
      "price": 105000,
      "salePrice": 89000,
      "stock": 35,
      "imageUrl": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec",
      "isFeatured": true,
      "category": {
        "id": 4,
        "name": "Combo Deadline",
        "slug": "combo-deadline"
      }
    }
  ]
}
```
