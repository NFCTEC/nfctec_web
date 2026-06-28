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
import { Locale, PublishStatus } from '@prisma/client';
import { SolutionsService } from './solutions.service';
import { CreateSolutionDto, UpdateSolutionDto } from './dto/solution.dto';

@Controller('admin/solutions')
@UseGuards(AuthGuard('jwt'))
export class SolutionsAdminController {
  constructor(private solutions: SolutionsService) {}

  @Get()
  list(
    @Query('locale') locale?: Locale,
    @Query('status') status?: PublishStatus,
  ) {
    return this.solutions.findAllAdmin({ locale, status });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.solutions.findOneAdmin(id);
  }

  @Post()
  create(@Body() dto: CreateSolutionDto) {
    return this.solutions.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSolutionDto) {
    return this.solutions.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.solutions.remove(id);
  }
}
