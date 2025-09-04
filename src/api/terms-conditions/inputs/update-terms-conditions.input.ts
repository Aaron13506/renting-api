import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateTermConditionInput } from './terms-conditions.input';

@InputType()
export class UpdateTermsConditions extends PartialType(
  CreateTermConditionInput,
) {
  @Field(() => String)
  id: string;
}
