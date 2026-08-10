# DESIGN BRIEF: AUTHENTICATION & USER PROFILE

- Xây dưng
> **Nguồn Quy Hoạch:** `.docs/frontend-plans/06-auth-plan.md`
> **Nguồn Ý Tưởng:** `.docs/ideas/06-auth-idea.md`
> **Ràng Buộc Quy Chuẩn:** `.docs/STYLEGUIDE.md`, `.agent/AGENTS.md`

---

## 1. HỆ THỐNG LƯỚI & KHUNG HIỂN THỊ (LAYOUT & VIEWPORT)
- Xây dưng màn hình desktop
### 1.1 Màn hình Đăng nhập & Đăng ký (`/login`, `/register`)
- **Bố cục khung trang (Auth Page Wrapper):**
  - Căn giữa tuyệt đối màn hình theo cả 2 chiều: `min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 bg-gray-50`.
  - Giới hạn chiều rộng khung Auth Card: `w-full max-w-md mx-auto`.
- **Khung Card chứa Form (`auth-card-wrapper.tsx`):**
  - Container style: `bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 w-full flex flex-col`.
  - Khoảng cách các thành phần bên trong: `space-y-6`.

### 1.2 Màn hình Hồ sơ Cá nhân (`/profile`)
- **Bố cục tổng thể (Profile Page Layout):**
  - Khung giới hạn: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-gray-50 min-h-screen`.
  - Cấu trúc lưới 2 cột Responsive: `grid grid-cols-1 lg:grid-cols-4 gap-8 items-start`.
  - **Cột trái (Sidebar Nav):** `lg:col-span-1 sticky top-24`.
  - **Cột phải (Nội dung Tab):** `lg:col-span-3 min-w-0`.

### 1.3 Menu Người dùng trên Header (`user-nav-menu.tsx`)
- **Vị trí hiển thị:** Góc phải Header bên cạnh Cart Drawer Icon.
- **Trạng thái chưa đăng nhập (Guest):** Hiển thị Nút "Đăng nhập" gọn gàng (`hidden sm:inline-flex items-center gap-2`).
- **Trạng thái đã đăng nhập (Authenticated):** Hiển thị Lời chào `"Xin chào, {Name}"` + Avatar hình tròn có Dropdown Menu trượt xuống khi click.

---

## 2. ĐẶC TẢ COMPONENT UI (COMPONENT SPECS)

### 2.1 `auth-card-wrapper.tsx` [DUMB]
- **Logo Block:**
  - Căn giữa trên cùng card: `flex justify-center mb-2`.
  - TechBite Badge Icon / Logo: `w-12 h-12 bg-orange-100 text-orange-600 font-extrabold rounded-2xl flex items-center justify-center text-xl shadow-inner`.
- **Header Typography:**
  - Title: `text-2xl font-extrabold text-slate-900 tracking-tight text-center`.
  - Subtitle: `text-sm text-slate-500 text-center mt-1.5`.

---

### 2.2 `login-form.tsx` [DUMB]
- **Form Layout:** `space-y-4 w-full`.
- **Input Group Structure:**
  - Label Style: `block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5`.
  - Input Style: `w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm outline-none font-medium`.
  - Input Error State: `border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500/10`.
  - Error Text Below Input: `text-xs text-red-600 font-medium mt-1 flex items-center gap-1`.
- **Server Error Alert Box:**
  - Container: `p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold flex items-center gap-2.5 animate-fadeIn`.
- **Submit Call-To-Action Button:**
  - **Ràng buộc Yêu cầu:** Chỉ hiển thị **DUY NHẤT 1 nút đăng nhập**.
  - Style: `w-full bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-semibold py-3.5 rounded-xl shadow-md shadow-orange-600/20 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`.
  - Loading State: Spinner quay nhẹ (`w-4 h-4 text-white animate-spin`).

---

### 2.3 `register-form.tsx` [DUMB]
- **Form Layout:** `space-y-3.5 w-full`.
- **Input Fields List:**
  1. Họ và tên (`name`)
  2. Địa chỉ Email (`email`)
  3. Số điện thoại (`phone`)
  4. Mật khẩu (`password`)
  5. Xác nhận mật khẩu (`confirmPassword`)
- **Input Control Style:** Tương tự `login-form.tsx` với thiết kế bo góc `rounded-xl`.
- **Submit Call-To-Action Button:**
  - Style: `w-full bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-semibold py-3.5 rounded-xl shadow-md shadow-orange-600/20 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60`.

---

### 2.4 `auth-footer-link.tsx` [DUMB]
- **Box Style:** `mt-6 pt-6 border-t border-gray-100 text-center text-sm text-slate-500`.
- **Prompt Text:** `"Chưa có tài khoản?"` hoặc `"Đã có tài khoản?"`.
- **Action Link:** `font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors ml-1.5`.

---

### 2.5 `user-nav-menu.tsx` [SMART/DUMB]
- **Trạng thái Guest (Chưa Đăng Nhập):**
  - Button "Đăng nhập": `bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2`.
- **Trạng thái Authenticated (Đã Đăng Nhập):**
  - **Greeting Text:** `text-sm font-bold text-slate-800 hidden md:inline-block max-w-[140px] truncate` → `"Xin chào, {name}"`.
  - **Avatar Button:** `w-9 h-9 rounded-full bg-orange-100 border-2 border-orange-200 text-orange-600 font-extrabold text-sm flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-sm`.
  - **Dropdown Box:**
    - Style: `absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn origin-top-right`.
    - User Info Header: `px-4 py-3 border-b border-gray-100 bg-gray-50/50`.
      - Name: `text-sm font-bold text-slate-900 truncate`.
      - Email: `text-xs text-slate-500 truncate`.
    - Menu Items: `w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors`.
    - Logout Button Item: `w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1 pt-2.5`.

---

### 2.6 `profile-sidebar.tsx` [DUMB]
- **Container Box:** `bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col space-y-6`.
- **User Avatar Header:**
  - Avatar Box: `w-20 h-20 rounded-full bg-orange-100 text-orange-600 font-extrabold text-2xl flex items-center justify-center border-4 border-orange-200 mx-auto shadow-inner`.
  - Display Name: `text-lg font-bold text-slate-900 text-center mt-3`.
  - User Email: `text-xs text-slate-500 text-center`.
- **Navigation Tabs List (`space-y-1.5`):**
  - Normal Tab: `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-gray-50 hover:text-slate-900 transition-all cursor-pointer`.
  - Active Tab: `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-orange-600 bg-orange-50 border-l-4 border-orange-600 shadow-sm`.
- **Logout Action:**
  - Nút Đăng xuất màu đỏ ở dưới cùng: `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors w-full cursor-pointer border-t border-gray-100 pt-4 mt-2`.

---

### 2.7 `profile-info-card.tsx` [DUMB]
- **Card Box:** `bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6`.
- **Section Title:** `text-xl font-extrabold text-slate-900 border-b border-gray-100 pb-4 flex items-center justify-between`.
- **Info Grid:** `grid grid-cols-1 sm:grid-cols-2 gap-5`.
- **Readonly Info Field:**
  - Box: `p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1`.
  - Label: `text-xs font-bold text-slate-400 uppercase tracking-wider`.
  - Value: `text-sm font-semibold text-slate-800`.

---

### 2.8 `order-history-list.tsx` [DUMB]
- **Order Card Item:** `bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4 hover:border-orange-200 transition-all`.
- **Order Header:** `flex items-center justify-between border-b border-gray-100 pb-3`.
  - Code: `text-sm font-bold text-slate-900` (`#TB-88923`).
  - Status Badges:
    - `PAID` (Đã thanh toán): `bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full`.
    - `PENDING` (Chờ xử lý): `bg-amber-50 text-amber-600 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full`.
    - `SHIPPED` (Đang giao hàng): `bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full`.
    - `CANCELLED` (Đã hủy): `bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold px-3 py-1 rounded-full`.
- **Order Total Price:** `text-base font-extrabold text-red-600`.

---

## 3. RÀNG BUỘC MÀU SẮC (COLOR CONSTRAINTS)

Tuân thủ tuyệt đối quy định trong `STYLEGUIDE.md`:

- **Primary Action (Call-To-Action Đăng nhập / Đăng ký):** `bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white shadow-orange-600/20`.
- **Secondary Action (Guest Login / Phân loại / Detail):** `bg-slate-900 hover:bg-slate-800 text-white`.
- **Page Background:** `bg-gray-50`.
- **Card Background & Border:** `bg-white border-gray-100 rounded-2xl shadow-sm`.
- **Focus Ring:** `focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10`.
- **Danger Action / Alert Lỗi:** `text-red-600`, `bg-red-50`, `border-red-200`.

---

## 4. HIỆU ỨNG TƯƠNG TÁC (MICRO-ANIMATIONS)

- **Button Active Feedback:** Bấm nút Call-to-Action nhún nhẹ (`active:scale-[0.99] transition-transform`).
- **Dropdown Animation:** Menu dropdown xuất hiện mượt với `animate-fadeIn duration-200 origin-top-right`.
- **Card Hover Elevation:** Thẻ Đơn hàng hover viền cam nhạt `hover:border-orange-200 hover:shadow-md transition-all`.
