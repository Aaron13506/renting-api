import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/database/database.module';
import { LanguageModule } from 'src/language/language.module';
import { MailerModule } from 'src/mailer/mailer.module';
import StripeService from './services/stripe.service';
import TwilioService from './services/twilio.service';
import { SendEmailPropertyService } from './services/emailPropertyService/sendEmailProperty.service';
import AWSService from './services/aws.service';
import { CreateNotificationsService } from 'src/api/notifications/service/create-notification.service';



const commonServices = [StripeService, TwilioService, SendEmailPropertyService, AWSService, CreateNotificationsService];

@Module({
  imports: [DatabaseModule, MailerModule, LanguageModule],
  providers: [...commonServices],
  exports: [...commonServices],
})
export class CommonModule {}
