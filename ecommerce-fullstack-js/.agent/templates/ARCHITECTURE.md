# KIẾN TRÚC HỆ THỐNG: E-COMMERCE PLATFORM

## 1. Sơ đồ dữ liệu cốt lõi (Core Database Entities)
- **Product (Sản phẩm):** Lưu thông tin cơ bản, `price` (giá gốc), `salePrice` (giá khuyến mãi), `stock` (tồn kho).
- **Category (Danh mục):** Phân loại sản phẩm (Quần áo, Điện tử...). Hỗ trợ cấu trúc cây (Parent - Child).
- **Cart & CartItem (Giỏ hàng):** Lưu trạng thái giỏ hàng tạm thời. Nếu user chưa login, dùng Session/Local Storage. Nếu đã login, lưu vào DB.
- **Order & OrderItem (Đơn hàng):** Lưu trữ lịch sử mua hàng bất biến (Snapshot). Giá sản phẩm trong OrderItem BẮT BUỘC lưu cứng tại thời điểm mua, không tham chiếu lại giá bảng Product.

## 2. Luồng nghiệp vụ tối quan trọng (Critical Business Logic)
- **Tính toán tiền (Pricing):** - Mọi phép tính tiền tệ (Tổng đơn, Giảm giá, Thuế) BẮT BUỘC thực hiện ở Backend (NestJS/Laravel).
  - TUYỆT ĐỐI không tin tưởng dữ liệu giá tiền gửi lên từ Frontend. Frontend chỉ gửi `productId` và `quantity`.
- **Quản lý Tồn kho (Inventory):**
  - Trừ `stock` ngay khi thanh toán thành công.
  - Nếu `stock === 0`, API không cho phép thêm vào giỏ hàng.
- **Thanh toán (Payment Checkout):**
  - Trạng thái Order mặc định là `PENDING`.
  - Chỉ chuyển sang `PAID` qua Webhook trả về từ Cổng thanh toán (Stripe/VNPay).

## 3. Quy chuẩn API (API Standards)
- **Phân trang (Pagination):** Mọi API trả về danh sách (Ví dụ: Lấy danh sách sản phẩm) bắt buộc phải có phân trang (page, limit, totalPages).
- **Bảo mật:** API tạo Đơn hàng bắt buộc phải có Rate Limit để chống Spam.

## 4. Module Auth (Xác thực, phân quyền & bảo mật)

### 4.1. Tổng quan nghiệp vụ

- Hệ thống sử dụng cơ chế **JWT** kết hợp với **Redis** để quản lý phiên đăng nhập theo thời gian thực
- Việc quản lý Token qua Redis nhằm mục đích: Thu hồi quyền truy cập ngay lập tức khi phát hiện rủi ro và chặn các phiên đăng nhập khi người dùng đã Logout

### 4.2. Định nghĩa vai trò

- `ADMIN`: Toàn quyền quản trị. Có thể truy cập mọi Dashboard, duyệt User mới, và thu hồi quyền bất kỳ ai
- `STAFF`: Nhân viên quản lý. Chỉ cho phép truy cập 1 số chức năng nhất định trong trang quản trị. Ví dụ: Tạo order, xem lịch sử order của chính mình,...
- `CUSTOMER`: Khách hàng nội bộ. Chỉ được xem order của chính mình, đặt hàng, quản lý sản phẩm trong giỏ hàng của chính mình.

### 4.3. Chiến lược Refresh Token Rotation

- **Luồng chuẩn**: Khi access token (15 phút) hết hạn, client tự động gọi api refresh token kèm theo `REFRESH TOKEN A`. Hệ thống xác thực trong Redis, xóa `REFRESH TOKEN A`, sinh ra `RREFRESH TOKEN B` + `ACCESS TOKEN NEW` và trả về cho CLIENT
- **Kịch bản taants công Replay Attack**:
+ Nếu hacker trộm được `REFRESH TOKEN A` và cố gắng sử dụng lại nó (Trong khi Client thực đã đổi sang `REFRESH TOKEN B`)
+ Hệ thống kiểm tra Redis thấy `REFRESH TOKEN A` không tồn tại hoặc đã bị đánh dấu sử dụng hoặc thu hồi
+ **Hành động bắt buộc**: Phát tín hiệu CẢNH BÁO BẢO MẬT. Ngay lập tức xóa TOÀN BỘ Refresh Token của `userId` trong Redis để ép tất cả thiết bị phải đăng nhập lại từ đầu

### 4.4. Chiến lược đăng xuất

- Khi user bấm nút đăng xuất. `Refresh Token` hiện tại sẽ bị xóa khỏi Redis
- Đồng thời, `Access Token` hiện tại (Dù còn hạn) phải được đưa vào danh sách **BlackList** trên Redis với thời gian tồn tại bằng đúng thời gian còn lại của token đó
