"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductGalleryProps {
  mainImageUrl: string;
  productName: string;
  discountPercentage?: number;
  isOutOfStock?: boolean;
  images?: string[];
}

export const ProductGallery = ({
  mainImageUrl,
  productName,
  discountPercentage,
  isOutOfStock = false,
  images = [],
}: ProductGalleryProps) => {
  const galleryImages = images.length > 0 ? images : [mainImageUrl];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const activeImage = galleryImages[selectedImageIndex] || mainImageUrl;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Stage */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200 group">
        {/* Discount Badge */}
        {discountPercentage && discountPercentage > 0 ? (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-red-600 text-white shadow-md">
              -{discountPercentage}%
            </span>
          </div>
        ) : null}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-20 flex items-center justify-center">
            <span className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold text-base shadow-lg">
              Hết hàng
            </span>
          </div>
        )}

        <Image
          src={activeImage}
          alt={productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Thumbnails list */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {galleryImages.map((imgUrl, index) => {
          const isSelected = selectedImageIndex === index;
          return (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedImageIndex(index)}
              className={`w-full aspect-square rounded-xl overflow-hidden relative transition-all duration-200 ${
                isSelected
                  ? "border-2 border-orange-600 ring-2 ring-orange-100 shadow-xs scale-[1.02]"
                  : "border border-slate-200 opacity-70 hover:opacity-100 hover:border-orange-400"
              }`}
            >
              <Image
                src={imgUrl}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                sizes="(max-width: 640px) 25vw, 15vw"
                className="object-cover w-full h-full"
              />
              {isSelected && (
                <div className="absolute inset-0 bg-orange-600/10 mix-blend-multiply" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
