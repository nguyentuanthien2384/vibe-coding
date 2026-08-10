# Ý TƯỞNG: Danh sách sản phẩm (Product List Page)

**1. Thông tin chung (Meta Info)**
* **Dự án:** TechBite
* **Tính năng:** Danh sách sản phẩm.
* **Mục đích:** Hiển thị danh sách sản phẩm, đầy đủ thông tin sản phẩm giống trang chủ.

**2. Đối tượng & Trải nghiệm (Target & UX)**
* **Người dùng chính:** Lập trình viên, dân văn phòng, học viên IT hay thức khuya chạy deadline.
* **Hành động chính:** Thể hiện bộ lọc để người dùng dễ dàng tìm kiếm được sản phẩm mong muốn, danh sách sản phẩm chia 4 cột, dễ dàng thao tác lọc và xem chi tiết sản phẩm
* **Cảm xúc mang lại:** Tươi trẻ, kích thích vị giác, tốc độ tải siêu nhanh (không dùng quá nhiều hiệu ứng rườm rà làm chậm web).

**3. Đặc tả Thiết kế (Design Specs)**
* **Phong cách UI:** Sạch sẽ (Clean), ưu tiên không gian trắng (Whitespace) để làm nổi bật hình ảnh món ăn. Các khối nội dung bo góc mềm mại (`rounded-2xl`).
* **Màu sắc chủ đạo (Brand Colors):** – Màu Cam thương hiệu BẮT BUỘC dùng cho các nút Call-to-Action chính (Mua ngay, Thêm vào giỏ): `bg-[#ff8c42]`.
  – Màu Đỏ mận dùng cho các huy hiệu (Badge) giảm giá hoặc chữ nổi bật: `bg-[#A63D40]` hoặc `text-[#A63D40]`.
* **Cấu trúc Màn hình (Top to Bottom):**
  – **Banner:** Một banner lớn nổi bật dạng ảnh
  – **Danh sách sản phẩm:** Dạng grid chia 4 cột, có phân trang, sắp xếp: Thời gian cập nhật, giá, nổi bật
  – **Bộ lọc:** Nằm ở cột bên trái, có nút để ẩn bộ lọc nhằm mục đích phóng to phần sản phẩm

**4. Dữ liệu cốt lõi (Mock Data)**
* **Banner:** Sử dụng 1 ảnh quảng cáo bất kỳ trên unsplash.com
* **Danh sách sản phẩm:** Lấy tên sản phẩm bất kỳ đến đồ ăn, đồ uống. Ảnh sản phẩm lấy tương ứng trên unsplash.com
