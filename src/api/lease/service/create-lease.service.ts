import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Lease } from 'src/database/entities/lease.entity';
import { Repository } from 'typeorm';
import { CreateLeaseInput } from '../inputs/create-lease.input';
import { User } from 'src/database/entities/user.entity';
import { Property } from 'src/database/entities/property.entity';
import { Either } from 'src/common/generics/either';
import { EitherError } from 'src/common/generics/error';
import { UpdateLeaseInput } from '../inputs/update-lease.input';
import { Document } from 'src/database/entities/document.entity';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { DocumentStatusEnum } from 'src/common/enums/document-status.enum';
import { DocumentVersion } from 'src/database/entities/document-version.entity';
import TwilioService from 'src/common/services/twilio.service';
import { CreateNotificationsService } from 'src/api/notifications/service/create-notification.service';

@Injectable()
export class CreateLeaseService {
  constructor(
    @InjectRepository(Lease)
    private leaseRepository: Repository<Lease>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(DocumentVersion)
    private versionDocumentRepository: Repository<DocumentVersion>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private twilioService: TwilioService,
    private notificationService: CreateNotificationsService,
  ) {}

  async createLease(bodyInput: CreateLeaseInput, user: User) {
    let respT;
    const property = await this.propertyRepository.findOne({
      where: { id: bodyInput.property },
      relations: ['leases', 'owner'],
    });

    const leaseNumber = await this.leaseRepository.find({
      where: { code: bodyInput.code },
      relations: ['property', 'tenant'],
    });

    const resp = leaseNumber.map((items) => items.property.id);

    for (const element of resp) {
      if (element == property.id) {
        return Either.makeLeft(new EitherError('validation.already_exist'));
      }
    }

    if (!property) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'property' }),
      );
    }

    if (bodyInput.paymentDay > 30 || bodyInput.paymentDay < 1) {
      return Either.makeLeft(
        new EitherError('validation.something_goes_wrong'),
      );
    }

    const lease = new Lease();
    lease.code = bodyInput.code;
    lease.paymentDay = bodyInput.paymentDay;
    lease.amount = bodyInput.amount;
    lease.property = property;

    if (bodyInput.documentUrl) {
      const document = new Document();
      document.name = bodyInput.documentName;
      document.contentUrl = bodyInput.documentUrl;
      document.status = DocumentStatusEnum.ORIGINAL;
      document.uploadedAt = new Date();
      if (user.role != UserRoleEnum.ADMIN) {
        document.uploadedBy = property.owner;
      } else {
        document.uploadedBy = user;
      }

      const versionDocument = new DocumentVersion();
      versionDocument.status = DocumentStatusEnum.ORIGINAL;
      versionDocument.documentId = document;

      lease.document = document;

      await this.documentRepository.save(document);
      await this.versionDocumentRepository.save(versionDocument);
    }

    if (bodyInput.tenant != undefined) {
      const tenant = await this.userRepository.findOne({
        where: { id: bodyInput.tenant },
        relations: ['leases'],
      });
      lease.tenant = tenant;

      respT = await this.twilioService.sendRegisterLeaseNotification({
        userPhone: lease.tenant.phone,
        sendTo: 'tenant',
        propertyName: property.name,
        leaseCode: lease.code,
      });
    } else {
      lease.tenant = null;
    }

    await this.leaseRepository.save(lease);
    if (respT != undefined && respT != null) {
      await this.notificationService.create({
        message: respT.getRight().toString(),
        idUser: lease.tenant.id,
        idLease: lease.id,
        idBilling: null,
        idReport: null,
        notificationType: 'Lease Notification',
      });
    }

    return Either.makeRight(lease);
  }

  async updateLease(updateFields: UpdateLeaseInput, user: User) {
    const lease = await this.leaseRepository.findOne({
      where: { id: updateFields.id },
      relations: ['property', 'billings', 'tenant', 'property.owner'],
    });

    if (!lease) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'lease' }),
      );
    }

    if (
      lease.property.owner.id !== user.id &&
      user.role != UserRoleEnum.ADMIN
    ) {
      return Either.makeLeft(
        new EitherError('validation.you_cannot_do_this_action'),
      );
    }
    const oldTenant = lease.tenant;
    lease.paymentDay = updateFields.paymentDay;
    lease.code = updateFields.code;
    lease.amount = updateFields.amount;
    if (updateFields.tenant) {
      const newTenant = await this.userRepository.findOne({
        where: { id: updateFields.tenant },
      });

      lease.tenant = newTenant;
      const twilioResp = await this.twilioService.sendRegisterLeaseNotification(
        {
          userPhone: lease.tenant.phone,
          sendTo: 'tenant',
          propertyName: lease.property.name,
          leaseCode: lease.code,
        },
      );

      await this.notificationService.create({
        message: twilioResp.getRight().toString(),
        idUser: lease.tenant.id,
        idLease: lease.id,
        idBilling: null,
        idReport: null,
        notificationType: 'Lease Notification',
      });
    } else {
      lease.tenant = oldTenant;
    }

    if (!lease.document && updateFields.documentUrl) {
      const document = new Document();
      document.name = updateFields.documentName;
      document.contentUrl = updateFields.documentUrl;
      document.status = DocumentStatusEnum.ORIGINAL;
      document.uploadedAt = new Date();
      if (user.role != UserRoleEnum.ADMIN) {
        document.uploadedBy = lease.property.owner;
      } else {
        document.uploadedBy = user;
      }

      lease.document = document;

      const versionDocument = new DocumentVersion();
      versionDocument.status = DocumentStatusEnum.ORIGINAL;
      versionDocument.documentId = document;
      await this.documentRepository.save(document);
      await this.versionDocumentRepository.save(versionDocument);
    } else {
      return Either.makeLeft(
        new EitherError('validation.something_goes_wrong'),
      );
    }

    await this.leaseRepository.save(lease);
    return Either.makeRight(lease);
  }
}
