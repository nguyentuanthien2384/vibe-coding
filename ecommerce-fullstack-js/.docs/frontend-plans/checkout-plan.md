# FRONTEND PLAN: CHECKOUT

> **Tech Stack:** React 18, Redux Toolkit, Bootstrap 5, Framer Motion, @stripe/react-stripe-js  
> **Route:** `/checkout` | `/order-success`

---

## 1. Cây Component (Component Tree)

```
pages/
├── CheckOut.jsx                    [SMART] — Page container, quản lý toàn bộ flow
│   ├── components/Checkout/
│   │   ├── BillingForm.jsx         [DUMB]  — Form thông tin giao hàng
│   │   ├── PaymentMethodSelector.jsx [DUMB] — Radio chọn COD / Stripe
│   │   ├── StripeCardInput.jsx     [DUMB]  — Wrapper CardElement của Stripe
│   │   └── OrderSummaryPanel.jsx   [DUMB]  — Danh sách items + tổng tiền
│
└── OrderSuccess.jsx                [SMART] — Trang kết quả sau đặt hàng thành công
    └── components/Checkout/
        └── OrderSuccessContent.jsx [DUMB]  — UI hiển thị thông tin đơn hàng thành công
```

**Shared UI tiềm năng:**
- `OrderSummaryPanel` — có thể dùng lại ở trang Cart sidebar
- `BillingForm` — có thể dùng lại ở trang Profile (khi có Auth)

---

## 2. Phân tích từng Component

### `CheckOut.jsx` [SMART]
**Trách nhiệm:**
- Đọc `cartItems`, `totalAmount` từ Redux
- Quản lý `formData` (local state)
- Quản lý `paymentMethod` (COD | STRIPE)
- Gọi API: `POST /orders` (COD) hoặc `POST /orders/create-payment-intent` (Stripe)
- Sau success: dispatch `clearCart()` → navigate `/order-success`

**Stripe Integration:**
- Bọc toàn bộ page trong `<Elements stripe={stripePromise}>`
- `stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY)`

---

### `BillingForm.jsx` [DUMB]
**Props:**
```ts
interface BillingFormProps {
  formData: BillingFormData;
  onChange: (field: keyof BillingFormData, value: string) => void;
  errors: Partial<Record<keyof BillingFormData, string>>;
}

interface BillingFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  street: string;
  city: string;
}
```

---

### `PaymentMethodSelector.jsx` [DUMB]
**Props:**
```ts
interface PaymentMethodSelectorProps {
  selected: 'COD' | 'STRIPE';
  onChange: (method: 'COD' | 'STRIPE') => void;
}
```

---

### `StripeCardInput.jsx` [DUMB]
**Props:**
```ts
interface StripeCardInputProps {
  visible: boolean; // Chỉ render khi paymentMethod === 'STRIPE'
}
```
**Nội bộ:** dùng `CardElement` từ `@stripe/react-stripe-js`

---

### `OrderSummaryPanel.jsx` [DUMB]
**Props:**
```ts
interface OrderSummaryPanelProps {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: 'COD' | 'STRIPE';
  isLoading: boolean;
  onSubmit: () => void;
}

interface CartItem {
  id: string;
  product: string;
  price: string;       // "UGX. 970,000" — parse tại SMART component
  image: string;
  cartQuantity: number;
}
```

---

### `OrderSuccess.jsx` [SMART]
**Trách nhiệm:**
- Đọc `orderId` từ `location.state` (truyền qua navigate)
- Fallback nếu không có state → redirect về `/shop`

**Props cho `OrderSuccessContent` [DUMB]:**
```ts
interface OrderSuccessContentProps {
  orderId: string;
  totalAmount: number;
  paymentMethod: 'COD' | 'STRIPE';
}
```

---

## 3. Quản lý State

| State | Loại | Nơi lưu | Ghi chú |
|---|---|---|---|
| `cartItems` | Global | Redux `cart.cartItems` | Đọc, không write tại đây |
| `totalAmount` | Global | Redux `cart.totalAmount` | Đọc để hiển thị |
| `formData` | Local | `useState` trong CheckOut | Họ tên, email, SĐT, địa chỉ |
| `paymentMethod` | Local | `useState` trong CheckOut | `'COD'` \| `'STRIPE'` |
| `isLoading` | Local | `useState` trong CheckOut | Khi đang gọi API |
| `errors` | Local | `useState` trong CheckOut | Validation errors |
| `orderId` | `location.state` | React Router | Truyền từ CheckOut → OrderSuccess |

---

## 4. Luồng xử lý (Flow Logic)

### COD Flow
```
handleSubmit()
  → validate formData (client-side)
  → setLoading(true)
  → POST /orders { ...formData, paymentMethod: 'COD', items: parsedCartItems }
  → onSuccess: dispatch(clearCart()) → navigate('/order-success', { state: { orderId, totalAmount } })
  → onError: toast.error(message)
  → setLoading(false)
```

### Stripe Flow
```
handleSubmit()
  → validate formData
  → setLoading(true)
  → POST /orders/create-payment-intent { ...formData, items: parsedCartItems }
  → nhận { clientSecret, orderId }
  → stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement } })
  → onSuccess: dispatch(clearCart()) → navigate('/order-success', { state: { orderId, totalAmount } })
  → onError: toast.error(result.error.message)
  → setLoading(false)
```

### Parse price từ CartItem
```js
// Chuyển "UGX. 970,000" → 970000
const parsePrice = (priceStr) =>
  Number(priceStr.replace('UGX.', '').replace(/,/g, '').trim())
```

---

## 5. Validation (Client-side)

| Field | Rule |
|---|---|
| `customerName` | Không rỗng, tối thiểu 2 ký tự |
| `customerEmail` | Regex email hợp lệ |
| `customerPhone` | 10-11 số, bắt đầu bằng 0 |
| `street` | Không rỗng |
| `city` | Không rỗng |
| Cart | `cartItems.length > 0` — nếu cart rỗng, redirect về `/shop` |

---

## 6. Routes cần thêm vào Routers.js

```jsx
<Route path="/checkout" element={<CheckOut />} />
<Route path="/order-success" element={<OrderSuccess />} />
```

---

## 7. Service Layer (Axios — `services/orderService.js`)

```js
// Tập trung gọi API tại đây, KHÔNG gọi trực tiếp trong component

createCODOrder(payload)        // POST /orders
createPaymentIntent(payload)   // POST /orders/create-payment-intent
```

---

## 8. Dependencies cần cài (Frontend)

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```
