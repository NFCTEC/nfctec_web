import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AdminUser } from '@prisma/client';

export type AuthUser = Pick<AdminUser, 'id' | 'email' | 'role' | 'name'>;

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
