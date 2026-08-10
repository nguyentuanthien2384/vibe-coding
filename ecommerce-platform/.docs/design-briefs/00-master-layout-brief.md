# DESIGN BRIEF: BỐ CỤC TOÀN CỤC (MASTER LAYOUT)
> **Phiên bản:** 1.0.0 | **Ngày:** 2026-08-03
> **Dành cho:** AI Render Agent — KHÔNG viết văn xuôi, chỉ đọc spec và vẽ.
> **Nguồn tổng hợp từ:** `00-master-layout-idea.md` + `00-master-layout.md` + `STYLEGUIDE.md`

---

## 1. HỆ THỐNG LƯỚI & BỐ CỤC (LAYOUT SYSTEM)

### 1.1 Root Shell
```
<html> body: bg-gray-50 min-h-screen flex flex-col font-sans antialiased
  └── <RootLayout>
        ├── <Header>       → sticky top-0 z-50 w-full
        ├── <MainContent>  → flex-1 w-full
        └── <Footer>       → w-full
```

### 1.2 Inner Container (Chuẩn toàn dự án)
- Wrapper nội dung: `max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8`
- Áp dụng nhất quán bên trong Header, MainContent, Footer.

### 1.3 Header Layout
```
<header> sticky top-0 z-50 w-full
  └── bg-white border-b border-gray-200
      [khi isHeaderScrolled=true] → thêm shadow-md transition-shadow duration-200
  └── inner: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
      └── flex items-center justify-between h-16 gap-4
            ├── [Logo]          → flex-shrink-0
            ├── [SearchBar]     → flex-1 max-w-xl mx-4   (hidden md:flex)
            └── [HeaderActions] → flex items-center gap-3 flex-shrink-0
```

### 1.4 MainContent Layout
```
<main> flex-1 w-full
  └── max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8
      └── {children}
```

### 1.5 Footer Layout (3 cột, responsive)
```
<footer> bg-slate-900 text-white
  └── max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12
      └── grid gap-8
            Desktop: grid-cols-3
            Tablet:  md:grid-cols-3
            Mobile:  grid-cols-1
          ├── Col 1: [FooterBrand] → (Logo + ContactInfo)
          ├── Col 2: [FooterPolicyLinks]
          └── Col 3: [FooterSocialLinks]
  └── Bottom bar: border-t border-slate-700 mt-8 pt-6
      text-center text-slate-400 text-sm
```

### 1.6 Spacing Chuẩn
| Context | Class |
|---|---|
| Section vertical padding | `py-12` |
| Nội dung horizontal padding | `px-4 sm:px-6 lg:px-8` |
| Gap giữa các cột Footer | `gap-8` |
| Gap các item trong HeaderActions | `gap-3` |
| Chiều cao Header | `h-16` |

---

## 2. ĐẶC TẢ COMPONENT (COMPONENT SPECS — CHỈ [DUMB])

> **Quy ước:** Không có side-effect. Nhận Props và render thuần UI.

---

### 2.1 `Logo` — `components/ui/logo.tsx`

**Variants:**
| Prop `variant` | Dùng ở | Style |
|---|---|---|
| `default` | Header | Chữ `text-slate-900` |
| `white` | Footer (nền tối) | Chữ `text-white` |

**Sizes:**
| Prop `size` | Class |
|---|---|
| `sm` | `text-lg font-bold` |
| `md` (default) | `text-xl font-bold tracking-tight` |
| `lg` | `text-2xl font-bold tracking-tight` |

**Box Style:** Không có background/border. Chỉ là text + SVG icon.
**Hover:** `hover:opacity-80 transition-opacity duration-150`
**Nội dung logo mẫu:** Icon ⚡ + text `"TechBite"` (dùng font bold).

---

### 2.2 `SearchInput` — `components/ui/search-input.tsx`

**Box Style:**
- Container: `relative flex items-center w-full`
- Input: `w-full h-10 pl-10 pr-4 rounded-full border border-gray-300 bg-white text-sm text-slate-800 placeholder:text-slate-400`
- Focus ring: `focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`
- Icon kính lúp: Absolute left, `left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4`
- Loading spinner: hiển thị bên phải thay icon lúp khi `isLoading=true`, dùng `animate-spin`

**Typography:** `text-sm` placeholder `"Tìm kiếm laptop, điện thoại, phụ kiện..."`
**Hover:** `hover:border-gray-400 transition-colors duration-150`

---

### 2.3 `CartBadge` — `components/ui/cart-badge.tsx`

**Box Style:**
- Button wrapper: `relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors duration-150`
- Icon giỏ hàng: `w-6 h-6 text-slate-700`
- Badge số lượng (hiển thị khi `count > 0`):
  - `absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1`
  - `bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center`
  - Animation khi count thay đổi: `animate-bounce` (1 lần)

**Trạng thái `count = 0`:** Badge ẩn hoàn toàn (`hidden`).
**Trạng thái `count > 99`:** Hiển thị `"99+"`.
**Hover:** `hover:bg-gray-100 active:scale-95 transition-all duration-150`

---

### 2.4 `MainContent` — `features/layout/components/main-content.tsx`

**Box Style:** Không có background riêng (kế thừa `bg-gray-50` từ body).
**Class mặc định:** `flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`
**Override:** Prop `className` cho phép page ghi đè (ví dụ: `px-0` cho banner full-bleed).

---

### 2.5 `Footer` — `features/layout/components/footer.tsx`

**Box Style:**
- Wrapper: `bg-slate-900 text-white mt-auto`
- Inner grid: `grid grid-cols-1 md:grid-cols-3 gap-8`
- Bottom bar: `border-t border-slate-700 mt-8 pt-6 text-center text-slate-400 text-sm`

**Không có** hover/active state (static layout).

---

### 2.6 `FooterBrand` — `features/layout/components/footer-brand.tsx`

**Bao gồm:** `Logo` (variant=`white`, size=`md`) + `ContactInfo`
**Spacing:** `flex flex-col gap-4`

---

### 2.7 `ContactInfo` — `features/layout/components/contact-info.tsx`

**Box Style:** `flex flex-col gap-2 text-slate-400 text-sm`
**Từng dòng:** `flex items-start gap-2` (icon + text)
**Icons:** Lucide `MapPin`, `Phone`, `Mail` — `w-4 h-4 flex-shrink-0 text-slate-500 mt-0.5`
**Typography:** `text-sm leading-relaxed`
**Hover (từng link email/phone):** `hover:text-white transition-colors duration-150`

---

### 2.8 `FooterPolicyLinks` — `features/layout/components/footer-policy-links.tsx`

**Box Style:** `flex flex-col gap-3`
**Tiêu đề cột:** `text-white font-semibold text-sm uppercase tracking-wider mb-1`
**Từng link:** `text-slate-400 text-sm hover:text-white transition-colors duration-150`

---

### 2.9 `FooterSocialLinks` — `features/layout/components/footer-social-links.tsx`

**Box Style:** `flex flex-col gap-4`
**Tiêu đề cột:** `text-white font-semibold text-sm uppercase tracking-wider mb-1`

**Social Icons row:** `flex items-center gap-3`
- Từng icon button: `w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center hover:bg-orange-600 transition-colors duration-200`
- Icon size: `w-4 h-4 text-white`

**App Store buttons:** `flex flex-col gap-2 mt-2`
- Button style: `inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors duration-150 text-white text-xs font-medium`

---

## 3. RÀNG BUỘC MÀU SẮC (COLOR CONSTRAINTS)

> **TUYỆT ĐỐI KHÔNG** dùng mã HEX/RGB tự chế.

| Vai trò | Tailwind Class | Ghi chú |
|---|---|---|
| **Màu chốt sale (Primary CTA)** | `bg-orange-600` / `text-orange-600` | CHỈ dùng nút "Thêm vào giỏ", "Thanh toán" |
| **CartBadge background** | `bg-orange-600` | Nổi bật trên header trắng |
| **Secondary Action** | `bg-slate-900 text-white` | Nút Đăng nhập, phân loại |
| **Header background** | `bg-white` | + `border-b border-gray-200` |
| **Header shadow (scrolled)** | `shadow-md` | Thêm khi `isHeaderScrolled=true` |
| **Page background** | `bg-gray-50` | Nền toàn trang |
| **Footer background** | `bg-slate-900` | Nền tối footer |
| **Footer text muted** | `text-slate-400` | Info phụ, link mặc định |
| **Footer text default** | `text-white` | Tiêu đề cột, hover link |
| **Footer divider** | `border-slate-700` | Đường kẻ bottom bar |
| **Footer social icon bg** | `bg-slate-700` / hover: `bg-orange-600` | Icon mạng xã hội |
| **SearchInput border** | `border-gray-300` / focus: `ring-orange-500` | Focus ring màu cam |
| **SearchInput placeholder** | `placeholder:text-slate-400` | |
| **Logo text (header)** | `text-slate-900` | |
| **Logo text (footer)** | `text-white` | |
| **Icon màu mặc định** | `text-slate-700` | Cart icon, nav icons |
| **Icon màu muted** | `text-slate-400` | Search icon, contact icons |

---

## 4. MOCK DATA (DỮ LIỆU HIỂN THỊ MẪU)

### 4.1 Logo
```
Icon: ⚡ (hoặc SVG bolt/lightning)
Text: "TechBite"
```

### 4.2 SearchInput Placeholder
```
"Tìm kiếm laptop, điện thoại, phụ kiện..."
```

### 4.3 CartBadge
```
count: 3
```

### 4.4 ContactInfo
```
address: "123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh"
phone:   "1800 1234 (Miễn phí)"
email:   "hotro@techbite.vn"
```

### 4.5 FooterPolicyLinks
```javascript
links: [
  { label: "Về chúng tôi",          href: "/about" },
  { label: "Chính sách bảo mật",    href: "/privacy" },
  { label: "Điều khoản sử dụng",    href: "/terms" },
  { label: "Chính sách đổi trả",    href: "/returns" },
  { label: "Hướng dẫn mua hàng",    href: "/guide" },
]
```

### 4.6 FooterSocialLinks
```javascript
socialLinks: [
  { platform: "facebook",  href: "https://facebook.com/techbite",  label: "Facebook TechBite" },
  { platform: "instagram", href: "https://instagram.com/techbite", label: "Instagram TechBite" },
  { platform: "youtube",   href: "https://youtube.com/@techbite",  label: "YouTube TechBite" },
  { platform: "tiktok",    href: "https://tiktok.com/@techbite",   label: "TikTok TechBite" },
]
appStoreUrl:    "https://apps.apple.com/techbite"
googlePlayUrl:  "https://play.google.com/techbite"
```

### 4.7 Footer Copyright (Bottom Bar)
```
"© 2026 TechBite. Bảo lưu mọi quyền."
```

### 4.8 AuthButton (Mẫu trạng thái chưa đăng nhập)
```
Text:  "Đăng nhập"
Style: bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg
Hover: hover:bg-slate-700 transition-colors duration-150
```

---

## 5. RÀNG BUỘC UX (UX CONSTRAINTS)

| Rule | Mô tả |
|---|---|
| **Header Sticky** | `sticky top-0 z-50` — luôn hiển thị khi cuộn |
| **Header Shadow** | Chỉ xuất hiện khi `isHeaderScrolled === true` (`shadow-md`) |
| **Cart Drawer** | Slide từ phải sang (`translate-x-full` → `translate-x-0`), KHÔNG navigate trang mới |
| **Mobile SearchBar** | Ẩn trên mobile (`hidden md:flex`), mở qua icon search riêng |
| **Footer cột** | Collapse xuống `grid-cols-1` trên mobile |
| **Transition chuẩn** | `transition-all duration-200 ease-in-out` cho mọi interactive element |
