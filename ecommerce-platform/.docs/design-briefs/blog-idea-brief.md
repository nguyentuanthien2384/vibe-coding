# DESIGN BRIEF: MODULE BLOG & TIN TỨC (TechBite Ecommerce)
> **Loại tài liệu:** Machine-to-Machine Spec · Dành cho AI & Frontend Engineer render UI  
> **Tham chiếu Plan:** `blog-idea-plan.md` · **Tham chiếu Idea:** `10-blog-idea.md` · **Styleguide:** `.docs/STYLEGUIDE.md`

---

## 1. HỆ THỐNG LƯỚI & BỐ CỤC (LAYOUT SYSTEM)

### 1.1. Root Shell
```
<body>  bg-gray-50 min-h-screen font-sans antialiased text-slate-800
  <main>  max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10
```

### 1.2. Layout Trang Danh Sách Blog (`/blog`)
```
[Root Container]  max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8
  ├── [HeroSection]              mb-10
  │     Desktop:   grid grid-cols-12 gap-8 items-stretch
  │                Col-Left (Featured 1): col-span-12 lg:col-span-7
  │                Col-Right (Featured 2 & 3): col-span-12 lg:col-span-5 flex flex-col gap-6
  │     Mobile:    flex flex-col gap-6
  │
  ├── [FilterToolbarSection]     mb-8 flex flex-col md:flex-row items-center justify-between gap-4
  │     Left (Category Tabs):    flex items-center gap-2 overflow-x-auto scrollbar-hide w-full md:w-auto pb-2 md:pb-0
  │     Right (Search & Sort):   flex items-center gap-3 w-full md:w-72
  │
  ├── [BlogGridSection]          mb-12
  │     Mobile:    grid grid-cols-1 gap-6
  │     Tablet:    grid md:grid-cols-2 gap-6
  │     Desktop:   grid lg:grid-cols-3 gap-8
  │
  └── [PaginationSection]        flex justify-center items-center gap-2 pt-6 border-t border-slate-200
```

### 1.3. Layout Trang Chi Tiết Bài Viết (`/blog/[slug]`)
```
[Root Container]  max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8
  ├── [BreadcrumbsSection]       mb-6
  │
  └── [MainArticleGrid]          grid grid-cols-12 gap-8 lg:gap-12
        ├── [ArticleBodyCol]     col-span-12 lg:col-span-8
        │     ├── ArticleHeader               mb-8
        │     ├── ArticleFeaturedImage        mb-8 rounded-3xl overflow-hidden aspect-[16/9]
        │     ├── ArticleMobileTOC            block lg:hidden mb-8
        │     ├── BlogContentRenderer (Body)  prose prose-slate max-w-none mb-10
        │     ├── PostProductWidget           mb-10 p-6 bg-orange-50/60 border border-orange-100 rounded-2xl
        │     ├── PostTagsSection             mb-8 flex flex-wrap gap-2
        │     ├── AuthorBioCard               mb-12 p-6 bg-white border border-slate-200 rounded-2xl
        │     └── ShareBarFloatingMobile      fixed bottom-4 left-4 right-4 z-40 block lg:hidden
        │
        └── [ArticleSidebarCol]  col-span-12 lg:col-span-4 hidden lg:block
              └── [StickyContainer]  sticky top-24 space-y-8
                    ├── ArticleDesktopTOC       p-6 bg-white border border-slate-200 rounded-2xl shadow-sm
                    ├── SidebarPostProducts     p-6 bg-white border border-slate-200 rounded-2xl shadow-sm
                    └── SidebarTrendingPosts    p-6 bg-white border border-slate-200 rounded-2xl shadow-sm

  └── [RelatedPostsSection]      mt-16 pt-12 border-t border-slate-200
        ├── SectionHeader        mb-8
        └── RelatedPostsGrid     grid grid-cols-1 md:grid-cols-3 gap-6
```

---

## 2. ĐẶC TẢ COMPONENT [DUMB COMPONENTS]

### 2.1. `HeroFeaturedPostCard` (Card bài viết tiêu điểm)
```
Container: relative overflow-hidden rounded-3xl bg-slate-900 text-white
           group cursor-pointer aspect-[16/10] md:aspect-[16/9] lg:aspect-auto h-full min-h-[420px]
           shadow-lg hover:shadow-2xl transition-all duration-300
```
- **Background Image:** `absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700`
- **Gradient Overlay:** `absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent`
- **Badge "Nổi Bật":** `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-600 text-white shadow-md shadow-orange-600/30`
- **Category Badge:** `inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30`
- **Title `<h2>`:** `text-2xl md:text-3xl font-extrabold text-white leading-tight line-clamp-2 group-hover:text-orange-300 transition-colors`
- **Summary `<p>`:** `text-sm md:text-base text-slate-300 line-clamp-2 mt-2`
- **Author & Meta Row:** `flex items-center gap-3 text-xs md:text-sm text-slate-300 mt-4`
- **Avatar:** `w-8 h-8 rounded-full border border-white/40 object-cover`

---

### 2.2. `BlogCard` (Thẻ bài viết dạng lưới tiêu chuẩn)
```
Container: flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200
           hover:border-orange-200 hover:shadow-xl hover:-translate-y-1
           transition-all duration-300 group
```
- **Image Wrapper:** `relative aspect-[16/9] bg-slate-100 overflow-hidden`
- **Thumbnail Image:** `w-full h-full object-cover group-hover:scale-105 transition-transform duration-500`
- **Category Pill:** `absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/90 backdrop-blur-sm text-orange-600 shadow-sm`
- **Reading Time Badge:** `absolute bottom-3 right-3 z-10 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-900/70 text-white backdrop-blur-sm flex items-center gap-1`
- **Card Body:** `p-5 flex flex-col flex-1`
- **Title `<h3>`:** `text-lg font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors`
- **Summary `<p>`:** `text-sm text-slate-500 line-clamp-2 mt-2 leading-relaxed`
- **Footer Row:** `mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400`
- **Author Block:** `flex items-center gap-2 text-slate-700 font-medium`
- **Views Count:** `flex items-center gap-1 text-slate-400`

---

### 2.3. `CategoryTabPill` (Thẻ lọc chuyên mục)
```
Container: inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
           transition-all duration-200 select-none cursor-pointer whitespace-nowrap
```
- **Default State:** `bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50/50`
- **Active State (`isActive=true`):** `bg-orange-600 text-white border border-orange-600 shadow-md shadow-orange-600/20 font-semibold`
- **Count Badge:** `px-1.5 py-0.5 rounded-full text-[11px] font-bold` (Active: `bg-white/20 text-white`, Inactive: `bg-slate-100 text-slate-500`)

---

### 2.4. `BlogSearchInput` (Ô tìm kiếm bài viết)
```
Container: relative w-full
```
- **Input Field:** `w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all`
- **Search Icon:** `absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`
- **Clear Button:** `absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 hover:text-slate-600`

---

### 2.5. `ArticleHeader` (Header chi tiết bài viết)
```
Container: flex flex-col gap-4
```
- **Category & Date Row:** `flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600`
- **Main Heading `<h1>`:** `text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight`
- **Summary Lead `<p>`:** `text-lg sm:text-xl text-slate-600 font-normal leading-relaxed italic border-l-4 border-orange-500 pl-4 py-1`
- **Author & Action Bar:** `flex flex-wrap items-center justify-between gap-4 pt-4 border-b border-slate-200 pb-6`
- **Author Info:** `flex items-center gap-3`
- **Author Avatar:** `w-11 h-11 rounded-full object-cover border-2 border-orange-200`
- **Author Name:** `text-sm font-bold text-slate-900`
- **Publish Date & Read Time:** `text-xs text-slate-500`

---

### 2.6. `TableOfContentsNav` (Khối Mục Lục Bài Viết - TOC)
```
Container: bg-slate-50/80 border border-slate-200 rounded-2xl p-5
```
- **TOC Title:** `text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-200`
- **TOC List:** `space-y-1 text-sm`
- **H2 Link:** `block py-1 text-slate-600 hover:text-orange-600 hover:translate-x-1 font-medium transition-all`
- **H3 Link:** `block py-1 pl-4 text-slate-500 hover:text-orange-600 hover:translate-x-1 text-xs transition-all`
- **Active TOC Item:** `text-orange-600 font-bold border-l-2 border-orange-600 pl-2 bg-orange-50/50 rounded-r-md`

---

### 2.7. `PostProductEmbedCard` (Card sản phẩm nhúng trong bài viết)
```
Container: flex flex-col sm:flex-row items-center gap-5 p-4 sm:p-5 bg-white rounded-2xl
           border border-orange-200/80 shadow-sm hover:shadow-md transition-all
```
- **Product Thumbnail:** `w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover bg-slate-100 flex-shrink-0`
- **Product Details:** `flex-1 min-w-0 flex flex-col justify-center`
- **Badge "Món ngon gợi ý":** `inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 uppercase tracking-wider mb-1`
- **Product Name `<h4>`:** `text-base font-bold text-slate-900 hover:text-orange-600 line-clamp-1 transition-colors`
- **Price Row:** `flex items-baseline gap-2 mt-1`
- **Sale Price:** `text-lg font-black text-red-600`
- **Original Price:** `text-xs text-slate-400 line-through`
- **Stock Status:** `text-xs font-semibold text-emerald-600` (hoặc `text-amber-600` nếu tồn ít)
- **Action Button (`AddToCart`):** `inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-600/20 transition-all flex-shrink-0`

---

### 2.8. `SocialShareBar` (Thanh chia sẻ bài viết)
```
Container: flex items-center gap-2
```
- **Share Button (Facebook / X / Copy Link):** `inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-600 border border-slate-200 hover:border-orange-300 transition-all cursor-pointer`

---

### 2.9. `AuthorBioCard` (Thẻ thông tin tác giả bài viết)
```
Container: flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-200
```
- **Avatar:** `w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm flex-shrink-0`
- **Author Name:** `text-base font-bold text-slate-900`
- **Role Badge:** `inline-block px-2 py-0.5 rounded-md text-xs font-semibold bg-orange-100 text-orange-700 ml-2`
- **Bio Text:** `text-sm text-slate-600 mt-1 leading-relaxed`

---

### 2.10. `BlogCardSkeleton` (Khung xương tải trang)
```
Container: bg-white rounded-2xl overflow-hidden border border-slate-200 animate-pulse
```
- **Image Skeleton:** `aspect-[16/9] bg-slate-200`
- **Body Skeleton:** `p-5 space-y-3`
  - Line 1 (Badge): `w-20 h-4 bg-slate-200 rounded`
  - Line 2 (Title): `w-full h-5 bg-slate-200 rounded`
  - Line 3 (Title): `w-2/3 h-5 bg-slate-200 rounded`
  - Line 4 (Summary): `w-full h-4 bg-slate-200 rounded`
  - Line 5 (Footer): `pt-4 flex justify-between items-center border-t border-slate-100`

---

## 3. RÀNG BUỘC MÀU SẮC (COLOR CONSTRAINTS)

> ⚠️ **TUYỆT ĐỐI KHÔNG dùng mã HEX tùy tiện.** Chỉ sử dụng các biến mã màu Tailwind chuẩn của dự án:

| Mục đích UI | Tailwind CSS Class | Ghi chú ngữ cảnh |
|---|---|---|
| **Primary Brand CTA** | `bg-orange-600 hover:bg-orange-500` | Nút Thêm giỏ hàng, Đọc tiếp, Nút Submit |
| **CTA Shadow Glow** | `shadow-orange-600/25` | Hiệu ứng bóng đổ nút CTA cam |
| **Accent / Highlight** | `text-orange-600` | Link, Tiêu đề active, Hover state |
| **Accent Light Background**| `bg-orange-50` / `bg-orange-100` | Background tag, widget sản phẩm đính kèm |
| **Giá khuyến mãi / Giảm giá**| `text-red-600 font-bold` | Giá sản phẩm nhúng trong bài |
| **Giá gốc gạch ngang** | `text-slate-400 line-through` | Giá gốc |
| **Nền trang chính** | `bg-gray-50` | Root background |
| **Nền Card / Box trắng** | `bg-white` | Thẻ bài viết, Sidebar widget, TOC |
| **Nền Hero / Section tối** | `bg-slate-900` / `bg-slate-950` | Hero Featured Post banner |
| **Badge "Đã xuất bản"** | `bg-emerald-100 text-emerald-700` | Admin & Status |
| **Badge "Lên lịch"** | `bg-blue-100 text-blue-700` | Admin Status SCHEDULED |
| **Badge "Bản nháp"** | `bg-slate-100 text-slate-700` | Admin Status DRAFT |
| **Badge "Lưu trữ"** | `bg-amber-100 text-amber-700` | Admin Status ARCHIVED |
| **Text Tiêu đề chính** | `text-slate-900 font-bold` | H1, H2, H3 |
| **Text Nội dung thường** | `text-slate-600` | Đoạn văn, Body copy |
| **Text Phụ / Ngày tháng** | `text-slate-400` / `text-slate-500` | Metadata, Views, Date |
| **Viền mặc định** | `border-slate-200` | Card border, Divider |
| **Viền hover** | `border-orange-300` | Card hover state |

---

## 4. MOCK DATA (DỮ LIỆU HIỂN THỊ MẪU)

### 4.1. Danh sách Chuyên mục (`categories`)
```yaml
- id: 1
  name: "Tất Cả Bài Viết"
  slug: "tat-ca"
  postCount: 24
- id: 2
  name: "Góc Coder Thức Khuya"
  slug: "goc-coder-thuc-khuya"
  icon: "💻"
  postCount: 12
- id: 3
  name: "Review Đồ Ăn Vặt"
  slug: "review-do-an-vat"
  icon: "🍿"
  postCount: 8
- id: 4
  name: "Nước Tăng Lực & Cà Phê"
  slug: "nuoc-tang-luc-ca-phe"
  icon: "⚡"
  postCount: 6
- id: 5
  name: "Mẹo Năng Lượng Đỉnh Cao"
  slug: "meo-nang-luong"
  icon: "🔥"
  postCount: 4
```

### 4.2. Bài viết Hero Nổi Bật (`heroPost`)
```yaml
id: 101
title: "Top 7 Món Ăn Vặt 'Cứu Cánh' Đêm Chạy Deadline Cho Anh Em Lập Trình Viên"
slug: "top-7-mon-an-vat-cuu-canh-dem-chay-deadline"
summary: "Tổng hợp các món ăn nhanh vừa tiện lợi, vừa giàu protein giúp giữ tỉnh táo 100% suốt đêm trắng fix bug mà không sợ nặng bụng hay buồn ngủ."
thumbnail: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=675&fit=crop"
publishedAt: "2026-08-25T14:30:00.000Z"
readTimeMinutes: 6
views: 1845
author:
  fullName: "Hoàng Nam Dev"
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop"
  role: "Lead Tech Writer"
category:
  name: "Góc Coder Thức Khuya"
  slug: "goc-coder-thuc-khuya"
```

### 4.3. Danh sách Bài viết dạng Lưới (`blogPosts` - 6 bài)
```yaml
- id: 102
  title: "So Sánh Nước Tăng Lực Không Đường: Celsius vs Monster Đâu Là Chân Ái?"
  slug: "so-sanh-nuoc-tang-luc-khong-duong-celsius-vs-monster"
  summary: "Đánh giá chi tiết hàm lượng caffeine, vitamin B và cảm giác tim đập sau 4 tiếng chiến code liên tục."
  thumbnail: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&h=338&fit=crop"
  publishedAt: "2026-08-24T09:15:00.000Z"
  readTimeMinutes: 4
  views: 920
  author:
    fullName: "Minh Thư"
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop"
  category:
    name: "Nước Tăng Lực & Cà Phê"
    slug: "nuoc-tang-luc-ca-phe"

- id: 103
  title: "Đánh Giá Khô Gà Lá Chanh Xé Cay TechBite: Cay Nồng Kích Thích Não Bộ"
  slug: "danh-gia-kho-ga-la-chanh-xe-cay-techbite"
  summary: "Vị cay the kích thích vị giác cùng độ giòn rụm giúp bạn xua tan cơn buồn ngủ 2h sáng chỉ sau 3 miếng đầu tiên."
  thumbnail: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&h=338&fit=crop"
  publishedAt: "2026-08-23T16:45:00.000Z"
  readTimeMinutes: 5
  views: 1450
  author:
    fullName: "Tuấn Anh"
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop"
  category:
    name: "Review Đồ Ăn Vặt"
    slug: "review-do-an-vat"

- id: 104
  title: "Bí Quyết Giữ Tỉnh Táo 12 Tiếng Không Cần Nạp Quá Nhiều Đường"
  slug: "bi-quyet-giu-tinh-tao-12-tieng-khong-can-duong"
  summary: "Cách phân bổ hạt dinh dưỡng macca, óc chó xen kẽ các cữ uống nước giúp não bộ hoạt động bền bỉ."
  thumbnail: "https://images.unsplash.com/photo-1567892737950-30c4db39a622?w=600&h=338&fit=crop"
  publishedAt: "2026-08-22T08:30:00.000Z"
  readTimeMinutes: 7
  views: 2130
  author:
    fullName: "Hoàng Nam Dev"
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop"
  category:
    name: "Mẹo Năng Lượng Đỉnh Cao"
    slug: "meo-nang-luong"

- id: 105
  title: "Top 5 Loại Hạt Dinh Dưỡng Giúp Tăng Khả Năng Tập Trung Khi Lập Trình"
  slug: "top-5-loai-hat-dinh-duong-tang-tap-trung"
  summary: "Khám phá lợi ích của Omega-3 và Magie có trong Macca, Hạnh nhân Úc và Hạt điều sấy nguyên vị."
  thumbnail: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=338&fit=crop"
  publishedAt: "2026-08-20T11:00:00.000Z"
  readTimeMinutes: 5
  views: 870
  author:
    fullName: "Minh Thư"
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop"
  category:
    name: "Mẹo Năng Lượng Đỉnh Cao"
    slug: "meo-nang-luong"

- id: 106
  title: "Trà Sữa Oolong Nướng Có Phải Là 'Liều Thuốc Tinh Thần' Sau Khi Deploy Lỗi?"
  slug: "tra-sua-oolong-nuong-lieu-thuoc-tinh-than"
  summary: "Một ngụm đậm đà hương trà nướng thơm lừng kết hợp trân châu hoàng kim làm dịu ngay căng thẳng."
  thumbnail: "https://images.unsplash.com/photo-1558857563-b37102e99e00?w=600&h=338&fit=crop"
  publishedAt: "2026-08-18T15:20:00.000Z"
  readTimeMinutes: 4
  views: 1780
  author:
    fullName: "Tuấn Anh"
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop"
  category:
    name: "Review Đồ Ăn Vặt"
    slug: "review-do-an-vat"

- id: 107
  title: "Combo Deadline TechBite: Món Ăn Bán Chạy Nhất Tháng Có Gì Đặc Biệt?"
  slug: "combo-deadline-techbite-co-gi-dac-biet"
  summary: "Bóc hộp combo 3 món gồm Khô Gà, Trà Sữa Oolong và Snack Mực Nướng đang làm mưa làm gió trong cộng đồng IT."
  thumbnail: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600&h=338&fit=crop"
  publishedAt: "2026-08-15T10:00:00.000Z"
  readTimeMinutes: 6
  views: 3420
  author:
    fullName: "Hoàng Nam Dev"
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop"
  category:
    name: "Góc Coder Thức Khuya"
    slug: "goc-coder-thuc-khuya"
```

### 4.4. Sản phẩm Gợi ý Đính kèm trong bài viết (`postProducts`)
```yaml
- id: 1
  name: "Khô Gà Lá Chanh Xé Cay 200g"
  slug: "kho-ga-la-chanh-xe-cay"
  price: 55000
  salePrice: 45000
  imageUrl: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=300&h=300&fit=crop"
  stock: 25
  badge: "Giảm 18%"

- id: 2
  name: "Nước Tăng Lực Celsius Dưa Hấu Zero Sugar"
  slug: "nuoc-tang-luc-celsius-dua-hau"
  price: 28000
  salePrice: null
  imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&h=300&fit=crop"
  stock: 15
  badge: "Bán chạy"
```
