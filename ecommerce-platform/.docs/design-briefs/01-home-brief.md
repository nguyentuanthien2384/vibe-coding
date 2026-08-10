# DESIGN BRIEF: TRANG CHỦ (Home Page)
> **Loại tài liệu:** Machine-to-Machine Spec · Dành cho AI render UI
> **Tham chiếu Plan:** `01-home-plan.md` · **Tham chiếu Idea:** `01-home-idea.md`

---

## 1. HỆ THỐNG LƯỚI & BỐ CỤC (LAYOUT SYSTEM)

### Root Shell
```
<body>  bg-gray-50 min-h-screen font-sans antialiased
  <main>  max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

### Section Spacing (Top → Bottom)
| Section | Padding dọc | Ghi chú |
|---|---|---|
| `HeroBanner` | `py-0` | Full-bleed, KHÔNG có padding dọc, ảnh chạm mép |
| `CategoryRail` | `py-8` | Nằm sát dưới Hero |
| `FeaturedProductsSection` | `pt-4 pb-16` | Section chính, nhiều content |
| `SocialProofBanner` | `py-6` | Nhỏ gọn, màu nền khác để tạo phân tách |

### Cấu trúc Grid theo Section

**CategoryRail**
```
Mobile:   flex flex-nowrap gap-3 overflow-x-auto scrollbar-hide px-4
Desktop:  flex flex-wrap justify-center gap-4
```

**ProductGrid (FeaturedProductsSection)**
```
Mobile:   grid grid-cols-2 gap-3
Tablet:   md:grid-cols-3 md:gap-4
Desktop:  lg:grid-cols-4 lg:gap-6
```

---

## 2. ĐẶC TẢ COMPONENT (COMPONENT SPECS)

### `HeroBanner`
```
Container:  relative w-full rounded-2xl overflow-hidden
            aspect-[21/9] md:aspect-[3/1]
            bg-slate-900 (fallback nếu ảnh chưa load)

Background: <Image> object-cover w-full h-full absolute inset-0
            Overlay: absolute inset-0 bg-gradient-to-r
                     from-slate-900/80 via-slate-900/40 to-transparent

Content:    absolute inset-0 flex flex-col justify-center
            px-8 md:px-16 py-8 z-10
```

| Element | Classes |
|---|---|
| `HeroBadge` | `inline-flex items-center gap-1.5 bg-orange-600 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4` |
| Title `<h1>` | `text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight max-w-lg` |
| Subtitle `<p>` | `text-sm md:text-base text-slate-300 mt-2 mb-6 max-w-md` |
| `HeroCtaButton` | `inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-600/30 transition-all duration-200 hover:-translate-y-0.5` |

---

### `CategoryChip`
```
Container:  flex flex-col items-center gap-2 cursor-pointer
            group select-none
```

| State | Classes |
|---|---|
| Default | `bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm transition-all duration-200` |
| Hover | `group-hover:border-orange-400 group-hover:shadow-md group-hover:-translate-y-0.5` |
| Active (`isActive=true`) | `bg-orange-600 border-orange-600 shadow-md shadow-orange-600/20` |

| Element | Classes |
|---|---|
| Icon | `w-8 h-8 object-contain` |
| Label | Default: `text-sm font-medium text-slate-700` · Active: `text-white` |

---

### `ProductCard`
```
Container:  bg-white rounded-2xl overflow-hidden
            shadow-sm hover:shadow-lg
            transition-all duration-300 hover:-translate-y-1
            flex flex-col
            border border-transparent hover:border-orange-200
```

**`ProductImageWrapper`**
```
Wrapper:    relative aspect-square bg-gray-100 overflow-hidden
Image:      object-cover w-full h-full
            group-hover:scale-105 transition-transform duration-300
```

**`DiscountBadge`** _(góc trên phải của ảnh)_
```
Position:   absolute top-2 right-2 z-10
Style:      bg-red-600 text-white text-xs font-bold
            px-2 py-0.5 rounded-lg
Content:    "-{discountPercent}%"   (tính: Math.round((1 - salePrice/price) * 100))
Hiển thị:  CHỈ render khi salePrice !== null
```

**`StockBadge`** _(góc trên trái của ảnh)_
```
Hết hàng (stock === 0):
  Overlay:  absolute inset-0 bg-white/60 backdrop-blur-sm z-10
  Badge:    absolute top-2 left-2 bg-gray-500 text-white text-xs font-semibold
            px-2 py-0.5 rounded-lg
  Text:     "Hết hàng"

Sắp hết (1 ≤ stock ≤ 5):
  Badge:    absolute top-2 left-2 bg-amber-500 text-white text-xs font-semibold
            px-2 py-0.5 rounded-lg
  Text:     "Sắp hết"
```

**Body (dưới ảnh)**
```
Padding:    p-3 flex flex-col flex-1 gap-2

Tên sản phẩm:
  <p>  text-sm font-semibold text-slate-800 leading-snug line-clamp-2

Giá tiền:
  <div>  flex items-baseline gap-2
    Giá sale:  text-red-600 font-bold text-base
    Giá gốc:   text-slate-400 text-xs line-through  (CHỈ hiện khi có salePrice)

AddToCartButton:  mt-auto (đẩy xuống đáy card)
```

**`AddToCartButton`**
```
Enabled:   w-full flex items-center justify-center gap-1.5
           bg-orange-600 hover:bg-orange-500 active:scale-95
           text-white font-bold text-sm
           py-2.5 rounded-xl
           transition-all duration-150
           shadow-sm hover:shadow-md hover:shadow-orange-600/25
Icon:      [+] hoặc ShoppingCart icon w-4 h-4

Disabled (stock=0):
           bg-gray-200 text-gray-400 cursor-not-allowed
           (xóa hover effects)
           Text: "Hết hàng"

Loading (isLoading=true):
           opacity-75 cursor-wait
           Icon: Spinner thay cho [+]
```

---

### `SectionHeader`
```
Container:  flex items-end justify-between mb-6

Title <h2>:       text-2xl font-bold text-slate-900 tracking-tight
Subtitle <p>:     text-sm text-slate-500 mt-0.5

Action Link:      text-sm font-semibold text-orange-600
                  hover:text-orange-500 hover:underline
                  underline-offset-2 transition-colors
```

---

### `ProductGridSkeleton`
```
Grid:        Giống ProductGrid (grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-*)
Mỗi item:
  Container: bg-white rounded-2xl overflow-hidden animate-pulse
  Ảnh:       aspect-square bg-gray-200
  Body p-3:
    Line 1:  h-3 bg-gray-200 rounded w-3/4 mb-2
    Line 2:  h-3 bg-gray-200 rounded w-1/2 mb-3
    Button:  h-9 bg-gray-200 rounded-xl w-full
```

---

### `SocialProofBanner`
```
Container:  bg-slate-900 rounded-2xl py-5 px-8
            flex items-center justify-center gap-4
            text-center

Number:     text-3xl font-extrabold text-orange-500
Message:    text-sm md:text-base text-slate-300 font-medium
```

---

## 3. RÀNG BUỘC MÀU SẮC (COLOR CONSTRAINTS)

> ⚠️ TUYỆT ĐỐI KHÔNG dùng mã HEX. Chỉ dùng class Tailwind dưới đây.

| Mục đích | Tailwind Class | Ghi chú |
|---|---|---|
| **Primary CTA** (Thêm giỏ, Thanh toán) | `bg-orange-600` | DÙNG DUY NHẤT cho action chính |
| **Primary CTA Hover** | `bg-orange-500` | |
| **CTA Shadow glow** | `shadow-orange-600/25` | |
| **Badge giảm giá** | `bg-red-600 text-white` | |
| **Giá hiện tại** | `text-red-600 font-bold` | |
| **Giá cũ gạch ngang** | `text-slate-400 line-through` | |
| **Nền trang** | `bg-gray-50` | |
| **Nền Card** | `bg-white` | |
| **Nền Section tối** | `bg-slate-900` | SocialProofBanner, overlay Hero |
| **Active Category** | `bg-orange-600 text-white` | |
| **Stock hết hàng** | `bg-gray-500 text-white` | |
| **Stock sắp hết** | `bg-amber-500 text-white` | |
| **Stock mới** | `bg-green-500 text-white` | |
| **Text chính** | `text-slate-900` | Heading |
| **Text phụ** | `text-slate-500` | Subtitle, label |
| **Text trên nền tối** | `text-slate-300` | Nội dung trong Hero, SocialProof |
| **Viền mặc định** | `border-slate-200` | Card, Chip |
| **Viền hover** | `border-orange-200` | ProductCard hover |

---

## 4. MOCK DATA (DỮ LIỆU HIỂN THỊ)

### HeroBanner
```yaml
badgeLabel: "🔥 HOT DEAL • 22h - 2h sáng"
title:      "Nạp Năng Lượng\nCode Phê Hơn"
subtitle:   "Combo Thức Khuya giảm giá 20% — Chỉ dành cho anh em chạy deadline."
ctaLabel:   "Xem Combo Ngay"
ctaHref:    "/products?tag=combo-deadline"
imageUrl:   "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1400&h=500"
```

### CategoryRail (4 chip)
```yaml
- { name: "Đồ Ăn Vặt",     slug: "do-an-vat",      iconUrl: "🍟" }
- { name: "Nước Uống",      slug: "nuoc-uong",       iconUrl: "🧃" }
- { name: "Trái Cây Tô",    slug: "trai-cay-to",     iconUrl: "🍓" }
- { name: "Combo Deadline",  slug: "combo-deadline",  iconUrl: "💻" }
```
> Icon có thể dùng emoji làm placeholder cho đến khi có file SVG thật.

### FeaturedProductsSection — SectionHeader
```yaml
title:       "Món Bán Chạy 🔥"
subtitle:    "Top 8 món được anh em dev order nhiều nhất tuần này"
actionLabel: "Xem tất cả"
actionHref:  "/products"
```

### ProductCard — 8 sản phẩm mẫu
```yaml
- id: "p1"
  name: "Khô Gà Lá Chanh Xé Cay"
  price: 55000
  salePrice: 45000
  stock: 12
  imageUrl: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&q=80&w=400&h=400"

- id: "p2"
  name: "Trà Sữa Oolong Nướng Full Topping"
  price: 45000
  salePrice: 35000
  stock: 8
  imageUrl: "https://images.unsplash.com/photo-1558857563-b37102e99e00?auto=format&fit=crop&q=80&w=400&h=400"

- id: "p3"
  name: "Snack Vị Mực Nướng Hàn Quốc"
  price: 38000
  salePrice: null
  stock: 20
  imageUrl: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=400&h=400"

- id: "p4"
  name: "Combo Năng Lượng Coder (3 món)"
  price: 120000
  salePrice: 89000
  stock: 5
  imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=400&h=400"

- id: "p5"
  name: "Bánh Mochi Kem Trà Xanh"
  price: 28000
  salePrice: null
  stock: 0
  imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400&h=400"

- id: "p6"
  name: "Hạt Macca Rang Muối Úc"
  price: 75000
  salePrice: 65000
  stock: 15
  imageUrl: "https://images.unsplash.com/photo-1567892737950-30c4db39a622?auto=format&fit=crop&q=80&w=400&h=400"

- id: "p7"
  name: "Nước Tăng Lực Celcius Dưa Hấu"
  price: 25000
  salePrice: null
  stock: 30
  imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400&h=400"

- id: "p8"
  name: "Trái Cây Tô Sữa Chua Mix"
  price: 45000
  salePrice: 40000
  stock: 3
  imageUrl: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&q=80&w=400&h=400"
```

### SocialProofBanner
```yaml
statNumber: "500+"
message:    "anh em dev đã nạp năng lượng tại TechBite"
```
