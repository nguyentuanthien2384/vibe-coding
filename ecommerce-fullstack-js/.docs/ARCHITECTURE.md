# KIẾN TRÚC HỆ THỐNG: E-COMMERCE PLATFORM

> **Trạng thái:** Đang phát triển | **Cập nhật lần cuối:** 2026-08-28

## 1. Tổng quan hệ thống

Dự án E-Commerce Fullstack sử dụng kiến trúc MVC truyền thống với:
- **Frontend:** React SPA kết nối REST API
- **Backend:** Express REST API phục vụ dữ liệu
- **Database:** MongoDB (có thể dùng mock data JSON khi dev)

```
app/
├── frontend/       # React 18 SPA
│   └── src/
│       ├── components/    # UI components
│       ├── pages/         # Page components (route targets)
│       ├── store/         # Redux Toolkit slices
│       ├── services/      # Axios API calls
│       ├── routers/       # React Router config
│       └── assets/        # Static assets
└── backend/        # Express REST API
    ├── controllers/       # Request handlers
    ├── routes/            # Route definitions
    ├── connection/        # DB connection (Mongoose)
    └── data/              # Mock data (JSON)
```

## 2. Sơ đồ dữ liệu cốt lõi (Core Database Entities)

### Product (Sản phẩm)
```
{
  id: Number,
  productName: String,
  imgUrl: String,
  category: String,
  price: Number,        // Giá gốc
  shortDesc: String,
  description: String,
  reviews: [{ rating, text }],
  avgRating: Number
}
```

### Cart (Giỏ hàng)
- Lưu trên **Redux Store** (client-side state)
- Cấu trúc: `{ cartItems: [{ id, productName, price, quantity, imgUrl }], totalAmount, totalQuantity }`

### Order (Đơn hàng) — *Chưa implement*
- Khi implement: Giá phải **snapshot tại thời điểm mua**, không tham chiếu lại Product table

## 3. Luồng nghiệp vụ tối quan trọng (Critical Business Logic)

### Tính toán tiền (Pricing)
- **Hiện tại:** Tính toán client-side trong Redux reducer
- **Chuẩn:** Mọi phép tính tổng đơn, giảm giá BẮT BUỘC verify lại ở Backend trước khi xử lý thanh toán

### Giỏ hàng (Cart)
- Guest user: Lưu trong Redux (mất khi reload nếu chưa persist)
- Logged-in user (khi implement auth): Sync với DB

### Thanh toán
- Trạng thái Order mặc định: `PENDING`
- Chỉ chuyển sang `PAID` sau khi nhận Webhook từ Payment Gateway

## 4. Quy chuẩn API (API Standards)

### Base URL
- Development: `http://localhost:3000`
- Production: `https://full-stack-api.onrender.com`

### Endpoints hiện có
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/products` | Lấy tất cả sản phẩm |
| GET | `/products/:id` | Lấy sản phẩm theo ID |

### Response Format
```json
{
  "status": 200,
  "data": [...],
  "message": "Success"
}
```

### Quy chuẩn
- **Phân trang:** Mọi API list phải có: `page`, `limit`, `totalPages`
- **Bảo mật:** API tạo Order phải có Rate Limit

## 5. Module Auth (Kế hoạch tương lai)

### Vai trò người dùng
- `ADMIN`: Toàn quyền quản trị
- `CUSTOMER`: Đặt hàng, xem lịch sử đơn hàng của chính mình

### Chiến lược JWT + Redis
- Access Token: 15 phút
- Refresh Token Rotation: Xóa token cũ, cấp token mới mỗi lần refresh
- Blacklist: Đưa Access Token còn hạn vào Redis blacklist khi logout

## 6. Môi trường & Biến môi trường

### Backend `.env`
```
PORT=3000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_secret_here
REFRESH_TOKEN_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
```
