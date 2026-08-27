# Ý TƯỞNG THIẾT KẾ: TRANG QUẢN LÝ BÀI VIẾT & CHUYÊN MỤC BLOG (ADMIN DASHBOARD)

## 1. Thông tin chung (Meta Info)
* **Dự án:** TechBite Ecommerce Platform.
* **Module:** Quản lý Blog, Tin tức & Chuyên mục ẩm thực công nghệ (Admin Dashboard).
* **Mục đích:**
  - Cung cấp giao diện trực quan, tinh gọn giúp Ban quản trị (Admin / Staff) dễ dàng biên tập, quản lý và lên lịch xuất bản bài viết chất lượng cao.
  - Tối ưu hóa SEO On-page thông qua công cụ cấu hình Meta Title, Meta Description và xem trước kết quả Google Search (SERP Preview).
  - Tăng doanh thu bán hàng thông qua tính năng nhúng sản phẩm liên quan (Cross-selling Products) trực tiếp vào nội dung bài viết.
* **Mockup & Design Source:** Kế thừa hệ thống lưới, bảng biểu và form 2 cột chuẩn mực từ `.docs/ui-mockups/dash-products/index.html` và `.docs/ideas/10-blog-idea.md`.

---

## 2. Đối tượng & Trải nghiệm Người dùng (Target & UX)
* **Đối tượng sử dụng:** Quản trị viên (`ADMIN`), Nhân viên biên tập nội dung (`STAFF`).
* **Trải nghiệm mong muốn:**
  - Tốc độ tải trang tức thì, chuyển trang mượt mà không giật lag.
  - Bộ soạn thảo trực quan hỗ trợ lưu trữ chuẩn cấu trúc **TipTap JSON Blocks** (Tuyệt đối không lưu HTML thô chống XSS).
  - Tìm kiếm và lọc bài viết tức thời với cơ chế Debounce (300ms - 400ms).
  - Thao tác xuất bản, đổi trạng thái nhanh chóng (Bản nháp, Lên lịch tự động, Công khai, Lưu trữ).

---

## 3. Quy trình Nghiệp vụ & Các Màn hình Chức năng

### 3.1. Màn hình Danh sách Bài viết (`/blog` hoặc `/posts`)
1. **Header:**
   - Tiêu đề: "Quản lý Bài viết & Tin tức" (Blog Posts Management).
   - Nút hành động chính: "Viết bài mới" (`+ Viết bài mới` -> điều hướng `/blog/create`).
   - Nút phụ: "Chuyên mục Blog" (Điều hướng `/blog/categories`).
2. **Thanh bộ lọc tổng hợp (Filter Bar):**
   - Ô tìm kiếm Debounce 300ms theo Tiêu đề, Slug, Tác giả.
   - Dropdown lọc theo Chuyên mục (`PostCategory`).
   - Dropdown lọc theo Trạng thái: Tất cả / Đã xuất bản (`PUBLISHED`) / Lên lịch (`SCHEDULED`) / Bản nháp (`DRAFT`) / Lưu trữ (`ARCHIVED`).
   - Dropdown sắp xếp: Mới nhất, Lượt xem nhiều nhất.
3. **Bảng Danh sách Bài viết (Blog Table):**
   - Thumbnail bài viết (Tỷ lệ 16:9 bo góc `rounded-xl`).
   - Tiêu đề bài viết (In đậm) & Slug (Chữ xám nhỏ bên dưới).
   - Chuyên mục (Badge màu, click để lọc nhanh theo chuyên mục đó).
   - Tác giả (Avatar tròn + Tên nhân viên/Admin).
   - Lượt xem (`views`) & Thời gian đọc ước tính (`readTimeMinutes`).
   - Trạng thái xuất bản (Badge phân màu trực quan).
   - Ngày xuất bản / Ngày lên lịch.
   - Thao tác nhanh (Actions):
     - Menu đổi trạng thái tức thì (`PUBLISHED`, `DRAFT`, `ARCHIVED`).
     - Nút Xem trước (Mở tab mới trang public `/blog/[slug]`).
     - Nút Chỉnh sửa (Icon Edit -> `/blog/[id]/edit`).
     - Nút Xóa (Icon Trash -> Mở Modal xác nhận xóa an toàn).
4. **Phân trang:**
   - Hiển thị tổng số bản ghi và nút chuyển trang chuẩn Admin.

---

### 3.2. Màn hình Soạn thảo & Chỉnh sửa Bài viết (`/blog/create` & `/blog/[id]/edit`)
Giao diện chia 2 cột chuẩn Enterprise (8 cột Nội dung chính / 4 cột Cấu hình bên phải trên Desktop):

#### Cột Trái (8 cột Desktop) - Nội dung & Sản phẩm đính kèm:
1. **Tiêu đề bài viết (`title`):** Ô nhập văn bản lớn, tự động sinh slug tiếng Việt chuẩn không dấu.
2. **Đường dẫn Slug (`slug`):** Cho phép xem và chỉnh sửa tùy biến, tự động kiểm tra định dạng kebab-case.
3. **Mô tả tóm tắt (`summary`):** Textarea 2-3 dòng (tối đa 500 ký tự) dùng làm đoạn mở đầu và SEO snippet.
4. **Bộ soạn thảo nội dung (`JSONRichEditor`):**
   - Lưu trữ định dạng **TipTap JSON Object** (`content: Json`).
   - Hỗ trợ Headings (H2, H3), Paragraphs, Bold, Italic, Underline, Bullet List, Ordered List, Blockquote, Divider.
   - Chèn hình ảnh (Upload file ảnh hoặc URL, hỗ trợ Caption chú thích).
5. **Khối Sản phẩm đính kèm bài viết (`PostProductEmbedSection` - Cross-selling):**
   - Tìm kiếm sản phẩm trong store theo tên/slug (Debounce 300ms).
   - Thêm sản phẩm vào danh sách đính kèm của bài viết.
   - Hiển thị Card sản phẩm thu nhỏ với giá bán, tồn kho, badge khuyến mãi.
   - Cho phép sắp xếp thứ tự hiển thị (`displayOrder`) hoặc gỡ bỏ khỏi bài viết.

#### Cột Phải (4 cột Desktop) - Cấu hình Xuất bản & SEO:
1. **Khối Trạng thái & Xuất bản (Publishing Card):**
   - Chọn Trạng thái: Bản nháp (`DRAFT`), Lên lịch (`SCHEDULED`), Xuất bản ngay (`PUBLISHED`), Lưu trữ (`ARCHIVED`).
   - Nếu chọn `SCHEDULED`: Hiển thị Datetime Picker chọn ngày giờ tự động xuất bản (`scheduledAt`).
   - Nút "Lưu bản nháp" và Nút chính "Lưu & Xuất bản" (`bg-[#4880FF]` kèm spinner loading).
2. **Khối Chuyên mục & Thẻ bài viết (Category & Tags Card):**
   - Dropdown chọn Chuyên mục (`categoryId`).
   - Multi-select / Tag Input nhập các thẻ từ khóa (`tagIds` / tags).
3. **Khối Ảnh đại diện (Thumbnail Card):**
   - Khung tải ảnh tỷ lệ chuẩn 16:9.
   - Hỗ trợ Drag & Drop file, chọn từ thiết bị hoặc nhập URL ảnh ngoài.
4. **Khối Tối ưu hóa SEO (SEO Optimization Card):**
   - `metaTitle`: Ô nhập tiêu đề SEO (Hiển thị thanh tiến trình độ dài khuyến nghị 50-60 ký tự).
   - `metaDescription`: Ô nhập mô tả SEO (Thanh tiến trình 150-160 ký tự).
   - `canonicalUrl`: Đường dẫn chuẩn hóa (mặc định trỏ về link public).
   - `ogImage`: Ảnh chia sẻ mạng xã hội.
   - **Google SERP Snippet Preview:** Khung xem trước trực quan cách bài viết xuất hiện trên kết quả tìm kiếm Google (Favicon, Title xanh, URL, Description).

---

### 3.3. Màn hình Quản lý Chuyên mục Blog (`/blog/categories`)
1. **Bảng danh sách Chuyên mục:**
   - Icon / Emoji đại diện.
   - Tên chuyên mục & Slug.
   - Mô tả ngắn.
   - Thứ tự hiển thị (`orderIndex`).
   - Số lượng bài viết (`postCount`).
   - Trạng thái hoạt động (Switch toggle `isActive`).
   - Nút Sửa / Xóa.
2. **Modal Tạo mới / Chỉnh sửa Chuyên mục:**
   - Tên chuyên mục (Auto slug).
   - Icon / Emoji picker.
   - Mô tả ngắn.
   - Thứ tự sắp xếp.
   - Checkbox Kích hoạt.
3. **Quy tắc an toàn dữ liệu:**
   - CẤM xóa chuyên mục nếu đang có bài viết thuộc chuyên mục đó (`postCount > 0`). Yêu cầu chuyển bài viết sang chuyên mục khác trước khi xóa.
