// app/categories/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getFilterMeta,
  getProductsList,
  getPromotionBanners,
} from '@/lib/product-list';
import ProductListHeroBanner from '@/components/product-list/product-list-hero-banner';
import ProductListSection from '@/components/product-list/product-list-section';
import { ProductsPageSearchParams, ProductSortOption } from '@/types/product-list';

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
  searchParams: Promise<ProductsPageSearchParams> | ProductsPageSearchParams;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const filterMeta = await getFilterMeta();
  const category = filterMeta.categories.find((c) => c.slug === slug);

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
  const filterMeta = await getFilterMeta();

  // Validate category existence (if slug is invalid or 'all', trigger notFound)
  const currentCategory = filterMeta.categories.find((c) => c.slug === slug);
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
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
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
    </div>
  );
}
