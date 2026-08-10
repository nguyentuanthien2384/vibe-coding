"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "../../hooks/use-debounce";
import { useSearchSuggest } from "../../hooks/use-search-suggest";
import { SearchInput } from "./search-input";
import { SearchSuggestDropdown } from "./search-suggest-dropdown";

interface SearchBarProps {
  className?: string;
  onNavigate?: () => void;
}

export const SearchBar = ({ className = "", onNavigate }: SearchBarProps) => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 500);

  // Hook gọi API thực tế từ NestJS backend
  const { items, totalFound, isLoading, isError } = useSearchSuggest(debouncedQuery, 5);

  // Trạng thái loading khi gõ (trước khi 500ms debounce hoàn tất)
  const isTypingOrLoading = isLoading || (searchQuery.trim().length >= 2 && searchQuery !== debouncedQuery);

  // Đóng dropdown khi click ra ngoài hoặc bấm Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelectProduct = (slug: string) => {
    setIsDropdownOpen(false);
    if (onNavigate) onNavigate();
    router.push(`/products/${slug}`);
  };

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    setIsDropdownOpen(false);
    if (onNavigate) onNavigate();
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  const handleClear = () => {
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const shouldShowDropdown = isDropdownOpen && searchQuery.trim().length >= 2;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <SearchInput
        value={searchQuery}
        isLoading={isTypingOrLoading}
        onFocus={() => setIsDropdownOpen(true)}
        onChange={(val) => {
          setSearchQuery(val);
          if (!isDropdownOpen) setIsDropdownOpen(true);
        }}
        onSubmit={handleSearchSubmit}
        onClear={handleClear}
      />

      {shouldShowDropdown && (
        <SearchSuggestDropdown
          items={items}
          isLoading={isTypingOrLoading}
          isError={isError}
          query={debouncedQuery || searchQuery}
          totalFound={totalFound}
          onSelectItem={handleSelectProduct}
          onViewAll={handleSearchSubmit}
        />
      )}
    </div>
  );
};
