// types/search.types.ts

/** Một sản phẩm gợi ý trả về từ API / Search Suggest */
export interface SearchSuggestItemData {
  id: string | number;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  originalPrice?: number | null;
}

/** Response từ API GET /api/v1/products/search-suggest */
export interface SearchSuggestApiResponse {
  statusCode: number;
  message: string;
  data: {
    items: SearchSuggestItemData[];
    totalFound: number;
    query: string;
  };
}

/** Props cho SearchInput (Dumb Component) */
export interface SearchInputProps {
  value: string;
  placeholder?: string;
  isLoading?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  onClear: () => void;
  className?: string;
}

/** Props cho SearchSuggestDropdown (Dumb Component) */
export interface SearchSuggestDropdownProps {
  items: SearchSuggestItemData[];
  isLoading: boolean;
  isError?: boolean;
  query: string;
  totalFound: number;
  onSelectItem: (slug: string) => void;
  onViewAll: (query: string) => void;
}

/** Props cho SearchSuggestItem (Dumb Component) */
export interface SearchSuggestItemProps {
  item: SearchSuggestItemData;
  query: string;
  onClick: () => void;
}
