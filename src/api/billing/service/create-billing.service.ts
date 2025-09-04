import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppServiceI } from 'src/common/generics/app-service.interface';
import { Either } from 'src/common/generics/either';
import { EitherError } from 'src/common/generics/error';
import { Billing } from 'src/database/entities/billing.entity';
import { Lease } from 'src/database/entities/lease.entity';
import { CreateBillingInput } from '../inputs/create-billing.input';
import { BillingStatusEnum } from 'src/common/enums/billing-status.enum';

type P = CreateBillingInput;

type R = Billing;

@Injectable()
export class CreateBillingService implements AppServiceI<P, R> {
  constructor(
    @InjectRepository(Billing)
    private readonly billingRepository: Repository<Billing>,
    @InjectRepository(Lease)
    private readonly leaseRepository: Repository<Lease>,
  ) {}

  async execute(data: P) {
    const lease = await this.leaseRepository.findOne({
      where: {
        id: data.idLease,
      },
      relations: ['property.billingSettings'],
    });

    if (!lease) {
      return Either.makeLeft<EitherError, R>(
        new EitherError('validation.entity_not_found', { entity: 'Lease' }),
      );
    }

    const date = new Date(new Date().setHours(0, 0, 0, 1));

    let billing = await this.billingRepository.findOne({
      where: {
        lease: { id: data.idLease },
        date,
      },
    });

    if (!billing) {
      billing = new Billing();
      billing.lease = lease;
      billing.date = date;
      billing.status = BillingStatusEnum.PENDING;
      billing.amount = lease.amount;
      billing.paymentReceipt = null;
      await this.billingRepository.save(billing);
    }

    return Either.makeRight<EitherError, R>(billing);
  }
}
