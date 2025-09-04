import { Module } from '@nestjs/common';
import { LeaseResolver } from './lease.resolver';
import { CreateLeaseService } from './service/create-lease.service';
import { LeaseService } from './lease.service';
import { PaginationService } from '../../common/services/pagination.service';
import { SearchService } from '../../common/services/search.service';
import TwilioService from 'src/common/services/twilio.service';
import { CreateNotificationsService } from '../notifications/service/create-notification.service';

@Module({
  providers: [
    CreateNotificationsService,
    LeaseResolver,
    CreateLeaseService,
    LeaseService,
    PaginationService,
    SearchService,
    TwilioService,
  ],
})
export class LeaseModule {}
