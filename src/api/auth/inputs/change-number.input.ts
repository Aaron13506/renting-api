import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class ChangeNumberInput {

  @IsString()
  @IsNotEmpty()
  @Field({
    description: "user's old phone number",
  })
  oldPhone: string;

  @IsString()
  @IsNotEmpty()
  @Field({
    description: "user's old phone temporal code",
  })
  oldSmsPhoneCode: string;

  @IsString()
  @IsNotEmpty()
  @Field({
    description: "user's new phone number",
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Field({
    description: "user's temporal code",
  })
  code: string;
}
