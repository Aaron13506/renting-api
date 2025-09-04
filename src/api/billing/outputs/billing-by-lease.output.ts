import { ObjectType } from '@nestjs/graphql';
import { PaginationOutput } from '../../../common/generics/pagination.output';
import { Billing } from '../../../database/entities/billing.entity';

@ObjectType()
export class GetBillingByLeaseOutput extends PaginationOutput(Billing) {}
