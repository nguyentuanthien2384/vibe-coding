# 🛍️ Modern Enterprise E-Commerce Platform

Một hệ thống Thương mại điện tử Fullstack chuẩn **Enterprise Architecture** gồm 3 ứng dụng chính: **Customer Storefront (`app/frontend`)**, **Admin Dashboard (`app/dash/my-app`)**, và **Backend API (`app/backend`)**. Được xây dựng với **Next.js 15/16 (App Router)**, **NestJS**, **Prisma ORM**, **MySQL**, và **Redis**. Giao diện được thiết kế hiện đại, tối ưu trải nghiệm người dùng (UI/UX), chuẩn hóa bảo mật cao và tối ưu hóa hiệu năng theo chuẩn sản xuất.

---

## 🎨 1. Hệ Thống Thiết Kế UI/UX & Design System (UI/UX Showcase)

Toàn bộ giao diện được thiết kế dựa trên Figma Mockup (`.docs/ui-mockups/`), Stitch MCP Design Tokens, áp dụng xu hướng UI/UX hiện đại:

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

#### A. Customer Storefront (`app/frontend`)
| Màn hình / Component | Chi tiết UI/UX & Tính năng |
| :--- | :--- |
| **1. Header & Navigation Bar** | Header cố định (Sticky Navigation), bao gồm Logo, Danh mục thả xuống, Ô tìm kiếm thông minh, Icon Giỏ hàng kèm Badge số lượng thời gian thực và Nút Tài khoản. |
| **2. Ô Tìm kiếm Auto-Suggest** | Tìm kiếm tức thì với Custom Hook `useDebounce` (300ms). Dropdown hiển thị gợi ý danh mục, từ khóa hot và sản phẩm khớp với từ khóa được Highlight `<mark>`. |
| **3. Trang Chủ (Home Page)** | Hero Banner chuyển động carousel, Lưới Danh mục nổi bật, Khối sản phẩm Flash Sale kèm Đồng hồ đếm ngược, Banner khuyến mãi và Footer thông tin thương hiệu. |
| **4. Trang Danh sách & Bộ lọc (`/products`, `/categories/[slug]`)** | Thanh bên (Sidebar) lọc đa chiều: Khoảng giá (Price Slider), Danh mục, Thương hiệu, Sắp xếp (Giá tăng/giảm, Mới nhất, Bán chạy). Tự động đồng bộ URL Params. |
| **5. Trang Chi tiết Sản phẩm (`/products/[id]`)** | Bộ sưu tập ảnh (Image Gallery), Bộ chọn biến thể (Màu sắc, Kích thước), Bộ đếm số lượng thông minh, Bảng thông số chi tiết, Đánh giá sao và Sản phẩm liên quan. |
| **6. Cart Drawer (Slide-over Cart)** | Ngăn kéo Giỏ hàng trượt từ bên phải màn hình khi click icon giỏ hàng, cho phép sửa số lượng, xóa item, xem tổng tiền và chuyển nhanh đến Checkout. |
| **7. Luồng Xác thực (Login / Register)** | Form Đăng nhập & Đăng ký thiết kế dạng Card trung tâm gọn gàng, kiểm tra dữ liệu đầu vào thời gian thực, ẩn/hện mật khẩu và hiển thị lỗi thân thiện. |
| **8. Trang Thanh toán (`/checkout`)** | Tiến trình Checkout 3 bước: 1. Chọn Địa chỉ giao hàng (từ sổ địa chỉ hoặc tạo mới), 2. Chọn Phương thức thanh toán (COD / Chuyển khoản VietQR), 3. Nhập mã giảm giá & Xác nhận đơn hàng. |
| **9. Quản lý Tài khoản & Địa chỉ (`/profile`)** | Sổ địa chỉ dạng Card có nút đặt **Địa chỉ mặc định**, Thêm/Sửa/Xóa địa chỉ linh hoạt, Cập nhật thông tin cá nhân và Đổi mật khẩu. |
| **10. Theo dõi Đơn hàng (`/orders`)** | Danh sách đơn hàng sắp xếp theo Tab trạng thái (*Chờ xác nhận, Đang xử lý, Đang giao, Đã giao, Đã hủy*). Tích hợp nút **"Mua lại" (Reorder)** nhanh. |

#### B. Admin Dashboard (`app/dash/my-app`)
| Màn hình / Component | Chi tiết UI/UX & Tính năng |
| :--- | :--- |
| **1. Admin Master Layout Shell** | Cấu trúc Layout gồm Sidebar điều hướng thu/phóng (Collapsible Sidebar), Admin Header với Thanh tìm kiếm nhanh, Notification Bell Popover, User Avatar Popover và Breadcrumb Nav linh hoạt. |
| **2. Quản lý Chuyên mục (`/categories`)** | Bảng danh mục sản phẩm kèm Status Badge (*Hoạt động / Ẩn*), ô tìm kiếm `useDebounce`, Modal Thêm/Sửa chuyên mục tự động sinh Slug chuẩn SEO, Modal xác nhận Xóa an toàn và Phân trang (Pagination). |
| **3. Quản lý Sản phẩm (`/products`)** | Bảng danh sách sản phẩm hiển thị Ảnh thumbnail món ăn, tên & slug, giá gốc & giá KM, số lượng tồn kho (stock), tên chuyên mục (click để lọc nhanh), Modal Thêm/Sửa sản phẩm và Modal Xóa. |
| **4. Quản lý Đơn hàng & Khách hàng** | Giao diện theo dõi danh sách đơn hàng, thay đổi trạng thái đơn, quản lý tài khoản người dùng và phân quyền quản trị. |

---

## 🌟 2. Tính Năng Kỹ Thuật (Technical Features)

### 🔐 Hệ thống Xác thực & Bảo mật (Authentication & Security)
- **JWT & Refresh Token Rotation**: Đăng nhập an toàn với Access Token lưu trên bộ nhớ và Refresh Token set trực tiếp vào `Set-Cookie` (`HttpOnly`, `SameSite=Lax`, `Secure`).
- **Redis Blacklist Middleware**: Xác thực token tức thì qua Middleware. Kiểm tra danh sách đen trên Redis trước khi xử lý Request.
- **Mã hóa mật khẩu chuẩn Enterprise**: Sử dụng `bcrypt` với `saltRound = 12`.
- **Chống Replay Attack & Đổi mật khẩu Multi-device**: Thu hồi toàn bộ Refresh Token trên mọi thiết bị ngay khi đổi mật khẩu thành công.

### 🛒 Quản lý Giỏ hàng & Đồng bộ dữ liệu (Cart Engine)
- **Zustand Persistent Store**: Giỏ hàng lưu trữ ở Client cho người dùng chưa đăng nhập.
- **Tự động hợp nhất giỏ hàng (Guest Cart Merge)**: Khi khách hàng đăng nhập, giỏ hàng tạm thời sẽ được tự động đồng bộ nguyên vẹn vào Cơ sở dữ liệu server.
- **Kiểm tra tồn kho thời gian thực**: Cập nhật số lượng, xóa sản phẩm, tính toán chiết khấu và phí vận chuyển tự động.

---

## 🛠️ 3. Công Nghệ Sử Dụng (Tech Stack)

### Customer Storefront (`app/frontend`) & Admin Dashboard (`app/dash/my-app`)
- **Framework**: Next.js 15/16 (App Router - Server & Client Components)
- **Language**: TypeScript (Strict Mode - Zero `any`)
- **Styling**: Tailwind CSS v4, Vanilla CSS Animation
- **State Management**: Zustand (Client state, Auth store & Sidebar store)
- **Data Fetching**: Axios, TanStack Query (React Query)
- **Icons**: Lucide React Icons

### Backend (`app/backend`)
- **Framework**: NestJS (TypeScript Node.js Framework)
- **ORM & Database**: Prisma ORM, MySQL Database
- **Caching & Blacklist**: Redis (`ioredis` client)
- **Authentication**: `jsonwebtoken`, `bcrypt` (12 salt rounds)
- **Architecture**: Controller-Service-Repository pattern

---

## 📂 4. Cấu Trúc Thư Mục (Project Structure)

```text
ecommerce-platform/
├── .docs/                          # Tài liệu kỹ thuật, Ý tưởng UI & Plan thiết kế
│   ├── ARCHITECTURE.md             # Sơ đồ kiến trúc Hệ thống & Database Specs
│   ├── FEATURES_DONE.md            # Nhật ký hoàn thành tính năng theo mốc thời gian
│   ├── STYLEGUIDE.md               # Quy chuẩn màu sắc, font chữ & UI design tokens
│   ├── ideas/dashboard/            # Tài liệu phân tích ý tưởng UI các màn hình Admin
│   └── ui-mockups/                 # File HTML/Assets thiết kế gốc của Dashboard & Shop
├── app/
│   ├── backend/                    # NestJS API Backend Server
│   │   ├── prisma/                 # Prisma Schema (User, Product, Category, Order, Address)
│   │   └── src/                    # Modules: Auth, Users, Products, Categories, Cart, Orders, Address
│   ├── frontend/                   # Customer Storefront Next.js App Router (Port 3000)
│   │   ├── app/                    # Routes: (auth), products, categories, checkout, orders, profile
│   │   ├── components/             # Components: home, product-detail, cart, checkout, profile...
│   │   └── lib/                    # API Services, Axios Interceptors, Server/Client API
│   └── dash/my-app/                # Admin Dashboard Next.js App Router (Port 3001)
│       ├── app/                    # Routes: (dashboard)/dashboard, /categories, /products
│       ├── components/layout/      # Admin Layout Shell, Sidebar, Header, Breadcrumbs
│       ├── features/               # Modules: categories, products, notifications, auth, profile
│       └── store/                  # Zustand stores: sidebar.store, admin-auth.store
└── README.md
```

---

## 🚀 5. Hướng Dẫn Cài Đặt & Khởi Chạy (Getting Started)

### Yêu cầu môi trường (Prerequisites)
- **Node.js**: >= v18.x
- **MySQL**: >= 8.0
- **Redis Server**: >= 6.0

### Khởi chạy Backend Server (`app/backend`)
```bash
cd app/backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run db:seed
npm run start:dev
```
*Backend API Server Running at:* `http://localhost:3001`

### Khởi chạy Customer Storefront (`app/frontend`)
```bash
cd app/frontend
npm install
npm run dev
```
*Customer Storefront Running at:* `http://localhost:3000`

### Khởi chạy Admin Dashboard (`app/dash/my-app`)
```bash
cd app/dash/my-app
npm install
npm run dev
```
*Admin Dashboard Running at:* `http://localhost:3001` (hoặc `http://localhost:3002` nếu chạy đồng thời)

---

## 🔒 6. Quy Chuẩn Lập Trình & Bảo Mật (Coding Standards)

1. **Chuẩn TypeScript**: Cấm dùng `any`. Định nghĩa `interface`/`type` chặt chẽ cho mọi API Response và Component Props.
2. **Next.js Component Rules**: BẮT BUỘC dùng **Server Component**, chỉ tách về **Client Component** khi thực sự cần thiết.
3. **Hiệu năng & Debounce**: Mọi ô input tìm kiếm/Auto-complete BẮT BUỘC bọc qua custom hook `useDebounce` (trễ 300ms - 500ms).
4. **Token & Redis Security**: 
   - Refresh Token BẮT BUỘC set trong Cookie `HttpOnly`.
   - API Logout & Verify token bắt buộc đi qua Redis Blacklist Middleware.
5. **Phân tách Logic & UI**: UI Components phải là Dumb Components (chỉ nhận props, không gọi trực tiếp API phức tạp).

---

## 📝 Giấy Phép (License)

Dự án được phát triển cho mục đích học tập và triển khai mô hình Thương mại điện tử Enterprise. 

© 2026 **Vibe Coding Team**. All rights reserved.

