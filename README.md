# 🛍️ Modern Enterprise E-Commerce Platform

Một hệ thống Thương mại điện tử Fullstack chuẩn **Enterprise Architecture** được xây dựng với **Next.js 15 (App Router)**, **NestJS**, **Prisma ORM**, **MySQL**, và **Redis**. Giao diện được thiết kế hiện đại, tối ưu trải nghiệm người dùng (UI/UX), chuẩn hóa bảo mật cao và tối ưu hóa hiệu năng theo chuẩn sản xuất.

---

## 🎨 1. Hệ Thống Thiết Kế UI/UX & Design System (UI/UX Showcase)

Toàn bộ giao diện được thiết kế dựa trên Figma Mockup ([`figma-ui/`](file:///d:/vibe_coding/figma-ui)) và Stitch MCP Design Tokens, áp dụng xu hướng UI/UX hiện đại:

### 💎 Quy chuẩn Thiết kế & Aesthetics
- **Bảng màu Tailwind Custom Palette**:
  - `Primary`: Indigo / Dark Blue sang trọng (`#1E293B`, `#3B82F6`)
  - `Accent / Highlight`: Warm Amber / Golden Gold (`#F59E0B`) cho giá bán, voucher và badge khuyến mãi
  - `Background & Surface`: Clean Slate & Pure White với hiệu ứng **Glassmorphic** (nền mờ mượt `backdrop-blur-md`)
- **Typography & Font**: Sử dụng font chữ hiện đại **Inter / Outfit** từ Google Fonts, phân cấp tiêu đề (`h1` - `h6`) rõ ràng.
- **Tương tác & Micro-animations**:
  - Hover Zoom hiệu ứng chuyển động mịn (300ms cubic-bezier) trên các Thẻ sản phẩm (Product Cards).
  - Trạng thái tải nội dung **Skeleton Loading States** dạng nhấp nháy mượt thay cho Spinner xoay truyền thống.
  - Thông báo Toast tương tác (**Toast Notifications**) góc màn hình phản hồi thao tác Thêm giỏ hàng, Cập nhật địa chỉ, Đăng nhập thành công/thất bại.

### 📱 Các Màn Hình & Luồng Trải Nghiệm Người Dùng (User Flows)

| Màn hình / Component | Chi tiết UI/UX & Tính năng |
| :--- | :--- |
| **1. Header & Navigation Bar** | Header cố định (Sticky Navigation), bao gồm Logo, Danh mục thả xuống, Ô tìm kiếm thông minh, Icon Giỏ hàng kèm Badge số lượng thời gian thực và Nút Tài khoản. |
| **2. Ô Tìm kiếm Auto-Suggest** | Tìm kiếm tức thì với Custom Hook `useDebounce` (300ms). Dropdown hiển thị gợi ý danh mục, từ khóa hot và sản phẩm khớp với từ khóa được Highlight `<mark>`. |
| **3. Trang Chủ (Home Page)** | Hero Banner chuyển động carousel, Lưới Danh mục nổi bật, Khối sản phẩm Flash Sale kèm Đồng hồ đếm ngược, Banner khuyến mãi và Footer thông tin thương hiệu. |
| **4. Trang Danh sách & Bộ lọc (`/products`, `/categories/[slug]`)** | Thanh bên (Sidebar) lọc đa chiều: Khoảng giá (Price Slider), Danh mục, Thương hiệu, Sắp xếp (Giá tăng/giảm, Mới nhất, Bán chạy). Tự động đồng bộ URL Params. |
| **5. Trang Chi tiết Sản phẩm (`/products/[id]`)** | Bộ sưu tập ảnh (Image Gallery), Bộ chọn biến thể (Màu sắc, Kích thước), Bộ đếm số lượng thông minh, Bảng thông số chi tiết, Đánh giá sao và Sản phẩm liên quan. |
| **6. Cart Drawer (Slide-over Cart)** | Ngăn kéo Giỏ hàng trượt từ bên phải màn hình khi click icon giỏ hàng, cho phép sửa số lượng, xóa item, xem tổng tiền và chuyển nhanh đến Checkout. |
| **7. Luồng Xác thực (Login / Register)** | Form Đăng nhập & Đăng ký thiết kế dạng Card trung tâm gọn gàng, kiểm tra dữ liệu đầu vào thời gian thực, ẩn/hện mật khẩu và hiển thị lỗi thân thiện. |
| **8. Trang Thanh toán (`/checkout`)** | Tiến trình Checkout 3 bước: 1. Chọn Địa chỉ giao hàng (từ sổ địa chỉ hoặc tạo mới), 2. Chọn Phương thức thanh toán (COD / Chuyển khoản), 3. Nhập mã giảm giá & Xác nhận đơn hàng. |
| **9. Quản lý Tài khoản & Địa chỉ (`/profile`)** | Sổ địa chỉ dạng Card có nút đặt **Địa chỉ mặc định**, Thêm/Sửa/Xóa địa chỉ linh hoạt, Cập nhật thông tin cá nhân và Đổi mật khẩu. |
| **10. Theo dõi Đơn hàng (`/orders`)** | Danh sách đơn hàng sắp xếp theo Tab trạng thái (*Chờ xác nhận, Đang xử lý, Đang giao, Đã giao, Đã hủy*). Tích hợp nút **"Mua lại" (Reorder)** nhanh. |

---

## 🌟 2. Tính Năng Kỹ Thuật (Technical Features)

### 🔐 Hệ thống Xác thực & Bảo mật (Authentication & Security)
- **JWT & Refresh Token Rotation**: Đăng nhập an toàn với Access Token lưu trên bộ nhớ và Refresh Token set trực tiếp vào `Set-Cookie` (`HttpOnly`, `SameSite=Strict`, `Secure`).
- **Redis Blacklist Middleware**: Xác thực token tức thì qua Middleware. Kiểm tra danh sách đen trên Redis trước khi xử lý Request.
- **Mã hóa mật khẩu chuẩn Enterprise**: Sử dụng `bcrypt` với `saltRound = 12`.

### 🛒 Quản lý Giỏ hàng & Đồng bộ dữ liệu (Cart Engine)
- **Zustand Persistent Store**: Giỏ hàng lưu trữ ở Client cho người dùng chưa đăng nhập.
- **Tự động hợp nhất giỏ hàng (Guest Cart Merge)**: Khi khách hàng đăng nhập, giỏ hàng tạm thời sẽ được tự động đồng bộ nguyên vẹn vào Cơ sở dữ liệu server.
- **Kiểm tra tồn kho thời gian thực**: Cập nhật số lượng, xóa sản phẩm, tính toán chiết khấu và phí vận chuyển tự động.

---

## 🛠️ 3. Công Nghệ Sử Dụng (Tech Stack)

### Frontend (`ecommerce-platform/app/frontend`)
- **Framework**: Next.js 15 (App Router - Server & Client Components)
- **Language**: TypeScript (Strict Mode - Zero `any`)
- **Styling**: Tailwind CSS, Vanilla CSS Animation
- **State Management**: Zustand (Client state & Cart persistence)
- **Data Fetching**: Axios, TanStack Query (React Query)

### Backend (`ecommerce-platform/app/backend`)
- **Framework**: NestJS (TypeScript Node.js Framework)
- **ORM & Database**: Prisma ORM, MySQL Database
- **Caching & Blacklist**: Redis (`ioredis` client)
- **Authentication**: `jsonwebtoken`, `bcrypt` (12 salt rounds)
- **Architecture**: Controller-Service-Repository pattern

---

## 📂 4. Cấu Trúc Thư Mục (Project Structure)

```text
vibe-coding/
├── .gitignore
├── README.md
├── figma-ui/                       # Design Mockups HTML/CSS gốc từ Figma
│   ├── index.html                  # Mockup Trang chủ
│   ├── products.html               # Mockup Danh sách sản phẩm
│   └── images/                     # Bộ Banner, Icon & Hình ảnh gốc
├── ui_stitch/                      # Design system & Skill rules từ Stitch MCP
└── ecommerce-platform/             # Mã nguồn chính của ứng dụng
    ├── .docs/                      # Tài liệu thiết kế Hệ thống, Styleguide & API Plans
    └── app/
        ├── backend/                # Server NestJS API
        │   ├── prisma/             # Database Schema (User, Product, Cart, Order, Address)
        │   └── src/                # Modules: Auth, Users, Products, Cart, Orders, Address
        └── frontend/               # Client Next.js App Router
            ├── app/                # Page Routes: (auth), (dashboard), products, categories, checkout, orders
            ├── components/         # Business Components (home, product-list, cart, checkout, profile, search...)
            ├── hooks/              # Custom Hooks (useDebounce, useAuthInit, useProductListNavigation...)
            ├── lib/                # API Services (Axios, Server API, Client API)
            ├── store/              # Zustand Stores (useCartStore, useAuthStore)
            └── types/              # Interface & Type Definitions
```

---

## 🚀 5. Hướng Dẫn Cài Đặt & Khởi Chạy (Getting Started)

### Yêu cầu môi trường (Prerequisites)
- **Node.js**: >= v18.x
- **MySQL**: >= 8.0
- **Redis Server**: >= 6.0

### Khởi chạy Backend (`ecommerce-platform/app/backend`)
```bash
cd ecommerce-platform/app/backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run start:dev
```
*Backend API Server:* `http://localhost:3001`

### Khởi chạy Frontend (`ecommerce-platform/app/frontend`)
```bash
cd ecommerce-platform/app/frontend
npm install
npm run dev
```
*Frontend Application:* `http://localhost:3000`

---

## 🔒 6. Quy Chuẩn Lập Trình & Bảo Mật (Coding Standards)

1. **Chuẩn TypeScript**: Cấm dùng `any`. Định nghĩa `interface`/`type` chặt chẽ cho mọi API Response và Component Props.
2. **Next.js Component Rules**: BẮT BUỘC dùng **Server Component**, chỉ tách về **Client Component** khi thực sự cần thiết.
3. **Hiệu năng & Debounce**: Mọi ô input tìm kiếm/Auto-complete BẮT BUỘC bọc qua custom hook `useDebounce` (trễ 300ms - 500ms).
4. **Token & Redis Security**: 
   - Refresh Token BẮT BUỘC set trong Cookie `HttpOnly`.
   - API Logout & Verify token bắt buộc đi qua Redis Blacklist Middleware.

---

## 📝 Giấy Phép (License)

Dự án được phát triển cho mục đích học tập và triển khai mô hình Thương mại điện tử Enterprise. 

© 2026 **Vibe Coding Team**. All rights reserved.
