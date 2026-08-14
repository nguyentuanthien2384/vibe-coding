// app/products/page.tsx
import type { Metadata } from 'next';
import {
  getFilterMeta,
  getProductsList,
  getPromotionBanners,
} from '@/lib/product-list';
import ProductListHeroBanner from '@/components/product-list/product-list-hero-banner';
import ProductListSection from '@/components/product-list/product-list-section';
import { StorefrontShell } from '@/components/layout/storefront-shell';
import { ProductsPageSearchParams, ProductSortOption } from '@/types/product-list';

export const metadata: Metadata = {
  title: 'Thực Đơn - TechBite | Nạp năng lượng cho lập trình viên',
  description:
    'Khám phá hàng chục món ăn, đồ uống năng lượng dành riêng cho anh em thức khuya code. Giảm giá đến 25% mỗi ngày sau 22h!',
};

interface PageProps {
  searchParams: Promise<ProductsPageSearchParams> | ProductsPageSearchParams;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  const categorySlug = resolvedSearchParams.category;
  const minPrice = resolvedSearchParams.minPrice ? parseFloat(resolvedSearchParams.minPrice) : undefined;
  const maxPrice = resolvedSearchParams.maxPrice ? parseFloat(resolvedSearchParams.maxPrice) : undefined;
  const inStockOnly = resolvedSearchParams.inStock === 'true';
  const sortOption = (resolvedSearchParams.sort as ProductSortOption) || 'featured';
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page, 10) : 1;
  const search = resolvedSearchParams.q || resolvedSearchParams.search;

  // Fetch filter metadata first to build category slug -> ID mapping
  const filterMeta = await getFilterMeta();

  const categoryMap = new Map<string, number>();
  filterMeta.categories.forEach((cat) => {
    if (cat.slug !== 'all') {
      const numId = parseInt(cat.id, 10);
      if (!isNaN(numId)) {
        categoryMap.set(cat.slug, numId);
      }
    }
  });

  // Concurrently fetch product list and promotion banners
  const [productsData, bannersData] = await Promise.all([
    getProductsList(
      {
        categorySlug,
        minPrice,
        maxPrice,
        inStock: inStockOnly,
        sort: sortOption,
        page,
        limit: 12,
        search,
      },
      categoryMap,
    ),
    getPromotionBanners(),
  ]);

  return (
    <StorefrontShell>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-8">
        {/* Hero Banner */}
        <div className="w-full rounded-2xl overflow-hidden shadow-md">
          <ProductListHeroBanner banners={bannersData.banners} />
        </div>

        {/* Product List Section (Sidebar + Toolbar + Grid + Pagination) */}
        <ProductListSection
          products={productsData.products}
          meta={productsData.meta}
          categories={filterMeta.categories}
          selectedCategory={categorySlug}
          minPrice={minPrice}
          maxPrice={maxPrice}
          priceRange={filterMeta.priceRange}
          inStockOnly={inStockOnly}
          sortOption={sortOption}
        />
      </main>
    </StorefrontShell>
  );
}
