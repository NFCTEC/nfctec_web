import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMediaDto } from './dto/media.dto';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createFromUpload(file: Express.Multer.File, publicBaseUrl: string) {
    const url = `${publicBaseUrl}/uploads/${file.filename}`;
    return this.prisma.media.create({
      data: {
        filename: file.originalname,
        url,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      },
    });
  }

  async update(id: string, dto: UpdateMediaDto) {
    await this.ensureExists(id);
    return this.prisma.media.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.media.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    if (!(await this.prisma.media.count({ where: { id } }))) {
      throw new NotFoundException('Media not found');
    }
  }
}
