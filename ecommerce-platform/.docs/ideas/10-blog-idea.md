# Ý TƯỞNG THIẾT KẾ: MODULE BLOG & TIN TỨC (TECHBITE ECOMMERCE)

## 1. Thông tin chung (Meta Info)
* **Dự án:** TechBite Ecommerce Platform.
* **Tính năng:** Phân hệ Blog, Tin tức, Mẹo ẩm thực công nghệ và Bài viết chuyên sâu.
* **Mục đích:**
  - Tối ưu hóa SEO On-page và thu hút nguồn Organic Traffic chất lượng cao từ công cụ tìm kiếm.
  - Tăng tỷ lệ chuyển đổi (CRO) thông qua Cross-selling / Upselling: Nhúng trực tiếp sản phẩm vào nội dung bài viết ("Món ngon nhắc đến trong bài" + Thêm nhanh vào giỏ hàng).
  - Nâng cao uy tín thương hiệu và tăng thời gian Time-on-site của người dùng.

---

## 2. Đối tượng & Trải nghiệm Người dùng (Target & UX)
* **Người dùng công khai (Customer):**
  - Trải nghiệm đọc bài mượt mà, tốc độ tải trang tức thì (0ms latency từ Edge Cache).
  - Dễ dàng tra cứu bài viết theo danh mục, tag, tìm kiếm từ khóa với Debounce.
  - Tương tác trực tiếp với các sản phẩm được giới thiệu trong bài mà không cần rời trang đọc.
* **Quản trị viên / Biên tập viên (Admin / Staff):**
  - Soạn thảo trực quan với bộ editor JSON có sẵn (`JSONRichEditor`), hỗ trợ chèn ảnh, định dạng heading, danh sách, trích dẫn, căn lề và xem trước realtime.
  - Thiết lập SEO linh hoạt (Meta Title, Description, OG Image, Canonical URL) kèm Google Search Preview.
  - Quản lý trạng thái xuất bản: Bản nháp (`DRAFT`), Lên lịch (`SCHEDULED`), Công khai (`PUBLISHED`), Lưu trữ (`ARCHIVED`).

---

## 3. Kiến trúc Kỹ thuật Đã Chốt (Technical Architecture)

### 3.1. Định dạng Lưu trữ Dữ liệu (Content Data Format)
* **TUYỆT ĐỐI KHÔNG LƯU HTML THÔ VÀO DATABASE.**
* **Cơ chế lưu trữ:** Lưu trữ cấu trúc **TipTap JSON Blocks** (`content: Json` trong MySQL).
* **Admin Dashboard:** Sử dụng bộ soạn thảo `JSONRichEditor` (tương tự như mô tả sản phẩm), xuất dữ liệu chuẩn JSON Schema Tree (Node, Block, Mark).
* **Frontend Public:** Xây dựng Component Parser `BlogContentRenderer` để duyệt mảng JSON và render ra các thẻ Semantic HTML (`<p>`, `<h2>`, `<h3>`, `<blockquote>`, `<figure>`, `<ul>`, `<ol>`), áp dụng Tailwind Typography chuẩn.

### 3.2. Cấu trúc Database & Quan hệ (Prisma ORM + MySQL)
1. **`Post` (Bài viết):**
   - `id`, `title`, `slug` (Unique, Index), `summary` (Mô tả ngắn), `thumbnail` (Ảnh đại diện).
   - `content` (JSON TipTap blocks).
   - `status` (`DRAFT`, `SCHEDULED`, `PUBLISHED`, `ARCHIVED`).
   - `publishedAt` (DateTime), `scheduledAt` (DateTime nullable).
   - `views` (Int, default 0).
   - `authorId` (FK -> `User`), `categoryId` (FK -> `PostCategory`).
   - SEO Fields: `metaTitle`, `metaDescription`, `canonicalUrl`, `ogImage`.
2. **`PostCategory` (Chuyên mục bài viết):**
   - `id`, `name`, `slug` (Unique), `description`, `icon`, `orderIndex`, `isActive`.
3. **`Tag` & `PostTag` (Thẻ bài viết):**
   - Phân loại và liên kết nhiều-nhiều giữa bài viết và từ khóa.
4. **`PostProduct` (Sản phẩm đính kèm bài viết):**
   - Quan hệ nhiều-nhiều giữa `Post` và `Product` (`postId`, `productId`, `displayOrder`).
   - Cho phép hiển thị Card sản phẩm với giá bán, nút "Mua ngay", "Thêm vào giỏ" ngay trong bài đọc.

### 3.3. Hiệu năng, Bộ đếm View & Caching (Redis Buffer)
* **View Counter Buffer:** Khi người dùng đọc bài, Backend thực hiện tăng view bất đồng bộ qua Redis Atomic `INCR blog:views:${postId}`.
* **Batching Sync Cron:** Cron Job (`@nestjs/schedule`) chạy định kỳ 5-10 phút gom toàn bộ view từ Redis cập nhật vào MySQL theo batch, loại bỏ hoàn toàn tình trạng Lock dòng dữ liệu DB.
* **On-Demand Cache Invalidation:**
  - Cache Redis: `cache:v1:blog:posts:*`, `cache:v1:blog:categories:*`.
  - Khi Admin tạo / sửa / xóa / chuyển trạng thái bài viết, Backend tự động xóa cache Redis và kích hoạt Next.js On-Demand Revalidation (`/blog`, `/blog/[slug]`).
* **Scheduled Publishing Job:** Cron Job tự động quét các bài viết ở trạng thái `SCHEDULED` đến thời điểm xuất bản để chuyển sang `PUBLISHED` và phát tín hiệu revalidate public.

### 3.4. Tối ưu hóa SEO (SEO Optimization)
* Next.js Server Components kết xuất SSR / ISR.
* Tự động sinh `Schema.org/Article` JSON-LD, BreadcrumbList.
* Tối ưu OpenGraph / Twitter Cards (Dynamic title, description, thumbnail).
* Dynamic XML Sitemap tại `/blog-sitemap.xml`.

---

## 4. Đặc tả Giao diện & Màn hình (UI/UX Breakdown)

### 4.1. Public Website (`apps/frontend`)
1. **Trang Danh sách Blog (`/blog`):**
   - **Hero Featured Post:** 1-2 bài viết tiêu biểu nhất với visual lớn, badge "Nổi bật".
   - **Thanh lọc chuyên mục & Tìm kiếm:** Tabs lọc chuyên mục dạng pill trượt ngang, ô tìm kiếm Debounced (300-500ms).
   - **Lưới bài viết (Blog Grid):** Thẻ bài viết chuẩn (`BlogCard`) gồm Thumbnail tỷ lệ 16:9, Badge chuyên mục, Tiêu đề, Tóm tắt 2 dòng, Tác giả, Ngày đăng, Thời gian đọc ước tính (VD: "5 phút đọc"), Lượt xem.
   - **Phân trang:** Pagination Server-side chuẩn mực.
2. **Trang Chi tiết Bài viết (`/blog/[slug]`):**
   - **Breadcrumbs:** `Trang chủ > Blog > [Tên Chuyên mục] > [Tiêu đề bài viết]`.
   - **Header bài viết:** Tiêu đề H1, Ngày xuất bản, Tác giả (Avatar + Tên), Lượt xem, Nút chia sẻ mạng xã hội (Facebook, Copy link).
   - **Khối Mục lục Tự động (Table of Contents - TOC):** Tự động bóc tách các thẻ H2/H3 từ JSON Content để tạo menu điều hướng nhanh trong bài.
   - **Thân bài viết (Blog Content Canvas):** Render từ JSON Blocks với typography đẹp mắt, hình ảnh bo góc có chú thích (Caption), khối trích dẫn nổi bật.
   - **Widget Sản phẩm liên quan (Featured Products in Post):** Box hiển thị các món ăn được review/nhắc đến trong bài, có giá, badge giảm giá, nút thêm giỏ hàng trượt và toast feedback.
   - **Bài viết liên quan (Related Articles):** Carousel hoặc Grid 3 bài viết cùng chuyên mục ở cuối trang.
3. **Trang Lọc theo Chuyên mục & Tag:**
   - `/blog/category/[slug]` & `/blog/tag/[slug]`.

### 4.2. Admin Dashboard (`apps/dash`)
1. **Trang Quản lý Bài viết (`/blog`):**
   - Bảng danh sách bài viết: Thumbnail, Tiêu đề, Chuyên mục, Tác giả, Lượt xem, Trạng thái (`DRAFT`, `SCHEDULED`, `PUBLISHED`, `ARCHIVED`), Ngày tạo/xuất bản.
   - Bộ lọc Debounced, lọc theo Trạng thái & Chuyên mục.
   - Menu thao tác nhanh: Xem trước (Preview), Chỉnh sửa, Đổi trạng thái trực tiếp, Xóa.
2. **Trang Soạn thảo Bài viết (`/blog/create` & `/blog/[id]/edit`):**
   - **Cột chính:** Ô nhập Tiêu đề H1, Đường dẫn Slug (Tự động sinh từ Tiêu đề tiếng Việt, cho phép tùy chỉnh), Đoạn tóm tắt (`summary`), Bộ soạn thảo `JSONRichEditor` (tích hợp Media Manager tải ảnh, căn lề, heading, list, blockquote), Hộp chọn Sản phẩm gắn kèm bài viết (`PostProduct`).
   - **Cột phụ:** Khối thiết lập Xuất bản (Trạng thái, Chọn ngày giờ lên lịch `scheduledAt`), Khối Chuyên mục & Tags, Khối tải ảnh Thumbnail đại diện (Image Uploader), Khối cấu hình SEO Meta (Meta Title, Meta Description, OG Image, Google SERP Preview).
3. **Trang Quản lý Chuyên mục Blog (`/blog/categories`):**
   - Bảng danh mục bài viết, Modal thêm mới/chỉnh sửa, cấu hình thứ tự hiển thị và trạng thái kích hoạt.
