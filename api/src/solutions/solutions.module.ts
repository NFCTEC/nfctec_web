import { Module } from '@nestjs/common';
import { SolutionsService } from './solutions.service';
import { SolutionsAdminController } from './solutions-admin.controller';

@Module({
  controllers: [SolutionsAdminController],
  providers: [SolutionsService],
  exports: [SolutionsService],
})
export class SolutionsModule {}
