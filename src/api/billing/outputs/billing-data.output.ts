import { Field, ObjectType } from '@nestjs/graphql';
import { Billing } from '../../../database/entities/billing.entity';

@ObjectType()
export class BillingDataOutput {
  @Field()
  lease: string;

  @Field({ nullable: true })
  pending?: number;

  @Field({ nullable: true })
  overdue?: number;

  @Field({ nullable: true })
  paid?: number;

  @Field(() => [Billing])
  billings: Billing[];
}
