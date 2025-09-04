import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { ROLES_KEY } from 'src/common/decorators/can-access-roles.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { User } from 'src/database/entities/user.entity';

@Injectable()
export class RolesAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  public canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<UserRoleEnum[]>(
      ROLES_KEY,
      ctx.getHandler(),
    );

    if (!roles?.length) {
      return true;
    }

    const context = GqlExecutionContext.create(ctx);
    const user: User = context.getContext().req.user;

    const hasRole = () => roles.some((role) => user.role == role);

    return user && hasRole();
  }
}
