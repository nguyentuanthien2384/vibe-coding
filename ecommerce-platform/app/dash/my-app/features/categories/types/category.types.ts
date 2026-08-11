export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  parentId: string | null;
  parentName: string | null;
  status: CategoryStatus;
  productCount: number;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  iconUrl: string;
  parentId: string | null;
  status: CategoryStatus;
}
