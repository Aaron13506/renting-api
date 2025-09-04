import { ObjectType } from '@nestjs/graphql';
import { BillingDataOutput } from './billing-data.output';
import { PaginationOutput } from '../../../common/generics/pagination.output';

@ObjectType()
export class GetBillingOutput extends PaginationOutput(BillingDataOutput) {}
