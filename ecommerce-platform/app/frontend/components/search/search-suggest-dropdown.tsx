import { SearchSuggestDropdownProps } from "../../types/search.types";
import { SearchSuggestItem } from "./search-suggest-item";

export const SearchSuggestDropdown = ({
  items,
  isLoading,
  isError = false,
  query,
  totalFound,
  onSelectItem,
  onViewAll,
}: SearchSuggestDropdownProps) => {
  return (
    <div
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100/90 z-50 overflow-hidden flex flex-col max-h-[440px] animate-fadeIn origin-top"
      role="listbox"
    >
      {/* Loading Skeleton State */}
      {isLoading ? (
        <div className="p-4 space-y-3">
          <div className="h-3 w-28 bg-slate-200 rounded animate-pulse mb-3" />
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="flex items-center gap-3.5 py-1.5">
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
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Không tải được gợi ý tìm kiếm
          </p>
          <p className="text-xs text-slate-400">Vui lòng kiểm tra lại kết nối mạng 🌐</p>
        </div>
      ) : items.length > 0 ? (
        <>
          {/* Header Section */}
          <div className="px-4 py-2.5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0">
            <span>Gợi ý sản phẩm</span>
            <span className="bg-slate-200/60 text-slate-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
              {totalFound} kết quả
            </span>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100/60 py-1 custom-scrollbar">
            {items.map((item) => (
              <SearchSuggestItem
                key={item.id}
                item={item}
                query={query}
                onClick={() => onSelectItem(item.slug)}
              />
            ))}
          </div>

          {/* Footer Action */}
          <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 shrink-0">
            <button
              type="button"
              onClick={() => onViewAll(query)}
              className="w-full flex items-center justify-between text-xs font-bold text-orange-600 hover:text-orange-700 active:scale-[0.99] transition-all group py-0.5"
            >
              <span>
                Xem tất cả {totalFound} kết quả cho &quot;
                <span className="underline decoration-orange-300 underline-offset-2">{query}</span>&quot;
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-1 shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Không tìm thấy sản phẩm cho &quot;<span className="text-orange-600 font-extrabold">{query}</span>&quot;
          </p>
          <p className="text-xs text-slate-400">Thử tìm với từ khóa khác nhé! 🔍</p>
        </div>
      )}
    </div>
  );
};
