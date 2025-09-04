import { Args, Query, Resolver } from '@nestjs/graphql';
import { Font } from 'src/database/entities/fonts.entity';
import { FontService } from './font.service';
import { AuthRequest } from 'src/common/decorators/auth-request';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';

@Resolver(() => Font)
export class FontResolver {
  constructor(private readonly fontService: FontService) {}

  @Query(() => [Font!], { name: 'FontsList' })
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER],
  })
  findAll() {
    return this.fontService.findAll();
  }

  @Query(() => Font!, { name: 'FontById' })
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER],
  })
  findFontById(@Args('id') idFont: string) {
    return this.fontService.findFontById(idFont);
  }
}
