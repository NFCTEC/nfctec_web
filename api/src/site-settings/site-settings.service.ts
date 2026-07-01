import { Injectable } from '@nestjs/common';
import { Locale, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertSiteSettingDto } from './dto/site-setting.dto';
import {
  DISPLAY_CONFIG_KEY,
  DEFAULT_DISPLAY_CONFIG,
  mergeDisplayConfig,
  type SiteDisplayConfig,
} from './display-config';

@Injectable()
export class SiteSettingsService {
  constructor(private prisma: PrismaService) {}

  findAllAdmin() {
    return this.prisma.siteSetting.findMany({ orderBy: [{ key: 'asc' }, { locale: 'asc' }] });
  }

  async upsert(dto: UpsertSiteSettingDto) {
    const locale = dto.locale ?? null;
    const existing = await this.prisma.siteSetting.findFirst({
      where: { key: dto.key, locale },
    });
    if (existing) {
      return this.prisma.siteSetting.update({
        where: { id: existing.id },
        data: { value: dto.value as Prisma.InputJsonValue },
      });
    }
    return this.prisma.siteSetting.create({
      data: {
        key: dto.key,
        locale,
        value: dto.value as Prisma.InputJsonValue,
      },
    });
  }

  findPublic(locale?: Locale) {
    return this.prisma.siteSetting.findMany({
      where: {
        OR: [{ locale }, { locale: null }],
      },
    });
  }

  async getDisplayConfig(locale: Locale): Promise<SiteDisplayConfig> {
    const row = await this.prisma.siteSetting.findFirst({
      where: { key: DISPLAY_CONFIG_KEY, locale },
    });
    if (!row) return structuredClone(DEFAULT_DISPLAY_CONFIG);
    return mergeDisplayConfig(row.value);
  }

  async upsertDisplayConfig(locale: Locale, config: SiteDisplayConfig) {
    const merged = mergeDisplayConfig(config);
    const existing = await this.prisma.siteSetting.findFirst({
      where: { key: DISPLAY_CONFIG_KEY, locale },
    });
    if (existing) {
      return this.prisma.siteSetting.update({
        where: { id: existing.id },
        data: { value: merged as Prisma.InputJsonValue },
      });
    }
    return this.prisma.siteSetting.create({
      data: {
        key: DISPLAY_CONFIG_KEY,
        locale,
        value: merged as Prisma.InputJsonValue,
      },
    });
  }
}
