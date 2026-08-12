"use client";

import Link from "next/link";
import { getImageUrl } from "../../lib/image-url";

export interface Category {
  name: string;
  slug: string;
  iconUrl: string;
}

interface CategoryRailProps {
  categories: Category[];
  activeCategorySlug?: string;
  onCategorySelect?: (slug: string) => void;
}

export const CategoryRail = ({
  categories,
  activeCategorySlug = "",
  onCategorySelect,
}: CategoryRailProps) => {
  const currentCategory = activeCategorySlug;

  const allCategories: Category[] = [
    { name: "Tất cả", slug: "", iconUrl: "🔥" },
    ...categories,
  ];

  const renderCategoryIcon = (iconUrl: string) => {
    if (!iconUrl) return null;
    const isImage =
      iconUrl.startsWith("/") ||
      iconUrl.startsWith("http://") ||
      iconUrl.startsWith("https://") ||
      iconUrl.includes("/uploads/");

    if (isImage) {
      return (
        <img
          src={getImageUrl(iconUrl)}
          alt=""
          className="w-5 h-5 object-contain shrink-0"
        />
      );
    }
    return <span className="text-lg sm:text-xl leading-none">{iconUrl}</span>;
  };

  return (
    <div className="py-4 sm:py-6 md:py-8">
      <div className="flex flex-nowrap md:flex-wrap md:justify-center gap-2.5 sm:gap-3 md:gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
        {allCategories.map((cat) => {
          const isActive = currentCategory === cat.slug;
          const href = cat.slug ? `/categories/${cat.slug}` : "/products";

          if (onCategorySelect) {
            return (
              <button
                key={cat.slug || "all"}
                onClick={() => onCategorySelect(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl border transition-all duration-200 shrink-0 select-none snap-start cursor-pointer ${
                  isActive
                    ? "bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-600/20"
                    : "bg-white border-slate-200 text-slate-700 hover:border-orange-400 hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                {renderCategoryIcon(cat.iconUrl)}
                <span
                  className={`text-xs sm:text-sm font-medium ${
                    isActive ? "text-white" : "text-slate-700"
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={cat.slug || "all"}
              href={href}
              className={`flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl border transition-all duration-200 shrink-0 select-none snap-start cursor-pointer ${
                isActive
                  ? "bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-600/20"
                  : "bg-white border-slate-200 text-slate-700 hover:border-orange-400 hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              {renderCategoryIcon(cat.iconUrl)}
              <span
                className={`text-xs sm:text-sm font-medium ${
                  isActive ? "text-white" : "text-slate-700"
                }`}
              >
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
