import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateLeaseInput } from './create-lease.input';

@InputType()
export class UpdateLeaseInput extends PartialType(CreateLeaseInput) {
  @Field(() => String)
  id: string;
}
