# DESIGN BRIEF: SEARCH SUGGEST (TÌM KIẾM GỢI Ý VỚI DROPDOWN TỰ ĐỘNG)

## 1. HỆ THỐNG LƯỚI & KHUNG HIỂN THỊ (LAYOUT & VIEWPORT)

- **VỊ TRÍ HIỂN THỊ (POSITIONING):**
  - **Desktop:** Nằm trực tiếp trên `Header` (`components/layout/header.tsx`), chiếm vị trí ô Search cũ với `flex-1 max-w-xs xl:max-w-md hidden md:block ml-auto relative`.
  - **Mobile:** Tích hợp vào thanh Mobile Search Expandable Bar trượt xuống dưới Header khi bật toggle search.
- **CẤU TRÚC DROPDOWN MENU:**
  - **Vị trí định vị:** `absolute top-full left-0 right-0 mt-2 z-50` — hiển thị ngay bên dưới ô Input.
  - **Khung chứa (Container Box):** `bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden min-w-[320px] max-h-[420px] flex flex-col`.
  - **Hiệu ứng xuất hiện:** `animate-fadeIn transition-all duration-200 ease-out origin-top`.
  - **Cuộn nội dung:** Danh sách gợi ý hỗ trợ cuộn với `overflow-y-auto custom-scrollbar`.

---

## 2. ĐẶC TẢ COMPONENT (COMPONENT SPECS)

### `search-input.tsx` [DUMB]
- **Box Style:** `relative w-full flex items-center`
- **Input Control Style:** 
  - `w-full bg-slate-100 border border-transparent rounded-full py-2 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400`
  - Focus State: `focus:outline-none focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all`
- **Search Icon (Trái):** `absolute left-3.5 top-2.5 text-slate-400 pointer-events-none w-4 h-4`
- **Clear Button (Xóa nhanh [×] bên phải):**
  - Box Style: `absolute right-3 top-2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors`
  - Condition: Chỉ hiển thị khi `value.length > 0` và không trong trạng thái `isLoading`.
- **Loading Spinner (Bên phải):**
  - Box Style: `absolute right-3 top-2.5 w-4 h-4 text-orange-600 animate-spin`
  - Condition: Thay thế icon kính lúp/xóa khi `isLoading === true`.

---

### `search-suggest-dropdown.tsx` [DUMB]
- **Box Style:** `absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100/80 z-50 overflow-hidden flex flex-col max-h-[420px]`
- **Header Section (Gợi ý phù hợp):**
  - Box Style: `px-4 pt-3 pb-1.5 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100/60`
  - Content: `"Gợi ý sản phẩm"` + Badge đếm tổng số kết quả `{totalFound}`
- **Body List Area:** `flex-1 overflow-y-auto divide-y divide-slate-50 py-1`

---

### `search-suggest-item.tsx` [DUMB]
- **Box Style:** `group flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50/70 transition-colors cursor-pointer`
- **Thumbnail Image:** `w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/50 object-cover shrink-0 aspect-square group-hover:scale-105 transition-transform duration-200`
- **Product Info Block:** `flex-1 min-w-0 flex flex-col justify-center`
  - **Product Name:** `text-sm font-semibold text-slate-800 truncate group-hover:text-orange-600 transition-colors`
  - **Highlighted Match (`<mark>`):** `bg-orange-100 text-orange-800 font-extrabold rounded px-1 py-0.5`
- **Price Block:** `shrink-0 text-right flex flex-col items-end`
  - **Current Selling Price:** `text-sm font-bold text-red-600`
  - **Original Price (nếu có sale):** `text-[11px] text-slate-400 line-through font-normal`

---

### `search-suggest-skeleton.tsx` [DUMB]
- **Box Style:** `px-4 py-3 space-y-3`
- **Item Skeleton:**
  - Layout: `flex items-center gap-3 py-1.5`
  - Thumbnail Placeholder: `w-12 h-12 rounded-xl bg-slate-200 animate-pulse shrink-0`
  - Info Lines: `flex-1 space-y-2`
    - Title Line: `h-4 w-3/4 bg-slate-200 rounded animate-pulse`
    - Subtitle Line: `h-3 w-1/3 bg-slate-200 rounded animate-pulse`

---

### `search-suggest-empty.tsx` [DUMB]
- **Box Style:** `flex flex-col items-center justify-center p-6 text-center space-y-2`
- **Icon Style:** `w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-1`
- **Typography:**
  - Main Message: `text-sm font-semibold text-slate-700`
  - Sub Message: `text-xs text-slate-400`

---

### `search-suggest-footer.tsx` (inline / component) [DUMB]
- **Box Style:** `border-t border-slate-100 bg-slate-50/60 px-4 py-3 shrink-0`
- **Action Link/Button:**
  - Box Style: `w-full flex items-center justify-between text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors group`
  - Text: `"Xem tất cả {totalFound} kết quả cho \"{query}\""`
  - Arrow Icon: `w-4 h-4 transform group-hover:translate-x-1 transition-transform`

---

## 3. RÀNG BUỘC MÀU SẮC (COLOR CONSTRAINTS)

- **Brand Action & Focus:**
  - Focus Ring: `border-orange-400 ring-orange-500/10`
  - Highlight Keyword Tag: `bg-orange-100 text-orange-800`
  - Item Hover Background: `hover:bg-orange-50/70`
  - Footer Link Text: `text-orange-600 hover:text-orange-700`
- **Price Color:**
  - Selling Price: `text-red-600 font-bold`
  - Discounted Original Price: `text-slate-400 line-through`
- **Neutral & Backgrounds:**
  - Input Inactive Bg: `bg-slate-100`
  - Input Focus Bg: `bg-white`
  - Dropdown Panel Bg: `bg-white`
  - Dividers & Borders: `border-slate-100`
  - Primary Text: `text-slate-800`
  - Muted Text: `text-slate-400`

---

## 4. MOCK DATA (DỮ LIỆU HIỂN THỊ)

### Sample Search Suggest Response (`GET /api/v1/products/search-suggest?q=bắp`):
```json
{
  "query": "bắp",
  "totalFound": 12,
  "items": [
    {
      "id": "prod-201",
      "name": "Bắp Rang Bơ Caramel Jumbo Gói 200g",
      "slug": "bap-rang-bo-caramel-jumbo-200g",
      "imageUrl": "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=200&h=200&fit=crop",
      "price": 45000,
      "originalPrice": 55000
    },
    {
      "id": "prod-202",
      "name": "Sữa Bắp Non Hạt Óc Chó TechBite 330ml",
      "slug": "sua-bap-non-hat-oc-cho-techbite-330ml",
      "imageUrl": "https://images.unsplash.com/photo-1556881286-fc6915169721?w=200&h=200&fit=crop",
      "price": 25000,
      "originalPrice": 30000
    },
    {
      "id": "prod-203",
      "name": "Bắp Nướng Mỡ Hành Chay Sấy Giòn 150g",
      "slug": "bap-nuong-mo-hanh-chay-say-gion-150g",
      "imageUrl": "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=200&h=200&fit=crop",
      "price": 32000
    },
    {
      "id": "prod-204",
      "name": "Snack Bắp Ngọt Phô Mai Cay Hàn Quốc",
      "slug": "snack-bap-ngot-pho-mai-cay-han-quoc",
      "imageUrl": "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=200&h=200&fit=crop",
      "price": 18000,
      "originalPrice": 22000
    },
    {
      "id": "prod-205",
      "name": "Bắp Cải Tím Sốt Salad Coder Chạy Deadline",
      "slug": "bap-cai-tim-sot-salad-coder-chay-deadline",
      "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=200&fit=crop",
      "price": 39000
    }
  ]
}
```

### Sample Empty Search Result (`GET /api/v1/products/search-suggest?q=xyz123`):
```json
{
  "query": "xyz123",
  "totalFound": 0,
  "items": []
}
```
