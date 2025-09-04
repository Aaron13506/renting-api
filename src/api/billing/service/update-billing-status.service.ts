import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UserDto } from 'src/common/dtos/user.dto';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { AppServiceI } from 'src/common/generics/app-service.interface';
import { Either } from 'src/common/generics/either';
import { EitherError } from 'src/common/generics/error';
import { Billing } from 'src/database/entities/billing.entity';
import { UpdateBillingStatusInput } from '../inputs/update-billing-status.input';

type P = UpdateBillingStatusInput & Partial<UserDto>;
type R = Billing;

@Injectable()
export class UpdateBillingStatusService implements AppServiceI<P, R> {
  constructor(
    @InjectRepository(Billing)
    private billingRepository: Repository<Billing>,
  ) {}

  async execute({ user, id, newStatus }: P) {
    const where: FindOptionsWhere<Billing> = { id: id };
    if (user?.role === UserRoleEnum.OWNER) {
      where.lease = { property: { owner: { id: user.id } } };
    }
    const billing = await this.billingRepository.findOne({ where });
    if (!billing) {
      return Either.makeLeft<EitherError, R>(
        new EitherError('validation.entity_not_found', { entity: 'Lease' }),
      );
    }
    billing.status = newStatus;
    return Either.makeRight<EitherError, R>(
      await this.billingRepository.save(billing),
    );
  }
}
