import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TermCondition } from 'src/database/entities/terms-conditions.entity';
import { TermsConditionsService } from './terms-conditions.service';
import { CreateTermConditionInput } from './inputs/terms-conditions.input';
import { AuthRequest } from 'src/common/decorators/auth-request';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { BasicRequest } from 'src/common/decorators/basic-request';

@Resolver(() => TermCondition)
export class TermsConditionsResolver {
  constructor(
    private readonly termsConditionsService: TermsConditionsService,
  ) {}

  @AuthRequest({
    roles: [UserRoleEnum.ADMIN],
  })
  @Mutation(() => TermCondition)
  createTermCondition(
    @Args('createTermCondition') body: CreateTermConditionInput,
  ) {
    return this.termsConditionsService.createTerm(body);
  }

  @BasicRequest()
  @Query(() => [TermCondition], { name: 'getTerms' })
  findTerms(@Args('getTerms') idTerms: string) {
    return this.termsConditionsService.findTerms(idTerms);
  }
}
