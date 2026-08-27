'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PostProductItem } from '@/types/blog';
import { useCartStore } from '@/store/use-cart-store';

export interface PostProductEmbedCardProps {
  item: PostProductItem;
}

const formatPrice = (price: number): string => {
  return price.toLocaleString('vi-VN') + 'đ';
};

export const PostProductEmbedCard = ({ item }: PostProductEmbedCardProps) => {
  const { product } = item;
  const addItem = useCartStore((state) => state.addItem);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await addItem({
        productId: product.id,
        name: product.name,
        image: product.imageUrl,
        price: product.salePrice || product.price,
        originalPrice: product.salePrice ? product.price : null,
        stock: product.stock,
        quantity: 1,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const discountPercent =
    product.salePrice && product.salePrice < product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 p-4 sm:p-5 bg-white rounded-2xl border border-orange-200/80 shadow-xs hover:shadow-md transition-all group">
      {/* Product Thumbnail */}
      <Link
        href={`/products/${product.slug}`}
        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0"
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="112px"
        />
        {discountPercent && (
          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-black bg-red-600 text-white shadow-xs">
            -{discountPercent}%
          </span>
        )}
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-center text-center sm:text-left w-full sm:w-auto">
        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 uppercase tracking-wider mb-1 justify-center sm:justify-start">
          <span>⚡ Món ngon gợi ý</span>
        </div>
        <Link
          href={`/products/${product.slug}`}
          className="text-base font-bold text-slate-900 hover:text-orange-600 line-clamp-1 transition-colors"
        >
          {product.name}
        </Link>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 mt-1 justify-center sm:justify-start">
          <span className="text-lg font-black text-red-600">
            {formatPrice(product.salePrice || product.price)}
          </span>
          {product.salePrice && (
            <span className="text-xs text-slate-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-1 text-xs">
          {product.stock > 0 ? (
            <span className="font-semibold text-emerald-600">
              ● Còn hàng ({product.stock} gói)
            </span>
          ) : (
            <span className="font-semibold text-slate-400">● Tạm hết hàng</span>
          )}
        </div>
      </div>

      {/* Add To Cart Action */}
      <button
        onClick={handleAddToCart}
        disabled={isAdding || product.stock <= 0}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-600/20 disabled:opacity-50 disabled:pointer-events-none transition-all shrink-0 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <span>{isAdding ? 'Đang thêm...' : 'Thêm vào giỏ'}</span>
      </button>
    </div>
  );
};
