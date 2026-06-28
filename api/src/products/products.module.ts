import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsAdminController } from './products-admin.controller';

@Module({
  controllers: [ProductsAdminController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
