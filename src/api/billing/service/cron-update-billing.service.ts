import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppServiceI } from 'src/common/generics/app-service.interface';
import { Billing } from 'src/database/entities/billing.entity';
import { UpdateBillingStatusService } from './update-billing-status.service';
import { BillingStatusEnum } from '../../../common/enums/billing-status.enum';
import { Either } from '../../../common/generics/either';
import { EitherError } from '../../../common/generics/error';

type P = unknown;
type R = string;

export class CronUpdateBillingService implements AppServiceI<P, R> {
  constructor(
    @InjectRepository(Billing)
    private readonly billingRepository: Repository<Billing>,
    private readonly updateBillingStatusService: UpdateBillingStatusService,
  ) {}

  @Cron('1 0 0 * * *')
  async execute() {

    const billings = await this.billingRepository
                               .createQueryBuilder('bi')
                               .leftJoin('bi.lease', 'le')
                               .leftJoin('le.property', 'pr')
                               .leftJoin('pr.billingSettings', 'bs')
                               .where('bi.status = :status', { status: BillingStatusEnum.PENDING })
                               .andWhere(
                                 `bi.date < DATE_SUB(CURRENT_DATE(), INTERVAL bs.grace_days DAY)`,
                               )
                               .getMany();

    for (const billing of billings) {
      const update = await this.updateBillingStatusService.execute({
        id: billing.id,
        newStatus: BillingStatusEnum.OVERDUE,
      });
      if (update.isLeft()) {
        //log
      }
    }
    return Either.makeRight<EitherError, R>('OK');
  }
}
