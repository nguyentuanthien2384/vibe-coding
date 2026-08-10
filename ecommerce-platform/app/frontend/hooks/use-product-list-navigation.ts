'use client';

// hooks/use-product-list-navigation.ts
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useProductListNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilters = useCallback(
    (updates: Record<string, string | number | boolean | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      let nextPathname = pathname;

      if ('category' in updates) {
        const cat = updates.category;
        if (cat && cat !== 'all') {
          nextPathname = `/categories/${cat}`;
        } else {
          nextPathname = '/products';
        }
        delete updates.category;
        params.delete('category');
      }

      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === '' ||
          value === 'all' ||
          value === false
        ) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      // Reset page to 1 when filters change (unless page is specifically updated)
      if (!('page' in updates)) {
        params.delete('page');
      }

      const queryString = params.toString();
      const targetUrl = queryString ? `${nextPathname}?${queryString}` : nextPathname;
      router.push(targetUrl, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const resetAllFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  return {
    searchParams,
    updateFilters,
    resetAllFilters,
  };
}
