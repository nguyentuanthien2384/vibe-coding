# DESIGN BRIEF: TRANG QUẢN TRỊ BLOG & BÀI VIẾT (ADMIN DASHBOARD BLOG)

> **Loại tài liệu:** Machine-to-Machine Visual Specification · Dành cho Frontend Engineer và AI thi công UI  
> **Nguồn ý tưởng:** `.docs/ideas/dashboard/07-blog-idea.md` & `.docs/ideas/10-blog-idea.md`  
> **Mockup chuẩn:** Kế thừa hệ thống lưới và bảng từ `.docs/ui-mockups/dash-products/index.html`  
> **Ứng dụng mục tiêu:** Admin Dashboard (`apps/dash` / `app/dash/my-app`)  
> **Phiên bản:** 1.0.0 · **Ngày tạo:** 2026-08-27  

---

## 1. HỆ THỐNG LƯỚI & BỐ CỤC (LAYOUT SYSTEM)

### 1.1. Root Shell Layout
```
[Admin Layout Shell]  bg-[#F5F6FA] min-h-screen font-sans text-[#202224] flex
  ├── [AdminSidebar]  w-64 bg-white border-r border-gray-100 hidden lg:block
  └── [MainContent]   flex-1 flex flex-col min-w-0
        ├── [AdminHeader]  h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between
        └── [PageContent]  p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full
```

---

### 1.2. Bố cục Màn hình Danh sách Bài viết (`/blog`)
```
[PageContainer]  space-y-6
  ├── [PageHeaderSection]      flex flex-col sm:flex-row sm:items-center justify-between gap-4
  │     ├── Left:              Tiêu đề "Quản lý Bài viết & Tin tức" + Breadcrumb
  │     └── Right:             Nút "+ Viết bài mới" (Primary #4880FF) & Nút "Chuyên mục" (Secondary Outlined)
  │
  ├── [FilterToolbarSection]   bg-white p-5 rounded-2xl border border-gray-100 shadow-sm
  │     Desktop:               grid grid-cols-12 gap-4 items-center
  │                            - Search Input: col-span-12 md:col-span-5
  │                            - Category Select: col-span-6 md:col-span-3
  │                            - Status Select: col-span-6 md:col-span-2
  │                            - Sort Dropdown: col-span-12 md:col-span-2
  │
  ├── [TableCardSection]       bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden
  │     ├── [BlogTable]        w-full text-left border-collapse
  │     └── [BlogPagination]   px-6 py-4 border-t border-gray-100 flex items-center justify-between
```

---

### 1.3. Bố cục Màn hình Soạn thảo & Chỉnh sửa (`/blog/create` & `/blog/[id]/edit`)
```
[FormContainer]  space-y-6
  ├── [FormHeaderSection]      flex items-center justify-between pb-2 border-b border-gray-200
  │     ├── Left:              Nút Quay lại (Icon ArrowLeft) + Tiêu đề Form ("Viết bài mới" / "Chỉnh sửa bài viết")
  │     └── Right:             Nút Xem trước (Preview Tab) + Nút Hủy + Nút Lưu & Xuất bản (Sticky Header)
  │
  └── [FormGridSection]        grid grid-cols-12 gap-6 lg:gap-8 items-start
        │
        ├── [LeftCol - Nội dung chính]     col-span-12 lg:col-span-8 space-y-6
        │     ├── [GeneralInfoCard]        bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4
        │     │     ├── TitleInput         w-full text-2xl font-bold
        │     │     ├── SlugInputWithAuto  kèm badge "Tự động sinh" & nút chỉnh sửa
        │     │     └── SummaryTextarea    tối đa 500 ký tự
        │     │
        │     ├── [RichEditorCard]         bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4
        │     │     ├── EditorToolbar      Sticky toolbar (Bold, Italic, H2, H3, List, Quote, Image, Divider)
        │     │     └── JSONEditorCanvas   ProseMirror / TipTap JSON Editor Canvas
        │     │
        │     └── [CrossSellProductsCard]  bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4
        │           ├── SearchProductInput Tìm kiếm sản phẩm store (Debounce 300ms)
        │           └── AttachedProducts   Danh sách Card sản phẩm kèm thứ tự displayOrder & nút gỡ
        │
        └── [RightCol - Cấu hình & SEO]    col-span-12 lg:col-span-4 space-y-6 sticky top-20
              ├── [PublishingCard]         bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4
              │     ├── StatusSelect       Bản nháp / Lên lịch / Xuất bản / Lưu trữ
              │     ├── ScheduledPicker    Hiện khi status = SCHEDULED
              │     └── ActionButtons      Lưu nháp / Xuất bản
              │
              ├── [CategoryAndTagsCard]    bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4
              │     ├── CategorySelect     Chọn chuyên mục cha
              │     └── TagInput           Nhập thẻ hashtag
              │
              ├── [ThumbnailCard]          bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4
              │     └── ImageDropzone      Khung upload 16:9 + Preview + Dán URL
              │
              └── [SeoOptimizationCard]    bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4
                    ├── MetaTitleInput     kèm thanh đếm 50-60 chars
                    ├── MetaDescTextarea   kèm thanh đếm 150-160 chars
                    └── GoogleSerpPreview  Card mô phỏng kết quả tìm kiếm Google
```

---

### 1.4. Bố cục Màn hình Quản lý Chuyên mục (`/blog/categories`)
```
[CategoryPageContainer]  space-y-6
  ├── [CategoryHeaderSection]  flex items-center justify-between
  │     ├── Left:              Nút quay lại `/blog` + Tiêu đề "Chuyên mục Bài viết"
  │     └── Right:             Nút "+ Thêm chuyên mục mới" (Mở Modal)
  │
  └── [CategoryTableCard]      bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden
        ├── [CategoryTable]    Icon, Tên, Slug, Số bài viết, Thứ tự, Trạng thái, Thao tác
        └── [CategoryModal]    Popup Modal Thêm / Sửa Chuyên mục
```

---

## 2. ĐẶC TẢ COMPONENT [DUMB COMPONENTS]

### 2.1. `BlogPageHeader` (Header Trang Danh sách)
```
Container: flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2
```
- **Title Block:**
  - Tiêu đề `<h1>`: `text-2xl sm:text-3xl font-extrabold tracking-tight text-[#202224]`
  - Subtitle `<p>`: `text-sm text-gray-500 mt-1` ("Quản lý toàn bộ bài viết, tin tức và bài blog ẩm thực")
- **Action Buttons Group:** `flex items-center gap-3`
  - **Nút "Chuyên mục"**: `inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-all shadow-sm`
  - **Nút "+ Viết bài mới"**: `inline-flex items-center gap-2 px-5 py-2.5 bg-[#4880FF] hover:bg-blue-600 active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-200`

---

### 2.2. `BlogFilterBar` (Thanh Bộ lọc Tổng hợp)
```
Container: bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm
           grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-center
```
- **Search Box (col-span-12 lg:col-span-5):** `relative w-full`
  - Input: `w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-[#202224] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all`
  - Search Icon: `absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`
- **Category Filter (col-span-6 lg:col-span-3):**
  - Select: `w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-[#202224] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all`
- **Status Filter (col-span-6 lg:col-span-2):**
  - Select: `w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-[#202224] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all`
- **Sort Dropdown (col-span-12 lg:col-span-2):**
  - Select: `w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-[#202224] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all`

---

### 2.3. `BlogTableRow` (Hàng Danh sách Bài viết)
```
Container: <tr> border-b border-gray-100 hover:bg-[#F9FAFB] transition-colors duration-200
```
- **Cột Thumbnail & Title:** `py-4 px-6 flex items-center gap-4`
  - Thumbnail Wrapper: `w-20 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 relative`
  - Image: `w-full h-full object-cover`
  - Title Text: `font-bold text-sm text-[#202224] hover:text-[#4880FF] line-clamp-1 transition-colors`
  - Slug Text: `text-xs text-gray-400 line-clamp-1 mt-0.5 font-mono`
- **Cột Chuyên mục:** `py-4 px-4`
  - Category Badge: `inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-blue-50 hover:text-[#4880FF] transition-all cursor-pointer`
- **Cột Tác giả:** `py-4 px-4 flex items-center gap-2.5`
  - Avatar: `w-7 h-7 rounded-full object-cover border border-gray-200 flex-shrink-0`
  - Author Name: `text-xs font-medium text-gray-700`
- **Cột Lượt xem & Đọc:** `py-4 px-4 text-xs text-gray-500 font-medium whitespace-nowrap`
  - Views: `flex items-center gap-1 text-[#202224] font-semibold`
  - Read time: `text-gray-400 text-[11px]`
- **Cột Trạng thái (`BlogStatusBadge`):** `py-4 px-4`
  - `PUBLISHED`: `bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs px-2.5 py-1 rounded-full inline-flex items-center gap-1`
  - `SCHEDULED`: `bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs px-2.5 py-1 rounded-full inline-flex items-center gap-1`
  - `DRAFT`: `bg-slate-100 text-slate-600 border border-slate-200 font-bold text-xs px-2.5 py-1 rounded-full inline-flex items-center gap-1`
  - `ARCHIVED`: `bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs px-2.5 py-1 rounded-full inline-flex items-center gap-1`
- **Cột Ngày xuất bản:** `py-4 px-4 text-xs text-gray-500 whitespace-nowrap`
- **Cột Thao tác (Actions):** `py-4 px-6 text-right`
  - Button Group: `inline-flex items-center gap-1`
  - Nút Xem trước (External Link): `p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all`
  - Nút Chỉnh sửa (Edit Icon): `p-2 text-gray-400 hover:text-[#4880FF] hover:bg-blue-50 rounded-lg transition-all`
  - Nút Xóa (Trash Icon): `p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all`

---

### 2.4. `BlogCrossSellItem` (Card Sản phẩm đính kèm trong bài viết)
```
Container: flex items-center justify-between p-3.5 bg-gray-50/80 hover:bg-gray-100/80
           border border-gray-200 rounded-2xl transition-all group
```
- **Thumbnail:** `w-12 h-12 rounded-xl object-cover bg-white border border-gray-100 flex-shrink-0`
- **Info Block:** `flex-1 min-w-0 mx-3`
  - Product Name: `text-xs font-bold text-[#202224] line-clamp-1`
  - Price: `text-xs font-extrabold text-[#4880FF] mt-0.5`
  - Stock Badge: `text-[11px] text-gray-500 font-medium`
- **Order Handle & Remove:** `flex items-center gap-2`
  - Order Badge: `px-2 py-0.5 bg-white border border-gray-200 rounded-md text-[11px] font-bold text-gray-600`
  - Remove Button: `p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all`

---

### 2.5. `GoogleSerpPreview` (Khung Xem trước Kết quả Google)
```
Container: p-4 bg-white border border-gray-200 rounded-2xl shadow-inner space-y-1.5
```
- **Search Header (Favicon + Site Name + URL):** `flex items-center gap-2 text-xs text-[#202124]`
  - Favicon: `w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold`
  - Site Name: `font-medium text-[#202124]` ("TechBite · Ẩm thực & Đồ ăn nhanh")
  - URL Breadcrumb: `text-xs text-gray-500 truncate` ("https://techbite.vn › blog › [slug]")
- **SERP Title:** `text-lg font-normal text-[#1a0dab] hover:underline cursor-pointer line-clamp-1 leading-snug`
- **SERP Description:** `text-xs text-[#4d5156] line-clamp-2 leading-relaxed`

---

### 2.6. `CategoryTableRow` & `CategoryFormModal`
```
Modal Container: fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm
Modal Box: w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-5
```
- **Modal Header:** `flex items-center justify-between pb-3 border-b border-gray-100`
  - Title: `text-lg font-bold text-[#202224]`
  - Close Button: `p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl`
- **Form Controls:** `space-y-4`
  - Name Input + Slug Auto Generation.
  - Icon Picker / Emoji input.
  - Order Index number input.
  - Switch Active/Inactive.
- **Modal Actions:** `flex items-center justify-end gap-3 pt-3 border-t border-gray-100`
  - Cancel Button: `px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl`
  - Submit Button: `px-5 py-2 text-sm font-bold text-white bg-[#4880FF] hover:bg-blue-600 rounded-xl shadow-md shadow-blue-200`

---

## 3. RÀNG BUỘC MÀU SẮC (COLOR CONSTRAINTS)

> ⚠️ **TUYỆT ĐỐI KHÔNG DÙNG MÃ MÀU TỰ DO.** Sử dụng nghiêm ngặt các class Tailwind CSS của hệ thống Admin:

| Thành phần / Trạng thái | Class Tailwind CSS | Ý nghĩa sử dụng |
|---|---|---|
| **Màu thương hiệu Admin (Primary)** | `bg-[#4880FF] hover:bg-blue-600` | Nút hành động chính (Tạo mới, Lưu form, Xuất bản) |
| **Bóng đổ Primary** | `shadow-md shadow-blue-200` | Hiệu ứng nổi cho nút chính |
| **Văn bản Tiêu đề chính** | `text-[#202224] font-extrabold` | H1, H2, Tiêu đề bảng |
| **Nền trang Dashboard** | `bg-[#F5F6FA]` | Nền xám tổng thể toàn app |
| **Nền Card / Box trắng** | `bg-white` | Khối thẻ bảng, Form cards |
| **Viền viền chung (Borders)** | `border-gray-100` / `border-gray-200` | Viền ngăn cách card, table divider |
| **Badge `PUBLISHED`** | `bg-emerald-50 text-emerald-700 border-emerald-200` | Đã xuất bản thành công |
| **Badge `SCHEDULED`** | `bg-blue-50 text-blue-700 border-blue-200` | Đã lên lịch xuất bản tự động |
| **Badge `DRAFT`** | `bg-slate-100 text-slate-600 border-slate-200` | Bản nháp nội bộ |
| **Badge `ARCHIVED`** | `bg-amber-50 text-amber-700 border-amber-200` | Bài viết lưu trữ / ẩn |
| **Nút Xóa / Danger Action** | `text-red-600 hover:bg-red-50` / `bg-red-600` | Thao tác gỡ bỏ / xóa vĩnh viễn |
| **Văn bản Giá tiền sản phẩm** | `text-[#4880FF] font-extrabold` | Giá bán sản phẩm đính kèm |

---

## 4. MOCK DATA (DỮ LIỆU HIỂN THỊ MẪU TIẾNG VIỆT)

### 4.1. Danh sách Bài viết Mẫu (`mockBlogPosts`)
```json
[
  {
    "id": 101,
    "title": "Top 7 Món Ăn Vặt 'Cứu Cánh' Đêm Chạy Deadline Cho Anh Em Lập Trình Viên",
    "slug": "top-7-mon-an-vat-cuu-canh-dem-chay-deadline",
    "summary": "Tổng hợp các món ăn nhanh vừa tiện lợi, vừa giàu protein giúp giữ tỉnh táo suốt đêm trắng fix bug.",
    "thumbnail": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=338&fit=crop",
    "status": "PUBLISHED",
    "views": 1845,
    "readTimeMinutes": 6,
    "categoryId": 2,
    "categoryName": "Góc Coder Thức Khuya",
    "categorySlug": "goc-coder-thuc-khuya",
    "authorId": 1,
    "authorName": "Hoàng Nam Dev",
    "authorAvatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop",
    "publishedAt": "2026-08-25T14:30:00.000Z",
    "scheduledAt": null,
    "createdAt": "2026-08-25T10:00:00.000Z"
  },
  {
    "id": 102,
    "title": "So Sánh Nước Tăng Lực Không Đường: Celsius vs Monster Đâu Là Chân Ái?",
    "slug": "so-sanh-nuoc-tang-luc-khong-duong-celsius-vs-monster",
    "summary": "Đánh giá chi tiết hàm lượng caffeine, vitamin B và cảm giác tim đập sau 4 tiếng chiến code liên tục.",
    "thumbnail": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&h=338&fit=crop",
    "status": "SCHEDULED",
    "views": 0,
    "readTimeMinutes": 4,
    "categoryId": 4,
    "categoryName": "Nước Tăng Lực & Cà Phê",
    "categorySlug": "nuoc-tang-luc-ca-phe",
    "authorId": 2,
    "authorName": "Minh Thư Staff",
    "authorAvatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
    "publishedAt": null,
    "scheduledAt": "2026-08-28T09:00:00.000Z",
    "createdAt": "2026-08-27T08:15:00.000Z"
  },
  {
    "id": 103,
    "title": "Bí Quyết Giữ Tỉnh Táo 12 Tiếng Không Cần Nạp Quá Nhiều Đường",
    "slug": "bi-quyet-giu-tinh-tao-12-tieng-khong-can-duong",
    "summary": "Cách phân bổ hạt dinh dưỡng macca, óc chó xen kẽ các cữ uống nước giúp não bộ hoạt động bền bỉ.",
    "thumbnail": "https://images.unsplash.com/photo-1567892737950-30c4db39a622?w=600&h=338&fit=crop",
    "status": "DRAFT",
    "views": 0,
    "readTimeMinutes": 5,
    "categoryId": 5,
    "categoryName": "Mẹo Năng Lượng",
    "categorySlug": "meo-nang-luong",
    "authorId": 1,
    "authorName": "Hoàng Nam Dev",
    "authorAvatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop",
    "publishedAt": null,
    "scheduledAt": null,
    "createdAt": "2026-08-27T11:20:00.000Z"
  }
]
```

### 4.2. Danh sách Chuyên mục Mẫu (`mockCategories`)
```json
[
  { "id": 1, "name": "Tin Tức Công Nghệ", "slug": "tin-tuc-cong-nghe", "icon": "📰", "postCount": 18, "orderIndex": 1, "isActive": true },
  { "id": 2, "name": "Góc Coder Thức Khuya", "slug": "goc-coder-thuc-khuya", "icon": "💻", "postCount": 12, "orderIndex": 2, "isActive": true },
  { "id": 3, "name": "Review Đồ Ăn Vặt", "slug": "review-do-an-vat", "icon": "🍿", "postCount": 8, "orderIndex": 3, "isActive": true },
  { "id": 4, "name": "Nước Tăng Lực & Cà Phê", "slug": "nuoc-tang-luc-ca-phe", "icon": "⚡", "postCount": 6, "orderIndex": 4, "isActive": true },
  { "id": 5, "name": "Mẹo Năng Lượng Đỉnh Cao", "slug": "meo-nang-luong", "icon": "🔥", "postCount": 4, "orderIndex": 5, "isActive": true }
]
```

### 4.3. Sản phẩm Store Gắn kèm Mẫu (`mockAttachedProducts`)
```json
[
  {
    "id": 201,
    "name": "Khô Gà Lá Chanh Xé Cay 200g",
    "slug": "kho-ga-la-chanh-xe-cay-200g",
    "imageUrl": "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=200&h=200&fit=crop",
    "price": 55000,
    "salePrice": 45000,
    "stock": 42,
    "displayOrder": 1
  },
  {
    "id": 202,
    "name": "Nước Tăng Lực Celsius Dưa Hấu Zero Sugar 330ml",
    "slug": "nuoc-tang-luc-celsius-dua-hau",
    "imageUrl": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&h=200&fit=crop",
    "price": 32000,
    "salePrice": null,
    "stock": 18,
    "displayOrder": 2
  }
]
```
