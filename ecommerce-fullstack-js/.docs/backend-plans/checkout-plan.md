# BACKEND PLAN: CHECKOUT

> **Tech Stack:** Node.js, Express 4, MongoDB (Mongoose), Stripe SDK  
> **Tuân thủ:** AGENTS.md — MVC Pattern, bcrypt, JWT, try/catch chuẩn

---

## Trụ cột 1: Thiết kế Dữ liệu (Database Schema)

### Collection: `orders`

```js
// models/Order.js

const OrderItemSchema = new mongoose.Schema({
  productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },   // SNAPSHOT — không đổi theo Product
  price:       { type: Number, required: true },   // Giá tại thời điểm mua (Number, đơn vị VND)
  quantity:    { type: Number, required: true, min: 1 },
  image:       { type: String, default: '' },
}, { _id: false })

const OrderSchema = new mongoose.Schema({
  // Customer
  customerName:  { type: String, required: true, trim: true },
  customerEmail: { type: String, required: true, lowercase: true, trim: true },
  customerPhone: { type: String, required: true, trim: true },

  // Shipping
  shippingAddress: {
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    country: { type: String, default: 'Vietnam' },
  },

  // Items (snapshot)
  items: { type: [OrderItemSchema], required: true },

  // Pricing (tính server-side)
  subtotal:    { type: Number, required: true },
  shippingFee: { type: Number, default: 30000 },
  totalAmount: { type: Number, required: true },

  // Payment
  paymentMethod: { type: String, enum: ['COD', 'STRIPE'], required: true },
  paymentStatus: { type: String, enum: ['UNPAID', 'PAID', 'FAILED'], default: 'UNPAID' },
  stripePaymentIntentId: { type: String, default: null },

  // Auth (optional — null nếu guest)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Order lifecycle
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING',
  },
}, { timestamps: true })

// Index
OrderSchema.index({ customerEmail: 1 })
OrderSchema.index({ userId: 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ 'stripePaymentIntentId': 1 }, { sparse: true })
```

---

## Trụ cột 2: Giao kèo API (API Contract)

### Tổng quan Endpoints

| Method | Route | Auth | Mô tả |
|--------|-------|------|-------|
| `POST` | `/orders` | Optional | Tạo order COD |
| `POST` | `/orders/create-payment-intent` | Optional | Khởi tạo Stripe PaymentIntent |
| `POST` | `/webhook/stripe` | Stripe-Signature Header | Nhận kết quả từ Stripe |
| `GET`  | `/orders/my` | Required (JWT) | Lịch sử đơn hàng user đã login |
| `GET`  | `/orders/:id` | Optional | Xem chi tiết 1 đơn hàng |

---

### `POST /orders` — Tạo đơn COD

**Request Body:**
```json
{
  "customerName":  "Nguyễn Văn A",
  "customerEmail": "a@gmail.com",
  "customerPhone": "0901234567",
  "shippingAddress": {
    "street": "123 Đường Lê Lợi",
    "city":   "Hồ Chí Minh"
  },
  "paymentMethod": "COD",
  "items": [
    {
      "productId":   "64abc123...",
      "quantity":    2
    }
  ]
}
```

> ⚠️ **Giá KHÔNG nhận từ client.** Backend tự query Product để lấy giá thực.

**Logic Backend (Controller):**
1. Validate input
2. Query `Product.findById` cho từng `productId` trong `items`
3. Tính `subtotal = Σ (product.priceNumber * quantity)`
4. Tính `totalAmount = subtotal + shippingFee (30000)`
5. Build `orderItems` dạng snapshot (productName, price, image từ DB)
6. Lưu Order với `paymentMethod: 'COD'`, `status: 'PENDING'`, `paymentStatus: 'UNPAID'`
7. Trả về Order

**Response 201:**
```json
{
  "status": 201,
  "message": "Đặt hàng thành công",
  "data": {
    "_id": "order_id_here",
    "customerName": "Nguyễn Văn A",
    "totalAmount": 2140000,
    "paymentMethod": "COD",
    "status": "PENDING",
    "createdAt": "2026-08-28T14:00:00.000Z"
  }
}
```

**Response 400 (Validation):**
```json
{ "status": 400, "message": "customerEmail không hợp lệ" }
```

**Response 404 (Product not found):**
```json
{ "status": 404, "message": "Sản phẩm productId:xxx không tồn tại" }
```

---

### `POST /orders/create-payment-intent` — Khởi tạo Stripe

**Request Body:** Giống `POST /orders` nhưng `paymentMethod: 'STRIPE'`

**Logic Backend:**
1. Validate input
2. Query Product → tính giá server-side (giống COD)
3. Lưu Order với `paymentStatus: 'UNPAID'`
4. Gọi `stripe.paymentIntents.create({ amount: totalAmount, currency: 'vnd' })`
5. Update `order.stripePaymentIntentId = paymentIntent.id`
6. Trả về `{ clientSecret, orderId }`

**Response 201:**
```json
{
  "status": 201,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "orderId": "64abc..."
  }
}
```

---

### `POST /webhook/stripe` — Stripe Webhook

**Headers:** `stripe-signature: whsec_...`

**Logic Backend:**
```
1. stripe.webhooks.constructEvent(req.rawBody, sig, STRIPE_WEBHOOK_SECRET)
2. if event.type === 'payment_intent.succeeded':
   - Lấy paymentIntentId từ event.data.object.id
   - Order.findOneAndUpdate({ stripePaymentIntentId }, { paymentStatus: 'PAID', status: 'CONFIRMED' })
3. if event.type === 'payment_intent.payment_failed':
   - Update { paymentStatus: 'FAILED', status: 'CANCELLED' }
4. Trả về 200 ngay lập tức (Stripe yêu cầu)
```

> ⚠️ Webhook phải dùng `express.raw()` middleware (KHÔNG dùng `express.json()` cho route này)

**Response 200:**
```json
{ "received": true }
```

---

### `GET /orders/my` — Lịch sử đơn hàng (Cần JWT)

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "status": 200,
  "data": [
    {
      "_id": "...",
      "totalAmount": 2140000,
      "status": "PENDING",
      "paymentMethod": "COD",
      "items": [...],
      "createdAt": "..."
    }
  ]
}
```

---

### `GET /orders/:id` — Chi tiết đơn hàng

**Response 200:**
```json
{
  "status": 200,
  "data": { /* Full Order document */ }
}
```

---

## Trụ cột 3: Architecture & Bất đồng bộ

### Rate Limiting
```js
// Middleware áp dụng cho POST /orders và POST /orders/create-payment-intent
// 5 requests / 1 phút / IP
const rateLimit = require('express-rate-limit')
const orderLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 })
```
> Cần cài: `npm install express-rate-limit`

### Stripe Raw Body
```js
// index.js — PHẢI đặt TRƯỚC express.json()
app.use('/webhook/stripe', express.raw({ type: 'application/json' }))
app.use(express.json())
```

### Cấu trúc File Backend

```
backend/
├── models/
│   └── Order.js              ← NEW: Mongoose schema
├── controllers/
│   ├── Products.js           ← Đã có
│   └── Orders.js             ← NEW: createOrder, createPaymentIntent, stripeWebhook, getMyOrders
├── routes/
│   ├── products.js           ← Đã có
│   └── orders.js             ← NEW
├── middlewares/
│   └── rateLimiter.js        ← NEW
└── index.js                  ← Update: thêm /webhook/stripe raw route
```

### ENV bổ sung cần thêm vào `.env`
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Dependencies cần cài
```bash
npm install stripe express-rate-limit
```

### Không cần Queue/Cache tại MVP
- Số lượng order nhỏ → không cần BullMQ/Redis Queue
- Order data không cần cache → mỗi request đọc thẳng từ DB
- **Tương lai:** Khi scale, đẩy email xác nhận vào Queue để xử lý ngầm

---

## Checklist thi công (cho `/code-api`)

- [ ] `models/Order.js` — Tạo Mongoose schema với đầy đủ index
- [ ] `controllers/Orders.js` — 4 hàm: `createOrder`, `createPaymentIntent`, `stripeWebhook`, `getMyOrders`
- [ ] `routes/orders.js` — Mount routes + áp dụng rateLimiter
- [ ] `middlewares/rateLimiter.js` — express-rate-limit config
- [ ] `index.js` — Thêm raw body route cho Stripe webhook, mount `/` orders router
- [ ] `.env` — Thêm `STRIPE_SECRET_KEY` và `STRIPE_WEBHOOK_SECRET`
