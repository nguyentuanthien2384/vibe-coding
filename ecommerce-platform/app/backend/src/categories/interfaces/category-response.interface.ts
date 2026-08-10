export interface CategoryResponseItem {
  id: number;
  name: string;
  slug: string;
  iconUrl: string | null;
  position: number;
  children: CategoryResponseItem[];
}

export interface CategoriesResponse {
  statusCode: number;
  message: string;
  data: CategoryResponseItem[];
}
