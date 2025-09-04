import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsResolver } from './notifications.resolver';
import { PaginationService } from 'src/common/services/pagination.service';
import { SearchService } from 'src/common/services/search.service';

@Module({
  providers: [
    NotificationsResolver,
    NotificationsService,
    PaginationService,
    SearchService,
  ],
})
export class NotificationsModule {}
