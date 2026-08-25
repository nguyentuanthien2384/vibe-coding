# 🛍️ TechBite E-Commerce Platform — Enterprise Fullstack Monorepo

Một nền tảng Thương mại điện tử toàn diện chuẩn **Enterprise Architecture** hợp nhất 3 phân hệ ứng dụng trong một kho mã nguồn duy nhất: **Customer Storefront (`app/frontend`)**, **Admin Dashboard (`app/dash/my-app`)**, và **Backend API Server (`app/backend`)**.

Hệ thống được thiết kế và xây dựng với sự tối ưu hóa tối đa về **Trải nghiệm Người dùng (UI/UX)**, hiệu năng cao, bảo mật đa tầng chuẩn sản xuất, và kiến trúc phân tách rõ ràng giữa Business Logic và Giao diện.

---

## 📑 Mục lục

1. [Hệ Thống Thiết Kế UI/UX & Design System (UI/UX Specs)](#-1-h%E1%BB%87-th%E1%BB%91ng-thi%E1%BA%BFt-k%E1%BA%BF-uiux--design-system-uiux-specs)
2. [Chi Tiết Màn Hình & Trải Nghiệm Khách Hàng (Customer Storefront)](#-2-chi-ti%E1%BA%BFt-m%C3%A0n-h%C3%ACnh--tr%E1%BA%A3i-nghi%E1%BB%87m-kh%C3%A1ch-h%C3%A0ng-customer-storefront)
3. [Chi Tiết Màn Hình & Trải Nghiệm Quản Trị (Admin Dashboard)](#-3-chi-ti%E1%BA%BFt-m%C3%A0n-h%C3%ACnh--tr%E1%BA%A3i-nghi%E1%BB%87m-qu%E1%BA%A3n-tr%E1%BB%8B-admin-dashboard)
4. [Tổng Quan Kiến Trúc Kỹ Thuật (Architecture Overview)](#%EF%B8%8F-4-t%E1%BB%95ng-quan-ki%E1%BA%BFn-tr%C3%BAc-k%E1%BB%B9-thu%E1%BA%ADt-architecture-overview)
5. [Tính Năng Kỹ Thuật Backend & Bảo Mật (Backend Core)](#-5-t%C3%ADnh-n%C4%83ng-k%E1%BB%B9-thu%E1%BA%ADt-backend--b%E1%BA%A3o-m%E1%BA%ADt-backend-core)
6. [Công Nghệ Sử Dụng (Tech Stack)](#%EF%B8%8F-6-c%C3%B4ng-ngh%E1%BB%87-s%E1%BB%AD-d%E1%BB%A5ng-tech-stack)
7. [Cấu Trúc Thư Mục Toàn Dự Án](#-7-c%E1%BA%A5u-tr%C3%BAc-th%C6%B0-m%E1%BB%A5c-to%C3%A0n-d%E1%BB%B1-%C3%A1n)
8. [Hướng Dẫn Cài Đặt & Khởi Chạy (Getting Started)](#-8-h%C6%B0%E1%BB%9Bng-d%E1%BB%85n-c%C3%A0i-%C4%91%E1%BA%B7t--kh%E1%BB%9Fi-ch%E1%BA%A1y-getting-started)
9. [Cấu Hình Biến Môi Trường (.env)](#%EF%B8%8F-9-c%E1%BA%A5u-h%C3%ACnh-bi%E1%BA%BFn-m%C3%B4i-tr%C6%B0%E1%BB%9Dng-env)
10. [Danh Sách API Endpoints Trọng Yếu](#-10-danh-s%C3%A1ch-api-endpoints-tr%E1%BB%8Dng-y%E1%BA%BFu)
11. [Quy Chuẩn Lập Trình & Bảo Mật Chuẩn Enterprise](#-11-quy-chu%E1%BA%A9n-l%E1%BA%ADp-tr%C3%ACnh--b%E1%BA%A3o-m%E1%BA%ADt-chu%E1%BA%A9n-enterprise)

---

## 🎨 1. Hệ Thống Thiết Kế UI/UX & Design System (UI/UX Specs)

Dự án được xây dựng dựa trên bản vẽ Figma Mockup (`.docs/ui-mockups/`), Stitch MCP Design System và tài liệu quy chuẩn [STYLEGUIDE.md](file:///d:/vibe_coding/ecommerce-platform/.docs/STYLEGUIDE.md).

### 💎 1.1. Bảng Màu & Phân Cấp Thị Giác (Color Hierarchy)
- **Primary Call-to-Action (Màu chốt sale Storefront)**: `bg-orange-600` / `hover:bg-orange-700` (`#EA580C`). Được sử dụng **duy nhất** cho các hành động mua sắm quan trọng (*"Thêm vào giỏ"*, *"Thanh toán ngay"*, *"Mua ngay"*) nhằm tập trung tuyệt đối điểm nhìn của khách hàng.
- **Admin Dashboard Primary**: Xanh công nghệ `#4880FF` (`bg-[#4880FF]`), tạo cảm giác chuyên nghiệp, tin cậy cho trang quản trị.
- **Secondary Action & Contrast**: `bg-slate-900` / `text-slate-900` cho nút xem chi tiết, nhãn phân loại chính, và văn bản tiêu đề quan trọng.
- **Background & Surface (Nền & Bề mặt)**:
  - Storefront: `bg-gray-50` (`#F9FAFB`) kết hợp thẻ Card trắng tinh khiết `bg-white` để làm nổi bật hình ảnh và giá sản phẩm.
  - Dashboard: Nền xám nhạt `#F5F6FA` kết hợp thẻ Bento Grid bo góc lớn `rounded-2xl` hoặc `rounded-3xl`.
- **Hiển Thị Giá Tiền (Pricing Hierarchy)**:
  - Giá bán thực tế / Giá khuyến mãi: `text-red-600 font-bold text-lg` hoặc `text-2xl`.
  - Giá gốc (chưa giảm): `text-slate-400 line-through text-sm`.
- **Hệ Thống Badge Trạng Thái (Status Badges)**:
  - **Giảm giá**: Badge đỏ cam `bg-red-500 text-white font-bold` đặt ở góc trên thẻ sản phẩm (ví dụ: `-25%`).
  - **Mới / Nổi bật**: Badge xanh lá `bg-emerald-500 text-white` hoặc cam vàng `bg-amber-500`.
  - **Hết hàng (Out of Stock)**: Khóa xám toàn bộ thẻ sản phẩm với lớp phủ overlay mờ và nhãn `bg-gray-500 text-white`.
  - **Trạng thái Đang bán (Active)**: Viền mềm pastel kết hợp hiệu ứng **Pulsing Green Dot** (chấm xanh nhấp nháy động).

### 📐 1.2. Quy Chuẩn Typography & Grid Layout
- **Font chữ**: Sử dụng bộ font hiện đại **Inter** & **Outfit** từ Google Fonts, phân cấp rõ ràng từ `h1` (32px - 40px) đến `body` (14px - 16px).
- **Quy chuẩn Lưới hiển thị Sản phẩm (Responsive Grid Breakdown)**:
  - 📱 **Mobile (< 768px)**: 2 cột (`grid-cols-2`), khoảng cách `gap-3`, tối ưu diện tích màn hình cảm ứng.
  - 📱 **Tablet (768px - 1024px)**: 3 cột (`md:grid-cols-3`), khoảng cách `gap-4`.
  - 💻 **Desktop (1024px - 1280px)**: 4 cột (`lg:grid-cols-4`), khoảng cách `gap-6`.
  - 🖥️ **Widescreen (>= 1280px)**: 5 cột (`xl:grid-cols-5`), tối ưu không gian hiển thị rộng rãi.

### ✨ 1.3. Tương Tác & Micro-animations
- **Hover Transitions**: Hiệu ứng chuyển động mượt `transition-all duration-300 ease-in-out`, hiệu ứng phóng nhẹ ảnh sản phẩm `group-hover:scale-105`.
- **Skeleton Pulse Loading**: Sử dụng Skeleton Shimmer hiệu ứng phát sáng mờ khi tải dữ liệu thay cho biểu tượng xoay (Spinner) truyền thống.
- **Glassmorphism**: Lớp phủ Header và Drawer sử dụng hiệu ứng kính mờ `backdrop-blur-md bg-white/90`.
- **Toast Notifications**: Phản hồi tức thì ở góc màn hình khi Thêm giỏ hàng thành công, cập nhật địa chỉ, đổi mật khẩu hoặc phát sinh lỗi.

---

## 🛒 2. Chi Tiết Màn Hình & Trải Nghiệm Khách Hàng (Customer Storefront)

| Màn hình / Phân hệ | Chi tiết Giao diện (UI) & Trải nghiệm Tương tác (UX) |
| :--- | :--- |
| **1. Header & Navigation Bar** | - **Top Contact Bar**: Hiển thị Hotline, SĐT, Giờ mở cửa và Badge freeship giao nhanh lấy động từ Settings hệ thống.<br>- **Sticky Main Header**: Cố định trên cùng khi cuộn trang, thanh điều hướng với Logo thương hiệu, Dropdown danh mục đa cấp, Drawer Menu trên Mobile.<br>- **Dynamic Menus**: Tự động hiển thị danh sách Menu Header theo thứ tự sắp xếp từ Admin, hỗ trợ mở tab mới và Submenu mượt mà. |
| **2. Ô Tìm Kiếm Auto-Suggest** | - **Debounce Performance**: Tích hợp custom hook `useDebounce` (300ms - 500ms) chống spam API.<br>- **Smart Dropdown**: Hiển thị danh mục gợi ý và danh sách món ăn khớp từ khóa.<br>- **Keyword Highlight**: Bôi vàng từ khóa tìm kiếm trực tiếp bằng thẻ `<mark>` giúp người dùng dễ dàng định vị sản phẩm.<br>- **Keyboard & Outside Click**: Đóng dropdown tự động khi nhấn `Escape` hoặc nhấp ra ngoài. |
| **3. Trang Chủ (Home Page)** | - **Hero Banner Carousel**: Băng chuyền banner tự động chuyển slide, hiệu ứng lướt mượt mà kèm nút bấm CTA dẫn đến chương trình khuyến mãi.<br>- **Category Rail**: Thanh trượt danh mục bo tròn ngang, hỗ trợ hiển thị cả icon hình ảnh và emoji sinh động, tự động làm nổi bật danh mục đang chọn.<br>- **Flash Sale & Countdown**: Khối sản phẩm giảm giá sốc kèm đồng hồ đếm ngược thời gian thực.<br>- **Floating Contact Widget**: Nút tiện ích nổi góc dưới màn hình hỗ trợ Gọi Hotline nhanh, Chat Zalo, Chat Facebook và nút "Cuộn lên đầu trang" (Back to top). |
| **4. Danh Sách & Bộ Lọc (`/products`, `/categories/[slug]`)** | - **Bộ lọc Giá động (Price Filter)**: Tự động tính toán khoảng giá nhỏ nhất (`minPrice`) và lớn nhất (`maxPrice`) thực tế từ API, hỗ trợ thanh trượt và ô nhập số tiền tùy chỉnh kèm nút xóa bộ lọc.<br>- **Bộ lọc Danh mục kèm Badge số lượng**: Hiển thị số lượng sản phẩm realtime bên cạnh từng danh mục, highlight màu cam nổi bật khi đang chọn.<br>- **Đồng bộ URL Params**: Trạng thái bộ lọc (`minPrice`, `maxPrice`, `category`, `sort`, `page`) tự động đồng bộ lên URL, giúp người dùng chia sẻ liên kết giữ nguyên kết quả lọc.<br>- **Promotion Carousel**: Banner khuyến mãi tương tác riêng cho trang danh mục. |
| **5. Chi Tiết Sản Phẩm (`/products/[slug]`)** | - **Image Gallery**: Khung ảnh đại diện tỷ lệ chuẩn 1:1, hỗ trợ danh sách ảnh phụ thumbnails thu nhỏ, bấm chọn chuyển ảnh chính tức thì.<br>- **Rich Text Description**: Render mô tả món ăn định dạng HTML Rich Text từ TipTap Editor với bộ font và khoảng cách chuẩn `.prose`.<br>- **Quantity Counter**: Bộ đếm tăng/giảm số lượng thông minh, tự động chặn vượt quá số lượng tồn kho thực tế (`stock`).<br>- **Nút Chốt Sale Nổi Bật**: Nút *"Thêm vào giỏ"* hiệu ứng trượt kèm thông báo Toast & Nút *"Mua ngay"* điều hướng trực tiếp sang Checkout.<br>- **Khối Sản phẩm Liên quan**: Danh sách sản phẩm cùng chuyên mục dạng lưới. |
| **6. Ngăn Kéo Giỏ Hàng (Cart Drawer)** | - **Slide-over Drawer**: Ngăn kéo trượt 60fps từ mép phải màn hình khi bấm icon Giỏ hàng, **không điều hướng sang trang mới** để giữ nguyên mạch mua sắm của khách hàng.<br>- **Tương tác Giỏ hàng**: Tăng/giảm số lượng, xóa sản phẩm, hiển thị tổng tiền tức thì.<br>- **Guest Cart Merge**: Tự động hợp nhất giỏ hàng tạm thời từ Client Zustand vào MySQL Database ngay khi khách hàng đăng nhập. |
| **7. Xác Thực Người Dùng (`/login`, `/register`)** | - **Thiết kế Form Card Hiện Đại**: Form đăng nhập/đăng ký dạng Card trung tâm gọn gàng, validation dữ liệu đầu vào thời gian thực, nút ẩn/hiện mật khẩu.<br>- **HttpOnly Cookie**: Cơ chế đăng nhập an toàn lưu token vào Cookie HttpOnly phía Server, tự động chuyển hướng và khởi tạo phiên mượt mà. |
| **8. Trang Thanh Toán (`/checkout`)** | - **Sổ Địa Chỉ Giao Hàng**: Tự động tải địa chỉ mặc định, cho phép chọn nhanh các địa chỉ đã lưu hoặc tự nhập địa chỉ mới kèm tùy chọn lưu vào sổ địa chỉ.<br>- **Voucher & Mã Giảm Giá**: Ô nhập coupon debounced, tự động kiểm tra tính hợp lệ và trừ trực tiếp vào tổng đơn.<br>- **COD Confirmation Modal**: Popup chúc mừng đặt hàng thành công với biểu tượng xe tải đỏ `bg-[#D92D4B]`, mã đơn hàng lớn `text-[#FF6B00]`, hộp ghi chú dành cho shipper và nút xem chi tiết đơn.<br>- **VietQR Payment Modal**: Sinh mã QR Code MB Bank thời gian thực theo chuẩn Napas247, đồng hồ đếm ngược 15 phút, sao chép nhanh STK & nội dung CK, cơ chế polling 3s tự động xác nhận đơn khi đã thanh toán, nút tải trực tiếp ảnh QR Code về thiết bị. |
| **9. Hồ Sơ Cá Nhân & Quản Lý Đơn Hàng (`/profile`)** | - **Tab Quản lý Hồ sơ**: Cập nhật thông tin cá nhân (Họ tên, SĐT, Avatar) và đổi mật khẩu bảo mật.<br>- **Sổ Địa Chỉ Nhận Hàng**: Thêm mới, chỉnh sửa, xóa và nút gán `[★ Địa chỉ mặc định]`.<br>- **Lịch Sử Đơn Hàng Phân Loại**: Tab lọc theo 7 trạng thái đơn hàng kèm badge đếm số lượng thời gian thực, ô tìm kiếm đơn debounced.<br>- **Modal Theo Dõi Hành Trình (Tracking Timeline)**: Stepper tiến trình vận chuyển dạng dọc, hiển thị chi tiết mốc thời gian, người nhận, địa chỉ giao hàng và danh sách món mua. |
| **10. Trang Chi Tiết Đơn Hàng (`/orders/[orderCode]`)** | - **Chi Tiết Bất Biến (Snapshot)**: Hiển thị đầy đủ Stepper vận chuyển 5 bước, bảng kê chi tiết sản phẩm với đơn giá cố định tại thời điểm mua, thông tin người nhận, tiền ship, giảm giá voucher, trạng thái thanh toán và nút In hóa đơn đơn hàng. |

---

## 🛠️ 3. Chi Tiết Màn Hình & Trải Nghiệm Quản Trị (Admin Dashboard)

| Phân hệ Quản trị | Chi tiết Giao diện (UI) & Trải nghiệm Quản trị (UX) |
| :--- | :--- |
| **1. Admin Master Layout Shell** | - **Sidebar Điều Hướng Co Giãn (Collapsible Sidebar)**: Thanh menu bên trái thu gọn / mở rộng linh hoạt, lưu trạng thái vào Zustand Store.<br>- **Realtime Pending Orders Badge**: Gắn trực tiếp pill badge màu cam (`bg-amber-500 text-white`) hiển thị số lượng đơn hàng chưa xử lý lên menu "Đơn hàng" trên Sidebar, tự động giảm ngay khi bấm xác nhận đơn.<br>- **Admin Header**: Tích hợp thanh tìm kiếm nhanh, Popover chuông thông báo Realtime kèm badge đếm chưa đọc, và Dropdown thông tin Quản trị viên (Avatar, Tên, Quyền hạn, Đăng xuất).<br>- **Breadcrumb Navigation**: Thanh điều hướng phân cấp đồng bộ tự động theo URL Route. |
| **2. Tổng Quan Dashboard (`/dashboard`)** | - **4 Thẻ Chỉ Số KPI (Stats Cards)**: Total User, Total Order, Total Sales, Total Pending với tông màu chuẩn Figma (`#E5EFFF`, `#FFF3D6`, `#D9F7E8`, `#FFDEDF`) và % tăng/giảm so với kỳ trước.<br>- **Biểu Đồ Doanh Thu Area Chart**: Biểu đồ đường cong Bézier mượt mà với dải gradient màu xanh `#4880FF`, hỗ trợ bộ lọc 7 ngày / 30 ngày / 12 tháng kèm tooltip tương tác hiển thị doanh thu và số đơn.<br>- **Deals Details (Đơn hàng Mới Nhất)**: Bảng danh sách đơn mới kèm ảnh thumbnail món ăn, mã đơn, địa chỉ giao hàng, thời gian tạo, số lượng món (piece), tổng tiền và nhãn trạng thái bo tròn chuẩn style Figma. |
| **3. Quản Lý Sản Phẩm (`/products`)** | - **Bảng Dữ Liệu Sản Phẩm**: Hiển thị ảnh thumbnail, tên sản phẩm & slug, giá gốc, giá khuyến mãi, số lượng tồn kho (stock), chuyên mục và badge trạng thái đang bán với chấm phát sáng động (pulsing dot).<br>- **WYSIWYG Visual Rich Editor (TipTap)**: Soạn thảo mô tả sản phẩm hiển thị ảnh thật 100%, thanh điều khiển nổi đổi kích thước ảnh (`25%`, `50%`, `75%`, `100%`), căn lề (Trái/Giữa/Phải), di chuyển ảnh Lên/Xuống, cắt dán và modal chỉnh sửa chi tiết (Alt, Link).<br>- **Thư Viện Ảnh Phụ & Sắp Xếp Thứ Tự**: Tải lên nhiều ảnh, chọn 1 ảnh làm đại diện chính ⭐, nút di chuyển Trái/Phải để đổi vị trí `#1`, `#2`, `#3`... |
| **4. Quản Lý Danh Mục (`/categories`)** | - **Phân Cấp Danh Mục**: Quản lý danh mục cha-con, tích hợp logic chống đệ quy lặp vòng khi gán cha-con.<br>- **Auto-slug SEO**: Tự động chuyển đổi tên Tiếng Việt có dấu thành slug chuẩn SEO không dấu.<br>- **Upload Icon Chuyên Mục**: Hỗ trợ kéo thả ảnh icon, xem trước ảnh tức thì hoặc chèn icon emoji. |
| **5. Quản Lý Đơn Hàng (`/orders`, `/orders/[id]`)** | - **Bento Grid & Stepper Tiến Trình**: Giao diện chi tiết đơn hàng dạng lưới Bento, Stepper 5 bước trực quan và hiển thị nổi bật thẻ ghi chú của khách hàng.<br>- **1-Click Fast Confirm (Optimistic UI)**: Nút xác nhận đơn hàng nhanh tức thì tại bảng danh sách và trang chi tiết, trạng thái đổi ngay sang `CONFIRMED` mà không cần F5 trình duyệt.<br>- **In Hóa Đơn Bán Hàng Chuyên Nghiệp**: Mẫu hóa đơn chuẩn mực hỗ trợ 2 chế độ in: **Khổ A4 Enterprise** & **Bill nhiệt 80mm**, tự động ẩn sạch layout thừa qua `@media print`.<br>- **Xuất Báo Cáo Excel (.xlsx Native)**: Xuất tập tin Excel nhị phân thật qua `exceljs`, định dạng tiêu đề màu xanh `#4880FF`, chữ trắng đậm, tự động căn độ rộng cột và định dạng tiền tệ Việt Nam (`#,##0 đ`). |
| **6. Quản Lý Khách Hàng (`/customers`, `/customers/[id]`)** | - **Phân Loại Khách Hàng**: Quản lý song song **Khách Thành Viên** (`REGISTERED`) và **Khách Vãng Lai** (`GUEST`).<br>- **Chỉ Số Tài Chính**: Thống kê Tổng chi tiêu, Số lượng đơn đã mua và Giá trị đơn trung bình (AOV).<br>- **Chuyển Đổi Khách Vãng Lai Thành Thành Viên**: Tự động chuyển đổi loại tài khoản, liên kết toàn bộ đơn hàng trong quá khứ và chuyển sổ địa chỉ sang tài khoản mới.<br>- **Chỉnh Sửa Nhanh & Ghi Chú Nội Bộ**: Popup sửa nhanh thông tin khách, trạng thái tài khoản và lưu ghi chú nội bộ (DB cho thành viên, Redis cho vãng lai). |
| **7. Quản Lý Nhân Sự & Phân Quyền (`/staffs`, `/staffs/[id]`)** | - **Hệ Thống Phân Quyền RBAC**: Quản lý nhân viên với vai trò `ADMIN` hoặc `STAFF`.<br>- **Nhóm Quyền & Đặc Quyền Riêng**: Gán nhóm quyền (`RoleGroup`) kết hợp cấp thêm các đặc quyền riêng (`CustomPermissions`).<br>- **Khóa Tài Khoản Tức Thì**: Chức năng Khóa tài khoản nhân sự ngay lập tức thu hồi toàn bộ token trên Redis, ngăn chặn truy cập trái phép. |
| **8. Quản Lý Media (`/media`)** | - **Thư Viện Ảnh Tập Trung**: Giao diện lưới vuông (Square Grid) đồng bộ mockup.<br>- **Tải Ảnh Kéo Thả (Drag & Drop)**: Tải nhiều file cùng lúc, xem ảnh phóng to Lightbox Zoom, đổi tên file ảnh và kiểm tra an toàn dữ liệu trước khi xóa. |
| **9. Cài Đặt Hệ Thống (`/settings`)** | - **Cấu Hình Chung**: Quản lý Logo, Tên thương hiệu, Hotline, Giờ làm việc, Mã số thuế, Bản quyền, Bật/tắt chế độ bảo trì.<br>- **Menu Navigation Repeater**: Quản lý menu Header/Footer với tính năng kéo thả sắp xếp thứ tự (Drag & Drop), quản lý Submenus đa cấp.<br>- **Cấu Hình Dynamic SMTP**: Thiết lập máy chủ gửi Email SMTP động từ giao diện kèm nút Test gửi email kiểm tra kết nối thời gian thực. |
| **10. Tìm Kiếm Toàn Diện (Omnisearch)** | - **Global Command Palette (`Ctrl + K` / `Cmd + K`)**: Tìm kiếm nhanh toàn cục mọi thực thể (Đơn hàng, Sản phẩm, Khách hàng, Danh mục, Nhân sự, Tác vụ nhanh) kèm phím điều hướng `↑`/`↓`/`Enter`.<br>- **Trang Tìm Kiếm Chuyên Sâu (`/search`)**: Phân loại kết quả theo từng tab chuyên biệt, lưu lịch sử tìm kiếm gần đây. |

---

## 🏛️ 4. Tổng Quan Kiến Trúc Kỹ Thuật (Architecture Overview)

```mermaid
graph TD
    ClientUser["🌐 Customer Storefront (Next.js 16 - Port 3000)"]
    ClientAdmin["⚙️ Admin Dashboard (Next.js 16 - Port 3002)"]
    
    subgraph BackendLayer ["Backend Services & Gateway (NestJS - Port 3001)"]
        NestAPI["NestJS API Application"]
        SSE["Server-Sent Events (Realtime Push)"]
        Guard["JWT & RBAC Permissions Guard"]
        Throttler["Throttler Rate Limiter"]
    end

    subgraph DataStorage ["Data & Cache Layer"]
        MySQL[("MySQL Database (Prisma ORM 7)")]
        Redis[("Redis Server (Sessions, Blacklist, Caching, SSE Subject)")]
        LocalDisk[("File System Storage (/uploads)")]
        SMTP["SMTP Mail Server (Dynamic Transporter)"]
    end

    ClientUser -->|"HTTP / BFF Cookies / SSE"| NestAPI
    ClientAdmin -->|"HTTP / Bearer Token / SSE"| NestAPI
    
    NestAPI --> Guard
    Guard --> Redis
    NestAPI --> MySQL
    NestAPI --> LocalDisk
    NestAPI --> SMTP
```

---

## ⚙️ 5. Tính Năng Kỹ Thuật Backend & Bảo Mật (Backend Core)

- **Xác thực JWT & Quản lý Phiên trên Redis**:
  - Token được ký bằng thư viện `jsonwebtoken` với `jti` (JWT ID) duy nhất.
  - Refresh Token được lưu trong `Set-Cookie` với cấu hình `HttpOnly`, `SameSite=Lax`, `Secure`.
  - Mật khẩu được mã hóa an toàn bằng `bcrypt` với `saltRounds = 12`.
  - Cơ chế **Multi-device Security Revocation**: Khi đổi mật khẩu, hệ thống ghi nhận `auth:password_changed:${userId}`, xóa sạch toàn bộ Refresh Token của user trên Redis và vô hiệu hóa lập tức mọi Access Token cũ trên toàn bộ các thiết bị.
- **Middleware & Redis Blacklist**:
  - Mọi API được bảo vệ đều đi qua `JwtAuthGuard` và kiểm tra blacklist trên Redis (`redis.get(accessToken)`).
  - Tự động tính toán thời gian sống còn lại của JWT (TTL) khi đưa vào Blacklist bằng `redis.setEx` chống tràn bộ nhớ RAM.
- **State Machine Đơn Hàng & Giao Dịch Prisma**:
  - Quản lý trạng thái chuyển đổi đơn hàng chặt chẽ.
  - Tự động hoàn trả số lượng tồn kho `stock` sản phẩm trong `prisma.$transaction` khi đơn bị hủy.
- **Hệ Thống Realtime SSE & Email Động**:
  - Kênh Server-Sent Events `/api/v1/notifications/sse` đẩy sự kiện thời gian thực tới trình duyệt.
  - Tích hợp Dynamic SMTP Transporter đọc cấu hình trực tiếp từ bảng `system_settings` trong MySQL.
- **Quản lý File Tự Động**:
  - Upload file an toàn với `multer`, lưu đường dẫn tương đối và tự động xóa file vật lý trên ổ cứng khi xóa sản phẩm hoặc danh mục liên kết.

---

## 🛠️ 6. Công Nghệ Sử Dụng (Tech Stack)

| Phân hệ | Công nghệ & Thư viện |
| :--- | :--- |
| **Backend API (`app/backend`)** | **NestJS 11**, **Prisma ORM 7**, **MySQL 8.0**, **Redis** (`ioredis`), **Passport JWT**, **Bcrypt**, **Multer**, **ExcelJS**, **Nodemailer**, **RxJS**, **Class-Validator**, **Throttler**. |
| **Customer Storefront (`app/frontend`)** | **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **TypeScript**, **Zustand 5**, **BFF Route Handlers**, **Lucide Icons**. |
| **Admin Dashboard (`app/dash/my-app`)** | **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **TypeScript**, **Zustand 5**, **TipTap / ProseMirror WYSIWYG Editor**, **Lucide Icons**. |
| **Quy chuẩn Toàn Dự án** | **TypeScript Strict Mode** (Zero `any`), **ESLint 9**, **Prettier**, **Figma & Stitch Design System**. |

---

## 📂 7. Cấu Trúc Thư Mục Toàn Dự Án

```text
ecommerce-platform/
├── .agent/                             # AI Agent Workflows, Custom Skills & Memory Rules
├── .docs/                              # Tài liệu Kiến trúc, Backend Plans, Frontend Plans & UI Mockups
│   ├── ARCHITECTURE.md                 # Sơ đồ Kiến trúc & Thiết kế Database cốt lõi
│   ├── FEATURES_DONE.md                # Nhật ký tiến độ chi tiết toàn bộ tính năng
│   ├── STYLEGUIDE.md                   # Quy chuẩn bảng màu Tailwind & Design Tokens
│   ├── backend-plans/                  # Bản vẽ kỹ thuật & Database Specs cho từng Module
│   ├── frontend-plans/                 # Bản vẽ kỹ thuật Frontend & Component Hierarchy
│   └── ui-mockups/                     # File thiết kế HTML/Tailwind gốc từ Figma
├── app/
│   ├── backend/                        # ⚙️ NestJS API Server (Port 3001)
│   │   ├── prisma/
│   │   │   ├── schema.prisma           # Prisma Schema (Users, Products, Orders, Categories, Settings...)
│   │   │   ├── seed.ts                 # Script Seeding dữ liệu mẫu
│   │   │   └── create-admin.ts         # Script khởi tạo tài khoản Quản trị viên tối cao
│   │   ├── src/
│   │   │   ├── addresses/              # Module Sổ địa chỉ nhận hàng
│   │   │   ├── auth/                   # Module Xác thực JWT, Cookie, Redis Blacklist, RBAC Guards
│   │   │   ├── banners/                # Module Quản lý Banner khuyến mãi
│   │   │   ├── cart/                   # Module Giỏ hàng & Guest Cart Merge
│   │   │   ├── categories/             # Module Danh mục sản phẩm
│   │   │   ├── customers/              # Module Quản lý Khách hàng (Member & Guest)
│   │   │   ├── dashboard/              # Module Thống kê Tổng quan, Charts & Global Search
│   │   │   ├── mail/                   # Module Gửi Email HTML động qua Dynamic SMTP
│   │   │   ├── notifications/          # Module In-App SSE Push Notifications
│   │   │   ├── orders/                 # Module Đơn hàng, State Machine, VietQR & Export Excel
│   │   │   ├── products/               # Module Sản phẩm, Media Gallery & Fulltext Filter
│   │   │   ├── settings/               # Module Cài đặt Hệ thống, Navigation Menus, SEO
│   │   │   ├── staffs/                 # Module Nhân sự & Nhóm quyền (Role Groups)
│   │   │   └── upload/                 # Module Upload File & Tự động dọn dẹp Disk
│   │   └── package.json
│   │
│   ├── frontend/                       # 🛒 Customer Storefront Next.js App Router (Port 3000)
│   │   ├── app/
│   │   │   ├── (auth)/                 # Routes: /login, /register
│   │   │   ├── (support)/              # Routes: /support/[page], /contact
│   │   │   ├── api/                    # BFF Route Handlers (auth, refresh, me, download-qr...)
│   │   │   ├── categories/[slug]/      # Trang Danh sách sản phẩm theo danh mục
│   │   │   ├── checkout/               # Trang Thanh toán đơn hàng & VietQR
│   │   │   ├── orders/[orderCode]/     # Trang Chi tiết & Theo dõi đơn hàng
│   │   │   ├── products/               # Trang Danh sách toàn bộ sản phẩm & Bộ lọc
│   │   │   ├── products/[slug]/        # Trang Chi tiết sản phẩm & Rich Text
│   │   │   ├── profile/                # Trang Quản lý tài khoản, Sổ địa chỉ & Đơn mua
│   │   │   ├── layout.tsx              # Root Layout đồng bộ Dynamic Settings, Favicon, SEO
│   │   │   └── page.tsx                # Trang chủ Async Server Component
│   │   ├── components/                 # UI Components phân tách rõ Dumb/Smart UI
│   │   ├── hooks/                      # Custom Hooks (useDebounce, useAuthInit, useSearchSuggest...)
│   │   ├── lib/                        # Client API Fetcher, Server API Fetcher, Axios Interceptors
│   │   ├── store/                      # Zustand Stores (useCartStore, useAuthStore)
│   │   └── types/                      # TypeScript Domain Interfaces
│   │
│   └── dash/my-app/                    # 🛠️ Admin Dashboard Next.js App Router (Port 3002)
│       ├── app/
│       │   ├── (dashboard)/            # Dashboard Routes (/dashboard, /products, /categories, /orders...)
│       │   ├── api/auth/refresh/       # BFF Token Refresh Handler
│       │   ├── layout.tsx              # Master Layout Shell Server Component
│       │   └── page.tsx                # Admin Dashboard Home
│       ├── components/                 # Admin Layout Shell, Sidebar, Header, Breadcrumbs, Can Guard
│       ├── features/                   # Feature Modules (products, categories, orders, customers, staffs...)
│       ├── hooks/                      # Custom Hooks (usePermissions, useAdminNotifications, useGlobalSearch)
│       ├── lib/                        # Admin API Fetcher, Interceptors, Rich Text Serializers
│       ├── store/                      # Zustand Stores (sidebar.store, admin-auth.store, order-stats.store)
│       └── types/                      # TypeScript Interface Definitions
└── README.md                           # Tài liệu Hợp nhất Toàn Dự án
```

---

## 🚀 8. Hướng Dẫn Cài Đặt & Khởi Chạy (Getting Started)

### Yêu Cầu Môi Trường (Prerequisites)
- **Node.js**: Phiên bản `>= 18.x` (Khuyến nghị Node 20 LTS trở lên)
- **MySQL**: Phiên bản `>= 8.0` (Đang chạy tại cổng `3306`)
- **Redis Server**: Phiên bản `>= 6.0` (Đang chạy tại cổng `6379`)

---

### Bước 1: Khởi Chạy Backend Server (`app/backend`)

1. Di chuyển vào thư mục backend và cài đặt dependencies:
   ```bash
   cd app/backend
   npm install
   ```

2. Tạo file cấu hình môi trường `.env`:
   ```bash
   cp .env.example .env
   ```

3. Khởi tạo Cơ sở dữ liệu và Seeding dữ liệu mẫu:
   ```bash
   # Đồng bộ Schema vào MySQL
   npx prisma db push

   # Seed dữ liệu mẫu (Danh mục, Sản phẩm, Banners, Cài đặt hệ thống)
   npm run db:seed

   # (Tùy chọn) Tạo tài khoản Quản trị viên tối cao mặc định
   npm run db:create-admin
   ```

4. Khởi chạy Backend Server ở chế độ Development:
   ```bash
   npm run start:dev
   ```
   👉 *Backend API Server sẵn sàng tại:* `http://localhost:3001`

---

### Bước 2: Khởi Chạy Customer Storefront (`app/frontend`)

1. Mở một terminal mới, di chuyển vào thư mục frontend và cài đặt dependencies:
   ```bash
   cd app/frontend
   npm install
   ```

2. Tạo file cấu hình môi trường `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

3. Khởi chạy Storefront Dev Server:
   ```bash
   npm run dev
   ```
   👉 *Customer Storefront sẵn sàng tại:* `http://localhost:3000`

---

### Bước 3: Khởi Chạy Admin Dashboard (`app/dash/my-app`)

1. Mở một terminal mới, di chuyển vào thư mục admin dashboard và cài đặt dependencies:
   ```bash
   cd app/dash/my-app
   npm install
   ```

2. Tạo file cấu hình môi trường `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

3. Khởi chạy Dashboard Dev Server:
   ```bash
   npm run dev
   ```
   👉 *Admin Dashboard sẵn sàng tại:* `http://localhost:3002`

---

### 🔑 Tài Khoản Mặc Định Khởi Tạo (Seed Accounts)

| Vai trò | Email đăng nhập | Mật khẩu mặc định | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (`ADMIN`)** | `admin@techbite.vn` | `Admin@123456` | Toàn quyền quản trị Dashboard & Phân quyền |
| **Nhân viên (`STAFF`)** | `staff@techbite.vn` | `Staff@123456` | Quản lý đơn hàng, sản phẩm theo phân quyền |
| **Khách hàng (`CUSTOMER`)** | `customer@techbite.vn` | `Customer@123456` | Mua sắm, quản lý đơn cá nhân |

---

## ⚙️ 9. Cấu Hình Biến Môi Trường (.env)

### 1. Backend (`app/backend/.env`)
```env
# Database Configuration (MySQL)
DATABASE_URL="mysql://root:password@localhost:3306/techbite_ecommerce"

# Server Configuration
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# Redis Cache & Session Configuration
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379
REDIS_PASSWORD=""

# JWT Security Secrets
JWT_SECRET="techbite_super_secret_jwt_access_key_2026"
JWT_REFRESH_SECRET="techbite_super_secret_jwt_refresh_key_2026"

# Dynamic SMTP Fallback Configuration
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="your-email@gmail.com"
MAIL_PASS="your-app-password"
MAIL_FROM="\"TechBite Platform\" <noreply@techbite.vn>"
```

### 2. Customer Storefront (`app/frontend/.env.local`)
```env
# NestJS Backend API Base URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Frontend Website Base URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Admin Dashboard (`app/dash/my-app/.env.local`)
```env
# URL Customer Storefront
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# NestJS Backend API Base URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 📡 10. Danh Sách API Endpoints Trọng Yếu

### 🔐 Xác thực & Người dùng (`/api/v1/auth`)
- `POST /api/v1/auth/register` — Đăng ký tài khoản khách hàng mới.
- `POST /api/v1/auth/login` — Đăng nhập hệ thống (cấp Access Token & HttpOnly Refresh Token).
- `POST /api/v1/auth/refresh-token` — Làm mới Access Token thông qua Refresh Token Rotation.
- `POST /api/v1/auth/logout` — Đăng xuất và đưa token vào Redis Blacklist.
- `GET  /api/v1/auth/me` — Lấy thông tin tài khoản đang đăng nhập.
- `PATCH /api/v1/auth/profile` — Cập nhật thông tin cá nhân.
- `PATCH /api/v1/auth/change-password` — Đổi mật khẩu và thu hồi toàn bộ phiên làm việc cũ.

### 🛍️ Sản phẩm & Danh mục công khai (`/api/v1/products`, `/api/v1/categories`)
- `GET /api/v1/categories` — Lấy danh sách chuyên mục (hỗ trợ phân cấp cây).
- `GET /api/v1/products` — Lấy danh sách sản phẩm (hỗ trợ bộ lọc giá, danh mục, tồn kho, sắp xếp, phân trang).
- `GET /api/v1/products/featured` — Lấy danh sách sản phẩm nổi bật trang chủ.
- `GET /api/v1/products/search-suggest?q=` — Tìm kiếm gợi ý sản phẩm nhanh (Debounced).
- `GET /api/v1/products/:slug` — Lấy thông tin chi tiết sản phẩm theo slug/id.

### 🛒 Đơn hàng & Thanh toán (`/api/v1/orders`)
- `POST /api/v1/orders` — Khởi tạo đơn hàng mới (tính toán giá tiền server-side & giảm tồn kho).
- `GET  /api/v1/orders/my-orders` — Lấy danh sách lịch sử đơn hàng của người dùng (kèm phân loại tab & statusCounts).
- `GET  /api/v1/orders/:orderCode` — Lấy chi tiết đơn hàng (kèm thông tin VietQR nếu chưa thanh toán).

### 🛠️ Quản trị Admin Dashboard (`/api/v1/admin`)
- `GET  /api/v1/admin/dashboard/stats` — Thống kê 4 thẻ chỉ số KPI & Doanh thu Area Chart.
- `GET  /api/v1/admin/dashboard/search/global?q=` — Omnisearch tìm kiếm nhanh mọi thực thể (`Ctrl + K`).
- `GET  /api/v1/admin/products` & `POST / PATCH / DELETE` — Quản trị sản phẩm, TipTap Rich Text & ảnh phụ.
- `GET  /api/v1/admin/categories` & `POST / PATCH / DELETE` — Quản trị danh mục & chống đệ quy.
- `GET  /api/v1/admin/orders` & `PATCH /:id/status` — Quản trị đơn hàng & 1-Click Fast Confirm.
- `GET  /api/v1/admin/orders/export/excel` — Xuất báo cáo đơn hàng Excel nhị phân `.xlsx` native.
- `GET  /api/v1/admin/customers` & `POST / PATCH` — Quản trị khách hàng, ghi chú & chuyển đổi loại tài khoản.
- `GET  /api/v1/admin/staffs` & `POST / PATCH` — Quản lý nhân sự, gán nhóm quyền & phân quyền RBAC.
- `GET  /api/v1/admin/settings` & `PATCH` — Cấu hình hệ thống, Drag-Drop Navigation Menus & Dynamic SMTP.
- `POST /api/v1/upload/image` — Tải lên hình ảnh đơn & đa file với kiểm tra định dạng an toàn.

### 🔔 Thông báo Realtime (`/api/v1/notifications`)
- `GET /api/v1/notifications/sse` — Luồng SSE nhận sự kiện thông báo thời gian thực.
- `GET /api/v1/notifications` — Lấy danh sách thông báo in-app có phân trang.
- `PATCH /api/v1/notifications/:id/read` — Đánh dấu đã đọc thông báo.

---

## 🔒 11. Quy Chuẩn Lập Trình & Bảo Mật Chuẩn Enterprise

1. **Chuẩn TypeScript Strict**: Tuyệt đối cấm sử dụng kiểu `any`. Mọi DTO, Props và API Response đều phải được định nghĩa `interface` hoặc `type` tường minh.
2. **Next.js Rendering Constraints**: Bắt buộc dùng **Server Component** cho các trang render dữ liệu chính (`page.tsx`). Chỉ tách sang **Client Component** khi có tương tác người dùng (Form, Event Listener, State).
3. **Quy chuẩn Hiệu năng & Debounce**: Cấm gọi API tìm kiếm trên từng lượt gõ phím. Mọi ô nhập tìm kiếm/auto-complete bắt buộc bọc qua cơ chế **Debounce** với độ trễ tối thiểu `300ms - 500ms` (sử dụng custom hook `useDebounce`).
4. **Bảo mật JWT & Cookie HttpOnly**:
   - Refresh Token bắt buộc lưu trong Cookie `HttpOnly` (`path=/`, `sameSite=lax`, `secure`), ngăn chặn hoàn toàn tấn công XSS trộm token.
   - Access Token được kiểm tra tính hợp lệ và đối soát qua Redis Blacklist Middleware.
   - Xác định danh tính người dùng luôn được parse từ Access Token đã verify, không tin tưởng `userId` gửi trong Request Body.
5. **Đồng bộ UI & Optimistic Updates**: Xử lý đầy đủ 3 trạng thái cho mọi luồng dữ liệu: **Loading** (Skeleton/Spinner), **Error** (Toast/Banner), và **Success/Empty State**.

---

## 📄 Bản Quyền (License)

Dự án được phát triển theo tiêu chuẩn kiến trúc Enterprise E-Commerce Platform.

© 2026 **TechBite E-Commerce Platform**. All rights reserved.
