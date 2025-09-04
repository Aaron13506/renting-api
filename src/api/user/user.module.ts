import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { OwnerService } from './service/create-owner.service';
import TwilioService from 'src/common/services/twilio.service';
import { PaginationService } from '../../common/services/pagination.service';
import { SearchService } from '../../common/services/search.service';
import { CreateNotificationsService } from '../notifications/service/create-notification.service';

@Module({
  providers: [
    CreateNotificationsService,
    UserResolver,
    UserService,
    OwnerService,
    TwilioService,
    PaginationService,
    SearchService,
  ],
})
export class UserModule {}
