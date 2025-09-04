import { Cron } from '@nestjs/schedule';
import { CronUpdateBillingService } from './billing/service/cron-update-billing.service';
import { CronCreateBillingService } from './billing/service/cron-create-billing.service';
import { EitherError } from '../common/generics/error';
import { Either } from '../common/generics/either';
import { NotifyOverdueBillingService } from './billing/service/notify-overdue-billing.service';
import { Injectable } from '@nestjs/common';
import { NotifyPendingReportService } from './reports/service/check-pending-reports.service';
import { NotifyOverdueReportService } from './reports/service/notify-overdue-report.service';

type R = string;

@Injectable()
export class ApiService {
  constructor(
    private readonly cronCreateBillingService: CronCreateBillingService,
    private readonly cronUpdateBillingService: CronUpdateBillingService,
    private readonly notifyOverdueBillingService: NotifyOverdueBillingService,
    private readonly notifyPendingReport: NotifyPendingReportService,
    private readonly notifyOverdueReport: NotifyOverdueReportService,
  ) {}

  @Cron('0 0 * * *')
  async executeAtMidnight() {
    await this.cronCreateBillingService.execute();
    await this.cronUpdateBillingService.execute();
    return Either.makeRight<EitherError, R>('OK');
  }

  @Cron('0 0 9 * * *')
  async executeAt9AM() {
    await this.notifyOverdueBillingService.execute();
    await this.notifyPendingReport.notifyPendingReport();
    await this.notifyOverdueReport.notifyOverdueReport();
    return Either.makeRight<EitherError, R>('OK');
  }
}
