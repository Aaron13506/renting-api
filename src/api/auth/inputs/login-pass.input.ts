import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { OwnerSpaceInput } from '../../../common/inputs/owner-space.input';

@InputType()
export class LoginPassInput extends OwnerSpaceInput {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Field({
    description: "user's email",
    defaultValue: 'barryallen@justiceleague.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Field({
    description: "user's password",
    defaultValue: 'theFastestManAlive1*',
  })
  password: string;
}
