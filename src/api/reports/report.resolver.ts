import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthRequest } from '../../common/decorators/auth-request';
import { UserD } from '../../common/decorators/user.decorator';
import { UserRoleEnum } from '../../common/enums/user-role.enum';
import { Report } from '../../database/entities/report.entity';
import { User } from '../../database/entities/user.entity';
import { CreateReportInput } from './inputs/create-report.input';
import { ReportService } from './report.service';
import { OwnerSpaceInput } from '../../common/inputs/owner-space.input';
import { UpdateReportInput } from './inputs/update-report.input';
import { PaginationOptionsDto } from '../../common/dtos/pagination-options.dto';
import { ReportOutput } from './outputs/report.output';
import { SearchOptionsDto } from '../../common/dtos/search-options.dto';

@Resolver(() => Report)
export class ReportResolver {
  constructor(private readonly reportService: ReportService) {}

  @AuthRequest()
  @Mutation(() => Report)
  createReport(
    @UserD() user: User,
    @Args('createReportInput')
    createReportInput: CreateReportInput,
  ) {
    return this.reportService.create(user, createReportInput);
  }

  @AuthRequest()
  @Mutation(() => Report)
  updateReport(
    @UserD() user: User,
    @Args('updateReportInput')
    updateReportInput: UpdateReportInput,
  ) {
    return this.reportService.updateReport(user, updateReportInput);
  }

  @AuthRequest({
    roles: [UserRoleEnum.ADMIN],
  })
  @Query(() => ReportOutput, { name: 'getAllReports' })
  findAll(@Args('paginationOptions') paginationOptions: PaginationOptionsDto,
  @Args('search', { nullable: true }) search?: SearchOptionsDto) {
    return this.reportService.findAll(paginationOptions , search);
  }

  @AuthRequest({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER],
  })
  @Query(() => Report, { name: 'getReportById' })
  findReportById(@Args('idReport') idReport: string) {
    return this.reportService.findReportById(idReport);
  }

  @AuthRequest({
    roles: [UserRoleEnum.OWNER],
  })
  @Query(() => ReportOutput, { name: 'getReportByOwner' })
  findReportByOwner(
    @UserD() user: User,
    @Args('paginationOptions') paginationOptions: PaginationOptionsDto,
    @Args('OwnerSpace', { nullable: true }) ownerSpace?: OwnerSpaceInput,
    @Args('search', { nullable: true }) search?: SearchOptionsDto,
  ) {
    return this.reportService.findReportByOwner(
      user,
      paginationOptions,
      ownerSpace,
      search,
    );
  }

  @AuthRequest()
  @Query(() => ReportOutput, { name: 'getAllTenantReport' })
  findAllTenantReport(
    @UserD() user: User,
    @Args('paginationOptions') paginationOptions: PaginationOptionsDto,
    @Args('OwnerSpace', { nullable: true }) ownerSpace?: OwnerSpaceInput,
    @Args('search', { nullable: true }) search?: SearchOptionsDto,
  ) {
    return this.reportService.findAllTenantReport(
      user,
      paginationOptions,
      ownerSpace,
      search,
    );
  }
}
