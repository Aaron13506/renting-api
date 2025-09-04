import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { BillingStatusEnum } from 'src/common/enums/billing-status.enum';

@InputType()
export class UpdateBillingStatusInput {
  @IsString()
  @Field(() => String, {
    description: 'Billing id to be updated',
    nullable: true,
  })
  id: string;

  @IsString()
  @Field(() => BillingStatusEnum, {
    description: 'New status to be applied',
    nullable: true,
  })
  newStatus: BillingStatusEnum;
}
