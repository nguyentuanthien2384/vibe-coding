import { BannerType } from '@prisma/client';

export interface BannerResponseItem {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  type: BannerType;
  position: number;
}

export interface BannersResponse {
  statusCode: number;
  message: string;
  data: BannerResponseItem[];
}
