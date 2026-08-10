import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { BannersService } from './banners.service';
import { GetBannersDto } from './dto/get-banners.dto';
import { BannersResponse } from './interfaces/banner-response.interface';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() dto: GetBannersDto): Promise<BannersResponse> {
    return this.bannersService.findAll(dto);
  }
}
