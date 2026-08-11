# Ý TƯỞNG: Trang quản lý nhân viên

**1. Thông tin chung (Meta Info)**
* **Dự án:** TechBite.
* **Tính năng:** Quản lý nhân viên
* **Mục đích:** Hiển thị danh sách nhân viên, có bộ lọc, xem được thông tin chi tiết nhân viên, và quyền hạn của nhân viên
* **Mockup:** Lấy khung của `.docs/ui-mockups/dash-products/index.html` làm chuẩn

**2. Đối tượng & Trải nghiệm (Target & UX)**
* **Người dùng chính:** Quản trị viên
* **Hành động chính:** Tra cứu, xem thông tin nhân viên, thay đổi, cập nhật trạng thái nhân viên
* **Cảm xúc mang lại:** Dễ sử dụng, tốc độ tải siêu nhanh (không dùng quá nhiều hiệu ứng rườm rà làm chậm web).

**3. Logic**

Chỉ hiển thị những user có role là `ADMIN` và `STAFF`

**4. Đặc tả Thiết kế (Design Specs)**
* **Phong cách UI:** Sạch sẽ (Clean), ưu tiên không gian trắng (Whitespace) để làm nổi bật hình ảnh món ăn. Các khối nội dung bo góc mềm mại (`rounded-2xl`).
* **Màu sắc chủ đạo (Brand Colors):** Theo file mockup

* **Cấu trúc Màn hình (Top to Bottom):**
- Tiêu đề
- Nút thêm mới: Tạo nhân viên
- Bảng hiển thị danh sách nhân viên
+ Tên
+ Email
+ Số điện thoại
+ Trạng thái
+ Thời gian
+ Nút xem chi tiết
+ Nút phân quyền
- Phân trang

* **Chức năng xem chi tiết nhân viên:**

- Hiển thị thông tin của nhân viên
- Quyền hạn của nhân viên

* **Chức năng phân quyền nhân viên:**

- Có bảng chọn các quyền của nhân viên