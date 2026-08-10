# DESIGN BRIEF: Trang Chi Tiết Sản Phẩm (Product Detail Page)

## 1. HỆ THỐNG LƯỚI & BỐ CỤC (LAYOUT SYSTEM)

### Structure & Container
- **Root Layout:** `min-h-screen bg-gray-50 font-sans antialiased` (Bọc bởi Master Layout `Header` & `Footer`)
- **Main Container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-10`
- **Breadcrumbs Container:** `w-full mb-4`

### Top Product Detail Section (Layout 2 cột chia 7-5)
- **Grid Layout:** `grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start`
- **Cột Trái (Gallery & Hình ảnh):** `lg:col-span-7 w-full space-y-4`
- **Cột Phải (Thông tin sản phẩm & Nút bấm mua hàng):** `lg:col-span-5 w-full bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 sticky top-24`

### Bottom Detailed Content Section (Mô tả chi tiết & Thông số)
- **Container:** `w-full bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6`

### Related Products Section (Sản phẩm liên quan - Fullwidth Grid)
- **Container:** `w-full space-y-6 pt-4`
- **Section Header:** `flex items-center justify-between pb-3 border-b border-slate-200`
- **Product Grid System:** `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6`

---

## 2. ĐẶC TẢ COMPONENT (COMPONENT SPECS - DUMB ONLY)

### 1. `breadcrumbs.tsx` (Shared UI)
- **Box Style:** `flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium py-1 overflow-x-auto whitespace-nowrap`
- **Item Style:** `hover:text-orange-600 transition-colors flex items-center gap-2`
- **Separator Icon:** `w-4 h-4 text-slate-400`
- **Active Current Page Item:** `text-slate-900 font-bold line-clamp-1 max-w-[200px] sm:max-w-xs`

### 2. `product-image-gallery.tsx`
- **Box Main Image (Aspect Ratio 1:1):** `relative w-full aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 shadow-sm group`
- **Main Image:** `w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105`
- **Badges Overlay:** `absolute top-4 left-4 z-10 flex flex-col gap-2`
- **Thumbnails Grid:** `grid grid-cols-4 sm:grid-cols-5 gap-3 pt-2`
- **Thumbnail Item Style:** `relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 bg-slate-100`
  - **Active State:** `border-orange-500 ring-2 ring-orange-500/20 scale-105 shadow-md`
  - **Inactive State:** `border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300`

### 3. `product-info-summary.tsx`
- **Category Badge:** `inline-block text-xs font-extrabold tracking-wider text-orange-600 uppercase bg-orange-50 px-3 py-1 rounded-full border border-orange-100`
- **Product Title:** `text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight`
- **Rating & Stock Row:** `flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-slate-100`
  - **Rating Stars:** `flex items-center gap-1 text-sm font-bold text-slate-800` (Icon sao: `w-4 h-4 fill-amber-400 text-amber-400`)
  - **Stock Status Badge:**
    - Còn hàng: `inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200`
    - Hết hàng: `inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full border border-slate-200`
- **Price Box:** `flex items-baseline gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100`
  - **Current Price (Giá hiện tại):** `text-red-600 font-extrabold text-2xl sm:text-3xl tracking-tight`
  - **Original Price (Giá gốc):** `text-slate-400 line-through text-base sm:text-lg font-medium`
  - **Badge Discount (% Sale):** `bg-[#A63D40] text-white px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-xs`
- **Short Description:** `text-sm text-slate-600 leading-relaxed font-normal`

### 4. `product-action-group.tsx`
- **Box Style:** `space-y-5 pt-4 border-t border-slate-100`
- **Quantity Selector Row:** `flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80`
  - **Label:** `text-sm font-semibold text-slate-700`
  - **Counter Controls:** `flex items-center bg-white rounded-lg p-1 border border-slate-200 shadow-xs`
  - **Minus/Plus Buttons:** `w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-200 rounded-md text-slate-800 font-extrabold transition-colors disabled:opacity-40 cursor-pointer`
  - **Quantity Input/Value:** `w-12 text-center text-sm font-extrabold text-slate-900`
- **Action Buttons Layout:** `flex flex-col sm:flex-row gap-3 pt-2`
  - **Nút "Thêm vào giỏ" (CTA Primary):** `flex-1 py-3.5 px-6 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-bold text-base rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer`
  - **Nút "Mua ngay" (Secondary Action):** `flex-1 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-base rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer`

### 5. `product-detail-tabs.tsx`
- **Tab Header:** `flex items-center border-b border-slate-200 space-x-8`
  - **Tab Active:** `pb-3 text-base font-extrabold text-orange-600 border-b-2 border-orange-600 transition-all`
  - **Tab Inactive:** `pb-3 text-base font-semibold text-slate-500 hover:text-slate-800 transition-all cursor-pointer`
- **Tab Content Area:** `py-6 text-slate-700 text-sm sm:text-base leading-relaxed space-y-4`
- **Feature Highlights Grid:** `grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2`
  - **Highlight Item:** `flex items-center gap-3 p-3.5 bg-orange-50/60 rounded-xl border border-orange-100 text-slate-800 font-medium text-sm`

### 6. `product-related-section.tsx`
- **Box Style:** `space-y-6`
- **Section Title:** `text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2`
- **Grid Layout:** `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6` (Tái sử dụng `product-card.tsx` từ Shared UI)

---

## 3. RÀNG BUỘC MÀU SẮC (COLOR CONSTRAINTS)

| Thành phần UI | Tailwind Class | Mục đích & Ràng buộc |
| :--- | :--- | :--- |
| **Nút "Thêm vào giỏ" (CTA)** | `bg-orange-600` / `hover:bg-orange-700` | Màu Cam thương hiệu bắt buộc cho hành động mua hàng chính |
| **Nút "Mua ngay" (Secondary)** | `bg-slate-900` / `hover:bg-slate-800` | Màu Slate đen cao cấp chốt đơn tức thì |
| **Huy hiệu Giảm giá (Badge)** | `bg-[#A63D40]` | Màu Đỏ mận thương hiệu cho % Sale off |
| **Giá bán hiện tại** | `text-red-600 font-extrabold` | Nổi bật thu hút mắt người mua |
| **Giá bán niêm yết (Gốc)** | `text-slate-400 line-through` | Làm mờ tương phản với giá sale |
| **Nền trang chung** | `bg-gray-50` | Nền xám nhẹ từ Master Layout |
| **Khối nội dung chi tiết** | `bg-white border-slate-100` | Khối trắng nổi bật bo góc `rounded-2xl` |
| **Thumbnail Active** | `border-orange-500 ring-orange-500/20` | Viền cam làm nổi bật ảnh gallery đang chọn |
| **Badge Tồn kho (Còn hàng)** | `bg-emerald-50 text-emerald-700` | Xanh lá dịu cho trạng thái sẵn sàng giao hàng |

---

## 4. MOCK DATA (DỮ LIỆU HIỂN THỊ)

### 1. Main Product Detail Data
```json
{
  "id": "prod-detail-01",
  "name": "Burger Bò Phô Mai Hai Tầng Sốt BBQ Đặc Biệt",
  "slug": "burger-bo-pho-mai-2-tang-bbq",
  "price": 89000,
  "originalPrice": 119000,
  "discountPercentage": 25,
  "stock": 24,
  "rating": 4.9,
  "reviewCount": 156,
  "category": {
    "id": "cat-2",
    "name": "Burger & Combo",
    "slug": "burger"
  },
  "shortDescription": "Thịt bò Úc nướng ngói thơm lừng 2 lớp béo ngậy kết hợp phô Mai Cheddar tan chảy, bọc trong vỏ bánh mì Bơ Pháp giòn rụm và sốt BBQ độc quyền TechBite.",
  "description": "Món ăn bán chạy nhất tại TechBite dành riêng cho các Coder chạy deadline ban đêm. Bò được xay tươi trong ngày, nướng chuẩn nhiệt độ để giữ trọn vị ngọt tự nhiên. Kết hợp cùng rau xà lách thủy canh tươi giòn, cà chua chín mộng và phô mai Cheddar hảo hạng nhập khẩu.",
  "mainImage": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
  "images": [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80"
  ]
}
```

### 2. Related Products Data Sample (4 items)
```json
[
  {
    "id": "rel-01",
    "name": "Combo Gà Rán Sốt Cay Hàn Quốc + Pepsi",
    "slug": "combo-ga-ran-sot-cay",
    "imageUrl": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    "price": 89000,
    "originalPrice": 115000,
    "discountPercentage": 22,
    "rating": 4.8,
    "reviewCount": 210,
    "stock": 12,
    "isNew": true
  },
  {
    "id": "rel-02",
    "name": "Trà Sữa Đào Cam Sả Size L (Ít Đường)",
    "slug": "tra-sua-dao-cam-sa",
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80",
    "price": 45000,
    "originalPrice": 55000,
    "discountPercentage": 18,
    "rating": 4.9,
    "reviewCount": 89,
    "stock": 45,
    "isNew": false
  },
  {
    "id": "rel-03",
    "name": "Khoai Tây Chiên Lắc Phô Mai Bơ Tỏi",
    "slug": "khoai-tay-chien-lac-pho-mai",
    "imageUrl": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
    "price": 35000,
    "originalPrice": 45000,
    "discountPercentage": 22,
    "rating": 4.6,
    "reviewCount": 56,
    "stock": 30,
    "isNew": true
  },
  {
    "id": "rel-04",
    "name": "Bánh Mỳ Nướng Bơ Tỏi Xốt Kem Phô Mai",
    "slug": "banh-my-nuong-bo-toi",
    "imageUrl": "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80",
    "price": 39000,
    "originalPrice": 49000,
    "discountPercentage": 20,
    "rating": 4.7,
    "reviewCount": 78,
    "stock": 18,
    "isNew": false
  }
]
```
