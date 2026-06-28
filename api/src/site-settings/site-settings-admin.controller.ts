import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SiteSettingsService } from './site-settings.service';
import { UpsertSiteSettingDto } from './dto/site-setting.dto';

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
}
