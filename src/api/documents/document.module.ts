import { Module } from '@nestjs/common';
import { DocumentResolver } from './document.resolver';
import { DocumentService } from './document.service';
import { VersionDocumentService } from './versionDocuments/versionDocument.service';
import TwilioService from 'src/common/services/twilio.service';
import { CreateNotificationsService } from '../notifications/service/create-notification.service';

@Module({
  providers: [
    DocumentResolver,
    DocumentService,
    VersionDocumentService,
    TwilioService,
    CreateNotificationsService,
  ],
})
export class DocumentModule {}
