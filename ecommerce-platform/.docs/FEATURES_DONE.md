## [2026-08-04] Hoàn thành UI Trang chủ (Home Page) TechBite
- Cài đặt cấu trúc Next.js App Router, TypeScript và Tailwind CSS v4 tại `app/frontend`.
- Dựng toàn bộ UI Trang chủ TechBite từ Stitch design spec (`Header`, `HeroBanner`, `CategoryRail`, `ProductCard`, `FeaturedProductsSection`, `SocialProofBanner`).
- Nâng cấp Responsive toàn diện cho Mobile/Tablet/Desktop, thêm Mobile Menu Drawer, Floating Bottom Nav Bar và khắc phục hoàn toàn lỗi hiển thị Banner.

## [2026-08-04] Hoàn thành UI Giỏ hàng trượt (Cart Drawer) TechBite
- Dựng UI Cart Drawer từ Stitch design spec & `02-cart-plan.md` với Zustand store (`useCartStore`).
- Thêm Toast Notification khi bấm thêm sản phẩm, đồng bộ badge số lượng tức thì lên Header/Mobile Nav và tối ưu hiệu ứng trượt 60fps chống giật scrollbar.

## [2026-08-06] Hoàn thành Backend API Module Home Page
- Tạo 3 NestJS modules (banners, categories, products) với đầy đủ Controller, Service, DTO, Interface.
- Endpoints: `GET /api/v1/banners`, `GET /api/v1/categories`, `GET /api/v1/products/featured` (phân trang).
- Global ValidationPipe, CORS, in-memory cache (TTL chuẩn theo plan), zero TypeScript errors.

## [2026-08-06] Kết nối Frontend → Backend (Loại bỏ Mock Data)
- Tạo `lib/api.ts` (base fetch wrapper, ISR revalidate 60s) và `lib/home.ts` (server-side fetchers).
- Chuyển `app/page.tsx` thành async Server Component gọi API thật, graceful fallback khi DB trống.
- Tạo `.env.local` với `NEXT_PUBLIC_API_URL=http://localhost:3001`.

## [2026-08-06] Database Seeding — Module Home Page
- Tạo `prisma/seed.ts` với 3 Banners, 5 Categories, 11 Products (đa dạng featured/stock/salePrice).
- Cài `@prisma/adapter-mariadb`, cập nhật `PrismaService` dùng driver adapter (Prisma 7 requirement).
- Script `npm run db:seed` chạy thành công, idempotent (tự xóa data cũ trước khi seed).

## [2026-08-06] Hoàn thành API Module Product List Page & Banner Seeding
- Viết 3 API endpoints: `GET /api/v1/products` (filter, sort, pagination), `GET /api/v1/products/filter-meta`, `GET /api/v1/products/:slug`.
- Cập nhật DTO, Interface, Service Caching MD5, Controller routing tối ưu chống trùng khớp slug.
- Seeding thêm 3 Promotion Banners cho trang Product List vào `prisma/seed.ts` và chạy `npm run db:seed` thành công.

## [2026-08-08] Hoàn thành UI Trang Product List & Tích hợp API Banner
- Tái cấu trúc UI trang Product List thành Async Server Component kết nối trực tiếp dữ liệu từ NestJS Backend API.
- Đồng bộ các trạng thái bộ lọc (danh mục, giá, tồn kho, sắp xếp, phân trang) lên URL Query Parameters.
- Tích hợp API Promotion Banners (`GET /api/v1/banners?type=PROMOTION_BANNER`) hiển thị Carousel banner khuyến mãi tương tác.

## [2026-08-08] Hoàn thành Logic Bộ Lọc Giá (Price Filter) & Danh Mục trong Product List
- Nâng cấp Backend (`products.service.ts`): Lọc theo giá bán thực tế (`salePrice ?? price`) và tính khoảng giá thực tế min/max của sản phẩm active.
- Hoàn thiện Frontend (`FilterPriceRange`): Tự động tạo Presets và Placeholder khoảng giá từ giá nhỏ nhất đến giá lớn nhất thực tế từ API. Bổ sung dòng hiển thị "Thực tế: min - max", ô nhập tùy chỉnh, validation và nút xóa lọc giá.
- Bổ sung số lượng sản phẩm hiển thị trực tiếp ngay bên cạnh tên tất cả các danh mục (bao gồm mục "Tất cả sản phẩm") trong bộ lọc (`FilterCategoryGroup`).
- Tối ưu hiệu ứng Active màu cam nổi bật cho tên danh mục (`text-orange-600 font-extrabold`), icon danh mục và badge đếm số lượng khi danh mục được chọn.
- Đồng bộ mượt mà với URL Query Parameters (`minPrice`, `maxPrice`, `category`) qua `useProductListNavigation`.

## [2026-08-08] Hoàn thành UI Trang Chi Tiết Sản Phẩm & Seeding Dữ Liệu Back-end
- Dựng UI trang Chi tiết sản phẩm (`app/products/[slug]/page.tsx`) dạng Async Server Component kết nối dữ liệu thật từ NestJS API (`GET /api/v1/products/:slug`).
- Tách các Client Component: `ProductGallery` (ảnh chính, badge discount %, gallery thumbnails), `ProductInfo` (tiêu đề, nhãn danh mục, đánh giá, nhãn còn hàng, khối giá tiền, bộ đếm `QuantityCounter`, nút bấm "Thêm vào giỏ" trượt + toast & "Mua ngay"), `ProductTabs` (Mô tả & Thông số thành phần) và `RelatedProducts` (tái sử dụng `ProductCard`).
- Khắc phục lỗi 404 & Gắn Link điều hướng: Bọc thẻ `Link` điều hướng sang `/products/[slug]` cho tất cả `ProductCard` & `ProductCardList`, hỗ trợ tra cứu slug/id/fallback trong Backend `products.service.ts`.
- Seeding Dữ liệu Back-end: Đã seed 15 sản phẩm phong phú đầy đủ mô tả chi tiết, giá bán, giá khuyến mãi, tồn kho và hình ảnh chất lượng cao vào DB MySQL.

## [2026-08-09] Hoàn thành Tính năng Tìm Kiếm Gợi Ý (Search Suggest) Full-stack
- Quy hoạch kỹ thuật & Thiết kế giao diện Stitch cho tính năng Search Suggest (Desktop/Mobile Header).
- Cập nhật Prisma Schema (`prisma/schema.prisma`): Bổ sung index `idx_product_active_name` & `idx_product_name` tối ưu tốc độ tìm kiếm theo tên món ăn.
- Xây dựng API Backend (`GET /api/v1/products/search-suggest`): Đặt route trước `/:slug`, hỗ trợ validation `SearchSuggestQueryDto` (tối thiểu 2 ký tự), phân trang limit, cache In-Memory / Redis 10 phút.
- Tích hợp Frontend (`useSearchSuggest` + `lib/search.ts`): Xử lý trọn vẹn 3 trạng thái **Loading** (Skeleton pulse), **Error** (UI thông báo lỗi), và **Success/Empty** (Gợi ý sản phẩm với highlight từ khóa `<mark>`, nút xem tất cả kết quả & đóng dropdown khi click out / nhấn Escape).

## [2026-08-09] Hoàn thành UI Module Auth & Profile (Đăng nhập, Đăng ký, Profile)
- Quy hoạch kỹ thuật Frontend (`06-auth-plan.md`), Thiết kế brief (`06-auth-brief.md`) và tạo/đồng bộ giao diện Stitch cho 3 màn hình Đăng nhập, Đăng ký, Hồ sơ cá nhân.
- Xây dựng hoàn chỉnh UI React/Next.js App Router (TypeScript, Tailwind CSS) phân tách rõ Server/Client Component, Smart/Dumb UI, validation realtime, hiệu ứng Stitch glow & Bento layout, đồng bộ Header/Footer và Toast feedback.

## [2026-08-09] Hoàn thành Tích hợp API Đăng ký tài khoản & Tự động đăng nhập (Bảo mật Cookie HttpOnly)
- Xây dựng Next.js Route Handler ([app/api/auth/register/route.ts](file:///d:/vibe_coding/ecommerce-platform/app/frontend/app/api/auth/register/route.ts)): Nhận request đăng ký từ Client, chuyển tiếp sang NestJS backend (`POST /api/v1/auth/register`), và thiết lập `accessToken` trực tiếp vào Cookie `HttpOnly` (`path=/`, `sameSite=lax`, `secure`) thông qua Next.js Server Response.
- Xây dựng Next.js Logout Route Handler ([app/api/auth/logout/route.ts](file:///d:/vibe_coding/ecommerce-platform/app/frontend/app/api/auth/logout/route.ts)): Xóa bỏ Cookie `HttpOnly` (`accessToken` & `refreshToken`) khi đăng xuất.
- Tuân thủ Tuyệt đối Quy chuẩn Bảo mật: **TUYỆT ĐỐI KHÔNG** lưu thông tin người dùng (`user`) hay `accessToken` vào LocalStorage hoặc Client Store state dưới dạng Plain Text.
- Tích hợp UI Form (`RegisterFormContainer`): Xử lý trọn vẹn 3 trạng thái **Loading** (Spinning button), **Error** (Validation & Server error alerts từ backend), và **Success** (Tự động đăng nhập qua Cookie HttpOnly, Toast thành công, điều hướng về `/`).

## [2026-08-09] Hoàn thành Tích hợp API Đăng Nhập & Quản lý Phiên (Cookie HttpOnly + Redis Session)
- Xây dựng Backend API NestJS (`POST /api/v1/auth/login`, `POST /api/v1/auth/refresh-token`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`): Xác thực `bcrypt` saltRound 12, cập nhật `lastLoginAt`, quản lý Refresh Token JTI trên Redis & Blacklist Access Token khi logout, cơ chế chống Replay Attack thu hồi phiên tự động.
- Xây dựng Next.js Route Handler ([app/api/auth/login/route.ts](file:///d:/vibe_coding/ecommerce-platform/app/frontend/app/api/auth/login/route.ts)): Tiếp nhận thông tin đăng nhập từ Client, gửi tới NestJS Backend và thiết lập Cookie `HttpOnly` (`accessToken` & `refreshToken`) trực tiếp phía Server.
- Tích hợp UI Form ([LoginFormContainer](file:///d:/vibe_coding/ecommerce-platform/app/frontend/components/auth/login-form-container.tsx)): Loại bỏ toàn bộ Mock Data, xử lý đủ 3 trạng thái **Loading** (Button spinner & disabled state), **Error** (Validation alert banner & Toast thông báo lỗi từ server), và **Success** (Cập nhật trạng thái `useAuthStore`, Toast thành công và chuyển hướng về `/`).

## [2026-08-09] Hoàn thành Tích hợp API Refresh Token tự động (Next Client & Next Server)
- Xây dựng Next.js Route Handler ([app/api/auth/refresh/route.ts](file:///d:/vibe_coding/ecommerce-platform/app/frontend/app/api/auth/refresh/route.ts)): Tiếp nhận yêu cầu refresh token từ Client, chuyển tiếp tới NestJS Backend (`POST /api/v1/auth/refresh-token`), và cập nhật Cookie HttpOnly cho `accessToken` (15m) & `refreshToken` (7d) mới với `path: '/'`.
- Xây dựng Client API Fetch Interceptor ([lib/client-api.ts](file:///d:/vibe_coding/ecommerce-platform/app/frontend/lib/client-api.ts)): Tự động bắt lỗi HTTP 401 trên Client Components, quản lý cờ `isRefreshing` và hàng đợi `failedQueue` chống race-condition, gọi `/api/auth/refresh` và retry tự động các request bị lỗi.
- Xây dựng Server API Fetch Interceptor ([lib/server-api.ts](file:///d:/vibe_coding/ecommerce-platform/app/frontend/lib/server-api.ts)): Tự động bắt lỗi HTTP 401 trên Next Server Context (Server Components, Route Handlers, Server Actions), đọc `refreshToken` từ `cookies()`, refresh trực tiếp với NestJS Backend và retry request gốc với `Authorization` header mới.
- Đồng bộ Cookie path giữa NestJS Backend AuthController và Next.js BFF (`path: '/'`), đảm bảo 0 lỗi TypeScript trên cả Frontend và Backend (`npx tsc --noEmit`).

## [2026-08-09] Hoàn thành Khôi Phục Phiên Đăng Nhập & Refresh Token Tự Động khi F5 (Auth Hydration)
- Sửa lỗi sinh `Role` Prisma Client backend: Thực thi `npx prisma generate` giải quyết triệt để lỗi TypeScript `Module '@prisma/client' has no exported member 'Role'`.
- Tối ưu Route Handler làm mới token ([app/api/auth/refresh/route.ts](file:///d:/vibe_coding/ecommerce-platform/app/frontend/app/api/auth/refresh/route.ts)): Đọc `refreshToken` thông qua `cookies()` từ `next/headers` và gửi sạch `Cookie: refreshToken=${refreshToken}` sang NestJS.
- Xây dựng Next.js Route Handler ([app/api/auth/me/route.ts](file:///d:/vibe_coding/ecommerce-platform/app/frontend/app/api/auth/me/route.ts)): BFF endpoint gọi NestJS `/api/v1/auth/me` sử dụng `serverApiFetch`. Tự động bắt 401, gọi NestJS refresh token và cấp lại Cookie HttpOnly mới.
- Xây dựng Custom Hook ([useAuthInit](file:///d:/vibe_coding/ecommerce-platform/app/frontend/hooks/use-auth-init.ts)): Khởi tạo phiên người dùng khi ứng dụng mount/F5, tự động cập nhật `user` và `isAuthenticated` vào Zustand store (`useAuthStore`).
## [2026-08-09] Hoàn thành Tích hợp API Trang Profile & Chức năng Chỉnh Sửa Thông Tin Cá Nhân
- Xây dựng NestJS Backend DTO & API Endpoint ([update-profile.dto.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/dto/update-profile.dto.ts), [auth.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/auth.service.ts), [auth.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/auth.controller.ts)): Định nghĩa `UpdateProfileDto` xác thực dữ liệu (`fullName`, `phone`, `avatarUrl`), cập nhật DB MySQL và mở endpoint `PATCH /api/v1/auth/profile` bảo mật bằng `JwtAuthGuard`.
- Xây dựng Next.js BFF Route Handler ([app/api/auth/profile/route.ts](file:///d:/vibe_coding/ecommerce-platform/app/frontend/app/api/auth/profile/route.ts)) & Helper ([lib/auth.ts](file:///d:/vibe_coding/ecommerce-platform/app/frontend/lib/auth.ts)): Đính kèm token tự động thông qua `serverApiFetch`, tự động làm mới token nếu hết hạn và chuyển tiếp request lên NestJS Backend.
## [2026-08-09] Hoàn thành Chức năng Đổi Mật Khẩu & Thu Hồi Tất Cả Token Cũ (Full-stack Security)
- Xây dựng NestJS Backend DTO & API Endpoint ([change-password.dto.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/dto/change-password.dto.ts), [auth.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/auth.service.ts), [auth.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/auth/auth.controller.ts)): Xác thực mật khẩu cũ bằng `bcrypt.compare`, mã hóa mật khẩu mới với `saltRounds = 12`, kiểm tra trùng lặp mật khẩu cũ và mở endpoint `PATCH /api/v1/auth/change-password` bảo mật bằng `JwtAuthGuard` & `@Throttle`.
- Cơ chế Thu hồi Token Bảo mật Đa Trình Duyệt (Multi-device Security Token Revocation): Ngay khi đổi mật khẩu thành công, ghi nhận mốc thời gian `auth:password_changed:${userId}` trên Redis (TTL 15m), xóa toàn bộ Refresh Token của user khỏi Redis (`auth:refresh:${userId}:*`), và đưa `accessJti` hiện tại vào Blacklist. `JwtStrategy` kiểm tra `iat < passwordChangedAt` ➔ Vô hiệu hóa NGAY LẬP TỨC toàn bộ Access Token cũ trên TẤT CẢ trình duyệt/thiết bị khác.
- Xây dựng Next.js BFF Route Handler ([app/api/auth/change-password/route.ts](file:///d:/vibe_coding/ecommerce-platform/app/frontend/app/api/auth/change-password/route.ts)) & Helper ([lib/auth.ts](file:///d:/vibe_coding/ecommerce-platform/app/frontend/lib/auth.ts)): Tự động xóa sạch HttpOnly Cookies (`accessToken` & `refreshToken`) trên Server context khi đổi mật khẩu thành công.
- Xây dựng UI Component ([change-password-card.tsx](file:///d:/vibe_coding/ecommerce-platform/app/frontend/components/profile/change-password-card.tsx) & [profile-container.tsx](file:///d:/vibe_coding/ecommerce-platform/app/frontend/components/profile/profile-container.tsx)): Thẻ đổi mật khẩu độc lập hỗ trợ nút Ẩn/Hiện mật khẩu, validation đồng bộ 100% với trang Đăng ký, tự động xóa Zustand Store client state và điều hướng sang `/login` yêu cầu người dùng đăng nhập lại bằng mật khẩu mới. 0 lỗi TypeScript (`npx tsc --noEmit`).
- **Tổng hợp Toàn Bộ Lịch Sử & Tài Liệu Kỹ Thuật Module Auth:** [AUTH_MODULE_SUMMARY.md](file:///d:/vibe_coding/ecommerce-platform/.docs/AUTH_MODULE_SUMMARY.md)

## [2026-08-10] Hoàn thành Module Thanh Toán Đơn Hàng (Checkout Page) Full-stack
- Quy hoạch kỹ thuật ([07-checkout-plan.md](file:///d:/vibe_coding/ecommerce-platform/.docs/frontend-plans/07-checkout-plan.md)), Design Brief ([07-checkout-brief.md](file:///d:/vibe_coding/ecommerce-platform/.docs/design-briefs/07-checkout-brief.md)) & Thiết kế giao diện Stitch UI Desktop Screen ID `6d123043543c4edcbb0ca61690cf4214` đồng bộ Master Layout.
- Xây dựng UI Trang Thanh Toán ([checkout-container.tsx](file:///d:/vibe_coding/ecommerce-platform/app/frontend/components/checkout/checkout-container.tsx), [user-shipping-section.tsx](file:///d:/vibe_coding/ecommerce-platform/app/frontend/components/checkout/shipping/user-shipping-section.tsx), [order-summary-section.tsx](file:///d:/vibe_coding/ecommerce-platform/app/frontend/components/checkout/summary/order-summary-section.tsx), [coupon-input-container.tsx](file:///d:/vibe_coding/ecommerce-platform/app/frontend/components/checkout/summary/coupon-input-container.tsx)): Form thông tin giao hàng auto-fill profile, chọn phương thức vận chuyển, nhập voucher có `useDebounce`, tính toán tổng tiền chuẩn mực.
- Tích hợp 2 Popup Modal Thanh Toán ([cod-confirmation-modal.tsx](file:///d:/vibe_coding/ecommerce-platform/app/frontend/components/checkout/modals/cod-confirmation-modal.tsx) & [qr-payment-modal.tsx](file:///d:/vibe_coding/ecommerce-platform/app/frontend/components/checkout/modals/qr-payment-modal.tsx)): Hỗ trợ COD với popup ghi chú nhận hàng & VietQR Code MB Bank thật, đồng hồ đếm ngược 15p, sao chép nhanh STK/Nội dung CK và polling tự động 3s/lần.
- Xây dựng BFF Proxy Route Handler ([app/api/download-qr/route.ts](file:///d:/vibe_coding/ecommerce-platform/app/frontend/app/api/download-qr/route.ts)): Hỗ trợ nút *"Tải mã QR Code"* tải trực tiếp file ảnh `.png` về thiết bị mà không bị chặn CORS hay redirect trang.
- Gắn Link Điều hướng `/checkout`: Tích hợp đồng bộ nút *"Thanh Toán Ngay ⚡"* tại Cart Drawer ([cart-drawer.tsx](file:///d:/vibe_coding/ecommerce-platform/app/frontend/components/cart/cart-drawer.tsx)) và nút *"Mua ngay"* tại trang Chi tiết sản phẩm ([product-info.tsx](file:///d:/vibe_coding/ecommerce-platform/app/frontend/components/product-detail/product-info.tsx)). 0 lỗi TypeScript (`npx tsc --noEmit`).

## [2026-08-10] Hoàn thành Tích hợp API Lịch sử Đơn hàng & Trang Xem Chi Tiết Đơn Hàng (Full-stack)
- **Tích hợp API Lịch sử đơn hàng:** Nối API `GET /api/v1/orders/my-orders` vào trang Profile. Tự động chuyển đổi giữa 5 đơn mới nhất ở tab Tổng quan và toàn bộ danh sách ở tab Đơn hàng (kèm thanh phân trang Full-stack).
- **Phân tách Trạng thái:** Hiển thị rõ ràng 2 nhãn độc lập: Trạng thái Đơn hàng (`orderStatus`) & Trạng thái Thanh toán (`paymentStatus`), hiển thị mốc thời gian `paidAt` khi đã xác nhận chuyển khoản thành công.
- **Backend Order Detail API (`GET /api/v1/orders/:orderCode`):** Trả về đầy đủ thông tin đơn hàng, danh sách món mua, phí vận chuyển, giảm giá voucher, thông tin người nhận, địa chỉ giao hàng và thông tin VietQR (nếu chưa thanh toán). Có kiểm tra quyền truy cập của User.
- **Next.js Order Detail Page (`app/orders/[orderCode]/page.tsx`):** Dựng trang chi tiết dạng Async Server Component + Smart Client Component `OrderDetailContainer` đầy đủ Stepper tiến trình vận chuyển, bảng kê giá, thẻ thông tin người nhận, nút In hóa đơn và tích hợp VietQR Payment Modal.

## [2026-08-10] Hoàn thành Chức năng Theo dõi Đơn hàng trong Trang Profile (Full-stack Order Tracking)
- **Backend API & Service (`orders.service.ts` & `orders.controller.ts`):** Nâng cấp endpoint `GET /api/v1/orders/my-orders` hỗ trợ lọc theo trạng thái (`status`), tìm kiếm (`search` theo orderCode/tên món ăn) và trả về tổng số lượng `statusCounts` của từng trạng thái đơn hàng.
- **Next.js BFF & Client API (`my-orders/route.ts` & `lib/orders.ts`):** Chuyển tiếp query params `status` và `search` từ Frontend lên Backend, đính kèm `statusCounts` vào response interface `MyOrdersResponse`.
- **Thanh lọc Trạng thái & Tim kiếm Debounced (`order-history-list.tsx`):** Thanh Tab trượt ngang với 7 nhãn trạng thái và badge đếm số lượng thời gian thực, kết hợp ô tìm kiếm sử dụng `useDebounce` (trễ 400ms) tuân thủ quy chuẩn hiệu năng.
- **Progress Stepper & Quick Action Buttons (`order-history-list.tsx`):** Mini progress bar hiển thị mốc tiến trình trực quan trên từng thẻ đơn hàng, kèm các nút hành động nhanh *"Theo dõi hành trình 🚚"*, *"Thanh toán VietQR 💳"* và *"Mua lại 🛒"*.
- **Modal Theo dõi Chi tiết Hành trình (`order-tracking-modal.tsx`):** Component Modal với timeline tiến trình giao hàng dọc, hiển thị mốc thời gian, người nhận, địa chỉ, danh sách sản phẩm và các nút thao tác nhanh. 0 lỗi TypeScript (`npx tsc --noEmit`).

## [2026-08-10] Hoàn thành Chức năng Quản lý Địa chỉ Nhận hàng (Profile & Checkout) Full-stack
- **Prisma DB Schema & Migration (`schema.prisma`):** Bổ sung model `Address` kết nối quan hệ 1-n với `User`, lưu trữ `recipientName`, `phone`, `provinceCode`, `provinceName`, `districtCode`, `districtName`, `wardCode`, `wardName`, `detailAddress` và cờ `isDefault`. Đã sync thành công DB MySQL (`npx prisma db push`).
- **NestJS Addresses Module (`addresses.service.ts` & `addresses.controller.ts`):** Cung cấp 6 endpoints RESTful chuẩn mực (`GET`, `POST`, `PATCH`, `DELETE`, `PATCH /:id/set-default`) bảo mật qua `JwtAuthGuard`. Tự động quản lý địa chỉ mặc định duy nhất per user bằng Prisma Transaction.
- **Next.js BFF & Client Helper (`addresses/route.ts` & `lib/addresses.ts`):** Tự động đính kèm HttpOnly Cookies, hỗ trợ Refresh Token Rotation tự động và retry request khi 401.
- **UI Trang Hồ sơ cá nhân (`address-manager-card.tsx` & `address-edit-modal.tsx`):** Giao diện Quản lý sổ địa chỉ với Modal thêm/sửa địa chỉ, badge `[★ Địa chỉ mặc định]`, nút thiết lập mặc định, và nút xóa có xác nhận.
- **UI Trang Thanh toán (`checkout-address-selector.tsx` & `user-shipping-section.tsx`):** Tự động tải và chọn Địa chỉ mặc định của người dùng khi truy cập Checkout, cho phép chọn nhanh giữa các địa chỉ đã lưu hoặc chuyển sang "Tự nhập địa chỉ mới" đi kèm checkbox *"Lưu địa chỉ này vào sổ địa chỉ để sử dụng cho lần sau"*. 0 lỗi TypeScript (`npx tsc --noEmit`).

## [2026-08-10] Hoàn thành Trang Danh sách Sản phẩm theo Category (/categories/[slug]) & Đồng bộ Link Trang chủ
- **Async Server Component Dynamic Route ([app/categories/[slug]/page.tsx](file:///d:/vibe_coding/ecommerce-platform/app/frontend/app/categories/%5Bslug%5D/page.tsx)):** Xây dựng route động `/categories/[slug]` hiển thị danh sách sản phẩm lọc theo `slug` danh mục. Tự động trả về `notFound()` nếu danh mục không tồn tại. Tái sử dụng trọn vẹn UI và bộ lọc từ `/products`.
- **Dynamic Navigation Hook ([hooks/use-product-list-navigation.ts](file:///d:/vibe_coding/ecommerce-platform/app/frontend/hooks/use-product-list-navigation.ts)):** Cập nhật `useProductListNavigation` tự động chuyển đổi URL Path giữa `/categories/${slug}` và `/products` khi chọn danh mục khác nhau, giữ nguyên trạng thái bộ lọc giá, tồn kho, sắp xếp và từ khóa tìm kiếm.
- **Thay link Chuyên mục Trang chủ ([category-rail.tsx](file:///d:/vibe_coding/ecommerce-platform/app/frontend/components/home/category-rail.tsx)):** Cập nhật `CategoryRail` trên Trang chủ sử dụng Next.js `<Link>` dẫn trực tiếp đến `/categories/${slug}` (hoặc `/products` đối với mục "Tất cả").
- **Đồng bộ Header & Footer ([header.tsx](file:///d:/vibe_coding/ecommerce-platform/app/frontend/components/layout/header.tsx), [footer.tsx](file:///d:/vibe_coding/ecommerce-platform/app/frontend/components/layout/footer.tsx)):** Đã cập nhật tất cả liên kết danh mục trên Header drawer và Footer sang cấu trúc `/categories/ten-slug`. 0 lỗi TypeScript (`npx tsc --noEmit`).

## [2026-08-11] Hoàn thành Master Layout Admin Dashboard (app/dash)
- Xây dựng toàn bộ cấu trúc layout Admin Dashboard tại `app/dash/my-app`: `LayoutShell`, `AdminSidebar`, `AdminHeader`, `SidebarNav`, `SidebarNavItem`, `SidebarNavGroup`, `SidebarFooter`, `AdminSearchBar`, `HeaderActions`, `AdminMainContent`, `BreadcrumbNav`.
- Cấu hình Zustand store `sidebar.store.ts` & `admin-auth.store.ts`, định nghĩa domain types (`admin-user.types.ts`, `nav.types.ts`, `notification.types.ts`).
- Build thành công, 0 lỗi TypeScript.

## [2026-08-11] Hoàn thành UI Trang Quản lý Chuyên mục (Admin Dashboard — Categories)
- Quy hoạch kỹ thuật Frontend (`01-category-plan.md`) từ idea `01-category-idea.md`, mockup `dash-products/index.html`.
- Xây dựng hoàn chỉnh 10 components: `CategoryPageClient` (Client Container, useState + useDebounce 300ms, CRUD mock), `CategoryPageHeader`, `CategoryFilterBar`, `CategoryTable`, `CategoryTableRow`, `StatusBadge`, `CategoryPagination`, `CategoryFormModal` (Add/Edit, auto-slug), `DeleteConfirmModal`, `page.tsx` (Server Component).
- Thêm `'use client'` đúng chỗ để onClick handlers hoạt động; xóa double padding với `AdminMainContent`. Build thành công, 0 lỗi TypeScript.

## [2026-08-12] Hoàn thành Tích hợp API Quản lý Chuyên mục & Upload Ảnh Icon (Full-stack Admin Categories)
- **Backend Quy hoạch & API Admin Categories ([category-admin-plan.md](file:///d:/vibe_coding/ecommerce-platform/.docs/backend-plans/dashboard/category-admin-plan.md)):** Xây dựng 5 RESTful endpoints (`GET`, `GET /:id`, `POST`, `PATCH`, `DELETE`) bảo mật qua `JwtAuthGuard` & `RolesGuard(ADMIN, STAFF)`.
- **Logic Nghiệp vụ & An toàn Dữ liệu:** Chống đệ quy circular reference khi gán parentId, tự động sinh slug từ tiếng Việt có dấu, kiểm tra an toàn dữ liệu (chặn xóa khi còn sản phẩm/chuyên mục con) và tự động xóa cache Redis (`cache:v1:categories:*`).
- **Module Upload Ảnh Icon:** Tích hợp `multer` upload ảnh (PNG, JPG, WebP, SVG), lưu file dạng tương đối (`/uploads/images/filename.ext`), phục vụ static files qua NestJS `useStaticAssets`.
- **Tích hợp UI Admin Dashboard (Server Component + Toast UI):** Chuyển `page.tsx` thành async Server Component pre-fetch dữ liệu trang đầu (SSR), xây dựng `ToastProvider` thay thế alert mặc định, component `ImageUploader` hỗ trợ Drag & Drop file + xem trước + URL link. Tự động ghép origin từ biến môi trường `NEXT_PUBLIC_API_URL`. 0 lỗi TypeScript trên cả 3 dự án.

## [2026-08-12] Hoàn thành Quy hoạch, Backend API & Tích hợp UI Module Quản lý Sản phẩm (Full-stack Admin Products)
- **Bản quy hoạch Back-end & DB Schema (`02-product-plan.md` & `schema.prisma`):** Định nghĩa chi tiết DTO, API Contract, bổ sung `shortDescription` JSON, `longDescription` JSON, trường `images` JSON (thư viện ảnh phụ đính kèm) và các index tối ưu `price`/`stock`. Đồng bộ thành công MySQL DB qua `npx prisma db push`.
- **NestJS Admin Products Module (`admin-products.controller.ts` & `admin-products.service.ts`):** Xây dựng 5 RESTful endpoints (`GET`, `GET /:id`, `POST`, `PATCH`, `DELETE`) bảo mật qua `JwtAuthGuard` & `RolesGuard`. Xử lý tự động sinh slug, validation `salePrice < price`, xóa cache Redis public (`cache:v1:products:*`) và kiểm tra an toàn đơn hàng (chặn xóa vĩnh viễn sản phẩm đã có `OrderItem`).
- **Tích hợp UI Admin Dashboard (`ProductPageClient` & `ProductFormContainer`):** Tải danh sách SSR pre-fetch, bộ lọc debounced search, chọn danh mục động, tích hợp JSON Rich Editor, tự động nối origin backend `getImageUrl` và xử lý đầy đủ 3 trạng thái UI (Loading, Error với Toast/Alert, Success/Empty).
- **Thư viện ảnh sản phẩm & Chức năng sắp xếp thứ tự (Media Gallery & Reordering):** Tải lên nhiều file ảnh từ thiết bị/dán URL, chọn 1 ảnh làm đại diện chính ⭐, nút di chuyển Trái/Phải để sắp xếp thứ tự vị trí hiển thị `#1`, `#2`, `#3`... và tự động chuẩn hóa vị trí. Build thành công 100% trên cả Frontend và Backend.

## [2026-08-12] Hoàn thành Tích hợp Refresh Token Tự Động cho Admin Dashboard (app/dash)
- **Next.js BFF Route Handler (`app/api/auth/refresh/route.ts`):** Nhận yêu cầu làm mới phiên làm việc từ Admin Client, chuyển tiếp tới NestJS Backend (`POST /api/v1/auth/refresh-token`), và cập nhật Cookie HttpOnly cho `accessToken` & `refreshToken` mới.
- **Client-side Interceptor (`lib/admin-api.ts`):** Tạo `adminFetch` tập trung cho toàn bộ Admin Dashboard (Categories, Products, Uploads). Tự động bắt HTTP 401 Unauthorized, quản lý hàng đợi `failedQueue` & cờ `isRefreshing` chống race-condition, gọi `/api/auth/refresh` (hoặc fallback NestJS), lưu token vào `localStorage` & cookies, tự động retry request ban đầu hoặc chuyển hướng về `/login` khi phiên hết hạn.
- **Server-side Interceptor & SSR Fix (`lib/server/categories-api.ts`):** Không thực hiện xoay (rotate) refresh token trực tiếp trong Server Components trong quá trình SSR (do Next.js Server Components không thể ghi cookie về trình duyệt). Khi gặp 401 trên SSR, ném lỗi để Client Component mount tự động gọi `/api/auth/refresh` (Next.js Route Handler), đảm bảo token mới luôn được ghi vào `localStorage` và `cookies` thành công 100%. Build thành công 100%, 0 lỗi TypeScript (`npx tsc --noEmit`).
- **Hiển thị Thông tin User Thật & Chức năng Đăng xuất (`auth-api.ts`, `use-admin-auth-init.ts`, `user-profile-dropdown.tsx`):** Loại bỏ Mock Data, khởi tạo hook `useAdminAuthInit` tự động gọi API NestJS `GET /api/v1/auth/me` hiển thị tên thật (`fullName`), avatar và vai trò (`ADMIN`/`STAFF`) của người dùng lên Header Header & Dropdown. Tích hợp chức năng Đăng xuất gọi `POST /api/v1/auth/logout`, thu hồi token phía backend, xóa sạch `localStorage`/cookies và điều hướng mượt mà sang `http://localhost:3001/login`.

## [2026-08-12] Hoàn thành UI Trang Quản lý Đơn hàng (Admin Dashboard — Order Management)
- **Thi công UI theo kế hoạch `03-order-plan.md` ([app/dash/my-app](file:///d:/vibe_coding/ecommerce-platform/app/dash/my-app)):** Xây dựng toàn bộ giao diện Danh sách đơn hàng (`/orders`) và Xem chi tiết đơn hàng (`/orders/[id]`) với Bento Grid Layout, Stepper tiến trình 5 bước và các thẻ thông tin chi tiết.
- **Bộ lọc & Tìm kiếm Debounced:** Tìm kiếm debounced 400ms theo mã đơn, tên khách, SĐT, email; lọc theo tab trạng thái đơn, trạng thái thanh toán và khoảng ngày khởi tạo.
- **Cập nhật Trạng thái Đơn hàng & Thanh toán:** Hỗ trợ menu dropdown chọn nhanh và popup modal xác nhận chuyển đổi trạng thái đơn hàng và trạng thái thanh toán thời gian thực với Toast feedback.
- **Hiển thị Ghi chú (`orderNote` DB):** Hiển thị thẻ ghi chú khách hàng nổi bật tại hàng bảng danh sách và khối thông tin giao hàng màn chi tiết. Build thành công 100%, 0 lỗi TypeScript (`npx tsc --noEmit`).

## [2026-08-12] Hoàn thành Tự động Xóa File Ảnh Thực Tế Khi Xóa Categories & Products (Full-stack Backend)
- **Xây dựng `UploadService` ([upload.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/upload/upload.service.ts)):** Trích xuất tên file an toàn, kiểm tra tham chiếu DB (Category, Product imageUrl/images JSON, Banner) chống xóa nhầm ảnh dùng chung và xóa file thực tế trên ổ đĩa bằng `fs.promises.unlink`.
- **Tích hợp Admin Categories Service ([admin-categories.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/categories/admin-categories.service.ts)):** Tự động phát hiện và xóa file ảnh `iconUrl` khi xóa chuyên mục hoặc khi cập nhật thay đổi ảnh mới.
- **Tích hợp Admin Products Service ([admin-products.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/products/admin-products.service.ts)):** Tự động dọn dẹp ảnh đại diện chính (`imageUrl`) và toàn bộ ảnh phụ (`images` JSON) khi xóa sản phẩm hoặc khi gỡ bỏ ảnh khỏi sản phẩm trong thao tác cập nhật. NestJS build thành công 100%, 0 lỗi TypeScript.

## [2026-08-12] Hoàn thành Đồng bộ URL Hình Ảnh Frontend & Admin Dashboard theo API Origin (Full-stack UI)
- **Cập nhật `getImageUrl` Helper ([app/frontend/lib/image-url.ts](file:///d:/vibe_coding/ecommerce-platform/app/frontend/lib/image-url.ts) & [app/dash/my-app/lib/image-url.ts](file:///d:/vibe_coding/ecommerce-platform/app/dash/my-app/lib/image-url.ts)):** Tự động chuẩn hóa các path tương đối (dạng `/uploads/images/file.ext` hoặc `uploads/images/file.ext`) bằng cách ghép origin từ `NEXT_PUBLIC_API_URL` (mặc định `http://localhost:3001`), đồng thời giữ nguyên các URL remote bên ngoài (Unsplash, VietQR) và emoji.
- **Tích hợp Đồng Bộ Toàn Bộ Frontend Components:** Cập nhật trọn vẹn `HeroBanner`, `CategoryRail` (hỗ trợ hiển thị mượt mà cả icon ảnh và emoji), `ProductCard`, `ProductCardList`, `SearchSuggestItem`, `ProductListHeroBanner`, `ProductGallery` (ảnh chính + thumbnails), `CartItem`, `MiniCartItem`, `OrderDetailContainer`, `OrderHistoryList`, `OrderTrackingModal`. Build thành công 100%, 0 lỗi TypeScript trên cả 3 ứng dụng.

## [2026-08-12] Hoàn thành Quy hoạch, Database, Backend API & Tích hợp UI Quản lý Đơn hàng (Full-stack Admin Orders)
- **Quy hoạch & Database Schema (`03-order-plan.md` & `schema.prisma`):** Xây dựng bản thiết kế kỹ thuật Back-end cho Admin Order Management, bổ sung trường `cancelReason`, `completedAt` và các index tối ưu `idx_order_admin_filter`, `idx_order_customer_phone`, `idx_order_customer_email`. Sync DB thành công qua `npx prisma db push` & `npx prisma generate`.
- **NestJS Admin Orders API ([admin-orders.controller.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/orders/admin-orders.controller.ts) & [admin-orders.service.ts](file:///d:/vibe_coding/ecommerce-platform/app/backend/src/orders/admin-orders.service.ts)):** Xây dựng 3 RESTful API Endpoints (`GET /api/v1/admin/orders`, `GET /api/v1/admin/orders/:id`, `PATCH /api/v1/admin/orders/:id/status`) bảo mật bằng `JwtAuthGuard` & `RolesGuard(ADMIN, STAFF)`.
- **State Machine Validation & Prisma Transaction:** Kiểm soát chuyển đổi trạng thái đơn hàng (chặn sửa đơn đã `DELIVERED`/`CANCELLED`), tự động hoàn trả `stock` sản phẩm trong `prisma.$transaction` khi hủy đơn, tự động set `completedAt`/`paidAt` khi giao thành công, và xóa cache Redis public.
- **Tích hợp API Admin Dashboard ([orders-api.ts](file:///d:/vibe_coding/ecommerce-platform/app/dash/my-app/lib/orders-api.ts), [order-list-page-client.tsx](file:///d:/vibe_coding/ecommerce-platform/app/dash/my-app/features/orders/components/order-list-page-client.tsx), [order-detail-container.tsx](file:///d:/vibe_coding/ecommerce-platform/app/dash/my-app/features/orders/components/order-detail-container.tsx)):** Nối API thật loại bỏ 100% Mock Data. Xử lý chuẩn mực 3 trạng thái UI (**Loading** Skeleton, **Error** Alert Banner + Thử lại, **Success/Empty** Data table/bento grid), cập nhật trạng thái đơn & thanh toán thời gian thực với modal confirm & Toast feedback. Build thành công 100%, 0 lỗi TypeScript (`npx tsc --noEmit`) trên cả Backend và Admin Dashboard.




