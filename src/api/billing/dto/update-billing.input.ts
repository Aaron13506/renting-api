import { CreateBillingInput } from '../inputs/create-billing.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateBillingInput extends PartialType(CreateBillingInput) {
  @Field(() => Int)
  id: number;
}
