export type GlobalSearchItemType =
  | 'order'
  | 'product'
  | 'customer'
  | 'category'
  | 'staff'
  | 'action';

export type GlobalSearchBadgeType = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface GlobalSearchResultItem {
  id: string | number;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeType?: GlobalSearchBadgeType;
  imageUrl?: string;
  url: string;
  type: GlobalSearchItemType;
}

export interface AdminGlobalSearchData {
  orders: GlobalSearchResultItem[];
  products: GlobalSearchResultItem[];
  customers: GlobalSearchResultItem[];
  categories: GlobalSearchResultItem[];
  staffs: GlobalSearchResultItem[];
  actions: GlobalSearchResultItem[];
  totalResults: number;
}

export interface AdminGlobalSearchResponse {
  statusCode: number;
  data: AdminGlobalSearchData;
}

export interface RecentSearchItem {
  id: string | number;
  title: string;
  subtitle?: string;
  url: string;
  type: GlobalSearchItemType;
  timestamp: number;
}
