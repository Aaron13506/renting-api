import { Module } from '@nestjs/common';
import { PropertyResolver } from './property.resolver';
import { PropertyService } from './property.service';
import { UserService } from '../user/user.service';
import TwilioService from 'src/common/services/twilio.service';
import { SendEmailPropertyService } from 'src/common/services/emailPropertyService/sendEmailProperty.service';
import { SendSmsPropertyService } from 'src/common/services/smsPropertyService/sendSmsProperty.service';
import { PaginationService } from '../../common/services/pagination.service';
import { SearchService } from '../../common/services/search.service';
import { CreateNotificationsService } from '../notifications/service/create-notification.service';

@Module({
  providers: [
    CreateNotificationsService,
    PropertyResolver,
    PropertyService,
    UserService,
    TwilioService,
    SendEmailPropertyService,
    SendSmsPropertyService,
    PaginationService,
    SearchService,
  ],
})
export class PropertyModule {}
