'use client';

// components/product-list/product-list-hero-banner.tsx
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductListHeroBannerProps } from '@/types/product-list';

const ProductListHeroBanner = ({ banners }: ProductListHeroBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const bannerCount = banners.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % bannerCount);
  }, [bannerCount]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + bannerCount) % bannerCount);
  }, [bannerCount]);

  useEffect(() => {
    if (bannerCount <= 1 || isHovered) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [bannerCount, isHovered, nextSlide]);

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full aspect-[21/9] sm:aspect-[3/1] rounded-2xl overflow-hidden bg-slate-900 shadow-md border border-slate-100 group"
    >
      {/* Background Image */}
      <Image
        key={currentBanner.id}
        src={currentBanner.imageUrl}
        alt={currentBanner.title}
        fill
        sizes="(max-width: 768px) 100vw, 1280px"
        className="absolute inset-0 w-full h-full object-cover opacity-85 transition-opacity duration-700 hover:scale-105"
        priority
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/50 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-center w-full md:w-2/3 z-10">
        <span className="inline-block px-3 py-1 bg-orange-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg mb-3 sm:mb-4 w-max shadow-sm">
          Khuyến mãi cực sốc
        </span>
        <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight max-w-xl line-clamp-2 mb-2 sm:mb-3">
          {currentBanner.title}
        </h1>
        {currentBanner.subtitle && (
          <p className="text-xs sm:text-base text-slate-200 max-w-md hidden sm:block mb-4 line-clamp-2">
            {currentBanner.subtitle}
          </p>
        )}

        {currentBanner.linkUrl && (
          <div>
            <Link
              href={currentBanner.linkUrl}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 w-max"
            >
              Xem ngay
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Navigation Arrows (Only if multiple banners) */}
      {bannerCount > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            ›
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-20">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'w-6 bg-orange-600' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductListHeroBanner;
