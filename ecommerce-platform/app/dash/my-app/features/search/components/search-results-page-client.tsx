'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  ShoppingBag,
  Package,
  Users,
  FolderTree,
  ShieldCheck,
  ArrowRight,
  Loader2,
  X,
  Compass,
  AlertCircle,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { searchGlobalAdmin } from '../api/global-search-api';
import { AdminGlobalSearchData } from '../types/global-search.types';

type SearchTab = 'all' | 'orders' | 'products' | 'customers' | 'categories' | 'staffs';

export function SearchResultsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialTab = (searchParams.get('tab') as SearchTab) || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'all') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    router.replace(`/search?${params.toString()}`);
  };

  const [results, setResults] = useState<AdminGlobalSearchData>({
    orders: [],
    products: [],
    customers: [],
    categories: [],
    staffs: [],
    actions: [],
    totalResults: 0,
  });

  const debouncedQuery = useDebounce(query, 350);

  // Sync debounced query to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery.trim()) {
      params.set('q', debouncedQuery.trim());
    }
    if (activeTab !== 'all') {
      params.set('tab', activeTab);
    }
    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search';
    startTransition(() => {
      router.replace(newUrl, { scroll: false });
    });
  }, [debouncedQuery, activeTab, router]);

  // Fetch real API data
  useEffect(() => {
    let isCancelled = false;

    async function fetchData() {
      if (!debouncedQuery.trim()) {
        setResults({
          orders: [],
          products: [],
          customers: [],
          categories: [],
          staffs: [],
          actions: [],
          totalResults: 0,
        });
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await searchGlobalAdmin(debouncedQuery, 20);
        if (!isCancelled) {
          setResults(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError('Có lỗi xảy ra khi truy vấn dữ liệu. Vui lòng thử lại.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

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
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const currentTabCount = useMemo(() => {
    switch (activeTab) {
      case 'orders':
        return results.orders.length;
      case 'products':
        return results.products.length;
      case 'customers':
        return results.customers.length;
      case 'categories':
        return results.categories.length;
      case 'staffs':
        return results.staffs.length;
      case 'all':
      default:
        return (
          results.orders.length +
          results.products.length +
          results.customers.length +
          results.categories.length +
          results.staffs.length
        );
    }
  }, [activeTab, results]);

  const tabs: Array<{ id: SearchTab; label: string; count: number; icon: React.ReactNode }> = [
    {
      id: 'all',
      label: 'Tất cả',
      count: results.orders.length + results.products.length + results.customers.length + results.categories.length + results.staffs.length,
      icon: <Compass className="w-4 h-4" />,
    },
    {
      id: 'orders',
      label: 'Đơn hàng',
      count: results.orders.length,
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      id: 'products',
      label: 'Sản phẩm',
      count: results.products.length,
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'customers',
      label: 'Khách hàng',
      count: results.customers.length,
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'categories',
      label: 'Danh mục',
      count: results.categories.length,
      icon: <FolderTree className="w-4 h-4" />,
    },
    {
      id: 'staffs',
      label: 'Nhân sự',
      count: results.staffs.length,
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tìm kiếm toàn hệ thống</h1>
        <p className="text-sm text-slate-500 mt-1">
          Tra cứu nhanh đơn hàng, sản phẩm, khách hàng, chuyên mục và nhân viên trên toàn hệ thống
        </p>
      </div>

      {/* Main Search Input Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập tên sản phẩm, mã đơn hàng (#ORD-...), tên khách, SĐT, danh mục..."
            className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              title="Xóa từ khóa"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-40 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-20 bg-slate-100 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : query.trim().length === 0 ? (
        /* Empty Query State */
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Nhập từ khóa để bắt đầu tìm kiếm</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Hệ thống hỗ trợ tìm kiếm đa điều kiện: Mã đơn, Tên khách hàng, SĐT, Tên sản phẩm, Danh mục...
          </p>
        </div>
      ) : currentTabCount === 0 ? (
        /* No Results Found for active tab */
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Không tìm thấy kết quả nào</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Không có kết quả nào trong mục <span className="font-semibold text-slate-700">{tabs.find((t) => t.id === activeTab)?.label}</span> khớp với từ khóa{' '}
            <span className="font-bold text-slate-700">"{query}"</span>. Vui lòng thử từ khóa khác.
          </p>
        </div>
      ) : (
        /* Results Content */
        <div className="space-y-6">
          {/* Orders Group */}
          {(activeTab === 'all' || activeTab === 'orders') && results.orders.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-800">Đơn hàng</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                    {results.orders.length} đơn
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={order.url}
                    className="p-4 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/40 transition-all group block"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-blue-600 group-hover:underline">
                        {highlightMatch(order.title, query)}
                      </span>
                      {order.badge && (
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${getBadgeStyle(
                            order.badgeType,
                          )}`}
                        >
                          {order.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {highlightMatch(order.subtitle || '', query)}
                    </div>
                    <div className="mt-3 flex items-center text-xs text-blue-600 font-semibold gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Xem chi tiết đơn</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Products Group */}
          {(activeTab === 'all' || activeTab === 'products') && results.products.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-800">Sản phẩm</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                    {results.products.length} sản phẩm
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.products.map((prod) => (
                  <Link
                    key={prod.id}
                    href={prod.url}
                    className="p-4 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all group flex items-start gap-3"
                  >
                    {prod.imageUrl ? (
                      <img
                        src={prod.imageUrl}
                        alt={prod.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-slate-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-emerald-600">
                          {highlightMatch(prod.title, query)}
                        </h4>
                        {prod.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium flex-shrink-0 ${getBadgeStyle(
                              prod.badgeType,
                            )}`}
                          >
                            {prod.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {highlightMatch(prod.subtitle || '', query)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Customers Group */}
          {(activeTab === 'all' || activeTab === 'customers') && results.customers.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-800">Khách hàng</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold">
                    {results.customers.length} khách
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.customers.map((cust) => (
                  <Link
                    key={cust.id}
                    href={cust.url}
                    className="p-4 rounded-xl border border-slate-100 hover:border-purple-300 hover:bg-purple-50/40 transition-all group flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                      {cust.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-purple-600">
                          {highlightMatch(cust.title, query)}
                        </h4>
                        {cust.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium flex-shrink-0 ${getBadgeStyle(
                              cust.badgeType,
                            )}`}
                          >
                            {cust.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {highlightMatch(cust.subtitle || '', query)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Categories Group */}
          {(activeTab === 'all' || activeTab === 'categories') && results.categories.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-800">Chuyên mục</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold">
                    {results.categories.length} danh mục
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={cat.url}
                    className="p-4 rounded-xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50/40 transition-all group flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                      <FolderTree className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-amber-600">
                        {highlightMatch(cat.title, query)}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {highlightMatch(cat.subtitle || '', query)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Staffs Group */}
          {(activeTab === 'all' || activeTab === 'staffs') && results.staffs.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-800">Nhân sự & Phân quyền</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold">
                    {results.staffs.length} tài khoản
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.staffs.map((staff) => (
                  <Link
                    key={staff.id}
                    href={staff.url}
                    className="p-4 rounded-xl border border-slate-100 hover:border-rose-300 hover:bg-rose-50/40 transition-all group flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                      {staff.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-rose-600">
                          {highlightMatch(staff.title, query)}
                        </h4>
                        {staff.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium flex-shrink-0 ${getBadgeStyle(
                              staff.badgeType,
                            )}`}
                          >
                            {staff.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {highlightMatch(staff.subtitle || '', query)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions (if available and matching) */}
          {activeTab === 'all' && results.actions && results.actions.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-800">Tác vụ & Điều hướng nhanh</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.actions.map((act) => (
                  <Link
                    key={act.id}
                    href={act.url}
                    className="p-4 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all group flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600">
                        {highlightMatch(act.title, query)}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {highlightMatch(act.subtitle || '', query)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchResultsPageClient;
