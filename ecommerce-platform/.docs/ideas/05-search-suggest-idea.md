# Ý TƯỞNG: Search Suggest (Tìm kiếm gợi ý)

**1. Thông tin chung (Meta Info)**
* **Dự án:** TechBite.
* **Tính năng:** Tìm kiếm sản phẩm có gợi ý
* **Mục đích:** Khách hàng dễ dàng tìm kiếm sản phẩm và xem kết quả ngay trên Header

**2. Đối tượng & Trải nghiệm (Target & UX)**
* **Người dùng chính:** Lập trình viên, dân văn phòng, học viên IT hay thức khuya chạy deadline.
* **Hành động chính:** Người dùng gõ từ khóa tìm kiếm sẽ hiển thị kết quả ngay lập tức
* **Cảm xúc mang lại:** Kích thích bấm vào xem chi tiết sản phẩm

**3. Đặc tả Thiết kế (Design Specs)**
* **Phong cách UI:** Sạch sẽ (Clean), ưu tiên không gian trắng (Whitespace) để làm nổi bật hình ảnh sản phẩm, khối nội dung bo góc mềm mại (`rounded-2xl`).
* **Màu sắc chủ đạo (Brand Colors):** - Màu Cam thương hiệu BẮT BUỘC dùng cho các nút Call-to-Action chính (Mua ngay, Thêm vào giỏ): `bg-[#ff8c42]`.
  - Màu Đỏ mận dùng cho các huy hiệu (Badge) giảm giá hoặc chữ nổi bật: `bg-[#A63D40]` hoặc `text-[#A63D40]`.

* **Cấu trúc Màn hình (Top to Bottom):**

- Hiển thị danh sách tối 5 sản phẩm khớp với từ khóa
- Có ảnh sản phẩm ở bên trái
- Tên sản phẩm và giá ở bên phải
- Nếu tên sản phẩm dài quá, hãy cắt bỏ để đảm bảo nằm trên 1 dòng
- Có nút xem tất cả kết quả và chuyển sang trang kết quả tìm kiếm
