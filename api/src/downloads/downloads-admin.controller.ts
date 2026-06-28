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
import { Locale } from '@prisma/client';
import { DownloadsService } from './downloads.service';
import {
  CreateDownloadGroupDto,
  CreateDownloadItemDto,
  UpdateDownloadGroupDto,
  UpdateDownloadItemDto,
} from './dto/download.dto';

@Controller('admin/downloads')
@UseGuards(AuthGuard('jwt'))
export class DownloadsAdminController {
  constructor(private downloads: DownloadsService) {}

  @Get('groups')
  listGroups(@Query('locale') locale?: Locale) {
    return this.downloads.findGroupsAdmin(locale);
  }

  @Post('groups')
  createGroup(@Body() dto: CreateDownloadGroupDto) {
    return this.downloads.createGroup(dto);
  }

  @Patch('groups/:id')
  updateGroup(@Param('id') id: string, @Body() dto: UpdateDownloadGroupDto) {
    return this.downloads.updateGroup(id, dto);
  }

  @Delete('groups/:id')
  removeGroup(@Param('id') id: string) {
    return this.downloads.removeGroup(id);
  }

  @Post('items')
  createItem(@Body() dto: CreateDownloadItemDto) {
    return this.downloads.createItem(dto);
  }

  @Patch('items/:id')
  updateItem(@Param('id') id: string, @Body() dto: UpdateDownloadItemDto) {
    return this.downloads.updateItem(id, dto);
  }

  @Delete('items/:id')
  removeItem(@Param('id') id: string) {
    return this.downloads.removeItem(id);
  }
}
