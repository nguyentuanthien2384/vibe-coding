# Ý TƯỞNG: Trang quản lý đơn hàng

**1. Thông tin chung (Meta Info)**
* **Dự án:** TechBite.
* **Tính năng:** Quản lý đơn hàng
* **Mục đích:** Hiển thị danh sách đơn hàng, có bộ lọc đơn hàng, xem được thông tin chi tiết đơn hàng, dễ dàng thay đổi, cập nhật trạng thái
* **Mockup:** Lấy khung của `.docs/ui-mockups/dash-products/index.html` làm chuẩn

**2. Đối tượng & Trải nghiệm (Target & UX)**
* **Người dùng chính:** Quản trị viên, nhân viên trong hệ thống
* **Hành động chính:** Tra cứu, xem thông tin đơn hàng, thay đổi, cập nhật trạng thái đơn hàng
* **Cảm xúc mang lại:** Dễ sử dụng, tốc độ tải siêu nhanh (không dùng quá nhiều hiệu ứng rườm rà làm chậm web).

**3. Đặc tả Thiết kế (Design Specs)**
* **Phong cách UI:** Sạch sẽ (Clean), ưu tiên không gian trắng (Whitespace) để làm nổi bật hình ảnh món ăn. Các khối nội dung bo góc mềm mại (`rounded-2xl`).
* **Màu sắc chủ đạo (Brand Colors):** Theo file mockup

* **Cấu trúc Màn hình (Top to Bottom):**
- Tiêu đề
- Nút thêm mới: Tạo đơn hàng thủ công
- Bảng hiển thị danh sách đơn hàng
+ Mã đơn hàng
+ Tên và email khách hàng
+ Số tiền
+ Thời gian
+ Trạng thái thanh toán
+ Trạng thái đơn hàng
+ Nút xem chi tiết
- Phân trang

* **Chức năng xem chi tiết đơn hàng:**

- Theo dõi hành trình của đơn hàng
- Tình trạng thanh toán, phương thức thanh toán
- Thông tin người nhận hàng, địa chỉ nhận hàng
- Thông tin chi tiết về từng sản phẩm trong đơn hàng
+ Ảnh
+ Tên 
+ Số lượng
+ Đơn giá
+ Thành tiền
- Phí vận chuyển
- Giảm giá
- Tổng tiền
