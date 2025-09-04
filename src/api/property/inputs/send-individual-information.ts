import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class IndividualInformationInput {
  @Field(() => String, { description: 'Property Id' })
  propertyId!: string;

  @Field(() => String, { description: 'Message Information' })
  message!: string;

  @Field(() => String, { description: 'Message Information' })
  numberTo!: string;
}
