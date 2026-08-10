import Image from "next/image";
import { SearchSuggestItemProps } from "../../types/search.types";

export const SearchSuggestItem = ({ item, query, onClick }: SearchSuggestItemProps) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  const renderHighlightedName = (name: string, q: string) => {
    if (!q || !q.trim()) return name;
    const escapedQuery = q.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const parts = name.split(new RegExp(`(${escapedQuery})`, "gi"));

    return parts.map((part, index) =>
      part.toLowerCase() === q.trim().toLowerCase() ? (
        <mark
          key={index}
          className="bg-orange-100 text-orange-800 font-extrabold rounded-md px-1.5 py-0.5 shadow-sm shadow-orange-500/10"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-3.5 px-4 py-3 hover:bg-orange-50/80 active:bg-orange-100/70 transition-all cursor-pointer select-none"
      role="option"
    >
      {/* Product Thumbnail */}
      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shrink-0 aspect-square group-hover:scale-105 group-hover:shadow-md transition-all duration-200">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="48px"
        />
      </div>

      {/* Product Name */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-orange-600 transition-colors leading-snug">
          {renderHighlightedName(item.name, query)}
        </h4>
      </div>

      {/* Price */}
      <div className="shrink-0 text-right flex flex-col items-end">
        <span className="text-sm font-extrabold text-red-600 tracking-tight">
          {formatPrice(item.price)}
        </span>
        {item.originalPrice && item.originalPrice > item.price && (
          <span className="text-[11px] text-slate-400 line-through font-normal">
            {formatPrice(item.originalPrice)}
          </span>
        )}
      </div>
    </div>
  );
};
