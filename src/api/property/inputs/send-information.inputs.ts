import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class InformationInput {
  @Field(() => String, { description: 'Property Id' })
  propertyId!: string;
  
  @IsOptional()
  @Field(() => [String], { description: 'Send type information' })
  type?: [string];

  @Field(() => String, { description: 'Message Information' })
  message!: string;
}
