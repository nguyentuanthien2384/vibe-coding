# 🛠️ TechBite E-Commerce — Admin Dashboard (`app/dash/my-app`)

Ứng dụng Quản trị Hệ thống (Admin Dashboard) được xây dựng trên nền tảng **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **TypeScript** và **Zustand**.

---

## 🎨 Giao diện UI/UX & Các tính năng

- **Master Layout Shell**:
  - Sidebar co giãn (Collapsible Sidebar) với trạng thái lưu trong `Zustand`.
  - Header tích hợp Thanh tìm kiếm nhanh, Popover Thông báo (Notification Bell Popover) và Popover Hồ sơ Quản trị viên (Profile Dropdown).
  - Thanh điều hướng Breadcrumb đồng bộ theo URL Route.
- **Quản lý Chuyên mục (`/categories`, `/category`)**:
  - Bảng hiển thị chuyên mục kèm Status Badge (`Hoạt động` / `Ẩn`).
  - Thanh lọc tìm kiếm có tích hợp custom hook `useDebounce` (300ms) tối ưu hiệu năng.
  - Modal Thêm / Sửa chuyên mục tự sinh Slug tự động chuẩn SEO.
  - Modal Xác nhận xóa an toàn.
  - Phân trang chuẩn UI.
- **Quản lý Sản phẩm (`/products`, `/product`)**:
  - Bảng danh sách sản phẩm hiển thị Ảnh thumbnail, tên sản phẩm, slug, giá gốc, giá khuyến mãi, tồn kho (stock) và nhãn chuyên mục.
  - Bộ lọc theo Trạng thái & Chuyên mục.
  - Modal Thêm/Sửa/Xóa sản phẩm.

---

## 🚀 Khởi chạy ứng dụng

```bash
# Di chuyển vào thư mục dự án
cd app/dash/my-app

# Cài đặt các thư viện phụ thuộc
npm install

# Khởi chạy dev server
npm run dev
```

Mở trình duyệt tại: [http://localhost:3001](http://localhost:3001) (hoặc `http://localhost:3002`).

---

## 🏗️ Cấu trúc thư mục

```text
app/dash/my-app/
├── app/
│   ├── (dashboard)/        # Main Layout Shell & Admin Pages
│   │   ├── categories/     # Trang Quản lý Chuyên mục
│   │   ├── products/       # Trang Quản lý Sản phẩm
│   │   ├── dashboard/      # Trang Tổng quan Dashboard
│   │   └── layout.tsx      # Master Layout Server Component
│   ├── globals.css         # CSS Tokens & Tailwind Setup
│   └── layout.tsx          # Root Layout
├── components/
│   ├── layout/             # Sidebar, Header, BreadcrumbNav, SearchBar
│   └── ui/                 # Reusable UI components (Notification, Avatar...)
├── features/
│   ├── categories/         # Modals, Tables, Forms, Hooks của Category
│   └── products/           # Modals, Tables, Forms, Hooks của Product
├── store/                  # Zustand stores (sidebar.store, admin-auth.store)
└── types/                  # TypeScript Interface & Type Definitions
```
