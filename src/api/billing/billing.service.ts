import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { Either } from '../../common/generics/either';
import { EitherError } from '../../common/generics/error';
import { Billing } from '../../database/entities/billing.entity';
import { Lease } from '../../database/entities/lease.entity';
import { User } from '../../database/entities/user.entity';
import { PaginationService } from '../../common/services/pagination.service';
import { PaginationOptionsDto } from '../../common/dtos/pagination-options.dto';
import { BillingDataOutput } from './outputs/billing-data.output';
import { UserRoleEnum } from '../../common/enums/user-role.enum';
import { SearchService } from '../../common/services/search.service';
import { SearchOptionsDto } from '../../common/dtos/search-options.dto';
import { BILLING_KEYS } from '../../common/generics/search-keys';
import { paymentReceiptInput } from './inputs/billing-payment-receipt.input';
import { BillingStatusEnum } from 'src/common/enums/billing-status.enum';
import TwilioService from 'src/common/services/twilio.service';
import { checkPaymentReceiptInput } from './inputs/check-payment-receipt.input';
import { checkPaymentReceiptEnum } from 'src/common/enums/check-payment-receipt.enum';
import { CreateNotificationsService } from '../notifications/service/create-notification.service';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Billing)
    private billingRepository: Repository<Billing>,
    @InjectRepository(Lease)
    private leaseRepository: Repository<Lease>,
    private paginationService: PaginationService,
    private searchService: SearchService,
    private twilioService: TwilioService,
    private notificationService: CreateNotificationsService,
  ) {}

  async billingDataCreate(
    lease: string,
    pageOptionsDto: PaginationOptionsDto,
    search?: SearchOptionsDto,
  ) {
    const condition = { lease: { id: lease } };
    const where = this.searchService.execute<Billing>(
      BILLING_KEYS,
      search,
      condition,
    );
    const billingList = await this.billingRepository.find({
      where,
      relations: ['lease.property.owner', 'lease.tenant'],
      order: { createdAt: pageOptionsDto.order },
    });
    const billingData: BillingDataOutput = {
      lease: lease,
      pending: 0,
      overdue: 0,
      paid: 0,
      billings: billingList,
    };
    for (const Billing of billingList) {
      switch (Billing.status) {
        case 'pending':
          billingData.pending += 1;
          break;
        case 'overdue':
          billingData.overdue += 1;
          break;
        case 'paid':
          billingData.paid += 1;
          break;
      }
    }
    if (search.value && billingData.billings.length === 0) {
      return;
    }
    return billingData;
  }

  async findBilling(
    user: User,
    pageOptionsDto: PaginationOptionsDto,
    search?: SearchOptionsDto,
  ) {
    let where: FindOptionsWhere<Lease> = {};

    if (user.role === UserRoleEnum.OWNER) {
      where = {
        property: { owner: { id: user.id } },
      };
    } else if (user.role === UserRoleEnum.ACCOUNT) {
      where = {
        tenant: { id: user.id },
      };
    }

    const leaseList = await this.leaseRepository.find({
      where,
      relations: ['property', 'tenant'],
    });
    if (!leaseList) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Lease' }),
      );
    }
    const outputList = (
      await Promise.all(
        leaseList.map((lease) =>
          this.billingDataCreate(lease.id, pageOptionsDto, search),
        ),
      )
    ).filter((billingData) => !!billingData);

    return Either.makeRight(
      this.paginationService.execute(outputList, pageOptionsDto),
    );
  }

  async findBillingByLease(
    leaseId: string,
    pageOptionsDto: PaginationOptionsDto,
    search?: SearchOptionsDto,
  ) {
    const condition = { lease: { id: leaseId } };
    const where = this.searchService.execute<Billing>(
      BILLING_KEYS,
      search,
      condition,
    );
    const billingList = await this.billingRepository.find({
      where,
      relations: ['lease.property.owner', 'lease.tenant', 'lease.document', 'lease.document.version'],
      order: { createdAt: pageOptionsDto.order },
    });

    if (!billingList) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Billing' }),
      );
    }
    return Either.makeRight(
      this.paginationService.execute<Billing>(billingList, pageOptionsDto),
    );
  }

  async uploadBillingPaymentReceipt(user: User, body: paymentReceiptInput) {
    let respT;
    const billing = await this.billingRepository.findOne({
      where: { id: body.idBill },
      relations: ['lease.property.owner', 'lease.property', 'lease.tenant'],
    });

    if (!billing) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Billing' }),
      );
    }

    if (
      user.role != UserRoleEnum.ACCOUNT &&
      billing.lease.tenant?.id != user.id
    ) {
      return Either.makeLeft(
        new EitherError('validation.you_cannot_do_this_action'),
      );
    }

    if (body.paymentReceipt) {
      billing.paymentReceipt = body.paymentReceipt;
      billing.status = BillingStatusEnum.PENDING;

      respT = await this.twilioService.sendPaymentReceiptNotification({
        userPhone: billing.lease.property.owner.phone,
        sendTo: 'owner',
        propertyName: billing.lease.property.name,
        leaseCode: billing.lease.code,
        idBill: billing.id.slice(-8).toUpperCase(),
      });
    } else {
      return Either.makeLeft(
        new EitherError('validation.something_goes_wrong'),
      );
    }
    await this.billingRepository.save(billing);

    if (respT != undefined && respT != null) {
      await this.notificationService.create({
        message: respT.getRight().toString(),
        idUser: billing.lease.property.owner.id,
        idLease: null,
        idBilling: billing.id,
        idReport: null,
        notificationType: 'Billing Notification',
      });
    }

    return Either.makeRight(billing);
  }

  async checkPaymentReceipt(user: User, body: checkPaymentReceiptInput) {
    let respT;
    const billing = await this.billingRepository.findOne({
      where: { id: body.idBill },
      relations: ['lease.property.owner', 'lease.property', 'lease.tenant'],
    });
    if (!billing) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Billing' }),
      );
    }
    if (billing.lease?.property?.owner?.id != user.id) {
      return Either.makeLeft(
        new EitherError('validation.you_cannot_do_this_action'),
      );
    }

    if (body.value) {
      if (body.value === checkPaymentReceiptEnum.PAID) {
        billing.status = BillingStatusEnum.PAID;
      } else {
        billing.status = BillingStatusEnum.PENDING;
        respT = await this.twilioService.sendPaymentReceiptNotification({
          userPhone: billing.lease.tenant.phone,
          sendTo: 'tenant',
          propertyName: billing.lease.property.name,
          leaseCode: billing.lease.code,
          idBill: billing.id.slice(-8).toUpperCase(),
        });
      }
    }
    await this.billingRepository.save(billing);
    if (respT != undefined && respT != null) {
      await this.notificationService.create({
        message: respT.getRight().toString(),
        idUser: billing.lease.tenant.id,
        idLease: null,
        idBilling: billing.id,
        idReport: null,
        notificationType: 'Billing Notification',
      });
    }
    return Either.makeRight(billing);
  }
}
