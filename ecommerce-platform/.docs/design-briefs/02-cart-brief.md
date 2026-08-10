# DESIGN BRIEF: GIỎ HÀNG TRƯỢT (SLIDE-OUT CART DRAWER)
1. HỆ THỐNG LƯỚI & KHUNG HIỂN THỊ (LAYOUT & VIEWPORT):
- RÀNG BUỘC VIEWPORT (BẮT BUỘC): Lấy kích thước của trang chủ đọc từ file `01-home-brief.md`
- Nền web là giao diện trang chủ đọc từ file `01-home-brief.md`

- CẤU TRÚC DRAWER:
  + Overlay: Dùng `fixed inset-0 z-40 bg-black/40 backdrop-blur-sm` phủ lên toàn bộ nền Desktop đó.
  + Panel Giỏ Hàng: Nằm đè lên Overlay, ghim sát mép phải màn hình bằng `fixed right-0 top-0 bottom-0 z-50`. Chiều rộng `w-full max-w-md` (448px) và cao `h-screen`. Khung này chứa toàn bộ nội dung giỏ hàng bên trong.
- Khoảng cách nội bộ Drawer: Padding mặc định `p-6`, gap `gap-4`.

## 2. ĐẶC TẢ COMPONENT (COMPONENT SPECS)

### `backdrop.tsx` [DUMB]
- **Box Style:** `fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-0`
- **Typography:** N/A
- **Interaction States:** `transition-opacity duration-300 cursor-pointer opacity-100` (Hidden: `opacity-0 pointer-events-none`)

### `badge.tsx` [DUMB]
- **Box Style:** `inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold`
  - Variant New: `bg-green-50 text-green-700 border-green-200`
  - Variant Sale: `bg-red-50 text-red-700 border-red-200`
  - Variant Out of Stock: `bg-slate-100 text-slate-600 border-slate-200`
- **Typography:** `text-xs font-semibold tracking-wide uppercase`
- **Interaction States:** `select-none`

### `quantity-counter.tsx` [DUMB]
- **Box Style:** `inline-flex items-center rounded-lg border border-slate-200 bg-slate-50/80 p-1 space-x-1`
- **Typography:** `text-sm font-bold text-slate-800 min-w-[24px] text-center`
- **Buttons (Tăng/Giảm):**
  - Box Style: `w-7 h-7 flex items-center justify-center rounded-md bg-white border border-slate-200 shadow-sm text-slate-600`
  - Interaction States: `hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100`

### `cart-header.tsx` [DUMB]
- **Box Style:** `flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white`
- **Typography:**
  - Title: `text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2`
  - Counter Badge: `text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full`
- **Close Button [X]:**
  - Box Style: `p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors`
  - Interaction States: `active:scale-90 transition-transform`

### `cart-item-list.tsx` [DUMB]
- **Box Style:** `flex-1 overflow-y-auto px-6 py-4 space-y-4 divide-y divide-slate-100`
- **Typography:** N/A
- **Interaction States:** `scroll-smooth custom-scrollbar`

### `cart-item.tsx` [DUMB]
- **Box Style:** `group flex items-start gap-4 py-4 rounded-xl transition-colors hover:bg-slate-50/50 p-2 -mx-2`
- **Thumbnail Image:** `w-20 h-20 rounded-lg bg-slate-100 border border-slate-200/60 object-cover shrink-0 aspect-square`
- **Typography:**
  - Product Name: `text-sm font-semibold text-slate-800 line-clamp-2 hover:text-slate-900`
  - Current Price: `text-sm font-bold text-red-600`
  - Original Price: `text-xs text-slate-400 line-through ml-2 font-normal`
- **Remove Button (Icon Trash):**
  - Box Style: `p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-80 group-hover:opacity-100`
  - Interaction States: `active:scale-95`

### `cart-empty.tsx` [DUMB]
- **Box Style:** `flex flex-col items-center justify-center h-full px-6 text-center space-y-4 py-12`
- **Icon Container:** `w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2`
- **Typography:**
  - Title: `text-lg font-bold text-slate-800`
  - Subtitle: `text-sm text-slate-500 max-w-[260px]`
- **Continue Button:**
  - Box Style: `px-6 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm shadow-sm`
  - Interaction States: `hover:bg-slate-800 active:scale-95 transition-all`

### `cart-summary.tsx` [DUMB]
- **Box Style:** `sticky bottom-0 shrink-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-6 py-5 space-y-4`
- **Typography:**
  - Label Row: `text-sm text-slate-500 flex justify-between items-center`
  - Subtotal Value: `text-sm font-semibold text-slate-800`
  - Shipping Fee Value (Free): `text-sm font-semibold text-green-600`
  - Total Label: `text-base font-bold text-slate-900`
  - Total Value: `text-xl font-extrabold text-red-600`
- **Checkout CTA Button:**
  - Box Style: `w-full py-3.5 px-4 rounded-xl bg-orange-600 text-white text-base font-bold tracking-wide shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2`
  - Interaction States: `hover:bg-orange-700 hover:shadow-orange-600/30 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-600 transition-all`

## 3. RÀNG BUỘC MÀU SẮC (COLOR CONSTRAINTS)
- **Primary CTA (Chốt sale - Nút Checkout):** `bg-orange-600 hover:bg-orange-700 text-white`
- **Secondary CTA / Main Button:** `bg-slate-900 hover:bg-slate-800 text-white`
- **Backgrounds:**
  - Main Panel: `bg-white/95 backdrop-blur-md`
  - Page Backdrop: `bg-slate-900/40 backdrop-blur-sm`
  - Thumbnail Placeholder Bg: `bg-slate-100`
  - Hover Fill: `hover:bg-slate-50`
- **Text & Hierarchy:**
  - Primary Text: `text-slate-900`
  - Body / Label Text: `text-slate-800`
  - Muted / Subtitle Text: `text-slate-500`
  - Disabled / Border Text: `text-slate-400`
- **Special Values:**
  - Current Selling Price: `text-red-600 font-bold`
  - Original Discounted Price: `text-slate-400 line-through`
  - Free Shipping Highlight: `text-green-600 font-medium`
  - Success Badge: `bg-green-50 text-green-700 border-green-200`
- **Borders & Dividers:** `border-slate-100`, `border-slate-200`

## 4. MOCK DATA (DỮ LIỆU HIỂN THỊ)

### Sample Product Items (`items`):
```json
[
  {
    "id": "cart-item-1",
    "productId": "prod-101",
    "name": "Tai nghe Bluetooth Chống ồn Sony WH-1000XM5",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    "price": 6990000,
    "originalPrice": 8490000,
    "quantity": 1,
    "stock": 10
  },
  {
    "id": "cart-item-2",
    "productId": "prod-102",
    "name": "Bàn phím cơ không dây Keychron K2 V2 (RGB Aluminium)",
    "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=300&fit=crop",
    "price": 1850000,
    "originalPrice": 2100000,
    "quantity": 2,
    "stock": 5
  },
  {
    "id": "cart-item-3",
    "productId": "prod-103",
    "name": "Chuột không dây Ergonomic Logitech MX Master 3S",
    "image": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&h=300&fit=crop",
    "price": 2290000,
    "quantity": 1,
    "stock": 8
  }
]
```

### Sample Cart Summary (`summary`):
```json
{
  "subtotal": 12980000,
  "shippingFee": 0,
  "discount": 500000,
  "total": 12480000,
  "totalCount": 4
}
```

### Sample Empty State Content:
```json
{
  "title": "Giỏ hàng của bạn đang trống",
  "subtitle": "Chưa có sản phẩm công nghệ nào được chọn. Hãy tiếp tục mua sắm để khám phá thêm nhiều ưu đãi!",
  "actionText": "Tiếp tục mua sắm"
}
```
