import { useState, useEffect } from "react";

/**
 * Custom hook debounce giá trị input để chống spam API
 * @param value Giá trị cần debounce
 * @param delay Thời gian trễ (mặc định 500ms)
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
