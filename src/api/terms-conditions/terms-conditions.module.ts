import { Module } from '@nestjs/common';
import { TermsConditionsResolver } from './terms-conditions.resolver';
import { TermsConditionsService } from './terms-conditions.service';

@Module({
  providers: [TermsConditionsResolver, TermsConditionsService]
})
export class TermsConditionsModule {}
