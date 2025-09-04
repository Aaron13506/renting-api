import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateTermConditionInput {
  @IsString()
  @Field(() => String, { description: 'name', nullable: true })
  name?: string;

  @IsString()
  @Field(() => String, { description: 'name', nullable: true })
  document?: string;
}
