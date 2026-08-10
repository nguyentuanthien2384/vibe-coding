# 🛍️ Modern Enterprise E-Commerce Platform

Một hệ thống Thương mại điện tử Fullstack chuẩn **Enterprise Architecture** được xây dựng với **Next.js (App Router)**, **NestJS**, **Prisma ORM**, **MySQL**, và **Redis**. Giao diện được thiết kế hiện đại, tối ưu trải nghiệm người dùng (UI/UX), chuẩn hóa bảo mật cao và tối ưu hóa hiệu năng theo chuẩn sản xuất.

---

## 🌟 Tính Năng Nổi Bật (Key Features)

### 🎨 1. Giao diện & Trải nghiệm Người dùng (UI/UX)
- **Thiết kế theo chuẩn Figma & Stitch**: Đồng bộ Design Tokens, màu sắc hài hòa (Tailwind CSS custom palette), typography hiện đại.
- **Tối ưu hiển thị (Responsive First)**: Tương thích hoàn hảo từ giao diện Mobile, Tablet cho đến Desktop màn hình rộng.
- **Micro-animations & Skeleton Loaders**: Trạng thái tải trang mịn màng với hiệu ứng Skeleton, Toast Notifications và Backdrop mượt mà.
- **Trạng thái tìm kiếm thông minh**: Ô tìm kiếm Debounce (300ms) kèm Dropdown gợi ý tự động (Auto-suggest) theo từ khóa và danh mục.

### 🔐 2. Hệ thống Xác thực & Bảo mật (Authentication & Security)
- **JWT & Refresh Token Rotation**: Đăng nhập an toàn với Access Token lưu trên bộ nhớ và Refresh Token set trực tiếp vào `Set-Cookie` (`HttpOnly`, `SameSite=Strict`, `Secure`).
- **Redis Blacklist Middleware**: Xác thực token tức thì qua Middleware. Kiểm tra danh sách đen trên Redis trước khi xử lý Request.
- **Mã hóa mật khẩu chuẩn Enterprise**: Sử dụng `bcrypt` với `saltRound = 12`.

### 🛒 3. Quản lý Giỏ hàng & Đồng bộ dữ liệu (Cart Engine)
- **Zustand Persistent Store**: Giỏ hàng lưu trữ ở Client cho người dùng chưa đăng nhập.
- **Tự động hợp nhất giỏ hàng (Guest Cart Merge)**: Khi khách hàng đăng nhập, giỏ hàng tạm thời sẽ được tự động đồng bộ nguyên vẹn vào Cơ sở dữ liệu server.
- **Kiểm tra tồn kho thời gian thực**: Cập nhật số lượng, xóa sản phẩm, tính toán chiết khấu và phí vận chuyển tự động.

### 📦 4. Lọc Sản phẩm & Tìm kiếm Nâng cao (Catalog & Filtering)
- **Lọc đa tiêu chí**: Lọc theo Danh mục (`/categories/[slug]`), Khoảng giá (Price range slider), Thương hiệu, Đánh giá và Sắp xếp (Mới nhất, Giá tăng/giảm, Bán chạy).
- **Trang Chi tiết Sản phẩm (`/products/[id]`)**: Album ảnh sản phẩm, thông số kỹ thuật chi tiết, bộ chọn biến thể (size, màu sắc), đếm tồn kho thực tế và đánh giá từ khách hàng.

### 📍 5. Sổ địa chỉ & Tiến trình Thanh toán (Address Book & Checkout)
- **Quản lý đa địa chỉ**: Thêm, sửa, xóa và thiết lập Địa chỉ mặc định trong trang cá nhân (`/profile`).
- **Thanh toán linh hoạt**: Chọn địa chỉ giao hàng ngay tại trang Checkout, áp dụng Mã giảm giá (Voucher), chọn phương thức thanh toán (COD / Chuyển khoản).

### 🚚 6. Theo dõi Đơn hàng (Order Tracking)
- **Trạng thái đơn hàng thời gian thực**: Quản lý lịch sử mua hàng với các trạng thái rõ ràng: *Chờ xác nhận, Đang xử lý, Đang giao, Đã giao, Đã hủy*.
- **Mua lại nhanh (Reorder)**: Cho phép đưa toàn bộ sản phẩm của đơn hàng cũ vào giỏ hàng chỉ với 1 cú click.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

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

## 📂 Cấu Trúc Thư Mục (Project Structure)

```text
vibe-coding/
├── .gitignore
├── README.md
├── figma-ui/                       # Mockup UI HTML/CSS xuất từ Figma
├── ui_stitch/                      # Design system & Prompt skills từ Stitch MCP
└── ecommerce-platform/             # Mã nguồn chính của ứng dụng
    ├── .docs/                      # Tài liệu thiết kế Hệ thống & API Plans
    └── app/
        ├── backend/                # Server NestJS
        │   ├── prisma/             # Database Schema & Migrations
        │   └── src/
        │       ├── auth/           # Auth Module (JWT, Redis Blacklist)
        │       ├── users/          # User & Address Management
        │       ├── products/       # Products & Categories API
        │       ├── cart/           # Cart Engine API
        │       └── orders/         # Order & Checkout API
        └── frontend/               # Client Next.js App Router
            ├── app/
            │   ├── (auth)/         # Group route: Login, Register
            │   ├── (dashboard)/    # Group route: Profile, Addresses
            │   ├── categories/     # Category listing page
            │   ├── products/       # Product list & Product detail page
            │   ├── checkout/       # Checkout process
            │   └── orders/         # Order history & status tracking
            ├── components/         # Reusable UI & Business components
            ├── hooks/              # Custom React Hooks (useDebounce, etc.)
            ├── lib/                # API Client Services (Axios / Fetch)
            ├── store/              # Zustand Stores (Cart, Auth state)
            └── types/              # TypeScript Type Definitions
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy (Getting Started)

### Yêu cầu môi trường (Prerequisites)
- **Node.js**: >= v18.x
- **MySQL**: >= 8.0
- **Redis Server**: >= 6.0

### 1. Khởi chạy Backend (`ecommerce-platform/app/backend`)

```bash
cd ecommerce-platform/app/backend

# Cài đặt thư viện
npm install

# Cấu hình môi trường (.env)
cp .env.example .env
# Chỉnh sửa DATABASE_URL và REDIS_URL trong file .env

# Chạy Migration Database
npx prisma migrate dev --name init

# Khởi tạo dữ liệu mẫu (nếu có)
npx prisma db seed

# Khởi chạy Server ở chế độ Development
npm run start:dev
```
*Backend Server sẽ chạy tại:* `http://localhost:3001`

### 2. Khởi chạy Frontend (`ecommerce-platform/app/frontend`)

```bash
cd ecommerce-platform/app/frontend

# Cài đặt thư viện
npm install

# Cấu hình môi trường (.env.local)
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Khởi chạy Next.js ở chế độ Development
npm run dev
```
*Frontend App sẽ chạy tại:* `http://localhost:3000`

---

## 🔒 Quy Chuẩn Lập Trình & Bảo Mật (Standards)

1. **Chuẩn TypeScript**: Cấm dùng `any`. Định nghĩa `interface`/`type` chặt chẽ cho mọi API Response và Component Props.
2. **Next.js Component Rules**: Ưu tiên tối đa **Server Component**. Chỉ tách về **Client Component** khi cần xử lý tương tác UI hoặc gọi State Client.
3. **Debounce Search**: Toàn bộ ô nhập tìm kiếm/Auto-complete bắt buộc bọc qua `useDebounce` hook (độ trễ 300ms - 500ms).
4. **Token Security**: 
   - Không bao giờ lưu token nhạy cảm trong `localStorage`.
   - Token thu hồi (Logout) sẽ được ghi vào **Redis Blacklist** với thời gian sống (TTL) bằng thời hạn còn lại của JWT.

---

## 📝 Giấy Phép (License)

Dự án được phát triển cho mục đích học tập và triển khai mô hình Thương mại điện tử Enterprise. 

© 2026 **Vibe Coding Team**. All rights reserved.
