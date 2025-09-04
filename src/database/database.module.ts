import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingSettings } from './entities/billing-settings.entity';
import { Billing } from './entities/billing.entity';
import { EmailCode } from './entities/email-code.entity';
import { Font } from './entities/fonts.entity';
import { Lease } from './entities/lease.entity';
import { NumberProperty } from './entities/number-property.entity';
import { Property } from './entities/property.entity';
import { Report } from './entities/report.entity';
import { SmsCode } from './entities/sms-code.entity';
import { SupportChat } from './entities/support-chat.entity';
import { SupportMessage } from './entities/support-message.entity';
import { TermCondition } from './entities/terms-conditions.entity';
import { User } from './entities/user.entity';
import { CommunityMessage } from './entities/community-message.entity';
import { Document } from './entities/document.entity';
import { DocumentVersion } from './entities/document-version.entity';
import { Notification } from './entities/notification.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
    }),
    TypeOrmModule.forFeature([
      BillingSettings,
      Billing,
      CommunityMessage,
      Document,
      DocumentVersion,
      EmailCode,
      Font,
      Lease,
      Notification,
      NumberProperty,
      Property,
      Report,
      SmsCode,
      SupportMessage,
      SupportChat,
      TermCondition,
      User,

    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
