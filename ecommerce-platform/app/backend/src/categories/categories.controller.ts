import { Controller, Get, Param, Query, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { GetCategoriesDto } from './dto/get-categories.dto';
import { CategoriesResponse } from './interfaces/category-response.interface';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() dto: GetCategoriesDto): Promise<CategoriesResponse> {
    return this.categoriesService.findAll(dto);
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findBySlug(@Param('slug') slug: string) {
    const category = await this.categoriesService.findBySlug(slug);
    if (!category) {
      throw new NotFoundException(`Không tìm thấy chuyên mục với slug '${slug}'`);
    }
    return {
      statusCode: 200,
      message: 'Lấy thông tin chuyên mục thành công',
      data: category,
    };
  }
}
