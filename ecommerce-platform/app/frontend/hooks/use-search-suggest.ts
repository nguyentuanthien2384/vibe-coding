import { useState, useEffect } from "react";
import { SearchSuggestItemData } from "../types/search.types";
import { fetchSearchSuggest } from "../lib/search";

/**
 * Custom hook gọi API Search Suggest thực tế từ NestJS Backend với AbortController
 */
export function useSearchSuggest(debouncedQuery: string, limit = 5) {
  const [items, setItems] = useState<SearchSuggestItemData[]>([]);
  const [totalFound, setTotalFound] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) {
      setItems([]);
      setTotalFound(0);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setIsError(false);

    fetchSearchSuggest(trimmed, limit, controller.signal)
      .then((res) => {
        if (res?.data) {
          setItems(res.data.items || []);
          setTotalFound(res.data.totalFound || 0);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Search suggest fetch error:", err);
          setIsError(true);
          setItems([]);
          setTotalFound(0);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery, limit]);

  return { items, totalFound, isLoading, isError };
}
