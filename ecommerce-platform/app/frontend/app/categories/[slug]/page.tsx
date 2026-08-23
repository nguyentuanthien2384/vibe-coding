import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getFilterMeta,
  getProductsList,
  getPromotionBanners,
} from '@/lib/product-list';
import { apiFetch, ApiResponse } from '@/lib/api';
import ProductListHeroBanner from '@/components/product-list/product-list-hero-banner';
import ProductListSection from '@/components/product-list/product-list-section';
import { StorefrontShell } from '@/components/layout/storefront-shell';
import { ProductsPageSearchParams, ProductSortOption } from '@/types/product-list';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
  searchParams: Promise<ProductsPageSearchParams> | ProductsPageSearchParams;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const filterMeta = await getFilterMeta();
  let category = filterMeta.categories.find((c) => c.slug === slug);

  if (!category && slug !== 'all') {
    try {
      const directCatRes = await apiFetch<ApiResponse<{ id: number; name: string; slug: string }>>(
        `/api/v1/categories/${slug}`,
        { cache: 'no-store' },
      );
      if (directCatRes?.data) {
        category = {
          id: String(directCatRes.data.id),
          name: directCatRes.data.name,
          slug: directCatRes.data.slug,
          count: 0,
        };
      }
    } catch {
      // Ignored
    }
  }

  if (!category || slug === 'all') {
    return {
      title: 'Danh mục sản phẩm - TechBite',
    };
  }

  return {
    title: `${category.name} - Thực Đơn TechBite | Nạp năng lượng cho lập trình viên`,
    description: `Khám phá các món ăn, đồ uống thuộc danh mục ${category.name} dành riêng cho anh em thức khuya code. Giảm giá đến 25% mỗi ngày!`,
  };
}

export default async function CategoryProductsPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const resolvedSearchParams = await searchParams;

  const minPrice = resolvedSearchParams.minPrice ? parseFloat(resolvedSearchParams.minPrice) : undefined;
  const maxPrice = resolvedSearchParams.maxPrice ? parseFloat(resolvedSearchParams.maxPrice) : undefined;
  const inStockOnly = resolvedSearchParams.inStock === 'true';
  const sortOption = (resolvedSearchParams.sort as ProductSortOption) || 'featured';
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page, 10) : 1;
  const search = resolvedSearchParams.q || resolvedSearchParams.search;

  // Fetch filter metadata first to build category slug -> ID mapping
  let filterMeta = await getFilterMeta();

  // Validate category existence (nếu chưa có trong filter-meta do cache, tra cứu trực tiếp từ /api/v1/categories/:slug)
  let currentCategory = filterMeta.categories.find((c) => c.slug === slug);
  if (!currentCategory && slug !== 'all') {
    try {
      const directCatRes = await apiFetch<ApiResponse<{ id: number; name: string; slug: string }>>(
        `/api/v1/categories/${slug}`,
        { cache: 'no-store' },
      );
      if (directCatRes?.data) {
        currentCategory = {
          id: String(directCatRes.data.id),
          name: directCatRes.data.name,
          slug: directCatRes.data.slug,
          count: 0,
        };
        filterMeta = {
          ...filterMeta,
          categories: [...filterMeta.categories, currentCategory],
        };
      }
    } catch {
      // Ignored
    }
  }

  if (!currentCategory || slug === 'all') {
    notFound();
  }

  const categoryMap = new Map<string, number>();
  filterMeta.categories.forEach((cat) => {
    if (cat.slug !== 'all') {
      const numId = parseInt(cat.id, 10);
      if (!isNaN(numId)) {
        categoryMap.set(cat.slug, numId);
      }
    }
  });

  // Concurrently fetch product list for this category slug and promotion banners
  const [productsData, bannersData] = await Promise.all([
    getProductsList(
      {
        categorySlug: slug,
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
          selectedCategory={slug}
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
