export interface GlobalSearchResultItem {
  id: string | number;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeType?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  imageUrl?: string;
  url: string;
  type: 'order' | 'product' | 'customer' | 'category' | 'staff' | 'action';
}

export interface AdminGlobalSearchResponse {
  statusCode: number;
  data: {
    orders: GlobalSearchResultItem[];
    products: GlobalSearchResultItem[];
    customers: GlobalSearchResultItem[];
    categories: GlobalSearchResultItem[];
    staffs: GlobalSearchResultItem[];
    actions: GlobalSearchResultItem[];
    totalResults: number;
  };
}
