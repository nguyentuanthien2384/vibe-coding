# Ý TƯỞNG: Danh sách sản phẩm (Product List Page)

**1. Thông tin chung (Meta Info)**
* **Dự án:** TechBite.
* **Tính năng:** Chi tieets sản phẩm.
* **Mục đích:** Hiển thị thông tin chi tiết sản phẩm

**2. Đối tượng & Trải nghiệm (Target & UX)**
* **Người dùng chính:** Lập trình viên, dân văn phòng, học viên IT hay thức khuya chạy deadline.
* **Hành động chính:** Thể hiện thông tin chi tiết của 1 sản phẩm: Tên, giá, mô tả, hình ảnh, nhiều ảnh thư viện liên quan đến (Nằm dưới ảnh đại diện sản phẩm), nút thêm vào giỏ, mua ngay, sản phẩm liên quan
* **Cảm xúc mang lại:** Tươi trẻ, kích thích vị giác, tốc độ tải siêu nhanh (không dùng quá nhiều hiệu ứng rườm rà làm chậm web).

**3. Đặc tả Thiết kế (Design Specs)**
* **Phong cách UI:** Sạch sẽ (Clean), ưu tiên không gian trắng (Whitespace) để làm nổi bật hình ảnh món ăn. Các khối nội dung bo góc mềm mại (`rounded-2xl`).
* **Màu sắc chủ đạo (Brand Colors):** - Màu Cam thương hiệu BẮT BUỘC dùng cho các nút Call-to-Action chính (Mua ngay, Thêm vào giỏ): `bg-[#ff8c42]`.
  - Màu Đỏ mận dùng cho các huy hiệu (Badge) giảm giá hoặc chữ nổi bật: `bg-[#A63D40]` hoặc `text-[#A63D40]`.
* **Cấu trúc Màn hình (Top to Bottom):**

Phần đầu: Bố cục chia 2 cột:

1. Cột trái:
- Tên sản phẩm
- Ảnh đại diện
- Ảnh thư viện
2. Cột phải:
- Giá tiền
- Mô tả ngắn
- Nút thêm vào giỏ
- Nút mua ngay

Phần bên dưới:
- Mô tả chi tiết sản phẩm
- Sản phẩm liên quan (4 sản phẩm, giao diện fullwidth)

**4. Dữ liệu cốt lõi (Mock Data)**
* **Ảnh sản phẩm:** Sử dụng 1 ảnh sản phẩm đúng với tên sản phẩm, lấy ở unsplash.com
* **Tên sản phẩm:** Lấy tên sản phẩm bất kỳ đến đồ ăn, đồ uống. Ảnh sản phẩm lấy tương ứng trên unsplash.com
* **Sản phẩm liên quan:**: Lấy tên sản phẩm bất kỳ đến đồ ăn, đồ uống. Ảnh sản phẩm lấy tương ứng trên unsplash.com
* **Mô tả sản phẩm:** Lấy nội dung bất kỳ liên quan đến sản phẩm
