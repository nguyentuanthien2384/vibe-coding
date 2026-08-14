import { BannerCategory, BannerPosition, BannerType } from '@prisma/client';

export interface BannerResponseItem {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  category?: BannerCategory;
  bannerPosition?: BannerPosition;
  type: BannerType;
  position: number;
  order?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BannersResponse {
  statusCode: number;
  message: string;
  data: BannerResponseItem[];
}

export interface AdminBannerMutateResponse {
  statusCode: number;
  message: string;
  data: BannerResponseItem;
}
