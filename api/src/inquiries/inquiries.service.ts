import { Injectable, NotFoundException } from '@nestjs/common';
import { InquiryStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateInquiryDto } from './dto/inquiry.dto';

@Injectable()
export class InquiriesService {
  constructor(private prisma: PrismaService) {}

  findAllAdmin(status?: InquiryStatus) {
    return this.prisma.inquiry.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateInquiryDto) {
    if (!(await this.prisma.inquiry.count({ where: { id } }))) {
      throw new NotFoundException('Inquiry not found');
    }
    return this.prisma.inquiry.update({ where: { id }, data: dto });
  }

  countNew() {
    return this.prisma.inquiry.count({ where: { status: InquiryStatus.new } });
  }
}
