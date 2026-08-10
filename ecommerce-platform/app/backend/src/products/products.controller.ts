import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { GetFeaturedProductsDto } from './dto/get-featured-products.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { SearchSuggestQueryDto } from './dto/search-suggest-query.dto';
import {
  FeaturedProductsResponse,
  FilterMetaResponse,
  ProductDetailResponse,
  ProductListResponse,
  RelatedProductsResponse,
} from './interfaces/product-response.interface';
import { SearchSuggestResponse } from './interfaces/search-suggest-response.interface';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * GET /api/v1/products/search-suggest?q=bắp&limit=5
   * Must be declared BEFORE /:slug to avoid param collision.
   */
  @Get('search-suggest')
  @HttpCode(HttpStatus.OK)
  getSearchSuggest(
    @Query() dto: SearchSuggestQueryDto,
  ): Promise<SearchSuggestResponse> {
    return this.productsService.getSearchSuggestions(dto);
  }

  /**
   * GET /api/v1/products/filter-meta
   * Must be declared BEFORE /:slug to avoid param collision.
   */
  @Get('filter-meta')
  @HttpCode(HttpStatus.OK)
  getFilterMeta(): Promise<FilterMetaResponse> {
    return this.productsService.findFilterMeta();
  }

  /**
   * GET /api/v1/products/featured
   */
  @Get('featured')
  @HttpCode(HttpStatus.OK)
  findFeatured(
    @Query() dto: GetFeaturedProductsDto,
  ): Promise<FeaturedProductsResponse> {
    return this.productsService.findFeatured(dto);
  }

  /**
   * GET /api/v1/products?page=1&limit=12&categoryId=1&minPrice=0&maxPrice=100000&search=gà&sortBy=price&sortOrder=asc
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() dto: GetProductsDto): Promise<ProductListResponse> {
    return this.productsService.findAll(dto);
  }

  /**
   * GET /api/v1/products/:slug/related
   * Must be declared BEFORE /:slug to avoid param collision.
   */
  @Get(':slug/related')
  @HttpCode(HttpStatus.OK)
  findRelated(
    @Param('slug') slug: string,
    @Query('limit') limit?: number,
  ): Promise<RelatedProductsResponse> {
    return this.productsService.findRelatedProducts(slug, limit ? Number(limit) : 4);
  }

  /**
   * GET /api/v1/products/:slug
   */
  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  findBySlug(@Param('slug') slug: string): Promise<ProductDetailResponse> {
    return this.productsService.findBySlug(slug);
  }
}

