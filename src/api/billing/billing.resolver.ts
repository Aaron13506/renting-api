import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthRequest } from '../../common/decorators/auth-request';
import { UserD } from '../../common/decorators/user.decorator';
import { UserRoleEnum } from '../../common/enums/user-role.enum';
import { Billing } from '../../database/entities/billing.entity';
import { User } from '../../database/entities/user.entity';
import { BillingService } from './billing.service';
import { UpdateBillingStatusInput } from './inputs/update-billing-status.input';
import { UpdateBillingStatusService } from './service/update-billing-status.service';
import { PaginationOptionsDto } from '../../common/dtos/pagination-options.dto';
import { GetBillingOutput } from './outputs/get-billing.output';
import { GetBillingByLeaseOutput } from './outputs/billing-by-lease.output';
import { BasicRequest } from '../../common/decorators/basic-request';
import { CalculateNextPaymentService } from './service/calculate-next-payment.service';
import { SearchOptionsDto } from '../../common/dtos/search-options.dto';
import { paymentReceiptInput } from './inputs/billing-payment-receipt.input';
import { checkPaymentReceiptInput } from './inputs/check-payment-receipt.input';

@Resolver(() => Billing)
export class BillingResolver {
  constructor(
    private readonly billingService: BillingService,
    private readonly updateBillingStatusService: UpdateBillingStatusService,
    private readonly calculateNextPaymentService: CalculateNextPaymentService,
  ) {}

  @AuthRequest()
  @Query(() => GetBillingOutput, { name: 'getBillings' })
  findBilling(
    @UserD() user: User,
    @Args('paginationOptions') pageOptionsDto: PaginationOptionsDto,
    @Args('search', { nullable: true }) search?: SearchOptionsDto,
  ) {
    return this.billingService.findBilling(user, pageOptionsDto, search);
  }

  @BasicRequest()
  @Query(() => GetBillingByLeaseOutput, { name: 'getBillingsByLease' })
  findBillingByLease(
    @Args('leaseId') input: string,
    @Args('paginationOptions') PageOptionsDto: PaginationOptionsDto,
    @Args('search', { nullable: true }) search?: SearchOptionsDto,
  ) {
    return this.billingService.findBillingByLease(
      input,
      PageOptionsDto,
      search,
    );
  }

  @AuthRequest({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER],
  })
  @Mutation(() => Billing, { name: 'updateBillingStatus' })
  updateBillingStatus(
    @UserD() user: User,
    @Args('input') input: UpdateBillingStatusInput,
  ) {
    return this.updateBillingStatusService.execute({ user, ...input });
  }

  @AuthRequest({
    roles: [UserRoleEnum.ACCOUNT],
  })
  @Mutation(() => Billing, { name: 'uploadPaymentReceipt' })
  uploadPaymentReceipt(
    @UserD() user: User,
    @Args('uploadPaymentReceipt') body: paymentReceiptInput,
  ) {
    return this.billingService.uploadBillingPaymentReceipt(user, body);
  }

  @AuthRequest({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER],
  })
  @Mutation(() => Billing, { name: 'checkPaymentReceipt' })
  checkPaymentReceipt(
    @UserD() user: User,
    @Args('checkPaymentReceipt') body: checkPaymentReceiptInput,
  ) {
    return this.billingService.checkPaymentReceipt(user, body);
  }

  @BasicRequest()
  @Query(() => Date, { name: 'getNextPayment' })
  getNextPayment(@Args('leaseId') leaseId: string) {
    return this.calculateNextPaymentService.getNextPayment(leaseId);
  }
}
