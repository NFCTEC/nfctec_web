import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Locale, ProductCategory, PublishStatus } from '@prisma/client';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Controller('admin/products')
@UseGuards(AuthGuard('jwt'))
export class ProductsAdminController {
  constructor(private products: ProductsService) {}

  @Get()
  list(
    @Query('locale') locale?: Locale,
    @Query('status') status?: PublishStatus,
    @Query('category') category?: ProductCategory,
  ) {
    return this.products.findAllAdmin({ locale, status, category });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.products.findOneAdmin(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.products.remove(id);
  }
}
