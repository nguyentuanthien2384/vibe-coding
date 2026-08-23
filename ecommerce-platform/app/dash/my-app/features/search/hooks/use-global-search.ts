'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import {
  AdminGlobalSearchData,
  GlobalSearchResultItem,
  RecentSearchItem,
} from '../types/global-search.types';
import { searchGlobalAdmin } from '../api/global-search-api';

const RECENT_SEARCHES_KEY = 'dash_admin_recent_searches';
const MAX_RECENT_SEARCHES = 6;

export function useGlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);

  const [results, setResults] = useState<AdminGlobalSearchData>({
    orders: [],
    products: [],
    customers: [],
    categories: [],
    staffs: [],
    actions: [],
    totalResults: 0,
  });

  const debouncedQuery = useDebounce(query, 300);

  // 1. Tải danh sách tìm kiếm gần đây từ localStorage & chuẩn hóa URL chi tiết
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed: RecentSearchItem[] = JSON.parse(stored);
        const sanitized = parsed.map((item) => {
          if (item.type === 'product' && (item.url === '/products' || !item.url.includes('/edit')) && item.id) {
            return { ...item, url: `/products/${item.id}/edit` };
          }
          if (item.type === 'staff' && item.url === '/staffs' && item.id) {
            return { ...item, url: `/staffs/${item.id}` };
          }
          return item;
        });
        setRecentSearches(sanitized);
      }
    } catch {
      // Bỏ qua lỗi parse JSON
    }
  }, []);

  // 2. Lưu tìm kiếm gần đây
  const addRecentSearch = useCallback((item: GlobalSearchResultItem) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((r) => r.id !== item.id || r.type !== item.type);
      const next: RecentSearchItem[] = [
        {
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          url: item.url,
          type: item.type,
          timestamp: Date.now(),
        },
        ...filtered,
      ].slice(0, MAX_RECENT_SEARCHES);

      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {
        // Bỏ qua lỗi storage
      }
      return next;
    });
  }, []);

  const removeRecentSearch = useCallback((id: string | number, type: string) => {
    setRecentSearches((prev) => {
      const next = prev.filter((r) => !(r.id === id && r.type === type));
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {
        // Bỏ qua
      }
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Bỏ qua
    }
  }, []);

  // 3. Mở/đóng modal
  const openSearch = useCallback(() => {
    setIsOpen(true);
    setSelectedIndex(0);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const toggleSearch = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // 4. Lắng nghe phím tắt toàn hệ thống Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 5. Gọi API khi debouncedQuery thay đổi
  useEffect(() => {
    let isCancelled = false;

    async function executeSearch() {
      if (!debouncedQuery.trim()) {
        setIsLoading(false);
        setError(null);
        setResults({
          orders: [],
          products: [],
          customers: [],
          categories: [],
          staffs: [],
          actions: [],
          totalResults: 0,
        });
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await searchGlobalAdmin(debouncedQuery, 5);
        if (!isCancelled) {
          setResults(data);
          setSelectedIndex(0);
        }
      } catch (err) {
        if (!isCancelled) {
          setError('Không thể lấy kết quả tìm kiếm. Vui lòng thử lại sau.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    executeSearch();

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

  // 6. Danh sách phẳng để phục vụ phím mũi tên Lên/Xuống
  const flatItems = useMemo<GlobalSearchResultItem[]>(() => {
    if (!debouncedQuery.trim()) {
      // Khi ô tìm kiếm rỗng, gom các recent searches và static actions
      const recentAsItems: GlobalSearchResultItem[] = recentSearches.map((r) => ({
        id: r.id,
        title: r.title,
        subtitle: r.subtitle,
        url: r.url,
        type: r.type,
      }));
      return recentAsItems;
    }

    return [
      ...results.orders,
      ...results.products,
      ...results.customers,
      ...results.categories,
      ...results.staffs,
      ...results.actions,
    ];
  }, [debouncedQuery, results, recentSearches]);

  // 7. Xử lý điều hướng khi chọn một item
  const handleSelectItem = useCallback(
    (item: GlobalSearchResultItem) => {
      addRecentSearch(item);
      closeSearch();
      router.push(item.url);
    },
    [addRecentSearch, closeSearch, router],
  );

  // 8. Bắt phím điều hướng bên trong Modal (ArrowUp, ArrowDown, Enter, Escape)
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSearch();
        return;
      }

      if (flatItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flatItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = flatItems[selectedIndex];
        if (selected) {
          handleSelectItem(selected);
        }
      }
    },
    [flatItems, selectedIndex, closeSearch, handleSelectItem],
  );

  return {
    isOpen,
    openSearch,
    closeSearch,
    toggleSearch,
    query,
    setQuery,
    debouncedQuery,
    isLoading,
    error,
    results,
    flatItems,
    selectedIndex,
    setSelectedIndex,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    handleSelectItem,
    handleInputKeyDown,
  };
}
