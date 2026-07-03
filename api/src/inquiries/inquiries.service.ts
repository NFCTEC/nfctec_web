import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InquiryStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from '../public/dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/inquiry.dto';

@Injectable()
export class InquiriesService {
  private readonly logger = new Logger(InquiriesService.name);

  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async createFromWebsite(dto: CreateInquiryDto) {
    const inquiry = await this.prisma.inquiry.create({ data: dto });
    const sent = await this.mail.sendInquiryNotification(dto);
    if (!sent) {
      this.logger.warn(`Inquiry ${inquiry.id} saved but notification email was not sent`);
    }
    return inquiry;
  }

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
