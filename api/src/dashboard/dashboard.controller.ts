import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PublishStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { InquiriesService } from '../inquiries/inquiries.service';

@Controller('admin/dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(
    private prisma: PrismaService,
    private inquiries: InquiriesService,
  ) {}

  @Get('stats')
  async stats() {
    const [posts, solutions, products, newInquiries] = await Promise.all([
      this.prisma.post.count({ where: { status: PublishStatus.published } }),
      this.prisma.solution.count({ where: { status: PublishStatus.published } }),
      this.prisma.product.count({ where: { status: PublishStatus.published } }),
      this.inquiries.countNew(),
    ]);
    return { posts, solutions, products, newInquiries };
  }
}
