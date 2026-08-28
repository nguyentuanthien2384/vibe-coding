# IDEA: TRANG CHECKOUT — PA3 NÂNG CAO

> **Ngày chốt:** 2026-08-28 | **Phạm vi:** Frontend + Backend + Payment Gateway

## 1. Tổng quan giải pháp

Xây dựng trang Checkout hỗ trợ **COD + Stripe**, cho phép **Guest Checkout** (không cần login). Nếu user đã login thì auto-fill thông tin và lưu lịch sử đơn hàng vào tài khoản.

---

## 2. Luồng nghiệp vụ (Business Flow)

### Luồng COD
```
User điền form → Chọn COD → POST /orders { customerInfo, cartItems, paymentMethod: "COD" }
→ Backend tính giá server-side → Lưu Order (status: PENDING) → FE redirect /order-success
```

### Luồng Stripe
```
User điền form → Chọn Stripe → POST /orders/create-payment-intent
→ Backend tạo PaymentIntent (Stripe SDK) → Trả về { clientSecret }
→ FE dùng Stripe.js xác nhận thanh toán → Stripe gọi Webhook POST /webhook/stripe
→ Backend verify → Update Order status: PAID → FE redirect /order-success
```

### Luồng Auth (Tuỳ chọn)
- **Guest:** Điền form bình thường, không cần token
- **Đã login:** Auto-fill name/email/phone từ Redux user state; order gắn với `userId`

---

## 3. Database Schema

### Order Model (MongoDB / Mongoose)
```js
{
  // Customer Info
  customerName:  String, required
  customerEmail: String, required
  customerPhone: String, required

  // Shipping
  shippingAddress: {
    street:   String,
    city:     String,
    country:  String, default: "Vietnam"
  }

  // Order Items (SNAPSHOT — không tham chiếu lại Product)
  items: [{
    productId:   ObjectId (ref: Product),
    productName: String,
    price:       Number,   // Giá tại thời điểm mua
    quantity:    Number,
    image:       String
  }]

  // Pricing (tính backend-side)
  subtotal:      Number,
  shippingFee:   Number, default: 30000
  totalAmount:   Number,

  // Payment
  paymentMethod: enum ["COD", "STRIPE"]
  paymentStatus: enum ["UNPAID", "PAID", "FAILED"], default: "UNPAID"
  stripePaymentIntentId: String  // Chỉ dùng khi STRIPE

  // Auth (tuỳ chọn)
  userId:  ObjectId (ref: User), default: null  // null = guest order

  // Lifecycle
  status:  enum ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"]
           default: "PENDING"
  timestamps: true
}
```

---

## 4. API Contract

### Backend Endpoints

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `POST` | `/orders` | Optional | Tạo order COD |
| `POST` | `/orders/create-payment-intent` | Optional | Tạo Stripe PaymentIntent |
| `POST` | `/webhook/stripe` | Stripe-Signature | Nhận kết quả thanh toán từ Stripe |
| `GET`  | `/orders/my` | Required (JWT) | Lịch sử đơn hàng của user đã login |

### POST /orders — Request Body
```json
{
  "customerName": "Nguyen Van A",
  "customerEmail": "a@example.com",
  "customerPhone": "0901234567",
  "shippingAddress": {
    "street": "123 Đường ABC",
    "city": "Hồ Chí Minh"
  },
  "paymentMethod": "COD",
  "items": [
    { "productId": "...", "productName": "Lenovo Laptop", "price": 970000, "quantity": 1, "image": "..." }
  ]
}
```

### POST /orders/create-payment-intent — Response
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "orderId": "..."
}
```

---

## 5. Frontend — UI Components

### CheckOut.jsx (Page)
**Layout 2 cột:**
- **Cột trái (Col lg=8):** Form thông tin giao hàng + Chọn phương thức thanh toán
- **Cột phải (Col lg=4):** Order Summary (readonly từ Redux cart)

### Form Fields (Billing Info)
- Họ và tên *
- Email *
- Số điện thoại *
- Địa chỉ (Street) *
- Thành phố *

### Payment Method Selector
```
[ ] COD — Thanh toán khi nhận hàng
[ ] Stripe — Thanh toán bằng thẻ (Visa/Mastercard)
```

### Khi chọn Stripe:
- Hiện `CardElement` của `@stripe/react-stripe-js`
- Nút "Pay Now" → gọi `stripe.confirmCardPayment(clientSecret)`

### Order Summary Panel
- Danh sách sản phẩm trong cart (ảnh, tên, qty, giá)
- Subtotal / Shipping Fee / **Total**
- Nút "Place Order" / "Pay Now"

---

## 6. State Management

### Redux (Không tạo slice mới)
- Đọc `cart.cartItems` và `cart.totalAmount` từ CartSlice hiện có
- Sau khi đặt hàng thành công → dispatch `clearCart()`

### Local Form State (useState)
```js
const [formData, setFormData] = useState({
  customerName, customerEmail, customerPhone,
  street, city
})
const [paymentMethod, setPaymentMethod] = useState('COD')
const [loading, setLoading] = useState(false)
```

---

## 7. Trang Order Success

Route: `/order-success`

Hiển thị:
- Icon check ✅
- "Cảm ơn bạn đã đặt hàng!"
- Order ID
- Tóm tắt đơn hàng
- Nút "Tiếp tục mua sắm" → về `/shop`

---

## 8. Dependencies cần cài

### Backend
```bash
npm install stripe
```

### Frontend
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### ENV bổ sung (backend)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### ENV bổ sung (frontend)
```
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## 9. Quy tắc bắt buộc

1. **Giá phải tính lại server-side:** Backend tự query Product để lấy giá, KHÔNG tin `price` từ client
2. **Order Items là snapshot:** Lưu `productName` và `price` tại thời điểm mua vào OrderItem, không dùng ref
3. **Stripe Webhook verify:** BẮT BUỘC dùng `stripe.webhooks.constructEvent()` để xác thực signature
4. **clearCart sau khi thành công:** Dispatch `clearCart()` và xóa localStorage
5. **Rate limit:** API `/orders` phải có rate limit (5 req/phút/IP) chống spam
