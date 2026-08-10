# Ý TƯỞNG: TRANG CHỦ (Home Page)

**1. Thông tin chung (Meta Info)**
* **Dự án:** TechBite.
* **Tính năng:** Màn hình Trang chủ (Landing Page/Home).
* **Mục đích:** Là "phễu" đón khách đầu tiên. Phải tạo ngay cảm giác thèm ăn, năng động và giúp người dùng tìm thấy ngay món ăn vặt yêu thích chỉ sau 1-2 cú click.

**2. Đối tượng & Trải nghiệm (Target & UX)**
* **Người dùng chính:** Lập trình viên, dân văn phòng, học viên IT hay thức khuya chạy deadline.
* **Hành động chính:** Bấm vào các Banner khuyến mãi, lướt xem các danh mục món ăn (Category) và bấm nút "Thêm vào giỏ" ngay tại trang chủ mà không cần vào trang chi tiết.
* **Cảm xúc mang lại:** Tươi trẻ, kích thích vị giác, tốc độ tải siêu nhanh (không dùng quá nhiều hiệu ứng rườm rà làm chậm web).

**3. Đặc tả Thiết kế (Design Specs)**
* **Phong cách UI:** Sạch sẽ (Clean), ưu tiên không gian trắng (Whitespace) để làm nổi bật hình ảnh món ăn. Các khối nội dung bo góc mềm mại (`rounded-2xl`).
* **Màu sắc chủ đạo (Brand Colors):** - Màu Cam thương hiệu BẮT BUỘC dùng cho các nút Call-to-Action chính (Mua ngay, Thêm vào giỏ): `bg-[#ff8c42]`.
  - Màu Đỏ mận dùng cho các huy hiệu (Badge) giảm giá hoặc chữ nổi bật: `bg-[#A63D40]` hoặc `text-[#A63D40]`.
* **Cấu trúc Màn hình (Top to Bottom):**
  - **Hero Banner:** Một banner lớn nổi bật trên cùng giới thiệu "Combo Thức Khuya Coder", kèm một nút CTA to, rõ ràng.
  - **Danh mục (Categories):** Một hàng ngang các khối nhỏ có icon (Trà sữa, Khô gà, Bánh ngọt, Trái cây).
  - **Sản phẩm nổi bật (Featured Menu):** Dạng Grid hiển thị 8 món bán chạy nhất. Mỗi thẻ sản phẩm (Card) phải có ảnh đẹp, tên món, giá tiền và nút [+] màu cam.
  - **Social Proof:** Dải banner nhỏ hiển thị "Hơn 500+ anh em dev đã nạp năng lượng tại đây".

**4. Dữ liệu cốt lõi (Mock Data)**
* **Hero Banner:** Tiêu đề "Nạp Năng Lượng - Code Phê Hơn", Sub-title "Combo Thức Khuya giảm giá 20% từ 22h - 2h sáng."
* **Danh mục mẫu:** Đồ Ăn Vặt, Nước Uống, Trái Cây Tô, Combo Deadline.
* **Sản phẩm mẫu 1:** Tên "Khô Gà Lá Chanh Xé Cay", Giá "45.000 đ", Hình `https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&q=80&w=400&h=400`.
* **Sản phẩm mẫu 2:** Tên "Trà Sữa Oolong Nướng Full Topping", Giá "35.000 đ", Hình `https://images.unsplash.com/photo-1558857563-b37102e99e00?auto=format&fit=crop&q=80&w=400&h=400`.
