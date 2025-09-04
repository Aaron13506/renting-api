import { Module } from '@nestjs/common';
import { SupportMessageResolver } from './support-message.resolver';
import { SupportMessageService } from './support-message.service';

@Module({
  providers: [SupportMessageResolver, SupportMessageService],
})
export class SupportMessageModule {}
