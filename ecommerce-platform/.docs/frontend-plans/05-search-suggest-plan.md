# QUY HOẠCH KỸ THUẬT FRONTEND: SEARCH SUGGEST (TÌM KIẾM GỢI Ý)

> **Nguồn Ý Tưởng:** `.docs/ideas/05-search-suggest-idea.md`
> **Phiên bản:** 1.0.0
> **Ngày tạo:** 2026-08-09

---

## 1. PHÂN RÃ COMPONENT (COMPONENT TREE)

```
Header [SMART] (đã tồn tại)            → components/layout/header.tsx
└── SearchBar [SMART]                   → components/search/search-bar.tsx
    ├── SearchInput [DUMB]              → components/search/search-input.tsx
    └── SearchSuggestDropdown [DUMB]    → components/search/search-suggest-dropdown.tsx
        ├── SearchSuggestItem [DUMB]    → components/search/search-suggest-item.tsx
        └── SearchSuggestFooter [DUMB] → (inline trong SearchSuggestDropdown)
```

### Chú thích nhãn

| Nhãn | Ý nghĩa |
|------|---------|
| `[SMART]` | Kết nối Store / gọi API / xử lý state phức tạp |
| `[DUMB]` | Thuần UI, nhận Props, không chứa side-effect |

---

## 2. QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)

### 2.1 Bảng phân loại State

| State | Kiểu | Chiến lược | Lý do |
|---|---|---|---|
| `searchQuery` | `string` | **`useState` cục bộ** trong `SearchBar` | Giá trị ô input tức thì trước khi debounce |
| `debouncedQuery` | `string` | **`useDebounce` hook** (500ms) | Giá trị trigger gọi API, chống spam |
| `suggestions` | `SearchSuggestItem[]` | **TanStack Query** (`useSearchSuggest`) | Client-side cache, tái sử dụng kết quả |
| `isDropdownOpen` | `boolean` | **`useState` cục bộ** trong `SearchBar` | Điều khiển hiển thị dropdown |
| `isLoading` | `boolean` | **TanStack Query** (`isLoading`) | Hiển thị skeleton loader |

### 2.2 Logic Debounce & Trigger

```
User gõ → onChange → setSearchQuery (tức thì) → useDebounce(500ms) → debouncedQuery thay đổi
                                                                             ↓
                                                          TanStack Query tự động refetch
                                                          chỉ khi debouncedQuery.length >= 2
```

- **Điều kiện gọi API:** `debouncedQuery.length >= 2` (tránh gọi khi chuỗi quá ngắn).
- **Điều kiện hiển thị Dropdown:** `isDropdownOpen && searchQuery.length >= 2`.
- **Đóng Dropdown:** Khi user click ra ngoài (blur event) hoặc nhấn `Escape`.
- **`useDebounce` hook:** Bắt buộc dùng hook `useDebounce` tự viết tại `hooks/use-debounce.ts` (nếu chưa có) — **CẤM dùng `setTimeout` thuần**.

### 2.3 Xử lý UX Submit

- Nhấn **Enter** hoặc bấm icon kính lúp → điều hướng tới `/products?q={searchQuery}`.
- Bấm vào **một item gợi ý** → điều hướng tới trang `/products/{slug}`.
- Bấm **"Xem tất cả kết quả"** → điều hướng tới `/products?q={searchQuery}`.

---

## 3. CẤU TRÚC DỮ LIỆU (DATA INTERFACES)

### 3.1 API Response Interface

```typescript
// types/search.types.ts

/** Một sản phẩm gợi ý trả về từ API */
export interface SearchSuggestItemData {
  id: string;
  name: string;           // Tên sản phẩm (truncate nếu dài)
  slug: string;           // Dùng để build link /products/:slug
  imageUrl: string;       // Ảnh sản phẩm hiển thị bên trái
  price: number;          // Giá hiện tại (đã tính salePrice nếu có)
  originalPrice?: number; // Giá gốc (nếu đang sale, dùng để gạch ngang)
}

/** Response từ API GET /api/v1/products/search-suggest */
export interface SearchSuggestResponse {
  items: SearchSuggestItemData[];
  totalFound: number; // Tổng số sản phẩm tìm thấy (dùng cho footer "Xem X kết quả")
  query: string;      // Query đã tìm (echo lại để validate)
}
```

### 3.2 Props của Dumb Components

```typescript
// Props cho SearchInput (Dumb)
export interface SearchInputProps {
  value: string;
  placeholder?: string;
  isLoading?: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  onClear: () => void;
}

// Props cho SearchSuggestDropdown (Dumb)
export interface SearchSuggestDropdownProps {
  items: SearchSuggestItemData[];
  isLoading: boolean;
  query: string;          // Dùng để highlight từ khóa & build "xem X kết quả"
  totalFound: number;
  onSelectItem: (slug: string) => void;
  onViewAll: (query: string) => void;
}

// Props cho SearchSuggestItem (Dumb)
export interface SearchSuggestItemProps {
  item: SearchSuggestItemData;
  query: string;     // Để highlight từ khóa trong tên sản phẩm
  onClick: () => void;
}
```

### 3.3 Custom Hook Interface

```typescript
// hooks/use-search-suggest.ts (TanStack Query)
export interface UseSearchSuggestOptions {
  query: string;        // Giá trị đã debounce
  enabled?: boolean;    // Chỉ fetch khi true
}

export interface UseSearchSuggestResult {
  data: SearchSuggestResponse | undefined;
  isLoading: boolean;
  isError: boolean;
}
```

---

## 4. API CONTRACT

### `GET /api/v1/products/search-suggest`

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `q` | `string` (required) | Từ khóa tìm kiếm |
| `limit` | `number` (optional, default: 5) | Số lượng gợi ý tối đa trả về |

**Response mẫu:**
```json
{
  "items": [
    {
      "id": "uuid-1",
      "name": "Bắp Rang Bơ Caramel Jumbo",
      "slug": "bap-rang-bo-caramel-jumbo",
      "imageUrl": "https://...",
      "price": 45000,
      "originalPrice": 55000
    }
  ],
  "totalFound": 12,
  "query": "bắp"
}
```

> **Lưu ý Backend:** API này cần được thêm vào `products.controller.ts` như một route riêng biệt `GET /search-suggest`, PHẢI đặt TRƯỚC route `GET /:slug` để tránh bị nhầm slug.

---

## 5. ĐẶC TẢ UI (UI SPECS)

### 5.1 SearchInput Component
- Nền: `bg-slate-100`, focus: `bg-white border-orange-300`
- Bo góc: `rounded-full`
- Trạng thái loading: Hiển thị spinner nhỏ thay icon kính lúp
- Nút xóa (×): Hiện khi `value.length > 0`, ẩn khi rỗng

### 5.2 SearchSuggestDropdown Component
- **Vị trí:** `absolute top-full left-0 right-0 mt-2` — dropdown xuất hiện ngay bên dưới ô input
- **Nền:** `bg-white rounded-2xl shadow-xl border border-slate-100`
- **z-index:** `z-50` để không bị che bởi các thành phần khác
- **Animation:** Fade + scale nhỏ từ trên xuống (`animate-fadeIn`)
- **Max height:** `max-h-[420px] overflow-y-auto` để cuộn khi có nhiều item

### 5.3 SearchSuggestItem Component
- Layout: `flex items-center gap-3 px-4 py-3`
- **Ảnh sản phẩm:** `w-12 h-12 rounded-xl object-cover bg-gray-50` (bên trái)
- **Tên sản phẩm:** `text-sm font-medium text-slate-800 truncate` — 1 dòng duy nhất, cắt nếu dài
- **Giá hiện tại:** `text-sm font-bold text-red-600`
- **Giá gốc (nếu có):** `text-xs text-slate-400 line-through`
- Hover: `hover:bg-orange-50` — highlight cam nhạt nhất quán với brand
- **Highlight từ khóa:** Từ khóa tìm kiếm trong tên sản phẩm được bọc `<mark>` với `bg-orange-100 text-orange-700 rounded px-0.5`

### 5.4 SearchSuggestFooter (inline)
- Nút "Xem tất cả kết quả cho **{query}**":
  - `border-t border-slate-100 px-4 py-3`
  - `text-sm text-orange-600 font-semibold hover:bg-orange-50 flex items-center justify-between`
  - Hiển thị số lượng: `{totalFound} sản phẩm →`

### 5.5 Trạng thái Loading
- Hiển thị 3 skeleton items (placeholder pulse animation) thay vì spinner đơn thuần
- Skeleton: `h-12 w-12 rounded-xl bg-slate-200 animate-pulse` (ảnh) + 2 dải `bg-slate-200 animate-pulse` (text)

### 5.6 Trạng thái Empty (Không tìm thấy)
- Icon tìm kiếm lớn + text "Không tìm thấy sản phẩm cho **{query}**"
- Sub-text: "Thử tìm với từ khóa khác nhé! 🔍"

---

## 6. TÍCH HỢP VÀO HEADER

`SearchBar` [SMART] sẽ **thay thế** inline `<div>` search hiện tại trong `header.tsx`:

```
TRƯỚC: <div className="flex-1 max-w-xs xl:max-w-md hidden md:block ml-auto"> ... </div>
SAU:   <SearchBar className="flex-1 max-w-xs xl:max-w-md hidden md:block ml-auto" />
```

- Desktop: SearchBar nằm trong Header, `hidden md:block`
- Mobile: SearchBar được render trong Mobile Search Expandable Bar (thay `<input>` inline)
- Cả 2 dùng chung component `SearchBar` để tái sử dụng logic

---

## 7. CẤU TRÚC THƯ MỤC ĐỀ XUẤT

```
app/frontend/
├── components/
│   └── search/                                   ← Tất cả components liên quan search
│       ├── search-bar.tsx                        ← [SMART] Container chính, quản lý state
│       ├── search-input.tsx                      ← [DUMB] UI ô input đơn thuần
│       ├── search-suggest-dropdown.tsx           ← [DUMB] Container dropdown
│       └── search-suggest-item.tsx               ← [DUMB] Một hàng sản phẩm gợi ý
│
├── hooks/
│   ├── use-debounce.ts                           ← [UTILITY] Custom hook debounce (500ms)
│   └── use-search-suggest.ts                     ← [QUERY HOOK] TanStack Query wrapper
│
└── types/
    └── search.types.ts                           ← Toàn bộ interfaces cho Search feature
```

---

## 8. THỨ TỰ TRIỂN KHAI (IMPLEMENTATION ORDER)

1. **`types/search.types.ts`** — Định nghĩa interfaces trước
2. **`hooks/use-debounce.ts`** — Utility hook (kiểm tra xem đã có chưa)
3. **`hooks/use-search-suggest.ts`** — TanStack Query hook gọi API
4. **`components/search/search-suggest-item.tsx`** — Leaf component đơn giản nhất
5. **`components/search/search-input.tsx`** — Input UI component
6. **`components/search/search-suggest-dropdown.tsx`** — Container gợi ý
7. **`components/search/search-bar.tsx`** — Smart container kết nối tất cả
8. **`components/layout/header.tsx`** — Tích hợp `SearchBar` vào Header

---

## 9. RÀNG BUỘC KỸ THUẬT

- **Debounce:** BẮT BUỘC dùng `useDebounce` hook với delay **500ms** — CẤM `setTimeout` thuần.
- **Next.js Image:** BẮT BUỘC dùng `<Image />` từ `next/image` cho ảnh sản phẩm.
- **TypeScript:** CẤM dùng `any`. Mọi props và response đều có interface rõ ràng.
- **Client Component:** `SearchBar` phải là `'use client'` (dùng `useState`, event handler). Các DUMB components bên trong không cần `'use client'` nếu không dùng hook.
- **Accessibility:** Input phải có `aria-label`, dropdown phải có `role="listbox"`, mỗi item `role="option"`.
- **Màu sắc:** Chỉ dùng Tailwind class đã định nghĩa trong STYLEGUIDE. Không dùng mã HEX tùy ý.
