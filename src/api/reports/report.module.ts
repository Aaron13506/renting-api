import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportResolver } from './report.resolver';
import TwilioService from 'src/common/services/twilio.service';
import { PaginationService } from '../../common/services/pagination.service';
import { SearchService } from '../../common/services/search.service';
import { CreateNotificationsService } from '../notifications/service/create-notification.service';

@Module({
  providers: [
    ReportResolver,
    ReportService,
    TwilioService,
    PaginationService,
    SearchService,
    CreateNotificationsService,
  ],
})
export class ReportModule {}
