"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductDetailData } from "@/types/product-detail";
import { QuantityCounter } from "@/components/ui/quantity-counter";
import { useCartStore } from "@/store/use-cart-store";

interface ProductInfoProps {
  product: ProductDetailData;
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);

    addItem({
      productId: product.id,
      name: product.name,
      image: product.imageUrl,
      price: product.price,
      originalPrice: product.originalPrice,
      quantity,
      stock: product.stock,
    });

    setTimeout(() => {
      setIsAdding(false);
    }, 400);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      image: product.imageUrl,
      price: product.price,
      originalPrice: product.originalPrice,
      quantity,
      stock: product.stock,
    });
    router.push("/checkout");
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm sticky top-24 space-y-6">
      {/* Category Tag */}
      <div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 uppercase tracking-wide">
          {product.category.name}
        </span>
      </div>

      {/* Product Title */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
        {product.name}
      </h1>

      {/* Rating & Stock status */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="flex text-amber-400 text-sm">
            {[1, 2, 3, 4].map((star) => (
              <svg
                key={star}
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 fill-current opacity-60"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <span className="text-slate-900 font-bold text-sm">
            {product.rating || 4.9}
          </span>
          <span className="text-slate-500 text-xs sm:text-sm">
            ({product.reviewCount || 156} đánh giá)
          </span>
        </div>

        {/* Stock Badge */}
        {isOutOfStock ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
            Hết hàng
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Còn hàng ({product.stock})
          </span>
        )}
      </div>

      {/* Price Box */}
      <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-100">
        <div className="flex items-end gap-3 flex-wrap">
          <span className="text-red-600 font-extrabold text-2xl sm:text-3xl">
            {product.price.toLocaleString("vi-VN")}đ
          </span>
          {product.originalPrice && (
            <span className="text-slate-400 line-through text-base sm:text-lg mb-0.5 font-medium">
              {product.originalPrice.toLocaleString("vi-VN")}đ
            </span>
          )}
          {product.discountPercentage && product.discountPercentage > 0 ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 mb-1">
              -{product.discountPercentage}%
            </span>
          ) : null}
        </div>
        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Đang bán chạy! Đã bán {product.soldCount || "2.4k"}
        </p>
      </div>

      {/* Short Description */}
      <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
        {product.description ||
          "Trải nghiệm bùng nổ vị giác với nguyên liệu tươi chọn lọc kỹ lưỡng, nướng chín tới chuẩn bị, hòa quyện cùng công thức sốt độc quyền đậm đà đặc trưng của TechBite."}
      </p>

      {/* Quantity & Actions */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-4">
          <span className="text-slate-700 font-semibold text-sm w-20">
            Số lượng:
          </span>
          <QuantityCounter
            quantity={quantity}
            maxStock={product.stock}
            onChange={(val) => setQuantity(val)}
            disabled={isOutOfStock}
            size="md"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`w-full font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] ${
              isOutOfStock
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : isAdding
                ? "bg-orange-600 text-white opacity-80 cursor-wait"
                : "bg-orange-600 hover:bg-orange-700 text-white"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>{isAdding ? "Đang thêm..." : "Thêm vào giỏ"}</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className={`w-full font-bold py-3.5 px-4 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-[0.98] ${
              isOutOfStock
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
};
