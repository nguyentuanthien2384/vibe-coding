# Ý TƯỞNG: Tích điểm và trừ điểm khi mua hàng

**1. Thông tin chung (Meta Info)**
* **Dự án:** TechBite.
* **Tính năng:** Tích điểm cho khách hàng khi hoàn thành đơn và trừ điểm khi khách mua đơn hàng mới
* **Mục đích:** Kích thích khách hàng quay lại và tiết kiệm chi phí cho khách
**2. Đối tượng & Trải nghiệm (Target & UX)**
* **Người dùng chính:** Lập trình viên, dân văn phòng, học viên IT hay thức khuya chạy deadline.
* **Hành động chính:** Khi người dùng có hành động mua hàng, hệ thống sẽ tự động tích điểm theo quy ước có sẵn (Có settings), khi khách hàng mua hàng hệ thống sẽ có options cho phép khách hàng trừ điểm để mua và chỉ phải thanh toán số tiền còn lại
* **Cảm xúc mang lại:** Tính năng chuyên nghiệp, linh hoạt và dễ sử dụng
**3. Đặc tả Thiết kế (Design Specs)**
* **Phong cách UI:** Sạch sẽ (Clean), ưu tiên không gian trắng (Whitespace) để làm nổi bật hình ảnh sản phẩm, khối nội dung bo góc mềm mại (`rounded-2xl`).
* **Màu sắc chủ đạo (Brand Colors):** - Màu Cam thương hiệu BẮT BUỘC dùng cho các nút Call-to-Action chính (Mua ngay, Thêm vào giỏ): `bg-[#ff8c42]`.
  - Màu Đỏ mận dùng cho các huy hiệu (Badge) giảm giá hoặc chữ nổi bật: `bg-[#A63D40]` hoặc `text-[#A63D40]`.

* **Cấu trúc Màn hình:**

- Hiển thị số điểm khách hàng có: Trong trang profile và trang checkout
- Options khi thanh toán
- Hiển thị số tiền còn lại thanh toán, nếu hết thì sẽ hiển `0đ`