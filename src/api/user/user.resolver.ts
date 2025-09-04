import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { User } from 'src/database/entities/user.entity';
import { CreateUserInput } from './inputs/create-user.input';
import { UpdateUserInput } from './inputs/update-user.input';
import { UserService } from './user.service';
import { AuthRequest } from 'src/common/decorators/auth-request';
import { BasicRequest } from 'src/common/decorators/basic-request';
import { OwnerService } from './service/create-owner.service';
import { SetEmailPassInput } from './inputs/email-password.input';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { UserD } from '../../common/decorators/user.decorator';
import { OwnerInput } from './inputs/create-owner.input';
import { OwnerSpaceInput } from '../../common/inputs/owner-space.input';
import { PaginationOptionsDto } from '../../common/dtos/pagination-options.dto';
import { UserOutput } from './outputs/user.output';
import { UpdateOwnerInput } from './inputs/update-owner.input';
import { SearchOptionsDto } from '../../common/dtos/search-options.dto';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly ownerService: OwnerService,
  ) {}

  @Query(() => UserOutput, { name: 'Users' })
  @AuthRequest({
    // roles: [UserRoleEnum.ADMIN],
  })
  findAll(
    @Args('paginationOptions') paginationOptions: PaginationOptionsDto,
    @Args('search', { nullable: true }) search?: SearchOptionsDto,
  ) {
    return this.userService.findAll(paginationOptions, search);
  }

  @Query(() => User!, { name: 'user' })
  @BasicRequest()
  findOne(@Args('id') id: string) {
    return this.userService.findOne(id);
  }

  @Query(() => UserOutput, { name: 'UserType' })
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER],
  })
  findRoles(
    @Args('role', { type: () => String }) roles: UserRoleEnum,
    @Args('paginationOptions') paginationOptions: PaginationOptionsDto,
    @Args('search', { nullable: true }) search?: SearchOptionsDto,
  ) {
    return this.userService.findByRoles(roles, paginationOptions, search);
  }

  @Query(() => UserOutput, { name: 'TenantsByOwner' })
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER],
  })
  findTenantsByOwner(
    @UserD() user: User,
    @Args('paginationOptions') paginationOptions: PaginationOptionsDto,
    @Args('OwnerSpace', { nullable: true }) ownerSpace?: OwnerSpaceInput,
    @Args('search', { nullable: true }) search?: SearchOptionsDto,
  ) {
    return this.userService.findTenantsByOwner(
      user,
      paginationOptions,
      ownerSpace,
      search,
    );
  }

  @Mutation(() => User)
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER],
  })
  registerTenant(
    @Args('registerTenantInput') bodyInput: CreateUserInput,
    @UserD() user: User,
  ) {
    return this.userService.create(bodyInput, user);
  }

  @Mutation(() => User)
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN],
  })
  registerOwner(@Args('registerOwnerInput') bodyInput: OwnerInput) {
    return this.ownerService.createOwner(bodyInput);
  }

  @Mutation(() => User)
  @AuthRequest()
  updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @UserD() user: User,
  ) {
    return this.userService.update(updateUserInput, user);
  }

  @Mutation(() => User)
  @AuthRequest()
  updateOwner(
    @Args('updateOwner') updateOwnerFields: UpdateOwnerInput,
    @UserD() user: User,
  ) {
    return this.userService.updateOwner(updateOwnerFields, user);
  }

  @Mutation(() => User)
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN],
  })
  updateOwnerById(
    @Args('updateOwnerByAdmin') updateOwnerFields: UpdateOwnerInput,
    @Args('idOwner') idOwner: string,
  ) {
    return this.userService.updateOwnerByAdmin(updateOwnerFields, idOwner);
  }

  @Mutation(() => User)
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN],
  })
  updateTenantById(
    @Args('updateTenantByAdmin') updateUserFields: UpdateUserInput,
    @Args('idOwner') idTenant: string,
  ) {
    return this.userService.updateTenantByAdmin(updateUserFields, idTenant);
  }

  @Mutation(() => User)
  @AuthRequest()
  setEmailPass(@Args('setEmailPass') body: SetEmailPassInput) {
    return this.userService.setEmailPass(body);
  }

  @Mutation(() => User)
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER],
  })
  deactiveActiveTenant(
    @Args('deactiveTenant') idTenant: string,
    @UserD() user: User,
  ) {
    return this.userService.deactivateActiveTenant(user, idTenant);
  }

  /*   @Mutation(() => User)
  @AuthRequest()
  removeUser(@Args('id', { type: () => String }) id: number) {
    return Either.makeRight(this.userService.remove(id));
  } */
}
