# Ý TƯỞNG: Email Notifications

**1. Thông tin chung (Meta Info)**
* **Dự án:** TechBite.
* **Tính năng:** Gửi email thông báo khi đặt hàng, đăng ký tài khoản, đổi mật khẩu, refresh token bị lộ
* **Mục đích:** Khách hàng nhận được thông báo kịp thời, cảnh báo liên quan đến bảo mật
**2. Đối tượng & Trải nghiệm (Target & UX)**
* **Người dùng chính:** Lập trình viên, dân văn phòng, học viên IT hay thức khuya chạy deadline.
* **Hành động chính:** Khi người dùng có các hành động liên quan đặt hàng, đăng ký tài khoản, đổi mật khẩu, refresh token bị lộ sẽ nhận được thông báo
* **Cảm xúc mang lại:** Template email chuyên nghiệp, nội dung ngắn gọn, tiêu đề rõ ràng
**3. Đặc tả Thiết kế (Design Specs)**
* **Phong cách UI:** Sạch sẽ (Clean), ưu tiên không gian trắng (Whitespace) để làm nổi bật hình ảnh sản phẩm, khối nội dung bo góc mềm mại (`rounded-2xl`).
* **Màu sắc chủ đạo (Brand Colors):** - Màu Cam thương hiệu BẮT BUỘC dùng cho các nút Call-to-Action chính (Mua ngay, Thêm vào giỏ): `bg-[#ff8c42]`.
  - Màu Đỏ mận dùng cho các huy hiệu (Badge) giảm giá hoặc chữ nổi bật: `bg-[#A63D40]` hoặc `text-[#A63D40]`.

* **Cấu trúc Màn hình (Top to Bottom):**

- Logo
- Lời chào
- Nội dung báo
- Footer