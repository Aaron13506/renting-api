import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PropertyModule } from './property/property.module';
import { LeaseModule } from './lease/lease.module';
import { ReportModule } from './reports/report.module';
import { BillingModule } from './billing/billing.module';
import { UploaderModule } from './uploader/uploader.module';
import { SupportMessageModule } from './support-message/support-message.module';
import { FontModule } from './fonts/font.module';
import { TermsConditionsModule } from './terms-conditions/terms-conditions.module';
import { ApiService } from './api.service';
import { ScheduleModule } from '@nestjs/schedule';
import { CronCreateBillingService } from './billing/service/cron-create-billing.service';
import { CronUpdateBillingService } from './billing/service/cron-update-billing.service';
import { NotifyOverdueBillingService } from './billing/service/notify-overdue-billing.service';
import { CreateBillingService } from './billing/service/create-billing.service';
import { UpdateBillingStatusService } from './billing/service/update-billing-status.service';
import TwilioService from '../common/services/twilio.service';
import { NotifyOverdueReportService } from './reports/service/notify-overdue-report.service';
import { NotifyPendingReportService } from './reports/service/check-pending-reports.service';
import { DocumentModule } from './documents/document.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CreateNotificationsService } from './notifications/service/create-notification.service';


@Module({
  imports: [
    AuthModule,
    DocumentModule,
    FontModule,
    PropertyModule,
    UserModule,
    LeaseModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: true,
      subscriptions: {
        'graphql-ws': true,
      },
      context: (ctx) => ctx,
      formatError: (err) => ({
        message: err.message,
        status: err.extensions.code,
      }),
    }),
    ReportModule,
    BillingModule,
    TermsConditionsModule,
    UploaderModule,
    SupportMessageModule,
    ScheduleModule.forRoot(),
    NotificationsModule,
  ],
  providers: [
    ApiService,
    CreateNotificationsService,
    CronCreateBillingService,
    CronUpdateBillingService,
    NotifyOverdueBillingService,
    CreateBillingService,
    UpdateBillingStatusService,
    TwilioService,
    NotifyOverdueReportService,
    NotifyPendingReportService,
  ],
})
export class ApiModule {}
