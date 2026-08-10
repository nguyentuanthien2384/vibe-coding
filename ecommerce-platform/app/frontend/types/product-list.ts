// types/product-list.ts

/** Tiêu chí sắp xếp sản phẩm */
export type ProductSortOption = 'latest' | 'price_asc' | 'price_desc' | 'featured';

/** Cấu trúc tham số lọc sản phẩm từ URL Query */
export interface ProductFilterParams {
  category?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: ProductSortOption;
  page: number;
  limit: number;
}

/** Cấu trúc SearchParams nhận được từ Next.js App Router Page */
export interface ProductsPageSearchParams {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  sort?: string;
  page?: string;
  q?: string;
  search?: string;
}

/** Đơn vị thông tin Danh mục dùng cho bộ lọc */
export interface CategoryFilterItem {
  id: string;
  name: string;
  slug: string;
  count: number;
  icon?: string;
}

/** Thông tin Sản phẩm hiển thị trên Card */
export interface ProductItemData {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  rating?: number;
  reviewCount?: number;
  stock: number;
  isNew?: boolean;
  categoryName?: string;
}

/** Metadata phân trang trả về từ Backend API */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

/** Thông tin Banner Khuyến mãi */
export interface PromotionBannerItem {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
}

// ----------------------------------------------------
// PROPS INTERFACES CHO CÁC DUMB COMPONENTS
// ----------------------------------------------------

export interface ProductListHeroBannerProps {
  banners: PromotionBannerItem[];
}

export interface ProductListToolbarProps {
  totalProducts: number;
  sortOption: ProductSortOption;
  isFilterOpen: boolean;
  onToggleFilter: () => void;
  onSortChange: (newSort: ProductSortOption) => void;
}

export interface ProductFilterSidebarProps {
  categories: CategoryFilterItem[];
  selectedCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
  onSelectCategory: (categorySlug?: string) => void;
  onPriceChange: (min?: number, max?: number) => void;
  onStockToggle: (inStock: boolean) => void;
  onResetFilter: () => void;
}

export interface ProductCardListProps {
  product: ProductItemData;
  onAddToCart: (productId: string) => void;
}

export interface ProductGridProps {
  products: ProductItemData[];
  isLoading: boolean;
  isFilterOpen: boolean;
  onAddToCart: (productId: string) => void;
  onResetFilter?: () => void;
}

export interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (newPage: number) => void;
}

export interface FilterCategoryGroupProps {
  categories: CategoryFilterItem[];
  selectedCategory?: string;
  onSelectCategory: (slug?: string) => void;
}

export interface FilterPriceRangeProps {
  minPrice?: number;
  maxPrice?: number;
  priceRange?: { min: number; max: number };
  onChange: (min?: number, max?: number) => void;
}

export interface FilterStockStatusProps {
  inStockOnly: boolean;
  onToggle: (value: boolean) => void;
}
