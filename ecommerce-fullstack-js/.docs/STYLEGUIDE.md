# LUẬT THIẾT KẾ: E-COMMERCE PLATFORM

> **Framework UI:** Bootstrap 5 + Custom CSS | **Font:** Inherit từ Bootstrap (system font stack)

## 1. Bảng màu & Điểm nhấn (Color & Hierarchy)

### Màu chính (Primary Colors)
| Vai trò | Class Bootstrap / CSS | Dùng cho |
|---|---|---|
| **Primary Action** | `btn-primary` / `bg-primary` | Nút "Thêm vào giỏ", "Mua ngay", "Thanh toán" |
| **Secondary Action** | `btn-outline-primary` / `btn-secondary` | Nút "Xem chi tiết", "Tiếp tục mua" |
| **Danger / Giá** | `text-danger fw-bold` | Giá hiện tại (sale price) |
| **Muted / Giá cũ** | `text-muted text-decoration-line-through` | Giá gốc bị gạch ngang |
| **Success** | `text-success` | Thêm vào giỏ thành công, "Còn hàng" |
| **Warning / Badge** | `badge bg-warning text-dark` | Badge % giảm giá |

### Màu nền
- **Page Background:** Mặc định Bootstrap (`#fff` hoặc `#f8f9fa`)
- **Card Background:** `bg-white` với `shadow-sm` và `rounded`

## 2. Typography

- **Font chữ:** System font stack của Bootstrap (Inter, Segoe UI, Roboto...)
- **Tiêu đề sản phẩm:** `fw-bold` + `text-truncate` (giới hạn 2 dòng)
- **Mô tả ngắn:** `text-muted` + font size nhỏ hơn
- **Giá:** `fs-5 fw-bold text-danger`
- **Giá cũ:** `text-muted text-decoration-line-through fs-6`

## 3. Thành phần đặc thù (E-com UI Components)

### Product Card
- Aspect ratio ảnh: **1:1** hoặc **3:4** (chữ nhật đứng)
- Background ảnh: `bg-light` nếu ảnh có nền trong suốt
- **Badge giảm giá:** Vị trí `position-absolute top-0 end-0 m-2`, class `badge bg-warning text-dark`
- **Hover effect:** `transform: translateY(-4px)` + `box-shadow` tăng lên

### Badges trạng thái
| Trạng thái | Class |
|---|---|
| Hết hàng | `badge bg-secondary` + overlay xám mờ lên card |
| Mới | `badge bg-success text-white` |
| Hot / Sale | `badge bg-danger text-white` |

### Layout danh sách sản phẩm (Grid)
| Breakpoint | Số cột |
|---|---|
| Mobile (`< 576px`) | 2 cột |
| Tablet (`≥ 768px`) | 3 cột |
| Desktop (`≥ 992px`) | 4 cột |
| Large Desktop (`≥ 1200px`) | 5 cột |

```css
/* Bootstrap classes */
.row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5
```

## 4. Trải nghiệm người dùng (UX Constraints)

### Giỏ hàng (Cart)
- **Mở giỏ hàng:** Dùng **Drawer/Offcanvas trượt từ phải sang** (Bootstrap Offcanvas)
- **KHÔNG** nhảy sang trang `/cart` riêng khi click icon giỏ hàng
- Drawer hiển thị danh sách item, tổng tiền, và nút "Checkout"

### Phản hồi (Toast Notifications)
- Dùng **React Toastify** cho mọi thông báo
- **Thêm vào giỏ:** Toast Success góc trên bên phải
- **Xóa sản phẩm:** Toast Info
- **Lỗi:** Toast Error với message cụ thể
- Vị trí mặc định: `top-right`, duration: `2000ms`

### Loading States
- Dùng **react-loading-skeleton** cho skeleton loading
- KHÔNG dùng spinner đơn giản — phải có skeleton đúng shape của card

### Animation
- Dùng **Framer Motion** cho page transitions và product card animations
- Transition time: `0.3s ease` cho hover effects
- Không dùng animation quá phức tạp gây lag trên mobile

## 5. Responsive Design Rules
- Mobile-first approach
- Test breakpoints: 375px, 768px, 1024px, 1440px
- Touch targets tối thiểu: 44x44px
- Font size tối thiểu: 14px trên mobile
