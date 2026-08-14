# QUY HOẠCH KỸ THUẬT FRONTEND: TRANG THIẾT LẬP HỆ THỐNG (SETTINGS MANAGEMENT)

> **Nguồn:** `.docs/ideas/dashboard/05-settings-idea.md`  
> **Ứng dụng mục tiêu:** Admin Dashboard (`apps/dash` / `app/dash/my-app`)  
> **Phiên bản:** 1.0.0  
> **Ngày tạo:** 2026-08-14  

---

## 1. TỔNG QUAN YÊU CẦU VÀ MỤC TIÊU (OVERVIEW)

Trang Thiết lập (Settings) cung cấp giao diện quản trị cho Admin và Staff tùy chỉnh các thông số cấu hình và nội dung hiển thị trên hệ thống E-commerce TechBite, đáp ứng các tiêu chuẩn:
- **Trải nghiệm tối giản & Siêu nhanh:** Thiết kế Clean UI với khoảng trống whitespace thoáng đãng, bo góc mềm mại (`rounded-2xl`), hạn chế các hiệu ứng chuyển cảnh nặng gây giật lag.
- **Phân loại Cấu hình Khoa học:** Nhóm các thiết lập thành các Tab chuyên biệt (Cấu hình chung, Thanh toán VietQR, Vận chuyển, Quản lý Banner, Quản lý Menu Navigation, Cấu hình SEO & Mạng xã hội).
- **Thao tác Danh sách Dạng Repeater Linh hoạt:** Với các cấu hình dạng danh sách (Banners, Navigation Menus), hệ thống hỗ trợ component Repeater cho phép thêm mới, chỉnh sửa, xóa, bật/tắt trạng thái hiển thị và sắp xếp thứ tự trực quan.
- **Theo dõi Trạng thái Chỉnh sửa (Unsaved Changes Detection):** Tự động phát hiện khi có thông số bị thay đổi để hiển thị Thanh hành động nổi (Save Action Bar) giúp Admin lưu lại toàn bộ cấu hình 1 chạm.

---

## 2. PHÂN RÃ COMPONENT (COMPONENT TREE)

```
SettingsPage [SERVER]                              -> app/(dashboard)/settings/page.tsx
|
+-- SettingsPageClient [CLIENT]                    -> features/settings/components/settings-page-client.tsx
    |
    +-- SettingsHeader [DUMB]                      -> features/settings/components/settings-header.tsx
    |   +-- Title ("Thiết lập hệ thống" / "System Settings")
    |   +-- Subtitle ("Quản lý thông tin cửa hàng, thanh toán, banner và cấu hình website")
    |
    +-- SettingsNavTabs [CLIENT]                   -> features/settings/components/settings-nav-tabs.tsx
    |   +-- TabButton ("General" - Cấu hình chung)
    |   +-- TabButton ("Payment" - Thanh toán VietQR & COD)
    |   +-- TabButton ("Shipping" - Vận chuyển)
    |   +-- TabButton ("Banners" - Banner Quảng cáo - Repeater)
    |   +-- TabButton ("Menus" - Navigation Menu - Repeater)
    |   +-- TabButton ("SEO & Social" - Cấu hình SEO)
    |
    +-- SettingsTabContent [CLIENT]                -> features/settings/components/settings-tab-content.tsx
    |   |
    |   +-- GeneralSettingsForm [CLIENT]           -> features/settings/components/forms/general-settings-form.tsx
    |   |   +-- StoreNameInput, StoreEmailInput, StorePhoneInput
    |   |   +-- StoreAddressInput, CopyrightTextInput
    |   |   +-- LogoUploader [CLIENT] (Xem trước + Upload ảnh Logo)
    |   |   +-- FaviconUploader [CLIENT] (Xem trước + Upload Favicon)
    |   |
    |   +-- PaymentSettingsForm [CLIENT]           -> features/settings/components/forms/payment-settings-form.tsx
    |   |   +-- BankNameSelect, BankAccountNoInput, BankAccountHolderInput
    |   |   +-- VietQrTemplateSelect (Compact / QR Only / Print)
    |   |   +-- EnableCodToggleSwitch (Bật/tắt thanh toán khi nhận hàng)
    |   |   +-- PaymentNoteTextarea (Lời nhắn hướng dẫn chuyển khoản)
    |   |
    |   +-- ShippingSettingsForm [CLIENT]          -> features/settings/components/forms/shipping-settings-form.tsx
    |   |   +-- DefaultShippingFeeInput (Phí giao hàng mặc định)
    |   |   +-- FreeShippingThresholdInput (Ngưỡng miễn phí vận chuyển)
    |   |   +-- EstimatedDeliveryTimeInput (Thời gian giao hàng dự kiến)
    |   |
    |   +-- BannerRepeaterManager [CLIENT]         -> features/settings/components/repeaters/banner-repeater-manager.tsx
    |   |   +-- RepeaterHeader (Nút "+ Thêm Banner Mới")
    |   |   +-- BannerListGrid [DUMB]
    |   |   |   +-- BannerItemCard [CLIENT]        -> features/settings/components/repeaters/banner-item-card.tsx
    |   |   |       +-- ImagePreview, Title, Subtitle, TargetUrl, PositionBadge
    |   |   |       +-- StatusToggleSwitch, OrderMoveButtons (Up/Down), EditBtn, DeleteBtn
    |   |   +-- BannerModalForm [CLIENT]           -> features/settings/components/modals/banner-modal-form.tsx
    |   |
    |   +-- MenuRepeaterManager [CLIENT]           -> features/settings/components/repeaters/menu-repeater-manager.tsx
    |   |   +-- RepeaterHeader (Nút "+ Thêm Menu Mới")
    |   |   +-- MenuListTable [DUMB]
    |   |   |   +-- MenuItemRow [CLIENT]           -> features/settings/components/repeaters/menu-item-row.tsx
    |   |   |       +-- Title, TargetUrl, LocationBadge (Header/Footer), Icon, OpenInNewTab
    |   |   |       +-- OrderMoveButtons, EditBtn, DeleteBtn
    |   |   +-- MenuModalForm [CLIENT]             -> features/settings/components/modals/menu-modal-form.tsx
    |   |
    |   +-- SeoSocialSettingsForm [CLIENT]         -> features/settings/components/forms/seo-social-settings-form.tsx
    |       +-- MetaTitleInput, MetaDescriptionTextarea, MetaKeywordsInput
    |       +-- SocialLinkInputs (Facebook, Zalo, Instagram, TikTok)
    |
    +-- SaveSettingsActionBar [CLIENT]             -> features/settings/components/save-settings-action-bar.tsx
        +-- UnsavedChangesMessage ("Bạn có những thay đổi chưa được lưu")
        +-- ResetChangesButton ("Hủy bỏ")
        +-- SaveChangesButton ("Lưu thay đổi 💾")
```

---

## 3. QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)

### 3.1 Trạng thái Màn hình Settings Chính (`SettingsPageClient`)

| State | Kiểu dữ liệu | Chiến lược | Lý do |
|---|---|---|---|
| `activeTab` | `SettingsTab` | `useState('general')` | Quản lý Tab cấu hình đang được mở (`general`, `payment`, `shipping`, `banners`, `menus`, `seo`) |
| `formData` | `SystemSettingsPayload` | `useState` | Lưu trữ toàn bộ object giá trị các thiết lập |
| `initialData` | `SystemSettingsPayload` | `useRef` / `useState` | Dùng để so sánh diff xem Admin đã chỉnh sửa field nào chưa |
| `isDirty` | `boolean` | Computed (`formData !== initialData`) | Phát hiện khi có thay đổi để kích hoạt `SaveSettingsActionBar` nổi ở đáy màn hình |
| `isSaving` | `boolean` | `useState(false)` | Trạng thái loading khi ấn Lưu thay đổi |

### 3.2 Trạng thái Repeater Manager (Banners & Menus)

| State | Kiểu dữ liệu | Chiến lược | Lý do |
|---|---|---|---|
| `banners` | `BannerSettingItem[]` | `useState` | Danh sách banner có thể sắp xếp thứ tự, ẩn/hiện, sửa/xóa |
| `isBannerModalOpen` | `boolean` | `useState(false)` | Đóng/mở Modal Thêm/Sửa Banner |
| `editingBanner` | `BannerSettingItem \| null` | `useState(null)` | Banner đang được chọn để chỉnh sửa |
| `menus` | `MenuSettingItem[]` | `useState` | Danh sách menu navigation |
| `isMenuModalOpen` | `boolean` | `useState(false)` | Đóng/mở Modal Thêm/Sửa Menu item |
| `editingMenu` | `MenuSettingItem \| null` | `useState(null)` | Menu item đang được chọn để chỉnh sửa |

---

## 4. ĐỊNH NGHĨA DỮ LIỆU & TYPE SYSTEM (`settings.types.ts`)

```typescript
export type SettingsTab = 'general' | 'payment' | 'shipping' | 'banners' | 'menus' | 'seo';

export type BannerPosition = 'HERO_BANNER' | 'PROMOTION_BANNER' | 'POPUP_BANNER';

export type MenuLocation = 'HEADER' | 'FOOTER_COL1' | 'FOOTER_COL2' | 'FOOTER_COL3';

export interface GeneralSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  copyrightText: string;
  logoUrl?: string;
  faviconUrl?: string;
}

export interface PaymentSettings {
  bankName: string;
  bankAccountNo: string;
  bankAccountHolder: string;
  vietQrTemplate: 'compact' | 'qr_only' | 'print';
  enableCod: boolean;
  paymentNote?: string;
}

export interface ShippingSettings {
  defaultShippingFee: number;
  freeShippingThreshold: number;
  estimatedDeliveryTime: string;
}

export interface BannerSettingItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  targetUrl?: string;
  position: BannerPosition;
  order: number;
  isActive: boolean;
}

export interface MenuSettingItem {
  id: string;
  title: string;
  targetUrl: string;
  location: MenuLocation;
  icon?: string;
  order: number;
  openInNewTab: boolean;
  isActive: boolean;
}

export interface SeoSocialSettings {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  facebookUrl?: string;
  zaloUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
}

export interface SystemSettingsPayload {
  general: GeneralSettings;
  payment: PaymentSettings;
  shipping: ShippingSettings;
  banners: BannerSettingItem[];
  menus: MenuSettingItem[];
  seo: SeoSocialSettings;
}
```

---

## 5. THIẾT KẾ UI & PHONG CÁCH STYLING (DESIGN SPECS & STYLES)

- **Layout Container & Whitespace:**
  - Thiết kế dạng thẻ bo góc `rounded-2xl` sử dụng màu `bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm p-6`.
  - Giữ khoảng cách lề và không gian trắng chuẩn mực, giúp người dùng tập trung vào thông tin nhập liệu mà không bị mỏi mắt.
- **Brand Accent Color:**
  - Nút bấm chính & Tab Active: `#4880FF` (`bg-[#4880FF] hover:bg-[#3b6edc] text-white`).
  - Đường line Tab Active: `border-b-2 border-[#4880FF] text-[#4880FF] font-semibold`.
- **Repeater Component Card Styling:**
  - Các phần tử dạng danh sách (Banner Item, Menu Row) nằm trong khối bo góc `rounded-xl border border-gray-200 dark:border-slate-800 p-4 bg-gray-50/50 dark:bg-slate-800/40 hover:border-blue-300 transition-all`.
  - Tích hợp cụm nút di chuyển thứ tự Up/Down (`▲`, `▼`), Switch bật/tắt nhanh trạng thái `Active`, cùng nút Sửa/Xóa trực quan.
- **Floating Save Action Bar:**
  - Thanh lưu cài đặt cố định dưới đáy màn hình (`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-5`).

---

## 6. LỘ TRÌNH XÂY DỰNG VÀ TÍCH HỢP (IMPLEMENTATION STEPS)

1. **Khởi tạo Domain Types & Mock Data:**
   - Tạo file `features/settings/types/settings.types.ts`.
   - Tạo file `features/settings/data/mock-settings.ts` chứa dữ liệu cấu hình mặc định ban đầu.

2. **Xây dựng Màn hình Settings & Navigation Tabs:**
   - Xây dựng `SettingsHeader` và `SettingsNavTabs`.
   - Xây dựng `SettingsPageClient` quản lý `activeTab` và `formData`.

3. **Xây dựng các Form Thiết lập Thông thường:**
   - Xây dựng `GeneralSettingsForm` hỗ trợ Upload Logo & Favicon.
   - Xây dựng `PaymentSettingsForm` hỗ trợ cấu hình VietQR và COD.
   - Xây dựng `ShippingSettingsForm` và `SeoSocialSettingsForm`.

4. **Xây dựng Component Repeater (Banners & Menus):**
   - Xây dựng `BannerRepeaterManager`, `BannerItemCard` và `BannerModalForm`.
   - Xây dựng `MenuRepeaterManager`, `MenuItemRow` và `MenuModalForm`.
   - Xử lý logic Reorder (Up/Down) để cập nhật giá trị `order` tức thì.

5. **Hoàn thiện Floating Save Action Bar & Toast Feedback:**
   - Xây dựng `SaveSettingsActionBar` hiển thị khi `isDirty === true`.
   - Tích hợp thông báo Toast feedback thành công khi lưu thiết lập.

6. **Đồng bộ Route & Sidebar:**
   - Đăng ký route `/settings` vào Admin Sidebar (`features/layout/components/admin-sidebar.tsx`) với icon `Settings`.
   - Kiểm tra Type safety (`npx tsc --noEmit`) đạt 0 lỗi.
