import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SeoSocialSettingsDto {
  @IsString()
  @MaxLength(120, { message: 'Meta Title không nên vượt quá 120 ký tự' })
  @IsNotEmpty({ message: 'Meta Title không được để trống' })
  metaTitle: string;

  @IsString()
  @MaxLength(300, { message: 'Meta Description không nên vượt quá 300 ký tự' })
  @IsNotEmpty({ message: 'Meta Description không được để trống' })
  metaDescription: string;

  @IsString()
  metaKeywords: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  metaRobots?: string;

  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDescription?: string;

  @IsOptional()
  @IsString()
  ogImageUrl?: string;

  @IsOptional()
  @IsString()
  ogType?: string;

  @IsOptional()
  @IsString()
  twitterCard?: string;

  @IsOptional()
  @IsString()
  twitterSite?: string;

  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @IsOptional()
  @IsString()
  zaloUrl?: string;

  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @IsOptional()
  @IsString()
  tiktokUrl?: string;

  @IsOptional()
  @IsString()
  youtubeUrl?: string;

  @IsOptional()
  @IsString()
  googleSiteVerification?: string;

  @IsOptional()
  @IsString()
  googleAnalyticsId?: string;

  @IsOptional()
  @IsString()
  customHeadScript?: string;

  @IsOptional()
  @IsString()
  customBodyScript?: string;
}
