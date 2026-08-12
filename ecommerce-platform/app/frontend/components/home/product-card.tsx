"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "../../store/use-cart-store";
import { getImageUrl } from "../../lib/image-url";

export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  stock: number;
  imageUrl: string;
  slug?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const discountPercent = product.salePrice
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : 0;

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock || isLoading) return;
    setIsLoading(true);

    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addItem({
        productId: product.id,
        name: product.name,
        image: product.imageUrl,
        price: product.salePrice ?? product.price,
        originalPrice: product.salePrice ? product.price : undefined,
        stock: product.stock,
      });
    }

    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  const productUrl = `/products/${product.slug || product.id}`;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col border border-transparent hover:border-orange-200">
      {/* Image Container */}
      <Link href={productUrl} className="relative aspect-square bg-gray-100 overflow-hidden block">
        <Image
          src={getImageUrl(product.imageUrl)}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />

        {/* Discount Badge */}
        {product.salePrice && (
          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 bg-red-600 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md sm:rounded-lg">
            -{discountPercent}%
          </span>
        )}

        {/* Stock Badge / Overlay */}
        {isOutOfStock ? (
          <>
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10" />
            <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-20 bg-gray-500 text-white text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md sm:rounded-lg">
              Hết hàng
            </span>
          </>
        ) : isLowStock ? (
          <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 bg-amber-500 text-white text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md sm:rounded-lg">
            Sắp hết
          </span>
        ) : null}
      </Link>

      {/* Body */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1 gap-1.5 sm:gap-2">
        <Link href={productUrl} className="block">
          <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] hover:text-orange-600 transition-colors">
            {product.name}
          </p>
        </Link>

        {/* Price display */}
        <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-red-600 font-bold text-sm sm:text-base">
            {(product.salePrice ?? product.price).toLocaleString("vi-VN")}đ
          </span>
          {product.salePrice && (
            <span className="text-slate-400 text-[10px] sm:text-xs line-through">
              {product.price.toLocaleString("vi-VN")}đ
            </span>
          )}
        </div>

        {/* Add To Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isLoading}
          className={`mt-auto w-full flex items-center justify-center gap-1 font-bold text-xs sm:text-sm py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-150 ${
            isOutOfStock
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : isLoading
              ? "bg-orange-600 opacity-75 text-white cursor-wait"
              : "bg-orange-600 hover:bg-orange-500 active:scale-95 text-white shadow-sm hover:shadow-md hover:shadow-orange-600/25"
          }`}
        >
          {isOutOfStock ? (
            "Hết hàng"
          ) : isLoading ? (
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Thêm vào giỏ</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
