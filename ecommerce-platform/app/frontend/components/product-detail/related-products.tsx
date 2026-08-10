import Link from "next/link";
import { ProductItemData } from "@/types/product-list";
import { ProductCard } from "@/components/home/product-card";

interface RelatedProductsProps {
  products: ProductItemData[];
}

export const RelatedProducts = ({ products }: RelatedProductsProps) => {
  if (products.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
          Sản phẩm liên quan
        </h2>
        <Link
          href="/products"
          className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group transition-colors"
        >
          <span>Xem tất cả</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {products.map((item) => {
          const cardProduct = {
            id: item.id,
            name: item.name,
            price: item.originalPrice ? item.originalPrice : item.price,
            salePrice: item.originalPrice ? item.price : null,
            stock: item.stock,
            imageUrl: item.imageUrl,
          };

          return (
            <div key={item.id} className="relative group/wrapper">
              <Link href={`/products/${item.slug}`} className="block">
                <ProductCard product={cardProduct} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
