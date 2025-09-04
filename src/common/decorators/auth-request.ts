import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/api/auth/jwt-auth.guard';
import { RolesAuthGuard } from 'src/api/auth/roles.guard';
import { UserRoleEnum } from '../enums/user-role.enum';
import { BasicRequest } from './basic-request';
import { CanAccessRoles } from './can-access-roles.decorator';

export interface AuthRequestI {
  roles?: UserRoleEnum[];
}

export function AuthRequest({ roles }: AuthRequestI = {}) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesAuthGuard),
    CanAccessRoles(roles || []),
    BasicRequest(),
  );
}
