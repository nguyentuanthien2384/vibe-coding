# Ý TƯỞNG: Trang settings

**1. Thông tin chung (Meta Info)**
* **Dự án:** TechBite.
* **Tính năng:** Thiết lập cho website
* **Mục đích:** Xây dựng trang thiết lập (Settings) đơn giản, dễ sử dụng, dễ mở rộng

**2. Đối tượng & Trải nghiệm (Target & UX)**
* **Người dùng chính:** Quản trị viên, nhân viên trong hệ thống
* **Hành động chính:** Thiết lập bất kỳ nội dung nào hiển thị ngoài frontend
* **Cảm xúc mang lại:** Dễ sử dụng, tốc độ tải siêu nhanh (không dùng quá nhiều hiệu ứng rườm rà làm chậm web).

**4. Đặc tả Thiết kế (Design Specs)**
* **Phong cách UI:** Sạch sẽ (Clean), ưu tiên không gian trắng (Whitespace) để làm nổi bật hình ảnh món ăn. Các khối nội dung bo góc mềm mại (`rounded-2xl`).
* **Màu sắc chủ đạo (Brand Colors):** Theo màu sắc chung của trang dashboard

* **Cấu trúc Màn hình (Top to Bottom):**
- Tiêu đề
- Hiển thị danh sách các settings
- Khi bấm vào chi tiết 1 settings sẽ có input để thay đổi
- Với các setting dạng danh sách (banner, menu,...) sẽ có nút thêm mới linh hoạt (Dạng repeater)
