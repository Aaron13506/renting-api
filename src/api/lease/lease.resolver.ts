import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Lease } from 'src/database/entities/lease.entity';
import { CreateLeaseService } from './service/create-lease.service';
import { CreateLeaseInput } from './inputs/create-lease.input';
import { LeaseService } from './lease.service';
import { AuthRequest } from 'src/common/decorators/auth-request';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { User } from 'src/database/entities/user.entity';
import { UserD } from 'src/common/decorators/user.decorator';
import { UpdateLeaseInput } from './inputs/update-lease.input';
import { OwnerSpaceInput } from '../../common/inputs/owner-space.input';
import { PaginationOptionsDto } from '../../common/dtos/pagination-options.dto';
import { LeaseOutput } from './outputs/lease.output';
import { SearchOptionsDto } from '../../common/dtos/search-options.dto';

@Resolver(() => Lease)
export class LeaseResolver {
  constructor(
    private readonly createLeaseService: CreateLeaseService,
    private readonly leaseService: LeaseService,
  ) {}

  @Query(() => LeaseOutput, { name: 'Leases' })
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN],
  })
  findAll(
    @Args('paginationOptions') paginationOptions: PaginationOptionsDto,
    @Args('search', { nullable: true }) search?: SearchOptionsDto,
  ) {
    return this.leaseService.findAll(paginationOptions, search);
  }

  @Query(() => Lease!, { name: 'leaseById' })
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER],
  })
  findOneById(@Args('id') id: string) {
    return this.leaseService.findLeaseById(id);
  }

  @Query(() => LeaseOutput, { name: 'leasesByOwnerId' })
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN],
  })
  findByOwnerId(
    @Args('id') idOwner: string,
    @Args('paginationOptions') paginationOptions: PaginationOptionsDto,
    @Args('search', { nullable: true }) search?: SearchOptionsDto,
  ) {
    return this.leaseService.findLeasesByOwnerId(
      idOwner,
      paginationOptions,
      search,
    );
  }

  @Query(() => LeaseOutput, { name: 'leasesByTenantId' })
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN],
  })
  findByTenantId(
    @Args('id') idTenant: string,
    @Args('paginationOptions') paginationOptions: PaginationOptionsDto,
    @Args('search', { nullable: true }) search?: SearchOptionsDto,
  ) {
    return this.leaseService.findLeasesByTenantId(
      idTenant,
      paginationOptions,
      search,
    );
  }

  @Query(() => LeaseOutput, { name: 'leasesByOwner' })
  @AuthRequest()
  findByOwner(
    @UserD() user: User,
    @Args('paginationOptions') paginationOptions: PaginationOptionsDto,
    @Args('search', { nullable: true }) search?: SearchOptionsDto,
    @Args('ownerSpace', { nullable: true }) ownerSpace?: OwnerSpaceInput,
  ) {
    return this.leaseService.findLeasesByOwner(
      user,
      paginationOptions,
      search,
      ownerSpace,
    );
  }

  @Query(() => LeaseOutput, { name: 'leasesByTenant' })
  @AuthRequest()
  findByTenant(
    @UserD() user: User,
    @Args('paginationOptions') paginationOptions: PaginationOptionsDto,
    @Args('search', { nullable: true }) search?: SearchOptionsDto,
    @Args('ownerSpace', { nullable: true }) ownerSpace?: OwnerSpaceInput,
  ) {
    return this.leaseService.findLeasesByTenant(
      user,
      paginationOptions,
      search,
      ownerSpace,
    );
  }

  @Query(() => LeaseOutput, { name: 'leasesByOwnerTenantsId' })
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER],
  })
  findByOwnerTenantId(
    @Args('id') idTenant: string,
    @UserD() user: User,
    @Args('paginationOptions') paginationOptions: PaginationOptionsDto,
    @Args('search', { nullable: true }) search?: SearchOptionsDto,
  ) {
    return this.leaseService.findLeasesByOwnerAndTenantId(
      idTenant,
      user,
      paginationOptions,
      search,
    );
  }

  @Query(() => LeaseOutput, { name: 'tenantsByOwnerProperties' })
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER],
  })
  findTenantsByOwnerProperties(
    @UserD() user: User,
    @Args('paginationOptions') paginationOptions: PaginationOptionsDto,
    @Args('search', { nullable: true }) search?: SearchOptionsDto,
  ) {
    return this.leaseService.findTenantsByOwnerProperties(
      user,
      paginationOptions,
      search,
    );
  }

  @Mutation(() => Lease)
  @AuthRequest()
  registerLease(
    @Args('registerLeaseInput') body: CreateLeaseInput,
    @UserD() user: User,
  ) {
    return this.createLeaseService.createLease(body, user);
  }

  @Mutation(() => Lease)
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER],
  })
  updateLease(
    @Args('updateLease') updateFields: UpdateLeaseInput,
    @UserD() user: User,
  ) {
    return this.createLeaseService.updateLease(updateFields, user);
  }

  @Mutation(() => Lease)
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER],
  })
  deactivateLease(
    @Args('deactivateLease') idLease: string,
    @UserD() user: User,
  ) {
    return this.leaseService.deactivateActiveLease(user, idLease);
  }
}
