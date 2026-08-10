# DESIGN BRIEF: TRANG THANH TOÁN (CHECKOUT PAGE)

## 1. HỆ THỐNG LƯỚI & KHUNG HIỂN THỊ (LAYOUT & VIEWPORT)

- **RÀNG BUỘC VIEWPORT (BẮT BUỘC):**
  - Desktop: Chiều rộng `max-w-7xl` (1280px), căn giữa màn hình `mx-auto`, padding lề `px-4 md:px-6 py-8`.
  - Mobile: Full width `w-full px-4 py-6`.
- **CẤU TRÚC LƯỚI (GRID SYSTEM):**
  - Nền toàn trang: `bg-gray-50 min-h-screen`.
  - Bố cục 2 Cột trên Desktop (`lg:grid lg:grid-cols-12 lg:gap-8 items-start`):
    - **Cột Trái (Thông tin giao hàng & Người nhận):** Chiếm 7 cột (`lg:col-span-7 space-y-6`).
    - **Cột Phải (Tóm tắt đơn hàng & Phương thức thanh toán):** Chiếm 5 cột (`lg:col-span-5 space-y-6 sticky top-24`).

---

## 2. ĐẶC TẢ COMPONENT (COMPONENT SPECS)

### `user-shipping-section.tsx` [DUMB]
- **Box Style:** `bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5`
- **Header:** `flex items-center gap-3 border-b border-slate-100 pb-4`
  - Icon: `w-6 h-6 text-orange-600 flex-shrink-0` (Icon MapPin / Truck)
  - Title: `text-lg font-bold text-slate-900`
- **Typography & Labels:** `text-sm font-semibold text-slate-700 mb-1.5 block`

### `contact-info-form.tsx` [DUMB]
- **Box Style:** `grid grid-cols-1 md:grid-cols-2 gap-4`
- **Input Fields (Họ tên, Email, Số điện thoại):**
  - Box Style: `w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all`
  - Full Width Field: Email chiếm trọn 2 cột (`md:col-span-2`)
- **Validation Error Message:** `text-xs text-red-500 mt-1 font-medium`

### `shipping-address-form.tsx` [DUMB]
- **Box Style:** `space-y-4`
- **Dropdown Select (Tỉnh/Thành, Quận/Huyện, Phường/Xã):**
  - Box Style: `grid grid-cols-1 sm:grid-cols-3 gap-3`
  - Select Element: `w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all`
- **Detail Address Input (Số nhà / Tên đường):**
  - Box Style: `w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all`

### `shipping-method-selector.tsx` [DUMB]
- **Box Style:** `space-y-3 pt-2`
- **Title Label:** `text-sm font-bold text-slate-800 flex items-center gap-2`
- **Radio Option Card:**
  - Standard (Tiêu chuẩn): `flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer`
    - Default State: `border-slate-200 bg-white hover:border-slate-300`
    - Selected State: `border-2 border-orange-600 bg-orange-50/30 shadow-sm`
  - Express (Hỏa tốc): Tương tự Standard Card
- **Option Info:**
  - Title: `text-sm font-bold text-slate-900`
  - Subtitle: `text-xs text-slate-500`
  - Price Tag: `text-sm font-extrabold text-slate-900` (`30.000đ` / `50.000đ`)

### `order-note-input.tsx` [DUMB]
- **Box Style:** `space-y-1.5 pt-2`
- **Textarea Element:** `w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[90px] resize-y`

### `checkout-terms-checkbox.tsx` [DUMB]
- **Box Style:** `flex items-start gap-3 pt-3`
- **Checkbox:** `w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 mt-0.5 cursor-pointer`
- **Label Text:** `text-sm text-slate-600 leading-snug cursor-pointer`
  - Link Policy: `text-orange-600 font-semibold underline hover:text-orange-700`

---

### `order-summary-section.tsx` [DUMB]
- **Box Style:** `bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6`
- **Header:** `flex items-center justify-between border-b border-slate-100 pb-4`
  - Title: `text-lg font-bold text-slate-900 flex items-center gap-2`
  - Badge Counter: `bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full`

### `mini-cart-item-list.tsx` & `mini-cart-item.tsx` [DUMB]
- **List Box Style:** `max-h-[280px] overflow-y-auto space-y-3 pr-1 custom-scrollbar divide-y divide-slate-100`
- **Item Row:** `flex items-center gap-3 pt-3 first:pt-0`
- **Thumbnail Image:** `w-16 h-16 rounded-xl bg-slate-100 border border-slate-200/60 object-cover shrink-0 aspect-square`
- **Item Info:**
  - Product Name: `text-sm font-semibold text-slate-800 line-clamp-2 flex-1`
  - Quantity Badge: `text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0`
  - Line Price: `text-sm font-bold text-red-600 shrink-0`

### `coupon-input-container.tsx` [SMART]
- **Box Style:** `flex gap-2 pt-2`
- **Input Field:** `flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 uppercase font-semibold transition-all`
- **Apply Button:** `px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all shrink-0 active:scale-95 disabled:opacity-50`
- **Success Badge (khi áp dụng thành công):** `flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-semibold mt-2`

### `checkout-price-breakdown.tsx` [DUMB]
- **Box Style:** `space-y-3 border-t border-slate-100 pt-4`
- **Price Row:** `flex justify-between items-center text-sm`
  - Label Text: `text-slate-500`
  - Value Subtotal: `font-semibold text-slate-800`
  - Value Shipping Fee: `font-semibold text-slate-800`
  - Value Voucher Discount: `font-semibold text-green-600`
- **Total Amount Row:** `flex justify-between items-center border-t border-dashed border-slate-200 pt-3`
  - Total Label: `text-base font-bold text-slate-900`
  - Total Value: `text-2xl font-extrabold text-red-600 tracking-tight`

### `payment-method-selector.tsx` [DUMB]
- **Box Style:** `space-y-3 border-t border-slate-100 pt-4`
- **Title Label:** `text-sm font-bold text-slate-900 flex items-center gap-2`
- **Radio Option Cards (COD & QR Code):**
  - Box Style: `flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer`
  - Default State: `border-slate-200 bg-white hover:border-slate-300`
  - Selected State: `border-2 border-orange-600 bg-orange-50/30 shadow-sm`
- **Option Icon & Typography:**
  - Icon Container: `w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0`
  - Option Title: `text-sm font-bold text-slate-900`
  - Option Subtitle: `text-xs text-slate-500 mt-0.5`

### `checkout-submit-button.tsx` [DUMB]
- **Box Style:** `w-full py-4 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white text-base font-extrabold tracking-wide shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`

---

### `cod-confirmation-modal.tsx` [SMART]
- **Overlay:** `fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4`
- **Card Panel:** `bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl space-y-5 border border-slate-100`
- **Icon Container:** `w-16 h-16 rounded-full bg-green-100 text-green-600 mx-auto flex items-center justify-center text-3xl`
- **Typography:**
  - Title: `text-xl font-extrabold text-slate-900`
  - Highlight Message: `text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-left`
  - Note Text: `"Thanh toán trực tiếp cho shipper khi nhận hàng"` (`font-bold text-orange-600`)
- **Action Button:** `w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all`

### `qr-payment-modal.tsx` [SMART]
- **Overlay:** `fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4`
- **Card Panel:** `bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 border border-slate-100 max-h-[90vh] overflow-y-auto`
- **Header:** `flex items-center justify-between border-b border-slate-100 pb-3`
  - Title: `text-lg font-bold text-slate-900 flex items-center gap-2`
  - Close Button: `p-2 rounded-full text-slate-400 hover:bg-slate-100`
- **QR Display Box:** `flex flex-col items-center justify-center bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4`
  - Image Element: `w-56 h-56 bg-white p-2 rounded-xl shadow-md border border-slate-200 object-contain`
  - Countdown Timer: `inline-flex items-center gap-2 text-sm font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200`
- **Transfer Details Box:** `w-full space-y-2 text-left bg-white p-4 rounded-xl border border-slate-200 text-sm`
  - Row (Ngân hàng, Số TK, Chủ TK, Nội dung CK): `flex justify-between items-center py-1 border-b border-slate-100 last:border-0`
  - Transfer Content Highlight: `font-mono font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-base`
- **Actions Grid:** `grid grid-cols-2 gap-3`
  - Download QR Button: `py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-sm text-slate-700 shadow-sm transition-all flex items-center justify-center gap-2`
  - Auto-check Indicator: `col-span-2 flex items-center justify-center gap-2 text-xs text-slate-500 pt-1`

---

## 3. RÀNG BUỘC MÀU SẮC (COLOR CONSTRAINTS)

- **Primary Action (Chốt sale - Nút Submit Checkout):** `bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/25`
- **Secondary Buttons / Dark Elements:** `bg-slate-900 hover:bg-slate-800 text-white`
- **Backgrounds:**
  - Page Background: `bg-gray-50`
  - Cards & Modals: `bg-white`
  - Inputs & Dropdowns: `bg-slate-50/50`
  - Selection Highlight Bg: `bg-orange-50/30`
- **Text & Hierarchy:**
  - Main Title / Headings: `text-slate-900 font-extrabold`
  - Body & Labels: `text-slate-800 font-medium`
  - Subtitle & Hints: `text-slate-500 text-sm`
- **Price & Discounts:**
  - Total Price Value: `text-red-600 font-extrabold`
  - Voucher Discount Value: `text-green-600 font-semibold`
  - Discount Badge: `bg-[#A63D40] text-white`

---

## 4. MOCK DATA (DỮ LIỆU HIỂN THỊ)

### Sample Checkout Form Initial State:
```json
{
  "fullName": "Nguyen Van A",
  "email": "nguyenvana@techbite.vn",
  "phone": "0987654321",
  "provinceCode": "79",
  "provinceName": "Thành phố Hồ Chí Minh",
  "districtCode": "760",
  "districtName": "Quận 1",
  "wardCode": "26734",
  "wardName": "Phường Bến Nghé",
  "detailAddress": "123 Đường Lê Lợi, Tòa nhà Bitexco Tower",
  "shippingMethod": "STANDARD",
  "orderNote": "Giao giờ hành chính, vui lòng gọi trước 15 phút.",
  "paymentMethod": "QR_CODE",
  "termsAgreed": true
}
```

### Sample Mini Cart Items (`items`):
```json
[
  {
    "id": "cart-item-1",
    "productId": "prod-101",
    "name": "Tai nghe Bluetooth Chống ồn Sony WH-1000XM5",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    "price": 6990000,
    "quantity": 1
  },
  {
    "id": "cart-item-2",
    "productId": "prod-102",
    "name": "Bàn phím cơ không dây Keychron K2 V2 (RGB Aluminium)",
    "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=300&fit=crop",
    "price": 1850000,
    "quantity": 2
  }
]
```

### Sample Price Breakdown Summary:
```json
{
  "subtotal": 10690000,
  "shippingFee": 30000,
  "voucherDiscount": 200000,
  "total": 10520000
}
```

### Sample VietQR Info (`qrInfo`):
```json
{
  "qrCodeUrl": "https://img.vietqr.io/image/MBBANK-0987654321-compact2.png?amount=10520000&addInfo=TECHBITE10243",
  "bankName": "MB Bank (Ngân hàng Quân Đội)",
  "accountNo": "0987654321",
  "accountName": "CONG TY TNHH TECHBITE ECOMMERCE",
  "amount": 10520000,
  "transferContent": "TECHBITE10243",
  "expiresAt": "2026-08-09T15:45:00Z"
}
```
