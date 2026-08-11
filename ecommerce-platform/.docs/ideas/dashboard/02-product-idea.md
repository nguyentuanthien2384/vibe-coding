# Ý TƯỞNG: Trang quản lý chuyên mục sản phẩm

**1. Thông tin chung (Meta Info)**
* **Dự án:** TechBite.
* **Tính năng:** Quản lý sản phẩm
* **Mục đích:** Hiển thị danh sách sản phẩm, có bộ lọc sản phẩm, có chức năng thêm, sửa, xóa chuyên mục sản phẩm
* **Mockup:** Lấy khung của `.docs/ui-mockups/dash-products/index.html` làm chuẩn

**2. Đối tượng & Trải nghiệm (Target & UX)**
* **Người dùng chính:** Quản trị viên, nhân viên trong hệ thống
* **Hành động chính:** Thêm, sửa, xóa, tìm kiếm sản phẩm
* **Cảm xúc mang lại:** Dễ sử dụng, tốc độ tải siêu nhanh (không dùng quá nhiều hiệu ứng rườm rà làm chậm web).

**3. Đặc tả Thiết kế (Design Specs)**
* **Phong cách UI:** Sạch sẽ (Clean), ưu tiên không gian trắng (Whitespace) để làm nổi bật hình ảnh món ăn. Các khối nội dung bo góc mềm mại (`rounded-2xl`).
* **Màu sắc chủ đạo (Brand Colors):** Theo file mockup

* **Cấu trúc Màn hình (Top to Bottom):**
- Tiêu đề
- Nút thêm mới
- Bộ lọc
- Bảng chứa danh sách sản phẩm
+ Ảnh
+ Tên
+ slug (Dưới tên sản phẩm)
+ Giá gốc, giá khuyến mãi
+ Stock
+ Tên chuyên mục (Bấm vào tên chuyên mục sẽ thực hiện lọc theo chuyên mục đó)
+ Trạng thái
+ Nút sửa, xóa
- Phân trang

* **Chức năng thêm, sửa, xóa:**

- Xử lý ở trang riêng
- Form cập nhật đầy đủ thông tin như trong Database (Trừ saleCount)
- Phần longDescription và shortDescription sẽ dùng Editor để dễ dàng định dạng. Editor sẽ xuất thành dạng json trước khi lưu vào DB. TUYỆT ĐỐI không xuất ra html hoặc markdown