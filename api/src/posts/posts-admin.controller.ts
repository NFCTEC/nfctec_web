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
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

@Controller('admin/posts')
@UseGuards(AuthGuard('jwt'))
export class PostsAdminController {
  constructor(private posts: PostsService) {}

  @Get()
  list(
    @Query('locale') locale?: Locale,
    @Query('status') status?: PublishStatus,
  ) {
    return this.posts.findAllAdmin({ locale, status });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.posts.findOneAdmin(id);
  }

  @Post()
  create(@Body() dto: CreatePostDto) {
    return this.posts.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.posts.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.posts.remove(id);
  }
}
