import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateBillingInput {
  @Field({ description: 'Id lease that will be charged' })
  idLease: string;
}
