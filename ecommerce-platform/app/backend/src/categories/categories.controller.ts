import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
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
}
