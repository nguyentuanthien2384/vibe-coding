import Link from "next/link";
import { getProductBySlug, getRelatedProducts } from "@/lib/product-detail";
import { ProductGallery } from "@/components/product-detail/product-gallery";
import { ProductInfo } from "@/components/product-detail/product-info";
import { ProductTabs } from "@/components/product-detail/product-tabs";
import { RelatedProducts } from "@/components/product-detail/related-products";
import { StorefrontShell } from "@/components/layout/storefront-shell";

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const { product, isError, notFound } = await getProductBySlug(slug);

  if (notFound || !product || isError) {
    return (
      <StorefrontShell>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-2xl p-10 max-w-md mx-auto border border-slate-100 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Không tìm thấy sản phẩm
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Sản phẩm bạn đang tìm kiếm có thể đã hết hàng hoặc slug không chính xác.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm"
            >
              Quay lại danh sách sản phẩm
            </Link>
          </div>
        </div>
      </main>
      </StorefrontShell>
    );
  }

  // Fetch related products
  const relatedProducts = await getRelatedProducts(product.category.id, product.id);

  return (
    <StorefrontShell>
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex text-xs sm:text-sm text-slate-500 mb-6 font-medium overflow-x-auto pb-1">
        <ol className="inline-flex items-center space-x-1 sm:space-x-2 whitespace-nowrap">
          <li className="inline-flex items-center">
            <Link href="/" className="hover:text-orange-600 transition-colors">
              Trang chủ
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-slate-400 mx-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/products" className="hover:text-orange-600 transition-colors">
                Thực đơn
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-slate-400 mx-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <Link
                href={`/products?category=${product.category.slug || ""}`}
                className="hover:text-orange-600 transition-colors"
              >
                {product.category.name}
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-slate-400 mx-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-slate-900 font-bold max-w-[200px] sm:max-w-xs truncate">
                {product.name}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Core Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-12 sm:mb-16">
        {/* Left Column: Gallery (7/12) */}
        <div className="lg:col-span-7">
          <ProductGallery
            mainImageUrl={product.imageUrl}
            productName={product.name}
            discountPercentage={product.discountPercentage}
            isOutOfStock={product.stock === 0}
            images={product.images}
          />
        </div>

        {/* Right Column: Details & Actions (5/12) */}
        <div className="lg:col-span-5">
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Detailed Description & Specs Tabs */}
      <ProductTabs product={product} />

      {/* Related Products Section */}
      <RelatedProducts products={relatedProducts} />
    </main>
    </StorefrontShell>
  );
}
