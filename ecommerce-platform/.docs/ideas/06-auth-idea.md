# Ý TƯỞNG: Authentication

**1. Thông tin chung (Meta Info)**
* **Dự án:** TechBite.
* **Tính năng:** Xử lý xác thực và ủy quyền
* **Mục đích:** Khách hàng có thể thực hiện việc đăng ký tài khoản và đăng nhập phục vụ cho việc mua hàng, thay đổi thông tin cá nhân
**2. Đối tượng & Trải nghiệm (Target & UX)**
* **Người dùng chính:** Lập trình viên, dân văn phòng, học viên IT hay thức khuya chạy deadline.
* **Hành động chính:** Người dùng truy cập menu đăng nhập trên Header, sau đó sẽ chuyển sang trang đăng nhập. Tại trang đăng nhập sẽ có liên kết tới trang đăng ký
* **Cảm xúc mang lại:** Dễ sử dụng, thông tin đăng ký ít để kích thích việc đăng ký tài khoản
**3. Đặc tả Thiết kế (Design Specs)**
* **Phong cách UI:** Sạch sẽ (Clean), ưu tiên không gian trắng (Whitespace) để làm nổi bật hình ảnh sản phẩm, khối nội dung bo góc mềm mại (`rounded-2xl`).
* **Màu sắc chủ đạo (Brand Colors):** - Màu Cam thương hiệu BẮT BUỘC dùng cho các nút Call-to-Action chính (Mua ngay, Thêm vào giỏ): `bg-[#ff8c42]`.
  - Màu Đỏ mận dùng cho các huy hiệu (Badge) giảm giá hoặc chữ nổi bật: `bg-[#A63D40]` hoặc `text-[#A63D40]`.

* **Cấu trúc Màn hình (Top to Bottom):**

1. Trang đăng ký
- Input: Họ và tên, Email, Số điện thoại, Mật khẩu, Xác nhận mật khẩu
- Bắt buộc: Email phải có định dạng email
- Có liên kết tới trang đăng nhập

2. Trang đăng nhập
- Input: Email, Mật khẩu
- Yêu cầu: Chỉ hiển thị 1 nút đăng nhập.
- Có liên kết tới trang đăng ký

3. Trang profile
- Thông tin cá nhân
- Lịch sử mua hàng
- Đăng xuất

4. Header sau khi đăng nhập

- Hiển thị lời chào
- Link tài khoản
