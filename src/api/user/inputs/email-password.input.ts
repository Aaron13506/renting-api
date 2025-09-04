import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class SetEmailPassInput {
  @IsEmail()
  @IsNotEmpty()
  @Field(() => String, { description: 'Owner email' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Owner Password' })
  password: string;

  @Field(() => String, { description: 'Property owner' })
  user: string;
}
