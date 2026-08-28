# DESIGN BRIEF: CHECKOUT PAGE

> **Tính năng:** Checkout (COD + Stripe) | **UI Framework:** Bootstrap 5 + Custom CSS | **Nguồn:** checkout-idea.md

---

## 1. Hệ thống lưới & Bố cục (Layout System)

### Root Container
```css
/* Bọc toàn bộ trang */
.container                    /* Bootstrap container chuẩn, max-width auto */
section.checkout__section     /* padding-top: 60px; padding-bottom: 80px */
```

### Grid Layout — Desktop (≥ 992px)
```
[ BillingForm — Col lg=8 ] | [ OrderSummary — Col lg=4 ]
```

### Grid Layout — Mobile (< 768px)
```
[ OrderSummary ]     ← Hiển thị TRÊN (order-first trên mobile)
[ BillingForm  ]     ← Hiển thị dưới
```
Dùng Bootstrap class: `order-lg-1` / `order-first order-lg-last`

### Spacing chuẩn
| Vị trí | Class |
|---|---|
| Section padding | `py-5` |
| Card padding nội bộ | `p-4` |
| Khoảng giữa form fields | `mb-3` |
| Khoảng giữa 2 cột | `g-5` (gap trong Row) |

---

## 2. Đặc tả Component

### [DUMB] BillingForm
- **Box Style:** `bg-white rounded shadow-sm p-4`
- **Tiêu đề section:** `fs-4 fw-bold mb-4` — Text: `"Thông tin giao hàng"`
- **Input fields:**
  - Base: `form-control` (Bootstrap)
  - Focus: Bootstrap default focus ring (blue outline)
  - Error state: `is-invalid` class + `div.invalid-feedback` hiện message
  - Label: `form-label fw-semibold`
- **Hover input:** background chuyển nhẹ `#f8f9fa`

### [DUMB] PaymentMethodSelector
- **Box Style:** `bg-white rounded shadow-sm p-4 mt-4`
- **Tiêu đề:** `fs-5 fw-bold mb-3` — Text: `"Phương thức thanh toán"`
- **COD Option:**
  - Radio card: `border rounded p-3 mb-2 d-flex align-items-center gap-3`
  - Khi selected: `border-primary bg-primary bg-opacity-10`
  - Icon: `ri-cash-line` (RemixIcon) màu `text-success fs-4`
- **Stripe Option:**
  - Tương tự COD, icon: `ri-bank-card-line` màu `text-primary fs-4`
  - Khi selected: `border-primary bg-primary bg-opacity-10`
- **CardElement (Stripe):** Bọc trong `border rounded p-3 mt-3 bg-light`

### [DUMB] OrderSummaryPanel
- **Box Style:** `bg-white rounded shadow-sm p-4` + `position-sticky` top `20px` trên desktop
- **Tiêu đề:** `fs-5 fw-bold border-bottom pb-3 mb-3` — Text: `"Đơn hàng của bạn"`
- **Danh sách item:**
  - Layout: `d-flex justify-content-between align-items-center mb-2`
  - Ảnh: `width: 50px; height: 50px; object-fit: cover; border-radius: 8px`
  - Tên: `fw-semibold text-truncate` (max-width 150px)
  - Số lượng: `badge bg-secondary ms-1`
  - Giá: `text-danger fw-bold`
- **Divider:** `<hr/>` mặc định Bootstrap
- **Subtotal / Shipping / Total rows:**
  - `d-flex justify-content-between mb-2 text-muted`
  - Dòng **Total:** `d-flex justify-content-between fw-bold fs-5 text-dark`
- **Nút Place Order / Pay Now:**
  - `btn btn-primary w-100 py-3 mt-3 fs-5`
  - Loading state: `disabled` + spinner `spinner-border spinner-border-sm me-2`
  - Hover: Bootstrap default + `transform: translateY(-1px)`

### [DUMB] OrderSuccessPage
- **Container:** `text-center py-5`
- **Icon check:** `ri-checkbox-circle-fill` size `ri-5x` màu `text-success`
- **Tiêu đề:** `fs-2 fw-bold mt-3`
- **Order ID:** `text-muted font-monospace`
- **Nút Continue:** `btn btn-outline-primary mt-4 px-5`
- **Animation:** Framer Motion `{ initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 } }`

---

## 3. Ràng buộc màu sắc (Color Constraints)

> Tuân thủ STYLEGUIDE.md — dùng class Bootstrap, KHÔNG dùng HEX tự chế

| Màu | Bootstrap Class | Dùng cho |
|---|---|---|
| Primary Blue | `btn-primary`, `border-primary`, `text-primary` | CTA button, border active |
| Danger Red | `text-danger fw-bold` | Giá tiền trong order summary |
| Success Green | `text-success` | Icon COD, order success |
| Muted Gray | `text-muted` | Label phụ, subtotal/shipping |
| Background nhạt | `bg-light` | CardElement Stripe wrapper |
| White card | `bg-white shadow-sm rounded` | Tất cả card sections |

---

## 4. Mock Data (Dữ liệu mẫu)

### Form placeholder
```
Họ và tên:      "Nguyễn Văn A"
Email:           "nguyenvana@gmail.com"
Số điện thoại:   "0901 234 567"
Địa chỉ:         "123 Đường Lê Lợi, Quận 1"
Thành phố:       "Hồ Chí Minh"
```

### Order Summary mẫu
```
Lenovo Laptop                x1      970,000 ₫
Xiaomi Redmi Note 11         x2    1,140,000 ₫
─────────────────────────────────────────────
Tạm tính:                         2,110,000 ₫
Phí vận chuyển:                      30,000 ₫
─────────────────────────────────────────────
Tổng cộng:                        2,140,000 ₫
```

### Stripe test card
```
Số thẻ:   4242 4242 4242 4242
Hết hạn:  12/26
CVV:      123
```
