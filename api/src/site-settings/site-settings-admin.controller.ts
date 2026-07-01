import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Locale } from '@prisma/client';
import { SiteSettingsService } from './site-settings.service';
import { UpsertSiteSettingDto } from './dto/site-setting.dto';
import { UpsertDisplayConfigDto } from './dto/display-config.dto';

@Controller('admin/site-settings')
@UseGuards(AuthGuard('jwt'))
export class SiteSettingsAdminController {
  constructor(private settings: SiteSettingsService) {}

  @Get()
  list() {
    return this.settings.findAllAdmin();
  }

  @Put()
  upsert(@Body() dto: UpsertSiteSettingDto) {
    return this.settings.upsert(dto);
  }

  @Get('display-config')
  getDisplayConfig(@Query('locale') locale: Locale = Locale.en) {
    return this.settings.getDisplayConfig(locale);
  }

  @Put('display-config')
  upsertDisplayConfig(@Body() dto: UpsertDisplayConfigDto) {
    return this.settings.upsertDisplayConfig(dto.locale, dto.config as never);
  }
}
