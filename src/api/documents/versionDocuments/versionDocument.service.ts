import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentVersion } from 'src/database/entities/document-version.entity';
import { Document } from 'src/database/entities/document.entity';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { Either } from 'src/common/generics/either';
import { EitherError } from 'src/common/generics/error';
import { DocumentStatusEnum } from 'src/common/enums/document-status.enum';
import { SigneDocumentInput } from '../dto/signedDocument-input';
import TwilioService from 'src/common/services/twilio.service';
import { CreateNotificationsService } from 'src/api/notifications/service/create-notification.service';

@Injectable()
export class VersionDocumentService {
  constructor(
    @InjectRepository(DocumentVersion)
    private versionDocumentRepository: Repository<DocumentVersion>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private twilioService: TwilioService,
    private notificationService: CreateNotificationsService,
  ) {}

  async signedDocument(user: User, body: SigneDocumentInput) {
    const document = await this.documentRepository.findOne({
      where: { id: body.documentId },
      relations: [
        'lease',
        'lease.property',
        'lease.tenant',
        'lease.property.owner',
      ],
    });

    if (!document) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Document' }),
      );
    }

    const documentVersion = await this.versionDocumentRepository.findOne({
      where: { documentId: { id: body.documentId } },
    });

    if (document.lease.tenant.id != user.id) {
      return Either.makeLeft(
        new EitherError('validation.you_cannot_do_this_action'),
      );
    }

    documentVersion.name = document.name;
    documentVersion.contentUrl = body.documentUrl;
    documentVersion.uploadedAt = new Date();
    documentVersion.signedBy = user;
    documentVersion.status = DocumentStatusEnum.SIGNED;
    document.status = DocumentStatusEnum.SIGNED;

    await this.versionDocumentRepository.save(documentVersion);
    await this.documentRepository.save(document);

    const twilioResp = await this.twilioService.sendRegisterLeaseNotification({
      userPhone: document.lease.property.owner.phone,
      sendTo: 'owner',
      propertyName: document.lease.property.name,
      leaseCode: document.lease.code,
    });

    await this.notificationService.create({
      message: twilioResp.getRight().toString(),
      idUser: document.lease.property.owner.id,
      idLease: document.lease.id,
      idBilling: null,
      idReport: null,
      notificationType: 'Signed Document Lease Notification',
    });

    return Either.makeRight(documentVersion);
  }
}
