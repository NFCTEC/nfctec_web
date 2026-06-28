import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminRole } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateAdminUserDto, UpdateAdminUserDto } from './dto/admin-user.dto';
import { Roles } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@Controller('admin/users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(AdminRole.super_admin)
export class UsersAdminController {
  constructor(private users: UsersService) {}

  @Get()
  list() {
    return this.users.findAll();
  }

  @Post()
  create(@Body() dto: CreateAdminUserDto) {
    return this.users.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdminUserDto) {
    return this.users.update(id, dto);
  }
}
