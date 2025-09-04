import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Billing } from 'src/database/entities/billing.entity';
import { Either } from '../../../common/generics/either';
import { EitherError } from '../../../common/generics/error';
import { Lease } from '../../../database/entities/lease.entity';
import { BillingStatusEnum } from '../../../common/enums/billing-status.enum';

@Injectable()
export class CalculateNextPaymentService {
  constructor(
    @InjectRepository(Billing)
    private readonly billingRepository: Repository<Billing>,
    @InjectRepository(Lease)
    private readonly leaseRepository: Repository<Lease>,
  ) {}

  async getNextPayment(leaseId: string): Promise<Either<EitherError, Date>> {

    const lease = await this.leaseRepository.findOne({
      where: { id: leaseId },
      relations: ['property.billingSettings'],
    });

    if (!lease) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Lease' }),
      );
    }


    const billing = await this.billingRepository.findOne({
      where: [
        { lease: { id: leaseId }, status: BillingStatusEnum.PENDING },
        { lease: { id: leaseId }, status: BillingStatusEnum.OVERDUE },
      ],
      relations: ['lease'],
    });


    let date: Date;
    const paymentDay =
      lease.paymentDay || lease.property.billingSettings.paymentDay;

    if (billing) {
      date = billing.date;
    } else {
      const actualDate = new Date(new Date().setHours(0, 0, 0, 1));
      const billDate = new Date(new Date().setHours(0, 0, 0, 1));
      billDate.setDate(paymentDay);

      date =
        billDate > actualDate
          ? new Date(billDate)
          : new Date(billDate.setMonth(billDate.getMonth() + 1));
      date.setDate(paymentDay);
    }

    return Either.makeRight(date);
  }
}
