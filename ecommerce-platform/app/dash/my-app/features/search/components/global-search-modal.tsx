'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  X,
  Loader2,
  ShoppingBag,
  Package,
  Users,
  FolderTree,
  ShieldCheck,
  Compass,
  Clock,
  ArrowRight,
  CornerDownLeft,
  Trash2,
} from 'lucide-react';
import { GlobalSearchResultItem, GlobalSearchItemType } from '../types/global-search.types';
import { useGlobalSearch } from '../hooks/use-global-search';
import { STATIC_QUICK_ACTIONS } from '../api/global-search-api';

interface GlobalSearchModalProps {
  searchState: ReturnType<typeof useGlobalSearch>;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ searchState }) => {
  const router = useRouter();
  const {
    isOpen,
    closeSearch,
    query,
    setQuery,
    isLoading,
    error,
    results,
    selectedIndex,
    setSelectedIndex,
    recentSearches,
    removeRecentSearch,
    clearRecentSearches,
    handleSelectItem,
    handleInputKeyDown,
    flatItems,
  } = searchState;

  const inputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (!isOpen) return;
    const activeEl = listContainerRef.current?.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex, isOpen]);

  if (!isOpen) return null;

  const hasQuery = query.trim().length > 0;
  const isResultsEmpty =
    hasQuery &&
    !isLoading &&
    results.orders.length === 0 &&
    results.products.length === 0 &&
    results.customers.length === 0 &&
    results.categories.length === 0 &&
    results.staffs.length === 0 &&
    results.actions.length === 0;

  // Tính toán global index cho từng group trong flat list
  let currentRunningIndex = 0;

  const getItemIcon = (type: GlobalSearchItemType) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-blue-600" />;
      case 'product':
        return <Package className="w-4 h-4 text-emerald-600" />;
      case 'customer':
        return <Users className="w-4 h-4 text-purple-600" />;
      case 'category':
        return <FolderTree className="w-4 h-4 text-amber-600" />;
      case 'staff':
        return <ShieldCheck className="w-4 h-4 text-rose-600" />;
      case 'action':
      default:
        return <Compass className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getBadgeStyle = (badgeType?: string) => {
    switch (badgeType) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'danger':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'neutral':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim() || !text) return text;
    const tokens = highlight
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (tokens.length === 0) return text;
    const pattern = new RegExp(`(${tokens.join('|')})`, 'gi');
    const parts = text.split(pattern);
    return parts.map((part, i) =>
      tokens.some((t) => new RegExp(`^${t}$`, 'i').test(part)) ? (
        <mark key={i} className="bg-blue-100 text-blue-900 font-semibold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const renderGroup = (title: string, items: GlobalSearchResultItem[], icon: React.ReactNode) => {
    if (items.length === 0) return null;

    const groupStartIndex = currentRunningIndex;
    currentRunningIndex += items.length;

    return (
      <div className="mb-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          {icon}
          <span>{title}</span>
          <span className="text-slate-400 font-normal">({items.length})</span>
        </div>
        <div className="mt-1 space-y-1">
          {items.map((item, idx) => {
            const itemGlobalIndex = groupStartIndex + idx;
            const isSelected = itemGlobalIndex === selectedIndex;

            return (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.url}
                data-active={isSelected}
                onClick={() => handleSelectItem(item)}
                onMouseEnter={() => setSelectedIndex(itemGlobalIndex)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 block ${
                  isSelected
                    ? 'bg-blue-50/80 border border-blue-200 shadow-sm'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}
                  >
                    {getItemIcon(item.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800 truncate">
                        {highlightMatch(item.title, query)}
                      </span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${getBadgeStyle(
                            item.badgeType,
                          )}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {highlightMatch(item.subtitle, query)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                  <span
                    className={`text-xs flex items-center gap-1 font-medium transition-opacity ${
                      isSelected ? 'text-blue-600 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <span>Truy cập</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeSearch}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-white">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Tìm kiếm đơn hàng, sản phẩm, khách hàng, nhân viên, tác vụ... (Ctrl + K)"
            className="flex-1 text-base text-slate-800 placeholder:text-slate-400 bg-transparent border-none outline-none focus:ring-0"
          />

          {hasQuery && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Xóa từ khóa"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results / Suggestions Container */}
        <div
          ref={listContainerRef}
          className="flex-1 overflow-y-auto p-4 max-h-[500px] scrollbar-thin scrollbar-thumb-slate-200"
        >
          {error && (
            <div className="p-3 mb-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          {/* Khi chưa nhập từ khóa: Hiển thị Recent Searches & Quick Navigation */}
          {!hasQuery && (
            <div>
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between px-3 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Tìm kiếm gần đây</span>
                    </div>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors capitalize font-normal"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa lịch sử</span>
                    </button>
                  </div>
                  <div className="mt-1 space-y-1">
                    {recentSearches.map((item, idx) => {
                      const isSelected = idx === selectedIndex;
                      return (
                        <Link
                          key={`recent-${item.type}-${item.id}`}
                          href={item.url}
                          data-active={isSelected}
                          onClick={() => handleSelectItem(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors block ${
                            isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                              {getItemIcon(item.type)}
                            </div>
                            <div className="min-w-0">
                              <span className="text-sm font-semibold text-slate-800 truncate block">
                                {item.title}
                              </span>
                              {item.subtitle && (
                                <span className="text-xs text-slate-400 truncate block">
                                  {item.subtitle}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeRecentSearch(item.id, item.type);
                            }}
                            className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Xóa mục này"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Navigation Actions */}
              <div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Truy cập nhanh các phân hệ</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {STATIC_QUICK_ACTIONS.map((action) => (
                    <Link
                      key={action.id}
                      href={action.url}
                      onClick={() => handleSelectItem(action)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-all group block"
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {getItemIcon(action.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 truncate">
                          {action.title}
                        </div>
                        <div className="text-xs text-slate-400 truncate mt-0.5">
                          {action.subtitle}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Khi có từ khóa và có kết quả */}
          {hasQuery && (
            <div>
              {renderGroup(
                'Đơn hàng',
                results.orders,
                <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />,
              )}
              {renderGroup(
                'Sản phẩm',
                results.products,
                <Package className="w-3.5 h-3.5 text-emerald-500" />,
              )}
              {renderGroup(
                'Khách hàng',
                results.customers,
                <Users className="w-3.5 h-3.5 text-purple-500" />,
              )}
              {renderGroup(
                'Chuyên mục',
                results.categories,
                <FolderTree className="w-3.5 h-3.5 text-amber-500" />,
              )}
              {renderGroup(
                'Nhân viên',
                results.staffs,
                <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />,
              )}
              {renderGroup(
                'Tác vụ & Điều hướng',
                results.actions,
                <Compass className="w-3.5 h-3.5 text-indigo-500" />,
              )}

              {/* View all on /search page */}
              {results.totalResults > 0 && (
                <div className="pt-2 pb-1 text-center border-t border-slate-100 mt-3">
                  <button
                    onClick={() => {
                      closeSearch();
                      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <span>Xem tất cả kết quả ({results.totalResults}) trên trang tìm kiếm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Khi không tìm thấy kết quả */}
          {isResultsEmpty && (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-800">
                Không tìm thấy kết quả phù hợp
              </h4>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Không có đơn hàng, sản phẩm hoặc khách hàng nào khớp với từ khóa{' '}
                <span className="font-semibold text-slate-700">"{query}"</span>.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold">
                ↓
              </kbd>
              <span>Điều hướng</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold">
                ↵
              </kbd>
              <span>Chọn</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold">
                ESC
              </kbd>
              <span>Đóng</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
            DashStack Global Search • Enterprise Standard
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
