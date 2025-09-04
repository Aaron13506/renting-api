import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { ApiModule } from './api/api.module';
import { AppController } from './app.controller';
import { DatabaseConfig } from './config/database-config';
import { JWTConfig } from './config/jwt-config';
import { MailerConfig } from './config/mailer-config';
import { ServerConfig } from './config/server-config';
import { StripeConfig } from './config/stripe-api-config';
import { TwilioConfig } from './config/twilio-config';
import { LanguageModule } from './language/language.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';

@Module({
  imports: [
    ApiModule,
    ConfigModule.forRoot({
      envFilePath: `env/${process.env.SERVER_ENV || 'develop'}.env`,
      load: [
        DatabaseConfig,
        JWTConfig,
        MailerConfig,
        ServerConfig,
        StripeConfig,
        TwilioConfig,
      ],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    LanguageModule,
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
