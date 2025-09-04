import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreatePropertyInput } from './register-property.input';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdatePropertyInput extends PartialType(CreatePropertyInput) {
  @Field(() => String)
  id: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  newOwner?: string;
}
