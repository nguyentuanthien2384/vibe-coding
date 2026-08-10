# QUY HOẠCH KỸ THUẬT FRONTEND: AUTHENTICATION & PROFILE

> **Nguồn Ý Tưởng:** `.docs/ideas/06-auth-idea.md`  
> **Tài Liệu Tham Chiếu:** `.docs/ARCHITECTURE.md`, `.docs/STYLEGUIDE.md`, `.agent/AGENTS.md`  
> **Phiên bản:** 1.0.0  
> **Ngày tạo:** 2026-08-09  

---

## 1. PHÂN RÃ COMPONENT (COMPONENT TREE)

Để tuân thủ tuyệt đối quy tắc **Next.js App Router (Server Component là mặc định)** và **Phân tách Logic - UI (Smart vs Dumb Components)**, kiến trúc cây Component được quy hoạch như sau:

```
apps/frontend/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx [SERVER]               → Wrapper bố cục trang Auth (thẻ card căn giữa, nền bg-gray-50)
│   │   ├── login/
│   │   │   └── page.tsx [SERVER]             → Server Component render AuthCardWrapper & LoginFormContainer
│   │   └── register/
│   │       └── page.tsx [SERVER]             → Server Component render AuthCardWrapper & RegisterFormContainer
│   └── (dashboard)/
│       └── profile/
│           ├── page.tsx [SERVER]             → Server Component fetch dữ liệu sơ bộ / render ProfileContainer
│           └── orders/
│               └── page.tsx [SERVER]         → Server Component render trang Lịch sử đơn hàng
├── components/
│   ├── auth/
│   │   ├── auth-card-wrapper.tsx [DUMB]      → Khung Card bo góc `rounded-2xl`, chứa logo & tiêu đề
│   │   ├── login-form-container.tsx [SMART]  → Xử lý submit login, gọi useAuth hook, toast feedback
│   │   ├── login-form.tsx [DUMB]            → Input Email, Mật khẩu, Nút submit, Báo lỗi validation
│   │   ├── register-form-container.tsx [SMART]→ Xử lý submit register, gọi useAuth hook, toast feedback
│   │   ├── register-form.tsx [DUMB]         → Input Họ tên, Email, SĐT, Mật khẩu, Re-password, Báo lỗi validation
│   │   └── auth-footer-link.tsx [DUMB]       → Link chuyển đổi giữa Login ↔ Register
│   ├── layout/
│   │   ├── header.tsx [SMART] (đã có)        → Tích hợp UserNavMenu
│   │   └── user-nav-menu.tsx [SMART]         → Hiển thị Lời chào / Avatar / Dropdown khi đăng nhập
│   └── profile/
│       ├── profile-container.tsx [SMART]     → Quản lý active tab (Thông tin cá nhân / Lịch sử đơn hàng)
│       ├── profile-sidebar.tsx [DUMB]        → Menu chuyển tab & Nút Đăng xuất
│       ├── profile-info-card.tsx [DUMB]      → Form xem/chỉnh sửa thông tin cá nhân
│       └── order-history-list.tsx [DUMB]     → Danh sách đơn hàng đã mua (Card đơn hàng + Badge trạng thái)
```

### Chú thích phân loại Component

| Nhãn | Ý nghĩa | Quy tắc thực thi |
|---|---|---|
| `[SERVER]` | Next.js Async Server Component | Giữ vai trò khung trang (`page.tsx`), **CẤM** chuyển `page.tsx` thành Client Component |
| `[SMART]` | Client Container Component (`"use client"`) | Kết nối Store/Custom Hook/TanStack Query, xử lý Submit & Side-effects |
| `[DUMB]` | Pure UI Component (`"use client"` hoặc Server) | Chỉ nhận `props`, render UI, **CẤM** gọi API hay truy cập Store trực tiếp |

---

## 2. QUẢN LÝ TRẠNG THÁI & AUTH FLOW (STATE MANAGEMENT)

### 2.1 Bảng phân loại State

| State | Loại State | Công cụ | Lý do & Mục đích |
|---|---|---|---|
| `user` | Global State | Zustand (`useAuthStore`) | Lưu thông tin User (`id`, `name`, `email`, `phone`, `role`) sau khi Auth thành công |
| `isAuthenticated` | Global Computed | Zustand (`useAuthStore`) | Đánh dấu trạng thái đăng nhập hệ thống (`Boolean(user)`) |
| `accessToken` | Memory State | Axios Interceptor / Zustand | Lưu Access Token trên RAM client (ngắn hạn 15p), không lưu plain token xuống LocalStorage |
| `loginFormState` | Local State | React Hook Form + Zod | Quản lý giá trị input, touched state, errors cho Form Đăng nhập |
| `registerFormState` | Local State | React Hook Form + Zod | Quản lý giá trị input, validation lỗi realtime cho Form Đăng ký |
| `isSubmitting` | Local Loading | React Hook Form | Kích hoạt hiệu ứng Loading spinner trên Button Call-To-Action |
| `activeProfileTab` | Local UI State | `useState` / URL SearchParams | Chuyển đổi giữa tab "Thông tin cá nhân" và "Lịch sử mua hàng" |

### 2.2 Sơ đồ luồng Xác thực (Authentication Flow)

#### A. Luồng Đăng nhập (Login Flow)
```
User nhập Email/Password → Trigger onSubmit [LoginFormContainer]
    ↓ Validate với Zod Schema (Email format, Password required)
    ↓ Đúng Validation → Gọi API POST /api/v1/auth/login (Client via Axios)
    ↓
    ├── [Thành công 200/201]
    │   ├── Backend trả về AccessToken + Set-Cookie HTTP-Only RefreshToken
    │   ├── Cập nhật `user` & `accessToken` vào `useAuthStore`
    │   ├── Toast notification: "Đăng nhập thành công!"
    │   └── Điều hướng tới `/profile` hoặc `callbackUrl` (nếu có)
    └── [Thất bại 400/401/404]
        ├── Bắt Http Exception (VD: "Email hoặc mật khẩu không chính xác")
        └── Hiển thị Banner lỗi Alert Red trên Form
```

#### B. Luồng Tự động Refresh Token (Axios Interceptors)
```
Client gọi API cần Auth (VD: GET /api/v1/users/me) với Header `Authorization: Bearer <AccessToken>`
    ↓
    ├── [Access Token Hết Hạn -> API trả 401 Unauthorized]
    │   ├── Axios Interceptor chặn Response 401
    │   ├── Tự động gọi POST /api/v1/auth/refresh-token (Cookie RefreshToken gửi kèm tự động)
    │   ├── Backend trả về AccessToken mới (Refresh Token Rotation)
    │   ├── Lưu AccessToken mới vào Memory State
    │   └── Gọi lại (Retry) API ban đầu bị thất bại
    └── [Refresh Token Không Hợp Lệ / Bị Thu Hồi (Replay Attack)]
        ├── Backend trả về 401/403
        ├── Clear `user` state trong Zustand store
        ├── Toast warning: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!"
        └── Redirect tự động về `/login`
```

#### C. Luồng Đăng xuất (Logout Flow)
```
User click "Đăng xuất" (trên Header Dropdown hoặc Profile Sidebar)
    ↓ Gọi API POST /api/v1/auth/logout (Header chứa AccessToken)
    ↓ Backend đưa AccessToken vào Blacklist Redis & Xóa RefreshToken Cookie
    ↓ Client xóa toàn bộ state trong Zustand (`useAuthStore.getState().logout()`)
    ↓ Toast notification: "Đã đăng xuất thành công!"
    └── Redirect về `/login` hoặc Trang chủ `/`
```

---

## 3. CẤU TRÚC DỮ LIỆU & INTERFACES (DATA CONTRACTS)

### 3.1 DTOs & Auth Interfaces (`types/auth.types.ts`)

```typescript
// types/auth.types.ts

/** Role của người dùng theo ARCHITECTURE.md */
export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

/** Thông tin chi tiết User trả về từ API */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

/** Payload Đăng Nhập */
export interface LoginDto {
  email: string;
  password: string;
}

/** Payload Đăng Ký */
export interface RegisterDto {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string; // dùng cho validation client-side
}

/** Response từ API POST /api/v1/auth/login hoặc POST /api/v1/auth/register */
export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}

/** Response API Lịch sử đơn hàng tóm tắt */
export interface OrderSummaryItem {
  id: string;
  orderCode: string;
  createdAt: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
  itemCount: number;
}
```

### 3.2 Props của Dumb Components (`types/auth-ui.types.ts`)

```typescript
// types/auth-ui.types.ts
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { LoginDto, RegisterDto, UserProfile, OrderSummaryItem } from './auth.types';

/** Props cho Component AuthCardWrapper */
export interface AuthCardWrapperProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

/** Props cho Component LoginForm (Dumb) */
export interface LoginFormProps {
  register: UseFormRegister<LoginDto>;
  errors: FieldErrors<LoginDto>;
  isSubmitting: boolean;
  serverError?: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

/** Props cho Component RegisterForm (Dumb) */
export interface RegisterFormProps {
  register: UseFormRegister<RegisterDto>;
  errors: FieldErrors<RegisterDto>;
  isSubmitting: boolean;
  serverError?: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

/** Props cho Component AuthFooterLink */
export interface AuthFooterLinkProps {
  promptText: string;
  linkText: string;
  href: string;
}

/** Props cho Component UserNavMenu */
export interface UserNavMenuProps {
  user: UserProfile | null;
  isAuthenticated: boolean;
  onLogout: () => void;
}

/** Props cho Component ProfileInfoCard */
export interface ProfileInfoCardProps {
  user: UserProfile;
  onUpdateProfile?: (data: Partial<UserProfile>) => void;
}

/** Props cho Component OrderHistoryList */
export interface OrderHistoryListProps {
  orders: OrderSummaryItem[];
  isLoading?: boolean;
}
```

---

## 4. QUY TRÌNH THỰC THI CHI TIẾT (STEP-BY-STEP IMPLEMENTATION STEPS)

### Bước 1: Khai báo Zod Validation Schemas (`lib/validations/auth.schema.ts`)
- Định nghĩa `loginSchema`:
  - `email`: Bắt buộc đúng format email (`z.string().email("Email không hợp lệ")`).
  - `password`: Tối thiểu 6 ký tự (`z.string().min(6, "Mật khẩu phải từ 6 ký tự")`).
- Định nghĩa `registerSchema`:
  - `name`: Tối thiểu 2 ký tự (`z.string().min(2, "Họ và tên tối thiểu 2 ký tự")`).
  - `email`: Định dạng Email hợp lệ (`z.string().email("Email không hợp lệ")`).
  - `phone`: Regex kiểm tra SĐT Việt Nam (`z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ")`).
  - `password`: Tối thiểu 6 ký tự.
  - `confirmPassword`: Kiểm tra trùng khớp với `password` qua `.refine((data) => data.password === data.confirmPassword)`.

### Bước 2: Xây dựng Zustand Auth Store & Custom Hooks (`store/use-auth-store.ts`, `hooks/use-auth.ts`)
- Tạo Zustand Store `useAuthStore`:
  - State: `user: UserProfile | null`, `accessToken: string | null`, `isInitialized: boolean`.
  - Actions: `setAuth(user, token)`, `clearAuth()`, `setUser(user)`.
- Tạo Custom Hook `useAuth`:
  - Gọi API via TanStack Query / Axios.
  - Cung cấp hàm `login(dto)`, `register(dto)`, `logout()`, `fetchMe()`.

### Bước 3: Cấu hình Axios Client Interceptor (`lib/axios.ts`)
- Đảm bảo cấu hình `withCredentials: true` để trình duyệt tự động đính kèm RefreshToken Cookie.
- Thiết lập Request Interceptor: Đính kèm `Authorization: Bearer ${accessToken}` từ Zustand store.
- Thiết lập Response Interceptor: Bắt lỗi 401 để kích hoạt Refresh Token Flow tự động.

### Bước 4: Xây dựng UI Trang Đăng nhập (`app/(auth)/login/page.tsx` & Components)
- `app/(auth)/login/page.tsx`: Server Component giữ khung trang.
- `components/auth/auth-card-wrapper.tsx`: Card bo góc `rounded-2xl bg-white shadow-sm border border-gray-100 p-8 max-w-md w-full`.
- `components/auth/login-form.tsx`:
  - Nút submit Call-to-Action màu cam thương hiệu `bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl py-3 w-full transition-all`.
  - **Yêu cầu khắt khe từ Ý tưởng:** Chỉ hiển thị **DUY NHẤT 1 nút đăng nhập** (không có mạng xã hội rườm rà).
  - Có link sang trang đăng ký: "Chưa có tài khoản? Đăng ký ngay".

### Bước 5: Xây dựng UI Trang Đăng ký (`app/(auth)/register/page.tsx` & Components)
- `app/(auth)/register/page.tsx`: Server Component giữ khung trang.
- `components/auth/register-form.tsx`:
  - Các ô input bo góc nhẹ: Họ và tên, Email, Số điện thoại, Mật khẩu, Xác nhận mật khẩu.
  - Nút submit "Tạo tài khoản" `bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl py-3 w-full`.
  - Link điều hướng: "Đã có tài khoản? Đăng nhập ngay".

### Bước 6: Cập nhật Header Động (Dynamic Header User State)
- Tích hợp `UserNavMenu` vào `components/layout/header.tsx`.
- Khi `isAuthenticated === false`:
  - Hiển thị nút "Đăng nhập" (`bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-4 py-2`).
- Khi `isAuthenticated === true`:
  - Hiển thị Lời chào: `"Xin chào, {user.name}"`.
  - Hiển thị Dropdown Menu khi hover/click:
    - Item 1: "Tài khoản cá nhân" (`/profile`).
    - Item 2: "Đơn hàng của tôi" (`/profile/orders`).
    - Item 3 (Nút đỏ): "Đăng xuất" (`onLogout`).

### Bước 7: Xây dựng UI Trang Profile & Lịch sử Đơn hàng (`app/(dashboard)/profile/...`)
- Trang `/profile` chứa layout 2 cột:
  - Cột trái (Sidebar): Component `ProfileSidebar` chứa Avatar, Tên, Email, Menu tab (Thông tin cá nhân / Lịch sử mua hàng), Nút đăng xuất.
  - Cột phải: Component `ProfileInfoCard` (Xem & Cập nhật Họ tên, SĐT) hoặc `OrderHistoryList` (Xem danh sách đơn hàng đã mua).

### Bước 8: Route Protection Middleware (`middleware.ts`)
- Kiểm tra Session/Token trên Next.js Middleware:
  - Nếu truy cập đường dẫn bảo vệ (`/profile`, `/checkout`) mà chưa Auth → Redirect về `/login?callbackUrl=/profile`.
  - Nếu đã Auth mà truy cập `/login` hoặc `/register` → Redirect về `/profile` hoặc `/`.

---

## 5. MÃ MÀU & QUY CHUẨN THIẾT KẾ UI (TUÂN THỦ STYLEGUIDE.MD)

Tất cả các Component UI Đăng nhập/Đăng ký/Profile **BẮT BUỘC** dùng màu chuẩn theo `STYLEGUIDE.md`:

- **Primary Action Button (Đăng nhập / Đăng ký):** `bg-orange-600 hover:bg-orange-700 text-white` (Nút Call-To-Action chính).
- **Secondary Action (Xem chi tiết / Hủy):** `bg-slate-900 hover:bg-slate-800 text-white`.
- **Card Background & Rounded Corners:** `bg-white border border-gray-100 rounded-2xl shadow-sm`.
- **Nền trang (Page Background):** `bg-gray-50`.
- **Chữ cảnh báo / Báo lỗi (Error Alert):** `text-red-600 text-sm font-medium`, viền input lỗi `border-red-500 focus:ring-red-500`.

---

## 6. KỊCH BẢN KIỂM THỬ FRONTEND (VERIFICATION PLAN)

| STT | Kịch bản kiểm thử | Hành động | Kết quả mong đợi |
|---|---|---|---|
| 1 | Validation Form Đăng ký | Nhập email sai định dạng (vd: `abc@`) hoặc mật khẩu confirm không khớp | Hiển thị thông báo lỗi bên dưới ô input ngay lập tức, nút submit bị chặn |
| 2 | Validation Form Đăng nhập | Để trống email/password và ấn Submit | Báo lỗi "Vui lòng nhập Email" và "Vui lòng nhập Mật khẩu" |
| 3 | Đăng ký tài khoản thành công | Nhập đầy đủ thông tin hợp lệ -> Bấm Đăng ký | Toast "Đăng ký thành công!", tự động đăng nhập hoặc chuyển sang `/login` |
| 4 | Đăng nhập sai thông tin | Nhập email đúng nhưng password sai | Hiển thị Alert đỏ "Email hoặc mật khẩu không chính xác" từ backend response |
| 5 | Đăng nhập thành công | Nhập đúng tài khoản | Toast "Đăng nhập thành công!", Header chuyển sang hiển thị `"Xin chào, [Tên]"`, redirect về `/profile` |
| 6 | Kiểm tra HTTP-Only Cookie | Mở DevTools -> Application -> Cookies | `refreshToken` xuất hiện với checkbox `HttpOnly` được đánh dấu (chống XSS) |
| 7 | Tự động Refresh Token | Xóa `accessToken` trên memory / Đợi 15p -> Gọi API `/profile` | Axios Interceptor tự động gọi `/refresh-token` thành công mà không làm gián đoạn UX |
| 8 | Đăng xuất | Bấm nút "Đăng xuất" trên Header hoặc Profile | Header chuyển về trạng thái Guest (nút Đăng nhập), Redirect về `/login` |
| 9 | Bảo vệ đường dẫn (Middleware) | Cố tinh gõ URL `/profile` khi chưa đăng nhập | Tự động bị nảy về `/login?callbackUrl=/profile` |
