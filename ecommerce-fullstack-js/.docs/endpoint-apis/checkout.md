# DANH SÁCH ENDPOINTS: CHECKOUT & ORDERS

> **Base URL:** `http://localhost:3333` (hoặc cấu hình PORT trong `.env`)  
> **Controller:** [`app/backend/controllers/Orders.js`](file:///d:/vibe_coding/ecommerce-fullstack-js/app/backend/controllers/Orders.js)  
> **Router:** [`app/backend/routes/orders.js`](file:///d:/vibe_coding/ecommerce-fullstack-js/app/backend/routes/orders.js)  

---

## 1. Bảng tổng hợp Endpoints

| Method | Endpoint | Bảo vệ (Middleware) | Mô tả |
|---|---|---|---|
| `POST` | `/orders` | `orderLimiter` (10 req/phút) | Tạo đơn hàng mới (COD) |
| `POST` | `/orders/create-payment-intent` | `orderLimiter` (10 req/phút) | Khởi tạo Stripe PaymentIntent |
| `POST` | `/webhook/stripe` | `express.raw()` + Stripe Sig | Nhận webhook cập nhật trạng thái thanh toán từ Stripe |
| `GET` | `/orders/:id` | Public | Lấy chi tiết đơn hàng theo ID |
| `GET` | `/orders/my` | Email query / Auth | Lấy danh sách lịch sử đơn hàng |

---

## 2. Chi tiết từng Endpoint

### 2.1. [POST] `/orders`
**Mô tả:** Đặt hàng COD. Tính toán giá toàn bộ ở Server-side.
- **Request Body:**
```json
{
  "customerName": "Nguyễn Văn A",
  "customerEmail": "nguyenvana@gmail.com",
  "customerPhone": "0901234567",
  "shippingAddress": {
    "street": "123 Đường Lê Lợi",
    "city": "Hồ Chí Minh",
    "country": "Vietnam"
  },
  "paymentMethod": "COD",
  "items": [
    {
      "productId": "64e0a1b2c3d4e5f6a7b8c9d0",
      "quantity": 1
    }
  ]
}
```
- **Response 201:**
```json
{
  "status": 201,
  "message": "Đặt hàng thành công",
  "data": {
    "_id": "66ce789abc1234567890",
    "customerName": "Nguyễn Văn A",
    "customerEmail": "nguyenvana@gmail.com",
    "customerPhone": "0901234567",
    "shippingAddress": {
      "street": "123 Đường Lê Lợi",
      "city": "Hồ Chí Minh",
      "country": "Vietnam"
    },
    "items": [
      {
        "productId": "64e0a1b2c3d4e5f6a7b8c9d0",
        "productName": "Lenovo laptop",
        "price": 970000,
        "quantity": 1,
        "image": "..."
      }
    ],
    "subtotal": 970000,
    "shippingFee": 30000,
    "totalAmount": 1000000,
    "paymentMethod": "COD",
    "paymentStatus": "UNPAID",
    "status": "PENDING",
    "createdAt": "2026-08-29T14:45:00.000Z"
  }
}
```

---

### 2.2. [POST] `/orders/create-payment-intent`
**Mô tả:** Khởi tạo đơn hàng dạng Stripe và lấy `clientSecret` cho Frontend Stripe CardElement.
- **Request Body:** Tương tự `/orders` với `paymentMethod: "STRIPE"`.
- **Response 201:**
```json
{
  "status": 201,
  "message": "Khởi tạo thanh toán thành công",
  "data": {
    "clientSecret": "pi_3Mxxx_secret_xxx",
    "orderId": "66ce789abc1234567890",
    "totalAmount": 1000000
  }
}
```

---

### 2.3. [POST] `/webhook/stripe`
**Mô tả:** Nhận webhook event `payment_intent.succeeded` hoặc `payment_intent.payment_failed` từ Stripe để cập nhật `paymentStatus` sang `PAID` / `FAILED`.

---

### 2.4. [GET] `/orders/:id`
**Mô tả:** Lấy thông tin đơn hàng theo ID.
- **Response 200:**
```json
{
  "status": 200,
  "data": { ... }
}
```

---

### 2.5. [GET] `/orders/my?email=nguyenvana@gmail.com`
**Mô tả:** Lấy danh sách các đơn hàng đã đặt theo email khách hàng hoặc user ID.
