# QUY HOẠCH KỸ THUẬT FRONTEND: MODULE QUẢN LÝ BLOG & BÀI VIẾT (ADMIN DASHBOARD BLOG)

> **Nguồn ý tưởng:** `.docs/ideas/dashboard/07-blog-idea.md` & `.docs/ideas/10-blog-idea.md`  
> **Tham chiếu Design Brief:** `.docs/design-briefs/dashboard/07-blog-brief.md`  
> **Ứng dụng mục tiêu:** Admin Dashboard (`apps/dash` / `app/dash/my-app`)  
> **Tech Stack:** Next.js (App Router, Server Components) · React · Tailwind CSS · TypeScript · TipTap / ProseMirror JSON Editor · Zustand · Axios  
> **Phiên bản:** 1.0.0 · **Ngày tạo:** 2026-08-27  

---

## 1. PHÂN RÃ COMPONENT (COMPONENT TREE)

### 1.1. Trang Danh Sách Bài Viết (`/blog`)

```
BlogListPage [SERVER]                                   -> app/(dashboard)/blog/page.tsx
│
└── BlogListPageClient [SMART]                          -> features/blog/components/blog-list-page-client.tsx
    │
    ├── BlogPageHeader [DUMB]                           -> features/blog/components/blog-page-header.tsx
    │   ├── HeaderTitle ("Quản lý Bài viết & Tin tức") [DUMB]
    │   ├── CategoriesLinkButton [DUMB] (Link -> /blog/categories)
    │   └── CreatePostButton [DUMB] (Link -> /blog/create)
    │
    ├── BlogFilterBar [SMART]                           -> features/blog/components/blog-filter-bar.tsx
    │   ├── BlogSearchInput [DUMB] (useDebounce 300ms)  -> features/blog/components/blog-search-input.tsx
    │   ├── BlogCategoryFilter [DUMB]                   -> features/blog/components/blog-category-filter.tsx
    │   ├── BlogStatusFilter [DUMB]                     -> features/blog/components/blog-status-filter.tsx
    │   └── BlogSortDropdown [DUMB]                     -> features/blog/components/blog-sort-dropdown.tsx
    │
    ├── BlogTable [DUMB]                                -> features/blog/components/blog-table.tsx
    │   ├── BlogTableHeader [DUMB]                     -> features/blog/components/blog-table-header.tsx
    │   └── BlogTableRow (×n) [DUMB]                    -> features/blog/components/blog-table-row.tsx
    │       ├── PostThumbnailCell [DUMB] (next/image, 16:9, rounded-xl)
    │       ├── PostTitleSlugCell [DUMB]
    │       ├── PostCategoryBadge [DUMB] (Clickable -> trigger category filter)
    │       ├── PostAuthorCell [DUMB] (Avatar + Full name)
    │       ├── PostViewsCell [DUMB] (Views count + Read time)
    │       ├── BlogStatusBadge [DUMB]                  -> features/blog/components/blog-status-badge.tsx
    │       ├── PostPublishedDateCell [DUMB]
    │       └── PostActionButtons [SMART]               -> features/blog/components/post-action-buttons.tsx
    │           ├── QuickStatusDropdown [DUMB]
    │           ├── PreviewLinkButton [DUMB] (Mở /blog/[slug] new tab)
    │           ├── EditLinkButton [DUMB] (Link -> /blog/[id]/edit)
    │           └── DeletePostButton [DUMB] (Mở DeleteConfirmModal)
    │
    ├── BlogPagination [DUMB]                           -> features/blog/components/blog-pagination.tsx
    │
    └── DeletePostConfirmModal [SMART]                  -> features/blog/components/modals/delete-post-confirm-modal.tsx
```

---

### 1.2. Trang Soạn Thảo & Chỉnh Sửa Bài Viết (`/blog/create` & `/blog/[id]/edit`)

```
CreateBlogPage [SERVER]                                 -> app/(dashboard)/blog/create/page.tsx
EditBlogPage [SERVER]                                   -> app/(dashboard)/blog/[id]/edit/page.tsx
│
└── BlogFormContainer [SMART]                           -> features/blog/components/form/blog-form-container.tsx
    │
    ├── BlogFormHeader [DUMB]                           -> features/blog/components/form/blog-form-header.tsx
    │   ├── BackToListButton (Link -> /blog)
    │   ├── FormTitle ("Viết bài mới" / "Chỉnh sửa bài viết")
    │   ├── PreviewTabToggle (Chế độ Xem trước / Soạn thảo)
    │   └── BlogFormActions [DUMB]
    │       ├── CancelButton (Link -> /blog)
    │       ├── SaveDraftButton (Submit với status DRAFT)
    │       └── SubmitPublishButton (Submit với status PUBLISHED/SCHEDULED)
    │
    └── BlogFormLayout [DUMB]                           -> features/blog/components/form/blog-form-layout.tsx
        │
        ├── [Cột Trái - 8 cột Desktop]
        │   ├── BlogGeneralSection [SMART]              -> features/blog/components/form/sections/blog-general-section.tsx
        │   │   ├── TitleInput (Auto generate slug)
        │   │   ├── SlugInput (Editable, slug validation)
        │   │   └── SummaryTextarea (Tối đa 500 ký tự)
        │   │
        │   ├── BlogEditorSection [SMART]               -> features/blog/components/form/sections/blog-editor-section.tsx
        │   │   └── JSONRichEditor [SMART]              -> features/blog/components/rich-editor/json-rich-editor.tsx
        │   │       ├── EditorToolbar [DUMB] (Bold, Italic, Underline, H2, H3, List, Quote, Media, Divider)
        │   │       └── TipTapEditorContent [SMART] (Xuất mảng JSON TipTap Blocks)
        │   │
        │   └── BlogCrossSellSection [SMART]            -> features/blog/components/form/sections/blog-cross-sell-section.tsx
        │       ├── SearchStoreProducts [SMART] (useDebounce 300ms tìm kiếm sản phẩm trong kho)
        │       └── AttachedProductList [DUMB]
        │           └── AttachedProductItem (×n) [DUMB] (Thumbnail, Giá, Tồn kho, Nút đổi thứ tự & Gỡ bỏ)
        │
        └── [Cột Phải - 4 cột Desktop]
            ├── BlogPublishingSection [SMART]           -> features/blog/components/form/sections/blog-publishing-section.tsx
            │   ├── StatusRadioGroup [DUMB] (DRAFT, SCHEDULED, PUBLISHED, ARCHIVED)
            │   └── ScheduledDatePicker [DUMB] (Hiện khi status = SCHEDULED)
            │
            ├── BlogCategoryTagSection [SMART]          -> features/blog/components/form/sections/blog-category-tag-section.tsx
            │   ├── CategorySelectDropdown [DUMB]
            │   └── TagMultiSelectInput [DUMB]
            │
            ├── BlogMediaSection [SMART]                -> features/blog/components/form/sections/blog-media-section.tsx
            │   └── ImageUploader16x9 [SMART] (Dropzone + URL input + 16:9 aspect preview)
            │
            └── BlogSeoSection [SMART]                  -> features/blog/components/form/sections/blog-seo-section.tsx
                ├── MetaTitleInput [DUMB] (Kèm thanh đếm ký tự 50-60 chars)
                ├── MetaDescriptionTextarea [DUMB] (Kèm thanh đếm ký tự 150-160 chars)
                ├── CanonicalUrlInput [DUMB]
                ├── OgImageUploader [DUMB]
                └── GoogleSerpPreviewCard [DUMB] (Mô phỏng SERP Google trực quan)
```

---

### 1.3. Trang Quản Lý Chuyên Mục Blog (`/blog/categories`)

```
BlogCategoriesPage [SERVER]                             -> app/(dashboard)/blog/categories/page.tsx
│
└── BlogCategoriesPageClient [SMART]                   -> features/blog/components/categories/blog-categories-page-client.tsx
    │
    ├── BlogCategoryPageHeader [DUMB]                   -> features/blog/components/categories/blog-category-page-header.tsx
    │   ├── BackToBlogButton (Link -> /blog)
    │   ├── CategoryTitle ("Quản lý Chuyên mục Blog")
    │   └── OpenCreateCategoryModalButton [DUMB]
    │
    ├── BlogCategoryTable [DUMB]                        -> features/blog/components/categories/blog-category-table.tsx
    │   ├── BlogCategoryTableHeader [DUMB]
    │   └── BlogCategoryTableRow (×n) [DUMB]
    │       ├── CategoryIconCell [DUMB] (Emoji hoặc SVG)
    │       ├── CategoryNameSlugCell [DUMB]
    │       ├── CategoryPostCountBadge [DUMB]
    │       ├── CategoryOrderIndexBadge [DUMB]
    │       ├── CategoryActiveToggleCell [SMART]
    │       └── CategoryActionButtons [SMART] (EditModal, DeleteConfirm)
    │
    ├── CategoryFormModal [SMART]                       -> features/blog/components/categories/category-form-modal.tsx
    │   ├── CategoryNameInput (Auto slug)
    │   ├── CategorySlugInput
    │   ├── CategoryIconPicker (Emoji / SVG)
    │   ├── CategoryDescriptionTextarea
    │   ├── CategoryOrderInput
    │   └── CategoryActiveSwitch
    │
    └── DeleteCategoryConfirmModal [SMART]              -> features/blog/components/categories/delete-category-confirm-modal.tsx
```

---

### 1.4. Danh Sách Shared UI Tiềm Năng (Tái Sử Dụng Toàn Dự Án)

| Component | Vị trí tái sử dụng | Lợi ích |
|---|---|---|
| `JSONRichEditor` | Dùng chung cho Form Sản phẩm (`Product.longDescription`), Bài viết Blog (`Post.content`), và Cài đặt Thông tin Store | Thống nhất 100% định dạng TipTap JSON, triệt tiêu XSS |
| `ImageUploader16x9` | Dùng cho Banner quảng cáo, Thumbnail bài viết, Hero image | Tự động căn tỷ lệ 16:9 và upload lên NestJS `/uploads/` |
| `GoogleSerpPreviewCard` | Dùng cho SEO Sản phẩm, SEO Bài viết Blog, SEO Danh mục | Trực quan hóa kết quả hiển thị công cụ tìm kiếm |
| `BlogStatusBadge` | Dùng tại Bảng bài viết, Modal đổi trạng thái, Card thống kê | Chuẩn hóa màu sắc trạng thái bài viết |
| `BlogPagination` | Dùng ở tất cả các trang quản trị danh sách có phân trang Server-side | Đồng bộ trải nghiệm phân trang Admin |

---

## 2. QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)

### 2.1. Ma Trận Chiến Lược Quản Lý State

| Tên State | Kiểu dữ liệu | Chiến lược | Lý do kiến trúc & UX |
|---|---|---|---|
| `searchQuery` | `string` | `useState` + `useDebounce(300ms)` | Tìm kiếm bài viết theo tiêu đề/slug/tác giả không spam API |
| `selectedCategoryId` | `number \| null` | `useState` | Lọc theo chuyên mục bài viết |
| `selectedStatus` | `PostStatus \| 'ALL'` | `useState` | Lọc theo trạng thái xuất bản |
| `sortBy` | `'latest' \| 'views'` | `useState` | Sắp xếp theo ngày tạo hoặc lượt xem |
| `currentPage` | `number` | `useState` (Default: 1) | Quản lý trang phân trang hiện tại |
| `pageSize` | `number` | `useState` (Default: 10) | Số lượng bài viết hiển thị trên 1 trang |
| `isSubmitting` | `boolean` | `useState` | Trạng thái loading khi gọi API Lưu / Xuất bản |
| `editorContentJSON` | `TipTapDoc \| null` | `useState` (Local Form) | Dữ liệu cấu trúc JSON TipTap từ Rich Editor |
| `attachedProductIds` | `number[]` | `useState` (Local Form) | Danh sách ID sản phẩm được gắn vào bài viết |
| `selectedPostForDelete` | `BlogPostListItem \| null` | `useState` | Quản lý Modal xác nhận xóa bài viết |
| `selectedCategoryForEdit` | `PostCategory \| null` | `useState` | Quản lý Modal Sửa chuyên mục |
| `toastQueue` | `ToastMessage[]` | Zustand (`useToastStore`) | Bắn thông báo Toast thành công / lỗi tức thì |

---

### 2.2. Hook Debounce Tìm Kiếm Bắt Buộc

Tuân thủ nghiêm ngặt Quy chuẩn Hiệu năng tại `AGENTS.md`: CẤM gọi API tìm kiếm trên mỗi phím bấm. Bắt buộc bọc qua `useDebounce`:

```typescript
// hooks/use-debounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 3. CẤU TRÚC DỮ LIỆU & INTERFACES (DATA CONTRACTS)

> ⚠️ **TUYỆT ĐỐI KHÔNG DÙNG KIỂU `any`.** Mọi DTO, Props và API Response đều phải gõ kiểu TypeScript chặt chẽ.

### 3.1. TipTap JSON Schema Types

```typescript
// features/blog/types/tiptap.types.ts

export type TipTapNodeType =
  | 'doc'
  | 'paragraph'
  | 'heading'
  | 'bulletList'
  | 'orderedList'
  | 'listItem'
  | 'blockquote'
  | 'image'
  | 'horizontalRule'
  | 'hardBreak'
  | 'text';

export interface TipTapMark {
  type: 'bold' | 'italic' | 'strike' | 'underline' | 'link' | 'code' | 'highlight';
  attrs?: {
    href?: string;
    target?: string;
    color?: string;
  };
}

export interface TipTapNodeAttrs {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  src?: string;
  alt?: string;
  title?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  caption?: string;
}

export interface TipTapNode {
  type: TipTapNodeType;
  attrs?: TipTapNodeAttrs;
  content?: TipTapNode[];
  marks?: TipTapMark[];
  text?: string;
}

export interface TipTapDoc {
  type: 'doc';
  content: TipTapNode[];
}
```

---

### 3.2. Domain Models (Khớp 100% với Backend Plan)

```typescript
// features/blog/types/blog.types.ts
import { TipTapDoc } from './tiptap.types';

export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export interface PostAuthor {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: 'ADMIN' | 'STAFF';
}

export interface PostCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  orderIndex: number;
  isActive: boolean;
  postCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostTag {
  id: number;
  name: string;
  slug: string;
}

export interface AttachedProduct {
  id: number;
  postId?: number;
  productId: number;
  displayOrder: number;
  product: {
    id: number;
    name: string;
    slug: string;
    imageUrl: string;
    price: number;
    salePrice: number | null;
    stock: number;
    isActive: boolean;
  };
}

export interface BlogPostListItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  thumbnail: string;
  status: PostStatus;
  views: number;
  readTimeMinutes: number;
  categoryId: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  authorId: number;
  author: {
    id: number;
    fullName: string;
    avatarUrl: string | null;
  };
  tags: PostTag[];
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostDetail extends BlogPostListItem {
  content: TipTapDoc;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  products: AttachedProduct[];
}

export interface BlogPostFormData {
  title: string;
  slug: string;
  summary: string;
  thumbnail: string;
  content: TipTapDoc;
  status: PostStatus;
  categoryId: number;
  tagIds: number[];
  productIds: number[];
  scheduledAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
}
```

---

### 3.3. API Response Payloads & Query Params

```typescript
// features/blog/types/api.types.ts
import { BlogPostListItem, BlogPostDetail, PostCategory } from './blog.types';

export interface AdminApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface AdminPaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminPaginatedResponse<T> {
  statusCode: number;
  message: string;
  data: {
    items: T[];
    meta: AdminPaginatedMeta;
  };
}

export interface GetAdminPostsFilterParams {
  search?: string;
  categoryId?: number;
  status?: PostStatus | 'ALL';
  sortBy?: 'latest' | 'views';
  page: number;
  limit: number;
}
```

---

### 3.4. Component Props Interfaces

```typescript
// features/blog/components/blog-table-row.tsx
export interface BlogTableRowProps {
  post: BlogPostListItem;
  onFilterByCategory: (categoryId: number) => void;
  onQuickChangeStatus: (postId: number, newStatus: PostStatus) => void;
  onDeleteClick: (post: BlogPostListItem) => void;
}

// features/blog/components/blog-status-badge.tsx
export interface BlogStatusBadgeProps {
  status: PostStatus;
  className?: string;
}

// features/blog/components/form/sections/blog-cross-sell-section.tsx
export interface BlogCrossSellSectionProps {
  attachedProducts: AttachedProduct[];
  onAddProduct: (product: AttachedProduct['product']) => void;
  onRemoveProduct: (productId: number) => void;
  onReorderProduct: (productId: number, direction: 'UP' | 'DOWN') => void;
}

// features/blog/components/form/sections/blog-seo-section.tsx
export interface BlogSeoSectionProps {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  ogImage?: string;
  onChangeTitle: (val: string) => void;
  onChangeDescription: (val: string) => void;
  onChangeOgImage: (val: string) => void;
}

// features/blog/components/categories/blog-category-table-row.tsx
export interface BlogCategoryTableRowProps {
  category: PostCategory;
  onEditClick: (category: PostCategory) => void;
  onDeleteClick: (category: PostCategory) => void;
  onToggleActive: (categoryId: number, currentActive: boolean) => void;
}
```

---

## 4. QUY TRÌNH NGHIỆP VỤ & LUỒNG DỮ LIỆU (DATA FLOW & LOGIC)

### 4.1. Luồng Màn Hình Danh Sách (`/blog`)

```
[Màn hình /blog - Server Component]
  │── SSR pre-fetch danh sách bài viết từ Backend: `GET /api/v1/admin/blog/posts?page=1&limit=10`
  │── Pre-fetch danh sách chuyên mục: `GET /api/v1/admin/blog/categories`
  ▼
[Hydration Client - BlogListPageClient]
  ├── State `searchQuery`: Debounce 300ms tự động kích hoạt lọc
  ├── State `selectedCategoryId`: Lọc theo dropdown hoặc khi click Badge chuyên mục tại từng dòng bảng
  ├── State `selectedStatus`: Lọc nhanh bài viết Đã xuất bản / Lên lịch / Bản nháp
  ├── Menu Thao tác nhanh:
  │     ├── Đổi trạng thái trực tiếp: Gọi `PATCH /api/v1/admin/blog/posts/:id/status` -> Toast feedback
  │     ├── Xem trước: Mở tab mới dẫn sang URL public `http://localhost:3000/blog/[slug]`
  │     └── Xóa bài viết: Mở `DeletePostConfirmModal` -> Gọi `DELETE /api/v1/admin/blog/posts/:id`
```

---

### 4.2. Luồng Màn Hình Soạn Thảo / Chỉnh Sửa (`/blog/create` & `/blog/[id]/edit`)

```
[Admin nhập Tiêu đề bài viết]
  │── Hàm `slugify(title)` tự động chuyển thành chuỗi slug tiếng Việt không dấu (VD: "meo-chon-kho-ga")
  │── Đưa vào `SlugInput` (Cho phép Admin chỉnh sửa thủ công nếu muốn)
  ▼
[Admin soạn nội dung trong JSONRichEditor]
  │── TipTap Editor xuất dữ liệu dạng `TipTapDoc` JSON blocks
  │── TUYỆT ĐỐI KHÔNG xuất chuỗi HTML thô (Chống XSS và bảo toàn cấu trúc dữ liệu)
  ▼
[Admin gắn Sản phẩm liên quan - Cross-selling]
  │── Nhập tên món vào ô tìm kiếm (`useDebounce` 300ms)
  │── Chọn sản phẩm từ gợi ý -> Thêm vào mảng `attachedProducts` kèm `displayOrder`
  │── Cho phép bấm Mũi tên Lên/Xuống để sắp xếp thứ tự hiển thị
  ▼
[Admin cấu hình Xuất bản & SEO]
  │── Chọn trạng thái `PUBLISHED` hoặc `SCHEDULED` (Nếu Scheduled: Chọn ngày giờ xuất bản)
  │── Nhập Meta Title & Description -> Quan sát Card `GoogleSerpPreviewCard` realtime
  ▼
[Bấm "Lưu & Xuất bản"]
  │── Validate dữ liệu DTO phía Client (Tiêu đề bắt buộc, Thumbnail hợp lệ, Content không trống)
  │── Gọi API Backend:
  │     - Tạo mới: `POST /api/v1/admin/blog/posts`
  │     - Cập nhật: `PUT /api/v1/admin/blog/posts/:id`
  │── Thành công: Bắn Toast "Lưu bài viết thành công" -> Điều hướng mượt mà về `/blog`
```

---

## 5. CẤU TRÚC THƯ MỤC NGUỒN (DIRECTORY STRUCTURE)

```
apps/dash/ (hoặc app/dash/my-app/)
├── app/
│   └── (dashboard)/
│       └── blog/
│           ├── page.tsx                                  [NEW] Async Server Component Danh Sách
│           ├── create/
│           │   └── page.tsx                              [NEW] Async Server Component Tạo Mới
│           ├── [id]/
│           │   └── edit/
│           │       └── page.tsx                          [NEW] Async Server Component Chỉnh Sửa
│           └── categories/
│               └── page.tsx                              [NEW] Async Server Component Chuyên Mục
│
└── features/
    └── blog/
        ├── types/
        │   ├── tiptap.types.ts                           [NEW] Cấu trúc TipTap JSON Nodes/Marks
        │   ├── blog.types.ts                             [NEW] Domain models, DTOs & Interfaces
        │   └── api.types.ts                              [NEW] Request/Response pagination types
        ├── data/
        │   └── mock-blog-data.ts                         [NEW] Dữ liệu mẫu kiểm thử UI
        ├── api/
        │   └── admin-blog-api.ts                         [NEW] Hàm gọi API dùng adminFetch (Auto refresh token)
        ├── hooks/
        │   ├── use-blog-list.ts                          [NEW] Hook quản lý tìm kiếm, lọc & phân trang
        │   └── use-blog-form.ts                          [NEW] Hook quản lý form state, auto slug, validation
        └── components/
            ├── blog-list-page-client.tsx                 [NEW] Smart Client Container Danh Sách
            ├── blog-page-header.tsx                      [NEW] Header & Nút hành động
            ├── blog-filter-bar.tsx                       [NEW] Thanh bộ lọc tổng hợp
            ├── blog-table.tsx                            [NEW] Bảng danh sách bài viết
            ├── blog-table-header.tsx                     [NEW] Cột tiêu đề bảng
            ├── blog-table-row.tsx                        [NEW] Hàng dữ liệu bài viết
            ├── blog-status-badge.tsx                     [NEW] Badge trạng thái Published/Draft/Scheduled
            ├── blog-pagination.tsx                       [NEW] Thanh phân trang Admin
            ├── modals/
            │   └── delete-post-confirm-modal.tsx         [NEW] Modal xác nhận xóa bài viết
            │
            ├── form/
            │   ├── blog-form-container.tsx               [NEW] Smart Client Container Form
            │   ├── blog-form-header.tsx                  [NEW] Header Form & Nút Lưu
            │   ├── blog-form-layout.tsx                  [NEW] Layout lưới 2 cột Form
            │   ├── sections/
            │   │   ├── blog-general-section.tsx          [NEW] Tiêu đề, Slug, Summary
            │   │   ├── blog-editor-section.tsx           [NEW] Khung Editor chính
            │   │   ├── blog-cross-sell-section.tsx       [NEW] Nhúng sản phẩm liên quan
            │   │   ├── blog-publishing-section.tsx       [NEW] Trạng thái & Lên lịch
            │   │   ├── blog-category-tag-section.tsx     [NEW] Chọn chuyên mục & Tags
            │   │   ├── blog-media-section.tsx            [NEW] Upload Thumbnail 16:9
            │   │   └── blog-seo-section.tsx              [NEW] Meta SEO & Google Preview
            │   └── google-serp-preview-card.tsx          [NEW] Card xem trước Google Search
            │
            ├── rich-editor/
            │   ├── json-rich-editor.tsx                  [NEW] Editor TipTap chuẩn xuất JSON
            │   └── editor-toolbar.tsx                    [NEW] Thanh công cụ soạn thảo
            │
            └── categories/
                ├── blog-categories-page-client.tsx       [NEW] Smart Client Container Chuyên Mục
                ├── blog-category-page-header.tsx         [NEW] Header trang chuyên mục
                ├── blog-category-table.tsx               [NEW] Bảng danh sách chuyên mục
                ├── blog-category-table-row.tsx           [NEW] Hàng dữ liệu chuyên mục
                ├── category-form-modal.tsx               [NEW] Modal Thêm / Sửa Chuyên mục
                └── delete-category-confirm-modal.tsx     [NEW] Modal xác nhận xóa chuyên mục
```

---

## 6. TIÊU CHUẨN KỸ THUẬT & QUY TẮC BẮT BUỘC (CODING STANDARDS)

1. **Phân Tách Server & Client Component Tuyệt Đối:**
   - Các file `page.tsx` BẮT BUỘC là **Server Component**.
   - Chỉ dùng `'use client'` tại các file container hoặc interactive components trong `features/blog/components/`.
2. **Kỷ Luật TypeScript & Schema JSON:**
   - **TUYỆT ĐỐI CẤM** kiểu `any`. Mọi DTO, Props, API Responses và Editor JSON Node đều phải được định nghĩa interface rõ ràng.
3. **Kỷ Luật Soạn Thảo (Anti-XSS):**
   - **BẮT BUỘC lưu trữ cấu trúc TipTap JSON Object** (`content: TipTapDoc`). TUYỆT ĐỐI KHÔNG xuất ra chuỗi HTML thô.
4. **Tối Ưu Hiệu Năng Search & Filter:**
   - Ô nhập tìm kiếm bài viết và ô tìm kiếm sản phẩm nhúng BẮT BUỘC sử dụng hook `useDebounce` với độ trễ **300ms** trước khi áp dụng bộ lọc hoặc gọi API.
5. **Chuẩn Mã Màu & Design System:**
   - Sử dụng đúng các utility class Tailwind của hệ thống (`bg-[#4880FF]`, `text-[#202224]`, `rounded-2xl`, `rounded-3xl`, `custom-shadow`).
