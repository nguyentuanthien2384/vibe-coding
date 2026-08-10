# DESIGN BRIEF: Trang Danh Sách Sản Phẩm (Product List Page)

## 1. HỆ THỐNG LƯỚI & BỐ CỤC (LAYOUT SYSTEM)

### Structure & Container
- **Root Layout:** `min-h-screen bg-gray-50 font-sans antialiased`
- **Main Container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-8`
- **Hero Banner Container:** `w-full mb-6 rounded-2xl overflow-hidden shadow-md`

### Main Content Grid (Filter Sidebar + Product Grid)
- **Sidebar & Grid Container:** `flex flex-col lg:flex-row items-start gap-6 md:gap-8 relative`
- **Sidebar (Left Column):** 
  - Hiển thị: `w-full lg:w-64 flex-shrink-0 transition-all duration-300 ease-in-out`
  - Trạng thái Ẩn (`isFilterOpen === false`): `hidden` trên Desktop, giải phóng 100% không gian cho Grid.
- **Product Area (Right/Main Column):** `flex-1 w-full min-w-0 space-y-6`

### Product Grid System (STYLEGUIDE Spec)
- **Lưới Sản Phẩm (`product-grid.tsx`):**
  - Khi Sidebar Hiện (`isFilterOpen === true`): `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6`
  - Khi Sidebar Ẩn (`isFilterOpen === false`): `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6`
- **Khoảng cách (Spacing):** `gap-4 sm:gap-6`, padding nội dung `p-4 sm:p-6`.

---

## 2. ĐẶC TẢ COMPONENT (COMPONENT SPECS - DUMB ONLY)

### 1. `product-list-hero-banner.tsx`
- **Box Style:** `relative w-full aspect-[21/9] sm:aspect-[3/1] rounded-2xl overflow-hidden bg-slate-900 shadow-sm border border-slate-100`
- **Image Style:** `absolute inset-0 w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-700`
- **Overlay & Typography:** 
  - Overlay: `absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent p-6 sm:p-10 flex flex-col justify-center`
  - Tagline: `text-xs sm:text-sm font-semibold tracking-wider text-orange-400 uppercase mb-2`
  - Title: `text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight max-w-xl line-clamp-2`
  - Subtitle: `text-xs sm:text-base text-slate-200 mt-2 max-w-md hidden sm:block`

### 2. `product-list-toolbar.tsx`
- **Box Style:** `flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm`
- **Typography:**
  - Counter text: `text-sm font-medium text-slate-600` (VD: "Hiển thị **24** sản phẩm")
- **Control Buttons:**
  - Filter Toggle CTA: `inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-semibold transition-colors border border-slate-200/60 cursor-pointer`
  - Sort Select: `bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer`

### 3. `product-filter-sidebar.tsx`
- **Box Style:** `w-full lg:w-64 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-6 flex-shrink-0`
- **Header:** `flex items-center justify-between pb-4 border-b border-slate-100`
  - Title: `text-base font-bold text-slate-900 flex items-center gap-2`
  - Reset CTA: `text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer hover:underline`
- **Sub-components:**
  - `filter-category-group.tsx`: `space-y-2 text-sm font-medium text-slate-700`, active category: `bg-orange-50 text-orange-600 font-bold px-3 py-2 rounded-xl`
  - `filter-price-range.tsx`: `flex items-center gap-2`, input box: `w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500`
  - `filter-stock-status.tsx`: `flex items-center justify-between text-sm font-medium text-slate-700 py-1`

### 4. `product-card.tsx` (Shared UI)
- **Box Style:** `group relative flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300`
- **Image Box (Ratio 1:1):** `relative w-full aspect-square bg-slate-100 overflow-hidden`
  - Image: `w-full h-full object-cover group-hover:scale-105 transition-transform duration-500`
- **Badges Overlay:** `absolute top-3 right-3 flex flex-col gap-1.5 z-10`
- **Content Area:** `p-4 flex flex-col flex-1 justify-between space-y-3`
  - Title: `font-semibold text-slate-900 text-sm sm:text-base line-clamp-2 group-hover:text-orange-600 transition-colors`
  - Price Row: `flex items-baseline gap-2 flex-wrap`
    - Current Price: `text-red-600 font-extrabold text-base sm:text-lg`
    - Original Price: `text-slate-400 line-through text-xs sm:text-sm`
- **Button "Thêm vào giỏ" (CTA Principal):** 
  - Normal: `w-full py-2.5 px-4 bg-[#ff8c42] hover:bg-orange-600 active:scale-95 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer`
  - Out of Stock: `w-full py-2.5 px-4 bg-slate-200 text-slate-400 font-semibold text-sm rounded-xl cursor-not-allowed`

### 5. `badge.tsx` (Shared UI)
- **Base Style:** `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm tracking-wide`
- **Variants:**
  - Discount Sale: `bg-[#A63D40] text-white`
  - Out of Stock: `bg-slate-500 text-white uppercase`
  - New Item: `bg-emerald-500 text-white`

### 6. `pagination.tsx` (Shared UI)
- **Box Style:** `flex items-center justify-center gap-2 pt-6 pb-2`
- **Page Button:** `w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all border`
  - Active: `bg-slate-900 text-white border-slate-900 shadow-md`
  - Inactive: `bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300`
  - Prev/Next Nav: `px-3 h-10 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed`

### 7. `search-input.tsx` (Shared UI)
- **Box Style:** `relative w-full max-w-sm`
- **Input Style:** `w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:outline-none transition-all`
- **Icon Position:** `absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`

### 8. `skeleton-card.tsx` (Shared UI)
- **Box Style:** `animate-pulse bg-white rounded-2xl border border-slate-100 p-4 space-y-4`
- **Inner Shimmers:**
  - Image: `w-full aspect-square bg-slate-200 rounded-xl`
  - Line 1: `h-4 bg-slate-200 rounded-md w-3/4`
  - Line 2: `h-4 bg-slate-200 rounded-md w-1/2`
  - Button: `h-10 bg-slate-200 rounded-xl w-full`

### 9. `product-list-empty.tsx`
- **Box Style:** `flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center space-y-4 my-6`
- **Icon Style:** `w-16 h-16 text-slate-300 bg-slate-50 p-3 rounded-full`
- **Typography:** `text-lg font-bold text-slate-800`, Subtext: `text-sm text-slate-500 max-w-sm`
- **Reset Button:** `px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-colors`

---

## 3. RÀNG BUỘC MÀU SẮC (COLOR CONSTRAINTS)

| Thành phần UI | Tailwind Class | Mục đích & Ràng buộc |
| :--- | :--- | :--- |
| **Nút "Thêm vào giỏ" (CTA)** | `bg-[#ff8c42]` / `hover:bg-orange-600` | Màu Cam thương hiệu bắt buộc cho hành động mua hàng chính |
| **Huy hiệu Giảm giá (Badge)** | `bg-[#A63D40]` | Màu Đỏ mận thương hiệu cho % Sale off |
| **Giá bán hiện tại** | `text-red-600 font-extrabold` | Nổi bật thu hút mắt người mua |
| **Giá bán niêm yết (Gốc)** | `text-slate-400 line-through` | Làm mờ tương phản với giá sale |
| **Nút Secondary / Active Sort**| `bg-slate-900 text-white` | Màu tối cao cấp cho nút điều hướng/lựa chọn |
| **Nền trang chung** | `bg-gray-50` | Nền xám nhẹ giúp thẻ trắng nổi bật |
| **Nền Thẻ & Sidebar** | `bg-white` | Khối nội dung sạch sẽ bo góc `rounded-2xl` |
| **Viền khối (Border)** | `border-slate-100` / `border-slate-200` | Đường nét tinh tế nhẹ nhàng |
| **Badge Hết hàng** | `bg-slate-500 text-white` | Làm tối sản phẩm đã hết tồn kho |
| **Badge Sản phẩm mới** | `bg-emerald-500 text-white` | Điểm nhấn xanh lá tươi trẻ |

---

## 4. MOCK DATA (DỮ LIỆU HIỂN THỊ)

### 1. Banner Data
- **Image:** `https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop`
- **Title:** "Bữa Trưa Đêm Đỉnh Cao - Năng Lượng Chạy Deadline"
- **Subtitle:** "Giảm ngay 25% cho tất cả món ăn vặt & nước uống sảng khoái sau 22h!"

### 2. Category Filter Data
```json
[
  { "id": "cat-1", "name": "Tất cả món", "slug": "all", "count": 48 },
  { "id": "cat-2", "name": "Burger & Combo", "slug": "burger", "count": 14 },
  { "id": "cat-3", "name": "Gà Rán & Đồ Chiên", "slug": "fried-chicken", "count": 12 },
  { "id": "cat-4", "name": "Trà Sữa & Nước Giải Khát", "slug": "drinks", "count": 15 },
  { "id": "cat-5", "name": "Tráng Miệng & Ăn Vặt", "slug": "snacks", "count": 7 }
]
```

### 3. Product Items Sample Data
```json
[
  {
    "id": "prod-01",
    "name": "Burger Bò Phô Mai Hai Tầng Đặc Biệt",
    "slug": "burger-bo-pho-mai-2-tang",
    "imageUrl": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    "price": 79000,
    "originalPrice": 99000,
    "discountPercentage": 20,
    "rating": 4.8,
    "reviewCount": 124,
    "stock": 15,
    "isNew": true
  },
  {
    "id": "prod-02",
    "name": "Trà Sữa Đào Cam Sả Size L (Ít Đường)",
    "slug": "tra-sua-dao-cam-sa",
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80",
    "price": 45000,
    "originalPrice": 55000,
    "discountPercentage": 18,
    "rating": 4.9,
    "reviewCount": 89,
    "stock": 40,
    "isNew": false
  },
  {
    "id": "prod-03",
    "name": "Combo Gà Rán Sốt Cay Hàn Quốc + Pepsi",
    "slug": "combo-ga-ran-sot-cay",
    "imageUrl": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    "price": 89000,
    "originalPrice": 115000,
    "discountPercentage": 22,
    "rating": 4.7,
    "reviewCount": 210,
    "stock": 0,
    "isNew": false
  },
  {
    "id": "prod-04",
    "name": "Khoai Tây Chiên Lắc Phô Mai Bơ Tỏi",
    "slug": "khoai-tay-chien-lac-pho-mai",
    "imageUrl": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
    "price": 35000,
    "originalPrice": 45000,
    "discountPercentage": 22,
    "rating": 4.6,
    "reviewCount": 56,
    "stock": 25,
    "isNew": true
  }
]
```

### 4. Pagination Stats
- **currentPage:** 1
- **totalPages:** 4
- **pageSize:** 12
- **totalItems:** 48
