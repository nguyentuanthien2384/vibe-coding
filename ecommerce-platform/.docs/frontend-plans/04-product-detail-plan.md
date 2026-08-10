# FRONTEND PLAN: Trang Chi Tiết Sản Phẩm (Product Detail Page)

> **Nguồn:** `.docs/ideas/04-product-detail.md`  
> **Phiên bản:** 1.0.0  
> **Tái sử dụng:** Master Layout (`Header`, `Footer`, `CartDrawer` từ `00-master-layout.md`)

---

## 1. PHÂN RÃ COMPONENT (COMPONENT TREE)

```text
apps/frontend/
├── app/
│   └── products/
│       └── [slug]/
│           └── page.tsx                    - [SMART] Route Server Component: Fetch API chi tiết sản phẩm & sản phẩm liên quan
└── components/
    ├── shared/ [Shared UI]
    │   ├── product-card.tsx                - [DUMB] [Shared UI] Thẻ sản phẩm tái sử dụng cho Mục "Sản phẩm liên quan"
    │   ├── badge.tsx                       - [DUMB] [Shared UI] Nhãn trạng thái (Giảm giá %, Out of stock, New)
    │   └── breadcrumbs.tsx                 - [DUMB] [Shared UI] Thanh điều hướng vị trí (Trang chủ > Danh mục > Tên sản phẩm)
    └── product-detail/
        ├── product-detail-container.tsx    - [SMART] Container chính quản lý State chọn ảnh gallery, số lượng mua, gọi Cart Store & Toast
        ├── product-image-gallery.tsx       - [DUMB] Cột trái: Ảnh chính (Aspect ratio 1:1, bg xám nhạt, rounded-2xl) + Thư viện ảnh nhỏ thumb grid
        ├── product-info-summary.tsx        - [DUMB] Cột phải: Thương hiệu, Tên sản phẩm, Đánh giá (Rating stars), Giá tiền, Mô tả ngắn
        ├── product-action-group.tsx        - [SMART/DUMB] Bộ chọn số lượng (Quantity selector), Nút "Thêm vào giỏ" & Nút "Mua ngay"
        ├── product-detail-tabs.tsx         - [DUMB] Phần bên dưới: Tab/Khối mô tả chi tiết sản phẩm & Thông số kỹ thuật
        └── product-related-section.tsx     - [DUMB] Phần bên dưới: Lưới 4 sản phẩm liên quan (Fullwidth grid responsive 2/3/4 cột)
```

### Chi tiết Phân loại Components:
- **`app/products/[slug]/page.tsx` [SMART - Server Component]:** Lấy params `slug`, fetch API dữ liệu chi tiết sản phẩm (`GET /api/v1/products/:slug`) và danh sách sản phẩm liên quan (`GET /api/v1/products?category=...&limit=4`). Truyền data xuống `ProductDetailContainer`. Không tự tạo lại Header/Footer vì đã được bọc trong `app/layout.tsx` (Master Layout).
- **`product-detail-container.tsx` [SMART - Client Component]:** Wrapper client quản lý state chọn ảnh hiển thị (`selectedImageIndex`), số lượng đặt mua (`quantity`), kết nối với `useCartStore` (`addItem`, `openDrawer`) và hiển thị Toast Notification khi thêm sản phẩm thành công.
- **`product-image-gallery.tsx` [DUMB]:** Nhận props `images`, `selectedImageIndex`, `onSelectImage`. Render ảnh đại diện kích thước lớn bo góc `rounded-2xl` kèm hiệu ứng zoom/chuyển ảnh mượt, phía dưới là grid thumbnail ảnh thư viện bo góc `rounded-xl`.
- **`product-info-summary.tsx` [DUMB]:** Render thông tin giá cả (`text-red-600 font-bold` cho giá bán, `text-slate-400 line-through` cho giá gốc, badge `%` `bg-[#A63D40]`), tên sản phẩm, rating, tình trạng tồn kho (`stock > 0` / Out of Stock).
- **`product-action-group.tsx` [SMART/DUMB]:** Chứa ô tăng giảm số lượng (`-` `1` `+` với validation `min=1`, `max=stock`), nút **"Thêm vào giỏ"** (`bg-orange-600 hover:bg-orange-700`) và nút **"Mua ngay"** (`bg-slate-900 hover:bg-slate-800`).
- **`product-detail-tabs.tsx` [DUMB]:** Khối mô tả chi tiết sản phẩm bo góc `rounded-2xl bg-white p-6 shadow-sm`, hiển thị văn bản chi tiết, thành phần/hướng dẫn sử dụng.
- **`product-related-section.tsx` [DUMB]:** Lưới hiển thị 4 sản phẩm cùng danh mục/liên quan, tái sử dụng `ProductCard` (Shared UI).

---

## 2. QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)

### Phân loại & Chiến lược Lưu trữ State:

| Tên State | Mô tả | Loại State | Chiến lược Lưu trữ | Rationale |
|---|---|---|---|---|
| `selectedImageIndex` | Chỉ số ảnh đang xem trong thư viện | **Local State** | React `useState(0)` | Chỉ ảnh hưởng đến hiển thị gallery ảnh cột trái |
| `quantity` | Số lượng sản phẩm muốn thêm vào giỏ | **Local State** | React `useState(1)` | Giới hạn `1 <= quantity <= stock`. Reset khi thay đổi sản phẩm |
| `activeTab` | Tab đang chọn (Mô tả chi tiết / Đánh giá) | **Local State** | React `useState('description')` | Chuyển đổi qua lại giữa nội dung chi tiết & thông tin bổ sung |
| `cartItems` | Danh sách & số lượng item trong giỏ hàng | **Global State** | Zustand (`useCartStore`) | Sync tức thì khi bấm "Thêm vào giỏ" hoặc "Mua ngay" |
| `isCartDrawerOpen` | Trạng thái mở Cart Drawer | **Global State** | Zustand (`useCartStore`) | Mở Cart Drawer ngay khi bấm "Thêm vào giỏ" |

---

## 3. CẤU TRÚC DỮ LIỆU (DATA INTERFACES)

```typescript
// types/product-detail.ts

/** Chi tiết đầy đủ sản phẩm trả về từ Backend API */
export interface ProductDetailData {
  id: string;
  name: string;
  slug: string;
  price: number;                // Giá bán thực tế (text-red-600 font-bold)
  originalPrice?: number;       // Giá gốc chưa giảm (text-slate-400 line-through)
  discountPercentage?: number;  // % Giảm giá
  stock: number;                // Số lượng tồn kho
  shortDescription: string;     // Mô tả ngắn cột phải
  description: string;          // Mô tả chi tiết phần bên dưới
  mainImage: string;            // Ảnh đại diện chính (Unsplash URL)
  images: string[];             // Danh sách ảnh thư viện
  category: {
    id: string;
    name: string;
    slug: string;
  };
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
}

/** Props cho Component Image Gallery */
export interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  selectedIndex: number;
  onSelectImage: (index: number) => void;
}

/** Props cho Component Info Summary */
export interface ProductInfoSummaryProps {
  name: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  shortDescription: string;
  stock: number;
  categoryName: string;
  categorySlug: string;
  rating?: number;
  reviewCount?: number;
}

/** Props cho Component Action Group */
export interface ProductActionGroupProps {
  stock: number;
  quantity: number;
  onQuantityChange: (newQty: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isAddingToCart?: boolean;
}

/** Props cho Component Product Related Section */
export interface ProductRelatedSectionProps {
  products: ProductDetailData[];
  onAddToCart: (productId: string) => void;
}
```

---

## 4. QUY TRÌNH LUỒNG NGƯỜI DÙNG (USER FLOWS & UX CONSTRAINTS)

1. **Điều hướng Breadcrumb & Master Layout:**
   - Trang nằm ở tuyến đường `app/products/[slug]/page.tsx` và tự động sử dụng `Header` & `Footer` từ Master Layout (`app/layout.tsx`).
   - Breadcrumbs hiển thị: `Trang chủ` > `Danh mục` > `[Tên sản phẩm]`.

2. **Xem gallery hình ảnh:**
   - Cột trái hiển thị ảnh chính lớn dạng vuông `aspect-square rounded-2xl bg-gray-100`.
   - Các ảnh thumb nhỏ xếp thành hàng bên dưới (`grid grid-cols-4 gap-3`). Khi click/hover vào thumb, `selectedImageIndex` cập nhật và ảnh chính thay đổi mượt mà.

3. **Chọn số lượng & Thêm vào giỏ (Add to Cart):**
   - Người dùng chỉnh số lượng bằng nút `-` `1` `+` (giới hạn từ 1 đến `stock`).
   - Khi bấm **"Thêm vào giỏ"** (`bg-orange-600`):
     - Gọi `addItem(productId, quantity)` trong `useCartStore`.
     - Kích hoạt Toast notification thông báo *"Đã thêm [Tên sản phẩm] vào giỏ hàng!"*.
     - Mở trượt `CartDrawer` từ phải sang để không làm gián đoạn trải nghiệm người dùng.

4. **Mua ngay (Buy Now):**
   - Bấm nút **"Mua ngay"** (`bg-slate-900`):
     - Thêm sản phẩm vào giỏ hàng qua `useCartStore`.
     - Điều hướng lập tức tới màn hình checkout `/checkout`.

5. **Sản phẩm liên quan (Related Products):**
   - Render 4 sản phẩm cùng danh mục ở phần dưới cùng dạng Grid 4 cột fullwidth (`grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`).
   - Tái sử dụng `ProductCard` (Shared UI) chuẩn mực từ `03-product-list-plan.md`.

---

## 5. RÀNG BUỘC THIẾT KẾ (STYLEGUIDE & DESIGN SPECS)

- **Primary Action (Thêm vào giỏ):** Dùng `bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-sm transition-all`.
- **Secondary Action (Mua ngay):** Dùng `bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-sm transition-all`.
- **Màu sắc giá tiền:** Giá hiện tại `text-red-600 font-bold text-2xl lg:text-3xl`, Giá gốc `text-slate-400 line-through text-lg`, Badge giảm giá `%` `bg-[#A63D40] text-white px-2.5 py-1 rounded-md text-xs font-semibold`.
- **Bo góc & Nền:** Nền trang xám nhạt `bg-gray-50`. Khối thông tin bo góc mềm mại `rounded-2xl bg-white p-6 lg:p-8 shadow-sm border border-gray-100`.
- **Mobile Responsive:**
  - Layout 2 cột trên Desktop (`lg:grid-cols-12`: 7 cột gallery bên trái, 5 cột thông tin bên phải).
  - Tự động xếp chồng thành 1 cột linh hoạt trên Mobile / Tablet.
