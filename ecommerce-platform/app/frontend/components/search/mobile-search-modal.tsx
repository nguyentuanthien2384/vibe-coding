"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "../../hooks/use-debounce";
import { useSearchSuggest } from "../../hooks/use-search-suggest";
import { SearchSuggestItem } from "./search-suggest-item";

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSearchModal = ({ isOpen, onClose }: MobileSearchModalProps) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { items, totalFound, isLoading, isError } = useSearchSuggest(debouncedQuery, 8);
  const isTypingOrLoading = isLoading || (searchQuery.trim().length >= 2 && searchQuery !== debouncedQuery);

  // Auto focus input khi modal mở & khóa cuộn trang background
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = "unset";
      setSearchQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectProduct = (slug: string) => {
    onClose();
    router.push(`/products/${slug}`);
  };

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    onClose();
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col animate-fadeIn">
      {/* Top Mobile Search Bar Header */}
      <div className="p-3 border-b border-slate-200/80 flex items-center gap-2 bg-white sticky top-0 shrink-0 shadow-sm">
        {/* Back Button */}
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
          aria-label="Đóng tìm kiếm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Search Input Field */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearchSubmit(searchQuery);
              }
            }}
            placeholder="Tìm đồ ăn vặt, nước uống..."
            className="w-full bg-slate-100 border border-slate-200/60 rounded-full py-2.5 pl-4 pr-10 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/15"
          />

          {isTypingOrLoading ? (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-orange-600 animate-spin">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
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
            </span>
          ) : searchQuery.length > 0 ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:bg-slate-200"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-white p-4 custom-scrollbar">
        {searchQuery.trim().length < 2 ? (
          /* Popular Keywords Suggestions */
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              🔥 Từ khóa gợi ý hôm nay
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Bắp rang bơ", "Trà sữa", "Khô gà", "Bánh tráng phô mai", "Cà phê muối"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                    }}
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-600 text-xs font-semibold transition-colors"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>
        ) : isTypingOrLoading ? (
          /* Skeleton Loading */
          <div className="space-y-3">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="flex items-center gap-3 py-2">
                <div className="w-12 h-12 rounded-xl bg-slate-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-1/3 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error State */
          <div className="py-12 text-center text-slate-500 text-sm">
            Không thể lấy dữ liệu gợi ý. Vui lòng kiểm tra lại kết nối mạng 🌐
          </div>
        ) : items.length > 0 ? (
          /* Real API Suggestions List */
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              <span>Gợi ý sản phẩm ({totalFound})</span>
            </div>
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <SearchSuggestItem
                  key={item.id}
                  item={item}
                  query={debouncedQuery}
                  onClick={() => handleSelectProduct(item.slug)}
                />
              ))}
            </div>

            <button
              onClick={() => handleSearchSubmit(searchQuery)}
              className="w-full mt-4 py-3 bg-orange-600 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span>Xem tất cả {totalFound} kết quả</span>
              <span>→</span>
            </button>
          </div>
        ) : (
          /* Empty Search Results */
          <div className="py-12 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              Không tìm thấy sản phẩm cho &quot;
              <span className="text-orange-600 font-extrabold">{searchQuery}</span>&quot;
            </p>
            <p className="text-xs text-slate-400">Thử gõ từ khóa khác nhé! 🔍</p>
          </div>
        )}
      </div>
    </div>
  );
};
