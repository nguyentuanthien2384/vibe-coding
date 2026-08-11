# Ý TƯỞNG: Trang quản lý khách hàng

**1. Thông tin chung (Meta Info)**
* **Dự án:** TechBite.
* **Tính năng:** Quản lý khách hàng
* **Mục đích:** Hiển thị danh sách khách hàng, có bộ lọc, xem được thông tin chi tiết khách hàng, địa chỉ của khách, dễ dàng thay đổi, cập nhật trạng thái
* **Mockup:** Lấy khung của `.docs/ui-mockups/dash-products/index.html` làm chuẩn

**2. Đối tượng & Trải nghiệm (Target & UX)**
* **Người dùng chính:** Quản trị viên, nhân viên trong hệ thống
* **Hành động chính:** Tra cứu, xem thông tin khách hàng, thay đổi, cập nhật trạng thái khách hàng
* **Cảm xúc mang lại:** Dễ sử dụng, tốc độ tải siêu nhanh (không dùng quá nhiều hiệu ứng rườm rà làm chậm web).

**3. Logic**

Chỉ hiện thị những khách có role là `CUSTOMER` và những khách hàng vãng lai (Không đăng ký tài khoản)

**4. Đặc tả Thiết kế (Design Specs)**
* **Phong cách UI:** Sạch sẽ (Clean), ưu tiên không gian trắng (Whitespace) để làm nổi bật hình ảnh món ăn. Các khối nội dung bo góc mềm mại (`rounded-2xl`).
* **Màu sắc chủ đạo (Brand Colors):** Theo file mockup

* **Cấu trúc Màn hình (Top to Bottom):**
- Tiêu đề
- Nút thêm mới: Tạo khách hàng thủ công
- Bảng hiển thị danh sách khách hàng
+ Tên
+ Email
+ Số điện thoại
+ Trạng thái
+ Thời gian
+ Nút xem chi tiết
- Phân trang

* **Chức năng xem chi tiết đơn hàng:**

- Danh sách địa chỉ của khách
- Danh sách đơn hàng của khách (Có phân trang)
