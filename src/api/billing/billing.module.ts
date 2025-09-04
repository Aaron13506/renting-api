import { Module } from '@nestjs/common';
import { BillingResolver } from './billing.resolver';
import { BillingService } from './billing.service';
import { UpdateBillingStatusService } from './service/update-billing-status.service';
import { PaginationService } from '../../common/services/pagination.service';
import { CreateBillingService } from './service/create-billing.service';
import { CalculateNextPaymentService } from './service/calculate-next-payment.service';
import { SearchService } from '../../common/services/search.service';
import { CronCreateBillingService } from './service/cron-create-billing.service';
import { CronUpdateBillingService } from './service/cron-update-billing.service';
import TwilioService from 'src/common/services/twilio.service';
import { CreateNotificationsService } from '../notifications/service/create-notification.service';

@Module({
  providers: [
    BillingResolver,
    BillingService,
    CreateBillingService,
    CreateNotificationsService,
    UpdateBillingStatusService,
    PaginationService,
    CalculateNextPaymentService,
    SearchService,
    CronCreateBillingService,
    CronUpdateBillingService,
    TwilioService,
  ],
})
export class BillingModule {}
