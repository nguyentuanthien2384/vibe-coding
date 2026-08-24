# QUY HOẠCH KỸ THUẬT FRONTEND: HỆ THỐNG TÍCH ĐIỂM & ĐỔI ĐIỂM (LOYALTY POINTS SYSTEM)

> **Nguồn Ý Tưởng:** `.docs/ideas/09-points-idea.md`  
> **Tài Liệu Tham Chiếu:** `.docs/ARCHITECTURE.md`, `.docs/STYLEGUIDE.md`, `.agent/AGENTS.md`, `.docs/FEATURES_DONE.md`  
> **Phiên bản:** 1.0.0  
> **Ngày tạo:** 2026-08-24  

---

## 1. TỔNG QUAN NGHIỆP VỤ & MỤC TIÊU THIẾT KẾ

### 1.1 Mục tiêu
- **Tích điểm (Earn Points):** Tự động tích lũy điểm thưởng cho khách hàng sau khi đơn hàng được giao thành công (`DELIVERED`/`PAID`) dựa trên tỷ lệ quy đổi trong hệ thống.
- **Trừ điểm khi thanh toán (Redeem Points):** Cho phép khách hàng thành viên sử dụng số điểm tích lũy hiện có để khấu trừ trực tiếp vào giá trị đơn hàng tại trang Thanh toán (`/checkout`), hỗ trợ thanh toán toàn phần đưa tổng tiền về `0đ`.
- **Quản lý & Minh bạch điểm (Loyalty Profile):** Khách hàng dễ dàng tra cứu số dư điểm, hạng thành viên, tiến trình thăng hạng và toàn bộ lịch sử biến động điểm (cộng, trừ, hoàn trả) tại trang Cá nhân (`/profile`).

---

## 2. PHÂN RÃ COMPONENT (COMPONENT TREE & ARCHITECTURE)

Tuân thủ nghiêm ngặt nguyên tắc **Next.js App Router (Server Component là mặc định)** và **Phân tách rõ ràng Logic - UI (Smart Container vs Dumb UI Components)**:

```
apps/frontend/
├── app/
│   ├── (dashboard)/
│   │   └── profile/
│   │       └── page.tsx [SERVER]                      → Async Server Component prefetch auth & profile
│   └── checkout/
│       ├── page.tsx [SERVER]                          → Async Server Component khởi tạo trang Checkout
│       └── success/
│           └── page.tsx [SERVER]                      → Hiển thị số điểm nhận được & số điểm đã dùng
├── components/
│   ├── checkout/
│   │   ├── checkout-container.tsx [SMART]             → Quản lý state Checkout: Vouchers, Points, Shipping, Payment
│   │   ├── summary/
│   │   │   ├── order-summary-section.tsx [DUMB]       → Bọc danh sách mini cart, voucher, points, breakdown, submit
│   │   │   ├── points-redemption-card.tsx [DUMB]      → Thẻ dùng điểm: toggle kích hoạt, quick choices, slider/input
│   │   │   ├── points-guest-banner.tsx [DUMB]         → Banner gợi ý khách vãng lai đăng nhập để dùng & tích điểm
│   │   │   ├── points-earning-preview.tsx [DUMB]      → Badge hiển thị "Đơn này tích lũy +X điểm khi nhận hàng"
│   │   │   └── checkout-price-breakdown.tsx [DUMB]    → Bổ sung dòng khấu trừ điểm (-X đ) & xử lý hiển thị "0đ"
│   ├── profile/
│   │   ├── profile-container.tsx [SMART]              → Quản lý active tab bao gồm tab 'points' mới
│   │   ├── profile-sidebar.tsx [DUMB]                 → Thêm menu tab "Điểm tích lũy" (⭐️ Icon + Badge số điểm)
│   │   └── loyalty-points/
│   │       ├── points-tab-container.tsx [SMART]       → Quản lý fetch số dư, hạng thành viên, filter/phân trang lịch sử
│   │       ├── points-balance-hero-card.tsx [DUMB]    → Card Bento hiển thị số dư, giá trị VNĐ, hạng & thanh tiến trình
│   │       ├── points-tier-badge.tsx [DUMB]           → Badge hạng thành viên (Đồng, Bạc, Vàng, Kim Cương)
│   │       ├── points-history-table.tsx [DUMB]        → Bảng/Danh sách lịch sử biến động (+/- điểm, mã đơn, thời gian)
│   │       ├── points-history-filter.tsx [DUMB]       → Tab lọc loại biến động: Tất cả, Tích điểm (+), Dùng điểm (-)
│   │       ├── points-history-pagination.tsx [DUMB]   → Thanh phân trang lịch sử giao dịch điểm
│   │       └── points-rule-guide-card.tsx [DUMB]      → Card hướng dẫn quy định tích điểm, tỷ lệ quy đổi và hạn dùng
│   ├── layout/
│   │   ├── header.tsx [SMART]                         → Hiển thị nhanh số dư điểm cạnh avatar người dùng
│   │   └── user-nav-menu.tsx [SMART]                  → Dropdown item dẫn tới tab "Điểm tích lũy" (`/profile?tab=points`)
│   └── orders/
│       ├── order-detail-container.tsx [SMART]         → Bổ sung hiển thị dòng điểm tích lũy & điểm đã sử dụng
│       └── order-history-list.tsx [DUMB]              → Hiển thị badge điểm thưởng trên từng thẻ đơn hàng
├── hooks/
│   ├── use-loyalty-points.ts                          → Hook quản lý fetch số dư điểm, tỷ lệ quy đổi và lịch sử
│   └── use-points-redemption.ts                       → Hook tính toán trừ điểm an toàn cho trang Checkout
├── store/
│   ├── use-auth-store.ts                              → Cập nhật UserProfile chứa `loyaltyPoints` & `membershipTier`
│   └── use-points-store.ts                            → Cache tạm thời số dư điểm & cấu hình quy đổi
└── types/
    ├── points.types.ts                                → Toàn bộ Interfaces/Types cho hệ thống điểm tích lũy
    ├── auth.types.ts                                  → Cập nhật thông tin điểm cho UserProfile
    └── checkout.ts                                    → Cập nhật các trường `pointsToUse`, `pointsDiscount`
```

### Bảng phân loại Component & Trách nhiệm

| Component | Loại | Trách nhiệm chính |
|---|---|---|
| `app/checkout/page.tsx` | `[SERVER]` | Server Component bao bọc trang thanh toán, SSR prefetch cấu hình ban đầu. |
| `checkout-container.tsx` | `[SMART]` | Quản lý state tổng: tích hợp `usePointsRedemption`, validate điểm tối đa, submit order. |
| `points-redemption-card.tsx` | `[DUMB]` | Render checkbox "Dùng điểm", các nút chọn nhanh (25%, 50%, 100%), ô nhập điểm tùy chỉnh. |
| `points-earning-preview.tsx` | `[DUMB]` | Hiển thị ước tính số điểm nhận được sau khi hoàn thành đơn: `+X điểm (≈ Y đ)`. |
| `points-guest-banner.tsx` | `[DUMB]` | Khuyến khích đăng nhập nhận ưu đãi điểm dành cho khách vãng lai. |
| `profile-container.tsx` | `[SMART]` | Điều phối tab `points`, khởi tạo gọi API lấy dữ liệu điểm khi tab active. |
| `points-tab-container.tsx` | `[SMART]` | Fetch summary điểm, lịch sử biến động điểm theo bộ lọc và phân trang. |
| `points-balance-hero-card.tsx` | `[DUMB]` | Hiển thị số dư điểm lớn, giá trị quy đổi sang VNĐ, badge hạng và progress bar. |
| `points-history-table.tsx` | `[DUMB]` | Render từng dòng lịch sử: Icon trạng thái, số điểm (+/-), mã đơn, ngày giờ. |
| `points-rule-guide-card.tsx` | `[DUMB]` | Trình bày trực quan quy chế: 100.000đ = 10 điểm, 1 điểm = 1.000đ giảm giá. |

---

## 3. QUẢN LÝ TRẠNG THÁI & LUỒNG NGHIỆP VỤ (STATE MANAGEMENT & FLOWS)

### 3.1 Bảng phân loại State

| State | Kiểu Dữ Liệu | Loại State | Quản Lý | Rationale & Mục Đích |
|---|---|---|---|---|
| `user.loyaltyPoints` | `number` | Global State | Zustand (`useAuthStore`) | Lưu số dư điểm khả dụng hiện tại của người dùng sau khi xác thực |
| `user.membershipTier` | `MembershipTier` | Global State | Zustand (`useAuthStore`) | Hạng thành viên hiện tại: `BRONZE`, `SILVER`, `GOLD`, `DIAMOND` |
| `pointsConfig` | `PointsConfig` | Server/Cache | TanStack Query / Hook | Cấu hình: Tỷ lệ tích (VD: 1%), tỷ lệ đổi (1 điểm = 1.000đ), điểm tối thiểu/tối đa |
| `isUsingPoints` | `boolean` | Local State | React `useState` | Trạng thái người dùng tick bật/tắt lựa chọn trừ điểm tại Checkout |
| `pointsToUse` | `number` | Local State | React `useState` + `useDebounce` | Số điểm người dùng muốn khấu trừ cho đơn hàng hiện tại |
| `pointsDiscount` | `number` | Computed State | Hook calculation | Số tiền VNĐ được giảm tương ứng với `pointsToUse` (`pointsToUse * rate`) |
| `estimatedPointsEarned` | `number` | Computed State | Hook calculation | Dự kiến số điểm khách sẽ nhận được khi hoàn tất đơn hàng này |
| `pointsHistory` | `PointsLedgerItem[]` | Server State | TanStack Query / `useState` | Danh sách lịch sử giao dịch điểm tại trang Profile |
| `historyFilter` | `PointsTransactionType \| 'ALL'` | Local UI State | React `useState` | Bộ lọc giao dịch: Tất cả, Tích điểm (`EARN`), Dùng điểm (`REDEEM`), Hoàn trả (`REFUND`) |
| `historyPage` | `number` | Local UI State | React `useState` | Trang hiện tại của danh sách lịch sử biến động điểm |

---

### 3.2 Sơ đồ Luồng Nghiệp Vụ (Flow Diagrams)

#### A. Luồng Áp dụng & Trừ điểm khi Thanh toán (Checkout Points Redemption)

```
Khách hàng truy cập trang /checkout
    ↓
    ├── [Chưa Đăng Nhập / Guest]
    │   └── Hiển thị `PointsGuestBanner`: "Đăng nhập ngay để dùng điểm và tích lũy thêm điểm thưởng"
    │
    └── [Đã Đăng Nhập - Có user.loyaltyPoints > 0]
        ├── Hiển thị `PointsRedemptionCard`: "Bạn đang có X điểm (tương đương X * 1.000đ)"
        ├── Người dùng tick chọn [✓ Dùng điểm tích lũy]
        │   ├── Click nút chọn nhanh:
        │   │   ├── [25%] ➔ `pointsToUse = Math.floor(maxPoints * 0.25)`
        │   │   ├── [50%] ➔ `pointsToUse = Math.floor(maxPoints * 0.50)`
        │   │   └── [Dùng tối đa] ➔ `pointsToUse = maxPoints`
        │   └── Hoặc tự gõ số điểm vào ô input (Debounce 300ms, validate 0 <= points <= maxPoints)
        │
        ├── Client tính toán hiển thị tức thời:
        │   ├── `pointsDiscount = pointsToUse * conversionRate`
        │   ├── `calculatedTotal = Math.max(0, subtotal + shippingFee - voucherDiscount - pointsDiscount)`
        │   └── Nếu `calculatedTotal === 0`:
        │       ├── Hiển thị badge: "🎉 Đơn hàng được thanh toán 100% bằng điểm tích lũy: 0đ"
        │       └── Tự động chọn phương thức thanh toán phù hợp
        │
        └── Khách hàng nhấn "Xác nhận & Đặt hàng"
            ↓
            Payload gửi lên Backend: { ...checkoutData, pointsToUse }
            ↓
            NestJS Backend kiểm tra an toàn trong Prisma Transaction:
            ├── Verify số dư thực tế trong DB: `user.points >= pointsToUse`
            ├── Tính lại số tiền giảm hợp lệ theo Backend pricing engine
            ├── Khấu trừ `pointsToUse` khỏi tài khoản User
            ├── Ghi nhật ký vào `PointsLedger` (Type: `REDEEM`, status: `COMPLETED`)
            └── Tạo Đơn hàng thành công (Order status: `PENDING` / `PAID` nếu 0đ)
```

#### B. Luồng Tích điểm Tự động khi Đơn hàng Hoàn tất (Order Completed Points Earning)

```
Đơn hàng được giao thành công & thanh toán (Admin đổi trạng thái DELIVERED / Webhook PAID)
    ↓
    Backend kích hoạt Service Tích điểm:
    ├── Kiểm tra khách hàng có tài khoản User hay không (Bỏ qua nếu là Guest)
    ├── Tính giá trị tiền thực trả của sản phẩm: `eligibleAmount = totalAmount - shippingFee`
    ├── Tính số điểm nhận được theo tỷ lệ hệ thống (VD: 1% ➔ 500.000đ = 50 điểm)
    ├── Nhân hệ số hạng thành viên (VD: Silver x1.1, Gold x1.25, Diamond x1.5)
    ├── Cộng điểm vào tài khoản User: `user.points += earnedPoints`
    ├── Ghi nhật ký `PointsLedger` (Type: `EARN`, description: "Tích điểm từ đơn hàng #{orderCode}")
    ├── Kiểm tra thăng hạng thành viên tự động
    └── Phát thông báo Realtime In-App Push / Email: "Bạn đã nhận được +X điểm tích lũy!"
```

#### C. Luồng Hoàn điểm khi Hủy đơn (Order Cancelled Points Refund)

```
Đơn hàng bị HỦY (CANCELLED / REFUNDED)
    ↓
    Backend kiểm tra Đơn hàng có sử dụng điểm tích lũy không (`order.pointsUsed > 0`):
    ├── Hoàn trả lại số điểm đã dùng: `user.points += order.pointsUsed`
    ├── Ghi nhật ký `PointsLedger` (Type: `REFUND`, description: "Hoàn lại điểm từ đơn hủy #{orderCode}")
    └── Thu hồi số điểm đã tích lũy (nếu đơn trước đó đã từng được tính điểm)
```

---

## 4. CẤU TRÚC DỮ LIỆU & INTERFACES (DATA CONTRACTS)

### 4.1 Domain Types (`types/points.types.ts`)

```typescript
/** Hạng thành viên thân thiết */
export type MembershipTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

/** Loại biến động giao dịch điểm */
export type PointsTransactionType = 
  | 'EARN'       // Tích điểm từ đơn mua
  | 'REDEEM'     // Trừ điểm khi thanh toán
  | 'REFUND'     // Hoàn trả điểm do đơn hủy
  | 'EXPIRE'     // Điểm hết hạn sử dụng
  | 'ADJUST';    // Admin điều chỉnh thủ công

/** Cấu hình hệ thống điểm */
export interface PointsConfig {
  earnRatePercentage: number;     // Tỷ lệ tích điểm (% trên giá trị đơn, VD: 1%)
  redeemRateVnd: number;          // Giá trị quy đổi: 1 điểm = ? VNĐ (VD: 1000)
  minPointsToRedeem: number;      // Số điểm tối thiểu để được đổi (VD: 10)
  maxRedeemPercentage: number;    // % tối đa giá trị đơn được trừ bằng điểm (VD: 100%)
  pointsExpiryDays: number;       // Thời hạn sử dụng điểm (ngày, 0 = không hết hạn)
}

/** Thông tin tổng quan điểm của người dùng */
export interface LoyaltyPointsSummary {
  currentPoints: number;          // Số dư điểm khả dụng
  equivalentVnd: number;          // Giá trị quy đổi tương đương VNĐ
  membershipTier: MembershipTier; // Hạng thành viên
  tierProgress: {
    currentTierSpent: number;     // Tổng chi tiêu tích lũy
    nextTierThreshold: number;    // Mốc cần đạt để lên hạng tiếp theo
    progressPercentage: number;   // % tiến trình thăng hạng (0-100)
    nextTier: MembershipTier | null;
  };
  totalPointsEarned: number;      // Tổng điểm đã tích từ trước đến nay
  totalPointsRedeemed: number;    // Tổng điểm đã dùng từ trước đến nay
  pointsExpiringSoon?: {
    points: number;
    expiresAt: string;            // ISO Date string
  };
}

/** Bản ghi nhật ký biến động điểm (Ledger Item) */
export interface PointsLedgerItem {
  id: string | number;
  userId: number;
  orderId?: string | number | null;
  orderCode?: string | null;
  type: PointsTransactionType;
  points: number;                 // Số điểm (+ hoặc -)
  balanceAfter: number;           // Số dư sau giao dịch
  description: string;            // Diễn giải chi tiết
  createdAt: string;              // ISO Date string
}

/** Phân trang danh sách lịch sử điểm */
export interface PointsHistoryResponse {
  items: PointsLedgerItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Kết quả ước tính tính toán điểm tại Checkout */
export interface CheckoutPointsCalculation {
  userAvailablePoints: number;    // Số điểm user đang có
  maxPointsCanUse: number;        // Số điểm tối đa được phép dùng cho đơn này
  conversionRate: number;         // 1 điểm = ? VNĐ
  pointsToUse: number;            // Số điểm khách chọn dùng
  discountAmount: number;         // Số tiền VNĐ được giảm tương ứng
  remainingPayableAmount: number; // Số tiền còn lại phải thanh toán sau khi trừ điểm
  isFullyCovered: boolean;        // Đơn hàng về 0đ hay không
  estimatedPointsEarn: number;    // Số điểm sẽ tích lũy được sau khi hoàn tất
}
```

---

### 4.2 Cập nhật Data Contracts hiện có

#### Cập nhật `types/auth.types.ts`:
```typescript
export interface UserProfile {
  id: number | string;
  fullName: string;
  name?: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  loyaltyPoints?: number;         // Số dư điểm tích lũy
  membershipTier?: MembershipTier;// Hạng thành viên
  createdAt: string | Date;
}
```

#### Cập nhật `types/checkout.ts`:
```typescript
export interface CheckoutFormInput extends ShippingAddressForm {
  shippingMethod: ShippingMethodType;
  orderNote?: string;
  paymentMethod: PaymentMethodType;
  termsAgreed: boolean;
  voucherCode?: string;
  pointsToUse?: number;           // Số điểm áp dụng trừ
}

export interface CreateOrderPayload {
  // ... các trường cũ
  voucherCode?: string;
  pointsToUse?: number;           // Gửi số điểm muốn dùng lên Backend
}

export interface OrderCreatedData {
  orderId: string;
  orderCode: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  pointsUsed?: number;            // Số điểm đã dùng
  pointsDiscount?: number;        // Số tiền giảm từ điểm
  pointsEarned?: number;          // Số điểm tích lũy được
  status: 'PENDING' | 'PAID';
}
```

---

### 4.3 Props Interfaces cho các Dumb Components

```typescript
/** Props cho Card Dùng điểm tại Checkout */
export interface PointsRedemptionCardProps {
  availablePoints: number;
  maxPointsCanUse: number;
  pointsToUse: number;
  conversionRate: number;
  discountAmount: number;
  isUsingPoints: boolean;
  onToggleUsePoints: (enabled: boolean) => void;
  onPointsChange: (points: number) => void;
  disabled?: boolean;
}

/** Props cho Banner Ước tính điểm tích lũy */
export interface PointsEarningPreviewProps {
  estimatedPoints: number;
  conversionRate: number;
  className?: string;
}

/** Props cho Hero Card số dư điểm tại Profile */
export interface PointsBalanceHeroCardProps {
  summary: LoyaltyPointsSummary;
  onViewGuide?: () => void;
}

/** Props cho Bảng lịch sử điểm tại Profile */
export interface PointsHistoryTableProps {
  items: PointsLedgerItem[];
  isLoading: boolean;
}

/** Props cho Thanh lọc lịch sử điểm */
export interface PointsHistoryFilterProps {
  currentFilter: PointsTransactionType | 'ALL';
  onFilterChange: (filter: PointsTransactionType | 'ALL') => void;
}

/** Props cho Price Breakdown mở rộng */
export interface ExtendedCheckoutPriceBreakdownProps {
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  pointsDiscountAmount: number;   // Dòng giảm giá điểm tích lũy
  total: number;
}
```

---

## 5. KẾT NỐI API & TÍCH HỢP HỆ THỐNG (INTEGRATION CONTRACTS)

### 5.1 Danh sách Endpoints Backend NestJS (`apps/backend`)

| Method | Endpoint | Auth | Mô tả nghiệp vụ |
|---|---|---|---|
| `GET` | `/api/v1/points/summary` | Bearer Token | Lấy số dư điểm, hạng thành viên, giá trị quy đổi và tiến trình thăng hạng |
| `GET` | `/api/v1/points/history` | Bearer Token | Lấy lịch sử biến động điểm kèm phân trang (`page`, `limit`) và lọc theo `type` |
| `GET` | `/api/v1/points/config` | Optional | Lấy cấu hình hệ thống điểm (tỷ lệ tích, giá trị quy đổi VNĐ, điểm min/max) |
| `POST` | `/api/v1/points/preview-checkout` | Bearer Token | Tính toán trước số điểm được phép dùng và số tiền giảm giá cho giỏ hàng |
| `POST` | `/api/v1/orders` | Optional/Bearer | Tạo đơn hàng (nhận thêm trường `pointsToUse` nếu user đã đăng nhập) |

---

### 5.2 Xử lý đầy đủ 3 Trạng Thái UI (Loading, Error, Success)

1. **Trạng thái Đang tải (Loading):**
   - Profile Points Tab: Hiển thị Skeleton shimmer cho Hero Card và bảng lịch sử 5 dòng.
   - Checkout Points Card: Hiển thị spinner nhẹ hoặc disable input khi đang tính toán lại số điểm.
2. **Trạng thái Thất bại (Error):**
   - Khi số điểm nhập vào vượt quá số dư hoặc đơn hàng thay đổi: Hiển thị text cảnh báo màu đỏ mận (`text-[#A63D40] text-xs font-semibold`), tự động gán lại về mốc hợp lệ tối đa.
   - Khi gọi API lịch sử thất bại: Hiển thị Alert Banner với nút "Thử lại 🔄".
3. **Trạng thái Thành công (Success / Empty):**
   - Khi áp dụng điểm thành công: Hiển thị nhãn xanh `Tiết kiệm -X.000đ` với hiệu ứng tick animation.
   - Khi lịch sử trống: Hiển thị Empty State minh họa với icon quà tặng 🎁 và nút "Mua sắm ngay để tích điểm".

---

## 6. QUY CHUẨN UI/UX & STYLING (STYLEGUIDE COMPLIANCE)

Tuân thủ nghiêm ngặt theo `.docs/STYLEGUIDE.md` và `.docs/ideas/09-points-idea.md`:

- **Khối Thẻ (Card Architecture):** Bo góc mềm mại `rounded-2xl`, nền trắng `bg-white`, viền mảnh `border border-gray-100`, shadow nhẹ `shadow-sm`.
- **Màu Sắc Điểm Thưởng & Hạng Thành Viên:**
  - Điểm thưởng (Loyalty Points): Màu Vàng Gold / Hổ phách `text-amber-500`, nền `bg-amber-50`, viền `border-amber-200`.
  - Icon Ngôi sao / Huân chương: `⭐️` hoặc SVG coin sáng bóng.
  - Hạng thành viên (Tiers):
    - Bronze (Đồng): `text-amber-800 bg-amber-100 border-amber-300`
    - Silver (Bạc): `text-slate-600 bg-slate-100 border-slate-300`
    - Gold (Vàng): `text-yellow-700 bg-yellow-100 border-yellow-300`
    - Diamond (Kim Cương): `text-cyan-700 bg-cyan-100 border-cyan-300`
- **Màu Sắc Khấu Trừ & Giảm Giá:**
  - Dòng trừ tiền từ điểm: `text-[#A63D40] font-bold` hoặc `text-red-600 font-bold`.
  - Dòng cộng điểm dự kiến: `text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full`.
- **Trường hợp Đơn hàng 0đ (Fully Paid with Points):**
  - Số tiền thanh toán: `text-emerald-600 font-extrabold text-2xl` hiển thị `0đ`.
  - Badge chúc mừng: `bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full`.
- **Nút Call-to-Action:** Nút "Thanh toán ngay" BẮT BUỘC giữ màu Cam thương hiệu **`bg-[#ff8c42] hover:bg-orange-600 text-white font-extrabold rounded-xl`**.
- **Responsive Layout:**
  - Desktop: Bento Grid 2 cột tại Profile (Hero Card bên trái, Hướng dẫn & Lịch sử bên phải).
  - Mobile: Layout 1 cột cuộn mượt mà, sticky submit bar giữ nguyên trải nghiệm trực quan.

---

## 7. KỶ LUẬT HIỆU NĂNG & AN TOÀN BẢO MẬT (ENTERPRISE STANDARDS)

1. **Chống Spam API & Quy chuẩn Debounce:**
   - Khi người dùng tự nhập số điểm tùy chọn vào ô Input tại Checkout, BẮT BUỘC bọc qua custom hook `useDebounce` với độ trễ **400ms** trước khi trigger tính toán lại giá trị thanh toán.
2. **Quy tắc Tính toán Tiền tệ & Chống Gian lận (Anti-Tampering):**
   - Frontend **TUYỆT ĐỐI KHÔNG** tự quyết định số tiền cuối cùng gửi lên Server.
   - Frontend chỉ gửi `pointsToUse`. NestJS Backend chịu trách nhiệm duy nhất trong việc kiểm tra số dư điểm trong DB MySQL, tính toán số tiền khấu trừ và lock giao dịch bằng Prisma Transaction.
3. **TypeScript Strictness:** CẤM dùng kiểu `any`. Mọi DTO, Component Props và API Response đều phải có interface/type tường minh.
4. **Server Component First:** Toàn bộ khung trang (`app/checkout/page.tsx`, `app/(dashboard)/profile/page.tsx`) giữ nguyên là Async Server Component, chỉ tách các Smart Container con sang Client Component (`"use client"`).

---

## 8. LỘ TRÌNH THI CÔNG (IMPLEMENTATION CHECKLIST)

- [ ] **Giai đoạn 1: Types & Data Layer**
  - [ ] Tạo `apps/frontend/types/points.types.ts` với đầy đủ interfaces chuẩn.
  - [ ] Cập nhật `auth.types.ts` và `checkout.ts`.
  - [ ] Tạo `apps/frontend/lib/points.ts` (API Client Fetchers) kết nối BFF Route Handlers.
  - [ ] Tạo custom hooks: `useLoyaltyPoints` và `usePointsRedemption`.
- [ ] **Giai đoạn 2: UI Profile Loyalty Points**
  - [ ] Thêm Tab `points` vào `ProfileSidebar`.
  - [ ] Dựng `PointsBalanceHeroCard`, `PointsTierBadge`, `PointsRuleGuideCard`.
  - [ ] Dựng `PointsHistoryTable`, `PointsHistoryFilter`, `PointsHistoryPagination`.
  - [ ] Ghép nối vào `PointsTabContainer` và `ProfileContainer`.
- [ ] **Giai đoạn 3: UI Checkout Points Redemption**
  - [ ] Dựng `PointsRedemptionCard` với các nút chọn nhanh (25%, 50%, 100%) và ô nhập debounced.
  - [ ] Dựng `PointsEarningPreview` và `PointsGuestBanner`.
  - [ ] Cập nhật `CheckoutPriceBreakdown` hiển thị dòng khấu trừ điểm và trạng thái `0đ`.
  - [ ] Tích hợp vào `OrderSummarySection` và `CheckoutContainer`.
- [ ] **Giai đoạn 4: Header & Order Detail Updates**
  - [ ] Hiển thị badge điểm tích lũy trên Header & User Menu.
  - [ ] Cập nhật trang Chi tiết đơn hàng hiển thị số điểm đã dùng & điểm nhận được.
- [ ] **Giai đoạn 5: Testing & TypeScript Validation**
  - [ ] Chạy `npx tsc --noEmit` xác nhận 0 lỗi TypeScript.
  - [ ] Kiểm thử luồng nhập điểm, chọn nhanh, về 0đ và phân trang lịch sử.
