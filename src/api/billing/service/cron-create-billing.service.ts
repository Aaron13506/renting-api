import { AppServiceI } from '../../../common/generics/app-service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Lease } from '../../../database/entities/lease.entity';
import { Repository } from 'typeorm';
import { CreateBillingService } from './create-billing.service';
import { EitherError } from '../../../common/generics/error';
import { Either } from '../../../common/generics/either';

type P = unknown;

type R = string;

export class CronCreateBillingService implements AppServiceI<P, R> {
  constructor(
    @InjectRepository(Lease)
    private readonly leaseRepository: Repository<Lease>,
    private readonly createBillingService: CreateBillingService,
  ) {}

  async execute() {
    const leases = await this.leaseRepository
      .createQueryBuilder('le')
      .leftJoinAndSelect('le.property', 'pr')
      .leftJoinAndSelect('pr.billingSettings', 'bs')
      .where('le.paymentDay = DAY(CURRENT_DATE()) and le.payment_day != 0')
      .orWhere('bs.payment_day = DAY(CURRENT_DATE()) and le.payment_day = 0')
      .getMany();

    for (const lease of leases) {
      const billing = await this.createBillingService.execute({
        idLease: lease.id,
      });
      if (billing.isLeft()) {
        //log
      }
    }
    return Either.makeRight<EitherError, R>('OK');
  }
}
