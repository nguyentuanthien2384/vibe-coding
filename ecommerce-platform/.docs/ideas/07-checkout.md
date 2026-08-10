# Ý TƯỞNG: Checkout Page

**1. Thông tin chung (Meta Info)**
* **Dự án:** TechBite.
* **Tính năng:** Trang thanh toán
* **Mục đích:** Khách hàng có thể thực hiện thao tác thanh toán đơn hàng dễ dàng, có hỗ trợ thanh toán qua COD, quét mã QR Code (Tự động xác nhận đơn hàng)
**2. Đối tượng & Trải nghiệm (Target & UX)**
* **Người dùng chính:** Lập trình viên, dân văn phòng, học viên IT hay thức khuya chạy deadline.
* **Hành động chính:** Người dùng sẽ truy cập trang thanh toán từ trang giỏ hàng, sau đó thực hiện nhập thông tin cá nhân. Nếu đã đăng nhập thì không cần nhập. Có hiển thị giỏ hàng mini để tiện theo dõi
* **Cảm xúc mang lại:** Dễ sử dụng, thông tin cần nhập nhanh chóng
**3. Đặc tả Thiết kế (Design Specs)**
* **Phong cách UI:** Sạch sẽ (Clean), ưu tiên không gian trắng (Whitespace) để làm nổi bật hình ảnh sản phẩm, khối nội dung bo góc mềm mại (`rounded-2xl`).
* **Màu sắc chủ đạo (Brand Colors):** - Màu Cam thương hiệu BẮT BUỘC dùng cho các nút Call-to-Action chính (Mua ngay, Thêm vào giỏ): `bg-[#ff8c42]`.
  - Màu Đỏ mận dùng cho các huy hiệu (Badge) giảm giá hoặc chữ nổi bật: `bg-[#A63D40]` hoặc `text-[#A63D40]`.

* **Cấu trúc Màn hình (Top to Bottom):**

Chia bố cục thành 2 cột:

1. Cột trái: Thông tin người dùng
- Họ tên
- Email
- Số điện thoại
- Địa chỉ nhận hàng
- Chọn phương thức vận chuyển
- Ghi chú đơn hàng
- Checkbox điều khoản

2. Cột phải: Đơn hàng

- Giỏ hàng (hiển thị lại sản phẩm)
- Thành tiền
- Input nhập mã giảm giá
- Chọn phương thức toán: COD, QR Code
- Nút thanh toán
+ Nếu chọn: COD sẽ hiển popup hiển thị ghi chú: Thanh toán trực tiếp cho shipper khi nhận hàng
+ Nếu chọn: QR Code sẽ hiển thị popup hiển thị QR Code, có đồng hồ đếm ngược và nút tải QR Code