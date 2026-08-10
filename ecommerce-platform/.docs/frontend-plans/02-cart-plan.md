# FRONTEND PLAN: Giỏ Hàng Trượt (Slide-out Cart Drawer)

## 1. PHÂN RÃ COMPONENT (COMPONENT TREE)

```text
apps/frontend/
└── components/
    ├── shared/ [Shared UI]
    │   ├── backdrop.tsx               - [DUMB] [Shared UI] Màn mờ phủ toàn trang (backdrop-blur-sm, Click to close)
    │   ├── quantity-counter.tsx       - [DUMB] [Shared UI] Bộ đếm số lượng với nút [+] và [-]
    │   └── badge.tsx                  - [DUMB] [Shared UI] Nhãn trạng thái (New, Out of Stock, Sale %)
    └── cart/
        ├── cart-drawer.tsx            - [SMART] Container quản lý mở/đóng, animation trượt, khóa scroll body
        ├── cart-header.tsx            - [DUMB] Tiêu đề giỏ hàng, đếm tổng số lượng & nút đóng Drawer [X]
        ├── cart-item-list.tsx         - [DUMB] Bố cục danh sách các sản phẩm có thanh cuộn độc lập (scrollable)
        │   ├── cart-item.tsx          - [DUMB] Thẻ hiển thị 1 sản phẩm (Thumbnail 1:1, Tên, Giá bán, Nút xóa)
        │   │   └── quantity-counter   - [DUMB] [Shared UI] Tích hợp tăng/giảm số lượng sản phẩm trong giỏ
        │   └── cart-empty.tsx         - [DUMB] Giao diện khi giỏ hàng trống (Empty State & Nút tiếp tục mua sắm)
        └── cart-summary.tsx           - [DUMB] Khối ghim đáy (Sticky Bottom): Tạm tính, Phí giao hàng, Tổng tiền & CTA Checkout
```

### Chi tiết Phân loại Components:
- **`cart-drawer.tsx` [SMART]:** Quản lý kết nối tới Global Store (`useCartStore`), điều khiển trạng thái hiển thị, khóa `scroll` của `body`, bắt sự kiện phím `Esc` và gọi action Checkout.
- **`cart-header.tsx` [DUMB]:** Nhận props `totalItems`, `onClose` để hiển thị tiêu đề và nút đóng.
- **`cart-item-list.tsx` [DUMB]:** Nhận props `items`, `onUpdateQuantity`, `onRemove` để render danh sách sản phẩm hoặc State rỗng.
- **`cart-item.tsx` [DUMB]:** Nhận props thông tin sản phẩm và callbacks xử lý sự kiện.
- **`cart-summary.tsx` [DUMB]:** Nhận props `subtotal`, `shippingFee`, `total`, `onCheckout`, `isSubmitting` để render khối thanh toán ghim đáy.
- **Components [Shared UI]:** `backdrop.tsx`, `quantity-counter.tsx`, `badge.tsx` có thể tái sử dụng cho các trang Chi tiết sản phẩm, Danh sách sản phẩm và Modal khác.

---

## 2. QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)

### Phân loại & Chiến lược Lưu trữ State:

| Tên State | Mô tả | Loại State | Chiến lược Lưu trữ | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `isOpen` | Trạng thái Drawer đang ẩn hay hiện | **Global State** | Zustand (`useCartStore`) | Cần trigger mở giỏ hàng từ bất kỳ đâu (Header icon, Nút "Thêm vào giỏ" ở Product Card) |
| `items` | Danh sách sản phẩm trong giỏ (`CartItem[]`) | **Global State** | Zustand + `localStorage` persist | Cần đồng bộ toàn bộ ứng dụng và lưu giữ lại khi User refresh trang |
| `isUpdating` | Trạng thái loading khi đổi số lượng/xóa item | **Local State** | React `useState` tại `cart-item.tsx` | Chỉ ảnh hưởng UI từng dòng sản phẩm cụ thể khi thao tác bất đồng bộ |
| `isSubmitting` | Trạng thái chuyển hướng tới Checkout | **Local State** | React `useState` tại `cart-drawer.tsx` | Tránh User spam click nút "Thanh Toán" |
| `appliedVoucher` | Mã giảm giá đang áp dụng (nếu có) | **URL Query / Global** | URL Parameter (`?voucher=...`) hoặc Zustand | Dễ dàng chia sẻ link ưu đãi kèm voucher cho người khác |

---

## 3. CẤU TRÚC DỮ LIỆU (DATA INTERFACES)

```typescript
// types/cart.ts

/** Thông tin sản phẩm nằm trong Giỏ Hàng */
export interface CartItemData {
  id: string;             // ID duy nhất của dòng trong giỏ
  productId: string;      // ID sản phẩm gốc
  name: string;           // Tên sản phẩm
  image: string;          // URL ảnh đại diện (Aspect Ratio 1:1)
  price: number;          // Giá hiện tại (text-red-600 font-bold)
  originalPrice?: number; // Giá gốc chưa giảm (text-slate-400 line-through)
  quantity: number;       // Số lượng hiện tại trong giỏ
  stock: number;          // Tồn kho khả dụng tối đa
}

/** Tóm tắt giá trị thanh toán của Giỏ Hàng */
export interface CartSummaryData {
  subtotal: number;       // Tạm tính tổng tiền sản phẩm
  shippingFee: number;    // Phí giao hàng (0 = "Miễn phí" text-green-600)
  discount: number;       // Giá trị giảm giá
  total: number;          // Tổng tiền cuối cùng BẮT BUỘC trả
}

// ----------------------------------------------------
// PROPS INTERFACES CHO CÁC DUMB COMPONENTS
// ----------------------------------------------------

/** Props cho Shared UI: QuantityCounter */
export interface QuantityCounterProps {
  quantity: number;
  maxStock: number;
  minQuantity?: number;
  onChange: (newQuantity: number) => void;
  disabled?: boolean;
}

/** Props cho CartItem Component */
export interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  isUpdating?: boolean;
}

/** Props cho CartItemList Component */
export interface CartItemListProps {
  items: CartItemData[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

/** Props cho CartSummary Component */
export interface CartSummaryProps {
  summary: CartSummaryData;
  onCheckout: () => void;
  isSubmitting?: boolean;
}

/** Props cho CartHeader Component */
export interface CartHeaderProps {
  totalCount: number;
  onClose: () => void;
}

/** Props cho Shared UI: Backdrop */
export interface BackdropProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}
```
