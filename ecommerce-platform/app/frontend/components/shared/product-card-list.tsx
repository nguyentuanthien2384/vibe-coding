'use client';

// components/shared/product-card-list.tsx
// Dùng riêng cho trang Product List - có thêm rating, reviewCount, categoryName
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ProductCardListProps } from '@/types/product-list';

const ProductCardList = ({ product, onAddToCart }: ProductCardListProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock || isLoading) return;
    setIsLoading(true);
    onAddToCart(product.id);
    setTimeout(() => setIsLoading(false), 400);
  };

  const productUrl = `/products/${product.slug || product.id}`;

  return (
    <div
      className={`group relative flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 ${
        isOutOfStock ? 'opacity-75' : 'hover:shadow-xl hover:-translate-y-1.5'
      }`}
    >
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
        {product.discountPercentage && !isOutOfStock && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm tracking-wide bg-red-600 text-white">
            -{product.discountPercentage}%
          </span>
        )}
        {product.isNew && !isOutOfStock && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm tracking-wide bg-emerald-500 text-white">
            Mới
          </span>
        )}
        {isOutOfStock && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm tracking-wide bg-slate-500 text-white uppercase">
            Hết hàng
          </span>
        )}
      </div>

      {/* Out of stock overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-white/40 z-20 flex items-center justify-center backdrop-blur-[1px] pointer-events-none">
          <span className="bg-slate-800 text-white font-extrabold px-4 py-2 rounded-lg text-sm tracking-widest shadow-lg -rotate-12 border-2 border-white">
            HẾT HÀNG
          </span>
        </div>
      )}

      {/* Image */}
      <Link href={productUrl} className="relative w-full aspect-square bg-slate-100 overflow-hidden block">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div>
          {product.categoryName && (
            <p className="text-xs text-slate-500 mb-1 font-medium">{product.categoryName}</p>
          )}
          <Link href={productUrl} className="block">
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base line-clamp-2 group-hover:text-orange-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-amber-400 text-xs">★</span>
              <span className="text-xs font-semibold text-slate-700">{product.rating}</span>
              {product.reviewCount && (
                <span className="text-xs text-slate-400">({product.reviewCount})</span>
              )}
            </div>
          )}
        </div>

        <div>
          {/* Price Row */}
          <div className="flex items-baseline gap-2 flex-wrap mb-3">
            <span className="text-red-600 font-extrabold text-base sm:text-lg">
              {product.price.toLocaleString('vi-VN')}đ
            </span>
            {product.originalPrice && (
              <span className="text-slate-400 line-through text-xs sm:text-sm">
                {product.originalPrice.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isLoading}
            className={`w-full py-2.5 px-4 font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : isLoading
                ? 'bg-orange-600 opacity-75 text-white cursor-wait'
                : 'bg-orange-600 hover:bg-orange-700 active:scale-95 text-white hover:shadow-md'
            }`}
          >
            {isOutOfStock ? (
              'Hết hàng'
            ) : isLoading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Thêm vào giỏ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCardList;
