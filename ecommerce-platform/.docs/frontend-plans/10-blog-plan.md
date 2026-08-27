# KẾ HOẠCH KỸ THUẬT FRONTEND: PHÂN HỆ BLOG & TIN TỨC (TECHBITE ECOMMERCE)

> **Tính năng:** Module Blog & Tin tức · Mẹo ẩm thực công nghệ & Bài viết chuyên sâu  
> **Tech Stack:** Next.js (App Router, Server Components) · React · Tailwind CSS · TypeScript · Tanstack Query · Zustand  
> **Tham chiếu Idea:** `.docs/ideas/10-blog-idea.md` · **Tham chiếu Design Brief:** `.docs/design-briefs/blog-idea-brief.md`

---

## 1. PHÂN RÃ COMPONENT (COMPONENT TREE)

### 1.1. Public Website (`apps/frontend`)

```
app/(store)/blog/page.tsx                               [SMART] — Server Component (Route Entry Trang Danh Sách)
│
├── BlogHeroSection                                     [DUMB]  — Layout container cho Top Featured Posts
│   ├── HeroFeaturedPostCard (×1)                       [DUMB]  — Shared UI ⭐ (Visual lớn, 7 cols desktop)
│   └── SecondaryFeaturedPostCard (×2)                  [DUMB]  — Shared UI ⭐ (Dạng compact, 5 cols desktop)
│
├── BlogFilterToolbar                                   [SMART] — Quản lý Filter chuyên mục & Search Debounce
│   ├── CategoryTabsScroller                            [DUMB]
│   │   └── CategoryTabPill (×n)                        [DUMB]  — Shared UI ⭐
│   ├── BlogSearchInput                                 [DUMB]  — Ô tìm kiếm Debounce 400ms
│   └── BlogSortDropdown                                [DUMB]  — Sắp xếp Mới nhất / Xem nhiều
│
├── BlogGridSection                                     [SMART] — Container hiển thị danh sách bài viết
│   ├── BlogCard (×n)                                   [DUMB]  — Shared UI ⭐ (Thẻ bài viết chuẩn 16:9)
│   │   ├── ReadingTimeBadge                            [DUMB]
│   │   ├── CategoryPillBadge                           [DUMB]
│   │   └── AuthorMetaBadge                             [DUMB]
│   └── BlogGridSkeleton                                [DUMB]  — Loading Skeleton state
│
└── BlogPagination                                      [DUMB]  — Server-side Pagination component

──────────────────────────────────────────────────────────────────────────────────

app/(store)/blog/[slug]/page.tsx                        [SMART] — Server Component (Route Entry Trang Chi Tiết)
│
├── BlogBreadcrumbs                                     [DUMB]  — Shared UI ⭐ (Trang chủ > Blog > [Chuyên mục] > [Tiêu đề])
│
├── ArticleHeader                                       [DUMB]  — Tiêu đề H1, Tác giả, Ngày đăng, Lượt xem
│   ├── AuthorAvatarWithInfo                            [DUMB]
│   └── SocialShareBar                                  [DUMB]  — Shared UI ⭐ (Nút Share Facebook, Twitter, Copy link)
│
├── ArticleFeaturedMedia                                [DUMB]  — Ảnh đại diện lớn tỉ lệ 16:9 bo góc
│
├── ArticleLayoutContainer                              [DUMB]  — Grid 12 cột (8 cột Body + 4 cột Sticky Sidebar)
│   │
│   ├── ArticleBodyColumn                               [DUMB]  — 8 cột desktop
│   │   ├── ArticleMobileTOC                            [SMART] — TOC Accordion cho Mobile
│   │   ├── BlogContentRenderer                         [DUMB]  — Core JSON-to-Semantic HTML Parser ⭐
│   │   │   ├── TipTapParagraphNode                     [DUMB]
│   │   │   ├── TipTapHeadingNode (H2, H3 có anchor ID) [DUMB]
│   │   │   ├── TipTapImageFigureNode                   [DUMB]
│   │   │   ├── TipTapBlockquoteNode                    [DUMB]
│   │   │   └── TipTapListNode                          [DUMB]
│   │   │
│   │   ├── PostProductEmbedWidget                      [SMART] — Widget sản phẩm nhắc đến trong bài (Cross-sell)
│   │   │   └── PostProductEmbedCard (×n)               [DUMB]  — Shared UI ⭐ (Giá, Stock, Nút Mua ngay)
│   │   │       └── AddToCartButton                     [DUMB]  — Tái sử dụng từ Module Cart
│   │   │
│   │   ├── PostTagList                                 [DUMB]  — Danh sách hashtag liên kết
│   │   ├── AuthorBioCard                               [DUMB]  — Thẻ tác giả chuyên sâu
│   │   └── FloatingShareBarMobile                      [DUMB]  — Thanh share cố định đáy màn hình mobile
│   │
│   └── ArticleSidebarColumn                            [DUMB]  — 4 cột desktop (Sticky)
│       ├── TableOfContentsNav                          [SMART] — TOC ScrollSpy Client Component
│       ├── SidebarPostProductsBox                      [SMART] — Box sản phẩm đính kèm thu nhỏ
│       └── SidebarTrendingPostsBox                     [SMART] — Top bài viết nhiều lượt xem nhất
│
└── RelatedArticlesSection                              [SMART] — Bài viết cùng chuyên mục ở cuối trang
    ├── SectionHeader                                   [DUMB]  — Shared UI ⭐
    └── RelatedArticlesGrid                             [DUMB]
        └── BlogCard (×3)                               [DUMB]  — Tái sử dụng BlogCard
```

### 1.2. Danh Sách Shared UI Tiềm Năng

| Component | Lý do tái sử dụng toàn dự án |
|---|---|
| `BlogCard` | Dùng ở Trang chủ (Section Blog mới nhất), Trang Chi tiết (Related Articles), Trang Search tổng |
| `BlogSearchInput` | Tái sử dụng làm thanh search nhanh với hook `useDebounce` chuẩn |
| `SocialShareBar` | Tái sử dụng cho trang Chi tiết Sản phẩm (`/products/[slug]`) |
| `BlogContentRenderer` | Dùng để render Rich Content cho cả Blog và Mô tả chi tiết sản phẩm (`Product.longDescription`) |
| `PostProductEmbedCard` | Dùng trong Landing Page khuyến mãi, Trang công thức nấu ăn, Recipe combo |
| `BlogPagination` | Chuẩn hóa toàn bộ phân trang cho store public |

---

## 2. QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)

### 2.1. Ma Trận Chiến Lược Quản Lý State

| Tên State | Kiểu dữ liệu | Chiến lược lưu trữ | Lý do kiến trúc & UX |
|---|---|---|---|
| `category` | `string \| null` | **URL SearchParams** (`?category=...`) | Hỗ trợ chia sẻ URL trực tiếp, lưu bookmark, chuẩn SEO SSR |
| `search` | `string` | **URL SearchParams** (`?q=...`) | Đồng bộ Server Component, Back/Forward browser hoạt động mượt |
| `page` | `number` | **URL SearchParams** (`?page=...`) | Server-side Pagination |
| `sortBy` | `'latest' \| 'views'` | **URL SearchParams** (`?sort=...`) | Sort dữ liệu từ Server |
| `activeHeadingId` | `string \| null` | **Local State (`useState`)** | ScrollSpy trong TOC theo dõi vị trí cuộn chuột người đọc |
| `isSearchPending` | `boolean` | **Local State (`useTransition`)** | Trạng thái loading mượt mà khi filter URL thay đổi |
| `cartItems` | `CartItem[]` | **Zustand (`useCartStore`)** | Đồng bộ giỏ hàng toàn app khi bấm "Thêm vào giỏ" trong bài viết |
| `toastQueue` | `ToastMessage[]` | **Zustand (`useToastStore`)** | Bắn Toast Notification tức thì sau khi thêm sản phẩm thành công |
| `copied` | `boolean` | **Local State (`useState`)** | Feedback 2s khi bấm nút Copy Link bài viết |

### 2.2. Hook Debounce Tìm Kiếm Bắt Buộc

Tuân thủ nghiêm ngặt Quy chuẩn Hiệu năng tại `AGENTS.md`: CẤM gọi API/Navigation trên mỗi phím bấm. Bắt buộc bọc qua `useDebounce`:

```typescript
// hooks/use-debounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 3. CẤU TRÚC DỮ LIỆU & INTERFACES (DATA CONTRACTS)

> ⚠️ **TUYỆT ĐỐI KHÔNG DÙNG KIỂU `any`.** Mọi DTO và Props đều phải gõ kiểu TypeScript chặt chẽ.

### 3.1. Cấu trúc TipTap JSON Nodes (Rich Text Schema)

```typescript
// types/tiptap.ts

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
  level?: 1 | 2 | 3 | 4 | 5 | 6; // Dành cho heading
  src?: string;                  // Dành cho image
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

### 3.2. Domain Models (Khớp 100% với Backend Plan)

```typescript
// types/blog.ts
import { TipTapDoc } from './tiptap';

export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export interface AuthorSummary {
  id: number;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  bio?: string | null;
}

export interface PostCategorySummary {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  postCount?: number;
}

export interface TagSummary {
  id: number;
  name: string;
  slug: string;
}

export interface PostProductItem {
  id: number;
  postId: number;
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
  publishedAt: string; // ISO DateTime
  author: AuthorSummary;
  category: PostCategorySummary;
  tags: TagSummary[];
}

export interface BlogPostDetail extends BlogPostListItem {
  content: TipTapDoc;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  products: PostProductItem[];
  relatedPosts: BlogPostListItem[];
}

export interface TOCItem {
  id: string;      // Anchor slug ID: "bi-quyet-giu-tinh-tao"
  text: string;    // Text tiêu đề: "Bí quyết giữ tỉnh táo 12 tiếng"
  level: 2 | 3;    // H2 hoặc H3
}
```

### 3.3. API Response Payloads

```typescript
// types/api-response.ts
import { BlogPostListItem, BlogPostDetail, PostCategorySummary } from './blog';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  statusCode: number;
  message: string;
  data: {
    items: T[];
    meta: PaginatedMeta;
  };
}

export type BlogListApiResponse = PaginatedResponse<BlogPostListItem>;
export type BlogDetailApiResponse = ApiResponse<BlogPostDetail>;
export type BlogCategoriesApiResponse = ApiResponse<PostCategorySummary[]>;
```

### 3.4. Component Props Interfaces

```typescript
// components/blog/blog-card.tsx
export interface BlogCardProps {
  post: BlogPostListItem;
  priority?: boolean;
}

// components/blog/hero-featured-post-card.tsx
export interface HeroFeaturedPostCardProps {
  post: BlogPostListItem;
}

// components/blog/category-tab-pill.tsx
export interface CategoryTabPillProps {
  category: PostCategorySummary;
  isActive: boolean;
  onSelect: (slug: string) => void;
}

// components/blog/blog-content-renderer.tsx
export interface BlogContentRendererProps {
  doc: TipTapDoc;
  className?: string;
}

// components/blog/table-of-contents-nav.tsx
export interface TableOfContentsNavProps {
  items: TOCItem[];
  activeId?: string | null;
}

// components/blog/post-product-embed-card.tsx
export interface PostProductEmbedCardProps {
  productItem: PostProductItem;
  onAddToCart: (productId: number) => void;
  isAdding?: boolean;
}

// components/blog/social-share-bar.tsx
export interface SocialShareBarProps {
  url: string;
  title: string;
  summary?: string;
}

// components/blog/author-bio-card.tsx
export interface AuthorBioCardProps {
  author: AuthorSummary;
}
```

---

## 4. LUỒNG XỬ LÝ & TƯƠNG TÁC (DATA FLOW & LOGIC)

### 4.1. Luồng Render SSR / Server Components Trang Danh Sách (`/blog`)

```
[User Browser]
  │  Truy cập URL: /blog?category=goc-coder-thuc-khuya&page=1&q=deadline
  ▼
[Next.js Server Component - app/(store)/blog/page.tsx]
  │── Đọc searchParams: { category, page, q, sort }
  │── Gọi fetch("/api/v1/blog/posts?category=...&page=...&q=...", { next: { tags: ['blog-posts'] } })
  │── Gọi fetch("/api/v1/blog/categories", { next: { tags: ['blog-categories'] } })
  │── Lấy danh sách bài viết & chuyên mục từ Backend
  │── Render HTML tĩnh trên Server với thẻ SEO Metadata chuẩn
  ▼
[Hydration tại Client]
  ├── CategoryTabsScroller: Nhận danh mục và highlight category đang active
  ├── BlogSearchInput: Đồng bộ giá trị q hiện tại vào ô search
  └── BlogGrid: Kết xuất danh sách BlogCard
```

### 4.2. Luồng Tìm Kiếm & Lọc Danh Mục (Debounce 400ms)

```
[User gõ ký tự vào ô BlogSearchInput]
  │── Input thay đổi cục bộ (Local State text)
  │── useDebounce(text, 400) chờ 400ms không có ký tự mới
  ▼
[URL Router Push]
  │── router.push(`/blog?category=${currentCat}&q=${debouncedText}&page=1`)
  ▼
[Next.js App Router]
  └── Tự động trigger Server Re-fetch cho page.tsx mà không cần reload trang
```

### 4.3. Luồng Chi Tiết Bài Viết, TOC & Tăng View Bất Đồng Bộ (`/blog/[slug]`)

```
[User mở /blog/[slug]]
  │
  ├── [Server Component SSR]
  │     ├── fetch(`/api/v1/blog/posts/${slug}`)
  │     ├── Bóc tách cấu trúc TipTap JSON ➔ Trích xuất danh sách TOCItem (H2, H3)
  │     ├── Render SEO Schema JSON-LD:
  │     │   - Article Schema (headline, image, datePublished, author, publisher)
  │     │   - BreadcrumbList Schema
  │     └── Trả về HTML đã hoàn thiện
  │
  ├── [Client Hydration]
  │     ├── Gửi Beacon/Fetch nhẹ: POST `/api/v1/blog/posts/${slug}/view` (Backend tăng atomic Redis INCR)
  │     └── Kích hoạt IntersectionObserver cho các thẻ H2/H3 để highlight TOC đang đọc
  │
  └── [Cross-selling Tương tác Sản phẩm]
        └── User bấm "Thêm vào giỏ" trên PostProductEmbedCard:
              ├── Gọi POST `/api/v1/cart/items` ({ productId, quantity: 1 })
              ├── Dispatch Zustand `useCartStore.addItem()`
              └── Bắn Toast Notification: "Đã thêm [Tên sản phẩm] vào giỏ hàng!"
```

---

## 5. CHECKLIST TRIỂN KHAI FRONTEND

- [ ] **Type Definitions:** Tạo `types/tiptap.ts`, `types/blog.ts`, `types/api-response.ts` (100% typed, no `any`).
- [ ] **Hooks:** Tạo `hooks/use-debounce.ts`, `hooks/use-toc-spy.ts`.
- [ ] **JSON Content Parser:** Xây dựng `BlogContentRenderer` duyệt TipTap JSON blocks và tạo semantic HTML `<p>`, `<h2>`, `<h3>` kèm slug anchor id.
- [ ] **Dumb Components Trang Danh Sách:**
  - [ ] `HeroFeaturedPostCard`, `SecondaryFeaturedPostCard`
  - [ ] `BlogCard`, `CategoryTabPill`, `ReadingTimeBadge`
  - [ ] `BlogSearchInput`, `BlogSortDropdown`, `BlogPagination`
  - [ ] `BlogCardSkeleton`, `BlogHeroSkeleton`
- [ ] **Dumb Components Trang Chi Tiết:**
  - [ ] `ArticleHeader`, `ArticleFeaturedMedia`, `SocialShareBar`
  - [ ] `TableOfContentsNav` (TOC Desktop & Accordion Mobile)
  - [ ] `PostProductEmbedCard`, `PostTagList`, `AuthorBioCard`
- [ ] **Smart Components & Route Pages:**
  - [ ] `app/(store)/blog/page.tsx` (Server Component với metadata động)
  - [ ] `app/(store)/blog/[slug]/page.tsx` (Server Component với JSON-LD Schema.org)
  - [ ] `app/(store)/blog/category/[slug]/page.tsx`
  - [ ] `app/(store)/blog/tag/[slug]/page.tsx`
- [ ] **Tích hợp Giỏ hàng (Cross-selling):** Kết nối nút AddToCart trong bài viết với `useCartStore` và API giỏ hàng.
- [ ] **Tối ưu SEO & Performance:** Next.js Image với `priority` cho Hero Thumbnail, OpenGraph tags, RSS/Sitemap Feed support.
