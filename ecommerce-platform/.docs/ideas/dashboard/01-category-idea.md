# Ý TƯỞNG: Trang quản lý chuyên mục sản phẩm

**1. Thông tin chung (Meta Info)**
* **Dự án:** TechBite.
* **Tính năng:** Quản lý chuyên mục sản phẩm
* **Mục đích:** Hiển thị danh sách chuyên mục sản phẩm, có bộ lọc chuyên mục, có chức năng thêm, sửa, xóa chuyên mục sản phẩm
* **Mockup:** Lấy khung của `.docs/ui-mockups/dash-products/index.html` làm chuẩn

**2. Đối tượng & Trải nghiệm (Target & UX)**
* **Người dùng chính:** Quản trị viên, nhân viên trong hệ thống
* **Hành động chính:** Thêm, sửa, xóa, tìm kiếm chuyên mục sản phẩm
* **Cảm xúc mang lại:** Dễ sử dụng, tốc độ tải siêu nhanh (không dùng quá nhiều hiệu ứng rườm rà làm chậm web).

**3. Đặc tả Thiết kế (Design Specs)**
* **Phong cách UI:** Sạch sẽ (Clean), ưu tiên không gian trắng (Whitespace) để làm nổi bật hình ảnh món ăn. Các khối nội dung bo góc mềm mại (`rounded-2xl`).
* **Màu sắc chủ đạo (Brand Colors):** Theo file mockup

* **Cấu trúc Màn hình (Top to Bottom):**
- Tiêu đề
- Nút thêm mới
- Bộ lọc
- Bảng chứa danh sách chuyên mục
+ Ảnh Icon
+ Tên
+ Chuyên mục cha
+ Trạng thái
+ Nút xem chuyên mục: Mở link frontend tương ứng: `http://localhost:3001/category/[ten-slug]`
+ Nút sửa, xóa (Dùng icon)
- Phân trang

* **Chức năng thêm, sửa, xóa:**

- Hiển thị dạng modal
- Chức năng xóa sẽ có confirm