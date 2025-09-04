import { SetMetadata } from '@nestjs/common';

import { UserRoleEnum } from '../enums/user-role.enum';

export const ROLES_KEY = 'roles';

export const CanAccessRoles = (roles: UserRoleEnum[]) =>
  SetMetadata(ROLES_KEY, roles);
