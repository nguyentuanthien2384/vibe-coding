export interface SearchSuggestItem {
  id: number;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  originalPrice: number | null;
}

export interface SearchSuggestData {
  query: string;
  totalFound: number;
  items: SearchSuggestItem[];
}

export interface SearchSuggestResponse {
  statusCode: number;
  message: string;
  data: SearchSuggestData;
}
