import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class SendSmsCodeInput {
  @IsString()
  @IsNotEmpty()
  @Field({
    description: "user's phone number",
  })
  phone: string;
}
